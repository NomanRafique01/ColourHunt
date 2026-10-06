import { supabase } from '../supabase';
import { Profile } from '../../types';

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
