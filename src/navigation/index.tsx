import React from 'react'
import { View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import type { RootStackParamList, TabParamList } from '../types/navigation'
import { APP_THEME, COLORS } from '../constants/colors'

// Screens
import LoadingScreen from '../screens/LoadingScreen'
import AuthScreen from '../screens/AuthScreen'
import HomeScreen from '../screens/HomeScreen'
import RoomsScreen from '../screens/RoomsScreen'
import HistoryScreen from '../screens/HistoryScreen'
import SettingsScreen from '../screens/SettingsScreen'
import CreateRoomScreen from '../screens/CreateRoomScreen'
import JoinRoomScreen from '../screens/JoinRoomScreen'
import LobbyScreen from '../screens/LobbyScreen'
import ColourSpinScreen from '../screens/ColourSpinScreen'
import RoundScreen from '../screens/RoundScreen'
import CameraScreen from '../screens/CameraScreen'
import ReviewScreen from '../screens/ReviewScreen'
import ResultScreen from '../screens/ResultScreen'

// ──────────────────────────────────────────────
// Tab icon map — filled when active, outline when inactive
// ──────────────────────────────────────────────

type IoniconName = React.ComponentProps<typeof Ionicons>['name']

const TAB_ICONS: Record<string, { active: IoniconName; inactive: IoniconName }> = {
  Home:     { active: 'home',     inactive: 'home-outline' },
  Rooms:    { active: 'people',   inactive: 'people-outline' },
  History:  { active: 'time',     inactive: 'time-outline' },
  Settings: { active: 'settings', inactive: 'settings-outline' },
}

// ──────────────────────────────────────────────
// Bottom Tab Navigator
// ──────────────────────────────────────────────

const Tab = createBottomTabNavigator<TabParamList>()

const TAB_INACTIVE_COLOR = '#5C5C66' // Meets 4.5:1 contrast ratio against white

function MainTabs() {
  const insets = useSafeAreaInsets()

  // Fixed content area + device system nav bar inset
  const TAB_CONTENT_HEIGHT = 60
  const tabBarHeight = TAB_CONTENT_HEIGHT + insets.bottom

  return (
    <Tab.Navigator
      screenOptions={({ route }) => {
        const icons = TAB_ICONS[route.name]
        return {
          headerShown: false,
          tabBarHideOnKeyboard: true,
          tabBarStyle: {
            backgroundColor: COLORS.pure_white,
            borderTopWidth: 1,
            borderTopColor: APP_THEME.surfaceBorder,
            height: tabBarHeight,
            paddingBottom: insets.bottom + 4,
            paddingTop: 6,
            shadowColor: COLORS.gray400,
            shadowOffset: { width: 0, height: -3 },
            shadowOpacity: 0.08,
            shadowRadius: 12,
            elevation: 12,
          },
          tabBarActiveTintColor: APP_THEME.primary,
          tabBarInactiveTintColor: TAB_INACTIVE_COLOR,
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '700',
            marginTop: 2,
          },
          tabBarIcon: ({ color, focused }) =>
            icons ? (
              <View style={{ alignItems: 'center', justifyContent: 'center', width: 44, height: 32 }}>
                <View
                  style={{
                    width: 40,
                    height: 28,
                    borderRadius: 14,
                    backgroundColor: focused ? COLORS.red100 : 'transparent',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Ionicons
                    name={focused ? icons.active : icons.inactive}
                    size={24}
                    color={color}
                  />
                </View>
                {/* dot removed – pill behind icon is sufficient indicator */}
              </View>
            ) : null,
        }
      }}
    >
      <Tab.Screen name="Home"     component={HomeScreen} />
      <Tab.Screen name="Rooms"    component={RoomsScreen} />
      <Tab.Screen name="History"  component={HistoryScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  )
}

// ──────────────────────────────────────────────
// Root Stack Navigator
// ──────────────────────────────────────────────

const Stack = createNativeStackNavigator<RootStackParamList>()

export function RootNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Loading"
      screenOptions={{
        headerStyle: { backgroundColor: APP_THEME.surface },
        headerTintColor: APP_THEME.text,
        headerTitleStyle: { fontWeight: '700' },
        headerShadowVisible: false,
        contentStyle: { backgroundColor: APP_THEME.background },
      }}
    >
      <Stack.Screen
        name="Loading"
        component={LoadingScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Auth"
        component={AuthScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="MainTabs"
        component={MainTabs}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="CreateRoom"
        component={CreateRoomScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="JoinRoom"
        component={JoinRoomScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Lobby"
        component={LobbyScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ColourSpin"
        component={ColourSpinScreen}
        options={{ headerShown: false, gestureEnabled: false }}
      />
      <Stack.Screen
        name="Round"
        component={RoundScreen}
        options={{ title: 'Hunt Active', headerBackVisible: false }}
      />
      <Stack.Screen
        name="Camera"
        component={CameraScreen}
        options={{ title: 'Capture Target Color', headerTintColor: '#FFFFFF' }}
      />
      <Stack.Screen
        name="Review"
        component={ReviewScreen}
        options={{ title: 'Review Submission', headerBackVisible: false }}
      />
      <Stack.Screen
        name="Result"
        component={ResultScreen}
        options={{ title: 'Round Results', headerBackVisible: false }}
      />
    </Stack.Navigator>
  )
}
