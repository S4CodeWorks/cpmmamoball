'use client';

import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { fetchBookmarkKeys, addBookmarkKey, removeBookmarkKey } from '@/lib/db';

type Theme = 'auto' | 'light' | 'dark';
export type CookieConsent = 'unset' | 'accepted' | 'declined';

interface ConfirmOptions {
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
}

export type ToastVariant = 'success' | 'error';
export interface ToastAction { label: string; onClick: () => void }
export interface ToastState { msg: string; variant: ToastVariant; action?: ToastAction }
interface ShowToastOptions { variant?: ToastVariant; action?: ToastAction }

interface AppContextValue {
  theme: Theme;
  setTheme: (t: Theme) => void;
  resolvedTheme: 'light' | 'dark';
  // Consentimento de armazenamento local (tema, favoritos e notificações de
  // visitante). Dados salvos NA CONTA (Supabase, usuário logado) são
  // diferentes disso — regidos pelos termos aceitos no cadastro.
  cookieConsent: CookieConsent;
  setCookieConsent: (v: 'accepted' | 'declined') => void;
  favClubs: Set<string>;
  toggleFav: (id: string) => void;
  notifs: Set<string>;
  toggleNotif: (id: string) => void;
  favComps: Set<string>;
  toggleFavComp: (id: string) => void;
  bookmarks: Set<string>;
  toggleBookmark: (id: string) => void;
  toast: ToastState | null;
  showToast: (msg: string, opts?: ShowToastOptions) => void;
  showError: (e: unknown) => void;
  hideToast: () => void;
  confirm: (opts: ConfirmOptions) => Promise<boolean>;
  confirmState: (ConfirmOptions & { resolve: (v: boolean) => void }) | null;
  closeConfirm: (result: boolean) => void;
}

const AppCtx = createContext<AppContextValue | null>(null);

const CLUB_PREFIX = 'club:';
const NOTIF_PREFIX = 'notif:';
const COMP_PREFIX = 'favcomp:';
const LS_CLUBS = 'cpm_fav_clubs';
const LS_BOOKMARKS = 'cpm_bookmarks';
const LS_NOTIFS = 'cpm_notifs';
const LS_COMPS = 'cpm_fav_comps';
const LS_THEME = 'cpm_theme';
// Guarda a própria decisão do banner — essa chave é a única "essencial",
// sempre salva independente da escolha (senão o banner nunca pararia de aparecer).
const LS_CONSENT = 'cpm_cookie_consent';

