# Color Hunt — Milestones

This is the build tracker. Update status as work completes.

---

## Status Key

- `[ ]` Not started
- `[~]` In progress
- `[x]` Done

---

## Milestone 1 — Project Setup
`[ ]` Expo project scaffolded with TypeScript strict mode  
`[ ]` All folders created per ARCHITECTURE.md structure  
`[ ]` All dependencies installed  
`[ ]` `.env.example` committed with placeholder keys  
`[ ]` `supabase.ts` initialises client once and exports singleton  
`[ ]` `npx expo start` runs with no TypeScript errors  

---

## Milestone 2 — Supabase Schema
`[ ]` All tables created per SCHEMA.md  
`[ ]` All indexes applied  
`[ ]` RLS enabled on all tables  
`[ ]` All RLS policies applied per SECURITY.md  
`[ ]` Storage bucket `submissions` created as private  
`[ ]` Storage RLS policies applied  
`[ ]` Realtime enabled on `rooms`, `rounds`, `submissions`  

---

## Milestone 3 — Room Create & Join
`[ ]` Anonymous auth on app launch  
`[ ]` HomeScreen: display name input, Create / Join buttons  
`[ ]` CreateRoomScreen: generates secure room code, inserts room, navigates to Lobby  
`[ ]` JoinRoomScreen: validates code, joins room, navigates to Lobby  
`[ ]` LobbyScreen: shows live player list via Realtime  
`[ ]` Host sees Start Game button (enabled at 2+ players)  
`[ ]` Players see waiting message  
`[ ]` Player leaving removes them from list in realtime  

---

## Milestone 4 — Round Start & Timer
`[ ]` Host taps Start Game: colors assigned, round inserted  
`[ ]` All players receive color via Realtime  
`[ ]` RoundScreen shows color swatch and countdown  
`[ ]` Timer synced from server on join  
`[ ]` Timer pauses server-side on submission  
`[ ]` Timer re-syncs on resume  

---

## Milestone 5 — Camera & Upload
`[ ]` CameraScreen opens rear camera only (no gallery)  
`[ ]` On capture: on-device color analysis runs via colorMatcher.ts  
`[ ]` Match score shown to player before submit  
`[ ]` Submit uploads to Supabase Storage at correct path  
`[ ]` Submission record inserted with server timestamp  
`[ ]` Attempt counter incremented (max 3, then submit disabled)  
`[ ]` Round pauses immediately on submission for all players  

---

## Milestone 6 — Review Flow
`[ ]` Host ReviewScreen shows photo, player name, color, match score  
`[ ]` Test button re-runs analysis, shows dominant colors and Delta E score  
`[ ]` Approve: winner set, room → finished, ResultScreen shown  
`[ ]` Reject: next queued submission shown, or round resumes if queue empty  
`[ ]` Host conflict: other players shown vote screen, majority decides  
`[ ]` Review timeout (60s): auto-approve if score ≥ 70%, else auto-reject  
`[ ]` Photo deleted from Storage after host downloads it  

---

## Milestone 7 — Result & Cleanup
`[ ]` ResultScreen shows winner, submission time, all photos  
`[ ]` Play Again resets round state (host only)  
`[ ]` Leave exits to HomeScreen  
`[ ]` All Storage photos deleted on game end  
`[ ]` All local cache photos wiped via expo-file-system  
`[ ]` Host disconnect → 30s grace → room abandoned → all players redirected  
`[ ]` Non-host disconnect → player removed, round continues  
`[ ]` Round timeout with no winner → no_winner result screen  
