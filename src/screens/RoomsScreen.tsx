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
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { RootStackParamList } from '../types/navigation'
import { APP_THEME, COLORS } from '../constants/colors'
import { s, vs, ms } from '../utils/scale'
import { SpectrumLensLogo } from '../../assets/svg/SpectrumLensLogo'

type NavigationProp = NativeStackNavigationProp<RootStackParamList>

const YOUR_ROOMS = [
  {
    id: '1',
    code: '7F3A',
    players: 2,
    maxPlayers: 4,
    status: 'Waiting for others',
    isHost: true,
  },
]

const AVAILABLE_ROOMS = [
  { id: '2', code: 'K9PL', players: 1, maxPlayers: 4, status: 'Waiting' },
  { id: '3', code: '2BJT', players: 3, maxPlayers: 4, status: 'Waiting' },
  { id: '4', code: 'X4GN', players: 2, maxPlayers: 4, status: 'Waiting' },
  { id: '5', code: 'M8QZ', players: 4, maxPlayers: 4, status: 'Full' },
]

function ChevronRight() {
  return (
    <View style={styles.chevron}>
      <View style={styles.chevronInner} />
    </View>
  )
}

function PlayerAvatars({ count, maxPlayers }: { count: number; maxPlayers: number }) {
  return (
    <View style={styles.avatarRow}>
      {Array.from({ length: maxPlayers }).map((_, i) => (
        <View
          key={i}
          style={[
            styles.avatar,
            i < count ? styles.avatarFilled : styles.avatarEmpty,
          ]}
        />
      ))}
    </View>
  )
}

