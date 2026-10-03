import React from 'react'
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { RootStackParamList } from '../types/navigation'
import { APP_THEME, COLORS } from '../constants/colors'
import { s, vs, ms, w, h } from '../utils/scale'

type NavigationProp = NativeStackNavigationProp<RootStackParamList>

const cameraIcon = require('../../assets/icon.png')
const dashboardArtwork = require('../../assets/dashboard.png')

/**
 * Fully static artwork — memo'd with no props so it NEVER re-renders after
 * first mount. GPU-cached on both iOS (shouldRasterizeIOS) and Android
 * (renderToHardwareTextureAndroid). fadeDuration=0 prevents the Android
 * image-fade animation so it appears instantly like painted UI.
 */
const DashboardArtwork = React.memo(() => (
  <View
    style={styles.artworkContainer}
    pointerEvents="none"
    renderToHardwareTextureAndroid
    shouldRasterizeIOS
  >
    <Image
      source={dashboardArtwork}
      style={styles.artwork}
      resizeMode="contain"
      fadeDuration={0}
    />
  </View>
))

/** Inline SVG-style "Create Room" icon — two people with plus */
function CreateRoomIcon() {
  return (
    <View style={iconStyles.wrap}>
      {/* person 1 */}
      <View style={iconStyles.head} />
      <View style={iconStyles.body} />
      {/* plus sign */}
      <View style={iconStyles.plusV} />
      <View style={iconStyles.plusH} />
    </View>
  )
}

const iconStyles = StyleSheet.create({
  wrap: { width: s(22), height: s(22), position: 'relative', marginRight: s(10) },
  head: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: s(9),
    height: s(9),
    borderRadius: s(4.5),
    backgroundColor: COLORS.pure_white,
  },
  body: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: s(14),
    height: s(9),
    borderRadius: s(7),
    backgroundColor: COLORS.pure_white,
  },
  plusV: {
    position: 'absolute',
    top: 1,
    right: 0,
    width: s(2),
    height: s(10),
    borderRadius: s(1),
    backgroundColor: COLORS.pure_white,
  },
  plusH: {
    position: 'absolute',
    top: s(5),
    right: s(-4),
    width: s(10),
    height: s(2),
    borderRadius: s(1),
    backgroundColor: COLORS.pure_white,
  },
})

/** Grid icon for Join Room */
function JoinRoomIcon() {
  return (
    <View style={joinIconStyles.grid}>
      {[0, 1, 2, 3].map((i) => (
        <View key={i} style={joinIconStyles.dot} />
      ))}
    </View>
  )
}

const joinIconStyles = StyleSheet.create({
  grid: {
    width: s(20),
    height: s(20),
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: s(3),
    marginRight: s(10),
  },
  dot: {
    width: s(8),
    height: s(8),
    borderRadius: s(2),
    borderWidth: 1.5,
    borderColor: APP_THEME.primary,
  },
})

