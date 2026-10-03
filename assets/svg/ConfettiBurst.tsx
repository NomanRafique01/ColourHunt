import React from 'react'
import Svg, { Circle, Rect, Path } from 'react-native-svg'
import { COLORS } from '../../src/constants/colors'

interface Props {
  size?: number
}

export default function ConfettiBurst({ size = 80 }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 80 80" fill="none">
      {/* Streamers & Ribbons */}
      <Path d="M40 28 L40 10" stroke={COLORS.red500} strokeWidth="2.5" strokeLinecap="round" />
      <Path d="M40 52 L40 70" stroke={COLORS.red700} strokeWidth="2.5" strokeLinecap="round" />
      <Path d="M28 40 L10 40" stroke={COLORS.red500} strokeWidth="2.5" strokeLinecap="round" />
      <Path d="M52 40 L70 40" stroke={COLORS.red700} strokeWidth="2.5" strokeLinecap="round" />

      {/* Diagonal Ribbons with slight curves */}
      <Path d="M31 31 L18 18" stroke={COLORS.red400} strokeWidth="2" strokeLinecap="round" />
      <Path d="M49 31 L62 18" stroke={COLORS.red600} strokeWidth="2" strokeLinecap="round" />
      <Path d="M31 49 L18 62" stroke={COLORS.red600} strokeWidth="2" strokeLinecap="round" />
      <Path d="M49 49 L62 62" stroke={COLORS.red400} strokeWidth="2" strokeLinecap="round" />

      {/* Floating Confetti Squares / Rectangles in Red Shades */}
      <Rect x="24" y="16" width="5" height="5" rx="1.5" fill={COLORS.red300} transform="rotate(25 24 16)" />
      <Rect x="54" y="22" width="6" height="4" rx="1.5" fill={COLORS.red500} transform="rotate(-30 54 22)" />
      <Rect x="16" y="52" width="5" height="5" rx="1.5" fill={COLORS.red700} transform="rotate(45 16 52)" />
      <Rect x="58" y="50" width="5" height="4" rx="1.5" fill={COLORS.red400} transform="rotate(15 58 50)" />
      <Rect x="36" y="6" width="4" height="4" rx="1" fill={COLORS.red600} />
      <Rect x="36" y="70" width="4" height="4" rx="1" fill={COLORS.red300} />

      {/* Confetti Circles / Sparkles */}
      <Circle cx="26" cy="38" r="2.5" fill={COLORS.red500} />
      <Circle cx="54" cy="36" r="2.5" fill={COLORS.red700} />
      <Circle cx="38" cy="22" r="2" fill={COLORS.red300} />
      <Circle cx="44" cy="58" r="2" fill={COLORS.red500} />
      <Circle cx="40" cy="40" r="4" fill={COLORS.red500} />
    </Svg>
  )
}
