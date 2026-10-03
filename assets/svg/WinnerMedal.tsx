import React from 'react'
import Svg, { Circle, Path, Polygon } from 'react-native-svg'
import { COLORS } from '../../src/constants/colors'

interface Props {
  size?: number
}

export default function WinnerMedal({ size = 48 }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      {/* V-Ribbon Left */}
      <Path d="M16 6 L24 22 L14 26 L8 10 Z" fill={COLORS.red400} />
      {/* V-Ribbon Right */}
      <Path d="M32 6 L24 22 L34 26 L40 10 Z" fill={COLORS.red700} />

      {/* Main Medal Rim */}
      <Circle cx="24" cy="28" r="14" fill={COLORS.red500} stroke={COLORS.red700} strokeWidth="2" />
      {/* Inner Inset */}
      <Circle cx="24" cy="28" r="10" fill={COLORS.red100} />

      {/* Flat Star in Medal Center */}
      <Polygon
        points="24,21 26,25.5 31,26 27,29.5 28.5,34 24,31.5 19.5,34 21,29.5 17,26 22,25.5"
        fill={COLORS.red600}
      />
    </Svg>
  )
}
