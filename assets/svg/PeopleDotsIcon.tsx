import React from 'react'
import Svg, { Circle, Path } from 'react-native-svg'
import { COLORS } from '../../src/constants/colors'

interface Props {
  size?: number
  color?: string
}

export function PeopleDotsIcon({ size = 24, color = COLORS.red500 }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* Center Main Person */}
      <Circle cx="9" cy="7" r="3" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <Path
        d="M4 18 C 4 14.5 6.2 13 9 13 C 11.8 13 14 14.5 14 18"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      />

      {/* Secondary Person / Dots to the Right */}
      <Circle cx="17" cy="8.5" r="2.2" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
      <Path
        d="M15 14 C 16.2 13.8 17.5 14.2 18.5 15.2 C 19.2 15.9 19.5 17 19.5 18"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </Svg>
  )
}

export default PeopleDotsIcon
