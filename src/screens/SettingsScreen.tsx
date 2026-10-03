import React from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { APP_THEME, COLORS } from '../constants/colors'
import { s, vs, ms } from '../utils/scale'

const cameraIcon = require('../../assets/icon.png')
const loadingArtwork = require('../../assets/loading-artwork.png')

type MenuItem = {
  icon: React.ReactNode
  title: string
  subtitle: string
}

function GearIcon({ color }: { color: string }) {
  return (
    <View style={[menuIconStyles.wrap, { backgroundColor: APP_THEME.primarySubtle }]}>
      <View style={[menuIconStyles.gearCenter, { borderColor: color }]} />
    </View>
  )
}

function HistoryIcon({ color }: { color: string }) {
  return (
    <View style={[menuIconStyles.wrap, { backgroundColor: APP_THEME.primarySubtle }]}>
      <View style={[menuIconStyles.clockOuter, { borderColor: color }]}>
        <View style={menuIconStyles.clockHand} />
      </View>
    </View>
  )
}

function InfoIcon({ color }: { color: string }) {
  return (
    <View style={[menuIconStyles.wrap, { backgroundColor: APP_THEME.primarySubtle }]}>
      <View style={[menuIconStyles.infoDot, { backgroundColor: color }]} />
      <View style={[menuIconStyles.infoBar, { backgroundColor: color }]} />
    </View>
  )
}

function HelpIcon({ color }: { color: string }) {
  return (
    <View style={[menuIconStyles.wrap, { backgroundColor: APP_THEME.primarySubtle }]}>
      <Text style={[menuIconStyles.questionMark, { color }]}>?</Text>
    </View>
  )
}

