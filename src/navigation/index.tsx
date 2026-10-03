import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import type { RootStackParamList } from '../types/navigation'
import { APP_THEME } from '../constants/colors'

import HomeScreen from '../screens/HomeScreen'
import LoadingScreen from '../screens/LoadingScreen'
import CreateRoomScreen from '../screens/CreateRoomScreen'
import JoinRoomScreen from '../screens/JoinRoomScreen'
import LobbyScreen from '../screens/LobbyScreen'
import RoundScreen from '../screens/RoundScreen'
import CameraScreen from '../screens/CameraScreen'
import ReviewScreen from '../screens/ReviewScreen'
import ResultScreen from '../screens/ResultScreen'

const Stack = createNativeStackNavigator<RootStackParamList>()

export function RootNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Loading"
      screenOptions={{
        headerStyle: {
          backgroundColor: APP_THEME.surface,
        },
        headerTintColor: APP_THEME.text,
        headerTitleStyle: {
          fontWeight: '700',
        },
        headerShadowVisible: false,
        contentStyle: {
          backgroundColor: APP_THEME.background,
        },
      }}
    >
      <Stack.Screen
        name="Loading"
        component={LoadingScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="CreateRoom"
        component={CreateRoomScreen}
        options={{ title: 'Create Room' }}
      />
      <Stack.Screen
        name="JoinRoom"
        component={JoinRoomScreen}
        options={{ title: 'Join Room' }}
      />
      <Stack.Screen
        name="Lobby"
        component={LobbyScreen}
        options={{ title: 'Room Lobby', headerBackVisible: false }}
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
