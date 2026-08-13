'use client';

import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { useData } from '@/contexts/DataContext';
import { I } from '@/components/icons';
import { TopAppBar } from '@/components/ui/TopAppBar';
import { SheetItem } from '@/components/ui/Sheet';
import { Crest } from '@/components/ui/Crest';
import { shareLink } from '@/lib/share';
import { pathForPage } from '@/lib/routes';

import { SkeletonNewsCard, SkeletonArticleBody } from '@/components/ui/Skeleton';

interface Props {
  onNav: (page: string, param?: string | number | null) => void;
  onBack?: () => void;
  articleId?: string;
}

const CATS: { value: string; label: string }[] = [
  { value: 'todas', label: 'Todas' },
  { value: 'noticia', label: 'Notícias' },
  { value: 'resultado', label: 'Resultados' },
  { value: 'inscricoes', label: 'Inscrições' },
  { value: 'comunicado', label: 'Comunicados' },
];

export function NewsScreen({ onNav }: { onNav: Props['onNav'] }) {
  const [active, setActive] = useState('todas');
  const { news, loading } = useData();

  if (loading) {
    return (
      <>
        <TopAppBar large title="Notícias" subhead="Cobertura oficial CPM" />
        <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <SkeletonNewsCard />
          <SkeletonNewsCard />
          <SkeletonNewsCard />
        </div>
      </>
    );
  }

  const filtered = active === 'todas' ? news : news.filter(n => n.category === active);
  const featured = filtered[0];
  const list = filtered.slice(1);

  if (news.length === 0) {
    return (
      <>
        <TopAppBar large title="Notícias" subhead="Cobertura oficial CPM" />
        <div className="empty" style={{ marginTop: 48 }}>
          <div className="empty-icon">{I.news}</div>
          <h3 style={{ margin: '0 0 8px', fontSize: 17, fontWeight: 700, color: 'var(--on-surface)' }}>Nenhuma notícia ainda</h3>
          <p style={{ margin: 0, fontSize: 14 }}>As novidades da temporada aparecem aqui em breve.</p>
        </div>
      </>
    );
  }

  return (
    <>
      <TopAppBar large title="Notícias" subhead="Cobertura oficial CPM" />

      <div style={{ padding: '0 16px 14px', display: 'flex', gap: 8, overflowX: 'auto' }} className="hide-scrollbar">
        {CATS.map(c => (
          <button key={c.value} onClick={() => setActive(c.value)} className="tap"
            style={{ flex: '0 0 auto', height: 36, padding: '0 16px', borderRadius: 8, background: active === c.value ? 'var(--primary)' : 'transparent', color: active === c.value ? 'var(--on-primary)' : 'var(--on-surface)', border: '1px solid ' + (active === c.value ? 'transparent' : 'var(--outline-variant)'), fontWeight: active === c.value ? 700 : 500, fontSize: 13, whiteSpace: 'nowrap' }}>
            {c.label}
          </button>
        ))}
      </div>

      {!featured ? (
        <div className="empty" style={{ marginTop: 24 }}>
          <div className="empty-icon">{I.news}</div>
          <p style={{ margin: 0, fontSize: 14 }}>Nenhuma notícia nessa categoria.</p>
        </div>
      ) : (
      <>
      {/* Featured article — full width (stacked on mobile, lado a lado no desktop) */}
      <div style={{ padding: '0 16px 16px' }}>
        <button onClick={() => onNav('article', featured.id)} className="tap" style={{ width: '100%', textAlign: 'left' }}>
          <div className="card-filled d-news-hero">
            <div className="ph-img" data-label={featured.img} style={{ aspectRatio: '16/9' }} />
            <div className="d-news-hero-body" style={{ padding: '16px 18px 18px' }}>
              <div className="eyebrow eyebrow-acc">{featured.tag} · {featured.date}</div>
              <h3 style={{ margin: '6px 0 8px', fontSize: 18, fontWeight: 700, lineHeight: 1.25, letterSpacing: '-0.005em' }}>{featured.title}</h3>
              <p style={{ margin: 0, fontSize: 13.5, color: 'var(--on-surface-variant)', lineHeight: 1.5 }}>{featured.excerpt}</p>
            </div>
          </div>
        </button>
      </div>

      {/* Article list — 3-column grid on desktop, stacked list on mobile */}
      <div style={{ padding: '0 16px' }}>
        <div className="d-news-grid">
          {list.map(n => (
            <button key={n.id} onClick={() => onNav('article', n.id)} className="tap"
              style={{ width: '100%', textAlign: 'left' }}>
              <div className="card-filled" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <div className="ph-img" data-label="" style={{ aspectRatio: '16/9' }} />
                <div style={{ padding: '12px 14px 14px', flex: 1 }}>
                  <div className="eyebrow">{n.tag} · {n.date}</div>
                  <div style={{ fontSize: 14.5, fontWeight: 600, lineHeight: 1.3, marginTop: 6 }}>{n.title}</div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
      </>
      )}
    </>
  );
}

function ArticleMatchCard({ matchId, onNav }: { matchId: number; onNav: Props['onNav'] }) {
  const { matches, clubById } = useData();
  const m = matches.find(x => x.id === matchId);
  if (!m) return null;
  const home = clubById(m.home), away = clubById(m.away);
  if (!home || !away) return null;
  return (
    <button onClick={() => onNav('match', m.id)} className="tap" style={{ width: '100%', textAlign: 'left', marginBottom: 22 }}>
      <div className="card-filled" style={{ padding: '16px 18px' }}>
        <div className="eyebrow eyebrow-acc" style={{ marginBottom: 12 }}>Resultado da partida</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: 10 }}>
          <div style={{ textAlign: 'center' }}>
            <Crest id={home.id} size={40} radius={12} />
            <div style={{ fontSize: 12.5, fontWeight: 700, marginTop: 6 }}>{home.tag}</div>
          </div>
          <span className="mono tabular" style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.03em' }}>{m.scoreH} — {m.scoreA}</span>
          <div style={{ textAlign: 'center' }}>
            <Crest id={away.id} size={40} radius={12} />
            <div style={{ fontSize: 12.5, fontWeight: 700, marginTop: 6 }}>{away.tag}</div>
          </div>
        </div>
        <div style={{ textAlign: 'center', marginTop: 10, fontSize: 12, color: 'var(--on-surface-variant)' }}>{m.stage} · {m.date}</div>
      </div>
    </button>
  );
}

function ArticleSubscriptionCard({ competitionId, onNav }: { competitionId: string; onNav: Props['onNav'] }) {
  const { competitions } = useData();
  const c = competitions.find(x => x.id === competitionId);
  if (!c) return null;
  const open = c.status === 'inscricoes';
  return (
    <div className="card-filled" style={{ padding: '16px 18px', marginBottom: 22 }}>
      <div className="eyebrow eyebrow-acc" style={{ marginBottom: 6 }}>{open ? 'Inscrições abertas' : 'Inscrições encerradas'}</div>
      <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>{c.nome} {c.edicao}</div>
      {open ? (
        <button onClick={() => onNav('subscription', c.id)} className="btn btn-primary" style={{ height: 42, width: '100%', marginTop: 10 }}>
          Inscrever meu time
        </button>
      ) : (
        <div style={{ fontSize: 13, color: 'var(--on-surface-variant)' }}>As inscrições dessa competição já foram encerradas.</div>
      )}
    </div>
  );
}

export function ArticleScreen({ onBack, onNav, articleId }: Props) {
  const { news, loading } = useData();

  if (loading) {
    return (
      <div aria-busy="true" aria-label="Carregando artigo">
        <div style={{ position: 'sticky', top: 0, zIndex: 30, background: 'var(--surface)' }}>
          <TopAppBar showBack onBack={onBack} title="" />
        </div>
        <SkeletonArticleBody />
      </div>
    );
  }

  const n = news.find(x => x.id === articleId) ?? news[0];
  const { bookmarks, toggleBookmark, showToast } = useApp();
  if (!n) return <div className="empty"><p>Artigo não encontrado.</p></div>;
  const bk = 'art:' + n.id;
  const isB = bookmarks.has(bk);

  const menu = (close: () => void) => (
    <>
      <SheetItem icon={isB ? 'starFilled' : 'star'} label={isB ? 'Remover dos salvos' : 'Salvar artigo'} on={isB}
        onClick={() => { toggleBookmark(bk); showToast(isB ? 'Removido dos salvos' : 'Artigo salvo'); }} />
      <SheetItem icon="share" label="Compartilhar" onClick={async () => {
        close();
        const r = await shareLink({ title: n.title, text: `${n.title} · CPM MamoBall`, url: `${window.location.origin}${pathForPage('article', n.id)}` });
        if (r === 'copied') showToast('Link copiado');
        else if (r === 'failed') showToast('Não foi possível compartilhar');
      }} />
    </>
  );

  return (
    <>
      <div style={{ position: 'sticky', top: 0, zIndex: 30, background: 'var(--surface)' }}>
        <TopAppBar showBack onBack={onBack} title="" menu={menu}
          rightExtras={
            <button className={`icon-btn${isB ? ' is-on' : ''}`}
              onClick={() => { toggleBookmark(bk); showToast(isB ? 'Removido dos salvos' : 'Artigo salvo'); }}>
              {isB ? I.starFilled : I.star}
            </button>
          }
        />
      </div>

      <article>
        <div className="ph-img" data-label={n.img} style={{ aspectRatio: '16/9', borderRadius: 0 }} />
        <div style={{ padding: '20px 20px 28px' }}>
          <div className="eyebrow eyebrow-acc" style={{ marginBottom: 10 }}>{n.tag} · {n.date} · {n.readTime}</div>
          <h1 style={{ margin: '0 0 16px', fontSize: 26, lineHeight: 1.18, fontWeight: 800, letterSpacing: '-0.02em' }}>{n.title}</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 22 }}>
            <span style={{ width: 32, height: 32, borderRadius: 999, background: 'var(--surface-c-high)', display: 'grid', placeItems: 'center', fontSize: 12, fontWeight: 700 }}>{n.author[0]}</span>
            <div>
              <div style={{ fontSize: 13.5, fontWeight: 600 }}>{n.author}</div>
              <div style={{ fontSize: 11.5, color: 'var(--on-surface-variant)' }}>{n.date}</div>
            </div>
          </div>
          <p style={{ fontSize: 17, fontWeight: 500, color: 'var(--on-surface)', lineHeight: 1.55, margin: '0 0 20px' }}>{n.excerpt}</p>
          {n.category === 'resultado' && n.match_id !== null && <ArticleMatchCard matchId={n.match_id} onNav={onNav} />}
          {n.category === 'inscricoes' && n.competition_id !== null && <ArticleSubscriptionCard competitionId={n.competition_id} onNav={onNav} />}
          {n.body.trim()
            ? n.body.split(/\n\s*\n/).map((paragraph, i) => (
                <p key={i} style={{ fontSize: 15.5, color: 'var(--on-surface-variant)', lineHeight: 1.7, margin: '0 0 16px' }}>{paragraph.trim()}</p>
              ))
            : (
                <p style={{ fontSize: 14, color: 'var(--on-surface-variant)', fontStyle: 'italic' }}>Sem mais detalhes cadastrados pra essa notícia.</p>
              )}
        </div>
      </article>
    </>
  );
}
