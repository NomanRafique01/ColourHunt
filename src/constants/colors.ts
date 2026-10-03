/**
 * ColourHunt Design Tokens
 * Theme: Crimson Red x Off-White
 *
 * Usage:  import { COLORS, APP_THEME, GAME_COLORS } from '../constants/colors'
 *
 * COLORS    - raw palette (all hex values in one place)
 * APP_THEME - semantic tokens (use these in StyleSheet definitions)
 * GAME_COLORS - hunt palette (red + white family)
 */

// ------------------------------------
// LAYER 1 - RAW PALETTE
// ------------------------------------
export const COLORS = {
  // Reds
  red100: '#FFE5E8',
  red200: '#FFBCC2',
  red300: '#FF7A85',
  red400: '#F03040',
  red500: '#E8192C',   // brand primary - Crimson
  red600: '#C41225',
  red700: '#9B0E1D',
  red800: '#6B0814',
  red900: '#3D040C',

  // Whites & Neutrals
  white:      '#FEFEFA',   // off-white - primary background
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

// ------------------------------------
// LAYER 2 - SEMANTIC DESIGN TOKENS
// ------------------------------------
export const APP_THEME = {
  // Backgrounds
  background:        COLORS.white,        // #FEFEFA
  backgroundSoft:    COLORS.gray50,
  surface:           COLORS.pure_white,
  surfaceElevated:   COLORS.gray50,
  surfaceBorder:     COLORS.gray100,
  divider:           COLORS.gray100,

  // Text
  text:              COLORS.gray800,
  textSecondary:     COLORS.gray600,
  textMuted:         COLORS.gray400,
  textInverted:      COLORS.pure_white,

  // Primary - Crimson Red
  primary:           COLORS.red500,
  primaryDark:       COLORS.red600,
  primaryLight:      COLORS.red400,
  primarySubtle:     COLORS.red100,
  primaryDisabled:   COLORS.red200,
  primaryGlow:       'rgba(232, 25, 44, 0.15)',
  primaryGlowStrong: 'rgba(232, 25, 44, 0.30)',

  // Inputs
  inputBg:           COLORS.pure_white,
  inputText:         COLORS.gray800,
  inputBorder:       COLORS.gray200,
  inputBorderActive: COLORS.red500,

  // Status
  success:           COLORS.red500,
  successText:       COLORS.pure_white,
  danger:            COLORS.red600,
  dangerText:        COLORS.pure_white,
  warning:           COLORS.red300,
  warningText:       COLORS.gray800,
  info:              COLORS.gray500,

  // Shadows
  shadowColor:       COLORS.gray300,
  shadowColorRed:    COLORS.red500,

  // Overlay
  overlay:           'rgba(0, 0, 0, 0.45)',

  // Legacy aliases kept so existing screens don't break
  surfaceBorder_old: COLORS.gray100,
} as const

// ------------------------------------
// GAME COLORS - Red + White family only
// ------------------------------------
export const GAME_COLORS = [
  { name: 'Crimson',   hex: COLORS.red500      },
  { name: 'Scarlet',   hex: COLORS.red400      },
  { name: 'Cardinal',  hex: COLORS.red600      },
  { name: 'Ruby',      hex: COLORS.red700      },
  { name: 'Coral Red', hex: '#FF4F5E'           },
  { name: 'Rose',      hex: '#FF6B7A'           },
  { name: 'White',     hex: COLORS.white       },
  { name: 'Snow',      hex: COLORS.pure_white  },
] as const
