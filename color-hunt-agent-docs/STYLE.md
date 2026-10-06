# Color Hunt — Style Guide

Read this before writing any component, screen, or stylesheet.

---

## TypeScript

- Strict mode on. No `any`. No `@ts-ignore` without a comment explaining why.
- All shared types live in `src/types/index.ts`.
- Props interfaces are defined above the component they belong to, in the same file.
- Use `interface` for object shapes, `type` for unions and aliases.
- Async functions always have explicit return types.

---

## Naming

| Thing | Convention | Example |
|---|---|---|
| Components | PascalCase | `ColorSwatch`, `SubmissionCard` |
| Screens | PascalCase + Screen suffix | `LobbyScreen`, `ReviewScreen` |
| Hooks | camelCase + use prefix | `useRoomSubscription`, `useCountdown` |
| Zustand stores | camelCase + Store suffix | `gameStore`, `roomStore` |
| Lib helpers | camelCase, descriptive verb | `uploadPhoto`, `getRoomPlayers` |
| Constants | UPPER_SNAKE_CASE | `MAX_ATTEMPTS`, `TIME_LIMIT_SECONDS` |
| Types/Interfaces | PascalCase | `Room`, `Player`, `Submission` |

No generic names: `data`, `temp`, `handleClick`, `Manager`, `Helper`, `Utils` as a catch-all.
Name things by what they actually are.

---

## Components

- One component per file.
- No inline styles. All styles via `StyleSheet.create()` at the bottom of the file.
- No magic numbers in styles. Use values from `src/constants/`.
- Props are always typed with an interface defined above the component.
- Default exports for screens and pages. Named exports for shared components.

```typescript
// Good
interface ColorSwatchProps {
  color: string
  size?: number
  label?: string
}

export function ColorSwatch({ color, size = 48, label }: ColorSwatchProps) { ... }

const styles = StyleSheet.create({
  swatch: {
    width: size, // ❌ can't reference prop here — use dynamic style object in component
  }
})
```

For dynamic styles, return a style object from a function inside the component or use array styles:
```typescript
<View style={[styles.base, { backgroundColor: color, width: size }]} />
```

---

## Constants (`src/constants/`)

```typescript
// src/constants/game.ts
export const MAX_ATTEMPTS = 3
export const TIME_LIMIT_SECONDS = 60
export const REVIEW_TIMEOUT_SECONDS = 60
export const AUTO_APPROVE_THRESHOLD = 70   // match score % for auto-approve on timeout
export const MIN_PLAYERS = 2
export const MAX_PLAYERS = 4

// src/constants/colors.ts
export const GAME_COLORS = [
  { name: 'Red',    hex: '#E53935' },
  { name: 'Blue',   hex: '#1E88E5' },
  { name: 'Green',  hex: '#43A047' },
  { name: 'Yellow', hex: '#FDD835' },
  { name: 'Orange', hex: '#FB8C00' },
  { name: 'Purple', hex: '#8E24AA' },
  { name: 'Pink',   hex: '#E91E8C' },
  { name: 'White',  hex: '#F5F5F5' },
] as const
```

---

## Supabase Helpers (`src/lib/`)

All database calls go through typed helper functions. Never call `supabase` directly in a screen or component.

```typescript
// ✅ correct — in a screen
import { joinRoom } from '../lib/roomUtils'
const player = await joinRoom(code, displayName)

// ❌ wrong — never do this in a screen
import { supabase } from '../lib/supabase'
const { data } = await supabase.from('players').insert(...)
```

All helpers throw typed errors, never return raw Supabase error objects.

---

## Error Handling

- All async operations wrapped in try/catch.
- User-facing errors are shown via a centralized toast or modal, not `Alert.alert()`.
- Errors are logged to console in development only (`__DEV__` guard).
- Never show raw Supabase error messages to the user. Map them to plain language.

---

## File Structure Per Screen

```typescript
// imports
// types / interfaces
// component
// styles
```

---

## Commits

Short, specific, present tense. No AI-generated filler.

```
// ✅
add lobby player list with realtime sync
fix review timeout not clearing on approve
update submission RLS to block cross-player paths

// ❌
Implemented the lobby screen feature as per requirements
Fixed a bug that was causing issues with the review screen
Updated the code
```
