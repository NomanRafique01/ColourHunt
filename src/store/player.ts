import { create } from 'zustand'

export interface PlayerState {
  userId: string | null
  displayName: string
  assignedColor: string | null
  submissionCount: number
  isHost: boolean
  setUserId: (userId: string | null) => void
  setDisplayName: (name: string) => void
  setAssignedColor: (color: string | null) => void
  incrementSubmissionCount: () => void
  resetSubmissionCount: () => void
  setIsHost: (isHost: boolean) => void
  resetPlayer: () => void
}

export const usePlayerStore = create<PlayerState>((set) => ({
  userId: null,
  displayName: '',
  assignedColor: null,
  submissionCount: 0,
  isHost: false,
  setUserId: (userId) => set({ userId }),
  setDisplayName: (displayName) => set({ displayName }),
  setAssignedColor: (assignedColor) => set({ assignedColor }),
  incrementSubmissionCount: () =>
    set((state) => ({ submissionCount: state.submissionCount + 1 })),
  resetSubmissionCount: () => set({ submissionCount: 0 }),
  setIsHost: (isHost) => set({ isHost }),
  resetPlayer: () =>
    set({
      userId: null,
      displayName: '',
      assignedColor: null,
      submissionCount: 0,
      isHost: false,
    }),
}))
