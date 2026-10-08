# Color Hunt — Security & Anti-Cheat Architecture

Read this before modifying any Supabase queries, RLS policies, auth flows, storage rules, or RPC procedures.

---

## 1. High-Performance Non-Recursive RLS Architecture

### The Problem with Naive RLS
Writing policies like:
```sql
using (room_id in (select room_id from players where user_id = auth.uid()))
```
causes PostgreSQL to re-evaluate recursive subqueries across every table scan. Under high concurrent player traffic, this degrades performance and can trigger PostgreSQL recursion limits.

### The Solution: `STABLE SECURITY DEFINER` Helper Functions
All access checks are delegated to index-backed, cached helper functions:

```sql
-- Checks if calling user is an active participant in the specified room
create or replace function public.is_room_player(p_room_id uuid, p_user_id uuid)
returns boolean language sql stable security definer as $$
  select exists (
    select 1 from public.players
    where room_id = p_room_id 
      and user_id = p_user_id 
      and status != 'left'
  );
$$;

-- Checks if calling user is the designated host of the specified room
create or replace function public.is_room_host(p_room_id uuid, p_user_id uuid)
returns boolean language sql stable security definer as $$
  select exists (
    select 1 from public.rooms
    where id = p_room_id and host_id = p_user_id
  );
$$;
```

---

## 2. Table Row Level Security Policies

### 2.1 `profiles`
```sql
alter table public.profiles enable row level security;

create policy "read public profiles"
  on public.profiles for select
  using (true);

create policy "update own profile"
  on public.profiles for update
  using (id = auth.uid());
```

### 2.2 `rooms`
```sql
alter table public.rooms enable row level security;

create policy "read rooms"
  on public.rooms for select
  using (
    status = 'waiting' 
    or public.is_room_player(id, auth.uid())
  );

-- Only atomic RPCs or the room host can update room state
create policy "host updates room"
  on public.rooms for update
  using (host_id = auth.uid());
```

### 2.3 `players`
```sql
alter table public.players enable row level security;

create policy "read room players"
  on public.players for select
  using (public.is_room_player(room_id, auth.uid()));

create policy "player updates self"
  on public.players for update
  using (user_id = auth.uid());
```

### 2.4 `rounds`
```sql
alter table public.rounds enable row level security;

create policy "read rounds"
  on public.rounds for select
  using (public.is_room_player(room_id, auth.uid()));

create policy "host updates rounds"
  on public.rounds for update
  using (public.is_room_host(room_id, auth.uid()));
```

### 2.5 `submissions`
```sql
alter table public.submissions enable row level security;

create policy "read submissions in round"
  on public.submissions for select
  using (
    exists (
      select 1 from public.rounds r
      where r.id = round_id and public.is_room_player(r.room_id, auth.uid())
    )
  );

create policy "host updates submission"
  on public.submissions for update
  using (
    exists (
      select 1 from public.rounds r
      where r.id = round_id and public.is_room_host(r.room_id, auth.uid())
    )
  );
```

---

## 3. Storage Security (Private Bucket: `submissions`)

The `submissions` bucket is strictly private. Public URL access is disabled.

### 3.1 Path Convention
```
submissions/{roomId}/{roundId}/{userId}/{attemptNumber}_{timestamp}.jpg
```

### 3.2 Storage Policies
1. **Upload (`INSERT`)**:
   - The uploading user MUST be authenticated.
   - The 3rd folder path segment MUST strictly match `auth.uid()::text`.
   - File size restricted to **2MB max**.
   - Allowed MIME types: `image/jpeg`, `image/png`, `image/webp`.

2. **Download (`SELECT`)**:
   - Only the host of `{roomId}` can generate signed download URLs (valid for 60 seconds).
   - Once downloaded by the host, the photo is deleted immediately.

3. **Delete (`DELETE`)**:
   - The submitting player OR the room host can delete the image.

### 3.3 Automated 5-Minute TTL Purge
To prevent orphaned files when games end abruptly or players drop, a scheduled purge function removes any file in `submissions` older than 5 minutes. This ensures storage usage remains below 20 MB at all times.

---

## 4. Anti-Cheat & Concurrency Hardening

1. **Server-Authoritative Clock**:
   - Local device clocks are never trusted.
   - Remaining time is calculated using PostgreSQL `now() - resumed_at`.
   - When auto-pausing for host review, `remaining_seconds` is calculated and frozen inside the database transaction.

2. **Strict Attempt Enforcement**:
   - Maximum 3 attempts per round.
   - Enforced by both database check constraint: `check (attempt_number between 1 and 3)` and composite uniqueness: `unique (round_id, player_id, attempt_number)`.
   - Clients cannot brute-force submissions.

3. **Atomic Room Locking**:
   - `join_room` executes `SELECT * FROM rooms WHERE code = p_code FOR UPDATE`.
   - Prevents race conditions where 5+ players join a 4-player room simultaneously.

4. **Credential & API Key Safety**:
   - Only `EXPO_PUBLIC_SUPABASE_ANON_KEY` is bundled in the mobile app.
   - The `SUPABASE_SERVICE_ROLE_KEY` is NEVER exposed on the client.
   - All elevated operations run inside `SECURITY DEFINER` stored procedures.
