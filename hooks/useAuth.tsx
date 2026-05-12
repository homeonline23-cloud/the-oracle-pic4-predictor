'use client';

import { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';
import { ADMIN_EMAIL, LEGACY_ADMIN_BYPASS_KEY, MOCK_OWNER_SESSION_KEY } from '@/lib/constants';

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
  signInWithGoogle: () => Promise<string | void>;
  forceAdminBypass: () => void;
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
  signInWithGoogle: async () => undefined,
  forceAdminBypass: () => {},
  signInWithMagicLink: async () => {},
  signInWithEmail: async () => {},
  signUp: async () => {},
  sendPasswordResetEmail: async () => {},
});

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

    const mockUser = {
      id: 'admin-bypass-id',
      email: ADMIN_EMAIL,
      user_metadata: { full_name: 'Master Oracle Admin' },
    } as unknown as User;

    const mockProfile: Profile = {
      id: 'admin-bypass-id',
      full_name: 'Master Oracle Admin',
      subscription_tier: 'admin',
      subscription_status: 'active',
      predictions_limit: 99999,
      predictions_used: 0,
      grids_limit: 99999,
      grids_used: 0,
      created_at: new Date().toISOString(),
    };

    void (async () => {
      try {
        if (typeof window === 'undefined') return;

        const searchParams = new URLSearchParams(window.location.search);
        const bypassKey = searchParams.get('oracle_key');
        const envBypassKey = process.env.NEXT_PUBLIC_ADMIN_BYPASS_KEY || 'visionary';
        const mockOwnerActive =
          bypassKey === envBypassKey ||
          localStorage.getItem(MOCK_OWNER_SESSION_KEY) === 'true';

        if (mockOwnerActive) {
          localStorage.setItem(MOCK_OWNER_SESSION_KEY, 'true');
          localStorage.removeItem(LEGACY_ADMIN_BYPASS_KEY);
          if (cancelled) return;
          setSession(null);
          setUser(mockUser);
          setProfile(mockProfile);
          setLoading(false);
          return;
        }

        // Legacy flag used to skip the real JWT after Google login — remove so refresh keeps session
        localStorage.removeItem(LEGACY_ADMIN_BYPASS_KEY);

        const {
          data: { session: initialSession },
        } = await supabase.auth.getSession();
        if (cancelled) return;

        setSession(initialSession);
        setUser(initialSession?.user ?? null);
        if (initialSession?.user) {
          void fetchProfile(initialSession.user.id);
        }
        setLoading(false);

        const {
          data: { subscription: sub },
        } = supabase.auth.onAuthStateChange((_event, session) => {
          if (cancelled) return;

          if (
            localStorage.getItem(MOCK_OWNER_SESSION_KEY) === 'true' &&
            !session?.user
          ) {
            setLoading(false);
            return;
          }

          setSession(session);
          setUser(session?.user ?? null);
          if (session?.user) {
            void fetchProfile(session.user.id);
          } else {
            setProfile(null);
          }
          setLoading(false);
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
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) throw error;
  };

  const forceAdminBypass = () => {
    localStorage.setItem(MOCK_OWNER_SESSION_KEY, 'true');
    localStorage.removeItem(LEGACY_ADMIN_BYPASS_KEY);
    window.location.reload();
  };

  const signInWithGoogle = async () => {
    try {
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      
      const width = 600;
      const height = 700;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;
      
      // Open window synchronously before any async call to prevent popup blocker
      let popup: Window | null = null;
      
      if (isMobile) {
         popup = window.open('', '_blank');
      } else {
         popup = window.open(
           '',
           'google-signin',
           `width=${width},height=${height},left=${left},top=${top}`
         );
      }
      
      if (popup) {
         popup.document.write('<p>Loading...</p>');
      }
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          skipBrowserRedirect: true,
        },
      });

      if (error) {
        if (popup) popup.close();
        throw error;
      }
      
      if (data?.url) {
        if (popup) {
          popup.location.href = data.url;
        } else {
          console.warn('Popup blocked, returning URL for manual interaction');
          return data.url;
        }
      }
    } catch (error) {
      console.error('Google Sign-In Error:', error);
      throw error;
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
        emailRedirectTo: `${window.location.origin}/auth/callback`,
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
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });
    if (error) throw error;
  };

  const signOut = async () => {
    localStorage.removeItem(MOCK_OWNER_SESSION_KEY);
    localStorage.removeItem(LEGACY_ADMIN_BYPASS_KEY);
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  const isMockOwnerSession =
    typeof window !== 'undefined' &&
    localStorage.getItem(MOCK_OWNER_SESSION_KEY) === 'true';

  const userRole =
    user?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase() || isMockOwnerSession
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
      forceAdminBypass,
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
