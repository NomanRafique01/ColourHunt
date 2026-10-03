import React from 'react'
import Svg, { Path, Circle, Line } from 'react-native-svg'
import { COLORS } from '../../src/constants/colors'

interface Props {
  size?: number
  color?: string
  opacity?: number
}

export function ViewfinderScanFrame({
  size = 64,
  color = COLORS.red500,
  opacity = 1,
}: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64" fill="none" opacity={opacity}>
      {/* 4 Corner Viewfinder Brackets with 2px rounded stroke */}
      <Path d="M4 18 V 6 C 4 4.89 4.89 4 6 4 H 18" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M60 18 V 6 C 60 4.89 59.11 4 58 4 H 46" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M4 46 V 58 C 4 59.11 4.89 60 6 60 H 18" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M60 46 V 58 C 60 59.11 59.11 60 58 60 H 46" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

      {/* Center Target Crosshairs */}
      <Line x1="32" y1="22" x2="32" y2="28" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <Line x1="32" y1="36" x2="32" y2="42" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <Line x1="22" y1="32" x2="28" y2="32" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <Line x1="36" y1="32" x2="42" y2="32" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <Circle cx="32" cy="32" r="2.5" fill={color} />
    </Svg>
  )
}

export default ViewfinderScanFrame

