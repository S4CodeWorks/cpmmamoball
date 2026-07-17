'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useApp } from '@/contexts/AppContext';
import { I } from '@/components/icons';
import { FieldLabel } from '@/components/ui/Primitives';

// ── Turnstile (Cloudflare CAPTCHA) ────────────────────────────────────────────

declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, opts: object) => string;
      reset:  (id: string) => void;
      remove: (id: string) => void;
    };
    __cfTurnstileReady?: () => void;
  }
}

// Singleton: carrega o script uma única vez por página
let _tsStatus: 'idle' | 'loading' | 'ready' = 'idle';
const _tsCbs: Array<() => void> = [];

function loadTurnstile(cb: () => void) {
  if (_tsStatus === 'ready')   { cb(); return; }
  _tsCbs.push(cb);
  if (_tsStatus === 'loading') return;
  _tsStatus = 'loading';
  window.__cfTurnstileReady = () => {
    _tsStatus = 'ready';
    _tsCbs.splice(0).forEach(f => f());
  };
  const s = document.createElement('script');
  s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?onload=__cfTurnstileReady&render=explicit';
  s.async = true;
  document.head.appendChild(s);
}

function useTurnstile() {
  const divRef  = useRef<HTMLDivElement>(null);
  const widRef  = useRef<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const sitekey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? '';
  const { resolvedTheme } = useApp();

  useEffect(() => {
    if (!sitekey || typeof window === 'undefined') return;

    // Se o widget já existe, recria com o tema correto
    if (widRef.current) {
      window.turnstile?.remove(widRef.current);
      widRef.current = null;
      setToken(null);
    }

    loadTurnstile(() => {
      if (!divRef.current) return;
      widRef.current = window.turnstile!.render(divRef.current, {
        sitekey,
        theme: resolvedTheme, // 'light' | 'dark' — acompanha o tema do app
        callback:           (t: string) => setToken(t),
        'expired-callback': ()          => setToken(null),
        'error-callback':   ()          => setToken(null),
      });
    });

    return () => {
      if (widRef.current) { window.turnstile?.remove(widRef.current); widRef.current = null; }
    };
  }, [sitekey, resolvedTheme]); // recria quando o tema muda

  const reset = () => {
    setToken(null);
    if (widRef.current) window.turnstile?.reset(widRef.current);
  };

  return { divRef, token, reset };
}

interface Props { onSuccess?: () => void; }

// ── Helpers ───────────────────────────────────────────────────────────────────

// Traduz erros técnicos do Supabase em mensagens úteis para o usuário
function parseAuthError(raw: string): { title: string; hint?: string } {
  const msg = raw.toLowerCase();

  if (msg.includes('invalid login') || msg.includes('invalid credentials'))
    return {
      title: 'E-mail ou senha incorretos.',
      hint: 'Verifique se digitou tudo certo ou use "Esqueci minha senha" para redefinir.',
    };
  if (msg.includes('email not confirmed'))
    return {
      title: 'E-mail ainda não confirmado.',
      hint: 'Verifique sua caixa de entrada (e a pasta de spam) e clique no link que enviamos.',
    };
  if (msg.includes('too many') || msg.includes('rate limit') || msg.includes('429'))
    return {
      title: 'Muitas tentativas.',
      hint: 'Por segurança, aguarde alguns minutos antes de tentar novamente.',
    };
  if (msg.includes('user not found') || msg.includes('not found'))
    return {
      title: 'Nenhuma conta com esse e-mail.',
      hint: 'Verifique o e-mail digitado ou crie uma conta nova.',
    };
  if (msg.includes('password') && msg.includes('short'))
    return {
      title: 'Senha muito curta.',
      hint: 'A senha precisa ter pelo menos 8 caracteres.',
    };
  if (msg.includes('already registered') || msg.includes('already exists'))
    return {
      title: 'Este e-mail já tem uma conta.',
      hint: 'Tente entrar diretamente ou use "Esqueci minha senha".',
    };
  if (msg.includes('network') || msg.includes('fetch'))
    return {
      title: 'Sem conexão com o servidor.',
      hint: 'Verifique sua internet e tente novamente.',
    };

  // Fallback genérico
  return { title: raw.length < 80 ? raw : 'Ocorreu um erro. Tente novamente.' };
}

