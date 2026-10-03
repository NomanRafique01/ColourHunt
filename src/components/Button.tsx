import React from 'react'
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native'
import type { ReactNode } from 'react'
import { APP_THEME } from '../constants/colors'

export type ButtonVariant = 'primary' | 'secondary' | 'success' | 'danger' | 'outline' | 'ghost'

interface ButtonProps {
  title: string
  onPress: () => void
  icon?: ReactNode
  variant?: ButtonVariant
  disabled?: boolean
  loading?: boolean
  style?: ViewStyle
}

export function Button({
  title,
  onPress,
  icon,
  variant = 'primary',
  disabled = false,
  loading = false,
  style,
}: ButtonProps) {
  const getContainerStyle = (): ViewStyle => {
    switch (variant) {
      case 'secondary': return styles.secondaryContainer
      case 'success':   return styles.successContainer
      case 'danger':    return styles.dangerContainer
      case 'outline':   return styles.outlineContainer
      case 'ghost':     return styles.ghostContainer
      case 'primary':
      default:          return styles.primaryContainer
    }
  }

  const getTextStyle = (): TextStyle => {
    switch (variant) {
      case 'outline': return styles.outlineText
      case 'ghost':   return styles.ghostText
      case 'secondary': return styles.secondaryText
      default:        return styles.baseText
    }
  }

  return (
    <TouchableOpacity
      activeOpacity={0.75}
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.baseContainer,
        getContainerStyle(),
        disabled && styles.disabledContainer,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'outline' ? APP_THEME.primary : APP_THEME.textInverted} />
      ) : (
        <>
          {icon}
          <Text style={[getTextStyle(), icon ? styles.textWithIcon : undefined, disabled ? styles.disabledText : undefined]}>
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  baseContainer: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    marginVertical: 5,
  },
  primaryContainer: {
    backgroundColor: APP_THEME.primary,
    shadowColor: APP_THEME.shadowColorRed,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  secondaryContainer: {
    backgroundColor: APP_THEME.surfaceElevated,
    borderWidth: 1,
    borderColor: APP_THEME.surfaceBorder,
  },
  successContainer: {
    backgroundColor: APP_THEME.primary,
    shadowColor: APP_THEME.shadowColorRed,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  dangerContainer: {
    backgroundColor: APP_THEME.danger,
    shadowColor: APP_THEME.shadowColorRed,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  outlineContainer: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: APP_THEME.primary,
  },
  ghostContainer: {
    backgroundColor: APP_THEME.primarySubtle,
  },
  disabledContainer: {
    backgroundColor: APP_THEME.surfaceBorder,
    shadowOpacity: 0,
    elevation: 0,
    opacity: 0.6,
  },
  baseText: {
    color: APP_THEME.textInverted,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  textWithIcon: {
    marginLeft: 8,
  },
  secondaryText: {
    color: APP_THEME.text,
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  outlineText: {
    color: APP_THEME.primary,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  ghostText: {
    color: APP_THEME.primary,
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  disabledText: {
    color: APP_THEME.textMuted,
  },
})
