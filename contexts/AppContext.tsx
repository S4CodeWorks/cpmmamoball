'use client';

import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { fetchBookmarkKeys, addBookmarkKey, removeBookmarkKey } from '@/lib/db';

type Theme = 'auto' | 'light' | 'dark';

interface ConfirmOptions {
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
}

interface AppContextValue {
  theme: Theme;
  setTheme: (t: Theme) => void;
  resolvedTheme: 'light' | 'dark';
  favClubs: Set<string>;
  toggleFav: (id: string) => void;
  notifs: Set<string>;
  toggleNotif: (id: string) => void;
  bookmarks: Set<string>;
  toggleBookmark: (id: string) => void;
  toast: string | null;
  showToast: (msg: string) => void;
  confirm: (opts: ConfirmOptions) => Promise<boolean>;
}

const AppCtx = createContext<AppContextValue | null>(null);

const CLUB_PREFIX = 'club:';
const LS_CLUBS = 'cpm_fav_clubs';
const LS_BOOKMARKS = 'cpm_bookmarks';

// Lê um array JSON do localStorage com segurança (SSR, JSON inválido, etc.)
function readLS(key: string): string[] {
  if (typeof window === 'undefined') return [];
  try { return JSON.parse(localStorage.getItem(key) || '[]'); } catch { return []; }
}
function writeLS(key: string, values: Set<string>) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify([...values]));
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('auto');
  const [systemDark, setSystemDark] = useState(false);

  useEffect(() => {
    setSystemDark(window.matchMedia('(prefers-color-scheme: dark)').matches);
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const fn = (e: MediaQueryListEvent) => setSystemDark(e.matches);
    mq.addEventListener('change', fn);
    return () => mq.removeEventListener('change', fn);
  }, []);

  const resolvedTheme: 'light' | 'dark' =
    theme === 'auto' ? (systemDark ? 'dark' : 'light') : theme;

  const [favClubs, setFavClubs] = useState<Set<string>>(new Set());
  const [notifs, setNotifs] = useState<Set<string>>(new Set());
  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set());
  // Usuário logado → grava no Supabase; visitante → grava no localStorage
  const userIdRef = useRef<string | null>(null);

  // Hidrata favoritos/salvos: do Supabase se logado, do localStorage se visitante.
  // Roda no mount e sempre que o estado de login mudar.
  useEffect(() => {
    let cancelled = false;

    const hydrate = async (userId: string | null) => {
      userIdRef.current = userId;
      if (userId) {
        try {
          const keys = await fetchBookmarkKeys(userId);
          if (cancelled) return;
          const clubs = new Set(keys.filter(k => k.startsWith(CLUB_PREFIX)).map(k => k.slice(CLUB_PREFIX.length)));
          const others = new Set(keys.filter(k => !k.startsWith(CLUB_PREFIX)));
          setFavClubs(clubs);
          setBookmarks(others);
        } catch { /* fica com o que já tinha em memória se a busca falhar */ }
      } else {
        setFavClubs(new Set(readLS(LS_CLUBS)));
        setBookmarks(new Set(readLS(LS_BOOKMARKS)));
      }
    };

    supabase.auth.getSession().then(({ data: { session } }) => hydrate(session?.user?.id ?? null));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      hydrate(session?.user?.id ?? null);
    });
    return () => { cancelled = true; subscription.unsubscribe(); };
  }, []);

  // Persiste uma chave (adicionar/remover) no Supabase (logado) sem bloquear a UI
  const persist = (key: string, add: boolean) => {
    const userId = userIdRef.current;
    if (!userId) return;
    (add ? addBookmarkKey(userId, key) : removeBookmarkKey(userId, key)).catch(() => {});
  };

  const toggleFav = (id: string) =>
    setFavClubs(s => {
      const n = new Set(s);
      const add = !n.has(id);
      add ? n.add(id) : n.delete(id);
      persist(CLUB_PREFIX + id, add);
      if (!userIdRef.current) writeLS(LS_CLUBS, n);
      return n;
    });

  const toggleNotif = (id: string) =>
    setNotifs(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const toggleBookmark = (key: string) =>
    setBookmarks(s => {
      const n = new Set(s);
      const add = !n.has(key);
      add ? n.add(key) : n.delete(key);
      persist(key, add);
      if (!userIdRef.current) writeLS(LS_BOOKMARKS, n);
      return n;
    });

  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const showToast = (msg: string) => {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2200);
  };

  // Popup de confirmação próprio do sistema (substitui window.confirm).
  const [confirmState, setConfirmState] = useState<(ConfirmOptions & { resolve: (v: boolean) => void }) | null>(null);
  const confirm = (opts: ConfirmOptions) =>
    new Promise<boolean>(resolve => setConfirmState({ ...opts, resolve }));
  const closeConfirm = (result: boolean) => {
    confirmState?.resolve(result);
    setConfirmState(null);
  };

  return (
    <AppCtx.Provider value={{
      theme, setTheme, resolvedTheme,
      favClubs, toggleFav,
      notifs, toggleNotif,
      bookmarks, toggleBookmark,
      toast, showToast,
      confirm,
    }}>
      {children}
      {confirmState && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div onClick={() => closeConfirm(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(3px)' }} />
          <div style={{ position: 'relative', width: '100%', maxWidth: 360, background: 'var(--surface-c-high)', borderRadius: 20, padding: '24px 22px 18px', boxShadow: '0 12px 48px rgba(0,0,0,0.35)' }}>
            <h3 style={{ margin: '0 0 8px', fontSize: 17, fontWeight: 700, color: 'var(--on-surface)' }}>{confirmState.title}</h3>
            {confirmState.message && (
              <p style={{ margin: '0 0 20px', fontSize: 14, color: 'var(--on-surface-variant)', lineHeight: 1.5 }}>{confirmState.message}</p>
            )}
            <div style={{ display: 'flex', gap: 10, marginTop: confirmState.message ? 0 : 20 }}>
              <button onClick={() => closeConfirm(false)} className="btn btn-outlined" style={{ flex: 1, height: 44 }}>
                {confirmState.cancelLabel ?? 'Cancelar'}
              </button>
              <button onClick={() => closeConfirm(true)} className="btn btn-primary" style={{ flex: 1, height: 44, background: confirmState.danger ? 'var(--error)' : undefined, color: confirmState.danger ? 'var(--on-error)' : undefined }}>
                {confirmState.confirmLabel ?? 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AppCtx.Provider>
  );
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppCtx);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
