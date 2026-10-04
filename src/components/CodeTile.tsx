import React, { useEffect, useRef } from 'react'
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Platform,
  TouchableOpacity,
} from 'react-native'
import { ACCENT, COLORS } from '../constants/colors'
import { s, vs, ms } from '../utils/scale'

export type CodeTileState = 'empty' | 'active' | 'filled' | 'error'

export const CODE_TILE_PALETTE = [
  // 0: Red
  {
    emptyFill: COLORS.pure_white,
    emptyBorder: 'rgba(228, 12, 26, 0.28)',
    activeBorder: ACCENT.red.base,
    cursorColor: ACCENT.red.base,
    filledFill: ACCENT.red.light,
    filledBorder: ACCENT.red.base,
    filledText: ACCENT.red.dark,
  },
  // 1: Blue
  {
    emptyFill: COLORS.pure_white,
    emptyBorder: 'rgba(47, 107, 255, 0.28)',
    activeBorder: ACCENT.blue.base,
    cursorColor: ACCENT.blue.base,
    filledFill: ACCENT.blue.light,
    filledBorder: ACCENT.blue.base,
    filledText: ACCENT.blue.dark,
  },
  // 2: Green
  {
    emptyFill: COLORS.pure_white,
    emptyBorder: 'rgba(31, 179, 91, 0.28)',
    activeBorder: ACCENT.green.base,
    cursorColor: ACCENT.green.base,
    filledFill: ACCENT.green.light,
    filledBorder: ACCENT.green.base,
    filledText: ACCENT.green.dark,
  },
  // 3: Yellow
  {
    emptyFill: COLORS.pure_white,
    emptyBorder: 'rgba(255, 201, 60, 0.45)',
    activeBorder: ACCENT.yellow.base,
    cursorColor: ACCENT.yellow.dark,
    filledFill: ACCENT.yellow.light,
    filledBorder: ACCENT.yellow.base,
    filledText: ACCENT.yellow.dark, // #3B2F00
  },
  // 4: Purple (repeating fallback)
  {
    emptyFill: COLORS.pure_white,
    emptyBorder: 'rgba(124, 58, 237, 0.28)',
    activeBorder: ACCENT.purple.base,
    cursorColor: ACCENT.purple.base,
    filledFill: ACCENT.purple.light,
    filledBorder: ACCENT.purple.base,
    filledText: ACCENT.purple.dark,
  },
] as const

interface CodeTileProps {
  char?: string
  index: number
  state?: CodeTileState
  isError?: boolean
  shakeAnim?: Animated.Value
  onPress?: () => void
}

export function CodeTile({
  char = '',
  index,
  state: manualState,
  isError = false,
  shakeAnim,
  onPress,
}: CodeTileProps) {
  const pal = CODE_TILE_PALETTE[index % CODE_TILE_PALETTE.length]
  const popAnim = useRef(new Animated.Value(1)).current
  const cursorOpacity = useRef(new Animated.Value(1)).current

  // Derive state if not manually given
  const derivedState: CodeTileState = manualState
    ? manualState
    : isError
    ? 'error'
    : char.length > 0
    ? 'filled'
    : 'empty'

  const effectiveState = isError ? 'error' : derivedState

  // Pop animation on char entry / state transition to filled
  useEffect(() => {
    if (char && effectiveState === 'filled') {
      Animated.sequence([
        Animated.timing(popAnim, { toValue: 1.14, duration: 100, useNativeDriver: true }),
        Animated.timing(popAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
      ]).start()
    }
  }, [char, effectiveState])

  // Blinking cursor for active state
  useEffect(() => {
    if (effectiveState === 'active') {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(cursorOpacity, { toValue: 0, duration: 500, useNativeDriver: true }),
          Animated.timing(cursorOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
        ])
      )
      loop.start()
      return () => loop.stop()
    } else {
      cursorOpacity.setValue(1)
    }
  }, [effectiveState])

  // Style attributes per state
  let backgroundColor: string = pal.emptyFill
  let borderColor: string = pal.emptyBorder
  let borderWidth = 1.5

  if (effectiveState === 'active') {
    backgroundColor = pal.emptyFill
    borderColor = pal.activeBorder
    borderWidth = 2.5
  } else if (effectiveState === 'filled') {
    backgroundColor = pal.filledFill
    borderColor = pal.filledBorder
    borderWidth = 2
  } else if (effectiveState === 'error') {
    backgroundColor = ACCENT.red.light
    borderColor = ACCENT.red.base
    borderWidth = 2
  }

  const transform: any[] = [{ scale: popAnim }]
  if (shakeAnim) {
    transform.push({ translateX: shakeAnim })
  }

  const content = (
    <Animated.View
      style={[
        styles.box,
        {
          backgroundColor,
          borderColor,
          borderWidth,
          transform,
        },
      ]}
    >
      {effectiveState === 'filled' && char ? (
        <Text style={[styles.char, { color: pal.filledText }]}>{char}</Text>
      ) : effectiveState === 'active' ? (
        <Animated.View
          style={[
            styles.cursor,
            { backgroundColor: pal.cursorColor, opacity: cursorOpacity },
          ]}
        />
      ) : null}
    </Animated.View>
  )

  if (onPress) {
    return (
      <TouchableOpacity activeOpacity={0.8} onPress={onPress} style={{ flex: 1, maxWidth: s(66) }}>
        {content}
      </TouchableOpacity>
    )
  }

  return content
}

const styles = StyleSheet.create({
  box: {
    flex: 1,
    maxWidth: s(66),
    height: vs(58),
    borderRadius: s(12),
    alignItems: 'center',
    justifyContent: 'center',
  },
  char: {
    fontSize: ms(26),
    fontWeight: '900',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  cursor: {
    width: 2,
    height: ms(26),
    borderRadius: 1,
  },
})

