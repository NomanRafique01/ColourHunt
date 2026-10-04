/**
 * ColourHunt Design Tokens
 * Theme: Crimson Red × Off-White × Game Accents
 *
 * Usage:  import { COLORS, APP_THEME, ACCENT, PLAYER_COLORS, GAME_COLORS } from '../constants/colors'
 *
 * COLORS        - raw palette (hex values only, never use directly in UI)
 * APP_THEME     - semantic tokens (use these in StyleSheet)
 * ACCENT        - the four game accent families: red, blue, green, yellow
 * PLAYER_COLORS - per-slot colour set for P1-P4
 * GAME_COLORS   - hunt target palette
 *
 * Colour semantics (enforced by convention):
 *   red    → brand, errors, primary CTA
 *   blue   → timer, info, neutral action
 *   green  → ready / found / success
 *   yellow → winner / highlight — fill only; never as text on white
 *
 * Contrast rule: all text must meet WCAG AA (≥ 4.5:1).
 *   - White/cream text on red/blue/green backgrounds: ✓
 *   - Dark text (#1A1A1A) on yellow backgrounds: ✓
 *   - Yellow text only on dark red/gradient: ✓
 */

// ─────────────────────────────────────────────────────────────────────────────
// LAYER 1 — RAW PALETTE  (hex values, organised by hue family)
// ─────────────────────────────────────────────────────────────────────────────
export const COLORS = {
  // ── Reds ────────────────────────────────────────────────────────────────────
  red100: '#FFE5E8',
  red200: '#FFBCC2',
  red300: '#FF7A85',
  red400: '#F03040',
  red500: '#E40C1A',   // brand primary
  red600: '#C41225',
  red700: '#9B0E1D',
  red800: '#6B0814',
  red900: '#3D040C',

  // ── Blues ───────────────────────────────────────────────────────────────────
  blue100: '#E6EEFF',
  blue200: '#ADC8FF',
  blue300: '#5E8FFF',
  blue500: '#2F6BFF',  // brand blue (timer / info)
  blue700: '#1D4ED8',
  blue900: '#0A1A40',

  // ── Greens ──────────────────────────────────────────────────────────────────
  green100: '#E3F7EC',
  green200: '#9FEAC4',
  green300: '#4DCB87',
  green500: '#1FB35B',  // brand green (ready / found)
  green700: '#15803D',
  green900: '#063320',

  // ── Yellows ─────────────────────────────────────────────────────────────────
  yellow100: '#FFF4D1',
  yellow200: '#FFE99A',
  yellow300: '#FFD966',
  yellow500: '#FFC93C',  // brand yellow (winner / highlight)
  yellow700: '#996600',  // legacy
  yellow900: '#3B2F00',  // dark text on yellow backgrounds

  // ── Ambers ──────────────────────────────────────────────────────────────────
  amber100: '#FEF3C7',
  amber500: '#F59E0B',
  amber700: '#92400E',

  // ── Purples ─────────────────────────────────────────────────────────────────
  purple100: '#F3E8FF',
  purple500: '#7C3AED',
  purple700: '#5B21B6',

  // ── Whites & Neutrals ───────────────────────────────────────────────────────
  cream:      '#FEFEF8',  // off-white / primary background
  white:      '#FEFEFA',  // legacy alias
  gray50:     '#F5F5F0',
  gray100:    '#EBEBEB',
  gray200:    '#D6D6D6',
  gray300:    '#BBBBBB',
  gray400:    '#999999',
  gray500:    '#777777',
  gray600:    '#555555',
  gray700:    '#333333',
  gray800:    '#1A1A1A',
  gray900:    '#0D0D0D',

  pure_white: '#FFFFFF',
  pure_black: '#000000',
} as const

