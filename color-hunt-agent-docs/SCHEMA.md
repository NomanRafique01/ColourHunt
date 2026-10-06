# Color Hunt — Database Schema Specification

Read this before performing any database migration, writing queries, or updating TypeScript types.

---

## 1. Overview & Conventions

- All primary keys use `uuid` (`gen_random_uuid()`).
- All timestamps use `timestamptz` in UTC.
- All table state mutations execute via atomic `SECURITY DEFINER` RPCs.
- RLS is enabled on every table with default `DENY ALL`.

---

## 2. Table Definitions

### 2.1 `profiles` (User Profiles & Statistics)
Stores permanent user details, stats, and linking information for registered and guest accounts.

```sql
create table public.profiles (
  id             uuid primary key references auth.users(id) on delete cascade,
  display_name   text not null check (char_length(display_name) between 1 and 16),
  avatar_url     text,
  is_anonymous   boolean not null default true,
  games_played   int not null default 0 check (games_played >= 0),
  games_won      int not null default 0 check (games_won >= 0),
  best_score     numeric(5,2) default 0.00 check (best_score >= 0.00 and best_score <= 100.00),
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);
```

---

### 2.2 `rooms` (Game Lobbies & State)
Represents a multiplayer game room.

```sql
create table public.rooms (
  id             uuid primary key default gen_random_uuid(),
  code           text not null unique,              -- 4-character uppercase alphanumeric (no ambiguous chars: I, O, 0, 1)
  host_id        uuid not null references auth.users(id),
  status         text not null default 'waiting' 
                   check (status in ('waiting', 'in_round', 'reviewing', 'finished', 'abandoned')),
  max_players    int not null default 4 check (max_players between 2 and 8),
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);
```

---

### 2.3 `players` (Session-Scoped Room Participants)
Tracks players inside an active room with connection state.

```sql
create table public.players (
  id             uuid primary key default gen_random_uuid(),
  room_id        uuid not null references public.rooms(id) on delete cascade,
  user_id        uuid not null references auth.users(id),
  display_name   text not null check (char_length(display_name) between 1 and 16),
  assigned_color text,                              -- Hex code or color identifier assigned when round starts
  is_host        boolean not null default false,
  status         text not null default 'active'
                   check (status in ('active', 'disconnected', 'left')),
  joined_at      timestamptz not null default now(),
  last_seen_at   timestamptz not null default now(),
  unique (room_id, user_id)
);
```

---

### 2.4 `rounds` (Match Rounds & Authoritative Clock)
Holds the authoritative round timer and winning state.

```sql
create table public.rounds (
  id                  uuid primary key default gen_random_uuid(),
  room_id             uuid not null references public.rooms(id) on delete cascade,
  round_number        int not null default 1 check (round_number > 0),
  status              text not null default 'active'
                        check (status in ('active', 'paused', 'finished', 'no_winner')),
  time_limit_seconds  int not null default 60 check (time_limit_seconds > 0),
  remaining_seconds   int not null default 60 check (remaining_seconds >= 0),
  started_at          timestamptz not null default now(),
  resumed_at          timestamptz not null default now(),
  paused_at           timestamptz,
  ended_at            timestamptz,
  winner_player_id    uuid references public.players(id)
);
```

---

### 2.5 `submissions` (Hunt Photos & Scores)
Records player submissions for a round.

```sql
create table public.submissions (
  id               uuid primary key default gen_random_uuid(),
  round_id         uuid not null references public.rounds(id) on delete cascade,
  player_id        uuid not null references public.players(id) on delete cascade,
  storage_path     text not null,                   -- submissions/{roomId}/{roundId}/{userId}/{filename}.jpg
  match_score      numeric(5,2) check (match_score >= 0.00 and match_score <= 100.00),
  status           text not null default 'pending'
                     check (status in ('pending', 'approved', 'rejected', 'deleted')),
  submitted_at     timestamptz not null default now(),
  reviewed_at      timestamptz,
  attempt_number   int not null check (attempt_number between 1 and 3),
  unique (round_id, player_id, attempt_number)
);
```

---

## 3. High-Performance Indexes

```sql
create index idx_rooms_code on public.rooms (code);
create index idx_rooms_status on public.rooms (status);
create index idx_players_room_status on public.players (room_id, status);
create index idx_players_user on public.players (user_id);
create index idx_rounds_room on public.rounds (room_id);
create index idx_submissions_round_player on public.submissions (round_id, player_id);
create index idx_submissions_pending on public.submissions (round_id, status) where status = 'pending';
```

---

## 4. Key Stored Procedures (RPCs)

| Function | Parameters | Purpose |
|---|---|---|
| `create_room(p_display_name, p_max_players)` | `text, int` | Generates 4-char code, creates room & sets caller as host. |
| `join_room(p_code, p_display_name)` | `text, text` | Locks room (`FOR UPDATE`), checks capacity & joins player safely. |
| `start_round(p_room_id, p_time_limit)` | `uuid, int` | Assigns non-duplicate colors to active players, creates round. |
| `submit_hunt(p_round_id, p_path, p_score)` | `uuid, text, numeric` | Records submission. If **all active players** have submitted, auto-pauses round and transitions room to `'reviewing'`. |
| `review_submission(p_submission_id, p_decision)` | `uuid, text` | Host approves (win round) or rejects (resumes round if queue empty). |
| `player_leave_room(p_room_id)` | `uuid` | Updates player to `'left'`. Migrates host if needed. Re-evaluates submission quota. |
| `sync_player_presence(p_room_id, p_status)` | `uuid, text` | Toggles `'active'` / `'disconnected'`. Checks submission quota so offline players don't block progress. |
| `reconnect_player(p_room_id)` | `uuid` | Restores player to `'active'` upon reconnecting. |

---

## 5. TypeScript Mirror Definitions (`src/types/index.ts`)

```typescript
export type RoomStatus = 'waiting' | 'in_round' | 'reviewing' | 'finished' | 'abandoned';
export type PlayerStatus = 'active' | 'disconnected' | 'left';
export type RoundStatus = 'active' | 'paused' | 'finished' | 'no_winner';
export type SubmissionStatus = 'pending' | 'approved' | 'rejected' | 'deleted';

export interface Profile {
  id: string;
  displayName: string;
  avatarUrl: string | null;
  isAnonymous: boolean;
  gamesPlayed: number;
  gamesWon: number;
  bestScore: number;
  createdAt: string;
  updatedAt: string;
}

export interface Room {
  id: string;
  code: string;
  hostId: string;
  status: RoomStatus;
  maxPlayers: number;
  createdAt: string;
  updatedAt: string;
}

export interface Player {
  id: string;
  roomId: string;
  userId: string;
  displayName: string;
  assignedColor: string | null;
  isHost: boolean;
  status: PlayerStatus;
  joinedAt: string;
  lastSeenAt: string;
}

export interface Round {
  id: string;
  roomId: string;
  roundNumber: number;
  status: RoundStatus;
  timeLimitSeconds: number;
  remainingSeconds: number;
  startedAt: string;
  resumedAt: string;
  pausedAt: string | null;
  endedAt: string | null;
  winnerPlayerId: string | null;
}

export interface Submission {
  id: string;
  roundId: string;
  playerId: string;
  storagePath: string;
  matchScore: number | null;
  status: SubmissionStatus;
  submittedAt: string;
  reviewedAt: string | null;
  attemptNumber: number;
}
```
