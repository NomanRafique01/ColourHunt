import React from 'react'
import { View, Text, StyleSheet, StyleProp, ViewStyle, TouchableOpacity } from 'react-native'
import { APP_THEME } from '../constants/colors'
import { s, vs, ms } from '../utils/scale'

interface CardProps {
  accentColor?: string
  label?: string
  icon?: React.ReactNode
  rightAccessory?: React.ReactNode
  children: React.ReactNode
  style?: StyleProp<ViewStyle>
  onPress?: () => void
}

export function Card({
  accentColor,
  label,
  icon,
  rightAccessory,
  children,
  style,
  onPress,
}: CardProps) {
  const content = (
    <>
      {accentColor ? (
        <View style={[styles.cardAccent, { backgroundColor: accentColor }]} />
      ) : null}

      <View style={styles.cardBody}>
        {label || rightAccessory ? (
          <View style={styles.cardHeaderRow}>
            <View style={styles.labelRow}>
              {accentColor ? (
                <View style={[styles.labelDot, { backgroundColor: accentColor }]} />
              ) : null}
              {icon ? <View style={styles.iconWrap}>{icon}</View> : null}
              {label ? <Text style={styles.cardLabel}>{label}</Text> : null}
            </View>
            {rightAccessory}
          </View>
        ) : null}
        {children}
      </View>
    </>
  )

  if (onPress) {
    return (
      <TouchableOpacity
        style={[styles.card, style]}
        activeOpacity={0.95}
        onPress={onPress}
      >
        {content}
      </TouchableOpacity>
    )
  }

  return <View style={[styles.card, style]}>{content}</View>
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: APP_THEME.surface,
    borderRadius: s(20),
    borderWidth: 1,
    borderColor: APP_THEME.surfaceBorder,
    overflow: 'hidden',
    marginBottom: vs(16),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: vs(3) },
    shadowOpacity: 0.08,
    shadowRadius: s(10),
    elevation: 3,
  },
  cardAccent: {
    height: vs(3.5),
    width: '100%',
  },
  cardBody: {
    paddingHorizontal: s(16),
    paddingTop: vs(12),
    paddingBottom: vs(16),
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: vs(8),
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(8),
  },
  labelDot: {
    width: s(7),
    height: s(7),
    borderRadius: s(3.5),
  },
  iconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardLabel: {
    fontSize: ms(12),
    fontWeight: '700',
    color: APP_THEME.text,
    letterSpacing: 1.0,
  },
})