// ─────────────────────────────────────────────────────────────────────────────
// LAYER 2 — SEMANTIC TOKENS  (use these everywhere in UI code)
// ─────────────────────────────────────────────────────────────────────────────
export const APP_THEME = {
  // ── Backgrounds ─────────────────────────────────────────────────────────────
  background:        COLORS.cream,
  backgroundSoft:    COLORS.gray50,
  surface:           COLORS.pure_white,
  surfaceElevated:   COLORS.gray50,
  surfaceBorder:     COLORS.gray100,
  divider:           COLORS.gray100,

  // ── Text ────────────────────────────────────────────────────────────────────
  text:              COLORS.gray800,
  textSecondary:     COLORS.gray600,
  textMuted:         COLORS.gray400,
  textInverted:      COLORS.pure_white,

  // ── Primary – Crimson Red ───────────────────────────────────────────────────
  primary:           COLORS.red500,
  primaryDark:       COLORS.red700,
  primaryLight:      COLORS.red400,
  primarySubtle:     COLORS.red100,
  primaryDisabled:   COLORS.red200,
  primaryGlow:       'rgba(228, 12, 26, 0.15)',
  primaryGlowStrong: 'rgba(228, 12, 26, 0.30)',

  // ── Hero gradient ───────────────────────────────────────────────────────────
  heroTop:           '#F0192D',
  heroBottom:        '#B3000F',

  // ── Inputs ──────────────────────────────────────────────────────────────────
  inputBg:           COLORS.pure_white,
  inputText:         COLORS.gray800,
  inputBorder:       COLORS.gray200,
  inputBorderActive: COLORS.red500,

  // ── Status (semantic meanings, not just colours) ─────────────────────────────
  //   success / ready / found  → green
  success:           COLORS.green500,
  successLight:      COLORS.green100,
  successDark:       COLORS.green700,
  successText:       COLORS.pure_white,
  //   danger / error / brand   → red
  danger:            COLORS.red600,
  dangerText:        COLORS.pure_white,
  //   warning / waiting        → yellow (use dark text!)
  warning:           COLORS.yellow500,
  warningLight:      COLORS.yellow100,
  warningDark:       COLORS.yellow700,
  warningText:       COLORS.gray800,  // dark on yellow – keeps 4.5:1
  //   info / timer             → blue
  info:              COLORS.blue500,
  infoLight:         COLORS.blue100,
  infoDark:          COLORS.blue700,
  infoText:          COLORS.pure_white,
  //   winner / highlight       → yellow fill + dark text
  winner:            COLORS.yellow500,
  winnerText:        COLORS.gray800,

  // ── Shadows ─────────────────────────────────────────────────────────────────
  shadowColor:       COLORS.gray300,
  shadowColorRed:    COLORS.red500,
  shadowColorBlue:   COLORS.blue500,
  shadowColorGreen:  COLORS.green500,

  // ── Overlay ─────────────────────────────────────────────────────────────────
  overlay:           'rgba(0, 0, 0, 0.45)',

  // ── Legacy aliases (kept so existing screens don't break) ───────────────────
  surfaceBorder_old: COLORS.gray100,
} as const

