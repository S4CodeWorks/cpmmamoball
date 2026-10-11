'use client';

import { useState, useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { shareLink } from '@/lib/share';
import { isPushSupported, getPushSubscription, subscribeToPush, unsubscribeFromPush } from '@/lib/push';
import { I } from '@/components/icons';
import { TopAppBar } from '@/components/ui/TopAppBar';
import { SectionHead, FieldLabel } from '@/components/ui/Primitives';
import { Crest } from '@/components/ui/Crest';
import { MatchTile } from '@/components/ui/MatchTile';
import { Select } from '@/components/ui/Select';


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
export { SavedScreen } from './LibraryScreens';

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
            else if (r === 'failed') showToast('Não foi possível compartilhar. Tente novamente.', { variant: 'error' });
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
        const ok = await subscribeToPush();
        setPushOn(ok);
        if (!ok) showToast('Permissão de notificações indisponível. Confira as configurações do navegador.', { variant: 'warning' });
      }
    } catch { showToast('Não foi possível atualizar as notificações. Tente novamente.', { variant: 'error' }); } finally { setPushBusy(false); }
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
export { SubscriptionScreen } from './RegistrationScreen';

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
export { SearchScreen } from './SearchScreen';
