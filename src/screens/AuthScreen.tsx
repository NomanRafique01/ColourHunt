import React, { useCallback, useEffect, useRef, useState } from 'react'
import {
  AccessibilityInfo,
  ActivityIndicator,
  Animated,
  Dimensions,
  Easing,
  Keyboard,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import Svg, {
  Circle,
  Defs,
  LinearGradient,
  Path,
  RadialGradient,
  Rect,
  Stop,
} from 'react-native-svg'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useIsFocused, useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { RootStackParamList } from '../types/navigation'
import { ACCENT, APP_THEME, COLORS } from '../constants/colors'
import { usePlayerStore } from '../store/player'
import { s, vs, ms } from '../utils/scale'
import { LoginHuntArt } from '../art/LoginHuntArt'
import {
  signInAsGuest,
  signInWithEmail,
  signUpWithEmail,
} from '../lib/api/authService'

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Auth'>

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window')
const IS_SMALL_SCREEN = SCREEN_H < 720

// ─── Theme constants ────────────────────────────────────────────────────────
const HERO_TOP = APP_THEME.heroTop     // '#F0192D'
const HERO_BOT = APP_THEME.heroBottom  // '#B3000F'
const STORAGE_LAST_NAME_KEY = 'colourhunt_last_hunter_name'

// Haptic feedback helper (safe fallback if expo-haptics is not available)
function triggerHaptic(type: 'light' | 'success' | 'warning' = 'light') {
  try {
    const Haptics = require('expo-haptics')
    if (type === 'light') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    else if (type === 'success') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    else if (type === 'warning') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)
  } catch {
    // Haptics not installed or not supported on device; safe no-op
  }
}

// ─── Name Generators ────────────────────────────────────────────────────────
const COLOR_PREFIXES = [
  'Amber',
  'Cobalt',
  'Scarlet',
  'Emerald',
  'Crimson',
  'Ruby',
  'Coral',
  'Neon',
  'Azure',
  'Golden',
  'Violet',
  'Indigo',
  'Topaz',
  'Onyx',
]

const HUNTER_SUFFIXES = [
  'Hunter',
  'Seeker',
  'Fox',
  'Sniper',
  'Ranger',
  'Knight',
  'Ghost',
  'Falcon',
  'Wolf',
  'Chaser',
  'Pixel',
  'Hawk',
]

function generateHunterName(): string {
  const c = COLOR_PREFIXES[Math.floor(Math.random() * COLOR_PREFIXES.length)]
  const s = HUNTER_SUFFIXES[Math.floor(Math.random() * HUNTER_SUFFIXES.length)]
  const num = Math.random() > 0.4 ? Math.floor(Math.random() * 89) + 10 : ''
  const name = `${c}${s}${num}`
  return name.slice(0, 16)
}

// Simple profanity list check
const BLOCKED_WORDS = [
  'fuck',
  'shit',
  'bitch',
  'cunt',
  'asshole',
  'dick',
  'pussy',
  'nigger',
  'faggot',
  'slut',
  'whore',
]

function validateHunterName(raw: string): { valid: boolean; error: string | null } {
  const trimmed = raw.trim()
  if (!trimmed) {
    return { valid: false, error: 'Hunter name is required' }
  }
  if (trimmed.length < 3) {
    return { valid: false, error: 'Name must be at least 3 characters' }
  }
  if (trimmed.length > 16) {
    return { valid: false, error: 'Name cannot exceed 16 characters' }
  }
  if (!/^[a-zA-Z0-9_]+$/.test(trimmed)) {
    return { valid: false, error: 'Only letters, numbers, and underscores allowed' }
  }
  const lower = trimmed.toLowerCase()
  if (BLOCKED_WORDS.some((w) => lower.includes(w))) {
    return { valid: false, error: 'Please choose an appropriate hunter name' }
  }
  return { valid: true, error: null }
}

