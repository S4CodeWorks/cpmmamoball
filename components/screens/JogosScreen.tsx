'use client';
import { useEffect, useId, useRef, useState, type KeyboardEvent, type MouseEvent } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useData } from '@/contexts/DataContext';
import { CpmAction, CpmIcon, type CpmIconName } from '@/components/ui/CpmUi';
import { Crest } from '@/components/ui/Crest';
import { fetchMatches } from '@/lib/db';
import { matchDate } from '@/lib/matchDate';
import { pathForPage } from '@/lib/routes';
import type { Match } from '@/lib/types';

interface Props { onNav:(page:string,param?:string|number|null)=>void; initialTab?:string|null; initialCompetitionId?:string|null; }
type Category = 'hoje'|'proximos'|'resultados';
const tabs:{id:Category;label:string;icon:CpmIconName}[]=[{id:'hoje',label:'Hoje',icon:'calendar'},{id:'proximos',label:'Próximos',icon:'clock'},{id:'resultados',label:'Resultados',icon:'check'}];
const validTab=(value:string|null|undefined):Category=>tabs.some(t=>t.id===value)?value as Category:'hoje';
const zone='America/Sao_Paulo';
const format=(date:Date,options:Intl.DateTimeFormatOptions)=>new Intl.DateTimeFormat('pt-BR',{timeZone:zone,...options}).format(date);
const capitalize=(text:string)=>text.charAt(0).toUpperCase()+text.slice(1);

function gameDate(match:Match,today=false) {
 const iso=match.scheduledAt||match.finalizedAt;
 const date=iso&&!Number.isNaN(Date.parse(iso))?new Date(iso):today?new Date(Date.now()):null;
 const fallback=matchDate(match);
 if(!date)return {key:fallback.short,day:fallback.day,month:fallback.month,label:fallback.short,description:'',short:fallback.short};
 const day=format(date,{day:'2-digit'}),month=format(date,{month:'short'}).replace('.','').toUpperCase();
 const weekday=capitalize(format(date,{weekday:'long'})),long=format(date,{day:'numeric',month:'long'});
 return {key:format(date,{year:'numeric',month:'2-digit',day:'2-digit'}),day,month,label:weekday,description:long,short:day+' '+month.toLowerCase()};
}

