/**
 * FloatingPolaroid — animated wrapper around MiniPolaroid.
 *
 * Floats vertically (4-6 s, small movement) with a tiny rotation swing
 * (±2°). Uses native driver only (transform). Respects reduceMotion.
 *
 * Optional `popAnim` (Animated.Value 0→1) triggers a scale-pop effect
 * so the parent can animate a random frame popping in.
 */

import React, { useEffect, useRef } from 'react'
import { Animated, Easing } from 'react-native'
import { MiniPolaroid, SceneType } from './MiniPolaroid'

interface Props {
  /** dp from the left edge of the heroSvgWrapper */
  left: number
  /** dp from the top edge of the heroSvgWrapper */
  top: number
  /** Polaroid width in dp */
  size: number
  /** Static tilt angle in degrees (negative = CCW, positive = CW) */
  tilt: number
  /** Scene to draw inside the polaroid */
  scene: SceneType
  /** Float cycle duration in ms (4000–6000) */
  duration: number
  /** Initial delay before the first float starts (ms) */
  delay: number
  /** Reduce-motion: stop all animations if true */
  reduceMotion: boolean
  /**
   * Optional external Animated.Value (0→1) that drives a pop-scale on this frame.
   * Parent controls when to fire it. Pass undefined to skip.
   */
  popAnim?: Animated.Value
}

export function FloatingPolaroid({
  left,
  top,
  size,
  tilt,
  scene,
  duration,
  delay,
  reduceMotion,
  popAnim,
}: Props) {
  const floatAnim = useRef(new Animated.Value(0)).current

  // ── Float animation loop ───────────────────────────────────────────────────
  useEffect(() => {
    if (reduceMotion) {
      floatAnim.stopAnimation()
      floatAnim.setValue(0)
      return
    }

    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: duration / 2,
          delay,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: duration / 2,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    )
    loop.start()
    return () => loop.stop()
  }, [reduceMotion, duration, delay])

  // ── Interpolations ─────────────────────────────────────────────────────────
  // translateY: ±6 dp gentle float
  const translateY = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -6],
  })

  // rotate swing: tilt ± 2° (all via native driver)
  const rotate = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [`${tilt}deg`, `${tilt + 2}deg`],
  })

  // pop scale from external Animated.Value
  const popScale = popAnim
    ? popAnim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [1, 1.18, 1] })
    : 1

  const transformArr: any[] = [
    { translateY },
    { rotate },
    ...(popAnim ? [{ scale: popScale }] : []),
  ]

  return (
    <Animated.View
      style={{
        position: 'absolute',
        left,
        top,
        transform: transformArr,
      }}
      pointerEvents="none"
    >
      <MiniPolaroid size={size} scene={scene} />
    </Animated.View>
  )
}

export default FloatingPolaroid