// ─── 1. Fake Blur Circles (SVG RadialGradient Drifting in UI Thread) ────────
function FakeBlurAtmosphere({
  isFocused,
  reduceMotion,
}: {
  isFocused: boolean
  reduceMotion: boolean
}) {
  const drift1 = useRef(new Animated.Value(0)).current
  const drift2 = useRef(new Animated.Value(0)).current
  const drift3 = useRef(new Animated.Value(0)).current
  const drift4 = useRef(new Animated.Value(0)).current

  useEffect(() => {
    if (!isFocused || reduceMotion) {
      drift1.setValue(0)
      drift2.setValue(0)
      drift3.setValue(0)
      drift4.setValue(0)
      return
    }

    const createLoop = (anim: Animated.Value, duration: number, delay = 0) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(anim, {
            toValue: 1,
            duration: duration / 2,
            delay,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration: duration / 2,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ])
      )

    const l1 = createLoop(drift1, 9000, 0)
    const l2 = createLoop(drift2, 11000, 500)
    const l3 = createLoop(drift3, 10000, 1000)
    const l4 = createLoop(drift4, 12000, 1500)

    l1.start()
    l2.start()
    l3.start()
    l4.start()

    return () => {
      l1.stop()
      l2.stop()
      l3.stop()
      l4.stop()
    }
  }, [isFocused, reduceMotion, drift1, drift2, drift3, drift4])

  const tX1 = drift1.interpolate({ inputRange: [0, 1], outputRange: [-14, 14] })
  const tY1 = drift1.interpolate({ inputRange: [0, 1], outputRange: [12, -12] })

  const tX2 = drift2.interpolate({ inputRange: [0, 1], outputRange: [16, -16] })
  const tY2 = drift2.interpolate({ inputRange: [0, 1], outputRange: [-14, 14] })

  const tX3 = drift3.interpolate({ inputRange: [0, 1], outputRange: [-12, 16] })
  const tY3 = drift3.interpolate({ inputRange: [0, 1], outputRange: [-12, 12] })

  const tX4 = drift4.interpolate({ inputRange: [0, 1], outputRange: [14, -14] })
  const tY4 = drift4.interpolate({ inputRange: [0, 1], outputRange: [10, -14] })

  const circleSize = s(190)

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {/* 1. Red-Light Glow Circle */}
      <Animated.View
        style={[
          styles.blurCircleWrap,
          {
            top: vs(15),
            left: s(15),
            transform: [{ translateX: tX1 }, { translateY: tY1 }],
          },
        ]}
      >
        <Svg width={circleSize} height={circleSize}>
          <Defs>
            <RadialGradient id="rgRed" cx="50%" cy="50%" r="50%">
              <Stop offset="0%" stopColor="#FFA6AE" stopOpacity="0.25" />
              <Stop offset="55%" stopColor="#FFA6AE" stopOpacity="0.10" />
              <Stop offset="100%" stopColor="#FFA6AE" stopOpacity="0" />
            </RadialGradient>
          </Defs>
          <Circle cx={circleSize / 2} cy={circleSize / 2} r={circleSize / 2} fill="url(#rgRed)" />
        </Svg>
      </Animated.View>

      {/* 2. Blue Glow Circle */}
      <Animated.View
        style={[
          styles.blurCircleWrap,
          {
            top: vs(25),
            right: s(10),
            transform: [{ translateX: tX2 }, { translateY: tY2 }],
          },
        ]}
      >
        <Svg width={circleSize} height={circleSize}>
          <Defs>
            <RadialGradient id="rgBlue" cx="50%" cy="50%" r="50%">
              <Stop offset="0%" stopColor="#2F6BFF" stopOpacity="0.22" />
              <Stop offset="60%" stopColor="#2F6BFF" stopOpacity="0.08" />
              <Stop offset="100%" stopColor="#2F6BFF" stopOpacity="0" />
            </RadialGradient>
          </Defs>
          <Circle cx={circleSize / 2} cy={circleSize / 2} r={circleSize / 2} fill="url(#rgBlue)" />
        </Svg>
      </Animated.View>

      {/* 3. Green Glow Circle */}
      <Animated.View
        style={[
          styles.blurCircleWrap,
          {
            bottom: vs(30),
            left: s(35),
            transform: [{ translateX: tX3 }, { translateY: tY3 }],
          },
        ]}
      >
        <Svg width={circleSize} height={circleSize}>
          <Defs>
            <RadialGradient id="rgGreen" cx="50%" cy="50%" r="50%">
              <Stop offset="0%" stopColor="#1FB35B" stopOpacity="0.20" />
              <Stop offset="55%" stopColor="#1FB35B" stopOpacity="0.07" />
              <Stop offset="100%" stopColor="#1FB35B" stopOpacity="0" />
            </RadialGradient>
          </Defs>
          <Circle cx={circleSize / 2} cy={circleSize / 2} r={circleSize / 2} fill="url(#rgGreen)" />
        </Svg>
      </Animated.View>

      {/* 4. Yellow Glow Circle */}
      <Animated.View
        style={[
          styles.blurCircleWrap,
          {
            bottom: vs(20),
            right: s(40),
            transform: [{ translateX: tX4 }, { translateY: tY4 }],
          },
        ]}
      >
        <Svg width={circleSize} height={circleSize}>
          <Defs>
            <RadialGradient id="rgYellow" cx="50%" cy="50%" r="50%">
              <Stop offset="0%" stopColor="#FFC93C" stopOpacity="0.24" />
              <Stop offset="60%" stopColor="#FFC93C" stopOpacity="0.09" />
              <Stop offset="100%" stopColor="#FFC93C" stopOpacity="0" />
            </RadialGradient>
          </Defs>
          <Circle cx={circleSize / 2} cy={circleSize / 2} r={circleSize / 2} fill="url(#rgYellow)" />
        </Svg>
      </Animated.View>
    </View>
  )
}

// ─── Google "G" Logo SVG ────────────────────────────────────────────────────
function GoogleGIcon({ size = 20 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <Path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <Path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
        fill="#FBBC05"
      />
      <Path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
        fill="#EA4335"
      />
    </Svg>
  )
}

