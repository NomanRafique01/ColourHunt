import React from 'react'
import Svg, { Rect, Path, Circle } from 'react-native-svg'
import { COLORS } from '../../src/constants/colors'

interface Props {
  width?: number
  height?: number
  targetColor?: string
  frameColor?: string
}

export default function TargetColorCard({
  width = 160,
  height = 160,
  targetColor = COLORS.red500,
  frameColor = COLORS.red700,
}: Props) {
  return (
    <Svg width={width} height={height} viewBox="0 0 160 160" fill="none">
      {/* Background soft card */}
      <Rect x="4" y="4" width="152" height="152" rx="16" fill={COLORS.pure_white} stroke={COLORS.red200} strokeWidth="1.5" />

      {/* Viewfinder Corner Brackets */}
      {/* Top Left */}
      <Path d="M16 36 V 20 C 16 17.8 17.8 16 20 16 H 36" stroke={frameColor} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      {/* Top Right */}
      <Path d="M144 36 V 20 C 144 17.8 142.2 16 140 16 H 124" stroke={frameColor} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      {/* Bottom Left */}
      <Path d="M16 124 V 140 C 16 142.2 17.8 144 20 144 H 36" stroke={frameColor} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      {/* Bottom Right */}
      <Path d="M144 124 V 140 C 144 142.2 142.2 144 140 144 H 124" stroke={frameColor} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

      {/* Big Color Swatch in Center */}
      <Rect
        x="32"
        y="32"
        width="96"
        height="96"
        rx="16"
        fill={targetColor}
        stroke={COLORS.pure_white}
        strokeWidth="3"
      />

      {/* Center Target Reticle */}
      <Circle cx="80" cy="80" r="16" stroke={COLORS.pure_white} strokeWidth="2" strokeDasharray="4 3" opacity={0.8} />
      <Circle cx="80" cy="80" r="4" fill={COLORS.pure_white} opacity={0.9} />
    </Svg>
  )
}
