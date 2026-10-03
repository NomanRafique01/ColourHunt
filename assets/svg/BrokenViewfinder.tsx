import React from 'react'
import Svg, { Path, Circle, Line } from 'react-native-svg'
import { COLORS } from '../../src/constants/colors'

interface Props {
  size?: number
}

export default function BrokenViewfinder({ size = 56 }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 56 56" fill="none">
      {/* Broken Viewfinder Brackets */}
      {/* Top Left */}
      <Path d="M6 18 V 8 C 6 6.89 6.89 6 8 6 H 18" stroke={COLORS.red600} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {/* Top Right (Offset to show broken frame) */}
      <Path d="M50 16 V 8 C 50 6.89 49.11 6 48 6 H 38" stroke={COLORS.red400} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {/* Bottom Left */}
      <Path d="M6 38 V 48 C 6 49.11 6.89 50 8 50 H 18" stroke={COLORS.red400} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {/* Bottom Right */}
      <Path d="M50 40 V 48 C 50 49.11 49.11 50 48 50 H 38" stroke={COLORS.red600} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

      {/* Lightning / Crack Down the Lens Center */}
      <Path
        d="M26 12 L32 24 L22 32 L30 44"
        stroke={COLORS.red700}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Warning Exclamation Mark */}
      <Line x1="42" y1="24" x2="42" y2="33" stroke={COLORS.red500} strokeWidth="3" strokeLinecap="round" />
      <Circle cx="42" cy="38" r="1.8" fill={COLORS.red500} />
    </Svg>
  )
}
