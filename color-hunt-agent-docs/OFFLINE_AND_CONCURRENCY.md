# Color Hunt — Concurrency, Disconnect & Offline Architecture

Read this before modifying room joining, round pause logic, host controls, or network reconnection handlers.

---

## 1. Concurrency Control: Safe Room Joining

### The Race Condition
If 10 players attempt to join a room with `max_players = 4` at the exact same millisecond, a standard `SELECT count(*)` followed by `INSERT` allows race conditions that overfill the room.

### The Solution: Row-Level Locking (`SELECT ... FOR UPDATE`)
All joins execute inside the `join_room` RPC:

```sql
create or replace function public.join_room(p_code text, p_display_name text)
returns jsonb language plpgsql security definer as $$
declare
  v_room public.rooms%rowtype;
  v_active_count int;
  v_player_id uuid;
begin
  -- 1. Exclusively lock the room row for the duration of this transaction
  select * into v_room
  from public.rooms
  where code = upper(p_code)
  for update;

  if not found then
    return jsonb_build_object('success', false, 'error', 'ROOM_NOT_FOUND');
  end if;

  if v_room.status != 'waiting' then
    return jsonb_build_object('success', false, 'error', 'GAME_ALREADY_STARTED');
  end if;

  -- 2. Count active players under exclusive lock
  select count(*) into v_active_count
  from public.players
  where room_id = v_room.id and status = 'active';

  if v_active_count >= v_room.max_players then
    return jsonb_build_object('success', false, 'error', 'ROOM_FULL');
  end if;

  -- 3. Safely insert or re-activate player
  insert into public.players (room_id, user_id, display_name, status)
  values (v_room.id, auth.uid(), p_display_name, 'active')
  on conflict (room_id, user_id) 
  do update set status = 'active', display_name = p_display_name, last_seen_at = now()
  returning id into v_player_id;

  return jsonb_build_object(
    'success', true,
    'room_id', v_room.id,
    'player_id', v_player_id,
    'code', v_room.code
  );
end;
$$;
```

---

## 2. All-Players-Submitted Auto-Pause Mathematics

### Mechanics
1. When a round is `active`, players hunt concurrently. The timer continues running while individuals submit.
2. Every call to `submit_hunt` evaluates whether the submission threshold has been met:

```sql
-- Count active players currently in the room
select count(*) into v_active_players
from public.players
where room_id = v_room_id and status = 'active';

-- Count active players who have at least 1 valid submission or exhausted 3 attempts
select count(distinct p.id) into v_finished_players
from public.players p
where p.room_id = v_room_id 
  and p.status = 'active'
  and (
    exists (select 1 from public.submissions s where s.round_id = p_round_id and s.player_id = p.id)
    or exists (select 1 from public.submissions s where s.round_id = p_round_id and s.player_id = p.id and s.attempt_number >= 3)
  );

-- Auto-pause trigger
if v_finished_players >= v_active_players then
  -- Calculate frozen remaining time based on server clock
  v_elapsed := extract(epoch from (now() - v_round.resumed_at))::int;
  v_frozen_remaining := greatest(0, v_round.remaining_seconds - v_elapsed);

  update public.rounds
  set status = 'paused',
      paused_at = now(),
      remaining_seconds = v_frozen_remaining
  where id = p_round_id;

  update public.rooms
  set status = 'reviewing',
      updated_at = now()
  where id = v_room_id;
end if;
```

---

## 3. Disconnect & Offline Handling (Supabase Presence)

### 3.1 Socket Heartbeats & Presence Tracking
- Each mobile client joins the Presence channel: `room:{roomId}:presence`.
- If a client loses internet connectivity or closes the app:
  1. The Presence channel triggers an `untethered` / `leave` event.
  2. The remaining clients notify the database via `sync_player_presence(room_id, 'disconnected')`.
  3. The disconnected player is flagged with `status = 'disconnected'`.

### 3.2 Dynamic Quota Shrinking (No Stalled Games)
- Because the submission evaluator filters strictly on `status = 'active'`, a player who disconnects **is dynamically excluded** from the submission requirement!
- Example: In a 4-player game where 1 player disconnects, the required threshold immediately adjusts to 3 active players. If those 3 players have submitted, the round pauses for host review immediately without waiting for the offline player.

### 3.3 Graceful Reconnection (`reconnect_player`)
- When the disconnected player reconnects within the 25-second grace window:
  - App calls `reconnect_player(room_id)`.
  - Database sets player `status = 'active'` and updates `last_seen_at = now()`.
  - Client retrieves synchronized game state, current remaining time, and round status.

---

## 4. Player Voluntary Departure & Host Migration

### 4.1 Player Leaves Game (`player_leave_room`)
1. Player taps "Leave Game":
2. Sets player `status = 'left'`.
3. If the game is in `waiting` lobby, the player is cleaned up.
4. If in `in_round`:
   - Checks if all remaining active players have submitted. If yes, immediately auto-pauses the round into `reviewing`.
   - If only 1 player remains, that player is declared the default winner or the round ends cleanly.

### 4.2 Host Departure & Automatic Migration
If the leaving player is `is_host = true`:
1. The database finds the next active player with the earliest `joined_at` timestamp:
   ```sql
   select * into v_next_host
   from public.players
   where room_id = p_room_id and status = 'active' and id != v_leaving_player_id
   order by joined_at asc
   limit 1;
   ```
2. If an active player is found:
   - Updates `rooms.host_id = v_next_host.user_id`.
   - Updates `players.is_host = true` for `v_next_host.id`.
   - Updates `players.is_host = false` for the leaving player.
   - Emits Realtime broadcast notifying the lobby of the new host.
3. If no active players remain:
   - Sets `rooms.status = 'abandoned'`.
