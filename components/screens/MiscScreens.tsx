'use client';

import { useState, useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { createInscricao, fetchTakenGameIds, searchPlayers, type InscricaoJogador } from '@/lib/db';
import { shareLink } from '@/lib/share';
import { isPushSupported, getPushSubscription, subscribeToPush, unsubscribeFromPush } from '@/lib/push';
import { I } from '@/components/icons';
import { TopAppBar } from '@/components/ui/TopAppBar';
import { SectionHead, FieldLabel } from '@/components/ui/Primitives';
import { Crest } from '@/components/ui/Crest';
import { MatchTile } from '@/components/ui/MatchTile';
import { Select } from '@/components/ui/Select';

const POSICOES = ['GK', 'VL', 'PV/ATK', 'MC'] as const;
const BLANK_JOGADOR: InscricaoJogador = { nick: '', game_id: '', discord: '', posicao: null };

// Campo de texto com validação inline — borda e mensagem vermelha quando `invalid`,
// selo verde quando preenchido corretamente. Usado nos formulários públicos.
function FormField({ label, required, value, onChange, placeholder, invalid, maxLength, style, inputStyle, inputMode, autoFocus }: {
  label: string; required?: boolean; value: string; onChange: (v: string) => void;
  placeholder?: string; invalid?: boolean; maxLength?: number;
  style?: React.CSSProperties; inputStyle?: React.CSSProperties;
  inputMode?: 'text' | 'numeric'; autoFocus?: boolean;
}) {
  const filled = value.trim().length > 0;
  return (
    <div style={style}>
      <FieldLabel required={required}>{label}</FieldLabel>
      <div style={{ position: 'relative' }}>
        <input
          className="input"
          value={value}
          maxLength={maxLength}
          inputMode={inputMode}
          autoFocus={autoFocus}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          style={{
            ...inputStyle,
            paddingRight: required && filled ? 40 : undefined,
            borderColor: invalid ? 'var(--error)' : undefined,
            background: invalid ? 'color-mix(in srgb, var(--error) 7%, var(--surface-c))' : inputStyle?.background,
          }}
        />
        {required && filled && !invalid && (
          <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', width: 18, height: 18, color: 'var(--primary)', pointerEvents: 'none' }}>{I.check}</span>
        )}
      </div>
      {invalid && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--error)', fontWeight: 600, marginTop: 5 }}>
          <span style={{ width: 13, height: 13 }}>{I.close}</span>Preencha este campo pra continuar
        </div>
      )}
    </div>
  );
}

interface NavProps {
  onNav: (page: string, param?: string | number | null) => void;
  onBack?: () => void;
}

// ===================== MORE =====================
export function MoreScreen({ onNav }: NavProps) {
  const { isLoggedIn, profile, user } = useAuth();
  const nick    = profile?.nick || user?.email?.split('@')[0] || 'Visitante';
  const email   = user?.email || 'Faça login para acessar sua conta';
  const initial = nick[0]?.toUpperCase() || '?';

  const items = [
    { id: 'profile',      icon: 'person',  label: 'Meu perfil',     sub: isLoggedIn ? nick : 'Entrar / criar conta' },
    { id: 'saved',        icon: 'star',    label: 'Salvos',         sub: 'Clubes favoritos, partidas e notícias' },
    { id: 'subscription', icon: 'ticket',  label: 'Inscrever time', sub: 'Vagas abertas', hot: true },
    { id: 'search',       icon: 'search',  label: 'Buscar',         sub: 'Clubes, jogadores, notícias' },
    { id: 'rules',        icon: 'rules',   label: 'Regulamento',    sub: 'Regras oficiais' },
    { id: 'support',      icon: 'support', label: 'Suporte',        sub: 'FAQ e contato' },
    { id: 'settings',     icon: 'cog',     label: 'Configurações',  sub: 'Tema · Notificações' },
  ];

  return (
    <>
      <TopAppBar large title="Mais" />
      <div style={{ padding: '0 16px 12px' }}>
        <button
          onClick={() => onNav(isLoggedIn ? 'profile' : 'login')}
          className="tap card-filled"
          style={{ width: '100%', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 14, padding: '16px 18px' }}
        >
          <div style={{ width: 52, height: 52, borderRadius: 999, background: isLoggedIn ? 'var(--primary)' : 'var(--surface-c-high)', color: isLoggedIn ? 'var(--on-primary)' : 'var(--on-surface-variant)', display: 'grid', placeItems: 'center', fontSize: 18, fontWeight: 800 }}>
            {isLoggedIn ? initial : I.person}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 15.5, fontWeight: 700 }}>{isLoggedIn ? nick : 'Entrar na conta'}</div>
            <div style={{ fontSize: 12.5, color: 'var(--on-surface-variant)' }}>{isLoggedIn ? email : 'Favoritos, inscrições e mais'}</div>
          </div>
          <span style={{ width: 22, height: 22, color: 'var(--on-surface-variant)' }}>{I.chevR}</span>
        </button>
      </div>
      <div style={{ padding: '0 16px' }}>
        <div className="card-filled">
          {items.map((it, i) => (
            <button key={it.id} onClick={() => onNav(it.id)} className="tap"
              style={{ width: '100%', textAlign: 'left', display: 'grid', gridTemplateColumns: '40px 1fr 24px', alignItems: 'center', gap: 14, padding: '14px 16px', borderTop: i ? '1px solid var(--outline-variant)' : 'none' }}>
              <span style={{ width: 36, height: 36, borderRadius: 10, background: it.hot ? 'var(--primary-container)' : 'var(--surface-c-high)', color: it.hot ? 'var(--on-primary-container)' : 'var(--on-surface)', display: 'grid', placeItems: 'center' }}>{I[it.icon]}</span>
              <div>
                <div style={{ fontSize: 14.5, fontWeight: 600 }}>{it.label}</div>
                <div style={{ fontSize: 12, color: 'var(--on-surface-variant)' }}>{it.sub}</div>
              </div>
              <span style={{ width: 22, height: 22, color: 'var(--on-surface-variant)' }}>{I.chevR}</span>
            </button>
          ))}
        </div>
      </div>
      <div style={{ padding: '32px 24px 16px', textAlign: 'center', color: 'var(--on-surface-variant)' }}>
        <div className="mono" style={{ fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase' }}>v2026.05 · CPM</div>
        <div style={{ fontSize: 12, marginTop: 4 }}>Confederação MamoBall · Brasil</div>
      </div>
    </>
  );
}

