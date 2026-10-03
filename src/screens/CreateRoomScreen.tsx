import React, { useState, useRef, useEffect } from 'react'
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Platform,
  ScrollView,
  Share,
  Clipboard,
} from 'react-native'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { RootStackParamList } from '../types/navigation'
import { APP_THEME, COLORS } from '../constants/colors'
import { s, vs, ms } from '../utils/scale'

const cameraIcon = require('../../assets/icon.png')

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'CreateRoom'>

// ─── Design Tokens ────────────────────────────────────────────────────────────

/** Spacing scale: 8 / 12 / 16 / 24 */
const SP = { xs: 8, sm: 12, md: 16, lg: 24 } as const

/** Corner radii: only two values used everywhere */
const RADIUS = { card: 20, chip: 12 } as const

/** Per-player slot colours – red palette only */
const PLAYER_COLORS: { bg: string; border: string; text: string }[] = [
  { bg: COLORS.red100, border: COLORS.red500, text: COLORS.red700 }, // P1 – crimson
  { bg: COLORS.red100, border: COLORS.red400, text: COLORS.red600 }, // P2 – scarlet
  { bg: COLORS.red100, border: COLORS.red600, text: COLORS.red800 }, // P3 – cardinal
  { bg: COLORS.red100, border: COLORS.red300, text: COLORS.red600 }, // P4 – rose
]

// ─── Room Code Generator (no 0,O,1,I) ────────────────────────────────────────

const SAFE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

function generateRoomCode(length = 5): string {
  return Array.from({ length }, () =>
    SAFE_CHARS[Math.floor(Math.random() * SAFE_CHARS.length)]
  ).join('')
}

// ─── Pulsing Dot (amber for Waiting) ─────────────────────────────────────────

function PulsingDot({ color = APP_THEME.primary }: { color?: string }) {
  const scale   = useRef(new Animated.Value(1)).current
  const opacity = useRef(new Animated.Value(1)).current

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(scale,   { toValue: 1.9, duration: 800, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 0,   duration: 800, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(scale,   { toValue: 1, duration: 0, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 1, duration: 0, useNativeDriver: true }),
        ]),
      ])
    ).start()
  }, [])

  return (
    <View style={{ width: s(12), height: s(12), alignItems: 'center', justifyContent: 'center' }}>
      <Animated.View style={{
        position: 'absolute',
        width: s(12), height: s(12), borderRadius: s(6),
        borderWidth: 1.5, borderColor: color,
        transform: [{ scale }], opacity,
      }} />
      <View style={{
        width: s(6), height: s(6), borderRadius: s(3),
        backgroundColor: color, position: 'absolute',
      }} />
    </View>
  )
}

// ─── Player Slot ──────────────────────────────────────────────────────────────

function PlayerSlot({ filled, index }: { filled: boolean; index: number }) {
  const pc = PLAYER_COLORS[index]
  const isHost = index === 0 && filled

  return (
    <View style={[
      slotStyles.wrap,
      filled
        ? { borderColor: pc.border, borderStyle: 'solid', backgroundColor: pc.bg }
        : slotStyles.wrapEmpty,
    ]}>
      {/* Player colour accent top bar */}
      <View style={[slotStyles.accentBar, { backgroundColor: filled ? pc.border : COLORS.red200 }]} />

      {filled ? (
        <View style={slotStyles.filledContent}>
          {/* Avatar circle */}
          <View style={[slotStyles.avatarFilled, { backgroundColor: pc.border }]}>
            <Text style={slotStyles.avatarInitial}>
              {index === 0 ? 'Y' : `P${index + 1}`}
            </Text>
          </View>
          <Text style={[slotStyles.label, { color: pc.text }]}>
            {index === 0 ? 'You' : `P${index + 1}`}
          </Text>
          {isHost && (
            <View style={[slotStyles.hostChip, { backgroundColor: pc.bg, borderColor: pc.border }]}>
              <Text style={[slotStyles.hostChipText, { color: pc.text }]}>Host</Text>
            </View>
          )}
        </View>
      ) : (
        <View style={slotStyles.emptyContent}>
          {/* Large "+" centred */}
          <View style={slotStyles.plusCircle}>
            <Text style={slotStyles.plusSign}>+</Text>
          </View>
          <Text style={slotStyles.waitingLabel}>Waiting…</Text>
        </View>
      )}
    </View>
  )
}

