import React, { useEffect } from 'react'
import { Image, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { RootStackParamList } from '../types/navigation'
import { APP_THEME, COLORS } from '../constants/colors'

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Loading'>

const cameraIcon = require('../../assets/icon.png')
const loadingArtwork = require('../../assets/assets bottom fro loading page.png')

export default function LoadingScreen() {
  const navigation = useNavigation<NavigationProp>()
  useEffect(() => {
    const transition = setTimeout(() => navigation.replace('Home'), 8000)

    return () => {
      clearTimeout(transition)
    }
  }, [navigation])

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <View style={styles.page}>
        <View style={styles.topAccent} />
        <View style={styles.bottomAccent} />

        <View style={styles.brand}>
          <Image source={cameraIcon} style={styles.logo} resizeMode="contain" />
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
  topAccent: { position: 'absolute', top: -64, left: -64, width: 204, height: 150, backgroundColor: APP_THEME.primary, borderBottomRightRadius: 156, transform: [{ rotate: '-8deg' }] },
  bottomAccent: { position: 'absolute', right: -112, bottom: -112, width: 224, height: 224, borderRadius: 112, backgroundColor: APP_THEME.primary },
  brand: { alignItems: 'center', zIndex: 2, paddingTop: 58 },
  logo: { width: 122, height: 122 },
  wordmark: { color: COLORS.gray900, fontSize: 31, fontWeight: '800', letterSpacing: -1.4, marginTop: 8 },
  wordmarkAccent: { color: APP_THEME.primary },
  taglineRow: { flexDirection: 'row', alignItems: 'center', marginTop: 17 },
  tagline: { color: APP_THEME.textSecondary, fontSize: 12, fontWeight: '500' },
  taglineDot: { color: APP_THEME.primary, fontSize: 13, marginHorizontal: 9 },
  artworkFrame: { position: 'absolute', left: 0, right: 0, bottom: 145, height: 430, alignItems: 'center', justifyContent: 'center' },
  artwork: { width: 430, height: 700 },
})
