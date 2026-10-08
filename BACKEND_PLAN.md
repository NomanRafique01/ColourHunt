# ColourHunt Backend Architecture & Implementation Plan

> **Git Branch**: `backend` (isolated from `master`)  
> **Target Platform**: Expo / React Native + Supabase  

---

## 1. Core Mechanics & Game Loop

### 1.1 All-Players-Submitted Auto-Pause Logic
- During a round, players hunt for objects matching their assigned color.
- Submissions occur concurrently; submitting players enter a *"Waiting for other players..."* state while the round timer continues running for remaining hunters.
- **Auto-Pause Trigger**: As soon as all currently **active** players have submitted at least 1 photo (or exhausted their 3 attempts), the server freezes the countdown timer (`status = 'paused'`) and immediately transitions the room to `'reviewing'`.
- Host reviews submissions one by one; if all are rejected and time remains, the round resumes with the remaining time!

---

## 2. Disconnect & Quit Handling Architecture

### 2.1 Player Voluntary Quit (`player_leave_room`)
- When a player leaves:
  1. Status updates to `'left'`.
  2. If the game is in `waiting` lobby, the player is removed from the lobby.
  3. If the game is in `in_round`, the server recalculates the active player quota. If all remaining active players have submitted, the round automatically pauses for review so remaining players are not stuck waiting.
  4. If only 1 player remains, the game handles victory or finish gracefully.
  5. **Host Departure**: If the leaving player is the host, leadership automatically migrates to the next active player with the earliest join timestamp. If no active players remain, the room transitions to `'abandoned'`.

### 2.2 Player Offline / Disconnect (Presence Heartbeat)
- Supabase Realtime Presence tracks active socket heartbeats.
- When a socket drops unexpectedly, the player is flagged as `'disconnected'` with a 25-second grace window.
- If other active players submit during this window, the round progresses without waiting indefinitely for the disconnected player.
- If the player reconnects within the window, their state is restored seamlessly via `reconnect_player`.

---

## 3. Database Schema Overview

- **`rooms`**: `id`, `code` (4-char unique), `host_id`, `status` (`waiting`, `in_round`, `reviewing`, `finished`, `abandoned`), `max_players`, timestamps.
- **`players`**: `id`, `room_id`, `user_id`, `display_name`, `assigned_color`, `is_host`, `status` (`active`, `disconnected`, `left`), `joined_at`, `last_seen_at`.
- **`rounds`**: `id`, `room_id`, `round_number`, `status` (`active`, `paused`, `finished`, `no_winner`), `time_limit_seconds`, `remaining_seconds`, `started_at`, `resumed_at`, `paused_at`, `ended_at`, `winner_player_id`.
- **`submissions`**: `id`, `round_id`, `player_id`, `storage_path`, `match_score`, `status` (`pending`, `approved`, `rejected`, `deleted`), `submitted_at`, `reviewed_at`, `attempt_number`.

---

## 4. Security & Anti-Cheat

1. **Non-Recursive RLS**: `SECURITY DEFINER` helper functions (`is_room_player`, `is_room_host`) eliminate N+1 recursion overhead.
2. **Server-Authoritative Clock**: Timer calculations use Postgres `now()` to prevent local device clock tampering.
3. **Atomic RPCs**: All state transitions (`create_room`, `join_room`, `start_round`, `submit_hunt`, `review_submission`, `player_leave_room`) execute inside Postgres transactions with row-level locks (`SELECT ... FOR UPDATE`).
4. **Storage Isolation & TTL**: Private `submissions` bucket with player-scoped upload paths and an automated 5-minute cleanup trigger to ensure zero storage cost bloat.

---

## 5. Development Milestones on `backend` Branch

1. **Phase 1: Migrations (`supabase/migrations/`)**:
   - `01_initial_schema.sql`: Tables, player connection statuses, indexes.
   - `02_rls_security.sql`: Cached RLS helper functions and access policies.
   - `03_game_rpcs.sql`: Transactional state machine RPCs + All-Players-Submitted auto-pause logic.
   - `04_disconnect_quit_rpcs.sql`: Host migration, disconnect grace periods, and leave handlers.
   - `05_storage_cleanup.sql`: Private storage policies and TTL purge routines.

2. **Phase 2: Client Service Integration (`src/lib/api/`)**:
   - `roomService.ts`: Room lifecycle & host migration handlers.
   - `roundService.ts`: Timer synchronization & round control.
   - `submissionService.ts`: Photo uploads, submissions, host review processing.
   - `presenceService.ts`: Supabase Presence tracking & auto-reconnection.
