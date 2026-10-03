import React from 'react'
import Svg, { Line, Circle } from 'react-native-svg'
import { COLORS } from '../../src/constants/colors'

interface Props {
  size?: number
  color?: string
}

export function SlidersIcon({ size = 24, color = COLORS.red500 }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* Track 1 */}
      <Line x1="4" y1="6" x2="20" y2="6" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <Circle cx="9" cy="6" r="2.5" fill={COLORS.pure_white} stroke={color} strokeWidth="2" />

      {/* Track 2 */}
      <Line x1="4" y1="12" x2="20" y2="12" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <Circle cx="15" cy="12" r="2.5" fill={COLORS.pure_white} stroke={color} strokeWidth="2" />

      {/* Track 3 */}
      <Line x1="4" y1="18" x2="20" y2="18" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <Circle cx="8" cy="18" r="2.5" fill={COLORS.pure_white} stroke={color} strokeWidth="2" />
    </Svg>
  )
}

export default SlidersIcon
