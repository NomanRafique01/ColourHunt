import React from 'react'
import Svg, { Rect, Circle, Line, Path } from 'react-native-svg'
import { COLORS } from '../../src/constants/colors'

interface Props {
  width?: number
  height?: number
}

export default function EmptyPolaroid({ width = 100, height = 120 }: Props) {
  return (
    <Svg width={width} height={height} viewBox="0 0 100 120" fill="none">
      {/* Outer Polaroid Body */}
      <Rect
        x="2"
        y="2"
        width="96"
        height="116"
        rx="8"
        fill={COLORS.pure_white}
        stroke={COLORS.red200}
        strokeWidth="2"
      />

      {/* Photo Frame Area */}
      <Rect
        x="10"
        y="10"
        width="80"
        height="74"
        rx="6"
        fill={COLORS.red100}
      />

      {/* Empty Search / Magnifying Glass in Photo Area */}
      <Circle
        cx="46"
        cy="44"
        r="14"
        stroke={COLORS.red500}
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <Line
        x1="56"
        y1="54"
        x2="68"
        y2="66"
        stroke={COLORS.red500}
        strokeWidth="3"
        strokeLinecap="round"
      />

      {/* Ghost Dashed Line Below */}
      <Line
        x1="22"
        y1="98"
        x2="78"
        y2="98"
        stroke={COLORS.red300}
        strokeWidth="2"
        strokeDasharray="4 3"
        strokeLinecap="round"
      />
    </Svg>
  )
}
