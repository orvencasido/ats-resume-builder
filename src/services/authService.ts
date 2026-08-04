import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { UserProfile } from '../types';

const LOCAL_STORAGE_USER_KEY = 'ats_builder_demo_user';

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
}

export const authService = {
  async getCurrentUser(): Promise<AuthUser | null> {
    if (isSupabaseConfigured) {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error || !session?.user) return null;
      
      // Fetch profile for full name
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', session.user.id)
        .single();

      return {
        id: session.user.id,
        email: session.user.email || '',
        fullName: profile?.full_name || session.user.user_metadata?.full_name || 'User',
      };
    } else {
      // Local fallback mode user
      const saved = localStorage.getItem(LOCAL_STORAGE_USER_KEY);
      if (saved) {
        try {
          return JSON.parse(saved) as AuthUser;
        } catch {
          return null;
        }
      }
      return null;
    }
  },

  async signUp(fullName: string, email: string, password: string): Promise<{ user: AuthUser | null; error: string | null }> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
        },
      });

      if (error) return { user: null, error: error.message };
      if (!data.user) return { user: null, error: 'Registration failed. Please try again.' };

      // Ensure profile row exists
      await supabase.from('profiles').upsert({
        id: data.user.id,
        full_name: fullName,
        updated_at: new Date().toISOString(),
      });

      const user: AuthUser = {
        id: data.user.id,
        email: data.user.email || email,
        fullName,
      };

      return { user, error: null };
    } else {
      // Local demo auth registration
      const user: AuthUser = {
        id: 'demo-user-' + Date.now(),
        email,
        fullName,
      };
      localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(user));
      return { user, error: null };
    }
  },

  async signIn(email: string, password: string): Promise<{ user: AuthUser | null; error: string | null }> {
    if (isSupabaseConfigured) {
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
        .single();

      const fullName = profile?.full_name || data.user.user_metadata?.full_name || email.split('@')[0];

      const user: AuthUser = {
        id: data.user.id,
        email: data.user.email || email,
        fullName,
      };

      return { user, error: null };
    } else {
      // Local demo sign in
      const user: AuthUser = {
        id: 'demo-user-1',
        email,
        fullName: email.split('@')[0] || 'Demo User',
      };
      localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(user));
      return { user, error: null };
    }
  },

  async signOut(): Promise<void> {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    } else {
      localStorage.removeItem(LOCAL_STORAGE_USER_KEY);
    }
  },

  async resetPassword(email: string): Promise<{ success: boolean; error: string | null }> {
    if (isSupabaseConfigured) {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) return { success: false, error: error.message };
      return { success: true, error: null };
    } else {
      return { success: true, error: null };
    }
  },

  async updatePassword(newPassword: string): Promise<{ success: boolean; error: string | null }> {
    if (isSupabaseConfigured) {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) return { success: false, error: error.message };
      return { success: true, error: null };
    } else {
      return { success: true, error: null };
    }
  }
};
