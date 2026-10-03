import React, { useState } from 'react'
import {
  View, Text, StyleSheet, Platform,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { RootStackParamList } from '../types/navigation'
import { Button } from '../components/Button'
import { ColorSwatch } from '../components/ColorSwatch'
import { APP_THEME, GAME_COLORS } from '../constants/colors'
import { REVIEW_TIMEOUT_SECONDS } from '../constants/game'
import { useGameStore } from '../store/game'
import { s, vs, ms } from '../utils/scale'

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Review'>

export default function ReviewScreen() {
  const navigation = useNavigation<NavigationProp>()
  const { setWinnerPlayerId, setIsPaused } = useGameStore()
  const [matchScore, setMatchScore] = useState<string>('86%')
  const [isTesting, setIsTesting] = useState(false)
  const [timeoutSeconds] = useState(REVIEW_TIMEOUT_SECONDS)

  const submitterName = 'Player 2 (Alex)'
  const assignedColor = GAME_COLORS[0].hex

  const handleTestAnalysis = () => {
    setIsTesting(true)
    setTimeout(() => {
      setIsTesting(false)
      setMatchScore('88% (Delta E: 2.1 - Strong Match)')
    }, 1000)
  }

  const handleApprove = () => {
    setWinnerPlayerId('player-2-id')
    setIsPaused(false)
    navigation.navigate('Result', { winnerPlayerId: 'player-2-id' })
  }

  const handleReject = () => {
    setIsPaused(false)
    navigation.navigate('Round')
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.headerCard}>
          <View style={styles.submitterInfo}>
            <Text style={styles.reviewingLabel}>SUBMISSION FROM</Text>
            <Text style={styles.submitterName}>{submitterName}</Text>
          </View>
          <ColorSwatch color={assignedColor} size={s(46)} label="Target" />
        </View>

        {/* Photo Placeholder */}
        <View style={styles.photoContainer}>
          <View style={styles.photoBox}>
            <Text style={styles.photoIcon}>📸</Text>
            <Text style={styles.photoPlaceholderText}>Submitted Photo Preview</Text>
            <Text style={styles.photoSubtext}>
              Does this match {GAME_COLORS[0].name}?
            </Text>
          </View>
        </View>

        {/* Analysis */}
        <View style={styles.analysisSection}>
          <View style={styles.scoreRow}>
            <Text style={styles.scoreLabel}>Match Score</Text>
            <Text style={styles.scoreValue}>{matchScore}</Text>
          </View>
          <View style={styles.timeoutBadge}>
            <Text style={styles.timeoutText}>
              Auto-decision in:{' '}
              <Text style={styles.timeoutMono}>{timeoutSeconds}s</Text>
            </Text>
          </View>
          <Button
            title={isTesting ? 'Analyzing...' : 'Test Dominant Colors'}
            variant="ghost"
            onPress={handleTestAnalysis}
            disabled={isTesting}
          />
        </View>

        {/* Decision */}
        <View style={styles.decisionRow}>
          <Button title="✕  Reject"  variant="danger"   onPress={handleReject}  style={styles.decisionButton} />
          <Button title="✓  Approve" variant="success"  onPress={handleApprove} style={styles.decisionButton} />
        </View>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: APP_THEME.background,
  },
  container: {
    flex: 1,
    paddingHorizontal: s(20),
    paddingVertical: vs(14),
    justifyContent: 'space-between',
  },
  headerCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: APP_THEME.surface,
    padding: s(16),
    borderRadius: s(14),
    borderWidth: 1,
    borderColor: APP_THEME.surfaceBorder,
    shadowColor: APP_THEME.shadowColor,
    shadowOffset: { width: 0, height: vs(2) },
    shadowOpacity: 0.06,
    shadowRadius: s(6),
    elevation: 2,
  },
  submitterInfo: { flex: 1 },
  reviewingLabel: {
    color: APP_THEME.primary,
    fontSize: ms(10),
    fontWeight: '700',
    letterSpacing: 2,
    marginBottom: vs(4),
  },
  submitterName: {
    color: APP_THEME.text,
    fontSize: ms(20),
    fontWeight: '800',
  },
  photoContainer: {
    flex: 1,
    marginVertical: vs(12),
  },
  photoBox: {
    flex: 1,
    backgroundColor: APP_THEME.backgroundSoft,
    borderRadius: s(16),
    borderWidth: 1.5,
    borderColor: APP_THEME.surfaceBorder,
    alignItems: 'center',
    justifyContent: 'center',
    padding: s(20),
  },
  photoIcon: { fontSize: ms(56), marginBottom: vs(14) },
  photoPlaceholderText: {
    color: APP_THEME.text,
    fontSize: ms(17),
    fontWeight: '700',
    textAlign: 'center',
  },
  photoSubtext: {
    color: APP_THEME.textMuted,
    fontSize: ms(13),
    marginTop: vs(6),
    textAlign: 'center',
  },
  analysisSection: {
    backgroundColor: APP_THEME.surface,
    padding: s(16),
    borderRadius: s(14),
    borderWidth: 1,
    borderColor: APP_THEME.surfaceBorder,
    marginBottom: vs(8),
  },
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: vs(8),
  },
  scoreLabel: {
    color: APP_THEME.textSecondary,
    fontSize: ms(13),
    fontWeight: '600',
  },
  scoreValue: {
    color: APP_THEME.primary,
    fontSize: ms(15),
    fontWeight: '800',
  },
  timeoutBadge: {
    alignItems: 'center',
    marginBottom: vs(10),
  },
  timeoutText: {
    color: APP_THEME.textMuted,
    fontSize: ms(12),
    fontWeight: '500',
  },
  timeoutMono: {
    color: APP_THEME.primary,
    fontWeight: '800',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  decisionRow: {
    flexDirection: 'row',
    gap: s(12),
  },
  decisionButton: { flex: 1 },
})
