import React from 'react'
import {
  View, Text, StyleSheet, ScrollView, Platform,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useNavigation, useRoute } from '@react-navigation/native'
import type { RouteProp } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { RootStackParamList } from '../types/navigation'
import { Button } from '../components/Button'
import { APP_THEME } from '../constants/colors'
import { MAX_PLAYERS, MIN_PLAYERS } from '../constants/game'
import { useRoomStore } from '../store/room'
import { usePlayerStore } from '../store/player'
import { s, vs, ms } from '../utils/scale'

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Lobby'>
type LobbyRouteProp = RouteProp<RootStackParamList, 'Lobby'>

export default function LobbyScreen() {
  const navigation = useNavigation<NavigationProp>()
  const route = useRoute<LobbyRouteProp>()
  const { roomCode, setRoomStatus } = useRoomStore()
  const { isHost } = usePlayerStore()

  const activeCode = route.params?.code || roomCode || 'ABCD'
  const isUserHost = route.params?.isHost ?? isHost

  const placeholderPlayers = [
    { id: '1', name: 'You',             isHost: isUserHost, isReady: true  },
    { id: '2', name: 'Player 2 (Alex)', isHost: false,      isReady: true  },
    { id: '3', name: null,              isHost: false,      isReady: false },
    { id: '4', name: null,              isHost: false,      isReady: false },
  ]

  const connectedCount = placeholderPlayers.filter((p) => p.name !== null).length
  const canStart = connectedCount >= MIN_PLAYERS && connectedCount <= MAX_PLAYERS

  const handleStartGame = () => {
    setRoomStatus('in_round')
    navigation.navigate('Round')
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerEyebrow}>ROOM CODE</Text>
          <View style={styles.codeBadge}>
            <Text style={styles.codeText}>{activeCode}</Text>
          </View>
          <Text style={styles.playerCount}>{connectedCount} / {MAX_PLAYERS} Players</Text>
        </View>

        {/* Players card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Players</Text>
          <View style={styles.playerList}>
            {placeholderPlayers.map((player, index) => {
              const filled = player.name !== null
              return (
                <View
                  key={player.id}
                  style={[styles.playerSlot, filled ? styles.slotFilled : styles.slotEmpty]}
                >
                  <View style={styles.slotLeft}>
                    <View style={[styles.slotIndexBadge, filled && styles.slotIndexActive]}>
                      <Text style={[styles.slotIndexText, filled && styles.slotIndexTextActive]}>
                        {index + 1}
                      </Text>
                    </View>
                    <Text style={[styles.playerName, !filled && styles.playerEmptyText]}>
                      {filled ? player.name : 'Waiting...'}
                    </Text>
                  </View>
                  {filled && player.isHost ? (
                    <View style={styles.hostBadge}>
                      <Text style={styles.hostBadgeText}>HOST</Text>
                    </View>
                  ) : null}
                </View>
              )
            })}
          </View>

          <View style={styles.actionsContainer}>
            {isUserHost ? (
              <Button
                title={canStart ? 'Start Game' : 'Waiting for Players...'}
                variant="primary"
                onPress={handleStartGame}
                disabled={!canStart}
              />
            ) : (
              <View style={styles.waitingContainer}>
                <Text style={styles.waitingText}>Waiting for host to start the game...</Text>
              </View>
            )}
            <Button title="Leave Room" variant="outline" onPress={() => navigation.navigate('MainTabs')} />
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
    paddingVertical: vs(24),
    justifyContent: 'center',
    flexGrow: 1,
  },
  header: {
    alignItems: 'center',
    marginBottom: vs(24),
  },
  headerEyebrow: {
    color: APP_THEME.primary,
    fontSize: ms(11),
    fontWeight: '700',
    letterSpacing: 2.5,
    marginBottom: vs(10),
  },
  codeBadge: {
    backgroundColor: APP_THEME.surface,
    paddingHorizontal: s(28),
    paddingVertical: vs(12),
    borderRadius: s(14),
    borderWidth: 1.5,
    borderColor: APP_THEME.primary,
    marginBottom: vs(10),
    shadowColor: APP_THEME.shadowColorRed,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: s(10),
    elevation: 3,
  },
  codeText: {
    fontSize: ms(30),
    fontWeight: '900',
    color: APP_THEME.text,
    letterSpacing: 8,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  playerCount: {
    color: APP_THEME.textMuted,
    fontSize: ms(13),
    fontWeight: '600',
  },
  card: {
    backgroundColor: APP_THEME.surface,
    padding: s(20),
    borderRadius: s(18),
    borderWidth: 1,
    borderColor: APP_THEME.surfaceBorder,
    shadowColor: APP_THEME.shadowColor,
    shadowOffset: { width: 0, height: vs(4) },
    shadowOpacity: 0.08,
    shadowRadius: s(12),
    elevation: 3,
  },
  cardTitle: {
    color: APP_THEME.textSecondary,
    fontSize: ms(11),
    fontWeight: '700',
    marginBottom: vs(14),
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  playerList: {
    marginBottom: vs(18),
  },
  playerSlot: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: vs(12),
    paddingHorizontal: s(14),
    borderRadius: s(10),
    borderWidth: 1,
    marginBottom: vs(8),
  },
  slotFilled: {
    backgroundColor: APP_THEME.backgroundSoft,
    borderColor: APP_THEME.surfaceBorder,
  },
  slotEmpty: {
    backgroundColor: 'transparent',
    borderColor: APP_THEME.surfaceBorder,
    borderStyle: 'dashed',
  },
  slotLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  slotIndexBadge: {
    width: s(26),
    height: s(26),
    borderRadius: s(13),
    backgroundColor: APP_THEME.surfaceBorder,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: s(12),
  },
  slotIndexActive: {
    backgroundColor: APP_THEME.primary,
  },
  slotIndexText: {
    color: APP_THEME.textMuted,
    fontSize: ms(12),
    fontWeight: '800',
  },
  slotIndexTextActive: {
    color: APP_THEME.textInverted,
  },
  playerName: {
    color: APP_THEME.text,
    fontSize: ms(15),
    fontWeight: '600',
  },
  playerEmptyText: {
    color: APP_THEME.textMuted,
    fontStyle: 'italic',
    fontSize: ms(14),
  },
  hostBadge: {
    backgroundColor: APP_THEME.primarySubtle,
    paddingHorizontal: s(10),
    paddingVertical: vs(4),
    borderRadius: s(6),
    borderWidth: 1,
    borderColor: APP_THEME.primary,
  },
  hostBadgeText: {
    color: APP_THEME.primary,
    fontSize: ms(10),
    fontWeight: '800',
    letterSpacing: 1,
  },
  actionsContainer: {
    marginTop: vs(4),
  },
  waitingContainer: {
    paddingVertical: vs(14),
    backgroundColor: APP_THEME.backgroundSoft,
    borderRadius: s(10),
    alignItems: 'center',
    marginBottom: vs(6),
    borderWidth: 1,
    borderColor: APP_THEME.surfaceBorder,
  },
  waitingText: {
    color: APP_THEME.textMuted,
    fontSize: ms(13),
    fontWeight: '500',
    fontStyle: 'italic',
  },
})
