'use client';
import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useApp } from '@/contexts/AppContext';
import { useData } from '@/contexts/DataContext';
import { CpmAction, CpmIcon, CpmPopover, type CpmIconName } from '@/components/ui/CpmUi';
import { Crest } from '@/components/ui/Crest';
import { HomeNews } from '@/components/ui/HomeNews';
import { fetchMatches, fetchStandings, fetchMatchesForCompetitions, fetchApprovedInscricoesForCompetitions, type Competition, type Inscricao } from '@/lib/db';
import { buildHomeFeed, type FeaturedMoment } from '@/lib/homeFeed';
import type { Match, Standing } from '@/lib/types';
import { matchDate } from '@/lib/matchDate';
export { matchDate } from '@/lib/matchDate';

interface Props { onNav:(page:string,param?:string|number|null,extra?:string|null)=>void; }
interface FeedData { matches:Match[]; standings:Standing[]; inscricoes:Inscricao[]; }
const EMPTY: FeedData = {matches:[],standings:[],inscricoes:[]};
function ago(iso:string|null) {
 if(!iso||Number.isNaN(Date.parse(iso)))return 'Inscrição aprovada';
 const minutes=Math.max(0,Math.floor((Date.now()-Date.parse(iso))/60000));
 return minutes<1?'Aprovado agora':minutes<60?'Aprovado há '+minutes+'min':minutes<1440?'Aprovado há '+Math.floor(minutes/60)+'h':'Aprovado há '+Math.floor(minutes/1440)+'d';
}
function Team({id}:{id:string}) {
 const {clubById}=useData();const club=clubById(id);
 return <div className="cpm-feature-team"><div className="cpm-feature-emblem"><Crest id={id} size={50} height={56}/></div><span>{club?.nome||'Clube a definir'}</span></div>;
}
function Feature({moment,onNav}:{moment:FeaturedMoment;onNav:Props['onNav']}) {
 if(moment.kind==='none')return <FeatureState kind="empty" onRetry={()=>onNav('tournaments')}/>;
 const approval=moment.kind==='inscricao',scheduled=moment.kind==='upcoming',match=!approval?moment.match:null;
 const date=match?matchDate(match):null;
 const draw=!approval&&!scheduled&&!match?.is_wo&&match?.scoreH!=null&&match?.scoreA!=null&&match.scoreH===match.scoreA;
 const status=approval?'Novo time':scheduled?'Agendado':match?.is_wo?'W.O.':draw?'Empate':'Final';
 return <article className={'cpm-feature '+(approval?'cpm-feature-approved':scheduled?'cpm-feature-upcoming':'cpm-feature-result')} aria-label={approval?'Time aprovado':scheduled?'Próximo jogo em destaque':'Resultado em destaque'}>
  <div className="cpm-feature-context"><div className="cpm-feature-competition"><CpmIcon name="eventTrophy"/><h2>{moment.competition.nome}</h2></div><span className="cpm-feature-state"><CpmIcon name={scheduled?'calendar':'eventCheck'}/><span>{status}</span></span></div>
  {approval?<div className="cpm-approved-team"><span className="cpm-team-initials">{moment.inscricao.tag}</span><div><h3>{moment.inscricao.nome}</h3><p><CpmIcon name="check"/>Inscrição aprovada</p></div></div>:<div className="cpm-feature-match">
   <Team id={moment.match.home}/>
   <div className="cpm-feature-score" aria-label={scheduled?'Agendamento':match?.is_wo?'W.O.':String(match?.scoreH??'—')+' a '+String(match?.scoreA??'—')}>
    {scheduled?<><span className="cpm-schedule-day">{date?.day} {date?.month==='DATA'?'':date?.month}</span><span className="cpm-schedule-time">{date?.time}</span>{date?.weekday&&<span className="cpm-caption">{date.weekday}</span>}</>:match?.is_wo?<span>W.O.</span>:<span>{match?.scoreH??'—'} – {match?.scoreA??'—'}</span>}
   </div><Team id={moment.match.away}/>
  </div>}
  <div className="cpm-feature-divider"/>
  <div className="cpm-feature-footer"><div className="cpm-event-metadata">
   {!approval&&!scheduled&&<div className="cpm-event-calendar"><span>{date?.day}</span><span>{date?.month}</span></div>}
   <div className="cpm-event-detail">{approval?<span>{ago(moment.inscricao.reviewed_at)}</span>:<><span>{match?.rodada?'Rodada '+match.rodada:match?.stage||'Rodada a definir'}</span>{!scheduled&&<span className="cpm-caption cpm-event-time"><CpmIcon name="eventClock"/>{date?.time}</span>}</>}</div>
  </div><CpmAction primary onClick={()=>approval?onNav('tournaments',moment.competition.id):onNav('match',moment.match.id)}>{approval?'Ver competição':scheduled?'Ver confronto':'Ver partida'}<CpmIcon name="eventArrow"/></CpmAction></div>
 </article>;
}
function FeatureState({kind,onRetry}:{kind:'loading'|'error'|'empty';onRetry:()=>void}) {
 return <article className="cpm-feature cpm-feature-neutral" aria-busy={kind==='loading'} aria-live="polite">
  <h2>{kind==='loading'?'Carregando destaque':kind==='error'?'Não foi possível carregar':'Ainda não há destaques'}</h2>
  {kind==='loading'?<div className="cpm-feature-skeleton"><div className="cpm-skeleton cpm-skeleton-title"/><div className="cpm-skeleton-match"><span className="cpm-skeleton"/><span className="cpm-skeleton"/><span className="cpm-skeleton"/></div></div>:<><div className="cpm-feature-feedback"><CpmIcon name={kind==='error'?'support':'calendar'}/><p>{kind==='error'?'Tente novamente para acompanhar jogos e novidades.':'Os próximos jogos e as novidades da competição aparecerão aqui.'}</p></div><div className="cpm-feature-divider"/><CpmAction primary={kind==='error'} onClick={onRetry}>{kind==='error'?'Tentar novamente':'Ver competições'}</CpmAction></>}
 </article>;
}
function ListFeedback({label,icon}:{label:string;icon:CpmIconName}) {
 return <div className="cpm-list-feedback"><span className="cpm-feedback-symbol"><CpmIcon name={icon}/></span><p>{label}</p></div>;
}
function MatchList({title,more,matches,result,onNav,competitionId,showCompTag,loading,error}:{title:string;more:string;matches:Match[];result:boolean;onNav:Props['onNav'];competitionId:string|null;showCompTag:boolean;loading:boolean;error:boolean}) {
 const {clubById,competitions}=useData();
 return <section className={'cpm-match-section '+(result?'cpm-results':'cpm-upcoming')} aria-label={title}>
  <div className="cpm-section-heading"><h2>{title}</h2><CpmAction onClick={()=>onNav('jogos',competitionId,result?'resultados':'proximos')}>{more}</CpmAction></div>
  <div className="cpm-match-list" aria-busy={loading}>{loading?[0,1,2].map(i=><div key={i} className="cpm-list-skeleton"><div className="cpm-skeleton cpm-skeleton-wide"/></div>):matches.length?matches.slice(0,3).map(match=>{
   const date=matchDate(match),home=clubById(match.home),away=clubById(match.away);
   return <motion.button type="button" key={match.id} className="cpm-match-row" onClick={()=>onNav('match',match.id)} whileTap={{scale:0.995}} aria-label={(home?.nome||'Mandante')+' contra '+(away?.nome||'Visitante')+', '+(result?(match.scoreH??'—')+' a '+(match.scoreA??'—'):date.short+', '+date.time)+(match.is_wo?', W.O.':'')}>
    <span className="cpm-match-identity"><span className="cpm-match-club"><Crest id={match.home} size={16} height={18}/><span>{home?.nome||'Clube a definir'}</span></span><span className="cpm-match-club"><Crest id={match.away} size={16} height={18}/><span>{away?.nome||'Clube a definir'}</span></span><span className="cpm-caption">{date.short}{showCompTag?' · '+(competitions.find(c=>c.id===match.competition_id)?.nome||'Competição'):''}</span></span>
    <span className={'cpm-match-value '+(result?'is-result':'is-time')}><span>{result?(match.scoreH??'—')+' – '+(match.scoreA??'—'):date.time}</span><span className="cpm-caption">{result?match.is_wo?'W.O.':'FINAL':'HORÁRIO'}</span></span>
   </motion.button>;
  }):<ListFeedback icon={error?'support':result?'check':'calendar'} label={error?result?'Resultados indisponíveis.':'Jogos indisponíveis.':result?'Sem resultados publicados':'Sem jogos agendados'}/>}</div>
 </section>;
}
function StandingsMini({standings,competition,onNav,loading,error}:{standings:Standing[];competition:Competition|undefined;onNav:Props['onNav'];loading:boolean;error:boolean}) {
 const {clubById}=useData();
 return <section className="cpm-standings" aria-label="Classificação" aria-busy={loading}>
  <div className="cpm-table-context"><h2>Classificação</h2><p className="cpm-caption">{competition?competition.nome+' · '+competition.edicao:'Competição a definir'}</p></div>
  <div className="cpm-table-labels" aria-hidden="true"><span>#</span><span>Clube</span><span>Pts</span></div>
  <div className="cpm-table-rows">{loading?[0,1,2,3].map(i=><div className="cpm-list-skeleton" key={i}><div className="cpm-skeleton cpm-skeleton-wide"/></div>):standings.length?standings.slice(0,4).map((row,i)=><button type="button" key={row.club} className={'cpm-table-row'+(i===0?' is-leader':'')} onClick={()=>onNav('club',row.club)} aria-label={(i+1)+'º, '+(clubById(row.club)?.nome||'Clube')+', '+row.P+' pontos'}><span className="cpm-table-position">{i+1}</span><span className="cpm-table-club"><Crest id={row.club} size={18} height={20}/><span>{clubById(row.club)?.nome||'Clube'}</span></span><strong>{row.P}</strong></button>):<ListFeedback icon={error?'support':'trophy'} label={error?'Classificação indisponível.':'Classificação ainda não publicada.'}/>}</div>
  <div className="cpm-table-divider"/><CpmAction onClick={()=>onNav('tournaments',competition?.id??null)}>Tabela completa</CpmAction>
 </section>;
}
export function HomeScreen({onNav}:Props) {
 const {favComps,toggleFavComp}=useApp();
 const data=useData();
 const {competitions,activeComp}=data;
 const favIds=useMemo(()=>[...favComps].filter(id=>competitions.some(c=>c.id===id)),[favComps,competitions]);
 const hasFavorites=favIds.length>0;
 const [selection,setSelection]=useState<string|null>(null),[retry,setRetry]=useState(0);
 const selectedId=competitions.some(c=>c.id===selection)?selection:activeComp?.id??competitions[0]?.id??null;
 const isActive=selectedId===activeComp?.id;
 const key=(hasFavorites?'favorites:'+favIds.join(','):'competition:'+selectedId)+':'+retry;
 const [resource,setResource]=useState<{key:string;data:FeedData;error:string|null}|null>(null);
 const needsFetch=hasFavorites||(!isActive&&selectedId!==null);
 useEffect(()=>{
  if(!needsFetch)return;
  let cancelled=false;
  const timer=setTimeout(()=>{if(!cancelled){cancelled=true;setResource({key,data:EMPTY,error:'Não foi possível carregar.'});}},12000);
  const query=hasFavorites?Promise.all([fetchMatchesForCompetitions(favIds),fetchStandings(favIds[0]),fetchApprovedInscricoesForCompetitions(favIds)]):Promise.all([fetchMatches(selectedId!),fetchStandings(selectedId!),Promise.resolve([] as Inscricao[])]);
  query.then(([matches,standings,inscricoes])=>{if(!cancelled)setResource({key,data:{matches,standings,inscricoes},error:null});}).catch(()=>{if(!cancelled)setResource({key,data:EMPTY,error:'Não foi possível carregar.'});}).finally(()=>clearTimeout(timer));
  return()=>{cancelled=true;clearTimeout(timer);};
  // key captures the actual ordered competition IDs and retry attempt.
  // eslint-disable-next-line react-hooks/exhaustive-deps
 },[key,needsFetch]);
 const current=resource?.key===key?resource:null;
 const loading=data.initialLoad||(needsFetch&&!current);
 const error=data.error||(needsFetch?current?.error:null);
 const feedData=needsFetch?current?.data??EMPTY:{matches:data.matches,standings:data.standings,inscricoes:[]};
 const feed=useMemo(()=>buildHomeFeed({competitions,matches:feedData.matches,approvedInscricoes:hasFavorites?feedData.inscricoes:[]}),[competitions,feedData.matches,feedData.inscricoes,hasFavorites]);
 const competition=competitions.find(c=>c.id===(hasFavorites?favIds[0]:selectedId));
 const retryLoad=()=>{if(needsFetch)setRetry(value=>value+1);if(data.error||!needsFetch)data.refresh();};
 const featureKey=loading?'loading':error?'error':feed.featured.kind==='none'?'empty':feed.featured.kind==='inscricao'?'approval:'+feed.featured.inscricao.id:feed.featured.kind+':'+feed.featured.match.id;
 return <div className="cpm-home">
  <h1 className="cpm-sr-only">Jogos, resultados e classificação CPM MamoBall</h1>
  <div className="cpm-home-context">{hasFavorites?<div className="cpm-saved-context"><CpmIcon name="bookmark"/><span>Competições salvas</span><span className="cpm-saved-count">{favIds.length}</span></div>:<div className="cpm-competition-controls">
   <CpmPopover label="Selecionar competição" className="cpm-competition-selector" disabled={!competitions.length} role="listbox" trigger={<><CpmIcon name="trophy"/><span>{competition?competition.nome+' '+competition.edicao:loading?'Carregando competições':'Sem competições'}</span><CpmIcon name="chevron"/></>}>{close=><>{competitions.map(c=><button type="button" role="option" aria-selected={c.id===selectedId} key={c.id} className={'cpm-competition-option'+(c.id===selectedId?' is-selected':'')} onClick={()=>{setSelection(c.id);close();}}><span className="cpm-menu-icon"><CpmIcon name="trophy"/></span><span>{c.nome} {c.edicao}</span>{c.id===selectedId&&<CpmIcon name="check"/>}</button>)}</>}</CpmPopover>
   <motion.button type="button" className="cpm-favorite" disabled={!selectedId} aria-label="Salvar competição" aria-pressed={selectedId?favComps.has(selectedId):false} onClick={()=>{if(selectedId)toggleFavComp(selectedId);}} whileTap={{scale:0.9}}><CpmIcon name="star"/></motion.button>
  </div>}</div>
  <div className="cpm-home-top"><AnimatePresence mode="wait" initial={false}><motion.div key={featureKey} className="cpm-feature-slot" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} transition={{duration:0.12}}>{loading?<FeatureState kind="loading" onRetry={retryLoad}/>:error?<FeatureState kind="error" onRetry={retryLoad}/>:<Feature moment={feed.featured} onNav={onNav}/>}</motion.div></AnimatePresence>
   <StandingsMini standings={feedData.standings} competition={competition} onNav={onNav} loading={loading} error={Boolean(error)}/>
  </div>
  <div className="cpm-home-lists"><MatchList title="Próximos jogos" more="Ver jogos" matches={feed.upcoming} result={false} onNav={onNav} competitionId={hasFavorites?null:selectedId} showCompTag={favIds.length>1} loading={loading} error={Boolean(error)}/><MatchList title="Resultados recentes" more="Ver histórico" matches={feed.recent} result onNav={onNav} competitionId={hasFavorites?null:selectedId} showCompTag={favIds.length>1} loading={loading} error={Boolean(error)}/></div>
  <div className="cpm-mobile-standings"><StandingsMini standings={feedData.standings} competition={competition} onNav={onNav} loading={loading} error={Boolean(error)}/></div>
  <HomeNews news={data.news} onNav={onNav}/>
 </div>;
}
