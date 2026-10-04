/**
 * ColourSpinScreen.tsx
 *
 * Ultra-Premium ColourHunt "Colour Spin" Page.
 *
 * FEATURES & POLISH:
 * ─────────────────
 * 1. Rich Atmospheric Hero:
 *    - Deep ruby-to-crimson gradient with ambient floating light motes / sparkles.
 *    - Dual-corona radial glow behind the wheel with soft contact ellipse shadow under it.
 *    - Faint rotating theatrical light rays clipped strictly to wheel perimeter (never crossing text).
 * 2. Premium Sculpted Wheel:
 *    - 88% width (max 360dp) with metallic rim rivets and 3D ruby-tipped pointer needle.
 *    - Exact 10-second spin timing on UI thread with ease-in-out bezier.
 * 3. Interactive Turn Flow:
 *    - Your Turn: Red glowing primary CTA with <SpinIcon size={22} color="#fff" /> + pulse.
 *      Status pill: amber "Tap SPIN". Subtitle: "Your turn". Hub: "SPIN".
 *    - Other's Turn: Frosted gray button with rotating <LoaderIcon size={18} color="#888" />.
 *      Status pill: amber "Waiting for Alex". Subtitle: "Alex's turn". Hub: "...".
 *    - Spinning: Amber gold CTA with rotating SpinIcon. Status pill: amber "Spinning...".
 *    - 12s Host Fallback: Secondary action "Spin for Alex".
 * 4. Deluxe Players Card:
 *    - Active spinner row highlighted with glowing amber border and "SPINNING" micro-badge.
 *    - Assigned hunt color: 3D enamel jewel swatch circle with glossy reflection + bold name.
 * 5. Spectacular Reveal:
 *    - Frosted modal with colored aura halo, winning colour title, avatar tag.
 *    - Multi-coloured Confetti burst (winning colour + pure white + gold).
 * 6. Accessibility & Performance:
 *    - Respects reduce motion (disables rays, sparkles, pulses, confetti; 1.5s fade snap).
 *    - VoiceOver / TalkBack announcements on results and countdown.
 */

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import {
  AccessibilityInfo,
  AccessibilityRole,
  Animated,
  AppState,
  AppStateStatus,
  Dimensions,
  Easing,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import Svg, {
  Defs,
  LinearGradient,
  RadialGradient,
  Rect,
  Stop,
  Circle,
  Path,
} from 'react-native-svg'
import { useNavigation, useRoute } from '@react-navigation/native'
import type { RouteProp } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'

import { ACCENT, APP_THEME, COLORS } from '../constants/colors'
import { s, vs, ms, SCREEN_WIDTH } from '../utils/scale'
import { usePlayerStore } from '../store/player'
import { useRoomStore } from '../store/room'
import { useGameStore } from '../store/game'
import type { RootStackParamList } from '../types/navigation'
import ColourWheel, { TakenSlot } from '../wheel/ColourWheel'
import { makeSpinPlan, WHEEL_COLOURS, SpinPlan } from '../wheel/wheelLogic'
import { SpinIcon, LoaderIcon } from '../wheel/icons'

// ─── Navigation Types ────────────────────────────────────────────────────────

type NavProp    = NativeStackNavigationProp<RootStackParamList, 'ColourSpin'>
type RouteProps = RouteProp<RootStackParamList, 'ColourSpin'>

// ─── Configuration & Tokens ──────────────────────────────────────────────────

const COLOUR_MODE: 'perPlayer' | 'shared' = 'perPlayer'

// Sized to ~88% of screen width, max 360dp
const WHEEL_SIZE = Math.min(Math.round(SCREEN_WIDTH * 0.88), 360)
const HERO_TOP   = '#F0192D'
const HERO_MID   = '#C40C1A'
const HERO_BOT   = '#8B000C'
const AUTO_SPIN_TIMEOUT_MS = 12_000

/** Avatar colours per player slot: P1 red, P2 blue, P3 green, P4 yellow */
const SLOT_AVATARS = [
  ACCENT.red.base,
  ACCENT.blue.base,
  ACCENT.green.base,
  ACCENT.yellow.base,
] as const

const SLOT_DARKS = [
  ACCENT.red.dark,
  ACCENT.blue.dark,
  ACCENT.green.dark,
  ACCENT.yellow.dark,
] as const

// ─── Types ────────────────────────────────────────────────────────────────────

interface SpinPlayer {
  id:     string
  name:   string
  isHost: boolean
}

interface AssignedColour {
  index:          number
  name:           string
  hex:            string
  readableTextOn: string
}

type AssignedMap = Record<string, AssignedColour>

const PLACEHOLDER_PLAYERS: SpinPlayer[] = [
  { id: 'p1', name: 'You',  isHost: true  },
  { id: 'p2', name: 'Alex', isHost: false },
]

// ─── Ambient Floating Sparkles in Hero ────────────────────────────────────────

interface Sparkle {
  id: number
  x: number
  y: number
  size: number
  animOpacity: Animated.Value
}

function AmbientSparkles({ reduceMotion }: { reduceMotion: boolean }) {
  const sparkles = useMemo<Sparkle[]>(() => {
    return Array.from({ length: 12 }, (_, i) => ({
      id: i,
      x: (i * 31 + 17) % (SCREEN_WIDTH - 30) + 15,
      y: (i * 23 + 11) % 220 + 20,
      size: (i % 3) * 1.5 + 2.5,
      animOpacity: new Animated.Value(0.15 + (i % 4) * 0.1),
    }))
  }, [])

  useEffect(() => {
    if (reduceMotion) return
    const anims = sparkles.map((sp, idx) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(sp.animOpacity, {
            toValue: 0.8,
            duration: 1200 + (idx % 5) * 300,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(sp.animOpacity, {
            toValue: 0.15,
            duration: 1200 + (idx % 5) * 300,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
        ])
      )
    )
    anims.forEach((a) => a.start())
    return () => anims.forEach((a) => a.stop())
  }, [sparkles, reduceMotion])

  if (reduceMotion) return null

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {sparkles.map((sp) => (
        <Animated.View
          key={sp.id}
          style={{
            position:        'absolute',
            top:             sp.y,
            left:            sp.x,
            width:           sp.size,
            height:          sp.size,
            borderRadius:    sp.size / 2,
            backgroundColor: '#FFE8A3',
            opacity:         sp.animOpacity,
            shadowColor:     '#FFE082',
            shadowOffset:    { width: 0, height: 0 },
            shadowOpacity:   0.8,
            shadowRadius:    3,
          }}
        />
      ))}
    </View>
  )
}

// ─── Multi-Layered Confetti Burst ─────────────────────────────────────────────

interface ConfettiPiece {
  id: number
  color: string
  x: number
  animY: Animated.Value
  animX: Animated.Value
  animRotate: Animated.Value
  size: number
  isRound: boolean
}

function DeluxeConfettiBurst({
  color,
  visible,
  reduceMotion,
}: {
  color: string
  visible: boolean
  reduceMotion: boolean
}) {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([])

  useEffect(() => {
    if (!visible || reduceMotion) {
      setPieces([])
      return
    }

    const palette = [color, '#FFFFFF', color, '#FFD54F', '#FFFFFF']
    const newPieces: ConfettiPiece[] = Array.from({ length: 44 }, (_, i) => ({
      id: i,
      color: palette[i % palette.length],
      x: SCREEN_WIDTH / 2 + (Math.random() - 0.5) * 60,
      animY: new Animated.Value(0),
      animX: new Animated.Value((Math.random() - 0.5) * 20),
      animRotate: new Animated.Value(0),
      size: Math.random() * 8 + 5,
      isRound: i % 3 === 0,
    }))

    setPieces(newPieces)

    Animated.parallel(
      newPieces.map((p) => {
        const spreadX = (Math.random() - 0.5) * (SCREEN_WIDTH * 0.95)
        const fallY   = vs(420) + Math.random() * 80
        const spins   = (Math.random() - 0.5) * 1080

        return Animated.parallel([
          Animated.timing(p.animY, {
            toValue: fallY,
            duration: 1800 + Math.random() * 400,
            easing: Easing.bezier(0.25, 0.46, 0.45, 0.94),
            useNativeDriver: true,
          }),
          Animated.timing(p.animX, {
            toValue: spreadX,
            duration: 1800 + Math.random() * 400,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(p.animRotate, {
            toValue: spins,
            duration: 1800 + Math.random() * 400,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
        ])
      })
    ).start()
  }, [visible, color, reduceMotion])

  if (!visible || reduceMotion || pieces.length === 0) return null

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {pieces.map((p) => {
        const rotate = p.animRotate.interpolate({
          inputRange:  [-1080, 1080],
          outputRange: ['-1080deg', '1080deg'],
        })
        return (
          <Animated.View
            key={p.id}
            style={{
              position:        'absolute',
              top:             vs(140),
              left:            p.x,
              width:           p.size,
              height:          p.isRound ? p.size : p.size * 1.6,
              borderRadius:    p.isRound ? p.size / 2 : 2,
              backgroundColor: p.color,
              transform:       [{ translateY: p.animY }, { translateX: p.animX }, { rotate }],
              shadowColor:     p.color,
              shadowOffset:    { width: 0, height: 1 },
              shadowOpacity:   0.3,
              shadowRadius:    2,
            }}
          />
        )
      })}
    </View>
  )
}

// ─── Status Pill ─────────────────────────────────────────────────────────────

function StatusPill({
  text,
  isLocked,
  reduceMotion,
}: {
  text: string
  isLocked: boolean
  reduceMotion: boolean
}) {
  const theme   = isLocked ? ACCENT.green : ACCENT.amber
  const scale   = useRef(new Animated.Value(1)).current
  const opacity = useRef(new Animated.Value(1)).current

  useEffect(() => {
    if (isLocked || reduceMotion) {
      scale.setValue(1)
      opacity.setValue(1)
      return
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(scale,   { toValue: 2.0, duration: 850, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 0,   duration: 850, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(scale,   { toValue: 1, duration: 0, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 0.8, duration: 0, useNativeDriver: true }),
        ]),
      ])
    )
    loop.start()
    return () => loop.stop()
  }, [isLocked, reduceMotion])

  return (
    <View style={[pillStyles.pill, { backgroundColor: theme.light, borderColor: theme.base }]}>
      <View style={pillStyles.dotContainer}>
        {!isLocked && (
          <Animated.View
            style={[
              pillStyles.dotRing,
              { borderColor: theme.dark, transform: [{ scale }], opacity },
            ]}
          />
        )}
        <View style={[pillStyles.dotCore, { backgroundColor: theme.dark }]} />
      </View>
      <Text style={[pillStyles.text, { color: theme.dark }]}>{text}</Text>
    </View>
  )
}

const pillStyles = StyleSheet.create({
  pill: {
    flexDirection:     'row',
    alignItems:        'center',
    gap:               s(7),
    paddingVertical:   vs(5),
    paddingHorizontal: s(13),
    borderRadius:      s(20),
    borderWidth:       1.2,
    alignSelf:         'flex-start',
    shadowColor:       '#000',
    shadowOffset:      { width: 0, height: 2 },
    shadowOpacity:     0.1,
    shadowRadius:      3,
    elevation:         2,
  },
  dotContainer: {
    width:          s(12),
    height:         s(12),
    alignItems:     'center',
    justifyContent: 'center',
  },
  dotRing: {
    position:     'absolute',
    width:        s(12),
    height:       s(12),
    borderRadius: s(6),
    borderWidth:  1.5,
  },
  dotCore: {
    width:        s(6),
    height:       s(6),
    borderRadius: s(3),
  },
  text: {
    fontSize:      ms(12),
    fontWeight:    '800',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
})

// ─── Hanging Rope Bulbs (Top-Right Hero Decoration) ──────────────────────────
//
// 3 strings of different lengths hang from the top-right corner of the hero.
// Each string: ceiling hook → thin wire rope → SVG bulb (cap + neck + body).
// Bulbs blink independently with smooth ease-in-out animation.
// Positioned with `right:` so they never touch the left-side title / pill / wheel.

// Bulb SVG canvas (viewBox "0 0 26 36")
const BULB_W = s(26)
const BULB_H = s(36)

function HangingBulbs({ reduceMotion }: { reduceMotion: boolean }) {
  // 5 independent blink values, staggered starting phases
  const blink0 = useRef(new Animated.Value(1.00)).current  // yellow  — starts full-on
  const blink1 = useRef(new Animated.Value(0.45)).current  // pink    — starts mid
  const blink2 = useRef(new Animated.Value(0.70)).current  // cyan    — starts 70%
  const blink3 = useRef(new Animated.Value(0.30)).current  // orange  — starts low
  const blink4 = useRef(new Animated.Value(0.85)).current  // purple  — starts high

  useEffect(() => {
    if (reduceMotion) return

    const pulse = (val: Animated.Value, dur: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(val, {
            toValue:         0.18,
            duration:        dur * 0.42,
            easing:          Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(val, {
            toValue:         1.0,
            duration:        dur * 0.58,
            easing:          Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
        ])
      )

    const a0 = pulse(blink0, 1900)  // slow
    const a1 = pulse(blink1, 1450)  // medium
    const a2 = pulse(blink2, 1050)  // fast
    const a3 = pulse(blink3, 1650)  // medium-slow
    const a4 = pulse(blink4, 1200)  // medium-fast

    a0.start(); a1.start(); a2.start(); a3.start(); a4.start()
    return () => { a0.stop(); a1.stop(); a2.stop(); a3.stop(); a4.stop() }
  }, [reduceMotion])


  /** Renders one complete hanging string at a given right-offset */
  const renderString = (
    rightOffset: number,
    ropeLen:     number,       // pixel height of the rope segment
    bulbFill:    string,       // main bulb colour
    blinkVal:    Animated.Value,
  ) => (
    <View
      key={rightOffset}
      style={{ position: 'absolute', right: rightOffset, top: 0, alignItems: 'center' }}
      pointerEvents="none"
    >
      {/* ── Ceiling hook / nail ── */}
      <View style={hangStyles.hook} />

      {/* ── Rope / wire ── */}
      <View style={[hangStyles.rope, { height: ropeLen }]} />

      {/* ── Bulb group — blinks as a unit ── */}
      <Animated.View style={{ alignItems: 'center', opacity: blinkVal }}>

        {/* Soft outer glow halo (simulated with shadow) */}
        <View
          style={[
            hangStyles.glowHalo,
            {
              backgroundColor: bulbFill,
              shadowColor:     bulbFill,
            },
          ]}
        />

        {/* Bulb SVG: cap → neck → body → base */}
        <Svg width={BULB_W} height={BULB_H} viewBox="0 0 26 36">

          {/* Metal cap (socket) */}
          <Rect x={9} y={0} width={8} height={6} rx={1.5} fill="#9E9E9E" />
          {/* Cap threading ridges */}
          <Path
            d="M9.5,2 L16.5,2 M9.5,4 L16.5,4"
            stroke="#707070"
            strokeWidth={0.8}
            fill="none"
          />

          {/* Neck (narrows from cap to bulb) */}
          <Path
            d="M10.5,6 L10.5,11 Q13,11.5 15.5,11 L15.5,6 Z"
            fill="#BDBDBD"
          />

          {/* Main bulb body */}
          <Circle cx={13} cy={23} r={11} fill={bulbFill} />

          {/* Inner bright core */}
          <Circle cx={13} cy={23} r={5} fill="rgba(255,255,255,0.28)" />

          {/* Gloss highlight (top-left crescent) */}
          <Path
            d="M8.5,17 Q9.5,14 12.5,14.5 Q10.5,15.5 9.5,18 Z"
            fill="rgba(255,255,255,0.62)"
          />

          {/* Bottom screw base */}
          <Rect x={10.5} y={32} width={5} height={3} rx={0.8} fill="#757575" />
        </Svg>
      </Animated.View>
    </View>
  )

  if (reduceMotion) return null

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {/* String 1 — rightmost,      warm yellow,  longest rope  */}
      {renderString(s(8),   vs(95), '#FFD700', blink0)}
      {/* String 2 — 2nd from right, soft pink,    medium-long   */}
      {renderString(s(34),  vs(70), '#FF80AB', blink1)}
      {/* String 3 — 3rd from right, cool cyan,    tall rope     */}
      {renderString(s(60),  vs(82), '#4DD0E1', blink2)}
      {/* String 4 — 4th from right, warm orange,  short-medium  */}
      {renderString(s(86),  vs(55), '#FF9800', blink3)}
      {/* String 5 — innermost,      soft purple,  medium rope   */}
      {renderString(s(112), vs(68), '#BA68C8', blink4)}
    </View>
  )
}

const hangStyles = StyleSheet.create({
  hook: {
    width:           s(7),
    height:          s(4),
    borderRadius:    s(2),
    backgroundColor: 'rgba(255,255,255,0.68)',
  },
  rope: {
    width:           s(2),
    backgroundColor: 'rgba(255,255,255,0.52)',
  },
  glowHalo: {
    position:      'absolute',
    top:           s(3),
    width:         s(30),
    height:        s(30),
    borderRadius:  s(15),
    opacity:       0.28,
    shadowOffset:  { width: 0, height: 0 },
    shadowOpacity: 0.75,
    shadowRadius:  s(14),
    elevation:     0,
  },
})

// ─── Soft Rotating Light Rays (Clipped to Wheel) ──────────────────────────────

function SoftLightRays({ size, reduceMotion }: { size: number; reduceMotion: boolean }) {
  const rotateAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    if (reduceMotion) return
    const loop = Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 360,
        duration: 60_000, // 60s per turn
        easing: Easing.linear,
        useNativeDriver: true,
      })
    )
    loop.start()
    return () => loop.stop()
  }, [reduceMotion])

  const spin = rotateAnim.interpolate({
    inputRange:  [0, 360],
    outputRange: ['0deg', '360deg'],
  })

  const clipSize = size + 16
  const rayAngles = [0, 22.5, 45, 67.5, 90, 112.5, 135, 157.5, 180, 202.5, 225, 247.5, 270, 292.5, 315, 337.5]

  return (
    <View
      style={{
        position:        'absolute',
        width:           clipSize,
        height:          clipSize,
        borderRadius:    clipSize / 2,
        overflow:        'hidden',
        alignItems:      'center',
        justifyContent:  'center',
      }}
      pointerEvents="none"
    >
      <Animated.View
        style={{
          width:           clipSize * 1.5,
          height:          clipSize * 1.5,
          alignItems:      'center',
          justifyContent:  'center',
          transform:       [{ rotate: spin }],
        }}
      >
        {rayAngles.map((angle) => (
          <View
            key={angle}
            style={{
              position:        'absolute',
              width:           clipSize * 0.05,
              height:          clipSize * 1.5,
              backgroundColor: 'rgba(255,255,255,0.06)',
              borderRadius:    clipSize * 0.025,
              transform:       [{ rotate: `${angle}deg` }],
            }}
          />
        ))}
      </Animated.View>
    </View>
  )
}

