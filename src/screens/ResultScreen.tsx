import React from 'react'
import {
  View, Text, StyleSheet, ScrollView, Platform,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { RootStackParamList } from '../types/navigation'
import { Button } from '../components/Button'
import { ColorSwatch } from '../components/ColorSwatch'
import { APP_THEME, GAME_COLORS } from '../constants/colors'
import { useGameStore } from '../store/game'
import { useRoomStore } from '../store/room'
import { usePlayerStore } from '../store/player'

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Result'>

export default function ResultScreen() {
  const navigation = useNavigation<NavigationProp>()
  const { winnerPlayerId, resetGame } = useGameStore()
  const { resetRoom } = useRoomStore()
  const { resetPlayer } = usePlayerStore()

  const hasWinner = winnerPlayerId !== null
  const winnerName = hasWinner ? 'Player 2 (Alex)' : null
  const winnerColor = GAME_COLORS[0].hex

  const placeholderSubmissions = [
    { id: '1', player: 'Alex', time: '00:14.2s', color: GAME_COLORS[0].hex, isWinner: true  },
    { id: '2', player: 'You',  time: '00:22.8s', color: GAME_COLORS[4].hex, isWinner: false },
    { id: '3', player: 'Sam',  time: '00:35.1s', color: GAME_COLORS[5].hex, isWinner: false },
  ]

  const handlePlayAgain = () => {
    resetGame()
    navigation.navigate('Lobby')
  }

  const handleLeave = () => {
    resetGame()
    resetRoom()
    resetPlayer()
    navigation.navigate('Home')
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.resultTag}>ROUND FINISHED</Text>
          <Text style={styles.headingText}>{hasWinner ? '🏆 Winner!' : 'No Winner'}</Text>
          <View style={styles.titleAccent} />
        </View>

        {/* Winner card */}
        {hasWinner ? (
          <View style={styles.winnerCard}>
            <Text style={styles.winnerLabel}>🥇 CHAMPION</Text>
            <Text style={styles.winnerName}>{winnerName}</Text>
            <View style={styles.swatchWrap}>
              <ColorSwatch color={winnerColor} size={60} label={`${GAME_COLORS[0].name} Matched`} />
            </View>
            <View style={styles.winnerTimeBadge}>
              <Text style={styles.winnerTimeLabel}>SUBMISSION TIME</Text>
              <Text style={styles.winnerTimeValue}>14.2s</Text>
            </View>
          </View>
        ) : (
          <View style={styles.noWinnerCard}>
            <Text style={styles.noWinnerIcon}>⏱</Text>
            <Text style={styles.noWinnerSubtext}>
              Time expired before any successful color submission was approved.
            </Text>
          </View>
        )}

        {/* Submissions */}
        <View style={styles.submissionsCard}>
          <Text style={styles.cardTitle}>Round Submissions</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.thumbnailRow}>
            {placeholderSubmissions.map((sub) => (
              <View
                key={sub.id}
                style={[styles.thumbnailBox, sub.isWinner && styles.winnerThumbnailBox]}
              >
                <View style={[styles.colorIndicator, { backgroundColor: sub.color }]} />
                <Text style={styles.thumbnailIcon}>📷</Text>
                <Text style={styles.thumbnailPlayer}>{sub.player}</Text>
                <Text style={styles.thumbnailTime}>{sub.time}</Text>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Actions */}
        <View style={styles.actionsContainer}>
          <Button title="Play Again" variant="primary" onPress={handlePlayAgain} />
          <Button title="Leave Game" variant="outline" onPress={handleLeave} />
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
    paddingVertical: 20,
    justifyContent: 'center',
    flexGrow: 1,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  resultTag: {
    color: APP_THEME.primary,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 3,
    marginBottom: 6,
  },
  headingText: {
    fontSize: 36,
    fontWeight: '900',
    color: APP_THEME.text,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  titleAccent: {
    width: 48,
    height: 3,
    backgroundColor: APP_THEME.primary,
    borderRadius: 2,
    marginTop: 10,
  },
  winnerCard: {
    backgroundColor: APP_THEME.surface,
    padding: 24,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: APP_THEME.primary,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: APP_THEME.shadowColorRed,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 14,
    elevation: 6,
  },
  winnerLabel: {
    color: APP_THEME.primary,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 2,
    marginBottom: 6,
  },
  winnerName: {
    color: APP_THEME.text,
    fontSize: 28,
    fontWeight: '900',
    marginBottom: 10,
  },
  swatchWrap: { marginVertical: 10 },
  winnerTimeBadge: {
    marginTop: 10,
    backgroundColor: APP_THEME.backgroundSoft,
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: APP_THEME.surfaceBorder,
    alignItems: 'center',
  },
  winnerTimeLabel: {
    color: APP_THEME.textMuted,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: 2,
  },
  winnerTimeValue: {
    color: APP_THEME.text,
    fontSize: 22,
    fontWeight: '900',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  noWinnerCard: {
    backgroundColor: APP_THEME.surface,
    padding: 24,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: APP_THEME.surfaceBorder,
    alignItems: 'center',
    marginBottom: 20,
  },
  noWinnerIcon: { fontSize: 40, marginBottom: 10 },
  noWinnerSubtext: {
    color: APP_THEME.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
  },
  submissionsCard: {
    backgroundColor: APP_THEME.surface,
    padding: 18,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: APP_THEME.surfaceBorder,
    marginBottom: 22,
  },
  cardTitle: {
    color: APP_THEME.textMuted,
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 14,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  thumbnailRow: { flexDirection: 'row', gap: 12 },
  thumbnailBox: {
    width: 100,
    height: 120,
    backgroundColor: APP_THEME.backgroundSoft,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: APP_THEME.surfaceBorder,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
  winnerThumbnailBox: {
    borderColor: APP_THEME.primary,
    borderWidth: 2,
    shadowColor: APP_THEME.shadowColorRed,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  colorIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    position: 'absolute',
    top: 8,
    right: 8,
  },
  thumbnailIcon: { fontSize: 26, marginBottom: 6 },
  thumbnailPlayer: {
    color: APP_THEME.text,
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
  thumbnailTime: {
    color: APP_THEME.textMuted,
    fontSize: 10,
    marginTop: 2,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  actionsContainer: { width: '100%' },
})
