import React, { useState } from 'react'
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { RootStackParamList } from '../types/navigation'
import { Button } from '../components/Button'
import { APP_THEME, COLORS } from '../constants/colors'
import { usePlayerStore } from '../store/player'

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>

const cameraIcon = require('../../assets/icon.png')

function UserIcon() {
  return (
    <View style={styles.userIcon} accessible={false}>
      <View style={styles.userHead} />
      <View style={styles.userBody} />
    </View>
  )
}

function RoomIcon() {
  return (
    <View style={styles.roomIcon} accessible={false}>
      <View style={styles.roomIconCenter} />
    </View>
  )
}

export default function HomeScreen() {
  const navigation = useNavigation<NavigationProp>()
  const { displayName, setDisplayName } = usePlayerStore()
  const [localName, setLocalName] = useState(displayName)

  const handleNameChange = (text: string) => {
    if (text.length <= 16) {
      setLocalName(text)
      setDisplayName(text)
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <View style={styles.page}>
            <View style={styles.topAccent} />
            <View style={styles.bottomAccent} />
            <View style={styles.brandHeader}>
              <View style={styles.logoHalo}>
                <Image source={cameraIcon} style={styles.logoImage} resizeMode="contain" />
              </View>
              <Text style={styles.wordmark}>Colour<Text style={styles.wordmarkAccent}>Hunt</Text></Text>
              <View style={styles.taglineRow}>
                <Text style={styles.tagline}>See it</Text><Text style={styles.taglineDot}>•</Text>
                <Text style={styles.tagline}>Capture it</Text><Text style={styles.taglineDot}>•</Text>
                <Text style={styles.tagline}>Win it</Text>
              </View>
            </View>

            <View style={styles.formCard}>
              <Text style={styles.formTitle}>Ready to hunt?</Text>
              <Text style={styles.formSubtitle}>Choose a display name to start your journey.</Text>
              <View style={styles.inputShell}>
                <UserIcon />
                <TextInput
                  accessibilityLabel="Display name"
                  style={styles.input}
                  placeholder="Your display name"
                  placeholderTextColor={APP_THEME.textMuted}
                  value={localName}
                  onChangeText={handleNameChange}
                  maxLength={16}
                  autoCorrect={false}
                  returnKeyType="done"
                />
                <Text style={styles.characterCount}>{localName.length}/16</Text>
              </View>
              <Button title="Create room  →" variant="primary" onPress={() => navigation.navigate('CreateRoom')} style={styles.primaryButton} />
              <Button title="Join room" icon={<RoomIcon />} variant="outline" onPress={() => navigation.navigate('JoinRoom')} style={styles.joinButton} />
            </View>

            <View style={styles.footerDetails}>
              <View style={styles.footerRule} />
              <Text style={styles.footer}>2–4 players  ·  Multiplayer  ·  Real-world colour hunt</Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: APP_THEME.background },
  container: { flex: 1 },
  scrollContent: { flexGrow: 1 },
  page: { flex: 1, minHeight: 760, overflow: 'hidden', paddingHorizontal: 24, paddingTop: 34, paddingBottom: 20 },
  topAccent: { position: 'absolute', top: -58, left: -54, width: 190, height: 142, backgroundColor: APP_THEME.primary, borderBottomRightRadius: 150, transform: [{ rotate: '-8deg' }] },
  bottomAccent: { position: 'absolute', right: -68, bottom: -86, width: 240, height: 160, backgroundColor: APP_THEME.primary, borderTopLeftRadius: 180, transform: [{ rotate: '-8deg' }] },
  brandHeader: { alignItems: 'center', zIndex: 1 },
  logoHalo: { width: 116, height: 116, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  logoImage: { width: 112, height: 112 },
  wordmark: { color: COLORS.gray900, fontSize: 31, fontWeight: '800', letterSpacing: -1.4 },
  wordmarkAccent: { color: APP_THEME.primary },
  taglineRow: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
  tagline: { color: APP_THEME.textSecondary, fontSize: 12, fontWeight: '500' },
  taglineDot: { color: APP_THEME.primary, fontSize: 13, marginHorizontal: 9 },
  formCard: { width: '100%', maxWidth: 420, alignSelf: 'center', backgroundColor: APP_THEME.surface, borderRadius: 22, borderWidth: 1, borderColor: APP_THEME.surfaceBorder, padding: 20, marginTop: 28, shadowColor: APP_THEME.shadowColor, shadowOffset: { width: 0, height: 7 }, shadowOpacity: 0.14, shadowRadius: 18, elevation: 5, zIndex: 2 },
  formTitle: { color: APP_THEME.text, fontSize: 19, fontWeight: '800' },
  formSubtitle: { color: APP_THEME.textSecondary, fontSize: 12, lineHeight: 18, marginTop: 5, marginBottom: 15 },
  inputShell: { minHeight: 52, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: APP_THEME.inputBorder, borderRadius: 12, paddingHorizontal: 13, backgroundColor: APP_THEME.inputBg },
  userIcon: { width: 20, height: 22, marginRight: 9, alignItems: 'center', justifyContent: 'flex-start' },
  userHead: { width: 8, height: 8, borderWidth: 1.7, borderColor: APP_THEME.primary, borderRadius: 4 },
  userBody: { width: 15, height: 9, borderWidth: 1.7, borderColor: APP_THEME.primary, borderRadius: 8, marginTop: 3 },
  roomIcon: { width: 15, height: 15, borderWidth: 1.7, borderColor: APP_THEME.primary, borderRadius: 2, alignItems: 'center', justifyContent: 'center' },
  roomIconCenter: { width: 4, height: 4, borderWidth: 1.2, borderColor: APP_THEME.primary, borderRadius: 1 },
  input: { flex: 1, color: APP_THEME.inputText, fontSize: 14, fontWeight: '600', paddingVertical: 4 },
  characterCount: { color: APP_THEME.textMuted, fontSize: 10, fontWeight: '600' },
  primaryButton: { marginTop: 16, marginVertical: 0, minHeight: 50, borderRadius: 25 },
  joinButton: { marginTop: 10, marginBottom: 0, minHeight: 48, borderRadius: 24 },
  footerDetails: { alignItems: 'center', marginTop: 34 },
  footerRule: { width: 34, height: 3, borderRadius: 2, backgroundColor: APP_THEME.primary, marginBottom: 10 },
  footer: { color: APP_THEME.textMuted, fontSize: 10, textAlign: 'center', paddingHorizontal: 18 },
})
