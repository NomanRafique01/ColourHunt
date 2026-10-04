import React, { useState, useRef, useEffect } from 'react'
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Animated,
  Platform,
  KeyboardAvoidingView,
  Clipboard,
} from 'react-native'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useNavigation, useIsFocused } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { RootStackParamList } from '../types/navigation'
import { ACCENT, APP_THEME } from '../constants/colors'
import { useRoomStore } from '../store/room'
import { usePlayerStore } from '../store/player'
import { s, vs, ms } from '../utils/scale'
import { ScreenHeader } from '../components/ScreenHeader'
import { Card } from '../components/Card'
import { CodeTile, CodeTileState } from '../components/CodeTile'
import { ActionButton } from '../components/ActionButton'
import { StickyFooterButton } from '../components/StickyFooterButton'
import { InfoCard } from '../components/InfoCard'
import { KeyIcon } from '../../assets/svg/KeyIcon'
import { JoinArt } from '../art/JoinArt'

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'JoinRoom'>

const HERO_TOP = APP_THEME.heroTop

export default function JoinRoomScreen() {
  const navigation = useNavigation<NavigationProp>()
  const insets = useSafeAreaInsets()
  const isScreenFocused = useIsFocused()
  const [code, setCode] = useState('')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [isFocused, setIsFocused] = useState(true)

  const { setRoomCode, setRoomStatus } = useRoomStore()
  const { setIsHost } = usePlayerStore()

  const slideY = useRef(new Animated.Value(40)).current
  const fadeIn = useRef(new Animated.Value(0)).current
  const shakeAnim = useRef(new Animated.Value(0)).current
  const inputRef = useRef<TextInput>(null)

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideY, { toValue: 0, duration: 480, useNativeDriver: true }),
      Animated.timing(fadeIn, { toValue: 1, duration: 480, useNativeDriver: true }),
    ]).start()

    // Focus input on load
    const timer = setTimeout(() => {
      inputRef.current?.focus()
    }, 200)
    return () => clearTimeout(timer)
  }, [])

  const triggerShake = (msg: string) => {
    setErrorMsg(msg)
    shakeAnim.setValue(0)
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 8, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -8, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 6, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -6, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 3, duration: 40, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 40, useNativeDriver: true }),
    ]).start()
  }

  const handleCodeChange = (text: string) => {
    const sanitized = text.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 4)
    setCode(sanitized)
    if (errorMsg) setErrorMsg(null)
  }

  const handlePaste = async () => {
    try {
      const text = await Clipboard.getString()
      if (text) {
        const sanitized = text.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 4)
        if (sanitized.length > 0) {
          setCode(sanitized)
          if (errorMsg) setErrorMsg(null)
          inputRef.current?.focus()
        }
      }
    } catch (_) {}
  }

  const handleJoin = () => {
    if (code.length < 4) {
      triggerShake('Enter the full 4-character room code')
      return
    }

    // Example client validation against common error states
    if (code === 'FULL') {
      triggerShake('Room is full')
      return
    }
    if (code === 'PLAY') {
      triggerShake('Game already started')
      return
    }
    if (code === 'NONE') {
      triggerShake('Room not found')
      return
    }

    setIsHost(false)
    setRoomCode(code)
    setRoomStatus('waiting')
    navigation.navigate('Lobby', { code, isHost: false })
  }

  const isReady = code.length === 4
  const stickyBtnHeight = vs(54) + insets.bottom + vs(12) * 2
  const scrollBottomPadding = stickyBtnHeight + vs(16)

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.kav}
      >
        <Animated.ScrollView
          contentContainerStyle={[styles.scrollContent, { paddingBottom: scrollBottomPadding }]}
          showsVerticalScrollIndicator={false}
          bounces={false}
          keyboardShouldPersistTaps="handled"
          style={{ opacity: fadeIn, transform: [{ translateY: slideY }], backgroundColor: APP_THEME.background }}
        >
          {/* ── Shared Red Hero ScreenHeader ── */}
          <ScreenHeader
            title="Join"
            titleAccent="Room"
            subtitle="Enter the 4-character code your host shared"
            onBack={() => navigation.goBack()}
            artNode={isScreenFocused ? <JoinArt /> : null}
          />

          {/* ── Cards Container (Overlaps the bottom of the hero area) ── */}
          <View style={styles.cardsContainer}>

            {/* ── CODE CARD ── */}
            <Card
              accentColor={errorMsg ? APP_THEME.danger : ACCENT.red.base}
              label="ROOM CODE"
              icon={<KeyIcon size={s(15)} color={errorMsg ? APP_THEME.danger : ACCENT.red.base} />}
              onPress={() => inputRef.current?.focus()}
            >
              {/* Hidden real input */}
              <TextInput
                ref={inputRef}
                value={code}
                onChangeText={handleCodeChange}
                maxLength={4}
                autoCapitalize="characters"
                autoCorrect={false}
                keyboardType="default"
                style={styles.hiddenInput}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                caretHidden
              />

              {/* Shared Code Tiles (Red, Blue, Green, Yellow) */}
              <View style={styles.charRow}>
                {[0, 1, 2, 3].map((i) => {
                  let tileState: CodeTileState = 'empty'
                  if (errorMsg) {
                    tileState = 'error'
                  } else if (i < code.length) {
                    tileState = 'filled'
                  } else if (i === code.length && isFocused) {
                    tileState = 'active'
                  }

                  return (
                    <CodeTile
                      key={i}
                      char={code[i] ?? ''}
                      index={i}
                      state={tileState}
                      isError={!!errorMsg}
                      shakeAnim={shakeAnim}
                      onPress={() => inputRef.current?.focus()}
                    />
                  )
                })}
              </View>

              {/* Error Message with Icon */}
              {errorMsg ? (
                <View style={styles.errorContainer}>
                  <Ionicons name="alert-circle" size={s(16)} color={APP_THEME.danger} />
                  <Text style={styles.errorText}>{errorMsg}</Text>
                </View>
              ) : null}

              {/* Action row below tiles */}
              <View style={styles.actionRow}>
                <ActionButton
                  label="Paste"
                  variant="blue"
                  icon={<Ionicons name="clipboard-outline" size={s(15)} color={ACCENT.blue.dark} />}
                  onPress={handlePaste}
                />
              </View>
            </Card>

            {/* ── QUIETER HELP / INFO CARD ── */}
            <InfoCard
              icon={<KeyIcon size={s(16)} color={ACCENT.blue.base} />}
              title="Where's the code?"
              body="Ask the room host to share the 4-character code shown on their screen."
            />

          </View>
        </Animated.ScrollView>

        {/* ── Shared Sticky Bottom CTA ── */}
        <StickyFooterButton
          label="Join Room"
          onPress={handleJoin}
          disabled={!isReady}
          insetsBottom={insets.bottom}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: HERO_TOP,
  },
  kav: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  cardsContainer: {
    paddingHorizontal: s(16),
    marginTop: vs(-22),
  },
  hiddenInput: {
    position: 'absolute',
    width: 1,
    height: 1,
    opacity: 0,
  },
  charRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: s(8),
    paddingTop: vs(8),
    paddingBottom: vs(12),
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: s(6),
    backgroundColor: ACCENT.red.light,
    borderRadius: s(8),
    paddingVertical: vs(7),
    paddingHorizontal: s(12),
    marginBottom: vs(10),
  },
  errorText: {
    fontSize: ms(12),
    fontWeight: '700',
    color: APP_THEME.danger,
  },
  actionRow: {
    flexDirection: 'row',
    marginTop: vs(4),
  },
})

