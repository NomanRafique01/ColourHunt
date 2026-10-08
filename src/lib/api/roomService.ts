import { supabase } from '../supabase';
import {
  CreateRoomResult,
  JoinRoomResult,
  LeaveRoomResult,
  Player,
  Room,
} from '../../types';

/**
 * Creates a new game room via atomic RPC.
 */
export async function createRoom(
  displayName: string,
  maxPlayers: number = 4
): Promise<CreateRoomResult> {
  try {
    const { data, error } = await supabase.rpc('create_room', {
      p_display_name: displayName.trim(),
      p_max_players: maxPlayers,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return data as CreateRoomResult;
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to create room' };
  }
}

/**
 * Joins an existing game room using room code via atomic RPC.
 */
export async function joinRoom(
  code: string,
  displayName: string
): Promise<JoinRoomResult> {
  try {
    const { data, error } = await supabase.rpc('join_room', {
      p_code: code.trim().toUpperCase(),
      p_display_name: displayName.trim(),
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return data as JoinRoomResult;
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to join room' };
  }
}

/**
 * Leaves a game room with automatic host migration if host leaves.
 */
export async function leaveRoom(roomId: string): Promise<LeaveRoomResult> {
  try {
    const { data, error } = await supabase.rpc('player_leave_room', {
      p_room_id: roomId,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return data as LeaveRoomResult;
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to leave room' };
  }
}

/**
 * Fetches current room record.
 */
export async function getRoomDetails(roomId: string): Promise<Room | null> {
  try {
    const { data, error } = await supabase
      .from('rooms')
      .select('*')
      .eq('id', roomId)
      .maybeSingle();

    if (error || !data) return null;

    return {
      id: data.id,
      code: data.code,
      hostId: data.host_id,
      status: data.status,
      maxPlayers: data.max_players,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  } catch {
    return null;
  }
}

/**
 * Fetches all players in a room.
 */
export async function getRoomPlayers(roomId: string): Promise<Player[]> {
  try {
    const { data, error } = await supabase
      .from('players')
      .select('*')
      .eq('room_id', roomId)
      .neq('status', 'left')
      .order('joined_at', { ascending: true });

    if (error || !data) return [];

    return data.map((p) => ({
      id: p.id,
      roomId: p.room_id,
      userId: p.user_id,
      displayName: p.display_name,
      assignedColor: p.assigned_color,
      isHost: p.is_host,
      status: p.status,
      joinedAt: p.joined_at,
      lastSeenAt: p.last_seen_at,
    }));
  } catch {
    return [];
  }
}

/**
 * Subscribes to realtime updates for a room and its player roster.
 */
export function subscribeToRoom(
  roomId: string,
  onRoomChange: (room: Room) => void,
  onPlayersChange: () => void
) {
  const channel = supabase
    .channel(`room:${roomId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'rooms',
        filter: `id=eq.${roomId}`,
      },
      (payload) => {
        if (payload.new && 'id' in payload.new) {
          const r = payload.new as any;
          onRoomChange({
            id: r.id,
            code: r.code,
            hostId: r.host_id,
            status: r.status,
            maxPlayers: r.max_players,
            createdAt: r.created_at,
            updatedAt: r.updated_at,
          });
        }
      }
    )
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'players',
        filter: `room_id=eq.${roomId}`,
      },
      () => {
        onPlayersChange();
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
