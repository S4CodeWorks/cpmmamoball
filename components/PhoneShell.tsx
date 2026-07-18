'use client';

import { useEffect, useRef, useState } from 'react';
import { pathForPage } from '@/lib/routes';
import { AppProvider, useApp, ConfirmDialogHost } from '@/contexts/AppContext';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { DataProvider, useData } from '@/contexts/DataContext';
import { BottomNav } from '@/components/ui/BottomNav';
import { DesktopHeader } from '@/components/ui/DesktopHeader';
import { Toast } from '@/components/ui/Primitives';
import { HomeScreen } from '@/components/screens/HomeScreen';
import { TournamentsScreen } from '@/components/screens/TournamentsScreen';
import { JogosScreen } from '@/components/screens/JogosScreen';
import { NewsScreen, ArticleScreen } from '@/components/screens/NewsScreen';
import { MatchScreen } from '@/components/screens/MatchScreen';
import { ClubScreen } from '@/components/screens/ClubScreen';
import {
  MoreScreen, SavedScreen, ProfileScreen, SettingsScreen,
  SubscriptionScreen, RulesScreen, SupportScreen, SearchScreen,
} from '@/components/screens/MiscScreens';
import { AdminScreen } from '@/components/screens/AdminScreen';
import { AuthGate } from '@/components/screens/AuthScreens';
import { I } from '@/components/icons';
import type { HistoryEntry, Page } from '@/lib/types';

// ─── Tela de acesso negado ────────────────────────────────────────────────────

function UnauthorizedScreen({ onBack }: { onBack: () => void }) {
  return (
    <div className="empty" style={{ padding: '48px 24px' }}>
      <div className="empty-icon" style={{ color: 'var(--error)' }}>{I.shield}</div>
      <h3 style={{ margin: '0 0 8px', fontSize: 18, fontWeight: 700 }}>Acesso restrito</h3>
      <p style={{ margin: '0 0 24px', fontSize: 14, color: 'var(--on-surface-variant)', lineHeight: 1.5, maxWidth: 280 }}>
        Esta área é exclusiva para o staff da CPM. Se você é staff, entre com sua conta autorizada.
      </p>
      <button onClick={onBack} className="btn btn-tonal">Voltar</button>
    </div>
  );
}

// ─── Carregamento inicial — evita mostrar "vazio" antes dos dados chegarem ────

function InitialLoading() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: 14 }}>
      <div className="loading-pulse" style={{ width: 48, height: 48, borderRadius: 14, background: 'var(--primary)', color: 'var(--on-primary)', display: 'grid', placeItems: 'center', fontWeight: 800, fontSize: 20 }}>C</div>
      <div style={{ fontSize: 13, color: 'var(--on-surface-variant)', fontWeight: 600 }}>Carregando…</div>
    </div>
  );
}

// ─── App router ───────────────────────────────────────────────────────────────

