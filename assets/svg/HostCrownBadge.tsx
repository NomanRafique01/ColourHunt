import React from 'react'
import Svg, { Path, Circle } from 'react-native-svg'
import { COLORS } from '../../src/constants/colors'

interface Props {
  size?: number
  color?: string
}

export function HostCrownBadge({ size = 20, color = COLORS.red500 }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      {/* 3 Jewels / Pearls on crown peaks */}
      <Circle cx="3.5" cy="5.5" r="1.3" fill={color} />
      <Circle cx="10" cy="3.5" r="1.5" fill={color} />
      <Circle cx="16.5" cy="5.5" r="1.3" fill={color} />

      {/* Main Crown Body */}
      <Path
        d="M3.5 7 L5.5 15 H14.5 L16.5 7 L12.5 11 L10 5 L7.5 11 Z"
        fill={color}
        stroke={COLORS.red700}
        strokeWidth="1"
        strokeLinejoin="round"
      />

      {/* Crown Base Rim */}
      <Path
        d="M5 15 H15 V16.5 H5 Z"
        fill={COLORS.red700}
      />
    </Svg>
  )
}

export default HostCrownBadge
