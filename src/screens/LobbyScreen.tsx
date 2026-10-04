import React, { useRef, useEffect, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Share,
  Clipboard,
  Modal,
  AccessibilityInfo,
} from 'react-native'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useNavigation, useRoute, useIsFocused } from '@react-navigation/native'
import type { RouteProp } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { RootStackParamList } from '../types/navigation'
import { ACCENT, APP_THEME, COLORS } from '../constants/colors'
import { MIN_PLAYERS } from '../constants/game'
import { useRoomStore } from '../store/room'
import { usePlayerStore } from '../store/player'
import { s, vs, ms } from '../utils/scale'
import { ScreenHeader } from '../components/ScreenHeader'
import { Card } from '../components/Card'
import { CodeTile } from '../components/CodeTile'
import { ActionButton } from '../components/ActionButton'
import { StickyFooterButton } from '../components/StickyFooterButton'
import { HostCrownBadge } from '../../assets/svg/HostCrownBadge'
import { PeopleDotsIcon } from '../../assets/svg/PeopleDotsIcon'
import { StopwatchIcon } from '../../assets/svg/StopwatchIcon'
import { RoundCounterIcon } from '../../assets/svg/RoundCounterIcon'
import { CopyIcon } from '../../assets/svg/CopyIcon'
import { ShareIcon } from '../../assets/svg/ShareIcon'
import { LobbyArt } from '../art/LobbyArt'

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Lobby'>
type LobbyRouteProp = RouteProp<RootStackParamList, 'Lobby'>

const HERO_TOP = APP_THEME.heroTop

// ─── Player slot colour palette (matches Create/Join screens) ─────────────────

const SLOT_PALETTE = [
  { bg: ACCENT.red.light,    border: ACCENT.red.base,    dark: ACCENT.red.dark,    text: COLORS.pure_white },
  { bg: ACCENT.blue.light,   border: ACCENT.blue.base,   dark: ACCENT.blue.dark,   text: COLORS.pure_white },
  { bg: ACCENT.green.light,  border: ACCENT.green.base,  dark: ACCENT.green.dark,  text: COLORS.pure_white },
  { bg: ACCENT.yellow.light, border: ACCENT.yellow.base, dark: ACCENT.yellow.dark, text: ACCENT.yellow.dark },
] as const

// ─── Pulsing Dot ─────────────────────────────────────────────────────────────

function PulsingDot({ color }: { color: string }) {
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
    <View style={{ width: s(10), height: s(10), alignItems: 'center', justifyContent: 'center' }}>
      <Animated.View style={{
        position: 'absolute',
        width: s(10), height: s(10), borderRadius: s(5),
        borderWidth: 1.5, borderColor: color,
        transform: [{ scale }], opacity,
      }} />
      <View style={{
        width: s(5), height: s(5), borderRadius: s(2.5),
        backgroundColor: color, position: 'absolute',
      }} />
    </View>
  )
}

// ─── Header Status Pill ───────────────────────────────────────────────────────

function StatusPill({ ready }: { ready: boolean }) {
  const theme = ready ? ACCENT.green : ACCENT.amber
  return (
    <View style={[pillStyles.pill, { backgroundColor: theme.light, borderColor: theme.base }]}>
      <PulsingDot color={theme.dark} />
      <Text style={[pillStyles.text, { color: theme.dark }]}>
        {ready ? 'Ready to start' : 'Waiting for players'}
      </Text>
    </View>
  )
}

const pillStyles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(6),
    paddingVertical: vs(5),
    paddingHorizontal: s(12),
    borderRadius: s(20),
    borderWidth: 1,
  },
  text: {
    fontSize: ms(12),
    fontWeight: '700',
    letterSpacing: 0.1,
  },
})

// ─── Leave Confirmation Modal ─────────────────────────────────────────────────