function ErrorBanner({ msg }: { msg: string }) {
  const { title, hint } = parseAuthError(msg);
  return (
    <div style={{
      borderRadius: 'var(--r-md)',
      background: 'color-mix(in srgb, var(--error) 12%, transparent)',
      border: '1px solid color-mix(in srgb, var(--error) 30%, transparent)',
      overflow: 'hidden',
    }}>
      {/* Linha de título */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '12px 14px', paddingBottom: hint ? 6 : 12 }}>
        <span style={{ fontSize: 15, lineHeight: 1, marginTop: 1, flexShrink: 0 }}>⚠️</span>
        <span style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--error)', lineHeight: 1.4 }}>{title}</span>
      </div>
      {/* Dica adicional */}
      {hint && (
        <div style={{ padding: '0 14px 12px 39px', fontSize: 12.5, color: 'var(--on-surface-variant)', lineHeight: 1.5 }}>
          {hint}
        </div>
      )}
    </div>
  );
}

function PasswordInput({ value, onChange, placeholder = '••••••••', autoComplete = 'new-password' }: {
  value: string; onChange: (v: string) => void; placeholder?: string; autoComplete?: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <div style={{ position: 'relative' }}>
      <input
        className="input"
        type={show ? 'text' : 'password'}
        autoComplete={autoComplete}
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{ paddingRight: 48 }}
      />
      <button
        type="button"
        onClick={() => setShow(v => !v)}
        style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--on-surface-variant)', width: 22, height: 22 }}
      >
        {show ? I.eyeOff : I.eye}
      </button>
    </div>
  );
}

// Hook de countdown — reinicia quando `key` muda
function useCountdown(active: boolean, key: number) {
  const [secs, setSecs] = useState(0);
  useEffect(() => {
    if (!active) return;
    let s = 60;
    setSecs(s);
    const id = setInterval(() => {
      s -= 1;
      setSecs(s);
      if (s <= 0) clearInterval(id);
    }, 1000);
    return () => clearInterval(id);
  }, [active, key]);
  return secs;
}

function fmt(s: number) {
  return `0:${String(s).padStart(2, '0')}`;
}