// ─── Primary Spin Button (Sticky Footer Style) ────────────────────────────────

function SpinButton({
  isMyTurn,
  spinning,
  otherPlayerName,
  onSpin,
  reduceMotion,
}: {
  isMyTurn:        boolean
  spinning:        boolean
  otherPlayerName: string
  onSpin:          () => void
  reduceMotion:    boolean
}) {
  const pulseAnim    = useRef(new Animated.Value(1)).current
  const spinIconAnim = useRef(new Animated.Value(0)).current

  // Gentle breathing pulse when it's your turn
  useEffect(() => {
    if (!isMyTurn || spinning || reduceMotion) {
      pulseAnim.setValue(1)
      return
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.035, duration: 750, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1.0,   duration: 750, useNativeDriver: true }),
      ])
    )
    loop.start()
    return () => loop.stop()
  }, [isMyTurn, spinning, reduceMotion])

  // Rotating spin icon while spinning
  useEffect(() => {
    if (spinning && !reduceMotion) {
      const loop = Animated.loop(
        Animated.timing(spinIconAnim, {
          toValue: 360,
          duration: 900,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      )
      loop.start()
      return () => loop.stop()
    } else {
      spinIconAnim.setValue(0)
    }
  }, [spinning, reduceMotion])

  const iconRotate = spinIconAnim.interpolate({
    inputRange:  [0, 360],
    outputRange: ['0deg', '360deg'],
  })

  // State 1: Spinning (amber, disabled)
  if (spinning) {
    return (
      <View style={btnStyles.wrap}>
        <View style={[btnStyles.btn, btnStyles.btnAmber]}>
          <View style={btnStyles.glassHighlight} />
          <Animated.View style={{ transform: [{ rotate: iconRotate }] }}>
            <SpinIcon size={22} color="#FFFFFF" />
          </Animated.View>
          <Text style={btnStyles.btnTextWhite}>Spinning...</Text>
        </View>
      </View>
    )
  }

  // State 2: Your turn (red sticky, gentle pulse)
  if (isMyTurn) {
    return (
      <View style={btnStyles.wrap}>
        <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
          <TouchableOpacity
            style={[btnStyles.btn, btnStyles.btnRed]}
            onPress={onSpin}
            activeOpacity={0.88}
          >
            {/* Glossy top edge bevel */}
            <View style={btnStyles.glassHighlight} />
            <SpinIcon size={22} color="#FFFFFF" />
            <Text style={btnStyles.btnTextWhite}>Spin the wheel</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    )
  }

  // State 3: Waiting for someone else (gray, disabled with loader icon)
  return (
    <View style={btnStyles.wrap}>
      <View style={[btnStyles.btn, btnStyles.btnGray]}>
        <LoaderIcon size={18} color="#777777" />
        <Text style={btnStyles.btnTextGray}>
          Waiting for {otherPlayerName} to spin...
        </Text>
      </View>
    </View>
  )
}

const btnStyles = StyleSheet.create({
  wrap: {
    paddingHorizontal: s(16),
    paddingBottom:     vs(16),
  },
  btn: {
    flexDirection:   'row',
    alignItems:      'center',
    justifyContent:  'center',
    gap:             s(10),
    borderRadius:    s(16),
    paddingVertical: vs(16),
    overflow:        'hidden',
    position:        'relative',
  },
  glassHighlight: {
    position:        'absolute',
    top:             0,
    left:            0,
    right:           0,
    height:          vs(2),
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
  btnRed: {
    backgroundColor: APP_THEME.primary,
    shadowColor:     ACCENT.red.shadow,
    shadowOffset:    { width: 0, height: vs(5) },
    shadowOpacity:   0.45,
    shadowRadius:    s(12),
    elevation:       7,
  },
  btnAmber: {
    backgroundColor: ACCENT.amber.base,
    shadowColor:     ACCENT.amber.shadow,
    shadowOffset:    { width: 0, height: vs(4) },
    shadowOpacity:   0.3,
    shadowRadius:    s(8),
    elevation:       5,
  },
  btnGray: {
    backgroundColor: APP_THEME.surfaceElevated,
    borderWidth:     1,
    borderColor:     APP_THEME.surfaceBorder,
  },
  btnOutlineRed: {
    borderWidth:     1.5,
    borderColor:     APP_THEME.primary,
    backgroundColor: 'transparent',
  },
  btnTextWhite: {
    fontSize:      ms(16),
    fontWeight:    '900',
    color:         COLORS.pure_white,
    letterSpacing: 0.2,
  },
  btnTextGray: {
    fontSize:    ms(14),
    fontWeight:  '700',
    color:       APP_THEME.textSecondary,
  },
  btnTextRed: {
    fontSize:    ms(15),
    fontWeight:  '800',
    color:       APP_THEME.primary,
  },
})

// ─── SnakeBorder: Complete Animated Perimeter Countdown ─────────────────────

// AnimatedRect lets us drive SVG props directly from an Animated.Value
// without any React re-renders during the animation.
const AnimatedRect = Animated.createAnimatedComponent(Rect)

function SnakeBorder({
  width,
  height,
  progress,
  isAlert,
}: {
  width:    number
  height:   number
  progress: Animated.Value  // 0 → 1, driven by Animated.timing
  isAlert:  boolean
}) {
  if (width <= 0 || height <= 0) return null

  const strokeWidth = 4
  const rx = s(14)
  const ry = s(14)
  const w = width  - strokeWidth
  const h = height - strokeWidth

  // Exact rounded-rect perimeter
  const straightW = Math.max(0, w - 2 * rx)
  const straightH = Math.max(0, h - 2 * ry)
  const perimeter = 2 * straightW + 2 * straightH + 2 * Math.PI * rx

  // Interpolate: 0 → "0 P"  (nothing visible)
  //              1 → "P P"  (full border lit up)
  // This drives the SVG directly — no setState, no re-render.
  const strokeDasharray = progress.interpolate({
    inputRange:  [0, 1],
    outputRange: [`0 ${perimeter}`, `${perimeter} ${perimeter}`],
    extrapolate: 'clamp',
  })

  // Glow opacity grows as the snake fills in (adds urgency)
  const glowOpacity = progress.interpolate({
    inputRange:  [0, 0.5, 1],
    outputRange: [0.08, 0.2, 0.45],
    extrapolate: 'clamp',
  })

  const strokeColor = isAlert ? '#EF4444' : '#F59E0B'
  const trackColor  = isAlert
    ? 'rgba(239, 68, 68, 0.12)'
    : 'rgba(245, 158, 11, 0.12)'

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Svg width={width} height={height}>
        {/* Static track — full perimeter at low opacity */}
        <Rect
          x={strokeWidth / 2}
          y={strokeWidth / 2}
          width={w}
          height={h}
          rx={rx}
          ry={ry}
          stroke={trackColor}
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Animated snake stroke — driven frame-perfect by Animated.Value */}
        <AnimatedRect
          x={strokeWidth / 2}
          y={strokeWidth / 2}
          width={w}
          height={h}
          rx={rx}
          ry={ry}
          stroke={strokeColor}
          strokeWidth={strokeWidth + 0.5}
          strokeDasharray={strokeDasharray}
          strokeDashoffset={0}
          strokeLinecap="round"
          fill="none"
        />
        {/* Soft outer glow duplicate at lower opacity (depth effect) */}
        <AnimatedRect
          x={strokeWidth / 2}
          y={strokeWidth / 2}
          width={w}
          height={h}
          rx={rx}
          ry={ry}
          stroke={strokeColor}
          strokeWidth={strokeWidth + 4}
          strokeDasharray={strokeDasharray}
          strokeDashoffset={0}
          strokeLinecap="round"
          fill="none"
          opacity={glowOpacity}
        />
      </Svg>
    </View>
  )
}


