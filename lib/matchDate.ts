import type { Match } from '@/lib/types';

const months=['JAN','FEV','MAR','ABR','MAI','JUN','JUL','AGO','SET','OUT','NOV','DEZ'];
/** Actual scheduling data wins; legacy display strings remain readable, never fabricated. */
export function matchDate(match:Match) {
 const iso=match.scheduledAt||match.finalizedAt;
 if(iso&&!Number.isNaN(Date.parse(iso))){
  const date=new Date(iso);
  const parts=new Intl.DateTimeFormat('pt-BR',{timeZone:'America/Sao_Paulo',day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit',hour12:false}).formatToParts(date);
  const get=(type:string)=>parts.find(p=>p.type===type)?.value||'';
  const day=get('day'),month=months[Number(get('month'))-1],time=get('hour')+'h'+get('minute');
  return {day,month,time,short:day+' '+month.toLowerCase(),weekday:new Intl.DateTimeFormat('pt-BR',{timeZone:'America/Sao_Paulo',weekday:'long'}).format(date)};
 }
 const text=match.date||'',timeMatch=text.match(/(\d{1,2})[:h](\d{2})/);
 const dayMatch=text.match(/(\d{1,2})\s*[/\s]\s*(jan|fev|mar|abr|mai|jun|jul|ago|set|out|nov|dez|\d{1,2})/i);
 const month=dayMatch?(Number(dayMatch[2])?months[Number(dayMatch[2])-1]:dayMatch[2].toUpperCase()):'';
 return {day:dayMatch?dayMatch[1].padStart(2,'0'):'—',month:month||'DATA',time:timeMatch?timeMatch[1].padStart(2,'0')+'h'+timeMatch[2]:'A definir',short:dayMatch?dayMatch[1].padStart(2,'0')+' '+(month||'').toLowerCase():text.split('·')[0]?.trim()||'Data a definir',weekday:''};
}
