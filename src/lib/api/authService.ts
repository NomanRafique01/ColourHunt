import * as WebBrowser from 'expo-web-browser'
import * as AuthSession from 'expo-auth-session'
import { supabase } from '../supabase'
import { Profile } from '../../types'

// Required for iOS to properly close the auth browser session
WebBrowser.maybeCompleteAuthSession()


export interface AuthResponse {
  success: boolean;
  user?: any;
  profile?: Profile | null;
  error?: string;
}

/**
 * Initializes the auth session on app launch.
 * If no session exists, it does not throw; returns user if found.
 */
export async function getActiveSession(): Promise<AuthResponse> {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) {
      return { success: false, error: error.message };
    }
    if (!session?.user) {
      return { success: true, user: null, profile: null };
    }

    const profile = await fetchProfile(session.user.id);
    return { success: true, user: session.user, profile };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to check session' };
  }
}

/**
 * Signs in anonymously (Guest play).
 * Sets or updates display name in public.profiles.
 */
export async function signInAsGuest(displayName: string): Promise<AuthResponse> {
  try {
    const trimmedName = displayName.trim().slice(0, 16);
    if (!trimmedName) {
      return { success: false, error: 'Display name is required' };
    }

    const { data, error } = await supabase.auth.signInAnonymously({
      options: {
        data: { display_name: trimmedName },
      },
    });

    if (error || !data.user) {
      return { success: false, error: error?.message || 'Failed to sign in as guest' };
    }

    // Upsert profile record with chosen display name
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: data.user.id,
        display_name: trimmedName,
        is_anonymous: true,
        updated_at: new Date().toISOString(),
      });

    if (profileError) {
      console.warn('Profile upsert warning:', profileError.message);
    }

    const profile = await fetchProfile(data.user.id);
    return { success: true, user: data.user, profile };
  } catch (err: any) {
    return { success: false, error: err.message || 'Guest sign-in error' };
  }
}

/**
 * Sign Up with permanent email and password.
 */
export async function signUpWithEmail(
  email: string,
  pass: string,
  displayName: string
): Promise<AuthResponse> {
  try {
    const trimmedName = displayName.trim().slice(0, 16);
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password: pass,
      options: {
        data: { display_name: trimmedName },
      },
    });

    if (error || !data.user) {
      return { success: false, error: error?.message || 'Sign up failed' };
    }

    await supabase.from('profiles').upsert({
      id: data.user.id,
      display_name: trimmedName,
      is_anonymous: false,
      updated_at: new Date().toISOString(),
    });

    const profile = await fetchProfile(data.user.id);
    return { success: true, user: data.user, profile };
  } catch (err: any) {
    return { success: false, error: err.message || 'Sign up error' };
  }
}

/**
 * Sign In with existing email and password.
 */
export async function signInWithEmail(email: string, pass: string): Promise<AuthResponse> {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: pass,
    });

    if (error || !data.user) {
      return { success: false, error: error?.message || 'Sign in failed' };
    }

    const profile = await fetchProfile(data.user.id);
    return { success: true, user: data.user, profile };
  } catch (err: any) {
    return { success: false, error: err.message || 'Sign in error' };
  }
}

/**
 * Converts an active Guest session into a permanent email/password account.
 * Retains all match history, stats, and user ID.
 */
export async function linkGuestAccount(email: string, pass: string): Promise<AuthResponse> {
  try {
    const { data, error } = await supabase.auth.updateUser({
      email: email.trim(),
      password: pass,
    });

    if (error || !data.user) {
      return { success: false, error: error?.message || 'Account upgrade failed' };
    }

    await supabase
      .from('profiles')
      .update({ is_anonymous: false, updated_at: new Date().toISOString() })
      .eq('id', data.user.id);

    const profile = await fetchProfile(data.user.id);
    return { success: true, user: data.user, profile };
  } catch (err: any) {
    return { success: false, error: err.message || 'Account linking error' };
  }
}

/**
 * Signs out and clears session.
 */
export async function signOut(): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Fetches user profile stats.
 */
export async function fetchProfile(userId: string): Promise<Profile | null> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error || !data) return null;

    return {
      id: data.id,
      displayName: data.display_name,
      avatarUrl: data.avatar_url,
      isAnonymous: data.is_anonymous,
      gamesPlayed: data.games_played,
      gamesWon: data.games_won,
      bestScore: Number(data.best_score || 0),
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  } catch {
    return null;
  }
}

/**
 * Sign in with Google via Supabase OAuth.
 * Opens the system browser, waits for the redirect, then exchanges the
 * auth code for a Supabase session.
 *
 * Requires:
 *  - Google provider enabled in Supabase Dashboard
 *  - `scheme: "colourhunt"` set in app.json
 */
export async function signInWithGoogle(): Promise<AuthResponse> {
  try {
    const redirectUri = AuthSession.makeRedirectUri({ scheme: 'colourhunt' })

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUri,
        skipBrowserRedirect: true,
      },
    })

    if (error || !data.url) {
      return { success: false, error: error?.message || 'Failed to initiate Google sign-in' }
    }

    // Open the OAuth URL in the system browser and wait for redirect
    const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUri)

    if (result.type === 'cancel' || result.type === 'dismiss') {
      return { success: false, error: 'Google sign-in was cancelled' }
    }

    if (result.type !== 'success') {
      return { success: false, error: 'Google sign-in failed' }
    }

    // Extract the auth code from the redirect URL
    const url = new URL(result.url)
    const code = url.searchParams.get('code')

    if (!code) {
      // Some Supabase setups return tokens in hash fragment (implicit flow)
      const hashParams = new URLSearchParams(url.hash.replace('#', ''))
      const accessToken = hashParams.get('access_token')
      const refreshToken = hashParams.get('refresh_token')

      if (accessToken && refreshToken) {
        const { data: sessionData, error: sessionError } =
          await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken })

        if (sessionError || !sessionData.user) {
          return { success: false, error: sessionError?.message || 'Session setup failed' }
        }

        await upsertGoogleProfile(sessionData.user)
        const profile = await fetchProfile(sessionData.user.id)
        return { success: true, user: sessionData.user, profile }
      }

      return { success: false, error: 'No auth code received from Google' }
    }

    // Exchange code for session (PKCE flow)
    const { data: sessionData, error: sessionError } =
      await supabase.auth.exchangeCodeForSession(code)

    if (sessionError || !sessionData.user) {
      return { success: false, error: sessionError?.message || 'Session exchange failed' }
    }

    await upsertGoogleProfile(sessionData.user)
    const profile = await fetchProfile(sessionData.user.id)
    return { success: true, user: sessionData.user, profile }
  } catch (err: any) {
    return { success: false, error: err.message || 'Google sign-in error' }
  }
}

/** Upserts the profile row for a Google-authenticated user */
async function upsertGoogleProfile(user: any): Promise<void> {
  const displayName =
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    user.email?.split('@')[0] ||
    'Hunter'

  await supabase.from('profiles').upsert({
    id: user.id,
    display_name: displayName.slice(0, 16),
    avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture || null,
    is_anonymous: false,
    updated_at: new Date().toISOString(),
  })
}
