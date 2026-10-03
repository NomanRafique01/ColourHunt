import React from 'react'
import Svg, { Circle, Polygon, Line } from 'react-native-svg'
import { COLORS } from '../../src/constants/colors'

interface Props {
  size?: number
  color?: string
}

export function CompassIcon({ size = 24, color = COLORS.red500 }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* Outer Dial */}
      <Circle cx="12" cy="12" r="8.5" stroke={color} strokeWidth="2" strokeLinecap="round" />

      {/* Cardinal Axis Ticks */}
      <Line x1="12" y1="4.5" x2="12" y2="6" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <Line x1="12" y1="18" x2="12" y2="19.5" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <Line x1="4.5" y1="12" x2="6" y2="12" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <Line x1="18" y1="12" x2="19.5" y2="12" stroke={color} strokeWidth="2" strokeLinecap="round" />

      {/* Compass Needle (North Filled, South Inset) */}
      <Polygon points="12,7.5 14.5,12 12,11 9.5,12" fill={color} />
      <Polygon points="12,16.5 14.5,12 12,13 9.5,12" stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
    </Svg>
  )
}

export default CompassIcon
