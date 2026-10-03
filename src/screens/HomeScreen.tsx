import React, { useEffect, useRef, useState } from 'react'
import {
  AccessibilityInfo,
  Animated,
  Dimensions,
  Easing,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import Svg, {
  Circle,
  Defs,
  LinearGradient,
  RadialGradient,
  Rect,
  Stop,
} from 'react-native-svg'
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { RootStackParamList } from '../types/navigation'
import { ACCENT, APP_THEME, COLORS } from '../constants/colors'
import { usePlayerStore } from '../store/player'
import { s, vs, ms, h } from '../utils/scale'
import { CameraHero } from '../../assets/svg/CameraHero'
import { FloatingPolaroid } from '../../assets/svg/FloatingPolaroid'
import { KeyIcon } from '../../assets/svg/KeyIcon'
import { FlatLogoMark } from '../../assets/svg/FlatLogoMark'
import { PeopleDotsIcon } from '../../assets/svg/PeopleDotsIcon'
import { StopwatchIcon } from '../../assets/svg/StopwatchIcon'
import { CompassIcon } from '../../assets/svg/CompassIcon'

type NavigationProp = NativeStackNavigationProp<RootStackParamList>

// ─── Layout tokens ────────────────────────────────────────────────────────────
const SP     = { xs: 8, sm: 12, md: 16, lg: 24 } as const
const RADIUS = { card: 20, chip: 12 } as const
const SCREEN_W = Dimensions.get('window').width

// ─── Hero gradient colours (from theme) ──────────────────────────────────────
const HERO_TOP = APP_THEME.heroTop     // '#F0192D'
const HERO_BOT = APP_THEME.heroBottom  // '#B3000F'

// ─────────────────────────────────────────────────────────────────────────────
// SUB-COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Full-bleed SVG gradient background for the hero section.
 * Uses absolute pixel width so it always fills edge-to-edge regardless
 * of parent padding (which was the root cause of the lighter-strip bug).
 */
function HeroBackground({ height }: { height: number }) {
  return (
    <Svg
      width={SCREEN_W}
      height={height}
      style={[StyleSheet.absoluteFill, { left: 0 }]}
      preserveAspectRatio="none"
      pointerEvents="none"
    >
      <Defs>
        <LinearGradient id="heroGrad" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0"   stopColor={HERO_TOP} stopOpacity="1" />
          <Stop offset="1"   stopColor={HERO_BOT} stopOpacity="1" />
        </LinearGradient>
      </Defs>
      <Rect x="0" y="0" width={SCREEN_W} height={height} fill="url(#heroGrad)" />
    </Svg>
  )
}

/** Dot-grid pattern at 8% white opacity. */
function HeroDotPattern() {
  const cols = 8
  const rows = 6
  const gapX = SCREEN_W / (cols + 1)
  const gapY = 380 / (rows + 1)
  const dots: { cx: number; cy: number }[] = []
  for (let r = 1; r <= rows; r++) {
    for (let c = 1; c <= cols; c++) {
      dots.push({ cx: gapX * c, cy: gapY * r })
    }
  }
  return (
    <Svg
      width={SCREEN_W}
      height={380}
      style={[StyleSheet.absoluteFill, { left: 0 }]}
      pointerEvents="none"
    >
      {dots.map((d, i) => (
        <Circle key={i} cx={d.cx} cy={d.cy} r={2.5} fill="white" opacity={0.08} />
      ))}
    </Svg>
  )
}

/** White radial glow behind the camera — lifts the illustration off the bg. */
function HeroGlow({ size }: { size: number }) {
  return (
    <Svg
      width={size}
      height={size}
      style={{ position: 'absolute' }}
      pointerEvents="none"
    >
      <Defs>
        <RadialGradient id="camGlow" cx="50%" cy="50%" r="50%">
          {/* white glow at ~25% max opacity — requirement §1 */}
          <Stop offset="0%"   stopColor="#FFFFFF" stopOpacity="0.25" />
          <Stop offset="55%"  stopColor="#FFFFFF" stopOpacity="0.10" />
          <Stop offset="100%" stopColor="#FFFFFF" stopOpacity="0"    />
        </RadialGradient>
      </Defs>
      <Circle cx={size / 2} cy={size / 2} r={size / 2} fill="url(#camGlow)" />
    </Svg>
  )
}

/**
 * LensFlashGlow — brief white ring pulse over the lens area.
 * Driven by an external Animated.Value (0→1). Sits absolutely
 * centred over the camera container. Uses native driver only.
 */
function LensFlashGlow({
  size,
  flashAnim,
}: {
  size: number
  flashAnim: Animated.Value
}) {
  const opacity = flashAnim.interpolate({
    inputRange: [0, 0.3, 1],
    outputRange: [0, 0.75, 0],
  })
  const scale = flashAnim.interpolate({
    inputRange: [0, 0.4, 1],
    outputRange: [0.8, 1.15, 1.4],
  })
  return (
    <Animated.View
      style={{
        position: 'absolute',
        width: size,
        height: size,
        borderRadius: size / 2,
        borderWidth: 6,
        borderColor: '#FFFFFF',
        opacity,
        transform: [{ scale }],
      }}
      pointerEvents="none"
    />
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN SCREEN
// ─────────────────────────────────────────────────────────────────────────────
export default function HomeScreen() {
  const navigation      = useNavigation<NavigationProp>()
  const displayName     = usePlayerStore((st) => st.displayName)
  const submissionCount = usePlayerStore((st) => st.submissionCount)

  const [createPressed, setCreatePressed] = useState(false)
  const [joinPressed,   setJoinPressed]   = useState(false)
  const [reduceMotion,  setReduceMotion]  = useState(false)

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion)
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduceMotion)
    return () => sub.remove()
  }, [])

  const playerInitial = displayName ? displayName.trim().charAt(0).toUpperCase() : 'C'

  const hasPlayedBefore = submissionCount > 0
  const lastGame = hasPlayedBefore
    ? {
        score: '1,250 pts',
        date: 'Today, 3:20 PM',
        result: 'Win',
        roomCode: 'A3KP',
        color: COLORS.red500,
        colorName: 'Crimson',
      }
    : null

  // ── Flash animation — fires every 7 s (skip when reduceMotion) ───────────
  const flashAnim = useRef(new Animated.Value(0)).current
  // pop anims — one per polaroid (6 frames)
  const popAnims = useRef(
    Array.from({ length: 6 }, () => new Animated.Value(0))
  ).current

  // ── Polaroid frame layout ─────────────────────────────────────────────────
  // heroSvgWrapper is inside heroContent which has paddingHorizontal: s(16).
  // Effective wrapper width = SCREEN_W - 2*s(16).
  // Sizes kept small (34–46 dp) so nothing overlaps the camera or each other.
  const WRAP_W = SCREEN_W - 2 * s(SP.md)  // effective wrapper width

  const polaroids = [
    // ── LEFT SIDE (3 frames) ───────────────────────────────────────────────
    {
      // L1 — cat, top-left, ~25% cropped at left edge, CCW tilt
      scene: 'cat'      as const,
      left:  -s(10),
      top:   vs(10),
      size:  s(44),
      tilt:  -8,
      duration: 5200,
      delay:    0,
      popAnim:  popAnims[0],
    },
    {
      // L2 — house, mid-left, fully visible, mild CW tilt
      scene: 'house'    as const,
      left:  s(2),
      top:   vs(100),
      size:  s(38),
      tilt:  5,
      duration: 4600,
      delay:    800,
      popAnim:  popAnims[1],
    },
    {
      // L3 — fish, lower-left, slightly cropped at left edge
      scene: 'fish'     as const,
      left:  -s(8),
      top:   vs(182),
      size:  s(34),
      tilt:  -10,
      duration: 6000,
      delay:    1600,
      popAnim:  popAnims[2],
    },

    // ── RIGHT SIDE (3 frames) ──────────────────────────────────────────────
    {
      // R1 — mountain, top-right, fully visible, gentle CCW tilt
      scene: 'mountain' as const,
      left:  WRAP_W - s(46),
      top:   vs(8),
      size:  s(46),
      tilt:  -4,
      duration: 4800,
      delay:    400,
      popAnim:  popAnims[3],
    },
    {
      // R2 — car, mid-right, fully visible, strong CW tilt
      scene: 'car'      as const,
      left:  WRAP_W - s(42),
      top:   vs(100),
      size:  s(42),
      tilt:  9,
      duration: 5600,
      delay:    1200,
      popAnim:  popAnims[4],
    },
    {
      // R3 — fruit, lower-right, fully visible, gentle CCW tilt
      scene: 'fruit'    as const,
      left:  WRAP_W - s(36),
      top:   vs(182),
      size:  s(36),
      tilt:  -5,
      duration: 4200,
      delay:    2000,
      popAnim:  popAnims[5],
    },
  ]

  useEffect(() => {
    if (reduceMotion) return

    let timer: ReturnType<typeof setTimeout>

    function fireFlash() {
      // 1. Flash the lens glow
      Animated.timing(flashAnim, {
        toValue: 1,
        duration: 120,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }).start(() => {
        Animated.timing(flashAnim, {
          toValue: 0,
          duration: 600,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }).start()
      })

      // 2. Pop a random polaroid safely
      if (popAnims && popAnims.length > 0) {
        const count = Math.min(popAnims.length, polaroids.length)
        const idx = Math.floor(Math.random() * count)
        const pop = popAnims[idx]
        if (pop) {
          pop.setValue(0)
          Animated.timing(pop, {
            toValue: 1,
            duration: 500,
            easing: Easing.out(Easing.back(1.5)),
            useNativeDriver: true,
          }).start(() => {
            Animated.timing(pop, {
              toValue: 0,
              duration: 300,
              easing: Easing.in(Easing.quad),
              useNativeDriver: true,
            }).start()
          })
        }
      }

      // Schedule next flash in 6–8 s
      const next = 6000 + Math.random() * 2000
      timer = setTimeout(fireFlash, next)
    }

    timer = setTimeout(fireFlash, 3000) // first flash after 3 s
    return () => clearTimeout(timer)
  }, [reduceMotion])

  // ── Camera size (30% bigger than before) ─────────────────────────────────
  const cameraW = s(273)
  const cameraH = vs(195)
  const glowSize = s(364)          // glow scales proportionally
  const flashRingSize = s(96)      // size of the lens flash ring (≈ lens barrel r=46 scaled)

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="light-content" backgroundColor={HERO_TOP} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* ══════════════════════════════════════════════════════════════════
            RED HERO  — gradient + pattern + nav + headline + camera
            ══════════════════════════════════════════════════════════════════ */}
        <View style={styles.heroOuter}>
          {/* Full-bleed gradient */}
          <HeroBackground height={vs(420)} />

          {/* Dot grid overlay */}
          <HeroDotPattern />

          {/* All visible content: padded wrapper */}
          <View style={styles.heroContent}>

            {/* ── Top Nav ── */}
            <View style={styles.topNav}>
              <View style={styles.brandRow}>
                {/* White tile: red camera logo is clearly visible on white */}
                <View style={styles.logoTile}>
                  <FlatLogoMark size={s(24)} />
                </View>
                <Text style={styles.navWordmark}>
                  Colour<Text style={styles.navWordmarkAccent}>Hunt</Text>
                </Text>
              </View>

              {/* White circle avatar, red initial */}
              <TouchableOpacity
                style={styles.profileBtn}
                activeOpacity={0.8}
                onPress={() => (navigation as any).navigate('Settings')}
              >
                <Text style={styles.profileInitial}>{playerInitial}</Text>
              </TouchableOpacity>
            </View>

            {/* ── Headline ── */}
            <View style={styles.heroSection}>
              {/* White headline — ≥4.5:1 on both HERO_TOP and HERO_BOT */}
              <Text style={styles.heroTitle}>Find the Colour.</Text>
              {/* Yellow accent — only on dark red bg (yellow token, not hardcoded) */}
              <Text style={styles.heroTitleAccent}>Capture the Moment.</Text>

              {/* Badges: frosted-glass white pills, one accent each */}
              <View style={styles.badgesRow}>
                {/* Red — brand / players */}
                <View style={styles.badge}>
                  <View style={[styles.badgeIconCircle, { backgroundColor: ACCENT.red.base }]}>
                    <PeopleDotsIcon size={s(11)} color={COLORS.pure_white} />
                  </View>
                  <Text style={styles.badgeText} numberOfLines={1}>Pick players</Text>
                </View>

                {/* Blue — timer / info */}
                <View style={styles.badge}>
                  <View style={[styles.badgeIconCircle, { backgroundColor: ACCENT.blue.base }]}>
                    <StopwatchIcon size={s(11)} color={COLORS.pure_white} />
                  </View>
                  <Text style={styles.badgeText} numberOfLines={1}>Set your timer</Text>
                </View>

                {/* Green — real-world / found */}
                <View style={styles.badge}>
                  <View style={[styles.badgeIconCircle, { backgroundColor: ACCENT.green.base }]}>
                    <CompassIcon size={s(11)} color={COLORS.pure_white} />
                  </View>
                  <Text style={styles.badgeText} numberOfLines={1}>Real world</Text>
                </View>
              </View>
            </View>

            {/* ── Camera + polaroid frames ── */}
            <View style={styles.heroSvgWrapper}>

              {/* ── Polaroid frames — BEHIND camera (rendered first) ───────── */}
              {polaroids.map((p, i) => (
                <FloatingPolaroid
                  key={i}
                  left={p.left}
                  top={p.top}
                  size={p.size}
                  tilt={p.tilt}
                  scene={p.scene}
                  duration={p.duration}
                  delay={p.delay}
                  reduceMotion={reduceMotion}
                  popAnim={p.popAnim}
                />
              ))}

              {/* ── White radial glow — behind camera, above polaroids ─────── */}
              <View style={{ position: 'absolute', alignItems: 'center', justifyContent: 'center' }}>
                <HeroGlow size={glowSize} />
              </View>

              {/* ── Camera illustration — 30% bigger ─────────────────────── */}
              <View style={styles.cameraContainer}>
                <CameraHero width={cameraW} height={cameraH} animate={true} />
              </View>

              {/* ── Lens flash ring — centred over camera ────────────────── */}
              <View style={{ position: 'absolute', alignItems: 'center', justifyContent: 'center' }}>
                <LensFlashGlow size={flashRingSize} flashAnim={flashAnim} />
              </View>

            </View>
          </View>
        </View>

        {/* ══════════════════════════════════════════════════════════════════
            WHITE SHEET  — overlaps gradient by 32dp, soft top shadow
            ══════════════════════════════════════════════════════════════════ */}
        <View style={styles.sheet}>

          {/* CTA Buttons */}
          <View style={styles.ctaSection}>
            {/* Create Room — solid red */}
            <TouchableOpacity
              style={[
                styles.actionBtn,
                styles.primaryBtn,
                createPressed && styles.primaryBtnPressed,
              ]}
              onPress={() => navigation.navigate('CreateRoom')}
              onPressIn={() => setCreatePressed(true)}
              onPressOut={() => setCreatePressed(false)}
              activeOpacity={0.9}
            >
              <Ionicons name="add-circle-outline" size={s(22)} color={COLORS.pure_white} />
              <Text style={styles.primaryBtnText}>Create Room</Text>
            </TouchableOpacity>

            {/* Join Room — white + red border */}
            <TouchableOpacity
              style={[
                styles.actionBtn,
                styles.secondaryBtn,
                joinPressed && styles.secondaryBtnPressed,
              ]}
              onPress={() => navigation.navigate('JoinRoom')}
              onPressIn={() => setJoinPressed(true)}
              onPressOut={() => setJoinPressed(false)}
              activeOpacity={0.9}
            >
              <KeyIcon size={s(22)} color={APP_THEME.primary} />
              <Text style={styles.secondaryBtnText}>Join Room</Text>
            </TouchableOpacity>
          </View>

          {/* How to Play */}
          <View style={styles.howToPlayCard}>
            <View style={styles.cardHeaderRow}>
              <View style={styles.cardDot} />
              <Text style={styles.cardTitle}>HOW TO PLAY</Text>
            </View>

            <View style={styles.stepsRow}>
              {/* Step 1 — red accent */}
              <View style={styles.stepItem}>
                <View style={[
                  styles.stepIconWrap,
                  { backgroundColor: ACCENT.red.light, borderColor: ACCENT.red.glow },
                ]}>
                  <Ionicons name="color-palette-outline" size={s(18)} color={ACCENT.red.base} />
                </View>
                <View style={[styles.stepNumberBubble, { backgroundColor: ACCENT.red.base }]}>
                  <Text style={styles.stepNumberText}>1</Text>
                </View>
                <Text style={styles.stepLabel}>Get a colour</Text>
              </View>

              <Ionicons name="arrow-forward" size={s(14)} color={COLORS.red700} style={styles.stepArrow} />

              {/* Step 2 — blue accent, magnifier */}
              <View style={styles.stepItem}>
                <View style={[
                  styles.stepIconWrap,
                  { backgroundColor: ACCENT.blue.light, borderColor: ACCENT.blue.glow },
                ]}>
                  <Ionicons name="search-outline" size={s(18)} color={ACCENT.blue.base} />
                </View>
                <View style={[styles.stepNumberBubble, { backgroundColor: ACCENT.blue.base }]}>
                  <Text style={styles.stepNumberText}>2</Text>
                </View>
                <Text style={styles.stepLabel}>Find it</Text>
              </View>

              <Ionicons name="arrow-forward" size={s(14)} color={COLORS.red700} style={styles.stepArrow} />

              {/* Step 3 — green accent */}
              <View style={styles.stepItem}>
                <View style={[
                  styles.stepIconWrap,
                  { backgroundColor: ACCENT.green.light, borderColor: ACCENT.green.glow },
                ]}>
                  <Ionicons name="camera-outline" size={s(18)} color={ACCENT.green.base} />
                </View>
                <View style={[styles.stepNumberBubble, { backgroundColor: ACCENT.green.base }]}>
                  <Text style={styles.stepNumberText}>3</Text>
                </View>
                <Text style={styles.stepLabel}>Snap it</Text>
              </View>
            </View>
          </View>

          {/* Last Game Card */}
          {lastGame ? (
            <View style={styles.lastGameCard}>
              <View style={styles.lastGameHeader}>
                <View style={styles.lastGameLabelRow}>
                  <View style={[styles.lastGameDot, { backgroundColor: lastGame.color }]} />
                  <Text style={styles.lastGameTitle}>LAST GAME</Text>
                </View>
                {/* Win badge — yellow fill + dark text (winner token) */}
                <View style={styles.winBadge}>
                  <Text style={styles.winBadgeText}>{lastGame.result}</Text>
                </View>
              </View>

              <View style={styles.lastGameBody}>
                <View style={styles.lastGameInfo}>
                  <Text style={styles.lastGameScore}>{lastGame.score}</Text>
                  <Text style={styles.lastGameDate}>
                    {lastGame.colorName} · Room {lastGame.roomCode} · {lastGame.date}
                  </Text>
                </View>
                <View style={[styles.lastGameSwatch, { backgroundColor: lastGame.color }]} />
              </View>
            </View>
          ) : null}

          <View style={{ height: vs(SP.lg) }} />
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: HERO_TOP, // safe-area inset matches gradient top
  },
  scrollContent: {
    flexGrow: 1,
  },

  // ── Hero outer: NO horizontal padding — gradient must be full-bleed ───────
  heroOuter: {
    // overflow: visible — polaroids bleed off the edges intentionally
    // The SVG gradient bg fills edge-to-edge using absolute+pixel-width so
    // removing 'hidden' here is safe.
    overflow: 'visible',
    // extra height at the bottom so the sheet's -32 overlap lands in gradient
    paddingBottom: vs(52),
    backgroundColor: HERO_BOT, // fallback colour so no white strip ever shows
  },

  // ── Hero content: padding lives here, not on heroOuter ───────────────────
  heroContent: {
    paddingHorizontal: s(SP.md),
  },

  // ── Top Nav ──────────────────────────────────────────────────────────────
  topNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: vs(SP.sm),
    paddingBottom: vs(SP.xs),
    minHeight: vs(48),
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(SP.xs),
  },
  logoTile: {
    width: s(36),
    height: s(36),
    borderRadius: s(10),
    backgroundColor: COLORS.pure_white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navWordmark: {
    fontSize: ms(22),
    fontWeight: '900',
    color: COLORS.pure_white,
    letterSpacing: -0.6,
  },
  // yellow accent text — on dark red gradient: contrast OK
  navWordmarkAccent: {
    color: COLORS.yellow500,
  },
  profileBtn: {
    width: s(38),
    height: s(38),
    borderRadius: s(19),
    backgroundColor: COLORS.pure_white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInitial: {
    fontSize: ms(16),
    fontWeight: '800',
    color: APP_THEME.primary,
  },

  // ── Headline ──────────────────────────────────────────────────────────────
  heroSection: {
    marginTop: vs(SP.sm),
    marginBottom: vs(SP.xs),
  },
  heroTitle: {
    fontSize: ms(30),
    fontWeight: '900',
    color: COLORS.pure_white,   // white on red ✓ contrast
    lineHeight: ms(36),
    letterSpacing: -0.5,
  },
  // yellow on dark red gradient — yellow text only on dark/red backgrounds rule
  heroTitleAccent: {
    fontSize: ms(30),
    fontWeight: '900',
    color: COLORS.yellow500,
    lineHeight: ms(38),
    letterSpacing: -0.5,
  },

  // ── Badges ────────────────────────────────────────────────────────────────
  badgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(6),
    marginTop: vs(SP.sm),
  },
  badge: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: s(5),
    paddingHorizontal: s(5),
    paddingVertical: vs(7),
    borderRadius: s(RADIUS.chip),
    // frosted-glass pill on red gradient
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.30)',
  },
  badgeIconCircle: {
    width: s(18),
    height: s(18),
    borderRadius: s(9),
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontSize: ms(11),
    fontWeight: '700',
    color: COLORS.pure_white,   // white on translucent pill on red ✓
    letterSpacing: 0.1,
  },

  // ── Camera wrapper ────────────────────────────────────────────────────────
  heroSvgWrapper: {
    height: h(0.28),
    minHeight: vs(200),
    maxHeight: vs(240),
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: vs(SP.xs),
    // overflow visible so polaroids can bleed off screen edges
    overflow: 'visible',
  },
  cameraContainer: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: vs(8) },
    shadowOpacity: 0.35,
    shadowRadius: s(14),
    elevation: 10,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // WHITE SHEET
  // ═══════════════════════════════════════════════════════════════════════════
  sheet: {
    backgroundColor: COLORS.pure_white,
    borderTopLeftRadius: s(28),
    borderTopRightRadius: s(28),
    // overlap the gradient — sheet slides up over it, no flat band visible
    marginTop: vs(-32),
    paddingTop: vs(SP.lg),
    paddingHorizontal: s(SP.md),
    // top-edge shadow so the lift is visible
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: s(14),
    elevation: 18,
    minHeight: vs(400),
  },

  // ── CTA Buttons ──────────────────────────────────────────────────────────
  ctaSection: {
    gap: vs(SP.sm),
    marginBottom: vs(SP.md),
  },
  actionBtn: {
    height: vs(54),
    borderRadius: s(RADIUS.card),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: s(SP.xs),
    paddingHorizontal: s(SP.lg),
    shadowColor: ACCENT.red.shadow,
    shadowOffset: { width: 0, height: vs(4) },
    shadowOpacity: 0.22,
    shadowRadius: s(10),
    elevation: 4,
  },
  primaryBtn: {
    backgroundColor: APP_THEME.primary,
  },
  primaryBtnPressed: {
    backgroundColor: COLORS.red700,
  },
  primaryBtnText: {
    color: COLORS.pure_white,
    fontSize: ms(16),
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  secondaryBtn: {
    backgroundColor: COLORS.pure_white,
    borderWidth: 1.5,
    borderColor: APP_THEME.primary,
    shadowOpacity: 0.08,
    elevation: 2,
  },
  secondaryBtnPressed: {
    backgroundColor: COLORS.red100,
  },
  secondaryBtnText: {
    color: APP_THEME.primary,
    fontSize: ms(16),
    fontWeight: '800',
    letterSpacing: 0.3,
  },

  // ── How to Play ──────────────────────────────────────────────────────────
  howToPlayCard: {
    backgroundColor: APP_THEME.surface,
    borderRadius: s(RADIUS.card),
    borderWidth: 1,
    borderColor: ACCENT.red.glow,
    padding: s(SP.md),
    marginBottom: vs(SP.sm),
    shadowColor: ACCENT.red.shadow,
    shadowOffset: { width: 0, height: vs(3) },
    shadowOpacity: 0.07,
    shadowRadius: s(8),
    elevation: 2,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(6),
    marginBottom: vs(SP.sm),
  },
  cardDot: {
    width: s(6),
    height: s(6),
    borderRadius: s(3),
    backgroundColor: APP_THEME.primary,
  },
  cardTitle: {
    fontSize: ms(11),
    fontWeight: '800',
    color: COLORS.red800,
    letterSpacing: 1.2,
  },
  stepsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stepItem: {
    flex: 1,
    alignItems: 'center',
    gap: vs(4),
  },
  stepIconWrap: {
    width: s(36),
    height: s(36),
    borderRadius: s(RADIUS.chip),
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberBubble: {
    width: s(18),
    height: s(18),
    borderRadius: s(9),
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: {
    fontSize: ms(10),
    fontWeight: '900',
    color: COLORS.pure_white,
  },
  stepLabel: {
    fontSize: ms(12),
    fontWeight: '700',
    color: COLORS.gray800,
    textAlign: 'center',
  },
  stepArrow: {
    marginHorizontal: s(2),
    marginBottom: vs(14),
  },

  // ── Last Game Card ────────────────────────────────────────────────────────
  lastGameCard: {
    backgroundColor: APP_THEME.surface,
    borderRadius: s(RADIUS.card),
    borderWidth: 1,
    borderColor: ACCENT.red.glow,
    padding: s(SP.md),
    marginBottom: vs(SP.sm),
    shadowColor: ACCENT.red.shadow,
    shadowOffset: { width: 0, height: vs(3) },
    shadowOpacity: 0.07,
    shadowRadius: s(8),
    elevation: 2,
  },
  lastGameHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: vs(SP.xs),
  },
  lastGameLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(6),
  },
  lastGameDot: {
    width: s(8),
    height: s(8),
    borderRadius: s(4),
  },
  lastGameTitle: {
    fontSize: ms(11),
    fontWeight: '800',
    color: COLORS.red800,
    letterSpacing: 1.2,
  },
  // Win badge — yellow fill (winner token), dark text (4.5:1 ✓)
  winBadge: {
    backgroundColor: APP_THEME.winner,
    paddingHorizontal: s(8),
    paddingVertical: vs(3),
    borderRadius: s(10),
  },
  winBadgeText: {
    fontSize: ms(11),
    fontWeight: '800',
    color: APP_THEME.winnerText,  // dark text on yellow
  },
  lastGameBody: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: vs(2),
  },
  lastGameInfo: {
    flex: 1,
  },
  lastGameScore: {
    fontSize: ms(18),
    fontWeight: '900',
    color: COLORS.gray800,
    letterSpacing: -0.2,
  },
  lastGameDate: {
    fontSize: ms(12),
    fontWeight: '600',
    color: COLORS.gray600,
    marginTop: vs(2),
  },
  lastGameSwatch: {
    width: s(28),
    height: s(28),
    borderRadius: s(8),
    borderWidth: 1.5,
    borderColor: 'rgba(0,0,0,0.10)',
  },
})
