import React, { useState, useRef, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Share,
  Clipboard,
} from 'react-native'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useNavigation, useIsFocused } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { RootStackParamList } from '../types/navigation'
import { ACCENT, APP_THEME, COLORS } from '../constants/colors'
import { useRoomStore } from '../store/room'
import { s, vs, ms } from '../utils/scale'
import { ScreenHeader } from '../components/ScreenHeader'
import { Card } from '../components/Card'
import { CodeTile } from '../components/CodeTile'
import { ActionButton } from '../components/ActionButton'
import { StickyFooterButton } from '../components/StickyFooterButton'
import { CopyIcon } from '../../assets/svg/CopyIcon'
import { ShareIcon } from '../../assets/svg/ShareIcon'
import { HostCrownBadge } from '../../assets/svg/HostCrownBadge'
import { StopwatchIcon } from '../../assets/svg/StopwatchIcon'
import { RoundCounterIcon } from '../../assets/svg/RoundCounterIcon'
import { PeopleDotsIcon } from '../../assets/svg/PeopleDotsIcon'
import { CreateArt } from '../art/CreateArt'

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'CreateRoom'>

const HERO_TOP = APP_THEME.heroTop

/** Per-player slot colours: P1 red, P2 blue, P3 green, P4 yellow */
const SLOT_COLORS = [
  { bg: ACCENT.red.light,    border: ACCENT.red.base,    dark: ACCENT.red.dark },
  { bg: ACCENT.blue.light,   border: ACCENT.blue.base,   dark: ACCENT.blue.dark },
  { bg: ACCENT.green.light,  border: ACCENT.green.base,  dark: ACCENT.green.dark },
  { bg: ACCENT.yellow.light, border: ACCENT.yellow.base, dark: ACCENT.yellow.dark },
  { bg: ACCENT.purple.light, border: ACCENT.purple.base, dark: ACCENT.purple.dark },
  { bg: ACCENT.amber.light,  border: ACCENT.amber.base,  dark: ACCENT.amber.dark },
] as const

// ─── Room Code Generator (4 characters to match Join Room) ───────────────────

const SAFE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

function generateRoomCode(length = 4): string {
  return Array.from({ length }, () =>
    SAFE_CHARS[Math.floor(Math.random() * SAFE_CHARS.length)]
  ).join('')
}

// ─── Pulsing Dot ─────────────────────────────────────────────────────────────

function PulsingDot({ color = ACCENT.amber.base }: { color?: string }) {
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
  const pc = SLOT_COLORS[index % SLOT_COLORS.length]
  const isHost = index === 0 && filled

  return (
    <View
      style={[
        slotStyles.wrap,
        filled
          ? { borderColor: pc.border, borderStyle: 'solid', backgroundColor: pc.bg }
          : { borderColor: pc.border, borderStyle: 'dashed', backgroundColor: pc.bg },
      ]}
    >
      {/* Player colour accent top bar */}
      <View style={[slotStyles.accentBar, { backgroundColor: pc.border }]} />

      {filled ? (
        <View style={slotStyles.filledContent}>
          {isHost && (
            <View style={slotStyles.crownBadge}>
              <HostCrownBadge size={s(15)} color={APP_THEME.primary} />
            </View>
          )}
          {/* Avatar circle */}
          <View style={[slotStyles.avatarFilled, { backgroundColor: pc.border }]}>
            <Text style={[slotStyles.avatarInitial, index === 3 && { color: pc.dark }]}>
              {index === 0 ? 'Y' : `P${index + 1}`}
            </Text>
          </View>
          <Text style={[slotStyles.label, { color: pc.dark }]}>
            {index === 0 ? 'You' : `P${index + 1}`}
          </Text>
          {isHost && (
            <View style={[slotStyles.hostChip, { backgroundColor: COLORS.pure_white, borderColor: pc.border }]}>
              <Text style={[slotStyles.hostChipText, { color: pc.dark }]}>Host</Text>
            </View>
          )}
        </View>
      ) : (
        <View style={slotStyles.emptyContent}>
          {/* Coloured "+" circle */}
          <View style={[slotStyles.plusCircle, { backgroundColor: pc.border }]}>
            <Text style={[slotStyles.plusSign, { color: index === 3 ? pc.dark : COLORS.pure_white }]}>+</Text>
          </View>
          <Text style={[slotStyles.waitingLabel, { color: pc.dark }]}>Waiting…</Text>
        </View>
      )}
    </View>
  )
}

