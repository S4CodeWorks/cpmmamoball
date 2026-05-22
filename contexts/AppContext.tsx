'use client';

import { createContext, useContext, useEffect, useRef, useState } from 'react';

type Theme = 'auto' | 'light' | 'dark';

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
}

const AppCtx = createContext<AppContextValue | null>(null);

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
  const [notifs, setNotifs] = useState<Set<string>>(new Set(['comp:serie-a']));
  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set());

  const toggleFav = (id: string) =>
    setFavClubs(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const toggleNotif = (id: string) =>
    setNotifs(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const toggleBookmark = (id: string) =>
    setBookmarks(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const showToast = (msg: string) => {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2200);
  };

  return (
    <AppCtx.Provider value={{
      theme, setTheme, resolvedTheme,
      favClubs, toggleFav,
      notifs, toggleNotif,
      bookmarks, toggleBookmark,
      toast, showToast,
    }}>
      {children}
    </AppCtx.Provider>
  );
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppCtx);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
