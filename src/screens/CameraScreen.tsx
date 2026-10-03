import React, { useState } from 'react'
import {
  View, Text, StyleSheet, TouchableOpacity,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { RootStackParamList } from '../types/navigation'
import { Button } from '../components/Button'
import { APP_THEME } from '../constants/colors'
import { usePlayerStore } from '../store/player'
import { useGameStore } from '../store/game'
import { s, vs, ms } from '../utils/scale'

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Camera'>

export default function CameraScreen() {
  const navigation = useNavigation<NavigationProp>()
  const { incrementSubmissionCount, isHost } = usePlayerStore()
  const { setIsPaused } = useGameStore()
  const [hasCaptured, setHasCaptured] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [matchScore, setMatchScore] = useState<number | null>(null)

  const handleTakePhoto = () => {
    setHasCaptured(true)
    setAnalyzing(true)
    setTimeout(() => {
      setAnalyzing(false)
      setMatchScore(84)
    }, 1200)
  }

  const handleRetake = () => {
    setHasCaptured(false)
    setMatchScore(null)
    setAnalyzing(false)
  }

  const handleSubmit = () => {
    incrementSubmissionCount()
    setIsPaused(true)
    if (isHost) {
      navigation.navigate('Review')
    } else {
      navigation.navigate('Round')
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Preview */}
        <View style={styles.previewBox}>
          {hasCaptured ? (
            <View style={styles.capturedContainer}>
              <View style={styles.capturedPhotoSim}>
                <Text style={styles.capturedPhotoIcon}>🖼️</Text>
                <Text style={styles.capturedPhotoText}>Captured Photo Preview</Text>
              </View>
              <View style={styles.analysisCard}>
                {analyzing ? (
                  <Text style={styles.analyzingText}>⏳  Analyzing color match...</Text>
                ) : (
                  <View style={styles.scoreRow}>
                    <Text style={styles.scoreLabel}>Match Score: </Text>
                    <Text style={styles.scoreValue}>{matchScore !== null ? `${matchScore}%` : '--%'}</Text>
                    {matchScore !== null && <Text style={styles.scoreTag}> Strong Match</Text>}
                  </View>
                )}
              </View>
            </View>
          ) : (
            <View style={styles.liveCameraPlaceholder}>
              <Text style={styles.cameraIcon}>📷</Text>
              <Text style={styles.cameraPlaceholderText}>Camera Preview</Text>
              <Text style={styles.cameraHint}>
                Aim at an object matching your target color
              </Text>
            </View>
          )}
        </View>

        {/* Controls */}
        <View style={styles.controlsContainer}>
          {hasCaptured ? (
            <View style={styles.reviewActions}>
              <Button title="Submit Photo" variant="primary" onPress={handleSubmit} disabled={analyzing} />
              <Button title="Retake"       variant="outline" onPress={handleRetake} />
            </View>
          ) : (
            <View style={styles.captureActions}>
              <TouchableOpacity activeOpacity={0.7} style={styles.shutterButton} onPress={handleTakePhoto}>
                <View style={styles.shutterInner} />
              </TouchableOpacity>
              <Text style={styles.shutterLabel}>Tap to Capture</Text>
              <Button title="Cancel" variant="outline" onPress={() => navigation.goBack()} style={styles.cancelButton} />
            </View>
          )}
        </View>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: APP_THEME.background,
  },
  container: {
    flex: 1,
    justifyContent: 'space-between',
  },
  previewBox: {
    flex: 1,
    backgroundColor: APP_THEME.backgroundSoft,
    margin: s(16),
    borderRadius: s(18),
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: APP_THEME.surfaceBorder,
  },
  liveCameraPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: s(24),
  },
  cameraIcon: { fontSize: ms(60), marginBottom: vs(16) },
  cameraPlaceholderText: {
    color: APP_THEME.text,
    fontSize: ms(18),
    fontWeight: '700',
    textAlign: 'center',
  },
  cameraHint: {
    color: APP_THEME.textMuted,
    fontSize: ms(13),
    textAlign: 'center',
    marginTop: vs(8),
  },
  capturedContainer: {
    flex: 1,
    width: '100%',
    justifyContent: 'space-between',
    padding: s(16),
  },
  capturedPhotoSim: {
    flex: 1,
    backgroundColor: APP_THEME.surface,
    borderRadius: s(14),
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: APP_THEME.surfaceBorder,
  },
  capturedPhotoIcon: { fontSize: ms(64), marginBottom: vs(12) },
  capturedPhotoText: {
    color: APP_THEME.textSecondary,
    fontSize: ms(15),
    fontWeight: '600',
  },
  analysisCard: {
    backgroundColor: APP_THEME.surface,
    padding: s(14),
    borderRadius: s(12),
    marginTop: vs(12),
    borderWidth: 1,
    borderColor: APP_THEME.surfaceBorder,
    alignItems: 'center',
  },
  analyzingText: {
    color: APP_THEME.primary,
    fontSize: ms(14),
    fontWeight: '700',
  },
  scoreRow: { flexDirection: 'row', alignItems: 'center' },
  scoreLabel: { color: APP_THEME.textSecondary, fontSize: ms(14), fontWeight: '600' },
  scoreValue: { color: APP_THEME.primary, fontSize: ms(16), fontWeight: '900' },
  scoreTag:   { color: APP_THEME.textMuted, fontSize: ms(13), fontWeight: '500' },
  controlsContainer: {
    paddingHorizontal: s(24),
    paddingBottom: vs(24),
  },
  reviewActions: { width: '100%' },
  captureActions: { alignItems: 'center' },
  shutterButton: {
    width: s(80),
    height: s(80),
    borderRadius: s(40),
    borderWidth: 3,
    borderColor: APP_THEME.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: vs(8),
    shadowColor: APP_THEME.shadowColorRed,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: s(12),
    elevation: 8,
  },
  shutterInner: {
    width: s(62),
    height: s(62),
    borderRadius: s(31),
    backgroundColor: APP_THEME.primary,
  },
  shutterLabel: {
    color: APP_THEME.textMuted,
    fontSize: ms(12),
    fontWeight: '600',
    marginBottom: vs(14),
  },
  cancelButton: { width: '100%' },
})
