/**
 * JoinArt.tsx
 *
 * Animated SVG header art for the Join Room screen.
 * Theme: Cute mini polaroid portraits floating gently with subtle tilts and sparkles.
 * Compact / sort of small layout (150×120 box) that sits cleanly in the hero.
 *
 * pointer-events none · reduce-motion aware
 */

import React, { useEffect, useRef } from 'react'
import { Animated, AccessibilityInfo } from 'react-native'
import Svg, { G, Circle, Rect, Path, Polygon, Ellipse } from 'react-native-svg'

const AnimatedG = Animated.createAnimatedComponent(G as any)

/* ─── colours ─────────────────────────────────────────────────────────── */
const WHITE = '#FFFFFF'
const GOLD  = '#FFD700'

export function JoinArt() {
  const floatY1 = useRef(new Animated.Value(0)).current
  const floatY2 = useRef(new Animated.Value(0)).current
  const sparkle = useRef(new Animated.Value(0.4)).current

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then((reduceMotion) => {
      if (reduceMotion) return

      // Card 1 gentle vertical float
      Animated.loop(
        Animated.sequence([
          Animated.timing(floatY1, {
            toValue: -5,
            duration: 1600,
            useNativeDriver: true,
          }),
          Animated.timing(floatY1, {
            toValue: 0,
            duration: 1600,
            useNativeDriver: true,
          }),
        ])
      ).start()

      // Card 2 gentle float with slight offset
      Animated.loop(
        Animated.sequence([
          Animated.timing(floatY2, {
            toValue: 4,
            duration: 1800,
            useNativeDriver: true,
          }),
          Animated.timing(floatY2, {
            toValue: -2,
            duration: 1800,
            useNativeDriver: true,
          }),
        ])
      ).start()

      // Sparkles twinkle loop
      Animated.loop(
        Animated.sequence([
          Animated.timing(sparkle, {
            toValue: 1,
            duration: 900,
            useNativeDriver: true,
          }),
          Animated.timing(sparkle, {
            toValue: 0.3,
            duration: 900,
            useNativeDriver: true,
          }),
        ])
      ).start()
    })
  }, [])

  return (
    <Svg
      width={150}
      height={120}
      viewBox="0 0 150 120"
      pointerEvents="none"
    >
      {/* ── Twinkling background sparkles ── */}
      <AnimatedG style={{ opacity: sparkle }}>
        {/* Star 1 (top right) */}
        <Path
          d="M 134 32 Q 134 36 138 36 Q 134 36 134 40 Q 134 36 130 36 Q 134 36 134 32 Z"
          fill={GOLD}
        />
        {/* Star 2 (top middle) */}
        <Path
          d="M 80 18 Q 80 21 83 21 Q 80 21 80 24 Q 80 21 77 21 Q 80 21 80 18 Z"
          fill={WHITE}
          opacity={0.8}
        />
        {/* Star 3 (left bottom) */}
        <Circle cx={28} cy={52} r={1.5} fill={WHITE} opacity={0.6} />
      </AnimatedG>

      {/* ── Portrait 1 (Back card, tilted -8°, warm sunny character) ── */}
      <AnimatedG
        origin="46, 60"
        rotation={-8}
        style={{ transform: [{ translateY: floatY1 }] }}
      >
        {/* Card shadow */}
        <Rect x={26} y={35} width={42} height={52} rx={3} fill="#000" opacity={0.22} />

        {/* White Polaroid frame */}
        <Rect x={25} y={33} width={42} height={52} rx={3} fill={WHITE} />

        {/* Photo viewport (peach/amber bg) */}
        <Rect x={28} y={36} width={36} height={38} rx={2} fill="#FFE0B2" />

        {/* ── Mini Portrait: Cute Cat Character ── */}
        {/* Body */}
        <Ellipse cx={46} cy={70} rx={11} ry={7} fill="#26A69A" />
        {/* Head */}
        <Circle cx={46} cy={56} r={9.5} fill="#FB8C00" />
        {/* Pointy ears */}
        <Polygon points="39,48 37,42 43,47" fill="#FB8C00" />
        <Polygon points="53,48 55,42 49,47" fill="#FB8C00" />
        <Polygon points="39.5,47.5 38,43.5 42,47" fill="#FFCCBC" />
        <Polygon points="52.5,47.5 54,43.5 50,47" fill="#FFCCBC" />
        {/* Eyes & Shine */}
        <Circle cx={43} cy={55} r={1.3} fill="#263238" />
        <Circle cx={49} cy={55} r={1.3} fill="#263238" />
        <Circle cx={43.4} cy={54.6} r={0.5} fill={WHITE} />
        <Circle cx={49.4} cy={54.6} r={0.5} fill={WHITE} />
        {/* Blush cheeks */}
        <Circle cx={40.5} cy={58} r={1.3} fill="#FF8A65" opacity={0.7} />
        <Circle cx={51.5} cy={58} r={1.3} fill="#FF8A65" opacity={0.7} />
        {/* Nose & Smile */}
        <Polygon points="46,57 45,58 47,58" fill="#D84315" />
        <Path d="M 44.5 59 Q 46 60.5 47.5 59" stroke="#BF360C" strokeWidth={0.8} fill="none" strokeLinecap="round" />

        {/* Bottom color swatch dot on polaroid */}
        <Circle cx={46} cy={80} r={2.5} fill="#FB8C00" />
      </AnimatedG>

      {/* ── Portrait 2 (Front card, tilted +7°, cyan camera character) ── */}
      <AnimatedG
        origin="90, 62"
        rotation={7}
        style={{ transform: [{ translateY: floatY2 }] }}
      >
        {/* Card shadow */}
        <Rect x={68} y={35} width={45} height={56} rx={3.5} fill="#000" opacity={0.28} />

        {/* White Polaroid frame */}
        <Rect x={66} y={33} width={45} height={56} rx={3.5} fill={WHITE} />

        {/* Photo viewport (sky cyan bg) */}
        <Rect x={69.5} y={36.5} width={38} height={40} rx={2} fill="#B3E5FC" />

        {/* ── Mini Portrait: Cheerful Camera Avatar ── */}
        {/* Shoulders */}
        <Ellipse cx={88.5} cy={72} rx={12} ry={6} fill="#FFD54F" />
        {/* Camera body */}
        <Rect x={78.5} y={48} width={20} height={16} rx={3.5} fill="#0288D1" />
        {/* Camera top viewfinder */}
        <Rect x={84.5} y={45} width={8} height={3.5} rx={1.5} fill="#01579B" />
        <Circle cx={94} cy={46.5} r={1} fill="#FF5252" />
        {/* Camera lens outer */}
        <Circle cx={88.5} cy={56} r={5.5} fill="#01579B" />
        {/* Camera lens glass */}
        <Circle cx={88.5} cy={56} r={3.8} fill={WHITE} />
        {/* Lens reflection & pupil */}
        <Circle cx={88.5} cy={56} r={2} fill="#0288D1" />
        <Circle cx={89.5} cy={55} r={0.8} fill={WHITE} />
        {/* Cute happy smile below lens */}
        <Path d="M 86 61 Q 88.5 62.8 91 61" stroke={WHITE} strokeWidth={0.9} fill="none" strokeLinecap="round" />

        {/* Bottom color swatch dot on polaroid */}
        <Circle cx={88.5} cy={83} r={2.5} fill="#0288D1" />
      </AnimatedG>

      {/* Little floating heart/sparkle near the front card */}
      <AnimatedG style={{ opacity: sparkle, transform: [{ translateY: floatY2 }] }}>
        <Path
          d="M 116 38 C 116 36 113 34 111 36 C 109 34 106 36 106 38 C 106 41 111 44 111 44 C 111 44 116 41 116 38 Z"
          fill="#FF4081"
          opacity={0.85}
        />
      </AnimatedG>
    </Svg>
  )
}
