/**
 * CreateArt.tsx
 *
 * Animated SVG header art for the Create Room screen.
 * Theme: a key / "room being built" — four coloured swatches fanning out of
 * a central palette, breathing gently.
 *
 * Box: 150×120 dp  ·  pointer-events none  ·  reduce-motion aware
 */

import React, { useEffect, useRef } from 'react'
import { Animated } from 'react-native'
import Svg, { G, Circle, Rect, Path, Ellipse } from 'react-native-svg'
import { AccessibilityInfo } from 'react-native'

// Animated wrappers for SVG primitives
const AnimatedG       = Animated.createAnimatedComponent(G as any)
const AnimatedCircle  = Animated.createAnimatedComponent(Circle as any)

/* ─── colours ─────────────────────────────────────────────────────────── */
const RED    = '#F0192D'
const BLUE   = '#2F6BFF'
const GREEN  = '#1FB35B'
const YELLOW = '#FFC93C'
const WHITE  = '#FFFFFF'

/* ─── CreateArt ──────────────────────────────────────────────────────── */

export function CreateArt() {
  const reduceMotionRef = useRef(false)

  // Four petal scale pulses, staggered
  const scales = [
    useRef(new Animated.Value(1)).current,
    useRef(new Animated.Value(1)).current,
    useRef(new Animated.Value(1)).current,
    useRef(new Animated.Value(1)).current,
  ]

  // Central glow pulse
  const glowOpacity = useRef(new Animated.Value(0.55)).current

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then((val) => {
      reduceMotionRef.current = val
      if (val) return

      // Staggered petal breathe
      scales.forEach((sv, i) => {
        Animated.loop(
          Animated.sequence([
            Animated.delay(i * 180),
            Animated.timing(sv, {
              toValue: 1.18,
              duration: 900,
              useNativeDriver: true,
            }),
            Animated.timing(sv, {
              toValue: 1,
              duration: 900,
              useNativeDriver: true,
            }),
          ])
        ).start()
      })

      // Central glow
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowOpacity, {
            toValue: 0.9,
            duration: 1200,
            useNativeDriver: true,
          }),
          Animated.timing(glowOpacity, {
            toValue: 0.45,
            duration: 1200,
            useNativeDriver: true,
          }),
        ])
      ).start()
    })
  }, [])

  const petals = [
    { color: RED,    x: 75,  y: 42,  rx: 18, ry: 10, angle: -40, scale: scales[0] },
    { color: BLUE,   x: 105, y: 60,  rx: 18, ry: 10, angle:  20, scale: scales[1] },
    { color: GREEN,  x: 75,  y: 88,  rx: 18, ry: 10, angle:  40, scale: scales[2] },
    { color: YELLOW, x: 45,  y: 60,  rx: 18, ry: 10, angle: -20, scale: scales[3] },
  ]

  return (
    <Svg
      width={150}
      height={120}
      viewBox="0 0 150 120"
      pointerEvents="none"
    >
      {/* ── Petals ── */}
      {petals.map((p, i) => (
        <AnimatedG
          key={i}
          origin={`${p.x}, ${p.y}`}
          rotation={p.angle}
          style={{ transform: [{ scale: p.scale }] }}
        >
          <Ellipse
            cx={p.x}
            cy={p.y}
            rx={p.rx}
            ry={p.ry}
            fill={p.color}
            opacity={0.82}
          />
        </AnimatedG>
      ))}

      {/* ── Central dot ── */}
      <AnimatedCircle
        cx={75}
        cy={64}
        r={10}
        fill={WHITE}
        opacity={glowOpacity}
      />
      <Circle cx={75} cy={64} r={6} fill={WHITE} opacity={0.95} />

      {/* ── Tiny plus mark ── */}
      <Rect x={72} y={61} width={6} height={1.8} rx={0.9} fill={RED} />
      <Rect x={74.1} y={59} width={1.8} height={6} rx={0.9} fill={RED} />

      {/* ── Dashed ring hint ── */}
      <Circle
        cx={75}
        cy={64}
        r={28}
        fill="none"
        stroke={WHITE}
        strokeWidth={1}
        strokeDasharray="4 5"
        opacity={0.25}
      />
    </Svg>
  )
}