function LeaveModal({
  visible,
  onStay,
  onLeave,
}: {
  visible: boolean
  onStay: () => void
  onLeave: () => void
}) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onStay}
    >
      <View style={modalStyles.overlay}>
        <View style={modalStyles.sheet}>
          <Text style={modalStyles.title}>Leave room?</Text>
          <Text style={modalStyles.body}>
            Your progress will be lost and the room will continue without you.
          </Text>
          <View style={modalStyles.actions}>
            {/* Stay — secondary */}
            <TouchableOpacity style={modalStyles.stayBtn} onPress={onStay} activeOpacity={0.8}>
              <Text style={modalStyles.stayText}>Stay</Text>
            </TouchableOpacity>
            {/* Leave — solid red */}
            <TouchableOpacity style={modalStyles.leaveBtn} onPress={onLeave} activeOpacity={0.8}>
              <Text style={modalStyles.leaveText}>Leave</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  )
}

const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: APP_THEME.surface,
    borderTopLeftRadius: s(24),
    borderTopRightRadius: s(24),
    paddingHorizontal: s(24),
    paddingTop: vs(24),
    paddingBottom: vs(36),
    gap: vs(12),
  },
  title: {
    fontSize: ms(20),
    fontWeight: '900',
    color: APP_THEME.text,
    letterSpacing: -0.3,
  },
  body: {
    fontSize: ms(14),
    color: APP_THEME.textSecondary,
    lineHeight: ms(20),
  },
  actions: {
    flexDirection: 'row',
    gap: s(12),
    marginTop: vs(8),
  },
  stayBtn: {
    flex: 1,
    paddingVertical: vs(14),
    borderRadius: s(12),
    backgroundColor: APP_THEME.surfaceElevated,
    borderWidth: 1,
    borderColor: APP_THEME.surfaceBorder,
    alignItems: 'center',
  },
  stayText: {
    fontSize: ms(15),
    fontWeight: '700',
    color: APP_THEME.text,
  },
  leaveBtn: {
    flex: 1,
    paddingVertical: vs(14),
    borderRadius: s(12),
    backgroundColor: APP_THEME.primary,
    alignItems: 'center',
    shadowColor: ACCENT.red.shadow,
    shadowOffset: { width: 0, height: vs(3) },
    shadowOpacity: 0.25,
    shadowRadius: s(8),
    elevation: 4,
  },
  leaveText: {
    fontSize: ms(15),
    fontWeight: '800',
    color: COLORS.pure_white,
  },
})

// ─── Player Row ───────────────────────────────────────────────────────────────

interface Player {
  id: string
  name: string | null
  isHost: boolean
  isReady: boolean
}

function PlayerRow({
  player,
  index,
  isMe,
  reduceMotion,
  onInvite,
}: {
  player: Player
  index: number
  isMe: boolean
  reduceMotion: boolean
  onInvite: () => void
}) {
  const pal = SLOT_PALETTE[index % SLOT_PALETTE.length]
  const slideX = useRef(new Animated.Value(reduceMotion ? 0 : 30)).current
  const fade   = useRef(new Animated.Value(reduceMotion ? 1 : 0)).current

  useEffect(() => {
    if (reduceMotion) return
    Animated.parallel([
      Animated.timing(slideX, { toValue: 0, duration: 360, delay: index * 60, useNativeDriver: true }),
      Animated.timing(fade,   { toValue: 1, duration: 360, delay: index * 60, useNativeDriver: true }),
    ]).start()
  }, [])

  const filled = player.name !== null
  const displayName = filled ? player.name!.split(' ')[0] : null // first token only, e.g. "Alex"
  const initial = displayName ? displayName.charAt(0).toUpperCase() : ''

  if (!filled) {
    // Empty slot — dashed border, coloured tint, coloured + circle, "Invite a friend"
    return (
      <TouchableOpacity
        style={[rowStyles.row, rowStyles.rowEmpty, { borderColor: pal.border, backgroundColor: pal.bg }]}
        onPress={onInvite}
        activeOpacity={0.75}
      >
        <View style={[rowStyles.plusCircle, { backgroundColor: pal.border }]}>
          <Text style={[rowStyles.plusSign, { color: index === 3 ? pal.dark : COLORS.pure_white }]}>+</Text>
        </View>
        <Text style={[rowStyles.inviteText, { color: pal.dark }]}>Invite a friend</Text>
        <View style={rowStyles.dotsRow}>
          <PulsingDot color={pal.border} />
        </View>
      </TouchableOpacity>
    )
  }

  return (
    <Animated.View
      style={[
        rowStyles.row,
        rowStyles.rowFilled,
        { borderColor: pal.border, backgroundColor: pal.bg, opacity: fade, transform: [{ translateX: slideX }] },
      ]}
    >
      {/* Avatar */}
      <View style={[rowStyles.avatar, { backgroundColor: pal.border }]}>
        <Text style={[rowStyles.avatarInitial, { color: index === 3 ? pal.dark : COLORS.pure_white }]}>
          {initial}
        </Text>
      </View>

      {/* Name + tags */}
      <View style={rowStyles.nameBlock}>
        <Text style={[rowStyles.nameText, { color: pal.dark }]}>{displayName}</Text>
        {isMe && (
          <View style={[rowStyles.youChip, { backgroundColor: COLORS.pure_white, borderColor: pal.border }]}>
            <Text style={[rowStyles.youChipText, { color: pal.dark }]}>You</Text>
          </View>
        )}
      </View>

      {/* Host badge — yellow fill, dark text, crown */}
      {player.isHost && (
        <View style={rowStyles.hostBadge}>
          <HostCrownBadge size={s(13)} color={ACCENT.yellow.dark} />
          <Text style={rowStyles.hostText}>Host</Text>
        </View>
      )}

      {/* Ready indicator */}
      {!player.isHost && player.isReady && (
        <Ionicons name="checkmark-circle" size={s(18)} color={ACCENT.green.base} />
      )}
    </Animated.View>
  )
}

const rowStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: s(12),
    borderWidth: 1.5,
    paddingHorizontal: s(12),
    paddingVertical: vs(10),
    marginBottom: vs(8),
    gap: s(10),
  },
  rowFilled: {},
  rowEmpty: {
    borderStyle: 'dashed',
    justifyContent: 'flex-start',
  },
  avatar: {
    width: s(36),
    height: s(36),
    borderRadius: s(18),
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  avatarInitial: {
    fontSize: ms(15),
    fontWeight: '900',
  },
  nameBlock: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(6),
  },
  nameText: {
    fontSize: ms(15),
    fontWeight: '700',
  },
  youChip: {
    paddingHorizontal: s(6),
    paddingVertical: vs(1),
    borderRadius: s(6),
    borderWidth: 1,
  },
  youChipText: {
    fontSize: ms(10),
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  hostBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(4),
    backgroundColor: ACCENT.yellow.light,
    borderColor: ACCENT.yellow.base,
    borderWidth: 1,
    paddingHorizontal: s(8),
    paddingVertical: vs(3),
    borderRadius: s(6),
  },
  hostText: {
    fontSize: ms(11),
    fontWeight: '800',
    color: ACCENT.yellow.dark,
    letterSpacing: 0.3,
  },
  plusCircle: {
    width: s(26),
    height: s(26),
    borderRadius: s(13),
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  plusSign: {
    fontSize: ms(16),
    fontWeight: '700',
    lineHeight: ms(18),
  },
  inviteText: {
    fontSize: ms(13),
    fontWeight: '700',
    flex: 1,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: s(4),
  },
})

// ─── Settings Chip ────────────────────────────────────────────────────────────

function SettingChip({
  icon,
  label,
  color,
}: {
  icon: React.ReactNode
  label: string
  color: string
}) {
  return (
    <View style={[chipStyles.chip, { backgroundColor: `${color}14`, borderColor: `${color}30` }]}>
      {icon}
      <Text style={[chipStyles.label, { color }]}>{label}</Text>
    </View>
  )
}

