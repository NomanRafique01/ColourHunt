import React from 'react'
import Svg, { Path, Circle } from 'react-native-svg'
import { COLORS } from '../../src/constants/colors'

interface Props {
  size?: number
  color?: string
}

export function RoundCounterIcon({ size = 24, color = COLORS.red500 }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* Curved Cycle / Round Arc Arrow */}
      <Path
        d="M20 12 A8 8 0 1 1 18 6.5"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* Arrow head */}
      <Path
        d="M18 3.5 V 7 H 21.5"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Center Target Dot or Number Indicator */}
      <Circle cx="12" cy="12" r="2.5" fill={color} />
    </Svg>
  )
}

export default RoundCounterIcon