// ===================== SAVED =====================
export function SavedScreen({ onNav, onBack }: NavProps) {
  const { favClubs, bookmarks } = useApp();
  const { clubs, matches, news } = useData();

  const favClubList = clubs.filter(c => favClubs.has(c.id));
  const savedMatches = matches.filter(m => bookmarks.has('match:' + m.id));
  const savedArticles = news.filter(n => bookmarks.has('art:' + n.id));
  const isEmpty = favClubList.length === 0 && savedMatches.length === 0 && savedArticles.length === 0;

  return (
    <>
      <TopAppBar large title="Salvos" showBack onBack={onBack} />

      {isEmpty ? (
        <div className="empty" style={{ marginTop: 32 }}>
          <div className="empty-icon">{I.star}</div>
          <h3 style={{ margin: '0 0 8px', fontSize: 17, fontWeight: 700, color: 'var(--on-surface)' }}>Nada salvo ainda</h3>
          <p style={{ margin: 0, fontSize: 14 }}>Favorite clubes e salve partidas ou notícias pra encontrar tudo aqui depois.</p>
        </div>
      ) : (
        <>
          {favClubList.length > 0 && (
            <>
              <SectionHead title="Clubes favoritos" />
              <div style={{ padding: '0 16px' }}>
                <div className="card-filled">
                  {favClubList.map((c, i) => (
                    <button key={c.id} onClick={() => onNav('club', c.id)} className="tap"
                      style={{ width: '100%', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderTop: i ? '1px solid var(--outline-variant)' : 'none' }}>
                      <Crest id={c.id} size={36} radius={10} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 14, fontWeight: 600 }}>{c.nome}</div>
                        <div className="mono" style={{ fontSize: 11, color: 'var(--on-surface-variant)' }}>{c.tag}</div>
                      </div>
                      <span style={{ color: 'var(--on-surface-variant)' }}>{I.chevR}</span>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {savedMatches.length > 0 && (
            <>
              <SectionHead title="Partidas salvas" />
              <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                {savedMatches.map(m => <MatchTile key={m.id} m={m} onClick={() => onNav('match', m.id)} showStage />)}
              </div>
            </>
          )}

          {savedArticles.length > 0 && (
            <>
              <SectionHead title="Notícias salvas" />
              <div style={{ padding: '0 16px' }}>
                <div className="card-filled">
                  {savedArticles.map((n, i) => (
                    <button key={n.id} onClick={() => onNav('article', n.id)} className="tap"
                      style={{ width: '100%', textAlign: 'left', padding: '14px 16px', borderTop: i ? '1px solid var(--outline-variant)' : 'none' }}>
                      <div className="eyebrow">{n.tag} · {n.date}</div>
                      <div style={{ fontSize: 14, fontWeight: 600, marginTop: 4 }}>{n.title}</div>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </>
      )}
    </>
  );
}

// ===================== PROFILE =====================
export function ProfileScreen({ onBack, onNav }: NavProps) {
  const { showToast, showError } = useApp();
  const { user, profile, isStaff, signOut, updateNick } = useAuth();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [editing, setEditing] = useState(false);
  const [newNick, setNewNick] = useState('');
  const [savingNick, setSavingNick] = useState(false);
  const [attemptedNick, setAttemptedNick] = useState(false);

  const nick  = profile?.nick  || user?.email?.split('@')[0] || 'Usuário';
  const email = user?.email || '';
  const initial = nick[0]?.toUpperCase() || 'U';
  const roleLabel = isStaff ? '★ Staff CPM' : 'Torcedor';

  const openEdit = () => { setNewNick(nick); setAttemptedNick(false); setEditing(true); };
  const saveNick = async () => {
    setAttemptedNick(true);
    if (!newNick.trim()) return;
    setSavingNick(true);
    try {
      await updateNick(newNick.trim());
      showToast('Perfil atualizado!');
      setEditing(false);
    } catch (e) {
      showToast('Erro ao salvar: ' + (e instanceof Error ? e.message : String(e)), { variant: 'error' });
    } finally { setSavingNick(false); }
  };

  const handleSignOut = async () => {
    await signOut();
    showToast('Você saiu da sua conta');
    onBack?.();
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      const { supabase } = await import('@/lib/supabase');
      const { error } = await supabase.rpc('delete_my_account');
      if (error) throw error;
      await signOut();
      showToast('Conta excluída com sucesso');
      onBack?.();
    } catch {
      showToast('Erro ao excluir conta. Tente novamente.', { variant: 'error' });
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  return (
    <>
      <TopAppBar title="Meu perfil" showBack onBack={onBack}
        rightExtras={<button className="icon-btn" onClick={() => onNav('settings')} aria-label="Configurações">{I.cog}</button>}
      />
      <div style={{ padding: '8px 16px 0', textAlign: 'center' }}>
        <div style={{ width: 96, height: 96, borderRadius: 999, background: 'var(--primary)', color: 'var(--on-primary)', margin: '0 auto', display: 'grid', placeItems: 'center', fontSize: 36, fontWeight: 800 }}>{initial}</div>

        {editing ? (
          <div style={{ maxWidth: 280, margin: '16px auto 0', textAlign: 'left' }}>
            <FormField label="Nick" required value={newNick} onChange={setNewNick} invalid={attemptedNick && !newNick.trim()} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 12 }}>
              <button className="btn btn-outlined" style={{ height: 42 }} onClick={() => setEditing(false)} disabled={savingNick}>Cancelar</button>
              <button className="btn btn-primary" style={{ height: 42 }} onClick={saveNick} disabled={savingNick}>{savingNick ? 'Salvando…' : 'Salvar'}</button>
            </div>
          </div>
        ) : (
          <>
            <h2 style={{ margin: '14px 0 4px', fontSize: 22, fontWeight: 700 }}>{nick}</h2>
            <div style={{ fontSize: 13, color: 'var(--on-surface-variant)' }}>{email}</div>
            <div style={{ fontSize: 12, color: 'var(--primary)', fontWeight: 600, marginTop: 4 }}>{roleLabel}</div>
          </>
        )}

        {!editing && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginTop: 16 }}>
          <button className="btn btn-tonal" style={{ height: 40 }} onClick={openEdit}>Editar perfil</button>
          <button className="btn btn-outlined" style={{ height: 40 }} onClick={async () => {
            const r = await shareLink({ title: nick, text: `Perfil de ${nick} · CPM MamoBall` });
            if (r === 'copied') showToast('Link copiado');
            else if (r === 'failed') showToast('Não foi possível compartilhar');
          }}>Compartilhar</button>
        </div>
        )}
      </div>
      <div style={{ padding: '24px 16px 0' }}>
        <div className="eyebrow" style={{ paddingBottom: 10 }}>SEUS NÚMEROS · 2026</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
          {[{ n: '—', l: 'Gols', big: true }, { n: '—', l: 'Assist.' }, { n: '—', l: 'Jogos' }].map(s => (
            <div key={s.l} className="card-filled" style={{ padding: '14px 12px', textAlign: 'center' }}>
              <div className="mono tabular" style={{ fontSize: s.big ? 28 : 22, fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1, color: s.big ? 'var(--primary)' : 'var(--on-surface)' }}>{s.n}</div>
              <div style={{ fontSize: 11.5, color: 'var(--on-surface-variant)', marginTop: 6 }}>{s.l}</div>
            </div>
          ))}
        </div>
        <div style={{ fontSize: 12, color: 'var(--on-surface-variant)', textAlign: 'center', marginTop: 10 }}>Estatísticas disponíveis quando vinculado a um clube.</div>
      </div>

      {/* Ações da conta */}
      <div style={{ padding: '24px 16px 32px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <button onClick={handleSignOut} className="btn btn-outlined" style={{ width: '100%' }}>
          Sair da conta
        </button>
        <button
          onClick={() => setShowDeleteModal(true)}
          style={{ width: '100%', height: 44, borderRadius: 'var(--r-full)', border: 'none', background: 'none', color: 'var(--error)', fontSize: 13.5, fontWeight: 600, cursor: 'pointer', opacity: 0.8 }}
        >
          Excluir minha conta
        </button>
      </div>

      {/* Modal de confirmação de exclusão */}
      {showDeleteModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
          {/* Backdrop */}
          <div
            onClick={() => !deleting && setShowDeleteModal(false)}
            style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }}
          />
          {/* Card */}
          <div style={{
            position: 'relative', width: '100%', maxWidth: 480,
            background: 'var(--surface)', borderRadius: '20px 20px 0 0',
            padding: '28px 24px 40px', zIndex: 1,
          }}>
            {/* Ícone de alerta */}
            <div style={{ width: 56, height: 56, borderRadius: 999, background: 'color-mix(in srgb, var(--error) 14%, transparent)', color: 'var(--error)', display: 'grid', placeItems: 'center', margin: '0 auto 16px', fontSize: 26 }}>
              ⚠️
            </div>

            <h3 style={{ margin: '0 0 8px', fontSize: 18, fontWeight: 800, textAlign: 'center' }}>
              Excluir conta?
            </h3>

            <p style={{ margin: '0 0 6px', fontSize: 14, lineHeight: 1.6, color: 'var(--on-surface-variant)', textAlign: 'center' }}>
              Esta ação é <strong style={{ color: 'var(--on-surface)' }}>permanente e irreversível</strong>. Ao confirmar:
            </p>

            <ul style={{ margin: '12px 0 20px', padding: '0 0 0 20px', fontSize: 13.5, lineHeight: 1.8, color: 'var(--on-surface-variant)' }}>
              <li>Seu perfil e dados serão removidos da plataforma</li>
              <li>Seus favoritos e histórico serão apagados</li>
              <li>Você <strong style={{ color: 'var(--on-surface)' }}>não perderá</strong> seu histórico de partidas e gols (vinculado ao clube, não à conta)</li>
            </ul>

            <p style={{ margin: '0 0 20px', fontSize: 12.5, color: 'var(--on-surface-variant)', textAlign: 'center' }}>
              Isso é diferente de apenas <em>sair da conta</em>. Você poderá criar uma nova conta com o mesmo e-mail a qualquer momento.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button
                onClick={handleDeleteAccount}
                disabled={deleting}
                className="btn"
                style={{ height: 50, fontSize: 15, fontWeight: 700, background: 'var(--error)', color: '#fff', border: 'none', opacity: deleting ? 0.7 : 1 }}
              >
                {deleting ? 'Excluindo…' : 'Sim, excluir minha conta'}
              </button>
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={deleting}
                className="btn btn-tonal"
                style={{ height: 50, fontSize: 15 }}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ===================== SETTINGS =====================
export function SettingsScreen({ onBack, onNav }: { onBack?: () => void; onNav: NavProps['onNav'] }) {
  const { theme, setTheme, resolvedTheme, notifs, toggleNotif, showToast } = useApp();
  const { competitions } = useData();
  const { user } = useAuth();

  const [pushOn, setPushOn] = useState(false);
  const [pushBusy, setPushBusy] = useState(false);
  const [pushSupported, setPushSupported] = useState(true);

  useEffect(() => {
    setPushSupported(isPushSupported());
    getPushSubscription().then(sub => setPushOn(!!sub));
  }, []);

  const togglePush = async () => {
    setPushBusy(true);
    try {
      if (pushOn) {
        await unsubscribeFromPush();
        setPushOn(false);
      } else {
        const ok = await subscribeToPush(user?.id ?? null);
        setPushOn(ok);
        if (!ok) showToast('Não foi possível ativar — verifique a permissão de notificações do navegador');
      }
    } finally { setPushBusy(false); }
  };

  function ThemeRow({ icon, label, meta, on, onClick, last }: { icon: string; label: string; meta?: string; on: boolean; onClick: () => void; last?: boolean }) {
    return (
      <button onClick={onClick} className="tap"
        style={{ width: '100%', textAlign: 'left', display: 'grid', gridTemplateColumns: '40px 1fr 28px', alignItems: 'center', gap: 14, padding: '14px 16px', borderBottom: last ? 'none' : '1px solid var(--outline-variant)' }}>
        <span style={{ width: 36, height: 36, borderRadius: 10, background: on ? 'var(--primary-container)' : 'var(--surface-c-high)', color: on ? 'var(--on-primary-container)' : 'var(--on-surface)', display: 'grid', placeItems: 'center' }}>{I[icon]}</span>
        <div>
          <div style={{ fontSize: 14.5, fontWeight: 600 }}>{label}</div>
          {meta && <div style={{ fontSize: 12, color: 'var(--on-surface-variant)' }}>{meta}</div>}
        </div>
        {on && <span style={{ color: 'var(--primary)' }}>{I.check}</span>}
      </button>
    );
  }

  function NotifRow({ id, label, meta, last }: { id: string; label: string; meta: string; last?: boolean }) {
    const on = notifs.has(id);
    return (
      <div className="list-row" style={{ borderBottom: last ? 'none' : '1px solid var(--outline-variant)', borderTop: 'none' }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14.5, fontWeight: 600 }}>{label}</div>
          <div style={{ fontSize: 12, color: 'var(--on-surface-variant)' }}>{meta}</div>
        </div>
        <button onClick={() => toggleNotif(id)} className={`toggle${on ? ' is-on' : ''}`} role="switch" aria-checked={on} aria-label={`Alternar notificação de ${label}`}><span className="thumb" /></button>
      </div>
    );
  }

  return (
    <>
      <TopAppBar title="Configurações" showBack onBack={onBack} />
      <div style={{ padding: '0 16px' }}>
        <div className="eyebrow" style={{ padding: '4px 4px 10px' }}>APARÊNCIA</div>
        <div className="card-filled">
          <ThemeRow icon="auto" label="Seguir o aparelho" meta={'Atual: ' + (resolvedTheme === 'dark' ? 'Escuro' : 'Claro')} on={theme === 'auto'} onClick={() => setTheme('auto')} />
          <ThemeRow icon="sun" label="Claro" on={theme === 'light'} onClick={() => setTheme('light')} />
          <ThemeRow icon="moon" label="Escuro" on={theme === 'dark'} onClick={() => setTheme('dark')} last />
        </div>
      </div>
      <div style={{ padding: '24px 16px 0' }}>
        <div className="eyebrow" style={{ padding: '4px 4px 10px' }}>NOTIFICAÇÕES</div>
        <div className="card-filled">
          {pushSupported && (
            <div className="list-row" style={{ borderBottom: '1px solid var(--outline-variant)', borderTop: 'none' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14.5, fontWeight: 600 }}>Notificações no aparelho</div>
                <div style={{ fontSize: 12, color: 'var(--on-surface-variant)' }}>Resultado saiu, time aprovado e mais — direto no seu navegador</div>
              </div>
              <button onClick={togglePush} disabled={pushBusy} className={`toggle${pushOn ? ' is-on' : ''}`} role="switch" aria-checked={pushOn} aria-label="Alternar notificações push" style={{ opacity: pushBusy ? 0.6 : 1 }}><span className="thumb" /></button>
            </div>
          )}
          {competitions.length === 0 ? (
            <div style={{ padding: '16px', fontSize: 13, color: 'var(--on-surface-variant)' }}>Nenhuma competição cadastrada ainda.</div>
          ) : competitions.map(c => (
            <NotifRow key={c.id} id={'comp:' + c.id} label={`${c.nome} ${c.edicao}`} meta="Resultados e próximos jogos" />
          ))}
          <NotifRow id="news:general" label="Notícias da Federação" meta="Comunicados oficiais" last />
        </div>
      </div>
      <div style={{ padding: '24px 16px 0' }}>
        <div className="eyebrow" style={{ padding: '4px 4px 10px' }}>CONTA</div>
        <div className="card-filled">
          {[{ icon: 'person', label: 'Editar perfil', page: 'profile' }, { icon: 'support', label: 'Ajuda', page: 'support', last: true }].map(row => (
            <button key={row.label} onClick={() => onNav(row.page)} className="tap"
              style={{ width: '100%', textAlign: 'left', display: 'grid', gridTemplateColumns: '40px 1fr 24px', alignItems: 'center', gap: 14, padding: '14px 16px', borderBottom: row.last ? 'none' : '1px solid var(--outline-variant)' }}>
              <span style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--surface-c-high)', display: 'grid', placeItems: 'center' }}>{I[row.icon]}</span>
              <div>
                <div style={{ fontSize: 14.5, fontWeight: 600 }}>{row.label}</div>
              </div>
              <span style={{ color: 'var(--on-surface-variant)' }}>{I.chevR}</span>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}

// ===================== SUBSCRIPTION =====================
// Página pública de inscrição — usa os mesmos componentes/tokens do resto do
// app (TopAppBar, card-filled, FormField) e o chrome padrão (DesktopHeader/
// BottomNav), com layout de duas colunas no desktop (.d-split) e um resumo
// lateral que acompanha o preenchimento.
export function SubscriptionScreen({ onBack, onNav, presetCompId }: {
  onBack?: () => void; onNav?: (page: string, param?: string | number | null) => void;
  presetCompId?: string | number | null;
}) {
  const { showToast, showError } = useApp();
  const { competitions, activeComp } = useData();
  const [step, setStep] = useState<'form' | 'sending' | 'success'>('form');
  const [nome, setNome] = useState('');
  const [tag, setTag] = useState('');
  const [capNick, setCapNick] = useState('');
  const [capId, setCapId] = useState('');
  const [capDiscord, setCapDiscord] = useState('');
  const [agree, setAgree] = useState(false);
  const [attempted, setAttempted] = useState(false);
  const MIN_JOGADORES = 5;
  const MAX_JOGADORES = 10;
  const [jogadores, setJogadores] = useState<InscricaoJogador[]>(
    Array.from({ length: MIN_JOGADORES }, () => ({ ...BLANK_JOGADOR }))
  );
  const [compId, setCompId] = useState('');
  const [sentInfo, setSentInfo] = useState<{ nome: string; tag: string; count: number } | null>(null);

  const selectedComp = compId || (presetCompId ? String(presetCompId) : '') || activeComp?.id || competitions[0]?.id || '';
  const openComps = competitions.filter(c => c.status === 'inscricoes' || c.status === 'em_andamento');

  const updateJogador = (i: number, patch: Partial<InscricaoJogador>) =>
    setJogadores(js => js.map((j, idx) => idx === i ? { ...j, ...patch } : j));
  const addJogador = () => setJogadores(js => js.length >= MAX_JOGADORES ? js : [...js, { ...BLANK_JOGADOR }]);
  const removeJogador = (i: number) => setJogadores(js => js.length > 1 ? js.filter((_, idx) => idx !== i) : js);

  const tocadas = jogadores.filter(j => j.nick.trim() && j.game_id.trim());
  const rosterDone = tocadas.length;

  const handleSubmit = async () => {
    setAttempted(true);
    if (!nome.trim() || !tag.trim() || !capNick.trim() || !capId.trim() || !selectedComp) {
      showToast('Preencha os campos obrigatórios destacados em vermelho');
      return;
    }
    const incompleta = jogadores.find(j => (j.nick.trim() || j.game_id.trim()) && (!j.nick.trim() || !j.game_id.trim()));
    if (incompleta) { showToast('Cada jogador precisa de Nick e ID do jogo preenchidos'); return; }
    if (rosterDone < MIN_JOGADORES) { showToast(`O elenco precisa de pelo menos ${MIN_JOGADORES} jogadores completos`); return; }
    if (!agree) { showToast('Confirme que leu o regulamento'); return; }

    const jogadoresValidos = tocadas.map(j => ({
      nick: j.nick.trim(), game_id: j.game_id.trim(),
      discord: j.discord?.trim() || null, posicao: j.posicao || null,
    }));

    setStep('sending');
    try {
      const taken = await fetchTakenGameIds(jogadoresValidos.map(j => j.game_id));
      if (taken.length > 0) {
        showToast(`ID já cadastrado em outro time: ${taken.join(', ')}`);
        setStep('form');
        return;
      }
      await createInscricao({
        competition_id: selectedComp,
        nome: nome.trim(), tag: tag.trim(),
        capitao: capNick.trim(), capitao_game_id: capId.trim(), capitao_discord: capDiscord.trim(),
        jogadores: jogadoresValidos,
      });
      setSentInfo({ nome: nome.trim(), tag: tag.trim(), count: rosterDone });
      setStep('success');
    } catch {
      showToast('Erro ao enviar inscrição. Tente novamente.', { variant: 'error' });
      setStep('form');
    }
  };

  if (step === 'success' && sentInfo) {
    return (
      <>
        <TopAppBar title="Inscrição enviada" showBack onBack={onBack} />
        <div style={{ padding: '40px 24px 0', textAlign: 'center', maxWidth: 420, margin: '0 auto' }}>
          <div style={{ width: 72, height: 72, borderRadius: 24, background: 'var(--primary-container)', color: 'var(--on-primary-container)', margin: '0 auto 14px', display: 'grid', placeItems: 'center' }}>
            <span style={{ width: 36, height: 36 }}>{I.check}</span>
          </div>
          <h2 style={{ margin: '0 0 8px', fontSize: 22, fontWeight: 800 }}>Tudo certo!</h2>
          <p style={{ margin: '0 0 20px', fontSize: 14.5, color: 'var(--on-surface-variant)', lineHeight: 1.5 }}>
            O <strong style={{ color: 'var(--on-surface)' }}>{sentInfo.nome}</strong> entrou na fila de análise. A resposta chega em até 48h.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 28, flexWrap: 'wrap' }}>
            <span className="chip">{sentInfo.tag} · {sentInfo.nome}</span>
            <span className="chip">{sentInfo.count} jogadores</span>
          </div>
          <button className="btn btn-primary" onClick={onBack} style={{ width: '100%' }}>Voltar para o início</button>
        </div>
      </>
    );
  }

  if (openComps.length === 0 && competitions.length > 0) {
    return (
      <>
        <TopAppBar title="Inscrever time" showBack onBack={onBack} />
        <div className="empty" style={{ padding: '40px 24px' }}>
          <div className="empty-icon">{I.calendar}</div>
          <h3 style={{ margin: '0 0 8px', fontSize: 18, fontWeight: 700 }}>Inscrições fechadas</h3>
          <p style={{ margin: 0, fontSize: 14, color: 'var(--on-surface-variant)', lineHeight: 1.5 }}>Nenhuma competição está aberta para inscrições no momento. Fique de olho nos avisos oficiais.</p>
        </div>
      </>
    );
  }

  const requiredVals = [selectedComp, nome.trim(), tag.trim(), capNick.trim(), capId.trim()];
  const requiredDone = requiredVals.filter(Boolean).length;
  const requiredTotal = requiredVals.length;
  const compInvalid = attempted && !selectedComp;
  const selectedCompObj = openComps.find(c => c.id === selectedComp);

  return (
    <>
      <TopAppBar title="Inscrever time" showBack onBack={onBack} />
      <div className="d-split" style={{ padding: '0 20px 32px' }}>
        <div>
          <p style={{ margin: '0 0 16px', fontSize: 14.5, color: 'var(--on-surface-variant)', lineHeight: 1.55 }}>Preencha os dados do seu time. A análise do staff leva até 48h.</p>

          {openComps.length > 1 && (
            <div style={{ marginBottom: 18 }}>
              <FieldLabel required>Competição</FieldLabel>
              <Select title="Competição" value={selectedComp} onChange={setCompId} placeholder="Selecione"
                options={openComps.map(c => ({ value: c.id, label: `${c.nome} ${c.edicao}` }))}
                style={compInvalid ? { borderColor: 'var(--error)', background: 'color-mix(in srgb, var(--error) 7%, var(--surface-c))' } : undefined} />
              {compInvalid && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--error)', fontWeight: 600, marginTop: 5 }}>
                  <span style={{ width: 13, height: 13 }}>{I.close}</span>Selecione uma competição
                </div>
              )}
            </div>
          )}

          <FormField label="Nome do time" required value={nome} onChange={setNome}
            placeholder="Nome do clube" invalid={attempted && !nome.trim()} style={{ marginBottom: 18 }} />

          <FormField label="Tag (até 4 letras)" required value={tag} onChange={v => setTag(v.toUpperCase())}
            placeholder="Sigla" maxLength={4} invalid={attempted && !tag.trim()}
            inputStyle={{ textTransform: 'uppercase' }} style={{ marginBottom: 18 }} />

          <div style={{ marginBottom: 10 }}>
            <label className="field-label" style={{ marginBottom: 2, display: 'block' }}>Capitão</label>
            <div style={{ fontSize: 12, color: 'var(--on-surface-variant)' }}>É quem recebe o contato do staff</div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
            <FormField label="Nick" required value={capNick} onChange={setCapNick} invalid={attempted && !capNick.trim()} />
            <FormField label="ID do jogo" required value={capId} onChange={setCapId} invalid={attempted && !capId.trim()} />
          </div>
          <div style={{ marginBottom: 22 }}>
            <FieldLabel>Discord</FieldLabel>
            <input className="input" value={capDiscord} onChange={e => setCapDiscord(e.target.value)} />
          </div>

          <div style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <label className="field-label" style={{ margin: 0 }}>Elenco</label>
              <span className="mono" style={{ fontSize: 12, fontWeight: 700, color: rosterDone >= MIN_JOGADORES ? 'var(--primary)' : 'var(--on-surface-variant)' }}>
                {rosterDone}/{jogadores.length} · mín. {MIN_JOGADORES}, máx. {MAX_JOGADORES}
              </span>
            </div>

            {jogadores.map((j, i) => {
              const rowTouched = j.nick.trim() !== '' || j.game_id.trim() !== '';
              const nickInvalid = attempted && rowTouched && !j.nick.trim();
              const idInvalid = attempted && rowTouched && !j.game_id.trim();
              return (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: 14, background: 'var(--surface-c)', borderRadius: 'var(--r-md)', marginBottom: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--on-surface-variant)' }}>Jogador {i + 1}</span>
                    {jogadores.length > 1 && (
                      <button onClick={() => removeJogador(i)} className="icon-btn" style={{ width: 28, height: 28, color: 'var(--error)' }} title="Remover">{I.trash}</button>
                    )}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <FormField label="Nick" required value={j.nick} onChange={v => updateJogador(i, { nick: v })} invalid={nickInvalid} />
                    <FormField label="ID do jogo" required value={j.game_id} onChange={v => updateJogador(i, { game_id: v })} invalid={idInvalid} />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <div>
                      <FieldLabel style={{ marginBottom: 4, fontSize: 12 }}>Discord</FieldLabel>
                      <input className="input" value={j.discord ?? ''}
                        onChange={e => updateJogador(i, { discord: e.target.value })} />
                    </div>
                    <div>
                      <FieldLabel style={{ marginBottom: 4, fontSize: 12 }}>Posição</FieldLabel>
                      <Select title="Posição" placeholder="Sem posição" value={j.posicao ?? ''}
                        onChange={v => updateJogador(i, { posicao: (v || null) as InscricaoJogador['posicao'] })}
                        options={POSICOES.map(p => ({ value: p, label: p }))} />
                    </div>
                  </div>
                </div>
              );
            })}

            <button onClick={addJogador} disabled={jogadores.length >= MAX_JOGADORES} className="btn btn-tonal"
              style={{ height: 42, fontSize: 13.5, width: '100%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: jogadores.length >= MAX_JOGADORES ? 0.5 : 1 }}>
              <span style={{ width: 16, height: 16 }}>{I.plus}</span>{jogadores.length >= MAX_JOGADORES ? 'Limite de 10 jogadores' : 'Adicionar jogador'}
            </button>
          </div>

          <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer', marginBottom: 20 }}>
            <input type="checkbox" checked={agree} onChange={e => setAgree(e.target.checked)}
              style={{ width: 18, height: 18, marginTop: 1, accentColor: 'var(--primary)', flexShrink: 0 }} />
            <span style={{ fontSize: 13, color: 'var(--on-surface-variant)', lineHeight: 1.5 }}>
              Li e concordo com o{' '}
              <button type="button" onClick={() => onNav?.('rules')}
                style={{ color: 'var(--primary)', fontWeight: 600, background: 'none', border: 'none', padding: 0, cursor: 'pointer', textDecoration: 'underline' }}>
                regulamento oficial
              </button>{' '}
              e confirmo que os IDs informados são reais.
            </span>
          </label>

          <button onClick={handleSubmit} disabled={step === 'sending'} className="btn btn-primary" style={{ width: '100%', height: 52, opacity: step === 'sending' ? 0.65 : 1 }}>
            {step === 'sending' ? 'Enviando…' : 'Enviar para análise'}
          </button>
        </div>

        {/* Desktop: resumo lateral acompanha o preenchimento */}
        <div>
          <div className="card-elev" style={{ padding: 20, position: 'sticky', top: 84 }}>
            <div className="eyebrow eyebrow-acc" style={{ marginBottom: 14 }}>RESUMO</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
              <span style={{ width: 48, height: 48, borderRadius: 14, background: 'var(--surface-c-high)', display: 'grid', placeItems: 'center', fontWeight: 800, fontSize: 14, fontFamily: 'var(--mono)', flexShrink: 0 }}>
                {tag || '···'}
              </span>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 15, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{nome || 'Nome do time'}</div>
                <div style={{ fontSize: 12, color: 'var(--on-surface-variant)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {selectedCompObj ? `${selectedCompObj.nome} ${selectedCompObj.edicao}` : 'Selecione a competição'}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--on-surface-variant)' }}>Campos obrigatórios</span>
              <span className="mono" style={{ fontSize: 12, fontWeight: 700, color: requiredDone === requiredTotal ? 'var(--primary)' : 'var(--on-surface-variant)' }}>{requiredDone}/{requiredTotal}</span>
            </div>
            <div style={{ height: 6, background: 'var(--surface-c-high)', borderRadius: 999, overflow: 'hidden', marginBottom: 18 }}>
              <div style={{ width: `${(requiredDone / requiredTotal) * 100}%`, height: '100%', background: requiredDone === requiredTotal ? 'var(--primary)' : 'var(--warning)', borderRadius: 999, transition: 'width .25s' }} />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '8px 0', borderTop: '1px solid var(--outline-variant)' }}>
              <span style={{ color: 'var(--on-surface-variant)' }}>Capitão</span>
              <span style={{ fontWeight: 600 }}>{capNick || '—'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '8px 0', borderTop: '1px solid var(--outline-variant)' }}>
              <span style={{ color: 'var(--on-surface-variant)' }}>Jogadores completos</span>
              <span style={{ fontWeight: 600, color: rosterDone >= MIN_JOGADORES ? 'var(--primary)' : 'var(--warning)' }}>{rosterDone} (mín. {MIN_JOGADORES})</span>
            </div>

            <div style={{ marginTop: 16, fontSize: 12, color: 'var(--on-surface-variant)', lineHeight: 1.5 }}>
              Resposta da staff em até 48h · sem taxa de inscrição.
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ===================== RULES =====================
// Conteúdo removido a pedido — texto era fictício/placeholder. Volta quando
// tiver o regulamento oficial definido (idealmente editável pelo Admin).
export function RulesScreen({ onBack }: { onBack?: () => void }) {
  return (
    <>
      <TopAppBar large title="Regulamento" showBack onBack={onBack} />
      <div className="empty" style={{ marginTop: 24 }}>
        <div className="empty-icon">{I.rules}</div>
        <h3 style={{ margin: '0 0 6px', fontSize: 17, fontWeight: 700, color: 'var(--on-surface)' }}>Em preparação</h3>
        <p style={{ margin: 0, fontSize: 14 }}>O regulamento oficial ainda está sendo definido.</p>
      </div>
    </>
  );
}

// ===================== SUPPORT =====================
function FAQItem({ q, a, last }: { q: string; a: string; last?: boolean }) {
  const [open, setOpen] = useState(false);
  return (
    <button onClick={() => setOpen(!open)} className="tap"
      style={{ width: '100%', textAlign: 'left', padding: '14px 16px', borderBottom: !last ? '1px solid var(--outline-variant)' : 'none', display: 'block' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ flex: 1, fontSize: 14, fontWeight: 600 }}>{q}</span>
        <span style={{ color: 'var(--on-surface-variant)', transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .2s', width: 20, height: 20 }}>{I.chevD}</span>
      </div>
      {open && <p style={{ margin: '10px 0 0', fontSize: 13.5, color: 'var(--on-surface-variant)', lineHeight: 1.5 }}>{a}</p>}
    </button>
  );
}

export function SupportScreen({ onBack }: { onBack?: () => void }) {
  const faqs = [
    { q: 'Como me inscrevo na competição?', a: 'Vá em Mais → Inscrever time e preencha o formulário oficial. O staff analisa e cadastra cada jogador manualmente.' },
    { q: 'Como funciona o fair play?', a: 'Gravação obrigatória do lance, enviada em até 7 minutos.' },
    { q: 'Quem pode jogar?', a: 'FBM aceita sD+, CPM aceita Séries ou WK CBM.' },
    { q: 'Como troco meu nick?', a: 'Em Perfil → Editar perfil. Mudanças passam por validação.' },
  ];
  return (
    <>
      <TopAppBar title="Suporte" showBack onBack={onBack} />
      <SectionHead title="Perguntas frequentes" />
      <div style={{ padding: '0 16px' }}>
        <div className="card-filled">
          {faqs.map((f, i) => <FAQItem key={i} q={f.q} a={f.a} last={i === faqs.length - 1} />)}
        </div>
      </div>
    </>
  );
}

// ===================== SEARCH =====================
export function SearchScreen({ onBack, onNav }: NavProps) {
  const [q, setQ] = useState('');
  const { clubs, news, clubById } = useData();
  const filteredClubs = clubs.filter(c => !q || c.nome.toLowerCase().includes(q.toLowerCase()) || c.tag.toLowerCase().includes(q.toLowerCase()));
  const filteredNews = news.filter(n => !q || n.title.toLowerCase().includes(q.toLowerCase()));
  const trending = ['Clubes', 'Inscrições', 'Tabela', 'Final 2026'];

  // Jogadores — busca no banco (nick ou ID do jogo), com debounce
  const [playerResults, setPlayerResults] = useState<{ id: string; nick: string; game_id: string; club_id: string }[]>([]);
  useEffect(() => {
    if (!q.trim()) { setPlayerResults([]); return; }
    let cancelled = false;
    const t = setTimeout(() => {
      searchPlayers(q).then(r => { if (!cancelled) setPlayerResults(r); }).catch(() => { if (!cancelled) setPlayerResults([]); });
    }, 300);
    return () => { cancelled = true; clearTimeout(t); };
  }, [q]);

  return (
    <>
      <div style={{ position: 'sticky', top: 0, zIndex: 30, background: 'var(--surface)' }}>
        <div style={{ display: 'flex', alignItems: 'center', padding: '10px 8px 14px', gap: 8 }}>
          <button className="icon-btn" onClick={onBack} aria-label="Voltar">{I.back}</button>
          <div style={{ flex: 1, height: 48, background: 'var(--surface-c)', borderRadius: 999, display: 'flex', alignItems: 'center', gap: 10, padding: '0 16px' }}>
            <span style={{ color: 'var(--on-surface-variant)', width: 20, height: 20 }}>{I.search}</span>
            <input autoFocus value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar clube, jogador, notícia…"
              style={{ flex: 1, border: 0, background: 'transparent', outline: 0, fontSize: 15, color: 'var(--on-surface)', fontFamily: 'var(--sans)' }} />
            {q && <button onClick={() => setQ('')} style={{ width: 24, height: 24, color: 'var(--on-surface-variant)' }} aria-label="Limpar busca">{I.close}</button>}
          </div>
        </div>
      </div>

      {!q && (
        <div style={{ padding: '4px 16px 0' }}>
          <div className="eyebrow" style={{ paddingBottom: 10 }}>EM ALTA</div>
          <div className="card-filled">
            {trending.map((t, i) => (
              <button key={t} onClick={() => setQ(t)} className="tap"
                style={{ width: '100%', textAlign: 'left', display: 'grid', gridTemplateColumns: '32px 1fr', alignItems: 'center', gap: 12, padding: '14px 16px', borderTop: i ? '1px solid var(--outline-variant)' : 'none' }}>
                <span className="mono tabular" style={{ fontSize: 14, color: 'var(--primary)', fontWeight: 700 }}>#{i + 1}</span>
                <span style={{ fontSize: 14, fontWeight: 600 }}>{t}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {q && (
        <div style={{ padding: '4px 16px' }}>
          {filteredClubs.length > 0 && (
            <>
              <div className="eyebrow" style={{ padding: '8px 0 10px' }}>CLUBES · {filteredClubs.length}</div>
              <div className="card-filled" style={{ marginBottom: 14 }}>
                {filteredClubs.slice(0, 5).map((c, i) => (
                  <button key={c.id} onClick={() => onNav('club', c.id)} className="tap"
                    style={{ width: '100%', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderTop: i ? '1px solid var(--outline-variant)' : 'none' }}>
                    <Crest id={c.id} size={32} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 600 }}>{c.nome}</div>
                      <div className="mono" style={{ fontSize: 11, color: 'var(--on-surface-variant)' }}>{c.tag}</div>
                    </div>
                    <span style={{ color: 'var(--on-surface-variant)' }}>{I.chevR}</span>
                  </button>
                ))}
              </div>
            </>
          )}
          {playerResults.length > 0 && (
            <>
              <div className="eyebrow" style={{ padding: '8px 0 10px' }}>JOGADORES · {playerResults.length}</div>
              <div className="card-filled" style={{ marginBottom: 14 }}>
                {playerResults.map((p, i) => {
                  const c = clubById(p.club_id);
                  return (
                    <button key={p.id} onClick={() => onNav('club', p.club_id)} className="tap"
                      style={{ width: '100%', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderTop: i ? '1px solid var(--outline-variant)' : 'none' }}>
                      {c ? <Crest id={c.id} size={32} /> : <span style={{ width: 32, height: 32, borderRadius: 10, background: 'var(--surface-c-high)', display: 'grid', placeItems: 'center' }}>{I.person}</span>}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 14, fontWeight: 600 }}>{p.nick}</div>
                        <div className="mono" style={{ fontSize: 11, color: 'var(--on-surface-variant)' }}>#{p.game_id} {c && `· ${c.tag}`}</div>
                      </div>
                      <span style={{ color: 'var(--on-surface-variant)' }}>{I.chevR}</span>
                    </button>
                  );
                })}
              </div>
            </>
          )}
          {filteredNews.length > 0 && (
            <>
              <div className="eyebrow" style={{ padding: '8px 0 10px' }}>NOTÍCIAS · {filteredNews.length}</div>
              <div className="card-filled">
                {filteredNews.slice(0, 5).map((n, i) => (
                  <button key={n.id} onClick={() => onNav('article', n.id)} className="tap"
                    style={{ width: '100%', textAlign: 'left', padding: '12px 16px', borderTop: i ? '1px solid var(--outline-variant)' : 'none' }}>
                    <div className="eyebrow">{n.tag} · {n.date}</div>
                    <div style={{ fontSize: 14, fontWeight: 600, marginTop: 4 }}>{n.title}</div>
                  </button>
                ))}
              </div>
            </>
          )}
          {filteredClubs.length === 0 && filteredNews.length === 0 && playerResults.length === 0 && (
            <div className="empty">Nenhum resultado para &ldquo;{q}&rdquo;.</div>
          )}
        </div>
      )}
    </>
  );
}
