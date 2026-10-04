/**
 * ColourWheel.tsx
 *
 * Premium 12-segment colour wheel with idle rotation, active spin, and taken-slot
 * dimming. Features metallic rim rivets, dual-bezel ring, multi-layer glass/metal hub,
 * and a sculpted drop-shadowed indicator needle.
 *
 * Props
 * ─────
 * plan          SpinPlan from makeSpinPlan() (host) or the realtime channel
 *               (guest). null = idle/waiting state.
 * taken         Array of { index, color } — taken slices show a lighter tint;
 *               color is the avatar colour of the player who took that slot.
 * onDone        Called once the spin + settle delay completes.
 * canSpin       true = show "SPIN" hub label and accept taps. false = show "..."
 * hubLabel      Label string to display on the hub ('SPIN' or '...').
 * onSpinPress   Callback when the hub or the primary button is tapped.
 * reduceMotion  1.5s fade-snap, no wind-up.
 * size          Wheel diameter dp (default min(screenW × 0.88, 360)).
 */

import React, {
  useCallback,
  useEffect,
  useRef,
  memo,
  useMemo,
} from 'react'
import {
  View,
  Text,
  Animated,
  Easing,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from 'react-native'
import Svg, {
  G,
  Path,
  Circle,
  Defs,
  RadialGradient,
  LinearGradient,
  Stop,
  Rect,
} from 'react-native-svg'

import { WHEEL_COLOURS, SpinPlan } from './wheelLogic'

// ─── Constants ────────────────────────────────────────────────────────────────

const SCREEN_W      = Dimensions.get('window').width
const DEFAULT_SIZE  = Math.min(Math.round(SCREEN_W * 0.88), 360)
const SEGMENT_COUNT = WHEEL_COLOURS.length        // 12
const SLICE_ANGLE   = 360 / SEGMENT_COUNT          // 30°
const SPIN_MS       = 10000                        // exact 10 second spin
const REDUCE_MS     = 1500
const SETTLE_MS     = 400
const POINTER_H     = 26

// ─── Geometry helpers ────────────────────────────────────────────────────────

function polarToCartesian(r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180
  return { x: r * Math.cos(rad), y: r * Math.sin(rad) }
}

function slicePath(
  cx: number,
  cy: number,
  r: number,
  startAngle: number,
  endAngle: number,
): string {
  const s = polarToCartesian(r, startAngle)
  const e = polarToCartesian(r, endAngle)
  const largeArc = endAngle - startAngle > 180 ? 1 : 0
  return [
    `M ${cx} ${cy}`,
    `L ${cx + s.x} ${cy + s.y}`,
    `A ${r} ${r} 0 ${largeArc} 1 ${cx + e.x} ${cy + e.y}`,
    'Z',
  ].join(' ')
}

/** Dim a hex colour by blending it 60% toward white */
function dimColour(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  const blend = (c: number) => Math.round(c + (255 - c) * 0.6)
  return `rgb(${blend(r)},${blend(g)},${blend(b)})`
}

// ─── TakenSlot description ────────────────────────────────────────────────────

export interface TakenSlot {
  index: number   // index into WHEEL_COLOURS
  color: string   // avatar / player colour hex
}

// ─── Component ───────────────────────────────────────────────────────────────

interface ColourWheelProps {
  plan?:          SpinPlan | null
  taken?:         TakenSlot[]
  onDone?:        () => void
  canSpin?:       boolean
  hubLabel?:      string
  onSpinPress?:   () => void
  reduceMotion?:  boolean
  size?:          number
}

const ColourWheel = memo(function ColourWheel({
  plan          = null,
  taken         = [],
  onDone,
  canSpin       = false,
  hubLabel: propHubLabel,
  onSpinPress,
  reduceMotion  = false,
  size          = DEFAULT_SIZE,
}: ColourWheelProps) {
  const r      = size / 2
  const cx     = r
  const cy     = r
  const innerR = r * 0.23
  const pegR   = r - 6
  const takenMap = useMemo(() => {
    const map = new Map<number, string>()
    taken.forEach((t) => map.set(t.index, t.color))
    return map
  }, [taken])

  // ── Rotation: single Animated.Value shared for idle + spin ────────────────
  const rotation   = useRef(new Animated.Value(0)).current
  const hasSpun    = useRef(false)
  const idleAnim   = useRef<Animated.CompositeAnimation | null>(null)
  const spinActive = useRef(false)

  // Track current rotation as a plain number so idle can start from it
  const currentDeg = useRef(0)
  useEffect(() => {
    const id = rotation.addListener(({ value }) => { currentDeg.current = value })
    return () => rotation.removeListener(id)
  }, [])

  // ── Idle rotation (1 turn per 60s) ─────────────────────────────────────────
  const startIdle = useCallback(() => {
    if (spinActive.current) return
    const remaining = 360 - ((currentDeg.current % 360) + 360) % 360
    const durationMs = (remaining / 360) * 60_000

    const runLoop = () => {
      if (spinActive.current) return
      idleAnim.current = Animated.timing(rotation, {
        toValue: currentDeg.current + remaining,
        duration: durationMs,
        easing: Easing.linear,
        useNativeDriver: true,
      })
      idleAnim.current.start(({ finished }) => {
        if (!finished || spinActive.current) return
        rotation.setValue(0)
        currentDeg.current = 0
        idleAnim.current = Animated.loop(
          Animated.timing(rotation, {
            toValue: 360,
            duration: 60_000,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
        )
        idleAnim.current.start()
      })
    }
    runLoop()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const stopIdle = useCallback(() => {
    idleAnim.current?.stop()
    idleAnim.current = null
  }, [])

  // Start idle on mount; stop when a spin plan arrives
  useEffect(() => {
    if (!plan) {
      spinActive.current = false
      hasSpun.current    = false
      startIdle()
    } else {
      stopIdle()
      spinActive.current = true
    }
    return stopIdle
  }, [plan?.seed]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── 10-Second Spin Animation ──────────────────────────────────────────────
  useEffect(() => {
    if (!plan || hasSpun.current) return
    hasSpun.current = true

    const winnerMid  = plan.winnerIndex * SLICE_ANGLE + SLICE_ANGLE / 2
    // Calculate precise landing point with natural deceleration
    const spinTarget = currentDeg.current + plan.revolutionCount * 360 + (360 - (currentDeg.current % 360) - winnerMid + 360) % 360

    if (reduceMotion) {
      Animated.timing(rotation, {
        toValue: spinTarget,
        duration: REDUCE_MS,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start(() => { setTimeout(() => onDone?.(), SETTLE_MS) })
    } else {
      Animated.timing(rotation, {
        toValue: spinTarget,
        duration: SPIN_MS,
        easing: Easing.bezier(0.12, 0.0, 0.08, 1.0),
        useNativeDriver: true,
      }).start(() => { setTimeout(() => onDone?.(), SETTLE_MS) })
    }
  }, [plan?.seed]) // eslint-disable-line react-hooks/exhaustive-deps

  const spinDeg = rotation.interpolate({
    inputRange:  [-36_000, 36_000],
    outputRange: ['-36000deg', '36000deg'],
  })

  // ── Hub label & pulse ─────────────────────────────────────────────────────
  const hubText = propHubLabel ?? (plan ? '…' : canSpin ? 'SPIN' : '…')
  const hubPulse = useRef(new Animated.Value(1)).current

  useEffect(() => {
    if (!canSpin || plan || reduceMotion) {
      hubPulse.setValue(1)
      return
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(hubPulse, { toValue: 1.06, duration: 750, useNativeDriver: true }),
        Animated.timing(hubPulse, { toValue: 1.0,  duration: 750, useNativeDriver: true }),
      ])
    )
    loop.start()
    return () => loop.stop()
  }, [canSpin, plan, reduceMotion])

  return (
    <View
      style={[styles.container, { width: size + 8, height: size + POINTER_H + 10 }]}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      {/* ─── Premium Sculpted Top Pointer ────────────────────────────────── */}
      <View style={[styles.pointerWrap, { left: (size + 8) / 2 - 16 }]}>
        <Svg width={32} height={POINTER_H + 4} viewBox="0 0 32 30" fill="none">
          <Defs>
            <LinearGradient id="pointerMetal" x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0%" stopColor="#FFFFFF" />
              <Stop offset="45%" stopColor="#FAFAFA" />
              <Stop offset="85%" stopColor="#E2E2E2" />
              <Stop offset="100%" stopColor="#CCCCCC" />
            </LinearGradient>
            <LinearGradient id="pointerTip" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor="#E40C1A" />
              <Stop offset="100%" stopColor="#B3000F" />
            </LinearGradient>
            <RadialGradient id="pointerPivot" cx="50%" cy="50%" rx="50%" ry="50%">
              <Stop offset="0%" stopColor="#FFE082" />
              <Stop offset="70%" stopColor="#FFB300" />
              <Stop offset="100%" stopColor="#FF8F00" />
            </RadialGradient>
          </Defs>

          {/* Pointer needle body with chrome bevel */}
          <Path
            d="M16 29 L5 4 C5 2 7 1 9 1 L23 1 C25 1 27 2 27 4 Z"
            fill="url(#pointerMetal)"
            stroke="rgba(0,0,0,0.2)"
            strokeWidth="1.2"
          />

          {/* Inner ruby indicator core */}
          <Path
            d="M16 26 L8 5 L24 5 Z"
            fill="url(#pointerTip)"
          />

          {/* Golden top pivot cap */}
          <Circle cx="16" cy="6" r="4.5" fill="url(#pointerPivot)" stroke="#FFFFFF" strokeWidth="1" />
        </Svg>
      </View>

      {/* ─── Spinning Disc ──────────────────────────────────────────────── */}
      <Animated.View
        style={[
          styles.disc,
          {
            width:        size,
            height:       size,
            borderRadius: size / 2,
            marginTop:    POINTER_H,
            transform:    [{ rotate: spinDeg }],
          },
        ]}
      >
        <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <Defs>
            {/* Hub Gradients */}
            <RadialGradient id="hubOuterGrad" cx="50%" cy="50%" rx="50%" ry="50%">
              <Stop offset="0%"   stopColor="#FFFFFF" stopOpacity="1" />
              <Stop offset="75%"  stopColor="#EDEDED" stopOpacity="1" />
              <Stop offset="100%" stopColor="#D8D8D8" stopOpacity="1" />
            </RadialGradient>
            <LinearGradient id="hubRingGrad" x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0%"   stopColor="#FFFFFF" />
              <Stop offset="50%"  stopColor="#E0E0E0" />
              <Stop offset="100%" stopColor="#C0C0C0" />
            </LinearGradient>
            <RadialGradient id="pegGrad" cx="35%" cy="35%" rx="65%" ry="65%">
              <Stop offset="0%"   stopColor="#FFFFFF" />
              <Stop offset="55%"  stopColor="#EFEFEF" />
              <Stop offset="100%" stopColor="#9E9E9E" />
            </RadialGradient>
            {/* Subtle inner slice sheen */}
            <RadialGradient id="wheelVignette" cx="50%" cy="50%" rx="50%" ry="50%">
              <Stop offset="0%"   stopColor="#FFFFFF" stopOpacity="0.12" />
              <Stop offset="70%"  stopColor="#FFFFFF" stopOpacity="0" />
              <Stop offset="98%"  stopColor="#000000" stopOpacity="0.18" />
              <Stop offset="100%" stopColor="#000000" stopOpacity="0.32" />
            </RadialGradient>
          </Defs>

          <G>
            {/* The 12 Colour Slices */}
            {WHEEL_COLOURS.map((colour, i) => {
              const startAngle = i * SLICE_ANGLE
              const endAngle   = startAngle + SLICE_ANGLE
              const isTaken    = takenMap.has(i)
              const fill       = isTaken ? dimColour(colour.hex) : colour.hex

              return (
                <Path
                  key={i}
                  d={slicePath(cx, cy, r, startAngle, endAngle)}
                  fill={fill}
                  stroke="rgba(255,255,255,0.28)"
                  strokeWidth={1.5}
                />
              )
            })}

            {/* Vignette & Sheen Overlay */}
            <Circle cx={cx} cy={cy} r={r} fill="url(#wheelVignette)" pointerEvents="none" />

            {/* Inner rim guide ring */}
            <Circle
              cx={cx}
              cy={cy}
              r={r - 1}
              fill="none"
              stroke="rgba(255,255,255,0.45)"
              strokeWidth={2}
            />
            <Circle
              cx={cx}
              cy={cy}
              r={r - 4}
              fill="none"
              stroke="rgba(0,0,0,0.12)"
              strokeWidth={1}
            />

            {/* 12 Metallic Rim Rivets / Pegs at each slice boundary */}
            {WHEEL_COLOURS.map((_, i) => {
              const angle = i * SLICE_ANGLE
              const pegPos = polarToCartesian(pegR, angle)
              const playerColor = takenMap.get(i)

              return (
                <G key={`peg-${i}`}>
                  {/* Peg drop shadow */}
                  <Circle
                    cx={cx + pegPos.x}
                    cy={cy + pegPos.y + 0.8}
                    r={3.8}
                    fill="rgba(0,0,0,0.3)"
                  />
                  {/* Metallic peg body */}
                  <Circle
                    cx={cx + pegPos.x}
                    cy={cy + pegPos.y}
                    r={3.4}
                    fill="url(#pegGrad)"
                    stroke="rgba(255,255,255,0.8)"
                    strokeWidth={0.8}
                  />
                  {/* Taken player dot indicator near peg if slot claimed */}
                  {playerColor && (
                    <Circle
                      cx={cx + pegPos.x}
                      cy={cy + pegPos.y}
                      r={1.8}
                      fill={playerColor}
                    />
                  )}
                </G>
              )
            })}

            {/* ─── Multi-Layered Center Hub ────────────────────────────────── */}
            {/* Hub outer bevel shadow */}
            <Circle cx={cx} cy={cy + 1.5} r={innerR + 4} fill="rgba(0,0,0,0.22)" />

            {/* Chrome outer ring */}
            <Circle
              cx={cx}
              cy={cy}
              r={innerR + 3}
              fill="url(#hubRingGrad)"
              stroke="rgba(0,0,0,0.15)"
              strokeWidth={1}
            />

            {/* Hub inner core */}
            <Circle
              cx={cx}
              cy={cy}
              r={innerR}
              fill="url(#hubOuterGrad)"
              stroke="#FFFFFF"
              strokeWidth={1.5}
            />

            {/* Inner gloss ring */}
            <Circle
              cx={cx}
              cy={cy}
              r={innerR * 0.82}
              fill="none"
              stroke="rgba(0,0,0,0.06)"
              strokeWidth={1}
            />
          </G>
        </Svg>
      </Animated.View>

      {/* ─── Hub Tap Target & Animated Typography ───────────────────────── */}
      <Animated.View
        style={[
          styles.hubTouchableWrap,
          {
            width:        innerR * 2,
            height:       innerR * 2,
            borderRadius: innerR,
            top:          POINTER_H + r - innerR,
            left:         (size + 8) / 2 - innerR,
            transform:    [{ scale: hubPulse }],
          },
        ]}
      >
        <TouchableOpacity
          onPress={canSpin && !plan ? onSpinPress : undefined}
          activeOpacity={canSpin && !plan ? 0.75 : 1}
          style={styles.hubTouchable}
          accessibilityRole="button"
          accessibilityLabel={canSpin ? 'Spin the wheel' : 'Waiting'}
        >
          {/* Subtle glowing ring behind active SPIN text */}
          {canSpin && !plan && <View style={styles.hubActiveGlow} />}

          <Text
            style={[
              styles.hubLabel,
              canSpin && !plan ? styles.hubLabelActive : styles.hubLabelIdle,
            ]}
          >
            {hubText}
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  )
})

export default ColourWheel

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    position:   'relative',
  },
  pointerWrap: {
    position:  'absolute',
    top:       0,
    zIndex:    30,
    shadowColor:   '#000',
    shadowOffset:  { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius:  5,
    elevation:     10,
  },
  disc: {
    overflow:      'hidden',
    shadowColor:   '#000',
    shadowOffset:  { width: 0, height: 8 },
    shadowOpacity: 0.28,
    shadowRadius:  20,
    elevation:     14,
  },
  hubTouchableWrap: {
    position: 'absolute',
    zIndex:   25,
  },
  hubTouchable: {
    width:           '100%',
    height:          '100%',
    alignItems:      'center',
    justifyContent:  'center',
    backgroundColor: 'transparent',
  },
  hubActiveGlow: {
    position:        'absolute',
    width:           '78%',
    height:          '78%',
    borderRadius:    99,
    backgroundColor: 'rgba(228, 12, 26, 0.08)',
  },
  hubLabel: {
    fontSize:      15,
    fontWeight:    '900',
    letterSpacing: 0.8,
  },
  hubLabelActive: {
    color: '#E40C1A',
    textShadowColor:  'rgba(228, 12, 26, 0.25)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  hubLabelIdle: {
    color: '#8E8E93',
  },
})
