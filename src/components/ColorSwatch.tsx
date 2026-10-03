import React from 'react'
import { View, Text, StyleSheet, ViewStyle } from 'react-native'
import { APP_THEME } from '../constants/colors'
import { s, vs, ms } from '../utils/scale'

interface ColorSwatchProps {
  color: string
  size?: number
  label?: string
  style?: ViewStyle
}

export function ColorSwatch({ color, size = s(48), label, style }: ColorSwatchProps) {
  return (
    <View style={[styles.container, style]}>
      <View
        style={[
          styles.swatchBase,
          {
            backgroundColor: color,
            width: size,
            height: size,
            borderRadius: size > s(80) ? s(20) : s(10),
          },
        ]}
      />
      {label ? <Text style={styles.label}>{label}</Text> : null}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  swatchBase: {
    borderWidth: 1.5,
    borderColor: APP_THEME.surfaceBorder,
    shadowColor: APP_THEME.shadowColor,
    shadowOffset: { width: 0, height: vs(3) },
    shadowOpacity: 0.2,
    shadowRadius: s(6),
    elevation: 4,
  },
  label: {
    color: APP_THEME.textSecondary,
    marginTop: vs(8),
    fontSize: ms(12),
    fontWeight: '600',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
})
