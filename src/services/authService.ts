import { supabase, isSupabaseConfigured } from '../lib/supabase';

const getAppUrl = () => {
  const configuredUrl = import.meta.env.VITE_APP_URL?.trim();
  const baseUrl = configuredUrl || window.location.origin;
  return baseUrl.replace(/\/$/, '');
};

const getAuthRedirectUrl = (path = '') => `${getAppUrl()}${path}`;

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  isGuest?: boolean;
}

export const authService = {
  async getCurrentUser(): Promise<AuthUser | null> {
    if (!isSupabaseConfigured) return null;

    const { data: { session }, error } = await supabase.auth.getSession();
    if (error || !session?.user) return null;

    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', session.user.id)
      .maybeSingle();

    return {
      id: session.user.id,
      email: session.user.email || '',
      fullName: profile?.full_name || session.user.user_metadata?.full_name || 'User',
    };
  },

  async signUp(fullName: string, email: string, password: string): Promise<{ user: AuthUser | null; error: string | null }> {
    if (!isSupabaseConfigured) {
      return { user: null, error: 'Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to enable accounts.' };
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: getAuthRedirectUrl(),
      },
    });

    if (error) return { user: null, error: error.message };
    if (!data.user) return { user: null, error: 'Registration failed. Please try again.' };

    await supabase.from('profiles').upsert({
      id: data.user.id,
      email: data.user.email || email,
      full_name: fullName,
      updated_at: new Date().toISOString(),
    });

    if (data.session) {
      await supabase.auth.signOut();
    }

    return { user: null, error: null };
  },

  async signIn(email: string, password: string): Promise<{ user: AuthUser | null; error: string | null }> {
    if (!isSupabaseConfigured) {
      return { user: null, error: 'Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to enable sign in.' };
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) return { user: null, error: error.message };
    if (!data.user) return { user: null, error: 'Login failed. Invalid credentials.' };

    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', data.user.id)
      .maybeSingle();

    const fullName = profile?.full_name || data.user.user_metadata?.full_name || email.split('@')[0];

    const user: AuthUser = {
      id: data.user.id,
      email: data.user.email || email,
      fullName,
    };

    return { user, error: null };
  },

  signInAsGuest(): AuthUser {
    return {
      id: `guest-${crypto.randomUUID()}`,
      email: '',
      fullName: 'Guest',
      isGuest: true,
    };
  },

  async signOut(): Promise<void> {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
  },

  async resetPassword(email: string): Promise<{ success: boolean; error: string | null }> {
    if (!isSupabaseConfigured) {
      return { success: false, error: 'Supabase is not configured. Password reset is unavailable.' };
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: getAuthRedirectUrl('/reset-password'),
    });

    if (error) return { success: false, error: error.message };
    return { success: true, error: null };
  },

  async preparePasswordReset(): Promise<{ success: boolean; error: string | null }> {
    if (!isSupabaseConfigured) {
      return { success: false, error: 'Supabase is not configured. Password reset is unavailable.' };
    }

    const code = new URLSearchParams(window.location.search).get('code');
    if (code) {
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (error) return { success: false, error: error.message };
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) return { success: false, error: error.message };
    if (!session) return { success: false, error: 'Reset link is invalid or expired. Request a new password reset email.' };

    return { success: true, error: null };
  },

  async updatePassword(newPassword: string): Promise<{ success: boolean; error: string | null }> {
    if (!isSupabaseConfigured) {
      return { success: false, error: 'Supabase is not configured. Password update is unavailable.' };
    }

    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) return { success: false, error: error.message };
    await supabase.auth.signOut();
    return { success: true, error: null };
  }
};
