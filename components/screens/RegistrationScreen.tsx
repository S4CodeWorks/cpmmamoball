'use client';

import { Fragment, useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useApp } from '@/contexts/AppContext';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { CpmAction, CpmIcon, CpmPopover, type CpmIconName } from '@/components/ui/CpmUi';
import { supabase } from '@/lib/supabase';
import type { InscricaoJogador } from '@/lib/db';
import { blankPlayer, cleanGameId, MAX_LIST_LENGTH, MAX_ROSTER, MIN_ROSTER, normalizePlayer, playerIssues, readDraft, registrationIssues, type RegistrationDraft, type RegistrationPlayer } from '@/lib/registration';

type View = 'list' | 'review' | 'editor' | 'captain' | 'external' | 'success';
const SAMPLE = 'Nome: Seu time\nTag: TAG\nCapitão: <@ID_DISCORD>\n\n1. nick #ID <@ID_DISCORD>\n2. nick #ID\n…';
const keyed = (p: InscricaoJogador): RegistrationPlayer => ({ ...p, key: crypto.randomUUID() });
// Keep an unfinished draft across in-app navigation (e.g. opening the rules).
// Memory only, scoped to the account; never save community identities in storage.
interface KeptDraft {
  source: string; nome: string; tag: string; players: RegistrationPlayer[];
  captainKey: string | null; externalCaptain: InscricaoJogador | null;
  captainOrigin: 'list' | 'chosen'; compId: string; agree: boolean; view: 'list' | 'review';
}
let keptDraft: { owner: string; value: KeptDraft } | null = null;

function Action({ children, icon, onClick, primary = false, disabled = false, type = 'button', busy = false }: {
  children: ReactNode; icon?: CpmIconName; onClick?: () => void; primary?: boolean; disabled?: boolean; type?: 'button' | 'submit'; busy?: boolean;
}) {
  return <CpmAction type={type} primary={primary} className={'cpm-registration-action ' + (primary ? '' : 'cpm-registration-tonal')} onClick={onClick} disabled={disabled} busy={busy}>
    {(busy || icon) && <CpmIcon name={busy ? 'feedbackProgress' : icon!} className={busy ? 'cpm-registration-spinner' : ''} />}{children}
  </CpmAction>;
}
function Heading({ children, icon }: { children: ReactNode; icon: CpmIconName }) {
  return <div className="cpm-registration-section-head"><CpmIcon name={icon} /><h2>{children}</h2></div>;
}
function Field({ label, icon, value, onChange, required, error, maxLength = 80, placeholder = '', name }: {
  label: string; icon: CpmIconName; value: string; onChange: (v: string) => void; required?: boolean; error?: string; maxLength?: number; placeholder?: string; name?: string;
}) {
  const id = useId();
  return <div className="cpm-registration-field"><label htmlFor={id}>{label}{required && <span aria-hidden="true"> *</span>}</label>
    <div className={'cpm-registration-input ' + (error ? 'is-invalid' : '')}><CpmIcon name={icon} /><input id={id} name={name} autoComplete="off" spellCheck={false} value={value} onChange={e => onChange(e.target.value)} required={required} maxLength={maxLength} placeholder={placeholder} aria-invalid={!!error} aria-describedby={error ? id + '-error' : undefined} /></div>
    {error && <span id={id + '-error'} className="cpm-registration-field-error">{error}</span>}
  </div>;
}

