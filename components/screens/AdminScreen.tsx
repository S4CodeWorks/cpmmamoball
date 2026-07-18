'use client';

import React, { useRef, useState, useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { I } from '@/components/icons';
import { TopAppBar } from '@/components/ui/TopAppBar';
import { useIsDesktop } from '@/hooks/useIsDesktop';
import { Crest } from '@/components/ui/Crest';
import { FieldLabel, usePagination, PageBar } from '@/components/ui/Primitives';
import { compressImage } from '@/lib/compress';
import { extractCrestColors } from '@/lib/extractColors';
import { uploadClubLogo, deleteClubLogo } from '@/lib/storage';
import { sendBroadcast } from '@/lib/push';
import { pathForPage } from '@/lib/routes';
import {
  createClub, updateClub, deleteClub,
  createCompetition, updateCompetition, deleteCompetition,
  fetchMatches, createMatch, updateMatch, deleteMatch,
  createNews, deleteNews,
  updateInscricaoStatus,
  fetchPlayers, createPlayer, updatePlayer, deletePlayer,
  fetchPlayerCompetitions, setPlayerCompetitions,
  fetchClubsInCompetition, enrollClubWithRoster, unenrollClubWithRoster,
  upsertScorer, deleteScorersForCompetition, upsertStanding,
} from '@/lib/db';
import type { Competition } from '@/lib/db';
import type { Club, Player, Match, Position, GoalEntry, NewsCategory } from '@/lib/types';

const POSICOES: Position[] = ['GK', 'VL', 'PV/ATK', 'MC'];

interface NavProps {
  onNav: (page: string, param?: string | number | null) => void;
  onBack?: () => void;
}

// ── Slug helpers ──────────────────────────────────────────────────────────────

function slugify(text: string): string {
  return (
    text
      .toLowerCase()
      .normalize('NFD')
      .replace(/\p{Mn}/gu, '') // remove acentos: á→a, ç→c, etc.
      .replace(/[^a-z0-9\s]/g, '')     // remove caracteres especiais
      .trim()
      .replace(/\s+/g, '-')            // espaços → hífens
      .replace(/-+/g, '-')             // colapsa hífens duplos
    || 'clube'
  );
}

function uniqueSlug(base: string, takenIds: string[]): string {
  if (!takenIds.includes(base)) return base;
  let n = 2;
  while (takenIds.includes(`${base}-${n}`)) n++;
  return `${base}-${n}`;
}

type Section = 'dashboard' | 'inscricoes' | 'times' | 'partidas' | 'noticias' | 'competicoes';

const SECTIONS: { id: Section; label: string; icon: string }[] = [
  { id: 'dashboard',   label: 'Início',      icon: 'dashboard' },
  { id: 'inscricoes',  label: 'Inscrições',  icon: 'ticket' },
  { id: 'times',       label: 'Times',       icon: 'shield' },
  { id: 'partidas',    label: 'Partidas',    icon: 'ball' },
  { id: 'noticias',    label: 'Notícias',    icon: 'news' },
  { id: 'competicoes', label: 'Competições', icon: 'trophy' },
];

// Crest monocromático do design (tile com sigla mono), com fallback pra logo real quando existir.
function DcCrest({ clubId, size = 34 }: { clubId: string; size?: number }) {
  const { clubById } = useData();
  const c = clubById(clubId);
  const r = size <= 26 ? 7 : 9;
  const st: React.CSSProperties = { width: size, height: size, borderRadius: r, background: 'var(--dc-surface-3)', border: '1px solid var(--dc-border-2)', display: 'grid', placeItems: 'center', fontWeight: 700, fontSize: size <= 26 ? 9.5 : 11.5, letterSpacing: '-0.02em', color: size <= 26 ? 'var(--dc-text-2)' : 'var(--dc-text)', fontFamily: 'var(--dc-mono)', flexShrink: 0, overflow: 'hidden' };
  if (!c) return <div style={st} />;
  if (c.logo_url) return <img src={c.logo_url} alt={c.nome} style={{ ...st, objectFit: 'cover' }} />;
  return <div style={st}>{c.tag}</div>;
}

// Mesma tile monocromática, mas só com a sigla em texto (times ainda não criados — ex. inscrições pendentes)
function DcCrestByTag({ tag, size = 48 }: { tag: string; size?: number }) {
  return (
    <div style={{ width: size, height: size, borderRadius: 12, background: 'var(--dc-surface-3)', border: '1px solid var(--dc-border-2)', display: 'grid', placeItems: 'center', fontWeight: 800, fontSize: 14, fontFamily: 'var(--dc-mono)', color: 'var(--dc-text)', flexShrink: 0 }}>
      {tag}
    </div>
  );
}

// ── Dashboard ─────────────────────────────────────────────────────────────────

function DcKpi({ icon, n, l, hot, color }: { icon: string; n: string; l: string; hot?: boolean; color?: string }) {
  return (
    <div style={{ border: '1px solid var(--dc-border)', borderRadius: 16, background: 'var(--dc-surface)', padding: '16px 18px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <span style={{ width: 34, height: 34, borderRadius: 9, background: 'var(--dc-surface-2)', border: '1px solid var(--dc-border)', color: 'var(--dc-text-2)', display: 'grid', placeItems: 'center' }}>{I[icon]}</span>
        {hot && <span style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--dc-live)', background: 'var(--dc-live-bg)', padding: '3px 8px', borderRadius: 99, letterSpacing: '0.02em' }}>AÇÃO</span>}
      </div>
      <div style={{ fontFamily: 'var(--dc-mono)', fontSize: 30, fontWeight: 600, letterSpacing: '-0.03em', lineHeight: 1, color: color ?? 'var(--dc-text)' }}>{n}</div>
      <div style={{ fontSize: 12.5, color: 'var(--dc-text-2)', marginTop: 7, fontWeight: 500 }}>{l}</div>
    </div>
  );
}

function AdminDashboard({ onSection }: { onSection: (s: Section) => void }) {
  const { clubs, matches, standings, inscricoes, activeComp, clubById } = useData();
  const isDesktop = useIsDesktop();
  const pendentes = inscricoes.filter(i => i.status === 'pendente');
  const semResultado = matches.filter(m => m.status === 'agendado');
  const upcoming = [...semResultado].sort((a, b) => a.rodada - b.rodada).slice(0, 4);
  const top5 = standings.slice(0, 5);

  return (
    <div style={{ animation: 'dcInFade .25s ease' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 20 }}>
        {activeComp ? (
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '7px 14px', borderRadius: 99, background: 'var(--dc-surface-2)', border: '1px solid var(--dc-border)' }}>
            <span style={{ width: 8, height: 8, borderRadius: 99, background: 'var(--dc-pos)', flexShrink: 0 }} />
            <span style={{ fontWeight: 700, fontSize: 13, color: 'var(--dc-text)' }}>{activeComp.nome} · {activeComp.edicao}</span>
            <span style={{ color: 'var(--dc-text-3)', fontSize: 12.5 }}>·</span>
            <span style={{ color: 'var(--dc-text-2)', fontSize: 12.5 }}>{rodadaLabel(activeComp.rodada_atual, activeComp.total_rodadas)}</span>
          </div>
        ) : (
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '7px 14px', borderRadius: 99, background: 'var(--dc-warn-bg)', color: 'var(--dc-warn)', fontSize: 13, fontWeight: 600 }}>
            Nenhuma competição ativa
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: isDesktop ? 'repeat(4,1fr)' : 'repeat(2,1fr)', gap: 14, marginBottom: 20 }}>
        <DcKpi icon="shield" n={String(clubs.length)} l="Clubes cadastrados" />
        <DcKpi icon="trophy" n={String(standings.length)} l="Na classificação" />
        <DcKpi icon="ball" n={String(matches.length)} l="Partidas" />
        <DcKpi icon="ticket" n={String(pendentes.length)} l="Inscrições pendentes" hot={pendentes.length > 0} color={pendentes.length > 0 ? 'var(--dc-live)' : undefined} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: isDesktop ? '1.5fr 1fr' : '1fr', gap: 16, alignItems: 'start' }}>
        {/* Próximas partidas */}
        <div style={{ border: '1px solid var(--dc-border)', borderRadius: 16, background: 'var(--dc-surface)', overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 18px', borderBottom: '1px solid var(--dc-border)' }}>
            <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: '-0.01em', color: 'var(--dc-text)' }}>Próximas partidas</div>
            <button onClick={() => onSection('partidas')} style={{ fontSize: 12.5, color: 'var(--dc-text-2)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Ver todas →</button>
          </div>
          {upcoming.length === 0 ? (
            <div style={{ padding: '28px 18px', textAlign: 'center', fontSize: 13, color: 'var(--dc-text-3)' }}>Nenhuma partida agendada.</div>
          ) : upcoming.map(m => {
            const home = clubById(m.home), away = clubById(m.away);
            return (
              <button key={m.id} onClick={() => onSection('partidas')}
                style={{ width: '100%', display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: 12, padding: '14px 18px', border: 'none', borderTop: '1px solid var(--dc-border)', background: 'transparent', cursor: 'pointer', textAlign: 'left', color: 'var(--dc-text)', fontFamily: 'var(--dc-sans)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'flex-end', minWidth: 0 }}>
                  <span style={{ fontSize: 13.5, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{home?.nome ?? '?'}</span>
                  <DcCrest clubId={m.home} />
                </div>
                <div style={{ textAlign: 'center', flexShrink: 0 }}>
                  <div style={{ fontFamily: 'var(--dc-mono)', fontSize: 11, color: 'var(--dc-text-3)', fontWeight: 500 }}>{m.date}</div>
                  <div style={{ fontSize: 10, color: 'var(--dc-text-3)', marginTop: 2 }}>Rod. {m.rodada}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                  <DcCrest clubId={m.away} />
                  <span style={{ fontSize: 13.5, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{away?.nome ?? '?'}</span>
                </div>
              </button>
            );
          })}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Inscrições pendentes */}
          <div style={{ border: '1px solid var(--dc-border)', borderRadius: 16, background: 'var(--dc-surface)', overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 18px', borderBottom: '1px solid var(--dc-border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--dc-text)' }}>Inscrições</span>
                <span style={{ minWidth: 20, height: 20, padding: '0 6px', borderRadius: 99, background: pendentes.length > 0 ? 'var(--dc-live)' : 'var(--dc-surface-3)', color: pendentes.length > 0 ? '#fff' : 'var(--dc-text-2)', fontSize: 11, fontWeight: 800, display: 'inline-grid', placeItems: 'center' }}>{pendentes.length}</span>
              </div>
              <button onClick={() => onSection('inscricoes')} style={{ fontSize: 12.5, color: 'var(--dc-text-2)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Analisar →</button>
            </div>
            {pendentes.length === 0 ? (
              <div style={{ padding: '24px 18px', textAlign: 'center', fontSize: 13, color: 'var(--dc-text-3)' }}>Tudo em dia.</div>
            ) : pendentes.slice(0, 3).map(p => (
              <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 18px', borderTop: '1px solid var(--dc-border)' }}>
                <div style={{ width: 34, height: 34, borderRadius: 9, background: 'var(--dc-surface-3)', border: '1px solid var(--dc-border-2)', display: 'grid', placeItems: 'center', fontWeight: 700, fontSize: 11.5, fontFamily: 'var(--dc-mono)', color: 'var(--dc-text)', flexShrink: 0 }}>{p.tag}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: 'var(--dc-text)' }}>{p.nome}</div>
                  <div style={{ fontSize: 11, color: 'var(--dc-text-3)' }}>{p.capitao} · {p.jogadores.length} jogadores</div>
                </div>
                <span style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--dc-warn)', background: 'var(--dc-warn-bg)', padding: '3px 9px', borderRadius: 99, flexShrink: 0 }}>Pendente</span>
              </div>
            ))}
          </div>

          {/* Classificação top 5 */}
          <div style={{ border: '1px solid var(--dc-border)', borderRadius: 16, background: 'var(--dc-surface)', overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 18px', borderBottom: '1px solid var(--dc-border)' }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--dc-text)' }}>Classificação</span>
              <span style={{ fontSize: 11.5, color: 'var(--dc-text-3)' }}>top 5</span>
            </div>
            {top5.length === 0 ? (
              <div style={{ padding: '24px 18px', textAlign: 'center', fontSize: 13, color: 'var(--dc-text-3)' }}>Sem dados ainda.</div>
            ) : (
              <div style={{ padding: '4px 0' }}>
                {top5.map((t, i) => {
                  const c = clubById(t.club);
                  return (
                    <div key={t.club} style={{ display: 'grid', gridTemplateColumns: '20px 1fr auto auto', alignItems: 'center', gap: 12, padding: '8px 18px' }}>
                      <span style={{ fontFamily: 'var(--dc-mono)', fontSize: 12, color: 'var(--dc-text-3)', fontWeight: 600, textAlign: 'center' }}>{i + 1}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 9, minWidth: 0 }}>
                        <DcCrest clubId={t.club} size={24} />
                        <span style={{ fontSize: 13, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: 'var(--dc-text)' }}>{c?.nome ?? '?'}</span>
                      </div>
                      <span style={{ fontFamily: 'var(--dc-mono)', fontSize: 11, color: 'var(--dc-text-3)' }}>{t.J}j</span>
                      <span style={{ fontFamily: 'var(--dc-mono)', fontSize: 13, fontWeight: 700, minWidth: 26, textAlign: 'right', color: 'var(--dc-text)' }}>{t.P}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Inscrições ────────────────────────────────────────────────────────────────

function AdminInscricoes({ onNav }: { onNav: (page: string, param?: string | number | null) => void }) {
  const { showToast } = useApp();
  const { inscricoes, clubs, refresh } = useData();
  const [busy, setBusy] = useState<number | null>(null);
  const [expanded, setExpanded] = useState<number | null>(null);

  const pendentes = inscricoes.filter(i => i.status === 'pendente');

  const handle = async (id: number, action: 'aprovado' | 'recusado') => {
    setBusy(id);
    try {
      if (action === 'aprovado') {
        const it = inscricoes.find(x => x.id === id);
        if (it && it.jogadores.length > 0) {
          // Cria o clube e o elenco a partir dos dados estruturados da inscrição —
          // o staff não precisa mais redigitar tudo em Times manualmente.
          const clubId = uniqueSlug(slugify(it.nome), clubs.map(c => c.id));
          await createClub({ id: clubId, nome: it.nome, tag: it.tag, color: '#3b82f6', color2: '#ffffff', logo_url: null });
          await Promise.all(it.jogadores.map(j => createPlayer({
            club_id: clubId,
            nick: j.nick,
            game_id: j.game_id,
            discord: j.discord ?? null,
            posicao: j.posicao ?? null,
            is_captain: j.nick.trim().toLowerCase() === it.capitao.trim().toLowerCase(),
          })));
          await enrollClubWithRoster(clubId, it.competition_id);
        }
      }
      await updateInscricaoStatus(id, action);
      showToast(action === 'aprovado' ? 'Time aprovado e criado!' : 'Inscrição recusada');
      if (action === 'aprovado') {
        const it = inscricoes.find(x => x.id === id);
        if (it) sendBroadcast({ title: `${it.nome} entrou na competição!`, body: `Time ${it.tag} foi aprovado.`, url: '/' });
      }
      refresh();
    } catch (e) {
      showToast('Erro: ' + (e instanceof Error ? e.message : String(e)));
    } finally { setBusy(null); }
  };

  const publicLink = (
    <div style={{ display: 'flex', justifyContent: 'flex-end', maxWidth: 820, marginBottom: 14 }}>
      <button onClick={() => onNav('subscription')}
        style={{ display: 'inline-flex', alignItems: 'center', gap: 7, height: 36, padding: '0 14px', borderRadius: 10, border: '1px solid var(--dc-border)', background: 'var(--dc-surface)', color: 'var(--dc-text-2)', fontSize: 12.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--dc-sans)' }}>
        <span style={{ width: 14, height: 14 }}>{I.externalLink}</span>Ver página pública de inscrição
      </button>
    </div>
  );

  if (pendentes.length === 0) {
    return (
      <div>
        {publicLink}
        <div style={{ textAlign: 'center', padding: '80px 24px', color: 'var(--dc-text-2)' }}>
          <div style={{ width: 60, height: 60, borderRadius: 18, background: 'var(--dc-surface-2)', border: '1px solid var(--dc-border)', display: 'grid', placeItems: 'center', margin: '0 auto 16px', color: 'var(--dc-pos)' }}>
            <span style={{ width: 26, height: 26 }}>{I.check}</span>
          </div>
          <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--dc-text)' }}>Tudo em dia</div>
          <div style={{ fontSize: 13.5, marginTop: 6 }}>Nenhuma inscrição aguardando análise.</div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {publicLink}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 820 }}>
        {pendentes.map(it => (
          <div key={it.id} style={{ border: '1px solid var(--dc-border)', borderRadius: 16, background: 'var(--dc-surface)', overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px 18px' }}>
              <DcCrestByTag tag={it.tag} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--dc-text)' }}>{it.nome}</div>
                <div style={{ fontSize: 12.5, color: 'var(--dc-text-3)' }}>Capitão {it.capitao} · enviado {new Date(it.created_at).toLocaleDateString('pt-BR')}</div>
              </div>
              <span style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--dc-warn)', background: 'var(--dc-warn-bg)', padding: '4px 10px', borderRadius: 99, flexShrink: 0 }}>Pendente</span>
            </div>
            {(it.jogadores.length > 0 || it.roster) && (
              <>
                <button onClick={() => setExpanded(expanded === it.id ? null : it.id)}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 18px', border: 'none', borderTop: '1px solid var(--dc-border)', background: 'transparent', color: 'var(--dc-text-2)', fontSize: 12.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--dc-sans)' }}>
                  <span>{expanded === it.id ? 'Ocultar elenco' : `Ver elenco (${it.jogadores.length || 'texto livre'})`}</span>
                  <span style={{ width: 16, height: 16, transform: expanded === it.id ? 'rotate(180deg)' : '', transition: 'transform .2s' }}>{I.chevD}</span>
                </button>
                {expanded === it.id && (
                  it.jogadores.length > 0 ? (
                    <div style={{ background: 'var(--dc-surface-2)', borderTop: '1px solid var(--dc-border)' }}>
                      {it.jogadores.map((j, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', padding: '10px 18px', borderTop: i ? '1px solid var(--dc-border)' : 'none' }}>
                          {it.capitao.trim().toLowerCase() === j.nick.trim().toLowerCase() && (
                            <span style={{ fontSize: 9.5, fontWeight: 800, letterSpacing: '0.04em', background: 'var(--dc-accent)', color: 'var(--dc-on-accent)', padding: '2px 7px', borderRadius: 99 }}>CAP</span>
                          )}
                          <span style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--dc-text)' }}>{j.nick}</span>
                          <span style={{ fontFamily: 'var(--dc-mono)', fontSize: 11.5, color: 'var(--dc-text-3)' }}>#{j.game_id}</span>
                          {j.discord && <span style={{ fontFamily: 'var(--dc-mono)', fontSize: 11.5, color: 'var(--dc-text-3)' }}>{j.discord}</span>}
                          {j.posicao && <span style={{ fontSize: 10, fontWeight: 700, background: 'var(--dc-surface-3)', color: 'var(--dc-text-2)', padding: '2px 8px', borderRadius: 99 }}>{j.posicao}</span>}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ padding: '12px 18px', background: 'var(--dc-surface-2)', borderTop: '1px solid var(--dc-border)', fontFamily: 'var(--dc-mono)', fontSize: 12.5, lineHeight: 1.7, whiteSpace: 'pre-wrap', color: 'var(--dc-text-2)' }}>{it.roster}</div>
                  )
                )}
              </>
            )}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, padding: '14px 18px', borderTop: '1px solid var(--dc-border)' }}>
              <button disabled={busy === it.id} onClick={() => handle(it.id, 'recusado')}
                style={{ height: 42, borderRadius: 10, border: '1px solid var(--dc-border-2)', background: 'var(--dc-surface)', color: 'var(--dc-text)', fontSize: 13.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--dc-sans)' }}>Recusar</button>
              <button disabled={busy === it.id} onClick={() => handle(it.id, 'aprovado')}
                style={{ height: 42, borderRadius: 10, border: 'none', background: 'var(--dc-accent)', color: 'var(--dc-on-accent)', fontSize: 13.5, fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--dc-sans)' }}>
                {busy === it.id ? '...' : it.jogadores.length > 0 ? 'Aprovar e criar time' : 'Aprovar'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Times ─────────────────────────────────────────────────────────────────────

const BLANK_CLUB_FORM = { id: '', nome: '', tag: '', color: '#3b82f6', color2: '#ffffff' };
const BLANK_PLAYER_FORM = { nick: '', game_id: '', discord: '', posicao: '' as Position | '', is_captain: false };

// Separate inner component for the roster panel so hooks are at top level
function RosterPanel({
  club,
  onBack,
  showToast,
  refresh: _refresh,
}: {
  club: Club;
  onBack: () => void;
  showToast: (msg: string) => void;
  refresh: () => void;
}) {
  const { confirm } = useApp();
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<'list' | 'add' | 'edit'>('list');
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [form, setForm] = useState(BLANK_PLAYER_FORM);
  const [busy, setBusy] = useState(false);
  const rosterPage = usePagination(players, 15);

  const reload = () => {
    setLoading(true);
    fetchPlayers(club.id)
      .then(setPlayers)
      .catch(() => showToast('Erro ao carregar jogadores'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { reload(); }, [club.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const formSnapshot = useRef('');
  const openAdd = () => { setMode('add'); setForm(BLANK_PLAYER_FORM); setEditingPlayer(null); formSnapshot.current = JSON.stringify(BLANK_PLAYER_FORM); };
  const openEdit = (p: Player) => {
    const f: typeof BLANK_PLAYER_FORM = { nick: p.nick, game_id: p.game_id, discord: p.discord || '', posicao: p.posicao || '', is_captain: p.is_captain };
    setMode('edit'); setEditingPlayer(p); setForm(f); formSnapshot.current = JSON.stringify(f);
  };
  const cancel = () => { setMode('list'); setForm(BLANK_PLAYER_FORM); setEditingPlayer(null); };
  const cancelWithConfirm = async () => {
    if (JSON.stringify(form) !== formSnapshot.current) {
      if (!await confirm({ title: 'Descartar alterações?', message: 'Você tem alterações não salvas nesse jogador.', confirmLabel: 'Descartar', danger: true })) return;
    }
    cancel();
  };

  const submitAdd = async () => {
    if (!form.nick || !form.game_id) { showToast('Nick e ID são obrigatórios'); return; }
    setBusy(true);
    try {
      await createPlayer({ club_id: club.id, nick: form.nick, game_id: form.game_id, discord: form.discord || null, posicao: form.posicao || null, is_captain: form.is_captain });
      showToast('Jogador adicionado!');
      cancel(); reload();
    } catch (e) { showToast('Erro: ' + (e instanceof Error ? e.message : String(e))); }
    finally { setBusy(false); }
  };

  const submitEdit = async () => {
    if (!editingPlayer || !form.nick || !form.game_id) { showToast('Nick e ID são obrigatórios'); return; }
    setBusy(true);
    try {
      await updatePlayer(editingPlayer.id, { nick: form.nick, game_id: form.game_id, discord: form.discord || null, posicao: form.posicao || null, is_captain: form.is_captain });
      showToast('Jogador atualizado!');
      cancel(); reload();
    } catch (e) { showToast('Erro: ' + (e instanceof Error ? e.message : String(e))); }
    finally { setBusy(false); }
  };

  const remove = async (p: Player) => {
    if (!await confirm({ title: `Remover "${p.nick}"?`, danger: true, confirmLabel: 'Remover' })) return;
    try { await deletePlayer(p.id); showToast(`${p.nick} removido`); reload(); }
    catch (e) { showToast('Erro: ' + (e instanceof Error ? e.message : String(e))); }
  };

  const playerForm = (
    <div className="card-filled" style={{ padding: '18px 16px', marginBottom: 16 }}>
      <div className="eyebrow eyebrow-acc" style={{ marginBottom: 14 }}>
        {mode === 'add' ? 'NOVO JOGADOR' : `EDITAR · ${editingPlayer?.nick}`}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div>
            <FieldLabel required>Nick</FieldLabel>
            <input className="input" value={form.nick} onChange={e => setForm(s => ({ ...s, nick: e.target.value }))} placeholder="NickNome" autoFocus />
          </div>
          <div>
            <FieldLabel required>ID no jogo</FieldLabel>
            <input className="input" value={form.game_id} onChange={e => setForm(s => ({ ...s, game_id: e.target.value }))} placeholder="ID#1234" />
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div>
            <FieldLabel>Discord</FieldLabel>
            <input className="input" value={form.discord}
              onChange={e => setForm(s => ({ ...s, discord: e.target.value }))} />
          </div>
          <div>
            <FieldLabel>Posição</FieldLabel>
            <select className="input" value={form.posicao} onChange={e => setForm(s => ({ ...s, posicao: e.target.value as Position | '' }))}>
              <option value="">Sem posição</option>
              {POSICOES.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
        </div>
        <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 13, padding: '2px 0' }}>
          <input type="checkbox" checked={form.is_captain} onChange={e => setForm(s => ({ ...s, is_captain: e.target.checked }))} style={{ width: 16, height: 16, accentColor: 'var(--primary)' }} />
          <span style={{ fontWeight: 600 }}>Capitão do time</span>
        </label>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 16 }}>
        <button onClick={cancelWithConfirm} className="btn btn-outlined" style={{ height: 42 }}>Cancelar</button>
        <button disabled={busy} onClick={mode === 'add' ? submitAdd : submitEdit} className="btn btn-primary" style={{ height: 42 }}>
          {busy ? 'Salvando...' : mode === 'add' ? 'Adicionar' : 'Salvar'}
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ padding: '0 16px 80px' }}>
      {/* Panel header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingBottom: 16 }}>
        <button onClick={onBack} className="icon-btn" style={{ width: 36, height: 36 }} title="Voltar">{I.chevL ?? I.back ?? '←'}</button>
        <Crest id={club.id} size={44} radius={12} />
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 16, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{club.nome}</div>
          <div style={{ fontSize: 12, color: 'var(--on-surface-variant)' }} className="mono">
            {club.tag} · {loading ? '...' : `${players.length} jogador${players.length !== 1 ? 'es' : ''}`}
          </div>
        </div>
      </div>

      {/* Form (add or edit) */}
      {mode !== 'list' && playerForm}

      {/* Player list */}
      {loading ? (
        <div style={{ padding: '20px 0', fontSize: 13, color: 'var(--on-surface-variant)' }}>Carregando elenco...</div>
      ) : players.length === 0 && mode === 'list' ? (
        <div className="empty" style={{ paddingTop: 32 }}>
          <div className="empty-icon">{I.shield}</div>
          <p style={{ margin: '0 0 16px', fontSize: 14 }}>Nenhum jogador cadastrado.</p>
        </div>
      ) : (
        <>
          <div className="card-filled" style={{ marginBottom: 4 }}>
            {rosterPage.pageItems.map((p, i) => (
              <div key={p.id} style={{ display: 'grid', gridTemplateColumns: '1fr 34px 34px', alignItems: 'center', gap: 8, padding: '12px 14px', borderTop: i ? '1px solid var(--outline-variant)' : 'none' }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    {p.is_captain && (
                      <span style={{ fontSize: 10, background: 'var(--primary-container)', color: 'var(--on-primary-container)', padding: '2px 8px', borderRadius: 999, fontWeight: 700, letterSpacing: '0.04em', flexShrink: 0 }}>CAP</span>
                    )}
                    <span style={{ fontSize: 14.5, fontWeight: 600 }}>{p.nick}</span>
                    {p.posicao && (
                      <span style={{ fontSize: 10, background: 'var(--surface-c-high)', color: 'var(--on-surface-variant)', padding: '2px 8px', borderRadius: 999, fontWeight: 700, flexShrink: 0 }}>{p.posicao}</span>
                    )}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--on-surface-variant)', marginTop: 3, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    <span className="mono">#{p.game_id}</span>
                    {p.discord && <span className="mono">Discord: {p.discord}</span>}
                  </div>
                </div>
                <button onClick={() => openEdit(p)} className="icon-btn" style={{ width: 34, height: 34, color: 'var(--primary)' }} title="Editar">{I.edit}</button>
                <button onClick={() => remove(p)} className="icon-btn" style={{ width: 34, height: 34, color: 'var(--error)' }} title="Remover">{I.trash}</button>
              </div>
            ))}
          </div>
          <PageBar page={rosterPage.page} totalPages={rosterPage.totalPages} onPage={rosterPage.setPage}
            pageSize={rosterPage.pageSize} onPageSize={rosterPage.setPageSize} rangeLabel={rosterPage.rangeLabel}
            pageSizeOptions={[15, 30, 50]} />
        </>
      )}

      {mode === 'list' && (
        <button onClick={openAdd} className="btn btn-tonal" style={{ height: 44, fontSize: 14, display: 'inline-flex', alignItems: 'center', gap: 8, width: '100%', justifyContent: 'center' }}>
          <span style={{ width: 18, height: 18 }}>{I.plus}</span>Adicionar jogador
        </button>
      )}
    </div>
  );
}

function AdminTimes() {
  const { showToast, confirm } = useApp();
  const { clubs, refresh } = useData();
  const isDesktop = useIsDesktop();

  // ── Club form ──
  const [clubFormMode, setClubFormMode] = useState<'none' | 'add' | 'edit'>('none');
  const [editingClub, setEditingClub] = useState<Club | null>(null);
  const [clubForm, setClubForm] = useState(BLANK_CLUB_FORM);
  const [busyClub, setBusyClub] = useState(false);

  // ── Logo upload ──
  const logoInputRef = useRef<HTMLInputElement>(null);
  const logoTarget = useRef<'form' | string>('form');
  const [uploadingLogoFor, setUploadingLogoFor] = useState<string | null>(null);
  const [pendingLogoFile, setPendingLogoFile] = useState<File | null>(null);
  const [pendingLogoPreview, setPendingLogoPreview] = useState<string | null>(null);

  // ── Selected club (roster panel) ──
  const [selectedClubId, setSelectedClubId] = useState<string | null>(null);
  const selectedClub = clubs.find(c => c.id === selectedClubId) ?? null;

  const selectClub = (id: string) => {
    setSelectedClubId(id);
    setClubFormMode('none');
  };

  // ─── Logo ────────────────────────────────────────────────────────────
  const triggerLogo = (target: 'form' | string) => {
    logoTarget.current = target;
    if (logoInputRef.current) { logoInputRef.current.value = ''; logoInputRef.current.click(); }
  };

  const onLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const target = logoTarget.current;
    if (target === 'form') {
      try {
        const compressed = await compressImage(file);
        setPendingLogoFile(compressed);
        if (pendingLogoPreview) URL.revokeObjectURL(pendingLogoPreview);
        setPendingLogoPreview(URL.createObjectURL(compressed));
        const [color, color2] = await extractCrestColors(compressed);
        setClubForm(s => ({ ...s, color, color2 }));
      } catch { showToast('Erro ao processar imagem'); }
    } else {
      setUploadingLogoFor(target);
      try {
        const compressed = await compressImage(file);
        const url = await uploadClubLogo(target, compressed);
        let colors: [string, string] | null = null;
        try { colors = await extractCrestColors(compressed); } catch { /* mantém cores atuais se falhar */ }
        await updateClub(target, colors ? { logo_url: url, color: colors[0], color2: colors[1] } : { logo_url: url });
        showToast('Logo atualizado!'); refresh();
      } catch (err) { showToast('Erro: ' + (err instanceof Error ? err.message : String(err))); }
      finally { setUploadingLogoFor(null); }
    }
  };

  // ─── Club CRUD ───────────────────────────────────────────────────────
  const resetClubForm = () => {
    setClubFormMode('none'); setEditingClub(null); setClubForm(BLANK_CLUB_FORM);
    if (pendingLogoPreview) URL.revokeObjectURL(pendingLogoPreview);
    setPendingLogoFile(null); setPendingLogoPreview(null);
  };

  const clubFormSnapshot = useRef('');
  const openAddClub = () => {
    setClubFormMode('add'); setEditingClub(null); setClubForm(BLANK_CLUB_FORM);
    setSelectedClubId(null);
    if (pendingLogoPreview) URL.revokeObjectURL(pendingLogoPreview);
    setPendingLogoFile(null); setPendingLogoPreview(null);
    clubFormSnapshot.current = JSON.stringify(BLANK_CLUB_FORM);
  };

  const openEditClub = (c: Club) => {
    const f = { id: c.id, nome: c.nome, tag: c.tag, color: c.color, color2: c.color2 };
    setClubFormMode('edit'); setEditingClub(c);
    setClubForm(f);
    if (pendingLogoPreview) URL.revokeObjectURL(pendingLogoPreview);
    setPendingLogoFile(null); setPendingLogoPreview(null);
    clubFormSnapshot.current = JSON.stringify(f);
  };

  const cancelClubFormWithConfirm = async () => {
    const dirty = JSON.stringify(clubForm) !== clubFormSnapshot.current || !!pendingLogoFile;
    if (dirty) {
      if (!await confirm({ title: 'Descartar alterações?', message: 'Você tem alterações não salvas nesse time.', confirmLabel: 'Descartar', danger: true })) return;
    }
    resetClubForm();
  };

  const submitNewClub = async () => {
    if (!clubForm.nome || !clubForm.tag) { showToast('Preencha nome e sigla'); return; }
    setBusyClub(true);
    try {
      await createClub({ ...clubForm, logo_url: null });
      if (pendingLogoFile) {
        const url = await uploadClubLogo(clubForm.id, pendingLogoFile);
        await updateClub(clubForm.id, { logo_url: url });
      }
      showToast(`${clubForm.nome} cadastrado!`);
      resetClubForm(); refresh();
    } catch (e) { showToast('Erro: ' + (e instanceof Error ? e.message : String(e))); }
    finally { setBusyClub(false); }
  };

  const submitEditClub = async () => {
    if (!editingClub || !clubForm.nome || !clubForm.tag) { showToast('Preencha nome e sigla'); return; }
    setBusyClub(true);
    try {
      const patch: Partial<Omit<Club, 'id'>> = { nome: clubForm.nome, tag: clubForm.tag, color: clubForm.color, color2: clubForm.color2 };
      if (pendingLogoFile) { const url = await uploadClubLogo(editingClub.id, pendingLogoFile); patch.logo_url = url; }
      await updateClub(editingClub.id, patch);
      showToast('Clube atualizado!'); resetClubForm(); refresh();
    } catch (e) { showToast('Erro: ' + (e instanceof Error ? e.message : String(e))); }
    finally { setBusyClub(false); }
  };

  const removeClub = async (id: string, nome: string) => {
    if (!await confirm({ title: `Remover "${nome}"?`, message: 'Isso apaga todos os dados do clube.', danger: true, confirmLabel: 'Remover' })) return;
    try {
      await deleteClubLogo(id); await deleteClub(id);
      showToast(`${nome} removido`);
      if (selectedClubId === id) setSelectedClubId(null);
      refresh();
    } catch (e) { showToast('Erro: ' + (e instanceof Error ? e.message : String(e))); }
  };

  // ─── Shared: logo preview box for forms ─────────────────────────────
  const currentEditLogo = pendingLogoPreview ?? (editingClub ? editingClub.logo_url ?? null : null);

  const logoFormBox = (
    <button type="button" onClick={() => triggerLogo('form')} className="tap"
      style={{ width: 64, height: 64, borderRadius: 14, background: 'var(--surface-c-high)', overflow: 'hidden', display: 'grid', placeItems: 'center', flexShrink: 0, border: '2px dashed var(--outline-variant)' }}>
      {currentEditLogo
        ? <img src={currentEditLogo} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        : <span style={{ color: 'var(--on-surface-variant)', width: 22, height: 22 }}>{I.plus}</span>}
    </button>
  );

  const clubFormFields = (isEdit?: boolean) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        {logoFormBox}
        <div>
          <div style={{ fontSize: 13, fontWeight: 600 }}>{currentEditLogo ? 'Logo selecionado' : 'Logo do clube'}</div>
          <div style={{ fontSize: 12, color: 'var(--on-surface-variant)', marginTop: 2 }}>Clique para adicionar · Max 500 KB</div>
        </div>
      </div>
      <div>
        <FieldLabel required>Nome completo</FieldLabel>
        <input className="input" value={clubForm.nome}
          onChange={e => {
            const nome = e.target.value;
            if (!isEdit) { const id = uniqueSlug(slugify(nome), clubs.map(c => c.id)); setClubForm(s => ({ ...s, nome, id })); }
            else setClubForm(s => ({ ...s, nome }));
          }} placeholder="Nome do clube" />
      </div>
      <div>
        <FieldLabel required>Sigla (3–4 letras)</FieldLabel>
        <input className="input" value={clubForm.tag} onChange={e => setClubForm(s => ({ ...s, tag: e.target.value.toUpperCase().slice(0, 4) }))} placeholder="Sigla do clube" />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <div>
          <label className="field-label">Cor primária</label>
          <input type="color" value={clubForm.color} onChange={e => setClubForm(s => ({ ...s, color: e.target.value }))} style={{ width: '100%', height: 44, borderRadius: 8, border: '1px solid var(--outline-variant)', cursor: 'pointer', padding: 4 }} />
        </div>
        <div>
          <label className="field-label">Cor secundária</label>
          <input type="color" value={clubForm.color2} onChange={e => setClubForm(s => ({ ...s, color2: e.target.value }))} style={{ width: '100%', height: 44, borderRadius: 8, border: '1px solid var(--outline-variant)', cursor: 'pointer', padding: 4 }} />
        </div>
      </div>
    </div>
  );

  // ─── Left panel: club list ───────────────────────────────────────────
  const clubListPanel = (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <input ref={logoInputRef} type="file" accept="image/jpeg,image/png,image/webp" style={{ display: 'none' }} onChange={onLogoChange} />

      {/* Club form */}
      {clubFormMode !== 'none' && (
        <div className="card-filled" style={{ margin: '0 16px 14px', padding: '18px 16px' }}>
          <div className="eyebrow eyebrow-acc" style={{ marginBottom: 14 }}>{clubFormMode === 'add' ? 'NOVO CLUBE' : 'EDITAR CLUBE'}</div>
          {clubFormFields(clubFormMode === 'edit')}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 16 }}>
            <button onClick={cancelClubFormWithConfirm} className="btn btn-outlined" style={{ height: 42 }}>Cancelar</button>
            <button disabled={busyClub} onClick={clubFormMode === 'add' ? submitNewClub : submitEditClub} className="btn btn-primary" style={{ height: 42 }}>
              {busyClub ? 'Salvando...' : clubFormMode === 'add' ? 'Criar clube' : 'Salvar'}
            </button>
          </div>
        </div>
      )}

      {/* List */}
      {clubs.length === 0 && clubFormMode === 'none' ? (
        <div className="empty">
          <div className="empty-icon">{I.shield}</div>
          <p style={{ margin: '0 0 16px', fontSize: 14 }}>Nenhum clube cadastrado.</p>
        </div>
      ) : (
        <div style={{ margin: '0 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {clubs.map(c => {
            const isSel = selectedClubId === c.id;
            return (
              <div key={c.id} className="tap"
                style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 10px 10px 12px', borderRadius: 'var(--r-lg)', background: isSel ? 'var(--primary-container)' : 'var(--surface-c)', transition: 'background .15s' }}>
                {/* Logo */}
                <button onClick={() => triggerLogo(c.id)} className="tap" style={{ width: 44, height: 44, borderRadius: 12, overflow: 'hidden', display: 'grid', placeItems: 'center', flexShrink: 0 }} title="Alterar logo">
                  {uploadingLogoFor === c.id ? <span style={{ fontSize: 9, color: 'var(--on-surface-variant)' }}>...</span> : <Crest id={c.id} size={44} radius={12} />}
                </button>
                {/* Name — click to open roster */}
                <button onClick={() => selectClub(c.id)} className="tap" style={{ textAlign: 'left', minWidth: 0, flex: 1, padding: '2px 0' }}>
                  <div style={{ fontSize: 14, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: isSel ? 'var(--on-primary-container)' : 'var(--on-surface)' }}>{c.nome}</div>
                  <div className="mono" style={{ fontSize: 11, color: isSel ? 'var(--on-primary-container)' : 'var(--on-surface-variant)', opacity: isSel ? 0.85 : 1 }}>{c.tag}</div>
                </button>
                {/* Actions */}
                <div style={{ display: 'flex', gap: 2, flexShrink: 0 }}>
                  <button onClick={() => openEditClub(c)} className="icon-btn" style={{ width: 32, height: 32, color: isSel ? 'var(--on-primary-container)' : 'var(--on-surface-variant)' }} title="Editar clube">{I.edit}</button>
                  <button onClick={() => removeClub(c.id, c.nome)} className="icon-btn" style={{ width: 32, height: 32, color: isSel ? 'var(--on-primary-container)' : 'var(--on-surface-variant)' }} title="Remover clube">{I.trash}</button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <button onClick={openAddClub} className="fab"><span style={{ width: 22, height: 22 }}>{I.plus}</span>Novo time</button>
    </div>
  );

  // ─── Right panel: empty state ────────────────────────────────────────
  const emptyRoster = (
    <div className="empty" style={{ height: '100%', minHeight: 240 }}>
      <div className="empty-icon">{I.shield}</div>
      <p style={{ margin: 0, fontSize: 14 }}>Selecione um clube para gerenciar o elenco.</p>
    </div>
  );

  // ─── Layout ──────────────────────────────────────────────────────────
  if (isDesktop) {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'clamp(260px, 26vw, 340px) 1fr', minHeight: 400 }}>
        <div style={{ borderRight: '1px solid var(--outline-variant)', paddingTop: 4, overflowY: 'auto' }}>
          {clubListPanel}
        </div>
        <div style={{ overflowY: 'auto' }}>
          {selectedClub
            ? <RosterPanel key={selectedClub.id} club={selectedClub} onBack={() => setSelectedClubId(null)} showToast={showToast} refresh={refresh} />
            : emptyRoster}
        </div>
      </div>
    );
  }

  // Mobile: lista ou painel de elenco
  if (selectedClub) {
    return <RosterPanel key={selectedClub.id} club={selectedClub} onBack={() => setSelectedClubId(null)} showToast={showToast} refresh={refresh} />;
  }
  return <div style={{ paddingTop: 4 }}>{clubListPanel}</div>;
}

// ── Partidas ──────────────────────────────────────────────────────────────────

// Formata partes separadas → "Sáb 30 Mai · 19:00"
function fmtFromParts(dateISO: string, hour: number, minute: number): string {
  if (!dateISO) return '';
  const d = new Date(dateISO + 'T12:00:00');
  if (isNaN(d.getTime())) return '';
  const DAYS   = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];
  const MONTHS = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
  return `${DAYS[d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()]} · ${String(hour).padStart(2,'0')}:${String(minute).padStart(2,'0')}`;
}

// ScoreEditor com botões grandes para mobile
function ScoreEditor({ initial, onChange }: { initial: number; onChange: (v: number) => void }) {
  const [v, setV] = useState(initial);
  const set = (n: number) => { const c = Math.max(0, n); setV(c); onChange(c); };
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'center' }}>
      <button onClick={() => set(v - 1)} className="tap"
        style={{ width: 52, height: 52, borderRadius: 999, background: 'var(--surface-c-high)', display: 'grid', placeItems: 'center', fontSize: 24, fontWeight: 700, flexShrink: 0 }}>−</button>
      <input
        className="mono tabular" type="number" min={0} value={v}
        onChange={e => set(e.target.value === '' ? 0 : parseInt(e.target.value, 10) || 0)}
        style={{ fontSize: 44, fontWeight: 800, letterSpacing: '-0.04em', width: 68, textAlign: 'center', lineHeight: 1, background: 'transparent', border: 'none', color: 'var(--on-surface)', appearance: 'textfield' }}
      />
      <button onClick={() => set(v + 1)} className="tap"
        style={{ width: 52, height: 52, borderRadius: 999, background: 'var(--primary)', color: 'var(--on-primary)', display: 'grid', placeItems: 'center', fontSize: 24, fontWeight: 700, flexShrink: 0 }}>+</button>
    </div>
  );
}

// ── PickerSheet — bottom-sheet genérico ──────────────────────────────────────
function PickerSheet({ open, onClose, title, children }: {
  open: boolean; onClose: () => void; title: string; children: React.ReactNode;
}) {
  if (!open) return null;
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
      {/* Backdrop */}
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.50)', backdropFilter: 'blur(3px)' }} />
      {/* Sheet */}
      <div style={{ position: 'relative', background: 'var(--surface-c)', borderRadius: '24px 24px 0 0', maxHeight: '85vh', display: 'flex', flexDirection: 'column', boxShadow: '0 -8px 48px rgba(0,0,0,0.28)' }}>
        {/* Handle bar */}
        <div style={{ width: 40, height: 4, borderRadius: 4, background: 'var(--outline-variant)', margin: '12px auto 0', flexShrink: 0 }} />
        {/* Header */}
        <div style={{ padding: '12px 20px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--outline-variant)', flexShrink: 0 }}>
          <span style={{ fontSize: 17, fontWeight: 700 }}>{title}</span>
          <button onClick={onClose}
            style={{ width: 32, height: 32, borderRadius: 999, background: 'var(--surface-c-high)', border: 'none', cursor: 'pointer', fontSize: 17, fontWeight: 700, color: 'var(--on-surface-variant)', display: 'grid', placeItems: 'center' }}>
            ✕
          </button>
        </div>
        {/* Scrollable content */}
        <div style={{ overflowY: 'auto', flex: 1 }}>{children}</div>
      </div>
    </div>
  );
}

// ── TeamPickerButton ──────────────────────────────────────────────────────────
function TeamPickerButton({ value, onChange, clubs, clubById, label, exclude }: {
  value: string; onChange: (id: string) => void;
  clubs: Club[]; clubById: (id: string) => Club | undefined;
  label: string; exclude?: string;
}) {
  const [open, setOpen] = useState(false);
  const selected = value ? clubById(value) : null;
  const filtered = clubs.filter(c => !exclude || c.id !== exclude);
  return (
    <>
      <div>
        <FieldLabel required>{label}</FieldLabel>
        <button
          onClick={() => setOpen(true)}
          style={{ width: '100%', height: 56, borderRadius: 'var(--r-md)', background: 'var(--surface-c-high)', border: '1.5px solid var(--outline-variant)', display: 'flex', alignItems: 'center', gap: 10, padding: '0 14px', cursor: 'pointer', boxSizing: 'border-box' }}
        >
          {selected ? (
            <>
              <Crest id={selected.id} size={30} radius={8} />
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: 14, fontWeight: 700, lineHeight: 1.2 }}>{selected.tag}</div>
                <div style={{ fontSize: 11, color: 'var(--on-surface-variant)', lineHeight: 1.3 }}>{selected.nome}</div>
              </div>
            </>
          ) : (
            <span style={{ fontSize: 14, color: 'var(--on-surface-variant)' }}>Selecionar time…</span>
          )}
          <svg style={{ marginLeft: 'auto', flexShrink: 0, color: 'var(--on-surface-variant)' }} width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M7 10l5 5 5-5z"/></svg>
        </button>
      </div>

      <PickerSheet open={open} onClose={() => setOpen(false)} title={label}>
        <div style={{ display: 'flex', flexDirection: 'column', padding: '6px 0 32px' }}>
          {filtered.length === 0 && (
            <div style={{ padding: '28px 20px', textAlign: 'center', fontSize: 14, color: 'var(--on-surface-variant)' }}>
              Nenhum time disponível
            </div>
          )}
          {filtered.map(c => {
            const isSel = c.id === value;
            return (
              <button key={c.id} onClick={() => { onChange(c.id); setOpen(false); }}
                style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 20px', width: '100%', border: 'none', borderBottom: '1px solid var(--outline-variant)', cursor: 'pointer', background: isSel ? 'color-mix(in srgb, var(--primary) 12%, transparent)' : 'transparent' }}>
                <Crest id={c.id} size={40} radius={11} />
                <div style={{ textAlign: 'left', flex: 1 }}>
                  <div style={{ fontSize: 16, fontWeight: 700 }}>{c.nome}</div>
                  <div style={{ fontSize: 12, color: 'var(--on-surface-variant)' }}>{c.tag}</div>
                </div>
                {isSel && <span style={{ color: 'var(--primary)', fontSize: 20, fontWeight: 700 }}>✓</span>}
              </button>
            );
          })}
        </div>
      </PickerSheet>
    </>
  );
}

// ── DateTimePickerButton ──────────────────────────────────────────────────────
type DateTimeParts = { dateISO: string; hour: number; minute: number };

function DateTimePickerButton({ value, onChange, label }: {
  value: DateTimeParts; onChange: (v: DateTimeParts) => void; label: string;
}) {
  const [open, setOpen] = useState(false);
  const [local, setLocal] = useState<DateTimeParts>(value);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const DAYS   = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];
  const MONTHS = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
  const toISO  = (d: Date) => d.toISOString().slice(0, 10);
  const dates  = Array.from({ length: 21 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    return d;
  });
  const dayLabel = (d: Date, i: number) =>
    i === 0 ? 'Hoje' : i === 1 ? 'Amanhã' : `${DAYS[d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()]}`;

  const display = value.dateISO ? fmtFromParts(value.dateISO, value.hour, value.minute) : '';

  return (
    <>
      <div>
        <FieldLabel required>{label}</FieldLabel>
        <button
          onClick={() => { setLocal(value); setOpen(true); }}
          style={{ width: '100%', height: 56, borderRadius: 'var(--r-md)', background: 'var(--surface-c-high)', border: '1.5px solid var(--outline-variant)', display: 'flex', alignItems: 'center', gap: 10, padding: '0 14px', cursor: 'pointer', boxSizing: 'border-box' }}
        >
          {display ? (
            <span style={{ fontSize: 15, fontWeight: 600 }}>{display}</span>
          ) : (
            <span style={{ fontSize: 14, color: 'var(--on-surface-variant)' }}>Selecionar data e hora…</span>
          )}
          <span style={{ marginLeft: 'auto', fontSize: 20 }}>📅</span>
        </button>
      </div>

      <PickerSheet open={open} onClose={() => setOpen(false)} title={label}>
        <div style={{ padding: '20px 20px 0' }}>

          {/* Data — chips deslizantes */}
          <div className="field-label" style={{ marginBottom: 10 }}>Data</div>
          <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 8 }}>
            {dates.map((d, i) => {
              const iso = toISO(d);
              const active = local.dateISO === iso;
              return (
                <button key={iso} onClick={() => setLocal(l => ({ ...l, dateISO: iso }))}
                  style={{ flexShrink: 0, padding: '9px 16px', borderRadius: 24, border: `1.5px solid ${active ? 'var(--primary)' : 'var(--outline-variant)'}`, background: active ? 'var(--primary)' : 'transparent', color: active ? 'var(--on-primary)' : 'var(--on-surface)', fontSize: 13, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                  {dayLabel(d, i)}
                </button>
              );
            })}
          </div>

          {/* Horário — steppers */}
          <div className="field-label" style={{ margin: '24px 0 14px' }}>Horário</div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14 }}>
            {/* Hora */}
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 11, color: 'var(--on-surface-variant)', fontWeight: 600, letterSpacing: '0.08em', marginBottom: 8 }}>HORA</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <button onClick={() => setLocal(l => ({ ...l, hour: (l.hour + 23) % 24 }))}
                  style={{ width: 48, height: 48, borderRadius: 999, background: 'var(--surface-c-high)', border: 'none', fontSize: 22, fontWeight: 700, cursor: 'pointer' }}>−</button>
                <span className="mono tabular" style={{ fontSize: 48, fontWeight: 800, minWidth: 60, textAlign: 'center', letterSpacing: '-0.04em', lineHeight: 1 }}>
                  {String(local.hour).padStart(2, '0')}
                </span>
                <button onClick={() => setLocal(l => ({ ...l, hour: (l.hour + 1) % 24 }))}
                  style={{ width: 48, height: 48, borderRadius: 999, background: 'var(--primary)', color: 'var(--on-primary)', border: 'none', fontSize: 22, fontWeight: 700, cursor: 'pointer' }}>+</button>
              </div>
            </div>

            <span style={{ fontSize: 42, fontWeight: 800, color: 'var(--outline)', paddingTop: 22, lineHeight: 1 }}>:</span>

            {/* Minuto — passos de 5 */}
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 11, color: 'var(--on-surface-variant)', fontWeight: 600, letterSpacing: '0.08em', marginBottom: 8 }}>MIN</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <button onClick={() => setLocal(l => ({ ...l, minute: l.minute < 5 ? 55 : l.minute - 5 }))}
                  style={{ width: 48, height: 48, borderRadius: 999, background: 'var(--surface-c-high)', border: 'none', fontSize: 22, fontWeight: 700, cursor: 'pointer' }}>−</button>
                <span className="mono tabular" style={{ fontSize: 48, fontWeight: 800, minWidth: 60, textAlign: 'center', letterSpacing: '-0.04em', lineHeight: 1 }}>
                  {String(local.minute).padStart(2, '0')}
                </span>
                <button onClick={() => setLocal(l => ({ ...l, minute: l.minute >= 55 ? 0 : l.minute + 5 }))}
                  style={{ width: 48, height: 48, borderRadius: 999, background: 'var(--primary)', color: 'var(--on-primary)', border: 'none', fontSize: 22, fontWeight: 700, cursor: 'pointer' }}>+</button>
              </div>
            </div>
          </div>

          {/* Preview */}
          {local.dateISO && (
            <div style={{ textAlign: 'center', margin: '18px 0 4px', fontSize: 16, fontWeight: 700, color: 'var(--primary)' }}>
              {fmtFromParts(local.dateISO, local.hour, local.minute)}
            </div>
          )}
        </div>

        <div style={{ padding: '16px 20px 40px' }}>
          <button onClick={() => { onChange(local); setOpen(false); }} disabled={!local.dateISO}
            className="btn btn-primary" style={{ width: '100%', height: 52, fontSize: 16 }}>
            Confirmar
          </button>
        </div>
      </PickerSheet>
    </>
  );
}

