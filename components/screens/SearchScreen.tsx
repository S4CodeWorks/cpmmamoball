'use client';

import { useRef, useState, useSyncExternalStore, type MouseEvent, type ReactNode } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useSearch } from '@/hooks/useSearch';
import type { SearchCategory, SearchKind, SearchResult } from '@/lib/search';
import { CpmAction, CpmIcon, type CpmIconName } from '@/components/ui/CpmUi';
import { Crest } from '@/components/ui/Crest';

export type SearchState = { query: string; category: SearchCategory };
type Props = { state: SearchState; onStateChange: (state: SearchState) => void; onNav: (page: string, param?: string | number | null) => void; onBack?: () => void };
const kinds: SearchKind[] = ['Club', 'Player', 'News'];
const labels: Record<SearchKind, string> = { Club: 'Clubes', Player: 'Jogadores', News: 'Notícias' };
const icons: Record<SearchCategory, CpmIconName> = { All: 'searchFilter', Club: 'searchShield', Player: 'user', News: 'searchNews' };
const shortcuts = [{ label: 'Jogos', page: 'jogos', icon: 'calendar' }, { label: 'Classificação', page: 'tournaments', icon: 'trophy' }, { label: 'Notícias', page: 'news', icon: 'searchNews' }] as const;

function subscribeViewport(onChange: () => void) {
  const compact = window.matchMedia('(max-width: 959px)'), narrow = window.matchMedia('(max-width: 359px)');
  compact.addEventListener('change', onChange); narrow.addEventListener('change', onChange);
  return () => { compact.removeEventListener('change', onChange); narrow.removeEventListener('change', onChange); };
}
function viewportPlaceholder() {
  return window.innerWidth < 360 ? 'Nome, tag ou ID' : window.innerWidth < 960 ? 'Clube, jogador, notícia' : 'Clube, jogador ou notícia';
}

function ArticleImage({ src }: { src: string | null }) {
  const [failed, setFailed] = useState(false);
  // External admin uploads keep the native Figma image fit and handle broken URLs locally.
  // eslint-disable-next-line @next/next/no-img-element
  return src && !failed ? <img src={src} alt="" onError={() => setFailed(true)} /> : <CpmIcon name="searchNews" />;
}

