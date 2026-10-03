import React from 'react'
import Svg, { Rect, Circle, Line, Path } from 'react-native-svg'
import { COLORS } from '../../src/constants/colors'

interface Props {
  width?: number
  height?: number
  tintColor?: string
}

export function PolaroidFrame({
  width = 120,
  height = 144,
  tintColor = COLORS.red500,
}: Props) {
  return (
    <Svg width={width} height={height} viewBox="0 0 120 144" fill="none">
      {/* Outer Polaroid Card with soft red stroke */}
      <Rect
        x="2"
        y="2"
        width="116"
        height="140"
        rx="10"
        fill={COLORS.pure_white}
        stroke={COLORS.red200}
        strokeWidth="2"
      />

      {/* Photo Frame Window */}
      <Rect
        x="12"
        y="12"
        width="96"
        height="88"
        rx="6"
        fill={COLORS.red100}
      />

      {/* Snapshot Graphic Inside: Camera Sun/Focus Accent */}
      <Circle cx="84" cy="30" r="8" fill={COLORS.red300} />
      <Path
        d="M20 84 L46 54 L68 76 L82 62 L100 84 Z"
        fill={tintColor}
      />

      {/* Bottom Label Placeholder Lines */}
      <Line x1="24" y1="116" x2="68" y2="116" stroke={COLORS.red300} strokeWidth="3" strokeLinecap="round" />
      <Line x1="24" y1="126" x2="48" y2="126" stroke={COLORS.red200} strokeWidth="2.5" strokeLinecap="round" />
    </Svg>
  )
}

export default PolaroidFrame