// ─── Settings Chip (read-only) ────────────────────────────────────────────────

function SettingChip({
  iconName,
  value,
  label,
}: {
  iconName: React.ComponentProps<typeof Ionicons>['name']
  value: string
  label: string
}) {
  return (
    <View style={chipStyles.wrap}>
      <Ionicons name={iconName} size={s(16)} color={APP_THEME.primary} />
      <Text style={chipStyles.value}>{value}</Text>
      <Text style={chipStyles.label}>{label}</Text>
    </View>
  )
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function CreateRoomScreen() {
  const navigation  = useNavigation<NavigationProp>()
  const insets      = useSafeAreaInsets()
  const [copied, setCopied]   = useState(false)
  const [roomCode]            = useState(() => generateRoomCode(5))
  const filledSlots           = [true, false, false, false]

  const slideY = useRef(new Animated.Value(40)).current
  const fadeIn = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideY, { toValue: 0, duration: 480, useNativeDriver: true }),
      Animated.timing(fadeIn, { toValue: 1, duration: 480, useNativeDriver: true }),
    ]).start()
  }, [])

  const handleCopy = () => {
    Clipboard.setString(roomCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Join my ColourHunt room! Code: ${roomCode}`,
        title: 'Join ColourHunt Room',
      })
    } catch (_) {}
  }

  const handleEnterLobby = () => {
    navigation.navigate('Lobby', { code: roomCode, isHost: true })
  }

  // Sticky bottom button height for scroll padding
  const stickyBtnHeight = vs(56) + insets.bottom + SP.md

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>

      {/* ── Top Nav ── */}
      <View style={styles.topNav}>
        <View style={styles.brandRow}>
          <Image source={cameraIcon} style={styles.navLogo} resizeMode="contain" />
          <Text style={styles.navWordmark}>
            Colour<Text style={styles.navWordmarkAccent}>Hunt</Text>
          </Text>
        </View>
      </View>

      {/* ── Scrollable body ── */}
      <Animated.ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: stickyBtnHeight }]}
        showsVerticalScrollIndicator={false}
        style={{ opacity: fadeIn, transform: [{ translateY: slideY }] }}
      >
        {/* ── Back Button ── */}
        <View style={styles.backRow}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <View style={styles.backIconWrap}>
              <Ionicons name="arrow-back" size={s(15)} color={APP_THEME.primary} />
            </View>
            <Text style={styles.backBtnText}>Back</Text>
          </TouchableOpacity>
        </View>

        {/* ── Page Title ── */}
        <View style={styles.titleBlock}>
          <Text style={styles.pageTitle}>
            Create <Text style={styles.pageTitleAccent}>Room</Text>
          </Text>
          <View style={styles.titleBar} />
          <Text style={styles.pageSubtitle}>Share the code below with your friends to join</Text>
        </View>

        {/* ── Room Code Card ── */}
        <View style={styles.card}>
          <View style={[styles.cardAccent, { backgroundColor: APP_THEME.primary }]} />
          <View style={styles.cardBody}>
            {/* Label row */}
            <View style={styles.cardHeaderRow}>
              <View style={styles.labelRow}>
                <View style={[styles.labelDot, { backgroundColor: APP_THEME.primary }]} />
                <Text style={styles.cardLabel}>ROOM CODE</Text>
              </View>
            </View>

            {/* Hero code tiles */}
            <View style={styles.codeBadge}>
              {roomCode.split('').map((char, i) => (
                <View key={i} style={styles.codeCharBox}>
                  <Text style={styles.codeChar}>{char}</Text>
                </View>
              ))}
            </View>

            {/* Copy + Share buttons */}
            <View style={styles.codeActions}>
              <TouchableOpacity
                style={styles.copyBtn}
                onPress={handleCopy}
                activeOpacity={0.75}
              >
                <Ionicons
                  name={copied ? 'checkmark' : 'copy-outline'}
                  size={s(15)}
                  color={COLORS.red700}
                />
                <Text style={styles.copyBtnText}>{copied ? 'Copied!' : 'Copy'}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.shareBtn}
                onPress={handleShare}
                activeOpacity={0.85}
              >
                <Ionicons name="share-social-outline" size={s(15)} color={COLORS.pure_white} />
                <Text style={styles.shareBtnText}>Share</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* ── Lobby Status Card ── */}
        <View style={styles.card}>
          <View style={[styles.cardAccent, { backgroundColor: APP_THEME.primary }]} />
          <View style={styles.cardBody}>
            {/* Header: label + Waiting pill */}
            <View style={styles.cardHeaderRow}>
              <View style={styles.labelRow}>
                <View style={[styles.labelDot, { backgroundColor: APP_THEME.primary }]} />
                <Text style={styles.cardLabel}>LOBBY STATUS</Text>
              </View>
              <View style={styles.waitingPill}>
                <PulsingDot />
                <Text style={styles.waitingPillText}>Waiting</Text>
              </View>
            </View>

            <View style={styles.divider} />

            {/* Players count label */}
            <Text style={styles.slotsLabel}>PLAYERS  1 / 4</Text>

            {/* Player slots grid */}
            <View style={styles.slotsRow}>
              {filledSlots.map((filled, i) => (
                <PlayerSlot key={i} filled={filled} index={i} />
              ))}
            </View>

            {/* Settings chips (read-only) */}
            <View style={styles.settingsRow}>
              <SettingChip iconName="people-outline" value="4" label="Players" />
              <View style={styles.settingsDivider} />
              <SettingChip iconName="timer-outline" value="60s" label="Round" />
              <View style={styles.settingsDivider} />
              <SettingChip iconName="refresh-outline" value="5" label="Rounds" />
            </View>
          </View>
        </View>

        {/* ── Static Footer Hint ── */}
        <View style={styles.footerNote}>
          <View style={styles.footerDot} />
          <Text style={styles.footerNoteText}>2–4 PLAYERS · REAL-WORLD MULTIPLAYER</Text>
          <View style={styles.footerDot} />
        </View>
      </Animated.ScrollView>

      {/* ── Sticky Bottom CTA ── */}
      <View style={[styles.stickyBottom, { paddingBottom: insets.bottom + SP.sm }]}>
        <TouchableOpacity style={styles.primaryBtn} onPress={handleEnterLobby} activeOpacity={0.85}>
          <Text style={styles.primaryBtnText}>Start Lobby</Text>
          <View style={styles.primaryBtnArrow}>
            <Ionicons name="arrow-forward" size={s(16)} color={COLORS.pure_white} />
          </View>
        </TouchableOpacity>
      </View>

    </SafeAreaView>
  )
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: APP_THEME.background,
  },

  /* ── Top Nav ── */
  topNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: s(SP.lg),
    paddingTop: vs(SP.sm),
    paddingBottom: vs(SP.xs),
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(SP.xs),
  },
  navLogo: {
    width: s(38),
    height: s(38),
  },
  navWordmark: {
    fontSize: ms(20),
    fontWeight: '800',
    color: COLORS.red900,
    letterSpacing: -0.5,
  },
  navWordmarkAccent: {
    color: APP_THEME.primary,
  },

  /* ── Scroll ── */
  scroll: {
    paddingHorizontal: s(SP.md),
  },

  /* ── Back Button ── */
  backRow: {
    marginTop: vs(SP.sm),
    marginBottom: vs(SP.xs),
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 44,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(SP.xs),
    minWidth: 44,
    minHeight: 44,
    paddingVertical: vs(SP.xs),
    paddingHorizontal: s(SP.sm),
    borderRadius: s(RADIUS.chip),
    borderWidth: 1.5,
    borderColor: 'rgba(228, 12, 26, 0.28)',
    backgroundColor: APP_THEME.surface,
    alignSelf: 'flex-start',
  },
  backIconWrap: {
    width: s(22),
    height: s(22),
    borderRadius: s(11),
    backgroundColor: 'rgba(228, 12, 26, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backBtnText: {
    fontSize: ms(13),
    fontWeight: '700',
    color: APP_THEME.primary,
    letterSpacing: 0.2,
  },

  /* ── Page Title ── */
  titleBlock: {
    marginTop: vs(SP.sm),
    marginBottom: vs(SP.md),
  },
  pageTitle: {
    fontSize: ms(30),
    fontWeight: '900',
    color: APP_THEME.text,
    letterSpacing: -0.5,
    lineHeight: ms(36),
  },
  pageTitleAccent: {
    fontSize: ms(30),
    fontWeight: '900',
    color: APP_THEME.primary,
  },
  titleBar: {
    width: s(40),
    height: vs(3),
    backgroundColor: APP_THEME.primary,
    borderRadius: 2,
    marginTop: vs(SP.sm),
    marginBottom: vs(SP.xs),
  },
  pageSubtitle: {
    fontSize: ms(13),
    color: COLORS.red800,
    lineHeight: ms(19),
  },

  /* ── Card ── */
  card: {
    backgroundColor: APP_THEME.surface,
    borderRadius: s(RADIUS.card),
    borderWidth: 1,
    borderColor: 'rgba(228, 12, 26, 0.20)',
    overflow: 'hidden',
    marginBottom: vs(SP.md),
    shadowColor: APP_THEME.shadowColorRed,
    shadowOffset: { width: 0, height: vs(3) },
    shadowOpacity: 0.10,
    shadowRadius: s(10),
    elevation: 3,
  },
  cardAccent: {
    height: vs(3.5),
    width: '100%',
  },
  cardBody: {
    paddingHorizontal: s(SP.md),
    paddingTop: vs(SP.md),
    paddingBottom: vs(SP.md),
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: vs(SP.md),
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(SP.xs),
  },
  labelDot: {
    width: s(7),
    height: s(7),
    borderRadius: s(3.5),
  },
  cardLabel: {
    fontSize: ms(12),
    fontWeight: '700',
    color: COLORS.red800,
    letterSpacing: 1.0,
  },

  /* ── Code Badge (hero) ── */
  codeBadge: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: s(SP.xs),
    paddingVertical: vs(SP.lg),
  },
  codeCharBox: {
    width: s(52),
    height: s(60),
    backgroundColor: 'rgba(228, 12, 26, 0.04)',
    borderRadius: s(RADIUS.chip),
    borderWidth: 2,
    borderColor: APP_THEME.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  codeChar: {
    fontSize: ms(28),
    fontWeight: '900',
    color: APP_THEME.primary,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },

  /* ── Code Actions row ── */
  codeActions: {
    flexDirection: 'row',
    gap: s(SP.sm),
  },
  copyBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: s(6),
    paddingVertical: vs(SP.sm),
    borderRadius: s(RADIUS.chip),
    borderWidth: 1.5,
    borderColor: APP_THEME.primary,
    backgroundColor: COLORS.red100,
  },
  copyBtnText: {
    fontSize: ms(13),
    fontWeight: '700',
    color: APP_THEME.primary,
  },
  shareBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: s(6),
    paddingVertical: vs(SP.sm),
    borderRadius: s(RADIUS.chip),
    backgroundColor: APP_THEME.primary,
  },
  shareBtnText: {
    fontSize: ms(13),
    fontWeight: '700',
    color: COLORS.pure_white,
  },

  /* ── Waiting Pill (red-light) ── */
  waitingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(6),
    backgroundColor: COLORS.red100,
    paddingVertical: vs(4),
    paddingHorizontal: s(SP.sm),
    borderRadius: s(RADIUS.card),
    borderWidth: 1,
    borderColor: APP_THEME.primary,
  },
  waitingPillText: {
    fontSize: ms(12),
    fontWeight: '700',
    color: APP_THEME.primary,
  },

  /* ── Divider ── */
  divider: {
    height: 1,
    backgroundColor: 'rgba(228, 12, 26, 0.12)',
    marginBottom: vs(SP.md),
  },

  /* ── Slots ── */
  slotsLabel: {
    fontSize: ms(12),
    fontWeight: '700',
    color: COLORS.red800,
    letterSpacing: 0.8,
    marginBottom: vs(SP.sm),
  },
  slotsRow: {
    flexDirection: 'row',
    gap: s(SP.xs),
    marginBottom: vs(SP.md),
  },

  /* ── Settings chips row ── */
  settingsRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.red100,
    borderRadius: s(RADIUS.chip),
    borderWidth: 1,
    borderColor: 'rgba(228, 12, 26, 0.20)',
    overflow: 'hidden',
  },
  settingsDivider: {
    width: 1,
    backgroundColor: 'rgba(228, 12, 26, 0.18)',
  },

  /* ── Footer ── */
  footerNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: s(SP.xs),
    marginTop: vs(SP.md),
    marginBottom: vs(SP.sm),
  },
  footerDot: {
    width: s(4),
    height: s(4),
    borderRadius: s(2),
    backgroundColor: COLORS.red300,
  },
  footerNoteText: {
    fontSize: ms(12),
    fontWeight: '700',
    color: COLORS.red400,
    letterSpacing: 0.8,
  },

  /* ── Sticky Bottom CTA ── */
  stickyBottom: {
    paddingHorizontal: s(SP.md),
    paddingTop: vs(SP.sm),
    backgroundColor: APP_THEME.background,
    borderTopWidth: 1,
    borderTopColor: COLORS.red100,
    shadowColor: APP_THEME.shadowColorRed,
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 8,
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: APP_THEME.primary,
    borderRadius: s(RADIUS.chip),
    paddingVertical: vs(16),
    paddingHorizontal: s(SP.lg),
    shadowColor: APP_THEME.shadowColorRed,
    shadowOffset: { width: 0, height: vs(4) },
    shadowOpacity: 0.30,
    shadowRadius: s(12),
    elevation: 6,
  },
  primaryBtnText: {
    flex: 1,
    color: COLORS.pure_white,
    fontSize: ms(16),
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  primaryBtnArrow: {
    width: s(30),
    height: s(30),
    borderRadius: s(8),
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
})

// ─── Slot Styles ──────────────────────────────────────────────────────────────

const slotStyles = StyleSheet.create({
  wrap: {
    flex: 1,
    aspectRatio: 0.82,
    borderRadius: s(RADIUS.chip),
    borderWidth: 2,
    overflow: 'hidden',
    alignItems: 'center',
  },
  wrapEmpty: {
    borderColor: COLORS.red300,
    borderStyle: 'dashed',
    backgroundColor: COLORS.red100,
  },
  accentBar: {
    width: '100%',
    height: vs(3),
  },
  filledContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: vs(SP.xs),
    gap: vs(3),
  },
  avatarFilled: {
    width: s(32),
    height: s(32),
    borderRadius: s(16),
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    fontSize: ms(13),
    fontWeight: '900',
    color: COLORS.pure_white,
  },
  crownBadge: {
    position: 'absolute',
    top: vs(2),
    right: s(4),
  },
  label: {
    fontSize: ms(12),
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  hostChip: {
    paddingHorizontal: s(6),
    paddingVertical: vs(1),
    borderRadius: s(6),
    borderWidth: 1,
  },
  hostChipText: {
    fontSize: ms(9),
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  emptyContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: vs(SP.xs),
    paddingVertical: vs(SP.xs),
  },
  plusCircle: {
    width: s(28),
    height: s(28),
    borderRadius: s(14),
    backgroundColor: COLORS.red200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  plusSign: {
    fontSize: ms(18),
    fontWeight: '700',
    color: COLORS.red700,
    lineHeight: ms(20),
  },
  waitingLabel: {
    fontSize: ms(10),
    fontWeight: '600',
    color: COLORS.red500,
    letterSpacing: 0.2,
  },
})

// ─── Setting Chip Styles ──────────────────────────────────────────────────────

const chipStyles = StyleSheet.create({
  wrap: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: vs(SP.sm),
    gap: vs(2),
  },
  value: {
    fontSize: ms(15),
    fontWeight: '800',
    color: COLORS.red900,
    letterSpacing: -0.2,
  },
  label: {
    fontSize: ms(10),
    fontWeight: '600',
    color: COLORS.red700,
    letterSpacing: 0.2,
  },
})