function ResultRow({ row, onNav }: { row: SearchResult; onNav: Props['onNav'] }) {
  const reduced = useReducedMotion();
  const page = row.kind === 'News' ? 'article' : 'club';
  const param = row.kind === 'News' ? row.id : row.club_id ?? row.id;
  const href = (page === 'article' ? '/noticia/' : '/clube/') + encodeURIComponent(param);
  const open = (event: MouseEvent<HTMLAnchorElement>) => {
    if (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault(); onNav(page, param);
  };
  return <motion.a href={href} onClick={open} className={'cpm-search-result' + (row.kind === 'News' ? ' is-news' : '')} aria-label={row.title + (row.kind === 'Player' ? ', ID ' + row.game_id + ', clube ' + (row.subtitle ?? '') : '')} whileTap={reduced ? undefined : { scale: 0.997 }} transition={{ duration: 0.12 }}>
    <span className="cpm-search-identity">
      {row.kind === 'News' ? <ArticleImage key={row.image} src={row.image} /> : <Crest id={param} club={{ nome: row.kind === 'Club' ? row.title : row.subtitle ?? '', logo_url: row.image }} size={32} height={36.5714} />}
    </span>
    <span className="cpm-search-result-content">
      <span className="cpm-search-result-title">{row.title}</span>
      <span className="cpm-search-result-meta">
        {row.kind === 'Player' ? <><span className="cpm-search-player-id">#{row.game_id}</span><span>{row.subtitle}</span></> : row.kind === 'News' ? <span>{[row.date_str, row.tag].filter(Boolean).join(' · ')}</span> : <span>{row.tag}</span>}
      </span>
    </span>
    <span className="cpm-search-result-arrow"><CpmIcon name="searchChevron" /></span>
  </motion.a>;
}

function Notice({ title, children, onAction, action, error = false }: { title: string; children: ReactNode; onAction: () => void; action: string; error?: boolean }) {
  return <div className="cpm-search-notice"><div className="cpm-search-notice-heading"><CpmIcon name={error ? 'searchAlert' : 'search'} /><h2>{title}</h2></div><p>{children}</p><CpmAction primary={error} onClick={onAction}>{action}</CpmAction></div>;
}

function LoadingRows({ kind }: { kind: SearchKind }) {
  return <div className="cpm-search-loading" aria-busy="true" aria-label={'Carregando ' + labels[kind].toLowerCase()}>{[0, 1].map(i => <div className="cpm-search-skeleton" key={i}><span /><div><span /><span /></div></div>)}</div>;
}

export function SearchScreen({ onNav, onBack, state, onStateChange }: Props) {
  const { query, category } = state;
  const setQuery = (query: string) => onStateChange({ query, category });
  const setCategory = (category: SearchCategory) => onStateChange({ query, category });
  const placeholder = useSyncExternalStore(subscribeViewport, viewportPlaceholder, () => 'Clube, jogador ou notícia');
  const input = useRef<HTMLInputElement>(null), reduced = useReducedMotion();
  const resources = useSearch(query), searching = Boolean(query.trim());
  const active = searching ? kinds : ['Club'] as SearchKind[];
  const totalShown = active.reduce((sum, kind) => sum + resources[kind].rows.length, 0);
  const pending = active.some(kind => resources[kind].pending), failed = active.some(kind => resources[kind].error);
  const unavailable = active.every(kind => resources[kind].error);
  const displayed = searching ? category === 'All' ? kinds : [category] : ['Club'] as SearchKind[];
  const empty = searching && displayed.every(kind => !resources[kind].pending && !resources[kind].error && !resources[kind].rows.length);
  const clear = () => { onStateChange({ query: '', category: 'All' }); input.current?.focus(); };
  const retryAll = () => active.filter(kind => resources[kind].error).forEach(kind => resources[kind].retry());
  const back = () => onBack ? onBack() : onNav('home');
  const summary = pending ? resources.Player.pending && !resources.Club.pending && !resources.News.pending ? 'Buscando jogadores…' : 'Buscando…' : totalShown + ' resultado' + (totalShown === 1 ? '' : 's') + (failed ? ' disponíveis' : '');
  const selectedSummary = category === 'All' || pending || failed ? summary : resources[category].rows.length + ' ' + (category === 'Club' ? resources.Club.rows.length === 1 ? 'clube' : 'clubes' : category === 'Player' ? resources.Player.rows.length === 1 ? 'jogador' : 'jogadores' : resources.News.rows.length === 1 ? 'notícia' : 'notícias');
  return <div className="cpm-search" onKeyDown={event => { if (event.key === 'Escape' && !event.defaultPrevented && !(event.target as HTMLElement).closest('[role="menu"]')) { event.preventDefault(); back(); } }}>
    <div className="cpm-search-content">
      <div className="cpm-search-heading"><button type="button" className="cpm-search-icon-button" aria-label="Voltar" onClick={back}><CpmIcon name="searchBack" /></button><h1>Buscar</h1><span className="cpm-search-escape" aria-hidden="true">Esc</span></div>
      <div className="cpm-search-query">
        <form role="search" aria-label="Pesquisa da CPM" onSubmit={event => event.preventDefault()} className={'cpm-search-field' + (unavailable ? ' is-disabled' : '')}>
          <span className="cpm-search-field-icon"><CpmIcon name="search" /></span>
          <label htmlFor="cpm-search-input" className="cpm-sr-only">Buscar clube por nome ou tag, jogador por nick ou ID, ou notícia por título</label>
          <input ref={input} id="cpm-search-input" type="search" autoFocus autoComplete="off" maxLength={120} value={query} disabled={unavailable} onChange={event => setQuery(event.target.value)} placeholder={placeholder} aria-describedby="cpm-search-status" />
          {query && !unavailable ? <button type="button" className="cpm-search-icon-button" aria-label="Limpar busca" onClick={clear}><CpmIcon name="searchClose" /></button> : <span className="cpm-search-field-spacer" aria-hidden="true" />}
        </form>
        {searching ? <div className="cpm-search-categories" role="group" aria-label="Filtrar resultados">{(['All', ...kinds] as SearchCategory[]).map(kind => {
          const known = kind === 'All' ? !pending && !failed : !resources[kind].pending && !resources[kind].error;
          return <button type="button" key={kind} className={'cpm-search-category' + (category === kind ? ' is-selected' : '')} aria-pressed={category === kind} disabled={unavailable} onClick={() => setCategory(kind)}><span className="cpm-search-category-icon"><CpmIcon name={icons[kind]} /></span><span>{kind === 'All' ? 'Tudo' : labels[kind]}</span><span className="cpm-search-category-count">{known ? kind === 'All' ? totalShown : resources[kind].rows.length : ''}</span></button>;
        })}</div> : <div className="cpm-search-hints" aria-hidden="true"><span><CpmIcon name="searchShield" />Nome / tag</span><span><CpmIcon name="user" />Nick / ID</span><span><CpmIcon name="searchNews" />Título</span></div>}
      </div>
      <div className="cpm-search-body">
        <p id="cpm-search-status" role="status" aria-atomic="true" className={searching ? 'cpm-search-summary' : 'cpm-sr-only'}>{searching ? selectedSummary : resources.Club.pending ? 'Carregando clubes' : unavailable ? 'Busca indisponível' : 'Busque por nome, tag, nick, ID ou título'}</p>
        <div className={'cpm-search-columns' + (!searching ? ' is-initial' : '')}>
          <motion.div className="cpm-search-results" key={category} initial={reduced ? false : { opacity: 0.85 }} animate={{ opacity: 1 }} transition={{ duration: 0.12, ease: 'easeOut' }}>
            {unavailable ? <Notice error title="Busca indisponível" action="Tentar novamente" onAction={retryAll}>Não foi possível carregar os dados. Tente novamente.</Notice> : empty ? <Notice title="Nenhum resultado" action="Limpar busca" onAction={clear}>Não encontramos “{query.trim()}”{category !== 'All' ? ' em ' + labels[category].toLowerCase() : ''}. Confira o nome ou tente a tag ou o ID.</Notice> : displayed.map(kind => {
              const resource = resources[kind];
              if (resource.error) return <Notice error key={kind} title={labels[kind] + ' indisponíveis'} action="Tentar novamente" onAction={resource.retry}>{kind === 'Player' && !resources.Club.error && !resources.News.error ? 'Clubes e notícias continuam disponíveis. Tente buscar os jogadores novamente.' : 'Tente carregar ' + labels[kind].toLowerCase() + ' novamente.'}</Notice>;
              if (!resource.pending && !resource.rows.length) return null;
              return <section key={kind} className="cpm-search-group" aria-label={labels[kind]}>
                <div className="cpm-search-group-heading"><CpmIcon name={icons[kind]} /><h2>{labels[kind]}</h2>{!resource.pending && <span>{resource.rows.length}</span>}</div>
                {resource.pending ? <LoadingRows kind={kind} /> : <div className="cpm-search-rows">{resource.rows.map(row => <ResultRow key={row.id} row={row} onNav={onNav} />)}</div>}
                {searching && !resource.pending && resource.rows.length < resource.total && <button type="button" className="cpm-button cpm-search-more" disabled={resource.morePending} onClick={() => void resource.loadMore()}>{resource.morePending ? 'Carregando…' : resource.moreError ? 'Tentar carregar mais' : 'Ver mais ' + labels[kind].toLowerCase()}</button>}
                {resource.moreError && <p role="status" className="cpm-search-page-error">Não foi possível carregar mais resultados. Os anteriores continuam disponíveis.</p>}
              </section>;
            })}
            {!searching && !resources.Club.pending && !unavailable && !resources.Club.rows.length && <Notice title="Nenhum clube cadastrado" action="Ver jogos" onAction={() => onNav('jogos')}>Os clubes aparecerão aqui quando forem cadastrados.</Notice>}
          </motion.div>
          <aside className="cpm-search-direct" aria-label="Acessos diretos"><h2>Ir direto</h2><div>{shortcuts.map(item => <button type="button" key={item.page} onClick={() => onNav(item.page)}><span className="cpm-search-direct-icon"><CpmIcon name={item.icon} /></span><span>{item.label}</span><CpmIcon name="searchChevron" /></button>)}</div></aside>
        </div>
      </div>
    </div>
  </div>;
}
