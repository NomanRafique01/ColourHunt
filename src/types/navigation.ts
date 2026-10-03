import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs'

// Tab navigator param list
export type TabParamList = {
  Home: undefined
  Rooms: undefined
  History: undefined
  Settings: undefined
}

// Stack param list (game flow screens)
export type RootStackParamList = {
  Loading: undefined
  MainTabs: undefined
  CreateRoom: undefined
  JoinRoom: undefined
  Lobby: { roomId?: string; code?: string; isHost?: boolean } | undefined
  Round: { roomId?: string; roundId?: string } | undefined
  Camera: { roomId?: string; roundId?: string } | undefined
  Review: { roomId?: string; roundId?: string; submissionId?: string } | undefined
  Result: { roomId?: string; roundId?: string; winnerPlayerId?: string } | undefined
}

export type RootStackScreenProps<T extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, T>

export type TabScreenProps<T extends keyof TabParamList> =
  BottomTabScreenProps<TabParamList, T>