export default function RoomsScreen() {
  const navigation = useNavigation<NavigationProp>()

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Top Nav */}
      <View style={styles.topNav}>
        <View style={styles.brandRow}>
          <View style={styles.logoTile}>
            <SpectrumLensLogo size={s(24)} />
          </View>
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
        {/* Your Rooms */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Your Rooms</Text>
          <TouchableOpacity>
            <Text style={styles.viewAll}>View All</Text>
          </TouchableOpacity>
        </View>

        {YOUR_ROOMS.map((room) => (
          <TouchableOpacity
            key={room.id}
            style={styles.yourRoomCard}
            onPress={() =>
              navigation.navigate('Lobby', {
                code: room.code,
                isHost: room.isHost,
              })
            }
            activeOpacity={0.8}
          >
            <View style={styles.yourRoomLeft}>
              <View style={styles.yourRoomCodeRow}>
                <Text style={styles.yourRoomCode}>{room.code}</Text>
                {room.isHost && (
                  <View style={styles.hostBadge}>
                    <Text style={styles.hostBadgeText}>Host</Text>
                  </View>
                )}
              </View>
              <Text style={styles.yourRoomStatus}>
                {room.players}/{room.maxPlayers} players · {room.status}
              </Text>
              <PlayerAvatars count={room.players} maxPlayers={room.maxPlayers} />
            </View>
            <ChevronRight />
          </TouchableOpacity>
        ))}

        {/* Available Rooms */}
        <Text style={[styles.sectionTitle, { marginTop: vs(24) }]}>Available Rooms</Text>

        <View style={styles.roomListCard}>
          {AVAILABLE_ROOMS.map((room, index) => (
            <React.Fragment key={room.id}>
              <TouchableOpacity
                style={styles.roomRow}
                onPress={() => navigation.navigate('JoinRoom')}
                activeOpacity={0.7}
              >
                <View style={styles.roomRowIcon}>
                  <View style={styles.roomIconDot} />
                  <View style={styles.roomIconDot} />
                  <View style={styles.roomIconDot} />
                  <View style={styles.roomIconDot} />
                </View>
                <View style={styles.roomRowInfo}>
                  <Text style={styles.roomCode}>{room.code}</Text>
                  <Text style={styles.roomMeta}>
                    {room.players}/{room.maxPlayers} players · {room.status}
                  </Text>
                </View>
                <ChevronRight />
              </TouchableOpacity>
              {index < AVAILABLE_ROOMS.length - 1 && (
                <View style={styles.divider} />
              )}
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
  logoTile: {
    width: s(34),
    height: s(34),
    borderRadius: s(10),
    backgroundColor: COLORS.pure_white,
    borderWidth: 1.5,
    borderColor: APP_THEME.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navWordmark: { fontSize: ms(18), fontWeight: '800', color: COLORS.gray900, letterSpacing: -0.5 },
  navWordmarkAccent: { color: APP_THEME.primary },
  profileIcon: { width: s(36), height: s(36), alignItems: 'center', justifyContent: 'center' },
  profileHead: { width: s(14), height: s(14), borderRadius: s(7), backgroundColor: APP_THEME.primary },
  profileBody: { width: s(22), height: s(12), borderRadius: s(11), backgroundColor: APP_THEME.primary, marginTop: vs(2) },
  scrollContent: { paddingHorizontal: s(20), paddingTop: vs(20), paddingBottom: vs(20) },

  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: vs(12) },
  sectionTitle: { fontSize: ms(18), fontWeight: '800', color: APP_THEME.text },
  viewAll: { fontSize: ms(13), fontWeight: '700', color: APP_THEME.primary },

  yourRoomCard: {
    backgroundColor: APP_THEME.surface,
    borderRadius: s(16),
    padding: s(16),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: APP_THEME.surfaceBorder,
    shadowColor: APP_THEME.shadowColor,
    shadowOffset: { width: 0, height: vs(3) },
    shadowOpacity: 0.08,
    shadowRadius: s(10),
    elevation: 3,
  },
  yourRoomLeft: { flex: 1 },
  yourRoomCodeRow: { flexDirection: 'row', alignItems: 'center', gap: s(10), marginBottom: vs(4) },
  yourRoomCode: { fontSize: ms(20), fontWeight: '900', color: APP_THEME.text, letterSpacing: 2 },
  hostBadge: {
    backgroundColor: APP_THEME.primary,
    paddingHorizontal: s(8),
    paddingVertical: vs(2),
    borderRadius: s(6),
  },
  hostBadgeText: { color: COLORS.pure_white, fontSize: ms(10), fontWeight: '800' },
  yourRoomStatus: { fontSize: ms(12), color: APP_THEME.textSecondary, marginBottom: vs(10) },
  avatarRow: { flexDirection: 'row', gap: s(6) },
  avatar: { width: s(30), height: s(30), borderRadius: s(15) },
  avatarFilled: { backgroundColor: COLORS.gray300 },
  avatarEmpty: { backgroundColor: COLORS.gray100, borderWidth: 1.5, borderColor: COLORS.gray200, borderStyle: 'dashed' },

  roomListCard: {
    backgroundColor: APP_THEME.surface,
    borderRadius: s(16),
    borderWidth: 1,
    borderColor: APP_THEME.surfaceBorder,
    marginTop: vs(12),
    overflow: 'hidden',
    shadowColor: APP_THEME.shadowColor,
    shadowOffset: { width: 0, height: vs(3) },
    shadowOpacity: 0.08,
    shadowRadius: s(10),
    elevation: 3,
  },
  roomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: vs(14),
    paddingHorizontal: s(16),
  },
  roomRowIcon: {
    width: s(36),
    height: s(36),
    borderRadius: s(8),
    backgroundColor: APP_THEME.primarySubtle,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: s(3),
    marginRight: s(12),
    padding: s(8),
  },
  roomIconDot: { width: s(7), height: s(7), borderRadius: s(3), backgroundColor: APP_THEME.primary },
  roomRowInfo: { flex: 1 },
  roomCode: { fontSize: ms(15), fontWeight: '800', color: APP_THEME.text, letterSpacing: 1.5 },
  roomMeta: { fontSize: ms(11), color: APP_THEME.textSecondary, marginTop: vs(1) },
  divider: { height: 1, backgroundColor: APP_THEME.divider, marginHorizontal: s(16) },

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
