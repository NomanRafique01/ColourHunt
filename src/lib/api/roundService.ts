import { supabase } from '../supabase';
import { Round, StartRoundResult } from '../../types';

/**
 * Starts a new round via atomic RPC (Host only).
 * Shuffles colors and inserts new round.
 */
export async function startRound(
  roomId: string,
  timeLimitSeconds: number = 60
): Promise<StartRoundResult> {
  try {
    const { data, error } = await supabase.rpc('start_round', {
      p_room_id: roomId,
      p_time_limit_seconds: timeLimitSeconds,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return data as StartRoundResult;
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to start round' };
  }
}

/**
 * Fetches the active round for a room.
 */
export async function getActiveRound(roomId: string): Promise<Round | null> {
  try {
    const { data, error } = await supabase
      .from('rounds')
      .select('*')
      .eq('room_id', roomId)
      .order('started_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error || !data) return null;

    return mapRoundRecord(data);
  } catch {
    return null;
  }
}

/**
 * Calculates current remaining countdown seconds.
 * If status is paused, returns frozen remainingSeconds.
 * If status is active, decrements based on elapsed time from resumedAt.
 */
export function calculateRemainingSeconds(round: Round): number {
  if (round.status === 'paused') {
    return round.remainingSeconds;
  }
  if (round.status !== 'active') {
    return 0;
  }

  const resumedTime = new Date(round.resumedAt).getTime();
  const nowTime = Date.now();
  const elapsedSec = Math.floor((nowTime - resumedTime) / 1000);
  return Math.max(0, round.remainingSeconds - elapsedSec);
}

/**
 * Subscribes to realtime updates for a round.
 */
export function subscribeToRound(
  roundId: string,
  onRoundChange: (round: Round) => void
) {
  const channel = supabase
    .channel(`round:${roundId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'rounds',
        filter: `id=eq.${roundId}`,
      },
      (payload) => {
        if (payload.new && 'id' in payload.new) {
          onRoundChange(mapRoundRecord(payload.new));
        }
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

function mapRoundRecord(data: any): Round {
  return {
    id: data.id,
    roomId: data.room_id,
    roundNumber: data.round_number,
    status: data.status,
    timeLimitSeconds: data.time_limit_seconds,
    remainingSeconds: data.remaining_seconds,
    startedAt: data.started_at,
    resumedAt: data.resumed_at || data.started_at,
    pausedAt: data.paused_at,
    endedAt: data.ended_at,
    winnerPlayerId: data.winner_player_id,
  };
}
