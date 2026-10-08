import React from 'react'
import { StatusBar } from 'expo-status-bar'
import { NavigationContainer } from '@react-navigation/native'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { RootNavigator } from './src/navigation'
import { APP_THEME } from './src/constants/colors'
import { useAuthListener } from './src/hooks/useAuthListener'

function AppContent() {
  useAuthListener()
  return (
    <>
      <StatusBar style="light" />
      <RootNavigator />
    </>
  )
}

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <AppContent />
      </NavigationContainer>
    </SafeAreaProvider>
  )
}

