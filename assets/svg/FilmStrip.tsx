import React from 'react'
import Svg, { Rect, Circle, Line } from 'react-native-svg'
import { COLORS } from '../../src/constants/colors'

interface Props {
  width?: number
  height?: number
}

export default function FilmStrip({ width = 120, height = 72 }: Props) {
  return (
    <Svg width={width} height={height} viewBox="0 0 120 72" fill="none">
      {/* Outer Film Strip Body */}
      <Rect x="2" y="4" width="116" height="64" rx="8" fill={COLORS.red700} stroke={COLORS.red800} strokeWidth="2" />

      {/* Top Sprocket Holes */}
      <Rect x="12" y="8" width="8" height="6" rx="2" fill={COLORS.red100} />
      <Rect x="28" y="8" width="8" height="6" rx="2" fill={COLORS.red100} />
      <Rect x="44" y="8" width="8" height="6" rx="2" fill={COLORS.red100} />
      <Rect x="60" y="8" width="8" height="6" rx="2" fill={COLORS.red100} />
      <Rect x="76" y="8" width="8" height="6" rx="2" fill={COLORS.red100} />
      <Rect x="92" y="8" width="8" height="6" rx="2" fill={COLORS.red100} />

      {/* Middle Exposure Frames (Empty Frames) */}
      <Rect x="12" y="18" width="44" height="36" rx="4" fill={COLORS.red100} stroke={COLORS.red500} strokeWidth="1.5" />
      <Circle cx="34" cy="36" r="6" stroke={COLORS.red300} strokeWidth="1.5" strokeDasharray="2 2" />

      <Rect x="64" y="18" width="44" height="36" rx="4" fill={COLORS.red100} stroke={COLORS.red500} strokeWidth="1.5" />
      <Circle cx="86" cy="36" r="6" stroke={COLORS.red300} strokeWidth="1.5" strokeDasharray="2 2" />

      {/* Bottom Sprocket Holes */}
      <Rect x="12" y="58" width="8" height="6" rx="2" fill={COLORS.red100} />
      <Rect x="28" y="58" width="8" height="6" rx="2" fill={COLORS.red100} />
      <Rect x="44" y="58" width="8" height="6" rx="2" fill={COLORS.red100} />
      <Rect x="60" y="58" width="8" height="6" rx="2" fill={COLORS.red100} />
      <Rect x="76" y="58" width="8" height="6" rx="2" fill={COLORS.red100} />
      <Rect x="92" y="58" width="8" height="6" rx="2" fill={COLORS.red100} />
    </Svg>
  )
}
