import React from 'react'
import Svg, { Circle, Line } from 'react-native-svg'
import { COLORS } from '../../src/constants/colors'

interface Props {
  size?: number
  color?: string
  filled?: boolean
}

export default function MissedIcon({
  size = 24,
  color = COLORS.red600,
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
      <Line
        x1="8.5"
        y1="8.5"
        x2="15.5"
        y2="15.5"
        stroke={filled ? COLORS.pure_white : color}
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <Line
        x1="15.5"
        y1="8.5"
        x2="8.5"
        y2="15.5"
        stroke={filled ? COLORS.pure_white : color}
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </Svg>
  )
}