function readTheme(): Theme {
  if (typeof window === 'undefined') return 'auto';
  const saved = localStorage.getItem(LS_THEME);
  return saved === 'light' || saved === 'dark' || saved === 'auto' ? saved : 'auto';
}
function readConsent(): CookieConsent {
  if (typeof window === 'undefined') return 'unset';
  const v = localStorage.getItem(LS_CONSENT);
  return v === 'accepted' || v === 'declined' ? v : 'unset';
}

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
  const [cookieConsent, setCookieConsentState] = useState<CookieConsent>('unset');
  useEffect(() => { setCookieConsentState(readConsent()); }, []);

  const [theme, setThemeState] = useState<Theme>('auto');
  // Só hidrata o tema salvo se o usuário já aceitou o armazenamento local —
  // sem isso, o servidor sempre renderiza 'auto' e é isso que fica valendo
  // até haver consentimento (evita também mismatch de SSR).
  useEffect(() => { if (readConsent() === 'accepted') setThemeState(readTheme()); }, []);
  const setTheme = (t: Theme) => {
    setThemeState(t);
    if (typeof window !== 'undefined' && cookieConsent === 'accepted') localStorage.setItem(LS_THEME, t);
  };

  const setCookieConsent = (v: 'accepted' | 'declined') => {
    setCookieConsentState(v);
    if (typeof window === 'undefined') return;
    localStorage.setItem(LS_CONSENT, v);
    if (v === 'declined') {
      // Limpa qualquer preferência de visitante já salva antes da escolha.
      // Não mexe em nada sincronizado com a conta (Supabase) — isso é regido
      // pelos termos aceitos no cadastro, não por esse banner.
      localStorage.removeItem(LS_THEME);
      localStorage.removeItem(LS_CLUBS);
      localStorage.removeItem(LS_BOOKMARKS);
      localStorage.removeItem(LS_NOTIFS);
      localStorage.removeItem(LS_COMPS);
      setThemeState('auto');
      if (!userIdRef.current) {
        setFavClubs(new Set());
        setNotifs(new Set());
        setBookmarks(new Set());
        setFavComps(new Set());
      }
    }
  };

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
  const [favComps, setFavComps] = useState<Set<string>>(new Set());
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
          const clubs  = new Set(keys.filter(k => k.startsWith(CLUB_PREFIX)).map(k => k.slice(CLUB_PREFIX.length)));
          const notifKeys = new Set(keys.filter(k => k.startsWith(NOTIF_PREFIX)).map(k => k.slice(NOTIF_PREFIX.length)));
          const comps = new Set(keys.filter(k => k.startsWith(COMP_PREFIX)).map(k => k.slice(COMP_PREFIX.length)));
          const others = new Set(keys.filter(k => !k.startsWith(CLUB_PREFIX) && !k.startsWith(NOTIF_PREFIX) && !k.startsWith(COMP_PREFIX)));
          setFavClubs(clubs);
          setNotifs(notifKeys);
          setFavComps(comps);
          setBookmarks(others);
        } catch { /* fica com o que já tinha em memória se a busca falhar */ }
      } else if (readConsent() === 'accepted') {
        setFavClubs(new Set(readLS(LS_CLUBS)));
        setNotifs(new Set(readLS(LS_NOTIFS)));
        setFavComps(new Set(readLS(LS_COMPS)));
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
      if (!userIdRef.current && cookieConsent === 'accepted') writeLS(LS_CLUBS, n);
      return n;
    });

  const toggleNotif = (id: string) =>
    setNotifs(s => {
      const n = new Set(s);
      const add = !n.has(id);
      add ? n.add(id) : n.delete(id);
      persist(NOTIF_PREFIX + id, add);
      if (!userIdRef.current && cookieConsent === 'accepted') writeLS(LS_NOTIFS, n);
      return n;
    });

  const toggleFavComp = (id: string) =>
    setFavComps(s => {
      const n = new Set(s);
      const add = !n.has(id);
      add ? n.add(id) : n.delete(id);
      persist(COMP_PREFIX + id, add);
      if (!userIdRef.current && cookieConsent === 'accepted') writeLS(LS_COMPS, n);
      return n;
    });

  const toggleBookmark = (key: string) =>
    setBookmarks(s => {
      const n = new Set(s);
      const add = !n.has(key);
      add ? n.add(key) : n.delete(key);
      persist(key, add);
      if (!userIdRef.current && cookieConsent === 'accepted') writeLS(LS_BOOKMARKS, n);
      return n;
    });

  const [toast, setToast] = useState<ToastState | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const showToast = (msg: string, opts?: ShowToastOptions) => {
    setToast({ msg, variant: opts?.variant ?? 'success', action: opts?.action });
    if (toastTimer.current) clearTimeout(toastTimer.current);
    // Toast com ação fica mais tempo na tela — dá margem pro usuário clicar
    toastTimer.current = setTimeout(() => setToast(null), opts?.action ? 4200 : 2200);
  };
  // Formata erros de forma consistente — o ícone/cor do variant 'error' já
  // comunica que é um erro, então não precisa mais do prefixo "Erro: " no texto.
  const showError = (e: unknown) =>
    showToast(e instanceof Error ? e.message : String(e), { variant: 'error' });
  const hideToast = () => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast(null);
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
      cookieConsent, setCookieConsent,
      favClubs, toggleFav,
      notifs, toggleNotif,
      favComps, toggleFavComp,
      bookmarks, toggleBookmark,
      toast, showToast, showError, hideToast,
      confirm, confirmState, closeConfirm,
    }}>
      {children}
    </AppCtx.Provider>
  );
}

// Renderiza o popup de confirmação — precisa ficar DENTRO de .app-root pra herdar
// as CSS variables de tema (elas são escopadas a .app-root[data-theme], não a :root).
export function ConfirmDialogHost() {
  const { confirmState, closeConfirm } = useApp();
  if (!confirmState) return null;
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div className="confirm-backdrop" onClick={() => closeConfirm(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(3px)' }} />
      <div className="confirm-card" style={{ position: 'relative', width: '100%', maxWidth: 360, background: 'var(--surface-c-high)', borderRadius: 20, padding: '24px 22px 18px', boxShadow: '0 12px 48px rgba(0,0,0,0.35)' }}>
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
  );
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppCtx);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
