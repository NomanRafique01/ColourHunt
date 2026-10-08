/**
 * LoginHuntArt.tsx — "The Hunt" animated hero with camera & real-world objects.
 * Straight, perfectly fitted 4x4 grid (no tilt), clean spacing without overlay.
 */

import React, { memo, useCallback, useEffect, useState } from 'react'
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native'
import Animated, {
  cancelAnimation,
  Easing,
  Extrapolation,
  interpolate,
  runOnJS,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated'
import Svg, {
  Circle,
  Defs,
  Line,
  Path,
  RadialGradient,
  Rect,
  Stop,
} from 'react-native-svg'
import { WHEEL_COLOURS } from '../wheel/wheelLogic'
import { HUNT_COLORS, HUNT_TIMELINE } from './huntTimeline'
import { GridObjectIcon } from './objects'

function safeHaptic() {
  try {
    const Haptics = require('expo-haptics')
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
  } catch { }
}

// 4x4 Grid layout constants (Compact best-fit: 26dp cell, 131dp board)
const TILE_SIZE = 26
const TILE_GAP = 5
const BOARD_PADDING = 6
const BOARD_SIZE = 4 * TILE_SIZE + 3 * TILE_GAP + 2 * BOARD_PADDING // 131dp
const STEP = TILE_SIZE + TILE_GAP // 31dp

// Cell center coordinates [col, row]
const W1 = { x: BOARD_PADDING + 1 * STEP + TILE_SIZE / 2, y: BOARD_PADDING + 0 * STEP + TILE_SIZE / 2 } // 50, 19
const W2 = { x: BOARD_PADDING + 3 * STEP + TILE_SIZE / 2, y: BOARD_PADDING + 1 * STEP + TILE_SIZE / 2 } // 112, 50
const W3 = { x: BOARD_PADDING + 0 * STEP + TILE_SIZE / 2, y: BOARD_PADDING + 2 * STEP + TILE_SIZE / 2 } // 19, 81
const TG = { x: BOARD_PADDING + 2 * STEP + TILE_SIZE / 2, y: BOARD_PADDING + 2 * STEP + TILE_SIZE / 2 } // 81, 81 (row 2, col 2)

const DRIFT_DOTS = [
  { cx: 12, cy: 22, r: 2.8, c: WHEEL_COLOURS[0].hex },
  { cx: 182, cy: 30, r: 3.2, c: WHEEL_COLOURS[7].hex },
  { cx: 15, cy: 125, r: 2.5, c: WHEEL_COLOURS[4].hex },
  { cx: 180, cy: 120, r: 3, c: WHEEL_COLOURS[2].hex },
  { cx: 96, cy: 6, r: 2.2, c: WHEEL_COLOURS[8].hex },
  { cx: 94, cy: 142, r: 2.6, c: WHEEL_COLOURS[3].hex },
]

// Pre-computed 8 spectrum pie slice paths (cx=11, cy=11, r=9.5)
const SPECTRUM_COLORS = ['#FF2D2D', '#FF8C00', '#FFE000', '#7FFF00', '#00CC55', '#00D4FF', '#3B5BFF', '#9B30FF']
const SPECTRUM_SLICES = [
  'M11 11 L11 1.5 A9.5 9.5 0 0 1 17.72 4.28 Z',
  'M11 11 L17.72 4.28 A9.5 9.5 0 0 1 20.5 11 Z',
  'M11 11 L20.5 11 A9.5 9.5 0 0 1 17.72 17.72 Z',
  'M11 11 L17.72 17.72 A9.5 9.5 0 0 1 11 20.5 Z',
  'M11 11 L11 20.5 A9.5 9.5 0 0 1 4.28 17.72 Z',
  'M11 11 L4.28 17.72 A9.5 9.5 0 0 1 1.5 11 Z',
  'M11 11 L1.5 11 A9.5 9.5 0 0 1 4.28 4.28 Z',
  'M11 11 L4.28 4.28 A9.5 9.5 0 0 1 11 1.5 Z',
]

export const LoginHuntArt = memo(function LoginHuntArt({
  isFocused = true,
  reduceMotion = false,
  isKeyboardVisible = false,
  scale: propScale,
}: {
  isFocused?: boolean
  reduceMotion?: boolean
  isKeyboardVisible?: boolean
  scale?: number
}) {
  const { height: screenHeight } = useWindowDimensions()
  // Responsive auto-scale based on screen height (844dp reference base)
  const autoScale = Math.max(0.70, Math.min(1.05, Number((screenHeight / 844).toFixed(2))))
  const scale = propScale ?? autoScale
  const [targetIndex, setTargetIndex] = useState(7) // Blue start
  const [collected, setCollected] = useState<number[]>([])
  const [gridIndices, setGridIndices] = useState<number[]>(() => {
    const others = Array.from({ length: 12 }, (_, i) => i).filter((i) => i !== 7).sort(() => Math.random() - 0.5)
    return Array.from({ length: 16 }, (_, i) => (i === 10 ? 7 : others[i % others.length]))
  })

  const introDrop = useSharedValue(reduceMotion ? 0 : -30)
  const introSlide = useSharedValue(reduceMotion ? 0 : 35)
  const floatAnim = useSharedValue(0)
  const lensSpin = useSharedValue(0)
  const kbScale = useSharedValue(1)
  const kbOpacity = useSharedValue(1)
  const progress = useSharedValue(reduceMotion ? 3600 : 0)

  const advanceLoop = useCallback(() => {
    setTargetIndex((prev) => {
      let next = Math.floor(Math.random() * WHEEL_COLOURS.length)
      while (next === prev) next = Math.floor(Math.random() * WHEEL_COLOURS.length)
      const others = Array.from({ length: 12 }, (_, i) => i).filter((i) => i !== next).sort(() => Math.random() - 0.5)
      setGridIndices(Array.from({ length: 16 }, (_, i) => (i === 10 ? next : others[i % others.length])))
      setCollected((cPrev) => {
        const updated = [...cPrev, prev]
        return updated.length > 3 ? [prev] : updated
      })
      return next
    })
  }, [])

  useEffect(() => {
    if (reduceMotion) return
    introDrop.value = withSpring(0, { damping: 14, stiffness: 120 })
    introSlide.value = withTiming(0, { duration: 1100, easing: Easing.out(Easing.cubic) })
    floatAnim.value = withRepeat(
      withSequence(
        withTiming(-2.5, { duration: 1300, easing: Easing.inOut(Easing.sin) }),
        withTiming(2.5, { duration: 1300, easing: Easing.inOut(Easing.sin) })
      ),
      -1,
      true
    )
    lensSpin.value = withRepeat(
      withTiming(360, { duration: 8000, easing: Easing.linear }),
      -1,
      false
    )
  }, [reduceMotion])

  useEffect(() => {
    kbScale.value = withTiming(isKeyboardVisible ? 0.6 : 1, { duration: 200 })
    kbOpacity.value = withTiming(isKeyboardVisible ? 0 : 1, { duration: 200 })
  }, [isKeyboardVisible])

  useEffect(() => {
    if (reduceMotion || !isFocused) {
      cancelAnimation(progress)
      if (reduceMotion) progress.value = 3600
      return
    }
    progress.value = 0
    progress.value = withRepeat(
      withTiming(HUNT_TIMELINE.LOOP_DURATION, { duration: HUNT_TIMELINE.LOOP_DURATION, easing: Easing.linear }),
      -1,
      false
    )
    return () => cancelAnimation(progress)
  }, [isFocused, reduceMotion])

  useAnimatedReaction(
    () => progress.value,
    (curr, prev) => {
      if (prev !== null && !isKeyboardVisible) {
        if (curr < prev && prev > 5000) runOnJS(advanceLoop)()
        if (prev < HUNT_TIMELINE.SNAP_START && curr >= HUNT_TIMELINE.SNAP_START) runOnJS(safeHaptic)()
      }
    }
  )

  const handleHeroTap = useCallback(() => {
    safeHaptic()
    if (!reduceMotion) progress.value = HUNT_TIMELINE.SNAP_START
  }, [reduceMotion])

  const targetColor = WHEEL_COLOURS[targetIndex]

  // Camera glide motion (centers camera over each cell)
  const rigStyle = useAnimatedStyle(() => {
    const t = progress.value
    const cx = interpolate(
      t,
      [0, 600, 1100, 1400, 1900, 2200, 2700, 3000, 3600, 5200, 6000],
      [W1.x - 16, W1.x - 16, W1.x, W1.x, W2.x, W2.x, W3.x, W3.x, TG.x, TG.x, W1.x - 16],
      Extrapolation.CLAMP
    )
    const cy = interpolate(
      t,
      [0, 600, 1100, 1400, 1900, 2200, 2700, 3000, 3600, 5200, 6000],
      [W1.y - 10, W1.y - 10, W1.y, W1.y, W2.y, W2.y, W3.y, W3.y, TG.y, TG.y, W1.y - 10],
      Extrapolation.CLAMP
    )
    const wobble = interpolate(t, [1200, 1280, 1360, 2000, 2080, 2160, 2800, 2880, 2960], [0, 2, 0, 0, -2, 0, 0, 2, 0], Extrapolation.CLAMP)
    const recoil = interpolate(t, [3600, 3680, 3850], [0, -2, 0], Extrapolation.CLAMP)

    return {
      transform: [
        { translateX: cx + introSlide.value + wobble },
        { translateY: cy + recoil },
      ],
    }
  })

  // Camera shutter button press
  const shutterStyle = useAnimatedStyle(() => {
    const py = interpolate(progress.value, [3600, 3680, 3850], [0, 1.8, 0], Extrapolation.CLAMP)
    return { transform: [{ translateY: py }] }
  })

  // Flash lamp fire glow
  const flashLampStyle = useAnimatedStyle(() => {
    const op = interpolate(progress.value, [3600, 3660, 3820], [0, 1, 0], Extrapolation.CLAMP)
    return { opacity: op }
  })

  // Board flash (3.6s - 3.8s)
  const boardFlashStyle = useAnimatedStyle(() => {
    const op = interpolate(progress.value, [3600, 3700, 3800], [0, 0.8, 0], Extrapolation.CLAMP)
    return { opacity: op }
  })

  // Target chip entrance pop
  const chipStyle = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(progress.value, [0, 600], [0.8, 1], Extrapolation.CLAMP) }],
  }))

  // Target object scale under camera & refill pop
  const targetObjectScaleStyle = useAnimatedStyle(() => {
    const t = progress.value
    const magScale = interpolate(t, [3000, 3600, 4000], [1, 1.15, 1], Extrapolation.CLAMP)
    const refillScale = interpolate(t, [4000, 4050, 5200, 5600], [1, 0, 0, 1], Extrapolation.CLAMP)
    return { transform: [{ scale: magScale * refillScale }] }
  })

  // Lifting mini polaroid with photo
  const liftPolaroidStyle = useAnimatedStyle(() => {
    const t = progress.value
    return {
      opacity: interpolate(t, [3950, 4000, 5200, 5300], [0, 1, 1, 0], Extrapolation.CLAMP),
      transform: [
        { translateX: interpolate(t, [4000, 5000, 5200], [TG.x - 11, 106, 106], Extrapolation.CLAMP) },
        { translateY: interpolate(t, [4000, 5000, 5200], [TG.y - 13, -15, -15], Extrapolation.CLAMP) },
        { rotate: `${interpolate(t, [4000, 4800], [0, 6], Extrapolation.CLAMP)}deg` },
      ],
    }
  })

  const spectrumSpinStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${lensSpin.value}deg` }],
  }))

  // Straight board (NO tilt / rotation)
  const boardStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: introDrop.value }],
  }))

  const rootStyle = useAnimatedStyle(() => ({
    opacity: kbOpacity.value,
    transform: [
      { scale: kbScale.value * scale },
      { translateY: floatAnim.value * scale },
    ],
  }))

  const scaledWidth = Math.round(190 * scale)
  const scaledHeight = Math.round(156 * scale)

  return (
    <View
      style={[
        styles.scaleWrapper,
        {
          width: scaledWidth,
          height: scaledHeight,
        },
      ]}
      pointerEvents="box-none"
    >
      <Animated.View style={[styles.box, rootStyle]} accessible={false} importantForAccessibility="no-hide-descendants">
        <Pressable onPress={handleHeroTap} style={StyleSheet.absoluteFill} />

      {/* Background Atmosphere Glow & Drifting Dots */}
      <Svg width={190} height={148} style={StyleSheet.absoluteFill} pointerEvents="none">
        <Defs>
          <RadialGradient id="huntGlow" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor="#FFF" stopOpacity="0.28" />
            <Stop offset="75%" stopColor="#FFF" stopOpacity="0.08" />
            <Stop offset="100%" stopColor="#FFF" stopOpacity="0" />
          </RadialGradient>
        </Defs>
        <Circle cx={95} cy={74} r={64} fill="url(#huntGlow)" />
        {DRIFT_DOTS.map((d, i) => (
          <Circle key={i} cx={d.cx} cy={d.cy} r={d.r} fill={d.c} opacity={0.8} />
        ))}
      </Svg>

      {/* Collected Polaroids Stack (top-right of art box) */}
      <View style={styles.collectedStack} pointerEvents="none">
        {collected.slice(-3).map((colId, idx) => (
          <View
            key={idx}
            style={[
              styles.miniPolaroid,
              { position: 'absolute', right: idx * 3, top: idx * 2, transform: [{ rotate: `${(idx - 1) * 4}deg` }] },
            ]}
          >
            <View style={styles.miniPolaroidInner}>
              <GridObjectIcon colorId={colId} size={12} />
            </View>
          </View>
        ))}
      </View>

      {/* Main Board — straight & upright (NO tilt) */}
      <Animated.View style={[styles.board, boardStyle]}>
        {/* Target Chip — placed neatly above the board's top-left corner */}
        <Animated.View style={[styles.chip, chipStyle]}>
          <Text style={styles.chipFind}>Find</Text>
          <View style={[styles.chipDot, { backgroundColor: targetColor.hex }]} />
          <Text style={styles.chipName} numberOfLines={1}>{targetColor.name}</Text>
        </Animated.View>

        {/* 4x4 Grid of Real-world Objects */}
        <View style={styles.grid}>
          {gridIndices.map((colorId, i) => {
            const isTarget = i === 10
            return (
              <View key={i} style={styles.cell}>
                <Animated.View style={[styles.objectWrapper, isTarget && targetObjectScaleStyle]}>
                  <GridObjectIcon colorId={colorId} size={20} />
                </Animated.View>
              </View>
            )
          })}
        </View>

        {/* Lifting Mini Polaroid with Photo */}
        <Animated.View style={[styles.liftingPolaroid, liftPolaroidStyle]} pointerEvents="none">
          <View style={styles.liftingInner}>
            <GridObjectIcon colorId={targetIndex} size={14} />
          </View>
        </Animated.View>

        {/* Board Flash */}
        <Animated.View style={[styles.boardFlash, boardFlashStyle]} pointerEvents="none" />

        {/* ── Mini Camera (Hovering directly over cell) ── */}
        <Animated.View style={[styles.cameraRig, rigStyle]} pointerEvents="none">
          <View style={styles.cameraBox}>
            {/* Shutter Button (top-right) */}
            <Animated.View style={[styles.shutterBtn, shutterStyle]} />

            {/* Camera Body SVG */}
            <Svg width={44} height={32}>
              {/* Top plate */}
              <Rect x={5} y={1.5} width={20} height={4} rx={1.2} fill="#33333F" />
              {/* Main body */}
              <Rect x={0} y={5} width={44} height={27} rx={5} fill="#1F1F29" stroke="#5A5A6A" strokeWidth={0.9} />
              {/* Brass accent stripe */}
              <Rect x={0} y={13} width={44} height={1.6} fill="#E2B04A" opacity={0.85} />
              {/* Left rubber grip */}
              <Rect x={2.5} y={8.5} width={5} height={20} rx={1.2} fill="#161620" />
              <Line x1={4} y1={12} x2={4} y2={25} stroke="rgba(255,255,255,0.15)" strokeWidth={0.8} />
              {/* Cream Flash Lamp */}
              <Rect x={7} y={6.5} width={7.5} height={5.5} rx={1.2} fill="#FFF8E7" stroke="#E2B04A" strokeWidth={0.9} />
            </Svg>

            {/* Flash Lamp Firing Glow */}
            <Animated.View style={[styles.flashLampGlow, flashLampStyle]}>
              <View style={styles.flashWhiteCircle} />
            </Animated.View>

            {/* Spectrum Lens (22dp) */}
            <View style={styles.lensContainer}>
              <Animated.View style={[styles.spectrumDisk, spectrumSpinStyle]}>
                <Svg width={22} height={22}>
                  {SPECTRUM_SLICES.map((d, idx) => (
                    <Path key={idx} d={d} fill={SPECTRUM_COLORS[idx]} />
                  ))}
                  {/* Center pupil */}
                  <Circle cx={11} cy={11} r={4.5} fill="#0A0A12" />
                  <Circle cx={9.5} cy={9.5} r={1.2} fill="#FFFFFF" opacity={0.8} />
                </Svg>
              </Animated.View>
              {/* Outer lens ring */}
              <Svg width={22} height={22} style={StyleSheet.absoluteFill}>
                <Circle cx={11} cy={11} r={10} stroke="#111118" strokeWidth={1.8} fill="none" />
              </Svg>
            </View>
          </View>
        </Animated.View>
      </Animated.View>
    </Animated.View>
  </View>
  )
})

const styles = StyleSheet.create({
  scaleWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  box: { width: 190, height: 156, alignItems: 'center', justifyContent: 'center' },
  board: {
    width: BOARD_SIZE,
    height: BOARD_SIZE,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: BOARD_PADDING,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.14,
    shadowRadius: 8,
    elevation: 7,
    marginTop: 18,
  },
  chip: {
    position: 'absolute',
    top: -24,
    left: 0,
    height: 22,
    backgroundColor: '#FFFFFF',
    borderRadius: 11,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 7,
    gap: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 3,
    elevation: 4,
    zIndex: 15,
  },
  chipFind: { fontSize: 11, fontWeight: '700', color: HUNT_COLORS.CHARCOAL },
  chipDot: { width: 8, height: 8, borderRadius: 4 },
  chipName: { fontSize: 11, fontWeight: '800', color: HUNT_COLORS.CHARCOAL },
  grid: {
    width: '100%',
    height: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: TILE_GAP,
  },
  cell: {
    width: TILE_SIZE,
    height: TILE_SIZE,
    borderRadius: 6,
    backgroundColor: '#F3F3F8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  objectWrapper: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraRig: {
    position: 'absolute',
    left: -22,
    top: -16,
    width: 44,
    height: 32,
    zIndex: 25,
  },
  cameraBox: {
    width: 44,
    height: 32,
    position: 'relative',
  },
  shutterBtn: {
    position: 'absolute',
    top: 1.5,
    right: 5,
    width: 6.5,
    height: 3.5,
    borderRadius: 1.2,
    backgroundColor: '#E40C1A',
    zIndex: 2,
  },
  flashLampGlow: {
    position: 'absolute',
    top: 3,
    left: 5,
    zIndex: 10,
  },
  flashWhiteCircle: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
    shadowColor: '#FFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 5,
    elevation: 5,
  },
  lensContainer: {
    position: 'absolute',
    left: 17,
    top: 7.5,
    width: 22,
    height: 22,
  },
  spectrumDisk: {
    width: 22,
    height: 22,
  },
  boardFlash: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    zIndex: 30,
  },
  miniPolaroid: {
    width: 20,
    height: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 3,
    padding: 1.8,
    paddingBottom: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 3,
  },
  miniPolaroidInner: {
    flex: 1,
    borderRadius: 2,
    backgroundColor: '#F3F3F8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  liftingPolaroid: {
    position: 'absolute',
    width: 23,
    height: 28,
    backgroundColor: '#FFFFFF',
    borderRadius: 3.5,
    padding: 2,
    paddingBottom: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2.5 },
    shadowOpacity: 0.22,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 25,
  },
  liftingInner: {
    flex: 1,
    borderRadius: 2,
    backgroundColor: '#F3F3F8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  collectedStack: {
    position: 'absolute',
    top: 4,
    right: 10,
    width: 30,
    height: 26,
    zIndex: 5,
  },
})

export default LoginHuntArt
