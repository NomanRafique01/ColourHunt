import React from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  useWindowDimensions,
} from 'react-native'
import Svg, { Defs, LinearGradient, Stop, Rect } from 'react-native-svg'
import { Ionicons } from '@expo/vector-icons'
import { ACCENT, APP_THEME, COLORS } from '../constants/colors'
import { s, vs, ms } from '../utils/scale'
import { SpectrumLensLogo } from '../../assets/svg/SpectrumLensLogo'

const SCREEN_W = Dimensions.get('window').width
const HERO_TOP = APP_THEME.heroTop     // '#F0192D'
const HERO_BOT = APP_THEME.heroBottom  // '#B3000F'

/** Art is hidden on screens narrower than this (dp) */
const ART_MIN_WIDTH = 340

interface ScreenHeaderProps {
  title: string
  titleAccent?: string
  subtitle: string
  onBack: () => void
  backLabel?: string
  statusPill?: React.ReactNode
  height?: number
  /**
   * Optional decorative art node rendered as an absolute 150×120 box in the
   * top-right of the hero. Sits behind hero content (zIndex 0), never blocks
   * touches (pointerEvents="none" on the art itself), and is suppressed on
   * screens narrower than 340 dp.
   */
  artNode?: React.ReactNode
}

export function ScreenHeader({
  title,
  titleAccent = 'Room',
  subtitle,
  onBack,
  backLabel = 'Back',
  statusPill,
  height = vs(210),
  artNode,
}: ScreenHeaderProps) {
  const { width: windowWidth } = useWindowDimensions()
  const screenWidth = windowWidth || SCREEN_W

  return (
    <View style={styles.heroOuter}>
      <StatusBar barStyle="light-content" backgroundColor={HERO_TOP} />

      {/* SVG Gradient Background */}
      <Svg
        width={screenWidth}
        height={height}
        style={[StyleSheet.absoluteFill, { left: 0 }]}
        preserveAspectRatio="none"
        pointerEvents="none"
      >
        <Defs>
          <LinearGradient id="screenHeroGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={HERO_TOP} stopOpacity="1" />
            <Stop offset="1" stopColor={HERO_BOT} stopOpacity="1" />
          </LinearGradient>
        </Defs>
        <Rect x="0" y="0" width={screenWidth} height={height} fill="url(#screenHeroGrad)" />
      </Svg>

      {/* ── Optional decorative art (top-right, behind hero content) ── */}
      {artNode != null && screenWidth >= ART_MIN_WIDTH && (
        <View style={styles.artContainer} pointerEvents="none">
          {artNode}
        </View>
      )}

      <View style={[styles.heroContent, { zIndex: 1 }]}>
        {/* ── Top Nav with White Tile Logo Mark ── */}
        <View style={styles.topNav}>
          <View style={styles.brandRow}>
            <View style={styles.logoTile}>
              <SpectrumLensLogo size={s(26)} />
            </View>
            <Text style={styles.navWordmark}>
              Colour<Text style={styles.navWordmarkAccent}>Hunt</Text>
            </Text>
          </View>
        </View>

        {/* ── Back Button (White Pill) ── */}
        <View style={styles.backRow}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={onBack}
            activeOpacity={0.8}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <View style={styles.backIconWrap}>
              <Ionicons name="arrow-back" size={s(15)} color={APP_THEME.primary} />
            </View>
            <Text style={styles.backBtnText}>{backLabel}</Text>
          </TouchableOpacity>
        </View>

        {/* ── Page Title ── */}
        <View style={styles.titleBlock}>
          <Text style={styles.pageTitle}>
            {title} {titleAccent ? <Text style={styles.pageTitleAccent}>{titleAccent}</Text> : null}
          </Text>

          {/* 4 Short Segments: Red, Blue, Green, Yellow */}
          <View style={styles.titleBarsRow}>
            <View style={[styles.titleBarSegment, { backgroundColor: ACCENT.red.base }]} />
            <View style={[styles.titleBarSegment, { backgroundColor: ACCENT.blue.base }]} />
            <View style={[styles.titleBarSegment, { backgroundColor: ACCENT.green.base }]} />
            <View style={[styles.titleBarSegment, { backgroundColor: ACCENT.yellow.base }]} />
          </View>

          <Text style={styles.pageSubtitle}>{subtitle}</Text>

          {statusPill ? <View style={styles.statusPillRow}>{statusPill}</View> : null}
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  heroOuter: {
    overflow: 'hidden',
    paddingBottom: vs(34),
    backgroundColor: HERO_BOT,
    borderBottomLeftRadius: s(24),
    borderBottomRightRadius: s(24),
  },
  /** Absolute art box: top-right corner of the hero, behind heroContent */
  artContainer: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 150,
    height: 120,
    zIndex: 0,
  },
  heroContent: {
    paddingHorizontal: s(16),
  },
  topNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: vs(12),
    paddingBottom: vs(6),
    minHeight: vs(44),
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(8),
  },
  logoTile: {
    width: s(36),
    height: s(36),
    borderRadius: s(10),
    backgroundColor: COLORS.pure_white,
    borderWidth: 1.5,
    borderColor: APP_THEME.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navWordmark: {
    fontSize: ms(20),
    fontWeight: '800',
    color: COLORS.pure_white,
    letterSpacing: -0.5,
  },
  navWordmarkAccent: {
    color: COLORS.yellow500,
  },
  backRow: {
    marginTop: vs(6),
    marginBottom: vs(6),
    flexDirection: 'row',
    alignItems: 'center',
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(8),
    minHeight: 38,
    paddingVertical: vs(5),
    paddingHorizontal: s(12),
    borderRadius: s(20),
    backgroundColor: COLORS.pure_white,
    alignSelf: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.14,
    shadowRadius: 4,
    elevation: 3,
  },
  backIconWrap: {
    width: s(22),
    height: s(22),
    borderRadius: s(11),
    backgroundColor: ACCENT.red.light,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backBtnText: {
    fontSize: ms(13),
    fontWeight: '700',
    color: APP_THEME.primary,
    letterSpacing: 0.2,
  },
  titleBlock: {
    marginTop: vs(6),
    marginBottom: vs(4),
  },
  pageTitle: {
    fontSize: ms(28),
    fontWeight: '900',
    color: COLORS.pure_white,
    letterSpacing: -0.5,
    lineHeight: ms(34),
  },
  pageTitleAccent: {
    fontSize: ms(28),
    fontWeight: '900',
    color: COLORS.yellow500,
  },
  titleBarsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(5),
    marginTop: vs(8),
    marginBottom: vs(8),
  },
  titleBarSegment: {
    width: s(14),
    height: vs(3.5),
    borderRadius: 2,
  },
  pageSubtitle: {
    fontSize: ms(13),
    fontWeight: '500',
    color: COLORS.pure_white,
    lineHeight: ms(18),
    opacity: 0.95,
  },
  statusPillRow: {
    marginTop: vs(10),
    alignSelf: 'flex-start',
  },
})

