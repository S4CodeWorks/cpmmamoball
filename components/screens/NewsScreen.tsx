'use client';

import { useEffect, useState, type MouseEvent, type ReactNode } from 'react';
import { useApp } from '@/contexts/AppContext';
import { CpmIcon, CpmPopover, type CpmIconName } from '@/components/ui/CpmUi';
import { MatchScoreboard } from './MatchScreen';
import { fetchNews, fetchNewsById, fetchMatchById, fetchClubById, fetchCompetitions, type Competition } from '@/lib/db';
import type { NewsItem, Match, Club } from '@/lib/types';
import { shareLink } from '@/lib/share';
import { pathForPage } from '@/lib/routes';

type Navigate = (page: string, param?: string | number | null) => void;
interface Props { onNav: Navigate; onBack?: () => void; articleId?: string }
const categories: { value: string; label: string; icon: CpmIconName }[] = [
  { value: 'todas', label: 'Todas', icon: 'searchNews' },
  { value: 'noticia', label: 'Notícias', icon: 'searchNews' },
  { value: 'resultado', label: 'Resultados', icon: 'matchBall' },
  { value: 'inscricoes', label: 'Inscrições', icon: 'ticket' },
  { value: 'comunicado', label: 'Comunicados', icon: 'matchBell' },
];

function navigate(event: MouseEvent<HTMLAnchorElement>, open: () => void) {
  if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  event.preventDefault(); open();
}

function useNewsResource(id?: string) {
  const [resource, setResource] = useState<{ key: string; data: NewsItem[]; state: 'loading' | 'ready' | 'error' } | null>(null);
  const [attempt, setAttempt] = useState(0), key = id ?? 'list';
  useEffect(() => {
    const controller = new AbortController(); let active = true;
    const timer = setTimeout(() => controller.abort(), 12000);
    (id !== undefined ? id ? fetchNewsById(id, controller.signal).then(item => item ? [item] : []) : Promise.resolve([]) : fetchNews(controller.signal))
      .then(data => { if (active) setResource({ key, data, state: 'ready' }); })
      .catch(() => { if (active) setResource({ key, data: [], state: 'error' }); })
      .finally(() => clearTimeout(timer));
    return () => { active = false; clearTimeout(timer); controller.abort(); };
  }, [id, key, attempt]);
  return { data: resource?.key === key ? resource.data : [], state: resource?.key === key ? resource.state : 'loading', retry: () => { setResource(null); setAttempt(value => value + 1); } };
}

function NewsState({ icon = 'searchNews', title, action, onAction }: { icon?: CpmIconName; title: string; action?: string; onAction?: () => void }) {
  return <div className="cpm-editorial-state"><span><CpmIcon name={icon}/></span><h2>{title}</h2>{action && <button type="button" className="cpm-editorial-state-action" onClick={onAction}><CpmIcon name="arrow"/>{action}</button>}</div>;
}

function Loading({ article = false }: { article?: boolean }) {
  return <div className={'cpm-editorial-loading' + (article ? ' is-reading' : '')} role="status" aria-label={article ? 'Carregando notícia' : 'Carregando notícias'} aria-busy="true">{[0, 1, 2].map(index => <div key={index} aria-hidden="true"><span/><span/><span/></div>)}</div>;
}

function Metadata({ item, author = false }: { item: NewsItem; author?: boolean }) {
  return <div className="cpm-editorial-meta">
    {item.date?.trim() && <span><CpmIcon name="calendar"/>{item.date}</span>}
    {item.readTime?.trim() && <span><CpmIcon name="clock"/>{item.readTime}</span>}
    {author && item.author?.trim() && <span><CpmIcon name="user"/>{item.author}</span>}
  </div>;
}

function Cover({ src, reading = false }: { src?: string; reading?: boolean }) {
  const [failed, setFailed] = useState<string | null>(null);
  if (!src?.trim() || failed === src) return null;
  const brand = src.split('?')[0] === '/cpm-official.jpg';
  return <div className={'cpm-editorial-cover' + (reading ? ' is-reading' : '') + (brand ? ' is-brand' : '')}>
    {/* eslint-disable-next-line @next/next/no-img-element -- preserve original uploaded editorial imagery. */}
    <img src={src} alt="" decoding="async" onError={() => setFailed(src)}/>
  </div>;
}

