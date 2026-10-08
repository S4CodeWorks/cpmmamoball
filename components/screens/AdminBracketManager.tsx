'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { I } from '@/components/icons';
import { Crest } from '@/components/ui/Crest';
import { Select } from '@/components/ui/Select';
import { Skeleton } from '@/components/ui/Skeleton';
import { useApp } from '@/contexts/AppContext';
import { useData } from '@/contexts/DataContext';
import {
  createBracketTie, deleteBracketTie, fetchBracketTies, fetchClubsInCompetition,
  fetchMatches, updateBracketTie, type BracketTieInput, type Competition,
} from '@/lib/db';
import type { BracketTie, Match } from '@/lib/types';

type Props = { comp: Competition; onBack: () => void };
type TieForm = {
  stage_order: number;
  stage_name: string;
  tie_order: number;
  home_choice: string;
  away_choice: string;
  first_leg_match_id: string;
  second_leg_match_id: string;
  is_bye: boolean;
};

const blank = (): TieForm => ({
  stage_order: 1, stage_name: 'Quartas de final', tie_order: 1,
  home_choice: '', away_choice: '', first_leg_match_id: '', second_leg_match_id: '', is_bye: false,
});

function choiceFor(clubId: string | null, sourceId: string | null) {
  return clubId ? `club:${clubId}` : sourceId ? `tie:${sourceId}` : '';
}

function shortTie(tie: BracketTie) {
  const name = tie.stage_name.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
  const code = name.includes('quart') ? 'Q' : name.includes('oitav') ? 'O' : name.includes('semi') ? 'S' : name.includes('final') ? 'F' : (tie.stage_name[0] ?? 'F').toUpperCase();
  return `${code}${tie.tie_order}`;
}

