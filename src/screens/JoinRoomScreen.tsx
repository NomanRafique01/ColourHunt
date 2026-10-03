import React, { useState, useRef, useEffect } from 'react'
import {
  View,
  Text,
  Image,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Platform,
  KeyboardAvoidingView,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { RootStackParamList } from '../types/navigation'
import { APP_THEME, COLORS } from '../constants/colors'
import { useRoomStore } from '../store/room'
import { usePlayerStore } from '../store/player'
import { s, vs, ms } from '../utils/scale'

const cameraIcon = require('../../assets/icon.png')

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'JoinRoom'>

// ─── Vector Icons ────────────────────────────────────────────────────────────

function QRCodeIcon() {
  // 3×3 grid of squares, classic QR corner pattern
  return (
    <View style={vectorStyles.qrWrap}>
      {/* top-left corner group */}
      <View style={[vectorStyles.qrOuter, { top: 0, left: 0 }]}>
        <View style={vectorStyles.qrInner} />
      </View>
      {/* top-right corner group */}
      <View style={[vectorStyles.qrOuter, { top: 0, right: 0 }]}>
        <View style={vectorStyles.qrInner} />
      </View>
      {/* bottom-left corner group */}
      <View style={[vectorStyles.qrOuter, { bottom: 0, left: 0 }]}>
        <View style={vectorStyles.qrInner} />
      </View>
      {/* data dots */}
      <View style={[vectorStyles.qrDot, { bottom: s(2), right: s(2) }]} />
      <View style={[vectorStyles.qrDot, { bottom: s(6), right: s(6) }]} />
      <View style={[vectorStyles.qrDot, { bottom: s(2), right: s(6) }]} />
      <View style={[vectorStyles.qrDot, { bottom: s(6), right: s(2) }]} />
    </View>
  )
}

function WifiSignalIcon() {
  return (
    <View style={vectorStyles.wifiWrap}>
      <View style={[vectorStyles.wifiArc, { width: s(20), height: s(10), borderRadius: s(10), top: 0, opacity: 0.3 }]} />
      <View style={[vectorStyles.wifiArc, { width: s(14), height: s(7),  borderRadius: s(7),  top: s(4), left: s(3), opacity: 0.6 }]} />
      <View style={[vectorStyles.wifiArc, { width: s(8),  height: s(4),  borderRadius: s(4),  top: s(8), left: s(6), opacity: 1 }]} />
      <View style={vectorStyles.wifiDot} />
    </View>
  )
}

function WarningIcon() {
  return (
    <View style={vectorStyles.warnWrap}>
      <View style={vectorStyles.warnTriangle} />
      <View style={vectorStyles.warnStem} />
      <View style={vectorStyles.warnDot} />
    </View>
  )
}

// ─── Individual Char Box ──────────────────────────────────────────────────────

function CodeCharBox({ char, isFocused }: { char: string; isFocused: boolean }) {
  const scale = useRef(new Animated.Value(1)).current

  useEffect(() => {
    if (char) {
      Animated.sequence([
        Animated.timing(scale, { toValue: 1.15, duration: 100, useNativeDriver: true }),
        Animated.timing(scale, { toValue: 1,    duration: 100, useNativeDriver: true }),
      ]).start()
    }
  }, [char])

  const filled = char.length > 0

  return (
    <Animated.View
      style={[
        charStyles.box,
        filled   && charStyles.boxFilled,
        isFocused && !filled && charStyles.boxFocused,
        { transform: [{ scale }] },
      ]}
    >
      {filled
        ? <Text style={charStyles.char}>{char}</Text>
        : isFocused
          ? <View style={charStyles.cursor} />
          : null
      }
    </Animated.View>
  )
}

// ─── Main Screen ─────────────────────────────────────────────────────────────

export default function JoinRoomScreen() {
  const navigation = useNavigation<NavigationProp>()
  const [code, setCode]         = useState('')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const { setRoomCode, setRoomStatus } = useRoomStore()
  const { setIsHost }                  = usePlayerStore()

  const slideY = useRef(new Animated.Value(40)).current
  const fadeIn = useRef(new Animated.Value(0)).current
  const inputRef = useRef<TextInput>(null)

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideY, { toValue: 0, duration: 480, useNativeDriver: true }),
      Animated.timing(fadeIn, { toValue: 1, duration: 480, useNativeDriver: true }),
    ]).start()
  }, [])

  const handleCodeChange = (text: string) => {
    const sanitized = text.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 4)
    setCode(sanitized)
    if (errorMsg) setErrorMsg(null)
  }

  const handleJoin = () => {
    if (code.length < 4) {
      setErrorMsg('Enter the full 4-character room code')
      return
    }
    setIsHost(false)
    setRoomCode(code)
    setRoomStatus('waiting')
    navigation.navigate('Lobby', { code, isHost: false })
  }

  const isReady = code.length === 4

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* ── Top Nav ── */}
      <View style={styles.topNav}>
        <View style={styles.brandRow}>
          <Image source={cameraIcon} style={styles.navLogo} resizeMode="contain" />
          <Text style={styles.navWordmark}>
            Colour<Text style={styles.navWordmarkAccent}>Hunt</Text>
          </Text>
        </View>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.kav}
      >
        <Animated.ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          style={{ opacity: fadeIn, transform: [{ translateY: slideY }] }}
        >
          {/* ── Back Page Button ── */}
          <View style={styles.backRow}>
            <TouchableOpacity
              style={styles.backBtn}
              onPress={() => navigation.goBack()}
              activeOpacity={0.7}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <View style={styles.backIconWrap}>
                <Ionicons name="arrow-back" size={s(15)} color={APP_THEME.primary} />
              </View>
              <Text style={styles.backBtnText}>Back</Text>
            </TouchableOpacity>
          </View>

          {/* ── Title ── */}
          <View style={styles.titleBlock}>
            <Text style={styles.pageTitle}>
              Join <Text style={styles.pageTitleAccent}>Room</Text>
            </Text>
            <View style={styles.titleBar} />
            <Text style={styles.pageSubtitle}>Enter the 4-character code your host shared</Text>
          </View>

          {/* ── Code Entry Card ── */}
          <TouchableOpacity
            style={styles.codeCard}
            activeOpacity={1}
            onPress={() => inputRef.current?.focus()}
          >
            <View style={styles.cardTopAccent} />
            <View style={styles.codeCardHeader}>
              <View style={styles.codeCardHeaderLeft}>
                <WifiSignalIcon />
                <Text style={styles.codeCardLabel}>ROOM CODE</Text>
              </View>
              <Text style={styles.codeHint}>{code.length} / 4</Text>
            </View>

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
              caretHidden
            />

            {/* Visual char boxes */}
            <View style={styles.charRow}>
              {[0, 1, 2, 3].map(i => (
                <CodeCharBox
                  key={i}
                  char={code[i] ?? ''}
                  isFocused={code.length === i}
                />
              ))}
            </View>

            {/* Progress bar */}
            <View style={styles.progressTrack}>
              <Animated.View
                style={[
                  styles.progressFill,
                  { width: `${(code.length / 4) * 100}%` },
                ]}
              />
            </View>
          </TouchableOpacity>

          {/* ── Error ── */}
          {errorMsg ? (
            <View style={styles.errorCard}>
              <WarningIcon />
              <Text style={styles.errorText}>{errorMsg}</Text>
            </View>
          ) : null}

          {/* ── Tip Card ── */}
          <View style={styles.tipCard}>
            <View style={styles.tipIconWrap}>
              <QRCodeIcon />
            </View>
            <View style={styles.tipTextWrap}>
              <Text style={styles.tipTitle}>Where's the code?</Text>
              <Text style={styles.tipBody}>
                Ask the room host to share it, or scan the QR code from their screen.
              </Text>
            </View>
          </View>

          {/* ── CTAs ── */}
          <View style={styles.ctaBlock}>
            <TouchableOpacity
              style={[styles.primaryBtn, !isReady && styles.primaryBtnDisabled]}
              onPress={handleJoin}
              activeOpacity={isReady ? 0.85 : 1}
            >
              <Text style={[styles.primaryBtnText, !isReady && styles.primaryBtnTextDisabled]}>
                Join Room
              </Text>
              <View style={[styles.primaryBtnArrow, !isReady && styles.primaryBtnArrowDisabled]}>
                <View style={styles.arrowIcon} />
              </View>
            </TouchableOpacity>
          </View>

          {/* ── Static Footer Hint ── */}
          <View style={styles.footerNote}>
            <View style={styles.footerDot} />
            <Text style={styles.footerNoteText}>ASK THE HOST FOR THE 4-DIGIT CODE</Text>
            <View style={styles.footerDot} />
          </View>
        </Animated.ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: APP_THEME.background,
  },
  kav: { flex: 1 },

  /* ── Top Nav ── */
  topNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: s(22),
    paddingTop: vs(10),
    paddingBottom: vs(6),
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(10),
  },
  navLogo: {
    width: s(44),
    height: s(44),
  },
  navWordmark: {
    fontSize: ms(22),
    fontWeight: '800',
    color: COLORS.gray900,
    letterSpacing: -0.8,
  },
  navWordmarkAccent: {
    color: APP_THEME.primary,
  },

  /* ── Scroll ── */
  scroll: {
    paddingHorizontal: s(20),
    paddingBottom: vs(40),
  },

  /* ── Back Page Button ── */
  backRow: {
    marginTop: vs(12),
    marginBottom: vs(4),
    flexDirection: 'row',
    alignItems: 'center',
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(8),
    backgroundColor: APP_THEME.surface,
    paddingVertical: vs(7),
    paddingHorizontal: s(13),
    borderRadius: s(20),
    borderWidth: 1.5,
    borderColor: 'rgba(228, 12, 26, 0.28)',
    shadowColor: APP_THEME.shadowColorRed,
    shadowOffset: { width: 0, height: vs(2) },
    shadowOpacity: 0.10,
    shadowRadius: s(6),
    elevation: 3,
    alignSelf: 'flex-start',
  },
  backIconWrap: {
    width: s(24),
    height: s(24),
    borderRadius: s(12),
    backgroundColor: 'rgba(228, 12, 26, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backBtnText: {
    fontSize: ms(13),
    fontWeight: '700',
    color: APP_THEME.primary,
    letterSpacing: 0.3,
  },

  /* ── Title ── */
  titleBlock: {
    marginTop: vs(14),
    marginBottom: vs(20),
  },
  pageTitle: {
    fontSize: ms(32),
    fontWeight: '900',
    color: APP_THEME.text,
    letterSpacing: -0.5,
    lineHeight: ms(38),
  },
  pageTitleAccent: {
    fontSize: ms(32),
    fontWeight: '900',
    color: APP_THEME.primary,
    letterSpacing: -0.5,
    lineHeight: ms(38),
  },
  titleBar: {
    width: s(48),
    height: vs(3),
    backgroundColor: APP_THEME.primary,
    borderRadius: 2,
    marginTop: vs(12),
    marginBottom: vs(10),
  },
  pageSubtitle: {
    fontSize: ms(13),
    color: APP_THEME.textMuted,
    lineHeight: ms(19),
  },

  /* ── Card Static Accent ── */
  cardTopAccent: {
    height: vs(3.5),
    backgroundColor: APP_THEME.primary,
    width: '100%',
  },

  /* ── Code Card ── */
  codeCard: {
    backgroundColor: APP_THEME.surface,
    borderRadius: s(20),
    borderWidth: 1.5,
    borderColor: 'rgba(228, 12, 26, 0.28)',
    overflow: 'hidden',
    marginBottom: vs(14),
    shadowColor: APP_THEME.shadowColorRed,
    shadowOffset: { width: 0, height: vs(6) },
    shadowOpacity: 0.10,
    shadowRadius: s(16),
    elevation: 4,
  },
  codeCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: s(18),
    paddingVertical: vs(14),
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(228, 12, 26, 0.12)',
  },
  codeCardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(8),
  },
  codeCardLabel: {
    fontSize: ms(11),
    fontWeight: '700',
    color: APP_THEME.textSecondary,
    letterSpacing: 1.8,
  },
  codeHint: {
    fontSize: ms(13),
    fontWeight: '700',
    color: APP_THEME.primary,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
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
    gap: s(10),
    paddingVertical: vs(28),
    paddingHorizontal: s(18),
  },

  progressTrack: {
    height: vs(3),
    backgroundColor: 'rgba(228, 12, 26, 0.08)',
    marginHorizontal: s(18),
    marginBottom: vs(18),
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: APP_THEME.primary,
    borderRadius: 2,
  },

  /* ── Error ── */
  errorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(10),
    backgroundColor: COLORS.red100,
    borderRadius: s(12),
    borderWidth: 1,
    borderColor: APP_THEME.primaryLight,
    paddingHorizontal: s(14),
    paddingVertical: vs(12),
    marginBottom: vs(14),
  },
  errorText: {
    flex: 1,
    fontSize: ms(13),
    fontWeight: '600',
    color: APP_THEME.danger,
    lineHeight: ms(18),
  },

  /* ── Tip Card ── */
  tipCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(14),
    backgroundColor: APP_THEME.surface,
    borderRadius: s(16),
    borderWidth: 1.5,
    borderColor: 'rgba(228, 12, 26, 0.22)',
    padding: s(16),
    marginBottom: vs(28),
    shadowColor: APP_THEME.shadowColorRed,
    shadowOffset: { width: 0, height: vs(4) },
    shadowOpacity: 0.06,
    shadowRadius: s(12),
    elevation: 2,
  },
  tipIconWrap: {
    width: s(44),
    height: s(44),
    borderRadius: s(12),
    backgroundColor: 'rgba(228, 12, 26, 0.06)',
    borderWidth: 1.5,
    borderColor: 'rgba(228, 12, 26, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tipTextWrap: { flex: 1 },
  tipTitle: {
    fontSize: ms(13),
    fontWeight: '700',
    color: APP_THEME.text,
    marginBottom: vs(3),
  },
  tipBody: {
    fontSize: ms(12),
    color: APP_THEME.textMuted,
    lineHeight: ms(17),
  },

  /* ── CTAs ── */
  ctaBlock: { gap: vs(12) },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: APP_THEME.primary,
    borderRadius: s(16),
    paddingVertical: vs(18),
    paddingHorizontal: s(28),
    shadowColor: APP_THEME.shadowColorRed,
    shadowOffset: { width: 0, height: vs(6) },
    shadowOpacity: 0.35,
    shadowRadius: s(14),
    elevation: 8,
  },
  primaryBtnDisabled: {
    backgroundColor: APP_THEME.surfaceBorder,
    shadowOpacity: 0,
    elevation: 0,
  },
  primaryBtnText: {
    flex: 1,
    color: COLORS.pure_white,
    fontSize: ms(17),
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  primaryBtnTextDisabled: {
    color: APP_THEME.textMuted,
  },
  primaryBtnArrow: {
    width: s(32),
    height: s(32),
    borderRadius: s(10),
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnArrowDisabled: {
    backgroundColor: APP_THEME.backgroundSoft,
  },
  arrowIcon: {
    width: s(9),
    height: s(9),
    borderTopWidth: 2.5,
    borderRightWidth: 2.5,
    borderColor: COLORS.pure_white,
    transform: [{ rotate: '45deg' }],
    marginLeft: s(-3),
  },

  /* ── Static Footer Hint ── */
  footerNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: s(8),
    marginTop: vs(20),
  },
  footerDot: {
    width: s(4),
    height: s(4),
    borderRadius: s(2),
    backgroundColor: 'rgba(228, 12, 26, 0.35)',
  },
  footerNoteText: {
    fontSize: ms(10),
    fontWeight: '700',
    color: APP_THEME.textMuted,
    letterSpacing: 1.5,
  },
})

