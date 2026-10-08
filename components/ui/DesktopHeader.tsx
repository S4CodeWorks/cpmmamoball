'use client';
import { useApp } from '@/contexts/AppContext';
import { useAuth } from '@/contexts/AuthContext';
import { CpmIcon, CpmMenuItem, CpmPopover } from './CpmUi';
import type { Page } from '@/lib/types';
interface Props { page: Page; param: string|number|null; onTab:(id:string)=>void; onNav:(page:string,param?:string|number|null)=>void; }
const nav=[{id:'home',label:'Início'},{id:'jogos',label:'Jogos'},{id:'tournaments',label:'Classificação'},{id:'news',label:'Notícias'}];
export function DesktopHeader({page,onTab,onNav}:Props) {
 const {resolvedTheme,setTheme,showToast}=useApp();
 const {isLoggedIn,isStaff,profile,user,signOut}=useAuth();
 const nick=profile?.nick||user?.email?.split('@')[0]||'Minha conta';
 const active=page==='match'?'jogos':page==='club'?'tournaments':page==='article'?'news':page;
 const go=(target:string,close:()=>void)=>{close();onNav(target);};
 const links=(close:()=>void)=><>
  <div className="cpm-menu-links">
   <CpmMenuItem icon="ticket" onClick={()=>go('subscription',close)}>Inscrever time</CpmMenuItem>
   <CpmMenuItem icon="bookmark" onClick={()=>go('saved',close)}>Salvos</CpmMenuItem>
  <CpmMenuItem icon="authBell" onClick={()=>go('notices',close)}>Avisos</CpmMenuItem>
   <CpmMenuItem icon="rules" onClick={()=>go('rules',close)}>Regulamento</CpmMenuItem>
   <CpmMenuItem icon="support" onClick={()=>go('support',close)}>Suporte</CpmMenuItem>
   <CpmMenuItem icon="settings" onClick={()=>go('settings',close)}>Configurações</CpmMenuItem>
  </div>
  <div className="cpm-theme-footer"><button type="button" role="menuitem" onClick={()=>{setTheme(resolvedTheme==='dark'?'light':'dark');close();}}><CpmIcon name={resolvedTheme==='dark'?'sun':'moon'}/><span>{resolvedTheme==='dark'?'Tema claro':'Tema escuro'}</span></button></div>
 </>;
 const account=(close:()=>void)=><>
  <p className="cpm-account-name">{nick}</p>
  <CpmMenuItem icon="user" onClick={()=>go('profile',close)}>Meu perfil</CpmMenuItem>
  <CpmMenuItem icon="bookmark" onClick={()=>go('saved',close)}>Salvos</CpmMenuItem>
  <CpmMenuItem icon="authBell" onClick={()=>go('notices',close)}>Avisos</CpmMenuItem>
  <CpmMenuItem icon="settings" onClick={()=>go('settings',close)}>Configurações</CpmMenuItem>
  {isStaff&&<CpmMenuItem icon="settings" onClick={()=>go('admin',close)}>Painel staff</CpmMenuItem>}
  <CpmMenuItem icon="user" onClick={()=>{close();void signOut().then(()=>showToast('Até logo!'));}}>Sair da conta</CpmMenuItem>
 </>;
 return <header className="cpm-header">
  <a className="cpm-skip" href="#cpm-main">Pular para o conteúdo</a>
  <div className="cpm-header-inner">
   <button type="button" className="cpm-brand" aria-label="CPM MamoBall — início" onClick={()=>onTab('home')}>
    <img src="/cpm-official.jpg" alt="" width="72" height="72"/>
    <span className="cpm-brand-copy"><span className="cpm-brand-name">CPM MamoBall</span><span className="cpm-brand-league">Campeonato Paulista</span></span>
   </button>
   <nav className="cpm-desktop-nav" aria-label="Navegação principal">{nav.map(item=><button key={item.id} type="button" className={'cpm-nav-item'+(active===item.id?' is-active':'')} aria-current={active===item.id?'page':undefined} onClick={()=>onTab(item.id)}>{item.label}</button>)}<CpmPopover label="Mais opções" className="cpm-more" trigger={<><span>Mais</span><CpmIcon name="chevron"/></>}>{links}</CpmPopover></nav>
   <div className="cpm-header-actions">
    <button type="button" className="cpm-header-search" aria-label="Buscar" onClick={()=>onNav('search')}><CpmIcon name="search"/><span>Buscar</span></button>
    <div className="cpm-desktop-account">{isLoggedIn?<CpmPopover label="Menu da conta" className="cpm-account" trigger={<><CpmIcon name="user"/><span className="cpm-account-label">Minha conta</span><CpmIcon name="chevron"/></>}>{account}</CpmPopover>:<button type="button" className="cpm-button cpm-button-primary" onClick={()=>onNav('login')}>Entrar</button>}</div>
    <CpmPopover label="Abrir navegação" className="cpm-mobile-menu" trigger={<CpmIcon name="menu"/>}>{close=><>
     <div className="cpm-mobile-links">{nav.map(item=><button type="button" role="menuitem" key={item.id} aria-current={active===item.id?'page':undefined} onClick={()=>{close();onTab(item.id);}}>{item.label}</button>)}</div>
     {links(close)}<div className="cpm-mobile-account">{isLoggedIn?account(close):<CpmMenuItem icon="user" onClick={()=>go('login',close)}>Entrar na conta</CpmMenuItem>}</div>
    </>}</CpmPopover>
   </div>
  </div>
 </header>;
}
