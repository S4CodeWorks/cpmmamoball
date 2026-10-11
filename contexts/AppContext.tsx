'use client';

import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { CpmIconName } from '@/components/ui/CpmUi';
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

export type ToastVariant = 'success' | 'error' | 'undo' | 'restored' | 'copied' | 'pending' | 'warning' | 'info';
export interface ToastAction { label: string; onClick: () => void | Promise<void>; keepOpen?: boolean }
export interface ToastState { id: string; msg: string; variant: ToastVariant; action?: ToastAction; icon?: CpmIconName }
interface ShowToastOptions { variant?: ToastVariant; action?: ToastAction; id?: string; icon?: CpmIconName }

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
  savedLoading: boolean;
  savedError: string | null;
  reloadSaved: () => void;
  setSavedKey: (key: string, saved: boolean) => Promise<void>;
  saveWithFeedback: (key: string, saved: boolean, label?: string) => Promise<void>;
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
  try { const value:unknown=JSON.parse(localStorage.getItem(key) || '[]');return Array.isArray(value)?value.filter((item):item is string=>typeof item==='string'):[]; } catch { return []; }
}
function writeLS(key: string, values: Set<string>) {
  if (typeof window === 'undefined') return;
  try { localStorage.setItem(key, JSON.stringify([...values])); return true; } catch { return false; }
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [feedbackQueue, setFeedbackQueue] = useState<ToastState[]>([]);

  const [cookieConsent, setCookieConsentState] = useState<CookieConsent>('unset');
  useEffect(() => { queueMicrotask(()=>setCookieConsentState(readConsent())); }, []);

  const [theme, setThemeState] = useState<Theme>('auto');
  // Só hidrata o tema salvo se o usuário já aceitou o armazenamento local —
  // sem isso, o servidor sempre renderiza 'auto' e é isso que fica valendo
  // até haver consentimento (evita também mismatch de SSR).
  useEffect(() => { queueMicrotask(()=>{if (readConsent() === 'accepted') setThemeState(readTheme());}); }, []);
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
        applyKeys(new Set());
      }
    }
  };

  const [systemDark, setSystemDark] = useState(false);

  useEffect(() => {
    queueMicrotask(()=>setSystemDark(window.matchMedia('(prefers-color-scheme: dark)').matches));
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
  const visitorStorageAvailable = useRef(true);

  const [savedLoading, setSavedLoading] = useState(true);
  const [savedError, setSavedError] = useState<string | null>(null);
  const [savedVersion, setSavedVersion] = useState(0);
  const keysRef = useRef(new Set<string>());
  const queues = useRef(new Map<string, Promise<void>>());
  const applyKeys = (keys: Set<string>) => {
    keysRef.current = keys;
    setFavClubs(new Set([...keys].filter(k=>k.startsWith(CLUB_PREFIX)).map(k=>k.slice(CLUB_PREFIX.length))));
    setFavComps(new Set([...keys].filter(k=>k.startsWith(COMP_PREFIX)).map(k=>k.slice(COMP_PREFIX.length))));
    setNotifs(new Set([...keys].filter(k=>k.startsWith(NOTIF_PREFIX)).map(k=>k.slice(NOTIF_PREFIX.length))));
    setBookmarks(new Set([...keys].filter(k=>![CLUB_PREFIX,COMP_PREFIX,NOTIF_PREFIX].some(p=>k.startsWith(p)))));
  };
  useEffect(() => {
    let active = true, generation = 0, hydratedUser: string | null | undefined;
    const hydrate = async (uid: string | null) => {
      hydratedUser=uid;
      const epoch = ++generation;
      if (userIdRef.current !== uid) { applyKeys(new Set()); setFeedbackQueue(queue => queue.filter(item => !item.id.startsWith('saved:'))); }
      userIdRef.current = uid; setSavedLoading(true); setSavedError(null);
      try {
        const keys = uid ? await fetchBookmarkKeys(uid) : readConsent()==='accepted' ? [
          ...readLS(LS_CLUBS).map(id=>CLUB_PREFIX+id),...readLS(LS_COMPS).map(id=>COMP_PREFIX+id),
          ...readLS(LS_NOTIFS).map(id=>NOTIF_PREFIX+id),...readLS(LS_BOOKMARKS),
        ] : [...keysRef.current];
        if(active && epoch===generation) applyKeys(new Set(keys));
      } catch { if(active && epoch===generation) setSavedError('Não foi possível carregar seus salvos'); }
      finally { if(active && epoch===generation) setSavedLoading(false); }
    };
    let receivedEvent = false;
    supabase.auth.getSession().then(({data:{session}})=>{if(!receivedEvent)void hydrate(session?.user.id??null);});
    const {data:{subscription}}=supabase.auth.onAuthStateChange((_event,session)=>{
      receivedEvent=true;const uid=session?.user.id??null;if(uid!==hydratedUser)void hydrate(uid);
    });
    return()=>{active=false;subscription.unsubscribe();};
  }, [savedVersion]);
  const setSavedKey = async (key: string, saved: boolean) => {
    const uid = userIdRef.current, previous = keysRef.current.has(key);
    const next = new Set(keysRef.current); if(saved)next.add(key);else next.delete(key); applyKeys(next);
    if(!uid){
      if(cookieConsent==='accepted'){
        visitorStorageAvailable.current = [
          writeLS(LS_CLUBS,new Set([...next].filter(k=>k.startsWith(CLUB_PREFIX)).map(k=>k.slice(CLUB_PREFIX.length)))),
          writeLS(LS_COMPS,new Set([...next].filter(k=>k.startsWith(COMP_PREFIX)).map(k=>k.slice(COMP_PREFIX.length)))),
          writeLS(LS_NOTIFS,new Set([...next].filter(k=>k.startsWith(NOTIF_PREFIX)).map(k=>k.slice(NOTIF_PREFIX.length)))),
          writeLS(LS_BOOKMARKS,new Set([...next].filter(k=>![CLUB_PREFIX,COMP_PREFIX,NOTIF_PREFIX].some(p=>k.startsWith(p)))))
        ].every(Boolean);
      }
      return;
    }
    const queueKey=uid+':'+key, prior=queues.current.get(queueKey)??Promise.resolve();
    const task=prior.catch(()=>{}).then(()=>saved?addBookmarkKey(uid,key):removeBookmarkKey(uid,key));
    queues.current.set(queueKey,task);
    try{await task;}catch(error){
      if(userIdRef.current===uid && queues.current.get(queueKey)===task){
        const rollback=new Set(keysRef.current);if(previous)rollback.add(key);else rollback.delete(key);applyKeys(rollback);
      }
      throw error;
    }finally{if(queues.current.get(queueKey)===task)queues.current.delete(queueKey);}
  };
  const toggleKey = (key: string) => { void saveWithFeedback(key, !keysRef.current.has(key)); };
  const toggleFav=(id:string)=>toggleKey(CLUB_PREFIX+id);
  const toggleNotif=(id:string)=>toggleKey(NOTIF_PREFIX+id);
  const toggleFavComp=(id:string)=>toggleKey(COMP_PREFIX+id);
  const toggleBookmark=(key:string)=>toggleKey(key);

  const toast = feedbackQueue[0] ?? null;
  const feedbackSequence = useRef(0);
  const showToast = (msg: string, opts?: ShowToastOptions) => {
    const item: ToastState = { id: opts?.id ?? 'feedback-' + ++feedbackSequence.current, msg, variant: opts?.variant ?? (opts?.action ? 'undo' : /copiado/i.test(msg) ? 'copied' : 'success'), action: opts?.action, icon: opts?.icon ?? (!opts?.variant && !opts?.action && !/copiado/i.test(msg) ? 'authCheck' : undefined) };
    setFeedbackQueue(queue => {
      const index = queue.findIndex(entry => entry.id === item.id);
      if (index >= 0) return queue.map((entry, at) => at === index ? item : entry);
      return [...queue, item];
    });
  };
  const showError = (e: unknown) => showToast(e instanceof Error ? e.message : String(e), { variant: 'error' });
  const hideToast = () => setFeedbackQueue(queue => queue.slice(1));

  const savedOperationVersion = useRef(new Map<string, number>());
  const saveWithFeedback = async (key: string, saved: boolean, label = key.startsWith(CLUB_PREFIX) ? 'Clube' : key.startsWith(COMP_PREFIX) ? 'Competição' : key.startsWith('art:') ? 'Notícia' : key.startsWith('match:') ? 'Partida' : 'Item') => {
    const owner = userIdRef.current;
    const id = 'saved:' + (owner ?? 'guest') + ':' + key;
    const version = (savedOperationVersion.current.get(id) ?? 0) + 1;
    savedOperationVersion.current.set(id, version);
    const current = () => savedOperationVersion.current.get(id) === version && userIdRef.current === owner;
    const reminder = key.startsWith(NOTIF_PREFIX);
    const icon: CpmIconName = reminder ? 'authBell' : key.startsWith(CLUB_PREFIX) || key.startsWith(COMP_PREFIX) ? 'star' : 'bookmark';
    const apply = async (value: boolean, restored = false): Promise<void> => {
      if (!current()) return;
      showToast(restored ? 'Restaurando…' : value ? 'Salvando…' : 'Removendo…', { id, variant: 'pending' });
      try {
        await setSavedKey(key, value);
        if (!current()) return;
        const sessionOnly = !owner && (cookieConsent !== 'accepted' || !visitorStorageAvailable.current);
        const message = restored ? 'Item restaurado' : reminder ? value ? sessionOnly ? 'Lembrete salvo nesta sessão' : 'Lembrete salvo' : 'Lembrete removido' : value ? sessionOnly ? 'Salvo nesta sessão' : label + (['Notícia', 'Competição', 'Partida'].includes(label) ? ' salva' : ' salvo') : 'Removido dos salvos';
        showToast(message, { id, variant: restored ? 'restored' : value ? 'success' : 'undo', icon: restored ? 'authCheck' : icon,
          action: !value ? { label: 'Desfazer', keepOpen: true, onClick: () => apply(true, true) } : undefined });
      } catch {
        if (!current()) return;
        showToast(restored ? 'Não foi possível restaurar.' : 'Não foi possível salvar a alteração.', { id, variant: 'error',
          action: { label: 'Tentar novamente', keepOpen: true, onClick: () => apply(value, restored) } });
      }
    };
    await apply(saved);
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
      savedLoading, savedError, reloadSaved:()=>setSavedVersion(v=>v+1), setSavedKey, saveWithFeedback,
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
