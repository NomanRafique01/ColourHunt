import React from 'react'
import Svg, { Circle, Line, Path } from 'react-native-svg'
import { COLORS } from '../../src/constants/colors'

interface Props {
  size?: number
  color?: string
}

export function StopwatchIcon({ size = 24, color = COLORS.red500 }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* Top Stem & Pusher Button */}
      <Line x1="12" y1="2" x2="12" y2="5" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <Line x1="9" y1="2" x2="15" y2="2" stroke={color} strokeWidth="2" strokeLinecap="round" />
      {/* Angled Side Lap Button */}
      <Line x1="18.5" y1="4.5" x2="16.5" y2="6.5" stroke={color} strokeWidth="2" strokeLinecap="round" />

      {/* Main Dial Body */}
      <Circle cx="12" cy="13.5" r="7.5" stroke={color} strokeWidth="2" strokeLinecap="round" />

      {/* Center Pivot & Stopwatch Needle pointing up/right */}
      <Circle cx="12" cy="13.5" r="1.2" fill={color} />
      <Line x1="12" y1="13.5" x2="14.5" y2="10.5" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </Svg>
  )
}

export default StopwatchIcon
