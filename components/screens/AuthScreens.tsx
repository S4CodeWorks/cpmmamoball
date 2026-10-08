'use client';

import { useEffect, useId, useRef, useState, type FormEvent, type ReactNode } from 'react';
import Image from 'next/image';
import { motion, useReducedMotion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useApp } from '@/contexts/AppContext';
import { CpmIcon, type CpmIconName } from '@/components/ui/CpmUi';

declare global {
 interface Window { turnstile?: { render:(el:HTMLElement,opts:object)=>string;reset:(id:string)=>void;remove:(id:string)=>void }; __cfTurnstileReady?:()=>void }
}
let scriptPromise: Promise<void> | null = null;
function loadTurnstile() {
 if (window.turnstile) return Promise.resolve();
 if (!scriptPromise) scriptPromise = new Promise<void>((resolve,reject)=>{
  window.__cfTurnstileReady=resolve;
  const s=document.createElement('script');s.src='https://challenges.cloudflare.com/turnstile/v0/api.js?onload=__cfTurnstileReady&render=explicit';s.async=true;
  s.onerror=()=>{scriptPromise=null;s.remove();reject(new Error('security provider'));};document.head.appendChild(s);
 });
 return scriptPromise;
}
function useTurnstile() {
 const divRef=useRef<HTMLDivElement>(null),widRef=useRef<string|null>(null);
 const [token,setToken]=useState<string|null>(null),[failed,setFailed]=useState(false),[attempt,setAttempt]=useState(0);
 const sitekey=process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY??'';const {resolvedTheme}=useApp();
 useEffect(()=>{
  if (!sitekey) return;
  let alive=true;Promise.resolve().then(()=>{if(alive){setToken(null);setFailed(false);}});
  const timer=setTimeout(()=>{if(alive)setFailed(true);},15000);
  loadTurnstile().then(()=>{
   if(!alive||!divRef.current||!window.turnstile)return;
   widRef.current=window.turnstile.render(divRef.current,{sitekey,theme:resolvedTheme,size:'flexible',appearance:'interaction-only',callback:(t:string)=>{if(alive){setToken(t);setFailed(false);clearTimeout(timer);}},'expired-callback':()=>{if(alive)setToken(null);},'error-callback':()=>{if(alive){setToken(null);setFailed(true);}}});
  }).catch(()=>{if(alive)setFailed(true);});
  return()=>{alive=false;clearTimeout(timer);if(widRef.current){window.turnstile?.remove(widRef.current);widRef.current=null;}};
 },[sitekey,resolvedTheme,attempt]);
 return {divRef,token,ready:!sitekey||!!token,failed,retry:()=>setAttempt(a=>a+1),reset:()=>{if(sitekey){setToken(null);if(widRef.current)window.turnstile?.reset(widRef.current);}}};
}
function authMessage(raw:string) {
 const s=raw.toLowerCase();
 if(s.includes('invalid login')||s.includes('invalid credentials'))return 'E-mail ou senha incorretos.';
 if(s.includes('email not confirmed'))return 'Confirme seu e-mail para entrar.';
 if(s.includes('already registered')||s.includes('already exists'))return 'Este e-mail já tem uma conta.';
 if(s.includes('captcha'))return 'Confirme a verificação de segurança.';
 if(s.includes('rate limit')||s.includes('too many')||s.includes('429'))return 'Muitas tentativas. Aguarde e tente novamente.';
 if(s.includes('fetch')||s.includes('network'))return 'Sem conexão. Tente novamente.';
 if(s.includes('password')&&s.includes('short'))return 'Use pelo menos 8 caracteres.';
 return raw.length<100?raw:'Não foi possível continuar. Tente novamente.';
}
function Feedback({children}:{children:ReactNode}){return <div className="cpm-auth-feedback" role="alert"><CpmIcon name="authAlert"/><span>{children}</span></div>;}
function AuthField({label,icon,value,onChange,password=false,autoComplete,placeholder,error,disabled=false}:{label:string;icon:CpmIconName;value:string;onChange:(v:string)=>void;password?:boolean;autoComplete?:string;placeholder:string;error?:string|null;disabled?:boolean}){
 const id=useId(),[visible,setVisible]=useState(false);
 return <div className="cpm-auth-field"><label htmlFor={id}>{label}</label><div className="cpm-auth-input"><span className="cpm-auth-input-icon"><CpmIcon name={icon}/></span><input id={id} type={password?(visible?'text':'password'):icon==='authMail'?'email':'text'} value={value} autoComplete={autoComplete} placeholder={placeholder} onChange={e=>onChange(e.target.value)} disabled={disabled} required aria-invalid={!!error} aria-describedby={error?id+'-error':undefined}/>{password&&<button type="button" className="cpm-auth-eye" aria-label={visible?'Ocultar senha':'Mostrar senha'} aria-pressed={visible} onClick={()=>setVisible(v=>!v)}><CpmIcon name={visible?'authEyeOff':'authEye'}/></button>}</div>{error&&<span id={id+'-error'} className="cpm-auth-field-error"><CpmIcon name="authAlert"/>{error}</span>}</div>;
}
function OtpInput({value,onChange}:{value:string;onChange:(v:string)=>void}){
 const id=useId();return <div className="cpm-auth-field"><label htmlFor={id}>Código de 8 dígitos</label><div className="cpm-auth-otp"><input id={id} name="code" type="text" inputMode="numeric" pattern="[0-9]{8}" autoComplete="one-time-code" maxLength={8} onPaste={event=>{event.preventDefault();onChange(event.clipboardData.getData('text').replace(/\D/g,'').slice(0,8));}} aria-label="Código de 8 dígitos" value={value} onChange={e=>onChange(e.target.value.replace(/\D/g,'').slice(0,8))}/><div className="cpm-auth-otp-slots" aria-hidden="true">{Array.from({length:8},(_,i)=><span key={i}>{value[i]||'0'}</span>)}</div></div></div>;
}
function Steps({stage,recovery}:{stage:number;recovery:boolean}){
 const labels=recovery?['E-mail','Código','Senha']:['Dados','Código','Senha'];return <ol className="cpm-auth-steps" aria-label="Etapas">{labels.map((label,i)=><li key={label} aria-current={i===stage?'step':undefined} className={i===stage?'is-current':''}><CpmIcon name={i<stage?'authCheck':i===2?'authLock':i===1||recovery?'authMail':'user'}/><span>{label}</span></li>)}</ol>;
}
function Secondary({children,onClick,recovery=false}:{children:ReactNode;onClick:()=>void;recovery?:boolean}){return <button type="button" className="cpm-auth-secondary" onClick={onClick}><span><CpmIcon name={recovery?'authLogin':'user'}/></span>{children}</button>;}

