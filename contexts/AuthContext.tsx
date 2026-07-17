'use client';

/**
 * AuthContext — gerencia sessão Supabase e perfil do usuário.
 * Disponível em toda a árvore via <AuthProvider>.
 */

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

// ── Tipos ─────────────────────────────────────────────────────────────────────

export interface Profile {
  nick:       string | null;
  role:       'torcedor' | 'staff';
}

interface AuthState {
  user:       User | null;
  session:    Session | null;
  profile:    Profile | null;
  loading:    boolean;
  isLoggedIn: boolean;
  isStaff:    boolean;
}

interface AuthContextValue extends AuthState {
  signIn:  (email: string, password: string, captchaToken?: string) => Promise<void>;
  signUp:  (email: string, password: string, nick: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateNick: (nick: string) => Promise<void>;
}

// ── Context ───────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null);

// ── Provider ──────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user:       null,
    session:    null,
    profile:    null,
    loading:    true,
    isLoggedIn: false,
    isStaff:    false,
  });

  // Carrega perfil do Supabase depois de obter o user
  const loadProfile = useCallback(async (userId: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('nick, role')
      .eq('id', userId)
      .single();
    return data as Profile | null;
  }, []);

  const applySession = useCallback(async (session: Session | null) => {
    if (!session?.user) {
      setState({
        user: null, session: null, profile: null,
        loading: false, isLoggedIn: false, isStaff: false,
      });
      return;
    }
    const profile = await loadProfile(session.user.id);
    setState({
      user:       session.user,
      session,
      profile,
      loading:    false,
      isLoggedIn: true,
      isStaff:    profile?.role === 'staff',
    });
  }, [loadProfile]);

  // Inicializa — obtém sessão existente e escuta mudanças
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      applySession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      applySession(session);
    });

    return () => subscription.unsubscribe();
  }, [applySession]);

  // ── Ações ────────────────────────────────────────────────────────────────────

  const signIn = useCallback(async (email: string, password: string, captchaToken?: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
      options: captchaToken ? { captchaToken } : undefined,
    });
    if (error) throw error;
    // applySession é chamado automaticamente pelo onAuthStateChange
  }, []);

  const signUp = useCallback(async (email: string, password: string, nick: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { nick } },  // vai pro trigger handle_new_user
    });
    if (error) throw error;
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  const updateNick = useCallback(async (nick: string) => {
    if (!state.user) return;
    await supabase.from('profiles').update({ nick }).eq('id', state.user.id);
    setState(s => s.profile ? { ...s, profile: { ...s.profile, nick } } : s);
  }, [state.user]);

  return (
    <AuthContext.Provider value={{ ...state, signIn, signUp, signOut, updateNick }}>
      {children}
    </AuthContext.Provider>
  );
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth deve ser usado dentro de <AuthProvider>');
  return ctx;
}
