/**
 * wheelLogic.ts — Colour Spin algorithm.
 *
 * DO NOT change the algorithm, colour list, or makeSpinPlan().
 * Only the HOST calls makeSpinPlan(). Guests receive the plan over the
 * realtime layer and pass it verbatim to <ColourWheel plan={plan} />.
 *
 * The winning index comes from plan.winnerIndex — NEVER from the animation.
 */

// ─── Wheel Colour Palette ─────────────────────────────────────────────────────

export interface WheelColour {
  /** Display name shown in the reveal card and player rows */
  name: string
  /** Slice fill colour (hex) */
  hex: string
  /**
   * Readable text colour to use ON TOP of this slice.
   * Either '#FFFFFF' (light slices use dark text) or '#1A1A1A' (dark slices
   * use white text is fine too — author's call per family).
   */
  readableTextOn: string
}

/**
 * 12 distinct colour families in order:
 * red, black, yellow, purple, green, white, orange, blue, pink, brown, turquoise, grey
 *
 * Indices 0–11 are stable for the lifetime of a game session.
 * takenIndexes / winnerIndex always refers to these.
 */
export const WHEEL_COLOURS: readonly WheelColour[] = [
  { name: 'Red',       hex: '#E40C1A', readableTextOn: '#FFFFFF' },
  { name: 'Black',     hex: '#1A1A1A', readableTextOn: '#FFFFFF' },
  { name: 'Yellow',    hex: '#FFC93C', readableTextOn: '#1A1A1A' },
  { name: 'Purple',    hex: '#7C3AED', readableTextOn: '#FFFFFF' },
  { name: 'Green',     hex: '#1FB35B', readableTextOn: '#FFFFFF' },
  { name: 'White',     hex: '#F5F5F0', readableTextOn: '#1A1A1A' },
  { name: 'Orange',    hex: '#F97316', readableTextOn: '#FFFFFF' },
  { name: 'Blue',      hex: '#2F6BFF', readableTextOn: '#FFFFFF' },
  { name: 'Pink',      hex: '#EC4899', readableTextOn: '#FFFFFF' },
  { name: 'Brown',     hex: '#92400E', readableTextOn: '#FFFFFF' },
  { name: 'Turquoise', hex: '#0D9488', readableTextOn: '#FFFFFF' },
  { name: 'Grey',      hex: '#6B7280', readableTextOn: '#FFFFFF' },
] as const

// ─── Spin Plan ────────────────────────────────────────────────────────────────

/**
 * A fully-determined spin plan produced by the host.
 * Sent over the realtime channel so every device sees the same result.
 */
export interface SpinPlan {
  /** Index into WHEEL_COLOURS that the wheel will land on */
  winnerIndex: number
  /**
   * Full revolutions added to the animation so the spin looks exciting.
   * Guests must use this value — do NOT re-randomise.
   */
  revolutionCount: number
  /**
   * Opaque seed for debugging / replays. Do not use for game logic.
   */
  seed: number
}

// ─── Host-only function ───────────────────────────────────────────────────────

/**
 * Produces a deterministic SpinPlan that avoids already-taken indices.
 *
 * ⚠️  CALL ON THE HOST ONLY.
 * Broadcast the returned plan; guests receive it and pass it directly
 * to <ColourWheel plan={plan} /> — they must NOT call this function.
 *
 * @param takenIndexes  Set of WHEEL_COLOURS indices already assigned this game.
 * @throws              If all 12 colours are taken.
 */
export function makeSpinPlan(takenIndexes: ReadonlySet<number>): SpinPlan {
  const available: number[] = []
  for (let i = 0; i < WHEEL_COLOURS.length; i++) {
    if (!takenIndexes.has(i)) available.push(i)
  }

  if (available.length === 0) {
    throw new Error('makeSpinPlan: all colours are taken.')
  }

  const seed          = Math.floor(Math.random() * 0xffffffff)
  const pick          = seed % available.length
  const winnerIndex   = available[pick]
  // 5–8 full revolutions for a satisfying spin
  const revolutionCount = 5 + (seed % 4)

  return { winnerIndex, revolutionCount, seed }
}