// ─── Player Row with Enamel Gem Swatch & Snake Border ────────────────────────

function PlayerRow({
  player,
  index,
  assigned,
  isCurrentTurn,
  snakeProgress,
  isAlert,
  spinning,
  reduceMotion,
}: {
  player:        SpinPlayer
  index:         number
  assigned:      AssignedColour | undefined
  isCurrentTurn: boolean
  snakeProgress: Animated.Value
  isAlert:       boolean
  spinning:      boolean
  reduceMotion:  boolean
}) {
  const [layout, setLayout] = useState({ width: 0, height: 0 })
  const avatarColor = SLOT_AVATARS[index % SLOT_AVATARS.length]
  const darkColor   = SLOT_DARKS[index % SLOT_DARKS.length]
  const initial     = player.name.charAt(0).toUpperCase()
  const swatchPop   = useRef(new Animated.Value(0)).current

  useEffect(() => {
    if (!assigned) {
      swatchPop.setValue(0)
      return
    }
    if (reduceMotion) {
      swatchPop.setValue(1)
      return
    }
    Animated.spring(swatchPop, {
      toValue:         1,
      speed:           18,
      bounciness:      14,
      useNativeDriver: true,
    }).start()
  }, [assigned?.index, reduceMotion])

  return (
    <View
      onLayout={(e) => {
        const { width, height } = e.nativeEvent.layout
        if (width > 0 && height > 0) {
          setLayout({ width, height })
        }
      }}
      style={[
        pRowStyles.row,
        isCurrentTurn && pRowStyles.rowActive,
        isCurrentTurn && isAlert && !spinning && pRowStyles.rowActiveAlert,
        // Hide native border when snake SVG is active so only the snake stroke shows
        isCurrentTurn && !spinning && { borderWidth: 0 },
      ]}
    >
      {/* Complete Snake Animation progressing around the entire border */}
      {isCurrentTurn && !spinning && (
        <SnakeBorder
          width={layout.width}
          height={layout.height}
          progress={snakeProgress}
          isAlert={isAlert}
        />
      )}

      {/* Avatar in player colour */}
      <View style={[pRowStyles.avatar, { backgroundColor: avatarColor }]}>
        <View style={pRowStyles.avatarGloss} />
        <Text style={[pRowStyles.avatarText, { color: index === 3 ? darkColor : COLORS.pure_white }]}>
          {initial}
        </Text>
      </View>

      {/* Name and Turn Status (No second numbers) */}
      <View style={pRowStyles.nameBlock}>
        <Text style={[pRowStyles.name, { color: darkColor }]} numberOfLines={1}>
          {player.name}
        </Text>
        {isCurrentTurn && (
          <View style={[pRowStyles.activeBadge, isAlert && !spinning && pRowStyles.activeBadgeAlert]}>
            <Text style={[pRowStyles.activeBadgeText, isAlert && !spinning && pRowStyles.activeBadgeTextAlert]}>
              {spinning ? 'SPINNING NOW...' : isAlert ? 'AUTO-SPINNING...' : 'CURRENT TURN'}
            </Text>
          </View>
        )}
      </View>

      {/* Hunt Colour Slot: Enamel Jewel Swatch or Dashed Empty */}
      {assigned ? (
        <Animated.View style={[pRowStyles.huntSlotFilled, { transform: [{ scale: swatchPop }] }]}>
          {/* 3D Enamel Jewel Swatch */}
          <View style={[pRowStyles.swatchJewel, { backgroundColor: assigned.hex }]}>
            {/* Gloss reflection arc on top half */}
            <View style={pRowStyles.swatchGlossArc} />
          </View>
          {/* Colour name in bold dark text */}
          <Text style={pRowStyles.swatchNameDark}>{assigned.name}</Text>
        </Animated.View>
      ) : (
        <View style={pRowStyles.swatchEmpty}>
          <Text style={pRowStyles.swatchEmptyText}>?</Text>
        </View>
      )}
    </View>
  )
}

