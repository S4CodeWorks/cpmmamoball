'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import Image from 'next/image';
import { motion, useReducedMotion } from 'framer-motion';
import { useApp } from '@/contexts/AppContext';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { useLibrary } from '@/contexts/LibraryContext';
import { CpmIcon, type CpmIconName } from '@/components/ui/CpmUi';
import { Crest } from '@/components/ui/Crest';
import { fetchSavedResources } from '@/lib/db';
import type { Announcement } from '@/lib/announcements';

type Navigate = (page: string, param?: string | number | null) => void;
export type SavedFilter = 'Todos' | 'Competições' | 'Clubes' | 'Jogos' | 'Notícias';
export type NoticeFilter = 'Todos' | 'Não lidos';
const categories: {label: SavedFilter; prefix: string; icon: CpmIconName}[] = [
 {label:'Competições',prefix:'favcomp:',icon:'ticket'}, {label:'Clubes',prefix:'club:',icon:'searchShield'},
 {label:'Jogos',prefix:'match:',icon:'libraryBall'}, {label:'Notícias',prefix:'art:',icon:'searchNews'},
];
function Heading({title,icon,count,onBack}:{title:string;icon:CpmIconName;count?:number|null;onBack:()=>void}){
 return <div className="cpm-library-heading"><button type="button" className="cpm-library-back" aria-label="Voltar" onClick={onBack}><CpmIcon name="authBack"/></button><CpmIcon name={icon}/><h1>{title}</h1>{count!==undefined&&<span className="cpm-library-count">{count??'—'}</span>}</div>;
}
function Feedback({icon,title,description,action,onAction,busy=false}:{icon:CpmIconName;title:string;description?:string;action?:string;onAction?:()=>void;busy?:boolean}){
 return <div className="cpm-library-feedback" role={busy?'status':undefined} aria-busy={busy}><span className="cpm-library-feedback-icon"><CpmIcon name={icon}/></span><h2>{title}</h2>{description&&<p>{description}</p>}{action&&<button type="button" className="cpm-button cpm-button-primary" onClick={onAction}>{action}</button>}</div>;
}
function Filter({label,icon,count,selected,onClick}:{label:string;icon:CpmIconName;count:number|null;selected:boolean;onClick:()=>void}){
 return <button type="button" className={'cpm-library-filter'+(selected?' is-selected':'')} aria-pressed={selected} onClick={onClick}><CpmIcon name={icon}/><span>{label}</span><small>{count??'—'}</small></button>;
}
const emptyResources:Awaited<ReturnType<typeof fetchSavedResources>>={clubs:[],competitions:[],matches:[],news:[]};
export function SavedScreen({onBack,onNav,filter='Todos',onFilterChange}:{onBack:()=>void;onNav:Navigate;filter?:SavedFilter;onFilterChange?:(filter:SavedFilter)=>void}){
 const app=useApp(),{clubs:allClubs}=useData();
 const [localFilter,setLocalFilter]=useState<SavedFilter>(filter),[resources,setResources]=useState(emptyResources),[loading,setLoading]=useState(true),[error,setError]=useState(false),[version,setVersion]=useState(0),[removed,setRemoved]=useState<{key:string;label:string}|null>(null),[unavailable,setUnavailable]=useState(false);
 const selected=onFilterChange?filter:localFilter;
 const keys=[...app.favClubs].map(id=>'club:'+id).concat([...app.favComps].map(id=>'favcomp:'+id),[...app.bookmarks].filter(k=>k.startsWith('match:')||k.startsWith('art:'))).sort();
 const keyString=JSON.stringify(keys),known=useRef(new Set<string>()),owner=useAuth().user?.id;
 const reduced=useReducedMotion();
 useEffect(()=>{known.current.clear();setResources(emptyResources);},[owner]);
 useEffect(()=>{
  if(app.savedLoading||app.savedError)return;
  const ids=JSON.parse(keyString) as string[],controller=new AbortController(),timer=setTimeout(()=>controller.abort(),12000);let active=true;
  if(ids.some(id=>!known.current.has(id)))setLoading(true);setError(false);
  fetchSavedResources(ids,controller.signal).then(data=>{if(active){setResources(data);known.current=new Set(ids);setLoading(false);}}).catch(()=>{if(active){setError(true);setLoading(false);}}).finally(()=>clearTimeout(timer));
  return()=>{active=false;clearTimeout(timer);controller.abort();};
 },[keyString,app.savedLoading,app.savedError,version,owner]);
 const pending=app.savedLoading||loading,failed=!!app.savedError||error;
 const count=(prefix:string)=>keys.filter(k=>k.startsWith(prefix)).length;
 const remove=async(key:string,label:string)=>{setRemoved({key,label});try{await app.setSavedKey(key,false);}catch{setRemoved(null);app.showError(new Error('Não foi possível remover. Tente novamente.'));}};
 const undo=async()=>{if(!removed)return;const item=removed;setRemoved(null);try{await app.setSavedKey(item.key,true);}catch{app.showError(new Error('Não foi possível restaurar. Tente novamente.'));}};
 const button=(key:string,label:string)=><button type="button" className="cpm-library-remove" aria-label={'Remover '+label+' dos salvos'} onClick={()=>void remove(key,label)}><CpmIcon name="bookmark"/></button>;
 const row=(key:string,label:string,meta:string,icon:ReactNode,page:string,param:string|number,available:boolean)=> <div className="cpm-library-row" key={key}><button type="button" className="cpm-library-open" onClick={()=>available?onNav(page,param):setUnavailable(true)}>{icon}<span className="cpm-library-row-copy"><strong>{label}</strong><small>{meta}</small></span><span className="cpm-library-row-chevron"><CpmIcon name="searchChevron"/></span></button>{button(key,label)}</div>;
 const section=(category:typeof categories[number])=>{
  const list=keys.filter(k=>k.startsWith(category.prefix));if(!list.length)return null;
  return <section className="cpm-library-section" key={category.label}><h2><CpmIcon name={category.icon}/>{category.label}</h2><div className="cpm-library-rows">{list.map(key=>{
   const id=key.slice(category.prefix.length);
   if(category.label==='Competições'){const c=resources.competitions.find(c=>c.id===id);return row(key,c?.nome??'Item indisponível',c?.edicao??'Competição',<span className="cpm-library-tile cpm-library-resource-icon"><CpmIcon name="ticket"/></span>,'tournaments',id,!!c);}
   if(category.label==='Clubes'){const c=resources.clubs.find(c=>c.id===id);return row(key,c?.nome??'Item indisponível',c?.tag??'Clube',<span className="cpm-library-crest"><Crest id={id} club={c} size={32}/></span>,'club',id,!!c);}
   if(category.label==='Notícias'){const n=resources.news.find(n=>n.id===id);return row(key,n?.title??'Item indisponível',n?'Notícia · '+n.date:'Notícia',<span className="cpm-library-tile cpm-library-resource-icon"><CpmIcon name="searchNews"/></span>,'article',id,!!n);}
   const match=resources.matches.find(m=>String(m.id)===id);if(!match)return row(key,'Item indisponível','Jogo',<span className="cpm-library-tile"><CpmIcon name="libraryBall"/></span>,'match',Number(id),false);
   const home=resources.clubs.find(c=>c.id===match.home)??allClubs.find(c=>c.id===match.home),away=resources.clubs.find(c=>c.id===match.away)??allClubs.find(c=>c.id===match.away),finished=match.status==='finalizado';
   const time=match.scheduledAt?new Date(match.scheduledAt).toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'}):'A definir';
   return <div className="cpm-library-match" key={key}><div className="cpm-library-match-top"><span><CpmIcon name="libraryBall"/>{match.date||'Data a definir'} · Rodada {match.rodada}</span></div><div className="cpm-library-match-bottom"><button type="button" className="cpm-library-match-open" onClick={()=>onNav('match',match.id)}><span className="cpm-library-team"><Crest id={match.home} club={home} size={28}/><strong>{home?.tag??match.home}</strong></span><b className="cpm-library-score">{finished||match.status==='ao_vivo'?`${match.scoreH??0} : ${match.scoreA??0}`:time}</b><span className="cpm-library-team"><strong>{away?.tag??match.away}</strong><Crest id={match.away} club={away} size={28}/></span><span className="cpm-library-match-chevron"><CpmIcon name="searchChevron"/></span></button>{button(key,'jogo')}</div></div>;
  })}</div></section>;
 };
 return <main className="cpm-library"><Heading title="Salvos" icon="bookmark" count={pending||failed?null:keys.length} onBack={()=>unavailable?setUnavailable(false):onBack()}/><div className="cpm-library-filters" aria-label="Filtrar salvos"><Filter label="Todos" icon="searchFilter" count={pending||failed?null:keys.length} selected={selected==='Todos'} onClick={()=>{setLocalFilter('Todos');onFilterChange?.('Todos');}}/>{categories.map(c=><Filter key={c.label} label={c.label} icon={c.icon} count={pending||failed?null:count(c.prefix)} selected={selected===c.label} onClick={()=>{setLocalFilter(c.label);onFilterChange?.(c.label);}}/>)}</div>
 {unavailable?<Feedback icon="searchAlert" title="Item indisponível" description="Este conteúdo não está mais disponível." action="Voltar aos salvos" onAction={()=>setUnavailable(false)}/>:failed?<Feedback icon="searchAlert" title="Não foi possível carregar" description="Tente novamente." action="Tentar novamente" onAction={()=>{app.reloadSaved();setVersion(v=>v+1);}}/>:pending?<Feedback icon="bookmark" title="Carregando…" busy/>:!keys.length||selected!=='Todos'&&!categories.some(c=>c.label===selected&&count(c.prefix))?<Feedback icon="bookmark" title="Nada salvo ainda" description="Salve clubes, competições, jogos e notícias." action="Explorar jogos" onAction={()=>onNav('jogos')}/>:<motion.div className="cpm-library-saved-grid" initial={{opacity:reduced?1:0}} animate={{opacity:1}} transition={{duration:.16}}>{selected==='Todos'?<><div>{categories.slice(0,2).map(section)}</div><div>{categories.slice(2).map(section)}</div></>:<div>{categories.filter(c=>c.label===selected).map(section)}</div>}</motion.div>}
 {removed&&!failed&&<div className="cpm-library-undo" role="status"><CpmIcon name="authCheck"/><span>Item removido</span><button type="button" onClick={()=>void undo()}>Desfazer</button></div>}</main>;
}
function noticeDate(n:Announcement){const date=new Date(n.published_at??n.created_at);return date.toLocaleDateString('pt-BR',{day:'2-digit',month:'short'}).replaceAll(' de ',' ').replace('.','')+' · '+date.toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'});}
export function NoticesScreen({onBack,onNav,filter='Todos',onFilterChange}:{onBack:()=>void;onNav:Navigate;filter?:NoticeFilter;onFilterChange?:(f:NoticeFilter)=>void}){
 const {items,reads,loading,error,refresh,markRead,reading}=useLibrary();
 useEffect(()=>{refresh();},[refresh]);
 const [local,setLocal]=useState<NoticeFilter>(filter),selected=onFilterChange?filter:local;
 const unread=items.filter(n=>!reads.has(n.id)),visible=selected==='Todos'?items:unread;
 return <main className="cpm-library"><Heading title="Avisos" icon="authBell" count={loading||error?null:unread.length} onBack={onBack}/><div className="cpm-library-notice-tools"><div className="cpm-library-filters" aria-label="Filtrar avisos">{(['Todos','Não lidos'] as const).map(f=><Filter key={f} label={f} icon={f==='Todos'?'searchFilter':'authBell'} count={loading||error?null:f==='Todos'?items.length:unread.length} selected={selected===f} onClick={()=>{setLocal(f);onFilterChange?.(f);}}/>)}</div>{(loading||error||items.length>0)&&<button type="button" className="cpm-library-mark-all" disabled={loading||!!error||reading||!unread.length} onClick={()=>void markRead(unread.map(n=>n.id)).catch(()=>{})}><CpmIcon name="authCheck"/>{!loading&&!error&&!unread.length?'Tudo lido':'Marcar como lidos'}</button>}</div>
 {error?<Feedback icon="searchAlert" title="Não foi possível carregar" description="Tente novamente." action="Tentar novamente" onAction={refresh}/>:loading?<Feedback icon="authBell" title="Carregando…" busy/>:!visible.length?<Feedback icon="authBell" title={selected==='Não lidos'?'Tudo lido':'Nenhum aviso por aqui'} description={selected==='Não lidos'?'Você pode consultar todos os avisos.':'Os comunicados da CPM aparecem aqui.'}/>:<div className="cpm-library-notices">{visible.map(n=>{const read=reads.has(n.id);return <button type="button" key={n.id} className={'cpm-library-notice-row'+(read?' is-read':'')} onClick={()=>onNav('notice',n.id)}><span className="cpm-library-tile"><CpmIcon name="authBell"/></span><span className="cpm-library-row-copy"><strong>{n.title}</strong><span className="cpm-library-notice-meta">{read?<CpmIcon name="authCheck"/>:<span className="cpm-library-new">Novo</span>}<small>{noticeDate(n)}</small></span>{n.excerpt&&<span className="cpm-library-excerpt">{n.excerpt}</span>}</span><span className="cpm-library-notice-chevron"><CpmIcon name="searchChevron"/></span></button>;})}</div>}</main>;
}
const destinationLabels={jogos:'Ver jogos',tournaments:'Ver classificação',club:'Ver clube',article:'Ver notícia',subscription:'Ver inscrições',rules:'Ver regulamento',saved:'Ver salvos'};
export function NoticeScreen({noticeId,onBack,onNav}:{noticeId:string;onBack:()=>void;onNav:Navigate}){
 const {items,reads,loading,error,refresh,markRead}=useLibrary(),{user}=useAuth();
 const item=items.find(n=>n.id===noticeId),attempted=useRef(''),[readError,setReadError]=useState(false);
 const mark=useRef(markRead);useEffect(()=>{mark.current=markRead;},[markRead]);
 useEffect(()=>{
  const key=(user?.id??'guest')+':'+noticeId;
  if(!loading&&!error&&item&&!reads.has(noticeId)&&attempted.current!==key){attempted.current=key;void mark.current([noticeId]).catch(()=>setReadError(true));}
 },[noticeId,user?.id,loading,error,item,reads]);
 return <main className="cpm-library"><Heading title="Avisos" icon="authBell" onBack={onBack}/>{error?<Feedback icon="searchAlert" title="Não foi possível carregar" description="Tente novamente." action="Tentar novamente" onAction={refresh}/>:loading?<Feedback icon="authBell" title="Carregando…" busy/>:!item?<Feedback icon="authBell" title="Aviso indisponível" action="Voltar aos avisos" onAction={onBack}/>:<article className="cpm-library-detail"><div className="cpm-library-publisher"><Image unoptimized src="/cpm-official.jpg" alt="CPM" width={44} height={44}/><span><strong>CPM MamoBall</strong><small>{noticeDate(item)}</small></span></div><h2>{item.title}</h2><p className="cpm-library-body">{item.body}</p>{reads.has(item.id)?<div className="cpm-library-read-status"><CpmIcon name="authCheck"/>Lido</div>:readError?<button type="button" className="cpm-library-mark-all" onClick={()=>{setReadError(false);void markRead([item.id]).catch(()=>setReadError(true));}}>Marcar como lido</button>:null}{item.destination&&<button type="button" className="cpm-button cpm-button-primary" onClick={()=>onNav(item.destination!,item.destination_id)}>{destinationLabels[item.destination]}</button>}</article>}</main>;
}
