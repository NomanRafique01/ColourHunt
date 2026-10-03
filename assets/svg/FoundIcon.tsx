import React from 'react'
import Svg, { Circle, Path } from 'react-native-svg'
import { COLORS } from '../../src/constants/colors'

interface Props {
  size?: number
  color?: string
  filled?: boolean
}

export default function FoundIcon({
  size = 24,
  color = COLORS.red500,
  filled = false,
}: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle
        cx="12"
        cy="12"
        r="9"
        fill={filled ? color : COLORS.red100}
        stroke={color}
        strokeWidth="2"
      />
      <Path
        d="M7.5 12 L10.5 15 L16.5 9"
        stroke={filled ? COLORS.pure_white : color}
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  )
}
