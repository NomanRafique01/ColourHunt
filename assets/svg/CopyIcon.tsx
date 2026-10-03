import React from 'react'
import Svg, { Rect, Path } from 'react-native-svg'
import { COLORS } from '../../src/constants/colors'

interface Props {
  size?: number
  color?: string
}

export function CopyIcon({ size = 20, color = COLORS.red700 }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      {/* Front Document Box */}
      <Rect
        x="6"
        y="6"
        width="10"
        height="11"
        rx="2"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Back Document Corner L-Shape */}
      <Path
        d="M4 14 H3 C 2.45 14 2 13.55 2 13 V 3 C 2 2.45 2.45 2 3 2 H 12 C 12.55 2 13 2.45 13 3 V 4"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  )
}

export default CopyIcon
