import React, { useEffect, useRef } from 'react'
import { Animated, Easing, View } from 'react-native'
import Svg, { Circle, G, Text as SvgText } from 'react-native-svg'
import { COLORS } from '../../src/constants/colors'

interface Props {
  size?: number
  durationSeconds?: number
  animate?: boolean
  label?: string
  strokeWidth?: number
}

const AnimatedCircle = Animated.createAnimatedComponent(Circle)

export function TimerRing({
  size = 56,
  durationSeconds = 60,
  animate = true,
  label,
  strokeWidth = 4,
}: Props) {
  const radius = (size - strokeWidth * 2) / 2
  const circumference = 2 * Math.PI * radius
  const progressAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    if (!animate) return
    const anim = Animated.loop(
      Animated.timing(progressAnim, {
        toValue: 1,
        duration: durationSeconds * 1000,
        easing: Easing.linear,
        useNativeDriver: false,
      })
    )
    anim.start()
    return () => anim.stop()
  }, [animate, durationSeconds])

  const strokeDashoffset = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, circumference],
  })

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Background Track */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={COLORS.red100}
          strokeWidth={strokeWidth}
          fill="none"
        />

        {/* Animated Draining Ring */}
        <G rotation="-90" origin={`${size / 2}, ${size / 2}`}>
          <AnimatedCircle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={COLORS.red500}
            strokeWidth={strokeWidth}
            strokeDasharray={`${circumference} ${circumference}`}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="none"
          />
        </G>

        {/* Center Text or Icon */}
        {label ? (
          <SvgText
            x={size / 2}
            y={size / 2 + 4}
            textAnchor="middle"
            fill={COLORS.red700}
            fontSize="12"
            fontWeight="bold"
          >
            {label}
          </SvgText>
        ) : null}
      </Svg>
    </View>
  )
}

export default TimerRing

