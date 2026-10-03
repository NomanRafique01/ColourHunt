import React, { useState } from 'react'
import {
  View, Text, StyleSheet, ScrollView, Platform,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { RootStackParamList } from '../types/navigation'
import { Button } from '../components/Button'
import { Banner } from '../components/Banner'
import { APP_THEME, GAME_COLORS } from '../constants/colors'
import { MAX_ATTEMPTS } from '../constants/game'
import { usePlayerStore } from '../store/player'
import { useGameStore } from '../store/game'
import { s, vs, ms, h } from '../utils/scale'

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Round'>

const SWATCH_SIZE = Math.floor(h(0.30))

export default function RoundScreen() {
  const navigation = useNavigation<NavigationProp>()
  const { assignedColor, submissionCount, isHost } = usePlayerStore()
  const { remainingSeconds, isPaused } = useGameStore()
  const [showPausedBanner, setShowPausedBanner] = useState(isPaused)

  const currentColor = assignedColor || GAME_COLORS[0].hex
  const currentColorName =
    GAME_COLORS.find((c) => c.hex === currentColor)?.name.toUpperCase() || 'CRIMSON'

  const remainingAttempts = Math.max(0, MAX_ATTEMPTS - submissionCount)
  const isLowTime = remainingSeconds <= 10
  const isLowAttempts = remainingAttempts <= 1

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {showPausedBanner && (
          <Banner message="⏸  Round paused — host is reviewing a submission." variant="warning" />
        )}

        <View style={styles.header}>
          <Text style={styles.targetPrompt}>HUNT THIS COLOR</Text>
          <Text style={styles.colorName}>{currentColorName}</Text>
        </View>

        {/* Color Swatch */}
        <View style={styles.swatchContainer}>
          <View
            style={[
              styles.swatchBox,
              { backgroundColor: currentColor, width: SWATCH_SIZE, height: SWATCH_SIZE },
            ]}
          />
        </View>

        {/* Timer */}
        <View style={styles.timerCard}>
          <Text style={styles.timerLabel}>TIME REMAINING</Text>
          <Text style={[styles.timerValue, isLowTime && styles.timerValueLow]}>
            {remainingSeconds}s
          </Text>
        </View>

        {/* Attempts */}
        <Text style={[styles.attemptsText, isLowAttempts && styles.attemptsTextLow]}>
          Attempts remaining: {remainingAttempts} / {MAX_ATTEMPTS}
        </Text>

        {/* Actions */}
        <View style={styles.actionContainer}>
          <Button
            title="📷  Capture Photo"
            variant="primary"
            onPress={() => navigation.navigate('Camera')}
            disabled={remainingAttempts <= 0 || showPausedBanner}
          />
          <View style={styles.shellTestRow}>
            <Button
              title={showPausedBanner ? 'Resume' : 'Pause'}
              variant="secondary"
              onPress={() => setShowPausedBanner(!showPausedBanner)}
              style={styles.flexHalf}
            />
            {isHost ? (
              <Button title="Review"  variant="outline" onPress={() => navigation.navigate('Review')}  style={styles.flexHalf} />
            ) : (
              <Button title="Results" variant="outline" onPress={() => navigation.navigate('Result')}   style={styles.flexHalf} />
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: APP_THEME.background,
  },
  scrollContent: {
    paddingHorizontal: s(20),
    paddingVertical: vs(16),
    alignItems: 'center',
    justifyContent: 'space-between',
    flexGrow: 1,
  },
  header: {
    alignItems: 'center',
    marginVertical: vs(8),
  },
  targetPrompt: {
    color: APP_THEME.primary,
    fontSize: ms(11),
    fontWeight: '700',
    letterSpacing: 3,
    marginBottom: vs(4),
  },
  colorName: {
    color: APP_THEME.text,
    fontSize: ms(30),
    fontWeight: '900',
    letterSpacing: 2,
  },
  swatchContainer: {
    marginVertical: vs(12),
    alignItems: 'center',
  },
  swatchBox: {
    borderRadius: s(24),
    borderWidth: 2,
    borderColor: APP_THEME.surfaceBorder,
    shadowColor: APP_THEME.shadowColor,
    shadowOffset: { width: 0, height: vs(8) },
    shadowOpacity: 0.15,
    shadowRadius: s(16),
    elevation: 8,
  },
  timerCard: {
    backgroundColor: APP_THEME.surface,
    paddingVertical: vs(12),
    paddingHorizontal: s(32),
    borderRadius: s(14),
    alignItems: 'center',
    borderWidth: 1,
    borderColor: APP_THEME.surfaceBorder,
    marginVertical: vs(8),
    shadowColor: APP_THEME.shadowColor,
    shadowOffset: { width: 0, height: vs(2) },
    shadowOpacity: 0.06,
    shadowRadius: s(6),
    elevation: 2,
  },
  timerLabel: {
    color: APP_THEME.textMuted,
    fontSize: ms(10),
    fontWeight: '700',
    letterSpacing: 2,
    marginBottom: vs(2),
  },
  timerValue: {
    color: APP_THEME.text,
    fontSize: ms(36),
    fontWeight: '900',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  timerValueLow: {
    color: APP_THEME.primary,
  },
  attemptsText: {
    color: APP_THEME.textSecondary,
    fontSize: ms(13),
    fontWeight: '600',
    marginVertical: vs(4),
  },
  attemptsTextLow: {
    color: APP_THEME.warning,
  },
  actionContainer: {
    width: '100%',
    marginTop: vs(10),
  },
  shellTestRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: vs(6),
    gap: s(8),
  },
  flexHalf: {
    flex: 1,
  },
})
