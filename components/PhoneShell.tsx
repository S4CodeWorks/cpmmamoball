'use client';

import { useEffect, useRef, useState } from 'react';
import { MotionConfig } from 'framer-motion';
import { pathForPage } from '@/lib/routes';
import { AppProvider, useApp, ConfirmDialogHost } from '@/contexts/AppContext';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { DataProvider, useData } from '@/contexts/DataContext';
import { BottomNav } from '@/components/ui/BottomNav';
import { DesktopHeader } from '@/components/ui/DesktopHeader';
import { Toast } from '@/components/ui/Primitives';
import { CookieBanner } from '@/components/ui/CookieBanner';
import { Skeleton, SkeletonHeroMatch, SkeletonMatchCard, SkeletonStandingsTable } from '@/components/ui/Skeleton';
import { HomeScreen } from '@/components/screens/HomeScreen';
import { TournamentsScreen } from '@/components/screens/TournamentsScreen';
import { JogosScreen } from '@/components/screens/JogosScreen';
import { NewsScreen, ArticleScreen } from '@/components/screens/NewsScreen';
import { MatchScreen } from '@/components/screens/MatchScreen';
import { ClubScreen } from '@/components/screens/ClubScreen';
import {
  MoreScreen, ProfileScreen, SettingsScreen,
  SubscriptionScreen, RulesScreen, SupportScreen, SearchScreen,
} from '@/components/screens/MiscScreens';
import { AdminScreen } from '@/components/screens/AdminScreen';
import { LibraryProvider } from '@/contexts/LibraryContext';
import { SavedScreen, NoticesScreen, NoticeScreen, type SavedFilter, type NoticeFilter } from '@/components/screens/LibraryScreens';
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
// Réplica pixel-a-pixel da Home real (TopAppBar + destaque + partidas +
// classificação, ver components/screens/HomeScreen.tsx) — desktop ganha o
// mesmo split de 2 colunas de graça, reaproveitando a classe .d-split.

function InitialLoading() {
  return (
    <div aria-busy="true" aria-label="Carregando">
      {/* Cabeçalho grande, igual ao TopAppBar large (apenas no mobile) */}
      <div className="initial-head-skeleton" style={{ padding: '4px 20px 20px' }}>
        <Skeleton width={110} height={12} style={{ marginBottom: 10 }} />
        <Skeleton width={180} height={30} />
      </div>

      {/* Partida em destaque */}
      <section style={{ padding: '8px 16px 0' }}>
        <SkeletonHeroMatch />
      </section>

      {/* Desktop: 2 colunas (igual .d-split da Home) · Mobile: empilhado */}
      <div className="d-split">
        <div>
          <div className="section-head"><Skeleton width={150} height={16} /></div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: '0 16px' }}>
            <SkeletonMatchCard />
            <SkeletonMatchCard />
          </div>
        </div>
        <div>
          <div className="section-head"><Skeleton width={120} height={16} /></div>
          <div style={{ padding: '0 16px' }}>
            <SkeletonStandingsTable rows={5} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Erro no carregamento inicial — nunca deixa o usuário preso no skeleton ────

function InitialLoadError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="empty" style={{ paddingTop: 80 }}>
      <div className="empty-icon" style={{ color: 'var(--error)' }}>{I.alertTriangle}</div>
      <h3 style={{ margin: '0 0 8px', fontSize: 17, fontWeight: 700 }}>Não deu pra carregar</h3>
      <p style={{ margin: '0 0 20px', fontSize: 14, lineHeight: 1.5, maxWidth: 280, marginInline: 'auto' }}>{message}</p>
      <button onClick={onRetry} className="btn btn-primary">Tentar de novo</button>
    </div>
  );
}

// ─── App router ───────────────────────────────────────────────────────────────