// ─── Editable Setting Stepper Card (Polished: no slider icon, bigger bold coloured value) ───

function EditableSettingCard({
  icon,
  label,
  rangeLabel,
  value,
  onDecrement,
  onIncrement,
  canDecrement,
  canIncrement,
  accentColor,
}: {
  icon: React.ReactNode
  label: string
  rangeLabel: string
  value: string
  onDecrement: () => void
  onIncrement: () => void
  canDecrement: boolean
  canIncrement: boolean
  accentColor: string
}) {
  return (
    <View style={stepperCardStyles.card}>
      <View style={stepperCardStyles.topRow}>
        <View style={stepperCardStyles.labelWrap}>
          <View style={[stepperCardStyles.iconBadge, { backgroundColor: `${accentColor}18` }]}>
            {icon}
          </View>
          <Text style={stepperCardStyles.label}>{label}</Text>
          <View style={[stepperCardStyles.rangePill, { backgroundColor: `${accentColor}14` }]}>
            <Text style={[stepperCardStyles.rangeText, { color: accentColor }]}>{rangeLabel}</Text>
          </View>
        </View>
      </View>

      <View style={stepperCardStyles.stepperRow}>
        <TouchableOpacity
          style={[
            stepperCardStyles.stepBtn,
            { borderColor: accentColor },
            !canDecrement && stepperCardStyles.stepBtnDisabled,
          ]}
          onPress={onDecrement}
          disabled={!canDecrement}
          activeOpacity={0.7}
        >
          <Text
            style={[
              stepperCardStyles.stepBtnSign,
              { color: accentColor },
              !canDecrement && stepperCardStyles.stepBtnSignDisabled,
            ]}
          >
            –
          </Text>
        </TouchableOpacity>

        {/* Bigger, bold, coloured value per setting */}
        <View style={stepperCardStyles.valuePill}>
          <Text style={[stepperCardStyles.valueText, { color: accentColor }]}>{value}</Text>
        </View>

        <TouchableOpacity
          style={[
            stepperCardStyles.stepBtn,
            { backgroundColor: accentColor, borderColor: accentColor },
            !canIncrement && stepperCardStyles.stepBtnDisabled,
          ]}
          onPress={onIncrement}
          disabled={!canIncrement}
          activeOpacity={0.7}
        >
          <Text
            style={[
              stepperCardStyles.stepBtnSign,
              stepperCardStyles.stepBtnSignPlus,
              !canIncrement && stepperCardStyles.stepBtnSignDisabled,
            ]}
          >
            +
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function CreateRoomScreen() {
  const navigation  = useNavigation<NavigationProp>()
  const insets      = useSafeAreaInsets()
  const isFocused   = useIsFocused()
  const [copied, setCopied]   = useState(false)
  const [roomCode]            = useState(() => generateRoomCode(4))

  // Room store settings with live updates
  const { maxPlayers, roundTimerSeconds, totalRounds, setSettings, setRoomCode } = useRoomStore()
  const [playersLimit, setPlayersLimit] = useState(maxPlayers || 4)
  const [timerLimit, setTimerLimit] = useState(roundTimerSeconds || 60)
  const [roundsLimit, setRoundsLimit] = useState(totalRounds || 5)

  // Live slots based on host's chosen player limit
  const filledSlots = Array.from({ length: playersLimit }, (_, i) => i === 0)

  // Status tokens: amber while waiting, green when ready
  const isReady = false
  const statusTheme = isReady ? ACCENT.green : ACCENT.amber

  const slideY = useRef(new Animated.Value(40)).current
  const fadeIn = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideY, { toValue: 0, duration: 480, useNativeDriver: true }),
      Animated.timing(fadeIn, { toValue: 1, duration: 480, useNativeDriver: true }),
    ]).start()
  }, [])

  const updatePlayers = (delta: number) => {
    const next = Math.max(2, Math.min(8, playersLimit + delta))
    setPlayersLimit(next)
    setSettings({ maxPlayers: next })
  }

  const updateTimer = (delta: number) => {
    const next = Math.max(30, Math.min(180, timerLimit + delta))
    setTimerLimit(next)
    setSettings({ roundTimerSeconds: next })
  }

  const updateRounds = (delta: number) => {
    const next = Math.max(1, Math.min(10, roundsLimit + delta))
    setRoundsLimit(next)
    setSettings({ totalRounds: next })
  }

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
    setRoomCode(roomCode)
    setSettings({
      maxPlayers: playersLimit,
      roundTimerSeconds: timerLimit,
      totalRounds: roundsLimit,
    })
    navigation.navigate('Lobby', { code: roomCode, isHost: true })
  }

  const stickyBtnHeight = vs(54) + insets.bottom + vs(12) * 2
  const scrollBottomPadding = stickyBtnHeight + vs(16)

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      {/* ── Scrollable Body ── */}
      <Animated.ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: scrollBottomPadding }]}
        showsVerticalScrollIndicator={false}
        bounces={false}
        style={{ opacity: fadeIn, transform: [{ translateY: slideY }], backgroundColor: APP_THEME.background }}
      >
        {/* ── Shared Red Hero ScreenHeader ── */}
        <ScreenHeader
          title="Create"
          titleAccent="Room"
          subtitle="Customize room settings and share code with friends"
          onBack={() => navigation.goBack()}
          artNode={isFocused ? <CreateArt /> : null}
        />

        {/* ── Cards Container (Overlaps the bottom of the hero area) ── */}
        <View style={styles.cardsContainer}>

          {/* ── CARD 1: ROOM CODE CARD (Shared Card) ── */}
          <Card accentColor={ACCENT.red.base} label="ROOM CODE">
            {/* Shared Code Tiles (Red, Blue, Green, Yellow) */}
            <View style={styles.codeBadge}>
              {roomCode.split('').map((char, i) => (
                <CodeTile key={i} char={char} index={i} state="filled" />
              ))}
            </View>

            {/* Shared ActionButtons: Copy (light blue) + Share (solid red) */}
            <View style={styles.codeActions}>
              <ActionButton
                label={copied ? 'Copied!' : 'Copy'}
                variant="blue"
                icon={<CopyIcon size={s(15)} color={ACCENT.blue.dark} />}
                onPress={handleCopy}
              />
              <ActionButton
                label="Share"
                variant="red"
                icon={<ShareIcon size={s(15)} color={COLORS.pure_white} />}
                onPress={handleShare}
              />
            </View>
          </Card>

          {/* ── CARD 2: ROOM SETTINGS CARD (Shared Card, Blue Accent) ── */}
          <Card accentColor={ACCENT.blue.base} label="ROOM SETTINGS">
            <View style={styles.editableSettingsList}>
              {/* Setting 1: Max Players (Red icon & bold red value) */}
              <EditableSettingCard
                icon={<PeopleDotsIcon size={s(15)} color={ACCENT.red.base} />}
                label="Max Players"
                rangeLabel="2–8"
                value={`${playersLimit}`}
                canDecrement={playersLimit > 2}
                canIncrement={playersLimit < 8}
                onDecrement={() => updatePlayers(-1)}
                onIncrement={() => updatePlayers(1)}
                accentColor={ACCENT.red.base}
              />

              {/* Setting 2: Round Timer (Blue icon & bold blue value) */}
              <EditableSettingCard
                icon={<StopwatchIcon size={s(15)} color={ACCENT.blue.base} />}
                label="Round Timer"
                rangeLabel="30s–180s"
                value={`${timerLimit}s`}
                canDecrement={timerLimit > 30}
                canIncrement={timerLimit < 180}
                onDecrement={() => updateTimer(-15)}
                onIncrement={() => updateTimer(15)}
                accentColor={ACCENT.blue.base}
              />

              {/* Setting 3: Total Rounds (Green icon & bold green value) */}
              <EditableSettingCard
                icon={<RoundCounterIcon size={s(15)} color={ACCENT.green.base} />}
                label="Total Rounds"
                rangeLabel="1–10"
                value={`${roundsLimit}`}
                canDecrement={roundsLimit > 1}
                canIncrement={roundsLimit < 10}
                onDecrement={() => updateRounds(-1)}
                onIncrement={() => updateRounds(1)}
                accentColor={ACCENT.green.base}
              />
            </View>
          </Card>

          {/* ── CARD 3: LOBBY STATUS CARD (Shared Card, Amber/Green Accent) ── */}
          <Card
            accentColor={statusTheme.base}
            label="LOBBY STATUS"
            rightAccessory={
              <View style={[styles.statusPill, { backgroundColor: statusTheme.light, borderColor: statusTheme.base }]}>
                <PulsingDot color={statusTheme.dark} />
                <Text style={[styles.statusPillText, { color: statusTheme.dark }]}>
                  {isReady ? 'Ready' : 'Waiting'}
                </Text>
              </View>
            }
          >
            <View style={styles.divider} />

            {/* Players count label */}
            <Text style={styles.slotsLabel}>PLAYERS  1 / {playersLimit}</Text>

            {/* Equal-width player slots filling the card with equal gaps */}
            <View style={styles.slotsRow}>
              {filledSlots.map((filled, i) => (
                <PlayerSlot key={i} filled={filled} index={i} />
              ))}
            </View>
          </Card>

          {/* ── Static Footer Hint ── */}
          <View style={styles.footerNote}>
            <View style={styles.footerDot} />
            <Text style={styles.footerNoteText}>HOST SETS THE RULES · REAL-WORLD MULTIPLAYER</Text>
            <View style={styles.footerDot} />
          </View>

        </View>
      </Animated.ScrollView>

      {/* ── Shared Sticky Bottom CTA ── */}
      <StickyFooterButton
        label="Start Lobby"
        onPress={handleEnterLobby}
        disabled={false}
        insetsBottom={insets.bottom}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: HERO_TOP,
  },
  scrollContent: {
    flexGrow: 1,
  },
  cardsContainer: {
    paddingHorizontal: s(16),
    marginTop: vs(-22),
  },

  /* ── Code Badge ── */
  codeBadge: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: s(8),
    paddingTop: vs(4),
    paddingBottom: vs(12),
  },
  codeActions: {
    flexDirection: 'row',
    gap: s(12),
    marginTop: vs(4),
  },

  /* ── Status Pill ── */
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(6),
    paddingVertical: vs(4),
    paddingHorizontal: s(12),
    borderRadius: s(20),
    borderWidth: 1,
  },
  statusPillText: {
    fontSize: ms(12),
    fontWeight: '700',
  },

  /* ── Divider ── */
  divider: {
    height: 1,
    backgroundColor: APP_THEME.divider,
    marginVertical: vs(10),
  },

  /* ── Slots ── */
  slotsLabel: {
    fontSize: ms(12),
    fontWeight: '700',
    color: APP_THEME.textSecondary,
    letterSpacing: 0.8,
    marginBottom: vs(8),
  },
  slotsRow: {
    flexDirection: 'row',
    gap: s(8),
    width: '100%',
    flexWrap: 'wrap',
  },

  editableSettingsList: {
    gap: vs(8),
    marginTop: vs(4),
  },

  /* ── Footer ── */
  footerNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: s(8),
    marginTop: vs(4),
    marginBottom: vs(12),
  },
  footerDot: {
    width: s(4),
    height: s(4),
    borderRadius: s(2),
    backgroundColor: COLORS.gray400,
  },
  footerNoteText: {
    fontSize: ms(11),
    fontWeight: '700',
    color: COLORS.gray500,
    letterSpacing: 0.8,
  },
})

