import React from 'react'
import Svg, { Circle, Line } from 'react-native-svg'
import { COLORS } from '../../src/constants/colors'

interface Props {
  size?: number
  color?: string
}

export function ShareIcon({ size = 20, color = COLORS.pure_white }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      {/* 3 Nodes */}
      <Circle cx="15" cy="5" r="2.5" stroke={color} strokeWidth="1.8" />
      <Circle cx="5" cy="10" r="2.5" stroke={color} strokeWidth="1.8" />
      <Circle cx="15" cy="15" r="2.5" stroke={color} strokeWidth="1.8" />

      {/* Connecting Branches */}
      <Line x1="7.2" y1="8.9" x2="12.8" y2="6.1" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
      <Line x1="7.2" y1="11.1" x2="12.8" y2="13.9" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    </Svg>
  )
}

export default ShareIcon
