import React from 'react'
import Svg, { Rect, Circle, Path } from 'react-native-svg'
import { COLORS } from '../../src/constants/colors'

export type AvatarVariant = 1 | 2 | 3 | 4

const AVATAR_THEMES = {
  1: {
    bg: COLORS.red100,
    body: COLORS.red500,
    accent: COLORS.red700,
    lens: COLORS.pure_white,
  },
  2: {
    bg: COLORS.red100,
    body: COLORS.red400,
    accent: COLORS.red600,
    lens: COLORS.pure_white,
  },
  3: {
    bg: COLORS.red100,
    body: COLORS.red600,
    accent: COLORS.red800,
    lens: COLORS.pure_white,
  },
  4: {
    bg: COLORS.red100,
    body: COLORS.red700,
    accent: COLORS.red900,
    lens: COLORS.pure_white,
  },
}

interface PlayerAvatarProps {
  size?: number
  variant?: AvatarVariant
}

export function CameraAvatar({ size = 40, variant = 1 }: PlayerAvatarProps) {
  const theme = AVATAR_THEMES[variant] || AVATAR_THEMES[1]

  return (
    <Svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      {/* Soft rounded background container */}
      <Rect width="40" height="40" rx="12" fill={theme.bg} />

      {/* Camera-Head Top Finder */}
      <Rect x="16" y="9" width="8" height="3" rx="1.5" fill={theme.accent} />
      <Circle cx="26" cy="10" r="1.5" fill={theme.body} />

      {/* Camera-Head Main Body */}
      <Rect x="8" y="12" width="24" height="18" rx="5" fill={theme.body} />

      {/* Lens Circle Outer */}
      <Circle cx="20" cy="21" r="6" fill={theme.accent} />
      {/* Lens Circle Inner */}
      <Circle cx="20" cy="21" r="3.5" fill={theme.lens} />
      <Circle cx="21" cy="20" r="1" fill={theme.accent} />

      {/* Bottom base / neck support */}
      <Path d="M14 31 H26" stroke={theme.accent} strokeWidth="2" strokeLinecap="round" />
    </Svg>
  )
}

export function GhostAvatar({ size = 40 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      {/* Dashed placeholder container */}
      <Rect
        x="1.5"
        y="1.5"
        width="37"
        height="37"
        rx="12"
        fill={COLORS.red100}
        stroke={COLORS.red300}
        strokeWidth="1.5"
        strokeDasharray="4 3"
      />
      {/* Camera-head silhouette outline */}
      <Rect x="16" y="10" width="8" height="3" rx="1.5" fill={COLORS.red300} opacity={0.6} />
      <Rect x="10" y="13" width="20" height="15" rx="4" stroke={COLORS.red300} strokeWidth="1.5" strokeDasharray="3 2" />
      <Circle cx="20" cy="20.5" r="4" stroke={COLORS.red300} strokeWidth="1.5" strokeDasharray="2 2" />
    </Svg>
  )
}

export default CameraAvatar