// ─── Slot Styles ──────────────────────────────────────────────────────────────

const slotStyles = StyleSheet.create({
  wrap: {
    flex: 1,
    minWidth: s(64),
    aspectRatio: 0.78,
    borderRadius: s(12),
    borderWidth: 1.5,
    overflow: 'visible',
    alignItems: 'center',
    position: 'relative',
  },
  accentBar: {
    width: '100%',
    height: vs(3),
    borderTopLeftRadius: s(10.5),
    borderTopRightRadius: s(10.5),
  },
  filledContent: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: vs(8),
    paddingBottom: vs(6),
    gap: vs(3),
  },
  avatarFilled: {
    width: s(28),
    height: s(28),
    borderRadius: s(14),
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    fontSize: ms(12),
    fontWeight: '900',
    color: COLORS.pure_white,
  },
  crownBadge: {
    position: 'absolute',
    top: vs(-7),
    right: s(2),
    zIndex: 10,
  },
  label: {
    fontSize: ms(12),
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  hostChip: {
    paddingHorizontal: s(6),
    paddingVertical: vs(1.5),
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
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    gap: vs(5),
    paddingVertical: vs(8),
  },
  plusCircle: {
    width: s(24),
    height: s(24),
    borderRadius: s(12),
    alignItems: 'center',
    justifyContent: 'center',
  },
  plusSign: {
    fontSize: ms(15),
    fontWeight: '700',
    lineHeight: ms(17),
  },
  waitingLabel: {
    fontSize: ms(12),
    fontWeight: '700',
    letterSpacing: 0.2,
  },
})