const chipStyles = StyleSheet.create({
  chip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: s(5),
    paddingVertical: vs(9),
    paddingHorizontal: s(8),
    borderRadius: s(10),
    borderWidth: 1,
  },
  label: {
    fontSize: ms(12),
    fontWeight: '700',
    letterSpacing: 0.1,
  },
})

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function LobbyScreen() {
  const navigation = useNavigation<NavigationProp>()
  const route      = useRoute<LobbyRouteProp>()
  const insets     = useSafeAreaInsets()
  const isFocused  = useIsFocused()

  const { roomCode, setRoomStatus, maxPlayers, roundTimerSeconds, totalRounds } = useRoomStore()
  const { isHost } = usePlayerStore()

  const activeCode  = route.params?.code || roomCode || 'ABCD'
  const isUserHost  = route.params?.isHost ?? isHost
  const effectiveMax = maxPlayers || 4

  const [copied, setCopied]     = useState(false)
  const [leaveVisible, setLeaveVisible] = useState(false)
  const [reduceMotion, setReduceMotion] = useState(false)

  const fadeIn = useRef(new Animated.Value(0)).current
  const slideY = useRef(new Animated.Value(30)).current

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion)
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduceMotion)
    Animated.parallel([
      Animated.timing(slideY, { toValue: 0, duration: 420, useNativeDriver: true }),
      Animated.timing(fadeIn, { toValue: 1, duration: 420, useNativeDriver: true }),
    ]).start()
    return () => sub.remove()
  }, [])

  const placeholderPlayers: Player[] = [
    { id: '1', name: 'You',   isHost: isUserHost, isReady: true  },
    { id: '2', name: 'Alex',  isHost: false,      isReady: true  },
    { id: '3', name: null,    isHost: false,      isReady: false },
    { id: '4', name: null,    isHost: false,      isReady: false },
  ]

  const connectedCount = placeholderPlayers.filter(p => p.name !== null).length
  const joinedPlayersCount = connectedCount
  const canStart = connectedCount >= MIN_PLAYERS && connectedCount <= effectiveMax

  const handleCopy = async () => {
    Clipboard.setString(activeCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Join my ColourHunt room! Code: ${activeCode}`,
        title: 'Join ColourHunt Room',
      })
    } catch (_) {}
  }

  const handleLeaveConfirmed = () => {
    setLeaveVisible(false)
    navigation.navigate('MainTabs' as any)
  }

  const handleStartGame = () => {
    setRoomStatus('in_round')
    navigation.navigate('ColourSpin', { isHost: isUserHost })
  }

  const stickyBtnHeight = vs(54) + insets.bottom + vs(12) * 2
  const scrollBottomPadding = stickyBtnHeight + vs(16)

  const isReady = canStart

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <Animated.ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: scrollBottomPadding }]}
        showsVerticalScrollIndicator={false}
        bounces={false}
        style={{ opacity: fadeIn, transform: [{ translateY: slideY }], backgroundColor: APP_THEME.background }}
      >
        {/* ── Shared Red Hero with Leave pill and status pill ── */}
        <ScreenHeader
          title="Room"
          titleAccent="Lobby"
          subtitle={isUserHost ? 'Share the code and wait for friends to join' : 'Waiting for the host to start'}
          onBack={() => setLeaveVisible(true)}
          backLabel="Leave"
          statusPill={<StatusPill ready={isReady} />}
          artNode={isFocused ? <LobbyArt joined={joinedPlayersCount} /> : null}
        />

        {/* ── Cards Container (Overlaps the bottom of the hero area) ── */}
        <View style={styles.cardsContainer}>

          {/* ── CARD 1: ROOM CODE (red accent bar, shared CodeTile) ── */}
          <Card
            accentColor={ACCENT.red.base}
            label="ROOM CODE"
            rightAccessory={
              <View style={[styles.countChip, { backgroundColor: ACCENT.red.light, borderColor: ACCENT.red.base }]}>
                <Text style={[styles.countChipText, { color: ACCENT.red.dark }]}>
                  {connectedCount} / {effectiveMax} Players
                </Text>
              </View>
            }
          >
            {/* Shared CodeTile row — code is always 4 chars */}
            <View style={styles.codeTilesRow}>
              {activeCode.slice(0, 4).split('').map((char, i) => (
                <CodeTile key={i} char={char} index={i} state="filled" />
              ))}
            </View>

            {/* Copy + Share action buttons */}
            <View style={styles.actionRow}>
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

          {/* ── CARD 2: PLAYERS (amber or green accent bar) ── */}
          <Card
            accentColor={isReady ? ACCENT.green.base : ACCENT.amber.base}
            label="PLAYERS"
            rightAccessory={
              <View style={[
                styles.countChip,
                {
                  backgroundColor: isReady ? ACCENT.green.light : ACCENT.amber.light,
                  borderColor:     isReady ? ACCENT.green.base  : ACCENT.amber.base,
                },
              ]}>
                <Text style={[
                  styles.countChipText,
                  { color: isReady ? ACCENT.green.dark : ACCENT.amber.dark },
                ]}>
                  {connectedCount} / {effectiveMax}
                </Text>
              </View>
            }
          >
            <View style={styles.divider} />
            {placeholderPlayers.slice(0, effectiveMax).map((player, i) => (
              <PlayerRow
                key={player.id}
                player={player}
                index={i}
                isMe={i === 0}
                reduceMotion={reduceMotion}
                onInvite={handleShare}
              />
            ))}
          </Card>

          {/* ── CARD 3: ROOM SETTINGS (blue accent bar) ── */}
          <Card accentColor={ACCENT.blue.base} label="ROOM SETTINGS">
            <View style={styles.settingsChipsRow}>
              <SettingChip
                icon={<PeopleDotsIcon size={s(14)} color={ACCENT.red.base} />}
                label={`Max ${effectiveMax}`}
                color={ACCENT.red.base}
              />
              <SettingChip
                icon={<StopwatchIcon size={s(14)} color={ACCENT.blue.base} />}
                label={`${roundTimerSeconds || 60}s`}
                color={ACCENT.blue.base}
              />
              <SettingChip
                icon={<RoundCounterIcon size={s(14)} color={ACCENT.green.base} />}
                label={`${totalRounds || 5} Rounds`}
                color={ACCENT.green.base}
              />
            </View>
          </Card>

        </View>
      </Animated.ScrollView>

      {/* ── Sticky Bottom CTA ── */}
      {isUserHost ? (
        <View style={[styles.stickyWrapper, { paddingBottom: insets.bottom + vs(12) }]}>
          {!canStart && (
            <Text style={styles.needMoreText}>Need at least {MIN_PLAYERS} players</Text>
          )}
          <StickyFooterButton
            label="Start Game"
            onPress={handleStartGame}
            disabled={!canStart}
            insetsBottom={0}
          />
        </View>
      ) : (
        <StickyFooterButton
          label="I'm Ready"
          onPress={() => {}}
          disabled={false}
          insetsBottom={insets.bottom}
        />
      )}

      {/* ── Leave Confirmation Modal ── */}
      <LeaveModal
        visible={leaveVisible}
        onStay={() => setLeaveVisible(false)}
        onLeave={handleLeaveConfirmed}
      />
    </SafeAreaView>
  )
}

// ─── Styles ───────────────────────────────────────────────────────────────────

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

  /* ── Room Code Card ── */
  codeTilesRow: {
    flexDirection: 'row',
    gap: s(8),
    paddingTop: vs(4),
    paddingBottom: vs(12),
  },
  actionRow: {
    flexDirection: 'row',
    gap: s(12),
    marginTop: vs(4),
  },
  countChip: {
    paddingHorizontal: s(10),
    paddingVertical: vs(4),
    borderRadius: s(20),
    borderWidth: 1,
  },
  countChipText: {
    fontSize: ms(12),
    fontWeight: '700',
  },

  /* ── Divider ── */
  divider: {
    height: 1,
    backgroundColor: APP_THEME.divider,
    marginVertical: vs(10),
  },

  /* ── Settings ── */
  settingsChipsRow: {
    flexDirection: 'row',
    gap: s(8),
    marginTop: vs(4),
  },

  /* ── Sticky bottom override wrapper (host only — includes helper text) ── */
  stickyWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: s(16),
    paddingTop: vs(8),
    backgroundColor: APP_THEME.surface,
    borderTopWidth: 1,
    borderTopColor: APP_THEME.surfaceBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 8,
  },
  needMoreText: {
    fontSize: ms(12),
    fontWeight: '600',
    color: APP_THEME.textSecondary,
    textAlign: 'center',
    marginBottom: vs(6),
  },
})