function GameCard({match,onNav}:{match:Match;onNav:Props['onNav']}) {
 const {clubById}=useData(),reduced=useReducedMotion();
 const result=match.status==='finalizado',draw=result&&!match.is_wo&&match.scoreH!=null&&match.scoreA!=null&&match.scoreH===match.scoreA;
 const status=match.is_wo?'W.O.':draw?'Empate':'Final',date=matchDate(match),round=match.rodada?'Rodada '+match.rodada:'Rodada a definir';
 const home=clubById(match.home)?.nome||'Clube a definir',away=clubById(match.away)?.nome||'Clube a definir';
 const open=(event:MouseEvent<HTMLAnchorElement>)=>{if(event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;event.preventDefault();onNav('match',match.id);};
 const team=(id:string,name:string,score:number|null)=> <span className="cpm-game-team"><span className="cpm-game-emblem"><Crest id={id} size={32} height={36}/></span><span className="cpm-game-name">{name}</span>{result&&<strong className="cpm-game-team-score">{score??'—'}</strong>}</span>;
 return <motion.a className={'cpm-game-card'+(result?' is-result':' is-scheduled')} href={pathForPage('match',match.id)!} onClick={open} aria-label={home+' contra '+away+', '+(result?match.is_wo?'W.O.':(match.scoreH??'—')+' a '+(match.scoreA??'—')+', '+status:date.time)+', '+round} whileTap={reduced?undefined:{scale:0.997}}>
  <span className="cpm-game-fixture">
   <span className="cpm-game-time"><span className="cpm-game-status">{result?status:date.time}</span><span className="cpm-game-round">{round}</span></span>
   <span className="cpm-game-teams">{team(match.home,home,match.scoreH)}<strong className="cpm-game-score">{result?match.is_wo&&match.scoreH==null&&match.scoreA==null?'W.O.':(match.scoreH??'—')+' – '+(match.scoreA??'—'):'VS'}</strong>{team(match.away,away,match.scoreA)}</span>
   <span className="cpm-game-wide-arrow" aria-hidden="true"><CpmIcon name="arrow"/></span>
  </span>
  <span className="cpm-game-context"><span className="cpm-game-phase"><CpmIcon name="trophy"/>{match.stage||'Fase a definir'}</span><span className="cpm-game-date">{date.short}</span><span className="cpm-game-compact-arrow" aria-hidden="true"><CpmIcon name="arrow"/></span></span>
 </motion.a>;
}

function GameState({kind,tab,onNext,onRetry}:{kind:'loading'|'error'|'empty';tab:Category;onNext:()=>void;onRetry:()=>void}) {
 const title=kind==='loading'?'Carregando jogos':kind==='error'?'Não foi possível carregar os jogos':tab==='hoje'?'Sem jogos hoje':tab==='proximos'?'Sem jogos agendados':'Ainda não há resultados';
 return <div className={'cpm-games-state'+(kind==='error'?' is-error':'')} aria-busy={kind==='loading'} aria-live="polite">
  <CpmIcon name={kind==='error'?'support':'calendar'}/><h2>{title}</h2>
  {kind==='loading'?<>{[0,1,2].map(i=><div className="cpm-games-skeleton" key={i}/>)}</>:<><p>{kind==='error'?'Tente novamente.':tab==='hoje'?'Os próximos confrontos estão na aba Próximos.':tab==='proximos'?'Novas partidas aparecerão aqui quando forem agendadas.':'Os placares aparecerão aqui após as partidas.'}</p>{kind==='error'?<CpmAction primary onClick={onRetry}>Tentar novamente</CpmAction>:tab==='hoje'?<CpmAction onClick={onNext}>Ver próximos jogos</CpmAction>:null}</>}
 </div>;
}

export function JogosScreen({onNav,initialTab,initialCompetitionId}:Props) {
 const data=useData(),reduced=useReducedMotion(),panelId=useId();
 const [selection,setSelection]=useState(()=>({initial:initialTab,value:validTab(initialTab)})),[attempt,setAttempt]=useState(0);
 const tab=selection.initial===initialTab?selection.value:validTab(initialTab);
 const setTab=(value:Category)=>setSelection({initial:initialTab,value});
 const selectedId=initialCompetitionId||data.activeComp?.id||null,needsFetch=Boolean(selectedId&&selectedId!==data.activeComp?.id),key=selectedId+':'+attempt;
 const [resource,setResource]=useState<{key:string;matches:Match[];error:boolean}|null>(null);
 const buttons=useRef<(HTMLButtonElement|null)[]>([]);
 useEffect(()=>{
  if(!needsFetch||!selectedId)return;
  let cancelled=false;const timer=setTimeout(()=>{if(!cancelled){cancelled=true;setResource({key,matches:[],error:true});}},12000);
  fetchMatches(selectedId).then(matches=>{if(!cancelled)setResource({key,matches,error:false});}).catch(()=>{if(!cancelled)setResource({key,matches:[],error:true});}).finally(()=>clearTimeout(timer));
  return()=>{cancelled=true;clearTimeout(timer);};
 },[key,selectedId,needsFetch]);
 const current=resource?.key===key?resource:null,matches=needsFetch?current?.matches??[]:data.matches;
 const loading=data.loading||(needsFetch&&!current),error=Boolean(data.error||(needsFetch&&current?.error));
 // Preserve the approved category rules; ao_vivo does not enter these lists.
 const buckets={hoje:matches.filter(m=>m.status==='agendado'&&m.date?.startsWith('Hoje')),proximos:matches.filter(m=>m.status==='agendado'&&!m.date?.startsWith('Hoje')),resultados:matches.filter(m=>m.status==='finalizado')};
 const competition=data.competitions.find(c=>c.id===selectedId),visible=buckets[tab];
 const groups=new Map<string,{title:string;description:string;day:string;month:string;matches:Match[]}>();
 for(const match of visible){
  const date=gameDate(match,tab==='hoje'),groupKey=tab==='resultados'?String(match.rodada):date.key;
  if(!groups.has(groupKey))groups.set(groupKey,{title:tab==='resultados'?(match.rodada?'Rodada '+match.rodada:'Rodada a definir'):tab==='hoje'?'Hoje':date.label,description:tab==='hoje'&&date.description?date.label+' · '+date.description:date.description,day:tab==='resultados'?String(match.rodada||'—'):date.day,month:tab==='resultados'?'':date.month,matches:[]});
  groups.get(groupKey)!.matches.push(match);
 }
 const ordered=Array.from(groups.entries());if(tab==='resultados')ordered.sort(([a],[b])=>Number(b)-Number(a));
 const retry=()=>{if(needsFetch)setAttempt(a=>a+1);if(data.error||!needsFetch)data.refresh();};
 const keyboard=(event:KeyboardEvent<HTMLButtonElement>,index:number)=>{
  const next=event.key==='ArrowRight'?(index+1)%3:event.key==='ArrowLeft'?(index+2)%3:event.key==='Home'?0:event.key==='End'?2:null;
  if(next===null)return;event.preventDefault();setTab(tabs[next].id);buttons.current[next]?.focus();
 };
 return <div className="cpm-games">
  <div className="cpm-games-heading"><h1>Jogos</h1><div className="cpm-games-competition"><CpmIcon name="trophy"/><span>{competition?competition.nome+' '+competition.edicao:loading?'Carregando competição':'Sem competição'}</span></div></div>
  <div className="cpm-games-tabs" role="tablist" aria-label="Jogos por situação">{tabs.map((t,i)=><button type="button" key={t.id} ref={el=>{buttons.current[i]=el;}} role="tab" id={panelId+'-'+t.id} aria-controls={panelId} aria-selected={tab===t.id} tabIndex={tab===t.id?0:-1} className={'cpm-games-tab'+(tab===t.id?' is-selected':'')} onClick={()=>setTab(t.id)} onKeyDown={e=>keyboard(e,i)}><span className="cpm-games-tab-icon"><CpmIcon name={t.icon}/></span><span className="cpm-games-tab-label">{t.label}</span>{!loading&&!error&&<span className="cpm-games-count">{buckets[t.id].length}</span>}</button>)}</div>
  <motion.div key={tab} id={panelId} role="tabpanel" aria-labelledby={panelId+'-'+tab} tabIndex={0} className="cpm-games-panel" initial={reduced?false:{opacity:0.85}} animate={{opacity:1}} transition={{duration:0.12,ease:'easeOut'}}>
   {loading||error||!visible.length?<GameState kind={error?'error':loading?'loading':'empty'} tab={tab} onNext={()=>{setTab('proximos');buttons.current[1]?.focus();}} onRetry={retry}/>:ordered.map(([id,group])=><section className="cpm-games-group" key={id} aria-label={group.title}><div className="cpm-games-group-heading"><div className={'cpm-games-marker'+(tab==='resultados'?' is-round':'')}>{tab==='resultados'&&<CpmIcon name="trophy"/>}<strong>{group.day}</strong>{group.month&&<span>{group.month}</span>}</div><div><h2>{group.title}</h2>{group.description&&<p>{group.description}</p>}</div></div><div className="cpm-games-matches">{group.matches.map(match=><GameCard key={match.id} match={match} onNav={onNav}/>)}</div></section>)}
  </motion.div>
 </div>;
}
