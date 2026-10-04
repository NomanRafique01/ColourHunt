import React from 'react'
import Svg, { Circle, Path } from 'react-native-svg'

// ── 8-colour spectrum (pie slices, 45° each) ─────────────────────────────────
const SPECTRUM = [
  '#FF2D2D', // red      0°–45°
  '#FF8C00', // orange  45°–90°
  '#FFE000', // yellow  90°–135°
  '#7FFF00', // lime   135°–180°
  '#00CC55', // green  180°–225°
  '#00D4FF', // cyan   225°–270°
  '#3B5BFF', // blue   270°–315°
  '#9B30FF', // violet 315°–360°
]

function slicePath(
  cx: number,
  cy: number,
  r: number,
  startDeg: number,
  endDeg: number
): string {
  const toRad = (d: number) => (d * Math.PI) / 180
  const x1 = cx + r * Math.sin(toRad(startDeg))
  const y1 = cy - r * Math.cos(toRad(startDeg))
  const x2 = cx + r * Math.sin(toRad(endDeg))
  const y2 = cy - r * Math.cos(toRad(endDeg))
  return `M${cx} ${cy} L${x1} ${y1} A${r} ${r} 0 0 1 ${x2} ${y2} Z`
}

interface Props {
  size?: number
}

/**
 * SpectrumLensLogo — ColourHunt signature spectrum lens icon mark.
 * Designed to sit cleanly inside the white header tile.
 */
export function SpectrumLensLogo({ size = 26 }: Props) {
  const cx = 16
  const cy = 16
  const spectrumR = 11

  return (
    <Svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      {/* Outer dark metal ring */}
      <Circle cx={cx} cy={cy} r={15.5} fill="#181820" stroke="#0D0D14" strokeWidth={1} />
      {/* Mid recessed ring */}
      <Circle cx={cx} cy={cy} r={13.5} fill="#2A2A38" />
      <Circle cx={cx} cy={cy} r={12} fill="#1A1A24" />

      {/* 8-colour spectrum ring */}
      {SPECTRUM.map((color, i) => (
        <Path
          key={i}
          d={slicePath(cx, cy, spectrumR, i * 45, (i + 1) * 45)}
          fill={color}
        />
      ))}

      {/* Dark central pupil */}
      <Circle cx={cx} cy={cy} r={5.2} fill="#0A0A12" />
      <Circle cx={cx} cy={cy} r={3} fill="#14141E" />

      {/* Glass curved highlight & glint */}
      <Path
        d="M9.5 13 A 7.5 7.5 0 0 1 14 8.5"
        stroke="rgba(255,255,255,0.75)"
        strokeWidth={1.4}
        strokeLinecap="round"
        fill="none"
      />
      <Circle cx={12} cy={12} r={0.9} fill="#FFFFFF" />
    </Svg>
  )
}

export default SpectrumLensLogo