function ResendHint({ onResend, resendCount, inCodeStep }: {
  onResend: () => void; resendCount: number; inCodeStep: boolean;
}) {
  const [timerKey, setTimerKey] = useState(0);
  const secs = useCountdown(inCodeStep, timerKey);

  const handleResend = () => {
    onResend();
    setTimerKey(k => k + 1); // reinicia o timer
  };

  if (!inCodeStep) return null;
  if (secs > 0) return (
    <div style={{ fontSize: 12.5, color: 'var(--on-surface-variant)', textAlign: 'center', marginTop: 2 }}>
      Reenviar código em <span className="mono" style={{ fontWeight: 600 }}>{fmt(secs)}</span>
    </div>
  );
  if (resendCount === 0) return (
    <div style={{ fontSize: 12.5, textAlign: 'center', marginTop: 2 }}>
      <span style={{ color: 'var(--on-surface-variant)' }}>Não recebeu? </span>
      <button onClick={handleResend} style={{ color: 'var(--primary)', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer', fontSize: 'inherit' }}>
        Reenviar código
      </button>
    </div>
  );
  return (
    <div style={{ fontSize: 12, color: 'var(--on-surface-variant)', textAlign: 'center', marginTop: 2 }}>
      Limite de reenvios atingido. Verifique também o spam.
    </div>
  );
}

function StepBar({ total, current }: { total: number; current: number }) {
  return (
    <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
      {Array.from({ length: total }, (_, i) => (
        <div key={i} style={{
          flex: 1, height: 3, borderRadius: 99,
          background: i < current ? 'var(--primary)' : 'var(--outline-variant)',
          transition: 'background 0.3s',
        }} />
      ))}
    </div>
  );
}

// ── RegisterScreen ─────────────────────────────────────────────────────────────

type RegStep = 'form' | 'code' | 'pass';
const REG_STEP_IDX: Record<RegStep, number> = { form: 1, code: 2, pass: 3 };

function RegisterScreen({ onSuccess }: Props) {
  const [step,        setStep]        = useState<RegStep>('form');
  const [nick,        setNick]        = useState('');
  const [email,       setEmail]       = useState('');
  const [code,        setCode]        = useState('');
  const [pass,        setPass]        = useState('');
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState<string | null>(null);
  const [resendCount, setResendCount] = useState(0);
  const { divRef: tsRef, token: captchaToken, reset: resetCaptcha } = useTurnstile();

  // Rastreia se o cadastro foi concluído para o cleanup
  const doneRef = useRef(false);
  const stepRef = useRef<RegStep>('form');
  useEffect(() => { stepRef.current = step; }, [step]);

  // Se o usuário sair na etapa de senha (OTP verificado mas sem senha), faz logout
  useEffect(() => {
    return () => {
      if (stepRef.current === 'pass' && !doneRef.current) {
        supabase.auth.signOut();
      }
    };
  }, []);

  const doSendOtp = async () => {
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { shouldCreateUser: true, captchaToken: captchaToken ?? undefined },
    });
    if (error) throw error;
    resetCaptcha(); // token consumido, reseta para próximo uso (reenvio)
  };

  const sendCode = async () => {
    setError(null);
    if (!nick.trim())  { setError('Insira seu nick.'); return; }
    if (!email.trim()) { setError('Insira seu e-mail.'); return; }
    setLoading(true);
    try {
      await doSendOtp();
      setStep('code');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao enviar código.');
    } finally { setLoading(false); }
  };

  const resendCode = async () => {
    if (resendCount >= 1) return;
    setError(null);
    setLoading(true);
    try {
      await doSendOtp();
      setResendCount(c => c + 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao reenviar.');
    } finally { setLoading(false); }
  };

  const verifyCode = async () => {
    setError(null);
    if (code.length < 8) { setError('Digite o código de 8 dígitos.'); return; }
    setLoading(true);
    try {
      const { error } = await supabase.auth.verifyOtp({
        email: email.trim(), token: code.trim(), type: 'email',
      });
      if (error) throw error;
      setStep('pass');
    } catch {
      setError('Código inválido ou expirado. Tente de novo.');
    } finally { setLoading(false); }
  };

  const createAccount = async () => {
    setError(null);
    if (pass.length < 8) { setError('Senha mínima de 8 caracteres.'); return; }
    setLoading(true);
    try {
      const { error: updErr } = await supabase.auth.updateUser({
        password: pass,
        data: { nick: nick.trim() },
      });
      if (updErr) throw updErr;
      // Atualiza tabela profiles (criada pelo trigger sem nick)
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('profiles').update({ nick: nick.trim() }).eq('id', user.id);
      }
      doneRef.current = true; // cadastro concluído — não fazer logout no cleanup
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar conta.');
    } finally { setLoading(false); }
  };

  const stepIdx = REG_STEP_IDX[step];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px 24px 24px', background: 'var(--surface)' }}>
      <img src="/logo-cfm.png" alt="CPM" style={{ width: 100, height: 100, objectFit: 'contain', marginBottom: 8 }} />
      <h1 style={{ margin: '0 0 4px', fontSize: 22, fontWeight: 800, letterSpacing: '-0.02em' }}>Criar conta</h1>
      <p style={{ margin: '0 0 28px', fontSize: 13.5, color: 'var(--on-surface-variant)' }}>Confederação MamoBall · CPM</p>

      <div style={{ width: '100%', maxWidth: 380, display: 'flex', flexDirection: 'column', gap: 14 }}>
        <StepBar total={3} current={stepIdx} />
        {error && <ErrorBanner msg={error} />}

        {/* Nick */}
        <div>
          <FieldLabel required>Nick no jogo</FieldLabel>
          <input
            className="input"
            placeholder="ex: NickJogador"
            value={nick}
            onChange={e => setNick(e.target.value)}
            disabled={step !== 'form'}
            style={{ opacity: step !== 'form' ? 0.55 : 1 }}
          />
          <div className="field-helper">Como você aparece nos placares e no perfil.</div>
        </div>

        {/* Email + botão enviar */}
        <div>
          <FieldLabel required>E-mail</FieldLabel>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              className="input"
              type="email"
              autoComplete="email"
              placeholder="seu@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              disabled={step !== 'form'}
              onKeyDown={e => e.key === 'Enter' && step === 'form' && sendCode()}
              style={{ flex: 1, opacity: step !== 'form' ? 0.55 : 1 }}
            />
            {step === 'form' && (
              <button
                onClick={sendCode}
                disabled={loading || !captchaToken}
                className="btn btn-primary"
                style={{ height: 48, padding: '0 14px', fontSize: 13, fontWeight: 600, flexShrink: 0, opacity: (loading || !captchaToken) ? 0.7 : 1 }}
              >
                {loading ? '…' : !captchaToken ? '…' : 'Enviar código'}
              </button>
            )}
          </div>
        </div>

        {/* Widget Turnstile — visível apenas no step inicial */}
        {step === 'form' && <div ref={tsRef} style={{ display: 'flex', justifyContent: 'center' }} />}

        {/* Código — aparece após envio */}
        {step !== 'form' && (
          <div>
            <FieldLabel required>Código de verificação</FieldLabel>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                className="input mono"
                placeholder="00000000"
                inputMode="numeric"
                maxLength={8}
                value={code}
                onChange={e => setCode(e.target.value.replace(/\D/g, ''))}
                disabled={step !== 'code'}
                onKeyDown={e => e.key === 'Enter' && step === 'code' && verifyCode()}
                style={{
                  flex: 1, letterSpacing: '0.35em', fontSize: 22, textAlign: 'center',
                  opacity: step !== 'code' ? 0.55 : 1,
                }}
              />
              {step === 'code' && (
                <button
                  onClick={verifyCode}
                  disabled={loading || code.length < 8}
                  className="btn btn-primary"
                  style={{ height: 48, padding: '0 14px', fontSize: 13, fontWeight: 600, flexShrink: 0 }}
                >
                  {loading ? '…' : 'Verificar'}
                </button>
              )}
            </div>
            {step === 'code' && (
              <div className="field-helper">Verifique sua caixa de entrada (e o spam).</div>
            )}
            <ResendHint
              onResend={resendCode}
              resendCount={resendCount}
              inCodeStep={step === 'code'}
            />
          </div>
        )}

        {/* Senha — desbloqueia após código verificado */}
        {step === 'pass' && (
          <>
            <div>
              <FieldLabel required>Crie sua senha</FieldLabel>
              <PasswordInput value={pass} onChange={setPass} placeholder="mínimo 8 caracteres" />
              <div className="field-helper">Mínimo de 8 caracteres.</div>
            </div>
            <button
              onClick={createAccount}
              disabled={loading}
              className="btn btn-primary"
              style={{ height: 52, fontSize: 15, fontWeight: 700, marginTop: 4, opacity: loading ? 0.7 : 1 }}
            >
              {loading ? 'Criando conta…' : 'Criar conta'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// ── ForgotScreen ──────────────────────────────────────────────────────────────

type ForgotStep = 'email' | 'code' | 'newpass';
const FORGOT_STEP_IDX: Record<ForgotStep, number> = { email: 1, code: 2, newpass: 3 };

function ForgotScreen({ onBack, onSuccess }: { onBack: () => void; onSuccess?: () => void }) {
  const [step,        setStep]        = useState<ForgotStep>('email');
  const [email,       setEmail]       = useState('');
  const [code,        setCode]        = useState('');
  const [pass,        setPass]        = useState('');
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState<string | null>(null);
  const [resendCount, setResendCount] = useState(0);
  const { divRef: tsRef, token: captchaToken, reset: resetCaptcha } = useTurnstile();

  const doSendOtp = async () => {
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { shouldCreateUser: false, captchaToken: captchaToken ?? undefined },
    });
    if (error) throw error;
    resetCaptcha();
  };

  const resendCode = async () => {
    if (resendCount >= 1) return;
    setError(null);
    setLoading(true);
    try {
      await doSendOtp();
      setResendCount(c => c + 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao reenviar.');
    } finally { setLoading(false); }
  };

  const sendCode = async () => {
    setError(null);
    if (!email.trim()) { setError('Insira seu e-mail.'); return; }
    setLoading(true);
    try {
      await doSendOtp();
    } catch {
      // Intencionalmente silencioso: não revelamos se o e-mail existe ou não
      // (prevenção de enumeração de usuários)
    } finally {
      // Avança sempre — o usuário verá "código enviado" independentemente
      setStep('code');
      setLoading(false);
    }
  };

  const verifyCode = async () => {
    setError(null);
    if (code.length < 8) { setError('Digite o código de 8 dígitos.'); return; }
    setLoading(true);
    try {
      const { error } = await supabase.auth.verifyOtp({
        email: email.trim(), token: code.trim(), type: 'email',
      });
      if (error) throw error;
      setStep('newpass');
    } catch {
      setError('Código inválido ou expirado.');
    } finally { setLoading(false); }
  };

  const savePassword = async () => {
    setError(null);
    if (pass.length < 8) { setError('Senha mínima de 8 caracteres.'); return; }
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: pass });
      if (error) throw error;
      // Sessão já está ativa após o OTP — fecha o fluxo
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar senha.');
    } finally { setLoading(false); }
  };

  const stepIdx = FORGOT_STEP_IDX[step];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px 24px 24px', background: 'var(--surface)' }}>
      <img src="/logo-cfm.png" alt="CPM" style={{ width: 100, height: 100, objectFit: 'contain', marginBottom: 8 }} />
      <h1 style={{ margin: '0 0 4px', fontSize: 22, fontWeight: 800, letterSpacing: '-0.02em' }}>Redefinir senha</h1>
      <p style={{ margin: '0 0 28px', fontSize: 13.5, color: 'var(--on-surface-variant)' }}>
        {step === 'email'   ? 'Enviamos um código pro seu e-mail cadastrado.' :
         step === 'code'    ? 'Digite o código que chegou no seu e-mail.' :
                              'Escolha uma nova senha para sua conta.'}
      </p>

      <div style={{ width: '100%', maxWidth: 380, display: 'flex', flexDirection: 'column', gap: 14 }}>
        <StepBar total={3} current={stepIdx} />
        {error && <ErrorBanner msg={error} />}

        {/* Email */}
        <div>
          <FieldLabel required>E-mail da conta</FieldLabel>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              className="input"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              disabled={step !== 'email'}
              onKeyDown={e => e.key === 'Enter' && step === 'email' && sendCode()}
              style={{ flex: 1, opacity: step !== 'email' ? 0.55 : 1 }}
            />
            {step === 'email' && (
              <button onClick={sendCode} disabled={loading || !captchaToken} className="btn btn-primary" style={{ height: 48, padding: '0 14px', fontSize: 13, fontWeight: 600, flexShrink: 0, opacity: (loading || !captchaToken) ? 0.7 : 1 }}>
                {loading ? '…' : !captchaToken ? '…' : 'Enviar código'}
              </button>
            )}
          </div>
        </div>

        {/* Widget Turnstile */}
        {step === 'email' && <div ref={tsRef} style={{ display: 'flex', justifyContent: 'center' }} />}

        {/* Código */}
        {step !== 'email' && (
          <div>
            <FieldLabel required>Código de verificação</FieldLabel>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                className="input mono"
                placeholder="00000000"
                inputMode="numeric"
                maxLength={8}
                value={code}
                onChange={e => setCode(e.target.value.replace(/\D/g, ''))}
                disabled={step !== 'code'}
                onKeyDown={e => e.key === 'Enter' && step === 'code' && verifyCode()}
                style={{
                  flex: 1, letterSpacing: '0.35em', fontSize: 22, textAlign: 'center',
                  opacity: step !== 'code' ? 0.55 : 1,
                }}
              />
              {step === 'code' && (
                <button onClick={verifyCode} disabled={loading || code.length < 8} className="btn btn-primary" style={{ height: 48, padding: '0 14px', fontSize: 13, fontWeight: 600, flexShrink: 0 }}>
                  {loading ? '…' : 'Verificar'}
                </button>
              )}
            </div>
            <ResendHint
              onResend={resendCode}
              resendCount={resendCount}
              inCodeStep={step === 'code'}
            />
          </div>
        )}

        {/* Nova senha */}
        {step === 'newpass' && (
          <>
            <div>
              <FieldLabel required>Nova senha</FieldLabel>
              <PasswordInput value={pass} onChange={setPass} placeholder="mínimo 8 caracteres" />
              <div className="field-helper">Mínimo de 8 caracteres.</div>
            </div>
            <button onClick={savePassword} disabled={loading} className="btn btn-primary" style={{ height: 52, fontSize: 15, fontWeight: 700, opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Salvando…' : 'Salvar nova senha'}
            </button>
          </>
        )}

        {/* Voltar */}
        <button
          onClick={onBack}
          style={{ fontSize: 13, color: 'var(--on-surface-variant)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}
        >
          <span style={{ width: 14, height: 14 }}>{I.chevL}</span>
          Voltar ao login
        </button>
      </div>
    </div>
  );
}

// ── LoginScreen ────────────────────────────────────────────────────────────────

function LoginScreen({ onSuccess, onGoRegister, onGoForgot }: Props & { onGoRegister: () => void; onGoForgot: () => void }) {
  const { signIn } = useAuth();
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState<string | null>(null);
  const { divRef: tsRef, token: captchaToken, reset: resetCaptcha } = useTurnstile();

  const handleLogin = async () => {
    setError(null);
    if (!email.trim() || !password) { setError('Preencha e-mail e senha.'); return; }
    if (!captchaToken) { setError('Verificação de segurança pendente. Aguarde um instante.'); return; }
    setLoading(true);
    try {
      await signIn(email.trim(), password, captchaToken);
      onSuccess?.();
    } catch (err) {
      resetCaptcha();
      setError(err instanceof Error ? err.message : 'Erro ao entrar.');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px 24px 24px', background: 'var(--surface)' }}>
      <img src="/logo-cfm.png" alt="CPM" style={{ width: 120, height: 120, objectFit: 'contain', marginBottom: 8 }} />
      <h1 style={{ margin: '0 0 4px', fontSize: 22, fontWeight: 800, letterSpacing: '-0.02em' }}>Entrar na conta</h1>
      <p style={{ margin: '0 0 32px', fontSize: 13.5, color: 'var(--on-surface-variant)' }}>Confederação MamoBall · CPM</p>

      <div style={{ width: '100%', maxWidth: 380, display: 'flex', flexDirection: 'column', gap: 14 }}>
        {error && <ErrorBanner msg={error} />}

        <div>
          <FieldLabel required>E-mail</FieldLabel>
          <input
            className="input"
            type="email"
            autoComplete="email"
            placeholder="seu@email.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
          />
        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <FieldLabel required style={{ margin: 0 }}>Senha</FieldLabel>
            <button
              type="button"
              onClick={onGoForgot}
              style={{ fontSize: 12.5, color: 'var(--primary)', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}
            >
              Esqueci minha senha
            </button>
          </div>
          <PasswordInput value={password} onChange={setPassword} placeholder="••••••••" autoComplete="current-password" />
        </div>

        {/* Widget Turnstile — some suavemente após verificar */}
        <div style={{ overflow: 'hidden', maxHeight: captchaToken ? 0 : 200, transition: 'max-height 0.35s ease' }}>
          <div ref={tsRef} style={{ display: 'flex', justifyContent: 'center', padding: '4px 0' }} />
        </div>

        <button
          onClick={handleLogin}
          disabled={loading || !captchaToken}
          className="btn btn-primary"
          style={{ height: 52, fontSize: 15, fontWeight: 700, marginTop: 4, opacity: (loading || !captchaToken) ? 0.7 : 1 }}
        >
          {loading ? 'Entrando…' : !captchaToken ? 'Verificando segurança…' : 'Entrar'}
        </button>
      </div>
    </div>
  );
}

// ── AuthGate — combina todos os modos ─────────────────────────────────────────

type AuthMode = 'login' | 'register' | 'forgot';

export function AuthGate({ onSuccess }: Props) {
  const [mode, setMode] = useState<AuthMode>('login');

  return (
    <div style={{ position: 'relative' }}>
      {mode === 'login'    && (
        <LoginScreen
          onSuccess={onSuccess}
          onGoRegister={() => setMode('register')}
          onGoForgot={() => setMode('forgot')}
        />
      )}
      {mode === 'register' && <RegisterScreen onSuccess={onSuccess} />}
      {mode === 'forgot'   && (
        <ForgotScreen
          onBack={() => setMode('login')}
          onSuccess={onSuccess}
        />
      )}

      {/* Link de alternância — inline, sem fundo, sem fixed */}
      {(mode === 'login' || mode === 'register') && (
        <div style={{ textAlign: 'center', fontSize: 13.5, color: 'var(--on-surface-variant)', marginTop: 8 }}>
          {mode === 'login' ? (
            <>
              Ainda não tem conta?{' '}
              <button onClick={() => setMode('register')} style={{ color: 'var(--primary)', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer', fontSize: 'inherit' }}>
                Criar conta
              </button>
            </>
          ) : (
            <>
              Já tem conta?{' '}
              <button onClick={() => setMode('login')} style={{ color: 'var(--primary)', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer', fontSize: 'inherit' }}>
                Entrar
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
