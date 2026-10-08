# Color Hunt — Complete Backend Architecture

Read this before implementing or modifying any database schema, API service, auth flow, realtime channel, or state management.

---

## 1. System Overview

Color Hunt is a real-time multiplayer mobile game built with **Expo (React Native)** and **Supabase (PostgreSQL, Realtime, Auth, Storage)**.

```
+-----------------------------------------------------------------------------------------+
|                                    MOBILE CLIENT                                        |
|  - Auth State (Guest / Registered)                                                      |
|  - Camera Capture (expo-camera)                                                         |
|  - Local Color Matcher (Delta E distance & score 0-100)                                 |
|  - Local Countdown Timer (synchronized with server clock)                               |
|  - Realtime Presence & Broadcast Listener                                               |
+-----------------------------------------------------------------------------------------+
                                 ▲                         │
           Supabase Realtime     │                         │ Supabase Client (RPC & REST)
         (WebSockets / Presence) │                         ▼
+-----------------------------------------------------------------------------------------+
|                                  SUPABASE BACKEND                                       |
|                                                                                         |
|  1. GoTrue Auth Service                                                                 |
|     - Anonymous Guest sign-in (instant play)                                            |
|     - Email/Password Sign Up & Login                                                    |
|     - Account Linking (guest -> permanent account without data loss)                    |
|                                                                                         |
|  2. PostgreSQL 15+ Core                                                                 |
|     - Public Tables: rooms, players, rounds, submissions, profiles                      |
|     - Transactional Stored Procedures (SECURITY DEFINER RPCs):                          |
|         * create_room()                                                                 |
|         * join_room() (concurrency safe with SELECT FOR UPDATE)                         |
|         * start_round() (shuffles colors, creates round)                                |
|         * submit_hunt() (all-players-submitted auto-pause evaluator)                    |
|         * review_submission() (host approval/rejection & resume logic)                  |
|         * player_leave_room() (host migration & active quota re-calc)                   |
|         * sync_player_presence() (disconnect grace handler)                             |
|     - High-Performance Non-Recursive RLS Policies                                      |
|                                                                                         |
|  3. Supabase Realtime Server                                                            |
|     - Broadcast: room status, round timer sync, submission queue                        |
|     - Presence: socket connection tracking, disconnect detection                       |
|                                                                                         |
|  4. Supabase Storage (Private Relay)                                                    |
|     - Private bucket: submissions                                                       |
|     - Ephemeral relay: downloaded by host -> deleted immediately                        |
|     - Automated 5-minute TTL trigger: cleans up abandoned files                         |
+-----------------------------------------------------------------------------------------+
```

---

## 2. Core Architectural Pillars

### A. All-Players-Submitted Auto-Pause Logic
- During a round, all active players hunt for their assigned color at the same time.
- The round countdown timer **does not pause** when a single player submits.
- When a player submits a photo, they enter a *"Waiting for other players..."* state.
- The server checks whether **all active players** have submitted at least 1 photo (or exhausted their 3 attempts).
- Once the quota is reached, the round **automatically pauses**, remaining time is frozen, and the room status transitions to `reviewing` for the host.

### B. Offline, Disconnect & Quit Resilience
- **Disconnected players are not blockers**: If a player loses internet connection or closes the app, their status is set to `disconnected` with a 25-second grace window.
- The "all submitted" evaluator calculates required submissions against **currently active players only**. If 1 player drops offline, the remaining 3 players can still trigger the auto-pause without waiting indefinitely.
- **Host Migration**: If the host quits, host authority automatically migrates to the next active player with the earliest join timestamp.
- **Graceful Abandonment**: If all players leave, the room safely transitions to `abandoned`.

### C. Hybrid Authentication
- **Guest / Anonymous Play**: Instant access for multiplayer party sessions.
- **Email/Password Accounts**: For players who want permanent profiles, lifetime win records, and custom avatars.
- **Identity Linking**: Guests can upgrade to registered accounts at any time with zero loss of match history.

### D. Supabase Free Tier Compatibility
- Database footprint: lightweight rows (~200 bytes each) cleaned up every 24 hours. DB stays under 15 MB (< 3% of the 500 MB limit).
- Storage footprint: strictly ephemeral relay with 5-minute auto-purge. Storage stays under 20 MB (< 2% of the 1 GB limit).
- Realtime quota: 200 concurrent sockets supports up to 50 active 4-player games running at the exact same second.

---

## 3. Client & Server Communication Flow

All database state mutations **must** go through typed API services wrapping PostgreSQL RPCs in `src/lib/api/`:

```
src/lib/
  ├── supabase.ts             # Singleton Supabase client configuration
  └── api/
      ├── authService.ts      # signInGuest, signUpWithEmail, signInWithEmail, linkGuestAccount
      ├── roomService.ts      # createRoom, joinRoom, leaveRoom
      ├── roundService.ts     # startRound, resumeRound, syncTimer
      ├── submissionService.ts # uploadHuntPhoto, submitHuntEntry, reviewSubmission
      └── presenceService.ts  # trackPresence, handleDisconnect, reconnectPlayer
```

Direct client `INSERT` / `UPDATE` queries on sensitive tables (`rooms`, `rounds`, `submissions`) are strictly prohibited; all state mutations are encapsulated in atomic database RPCs.
