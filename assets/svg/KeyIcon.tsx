import React from 'react'
import Svg, { Path, Circle } from 'react-native-svg'
import { COLORS } from '../../src/constants/colors'

interface Props {
  size?: number
  color?: string
}

export function KeyIcon({ size = 24, color = COLORS.red500 }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* Key Bow (Ring) */}
      <Circle cx="8" cy="12" r="5" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <Circle cx="8" cy="12" r="2" fill={color} />
      {/* Key Shaft */}
      <Path d="M13 12 H 21" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {/* Key Bits */}
      <Path d="M18 12 V 15.5" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <Path d="M21 12 V 14.5" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </Svg>
  )
}

export default KeyIcon
