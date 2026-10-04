import React from 'react'
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  StyleProp,
  ViewStyle,
} from 'react-native'
import { ACCENT, APP_THEME, COLORS } from '../constants/colors'
import { s, vs, ms } from '../utils/scale'

export type ActionButtonVariant = 'red' | 'blue' | 'green'

interface ActionButtonProps {
  label: string
  icon?: React.ReactNode
  onPress: () => void
  variant?: ActionButtonVariant
  disabled?: boolean
  style?: StyleProp<ViewStyle>
}

export function ActionButton({
  label,
  icon,
  onPress,
  variant = 'blue',
  disabled = false,
  style,
}: ActionButtonProps) {
  let backgroundColor: string = ACCENT.blue.light
  let borderColor: string = ACCENT.blue.base
  let borderWidth = 1.5
  let textColor: string = ACCENT.blue.dark

  if (variant === 'red') {
    backgroundColor = APP_THEME.primary
    borderColor = APP_THEME.primary
    borderWidth = 0
    textColor = COLORS.pure_white
  } else if (variant === 'green') {
    backgroundColor = ACCENT.green.light
    borderColor = ACCENT.green.base
    borderWidth = 1.5
    textColor = ACCENT.green.dark
  }

  return (
    <TouchableOpacity
      style={[
        styles.btn,
        {
          backgroundColor,
          borderColor,
          borderWidth,
          opacity: disabled ? 0.5 : 1,
        },
        style,
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
    >
      {icon}
      <Text style={[styles.text, { color: textColor }]}>{label}</Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  btn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: s(6),
    paddingVertical: vs(12),
    borderRadius: s(12),
  },
  text: {
    fontSize: ms(13),
    fontWeight: '700',
  },
})

