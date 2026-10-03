export type RoomStatus = 'waiting' | 'in_round' | 'reviewing' | 'finished' | 'abandoned'
export type RoundStatus = 'active' | 'paused' | 'finished' | 'no_winner'
export type SubmissionStatus = 'pending' | 'approved' | 'rejected' | 'deleted'

export interface Room {
  id: string
  code: string
  hostId: string
  status: RoomStatus
  maxPlayers: number
  createdAt: string
  updatedAt: string
}

export interface Player {
  id: string
  roomId: string
  userId: string
  displayName: string
  assignedColor: string | null
  isHost: boolean
  joinedAt: string
}

export interface Round {
  id: string
  roomId: string
  roundNumber: number
  status: RoundStatus
  timeLimitSeconds: number
  remainingSeconds: number
  startedAt: string
  pausedAt: string | null
  endedAt: string | null
  winnerPlayerId: string | null
}

export interface Submission {
  id: string
  roundId: string
  playerId: string
  storagePath: string
  matchScore: number | null
  status: SubmissionStatus
  submittedAt: string
  reviewedAt: string | null
  attemptNumber: number
}