// ── ScorerSection — seletor de artilheiros por time ──────────────────────────
// Coluna compacta de jogadores com stepper — usada nas duas metades do seletor split-screen
function ScorerColumn({ title, players, counts, onAdd, onRemove, tint }: {
  title: string; players: Player[];
  counts: Record<string, number>;
  onAdd: (nick: string) => void; onRemove: (nick: string) => void;
  tint?: boolean;
}) {
  return (
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ padding: '10px 14px', fontSize: 11, fontWeight: 800, letterSpacing: '0.04em', textTransform: 'uppercase', color: tint ? 'var(--error)' : 'var(--on-surface-variant)', background: 'var(--surface-c-low)', position: 'sticky', top: 0 }}>
        {title}
      </div>
      {players.length === 0 ? (
        <div style={{ padding: '20px 14px', fontSize: 12.5, color: 'var(--on-surface-variant)', textAlign: 'center' }}>Sem elenco</div>
      ) : players.map(p => {
        const count = counts[p.nick] ?? 0;
        return (
          <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 12px', borderTop: '1px solid var(--outline-variant)' }}>
            <div style={{ flex: 1, minWidth: 0, fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.nick}</div>
            <button onClick={() => onRemove(p.nick)} disabled={count === 0}
              style={{ width: 28, height: 28, flexShrink: 0, borderRadius: 999, background: count > 0 ? 'var(--surface-c-high)' : 'transparent', border: 'none', fontSize: 16, fontWeight: 700, opacity: count === 0 ? 0.25 : 1 }}>−</button>
            <span className="mono tabular" style={{ fontSize: 14, fontWeight: 800, minWidth: 16, textAlign: 'center', color: count > 0 ? (tint ? 'var(--error)' : 'var(--primary)') : 'var(--on-surface-variant)' }}>{count}</span>
            <button onClick={() => onAdd(p.nick)}
              style={{ width: 28, height: 28, flexShrink: 0, borderRadius: 999, background: tint ? 'var(--error)' : 'var(--primary)', color: tint ? '#fff' : 'var(--on-primary)', border: 'none', fontSize: 16, fontWeight: 700 }}>+</button>
          </div>
        );
      })}
    </div>
  );
}

