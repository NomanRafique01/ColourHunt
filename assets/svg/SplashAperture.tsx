import React, { useEffect, useRef } from 'react'
import { Animated, Easing, View } from 'react-native'
import Svg, { Circle, Path, Rect, G } from 'react-native-svg'
import { COLORS } from '../../src/constants/colors'

interface Props {
  size?: number
  animate?: boolean
}

export default function SplashAperture({ size = 96, animate = true }: Props) {
  const openAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    if (!animate) return
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(openAnim, {
          toValue: 1,
          duration: 1800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(openAnim, {
          toValue: 0,
          duration: 1800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    )
    loop.start()
    return () => loop.stop()
  }, [animate])

  // Scale of iris opening
  const irisScale = openAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.85, 1.2],
  })

  const spin = openAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '30deg'],
  })

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} viewBox="0 0 96 96" fill="none">
        {/* App Icon Squircle Container */}
        <Rect width="96" height="96" rx="24" fill={COLORS.red500} />

        {/* Camera Outer Lens Barrel */}
        <Circle cx="48" cy="48" r="36" fill={COLORS.red700} stroke={COLORS.red800} strokeWidth="3" />
        <Circle cx="48" cy="48" r="30" fill={COLORS.red900} />
      </Svg>

      {/* Opening Aperture Blades with gentle breathing scale & rotate */}
      <Animated.View
        style={{
          position: 'absolute',
          width: size * (52 / 96),
          height: size * (52 / 96),
          transform: [{ scale: irisScale }, { rotate: spin }],
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Svg width="100%" height="100%" viewBox="0 0 52 52" fill="none">
          {/* Flat 6-blade aperture in red shades */}
          <Path d="M26 26 L26 2 A24 24 0 0 1 46.8 14 Z" fill={COLORS.red400} />
          <Path d="M26 26 L46.8 14 A24 24 0 0 1 46.8 38 Z" fill={COLORS.red500} />
          <Path d="M26 26 L46.8 38 A24 24 0 0 1 26 50 Z" fill={COLORS.red600} />
          <Path d="M26 26 L26 50 A24 24 0 0 1 5.2 38 Z" fill={COLORS.red700} />
          <Path d="M26 26 L5.2 38 A24 24 0 0 1 5.2 14 Z" fill={COLORS.red400} />
          <Path d="M26 26 L5.2 14 A24 24 0 0 1 26 2 Z" fill={COLORS.red500} />

          {/* Aperture Center Eye */}
          <Circle cx="26" cy="26" r="8" fill={COLORS.red100} />
          <Circle cx="26" cy="26" r="4" fill={COLORS.red700} />
        </Svg>
      </Animated.View>
    </View>
  )
}
