# Color Hunt — Complete Game Flow

Read this before modifying any screen navigation, game loop state, or round logic.

---

## 1. Screen Architecture

```
AuthScreen (Play as Guest | Sign In / Sign Up)
  └── HomeScreen
        ├── CreateRoomScreen  →  LobbyScreen (host)
        └── JoinRoomScreen   →  LobbyScreen (player)
              └── RoundScreen (all players hunting simultaneously)
                    ├── CameraScreen (photo capture & on-device score)
                    ├── ReviewScreen (host only — reviews submissions)
                    └── ResultScreen (all players — winner & photo reel)
```

---

## 2. Phase-by-Phase Walkthrough

### Phase 1 — Authentication & Profile
1. On app launch, the app checks for an existing Supabase session.
2. If no session exists, the player can choose:
   - **Play as Guest**: Signs in anonymously via `supabase.auth.signInAnonymously()`. Profile created with default or chosen display name.
   - **Sign In / Sign Up**: Signs in with email and password to track permanent statistics and sync across devices.
3. Once authenticated, user navigates to `HomeScreen`.

---

### Phase 2 — Room Creation & Joining

#### Host (Create Room)
1. Host enters display name and selects max players (2 to 8, default 4).
2. App invokes `create_room` RPC.
3. Generates unique 4-character code (excluding `I, O, 0, 1`).
4. Room is created with status `waiting`, host joins with `is_host = true`, and navigates to `LobbyScreen`.

#### Player (Join Room)
1. Player enters the 4-character room code.
2. App invokes `join_room` RPC.
3. Room row is locked with `FOR UPDATE`. If full or already in progress, an error is returned.
4. Player record inserted with status `active`; navigates to `LobbyScreen`.

---

### Phase 3 — Lobby & Presence
- Realtime channel displays the list of joined players and their connection statuses (`active`, `disconnected`).
- Host sees a **Start Game** button (enabled when 2+ players are connected).
- Players see *"Waiting for host to start..."*.
- If a player quits the lobby, they are removed in realtime.

---

### Phase 4 — Round Start
1. Host taps **Start Game**.
2. App invokes `start_round` RPC:
   - Shuffles and assigns distinct, contrasting colors to all active players.
   - Creates a new `rounds` row with status `active` and countdown duration (e.g., 60 seconds).
   - Sets room status to `in_round`.
3. All players receive their assigned color via Realtime.
4. `RoundScreen` opens, showing color swatch, live synchronized countdown timer, and **Capture Photo** button.

---

### Phase 5 — Concurrent Photo Hunting
1. All players search for real-world items matching their assigned color simultaneously.
2. Players tap **Capture Photo** to open `CameraScreen` (rear camera only).
3. On capture, `colorMatcher.ts` analyzes dominant colors and calculates a match score (0–100%).
4. The player reviews their photo and score:
   - **Submit**: Uploads to Supabase Storage and records submission.
   - **Retake**: Discards local photo and allows retrying (up to 3 attempts total).

---

### Phase 6 — All-Players-Submitted Auto-Pause Logic
1. When a player submits, their attempt is recorded:
   - The submitting player enters a *"Waiting for other players..."* screen.
   - **Crucial**: The round timer **continues running**! Other players continue hunting.
2. The server evaluates the submission quota:
   $$\text{active\_players} = \text{count of players where } \text{status} = 'active'$$
   $$\text{submitted\_players} = \text{count of active players who submitted or used 3 attempts}$$
3. **Trigger**: When $\text{submitted\_players} \ge \text{active\_players}$ (or if the countdown timer hits 0):
   - Server freezes remaining seconds: $\text{remaining\_seconds} = \max(0, \text{remaining\_seconds} - (\text{now} - \text{resumed\_at}))$.
   - Round status updates to `paused`.
   - Room status updates to `reviewing`.
   - Realtime broadcast alerts all players that hunting has concluded and review has begun.

---

### Phase 7 — Host Review Queue
Host opens `ReviewScreen` displaying queued submissions in order of submission timestamp:
1. Host sees: submitted photo, player display name, assigned color swatch, and match score.
2. Host taps **Approve**:
   - `review_submission` marks submission approved.
   - Winner is set in `rounds` table.
   - Room transitions to `finished`; all players navigate to `ResultScreen`.
3. Host taps **Reject**:
   - Submission marked rejected.
   - If more submissions exist in the queue, host moves to the next one.
   - If the queue is empty:
     - If remaining time $> 0$ and active players have attempts left, `resume_round` unfreezes the timer and sends all players back to hunting (`in_round`)!
     - If remaining time $= 0$ or all attempts exhausted, round finishes with `no_winner`.
4. **Review Timeout**: If host does not act within 60 seconds, auto-decision executes:
   - Score $\ge 70\% \rightarrow$ Auto-approve.
   - Score $< 70\% \rightarrow$ Auto-reject.

---

### Phase 8 — Disconnect, Offline & Quit Handling

#### Player Quits Voluntarily (`player_leave_room`)
- Player status transitions to `left`.
- If in a round, the required submission quota immediately recalculates against the remaining active players.
- If remaining active players have all already submitted, the round pauses immediately for review.
- If the leaving player is the **Host**, leadership migrates automatically to the next active player with the earliest `joined_at` timestamp.

#### Player Disconnects / Goes Offline (Presence Heartbeat)
- Socket drop flags player as `disconnected` with a 25-second grace window.
- The player does NOT block game progress: if remaining connected players submit, the auto-pause triggers normally.
- If the disconnected player reopens the app before game end, `reconnect_player` restores their state instantly.

---

### Phase 9 — Results & Cleanup
1. `ResultScreen` reveals winner, winning photo, and full round photo reel.
2. Host can tap **Play Again** to reset round states, reshuffle colors, and start Round 2.
3. On game exit:
   - Photos are deleted from Supabase Storage.
   - Local device cache photos are wiped via `expo-file-system`.
   - 5-minute database TTL purge catches any stray files.
