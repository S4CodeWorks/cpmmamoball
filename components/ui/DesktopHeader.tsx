'use client';

import { useEffect, useRef, useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { I } from '@/components/icons';
import { Crest } from './Crest';
import { NAV_ITEMS } from '@/lib/navConfig';
import type { Page } from '@/lib/types';

interface Props {
  page: Page;
  param: string | number | null;
  onTab: (id: string) => void;
  onNav: (page: string, param?: string | number | null) => void;
}

// ── Breadcrumb — só aparece em páginas com hierarquia real (partida/clube/artigo) ──
interface Crumb { label: string; onClick?: () => void }

function useBreadcrumb(page: Page, param: string | number | null, onTab: (id: string) => void): Crumb[] {
  const { matches, clubById, news } = useData();

  if (page === 'match' && param != null) {
    const m = matches.find(x => x.id === param);
    if (!m) return [];
    const home = clubById(m.home), away = clubById(m.away);
    if (!home || !away) return [];
    return [
      { label: 'Jogos', onClick: () => onTab('jogos') },
      { label: `Rodada ${m.rodada}`, onClick: () => onTab('jogos') },
      { label: `${home.tag} vs ${away.tag}` },
    ];
  }
  if (page === 'club' && param) {
    const c = clubById(param as string);
    if (!c) return [];
    return [
      { label: 'Tabela', onClick: () => onTab('tournaments') },
      { label: c.nome },
    ];
  }
  if (page === 'article' && param) {
    const n = news.find(x => x.id === param);
    if (!n) return [];
    return [
      { label: 'Notícias', onClick: () => onTab('news') },
      { label: n.tag },
    ];
  }
  return [];
}

// ── Mega menu: prévia da Tabela (top 3) ──────────────────────────────────────
function TabelaMega({ onNav }: { onNav: Props['onNav'] }) {
  const { standings, clubById } = useData();
  const top3 = standings.slice(0, 3);
  if (top3.length === 0) {
    return <p style={{ margin: 0, fontSize: 13, color: 'var(--on-surface-variant)' }}>Classificação em breve.</p>;
  }
  return (
    <>
      <p className="dh-mega-label">Classificação · top 3</p>
      {top3.map((row, i) => {
        const c = clubById(row.club);
        if (!c) return null;
        return (
          <button key={row.club} onClick={() => onNav('club', row.club)} className="dh-mega-row tap">
            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className="mono" style={{ fontSize: 11, color: 'var(--on-surface-variant)', width: 12 }}>{i + 1}</span>
              <Crest id={row.club} size={20} radius={6} />
              {c.nome}
            </span>
            <span className="mono tabular" style={{ fontWeight: 700 }}>{row.P} pts</span>
          </button>
        );
      })}
    </>
  );
}

// ── Mega menu: prévia da próxima partida ─────────────────────────────────────
function JogosMega({ onNav }: { onNav: Props['onNav'] }) {
  const { matches, clubById } = useData();
  const next = matches.find(m => m.status === 'agendado');
  if (!next) {
    return <p style={{ margin: 0, fontSize: 13, color: 'var(--on-surface-variant)' }}>Nenhum jogo agendado.</p>;
  }
  const home = clubById(next.home), away = clubById(next.away);
  if (!home || !away) return null;
  return (
    <>
      <p className="dh-mega-label">Próxima partida</p>
      <button onClick={() => onNav('match', next.id)} className="dh-mega-row tap" style={{ borderTop: 'none' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Crest id={next.home} size={20} radius={6} />{home.tag}
        </span>
        <span className="mono" style={{ fontSize: 12, color: 'var(--on-surface-variant)' }}>{next.date}</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {away.tag}<Crest id={next.away} size={20} radius={6} />
        </span>
      </button>
    </>
  );
}

// ── Dropdown do usuário (substitui a antiga aba "Mais") ──────────────────────
function UserMenu({ onNav }: { onNav: Props['onNav'] }) {
  const { isLoggedIn, isStaff, profile, user, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onMouse = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onMouse);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('mousedown', onMouse); document.removeEventListener('keydown', onKey); };
  }, [open]);

  const nick = profile?.nick || user?.email?.split('@')[0] || 'Visitante';
  const go = (page: string) => { setOpen(false); onNav(page); };

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button onClick={() => setOpen(v => !v)} className="dh-iconbtn" aria-label="Menu do usuário" aria-expanded={open}>
        {isLoggedIn
          ? <span style={{ width: 26, height: 26, borderRadius: 999, background: 'var(--primary)', color: 'var(--on-primary)', display: 'grid', placeItems: 'center', fontSize: 11.5, fontWeight: 800 }}>{nick[0]?.toUpperCase()}</span>
          : I.person}
      </button>
      {open && (
        <div className="dh-dropdown">
          {isLoggedIn ? (
            <div style={{ padding: '10px 14px 12px', borderBottom: '1px solid var(--outline-variant)' }}>
              <div style={{ fontSize: 13.5, fontWeight: 700 }}>{nick}</div>
              <div style={{ fontSize: 11.5, color: 'var(--on-surface-variant)' }}>{isStaff ? '★ Staff' : 'Torcedor'}</div>
            </div>
          ) : (
            <button onClick={() => go('login')} className="dh-dropdown-item tap" style={{ color: 'var(--primary)', fontWeight: 700 }}>
              <span className="dh-dropdown-icon">{I.logIn}</span>Entrar / Criar conta
            </button>
          )}
          {isLoggedIn && <button onClick={() => go('profile')} className="dh-dropdown-item tap"><span className="dh-dropdown-icon">{I.person}</span>Meu perfil</button>}
          <button onClick={() => go('saved')} className="dh-dropdown-item tap"><span className="dh-dropdown-icon">{I.star}</span>Salvos</button>
          <button onClick={() => go('subscription')} className="dh-dropdown-item tap"><span className="dh-dropdown-icon">{I.ticket}</span>Inscrever time</button>
          <button onClick={() => go('settings')} className="dh-dropdown-item tap"><span className="dh-dropdown-icon">{I.cog}</span>Configurações</button>
          <button onClick={() => go('rules')} className="dh-dropdown-item tap"><span className="dh-dropdown-icon">{I.rules}</span>Regulamento</button>
          <button onClick={() => go('support')} className="dh-dropdown-item tap"><span className="dh-dropdown-icon">{I.support}</span>Suporte</button>
          {isLoggedIn && (
            <button onClick={() => { setOpen(false); signOut(); }} className="dh-dropdown-item tap" style={{ color: 'var(--error)', borderTop: '1px solid var(--outline-variant)' }}>
              <span className="dh-dropdown-icon">{I.signOut}</span>Sair da conta
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ── Header principal ──────────────────────────────────────────────────────────
export function DesktopHeader({ page, param, onTab, onNav }: Props) {
  const { theme, setTheme, resolvedTheme } = useApp();
  const { isStaff } = useAuth();
  const crumbs = useBreadcrumb(page, param, onTab);

  const cycleTheme = () => {
    const next: Record<string, 'light' | 'dark' | 'auto'> = { light: 'dark', dark: 'auto', auto: 'light' };
    setTheme(next[theme] ?? 'auto');
  };
  const themeIcon = theme === 'light' ? I.sun : theme === 'dark' ? I.moon : I.auto;

  return (
    <header className="desktop-header">
      <div className="desktop-header-inner">
        <div className="dh-row">
          <div className="dh-brand">
            <img src="/logo-cfm.png" alt="CPM" style={{ width: 26, height: 26, objectFit: 'contain' }} />
            <span className="dh-wordmark">CPM</span>
          </div>

          <nav className="dh-nav" aria-label="Navegação principal">
            {NAV_ITEMS.filter(it => it.id !== 'more').map(it => {
              const isActive = page === it.id
                || (it.id === 'tournaments' && page === 'club')
                || (it.id === 'jogos' && page === 'match')
                || (it.id === 'news' && page === 'article');
              const hasMega = it.id === 'tournaments' || it.id === 'jogos';
              return (
                <div key={it.id} className="dh-nav-item">
                  <button onClick={() => onTab(it.id)} className={`dh-nav-link tap${isActive ? ' active' : ''}`}>
                    {it.label}
                  </button>
                  {hasMega && (
                    <div className="dh-mega">
                      {it.id === 'tournaments' ? <TabelaMega onNav={onNav} /> : <JogosMega onNav={onNav} />}
                    </div>
                  )}
                </div>
              );
            })}
            {isStaff && (
              <div className="dh-nav-item">
                <button onClick={() => onTab('admin')} className={`dh-nav-link tap${page === 'admin' ? ' active' : ''}`}>Admin</button>
              </div>
            )}
          </nav>

          <div className="dh-actions">
            <button onClick={() => onNav('search')} className="dh-iconbtn" aria-label="Buscar">{I.search}</button>
            <button onClick={cycleTheme} className="dh-iconbtn" aria-label="Alternar tema" title={'Tema: ' + (resolvedTheme === 'dark' ? 'Escuro' : 'Claro')}>{themeIcon}</button>
            <UserMenu onNav={onNav} />
          </div>
        </div>

        {crumbs.length > 0 && (
          <div className="dh-breadcrumb">
            {crumbs.map((c, i) => (
              <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                {i > 0 && <span className="dh-breadcrumb-sep">{I.chevR}</span>}
                {c.onClick
                  ? <button onClick={c.onClick} className="tap" style={{ color: 'var(--on-surface-variant)' }}>{c.label}</button>
                  : <span className="cur">{c.label}</span>}
              </span>
            ))}
          </div>
        )}
      </div>
    </header>
  );
}
