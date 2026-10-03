import React from 'react'
import Svg, { Rect, Circle, Path } from 'react-native-svg'
import { COLORS } from '../../src/constants/colors'

interface Props {
  size?: number
}

export function FlatLogoMark({ size = 36 }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 36 36" fill="none">
      {/* Background Soft Red Squircle */}
      <Rect width="36" height="36" rx="10" fill={COLORS.red500} />

      {/* Top Pentaprism Bump */}
      <Path d="M13 8 L15 6 H21 L23 8 Z" fill={COLORS.red700} />

      {/* Camera Face Plate */}
      <Rect x="5" y="8" width="26" height="21" rx="5" fill={COLORS.red600} />

      {/* Shutter Button (Right Top) */}
      <Rect x="23" y="6.5" width="4" height="2" rx="1" fill={COLORS.red300} />
      {/* Sensor Dot (Left) */}
      <Circle cx="9.5" cy="12" r="1.5" fill={COLORS.red100} />

      {/* Outer Lens Barrel */}
      <Circle cx="18" cy="18.5" r="7.5" fill={COLORS.red900} />
      {/* Middle Aperture Ring */}
      <Circle cx="18" cy="18.5" r="5.5" fill={COLORS.red500} />
      {/* Center Glint */}
      <Circle cx="18" cy="18.5" r="2.5" fill={COLORS.red100} />
      <Circle cx="19" cy="17.5" r="0.8" fill={COLORS.pure_white} />
    </Svg>
  )
}

export default FlatLogoMark