const menuIconStyles = StyleSheet.create({
  wrap: {
    width: s(36),
    height: s(36),
    borderRadius: s(10),
    alignItems: 'center',
    justifyContent: 'center',
  },
  gearCenter: {
    width: s(16),
    height: s(16),
    borderRadius: s(8),
    borderWidth: 2.5,
  },
  clockOuter: {
    width: s(18),
    height: s(18),
    borderRadius: s(9),
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clockHand: {
    position: 'absolute',
    bottom: '50%',
    left: '50%',
    width: 1.5,
    height: s(6),
    backgroundColor: APP_THEME.primary,
    borderRadius: 1,
    marginLeft: -0.75,
  },
  infoDot: { width: s(4), height: s(4), borderRadius: s(2), marginBottom: vs(2) },
  infoBar: { width: s(3), height: s(8), borderRadius: 1.5 },
  questionMark: { fontSize: ms(16), fontWeight: '900' },
})

function ChevronRight() {
  return (
    <View style={settingsStyles.chevron}>
      <View style={settingsStyles.chevronInner} />
    </View>
  )
}

const MENU_ITEMS = [
  {
    icon: <HistoryIcon color={APP_THEME.primary} />,
    title: 'Game History',
    subtitle: 'View your past games',
  },
  {
    icon: <HelpIcon color={APP_THEME.primary} />,
    title: 'How to Play',
    subtitle: 'Learn the rules',
  },
  {
    icon: <GearIcon color={APP_THEME.primary} />,
    title: 'Settings',
    subtitle: 'App preferences',
  },
  {
    icon: <InfoIcon color={APP_THEME.primary} />,
    title: 'About',
    subtitle: 'Version 1.0.0',
  },
]

export default function SettingsScreen() {
  return (
    <SafeAreaView style={settingsStyles.safeArea}>
      {/* Top Nav */}
      <View style={settingsStyles.topNav}>
        <View style={settingsStyles.brandRow}>
          <Image source={cameraIcon} style={settingsStyles.navLogo} resizeMode="contain" />
          <Text style={settingsStyles.navWordmark}>
            Colour<Text style={settingsStyles.navWordmarkAccent}>Hunt</Text>
          </Text>
        </View>
        <View style={settingsStyles.profileIcon}>
          <View style={settingsStyles.profileHead} />
          <View style={settingsStyles.profileBody} />
        </View>
      </View>

      <ScrollView
        contentContainerStyle={settingsStyles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Card */}
        <View style={settingsStyles.profileCard}>
          <View style={settingsStyles.avatarCircle}>
            <View style={settingsStyles.avatarHead} />
            <View style={settingsStyles.avatarBody} />
          </View>
          <View style={settingsStyles.profileInfo}>
            <Text style={settingsStyles.profileName}>Noman</Text>
            <Text style={settingsStyles.profileRole}>Player</Text>
          </View>
          <ChevronRight />
        </View>

        {/* Stats */}
        <View style={settingsStyles.statsRow}>
          <View style={settingsStyles.statItem}>
            <Text style={settingsStyles.statValue}>3</Text>
            <Text style={settingsStyles.statLabel}>Wins</Text>
          </View>
          <View style={settingsStyles.statDivider} />
          <View style={settingsStyles.statItem}>
            <Text style={settingsStyles.statValue}>7</Text>
            <Text style={settingsStyles.statLabel}>Played</Text>
          </View>
          <View style={settingsStyles.statDivider} />
          <View style={settingsStyles.statItem}>
            <Text style={settingsStyles.statValue}>42%</Text>
            <Text style={settingsStyles.statLabel}>Win Rate</Text>
          </View>
        </View>

        {/* Menu Items */}
        <View style={settingsStyles.menuCard}>
          {MENU_ITEMS.map((item, index) => (
            <React.Fragment key={item.title}>
              <TouchableOpacity style={settingsStyles.menuRow} activeOpacity={0.7}>
                {item.icon}
                <View style={settingsStyles.menuInfo}>
                  <Text style={settingsStyles.menuTitle}>{item.title}</Text>
                  <Text style={settingsStyles.menuSubtitle}>{item.subtitle}</Text>
                </View>
                <ChevronRight />
              </TouchableOpacity>
              {index < MENU_ITEMS.length - 1 && (
                <View style={settingsStyles.divider} />
              )}
            </React.Fragment>
          ))}
        </View>

        {/* Artwork */}
        <View style={settingsStyles.artworkContainer} pointerEvents="none">
          <Image
            source={loadingArtwork}
            style={settingsStyles.artwork}
            resizeMode="contain"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const settingsStyles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: APP_THEME.background },
  topNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: s(20),
    paddingVertical: vs(10),
    backgroundColor: APP_THEME.surface,
    borderBottomWidth: 1,
    borderBottomColor: APP_THEME.surfaceBorder,
  },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: s(8) },
  navLogo: { width: s(32), height: s(32) },
  navWordmark: { fontSize: ms(18), fontWeight: '800', color: COLORS.gray900, letterSpacing: -0.5 },
  navWordmarkAccent: { color: APP_THEME.primary },
  profileIcon: { width: s(36), height: s(36), alignItems: 'center', justifyContent: 'center' },
  profileHead: { width: s(14), height: s(14), borderRadius: s(7), backgroundColor: APP_THEME.primary },
  profileBody: { width: s(22), height: s(12), borderRadius: s(11), backgroundColor: APP_THEME.primary, marginTop: vs(2) },

  scrollContent: { paddingHorizontal: s(20), paddingTop: vs(20), paddingBottom: vs(20) },

  profileCard: {
    backgroundColor: APP_THEME.surface,
    borderRadius: s(16),
    padding: s(16),
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: APP_THEME.surfaceBorder,
    marginBottom: vs(12),
    shadowColor: APP_THEME.shadowColor,
    shadowOffset: { width: 0, height: vs(3) },
    shadowOpacity: 0.08,
    shadowRadius: s(10),
    elevation: 3,
  },
  avatarCircle: {
    width: s(52),
    height: s(52),
    borderRadius: s(26),
    backgroundColor: APP_THEME.primarySubtle,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: s(14),
  },
  avatarHead: {
    width: s(18),
    height: s(18),
    borderRadius: s(9),
    backgroundColor: APP_THEME.primary,
  },
  avatarBody: {
    width: s(26),
    height: s(14),
    borderRadius: s(13),
    backgroundColor: APP_THEME.primary,
    marginTop: vs(4),
  },
  profileInfo: { flex: 1 },
  profileName: { fontSize: ms(18), fontWeight: '800', color: APP_THEME.text },
  profileRole: { fontSize: ms(12), color: APP_THEME.textSecondary, marginTop: vs(2) },

  statsRow: {
    backgroundColor: APP_THEME.surface,
    borderRadius: s(16),
    padding: s(16),
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderWidth: 1,
    borderColor: APP_THEME.surfaceBorder,
    marginBottom: vs(20),
    shadowColor: APP_THEME.shadowColor,
    shadowOffset: { width: 0, height: vs(3) },
    shadowOpacity: 0.08,
    shadowRadius: s(10),
    elevation: 3,
  },
  statItem: { alignItems: 'center' },
  statValue: { fontSize: ms(22), fontWeight: '900', color: APP_THEME.text },
  statLabel: { fontSize: ms(11), color: APP_THEME.textSecondary, marginTop: vs(2) },
  statDivider: { width: 1, backgroundColor: APP_THEME.divider },

  menuCard: {
    backgroundColor: APP_THEME.surface,
    borderRadius: s(16),
    borderWidth: 1,
    borderColor: APP_THEME.surfaceBorder,
    overflow: 'hidden',
    shadowColor: APP_THEME.shadowColor,
    shadowOffset: { width: 0, height: vs(3) },
    shadowOpacity: 0.08,
    shadowRadius: s(10),
    elevation: 3,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: vs(14),
    paddingHorizontal: s(16),
    gap: s(12),
  },
  menuInfo: { flex: 1 },
  menuTitle: { fontSize: ms(15), fontWeight: '700', color: APP_THEME.text },
  menuSubtitle: { fontSize: ms(11), color: APP_THEME.textSecondary, marginTop: vs(1) },
  divider: { height: 1, backgroundColor: APP_THEME.divider, marginHorizontal: s(16) },

  artworkContainer: { alignItems: 'center', marginTop: vs(10) },
  artwork: { width: s(220), height: vs(180) },

  chevron: { width: s(18), height: s(18), alignItems: 'center', justifyContent: 'center' },
  chevronInner: {
    width: s(8),
    height: s(8),
    borderTopWidth: 2,
    borderRightWidth: 2,
    borderColor: APP_THEME.textMuted,
    transform: [{ rotate: '45deg' }],
  },
})