export default function HomeScreen() {
  const navigation = useNavigation<NavigationProp>()

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* ── Top Nav Bar ── */}
        <View style={styles.topNav}>
          <View style={styles.brandRow}>
            <Image source={cameraIcon} style={styles.navLogo} resizeMode="contain" />
            <Text style={styles.navWordmark}>
              Colour<Text style={styles.navWordmarkAccent}>Hunt</Text>
            </Text>
          </View>
          <TouchableOpacity style={styles.profileBtn} activeOpacity={0.7}>
            <View style={styles.profileHead} />
            <View style={styles.profileBody} />
          </TouchableOpacity>
        </View>

        {/* ── Hero Text ── */}
        <View style={styles.heroSection}>
          <Text style={styles.heroTitle}>Find the Colour.</Text>
          <Text style={styles.heroTitleAccent}>Capture the Moment.</Text>
          <Text style={styles.heroSubtitle}>
            Real-world multiplayer game.{'\n'}2–4 players. One colour. Go!
          </Text>
        </View>

        {/* ── CTA Buttons ── */}
        <View style={styles.ctaSection}>
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => navigation.navigate('CreateRoom')}
            activeOpacity={0.85}
          >
            <CreateRoomIcon />
            <Text style={styles.primaryBtnText}>Create Room</Text>
            <View style={styles.chevronWrap}>
              <View style={styles.chevronIcon} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.outlineBtn}
            onPress={() => navigation.navigate('JoinRoom')}
            activeOpacity={0.85}
          >
            <JoinRoomIcon />
            <Text style={styles.outlineBtnText}>Join Room</Text>
            <View style={styles.chevronWrapDark}>
              <View style={styles.chevronIconDark} />
            </View>
          </TouchableOpacity>
        </View>

        {/* ── Bottom Red accent & Artwork — fully static, never re-renders ── */}
        <DashboardArtwork />
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
    flexGrow: 1,
    backgroundColor: APP_THEME.background,
  },

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
  navLogo: { width: s(44), height: s(44) },
  navWordmark: {
    fontSize: ms(22),
    fontWeight: '800',
    color: COLORS.gray900,
    letterSpacing: -0.8,
  },
  navWordmarkAccent: { color: APP_THEME.primary },
  profileBtn: {
    width: s(40),
    height: s(40),
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileHead: {
    width: s(16),
    height: s(16),
    borderRadius: s(8),
    backgroundColor: COLORS.gray800,
  },
  profileBody: {
    width: s(24),
    height: s(13),
    borderRadius: s(12),
    backgroundColor: COLORS.gray800,
    marginTop: vs(3),
  },

  /* ── Hero ── */
  heroSection: {
    paddingHorizontal: s(22),
    paddingTop: vs(28),
    paddingBottom: vs(10),
  },
  heroTitle: {
    fontSize: ms(32),
    fontWeight: '900',
    color: COLORS.gray900,
    lineHeight: ms(38),
  },
  heroTitleAccent: {
    fontSize: ms(32),
    fontWeight: '900',
    color: APP_THEME.primary,
    lineHeight: ms(42),
  },
  heroSubtitle: {
    fontSize: ms(15),
    color: APP_THEME.textSecondary,
    lineHeight: ms(22),
    marginTop: vs(10),
  },

  /* ── CTA Buttons ── */
  ctaSection: {
    paddingHorizontal: s(22),
    marginTop: vs(28),
    gap: vs(14),
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: APP_THEME.primary,
    borderRadius: 50,
    paddingVertical: vs(18),
    paddingHorizontal: s(28),
    shadowColor: APP_THEME.shadowColorRed,
    shadowOffset: { width: 0, height: vs(8) },
    shadowOpacity: 0.35,
    shadowRadius: s(16),
    elevation: 8,
  },
  primaryBtnText: {
    flex: 1,
    color: COLORS.pure_white,
    fontSize: ms(17),
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  chevronWrap: {
    width: s(30),
    height: s(30),
    borderRadius: s(15),
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chevronIcon: {
    width: s(9),
    height: s(9),
    borderTopWidth: 2.5,
    borderRightWidth: 2.5,
    borderColor: COLORS.pure_white,
    transform: [{ rotate: '45deg' }],
    marginLeft: s(-3),
  },

  outlineBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.pure_white,
    borderRadius: 50,
    paddingVertical: vs(17),
    paddingHorizontal: s(28),
    borderWidth: 1.5,
    borderColor: 'rgba(228, 12, 26, 0.35)',
    shadowColor: APP_THEME.shadowColorRed,
    shadowOffset: { width: 0, height: vs(4) },
    shadowOpacity: 0.12,
    shadowRadius: s(10),
    elevation: 3,
  },
  outlineBtnText: {
    flex: 1,
    color: COLORS.gray900,
    fontSize: ms(17),
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  chevronWrapDark: {
    width: s(30),
    height: s(30),
    borderRadius: s(15),
    backgroundColor: 'rgba(228, 12, 26, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chevronIconDark: {
    width: s(9),
    height: s(9),
    borderTopWidth: 2.5,
    borderRightWidth: 2.5,
    borderColor: APP_THEME.primary,
    transform: [{ rotate: '45deg' }],
    marginLeft: s(-3),
  },

  /* ── Artwork Area ── */
  artworkContainer: {
    flex: 1,
    minHeight: vs(340),
    alignItems: 'center',
    justifyContent: 'flex-end',
    position: 'relative',
    marginTop: vs(10),
    overflow: 'hidden',
  },
  artwork: {
    width: w(0.97),
    height: vs(360),
    zIndex: 1,
  },
})