// Seletor de goleadores — split-screen (elenco próprio = gol normal, adversário = gol contra).
// Opcional: não bloqueia salvar o resultado se ficar incompleto ou vazio.
function ScorerSection({ label, tag, players, oppPlayers, goals, onChange, targetCount }: {
  label: string; tag: string; players: Player[]; oppPlayers: Player[];
  goals: GoalEntry[]; onChange: (g: GoalEntry[]) => void;
  targetCount: number;
}) {
  const [open, setOpen] = useState(false);
  const [assistForIndex, setAssistForIndex] = useState<number | null>(null);

  const ownCounts: Record<string, number> = {};
  const ogCounts: Record<string, number> = {};
  goals.forEach(g => {
    const bucket = g.own_goal ? ogCounts : ownCounts;
    bucket[g.nick] = (bucket[g.nick] ?? 0) + 1;
  });

  const addGoal = (nick: string, ownGoal: boolean) => onChange([...goals, { nick, own_goal: ownGoal }]);
  const removeGoal = (nick: string, ownGoal: boolean) => {
    const idx = [...goals].reverse().findIndex(g => g.nick === nick && !!g.own_goal === ownGoal);
    if (idx === -1) return;
    const next = [...goals];
    next.splice(goals.length - 1 - idx, 1);
    onChange(next);
  };
  const removeGoalAt = (index: number) => onChange(goals.filter((_, i) => i !== index));
  const setAssistAt = (index: number, assist: string | null) =>
    onChange(goals.map((g, i) => i === index ? { ...g, assist } : g));

  const identified = goals.length;
  const complete = targetCount > 0 && identified >= targetCount;
  const assistTarget = assistForIndex !== null ? goals[assistForIndex] : null;

  return (
    <div style={{ marginTop: 18 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <span className="field-label" style={{ marginBottom: 0 }}>{label}</span>
        <span className="mono" style={{ fontSize: 11.5, fontWeight: 700, color: complete ? 'var(--primary)' : 'var(--on-surface-variant)' }}>
          {identified} de {targetCount} gols identificados
        </span>
      </div>

      {/* Um cartão por gol — dá pra atribuir assistência a cada um individualmente */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 10 }}>
        {goals.map((g, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderRadius: 14, background: g.own_goal ? 'color-mix(in srgb, var(--error) 12%, transparent)' : 'var(--primary-container)' }}>
            <span style={{ width: 15, height: 15, flexShrink: 0, color: g.own_goal ? 'var(--error)' : 'var(--on-primary-container)' }}>{I.ball}</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: g.own_goal ? 'var(--error)' : 'var(--on-primary-container)', whiteSpace: 'nowrap' }}>
              {g.nick}{g.own_goal ? ' (contra)' : ''}
            </span>
            {!g.own_goal && (
              <button onClick={() => setAssistForIndex(i)}
                style={{ fontSize: 11.5, fontWeight: 600, color: g.assist ? 'var(--primary)' : 'var(--on-surface-variant)', background: 'transparent', border: 'none', textDecoration: g.assist ? 'none' : 'underline', cursor: 'pointer', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {g.assist ? `🎯 ${g.assist}` : '+ assistência'}
              </button>
            )}
            <button onClick={() => removeGoalAt(i)}
              style={{ marginLeft: 'auto', width: 22, height: 22, flexShrink: 0, borderRadius: 999, background: 'transparent', border: 'none', fontSize: 15, fontWeight: 700, color: 'var(--on-surface-variant)', cursor: 'pointer' }}>
              ×
            </button>
          </div>
        ))}
        <button onClick={() => setOpen(true)}
          style={{ padding: '7px 16px', borderRadius: 20, background: 'transparent', border: '1.5px dashed var(--outline-variant)', fontSize: 13, color: 'var(--on-surface-variant)', fontWeight: 600, alignSelf: 'flex-start' }}>
          + Gol
        </button>
      </div>

      <PickerSheet open={open} onClose={() => setOpen(false)} title={label}>
        <div style={{ paddingBottom: 32, display: 'flex' }}>
          <ScorerColumn title={tag} players={players} counts={ownCounts}
            onAdd={n => addGoal(n, false)} onRemove={n => removeGoal(n, false)} />
          <div style={{ width: 1, background: 'var(--outline-variant)', flexShrink: 0 }} />
          <ScorerColumn title="Gol contra" players={oppPlayers} counts={ogCounts} tint
            onAdd={n => addGoal(n, true)} onRemove={n => removeGoal(n, true)} />
        </div>
      </PickerSheet>

      <PickerSheet open={assistForIndex !== null} onClose={() => setAssistForIndex(null)} title={`Assistência — gol de ${assistTarget?.nick ?? ''}`}>
        <div style={{ paddingBottom: 32 }}>
          <button onClick={() => { if (assistForIndex !== null) setAssistAt(assistForIndex, null); setAssistForIndex(null); }}
            style={{ width: '100%', textAlign: 'left', padding: '13px 18px', fontSize: 13, fontWeight: 600, color: 'var(--on-surface-variant)', background: 'none', border: 'none', borderBottom: '1px solid var(--outline-variant)' }}>
            Sem assistência
          </button>
          {players.filter(p => p.nick !== assistTarget?.nick).map(p => (
            <button key={p.id} onClick={() => { if (assistForIndex !== null) setAssistAt(assistForIndex, p.nick); setAssistForIndex(null); }}
              style={{ width: '100%', textAlign: 'left', padding: '13px 18px', fontSize: 13.5, fontWeight: 600, background: assistTarget?.assist === p.nick ? 'var(--primary-container)' : 'none', color: assistTarget?.assist === p.nick ? 'var(--on-primary-container)' : 'var(--on-surface)', border: 'none', borderBottom: '1px solid var(--outline-variant)' }}>
              {p.nick}
            </button>
          ))}
        </div>
      </PickerSheet>
    </div>
  );
}

