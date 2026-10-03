import React, { useState } from 'react'
import { View, Text, StyleSheet, Platform } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { RootStackParamList } from '../types/navigation'
import { Button } from '../components/Button'
import { APP_THEME } from '../constants/colors'
import { useRoomStore } from '../store/room'
import { usePlayerStore } from '../store/player'

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'CreateRoom'>

export default function CreateRoomScreen() {
  const navigation = useNavigation<NavigationProp>()
  const [roomCode] = useState('- - - -')
  const { setRoomCode, setRoomStatus } = useRoomStore()
  const { setIsHost } = usePlayerStore()

  const handleEnterLobby = () => {
    setIsHost(true)
    setRoomCode('ABCD')
    setRoomStatus('waiting')
    navigation.navigate('Lobby', { code: 'ABCD', isHost: true })
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>NEW ROOM</Text>
          <Text style={styles.title}>Create Room</Text>
          <View style={styles.titleAccent} />
        </View>

        <View style={styles.card}>
          <Text style={styles.subtitle}>Share this code with friends to join</Text>

          <View style={styles.codeContainer}>
            <Text style={styles.codeLabel}>ROOM CODE</Text>
            <Text style={styles.codeText}>{roomCode}</Text>
          </View>

          <View style={styles.statusBadge}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>Waiting for players...</Text>
          </View>

          <Button title="Go to Lobby"    variant="primary"  onPress={handleEnterLobby} />
          <Button title="Back to Home"   variant="outline"  onPress={() => navigation.goBack()} />
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
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 28,
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: '700',
    color: APP_THEME.primary,
    letterSpacing: 2.5,
    marginBottom: 6,
  },
  title: {
    fontSize: 34,
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
  card: {
    backgroundColor: APP_THEME.surface,
    padding: 24,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: APP_THEME.surfaceBorder,
    shadowColor: APP_THEME.shadowColor,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.10,
    shadowRadius: 16,
    elevation: 4,
  },
  subtitle: {
    fontSize: 14,
    color: APP_THEME.textMuted,
    textAlign: 'center',
    marginBottom: 20,
  },
  codeContainer: {
    backgroundColor: APP_THEME.background,
    borderRadius: 12,
    paddingVertical: 22,
    paddingHorizontal: 16,
    borderWidth: 1.5,
    borderColor: APP_THEME.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  codeLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: APP_THEME.primary,
    letterSpacing: 2,
    marginBottom: 8,
  },
  codeText: {
    fontSize: 38,
    fontWeight: '900',
    color: APP_THEME.text,
    letterSpacing: 10,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 22,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: APP_THEME.warning,
    marginRight: 8,
  },
  statusText: {
    color: APP_THEME.textSecondary,
    fontSize: 13,
    fontWeight: '500',
  },
})
