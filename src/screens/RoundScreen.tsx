import React, { useState } from 'react'
import {
  View, Text, StyleSheet, ScrollView, Dimensions, Platform,
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

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Round'>

const { height: SCREEN_HEIGHT } = Dimensions.get('window')
const SWATCH_SIZE = Math.floor(SCREEN_HEIGHT * 0.30)

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
    paddingHorizontal: 20,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'space-between',
    flexGrow: 1,
  },
  header: {
    alignItems: 'center',
    marginVertical: 8,
  },
  targetPrompt: {
    color: APP_THEME.primary,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 3,
    marginBottom: 4,
  },
  colorName: {
    color: APP_THEME.text,
    fontSize: 30,
    fontWeight: '900',
    letterSpacing: 2,
  },
  swatchContainer: {
    marginVertical: 12,
    alignItems: 'center',
  },
  swatchBox: {
    borderRadius: 24,
    borderWidth: 2,
    borderColor: APP_THEME.surfaceBorder,
    shadowColor: APP_THEME.shadowColor,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  timerCard: {
    backgroundColor: APP_THEME.surface,
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: APP_THEME.surfaceBorder,
    marginVertical: 8,
    shadowColor: APP_THEME.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  timerLabel: {
    color: APP_THEME.textMuted,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2,
    marginBottom: 2,
  },
  timerValue: {
    color: APP_THEME.text,
    fontSize: 36,
    fontWeight: '900',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  timerValueLow: {
    color: APP_THEME.primary,
  },
  attemptsText: {
    color: APP_THEME.textSecondary,
    fontSize: 13,
    fontWeight: '600',
    marginVertical: 4,
  },
  attemptsTextLow: {
    color: APP_THEME.warning,
  },
  actionContainer: {
    width: '100%',
    marginTop: 10,
  },
  shellTestRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
    gap: 8,
  },
  flexHalf: {
    flex: 1,
  },
})
