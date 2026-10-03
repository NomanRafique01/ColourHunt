import React from 'react'
import { View, Text, StyleSheet, ViewStyle } from 'react-native'
import { APP_THEME } from '../constants/colors'

export type BannerVariant = 'info' | 'warning' | 'danger' | 'success'

interface BannerProps {
  message: string
  variant?: BannerVariant
  style?: ViewStyle
}

export function Banner({ message, variant = 'warning', style }: BannerProps) {
  const getBg = () => {
    switch (variant) {
      case 'danger':  return 'rgba(196, 18, 37, 0.08)'
      case 'success': return 'rgba(232, 25, 44, 0.08)'
      case 'info':    return 'rgba(119, 119, 119, 0.08)'
      case 'warning':
      default:        return 'rgba(255, 122, 133, 0.12)'
    }
  }

  const getBorder = () => {
    switch (variant) {
      case 'danger':  return APP_THEME.danger
      case 'success': return APP_THEME.primary
      case 'info':    return APP_THEME.info
      case 'warning':
      default:        return APP_THEME.warning
    }
  }

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: getBg(), borderColor: getBorder() },
        style,
      ]}
    >
      <Text style={styles.text}>{message}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    marginVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: APP_THEME.text,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
})