// ── Recalcula artilharia a partir de todas as partidas finalizadas ────────────
// Chamada após cada saveResult para manter a tabela `scorers` sempre sincronizada
// com o que está em `matches.home_scorers` / `matches.away_scorers`.
async function recalcScorers(competitionId: string, allMatches: Match[]): Promise<void> {
  // Só partidas finalizadas sem W.O. entram na artilharia
  const done = allMatches.filter(m => m.status === 'finalizado' && !m.is_wo);

  // Acumula gols, assistências e jogos por nick
  const map: Record<string, { club_id: string; goals: number; assists: number; jogos: number }> = {};

  for (const m of done) {
    // clubId = time que é DONO desse array de gols (não necessariamente de quem marcou —
    // gol contra fica registrado aqui mas pertence ao elenco do adversário e não conta
    // pra artilharia pessoal de ninguém, só engrossa o placar do time dono).
    const processTeam = (goals: GoalEntry[], clubId: string) => {
      const seen = new Set<string>();
      for (const g of goals) {
        if (g.own_goal) continue; // gol contra não entra na artilharia pessoal
        if (!map[g.nick]) map[g.nick] = { club_id: clubId, goals: 0, assists: 0, jogos: 0 };
        map[g.nick].goals += 1;
        seen.add(g.nick);
        if (g.assist) {
          if (!map[g.assist]) map[g.assist] = { club_id: clubId, goals: 0, assists: 0, jogos: 0 };
          map[g.assist].assists += 1;
          seen.add(g.assist);
        }
      }
      // Conta 1 jogo por partida, independente de quantos gols/assistências fez
      seen.forEach(nick => { map[nick].jogos += 1; });
    };
    processTeam(m.home_scorers, m.home);
    processTeam(m.away_scorers, m.away);
  }

  // Busca o ID do jogo de cada artilheiro (exibido como selo abaixo do nick na Tabela)
  const clubIds = [...new Set(Object.values(map).map(d => d.club_id))];
  const playersByClub = await Promise.all(clubIds.map(id => fetchPlayers(id)));
  const gameIdByClubNick: Record<string, string> = {};
  clubIds.forEach((clubId, i) => {
    playersByClub[i].forEach(p => { gameIdByClubNick[`${clubId}::${p.nick}`] = p.game_id; });
  });

  // Apaga artilharia antiga e re-insere do zero (evita entradas órfãs)
  await deleteScorersForCompetition(competitionId);
  await Promise.all(
    Object.entries(map).map(([nick, data]) =>
      upsertScorer({
        competition_id: competitionId,
        club_id: data.club_id,
        nick,
        game_id: gameIdByClubNick[`${data.club_id}::${nick}`] ?? null,
        goals: data.goals,
        assists: data.assists,
        jogos: data.jogos,
      })
    )
  );
}

