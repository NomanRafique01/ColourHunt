import React, { useEffect } from 'react'
import { Image, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { RootStackParamList } from '../types/navigation'
import { APP_THEME, COLORS } from '../constants/colors'
import { s, vs, ms, w, h } from '../utils/scale'
import { SpectrumLensLogo } from '../../assets/svg/SpectrumLensLogo'

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Loading'>

const loadingArtwork = require('../../assets/loading-artwork.png')

export default function LoadingScreen() {
  const navigation = useNavigation<NavigationProp>()

  useEffect(() => {
    let mounted = true
    const timer = setTimeout(async () => {
      try {
        const { getActiveSession } = require('../lib/api/authService')
        const res = await getActiveSession()
        if (!mounted) return
        if (res?.success && res?.user) {
          navigation.replace('MainTabs')
        } else {
          navigation.replace('Auth')
        }
      } catch {
        if (!mounted) return
        navigation.replace('Auth')
      }
    }, 2500)

    return () => {
      mounted = false
      clearTimeout(timer)
    }
  }, [navigation])

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <View style={styles.page}>
        <View style={styles.topAccent} />
        <View style={styles.bottomAccent} />

        <View style={styles.brand}>
          <View style={styles.logoTile}>
            <SpectrumLensLogo size={s(86)} />
          </View>
          <Text style={styles.wordmark}>Colour<Text style={styles.wordmarkAccent}>Hunt</Text></Text>
          <View style={styles.taglineRow}>
            <Text style={styles.tagline}>See it</Text>
            <Text style={styles.taglineDot}>•</Text>
            <Text style={styles.tagline}>Capture it</Text>
            <Text style={styles.taglineDot}>•</Text>
            <Text style={styles.tagline}>Win it</Text>
          </View>
        </View>

          <View style={styles.artworkFrame} pointerEvents="none">
          <Image source={loadingArtwork} style={styles.artwork} resizeMode="contain" />
        </View>

      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: APP_THEME.background },
  page: { flex: 1, overflow: 'hidden', alignItems: 'center', backgroundColor: APP_THEME.background },
  topAccent: {
    position: 'absolute',
    top: vs(-64),
    left: s(-64),
    width: s(204),
    height: vs(150),
    backgroundColor: APP_THEME.primary,
    borderBottomRightRadius: s(156),
    transform: [{ rotate: '-8deg' }],
  },
  bottomAccent: {
    position: 'absolute',
    right: s(-112),
    bottom: vs(-112),
    width: s(224),
    height: s(224),
    borderRadius: s(112),
    backgroundColor: APP_THEME.primary,
  },
  brand: { alignItems: 'center', zIndex: 2, paddingTop: vs(58) },
  logoTile: {
    width: s(122),
    height: s(122),
    borderRadius: s(32),
    backgroundColor: COLORS.pure_white,
    borderWidth: 4,
    borderColor: APP_THEME.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: APP_THEME.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.16,
    shadowRadius: 14,
    elevation: 8,
  },
  wordmark: {
    color: COLORS.gray900,
    fontSize: ms(31),
    fontWeight: '800',
    letterSpacing: -1.4,
    marginTop: vs(8),
  },
  wordmarkAccent: { color: APP_THEME.primary },
  taglineRow: { flexDirection: 'row', alignItems: 'center', marginTop: vs(17) },
  tagline: { color: APP_THEME.textSecondary, fontSize: ms(12), fontWeight: '500' },
  taglineDot: { color: APP_THEME.primary, fontSize: ms(13), marginHorizontal: s(9) },
  artworkFrame: { flex: 1, width: '100%', alignItems: 'center', justifyContent: 'flex-end', zIndex: 1 },
  artwork: { width: w(1.0), height: h(0.75) },
})
