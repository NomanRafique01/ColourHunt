import React from 'react'
import Svg, { Circle, Path } from 'react-native-svg'
import { COLORS } from '../../src/constants/colors'

interface Props {
  size?: number
  color?: string
}

export function CheckmarkStamp({ size = 48, color = COLORS.red500 }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      {/* Outer Stamp Ring with subtle dashed or double edge */}
      <Circle cx="24" cy="24" r="21" stroke={color} strokeWidth="2.5" />
      <Circle cx="24" cy="24" r="18" fill={COLORS.red100} />

      {/* Bold 2px/3px rounded stroke Checkmark */}
      <Path
        d="M15 24.5 L21.5 31 L33 18"
        stroke={color}
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  )
}

export default CheckmarkStamp

