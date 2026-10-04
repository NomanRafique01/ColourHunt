import React from 'react'
import { View, Text, StyleSheet, StyleProp, ViewStyle } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { ACCENT, COLORS } from '../constants/colors'
import { s, vs, ms } from '../utils/scale'

interface InfoCardProps {
  icon?: React.ReactNode
  title: string
  body: string
  style?: StyleProp<ViewStyle>
}

export function InfoCard({ icon, title, body, style }: InfoCardProps) {
  return (
    <View style={[styles.card, style]}>
      <View style={styles.iconWrap}>
        {icon ? (
          icon
        ) : (
          <Ionicons
            name="information-circle-outline"
            size={s(20)}
            color={ACCENT.blue.base}
          />
        )}
      </View>
      <View style={styles.textWrap}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.body}>{body}</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: s(12),
    backgroundColor: ACCENT.blue.light,
    borderRadius: s(20),
    borderWidth: 1,
    borderColor: 'rgba(47, 107, 255, 0.22)',
    paddingHorizontal: s(16),
    paddingVertical: vs(14),
    marginBottom: vs(16),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  iconWrap: {
    width: s(28),
    height: s(28),
    borderRadius: s(14),
    backgroundColor: COLORS.pure_white,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: vs(1),
  },
  textWrap: {
    flex: 1,
  },
  title: {
    fontSize: ms(13),
    fontWeight: '700',
    color: ACCENT.blue.dark,
    marginBottom: vs(2),
  },
  body: {
    fontSize: ms(12),
    fontWeight: '500',
    color: COLORS.gray700,
    lineHeight: ms(17),
  },
})

