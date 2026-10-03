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

const HISTORY_ITEMS = [
  {
    id: '1',
    roomCode: 'A3KP',
    date: 'Today, 3:20 PM',
    result: 'Win',
    players: 3,
    color: '#E40C1A',
    colorName: 'Crimson',
  },
  {
    id: '2',
    roomCode: 'B7MQ',
    date: 'Yesterday, 7:10 PM',
    result: 'Loss',
    players: 4,
    color: '#F03040',
    colorName: 'Scarlet',
  },
  {
    id: '3',
    roomCode: 'Z2NF',
    date: 'Oct 1, 2026',
    result: 'Win',
    players: 2,
    color: '#C41225',
    colorName: 'Cardinal',
  },
  {
    id: '4',
    roomCode: 'X9QA',
    date: 'Sep 30, 2026',
    result: 'Win',
    players: 4,
    color: '#9B0E1D',
    colorName: 'Ruby',
  },
  {
    id: '5',
    roomCode: 'T5LP',
    date: 'Sep 28, 2026',
    result: 'Loss',
    players: 3,
    color: '#FF4F5E',
    colorName: 'Coral Red',
  },
]

export default function HistoryScreen() {
  const wins = HISTORY_ITEMS.filter((i) => i.result === 'Win').length
  const played = HISTORY_ITEMS.length
  const winRate = Math.round((wins / played) * 100)

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Top Nav */}
      <View style={styles.topNav}>
        <View style={styles.brandRow}>
          <Image source={cameraIcon} style={styles.navLogo} resizeMode="contain" />
          <Text style={styles.navWordmark}>
            Colour<Text style={styles.navWordmarkAccent}>Hunt</Text>
          </Text>
        </View>
        <View style={styles.profileIcon}>
          <View style={styles.profileHead} />
          <View style={styles.profileBody} />
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Stats Row */}
        <View style={styles.statsCard}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{wins}</Text>
            <Text style={styles.statLabel}>Wins</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{played}</Text>
            <Text style={styles.statLabel}>Played</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{winRate}%</Text>
            <Text style={styles.statLabel}>Win Rate</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Game History</Text>

        <View style={styles.historyCard}>
          {HISTORY_ITEMS.map((item, index) => (
            <React.Fragment key={item.id}>
              <View style={styles.historyRow}>
                <View style={[styles.colorSwatch, { backgroundColor: item.color }]} />
                <View style={styles.historyInfo}>
                  <View style={styles.historyTop}>
                    <Text style={styles.historyCode}>{item.roomCode}</Text>
                    <View
                      style={[
                        styles.resultBadge,
                        item.result === 'Win' ? styles.winBadge : styles.lossBadge,
                      ]}
                    >
                      <Text
                        style={[
                          styles.resultText,
                          item.result === 'Win' ? styles.winText : styles.lossText,
                        ]}
                      >
                        {item.result}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.historyMeta}>
                    {item.colorName} · {item.players} players · {item.date}
                  </Text>
                </View>
              </View>
              {index < HISTORY_ITEMS.length - 1 && <View style={styles.divider} />}
            </React.Fragment>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
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

  statsCard: {
    backgroundColor: APP_THEME.surface,
    borderRadius: s(16),
    padding: s(20),
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderWidth: 1,
    borderColor: APP_THEME.surfaceBorder,
    marginBottom: vs(24),
    shadowColor: APP_THEME.shadowColor,
    shadowOffset: { width: 0, height: vs(3) },
    shadowOpacity: 0.08,
    shadowRadius: s(10),
    elevation: 3,
  },
  statItem: { alignItems: 'center' },
  statValue: { fontSize: ms(26), fontWeight: '900', color: APP_THEME.text },
  statLabel: { fontSize: ms(12), color: APP_THEME.textSecondary, marginTop: vs(2) },
  statDivider: { width: 1, backgroundColor: APP_THEME.divider },

  sectionTitle: { fontSize: ms(18), fontWeight: '800', color: APP_THEME.text, marginBottom: vs(12) },

  historyCard: {
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
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: vs(14),
    paddingHorizontal: s(16),
    gap: s(12),
  },
  colorSwatch: {
    width: s(36),
    height: s(36),
    borderRadius: s(10),
  },
  historyInfo: { flex: 1 },
  historyTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: vs(3),
  },
  historyCode: { fontSize: ms(15), fontWeight: '800', color: APP_THEME.text, letterSpacing: 1 },
  resultBadge: {
    paddingHorizontal: s(10),
    paddingVertical: vs(3),
    borderRadius: s(20),
  },
  winBadge: { backgroundColor: APP_THEME.primarySubtle },
  lossBadge: { backgroundColor: COLORS.gray100 },
  resultText: { fontSize: ms(11), fontWeight: '800' },
  winText: { color: APP_THEME.primary },
  lossText: { color: APP_THEME.textMuted },
  historyMeta: { fontSize: ms(11), color: APP_THEME.textSecondary },
  divider: { height: 1, backgroundColor: APP_THEME.divider, marginHorizontal: s(16) },
})
