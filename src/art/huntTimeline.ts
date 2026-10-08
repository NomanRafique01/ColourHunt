/**
 * huntTimeline.ts — Timing and color constants for "The Hunt" animated hero.
 * Single 6-second loop keyframes.
 */

export const HUNT_TIMELINE = {
  LOOP_DURATION: 6000,

  // Keyframe timestamps (ms)
  CHIP_POP_START: 0,
  CHIP_POP_END: 600,

  SEARCH_START: 600,
  SEARCH_W1: 1200,      // pause at wrong tile 1
  SEARCH_W2: 2000,      // pause at wrong tile 2
  SEARCH_W3: 2800,      // pause at wrong tile 3
  SEARCH_END: 3000,

  TARGET_EASE_START: 3000,
  TARGET_EASE_END: 3600,

  SNAP_START: 3600,
  SNAP_FLASH_END: 3800,
  SNAP_END: 4000,

  LIFT_START: 4000,
  LIFT_END: 5200,

  REFILL_START: 5200,
  REFILL_END: 6000,
} as const

export const HUNT_COLORS = {
  CHARCOAL: '#1F1F29',
  BRASS: '#E2B04A',
  GREEN: '#1FB35B',
  WHITE: '#FFFFFF',
  BOARD_BG: '#FFFFFF',
  SHINE_ARC: 'rgba(255, 255, 255, 0.75)',
  GLASS_TINT: 'rgba(255, 255, 255, 0.15)',
} as const