export function NewsScreen({ onNav }: { onNav: Navigate }) {
  const { data: news, state, retry } = useNewsResource();
  const [active, setActive] = useState('todas');
  const selected = categories.find(category => category.value === active)!;
  const filtered = active === 'todas' ? news : news.filter(item => item.category === active);
  const count = (value: string) => state === 'ready' ? value === 'todas' ? news.length : news.filter(item => item.category === value).length : null;
  const lead = filtered[0];
  return <main className={"cpm-editorial cpm-editorial-list" + (state === 'loading' ? ' is-loading' : '')}>
    <div className="cpm-editorial-title"><CpmIcon name="searchNews"/><h1>Notícias</h1></div>
    {state !== 'loading' && <><div className="cpm-editorial-categories" aria-label="Categorias de notícias">{categories.map(category => <button type="button" key={category.value} aria-pressed={active === category.value} className={active === category.value ? 'is-selected' : ''} onClick={() => setActive(category.value)}><CpmIcon name={category.icon}/>{category.label}{count(category.value) !== null && <small>{count(category.value)}</small>}</button>)}</div>
    <CpmPopover className="cpm-editorial-selector" label="Categoria de notícias" role="listbox" trigger={<><CpmIcon name={selected.icon}/><span>{active === 'todas' ? 'Todas as notícias' : selected.label}</span>{count(active) !== null && <small>{count(active)}</small>}<CpmIcon name="chevron"/></>}>
      {close => categories.map(category => <button type="button" role="option" aria-selected={category.value === active} key={category.value} onClick={() => { setActive(category.value); close(); }}><CpmIcon name={category.icon}/><span>{category.value === 'todas' ? 'Todas as notícias' : category.label}</span>{count(category.value) !== null && <small>{count(category.value)}</small>}{category.value === active && <CpmIcon name="authCheck"/>}</button>)}
    </CpmPopover></>}
    <span className="cpm-visually-hidden" role="status">{state === 'ready' ? `${filtered.length} ${filtered.length === 1 ? 'notícia' : 'notícias'}` : ''}</span>
    {state === 'loading' ? <Loading/> : state === 'error' ? <NewsState icon="searchAlert" title="Não foi possível carregar" action="Tentar novamente" onAction={retry}/> : !lead ? <NewsState title={news.length ? 'Nenhuma notícia nesta categoria' : 'Nenhuma notícia ainda'} action={news.length ? 'Ver todas' : undefined} onAction={() => setActive('todas')}/> : <>
      <a className="cpm-editorial-lead" href={pathForPage('article', lead.id)!} onClick={event => navigate(event, () => onNav('article', lead.id))}>
        <Cover key={lead.id} src={lead.img}/><div className="cpm-editorial-lead-copy"><h2>{lead.title}</h2>{lead.excerpt?.trim() && <p>{lead.excerpt}</p>}<Metadata item={lead}/><span className="cpm-editorial-read">Ler notícia<CpmIcon name="arrow"/></span></div>
      </a>
      <div className="cpm-editorial-rows">{filtered.slice(1).map(item => <a href={pathForPage('article', item.id)!} key={item.id} onClick={event => navigate(event, () => onNav('article', item.id))} className="cpm-editorial-row">
        <span className="cpm-editorial-row-icon"><CpmIcon name={categories.find(category => category.value === item.category)?.icon ?? 'searchNews'}/></span>
        <span className="cpm-editorial-row-copy"><h2>{item.title}</h2>{(item.excerpt?.trim() || item.tag?.trim()) && <small>{item.excerpt?.trim() || item.tag}</small>}{item.date?.trim() && <span className="cpm-editorial-row-date"><CpmIcon name="calendar"/>{item.date}</span>}</span><span className="cpm-editorial-row-arrow"><CpmIcon name="arrow"/></span>
      </a>)}</div>
    </>}
  </main>;
}