// ── Recalcula a classificação a partir de todas as partidas finalizadas ───────
// Chamada após cada saveResult. Diferente da artilharia, partidas de W.O. CONTAM
// para a classificação (o placar administrativo já está gravado em score_h/score_a).
// Mantém zerados os clubes inscritos que ainda não jogaram.
async function recalcStandings(competitionId: string, allMatches: Match[]): Promise<void> {
  const enrolled = await fetchClubsInCompetition(competitionId);

  type Acc = {
    J: number; V: number; E: number; D: number; GP: number; GC: number; P: number;
    results: ('V' | 'E' | 'D')[]; // em ordem cronológica
  };
  const map: Record<string, Acc> = {};
  for (const id of enrolled) {
    map[id] = { J: 0, V: 0, E: 0, D: 0, GP: 0, GC: 0, P: 0, results: [] };
  }

  // Só partidas finalizadas com placar definido, em ordem cronológica (rodada, depois id)
  const done = allMatches
    .filter(m => m.status === 'finalizado' && m.scoreH != null && m.scoreA != null)
    .sort((a, b) => a.rodada - b.rodada || a.id - b.id);

  for (const m of done) {
    const sh = m.scoreH as number;
    const sa = m.scoreA as number;
    const h = map[m.home];
    const a = map[m.away];
    if (h) {
      h.J++; h.GP += sh; h.GC += sa;
      if (sh > sa)      { h.V++; h.P += 3; h.results.push('V'); }
      else if (sh < sa) { h.D++;            h.results.push('D'); }
      else              { h.E++; h.P += 1; h.results.push('E'); }
    }
    if (a) {
      a.J++; a.GP += sa; a.GC += sh;
      if (sa > sh)      { a.V++; a.P += 3; a.results.push('V'); }
      else if (sa < sh) { a.D++;            a.results.push('D'); }
      else              { a.E++; a.P += 1; a.results.push('E'); }
    }
  }

  await Promise.all(
    Object.entries(map).map(([clubId, s]) =>
      upsertStanding(competitionId, clubId, {
        J: s.J, V: s.V, E: s.E, D: s.D, GP: s.GP, GC: s.GC,
        SG: s.GP - s.GC, P: s.P,
        form: s.results.slice(-5).reverse(), // últimos 5, mais recente primeiro
      })
    )
  );
}

// ── Form state type (defined outside component to avoid re-declaration) ───────
type AddMatchForm = {
  home_id: string; away_id: string; rodada: number;
  dateISO: string; hour: number; minute: number; stage: string;
};

