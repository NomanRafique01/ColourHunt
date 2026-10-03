import type { NativeStackScreenProps } from '@react-navigation/native-stack'

export type RootStackParamList = {
  Loading: undefined
  Home: undefined
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
