import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { ACCENT, APP_THEME, COLORS } from '../constants/colors'
import { s, vs, ms } from '../utils/scale'

interface StickyFooterButtonProps {
  label: string
  onPress: () => void
  disabled?: boolean
  insetsBottom?: number
}

export function StickyFooterButton({
  label,
  onPress,
  disabled = false,
  insetsBottom = 0,
}: StickyFooterButtonProps) {
  return (
    <View style={[styles.stickyBottom, { paddingBottom: insetsBottom + vs(12) }]}>
      <TouchableOpacity
        style={[
          styles.primaryBtn,
          disabled ? styles.btnDisabled : styles.btnEnabled,
        ]}
        onPress={onPress}
        disabled={disabled}
        activeOpacity={disabled ? 1 : 0.85}
      >
        <Text
          style={[
            styles.primaryBtnText,
            disabled ? styles.textDisabled : styles.textEnabled,
          ]}
        >
          {label}
        </Text>
        <View
          style={[
            styles.primaryBtnArrow,
            disabled ? styles.arrowWrapDisabled : styles.arrowWrapEnabled,
          ]}
        >
          <Ionicons
            name="arrow-forward"
            size={s(16)}
            color={disabled ? COLORS.gray600 : COLORS.pure_white}
          />
        </View>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  stickyBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: s(16),
    paddingTop: vs(12),
    backgroundColor: APP_THEME.surface,
    borderTopWidth: 1,
    borderTopColor: APP_THEME.surfaceBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 8,
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: s(12),
    paddingVertical: vs(15),
    paddingHorizontal: s(24),
  },
  btnEnabled: {
    backgroundColor: APP_THEME.primary,
    borderWidth: 0,
    shadowColor: ACCENT.red.shadow,
    shadowOffset: { width: 0, height: vs(4) },
    shadowOpacity: 0.25,
    shadowRadius: s(12),
    elevation: 6,
  },
  btnDisabled: {
    backgroundColor: COLORS.gray100,
    borderWidth: 1.5,
    borderColor: COLORS.gray300,
    shadowOpacity: 0,
    elevation: 0,
  },
  primaryBtnText: {
    flex: 1,
    fontSize: ms(16),
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  textEnabled: {
    color: COLORS.pure_white,
  },
  textDisabled: {
    color: COLORS.gray600,
  },
  primaryBtnArrow: {
    width: s(30),
    height: s(30),
    borderRadius: s(8),
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowWrapEnabled: {
    backgroundColor: 'rgba(255,255,255,0.22)',
  },
  arrowWrapDisabled: {
    backgroundColor: COLORS.gray200,
  },
})