function AdminPartidas() {
  const { showToast, confirm } = useApp();
  const { clubs, competitions, activeComp, clubById, refresh } = useData();

  // ── Competição selecionada ──
  const [compId, setCompId] = useState<string>(activeComp?.id ?? competitions[0]?.id ?? '');
  const selectedComp = competitions.find(c => c.id === compId) ?? null;

  // ── Partidas carregadas localmente ──
  const [matches, setMatches] = useState<Match[]>([]);
  const [loadingMatches, setLoadingMatches] = useState(false);

  const reloadMatches = () => {
    if (!compId) return;
    setLoadingMatches(true);
    fetchMatches(compId)
      .then(setMatches)
      .catch(() => showToast('Erro ao carregar partidas'))
      .finally(() => setLoadingMatches(false));
  };

  useEffect(() => { reloadMatches(); }, [compId]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!compId && competitions.length > 0) {
      setCompId(activeComp?.id ?? competitions[0].id);
    }
  }, [competitions]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── View: lançar resultado ──
  const [editing, setEditing] = useState<number | null>(null);
  const [scoreH, setScoreH] = useState(0);
  const [scoreA, setScoreA] = useState(0);
  const [homeScorers, setHomeScorers] = useState<GoalEntry[]>([]);
  const [awayScorers, setAwayScorers] = useState<GoalEntry[]>([]);
  const [isWO, setIsWO] = useState(false);
  const [homePlayers, setHomePlayers] = useState<Player[]>([]);
  const [awayPlayers, setAwayPlayers] = useState<Player[]>([]);
  const [loadingPlayers, setLoadingPlayers] = useState(false);
  const [busy, setBusy] = useState(false);
  const editorSnapshot = useRef('');

  // ── Form: nova partida ──
  const blankForm = (): AddMatchForm => ({
    home_id: '', away_id: '',
    rodada: (selectedComp?.rodada_atual ?? 0) + 1,
    dateISO: '', hour: 20, minute: 0, stage: '',
  });
  const [adding, setAdding] = useState(false);
  const [addForm, setAddForm] = useState<AddMatchForm>(blankForm);

  const openAdd = () => { setAddForm(blankForm()); setEditingDetailsId(null); setAdding(true); };
  const cancelAddWithConfirm = async () => {
    const baseline = editingDetailsId !== null ? detailsSnapshot.current : JSON.stringify(blankForm());
    if (JSON.stringify(addForm) !== baseline) {
      if (!await confirm({ title: 'Descartar alterações?', message: 'Você tem alterações não salvas nessa partida.', confirmLabel: 'Descartar', danger: true })) return;
    }
    setAdding(false); setEditingDetailsId(null);
  };

  // ── Editar dados de uma partida já agendada (times, rodada, fase, data) ──
  const [editingDetailsId, setEditingDetailsId] = useState<number | null>(null);
  const detailsSnapshot = useRef('');
  const openEditDetails = (m: Match) => {
    const f: AddMatchForm = { home_id: m.home, away_id: m.away, rodada: m.rodada, dateISO: '', hour: 20, minute: 0, stage: m.stage };
    setAddForm(f);
    detailsSnapshot.current = JSON.stringify(f);
    setEditingDetailsId(m.id);
    setAdding(true);
  };
  const saveDetails = async () => {
    if (editingDetailsId === null) return;
    if (!addForm.home_id || !addForm.away_id) { showToast('Selecione os dois times'); return; }
    if (addForm.home_id === addForm.away_id) { showToast('Times não podem ser iguais'); return; }
    setBusy(true);
    try {
      await updateMatch(editingDetailsId, {
        home_id: addForm.home_id, away_id: addForm.away_id, rodada: addForm.rodada,
        stage: addForm.stage || `Rodada ${addForm.rodada}`,
        ...(addForm.dateISO ? { date_str: fmtFromParts(addForm.dateISO, addForm.hour, addForm.minute) } : {}),
      });
      showToast('Partida atualizada!');
      setAdding(false); setEditingDetailsId(null);
      reloadMatches(); refresh();
    } catch (e: unknown) { showToast('Erro: ' + (e instanceof Error ? e.message : String(e))); }
    finally { setBusy(false); }
  };

  const openEditor = (m: Match) => {
    setScoreH(m.scoreH ?? 0);
    setScoreA(m.scoreA ?? 0);
    setHomeScorers(m.home_scorers ?? []);
    setAwayScorers(m.away_scorers ?? []);
    setIsWO(m.is_wo ?? false);
    setEditing(m.id);
    editorSnapshot.current = JSON.stringify({
      scoreH: m.scoreH ?? 0, scoreA: m.scoreA ?? 0,
      homeScorers: m.home_scorers ?? [], awayScorers: m.away_scorers ?? [],
      isWO: m.is_wo ?? false,
    });
    setLoadingPlayers(true);
    Promise.all([fetchPlayers(m.home), fetchPlayers(m.away)])
      .then(([hp, ap]) => { setHomePlayers(hp); setAwayPlayers(ap); })
      .catch(() => {})
      .finally(() => setLoadingPlayers(false));
  };

  const closeEditor = async () => {
    const current = JSON.stringify({ scoreH, scoreA, homeScorers, awayScorers, isWO });
    if (current !== editorSnapshot.current) {
      if (!await confirm({ title: 'Descartar alterações?', message: 'Você tem alterações não salvas nesse resultado.', confirmLabel: 'Descartar', danger: true })) return;
    }
    setEditing(null);
  };

  const saveResult = async () => {
    if (editing === null) return;
    setBusy(true);
    try {
      // 1. Salva o resultado na partida
      await updateMatch(editing, {
        score_h: scoreH, score_a: scoreA, status: 'finalizado',
        home_scorers: homeScorers, away_scorers: awayScorers, is_wo: isWO,
      });

      // 2. Re-busca todas as partidas da competição (já com o resultado recém salvo)
      //    e reconstrói artilharia + classificação do zero
      const freshMatches = await fetchMatches(compId);
      await recalcScorers(compId, freshMatches);
      await recalcStandings(compId, freshMatches);

      showToast('Resultado salvo!');
      const m = matches.find(x => x.id === editing);
      const home = m && clubById(m.home), away = m && clubById(m.away);
      if (home && away && !isWO) {
        sendBroadcast({
          title: `${home.tag} ${scoreH} × ${scoreA} ${away.tag}`,
          body: 'Resultado saiu — toque pra ver os detalhes',
          url: pathForPage('match', editing) ?? '/',
        });
      }
      setEditing(null);
      reloadMatches(); refresh();
    } catch (e: unknown) { showToast('Erro: ' + (e instanceof Error ? e.message : String(e))); }
    finally { setBusy(false); }
  };

  const addMatch = async () => {
    if (!selectedComp) { showToast('Selecione uma competição'); return; }
    if (!addForm.home_id || !addForm.away_id) { showToast('Selecione os dois times'); return; }
    if (!addForm.dateISO) { showToast('Informe a data e horário'); return; }
    if (addForm.home_id === addForm.away_id) { showToast('Times não podem ser iguais'); return; }
    setBusy(true);
    try {
      await createMatch({
        competition_id: selectedComp.id,
        home_id: addForm.home_id,
        away_id: addForm.away_id,
        rodada: addForm.rodada,
        date_str: fmtFromParts(addForm.dateISO, addForm.hour, addForm.minute),
        stage: addForm.stage || `Rodada ${addForm.rodada}`,
      });
      showToast('Partida criada!');
      setAdding(false);
      setAddForm(blankForm());
      reloadMatches(); refresh();
    } catch (e: unknown) { showToast('Erro: ' + (e instanceof Error ? e.message : String(e))); }
    finally { setBusy(false); }
  };

  const remove = async (id: number) => {
    if (!await confirm({ title: 'Remover esta partida?', danger: true, confirmLabel: 'Remover' })) return;
    try {
      await deleteMatch(id);
      // Recalcula artilharia + classificação para não deixar dados órfãos da partida removida
      const freshMatches = await fetchMatches(compId);
      await recalcScorers(compId, freshMatches);
      await recalcStandings(compId, freshMatches);
      showToast('Partida removida');
      reloadMatches(); refresh();
    }
    catch (e: unknown) { showToast('Erro: ' + (e instanceof Error ? e.message : String(e))); }
  };

  // ── Busca por time + atalho de rodada ──
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'todas' | 'agendado' | 'finalizado'>('todas');
  const q = query.trim().toLowerCase();
  const filteredMatches = matches.filter(m => {
    if (statusFilter !== 'todas' && m.status !== statusFilter) return false;
    if (!q) return true;
    const home = clubById(m.home), away = clubById(m.away);
    return [home?.nome, home?.tag, away?.nome, away?.tag].some(v => v?.toLowerCase().includes(q));
  });

  // Agrupa partidas por rodada (mais recente primeiro)
  const byRodada = filteredMatches.reduce<Record<number, Match[]>>((acc, m) => {
    (acc[m.rodada] ??= []).push(m);
    return acc;
  }, {});
  const rodadas = Object.keys(byRodada).map(Number).sort((a, b) => b - a);
  const allRodadas = [...new Set(matches.map(m => m.rodada))].sort((a, b) => b - a);
  const rodadaRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const rodadaPagination = usePagination(rodadas, 5);
  const jumpToRodada = (r: number) => {
    setQuery(''); setStatusFilter('todas');
    const idx = rodadas.indexOf(r);
    if (idx >= 0) rodadaPagination.setPage(Math.floor(idx / rodadaPagination.pageSize) + 1);
    requestAnimationFrame(() => rodadaRefs.current[r]?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  };

  // ── Sub-view: lançar resultado ────────────────────────────────────────
  if (editing !== null) {
    const m = matches.find(x => x.id === editing);
    if (!m) { setEditing(null); return null; }
    const home = clubById(m.home);
    const away = clubById(m.away);
    if (!home || !away) { setEditing(null); return null; }
    return (
      <div style={{ padding: '0 16px 80px' }}>
        <button onClick={closeEditor} className="btn btn-text" style={{ marginBottom: 8, paddingLeft: 0 }}>← Voltar</button>

        <div style={{ textAlign: 'center', marginBottom: 16 }}>
          <div style={{ fontSize: 12, color: 'var(--on-surface-variant)' }}>{selectedComp?.nome} · {m.stage}</div>
        </div>

        {/* W.O. toggle */}
        <button
          onClick={() => { const next = !isWO; setIsWO(next); if (next) { setHomeScorers([]); setAwayScorers([]); } }}
          style={{ width: '100%', height: 44, borderRadius: 'var(--r-md)', marginBottom: 16, border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 14, background: isWO ? 'color-mix(in srgb, var(--error) 15%, transparent)' : 'var(--surface-c-high)', color: isWO ? 'var(--error)' : 'var(--on-surface-variant)', outline: isWO ? '1.5px solid var(--error)' : 'none' }}>
          {isWO ? '⚠ W.O. Ativado — toque para desativar' : 'Marcar como W.O.'}
        </button>

        {/* Placar */}
        <div className="card-filled" style={{ padding: '24px 16px 20px', marginBottom: 4 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: 8 }}>
            <div style={{ textAlign: 'center' }}>
              <Crest id={home.id} size={56} radius={16} />
              <div style={{ fontSize: 14, fontWeight: 700, marginTop: 10, marginBottom: 16 }}>{home.tag}</div>
              <ScoreEditor initial={m.scoreH ?? 0} onChange={setScoreH} />
            </div>
            <div style={{ textAlign: 'center', paddingBottom: 52 }}>
              <span className="mono" style={{ fontSize: 20, color: 'var(--outline)', fontWeight: 700 }}>×</span>
            </div>
            <div style={{ textAlign: 'center' }}>
              <Crest id={away.id} size={56} radius={16} />
              <div style={{ fontSize: 14, fontWeight: 700, marginTop: 10, marginBottom: 16 }}>{away.tag}</div>
              <ScoreEditor initial={m.scoreA ?? 0} onChange={setScoreA} />
            </div>
          </div>
          <div style={{ textAlign: 'center', margin: '20px 0 4px' }}>
            <span className="mono tabular" style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.04em', padding: '8px 20px', background: 'var(--surface-c-high)', borderRadius: 12 }}>
              {scoreH} — {scoreA}
            </span>
          </div>
        </div>

        {/* Artilheiros — aparece sozinho conforme o placar, opcional pra salvar */}
        {!isWO && (
          loadingPlayers ? (
            <div style={{ padding: '16px 0', fontSize: 13, color: 'var(--on-surface-variant)' }}>Carregando elencos…</div>
          ) : scoreH === 0 && scoreA === 0 ? (
            <div style={{ padding: '18px 16px', marginTop: 16, background: 'var(--surface-c)', borderRadius: 'var(--r-lg)', fontSize: 13, color: 'var(--on-surface-variant)', textAlign: 'center' }}>
              Marque o placar acima pra identificar os artilheiros (opcional).
            </div>
          ) : (
            <>
              {scoreH > 0 && (
                <ScorerSection
                  label={`Gols — ${home.tag}`}
                  tag={home.tag}
                  players={homePlayers}
                  oppPlayers={awayPlayers}
                  goals={homeScorers}
                  onChange={setHomeScorers}
                  targetCount={scoreH}
                />
              )}
              {scoreA > 0 && (
                <ScorerSection
                  label={`Gols — ${away.tag}`}
                  tag={away.tag}
                  players={awayPlayers}
                  oppPlayers={homePlayers}
                  goals={awayScorers}
                  onChange={setAwayScorers}
                  targetCount={scoreA}
                />
              )}
            </>
          )
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 10, marginTop: 20 }}>
          <button onClick={closeEditor} className="btn btn-outlined" style={{ height: 48 }}>Cancelar</button>
          <button disabled={busy} onClick={saveResult} className="btn btn-primary" style={{ height: 48, fontSize: 15 }}>
            {busy ? 'Salvando...' : 'Confirmar resultado'}
          </button>
        </div>
      </div>
    );
  }

  // ── Vista principal ───────────────────────────────────────────────────
  return (
    <div style={{ padding: '0 16px 80px' }}>

      {/* Seletor de competição — pill chips com scroll horizontal */}
      {competitions.length > 0 && (
        <div style={{ marginLeft: -16, marginRight: -16, marginBottom: 18 }}>
          <div style={{ display: 'flex', gap: 8, overflowX: 'auto', padding: '4px 16px 4px' }}>
            {competitions.map(c => {
              const active = c.id === compId;
              return (
                <button key={c.id} onClick={() => setCompId(c.id)}
                  style={{ flexShrink: 0, padding: '9px 18px', borderRadius: 24, border: `1.5px solid ${active ? 'var(--primary)' : 'var(--outline-variant)'}`, background: active ? 'var(--primary)' : 'transparent', color: active ? 'var(--on-primary)' : 'var(--on-surface)', fontSize: 13, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                  {c.nome}
                  <span style={{ opacity: 0.7, fontWeight: 400, marginLeft: 6, fontSize: 12 }}>{c.edicao}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {competitions.length === 0 && (
        <div className="empty">
          <div className="empty-icon">{I.trophy}</div>
          <p style={{ margin: 0, fontSize: 14 }}>Crie uma competição antes de agendar partidas.</p>
        </div>
      )}

      {selectedComp && !adding && matches.length > 0 && (
        <>
          {/* Busca por time */}
          <div style={{ position: 'relative', marginBottom: 12 }}>
            <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: 'var(--on-surface-variant)' }}>{I.search}</span>
            <input className="input" value={query} onChange={e => setQuery(e.target.value)}
              placeholder="Buscar time..." style={{ paddingLeft: 38 }} />
          </div>

          {/* Filtro de status */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
            {([['todas', 'Todas'], ['agendado', 'Agendadas'], ['finalizado', 'Encerradas']] as const).map(([v, l]) => (
              <button key={v} onClick={() => setStatusFilter(v)}
                style={{ padding: '6px 14px', borderRadius: 20, border: `1.5px solid ${statusFilter === v ? 'var(--primary)' : 'var(--outline-variant)'}`, background: statusFilter === v ? 'var(--primary)' : 'transparent', color: statusFilter === v ? 'var(--on-primary)' : 'var(--on-surface-variant)', fontSize: 12.5, fontWeight: 600, cursor: 'pointer' }}>
                {l}
              </button>
            ))}
          </div>

          {/* Atalho de rodada */}
          {allRodadas.length > 3 && !q && statusFilter === 'todas' && (
            <div style={{ marginLeft: -16, marginRight: -16, marginBottom: 14 }}>
              <div style={{ display: 'flex', gap: 6, overflowX: 'auto', padding: '0 16px 4px' }} className="hide-scrollbar">
                {allRodadas.map(r => (
                  <button key={r} onClick={() => jumpToRodada(r)}
                    style={{ flexShrink: 0, padding: '5px 12px', borderRadius: 14, background: 'var(--surface-c)', border: '1px solid var(--outline-variant)', fontSize: 11.5, fontWeight: 600, color: 'var(--on-surface-variant)', cursor: 'pointer' }}>
                    R{r}
                  </button>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Form: nova partida / editar dados de partida existente */}
      {adding && (
        <div className="card-filled" style={{ padding: '20px 16px', marginBottom: 16 }}>
          <div className="eyebrow eyebrow-acc" style={{ marginBottom: 18 }}>{editingDetailsId !== null ? 'EDITAR PARTIDA' : 'NOVA PARTIDA'}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            <TeamPickerButton
              label="Mandante"
              value={addForm.home_id}
              onChange={v => setAddForm(f => ({ ...f, home_id: v }))}
              clubs={clubs} clubById={clubById}
              exclude={addForm.away_id}
            />

            <TeamPickerButton
              label="Visitante"
              value={addForm.away_id}
              onChange={v => setAddForm(f => ({ ...f, away_id: v }))}
              clubs={clubs} clubById={clubById}
              exclude={addForm.home_id}
            />

            <DateTimePickerButton
              label={editingDetailsId !== null ? 'Nova data e hora (opcional)' : 'Data e hora'}
              value={{ dateISO: addForm.dateISO, hour: addForm.hour, minute: addForm.minute }}
              onChange={v => setAddForm(f => ({ ...f, dateISO: v.dateISO, hour: v.hour, minute: v.minute }))}
            />
            {editingDetailsId !== null && (
              <div style={{ fontSize: 12, color: 'var(--on-surface-variant)', marginTop: -8 }}>
                Data atual: {matches.find(x => x.id === editingDetailsId)?.date} — deixe em branco pra manter.
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <label className="field-label">Rodada</label>
                <input type="number" className="input" value={addForm.rodada} min={1}
                  onChange={e => setAddForm(f => ({ ...f, rodada: Number(e.target.value) }))} />
              </div>
              <div>
                <FieldLabel>Fase</FieldLabel>
                <input className="input" value={addForm.stage} placeholder={`Rodada ${addForm.rodada}`}
                  onChange={e => setAddForm(f => ({ ...f, stage: e.target.value }))} />
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 10, marginTop: 18 }}>
            <button onClick={cancelAddWithConfirm} className="btn btn-outlined" style={{ height: 48 }}>Cancelar</button>
            <button disabled={busy} onClick={editingDetailsId !== null ? saveDetails : addMatch} className="btn btn-primary" style={{ height: 48 }}>
              {busy ? 'Salvando...' : editingDetailsId !== null ? 'Salvar alterações' : 'Criar partida'}
            </button>
          </div>
        </div>
      )}

      {/* Lista de partidas agrupadas por rodada */}
      {loadingMatches ? (
        <div style={{ padding: '24px 0', fontSize: 13, color: 'var(--on-surface-variant)' }}>Carregando partidas...</div>
      ) : matches.length === 0 && !adding ? (
        <div className="empty">
          <div className="empty-icon">{I.ball}</div>
          <h3 style={{ margin: '0 0 6px', fontSize: 17, fontWeight: 700 }}>Nenhuma partida</h3>
          <p style={{ margin: '0 0 16px', fontSize: 14 }}>Clique em "+ Novo jogo" para agendar.</p>
        </div>
      ) : rodadas.length === 0 && !adding ? (
        <div className="empty">
          <div className="empty-icon">{I.search}</div>
          <p style={{ margin: 0, fontSize: 14 }}>Nenhuma partida encontrada.</p>
        </div>
      ) : (
        <>
        {rodadaPagination.pageItems.map(rodada => (
          <div key={rodada} ref={el => { rodadaRefs.current[rodada] = el; }} style={{ marginBottom: 20 }}>
            <div className="eyebrow" style={{ padding: '4px 2px 10px' }}>RODADA {rodada}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {byRodada[rodada].map(m => {
                const home = clubById(m.home);
                const away = clubById(m.away);
                if (!home || !away) return null;
                const isDone = m.status === 'finalizado';
                return (
                  <div key={m.id} className="card-filled" style={{ overflow: 'hidden', padding: 0 }}>
                    <div style={{ height: 3, background: isDone ? 'var(--primary)' : 'color-mix(in srgb, var(--warning) 70%, transparent)' }} />
                    <div style={{ padding: '14px 14px 12px' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <Crest id={home.id} size={32} radius={9} />
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 700 }}>{home.tag}</div>
                            <div style={{ fontSize: 11, color: 'var(--on-surface-variant)', maxWidth: 80, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{home.nome}</div>
                          </div>
                        </div>
                        {isDone ? (
                          <div style={{ textAlign: 'center', padding: '4px 12px', background: 'var(--surface-c-high)', borderRadius: 10 }}>
                            <span className="mono tabular" style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-0.03em' }}>{m.scoreH} — {m.scoreA}</span>
                          </div>
                        ) : (
                          <div style={{ textAlign: 'center', padding: '4px 12px' }}>
                            <span className="mono" style={{ fontSize: 14, color: 'var(--on-surface-variant)', fontWeight: 600 }}>vs</span>
                          </div>
                        )}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'flex-end' }}>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: 13, fontWeight: 700 }}>{away.tag}</div>
                            <div style={{ fontSize: 11, color: 'var(--on-surface-variant)', maxWidth: 80, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', direction: 'rtl' }}>{away.nome}</div>
                          </div>
                          <Crest id={away.id} size={32} radius={9} />
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 11.5, color: 'var(--on-surface-variant)', background: 'var(--surface-c-high)', padding: '3px 8px', borderRadius: 6, fontWeight: 500 }}>
                          📅 {m.date}
                        </span>
                        <span style={{ fontSize: 11.5, color: 'var(--on-surface-variant)' }}>{m.stage}</span>
                        <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
                          {!isDone && (
                            <button onClick={() => openEditor(m)} className="btn btn-primary"
                              style={{ height: 34, fontSize: 12, padding: '0 12px', display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                              <span style={{ width: 14, height: 14 }}>{I.edit}</span>
                              Resultado
                            </button>
                          )}
                          {isDone && (
                            <button onClick={() => openEditor(m)} className="icon-btn" style={{ width: 34, height: 34, color: 'var(--primary)' }} title="Corrigir resultado">{I.edit}</button>
                          )}
                          <button onClick={() => openEditDetails(m)} className="icon-btn" style={{ width: 34, height: 34, color: 'var(--on-surface-variant)' }} title="Editar times/data/rodada">{I.calendar}</button>
                          <button onClick={() => remove(m.id)} className="icon-btn" style={{ width: 34, height: 34, color: 'var(--error)' }} title="Remover">{I.trash}</button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
        <PageBar page={rodadaPagination.page} totalPages={rodadaPagination.totalPages} onPage={rodadaPagination.setPage}
          pageSize={rodadaPagination.pageSize} onPageSize={rodadaPagination.setPageSize}
          rangeLabel={rodadas.length === 0 ? '0 rodadas' : `rodadas ${rodadaPagination.rangeLabel}`}
          pageSizeOptions={[3, 5, 10, 20]} />
        </>
      )}

      {selectedComp && (
        <button onClick={openAdd} className="fab"><span style={{ width: 22, height: 22 }}>{I.plus}</span>Novo jogo</button>
      )}
    </div>
  );
}

// ── Notícias ──────────────────────────────────────────────────────────────────

const NEWS_CATEGORIES: { value: NewsCategory; label: string }[] = [
  { value: 'noticia', label: 'Notícia' },
  { value: 'inscricoes', label: 'Inscrições' },
  { value: 'comunicado', label: 'Comunicado' },
  { value: 'resultado', label: 'Resultado de jogo' },
];

function todayDateStr(): string {
  const DAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const MONTHS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  const d = new Date();
  return `${DAYS[d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()]}`;
}

function AdminNoticias() {
  const { showToast, confirm } = useApp();
  const { news, competitions, clubById, refresh } = useData();
  const [adding, setAdding] = useState(false);
  const [busy, setBusy] = useState(false);
  const newsPage = usePagination(news, 10);
  const BLANK_NEWS_FORM = { title: '', body: '', category: 'noticia' as NewsCategory, competitionId: '', matchId: null as number | null };
  const [form, setForm] = useState(BLANK_NEWS_FORM);
  const formSnapshot = useRef(JSON.stringify(BLANK_NEWS_FORM));

  // Partidas encerradas da competição escolhida, pra vincular ao card de resultado
  const [matchOptions, setMatchOptions] = useState<Match[]>([]);
  const [loadingMatches, setLoadingMatches] = useState(false);
  useEffect(() => {
    if (form.category !== 'resultado' || !form.competitionId) { setMatchOptions([]); return; }
    setLoadingMatches(true);
    fetchMatches(form.competitionId)
      .then(ms => setMatchOptions(ms.filter(m => m.status === 'finalizado')))
      .catch(() => setMatchOptions([]))
      .finally(() => setLoadingMatches(false));
  }, [form.category, form.competitionId]);

  const openCompsForInscricoes = competitions.filter(c => c.status === 'inscricoes');

  const openAdd = () => { setForm(BLANK_NEWS_FORM); formSnapshot.current = JSON.stringify(BLANK_NEWS_FORM); setAdding(true); };
  const cancelWithConfirm = async () => {
    if (JSON.stringify(form) !== formSnapshot.current) {
      if (!await confirm({ title: 'Descartar alterações?', message: 'Você tem alterações não salvas nessa notícia.', confirmLabel: 'Descartar', danger: true })) return;
    }
    setAdding(false);
  };

  const submit = async () => {
    if (!form.title.trim()) { showToast('Preencha o título'); return; }
    if (!form.body.trim()) { showToast('Preencha o texto da notícia'); return; }
    if (form.category === 'resultado' && !form.matchId) { showToast('Selecione a partida do card de resultado'); return; }
    if (form.category === 'inscricoes' && !form.competitionId) { showToast('Selecione a competição do card de inscrição'); return; }
    setBusy(true);
    try {
      await createNews({
        title: form.title.trim(),
        body: form.body.trim(),
        excerpt: form.body.trim().slice(0, 140),
        tag: NEWS_CATEGORIES.find(c => c.value === form.category)?.label ?? 'Notícia',
        date_str: todayDateStr(),
        category: form.category,
        match_id: form.category === 'resultado' ? form.matchId : null,
        competition_id: form.category === 'inscricoes' ? form.competitionId : null,
      });
      showToast('Notícia publicada!');
      setAdding(false);
      refresh();
    } catch (e: unknown) {
      showToast('Erro: ' + (e instanceof Error ? e.message : String(e)));
    } finally { setBusy(false); }
  };

  const remove = async (id: string, title: string) => {
    if (!await confirm({ title: `Remover "${title}"?`, danger: true, confirmLabel: 'Remover' })) return;
    try { await deleteNews(id); showToast('Notícia removida'); refresh(); }
    catch (e: unknown) { showToast('Erro: ' + (e instanceof Error ? e.message : String(e))); }
  };

  return (
    <div style={{ padding: '0 16px' }}>
      {adding && (
        <div className="card-filled" style={{ padding: '18px 16px', marginBottom: 14 }}>
          <div className="eyebrow eyebrow-acc" style={{ marginBottom: 14 }}>NOVA NOTÍCIA</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <FieldLabel required>Título</FieldLabel>
              <input className="input" value={form.title} onChange={e => setForm(s => ({ ...s, title: e.target.value }))} />
            </div>
            <div>
              <label className="field-label">Categoria</label>
              <select className="input" value={form.category}
                onChange={e => setForm(s => ({ ...s, category: e.target.value as NewsCategory, competitionId: '', matchId: null }))}>
                {NEWS_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>

            {form.category === 'resultado' && (
              <>
                <div>
                  <label className="field-label">Competição</label>
                  <select className="input" value={form.competitionId} onChange={e => setForm(s => ({ ...s, competitionId: e.target.value, matchId: null }))}>
                    <option value="">Selecione...</option>
                    {competitions.map(c => <option key={c.id} value={c.id}>{c.nome} {c.edicao}</option>)}
                  </select>
                </div>
                {form.competitionId && (
                  <div>
                    <label className="field-label">Partida</label>
                    {loadingMatches ? (
                      <div style={{ fontSize: 13, color: 'var(--on-surface-variant)', padding: '8px 0' }}>Carregando partidas...</div>
                    ) : matchOptions.length === 0 ? (
                      <div style={{ fontSize: 13, color: 'var(--on-surface-variant)', padding: '8px 0' }}>Nenhuma partida encerrada nessa competição.</div>
                    ) : (
                      <select className="input" value={form.matchId ?? ''} onChange={e => setForm(s => ({ ...s, matchId: Number(e.target.value) }))}>
                        <option value="">Selecione...</option>
                        {matchOptions.map(m => {
                          const home = clubById(m.home), away = clubById(m.away);
                          return <option key={m.id} value={m.id}>{home?.tag ?? m.home} {m.scoreH} × {m.scoreA} {away?.tag ?? m.away} — {m.stage}</option>;
                        })}
                      </select>
                    )}
                  </div>
                )}
              </>
            )}

            {form.category === 'inscricoes' && (
              <div>
                <label className="field-label">Competição</label>
                {openCompsForInscricoes.length === 0 ? (
                  <div style={{ fontSize: 13, color: 'var(--on-surface-variant)', padding: '8px 0' }}>Nenhuma competição com inscrições abertas no momento.</div>
                ) : (
                  <select className="input" value={form.competitionId} onChange={e => setForm(s => ({ ...s, competitionId: e.target.value }))}>
                    <option value="">Selecione...</option>
                    {openCompsForInscricoes.map(c => <option key={c.id} value={c.id}>{c.nome} {c.edicao}</option>)}
                  </select>
                )}
              </div>
            )}

            <div>
              <FieldLabel required>Notícia</FieldLabel>
              <textarea className="input" value={form.body} onChange={e => setForm(s => ({ ...s, body: e.target.value }))}
                placeholder="Separe parágrafos com uma linha em branco." style={{ minHeight: 160 }} />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 16 }}>
            <button onClick={cancelWithConfirm} className="btn btn-outlined" style={{ height: 42 }}>Cancelar</button>
            <button disabled={busy} onClick={submit} className="btn btn-primary" style={{ height: 42 }}>{busy ? 'Publicando...' : 'Publicar'}</button>
          </div>
        </div>
      )}

      {news.length === 0 && !adding ? (
        <div className="empty">
          <div className="empty-icon">{I.news}</div>
          <h3 style={{ margin: '0 0 6px', fontSize: 17, color: 'var(--on-surface)', fontWeight: 700 }}>Nenhuma notícia</h3>
          <p style={{ margin: '0 0 16px', fontSize: 14 }}>Clique em "+ Nova notícia" para publicar.</p>
        </div>
      ) : (
        <>
          <div className="card-filled">
            {newsPage.pageItems.map((n, i) => (
              <div key={n.id} className="list-row" style={{ borderTop: 'none', borderBottom: i < newsPage.pageItems.length - 1 ? '1px solid var(--outline-variant)' : 'none' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, lineHeight: 1.3 }}>{n.title}</div>
                  <div style={{ fontSize: 11.5, color: 'var(--on-surface-variant)', marginTop: 4 }}>{NEWS_CATEGORIES.find(c => c.value === n.category)?.label ?? n.tag} · {n.date}</div>
                </div>
                <button onClick={() => remove(n.id, n.title)} className="icon-btn" style={{ width: 36, height: 36, color: 'var(--error)' }}>{I.trash}</button>
              </div>
            ))}
          </div>
          <PageBar page={newsPage.page} totalPages={newsPage.totalPages} onPage={newsPage.setPage}
            pageSize={newsPage.pageSize} onPageSize={newsPage.setPageSize} rangeLabel={newsPage.rangeLabel} />
        </>
      )}
      <button onClick={openAdd} className="fab"><span style={{ width: 22, height: 22 }}>{I.plus}</span>Nova notícia</button>
    </div>
  );
}

// ── Competições ───────────────────────────────────────────────────────────────

const STATUS_LABELS: Record<Competition['status'], string> = {
  planejado: 'Planejado', inscricoes: 'Inscrições', em_andamento: 'Em andamento', encerrado: 'Encerrado',
};

const BLANK_COMP: Omit<Competition, 'id'> & { id: string } = {
  id: '', nome: '', edicao: '2026', status: 'planejado', rodada_atual: 0, total_rodadas: 22,
};

function rodadaLabel(atual: number, total: number): string {
  if (total === 0) return `Rodada ${atual}`;
  return `Rodada ${atual} de ${total}`;
}

// Sub-componente: inscreve/remove clubes (e todo o elenco) de uma competição
function CompClubsManager({ comp, onBack }: { comp: Competition; onBack: () => void }) {
  const { showToast, confirm } = useApp();
  const { clubs } = useData();
  const [enrolledIds, setEnrolledIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyFor, setBusyFor] = useState<string | null>(null);
  const [bulkBusy, setBulkBusy] = useState(false);
  const [query, setQuery] = useState('');

  useEffect(() => {
    fetchClubsInCompetition(comp.id)
      .then(setEnrolledIds)
      .catch(() => showToast('Erro ao carregar clubes'))
      .finally(() => setLoading(false));
  }, [comp.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const enrollOne = async (clubId: string) => {
    setBusyFor(clubId);
    try { await enrollClubWithRoster(clubId, comp.id); setEnrolledIds(ids => [...ids, clubId]); }
    catch (e) { showToast('Erro: ' + (e instanceof Error ? e.message : String(e))); }
    finally { setBusyFor(null); }
  };

  const unenrollOne = async (clubId: string, nome: string) => {
    if (!await confirm({ title: `Remover "${nome}" da competição?`, message: 'O elenco do time sai da competição (partidas e resultados já lançados não são apagados).', confirmLabel: 'Remover', danger: true })) return;
    setBusyFor(clubId);
    try { await unenrollClubWithRoster(clubId, comp.id); setEnrolledIds(ids => ids.filter(id => id !== clubId)); }
    catch (e) { showToast('Erro: ' + (e instanceof Error ? e.message : String(e))); }
    finally { setBusyFor(null); }
  };

  const toggleClub = (c: Club) => enrolledIds.includes(c.id) ? unenrollOne(c.id, c.nome) : enrollOne(c.id);

  const enrollAll = async () => {
    const missing = clubs.filter(c => !enrolledIds.includes(c.id));
    if (missing.length === 0) return;
    if (!await confirm({ title: `Inscrever todos os ${missing.length} times de fora?`, confirmLabel: 'Inscrever todos' })) return;
    setBulkBusy(true);
    try {
      await Promise.all(missing.map(c => enrollClubWithRoster(c.id, comp.id)));
      setEnrolledIds(ids => [...ids, ...missing.map(c => c.id)]);
      showToast('Todos os times foram inscritos!');
    } catch (e) { showToast('Erro: ' + (e instanceof Error ? e.message : String(e))); }
    finally { setBulkBusy(false); }
  };

  const unenrollAll = async () => {
    if (enrolledIds.length === 0) return;
    if (!await confirm({ title: `Remover todos os ${enrolledIds.length} times inscritos?`, message: 'Isso esvazia a competição inteira.', confirmLabel: 'Remover todos', danger: true })) return;
    setBulkBusy(true);
    try {
      await Promise.all(enrolledIds.map(id => unenrollClubWithRoster(id, comp.id)));
      setEnrolledIds([]);
      showToast('Todos os times foram removidos');
    } catch (e) { showToast('Erro: ' + (e instanceof Error ? e.message : String(e))); }
    finally { setBulkBusy(false); }
  };

  const enrolledCount = enrolledIds.length;
  const q = query.trim().toLowerCase();
  const visibleClubs = clubs
    .filter(c => !q || c.nome.toLowerCase().includes(q) || c.tag.toLowerCase().includes(q))
    .sort((a, b) => Number(enrolledIds.includes(b.id)) - Number(enrolledIds.includes(a.id)));

  return (
    <div style={{ padding: '0 16px 80px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingBottom: 4 }}>
        <button onClick={onBack} className="icon-btn" style={{ width: 36, height: 36 }}>←</button>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700 }}>{comp.nome}</div>
          <div style={{ fontSize: 12, color: 'var(--on-surface-variant)' }}>
            {comp.edicao}
          </div>
        </div>
      </div>

      {/* Stats pill */}
      {!loading && (
        <div style={{ display: 'flex', gap: 8, margin: '14px 0' }}>
          <span style={{ background: 'var(--primary-container)', color: 'var(--on-primary-container)', padding: '4px 14px', borderRadius: 999, fontSize: 13, fontWeight: 700 }}>
            {enrolledCount} inscrito{enrolledCount !== 1 ? 's' : ''}
          </span>
          <span style={{ background: 'var(--surface-c-high)', color: 'var(--on-surface-variant)', padding: '4px 14px', borderRadius: 999, fontSize: 13 }}>
            {clubs.length - enrolledCount} fora
          </span>
        </div>
      )}

      {!loading && clubs.length > 1 && (
        <>
          <div style={{ position: 'relative', marginBottom: 10 }}>
            <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: 'var(--on-surface-variant)' }}>{I.search}</span>
            <input className="input" value={query} onChange={e => setQuery(e.target.value)}
              placeholder="Buscar time..." style={{ paddingLeft: 38 }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
            <button disabled={bulkBusy || clubs.length === enrolledCount} onClick={enrollAll} className="btn btn-tonal" style={{ height: 38, fontSize: 12.5 }}>Inscrever todos</button>
            <button disabled={bulkBusy || enrolledCount === 0} onClick={unenrollAll} className="btn btn-outlined" style={{ height: 38, fontSize: 12.5, color: 'var(--error)', borderColor: 'var(--error)' }}>Remover todos</button>
          </div>
        </>
      )}

      {loading ? (
        <div style={{ padding: '20px 0', fontSize: 13, color: 'var(--on-surface-variant)' }}>Carregando...</div>
      ) : clubs.length === 0 ? (
        <div className="empty">
          <div className="empty-icon">{I.shield}</div>
          <p style={{ margin: 0, fontSize: 14 }}>Nenhum clube cadastrado ainda.</p>
        </div>
      ) : visibleClubs.length === 0 ? (
        <div className="empty">
          <div className="empty-icon">{I.search}</div>
          <p style={{ margin: 0, fontSize: 14 }}>Nenhum time encontrado.</p>
        </div>
      ) : (
        <div className="card-filled">
          {visibleClubs.map((c, i) => {
            const isEnrolled = enrolledIds.includes(c.id);
            const isBusy = busyFor === c.id;
            return (
              <div key={c.id} style={{ display: 'grid', gridTemplateColumns: '44px 1fr auto', alignItems: 'center', gap: 12, padding: '13px 14px', borderTop: i ? '1px solid var(--outline-variant)' : 'none', background: isEnrolled ? 'color-mix(in srgb, var(--primary) 5%, transparent)' : 'transparent', transition: 'background .2s' }}>
                <Crest id={c.id} size={44} radius={12} />
                <div>
                  <div style={{ fontSize: 14, fontWeight: isEnrolled ? 700 : 600, color: isEnrolled ? 'var(--on-surface)' : 'var(--on-surface)' }}>{c.nome}</div>
                  <div className="mono" style={{ fontSize: 11, color: 'var(--on-surface-variant)', marginTop: 2 }}>{c.tag}</div>
                </div>
                <button
                  disabled={isBusy || bulkBusy}
                  onClick={() => toggleClub(c)}
                  style={{
                    height: 36, padding: '0 16px', borderRadius: 999, fontSize: 13, fontWeight: 700,
                    cursor: isBusy ? 'default' : 'pointer',
                    background: isEnrolled ? 'var(--primary)' : 'var(--surface-c-high)',
                    color: isEnrolled ? 'var(--on-primary)' : 'var(--on-surface-variant)',
                    border: 'none', transition: 'background .15s, color .15s',
                    minWidth: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  }}
                >
                  {isBusy ? '...' : isEnrolled ? '✓ Inscrito' : '+ Inscrever'}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function AdminCompeticoes() {
  const { showToast, confirm } = useApp();
  const { competitions, refresh } = useData();
  const [adding, setAdding] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState<Omit<Competition, 'id'> & { id: string }>(BLANK_COMP);
  const [rodadasLivres, setRodadasLivres] = useState(false);
  // Sub-view: manage clubs for a competition
  const [managingComp, setManagingComp] = useState<Competition | null>(null);

  const compFormSnapshot = useRef('');

  const resetComp = () => {
    setAdding(false); setEditId(null);
    setForm(BLANK_COMP); setRodadasLivres(false);
  };

  const cancelCompWithConfirm = async () => {
    if (JSON.stringify(form) !== compFormSnapshot.current) {
      if (!await confirm({ title: 'Descartar alterações?', message: 'Você tem alterações não salvas nessa competição.', confirmLabel: 'Descartar', danger: true })) return;
    }
    resetComp();
  };

  const startEdit = (c: Competition) => {
    setEditId(c.id);
    setForm({ ...c });
    compFormSnapshot.current = JSON.stringify({ ...c });
    setRodadasLivres(c.total_rodadas === 0);
    setAdding(false); setManagingComp(null);
  };

  const submit = async () => {
    if (!form.nome) { showToast('Preencha o nome'); return; }
    const base = slugify(`${form.nome} ${form.edicao}`);
    const id = uniqueSlug(base, competitions.map(c => c.id));
    const payload = { ...form, id, total_rodadas: rodadasLivres ? 0 : form.total_rodadas };
    setBusy(true);
    try {
      await createCompetition(payload);
      showToast(`${form.nome} criada!`);
      resetComp(); refresh();
    } catch (e: unknown) { showToast('Erro: ' + (e instanceof Error ? e.message : String(e))); }
    finally { setBusy(false); }
  };

  const submitEdit = async () => {
    if (!editId || !form.nome) { showToast('Preencha o nome'); return; }
    setBusy(true);
    try {
      const { id, ...patch } = { ...form, total_rodadas: rodadasLivres ? 0 : form.total_rodadas };
      await updateCompetition(id, patch);
      showToast('Competição atualizada!'); resetComp(); refresh();
    } catch (e: unknown) { showToast('Erro: ' + (e instanceof Error ? e.message : String(e))); }
    finally { setBusy(false); }
  };

  const remove = async (id: string, nome: string) => {
    if (!await confirm({ title: `Remover "${nome}"?`, message: 'Todos os dados (partidas, classificação) serão excluídos.', danger: true, confirmLabel: 'Remover' })) return;
    try { await deleteCompetition(id); showToast(`${nome} removida`); refresh(); }
    catch (e: unknown) { showToast('Erro: ' + (e instanceof Error ? e.message : String(e))); }
  };

  const compFormFields = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div>
        <FieldLabel required>Nome da competição</FieldLabel>
        <input className="input" value={form.nome} onChange={e => setForm(s => ({ ...s, nome: e.target.value }))} placeholder="Nome da competição" />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <div><label className="field-label">Edição / Temporada</label><input className="input" value={form.edicao} onChange={e => setForm(s => ({ ...s, edicao: e.target.value }))} placeholder="Ano ou temporada" /></div>
        <div>
          <label className="field-label">Status</label>
          <select className="input" value={form.status} onChange={e => setForm(s => ({ ...s, status: e.target.value as Competition['status'] }))}>
            {(Object.keys(STATUS_LABELS) as Competition['status'][]).map(k => <option key={k} value={k}>{STATUS_LABELS[k]}</option>)}
          </select>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: rodadasLivres ? '1fr' : '1fr 1fr', gap: 10 }}>
        <div><label className="field-label">Rodada atual</label><input type="number" className="input" value={form.rodada_atual} onChange={e => setForm(s => ({ ...s, rodada_atual: Number(e.target.value) }))} min={0} /></div>
        {!rodadasLivres && (
          <div><label className="field-label">Total de rodadas</label><input type="number" className="input" value={form.total_rodadas || ''} onChange={e => setForm(s => ({ ...s, total_rodadas: Number(e.target.value) }))} min={1} placeholder="Qtd de rodadas" /></div>
        )}
      </div>
      <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 13, padding: '2px 0' }}>
        <input type="checkbox" checked={rodadasLivres} onChange={e => setRodadasLivres(e.target.checked)} style={{ width: 16, height: 16, accentColor: 'var(--primary)' }} />
        <span style={{ fontWeight: 600 }}>Rodadas indeterminadas</span>
        <span style={{ color: 'var(--on-surface-variant)', fontSize: 12 }}>sem total definido</span>
      </label>
    </div>
  );

  // Sub-view: manage clubs in this competition
  if (managingComp) {
    return <CompClubsManager comp={managingComp} onBack={() => setManagingComp(null)} />;
  }

  return (
    <div style={{ padding: '0 16px' }}>
      {/* Competition form */}
      {(adding || editId) && (
        <div className="card-filled" style={{ padding: '18px 16px', marginBottom: 14 }}>
          <div className="eyebrow eyebrow-acc" style={{ marginBottom: 14 }}>{adding ? 'NOVA COMPETIÇÃO' : 'EDITAR COMPETIÇÃO'}</div>
          {compFormFields()}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 16 }}>
            <button onClick={cancelCompWithConfirm} className="btn btn-outlined" style={{ height: 42 }}>Cancelar</button>
            <button disabled={busy} onClick={adding ? submit : submitEdit} className="btn btn-primary" style={{ height: 42 }}>
              {busy ? 'Salvando...' : adding ? 'Criar competição' : 'Salvar'}
            </button>
          </div>
        </div>
      )}

      {competitions.length === 0 && !adding ? (
        <div className="empty">
          <div className="empty-icon">{I.trophy}</div>
          <h3 style={{ margin: '0 0 6px', fontSize: 17, color: 'var(--on-surface)', fontWeight: 700 }}>Nenhuma competição</h3>
          <p style={{ margin: '0 0 16px', fontSize: 14 }}>Crie uma competição para começar.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {competitions.map(c => (
            <div key={c.id} className="card-filled" style={{ padding: 0, overflow: 'hidden' }}>
              {/* Status bar */}
              <div style={{ height: 4, background: c.status === 'em_andamento' ? 'var(--primary)' : c.status === 'encerrado' ? 'var(--outline)' : 'var(--surface-c-high)' }} />
              <div style={{ padding: '14px 16px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 15, fontWeight: 700 }}>{c.nome}</div>
                    <div style={{ fontSize: 12, color: 'var(--on-surface-variant)', marginTop: 2 }}>
                      {c.edicao} · <span className={c.status === 'em_andamento' ? 'chip' : ''} style={c.status === 'em_andamento' ? { background: 'var(--primary-container)', color: 'var(--on-primary-container)', fontSize: 11, padding: '2px 8px', borderRadius: 999, fontWeight: 700 } : {}}>{STATUS_LABELS[c.status]}</span>
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--on-surface-variant)', marginTop: 4 }}>{rodadaLabel(c.rodada_atual, c.total_rodadas)}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                    <button onClick={() => startEdit(c)} className="icon-btn" style={{ width: 32, height: 32, color: 'var(--primary)' }} title="Editar">{I.edit}</button>
                    <button onClick={() => remove(c.id, c.nome)} className="icon-btn" style={{ width: 32, height: 32, color: 'var(--error)' }} title="Remover">{I.trash}</button>
                  </div>
                </div>
                {/* Manage clubs button */}
                <button
                  onClick={() => setManagingComp(c)}
                  className="btn btn-tonal"
                  style={{ marginTop: 12, height: 36, fontSize: 13, display: 'inline-flex', alignItems: 'center', gap: 6, width: '100%', justifyContent: 'center' }}
                >
                  <span style={{ width: 16, height: 16 }}>{I.shield}</span>
                  Gerenciar clubes inscritos
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      <button onClick={() => { setAdding(true); setEditId(null); setForm(BLANK_COMP); compFormSnapshot.current = JSON.stringify(BLANK_COMP); setRodadasLivres(false); }} className="fab">
        <span style={{ width: 22, height: 22 }}>{I.plus}</span>Nova competição
      </button>
    </div>
  );
}

// ── Shell principal ───────────────────────────────────────────────────────────

const NAV_GERAL: Section[] = ['dashboard', 'inscricoes', 'times'];
const NAV_COMPETICAO: Section[] = ['partidas', 'noticias', 'competicoes'];
const SECTION_SUB: Record<Section, string> = {
  dashboard: 'Visão geral da liga',
  inscricoes: 'Times aguardando aprovação',
  times: 'Clubes e elenco',
  partidas: 'Calendário e resultados',
  noticias: 'Publicações da federação',
  competicoes: 'Ligas e inscrições de clubes',
};

function AdminSidebar({ section, setSection, pendentes, isDesktop, mobileOpen, onCloseMobile }: {
  section: Section; setSection: (s: Section) => void; pendentes: number;
  isDesktop: boolean; mobileOpen: boolean; onCloseMobile: () => void;
}) {
  const { resolvedTheme, setTheme } = useApp();
  const { user, signOut } = useAuth();

  const navBtnStyle = (id: Section): React.CSSProperties => ({
    display: 'flex', alignItems: 'center', gap: 11, width: '100%', height: 40, padding: '0 12px',
    borderRadius: 10, border: 'none', cursor: 'pointer', fontSize: 13.5, fontFamily: 'var(--dc-sans)',
    background: section === id ? 'var(--dc-surface-3)' : 'transparent',
    color: section === id ? 'var(--dc-text)' : 'var(--dc-text-2)', fontWeight: section === id ? 700 : 500,
  });

  const NavGroup = ({ title, ids, close }: { title: string; ids: Section[]; close?: boolean }) => (
    <>
      <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '0.09em', color: 'var(--dc-text-3)', padding: '12px 12px 8px' }}>{title}</div>
      {ids.map(id => {
        const s = SECTIONS.find(x => x.id === id)!;
        return (
          <button key={id} onClick={() => { setSection(id); if (close) onCloseMobile(); }} style={navBtnStyle(id)}>
            <span style={{ width: 19, height: 19, flexShrink: 0, display: 'grid', placeItems: 'center' }}>{I[s.icon]}</span>
            <span style={{ flex: 1, textAlign: 'left' }}>{s.label}</span>
            {id === 'inscricoes' && pendentes > 0 && (
              <span style={{ fontSize: 10.5, fontWeight: 700, color: '#fff', background: 'var(--dc-live)', padding: '2px 7px', borderRadius: 99 }}>{pendentes}</span>
            )}
          </button>
        );
      })}
    </>
  );

  if (isDesktop) {
    return (
      <aside style={{ display: 'flex', flexDirection: 'column', width: 264, flexShrink: 0, background: 'var(--dc-panel)', borderRight: '1px solid var(--dc-border)', height: '100dvh' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '22px 20px 20px' }}>
          <div style={{ width: 34, height: 34, borderRadius: 10, background: 'var(--dc-accent)', color: 'var(--dc-on-accent)', display: 'grid', placeItems: 'center', fontWeight: 800, fontSize: 17, letterSpacing: '-0.03em' }}>C</div>
          <div style={{ lineHeight: 1.1 }}>
            <div style={{ fontWeight: 700, fontSize: 14.5, letterSpacing: '-0.02em', color: 'var(--dc-text)' }}>CPM Admin</div>
            <div style={{ fontSize: 11, color: 'var(--dc-text-3)', fontWeight: 500 }}>MamoBall · staff</div>
          </div>
        </div>
        <div style={{ padding: '2px 12px 0', flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 2 }}>
          <NavGroup title="GERAL" ids={NAV_GERAL} />
          <NavGroup title="COMPETIÇÃO" ids={NAV_COMPETICAO} />
        </div>
        <div style={{ padding: 12, borderTop: '1px solid var(--dc-border)' }}>
          <div style={{ display: 'flex', background: 'var(--dc-surface-2)', borderRadius: 11, padding: 3, gap: 2, marginBottom: 10 }}>
            <button onClick={() => setTheme('light')}
              style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, height: 32, borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 12.5, fontWeight: 600, fontFamily: 'var(--dc-sans)', background: resolvedTheme === 'light' ? 'var(--dc-surface)' : 'transparent', color: resolvedTheme === 'light' ? 'var(--dc-text)' : 'var(--dc-text-3)', boxShadow: resolvedTheme === 'light' ? 'var(--dc-shadow-sm)' : 'none' }}>
              <span style={{ width: 15, height: 15 }}>{I.sun}</span>Claro
            </button>
            <button onClick={() => setTheme('dark')}
              style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, height: 32, borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 12.5, fontWeight: 600, fontFamily: 'var(--dc-sans)', background: resolvedTheme === 'dark' ? 'var(--dc-surface)' : 'transparent', color: resolvedTheme === 'dark' ? 'var(--dc-text)' : 'var(--dc-text-3)', boxShadow: resolvedTheme === 'dark' ? 'var(--dc-shadow-sm)' : 'none' }}>
              <span style={{ width: 15, height: 15 }}>{I.moon}</span>Escuro
            </button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 8px' }}>
            <div style={{ width: 32, height: 32, borderRadius: 99, background: 'var(--dc-surface-3)', border: '1px solid var(--dc-border)', display: 'grid', placeItems: 'center', fontWeight: 700, fontSize: 13, color: 'var(--dc-text)' }}>
              {(user?.email?.[0] ?? '?').toUpperCase()}
            </div>
            <div style={{ flex: 1, minWidth: 0, lineHeight: 1.2 }}>
              <div style={{ fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: 'var(--dc-text)' }}>{user?.email ?? 'Staff'}</div>
              <div style={{ fontSize: 11, color: 'var(--dc-text-3)' }}>★ Administrador</div>
            </div>
            <button onClick={() => signOut()} title="Sair"
              style={{ width: 30, height: 30, borderRadius: 8, border: 'none', background: 'transparent', color: 'var(--dc-text-3)', display: 'grid', placeItems: 'center', cursor: 'pointer' }}>
              <span style={{ width: 16, height: 16 }}>{I.signOut}</span>
            </button>
          </div>
        </div>
      </aside>
    );
  }

  if (!mobileOpen) return null;
  return (
    <>
      <div onClick={onCloseMobile} style={{ position: 'fixed', inset: 0, zIndex: 80, background: 'rgba(0,0,0,.45)', animation: 'dcInFade .18s ease' }} />
      <div style={{ position: 'fixed', top: 0, bottom: 0, left: 0, zIndex: 81, width: 250, background: 'var(--dc-panel)', borderRight: '1px solid var(--dc-border)', animation: 'dcInUp .22s ease', display: 'flex', flexDirection: 'column', padding: '16px 12px', gap: 2, overflowY: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '6px 10px 16px' }}>
          <div style={{ width: 32, height: 32, borderRadius: 10, background: 'var(--dc-accent)', color: 'var(--dc-on-accent)', display: 'grid', placeItems: 'center', fontWeight: 800, fontSize: 16 }}>C</div>
          <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--dc-text)' }}>CPM Admin</div>
        </div>
        <NavGroup title="GERAL" ids={NAV_GERAL} close />
        <NavGroup title="COMPETIÇÃO" ids={NAV_COMPETICAO} close />
      </div>
    </>
  );
}

export function AdminScreen({ onBack, onNav }: NavProps) {
  const [section, setSection] = useState<Section>('dashboard');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const { inscricoes } = useData();
  const { resolvedTheme } = useApp();
  const isDesktop = useIsDesktop();
  const pendentes = inscricoes.filter(i => i.status === 'pendente').length;
  const active = SECTIONS.find(s => s.id === section)!;

  const sectionView = (
    <>
      {section === 'dashboard'   && <AdminDashboard  onSection={setSection} />}
      {section === 'inscricoes'  && <AdminInscricoes onNav={onNav} />}
      {section === 'times'       && <AdminTimes />}
      {section === 'partidas'    && <AdminPartidas />}
      {section === 'noticias'    && <AdminNoticias />}
      {section === 'competicoes' && <AdminCompeticoes />}
    </>
  );

  return (
    <div className="app-root dc-mono" data-theme={resolvedTheme}
      style={{ display: 'flex', height: '100dvh', width: '100%', overflow: 'hidden', background: 'var(--dc-bg)', color: 'var(--dc-text)', fontFamily: 'var(--dc-sans)', position: 'relative' }}>

      <AdminSidebar section={section} setSection={setSection} pendentes={pendentes}
        isDesktop={isDesktop} mobileOpen={mobileNavOpen} onCloseMobile={() => setMobileNavOpen(false)} />

      <main style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <header style={{ display: 'flex', alignItems: 'center', gap: 12, padding: isDesktop ? '14px 28px' : '12px 16px', borderBottom: '1px solid var(--dc-border)', background: 'var(--dc-surface)', position: 'sticky', top: 0, zIndex: 20, minHeight: 66 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0, flex: 1 }}>
            {!isDesktop && (
              <button onClick={() => setMobileNavOpen(true)} title="Menu"
                style={{ display: 'grid', placeItems: 'center', width: 40, height: 40, borderRadius: 10, border: '1px solid var(--dc-border)', background: 'var(--dc-surface)', color: 'var(--dc-text)', cursor: 'pointer', flexShrink: 0 }}>
                <span style={{ width: 20, height: 20 }}>{I.hamburger}</span>
              </button>
            )}
            <button onClick={onBack} title="Voltar ao app"
              style={{ display: 'grid', placeItems: 'center', width: 40, height: 40, borderRadius: 10, border: '1px solid var(--dc-border)', background: 'var(--dc-surface)', color: 'var(--dc-text-2)', cursor: 'pointer', flexShrink: 0 }}>
              <span style={{ width: 18, height: 18 }}>{I.back}</span>
            </button>
            <div style={{ minWidth: 0 }}>
              <h1 style={{ margin: 0, fontSize: 19, fontWeight: 700, letterSpacing: '-0.02em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: 'var(--dc-text)' }}>{active.label}</h1>
              <div style={{ fontSize: 12.5, color: 'var(--dc-text-3)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{SECTION_SUB[section]}</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            <button onClick={() => onNav('search')} title="Buscar"
              style={{ width: 38, height: 38, borderRadius: 10, border: '1px solid var(--dc-border)', background: 'var(--dc-surface)', color: 'var(--dc-text-2)', display: 'grid', placeItems: 'center', cursor: 'pointer', flexShrink: 0 }}>
              <span style={{ width: 17, height: 17 }}>{I.search}</span>
            </button>
          </div>
        </header>

        <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
          <div style={{ maxWidth: 1180, margin: '0 auto', width: '100%', padding: isDesktop ? '28px 28px 60px' : '20px 16px 48px' }}>
            {sectionView}
          </div>
        </div>
      </main>
    </div>
  );
}