function AppRoot({ initialPage, initialParam }: { initialPage?: string; initialParam?: string | number | null }) {
  const { resolvedTheme } = useApp();
  const { isStaff, isLoggedIn } = useAuth();
  const { initialLoad, error, refresh } = useData();
  const scrollRef = useRef<HTMLDivElement>(null);
  const historyDepth=useRef(0);
  const [searchState, setSearchState] = useState<import('./screens/SearchScreen').SearchState>({ query: '', category: 'All' });

  const [savedFilter,setSavedFilter]=useState<SavedFilter>('Todos');
  const [noticeFilter,setNoticeFilter]=useState<NoticeFilter>('Todos');


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
  useEffect(()=>{
    const stored=window.history.state;
    if(!stored)return;
    historyDepth.current=typeof stored.cpmDepth==='number'?stored.cpmDepth:0;
    queueMicrotask(()=>{
      if(['Todos','Competições','Clubes','Jogos','Notícias'].includes(stored.cpmSavedFilter))setSavedFilter(stored.cpmSavedFilter);
      if(['Todos','Não lidos'].includes(stored.cpmNoticeFilter))setNoticeFilter(stored.cpmNoticeFilter);
      if(Array.isArray(stored.cpmStack)&&stored.cpmStack.length&&stored.cpmStack.at(-1)?.page===initialPage)setStack(stored.cpmStack);
    });
  },[initialPage]);

  const onNav = (
    page: string,
    param: string | number | null = null,
    extra: string | null = null,
  ) => {
    const next = [...stack, { page: page as Page, param, extra }];
    window.history.pushState({ cpmStack: next, cpmDepth:++historyDepth.current }, '', pathForPage(page, param) ?? '/');
    setStack(next);
    requestAnimationFrame(() => {
      if (scrollRef.current) scrollRef.current.scrollTop = 0;
    });
  };

  const popStack = () => setStack(s => (s.length > 1 ? s.slice(0, -1) : s));

  // Delega pro histórico real do navegador — o listener de popstate abaixo
  // reflete a mudança de volta no stack em memória, sem duplicar entradas.
  const onBack = () => {
    if(stack.length>1){if(historyDepth.current>0)window.history.back();else popStack();}
  };

  const onTab = (id: string) => {
    if (current.page === id) {
      scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const next = [{ page: id as Page, param: null, extra: null }];
    window.history.pushState({ cpmStack: next, cpmDepth:++historyDepth.current }, '', pathForPage(id, null) ?? '/');
    setStack(next);
    requestAnimationFrame(() => {
      if (scrollRef.current) scrollRef.current.scrollTop = 0;
    });
  };

  // Mantém a URL do navegador em sincronia com a tela atual, pra páginas que
  // têm rota real (partida/clube/notícia) — permite copiar o link da barra de
  // endereço e volta do navegador funcionar mesmo sem recarregar a página.
  useEffect(() => {
    window.history.replaceState({ cpmStack: stack, cpmDepth:historyDepth.current, cpmSavedFilter:savedFilter, cpmNoticeFilter:noticeFilter }, '', pathForPage(current.page, current.param) ?? '/');
  }, [stack, current.page, current.param, savedFilter, noticeFilter]);

  useEffect(() => {
    const onPopState = (event: PopStateEvent) => {
      historyDepth.current=event.state?.cpmDepth??0;
      if (Array.isArray(event.state?.cpmStack)) setStack(event.state.cpmStack);
      else popStack();
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const p = current.page;
  const [gatedPage,setGatedPage]=useState<Page|null>(null);
  const requiresAuth=(p==='profile'||p==='subscription')&&!isLoggedIn;
  if(requiresAuth&&gatedPage!==p)setGatedPage(p);
  else if(gatedPage!==null&&gatedPage!==p)setGatedPage(null);
  const authSurface=p==='login'||requiresAuth||gatedPage===p;
  const authSuccess=()=>{setGatedPage(null);if(p!=='subscription')onBack();};
  let view: React.ReactNode;
  switch (p) {
    case 'tournaments':  view = <TournamentsScreen key={String(current.param)} onNav={onNav} initialTab={current.extra} initialCompetitionId={current.param as string | null} />; break;
    case 'jogos':        view = <JogosScreen key={String(current.param)} onNav={onNav} initialTab={current.extra} initialCompetitionId={current.param as string | null} />; break;
    case 'news':         view = <NewsScreen onNav={onNav} />; break;
    case 'match':        view = <MatchScreen onNav={onNav} onBack={onBack} matchId={current.param as number} />; break;
    case 'club':         view = <ClubScreen onNav={onNav} onBack={onBack} clubId={current.param as string} />; break;
    case 'article':      view = <ArticleScreen onNav={onNav} onBack={onBack} articleId={current.param as string} />; break;
    case 'more':         view = <MoreScreen onNav={onNav} />; break;
    case 'saved':        view = <SavedScreen onNav={onNav} onBack={onBack} filter={savedFilter} onFilterChange={setSavedFilter}/>; break;
    case 'notices': view=<NoticesScreen onNav={onNav} onBack={onBack} filter={noticeFilter} onFilterChange={setNoticeFilter}/>;break;
    case 'notice': view=<NoticeScreen onNav={onNav} onBack={onBack} noticeId={String(current.param)}/>;break;
    case 'profile':
      view = !authSurface
        ? <ProfileScreen onNav={onNav} onBack={onBack} />
        : <AuthGate onSuccess={authSuccess} onBack={onBack} onNav={onNav} />;
      break;
    case 'settings':     view = <SettingsScreen onBack={onBack} onNav={onNav} />; break;
    case 'subscription':
      view = !authSurface
        ? <SubscriptionScreen onBack={onBack} onNav={onNav} presetCompId={current.param as string | null} />
        : <AuthGate onSuccess={authSuccess} onBack={onBack} onNav={onNav} />;
      break;
    case 'rules':        view = <RulesScreen onBack={onBack} />; break;
    case 'support':      view = <SupportScreen onBack={onBack} />; break;
    case 'search':       view = <SearchScreen onNav={onNav} onBack={onBack} state={searchState} onStateChange={setSearchState} />; break;
    case 'login':        view = <AuthGate onSuccess={authSuccess} onBack={onBack} onNav={onNav} />; break;
    case 'admin':
      view = isStaff
        ? <AdminScreen onNav={onNav} onBack={onBack} />
        : <UnauthorizedScreen onBack={onBack} />;
      break;
    default:             view = <HomeScreen onNav={onNav} />;
  }

  // Páginas de conta/config não se beneficiam do container largo — ficam mais
  // legíveis numa coluna estreita centralizada no desktop (ver .d-narrow).
  const NARROW_PAGES: Page[] = ['more', 'profile', 'settings', 'rules', 'support'];
  const isNarrow = NARROW_PAGES.includes(p) && !authSurface;

  return (
    <div className="app-root" data-theme={resolvedTheme} data-surface={p} data-auth-flow={authSurface}>
      <div className="app-main">
        {!authSurface&&<DesktopHeader page={current.page} param={current.param} onTab={onTab} onNav={onNav} />}
        <div id="cpm-main" tabIndex={-1} className={`scroll${isNarrow ? ' d-narrow' : ''}`} ref={scrollRef}>
          {authSurface || ['home','jogos','search','saved','notices','notice','match'].includes(p) ? view : initialLoad ? <InitialLoading /> : error ? <InitialLoadError message={error} onRetry={refresh} /> : view}
        </div>
        <Toast />
        <CookieBanner surface={p} />
        {!authSurface && !['home','jogos','search','saved','notices','notice','match'].includes(p) && <BottomNav page={current.page} onNav={onTab} />}
      </div>
      <ConfirmDialogHost />
    </div>
  );
}

// ─── Shell (exported) ─────────────────────────────────────────────────────────

export function PhoneShell({ initialPage, initialParam }: { initialPage?: string; initialParam?: string | number | null }) {
  return (
    <MotionConfig reducedMotion="user">
    <AppProvider>
      <AuthProvider>
        <DataProvider><LibraryProvider>
          <AppRoot initialPage={initialPage} initialParam={initialParam} />
        </LibraryProvider></DataProvider>
      </AuthProvider>
    </AppProvider>
    </MotionConfig>
  );
}