const pRowStyles = StyleSheet.create({
  row: {
    flexDirection:     'row',
    alignItems:        'center',
    borderRadius:      s(14),
    borderWidth:       1.5,
    borderColor:       APP_THEME.surfaceBorder,
    backgroundColor:   APP_THEME.surfaceElevated,
    paddingHorizontal: s(12),
    paddingVertical:   vs(10),
    marginBottom:      vs(8),
    gap:               s(10),
  },
  rowActive: {
    borderColor:   ACCENT.amber.base,
    borderWidth:   2,
    backgroundColor: '#FFFDF5',
    shadowColor:   ACCENT.amber.base,
    shadowOffset:  { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius:  8,
    elevation:     4,
  },
  avatar: {
    width:           s(38),
    height:          s(38),
    borderRadius:    s(19),
    alignItems:      'center',
    justifyContent:  'center',
    flexShrink:      0,
    shadowColor:     '#000',
    shadowOffset:    { width: 0, height: 2 },
    shadowOpacity:   0.15,
    shadowRadius:    3,
    elevation:       3,
    overflow:        'hidden',
    position:        'relative',
  },
  avatarGloss: {
    position:        'absolute',
    top:             0,
    left:            0,
    right:           0,
    height:          '50%',
    backgroundColor: 'rgba(255,255,255,0.22)',
  },
  avatarText: {
    fontSize:   ms(15),
    fontWeight: '900',
  },
  nameBlock: {
    flex: 1,
    gap:  vs(2),
  },
  name: {
    fontSize:   ms(15),
    fontWeight: '800',
  },
  rowActiveAlert: {
    borderColor:     '#EF4444',
    shadowColor:     '#EF4444',
    backgroundColor: '#FFF5F5',
  },

  activeBadge: {
    alignSelf:         'flex-start',
    backgroundColor:   '#FEF3C7',
    paddingHorizontal: s(6),
    paddingVertical:   vs(1.5),
    borderRadius:      s(4),
  },
  activeBadgeAlert: {
    backgroundColor: '#FEE2E2',
  },
  activeBadgeTextAlert: {
    color: '#B91C1C',
  },
  activeBadgeText: {
    fontSize:      ms(9),
    fontWeight:    '800',
    color:         ACCENT.amber.dark,
    letterSpacing: 0.4,
  },
  huntSlotFilled: {
    flexDirection:     'row',
    alignItems:        'center',
    gap:               s(8),
    paddingHorizontal: s(11),
    paddingVertical:   vs(6),
    borderRadius:      s(20),
    backgroundColor:   APP_THEME.surface,
    borderWidth:       1.2,
    borderColor:       APP_THEME.surfaceBorder,
    shadowColor:       '#000',
    shadowOffset:      { width: 0, height: 2 },
    shadowOpacity:     0.06,
    shadowRadius:      3,
    elevation:         2,
  },
  swatchJewel: {
    width:        s(22),
    height:       s(22),
    borderRadius: s(11),
    borderWidth:  1.2,
    borderColor:  'rgba(0,0,0,0.12)',
    overflow:     'hidden',
    position:     'relative',
    shadowColor:  '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation:    2,
  },
  swatchGlossArc: {
    position:        'absolute',
    top:             0,
    left:            0,
    right:           0,
    height:          '48%',
    backgroundColor: 'rgba(255,255,255,0.35)',
  },
  swatchNameDark: {
    fontSize:      ms(13),
    fontWeight:    '800',
    color:         APP_THEME.text,
    letterSpacing: 0.1,
  },
  swatchEmpty: {
    width:           s(36),
    height:          s(36),
    borderRadius:    s(18),
    borderWidth:     2,
    borderStyle:     'dashed',
    borderColor:     APP_THEME.textMuted,
    alignItems:      'center',
    justifyContent:  'center',
  },
  swatchEmptyText: {
    fontSize:   ms(14),
    fontWeight: '700',
    color:      APP_THEME.textMuted,
  },
})

// ─── Showstopper Reveal Modal ─────────────────────────────────────────────────

function RevealCard({
  visible,
  colour,
  playerName,
  playerAvatarColor,
  sharedMode,
  reduceMotion,
}: {
  visible:           boolean
  colour:            AssignedColour | null
  playerName:        string
  playerAvatarColor: string
  sharedMode:        boolean
  reduceMotion:      boolean
}) {
  const slideY  = useRef(new Animated.Value(340)).current
  const opacity = useRef(new Animated.Value(0)).current
  const scale   = useRef(new Animated.Value(0.9)).current

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(slideY,  { toValue: 0, duration: reduceMotion ? 180 : 440, easing: Easing.out(Easing.back(1.4)), useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1, duration: reduceMotion ? 180 : 320, useNativeDriver: true }),
        Animated.timing(scale,   { toValue: 1, duration: reduceMotion ? 180 : 440, easing: Easing.out(Easing.back(1.4)), useNativeDriver: true }),
      ]).start()
    } else {
      slideY.setValue(340)
      opacity.setValue(0)
      scale.setValue(0.9)
    }
  }, [visible, reduceMotion])

  if (!colour) return null

  const initial = playerName.charAt(0).toUpperCase()
  const label   = sharedMode
    ? `Everyone hunts ${colour.name}`
    : `${playerName} got ${colour.name}`

  return (
    <Modal visible={visible} transparent animationType="none" statusBarTranslucent>
      <View style={revealStyles.overlay}>
        <Animated.View
          style={[
            revealStyles.sheet,
            { opacity, transform: [{ translateY: slideY }, { scale }] },
          ]}
        >
          {/* Subtle colored glow halo behind the big swatch */}
          <View
            style={[
              revealStyles.haloAura,
              { backgroundColor: colour.hex },
            ]}
          />

          {/* Big Jewel Swatch in that colour with name styled with readableTextOn */}
          <View style={[revealStyles.bigSwatch, { backgroundColor: colour.hex }]}>
            {/* Top Gloss Highlight Arc */}
            <View style={revealStyles.bigSwatchGloss} />
            <Text style={[revealStyles.swatchInnerText, { color: colour.readableTextOn }]}>
              {colour.name}
            </Text>
          </View>

          {/* Colour Name in Large Bold Text */}
          <Text style={revealStyles.colourNameTitle}>{colour.name}</Text>

          {/* Target Assignment Banner */}
          <View style={revealStyles.playerInfoRow}>
            <View style={[revealStyles.playerMiniAvatar, { backgroundColor: playerAvatarColor }]}>
              <Text style={revealStyles.playerMiniAvatarText}>{initial}</Text>
            </View>
            <Text
              style={revealStyles.playerResultText}
              accessibilityLiveRegion="polite"
              accessibilityRole={'text' as AccessibilityRole}
            >
              {label}
            </Text>
          </View>
        </Animated.View>
      </View>
    </Modal>
  )
}

