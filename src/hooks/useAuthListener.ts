import { useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { usePlayerStore } from '../store/player'
import { fetchProfile } from '../lib/api/authService'

/**
 * Mounts a Supabase auth state listener at the app root.
 *
 * Keeps the player store in sync with the Supabase session:
 * - SIGNED_IN  → populate userId, displayName, isAnonymous
 * - SIGNED_OUT → reset player state entirely
 * - TOKEN_REFRESHED → no-op (session auto-refreshes silently)
 *
 * Mount this once in App.tsx (or the root component).
 */
export function useAuthListener() {
  const setUserId = usePlayerStore((s) => s.setUserId)
  const setDisplayName = usePlayerStore((s) => s.setDisplayName)
  const setIsAnonymous = usePlayerStore((s) => s.setIsAnonymous)
  const resetPlayer = usePlayerStore((s) => s.resetPlayer)

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_OUT' || !session?.user) {
          resetPlayer()
          return
        }

        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
          const user = session.user
          const isAnon = user.is_anonymous ?? false

          // Try to get the display name from profile first, fall back to metadata
          const profile = await fetchProfile(user.id)
          const name =
            profile?.displayName ||
            user.user_metadata?.display_name ||
            user.user_metadata?.full_name ||
            'Hunter'

          setUserId(user.id)
          setDisplayName(name)
          setIsAnonymous(isAnon)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [setUserId, setDisplayName, setIsAnonymous, resetPlayer])
}