function AppRoot({ initialPage, initialParam }: { initialPage?: string; initialParam?: string | number | null }) {
  const { resolvedTheme } = useApp();
  const { isStaff, isLoggedIn } = useAuth();
  const { initialLoad } = useData();
  const scrollRef = useRef<HTMLDivElement>(null);

  // Deep link: seed com Home por baixo, pra o botão "voltar" ter pra onde ir
  // mesmo quando a pessoa abre o link direto (sem ter navegado dentro do app).
  const [stack, setStack] = useState<HistoryEntry[]>(() => {
    const page = (initialPage as Page) || 'home';
    if (page === 'home') return [{ page: 'home', param: null, extra: null }];
    return [
      { page: 'home', param: null, extra: null },
      { page, param: initialParam ?? null, extra: null },
    ];
  });
  const current = stack[stack.length - 1];

  const onNav = (
    page: string,
    param: string | number | null = null,
    extra: string | null = null,
  ) => {
    setStack(s => [...s, { page: page as Page, param, extra }]);
    requestAnimationFrame(() => {
      if (scrollRef.current) scrollRef.current.scrollTop = 0;
    });
  };

  const popStack = () => setStack(s => (s.length > 1 ? s.slice(0, -1) : s));

  // Delega pro histórico real do navegador — o listener de popstate abaixo
  // reflete a mudança de volta no stack em memória, sem duplicar entradas.
  const onBack = () => {
    if (stack.length > 1) window.history.back();
  };

  const onTab = (id: string) => {
    if (current.page === id) {
      scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    setStack([{ page: id as Page, param: null, extra: null }]);
    requestAnimationFrame(() => {
      if (scrollRef.current) scrollRef.current.scrollTop = 0;
    });
  };

  // Mantém a URL do navegador em sincronia com a tela atual, pra páginas que
  // têm rota real (partida/clube/notícia) — permite copiar o link da barra de
  // endereço e volta do navegador funcionar mesmo sem recarregar a página.
  useEffect(() => {
    const path = pathForPage(current.page, current.param) ?? '/';
    if (window.location.pathname !== path) {
      window.history.pushState({ depth: stack.length }, '', path);
    }
  }, [current.page, current.param, stack.length]);

  useEffect(() => {
    const onPopState = () => popStack();
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const p = current.page;
  let view: React.ReactNode;
  switch (p) {
    case 'tournaments':  view = <TournamentsScreen onNav={onNav} initialTab={current.extra} />; break;
    case 'jogos':        view = <JogosScreen onNav={onNav} initialTab={current.extra} />; break;
    case 'news':         view = <NewsScreen onNav={onNav} />; break;
    case 'match':        view = <MatchScreen onNav={onNav} onBack={onBack} matchId={current.param as number} />; break;
    case 'club':         view = <ClubScreen onNav={onNav} onBack={onBack} clubId={current.param as string} />; break;
    case 'article':      view = <ArticleScreen onNav={onNav} onBack={onBack} articleId={current.param as string} />; break;
    case 'more':         view = <MoreScreen onNav={onNav} />; break;
    case 'saved':        view = <SavedScreen onNav={onNav} onBack={onBack} />; break;
    case 'profile':
      view = isLoggedIn
        ? <ProfileScreen onNav={onNav} onBack={onBack} />
        : <AuthGate onSuccess={() => onBack()} />;
      break;
    case 'settings':     view = <SettingsScreen onBack={onBack} onNav={onNav} />; break;
    case 'subscription':
      view = isLoggedIn
        ? <SubscriptionScreen onBack={onBack} onNav={onNav} presetCompId={current.param as string | null} />
        : <AuthGate onSuccess={() => { /* stay on subscription */ }} />;
      break;
    case 'rules':        view = <RulesScreen onBack={onBack} />; break;
    case 'support':      view = <SupportScreen onBack={onBack} />; break;
    case 'search':       view = <SearchScreen onNav={onNav} onBack={onBack} />; break;
    case 'login':        view = <AuthGate onSuccess={() => onTab('home')} />; break;
    case 'admin':
      view = isStaff
        ? <AdminScreen onNav={onNav} onBack={onBack} />
        : <UnauthorizedScreen onBack={onBack} />;
      break;
    default:             view = <HomeScreen onNav={onNav} />;
  }

  // Páginas de conta/config não se beneficiam do container largo — ficam mais
  // legíveis numa coluna estreita centralizada no desktop (ver .d-narrow).
  const NARROW_PAGES: Page[] = ['more', 'saved', 'profile', 'settings', 'rules', 'support', 'search', 'login'];
  const isNarrow = NARROW_PAGES.includes(p);

  // Páginas com identidade visual própria (design monocromático 2026) — não
  // usam o chrome do app (DesktopHeader/BottomNav), cuidam da própria navegação.
  const FULL_BLEED_PAGES: Page[] = ['subscription', 'admin'];
  const isFullBleed = FULL_BLEED_PAGES.includes(p);

  if (isFullBleed) {
    return (
      <div className="app-root dc-mono" data-theme={resolvedTheme} style={{ position: 'relative', minHeight: '100dvh' }}>
        {initialLoad ? <InitialLoading /> : view}
        <Toast />
        <ConfirmDialogHost />
      </div>
    );
  }

  return (
    <div className="app-root" data-theme={resolvedTheme}>
      <div className="app-main">
        <DesktopHeader page={current.page} param={current.param} onTab={onTab} onNav={onNav} />
        <div className={`scroll${isNarrow ? ' d-narrow' : ''}`} ref={scrollRef}>
          {initialLoad ? <InitialLoading /> : view}
        </div>
        <Toast />
        <BottomNav page={current.page} onNav={onTab} />
      </div>
      <ConfirmDialogHost />
    </div>
  );
}

// ─── Shell (exported) ─────────────────────────────────────────────────────────

export function PhoneShell({ initialPage, initialParam }: { initialPage?: string; initialParam?: string | number | null }) {
  return (
    <AppProvider>
      <AuthProvider>
        <DataProvider>
          <AppRoot initialPage={initialPage} initialParam={initialParam} />
        </DataProvider>
      </AuthProvider>
    </AppProvider>
  );
}