// ─── MAIN AUTH SCREEN COMPONENT ─────────────────────────────────────────────
export default function AuthScreen() {
  const navigation = useNavigation<NavigationProp>()
  const insets = useSafeAreaInsets()
  const isFocused = useIsFocused()
  const setUserId = usePlayerStore((s) => s.setUserId)
  const setDisplayName = usePlayerStore((s) => s.setDisplayName)
  const setIsAnonymous = usePlayerStore((s) => s.setIsAnonymous)

  const heroHeight = IS_SMALL_SCREEN ? vs(220) : vs(240)
  const [authMode, setAuthMode] = useState<'guest' | 'email'>('guest')
  // Email Submode: 'signin' | 'signup'
  const [emailSubMode, setEmailSubMode] = useState<'signin' | 'signup'>('signin')

  // Form Fields
  const [guestName, setGuestName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [signUpName, setSignUpName] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  // Focus & State
  const [nameFocused, setNameFocused] = useState(false)
  const [emailFocused, setEmailFocused] = useState(false)
  const [passFocused, setPassFocused] = useState(false)
  const [signUpNameFocused, setSignUpNameFocused] = useState(false)
  const [keyboardVisible, setKeyboardVisible] = useState(false)
  const isScrolledUpRef = useRef(false)
  const authModeRef = useRef(authMode)
  useEffect(() => {
    authModeRef.current = authMode
  }, [authMode])

  // Feedback & Loading
  const [loading, setLoading] = useState(false)
  const [toastError, setToastError] = useState<string | null>(null)
  const [reduceMotion, setReduceMotion] = useState(false)

  // Validation
  const nameValidation = validateHunterName(guestName)
  const isGuestValid = nameValidation.valid

  // ── Entrance Animations ───────────────────────────────────────────────────
  const heroFadeAnim = useRef(new Animated.Value(0)).current
  const sheetSlideAnim = useRef(new Animated.Value(80)).current
  const tabSlideAnim = useRef(new Animated.Value(0)).current     // 0 = guest, 1 = email
  const diceRollAnim = useRef(new Animated.Value(0)).current
  // 0 = keyboard hidden, 1 = keyboard shown (drives footer slide-out + hero focus mode)
  const keyboardAnim = useRef(new Animated.Value(0)).current

  // Input refs for smooth keyboard transitions & focus locking
  const guestInputRef = useRef<TextInput>(null)
  const signUpNameInputRef = useRef<TextInput>(null)
  const emailInputRef = useRef<TextInput>(null)
  const passwordInputRef = useRef<TextInput>(null)
  const scrollViewRef = useRef<ScrollView>(null)

  // Load last used name on mount
  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion)
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduceMotion)

    AsyncStorage.getItem(STORAGE_LAST_NAME_KEY).then((stored) => {
      if (stored && stored.trim()) {
        setGuestName(stored.trim())
      } else {
        setGuestName(generateHunterName())
      }
    })

    return () => sub.remove()
  }, [])

  // ── Move window up when keyboard appears (Account tab only; Guest tab stays in place) ─
  const scrollToTopTarget = useCallback(() => {
    if (authModeRef.current === 'guest') return
    if (isScrolledUpRef.current) return
    isScrolledUpRef.current = true
    const targetY = Math.max(0, heroHeight - vs(15))
    scrollViewRef.current?.scrollTo({ y: targetY, animated: true })
  }, [heroHeight])

  const scrollToBottomTarget = useCallback(() => {
    if (!isScrolledUpRef.current) return
    isScrolledUpRef.current = false
    scrollViewRef.current?.scrollTo({ y: 0, animated: true })
  }, [])

  const handleInputFocus = useCallback(() => {
    setKeyboardVisible(true)
    scrollToTopTarget()
  }, [scrollToTopTarget])

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow'
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide'

    const showSub = Keyboard.addListener(showEvent, () => {
      setKeyboardVisible(true)
      scrollToTopTarget()
    })

    const hideSub = Keyboard.addListener(hideEvent, () => {
      scrollToBottomTarget()
      setTimeout(() => {
        setKeyboardVisible(false)
      }, 250)
    })

    return () => {
      showSub.remove()
      hideSub.remove()
    }
  }, [scrollToTopTarget, scrollToBottomTarget])

  // ── While typing: hero calms down into focus mode (Account tab only) ──
  useEffect(() => {
    const isEmailTyping = keyboardVisible && authMode === 'email'
    if (reduceMotion) {
      keyboardAnim.setValue(isEmailTyping ? 1 : 0)
      return
    }
    Animated.timing(keyboardAnim, {
      toValue: isEmailTyping ? 1 : 0,
      duration: 200,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start()
  }, [keyboardVisible, authMode, reduceMotion, keyboardAnim])

  // ── Entrance Sequence (Hero fade in, sheet slide up) ──────────────────────
  useEffect(() => {
    if (reduceMotion) {
      heroFadeAnim.setValue(1)
      sheetSlideAnim.setValue(0)
      return
    }

    Animated.parallel([
      Animated.timing(heroFadeAnim, {
        toValue: 1,
        duration: 320,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(sheetSlideAnim, {
        toValue: 0,
        duration: 340,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start()
  }, [reduceMotion, heroFadeAnim, sheetSlideAnim])

  // ── Tab switch animation ──────────────────────────────────────────────────
  const handleSwitchTab = (mode: 'guest' | 'email') => {
    if (mode === authMode) return
    triggerHaptic('light')
    Keyboard.dismiss()
    scrollToBottomTarget()
    setTimeout(() => {
      setKeyboardVisible(false)
    }, 250)
    setAuthMode(mode)
    setToastError(null)

    Animated.timing(tabSlideAnim, {
      toValue: mode === 'guest' ? 0 : 1,
      duration: 180,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start()
  }

  // ── Roll random name ──────────────────────────────────────────────────────
  const handleRollRandomName = useCallback(() => {
    triggerHaptic('light')

    // Dice roll spin animation
    diceRollAnim.setValue(0)
    Animated.timing(diceRollAnim, {
      toValue: 1,
      duration: 350,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start()

    const newName = generateHunterName()
    setGuestName(newName)
    setToastError(null)
  }, [diceRollAnim])

  // ── Submit Guest ──────────────────────────────────────────────────────────
  const handleGuestSubmit = async () => {
    Keyboard.dismiss()
    const trimmed = guestName.trim()
    const finalName = trimmed || generateHunterName()
    if (!trimmed) {
      setGuestName(finalName)
    }

    setLoading(true)
    setToastError(null)

    try {
      await AsyncStorage.setItem(STORAGE_LAST_NAME_KEY, finalName)

      let guestUserId = `guest_${Date.now()}`
      let guestDisplayName = finalName

      try {
        const res = await signInAsGuest(finalName)
        if (res.success && res.user) {
          guestUserId = res.user.id
          guestDisplayName = res.profile?.displayName || finalName
        } else {
          console.warn('Guest sign in offline/fallback mode:', res.error)
        }
      } catch (err) {
        console.warn('Guest sign in network error, fallback mode:', err)
      }

      triggerHaptic('success')
      setUserId(guestUserId)
      setDisplayName(guestDisplayName)
      setIsAnonymous(true)
      navigation.replace('MainTabs')
    } catch {
      triggerHaptic('success')
      setUserId(`guest_${Date.now()}`)
      setDisplayName(finalName)
      setIsAnonymous(true)
      navigation.replace('MainTabs')
    } finally {
      setLoading(false)
    }
  }

  // ── Submit Email ──────────────────────────────────────────────────────────
  const handleEmailSubmit = async () => {
    Keyboard.dismiss()
    setToastError(null)

    if (!email.trim() || !password.trim()) {
      triggerHaptic('warning')
      setToastError('Please enter both email and password.')
      return
    }

    if (emailSubMode === 'signup' && !signUpName.trim()) {
      triggerHaptic('warning')
      setToastError('Please enter a hunter name.')
      return
    }

    setLoading(true)
    try {
      if (emailSubMode === 'signin') {
        const res = await signInWithEmail(email, password)
        if (!res.success || !res.user) {
          setLoading(false)
          triggerHaptic('warning')
          setToastError(res.error || 'Invalid credentials. Please verify your details.')
          return
        }
        triggerHaptic('success')
        setUserId(res.user.id)
        setDisplayName(res.profile?.displayName || 'Hunter')
        navigation.replace('MainTabs')
      } else {
        const res = await signUpWithEmail(email, password, signUpName.trim())
        if (!res.success || !res.user) {
          setLoading(false)
          triggerHaptic('warning')
          setToastError(res.error || 'Sign up failed. Please try again.')
          return
        }
        triggerHaptic('success')
        setUserId(res.user.id)
        setDisplayName(res.profile?.displayName || signUpName.trim())
        navigation.replace('MainTabs')
      }
    } catch {
      setLoading(false)
      triggerHaptic('warning')
      setToastError("Can't connect. Check your internet and try again.")
    }
  }

  // Google OAuth placeholder handler
  const handleGoogleSignIn = () => {
    triggerHaptic('light')
    setToastError('Google Sign-In will be available with the upcoming release.')
  }

  // ── Interpolations ────────────────────────────────────────────────────────
  const diceSpin = diceRollAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  })

  // Tab indicator slide
  const TAB_CONTAINER_PADDING = s(4)
  const TAB_WIDTH = (SCREEN_W - s(40) - TAB_CONTAINER_PADDING * 2) / 2
  const indicatorTranslateX = tabSlideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, TAB_WIDTH],
  })

  const isAccountValid =
    email.trim().length > 3 &&
    password.trim().length >= 6 &&
    (emailSubMode === 'signin' || signUpName.trim().length >= 3)


  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="light-content" backgroundColor={HERO_TOP} />

      <View style={styles.contentWrapper}>
        <ScrollView
          ref={scrollViewRef}
          style={styles.mainScrollView}
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingBottom: heroHeight + vs(60) + Math.max(insets.bottom, vs(20)),
            },
          ]}
          scrollEnabled={keyboardVisible}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="none"
          automaticallyAdjustKeyboardInsets={false}
          bounces={false}
          overScrollMode="never"
          removeClippedSubviews={false}
        >
          {/* ══════════════════════════════════════════════════════════════════
              HERO SECTION (Stable, proportional, never unmounts or jumps)
              ══════════════════════════════════════════════════════════════════ */}
          <Animated.View
            style={[
              styles.heroOuter,
              {
                height: heroHeight,
                opacity: heroFadeAnim,
              },
            ]}
          >
            {/* SVG Full-Bleed Gradient */}
            <Svg
              width={SCREEN_W}
              height={heroHeight}
              style={[StyleSheet.absoluteFill, { left: 0 }]}
              preserveAspectRatio="none"
              pointerEvents="none"
            >
              <Defs>
                <LinearGradient id="heroGrad" x1="0" y1="0" x2="0" y2="1">
                  <Stop offset="0%" stopColor={HERO_TOP} stopOpacity="1" />
                  <Stop offset="1" stopColor={HERO_BOT} stopOpacity="1" />
                </LinearGradient>
              </Defs>
              <Rect x="0" y="0" width={SCREEN_W} height={heroHeight} fill="url(#heroGrad)" />
            </Svg>

            {/* 4 Large Fake Blur Radial-Gradient Circles */}
            <FakeBlurAtmosphere isFocused={isFocused} reduceMotion={reduceMotion} />

            {/* Wordmark Header */}
            <View style={styles.topWordmarkRow}>
              <Text style={styles.navWordmark}>
                Colour<Text style={styles.navWordmarkAccent}>Hunt</Text>
              </Text>
            </View>

            {/* "The Hunt" Animated Hero Art / Logo */}
            <View style={styles.heroLogoContainer} pointerEvents="box-none">
              <LoginHuntArt
                isFocused={isFocused}
                reduceMotion={reduceMotion}
                isKeyboardVisible={keyboardVisible && authMode === 'email'}
              />
            </View>
          </Animated.View>

          {/* ══════════════════════════════════════════════════════════════════
              WHITE SHEET (Slides up 340ms ease-out)
              ══════════════════════════════════════════════════════════════════ */}
          <Animated.View
            style={[
              styles.sheet,
              {
                paddingBottom: Math.max(insets.bottom, vs(20)) + vs(16),
                transform: [{ translateY: sheetSlideAnim }],
              },
            ]}
          >
            {/* 48dp Segmented Control with Sliding White Indicator */}
            <View style={styles.segmentedContainer}>
              {/* Sliding indicator */}
              <Animated.View
                style={[
                  styles.slidingIndicator,
                  {
                    width: TAB_WIDTH,
                    transform: [{ translateX: indicatorTranslateX }],
                  },
                ]}
              />

              {/* Tab 1: Quick Guest */}
              <TouchableOpacity
                style={styles.segmentTab}
                onPress={() => handleSwitchTab('guest')}
                activeOpacity={0.85}
                accessibilityRole="tab"
                accessibilityLabel="Quick Guest Tab"
              >
                <Ionicons
                  name="flash"
                  size={s(16)}
                  color={authMode === 'guest' ? APP_THEME.primary : COLORS.gray700}
                />
                <Text
                  style={[
                    styles.segmentTabText,
                    authMode === 'guest'
                      ? styles.segmentTabTextActive
                      : styles.segmentTabTextInactive,
                  ]}
                >
                  Quick Guest
                </Text>
              </TouchableOpacity>

              {/* Tab 2: Account */}
              <TouchableOpacity
                style={styles.segmentTab}
                onPress={() => handleSwitchTab('email')}
                activeOpacity={0.85}
                accessibilityRole="tab"
                accessibilityLabel="Account Tab"
              >
                <Ionicons
                  name="person-circle-outline"
                  size={s(17)}
                  color={authMode === 'email' ? APP_THEME.primary : COLORS.gray700}
                />
                <Text
                  style={[
                    styles.segmentTabText,
                    authMode === 'email'
                      ? styles.segmentTabTextActive
                      : styles.segmentTabTextInactive,
                  ]}
                >
                  Account
                </Text>
              </TouchableOpacity>
            </View>

            {/* Toast Error Banner (with Retry) */}
            {toastError ? (
              <View style={styles.toastErrorBox}>
                <Ionicons name="alert-circle" size={s(18)} color={COLORS.red700} />
                <Text style={styles.toastErrorText}>{toastError}</Text>
                <TouchableOpacity
                  onPress={() => setToastError(null)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons name="close" size={s(16)} color={COLORS.red700} />
                </TouchableOpacity>
              </View>
            ) : null}

            {/* ────────────────────────────────────────────────────────────
                TAB 1: QUICK GUEST
                ──────────────────────────────────────────────────────────── */}
            {authMode === 'guest' ? (
              <View style={styles.formBody}>
                {/* Label: Sentence case, 13sp, dark gray */}
                <View style={styles.labelRow}>
                  <Text style={styles.sentenceCaseLabel}>Your hunter name</Text>
                  <Text style={styles.charCounter}>{`${guestName.length}/16`}</Text>
                </View>

                {/* 54dp tall Input Box with Constant Border & Smooth Focus */}
                <View
                  style={[
                    styles.tallInputRow,
                    nameFocused && styles.tallInputRowFocused,
                    !isGuestValid && guestName.length > 0 && styles.tallInputRowError,
                  ]}
                >
                  <TextInput
                    ref={guestInputRef}
                    style={styles.tallTextInput}
                    value={guestName}
                    onChangeText={(t) => {
                      setGuestName(t)
                      if (toastError) setToastError(null)
                    }}
                    onFocus={() => {
                      setNameFocused(true)
                      handleInputFocus()
                    }}
                    onBlur={() => setNameFocused(false)}
                    placeholder="e.g. CobaltHunter"
                    placeholderTextColor={COLORS.gray400}
                    selectionColor={APP_THEME.primary}
                    cursorColor={APP_THEME.primary}
                    maxLength={16}
                    autoCapitalize="words"
                    autoCorrect={false}
                    autoComplete="off"
                    importantForAutofill="no"
                    returnKeyType="go"
                    blurOnSubmit={true}
                    onSubmitEditing={handleGuestSubmit}
                    accessibilityLabel="Your hunter name"
                  />

                  {/* Clear Button */}
                  {guestName.length > 0 && (
                    <TouchableOpacity
                      style={styles.clearBtn}
                      onPress={() => {
                        setGuestName('')
                        triggerHaptic('light')
                        guestInputRef.current?.focus()
                      }}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                      <Ionicons name="close-circle" size={s(18)} color={COLORS.gray400} />
                    </TouchableOpacity>
                  )}

                  {/* 40dp Random Dice Chip with 44dp tap target */}
                  <TouchableOpacity
                    style={styles.randomChip}
                    onPress={handleRollRandomName}
                    activeOpacity={0.75}
                    hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
                    accessibilityLabel="Randomize hunter name"
                  >
                    <Animated.View style={{ transform: [{ rotate: diceSpin }] }}>
                      <Ionicons name="dice-outline" size={s(18)} color={APP_THEME.primary} />
                    </Animated.View>
                    <Text style={styles.randomChipText}>Random</Text>
                  </TouchableOpacity>
                </View>

                {/* Inline Error Message */}
                {!isGuestValid && guestName.length > 0 && (
                  <View style={styles.inlineErrorRow}>
                    <Ionicons name="alert-circle-outline" size={s(14)} color={COLORS.red600} />
                    <Text style={styles.inlineErrorText}>{nameValidation.error}</Text>
                  </View>
                )}

                {/* Shortened Blue Info Note */}
                <View style={styles.blueInfoNote}>
                  <Ionicons name="information-circle" size={s(18)} color={ACCENT.blue.base} />
                  <Text style={styles.blueInfoText}>
                    No password needed. Link an email anytime in Settings.
                  </Text>
                </View>

                {/* Primary Action Button */}
                <TouchableOpacity
                  style={[
                    styles.primaryBtn,
                    styles.btnEnabled,
                    loading && styles.btnDisabled,
                  ]}
                  onPress={handleGuestSubmit}
                  disabled={loading}
                  activeOpacity={0.88}
                >
                  {loading ? (
                    <View style={styles.loadingRow}>
                      <ActivityIndicator color={COLORS.pure_white} size="small" />
                      <Text style={styles.primaryBtnText}>Entering Hunt...</Text>
                    </View>
                  ) : (
                    <>
                      <Text style={[styles.primaryBtnText, styles.textEnabled]}>
                        Continue as Guest
                      </Text>
                      <View style={[styles.arrowChip, styles.arrowChipEnabled]}>
                        <Ionicons
                          name="arrow-forward"
                          size={s(16)}
                          color={COLORS.pure_white}
                        />
                      </View>
                    </>
                  )}
                </TouchableOpacity>

                {/* Terms & Privacy Policy Note */}
                <Text style={styles.termsText}>
                  By continuing you agree to our{' '}
                  <Text style={styles.termsLink}>Terms</Text> and{' '}
                  <Text style={styles.termsLink}>Privacy Policy</Text>
                </Text>
              </View>
            ) : (
              /* ────────────────────────────────────────────────────────────
                  TAB 2: ACCOUNT (Unified non-conflicting form body)
                  ──────────────────────────────────────────────────────────── */
              <View style={styles.formBody}>
                {/* Sign In / Create Account Sub-toggle */}
                <View style={styles.subToggleRow}>
                  <TouchableOpacity
                    onPress={() => {
                      Keyboard.dismiss()
                      setEmailSubMode('signin')
                      setToastError(null)
                    }}
                    style={[
                      styles.subToggleBtn,
                      emailSubMode === 'signin' && styles.subToggleBtnActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.subToggleText,
                        emailSubMode === 'signin' && styles.subToggleTextActive,
                      ]}
                    >
                      Sign in
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => {
                      Keyboard.dismiss()
                      setEmailSubMode('signup')
                      setToastError(null)
                    }}
                    style={[
                      styles.subToggleBtn,
                      emailSubMode === 'signup' && styles.subToggleBtnActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.subToggleText,
                        emailSubMode === 'signup' && styles.subToggleTextActive,
                      ]}
                    >
                      Create account
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Display Name (Only for Sign Up) */}
                {emailSubMode === 'signup' && (
                  <View style={styles.accountFieldWrap}>
                    <Text style={styles.sentenceCaseLabel}>Your hunter name</Text>
                    <View
                      style={[
                        styles.tallInputRow,
                        signUpNameFocused && styles.tallInputRowFocused,
                      ]}
                    >
                      <TextInput
                        ref={signUpNameInputRef}
                        style={styles.tallTextInput}
                        value={signUpName}
                        onChangeText={setSignUpName}
                        onFocus={() => {
                          setSignUpNameFocused(true)
                          handleInputFocus()
                        }}
                        onBlur={() => setSignUpNameFocused(false)}
                        placeholder="Hunter alias"
                        placeholderTextColor={COLORS.gray400}
                        selectionColor={APP_THEME.primary}
                        cursorColor={APP_THEME.primary}
                        maxLength={16}
                        autoCapitalize="words"
                        autoCorrect={false}
                        autoComplete="off"
                        importantForAutofill="no"
                        returnKeyType="next"
                        blurOnSubmit={false}
                        onSubmitEditing={() => emailInputRef.current?.focus()}
                        accessibilityLabel="Your hunter name"
                      />
                    </View>
                  </View>
                )}

                {/* Email Field */}
                <View style={styles.accountFieldWrap}>
                  <Text style={styles.sentenceCaseLabel}>Email address</Text>
                  <View
                    style={[
                      styles.tallInputRow,
                      emailFocused && styles.tallInputRowFocused,
                    ]}
                  >
                    <TextInput
                      ref={emailInputRef}
                      style={styles.tallTextInput}
                      value={email}
                      onChangeText={setEmail}
                      onFocus={() => {
                        setEmailFocused(true)
                        handleInputFocus()
                      }}
                      onBlur={() => setEmailFocused(false)}
                      placeholder="hunter@colourhunt.com"
                      placeholderTextColor={COLORS.gray400}
                      selectionColor={APP_THEME.primary}
                      cursorColor={APP_THEME.primary}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                      autoComplete="email"
                      returnKeyType="next"
                      blurOnSubmit={false}
                      onSubmitEditing={() => passwordInputRef.current?.focus()}
                      accessibilityLabel="Email address"
                    />
                  </View>
                </View>

                {/* Password Field with Show/Hide */}
                <View style={styles.accountFieldWrap}>
                  <View style={styles.labelRow}>
                    <Text style={styles.sentenceCaseLabel}>Password</Text>
                    {emailSubMode === 'signin' && (
                      <TouchableOpacity
                        onPress={() => setToastError('Password reset link sent to your email.')}
                      >
                        <Text style={styles.forgotPasswordText}>Forgot password?</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                  <View
                    style={[
                      styles.tallInputRow,
                      passFocused && styles.tallInputRowFocused,
                    ]}
                  >
                    <TextInput
                      ref={passwordInputRef}
                      style={styles.tallTextInput}
                      value={password}
                      onChangeText={setPassword}
                      onFocus={() => {
                        setPassFocused(true)
                        handleInputFocus()
                      }}
                      onBlur={() => setPassFocused(false)}
                      placeholder="••••••••"
                      placeholderTextColor={COLORS.gray400}
                      selectionColor={APP_THEME.primary}
                      cursorColor={APP_THEME.primary}
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                      autoCorrect={false}
                      autoComplete="password"
                      returnKeyType="go"
                      blurOnSubmit={true}
                      onSubmitEditing={handleEmailSubmit}
                      accessibilityLabel="Password"
                    />
                    <TouchableOpacity
                      onPress={() => setShowPassword((prev) => !prev)}
                      style={styles.clearBtn}
                      accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
                    >
                      <Ionicons
                        name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                        size={s(20)}
                        color={COLORS.gray600}
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Primary Action Button */}
                <TouchableOpacity
                  style={[
                    styles.primaryBtn,
                    !isAccountValid && styles.btnDisabled,
                    isAccountValid && styles.btnEnabled,
                  ]}
                  onPress={handleEmailSubmit}
                  disabled={!isAccountValid || loading}
                  activeOpacity={0.88}
                >
                  {loading ? (
                    <View style={styles.loadingRow}>
                      <ActivityIndicator color={COLORS.pure_white} size="small" />
                      <Text style={styles.primaryBtnText}>Getting ready...</Text>
                    </View>
                  ) : (
                    <>
                      <Text
                        style={[
                          styles.primaryBtnText,
                          isAccountValid ? styles.textEnabled : styles.textDisabled,
                        ]}
                      >
                        {emailSubMode === 'signin' ? 'Sign In' : 'Create Account'}
                      </Text>
                      <View
                        style={[
                          styles.arrowChip,
                          isAccountValid ? styles.arrowChipEnabled : styles.arrowChipDisabled,
                        ]}
                      >
                        <Ionicons
                          name="arrow-forward"
                          size={s(16)}
                          color={isAccountValid ? COLORS.pure_white : COLORS.gray500}
                        />
                      </View>
                    </>
                  )}
                </TouchableOpacity>

                {/* Divider "or" */}
                <View style={styles.dividerRow}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>or</Text>
                  <View style={styles.dividerLine} />
                </View>

                {/* Continue with Google */}
                <TouchableOpacity
                  style={styles.googleBtn}
                  onPress={handleGoogleSignIn}
                  activeOpacity={0.85}
                >
                  <GoogleGIcon size={s(20)} />
                  <Text style={styles.googleBtnText}>Continue with Google</Text>
                </TouchableOpacity>

                {/* Terms & Privacy Policy Note */}
                <Text style={styles.termsText}>
                  By continuing you agree to our{' '}
                  <Text style={styles.termsLink}>Terms</Text> and{' '}
                  <Text style={styles.termsLink}>Privacy Policy</Text>
                </Text>
              </View>
            )}
          </Animated.View>
        </ScrollView>
      </View>
    </SafeAreaView>
  )
}

// ─── STYLES ─────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: HERO_TOP,
  },
  contentWrapper: {
    flex: 1,
    backgroundColor: COLORS.pure_white,
  },
  mainScrollView: {
    flex: 1,
    backgroundColor: COLORS.pure_white,
  },
  scrollContent: {
    flexGrow: 1,
    backgroundColor: COLORS.pure_white,
  },

  // ── Hero Section ──────────────────────────────────────────────────────────
  heroOuter: {
    width: '100%',
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: HERO_TOP,
    alignItems: 'center',
  },
  blurCircleWrap: {
    position: 'absolute',
  },
  topWordmarkRow: {
    alignItems: 'center',
    paddingTop: vs(12),
    paddingBottom: vs(6),
    zIndex: 10,
  },
  navWordmark: {
    fontSize: ms(24),
    fontWeight: '900',
    color: COLORS.pure_white,
    letterSpacing: -0.5,
  },
  navWordmarkAccent: {
    color: COLORS.yellow500,
  },

  heroLogoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: vs(8),
    zIndex: 5,
  },

  // ── White Sheet ───────────────────────────────────────────────────────────
  sheet: {
    flexGrow: 1, // fill leftover space but never compress below content height
    backgroundColor: COLORS.pure_white,
    borderTopLeftRadius: s(28),
    borderTopRightRadius: s(28),
    marginTop: vs(-14),
    paddingTop: vs(20),
    paddingHorizontal: s(20),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: s(12),
    elevation: 8,
    minHeight: vs(340),
  },

  // ── Account form inner scroll (email tab only) ─────────────────────────────
  accountFormScroll: {
    flex: 1,
  },

  // ── 48dp Segmented Control ────────────────────────────────────────────────
  segmentedContainer: {
    height: vs(48),
    backgroundColor: COLORS.gray100,
    borderRadius: s(16),
    padding: s(4),
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
    marginBottom: vs(16),
  },
  slidingIndicator: {
    position: 'absolute',
    left: s(4),
    top: s(4),
    bottom: s(4),
    backgroundColor: COLORS.pure_white,
    borderRadius: s(12),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  segmentTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: s(6),
    height: '100%',
    zIndex: 2,
  },
  segmentTabText: {
    fontSize: ms(13),
    letterSpacing: 0.2,
  },
  segmentTabTextActive: {
    color: APP_THEME.primary,
    fontWeight: '800',
  },
  segmentTabTextInactive: {
    color: COLORS.gray700, // 4.5:1 contrast
    fontWeight: '600',
  },

  // ── Toast Error Box ───────────────────────────────────────────────────────
  toastErrorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(8),
    backgroundColor: ACCENT.red.light,
    borderWidth: 1,
    borderColor: ACCENT.red.glow,
    paddingHorizontal: s(12),
    paddingVertical: vs(9),
    borderRadius: s(12),
    marginBottom: vs(14),
  },
  toastErrorText: {
    flex: 1,
    fontSize: ms(12),
    color: COLORS.red700,
    fontWeight: '600',
  },

  // ── Form Body ─────────────────────────────────────────────────────────────
  formBody: {
    width: '100%',
    paddingBottom: vs(12),
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: vs(6),
  },
  sentenceCaseLabel: {
    fontSize: ms(13), // 13sp sentence case
    fontWeight: '600',
    color: COLORS.gray700, // dark gray
  },
  charCounter: {
    fontSize: ms(11),
    fontWeight: '500',
    color: COLORS.gray500,
  },

  // ── 54dp Tall Input Row with Rock-Solid Focus (No layout re-measurement) ────
  tallInputRow: {
    height: vs(54),
    backgroundColor: COLORS.gray50,
    borderWidth: 1.5,
    borderColor: COLORS.gray200,
    borderRadius: s(14),
    paddingHorizontal: s(14),
    flexDirection: 'row',
    alignItems: 'center',
  },
  tallInputRowFocused: {
    borderColor: APP_THEME.primary,
    borderWidth: 1.5, // Constant 1.5dp prevents Android requestLayout() focus jumping
    backgroundColor: COLORS.pure_white,
  },
  tallInputRowError: {
    borderColor: COLORS.red500,
    borderWidth: 1.5,
  },
  tallTextInput: {
    flex: 1,
    fontSize: ms(15),
    fontWeight: '600',
    color: COLORS.gray900,
    paddingVertical: 0,
    paddingHorizontal: 0,
    textAlignVertical: 'center',
    includeFontPadding: false,
    height: '100%',
  },
  clearBtn: {
    padding: s(6),
  },

  // ── 40dp Random Dice Chip with 44dp Tap Area ──────────────────────────────
  randomChip: {
    height: vs(40),
    minWidth: s(84),
    backgroundColor: ACCENT.red.light,
    borderRadius: s(10),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: s(4),
    paddingHorizontal: s(10),
    marginLeft: s(6),
  },
  randomChipText: {
    fontSize: ms(12),
    fontWeight: '700',
    color: APP_THEME.primary,
  },

  // ── Inline Validation Error ───────────────────────────────────────────────
  inlineErrorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(4),
    marginTop: vs(6),
  },
  inlineErrorText: {
    fontSize: ms(12),
    color: COLORS.red600,
    fontWeight: '500',
  },

  // ── Blue Info Note ────────────────────────────────────────────────────────
  blueInfoNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(8),
    backgroundColor: ACCENT.blue.light,
    borderWidth: 1,
    borderColor: ACCENT.blue.glow,
    borderRadius: s(12),
    paddingHorizontal: s(12),
    paddingVertical: vs(10),
    marginTop: vs(16),
  },
  blueInfoText: {
    flex: 1,
    fontSize: ms(12),
    lineHeight: ms(17),
    color: ACCENT.blue.dark,
    fontWeight: '500',
  },

  // ── Account Tab Sub-toggle ────────────────────────────────────────────────
  subToggleRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
    marginBottom: vs(14),
  },
  subToggleBtn: {
    paddingVertical: vs(8),
    marginRight: s(18),
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  subToggleBtnActive: {
    borderBottomColor: APP_THEME.primary,
  },
  subToggleText: {
    fontSize: ms(14),
    fontWeight: '600',
    color: COLORS.gray600,
  },
  subToggleTextActive: {
    color: APP_THEME.primary,
    fontWeight: '800',
  },
  accountFieldWrap: {
    marginBottom: vs(12),
  },
  forgotPasswordText: {
    fontSize: ms(12),
    color: APP_THEME.primary,
    fontWeight: '600',
  },

  // ── Divider & Google Button ───────────────────────────────────────────────
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: vs(14),
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.gray200,
  },
  dividerText: {
    paddingHorizontal: s(12),
    fontSize: ms(12),
    color: COLORS.gray500,
    fontWeight: '600',
    textTransform: 'lowercase',
  },
  googleBtn: {
    height: vs(50),
    backgroundColor: COLORS.pure_white,
    borderWidth: 1.5,
    borderColor: COLORS.gray200,
    borderRadius: s(12),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: s(10),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  googleBtnText: {
    fontSize: ms(14),
    fontWeight: '700',
    color: COLORS.gray800,
  },
  guestLinkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: s(6),
    marginTop: vs(12),
    paddingVertical: vs(8),
  },
  guestLinkText: {
    fontSize: ms(13),
    fontWeight: '700',
    color: APP_THEME.primary,
  },

  // ── Terms & Primary Buttons ───────────────────────────────────────────────
  termsText: {
    fontSize: ms(12),
    color: COLORS.gray600,
    textAlign: 'center',
    marginTop: vs(12),
    marginBottom: vs(4),
    lineHeight: ms(16),
  },
  termsLink: {
    color: APP_THEME.primary,
    fontWeight: '700',
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: s(12),
    paddingVertical: vs(14),
    paddingHorizontal: s(20),
    marginTop: vs(18),
  },
  btnEnabled: {
    backgroundColor: APP_THEME.primary,
    borderWidth: 0,
    shadowColor: ACCENT.red.shadow,
    shadowOffset: { width: 0, height: vs(4) },
    shadowOpacity: 0.28,
    shadowRadius: s(12),
    elevation: 6,
  },
  btnDisabled: {
    backgroundColor: COLORS.gray100,
    borderWidth: 1.5,
    borderColor: COLORS.gray300,
    shadowOpacity: 0,
    elevation: 0,
  },
  primaryBtnText: {
    flex: 1,
    fontSize: ms(16),
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  textEnabled: {
    color: COLORS.pure_white,
  },
  textDisabled: {
    color: COLORS.gray600,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: s(8),
  },
  arrowChip: {
    width: s(30),
    height: s(30),
    borderRadius: s(8),
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowChipEnabled: {
    backgroundColor: 'rgba(255,255,255,0.24)',
  },
  arrowChipDisabled: {
    backgroundColor: COLORS.gray200,
  },
})