type Related = { competition: Competition | null; match: Match | null; home: Club | null; away: Club | null };
function RelatedContent({ item, onNav, children }: { item: NewsItem; onNav: Navigate; children: ReactNode }) {
  const [result, setResult] = useState<{ key: string; data?: Related; error?: boolean } | null>(null), [attempt, setAttempt] = useState(0);
  const key = item.id + ':' + attempt;
  useEffect(() => {
    if (!item.match_id && !item.competition_id) return;
    let active = true;
    const timer = setTimeout(() => { if (active) { active = false; setResult({ key, error: true }); } }, 12000);
    const load = async () => {
      const match = item.match_id ? await fetchMatchById(item.match_id) : null;
      const competitionId = item.competition_id ?? match?.competition_id;
      const [competitions, home, away] = await Promise.all([competitionId ? fetchCompetitions() : Promise.resolve([]), match ? fetchClubById(match.home) : Promise.resolve(null), match ? fetchClubById(match.away) : Promise.resolve(null)]);
      if (active) setResult({ key, data: { competition: competitions.find(comp => comp.id === competitionId) ?? null, match, home, away } });
    };
    load().catch(() => { if (active) setResult({ key, error: true }); }).finally(() => clearTimeout(timer));
    return () => { active = false; clearTimeout(timer); };
  }, [item.match_id, item.competition_id, key]);
  const related = result?.key === key ? result.data : null;
  const comp = related?.competition, match = related?.match;
  const compName = comp ? [comp.nome, comp.edicao].filter(Boolean).join(' ') : '';
  const open = comp?.status === 'inscricoes';
  const destination = match ? { page: 'match', id: match.id, label: 'Ver partida', icon: 'matchBall' as const } : comp ? { page: item.category === 'inscricoes' ? 'tournaments' : 'jogos', id: comp.id, label: item.category === 'inscricoes' ? 'Ver competição' : 'Ver jogos', icon: item.category === 'inscricoes' ? 'ticket' as const : 'calendar' as const } : null;
  return <>
    {(item.match_id || item.competition_id) && !result ? <div className="cpm-editorial-related-loading" role="status" aria-label="Carregando conteúdo relacionado"/> : result?.key === key && result.error ? <div className="cpm-editorial-related-error"><CpmIcon name="searchAlert"/><span>Conteúdo relacionado indisponível</span><button type="button" onClick={() => { setResult(null); setAttempt(value => value + 1); }}>Tentar novamente</button></div> : null}
    {item.category === 'resultado' && match && related?.home && related.away && <MatchScoreboard detail={{ match, home: related.home, away: related.away, competition: comp ?? null }} onNav={onNav}/>}
    {comp && (item.category === 'inscricoes' || item.category === 'comunicado') && <section className="cpm-editorial-context" aria-label="Competição relacionada">
      <div className="cpm-editorial-context-name"><span><CpmIcon name={item.category === 'inscricoes' ? 'ticket' : 'matchBell'}/></span><h2>{compName}</h2></div>
      <div className="cpm-editorial-context-status"><CpmIcon name={item.category === 'inscricoes' ? open ? 'authCheck' : 'authLock' : 'calendar'}/>{item.category === 'inscricoes' ? open ? 'Inscrições abertas' : 'Inscrições encerradas' : comp.rodada_atual ? 'Rodada ' + comp.rodada_atual : 'Programação'}</div>
      {item.category === 'inscricoes' && open && <button type="button" className="cpm-button cpm-button-primary" onClick={() => onNav('subscription', comp.id)}><CpmIcon name="ticket"/>Inscrever time<CpmIcon name="arrow"/></button>}
    </section>}
    {children}
    {destination && <button type="button" className="cpm-editorial-destination" onClick={() => onNav(destination.page, destination.id)}><CpmIcon name={destination.icon}/><span>{destination.label}</span><CpmIcon name="arrow"/></button>}
  </>;
}

export function ArticleScreen({ onNav, articleId }: Props) {
  const app = useApp();
  const { data, state, retry } = useNewsResource(articleId ?? '');
  const item = data[0], [pending, setPending] = useState(false);
  const back = () => onNav('news');
  const controls = <div className="cpm-editorial-controls"><button type="button" aria-label="Voltar às notícias" onClick={back}><CpmIcon name="searchBack"/><span>Notícias</span></button><span className="cpm-editorial-controls-spacer"/>{item && <>
    <button type="button" aria-label={app.bookmarks.has('art:' + item.id) ? 'Remover notícia dos salvos' : 'Salvar notícia'} aria-pressed={app.bookmarks.has('art:' + item.id)} disabled={pending || app.savedLoading} onClick={async () => { setPending(true); try { await app.saveWithFeedback('art:' + item.id, !app.bookmarks.has('art:' + item.id), 'Notícia'); } finally { setPending(false); } }}><CpmIcon name="bookmark"/><span>{app.bookmarks.has('art:' + item.id) ? 'Salvo' : 'Salvar'}</span></button>
    <button type="button" aria-label="Compartilhar notícia" onClick={async () => { const result = await shareLink({ title: item.title, text: item.title + ' · CPM MamoBall', url: window.location.origin + pathForPage('article', item.id) }); if (result === 'copied') app.showToast('Link copiado', { variant: 'copied' }); else if (result === 'failed') app.showError(new Error('Não foi possível compartilhar. Tente novamente.')); }}><CpmIcon name="matchShare"/><span>Compartilhar</span></button>
  </>}</div>;
  return <main className="cpm-editorial cpm-editorial-article">{controls}{state === 'loading' ? <Loading article/> : state === 'error' ? <NewsState icon="searchAlert" title="Não foi possível carregar" action="Tentar novamente" onAction={retry}/> : !item ? <NewsState title="Notícia não encontrada" action="Ver notícias" onAction={back}/> : <article key={item.id}>
    <h1>{item.title}</h1><Metadata item={item} author/><Cover src={item.img} reading/>{item.excerpt?.trim() && <p className="cpm-editorial-excerpt">{item.excerpt}</p>}
    <RelatedContent item={item} onNav={onNav}><div className="cpm-editorial-prose">{item.body?.trim() && item.body.split(/\n\s*\n/).filter(paragraph => paragraph.trim()).map((paragraph, index) => <p key={index}>{paragraph.trim()}</p>)}</div></RelatedContent>
  </article>}</main>;
}
