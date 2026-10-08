# Color Hunt — Agent Guide

This is the single source of truth for any AI agent working on this project.
Read this file first. Then read the file relevant to your current task.

---

## Project Overview

Color Hunt is a real-time multiplayer Android game built with React Native + Expo.
Up to 4 players join a room via a 4-character code. Each player is assigned a unique color.
They race to photograph something of that color using their phone camera.
Every submission pauses the round. The host reviews each photo (aided by auto color
analysis) and approves or rejects it. First approved submission wins.

---

## Stack

| Layer | Tool |
|---|---|
| Framework | React Native + Expo SDK (latest stable) |
| Language | TypeScript (strict — no `any`) |
| Backend | Supabase v2 (auth, realtime, database, storage) |
| State | Zustand |
| Navigation | React Navigation (native stack) |
| Camera | expo-camera (capture only — no gallery access) |
| Color analysis | react-native-image-colors |
| Local storage | expo-file-system |

---

## Folder Structure

```
src/
  components/     # Reusable UI components
  screens/        # One file per screen
  store/          # Zustand stores (game.ts, room.ts, player.ts)
  lib/            # supabase.ts, colorMatcher.ts, roomUtils.ts
  hooks/          # Custom React hooks
  types/          # TypeScript interfaces for all shared types
  constants/      # Colors palette, game config (time limits, attempt cap)
  navigation/     # Root navigator and type definitions
```

---

## Agent Files Index

| File | When to read it |
|---|---|
| `AGENTS.md` | Always — read first |
| `ARCHITECTURE.md` | Before touching any data flow, state, or Supabase logic |
| `GAMEFLOW.md` | Before touching any screen, game logic, or round state |
| `SECURITY.md` | Before any Supabase query, RLS policy, or auth flow |
| `STYLE.md` | Before writing any component, screen, or style |
| `SCHEMA.md` | Before any database operation or migration |

---

## Absolute Rules

- Never use `any`. Define all shapes in `src/types/`.
- Never create a second Supabase client. Only `src/lib/supabase.ts` exports it.
- Never call Supabase directly from screens or components. Use `src/lib/` helpers.
- Never use `Math.random()` for room codes or tokens. Use `crypto.randomUUID()` or a Supabase function.
- Never access the gallery. Camera only.
- Never write inline styles. Use `StyleSheet.create()`.
- Never hardcode time limits or attempt caps. Use `src/constants/`.
- Photos must be deleted from Supabase storage immediately after the host downloads them.
- Local photo copies must be wiped when a game ends (win, loss, or abandon).
