import { supabase } from '../supabase';
import { PlayerStatus } from '../../types';

export interface PresenceUser {
  userId: string;
  onlineAt: string;
}

/**
 * Tracks player presence in a room.
 * Updates database connection status if player goes offline.
 */
export function trackRoomPresence(
  roomId: string,
  userId: string,
  onPresenceSync: (activeUserIds: string[]) => void,
  onHostDisconnected?: () => void
) {
  const channel = supabase.channel(`presence:room:${roomId}`, {
    config: {
      presence: {
        key: userId,
      },
    },
  });

  let hostGraceTimeout: any = null;

  channel
    .on('presence', { event: 'sync' }, () => {
      const state = channel.presenceState();
      const activeIds = Object.keys(state);
      onPresenceSync(activeIds);
    })
    .on('presence', { event: 'join' }, ({ key }) => {
      if (hostGraceTimeout) {
        clearTimeout(hostGraceTimeout);
        hostGraceTimeout = null;
      }
      syncPlayerConnection(roomId, 'active');
    })
    .on('presence', { event: 'leave' }, ({ key }) => {
      if (key === userId) {
        syncPlayerConnection(roomId, 'disconnected');
      }
    })
    .subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await channel.track({
          userId,
          onlineAt: new Date().toISOString(),
        });
        await syncPlayerConnection(roomId, 'active');
      }
    });

  return () => {
    if (hostGraceTimeout) clearTimeout(hostGraceTimeout);
    syncPlayerConnection(roomId, 'disconnected');
    channel.untrack();
    supabase.removeChannel(channel);
  };
}

/**
 * Updates player connection status in database via RPC.
 */
export async function syncPlayerConnection(
  roomId: string,
  status: 'active' | 'disconnected'
) {
  try {
    await supabase.rpc('sync_player_presence', {
      p_room_id: roomId,
      p_status: status,
    });
  } catch (err) {
    console.warn('Failed to sync presence status:', err);
  }
}