// ─── Stepper Card Styles ──────────────────────────────────────────────────────

const stepperCardStyles = StyleSheet.create({
  card: {
    backgroundColor: APP_THEME.surfaceElevated,
    borderRadius: s(12),
    padding: s(12),
    borderWidth: 1,
    borderColor: APP_THEME.surfaceBorder,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: vs(8),
  },
  labelWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(8),
  },
  iconBadge: {
    width: s(26),
    height: s(26),
    borderRadius: s(8),
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: ms(13),
    fontWeight: '700',
    color: APP_THEME.text,
  },
  rangePill: {
    paddingHorizontal: s(6),
    paddingVertical: vs(2),
    borderRadius: s(6),
  },
  rangeText: {
    fontSize: ms(10),
    fontWeight: '700',
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: vs(2),
  },
  stepBtn: {
    width: s(36),
    height: s(36),
    borderRadius: s(18),
    backgroundColor: APP_THEME.surface,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBtnDisabled: {
    borderColor: COLORS.gray300,
    backgroundColor: APP_THEME.surface,
    opacity: 0.45,
  },
  stepBtnSign: {
    fontSize: ms(20),
    fontWeight: '800',
    lineHeight: ms(22),
  },
  stepBtnSignPlus: {
    color: COLORS.pure_white,
  },
  stepBtnSignDisabled: {
    color: COLORS.gray400,
  },
  valuePill: {
    paddingHorizontal: s(16),
    paddingVertical: vs(6),
    borderRadius: s(12),
    backgroundColor: APP_THEME.surface,
    borderWidth: 1,
    borderColor: APP_THEME.surfaceBorder,
    minWidth: s(80),
    alignItems: 'center',
  },
  valueText: {
    fontSize: ms(18),
    fontWeight: '900',
    letterSpacing: -0.2,
  },
})