type AuthMode='login'|'register'|'forgot';
interface Props {onSuccess?:()=>void;onBack?:()=>void;onNav?:(page:string)=>void;initialMode?:AuthMode}
export function AuthGate({onSuccess,onBack,onNav,initialMode='login'}:Props){
 const {signIn,updateNick}=useAuth(),reduced=useReducedMotion();
 const {divRef:securityRef,token:securityToken,ready:securityReady,failed:securityFailed,retry:securityRetry,reset:securityReset}=useTurnstile();
 const [mode,setMode]=useState<AuthMode>(initialMode),[stage,setStage]=useState(0),[email,setEmail]=useState(''),[nick,setNick]=useState(''),[password,setPassword]=useState(''),[code,setCode]=useState('');
 const [busy,setBusy]=useState(false),[error,setError]=useState<string|null>(null),[fieldError,setFieldError]=useState<string|null>(null),[resends,setResends]=useState(0),[resendAt,setResendAt]=useState(0),[seconds,setSeconds]=useState(0);
 const done=useRef(false),stageRef=useRef({mode,stage}),request=useRef(false),alive=useRef(true),titleRef=useRef<HTMLHeadingElement>(null),formRef=useRef<HTMLFormElement>(null);
 useEffect(()=>{stageRef.current={mode,stage};},[mode,stage]);
 useEffect(()=>{alive.current=true;return()=>{alive.current=false;const s=stageRef.current;if(s.mode==='register'&&s.stage===2&&!done.current)void supabase.auth.signOut();};},[]);
 useEffect(()=>{if(!resendAt)return;const update=()=>setSeconds(Math.max(0,Math.ceil((resendAt-Date.now())/1000)));update();const id=setInterval(update,500);return()=>clearInterval(id);},[resendAt]);
 const advance=(next:number)=>{setStage(next);requestAnimationFrame(()=>formRef.current?.querySelector<HTMLInputElement>(next===1?'input[name="code"]':'input[autocomplete="new-password"]')?.focus());};
 const changeMode=(next:AuthMode)=>{if(busy)return;if(mode==='register'&&stage===2&&!done.current)void supabase.auth.signOut();setMode(next);setStage(0);setPassword('');setCode('');setError(null);setFieldError(null);setResends(0);setResendAt(0);requestAnimationFrame(()=>titleRef.current?.focus());};
 const title=mode==='login'?'Entrar':mode==='register'?'Criar conta':'Redefinir senha';
 const returnLogin=()=>changeMode('login');
 const action=mode==='login'?'Entrar':stage===0?'Enviar código':stage===1?'Verificar código':mode==='register'?'Criar conta':'Salvar nova senha';
 const loadingText=mode==='login'?'Entrando…':stage===0?'Enviando código…':stage===1?'Verificando código…':mode==='register'?'Criando conta…':'Salvando senha…';
 const needSecurity=mode==='login'||stage===0;
 const run=async(task:()=>Promise<void>)=>{
  if(request.current)return;request.current=true;setBusy(true);setError(null);setFieldError(null);
  try{await task();}catch(err){if(alive.current){securityReset();setError(authMessage(err instanceof Error?err.message:'Não foi possível continuar. Tente novamente.'));}}finally{request.current=false;if(alive.current)setBusy(false);}
 };
 const sendOtp=async()=>{
  const {error}=await supabase.auth.signInWithOtp({email:email.trim(),options:{shouldCreateUser:mode==='register',captchaToken:securityToken??undefined,...(mode==='register'?{data:{nick:nick.trim()}}:{})}});
  securityReset();if(error)throw error;
 };
 const submit=(event:FormEvent)=>{
  event.preventDefault();if(busy)return;
  if(needSecurity&&!securityReady)return;
  if((mode==='login'||stage===0)&&(!email.trim()||!/^\S+@\S+\.\S+$/.test(email.trim()))){setFieldError('Confira o e-mail.');return;}
  if(mode==='register'&&stage===0&&!nick.trim()){setError('Insira seu nick.');return;}
  if(stage===2&&password.length<8){setError('Use pelo menos 8 caracteres.');return;}
  void run(async()=>{
   if(mode==='login'){await signIn(email.trim(),password,securityToken??undefined);done.current=true;onSuccess?.();return;}
   if(stage===0){if(mode==='register')await sendOtp();else{try{await sendOtp();}catch(err){const message=err instanceof Error?err.message:'';if(/captcha|rate limit|too many|fetch|network/i.test(message))throw err;/* Keep account existence private. */}}if(alive.current){setResendAt(Date.now()+60000);setCode('');advance(1);}return;}
   if(stage===1){if(code.length!==8)return;const {error}=await supabase.auth.verifyOtp({email:email.trim(),token:code,type:'email'});if(error)throw new Error('Código inválido ou expirado.');if(alive.current)advance(2);return;}
   const {error}=await supabase.auth.updateUser({password,...(mode==='register'?{data:{nick:nick.trim()}}:{})});if(error)throw error;
   if(mode==='register')await updateNick(nick.trim());done.current=true;onSuccess?.();
  });
 };
 const resend=()=>{if(seconds||resends||busy||!securityReady)return;void run(async()=>{await sendOtp();if(alive.current){setResends(1);setResendAt(Date.now()+60000);}});};
 const leave=()=>{if(busy)return;if(mode!=='login'){returnLogin();return;}onBack?.();};
 return <main className="cpm-auth" aria-label={title}>
  <div className="cpm-auth-scaffold">
   <aside className="cpm-auth-brand-panel"><button type="button" className="cpm-auth-return" onClick={mode==='forgot'?returnLogin:leave}><CpmIcon name="authBack"/>{mode==='forgot'?'Voltar ao login':'Voltar aos jogos'}</button><div className="cpm-auth-identity"><Image unoptimized src="/cpm-official.jpg" alt="Campeonato Paulista de MamoBall" width="192" height="192"/><p>CPM<br/>MamoBall</p></div><div className="cpm-auth-destinations"><button type="button" onClick={()=>onNav?.('saved')}><CpmIcon name="bookmark"/>Salvos</button><button type="button" onClick={()=>onNav?.('notices')}><CpmIcon name="authBell"/>Avisos</button></div></aside>
   <div className="cpm-auth-compact-header"><button type="button" className="cpm-auth-compact-brand" onClick={()=>onNav?.('home')} aria-label="CPM MamoBall — início"><Image unoptimized src="/cpm-official.jpg" alt="" width="72" height="72"/><span>CPM MamoBall</span></button><button type="button" className="cpm-auth-back" aria-label={mode==='login'?'Voltar aos jogos':'Voltar ao login'} onClick={leave}><CpmIcon name="authBack"/></button></div>
   <section className="cpm-auth-form-region"><motion.form ref={formRef} className="cpm-auth-form" onSubmit={submit} noValidate aria-busy={busy} initial={false} animate={{opacity:1}} transition={{duration:reduced?0:0.12}}>
    <div className="cpm-auth-title"><span><CpmIcon name={mode==='login'?'authLogin':mode==='register'?'user':'authLock'}/></span><h1 ref={titleRef} tabIndex={-1}>{title}</h1></div>
    {mode!=='login'&&<Steps stage={stage} recovery={mode==='forgot'}/>}
    {error&&<Feedback>{error}</Feedback>}
    <div className="cpm-auth-content">
     {mode==='login'||stage===0?<>
      {mode==='register'&&<AuthField label="Nick no jogo" icon="user" value={nick} onChange={setNick} autoComplete="nickname" placeholder="Seu nick" disabled={busy}/>}
      <AuthField label={mode==='forgot'?'E-mail da conta':'E-mail'} icon="authMail" value={email} onChange={v=>{setEmail(v);setFieldError(null);}} autoComplete="email" placeholder="seu@email.com" error={fieldError} disabled={busy}/>
      {mode==='login'&&<><AuthField label="Senha" icon="authLock" value={password} onChange={setPassword} password autoComplete="current-password" placeholder="Sua senha" disabled={busy}/><button type="button" className="cpm-auth-forgot" onClick={()=>changeMode('forgot')}>Esqueci minha senha</button></>}
     </>:<>
      <div className="cpm-auth-summary"><CpmIcon name={stage===2?'authCheck':'authMail'}/><div><span>{email.trim()}</span>{mode==='register'&&<small>Nick: {nick.trim()}</small>}</div></div>
      {stage===1?<OtpInput value={code} onChange={setCode}/>:<><AuthField label={mode==='register'?'Crie sua senha':'Nova senha'} icon="authLock" value={password} onChange={setPassword} password autoComplete="new-password" placeholder="Sua senha" disabled={busy}/><small className="cpm-auth-requirement"><CpmIcon name="authLock"/>Mínimo de 8 caracteres</small></>}
     </>}
    </div>
    <div className={'cpm-auth-security'+(needSecurity&&!securityReady||stage===1&&!securityReady&&seconds===0&&!resends?' is-pending':'')}>
     {!securityReady&&<div className="cpm-auth-security-status" role="status"><CpmIcon name="authShield"/><span>{securityFailed?'Verificação indisponível':'Verificação de segurança'}</span>{securityFailed&&<button type="button" onClick={securityRetry}>Tentar novamente</button>}</div>}
     <div ref={securityRef}/>
    </div>
    <button type="submit" className="cpm-button cpm-button-primary cpm-auth-primary" disabled={busy||needSecurity&&!securityReady||mode!=='login'&&stage===1&&code.length!==8}>{busy?loadingText:needSecurity&&!securityReady?'Verificando segurança…':action}</button>
    {mode!=='login'&&stage===1&&<div className="cpm-auth-resend">{seconds>0?<><CpmIcon name="authMail"/><span>Reenviar em 0:{String(Math.min(seconds,59)).padStart(2,'0')}</span></>:resends?<><CpmIcon name="authAlert"/><span>Reenvio usado · confira o spam</span></>:<button type="button" onClick={resend} disabled={busy||!securityReady}><CpmIcon name="authMail"/>Reenviar código</button>}</div>}
    <Secondary onClick={mode==='login'?()=>changeMode('register'):returnLogin} recovery={mode==='forgot'}>{mode==='login'?'Criar conta':mode==='forgot'?'Voltar ao login':'Entrar'}</Secondary>
   </motion.form></section>
  </div>
 </main>;
}