// ─── Vector Styles ────────────────────────────────────────────────────────────

const vectorStyles = StyleSheet.create({
  /* QR code */
  qrWrap: { width: s(20), height: s(20), position: 'relative' },
  qrOuter: {
    position: 'absolute',
    width: s(8),
    height: s(8),
    borderRadius: s(2),
    borderWidth: 1.5,
    borderColor: APP_THEME.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrInner: {
    width: s(3),
    height: s(3),
    borderRadius: s(0.5),
    backgroundColor: APP_THEME.primary,
  },
  qrDot: {
    position: 'absolute',
    width: s(3),
    height: s(3),
    borderRadius: s(0.5),
    backgroundColor: APP_THEME.primary,
  },

  /* Wifi */
  wifiWrap: { width: s(20), height: s(14), position: 'relative', alignItems: 'center' },
  wifiArc: {
    position: 'absolute',
    borderWidth: 1.5,
    borderColor: APP_THEME.primary,
    borderBottomWidth: 0,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
  wifiDot: {
    position: 'absolute',
    bottom: 0,
    width: s(3),
    height: s(3),
    borderRadius: s(1.5),
    backgroundColor: APP_THEME.primary,
    alignSelf: 'center',
  },

  /* Warning */
  warnWrap: { width: s(16), height: s(15), alignItems: 'center', justifyContent: 'center' },
  warnTriangle: {
    position: 'absolute',
    width: 0,
    height: 0,
    borderLeftWidth: s(8),
    borderRightWidth: s(8),
    borderBottomWidth: s(14),
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: APP_THEME.danger,
    top: 0,
  },
  warnStem: {
    position: 'absolute',
    width: 2,
    height: s(5),
    backgroundColor: COLORS.pure_white,
    borderRadius: 1,
    top: s(4),
  },
  warnDot: {
    position: 'absolute',
    width: s(2.5),
    height: s(2.5),
    borderRadius: s(1.25),
    backgroundColor: COLORS.pure_white,
    bottom: s(2),
  },
})

// ─── Char Box Styles ──────────────────────────────────────────────────────────

const charStyles = StyleSheet.create({
  box: {
    width: s(62),
    height: s(70),
    borderRadius: s(14),
    borderWidth: 1.5,
    borderColor: 'rgba(228, 12, 26, 0.25)',
    backgroundColor: 'rgba(228, 12, 26, 0.02)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxFilled: {
    borderColor: APP_THEME.primary,
    borderWidth: 2,
    backgroundColor: 'rgba(228, 12, 26, 0.08)',
  },
  boxFocused: {
    borderColor: APP_THEME.primary,
    borderWidth: 2,
    backgroundColor: 'rgba(228, 12, 26, 0.04)',
    shadowColor: APP_THEME.shadowColorRed,
    shadowOffset: { width: 0, height: vs(2) },
    shadowOpacity: 0.15,
    shadowRadius: s(6),
    elevation: 2,
  },
  char: {
    fontSize: ms(28),
    fontWeight: '900',
    color: APP_THEME.primary,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  cursor: {
    width: 2,
    height: ms(28),
    backgroundColor: APP_THEME.primary,
    borderRadius: 1,
  },
})
