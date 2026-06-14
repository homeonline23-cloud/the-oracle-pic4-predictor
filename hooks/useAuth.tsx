'use client';

import { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { createClient, resetBrowserClient } from '@/lib/supabase/client';
import { authCallbackUrl, getAppOrigin } from '@/lib/appOrigin';
import { LEGACY_ADMIN_BYPASS_KEY, MOCK_OWNER_SESSION_KEY } from '@/lib/constants';
import { isAdminEmail } from '@/lib/gridAccess';

export interface Profile {
  id: string;
  full_name: string | null;
  subscription_tier: string | null;
  subscription_status: string | null;
  predictions_limit: number;
  predictions_used: number;
  grids_limit: number;
  grids_used: number;
  created_at: string;
  [key: string]: unknown;
}

export interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  userRole: string | null;
  signOut: () => Promise<void>;
  signInWithGoogle: (nextPath?: string) => Promise<void>;
  signInWithMagicLink: (email: string) => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  sendPasswordResetEmail: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  profile: null,
  loading: true,
  userRole: null,
  signOut: async () => {},
  signInWithGoogle: async () => {},
  signInWithMagicLink: async () => {},
  signInWithEmail: async () => {},
  signUp: async () => {},
  sendPasswordResetEmail: async () => {},
});

function clearLegacyBypassStorage() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(MOCK_OWNER_SESSION_KEY);
  localStorage.removeItem(LEGACY_ADMIN_BYPASS_KEY);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchProfile = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (!error && data) {
        setProfile(data as Profile);
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
    }
  }, [supabase]);

  useEffect(() => {
    let cancelled = false;
    let subscription: { unsubscribe: () => void } | null = null;

    void (async () => {
      try {
        if (typeof window === 'undefined') return;

        clearLegacyBypassStorage();

        const {
          data: { session: initialSession },
        } = await supabase.auth.getSession();
        if (cancelled) return;

        setSession(initialSession);
        setUser(initialSession?.user ?? null);
        if (initialSession?.user) {
          await fetchProfile(initialSession.user.id);
        }
        if (!cancelled) setLoading(false);

        const {
          data: { subscription: sub },
        } = supabase.auth.onAuthStateChange(async (_event, session) => {
          if (cancelled) return;

          setSession(session);
          setUser(session?.user ?? null);
          if (session?.user) {
            await fetchProfile(session.user.id);
          } else {
            setProfile(null);
          }
          if (!cancelled) setLoading(false);
        });
        subscription = sub;
      } catch (err) {
        console.error('Auth init error:', err);
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
      subscription?.unsubscribe();
    };
  }, [supabase, fetchProfile]);

  const signUp = async (email: string, password: string, fullName: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: authCallbackUrl(),
      },
    });
    if (error) throw error;
  };

  const signInWithGoogle = async (nextPath?: string) => {
    const fromUrl =
      typeof window !== 'undefined'
        ? new URLSearchParams(window.location.search).get('next')
        : null;
    const next = nextPath ?? fromUrl;
    const redirectTo = authCallbackUrl(next);
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo, skipBrowserRedirect: true },
    });
    if (error) {
      console.error('Google Sign-In Error:', error);
      throw error;
    }
    if (data?.url) {
      window.location.assign(data.url);
    }
  };

  useEffect(() => {
    const handleAuthMessage = (event: MessageEvent) => {
      if (event.data?.type === 'OAUTH_AUTH_SUCCESS') {
        supabase.auth.getSession().then(({ data: { session } }) => {
          setSession(session);
          setUser(session?.user ?? null);
          if (session?.user) fetchProfile(session.user.id);
        });
      }
    };

    window.addEventListener('message', handleAuthMessage);
    return () => window.removeEventListener('message', handleAuthMessage);
  }, [supabase.auth, fetchProfile]);

  const signInWithMagicLink = async (email: string) => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: authCallbackUrl(),
      },
    });
    if (error) throw error;
  };

  const signInWithEmail = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
  };

  const sendPasswordResetEmail = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${getAppOrigin(typeof window !== 'undefined' ? window.location.origin : undefined)}/auth/reset-password`,
    });
    if (error) throw error;
  };

  const signOut = async () => {
    clearLegacyBypassStorage();
    await supabase.auth.signOut();
    resetBrowserClient();
    window.location.href = '/';
  };

  const userRole =
    isAdminEmail(user?.email)
      ? 'admin'
      : (profile?.subscription_tier || 'free');

  return (
    <AuthContext.Provider value={{ 
      user, 
      session, 
      profile, 
      loading, 
      userRole,
      signOut, 
      signInWithGoogle, 
      signInWithMagicLink,
      signInWithEmail,
      signUp,
      sendPasswordResetEmail,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
