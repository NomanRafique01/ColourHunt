/**
 * LobbyArt.tsx
 *
 * Animated SVG header art for the Room Lobby screen.
 *
 * Props:
 *   joined — number of players currently in the room (1–4)
 *             Joined pins are solid; empty pins show as faint ghosts.
 *
 * Theme: four map-pin avatars arranged in an arc.
 * Pins that have joined pop in with a spring; ghost pins pulsate faintly.
 *
 * Box: 150×120 dp  ·  pointer-events none  ·  reduce-motion aware
 */

import React, { useEffect, useRef } from 'react'
import { Animated, AccessibilityInfo } from 'react-native'
import Svg, { G, Circle, Path, Ellipse } from 'react-native-svg'

// Animated wrappers for SVG primitives
const AnimatedG      = Animated.createAnimatedComponent(G as any)
const AnimatedCircle = Animated.createAnimatedComponent(Circle as any)

/* ─── 4 distinctly different, high-contrast pin colours ─────────────────── */
const PIN_COLORS = [
  { solid: '#FFD000', ghost: 'rgba(255, 208, 0, 0.25)',  stroke: '#FFD000' }, // P1: Sunny Gold / Yellow (Host)
  { solid: '#00D2FF', ghost: 'rgba(0, 210, 255, 0.25)',  stroke: '#00D2FF' }, // P2: Electric Cyan / Sky Blue
  { solid: '#00E676', ghost: 'rgba(0, 230, 118, 0.25)',  stroke: '#00E676' }, // P3: Neon Emerald Green
  { solid: '#E056FD', ghost: 'rgba(224, 86, 253, 0.25)', stroke: '#E056FD' }, // P4: Vivid Orchid Purple
]
const WHITE = '#FFFFFF'

/* ─── pin positions (150×120 viewBox) ── */
const PINS = [
  { cx: 42,  cy: 55 },
  { cx: 70,  cy: 42 },
  { cx: 98,  cy: 55 },
  { cx: 118, cy: 78 },
]

/* ─── Pin component ─────────────────────────────────────────────────────── */

function Pin({
  cx,
  cy,
  color,
  ghost,
  joined,
  index,
  reduceMotion,
}: {
  cx: number
  cy: number
  color: string
  ghost: string
  joined: boolean
  index: number
  reduceMotion: boolean
}) {
  const scale   = useRef(new Animated.Value(joined ? 1 : 0.85)).current
  const opacity = useRef(new Animated.Value(joined ? 1 : 0.55)).current

  // Ghost pulse
  useEffect(() => {
    if (joined || reduceMotion) return
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.85, duration: 800, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.35, duration: 800, useNativeDriver: true }),
      ])
    )
    loop.start()
    return () => loop.stop()
  }, [joined, reduceMotion])

  // Pop-in when joined changes true
  const prevJoined = useRef(joined)
  useEffect(() => {
    if (joined && !prevJoined.current && !reduceMotion) {
      // Spring-like overshoot: 0.82 → 1.25 → 1
      scale.setValue(0.82)
      opacity.setValue(0.45)
      Animated.sequence([
        Animated.parallel([
          Animated.timing(scale,   { toValue: 1.25, duration: 250, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 1,    duration: 200, useNativeDriver: true }),
        ]),
        Animated.timing(scale, { toValue: 1, duration: 180, useNativeDriver: true }),
      ]).start()
    }
    prevJoined.current = joined
  }, [joined, reduceMotion])

  // Pin geometry: unified seamless teardrop pin path
  const pinR  = 9
  const pinCy = cy - 4
  const tipY  = pinCy + 20

  const pinPath = `M ${cx} ${tipY} L ${cx - 7} ${pinCy + 5} A ${pinR} ${pinR} 0 1 1 ${cx + 7} ${pinCy + 5} Z`

  return (
    <AnimatedG
      origin={`${cx}, ${tipY}`}
      style={{ transform: [{ scale }], opacity }}
    >
      {/* Drop shadow below tip */}
      <Ellipse
        cx={cx}
        cy={tipY + 2.5}
        rx={5}
        ry={1.8}
        fill="#000"
        opacity={joined ? 0.25 : 0.08}
      />

      {/* Pin Body & Tip */}
      {joined ? (
        <>
          <Path
            d={pinPath}
            fill={color}
          />
          {/* Inner avatar dot */}
          <Circle cx={cx} cy={pinCy} r={3.5} fill={WHITE} opacity={0.92} />
        </>
      ) : (
        <>
          <Path
            d={pinPath}
            fill="rgba(255, 255, 255, 0.14)"
            stroke={color}
            strokeWidth={1.5}
            strokeDasharray="3 2.5"
          />
          {/* Waiting slot dot in player's accent color */}
          <Circle cx={cx} cy={pinCy} r={2.5} fill={color} opacity={0.85} />
        </>
      )}
    </AnimatedG>
  )
}

/* ─── LobbyArt ───────────────────────────────────────────────────────── */

export function LobbyArt({ joined }: { joined: number }) {
  const safeJoined = Math.max(1, Math.min(4, joined))
  const [reduceMotion, setReduceMotion] = React.useState(false)

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion)
  }, [])

  return (
    <Svg
      width={150}
      height={120}
      viewBox="0 0 150 120"
      pointerEvents="none"
    >
      {/* Ground line */}
      <Path
        d="M20 108 Q75 100 130 108"
        stroke={WHITE}
        strokeWidth={1.5}
        strokeLinecap="round"
        fill="none"
        opacity={0.18}
      />

      {/* Render pins back-to-front for correct z-order */}
      {[...PINS].reverse().map((p, revIdx) => {
        const i = PINS.length - 1 - revIdx
        return (
          <Pin
            key={i}
            cx={p.cx}
            cy={p.cy}
            color={PIN_COLORS[i].solid}
            ghost={PIN_COLORS[i].ghost}
            joined={i < safeJoined}
            index={i}
            reduceMotion={reduceMotion}
          />
        )
      })}

      {/* Decorative small dots */}
      <Circle cx={28}  cy={98} r={2}   fill={WHITE} opacity={0.18} />
      <Circle cx={132} cy={58} r={1.5} fill={WHITE} opacity={0.15} />
      <Circle cx={22}  cy={68} r={1.5} fill={WHITE} opacity={0.15} />
    </Svg>
  )
}

