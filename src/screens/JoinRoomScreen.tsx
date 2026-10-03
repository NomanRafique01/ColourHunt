import React, { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { RootStackParamList } from '../types/navigation'
import { Button } from '../components/Button'
import { APP_THEME } from '../constants/colors'
import { useRoomStore } from '../store/room'
import { usePlayerStore } from '../store/player'

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'JoinRoom'>

export default function JoinRoomScreen() {
  const navigation = useNavigation<NavigationProp>()
  const [code, setCode] = useState('')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const { setRoomCode, setRoomStatus } = useRoomStore()
  const { setIsHost } = usePlayerStore()

  const handleCodeChange = (text: string) => {
    const sanitized = text.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 4)
    setCode(sanitized)
    if (errorMessage) setErrorMessage(null)
  }

  const handleJoin = () => {
    if (code.length < 4) {
      setErrorMessage('Please enter a valid 4-character room code')
      return
    }
    setIsHost(false)
    setRoomCode(code)
    setRoomStatus('waiting')
    navigation.navigate('Lobby', { code, isHost: false })
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.container}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.eyebrow}>JOIN A ROOM</Text>
            <Text style={styles.title}>Join Room</Text>
            <View style={styles.titleAccent} />
            <Text style={styles.subtitle}>Enter the 4-letter room code</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.inputHint}>ROOM CODE</Text>
            <TextInput
              style={[styles.codeInput, code.length > 0 && styles.codeInputActive]}
              value={code}
              onChangeText={handleCodeChange}
              placeholder="CODE"
              placeholderTextColor={APP_THEME.textMuted}
              maxLength={4}
              autoCapitalize="characters"
              autoCorrect={false}
              textAlign="center"
            />

            {errorMessage ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>⚠ {errorMessage}</Text>
              </View>
            ) : null}

            <View style={styles.buttonSpacing} />
            <Button title="Join Room"    variant="primary"  onPress={handleJoin} disabled={code.length !== 4} />
            <Button title="Back to Home" variant="outline"  onPress={() => navigation.goBack()} />
          </View>
        </View>
      </KeyboardAvoidingView>
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
  content: {
    width: '100%',
    maxWidth: 420,
    alignSelf: 'center',
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
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 13,
    color: APP_THEME.textMuted,
    textAlign: 'center',
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
  inputHint: {
    fontSize: 10,
    fontWeight: '700',
    color: APP_THEME.textMuted,
    letterSpacing: 2,
    marginBottom: 10,
    textAlign: 'center',
  },
  codeInput: {
    backgroundColor: APP_THEME.background,
    color: APP_THEME.inputText,
    borderRadius: 12,
    paddingVertical: 18,
    paddingHorizontal: 16,
    fontSize: 34,
    fontWeight: '900',
    letterSpacing: 10,
    borderWidth: 1.5,
    borderColor: APP_THEME.inputBorder,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    marginBottom: 10,
  },
  codeInputActive: {
    borderColor: APP_THEME.inputBorderActive,
  },
  errorContainer: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: APP_THEME.primarySubtle,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: APP_THEME.danger,
    marginBottom: 10,
  },
  errorText: {
    color: APP_THEME.danger,
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  buttonSpacing: { height: 6 },
})
