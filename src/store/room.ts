import { create } from 'zustand'
import type { Player, RoomStatus } from '../types'

export interface RoomState {
  roomId: string | null
  roomCode: string | null
  players: Player[]
  roomStatus: RoomStatus
  setRoomId: (id: string | null) => void
  setRoomCode: (code: string | null) => void
  setPlayers: (players: Player[]) => void
  addPlayer: (player: Player) => void
  removePlayer: (userId: string) => void
  setRoomStatus: (status: RoomStatus) => void
  resetRoom: () => void
}

export const useRoomStore = create<RoomState>((set) => ({
  roomId: null,
  roomCode: null,
  players: [],
  roomStatus: 'waiting',
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
  resetRoom: () =>
    set({
      roomId: null,
      roomCode: null,
      players: [],
      roomStatus: 'waiting',
    }),
}))