// ─────────────────────────────────────────────────────────────────────────────
// LAYER 3 — ACCENT FAMILIES  (one accent per component rule)
// Each family: base, dark (for text/icons on white), light (for chip backgrounds)
// ─────────────────────────────────────────────────────────────────────────────
export const ACCENT = {
  red: {
    base:    COLORS.red500,
    dark:    COLORS.red700,
    light:   COLORS.red100,
    text:    COLORS.pure_white,   // text ON red background
    textOn:  COLORS.red800,       // red text ON light background
    shadow:  'rgba(228, 12, 26, 0.25)',
    glow:    'rgba(228, 12, 26, 0.18)',
  },
  blue: {
    base:    COLORS.blue500,
    dark:    COLORS.blue700,
    light:   COLORS.blue100,
    text:    COLORS.pure_white,
    textOn:  COLORS.blue700,
    shadow:  'rgba(47, 107, 255, 0.25)',
    glow:    'rgba(47, 107, 255, 0.15)',
  },
  green: {
    base:    COLORS.green500,
    dark:    COLORS.green700,
    light:   COLORS.green100,
    text:    COLORS.pure_white,
    textOn:  COLORS.green700,
    shadow:  'rgba(31, 179, 91, 0.25)',
    glow:    'rgba(31, 179, 91, 0.15)',
  },
  yellow: {
    base:    COLORS.yellow500,
    dark:    COLORS.yellow900,
    light:   COLORS.yellow100,
    text:    COLORS.yellow900,    // dark text #3B2F00 ON yellow – 4.5:1 compliant
    textOn:  COLORS.yellow900,
    shadow:  'rgba(255, 201, 60, 0.30)',
    glow:    'rgba(255, 201, 60, 0.20)',
  },
  amber: {
    base:    COLORS.amber500,
    dark:    COLORS.amber700,
    light:   COLORS.amber100,
    text:    COLORS.amber700,
    textOn:  COLORS.amber700,
    shadow:  'rgba(245, 158, 11, 0.25)',
    glow:    'rgba(245, 158, 11, 0.15)',
  },
  purple: {
    base:    COLORS.purple500,
    dark:    COLORS.purple700,
    light:   COLORS.purple100,
    text:    COLORS.pure_white,
    textOn:  COLORS.purple700,
    shadow:  'rgba(124, 58, 237, 0.25)',
    glow:    'rgba(124, 58, 237, 0.15)',
  },
} as const

// ─────────────────────────────────────────────────────────────────────────────
// LAYER 4 — PLAYER SLOT COLOURS  (P1-P4, deterministic assignment)
// ─────────────────────────────────────────────────────────────────────────────
export const PLAYER_COLORS = [
  // P1 – Red (brand)
  {
    slot: 1,
    base:   COLORS.red500,
    dark:   COLORS.red700,
    light:  COLORS.red100,
    text:   COLORS.pure_white,
    textOn: COLORS.red800,
  },
  // P2 – Blue (timer / info)
  {
    slot: 2,
    base:   COLORS.blue500,
    dark:   COLORS.blue700,
    light:  COLORS.blue100,
    text:   COLORS.pure_white,
    textOn: COLORS.blue700,
  },
  // P3 – Green (ready / found)
  {
    slot: 3,
    base:   COLORS.green500,
    dark:   COLORS.green700,
    light:  COLORS.green100,
    text:   COLORS.pure_white,
    textOn: COLORS.green700,
  },
  // P4 – Yellow (winner / highlight) – always dark text #3B2F00
  {
    slot: 4,
    base:   COLORS.yellow500,
    dark:   COLORS.yellow900,
    light:  COLORS.yellow100,
    text:   COLORS.yellow900,    // dark text on yellow
    textOn: COLORS.yellow900,
  },
] as const

// ─────────────────────────────────────────────────────────────────────────────
// LAYER 5 — GAME TARGET PALETTE  (hunt colour swatches)
// ─────────────────────────────────────────────────────────────────────────────
export const GAME_COLORS = [
  { name: 'Crimson',   hex: COLORS.red500   },
  { name: 'Scarlet',   hex: COLORS.red400   },
  { name: 'Cardinal',  hex: COLORS.red600   },
  { name: 'Ruby',      hex: COLORS.red700   },
  { name: 'Coral Red', hex: '#FF4F5E'        },
  { name: 'Rose',      hex: '#FF6B7A'        },
  { name: 'Cobalt',    hex: COLORS.blue500  },
  { name: 'Sky',       hex: COLORS.blue300  },
  { name: 'Forest',    hex: COLORS.green500 },
  { name: 'Lime',      hex: COLORS.green300 },
  { name: 'Gold',      hex: COLORS.yellow500},
  { name: 'White',     hex: COLORS.cream    },
  { name: 'Snow',      hex: COLORS.pure_white },
] as const
