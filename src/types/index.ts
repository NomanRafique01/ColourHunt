export type RoomStatus = 'waiting' | 'in_round' | 'reviewing' | 'finished' | 'abandoned';
export type PlayerStatus = 'active' | 'disconnected' | 'left';
export type RoundStatus = 'active' | 'paused' | 'finished' | 'no_winner';
export type SubmissionStatus = 'pending' | 'approved' | 'rejected' | 'deleted';

export interface Profile {
  id: string;
  displayName: string;
  avatarUrl: string | null;
  isAnonymous: boolean;
  gamesPlayed: number;
  gamesWon: number;
  bestScore: number;
  createdAt: string;
  updatedAt: string;
}

export interface Room {
  id: string;
  code: string;
  hostId: string;
  status: RoomStatus;
  maxPlayers: number;
  createdAt: string;
  updatedAt: string;
}

export interface Player {
  id: string;
  roomId: string;
  userId: string;
  displayName: string;
  assignedColor: string | null;
  isHost: boolean;
  status: PlayerStatus;
  joinedAt: string;
  lastSeenAt: string;
}

export interface Round {
  id: string;
  roomId: string;
  roundNumber: number;
  status: RoundStatus;
  timeLimitSeconds: number;
  remainingSeconds: number;
  startedAt: string;
  resumedAt: string;
  pausedAt: string | null;
  endedAt: string | null;
  winnerPlayerId: string | null;
}

export interface Submission {
  id: string;
  roundId: string;
  playerId: string;
  storagePath: string;
  matchScore: number | null;
  status: SubmissionStatus;
  submittedAt: string;
  reviewedAt: string | null;
  attemptNumber: number;
}

// RPC Response Interfaces
export interface BaseRpcResult {
  success: boolean;
  error?: string;
}

export interface CreateRoomResult extends BaseRpcResult {
  room_id?: string;
  code?: string;
  player_id?: string;
}

export interface JoinRoomResult extends BaseRpcResult {
  room_id?: string;
  code?: string;
  player_id?: string;
  is_host?: boolean;
}

export interface StartRoundResult extends BaseRpcResult {
  round_id?: string;
  round_number?: number;
  time_limit_seconds?: number;
}

export interface SubmitHuntResult extends BaseRpcResult {
  submission_id?: string;
  attempt_number?: number;
  auto_paused?: boolean;
  finished_count?: number;
  total_active_count?: number;
}

export interface ReviewSubmissionResult extends BaseRpcResult {
  decision?: 'approved' | 'rejected';
  winner_player_id?: string;
  room_status?: RoomStatus;
  more_pending?: boolean;
  resumed?: boolean;
  remaining_seconds?: number;
}

export interface LeaveRoomResult extends BaseRpcResult {
  room_status?: RoomStatus;
  remaining_players?: number;
  new_host_id?: string;
}