export function AdminBracketManager({ comp, onBack }: Props) {
  const { clubs: allClubs } = useData();
  const { showToast, showError, confirm } = useApp();
  const [ties, setTies] = useState<BracketTie[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [clubIds, setClubIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<TieForm>(blank);
  const [formOpen, setFormOpen] = useState(false);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const [nextTies, nextMatches, nextClubIds] = await Promise.all([
        fetchBracketTies(comp.id), fetchMatches(comp.id), fetchClubsInCompetition(comp.id),
      ]);
      setTies(nextTies);
      setMatches(nextMatches);
      setClubIds(nextClubIds);
    } catch (error) {
      showError(error);
    } finally { setLoading(false); }
  }, [comp.id, showError]);

  useEffect(() => {
    // This effect starts an async database read; reload owns its loading state.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void reload();
  }, [reload]);

  const clubs = useMemo(() => allClubs.filter(club => clubIds.includes(club.id)), [allClubs, clubIds]);
  const usedMatchIds = useMemo(() => new Set(ties.flatMap(tie => [tie.first_leg_match_id, tie.second_leg_match_id]).filter((id): id is number => id !== null)), [ties]);
  const matchOptions = matches.map(match => {
    const home = allClubs.find(club => club.id === match.home);
    const away = allClubs.find(club => club.id === match.away);
    const score = match.status === 'finalizado' ? ` · ${match.scoreH}–${match.scoreA}` : '';
    return { value: String(match.id), label: `${home?.tag ?? match.home} × ${away?.tag ?? match.away}${score} · ${match.stage}` };
  });

  const beginAdd = () => {
    const latest = ties.reduce((max, tie) => Math.max(max, tie.stage_order), 0);
    setForm({ ...blank(), stage_order: latest || 1, stage_name: latest ? ties.find(t => t.stage_order === latest)?.stage_name ?? 'Semifinal' : 'Quartas de final', tie_order: ties.filter(t => t.stage_order === (latest || 1)).length + 1 });
    setEditingId(null);
    setFormOpen(true);
  };

  const beginEdit = (tie: BracketTie) => {
    setForm({
      stage_order: tie.stage_order, stage_name: tie.stage_name, tie_order: tie.tie_order,
      home_choice: choiceFor(tie.home_club_id, tie.home_source_tie_id),
      away_choice: choiceFor(tie.away_club_id, tie.away_source_tie_id),
      first_leg_match_id: tie.first_leg_match_id === null ? '' : String(tie.first_leg_match_id),
      second_leg_match_id: tie.second_leg_match_id === null ? '' : String(tie.second_leg_match_id),
      is_bye: tie.is_bye,
    });
    setEditingId(tie.id);
    setFormOpen(true);
  };

  const optionsForSlot = (stageOrder: number, currentChoice: string) => [
    ...clubs.map(club => ({ value: `club:${club.id}`, label: club.nome })),
    ...ties.filter(tie => tie.stage_order < stageOrder
      && (`tie:${tie.id}` === currentChoice || !ties.some(parent => parent.id !== editingId
        && (parent.home_source_tie_id === tie.id || parent.away_source_tie_id === tie.id))))
      .map(tie => ({ value: `tie:${tie.id}`, label: `Vencedor ${shortTie(tie)} · ${tie.stage_name}` })),
  ];

  const resolveChoice = (choice: string) => {
    if (choice.startsWith('club:')) return { club_id: choice.slice(5), source_id: null };
    if (choice.startsWith('tie:')) return { club_id: null, source_id: choice.slice(4) };
    return { club_id: null, source_id: null };
  };

  const save = async () => {
    const home = resolveChoice(form.home_choice);
    const away = resolveChoice(form.away_choice);
    if (!form.stage_name.trim() || form.stage_name.trim().length < 2 || form.stage_name.trim().length > 48) {
      showToast('Informe o nome da fase (2 a 48 caracteres).'); return;
    }
    if (!Number.isInteger(form.stage_order) || form.stage_order < 1 || !Number.isInteger(form.tie_order) || form.tie_order < 1) {
      showToast('Fase e confronto precisam ter uma ordem válida.'); return;
    }
    if (!form.home_choice || (!form.is_bye && !form.away_choice) || (form.is_bye && form.away_choice)) {
      showToast(form.is_bye ? 'BYE precisa ter somente o clube que avança.' : 'Defina os dois lados do confronto.'); return;
    }
    if (home.source_id && home.source_id === away.source_id) { showToast('As duas vagas não podem vir do mesmo confronto.'); return; }
    if (home.club_id && home.club_id === away.club_id) { showToast('O mesmo clube não pode ocupar as duas vagas.'); return; }
    const sourceIds = [home.source_id, away.source_id].filter((id): id is string => Boolean(id));
    if (sourceIds.some(id => !ties.some(source => source.id === id && source.stage_order < form.stage_order))) {
      showToast('A vaga precisa vir de um confronto de uma fase anterior.'); return;
    }
    if (sourceIds.some(id => ties.some(parent => parent.id !== editingId
      && (parent.home_source_tie_id === id || parent.away_source_tie_id === id)))) {
      showToast('O vencedor deste confronto já está ligado a outra vaga.'); return;
    }
    if (form.is_bye && (!home.club_id || home.source_id || form.first_leg_match_id || form.second_leg_match_id)) {
      showToast('BYE exige um clube direto e não pode ter partidas vinculadas.'); return;
    }

    const firstId = form.is_bye || !form.first_leg_match_id ? null : Number(form.first_leg_match_id);
    const secondId = form.is_bye || !form.second_leg_match_id ? null : Number(form.second_leg_match_id);
    if (comp.classification_format === 'knockout_single' && secondId !== null) {
      showToast('Jogo único aceita apenas uma partida por confronto.'); return;
    }
    if (secondId !== null && firstId === null) { showToast('Cadastre a ida antes de vincular a volta.'); return; }
    if (firstId !== null && firstId === secondId) { showToast('Ida e volta precisam ser partidas diferentes.'); return; }

    const assignedMatches = [firstId, secondId].filter((id): id is number => id !== null).map(id => matches.find(match => match.id === id)).filter((match): match is Match => Boolean(match));
    const blockedIds = new Set(ties.filter(tie => tie.id !== editingId).flatMap(tie => [tie.first_leg_match_id, tie.second_leg_match_id]).filter((id): id is number => id !== null));
    if (assignedMatches.some(match => blockedIds.has(match.id))) { showToast('Uma partida já está vinculada a outro confronto.'); return; }
    if (home.club_id && away.club_id && assignedMatches.some(match => match.home !== home.club_id && match.home !== away.club_id || match.away !== home.club_id && match.away !== away.club_id)) {
      showToast('As partidas vinculadas precisam envolver os dois clubes da vaga.'); return;
    }
    if (assignedMatches.length === 2 && (assignedMatches[0].home !== assignedMatches[1].home || assignedMatches[0].away !== assignedMatches[1].away)
      && (assignedMatches[0].home !== assignedMatches[1].away || assignedMatches[0].away !== assignedMatches[1].home)) {
      showToast('Ida e volta precisam envolver o mesmo par de clubes.'); return;
    }

    const payload: BracketTieInput = {
      competition_id: comp.id,
      stage_order: form.stage_order,
      stage_name: form.stage_name.trim(),
      tie_order: form.tie_order,
      home_club_id: home.club_id,
      away_club_id: away.club_id,
      home_source_tie_id: home.source_id,
      away_source_tie_id: away.source_id,
      first_leg_match_id: firstId,
      second_leg_match_id: secondId,
      is_bye: form.is_bye,
    };
    setBusy(true);
    try {
      if (editingId) await updateBracketTie(editingId, payload);
      else await createBracketTie(payload);
      showToast(editingId ? 'Confronto atualizado.' : 'Confronto adicionado à chave.');
      setFormOpen(false); setEditingId(null); setForm(blank());
      await reload();
    } catch (error) { showError(error); }
    finally { setBusy(false); }
  };

  const remove = async (tie: BracketTie) => {
    if (ties.some(item => item.home_source_tie_id === tie.id || item.away_source_tie_id === tie.id)) {
      showToast('Remova primeiro os confrontos que dependem desta vaga.'); return;
    }
    if (!await confirm({ title: `Remover ${shortTie(tie)}?`, message: 'O vínculo deste confronto será removido da chave.', danger: true, confirmLabel: 'Remover' })) return;
    try { await deleteBracketTie(tie.id); showToast('Confronto removido.'); await reload(); }
    catch (error) { showError(error); }
  };

  const clubName = (id: string | null, source: string | null) => id ? allClubs.find(club => club.id === id)?.nome ?? id
    : source ? `Vencedor ${shortTie(ties.find(tie => tie.id === source) ?? ({ stage_name: 'fase', tie_order: 0 } as BracketTie))}` : 'Vaga pendente';

  return (
    <div className="cpm-admin-bracket" style={{ padding: '0 16px 72px' }}>
      <button type="button" onClick={onBack} className="btn btn-tonal" style={{ minHeight: 40, display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <span style={{ width: 16, height: 16 }}>{I.back}</span> Voltar às competições
      </button>
      <div style={{ marginBottom: 18 }}>
        <h2 style={{ margin: 0, font: '600 26px/32px var(--cpm-font-display, var(--font-display))' }}>Chaveamento · {comp.nome}</h2>
        <p style={{ margin: '6px 0 0', color: 'var(--on-surface-variant)', fontSize: 13, lineHeight: 1.5 }}>
          Vincule cada vaga a um clube ou ao vencedor de uma fase anterior. As partidas usam resultados já cadastrados.
        </p>
      </div>

      {formOpen && (
        <section className="card-filled" style={{ padding: 16, marginBottom: 14 }} aria-label={editingId ? 'Editar confronto' : 'Novo confronto'}>
          <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>{editingId ? 'Editar confronto' : 'Novo confronto'}</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 96px', gap: 10 }}>
            <label><span className="field-label">Fase</span><input className="input" maxLength={48} value={form.stage_name} onChange={event => setForm(value => ({ ...value, stage_name: event.target.value }))} placeholder="Quartas de final" /></label>
            <label><span className="field-label">Ordem</span><input className="input" type="number" min={1} value={form.stage_order} onChange={event => setForm(value => ({ ...value, stage_order: Number(event.target.value) }))} /></label>
          </div>
          <label style={{ display: 'block', marginTop: 10 }}><span className="field-label">Número do confronto nesta fase</span><input className="input" type="number" min={1} value={form.tie_order} onChange={event => setForm(value => ({ ...value, tie_order: Number(event.target.value) }))} /></label>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 10 }}>
            <label><span className="field-label">Vaga 1</span><Select title="Vaga 1" value={form.home_choice} onChange={value => setForm(current => ({ ...current, home_choice: value }))} placeholder="Escolha clube ou vencedor" options={optionsForSlot(form.stage_order, form.home_choice)} /></label>
            <label><span className="field-label">Vaga 2</span><Select title="Vaga 2" value={form.is_bye ? '' : form.away_choice} onChange={value => setForm(current => ({ ...current, away_choice: value }))} placeholder="Escolha clube ou vencedor" disabled={form.is_bye} options={optionsForSlot(form.stage_order, form.away_choice)} /></label>
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: 9, marginTop: 12, minHeight: 36, fontSize: 13 }}>
            <input type="checkbox" checked={form.is_bye} onChange={event => setForm(value => ({ ...value, is_bye: event.target.checked, away_choice: '', first_leg_match_id: '', second_leg_match_id: '' }))} />
            Avança sem adversário (BYE)
          </label>

          {!form.is_bye && <div style={{ display: 'grid', gridTemplateColumns: comp.classification_format === 'knockout_two_leg' ? '1fr 1fr' : '1fr', gap: 10, marginTop: 10 }}>
            <label><span className="field-label">{comp.classification_format === 'knockout_two_leg' ? 'Partida de ida' : 'Partida'}</span><Select title={comp.classification_format === 'knockout_two_leg' ? 'Partida de ida' : 'Partida'} value={form.first_leg_match_id} onChange={value => setForm(current => ({ ...current, first_leg_match_id: value, second_leg_match_id: value === current.second_leg_match_id ? '' : current.second_leg_match_id }))} placeholder="Vincular partida" options={matchOptions.filter(option => !usedMatchIds.has(Number(option.value)) || Number(option.value) === Number(form.first_leg_match_id) || Number(option.value) === Number(form.second_leg_match_id))} /></label>
            {comp.classification_format === 'knockout_two_leg' && <label><span className="field-label">Partida de volta</span><Select title="Partida de volta" value={form.second_leg_match_id} onChange={value => setForm(current => ({ ...current, second_leg_match_id: value }))} placeholder="Vincular partida" options={matchOptions.filter(option => !usedMatchIds.has(Number(option.value)) || Number(option.value) === Number(form.first_leg_match_id) || Number(option.value) === Number(form.second_leg_match_id))} /></label>}
          </div>}
          {matches.length === 0 && !form.is_bye && <p style={{ margin: '8px 0 0', color: 'var(--on-surface-variant)', fontSize: 12 }}>Cadastre as partidas na área Partidas. Você pode salvar as vagas agora e vincular os jogos depois.</p>}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 16 }}>
            <button type="button" className="btn btn-outlined" onClick={() => { setFormOpen(false); setEditingId(null); }}>Cancelar</button>
            <button type="button" className="btn btn-primary" disabled={busy} onClick={() => void save()}>{busy ? 'Salvando…' : editingId ? 'Salvar alterações' : 'Adicionar confronto'}</button>
          </div>
        </section>
      )}

      {loading ? <div className="card-filled" style={{ padding: 16 }}><Skeleton height={48} /><Skeleton height={48} style={{ marginTop: 8 }} /></div>
        : ties.length === 0 ? <div className="card-filled" style={{ padding: '26px 20px', textAlign: 'center' }}>
          <div style={{ width: 44, height: 44, margin: '0 auto 12px', display: 'grid', placeItems: 'center', borderRadius: 14, background: 'var(--primary-container)', color: 'var(--primary)' }}>{I.trophy}</div>
          <strong style={{ fontSize: 15 }}>A chave começa por aqui</strong>
          <p style={{ maxWidth: 360, margin: '6px auto 0', color: 'var(--on-surface-variant)', fontSize: 13, lineHeight: 1.5 }}>Adicione as fases e vincule seus confrontos. Para avançar de fase, use a vaga do vencedor de uma etapa anterior.</p>
        </div> : <div className="card-filled" style={{ overflow: 'hidden' }}>
          {ties.map((tie, index) => {
            const home = tie.home_club_id ? allClubs.find(club => club.id === tie.home_club_id) : null;
            const away = tie.away_club_id ? allClubs.find(club => club.id === tie.away_club_id) : null;
            const dependsOn = ties.some(item => item.home_source_tie_id === tie.id || item.away_source_tie_id === tie.id);
            return <article key={tie.id} style={{ display: 'grid', gridTemplateColumns: '40px minmax(0,1fr) auto', alignItems: 'center', gap: 12, padding: '12px 14px', borderTop: index ? '1px solid var(--outline-variant)' : undefined }}>
              <span className="mono" style={{ color: 'var(--primary)', fontWeight: 700, fontSize: 12 }}>{shortTie(tie)}</span>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 12, color: 'var(--on-surface-variant)' }}>{tie.stage_name}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, minWidth: 0, marginTop: 3 }}>
                  {home && <Crest id={home.id} size={20} />}
                  <span style={{ overflowWrap: 'anywhere', fontSize: 13, fontWeight: 600 }}>{clubName(tie.home_club_id, tie.home_source_tie_id)}</span>
                  {!tie.is_bye && <><span style={{ color: 'var(--on-surface-variant)' }}>×</span>{away && <Crest id={away.id} size={20} />}<span style={{ overflowWrap: 'anywhere', fontSize: 13, fontWeight: 600 }}>{clubName(tie.away_club_id, tie.away_source_tie_id)}</span></>}
                  {tie.is_bye && <span style={{ fontSize: 12, color: 'var(--on-surface-variant)' }}>· avança sem adversário</span>}
                </div>
                <div style={{ marginTop: 3, fontSize: 11, color: 'var(--on-surface-variant)' }}>
                  {tie.first_leg_match_id ? `Jogo ${tie.first_leg_match_id}` : 'Sem partida vinculada'}{tie.second_leg_match_id ? ` · Volta ${tie.second_leg_match_id}` : ''}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 4 }}>
                <button type="button" className="icon-btn" title="Editar confronto" aria-label="Editar confronto" onClick={() => beginEdit(tie)}>{I.edit}</button>
                <button type="button" className="icon-btn" title={dependsOn ? 'Confronto usado por uma fase posterior' : 'Remover confronto'} aria-label="Remover confronto" disabled={dependsOn} onClick={() => void remove(tie)} style={{ color: 'var(--error)' }}>{I.trash}</button>
              </div>
            </article>;
          })}
        </div>}

      {!loading && <button type="button" className="fab" onClick={beginAdd}><span style={{ width: 22, height: 22 }}>{I.plus}</span>Novo confronto</button>}
    </div>
  );
}