export function SubscriptionScreen({ onBack, onNav, presetCompId }: {
  onBack?: () => void; onNav?: (page: string, param?: string | number | null) => void; presetCompId?: string | number | null;
}) {
  const { showToast, confirm } = useApp();
  const { session, user } = useAuth();
  const [restored] = useState(() => user?.id && keptDraft?.owner === user.id ? keptDraft.value : null);
  const { competitions, initialLoad, error: dataError, refresh } = useData();
  const reduced = useReducedMotion();
  const [view, setView] = useState<View>(restored?.view || 'list');
  const [source, setSource] = useState(restored?.source || '');
  const [nome, setNome] = useState(restored?.nome || ''), [tag, setTag] = useState(restored?.tag || '');
  const [players, setPlayers] = useState<RegistrationPlayer[]>(restored?.players || []);
  const [captainKey, setCaptainKey] = useState<string | null>(restored?.captainKey || null);
  const [externalCaptain, setExternalCaptain] = useState<InscricaoJogador | null>(restored?.externalCaptain || null);
  const [captainOrigin, setCaptainOrigin] = useState<'list' | 'chosen'>(restored?.captainOrigin || 'list');
  const [compId, setCompId] = useState(presetCompId ? String(presetCompId) : restored?.compId || '');
  const [agree, setAgree] = useState(restored?.agree || false);
  const [busy, setBusy] = useState<'import' | 'send' | null>(null);
  const [error, setError] = useState('');
  const [taken, setTaken] = useState<string[]>([]);
  const [closedId, setClosedId] = useState('');
  const [editor, setEditor] = useState<InscricaoJogador>(blankPlayer);
  const [editKey, setEditKey] = useState<string | null>(null);
  const [editorAttempted, setEditorAttempted] = useState(false);
  const [sent, setSent] = useState<{ nome: string; tag: string; count: number; competition: string } | null>(null);
  const inFlight = useRef(false), controller = useRef<AbortController | null>(null);
  const title = useRef<HTMLHeadingElement>(null);
  const dirty = view !== 'success' && (source.trim().length > 0 || nome.trim().length > 0 || players.length > 0);
  const open = competitions.filter(c => c.status === 'inscricoes' && c.id !== closedId);
  // A preset for a closed event must never silently register to a different event.
  const selectedId = compId || open[0]?.id || '';
  const competition = competitions.find(c => c.id === selectedId);
  const isOpen = open.some(c => c.id === selectedId);
  const competitionName = competition ? [competition.nome, competition.edicao].filter(Boolean).join(' ') : 'Selecionar competição';
  const captain = captainKey ? players.find(p => p.key === captainKey) || null : externalCaptain;
  const draft: RegistrationDraft = { nome, tag, jogadores: players, captain };
  const issues = registrationIssues(draft);
  const step = view === 'success' ? 2 : view === 'list' ? 0 : 1;
  const editorErrors = playerIssues(editor);

  useEffect(() => () => controller.current?.abort(), []);
  useEffect(() => {
    if (!user?.id || view === 'success') { keptDraft = null; return; }
    keptDraft = { owner: user.id, value: { source, nome, tag, players, captainKey, externalCaptain, captainOrigin, compId, agree, view: view === 'list' ? 'list' : 'review' } };
  }, [user?.id, source, nome, tag, players, captainKey, externalCaptain, captainOrigin, compId, agree, view]);
  useEffect(() => {
    if (!dirty) return;
    const leave = (e: BeforeUnloadEvent) => { e.preventDefault(); };
    window.addEventListener('beforeunload', leave);
    return () => window.removeEventListener('beforeunload', leave);
  }, [dirty]);
  const previousView = useRef(view);
  useEffect(() => {
    if (previousView.current === view) return;
    previousView.current = view;
    title.current?.focus({ preventScroll: true });
    document.getElementById('cpm-main')?.scrollTo({ top: 0, behavior: 'instant' });
  }, [view]);

  const goBack = async () => {
    if (busy) return;
    setError('');
    if (['editor', 'captain', 'external'].includes(view)) { setView(view === 'external' ? 'captain' : 'review'); return; }
    if (view === 'review') { setView('list'); return; }
    if (dirty && !await confirm({ title: 'Sair da inscrição?', message: 'Os dados ainda não enviados serão descartados.', confirmLabel: 'Sair', cancelLabel: 'Continuar' })) return;
    keptDraft = null;
    onBack?.();
  };
  const request = async (path: string, body: unknown) => {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token || session?.access_token;
    if (!token) throw new Error('Sua sessão expirou. Entre novamente.');
    controller.current = new AbortController();
    const timer = setTimeout(() => controller.current?.abort(), 25000);
    try {
      const response = await fetch(path, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(body), signal: controller.current.signal });
      const result = await response.json();
      return { response, result };
    } finally { clearTimeout(timer); }
  };
  const importList = async () => {
    if (inFlight.current || !source.trim()) return;
    if (players.length && !await confirm({ title: 'Substituir elenco?', message: 'As alterações do elenco serão substituídas.', confirmLabel: 'Substituir elenco', cancelLabel: 'Manter elenco' })) return;
    inFlight.current = true; setBusy('import'); setError('');
    try {
      const { response, result } = await request('/api/registration/import', { source });
      if (!response.ok) throw new Error(result.error || 'Não foi possível ler a lista. Tente novamente.');
      const parsed = readDraft(result.draft);
      if (!parsed || !parsed.jogadores.length) throw new Error('Não encontrei jogadores. Preencha manualmente ou revise a lista.');
      const rows = parsed.jogadores.map(keyed);
      setPlayers(rows); setNome(parsed.nome); setTag(parsed.tag); setTaken([]); setAgree(false);
      setCaptainKey(rows.find(p => p.game_id === parsed.captain?.game_id)?.key || null);
      setExternalCaptain(null); setCaptainOrigin('list'); setView('review');
      showToast('Lista importada', { variant: 'success', icon: 'registrationRoster' });
    } catch (e) { setError(e instanceof Error && e.name !== 'AbortError' ? e.message : 'A leitura demorou. Tente novamente ou preencha manualmente.'); }
    finally { setBusy(null); inFlight.current = false; }
  };
  const openEditor = (player?: RegistrationPlayer) => {
    if (busy) return;
    setEditKey(player?.key || null); setEditor(player ? { ...player } : blankPlayer()); setEditorAttempted(false); setError(''); setView('editor');
  };
  const saveEditor = () => {
    setEditorAttempted(true);
    if (editorErrors.length) return;
    const player = normalizePlayer(editor);
    if (view === 'external') { setCaptainKey(null); setExternalCaptain(player); setCaptainOrigin('chosen'); setView('review'); return; }
    if (!editKey && players.length >= MAX_ROSTER) { setError('O elenco já tem 10 jogadores. Remova um antes de adicionar.'); return; }
    setPlayers(rows => editKey ? rows.map(p => p.key === editKey ? { ...player, key: editKey } : p) : [...rows, keyed(player)]);
    setTaken([]); setView('review'); showToast(editKey ? 'Jogador atualizado' : 'Jogador adicionado', { variant: 'success' });
  };
  const removePlayer = (player: RegistrationPlayer) => {
    const at = players.findIndex(p => p.key === player.key), wasCaptain = captainKey === player.key;
    setPlayers(rows => rows.filter(p => p.key !== player.key)); if (wasCaptain) setCaptainKey(null);
    setTaken(ids => ids.filter(id => id !== player.game_id));
    showToast('Jogador removido', { icon: 'registrationTrash', action: { label: 'Desfazer', onClick: () => {
      setPlayers(rows => {
        if (rows.length >= MAX_ROSTER || rows.some(p => p.key === player.key)) return rows;
        const restored = [...rows]; restored.splice(Math.min(at, rows.length), 0, player); return restored;
      });
      if (wasCaptain) setCaptainKey(player.key);
    } } });
  };
  const submit = async () => {
    if (inFlight.current || issues.length || !agree || !isOpen || taken.length) return;
    inFlight.current = true; setBusy('send'); setError('');
    try {
      const { response, result } = await request('/api/registration', { competitionId: selectedId, draft, source, agree });
      if (!response.ok) {
        if (result.closed) setClosedId(selectedId);
        if (Array.isArray(result.taken)) setTaken(result.taken);
        throw new Error(result.error || 'Não foi possível enviar. Tente novamente.');
      }
      setSent({ nome, tag, count: players.length, competition: competitionName }); setView('success');
      showToast('Inscrição enviada', { variant: 'success' }); refresh();
    } catch (e) { setError(e instanceof Error && e.name !== 'AbortError' ? e.message : 'Não foi possível confirmar o envio. Confira suas inscrições antes de tentar novamente.'); }
    finally { setBusy(null); inFlight.current = false; }
  };

  return <main className="cpm-team-registration" aria-labelledby="registration-title">
    <div className="cpm-registration-content">
      <div><Action icon="searchBack" onClick={() => void goBack()} disabled={!!busy}>Voltar</Action></div>
      <div className="cpm-registration-heading"><h1 ref={title} tabIndex={-1} id="registration-title">Inscrever time</h1>
        <CpmPopover label="Competição da inscrição" role="listbox" disabled={!!busy || view === 'success'} className="cpm-registration-competition" trigger={<><CpmIcon name="trophy"/><span>{sent?.competition || competitionName}</span>{open.length > 1 && <CpmIcon name="chevron"/>}</>}>
          {close => <>{open.length ? open.map(c => <button type="button" key={c.id} role="option" aria-selected={selectedId === c.id} onClick={() => { setCompId(c.id); setError(''); close(); }}><CpmIcon name="trophy"/>{c.nome} {c.edicao}{selectedId === c.id && <CpmIcon name="check"/>}</button>) : <span>Nenhuma competição aberta</span>}</>}
        </CpmPopover>
      </div>
      <ol className="cpm-registration-progress" aria-label="Etapas da inscrição">{(['Lista', 'Elenco', 'Envio'] as const).map((label, i) => <Fragment key={label}>
        {i > 0 && <li aria-hidden="true" className="cpm-registration-progress-arrow"><CpmIcon name="arrow"/></li>}
        <li className={'cpm-registration-step ' + (step === i ? 'is-current' : '')} aria-current={step === i ? 'step' : undefined}><CpmIcon name={step > i || view === 'success' ? 'check' : (['registrationClipboard', 'registrationRoster', 'registrationSend'] as const)[i]}/><span>{label}</span></li>
      </Fragment>)}</ol>

      {error && <div className="cpm-registration-alert" role="alert"><CpmIcon name="searchAlert"/><span>{error}</span><button type="button" aria-label="Fechar aviso" onClick={() => setError('')}><CpmIcon name="searchClose"/></button></div>}
      {initialLoad ? <section className="cpm-registration-card" aria-busy="true"><Heading icon="feedbackProgress">Carregando competições</Heading></section>
        : dataError ? <section className="cpm-registration-card"><Heading icon="searchAlert">Não foi possível carregar</Heading><Action onClick={refresh}>Tentar novamente</Action></section>
        : !isOpen && view !== 'success' ? <section className="cpm-registration-card cpm-registration-status"><div className="cpm-registration-status-mark"><CpmIcon name="registrationLock"/></div><h2>Inscrições fechadas</h2><p>{competition ? competitionName : 'Nenhuma competição aberta no momento.'}</p><Action icon="authBell" onClick={() => onNav?.('notices')}>Ver avisos</Action></section>
        : <motion.div className="cpm-registration-stage" key={view} initial={reduced ? false : { opacity: .85, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .12, ease: [0.16, 1, 0.3, 1] }}>
          {view === 'list' && <section className="cpm-registration-card cpm-registration-paste" aria-busy={busy === 'import'}>
            <Heading icon="registrationClipboard">Cole a lista do time</Heading>
            <label className="cpm-sr-only" htmlFor="registration-source">Lista original do time</label>
            <textarea id="registration-source" value={source} onChange={e => setSource(e.target.value)} maxLength={MAX_LIST_LENGTH} placeholder={SAMPLE} spellCheck={false} disabled={!!busy} aria-describedby="registration-source-hint" />
            <span className="cpm-registration-caption" id="registration-source-hint">Nick · #ID · Discord opcional</span>
            <div className="cpm-registration-import-actions"><Action primary busy={busy === 'import'} disabled={!source.trim()} onClick={() => void importList()}>{busy === 'import' ? 'Lendo lista…' : 'Revisar elenco'}</Action><Action icon="registrationEdit" disabled={!!busy} onClick={() => { setError(''); setView('review'); }}>Preencher manualmente</Action></div>
          </section>}

          {view === 'review' && <div className="cpm-registration-review" aria-busy={busy === 'send'}><fieldset disabled={!!busy} className="cpm-registration-team cpm-registration-card">
            <Heading icon="searchShield">Seu time</Heading><div className="cpm-registration-team-fields"><Field name="teamName" label="Nome do time" icon="searchShield" value={nome} onChange={setNome} required/><Field name="teamTag" label="Tag · até 4 letras" icon="registrationTag" value={tag} maxLength={4} onChange={setTag} required/></div>
            <Action icon="registrationCaptain" onClick={() => { setError(''); setView('captain'); }}>{captain ? captain.nick + ' · Capitão' : 'Escolher capitão'}</Action>
            <div className="cpm-registration-captain-note"><span>{captain ? captainOrigin === 'list' ? 'Identificado pela lista' : 'Escolhido por você' : 'Capitão não identificado'}</span><button type="button" onClick={() => { setError(''); setView('captain'); }}>Alterar</button></div>
          </fieldset>
            <section className="cpm-registration-roster" aria-labelledby="registration-roster-title"><div className="cpm-registration-roster-heading"><div className="cpm-registration-section-head"><CpmIcon name="registrationRoster"/><h2 id="registration-roster-title">Elenco</h2></div><span>{players.length} / {MAX_ROSTER}</span></div>
              {players.map(player => {
                const duplicate = players.some(p => p.key !== player.key && cleanGameId(p.game_id) === cleanGameId(player.game_id));
                const rowError = taken.includes(player.game_id) ? 'ID já cadastrado em outro time' : duplicate ? 'ID repetido' : playerIssues(player).length ? 'Revise nick e ID' : '';
                return <article key={player.key} className={'cpm-registration-player ' + (captainKey === player.key ? 'is-captain ' : '') + (rowError ? 'is-invalid' : '')}>
                  <div className="cpm-registration-player-info"><div className="cpm-registration-player-name"><strong>{player.nick || 'Sem nick'}</strong>{captainKey === player.key && <span><CpmIcon name="registrationCaptain"/>Capitão</span>}</div><span className="cpm-registration-player-id">#{player.game_id || 'ID'}</span></div>
                  <div className="cpm-registration-player-discord"><span>Discord</span><span>{player.discord || 'Opcional'}</span></div>
                  <div className="cpm-registration-player-actions"><button type="button" disabled={!!busy} className="cpm-registration-tonal" aria-label={'Editar ' + player.nick} onClick={() => openEditor(player)}><CpmIcon name="registrationEdit"/></button><button type="button" disabled={!!busy} aria-label={'Remover ' + player.nick} onClick={() => removePlayer(player)}><CpmIcon name="registrationTrash"/></button></div>
                  {rowError && <span className="cpm-registration-player-error"><CpmIcon name="searchAlert"/>{rowError}</span>}
                </article>;
              })}
              {!players.length && <div className="cpm-registration-empty"><CpmIcon name="registrationRoster"/><span>Adicione o primeiro jogador</span></div>}
              <Action icon="registrationPlus" disabled={!!busy || players.length >= MAX_ROSTER} onClick={() => openEditor()}>Adicionar jogador</Action><span className="cpm-registration-caption">5–10 jogadores · Discord opcional</span>
              {players.length < MIN_ROSTER && <span className="cpm-registration-caption">Faltam {MIN_ROSTER - players.length} jogadores</span>}{players.length > MAX_ROSTER && <p className="cpm-registration-field-error">Elenco acima do limite. Remova {players.length - MAX_ROSTER} jogador(es).</p>}
            </section>
            <section className="cpm-registration-submit cpm-registration-card"><div className="cpm-registration-consent"><input id="registration-agree" type="checkbox" checked={agree} onChange={e => setAgree(e.target.checked)} disabled={!!busy}/><label htmlFor="registration-agree">Li e concordo com o </label><button type="button" onClick={() => void confirm({ title: 'Regulamento', message: 'O regulamento oficial ainda está sendo definido.', confirmLabel: 'Voltar ao elenco', cancelLabel: 'Fechar' })} disabled={!!busy}>regulamento</button></div>
              <Action primary disabled={issues.length > 0 || !agree || taken.length > 0} busy={busy === 'send'} onClick={() => void submit()}>{busy === 'send' ? 'Enviando inscrição…' : 'Enviar inscrição'}</Action>
              <Action icon="registrationClipboard" disabled={!!busy} onClick={() => { setError(''); setView('list'); }}>Ver lista original</Action>
              {issues.length > 0 && players.length > 0 && <p className="cpm-registration-caption" role="status">{issues[0]}</p>}
            </section>
          </div>}

          {(view === 'editor' || view === 'external') && <form className="cpm-registration-editor cpm-registration-card" onSubmit={e => { e.preventDefault(); saveEditor(); }} noValidate>
            <Heading icon={view === 'external' ? 'registrationCaptain' : 'registrationEdit'}>{view === 'external' ? 'Outro capitão' : editKey ? 'Editar jogador' : 'Adicionar jogador'}</Heading>
            <div className="cpm-registration-editor-fields"><Field label="Nick" icon="user" required name="playerNick" value={editor.nick} onChange={nick => setEditor(p => ({ ...p, nick }))} error={editorAttempted && (!editor.nick.trim() || editor.nick.length > 80) ? 'Informe o nick.' : undefined}/>
              <Field label="ID do jogo" icon="registrationHash" required name="playerId" maxLength={33} value={editor.game_id} onChange={game_id => setEditor(p => ({ ...p, game_id }))} error={editorAttempted && !/^[a-zA-Z0-9]{1,32}$/.test(cleanGameId(editor.game_id)) ? 'Use letras e números.' : undefined}/></div>
            <Field label="Discord · opcional" icon="registrationMention" maxLength={100} value={editor.discord || ''} onChange={discord => setEditor(p => ({ ...p, discord }))}/>
            {view !== 'external' && <div className="cpm-registration-field"><label htmlFor="registration-position">Posição · opcional</label><div className="cpm-registration-input"><CpmIcon name="registrationRoster"/><select id="registration-position" value={editor.posicao || ''} onChange={e => setEditor(p => ({ ...p, posicao: e.target.value as InscricaoJogador['posicao'] || null }))}><option value="">Sem posição</option>{['GK', 'VL', 'PV/ATK', 'MC'].map(pos => <option key={pos}>{pos}</option>)}</select></div></div>}
            <Action type="submit" primary>{view === 'external' ? 'Escolher capitão' : editKey ? 'Salvar alterações' : 'Adicionar jogador'}</Action><Action onClick={() => setView(view === 'external' ? 'captain' : 'review')}>Cancelar</Action>
          </form>}
          {view === 'captain' && <section className="cpm-registration-picker cpm-registration-card"><Heading icon="registrationCaptain">Escolher capitão</Heading>
            {players.map(p => <Action key={p.key} icon={captainKey === p.key ? 'check' : 'user'} onClick={() => { setCaptainKey(p.key); setExternalCaptain(null); setCaptainOrigin('chosen'); setView('review'); }}>{p.nick} · #{p.game_id}</Action>)}
            <Action icon="registrationCaptain" onClick={() => { setEditor(externalCaptain || blankPlayer()); setEditorAttempted(false); setView('external'); }}>Outro capitão</Action><Action onClick={() => setView('review')}>Cancelar</Action>
          </section>}
          {view === 'success' && sent && <section className="cpm-registration-status cpm-registration-card" role="status"><div className="cpm-registration-status-mark"><CpmIcon name="check"/></div><h2>Inscrição enviada</h2><div className="cpm-registration-section-head"><CpmIcon name="searchShield"/><h3>{sent.nome} · {sent.tag}</h3></div><div className="cpm-registration-status-facts"><span><CpmIcon name="registrationRoster"/>{sent.count} jogadores</span><span><CpmIcon name="clock"/>Em análise</span></div><p>{sent.competition}</p><Action primary onClick={() => onNav?.('jogos', selectedId)}>Ver jogos</Action></section>}
        </motion.div>}
    </div>
  </main>;
}