const revealStyles = StyleSheet.create({
  overlay: {
    flex:            1,
    justifyContent:  'flex-end',
    backgroundColor: 'rgba(0,0,0,0.52)',
  },
  sheet: {
    backgroundColor:      APP_THEME.surface,
    borderTopLeftRadius:  s(32),
    borderTopRightRadius: s(32),
    paddingHorizontal:    s(24),
    paddingTop:           vs(30),
    paddingBottom:        vs(52),
    alignItems:           'center',
    gap:                  vs(14),
    shadowColor:          '#000',
    shadowOffset:         { width: 0, height: -6 },
    shadowOpacity:        0.22,
    shadowRadius:         24,
    elevation:            20,
    position:             'relative',
  },
  haloAura: {
    position:     'absolute',
    top:          vs(18),
    width:        s(140),
    height:       s(140),
    borderRadius: s(70),
    opacity:      0.22,
  },
  bigSwatch: {
    width:          s(116),
    height:         s(116),
    borderRadius:   s(58),
    alignItems:     'center',
    justifyContent: 'center',
    shadowColor:    '#000',
    shadowOffset:   { width: 0, height: 8 },
    shadowOpacity:  0.28,
    shadowRadius:   16,
    elevation:      12,
    borderWidth:    3.5,
    borderColor:    'rgba(255,255,255,0.5)',
    overflow:       'hidden',
    position:       'relative',
  },
  bigSwatchGloss: {
    position:        'absolute',
    top:             0,
    left:            0,
    right:           0,
    height:          '48%',
    backgroundColor: 'rgba(255,255,255,0.28)',
  },
  swatchInnerText: {
    fontSize:      ms(17),
    fontWeight:    '900',
    letterSpacing: 0.4,
    zIndex:        2,
  },
  colourNameTitle: {
    fontSize:      ms(30),
    fontWeight:    '900',
    color:         APP_THEME.text,
    letterSpacing: -0.5,
  },
  playerInfoRow: {
    flexDirection:     'row',
    alignItems:        'center',
    gap:               s(10),
    backgroundColor:   APP_THEME.surfaceElevated,
    paddingHorizontal: s(16),
    paddingVertical:   vs(8),
    borderRadius:      s(24),
    borderWidth:       1,
    borderColor:       APP_THEME.surfaceBorder,
  },
  playerMiniAvatar: {
    width:          s(30),
    height:         s(30),
    borderRadius:   s(15),
    alignItems:     'center',
    justifyContent: 'center',
  },
  playerMiniAvatarText: {
    fontSize:   ms(13),
    fontWeight: '900',
    color:      COLORS.pure_white,
  },
  playerResultText: {
    fontSize:   ms(15),
    fontWeight: '800',
    color:      APP_THEME.text,
  },
})

