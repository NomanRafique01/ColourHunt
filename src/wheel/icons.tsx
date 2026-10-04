import React from 'react'
import Svg, { Path, Circle, G } from 'react-native-svg'

interface IconProps {
  size?: number
  color?: string
}

/**
 * SpinIcon — Circular dynamic spin / wheel arrow icon
 */
export function SpinIcon({ size = 22, color = '#FFFFFF' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* Dynamic curved rotating double-arrow representing spin */}
      <Path
        d="M21 12A9 9 0 0 0 6.46 5.64L4 8m0 0V3m0 5h5m-6 4a9 9 0 0 0 14.54 6.36L20 16m0 0v5m0-5h-5"
        stroke={color}
        strokeWidth="2.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  )
}

/**
 * LoaderIcon — Small subtle spinner / loader icon
 */
export function LoaderIcon({ size = 18, color = '#888888' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle
        cx="12"
        cy="12"
        r="9"
        stroke={color}
        strokeWidth="2.5"
        strokeOpacity="0.25"
      />
      <Path
        d="M12 3a9 9 0 0 1 9 9"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </Svg>
  )
}

export default SpinIcon
