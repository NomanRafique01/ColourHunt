import { create } from 'zustand'
import type { Player, RoomStatus } from '../types'

export interface RoomSettings {
  maxPlayers: number
  roundTimerSeconds: number
  totalRounds: number
}

export interface RoomState {
  roomId: string | null
  roomCode: string | null
  players: Player[]
  roomStatus: RoomStatus
  maxPlayers: number
  roundTimerSeconds: number
  totalRounds: number
  setRoomId: (id: string | null) => void
  setRoomCode: (code: string | null) => void
  setPlayers: (players: Player[]) => void
  addPlayer: (player: Player) => void
  removePlayer: (userId: string) => void
  setRoomStatus: (status: RoomStatus) => void
  setMaxPlayers: (count: number) => void
  setRoundTimerSeconds: (seconds: number) => void
  setTotalRounds: (rounds: number) => void
  setSettings: (settings: Partial<RoomSettings>) => void
  resetRoom: () => void
}

export const useRoomStore = create<RoomState>((set) => ({
  roomId: null,
  roomCode: null,
  players: [],
  roomStatus: 'waiting',
  maxPlayers: 4,
  roundTimerSeconds: 60,
  totalRounds: 5,
  setRoomId: (roomId) => set({ roomId }),
  setRoomCode: (roomCode) => set({ roomCode }),
  setPlayers: (players) => set({ players }),
  addPlayer: (player) =>
    set((state) => ({
      players: state.players.some((p) => p.userId === player.userId)
        ? state.players
        : [...state.players, player],
    })),
  removePlayer: (userId) =>
    set((state) => ({
      players: state.players.filter((p) => p.userId !== userId),
    })),
  setRoomStatus: (roomStatus) => set({ roomStatus }),
  setMaxPlayers: (maxPlayers) => set({ maxPlayers }),
  setRoundTimerSeconds: (roundTimerSeconds) => set({ roundTimerSeconds }),
  setTotalRounds: (totalRounds) => set({ totalRounds }),
  setSettings: (settings) => set((state) => ({ ...state, ...settings })),
  resetRoom: () =>
    set({
      roomId: null,
      roomCode: null,
      players: [],
      roomStatus: 'waiting',
      maxPlayers: 4,
      roundTimerSeconds: 60,
      totalRounds: 5,
    }),
}))
