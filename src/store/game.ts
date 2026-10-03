import { create } from 'zustand'
import { TIME_LIMIT_SECONDS } from '../constants/game'
import type { Submission } from '../types'

export interface GameState {
  roundNumber: number
  remainingSeconds: number
  isPaused: boolean
  submissionQueue: Submission[]
  currentReviewSubmission: Submission | null
  winnerPlayerId: string | null
  setRoundNumber: (roundNumber: number) => void
  setRemainingSeconds: (seconds: number) => void
  decrementTimer: () => void
  setIsPaused: (isPaused: boolean) => void
  setSubmissionQueue: (queue: Submission[]) => void
  enqueueSubmission: (submission: Submission) => void
  dequeueSubmission: () => Submission | null
  setCurrentReviewSubmission: (submission: Submission | null) => void
  setWinnerPlayerId: (id: string | null) => void
  resetGame: () => void
}

export const useGameStore = create<GameState>((set, get) => ({
  roundNumber: 1,
  remainingSeconds: TIME_LIMIT_SECONDS,
  isPaused: false,
  submissionQueue: [],
  currentReviewSubmission: null,
  winnerPlayerId: null,
  setRoundNumber: (roundNumber) => set({ roundNumber }),
  setRemainingSeconds: (remainingSeconds) => set({ remainingSeconds }),
  decrementTimer: () =>
    set((state) => ({
      remainingSeconds: Math.max(0, state.remainingSeconds - 1),
    })),
  setIsPaused: (isPaused) => set({ isPaused }),
  setSubmissionQueue: (submissionQueue) => set({ submissionQueue }),
  enqueueSubmission: (submission) =>
    set((state) => ({
      submissionQueue: [...state.submissionQueue, submission],
    })),
  dequeueSubmission: () => {
    const queue = get().submissionQueue
    if (queue.length === 0) return null
    const [first, ...rest] = queue
    set({ submissionQueue: rest, currentReviewSubmission: first })
    return first
  },
  setCurrentReviewSubmission: (currentReviewSubmission) =>
    set({ currentReviewSubmission }),
  setWinnerPlayerId: (winnerPlayerId) => set({ winnerPlayerId }),
  resetGame: () =>
    set({
      roundNumber: 1,
      remainingSeconds: TIME_LIMIT_SECONDS,
      isPaused: false,
      submissionQueue: [],
      currentReviewSubmission: null,
      winnerPlayerId: null,
    }),
}))