// ─── 3-2-1 Countdown Overlay with Spring Beat ─────────────────────────────────

function CountdownOverlay({ count }: { count: number | null }) {
  const scale = useRef(new Animated.Value(1.6)).current

  useEffect(() => {
    if (count !== null) {
      scale.setValue(1.6)
      Animated.spring(scale, {
        toValue: 1,
        speed:   20,
        bounciness: 12,
        useNativeDriver: true,
      }).start()
    }
  }, [count])

  if (count === null) return null

  return (
    <View style={cdStyles.overlay} pointerEvents="none">
      <Animated.Text
        style={[cdStyles.digit, { transform: [{ scale }] }]}
        accessibilityLiveRegion="assertive"
      >
        {count}
      </Animated.Text>
    </View>
  )
}

const cdStyles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFill,
    alignItems:      'center',
    justifyContent:  'center',
    backgroundColor: 'rgba(0,0,0,0.65)',
    zIndex:          100,
  },
  digit: {
    fontSize:      ms(110),
    fontWeight:    '900',
    color:         COLORS.pure_white,
    letterSpacing: -3,
    textShadowColor:  'rgba(228, 12, 26, 0.8)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 18,
  },
})

// ─── Main Screen Component ────────────────────────────────────────────────────

export default function ColourSpinScreen() {
  const navigation = useNavigation<NavProp>()
  const route      = useRoute<RouteProps>()
  const insets     = useSafeAreaInsets()

  const { isHost: storeIsHost } = usePlayerStore()
  const { totalRounds }         = useRoomStore()
  const { roundNumber }         = useGameStore()

  const isHost        = route.params?.isHost ?? storeIsHost
  const players       = PLACEHOLDER_PLAYERS
  const effectiveMode = COLOUR_MODE
  const currentRound  = roundNumber || 1
  const totalRoundsN  = totalRounds || 5

  // ── Accessibility ───────────────────────────────────────────────────────────
  const [reduceMotion, setReduceMotion] = useState(false)
  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion)
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduceMotion)
    return () => sub.remove()
  }, [])

  // ── Spin & game states ──────────────────────────────────────────────────────
  const [currentPlayerIdx, setCurrentPlayerIdx] = useState(0)
  const [plan,             setPlan]             = useState<SpinPlan | null>(null)
  const [takenIndexes,     setTakenIndexes]     = useState<Set<number>>(new Set())
  const [assignedMap,      setAssignedMap]      = useState<AssignedMap>({})
  const [spinning,         setSpinning]         = useState(false)
  const [showReveal,       setShowReveal]       = useState(false)
  const [revealedColour,   setRevealedColour]   = useState<AssignedColour | null>(null)
  const [lastRevealedText, setLastRevealedText] = useState<string | null>(null)
  const [countdown,        setCountdown]        = useState<number | null>(null)
  const [done,             setDone]             = useState(false)

  // ── 15-Second Turn Countdown (Snake Border Progress) ────────────────────────
  const TURN_COUNTDOWN_MS = 15000
  // Single Animated.Value drives the SVG snake — no setState per frame
  const snakeProgress  = useRef(new Animated.Value(0)).current
  const snakeAnim      = useRef<Animated.CompositeAnimation | null>(null)
  const turnTimerRef   = useRef<ReturnType<typeof setTimeout> | null>(null)
  const alertTimerRef  = useRef<ReturnType<typeof setTimeout> | null>(null)
  const betweenTimer   = useRef<ReturnType<typeof setTimeout> | null>(null)
  // isAlert flips once at 68% of countdown — triggers red colour change
  const [isAlert, setIsAlert] = useState(false)

  const assignedMapRef = useRef<AssignedMap>({})
  const takenRef       = useRef<Set<number>>(new Set())
  useEffect(() => { assignedMapRef.current = assignedMap }, [assignedMap])
  useEffect(() => { takenRef.current = takenIndexes }, [takenIndexes])

  // ── Current player & turn state ────────────────────────────────────────────
  const currentPlayer = players[currentPlayerIdx] ?? players[0]
  const isMyTurn      = (currentPlayerIdx === 0) && !spinning && !done

  // ── Dynamic Subtitle ───────────────────────────────────────────────────────
  let subtitleText = ''
  if (spinning) {
    subtitleText = 'Spinning...'
  } else if (lastRevealedText) {
    subtitleText = lastRevealedText
  } else {
    subtitleText = isMyTurn ? 'Your turn' : `${currentPlayer.name}'s turn`
  }

  // ── Status Pill ────────────────────────────────────────────────────────────
  let pillText = ''
  let pillIsLocked = false
  if (done || lastRevealedText) {
    pillText = 'Colour locked'
    pillIsLocked = true
  } else if (spinning) {
    pillText = 'Spinning...'
    pillIsLocked = false
  } else if (isMyTurn) {
    pillText = 'Tap SPIN'
    pillIsLocked = false
  } else {
    pillText = `Waiting for ${currentPlayer.name}`
    pillIsLocked = false
  }

  // ── takenSlots for <ColourWheel /> ──────────────────────────────────────────
  const takenSlots: TakenSlot[] = useMemo(() =>
    Object.entries(assignedMap).map(([pid, ac]) => {
      const pIdx = players.findIndex((p) => p.id === pid)
      return { index: ac.index, color: SLOT_AVATARS[pIdx % SLOT_AVATARS.length] }
    }),
    [assignedMap, players]
  )

  // ── Realtime broadcast stub ────────────────────────────────────────────────
  const broadcastPlan = useCallback((playerId: string, spinPlan: SpinPlan) => {
    console.log('[ColourSpin] Broadcast plan for', playerId, spinPlan)
  }, [])

  // ── Host triggers spin ─────────────────────────────────────────────────────
  const triggerSpin = useCallback((playerIdx: number, taken: Set<number>) => {
    // Stop snake and all countdown timers
    if (turnTimerRef.current)  clearTimeout(turnTimerRef.current)
    if (alertTimerRef.current) clearTimeout(alertTimerRef.current)
    if (snakeAnim.current) { snakeAnim.current.stop(); snakeAnim.current = null }
    snakeProgress.setValue(0)
    setIsAlert(false)

    if (!isHost) return

    const newPlan = makeSpinPlan(taken)
    broadcastPlan(players[playerIdx].id, newPlan)
    setPlan(newPlan)
    setSpinning(true)
    setShowReveal(false)
    setLastRevealedText(null)
  }, [isHost, players, broadcastPlan])

  // ── Start player's turn with 15s Snake Border Countdown ─────────────────────
  const startTurn = useCallback((playerIdx: number) => {
    setPlan(null)
    setSpinning(false)
    setShowReveal(false)
    setRevealedColour(null)
    setLastRevealedText(null)
    setCurrentPlayerIdx(playerIdx)
    setIsAlert(false)

    // Clear any previous animation and timers
    if (turnTimerRef.current)  clearTimeout(turnTimerRef.current)
    if (alertTimerRef.current) clearTimeout(alertTimerRef.current)
    if (snakeAnim.current) { snakeAnim.current.stop(); snakeAnim.current = null }

    // Reset and start frame-perfect Animated.timing — zero setState per frame
    snakeProgress.setValue(0)
    const anim = Animated.timing(snakeProgress, {
      toValue:         1,
      duration:        TURN_COUNTDOWN_MS,
      easing:          Easing.linear,
      useNativeDriver: false, // SVG prop — cannot use native driver
    })
    snakeAnim.current = anim
    anim.start()

    // Flip to alert (red) at exactly 68% — one clean state update, not per-frame
    alertTimerRef.current = setTimeout(
      () => setIsAlert(true),
      TURN_COUNTDOWN_MS * 0.68,
    )

    // Auto-spin when 15 s expires
    turnTimerRef.current = setTimeout(() => {
      console.log('[ColourSpin] 15s turn expired — auto-spinning for player', playerIdx)
      triggerSpin(playerIdx, takenRef.current)
    }, TURN_COUNTDOWN_MS)
  }, [triggerSpin])

  // ── AppState: jump to final state on resume if interrupted ─────────────────
  const appStateRef = useRef<AppStateStatus>(AppState.currentState)
  const jumpToFinalState = useCallback(() => {
    const newMap   = { ...assignedMapRef.current }
    const newTaken = new Set(takenRef.current)

    if (effectiveMode === 'shared' && Object.keys(newMap).length > 0) {
      // already assigned
    } else {
      const startIdx = Object.keys(newMap).length
      for (let i = startIdx; i < players.length; i++) {
        const avail = WHEEL_COLOURS.map((_, idx) => idx).filter((idx) => !newTaken.has(idx))
        if (!avail.length) break
        const pick = avail[0]
        const c = WHEEL_COLOURS[pick]
        newMap[players[i].id] = {
          index: pick,
          name: c.name,
          hex: c.hex,
          readableTextOn: c.readableTextOn,
        }
        newTaken.add(pick)
      }
    }

    setAssignedMap(newMap)
    setTakenIndexes(newTaken)
    setSpinning(false)
    setShowReveal(false)
    setDone(true)
    triggerCountdown()
  }, [players, effectiveMode])

  useEffect(() => {
    const sub = AppState.addEventListener('change', (next) => {
      if (appStateRef.current !== 'active' && next === 'active' && spinning) {
        jumpToFinalState()
      }
      appStateRef.current = next
    })
    return () => sub.remove()
  }, [spinning, jumpToFinalState])

  // ── Wheel Landing onDone Callback ──────────────────────────────────────────
  const handleWheelDone = useCallback(() => {
    if (!plan) return

    const wc = WHEEL_COLOURS[plan.winnerIndex]
    const assigned: AssignedColour = {
      index:          plan.winnerIndex,
      name:           wc.name,
      hex:            wc.hex,
      readableTextOn: wc.readableTextOn,
    }

    setRevealedColour(assigned)
    const currentName = players[currentPlayerIdx].name
    const isSelf = currentPlayerIdx === 0
    const textResult = effectiveMode === 'shared'
      ? `Everyone hunts ${assigned.name}`
      : `${isSelf ? 'You' : currentName} got ${assigned.name}`

    setLastRevealedText(textResult)

    if (effectiveMode === 'shared') {
      const newMap: AssignedMap = {}
      players.forEach((p) => { newMap[p.id] = assigned })
      setAssignedMap(newMap)
      setTakenIndexes(new Set([plan.winnerIndex]))
      setSpinning(false)
      setShowReveal(true)

      betweenTimer.current = setTimeout(() => {
        setShowReveal(false)
        setDone(true)
        triggerCountdown()
      }, 1800)
    } else {
      const updatedMap   = { ...assignedMapRef.current, [players[currentPlayerIdx].id]: assigned }
      const updatedTaken = new Set(takenRef.current)
      updatedTaken.add(plan.winnerIndex)

      setAssignedMap(updatedMap)
      setTakenIndexes(updatedTaken)
      setSpinning(false)
      setShowReveal(true)

      betweenTimer.current = setTimeout(() => {
        setShowReveal(false)
        const nextIdx = currentPlayerIdx + 1
        if (nextIdx >= players.length) {
          setDone(true)
          triggerCountdown()
        } else {
          startTurn(nextIdx)
        }
      }, 1800)
    }
  }, [plan, players, currentPlayerIdx, effectiveMode, startTurn])

  // ── 3-2-1 Countdown & Navigation ───────────────────────────────────────────
  const triggerCountdown = useCallback(() => {
    setCountdown(3)
    setTimeout(() => setCountdown(2), 1000)
    setTimeout(() => setCountdown(1), 2000)
    setTimeout(() => {
      setCountdown(null)
      navigation.navigate('Round', {
        roomId:          undefined,
        roundId:         undefined,
        assignedColours: Object.fromEntries(
          Object.entries(assignedMapRef.current).map(([pid, ac]) => [
            pid,
            { id: ac.index, name: ac.name, hex: ac.hex },
          ])
        ),
      })
    }, 3200)
  }, [navigation])

  // ── Mount: Start first turn ────────────────────────────────────────────────
  useEffect(() => {
    startTurn(0)
    return () => {
      if (betweenTimer.current)  clearTimeout(betweenTimer.current)
      if (turnTimerRef.current)  clearTimeout(turnTimerRef.current)
      if (alertTimerRef.current) clearTimeout(alertTimerRef.current)
      if (snakeAnim.current) { snakeAnim.current.stop(); snakeAnim.current = null }
    }
  }, [startTurn])

  // ── Memoised ColourWheel Node ──────────────────────────────────────────────
  const WheelNode = useMemo(() => (
    <ColourWheel
      plan={plan}
      taken={takenSlots}
      onDone={handleWheelDone}
      canSpin={isMyTurn && !spinning}
      hubLabel={isMyTurn && !spinning ? 'SPIN' : '...'}
      onSpinPress={() => triggerSpin(currentPlayerIdx, takenRef.current)}
      reduceMotion={reduceMotion}
      size={WHEEL_SIZE}
    />
  ), [plan?.seed, takenSlots.length, isMyTurn, spinning, reduceMotion, currentPlayerIdx, triggerSpin, handleWheelDone])

  // ──────────────────────────────────────────────────────────────────────────
  // RENDER
  // ──────────────────────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <Animated.ScrollView
        style={{ backgroundColor: APP_THEME.background }}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: vs(36) + insets.bottom }]}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* ─── Red Hero Arena ────────────────────────────────────────────── */}
        <View style={styles.heroSection}>
          {/* Deep Ruby Gradient */}
          <Svg
            width={SCREEN_WIDTH}
            height="100%"
            style={[StyleSheet.absoluteFill, { left: 0 }]}
            preserveAspectRatio="none"
            pointerEvents="none"
          >
            <Defs>
              <LinearGradient id="heroRichGrad" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0%"   stopColor={HERO_TOP} stopOpacity="1" />
                <Stop offset="45%"  stopColor={HERO_MID} stopOpacity="1" />
                <Stop offset="100%" stopColor={HERO_BOT} stopOpacity="1" />
              </LinearGradient>
            </Defs>
            <Rect x="0" y="0" width={SCREEN_WIDTH} height="100%" fill="url(#heroRichGrad)" />
          </Svg>

          {/* Ambient Sparkles */}
          <AmbientSparkles reduceMotion={reduceMotion} />

          {/* Hanging Rope Bulbs — 3 strings, top-right hero corner */}
          <HangingBulbs reduceMotion={reduceMotion} />

          {/* Header Typography */}
          <View style={styles.heroHeader}>
            <Text style={styles.pageTitle}>
              Colour <Text style={styles.pageTitleAccent}>Spin</Text>
            </Text>

            {/* 4-Segment Underline */}
            <View style={styles.titleBarsRow}>
              <View style={[styles.titleBar, { backgroundColor: ACCENT.red.base }]} />
              <View style={[styles.titleBar, { backgroundColor: ACCENT.blue.base }]} />
              <View style={[styles.titleBar, { backgroundColor: ACCENT.green.base }]} />
              <View style={[styles.titleBar, { backgroundColor: ACCENT.yellow.base }]} />
            </View>

            {/* Dynamic Subtitle */}
            <Text style={styles.pageSubtitle}>{subtitleText}</Text>

            {/* Status Pill */}
            <View style={styles.statusPillRow}>
              <StatusPill
                text={pillText}
                isLocked={pillIsLocked}
                reduceMotion={reduceMotion}
              />
            </View>
          </View>

          {/* ─── Wheel Arena (Centred, 24dp top margin, 24dp bottom margin) ─── */}
          <View style={styles.wheelArea}>
            {/* Dual-Layer Soft Radial Glow */}
            <Svg
              width={WHEEL_SIZE + 50}
              height={WHEEL_SIZE + 50}
              style={{ position: 'absolute' }}
              pointerEvents="none"
            >
              <Defs>
                <RadialGradient id="wheelGlowWarm" cx="50%" cy="50%" rx="50%" ry="50%">
                  <Stop offset="0%"   stopColor="#FFF3B0" stopOpacity="0.25" />
                  <Stop offset="40%"  stopColor="#FFFFFF" stopOpacity="0.18" />
                  <Stop offset="75%"  stopColor="#FFFFFF" stopOpacity="0.06" />
                  <Stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
                </RadialGradient>
              </Defs>
              <Circle
                cx={(WHEEL_SIZE + 50) / 2}
                cy={(WHEEL_SIZE + 50) / 2}
                r={(WHEEL_SIZE + 50) / 2}
                fill="url(#wheelGlowWarm)"
              />
            </Svg>

            {/* Soft Rotating Light Rays */}
            <SoftLightRays size={WHEEL_SIZE} reduceMotion={reduceMotion} />

            {/* Under-wheel soft dark ellipse contact shadow (14dp offset down) */}
            <Svg
              width={WHEEL_SIZE * 0.84}
              height={32}
              style={[styles.wheelBottomShadow, { bottom: -14 }]}
              pointerEvents="none"
            >
              <Defs>
                <RadialGradient id="wheelContactShadow" cx="50%" cy="50%" rx="50%" ry="50%">
                  <Stop offset="0%"   stopColor="#000000" stopOpacity="0.32" />
                  <Stop offset="60%"  stopColor="#000000" stopOpacity="0.14" />
                  <Stop offset="100%" stopColor="#000000" stopOpacity="0" />
                </RadialGradient>
              </Defs>
              <Rect x="0" y="0" width={WHEEL_SIZE * 0.84} height={32} fill="url(#wheelContactShadow)" />
            </Svg>

            {/* The Wheel */}
            {WheelNode}
          </View>
        </View>

        {/* ─── White Sheet with Rounded Corners (28dp) ────────────────────── */}
        <View style={styles.sheetContainer}>
          {/* Primary Action Button */}
          <SpinButton
            isMyTurn={isMyTurn}
            spinning={spinning}
            otherPlayerName={currentPlayer.name}
            onSpin={() => triggerSpin(currentPlayerIdx, takenRef.current)}
            reduceMotion={reduceMotion}
          />

          {/* Deluxe Players Card */}
          <View style={styles.playersCard}>
            <View style={[styles.cardAccentBar, { backgroundColor: done ? ACCENT.green.base : ACCENT.amber.base }]} />
            <View style={styles.cardHeader}>
              <View style={[styles.cardHeaderDot, { backgroundColor: done ? ACCENT.green.base : ACCENT.amber.base }]} />
              <Text style={styles.cardHeaderTitle}>PLAYERS</Text>
              <View style={styles.cardHeaderSpacer} />
              <View style={styles.roundBadge}>
                <Text style={styles.roundBadgeText}>ROUND {currentRound}/{totalRoundsN}</Text>
              </View>
            </View>
            <View style={styles.cardBody}>
              {players.map((player, i) => (
                <PlayerRow
                  key={player.id}
                  player={player}
                  index={i}
                  assigned={assignedMap[player.id]}
                  isCurrentTurn={i === currentPlayerIdx && !done}
                  snakeProgress={snakeProgress}
                  isAlert={isAlert}
                  spinning={spinning}
                  reduceMotion={reduceMotion}
                />
              ))}
            </View>
          </View>
        </View>
      </Animated.ScrollView>

      {/* Deluxe Confetti Burst */}
      <DeluxeConfettiBurst
        color={revealedColour?.hex || '#FFFFFF'}
        visible={showReveal}
        reduceMotion={reduceMotion}
      />

      {/* Showstopper Reveal Modal */}
      <RevealCard
        visible={showReveal && !reduceMotion}
        colour={revealedColour}
        playerName={players[currentPlayerIdx]?.name || 'Player'}
        playerAvatarColor={SLOT_AVATARS[currentPlayerIdx % SLOT_AVATARS.length]}
        sharedMode={effectiveMode === 'shared'}
        reduceMotion={reduceMotion}
      />

      {/* 3-2-1 Countdown Overlay */}
      <CountdownOverlay count={countdown} />
    </SafeAreaView>
  )
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: {
    flex:            1,
    backgroundColor: HERO_TOP,
  },
  scrollContent: {
    flexGrow: 1,
  },

  /* ── Hero Arena ── */
  heroSection: {
    overflow:             'visible',
    backgroundColor:      HERO_BOT,
    borderBottomLeftRadius:  s(28),
    borderBottomRightRadius: s(28),
    paddingBottom:        vs(24),
    position:             'relative',
  },
  heroHeader: {
    paddingHorizontal: s(20),
    paddingTop:        vs(16),
  },
  pageTitle: {
    fontSize:     ms(32),
    fontWeight:   '900',
    color:        COLORS.pure_white,
    letterSpacing: -0.5,
    lineHeight:   ms(38),
    textShadowColor:  'rgba(0,0,0,0.25)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  pageTitleAccent: {
    color: COLORS.yellow500,
    textShadowColor:  'rgba(255,201,60,0.4)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  titleBarsRow: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           s(5),
    marginTop:     vs(8),
    marginBottom:  vs(8),
  },
  titleBar: {
    width:        s(14),
    height:       vs(3.5),
    borderRadius: 2,
  },
  pageSubtitle: {
    fontSize:   ms(14),
    fontWeight: '700',
    color:      COLORS.pure_white,
    lineHeight: ms(20),
    opacity:    0.95,
  },
  statusPillRow: {
    marginTop: vs(10),
  },

  /* ── Wheel Arena ── */
  wheelArea: {
    alignItems:        'center',
    justifyContent:    'center',
    marginTop:         vs(24), // 24dp above wheel for pointer
    position:          'relative',
    paddingHorizontal: s(16),
  },
  wheelBottomShadow: {
    position:  'absolute',
    alignSelf: 'center',
    zIndex:    0,
  },

  /* ── Sheet Container ── */
  sheetContainer: {
    backgroundColor:      APP_THEME.background,
    borderTopLeftRadius:  s(28),
    borderTopRightRadius: s(28),
    marginTop:            vs(-22),
    paddingTop:           vs(20),
    shadowColor:          '#000',
    shadowOffset:         { width: 0, height: -4 },
    shadowOpacity:        0.08,
    shadowRadius:         14,
    elevation:            8,
  },

  /* ── Players Card ── */
  playersCard: {
    backgroundColor:  APP_THEME.surface,
    borderRadius:     s(20),
    borderWidth:      1,
    borderColor:      APP_THEME.surfaceBorder,
    overflow:         'hidden',
    marginHorizontal: s(16),
    marginBottom:     vs(16),
    shadowColor:      '#000',
    shadowOffset:     { width: 0, height: vs(3) },
    shadowOpacity:    0.08,
    shadowRadius:     s(10),
    elevation:        3,
  },
  cardAccentBar: {
    height: vs(3.5),
    width:  '100%',
  },
  cardHeader: {
    flexDirection:     'row',
    alignItems:        'center',
    gap:               s(8),
    paddingHorizontal: s(16),
    paddingTop:        vs(12),
    paddingBottom:     vs(8),
  },
  cardHeaderDot: {
    width:        s(7),
    height:       s(7),
    borderRadius: s(3.5),
  },
  cardHeaderTitle: {
    fontSize:      ms(12),
    fontWeight:    '800',
    color:         APP_THEME.text,
    letterSpacing: 1.0,
  },
  cardHeaderSpacer: {
    flex: 1,
  },
  roundBadge: {
    backgroundColor:   APP_THEME.surfaceElevated,
    paddingHorizontal: s(8),
    paddingVertical:   vs(3),
    borderRadius:      s(6),
    borderWidth:       1,
    borderColor:       APP_THEME.surfaceBorder,
  },
  roundBadgeText: {
    fontSize:      ms(10),
    fontWeight:    '800',
    color:         APP_THEME.textSecondary,
    letterSpacing: 0.5,
  },
  cardBody: {
    paddingHorizontal: s(16),
    paddingBottom:     vs(12),
    paddingTop:        vs(2),
  },
})
