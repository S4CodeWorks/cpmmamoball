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
  const { showToast } = useApp();
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
      showToast('Erro ao salvar: ' + (e instanceof Error ? e.message : String(e)));
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
      showToast('Erro ao excluir conta. Tente novamente.');
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  return (
    <>
      <TopAppBar title="Meu perfil" showBack onBack={onBack}
        rightExtras={<button className="icon-btn" onClick={() => onNav('settings')}>{I.cog}</button>}
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
        <button onClick={() => toggleNotif(id)} className={`toggle${on ? ' is-on' : ''}`}><span className="thumb" /></button>
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
              <button onClick={togglePush} disabled={pushBusy} className={`toggle${pushOn ? ' is-on' : ''}`} style={{ opacity: pushBusy ? 0.6 : 1 }}><span className="thumb" /></button>
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
// Página pública de inscrição — visual próprio (monocromático 2026), fora do
// chrome do app (ver PhoneShell FULL_BLEED_PAGES). Design: Inscricao Publica.dc.html
export function SubscriptionScreen({ onBack, onNav, presetCompId }: {
  onBack?: () => void; onNav?: (page: string, param?: string | number | null) => void;
  presetCompId?: string | number | null;
}) {
  const { showToast, resolvedTheme, setTheme } = useApp();
  const { competitions, activeComp } = useData();
  const [step, setStep] = useState<'form' | 'sending' | 'success'>('form');
  const [nome, setNome] = useState('');
  const [tag, setTag] = useState('');
  const [capNick, setCapNick] = useState('');
  const [capId, setCapId] = useState('');
  const [capDiscord, setCapDiscord] = useState('');
  const [agree, setAgree] = useState(false);
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

  const rosterDone = jogadores.filter(j => j.nick.trim() && j.game_id.trim()).length;
  const toggleTheme = () => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');

  const handleSubmit = async () => {
    if (!nome.trim() || !tag.trim()) { showToast('Preencha o nome e a sigla do time'); return; }
    if (!capNick.trim() || !capId.trim()) { showToast('Preencha os dados do capitão'); return; }
    const tocadas = jogadores.filter(j => j.nick.trim() || j.game_id.trim());
    const incompleta = tocadas.find(j => !j.nick.trim() || !j.game_id.trim());
    if (incompleta) { showToast('Cada jogador precisa de Nick e ID do jogo preenchidos'); return; }
    if (tocadas.length < MIN_JOGADORES) { showToast(`O elenco precisa de pelo menos ${MIN_JOGADORES} jogadores completos`); return; }
    if (!agree) { showToast('Confirme que leu o regulamento'); return; }
    if (!selectedComp) { showToast('Selecione uma competição'); return; }

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
      setSentInfo({ nome: nome.trim(), tag: tag.trim(), count: tocadas.length });
      setStep('success');
    } catch {
      showToast('Erro ao enviar inscrição. Tente novamente.');
      setStep('form');
    }
  };

  const reset = () => {
    setStep('form'); setSentInfo(null);
    setNome(''); setTag(''); setCapNick(''); setCapId(''); setCapDiscord(''); setAgree(false);
    setJogadores(Array.from({ length: MIN_JOGADORES }, () => ({ ...BLANK_JOGADOR })));
  };

  const inputStyle: React.CSSProperties = { width: '100%', height: 48, padding: '0 15px', background: 'var(--dc-surface-2)', border: '1px solid var(--dc-border)', borderRadius: 13, color: 'var(--dc-text)', fontSize: 14.5, outline: 'none', fontFamily: 'var(--dc-sans)' };
  const labelStyle: React.CSSProperties = { fontSize: 12.5, fontWeight: 600, color: 'var(--dc-text-2)', marginBottom: 7 };

  const header = (
    <header style={{ position: 'sticky', top: 0, zIndex: 30, background: 'color-mix(in srgb, var(--dc-bg) 85%, transparent)', backdropFilter: 'blur(14px)', borderBottom: '1px solid var(--dc-border)' }}>
      <div style={{ maxWidth: 1060, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 14, padding: '14px 24px' }}>
        <button onClick={() => onBack?.()} style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, background: 'none', border: 'none', cursor: 'pointer' }}>
          <div style={{ width: 30, height: 30, borderRadius: 9, background: 'var(--dc-accent)', color: 'var(--dc-on-accent)', display: 'grid', placeItems: 'center', fontWeight: 800, fontSize: 15 }}>C</div>
          <span style={{ fontWeight: 700, fontSize: 14, letterSpacing: '-0.01em', color: 'var(--dc-text)' }}>CPM MamoBall</span>
        </button>
        <button onClick={() => onNav?.('rules')} style={{ fontSize: 13, fontWeight: 600, color: 'var(--dc-text-2)', background: 'none', border: 'none', cursor: 'pointer' }}>Regulamento</button>
        <button onClick={() => onNav?.('admin')} style={{ fontSize: 13, fontWeight: 600, color: 'var(--dc-text-2)', background: 'none', border: 'none', cursor: 'pointer' }}>Painel</button>
        <button onClick={toggleTheme} title="Alternar tema"
          style={{ width: 34, height: 34, borderRadius: 9, border: '1px solid var(--dc-border)', background: 'var(--dc-surface)', color: 'var(--dc-text-2)', display: 'grid', placeItems: 'center', cursor: 'pointer' }}>
          <span style={{ width: 15, height: 15 }}>{resolvedTheme === 'dark' ? I.sun : I.moon}</span>
        </button>
      </div>
    </header>
  );

  const footer = (
    <footer style={{ borderTop: '1px solid var(--dc-border)', padding: '22px 24px', textAlign: 'center' }}>
      <span style={{ fontFamily: 'var(--dc-mono)', fontSize: 11.5, color: 'var(--dc-text-3)' }}>CPM MamoBall © 2026 · feito pela comunidade</span>
    </footer>
  );

  if (step === 'success' && sentInfo) {
    return (
      <div className="dc-mono" data-theme={resolvedTheme} style={{ minHeight: '100dvh', background: 'var(--dc-bg)', color: 'var(--dc-text)', display: 'flex', flexDirection: 'column' }}>
        {header}
        <main style={{ flex: 1, width: '100%' }}>
          <div style={{ maxWidth: 520, margin: '0 auto', padding: '90px 24px 80px', textAlign: 'center', animation: 'dcSlideUp .35s cubic-bezier(.2,.9,.3,1)' }}>
            <div style={{ width: 74, height: 74, borderRadius: 24, background: 'var(--dc-pos-bg)', color: 'var(--dc-pos)', display: 'grid', placeItems: 'center', margin: '0 auto 26px' }}>
              <span style={{ width: 34, height: 34 }}>{I.check}</span>
            </div>
            <h1 style={{ margin: 0, fontSize: 'clamp(28px,5vw,38px)', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.1 }}>Inscrição enviada!</h1>
            <p style={{ margin: '16px auto 0', fontSize: 15, color: 'var(--dc-text-2)', lineHeight: 1.6, maxWidth: 400 }}>
              O <strong style={{ color: 'var(--dc-text)' }}>{sentInfo.nome}</strong> entrou na fila de análise da staff. Você recebe a resposta no Discord do capitão em até <strong style={{ color: 'var(--dc-text)' }}>48 horas</strong>.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginTop: 22, flexWrap: 'wrap' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '8px 14px', borderRadius: 99, background: 'var(--dc-surface-2)', border: '1px solid var(--dc-border)', fontSize: 12.5, fontWeight: 600 }}>
                <span style={{ fontFamily: 'var(--dc-mono)', fontWeight: 700 }}>{sentInfo.tag}</span>{sentInfo.nome}
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', padding: '8px 14px', borderRadius: 99, background: 'var(--dc-surface-2)', border: '1px solid var(--dc-border)', fontSize: 12.5, fontWeight: 600 }}>
                {sentInfo.count} jogadores
              </span>
            </div>
            <button onClick={reset} style={{ marginTop: 34, height: 46, padding: '0 24px', borderRadius: 12, border: '1px solid var(--dc-border-2)', background: 'var(--dc-surface)', color: 'var(--dc-text)', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--dc-sans)' }}>
              Enviar outra inscrição
            </button>
          </div>
        </main>
        {footer}
      </div>
    );
  }

  if (openComps.length === 0 && competitions.length > 0) {
    return (
      <div className="dc-mono" data-theme={resolvedTheme} style={{ minHeight: '100dvh', background: 'var(--dc-bg)', color: 'var(--dc-text)', display: 'flex', flexDirection: 'column' }}>
        {header}
        <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div style={{ textAlign: 'center', maxWidth: 380 }}>
            <div style={{ width: 60, height: 60, borderRadius: 20, background: 'var(--dc-surface-2)', color: 'var(--dc-text-3)', display: 'grid', placeItems: 'center', margin: '0 auto 18px' }}>
              <span style={{ width: 26, height: 26 }}>{I.calendar}</span>
            </div>
            <h2 style={{ margin: '0 0 8px', fontSize: 20, fontWeight: 800 }}>Inscrições fechadas</h2>
            <p style={{ margin: 0, fontSize: 14, color: 'var(--dc-text-2)', lineHeight: 1.5 }}>Nenhuma competição está aberta pra inscrições no momento. Fique de olho nos avisos oficiais.</p>
          </div>
        </main>
        {footer}
      </div>
    );
  }

  return (
    <div className="dc-mono" data-theme={resolvedTheme} style={{ minHeight: '100dvh', background: 'var(--dc-bg)', color: 'var(--dc-text)', display: 'flex', flexDirection: 'column' }}>
      {header}
      <main style={{ flex: 1, width: '100%' }}>
        <div style={{ maxWidth: 720, margin: '0 auto', padding: '72px 24px 48px', textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '7px 15px', borderRadius: 99, background: 'var(--dc-surface-2)', border: '1px solid var(--dc-border)', fontSize: 12.5, fontWeight: 600, color: 'var(--dc-text-2)' }}>
            <span style={{ width: 7, height: 7, borderRadius: 99, background: 'var(--dc-pos)' }} />
            Inscrições abertas
          </div>
          <h1 style={{ margin: '22px 0 0', fontSize: 'clamp(32px,6vw,52px)', fontWeight: 800, letterSpacing: '-0.035em', lineHeight: 1.05 }}>
            Inscreva seu time na<br />Copa MamoBall {activeComp?.edicao ?? ''}
          </h1>
          <p style={{ margin: '18px auto 0', fontSize: 16, color: 'var(--dc-text-2)', lineHeight: 1.6, maxWidth: 440 }}>
            Monte o elenco, indique o capitão e envie. A staff analisa cada inscrição em até 48 horas.
          </p>
        </div>

        <div style={{ maxWidth: 640, margin: '0 auto', padding: '0 20px 90px' }}>
          <div style={{ border: '1px solid var(--dc-border)', borderRadius: 24, background: 'var(--dc-surface)', boxShadow: 'var(--dc-shadow-lg)', overflow: 'hidden' }}>

            {/* 01 O time */}
            <div style={{ padding: '30px 30px 26px' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
                <span style={{ fontFamily: 'var(--dc-mono)', fontSize: 12, fontWeight: 600, color: 'var(--dc-text-3)' }}>01</span>
                <span style={{ fontSize: 16, fontWeight: 700, letterSpacing: '-0.01em' }}>O time</span>
                {openComps.length > 1 && (
                  <Select title="Competição" value={selectedComp} onChange={setCompId}
                    style={{ marginLeft: 'auto', height: 32, padding: '0 10px', background: 'var(--dc-surface-2)', border: '1px solid var(--dc-border)', borderRadius: 9, color: 'var(--dc-text)', fontSize: 12.5, fontFamily: 'var(--dc-sans)', width: 'auto' }}
                    options={openComps.map(c => ({ value: c.id, label: `${c.nome} ${c.edicao}` }))} />
                )}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14 }}>
                <div style={{ flex: '1 1 260px' }}>
                  <div style={labelStyle}>Nome do time</div>
                  <input value={nome} onChange={e => setNome(e.target.value)} placeholder="Ex.: Estrela Polar FC" style={inputStyle} />
                </div>
                <div style={{ flex: '0 1 170px', minWidth: 150 }}>
                  <div style={labelStyle}>Sigla</div>
                  <div style={{ position: 'relative' }}>
                    <input value={tag} onChange={e => setTag(e.target.value.toUpperCase().slice(0, 4))} placeholder="EPF" maxLength={4}
                      style={{ ...inputStyle, padding: '0 60px 0 15px', fontFamily: 'var(--dc-mono)', textTransform: 'uppercase', letterSpacing: '0.06em' }} />
                    <span style={{ position: 'absolute', right: 7, top: 7, width: 34, height: 34, borderRadius: 9, background: 'var(--dc-surface-3)', border: '1px solid var(--dc-border-2)', display: 'grid', placeItems: 'center', fontFamily: 'var(--dc-mono)', fontSize: 10.5, fontWeight: 700 }}>
                      {(tag || '···').toUpperCase().slice(0, 4)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 02 Capitão */}
            <div style={{ padding: '26px 30px', borderTop: '1px solid var(--dc-border)' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
                <span style={{ fontFamily: 'var(--dc-mono)', fontSize: 12, fontWeight: 600, color: 'var(--dc-text-3)' }}>02</span>
                <span style={{ fontSize: 16, fontWeight: 700, letterSpacing: '-0.01em' }}>Capitão</span>
                <span style={{ fontSize: 12, color: 'var(--dc-text-3)' }}>é quem recebe o contato da staff</span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14 }}>
                <div style={{ flex: '1 1 160px' }}>
                  <div style={labelStyle}>Nick</div>
                  <input value={capNick} onChange={e => setCapNick(e.target.value)} placeholder="Seu nick" style={inputStyle} />
                </div>
                <div style={{ flex: '1 1 160px' }}>
                  <div style={labelStyle}>ID no jogo</div>
                  <input value={capId} onChange={e => setCapId(e.target.value)} placeholder="EPF#9001" style={{ ...inputStyle, fontFamily: 'var(--dc-mono)' }} />
                </div>
                <div style={{ flex: '1 1 160px' }}>
                  <div style={labelStyle}>Discord</div>
                  <input value={capDiscord} onChange={e => setCapDiscord(e.target.value)} placeholder="usuario" style={{ ...inputStyle, fontFamily: 'var(--dc-mono)' }} />
                </div>
              </div>
            </div>

            {/* 03 Elenco */}
            <div style={{ padding: '26px 30px', borderTop: '1px solid var(--dc-border)' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
                <span style={{ fontFamily: 'var(--dc-mono)', fontSize: 12, fontWeight: 600, color: 'var(--dc-text-3)' }}>03</span>
                <span style={{ fontSize: 16, fontWeight: 700, letterSpacing: '-0.01em' }}>Elenco</span>
                <span style={{ marginLeft: 'auto', fontSize: 12, fontWeight: 700, fontFamily: 'var(--dc-mono)', color: 'var(--dc-text-2)', background: 'var(--dc-surface-2)', border: '1px solid var(--dc-border)', padding: '3px 10px', borderRadius: 99 }}>
                  {rosterDone}/{jogadores.length} · mín. {MIN_JOGADORES}, máx. {MAX_JOGADORES}
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {jogadores.map((j, i) => (
                  <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                    <span style={{ fontFamily: 'var(--dc-mono)', fontSize: 11, color: 'var(--dc-text-3)', width: 18, textAlign: 'center', flexShrink: 0 }}>{String(i + 1).padStart(2, '0')}</span>
                    <input value={j.nick} onChange={e => updateJogador(i, { nick: e.target.value })} placeholder="Nick"
                      style={{ flex: '1 1 120px', height: 44, padding: '0 13px', background: 'var(--dc-surface-2)', border: '1px solid var(--dc-border)', borderRadius: 12, color: 'var(--dc-text)', fontSize: 13.5, outline: 'none', fontFamily: 'var(--dc-sans)', minWidth: 0 }} />
                    <input value={j.game_id} onChange={e => updateJogador(i, { game_id: e.target.value })} placeholder="ID#0000"
                      style={{ flex: '1 1 110px', height: 44, padding: '0 13px', background: 'var(--dc-surface-2)', border: '1px solid var(--dc-border)', borderRadius: 12, color: 'var(--dc-text)', fontSize: 13.5, outline: 'none', fontFamily: 'var(--dc-mono)', minWidth: 0 }} />
                    <Select title="Posição" placeholder="Posição" value={j.posicao ?? ''}
                      onChange={v => updateJogador(i, { posicao: (v || null) as InscricaoJogador['posicao'] })}
                      style={{ flex: '0 1 120px', height: 44, padding: '0 9px', background: 'var(--dc-surface-2)', border: '1px solid var(--dc-border)', borderRadius: 12, color: 'var(--dc-text)', fontSize: 13, fontFamily: 'var(--dc-sans)' }}
                      options={POSICOES.map(p => ({ value: p, label: p }))} />
                    <button onClick={() => removeJogador(i)} disabled={jogadores.length <= 1} title="Remover linha"
                      style={{ width: 38, height: 44, borderRadius: 12, border: 'none', background: 'transparent', color: 'var(--dc-text-3)', display: 'grid', placeItems: 'center', cursor: jogadores.length > 1 ? 'pointer' : 'default', opacity: jogadores.length > 1 ? 1 : 0.3, flexShrink: 0 }}>
                      <span style={{ width: 15, height: 15 }}>{I.close}</span>
                    </button>
                  </div>
                ))}
              </div>
              <button onClick={addJogador} disabled={jogadores.length >= MAX_JOGADORES}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%', height: 44, borderRadius: 12, border: '1px dashed var(--dc-border-strong)', background: 'transparent', color: 'var(--dc-text-2)', fontSize: 13, fontWeight: 600, cursor: jogadores.length >= MAX_JOGADORES ? 'default' : 'pointer', opacity: jogadores.length >= MAX_JOGADORES ? 0.5 : 1, marginTop: 12, fontFamily: 'var(--dc-sans)' }}>
                <span style={{ width: 15, height: 15 }}>{I.plus}</span>{jogadores.length >= MAX_JOGADORES ? 'Limite de 10 jogadores' : 'Adicionar jogador'}
              </button>
            </div>

            {/* confirm */}
            <div style={{ padding: '26px 30px 30px', borderTop: '1px solid var(--dc-border)', background: 'var(--dc-surface-2)' }}>
              <button onClick={() => setAgree(a => !a)} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, width: '100%', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', padding: 0, fontFamily: 'var(--dc-sans)' }}>
                <span style={{ width: 21, height: 21, borderRadius: 7, border: agree ? 'none' : '1.5px solid var(--dc-border-strong)', background: agree ? 'var(--dc-accent)' : 'var(--dc-surface)', color: 'var(--dc-on-accent)', display: 'grid', placeItems: 'center', flexShrink: 0, marginTop: 1, transition: 'all .12s' }}>
                  {agree && <span style={{ width: 13, height: 13 }}>{I.check}</span>}
                </span>
                <span style={{ fontSize: 13, color: 'var(--dc-text-2)', lineHeight: 1.55 }}>
                  Li e concordo com o <span onClick={e => { e.stopPropagation(); onNav?.('rules'); }} style={{ color: 'var(--dc-text)', fontWeight: 600, textDecoration: 'underline' }}>regulamento oficial</span> da competição e confirmo que todos os IDs informados são reais.
                </span>
              </button>
              <button onClick={handleSubmit} disabled={step === 'sending'}
                style={{ width: '100%', height: 52, borderRadius: 14, border: 'none', background: 'var(--dc-accent)', color: 'var(--dc-on-accent)', fontSize: 15, fontWeight: 700, cursor: 'pointer', marginTop: 20, fontFamily: 'var(--dc-sans)', letterSpacing: '-0.01em', opacity: step === 'sending' ? 0.65 : 1 }}>
                {step === 'sending' ? 'Enviando…' : 'Enviar inscrição'}
              </button>
              <div style={{ textAlign: 'center', fontSize: 12, color: 'var(--dc-text-3)', marginTop: 12 }}>Resposta da staff em até 48h · sem taxa de inscrição</div>
            </div>
          </div>
        </div>
      </main>
      {footer}
    </div>
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
          <button className="icon-btn" onClick={onBack}>{I.back}</button>
          <div style={{ flex: 1, height: 48, background: 'var(--surface-c)', borderRadius: 999, display: 'flex', alignItems: 'center', gap: 10, padding: '0 16px' }}>
            <span style={{ color: 'var(--on-surface-variant)', width: 20, height: 20 }}>{I.search}</span>
            <input autoFocus value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar clube, jogador, notícia…"
              style={{ flex: 1, border: 0, background: 'transparent', outline: 0, fontSize: 15, color: 'var(--on-surface)', fontFamily: 'var(--sans)' }} />
            {q && <button onClick={() => setQ('')} style={{ width: 24, height: 24, color: 'var(--on-surface-variant)' }}>{I.close}</button>}
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
