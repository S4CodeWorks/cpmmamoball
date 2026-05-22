import type { Club, Standing, Match, Scorer, NewsItem } from './types';

export const CLUBS: Club[] = [
  { id: 'phx', nome: 'Phoenix Rovers',   tag: 'PHX', color: '#dc2626', color2: '#000' },
  { id: 'eng', nome: 'England FC',       tag: 'ENG', color: '#0b3b8c', color2: '#fff' },
  { id: 'rea', nome: 'Real Estácio',     tag: 'REA', color: '#0f172a', color2: '#facc15' },
  { id: 'vsc', nome: 'Vasco da Pelada',  tag: 'VDP', color: '#111',    color2: '#fff' },
  { id: 'flc', nome: 'Falcões FC',       tag: 'FLC', color: '#16a34a', color2: '#000' },
  { id: 'tgr', nome: 'Tigres do Sertão', tag: 'TGR', color: '#f59e0b', color2: '#1c1917' },
  { id: 'mmz', nome: 'Atlético Mamoz',   tag: 'AMZ', color: '#7c3aed', color2: '#fff' },
  { id: 'cru', nome: 'Cruzeiro WK',      tag: 'CRZ', color: '#1e40af', color2: '#fff' },
  { id: 'imb', nome: 'Inter MB',         tag: 'IMB', color: '#b91c1c', color2: '#fff' },
  { id: 'orc', nome: 'Orcas FC',         tag: 'ORC', color: '#0e7490', color2: '#fff' },
  { id: 'gri', nome: 'Grêmio Pix',       tag: 'GRP', color: '#075985', color2: '#fff' },
  { id: 'jvt', nome: 'Juventude SC',     tag: 'JVT', color: '#15803d', color2: '#fff' },
];

export const clubById = (id: string): Club | undefined => CLUBS.find(c => c.id === id);
export const ABBREV = (c?: Club): string => (c?.tag || c?.nome?.slice(0, 3) || '?').toUpperCase();

export const STANDINGS: Standing[] = [
  { club:'phx', J:11, V:9, E:1, D:1, GP:38, GC:12, SG:26, P:28, form:['V','V','V','E','V'] },
  { club:'eng', J:11, V:8, E:2, D:1, GP:31, GC:14, SG:17, P:26, form:['V','V','E','V','V'] },
  { club:'rea', J:11, V:7, E:2, D:2, GP:28, GC:16, SG:12, P:23, form:['V','D','V','V','E'] },
  { club:'tgr', J:11, V:6, E:3, D:2, GP:24, GC:17, SG:7,  P:21, form:['E','V','V','D','V'] },
  { club:'flc', J:11, V:6, E:1, D:4, GP:22, GC:18, SG:4,  P:19, form:['V','V','D','V','D'] },
  { club:'mmz', J:11, V:5, E:3, D:3, GP:21, GC:19, SG:2,  P:18, form:['V','E','V','E','D'] },
  { club:'cru', J:11, V:5, E:2, D:4, GP:19, GC:21, SG:-2, P:17, form:['D','V','V','D','V'] },
  { club:'vsc', J:11, V:4, E:3, D:4, GP:16, GC:18, SG:-2, P:15, form:['D','E','V','V','D'] },
  { club:'orc', J:11, V:4, E:1, D:6, GP:15, GC:22, SG:-7, P:13, form:['D','D','V','E','V'] },
  { club:'imb', J:11, V:3, E:2, D:6, GP:14, GC:21, SG:-7, P:11, form:['D','V','D','D','E'] },
  { club:'gri', J:11, V:2, E:2, D:7, GP:12, GC:26, SG:-14,P:8,  form:['D','D','E','D','V'] },
  { club:'jvt', J:11, V:1, E:2, D:8, GP:9,  GC:28, SG:-19,P:5,  form:['D','D','D','E','D'] },
];

export const MATCHES: Match[] = [
  { id:1,  home:'phx', away:'eng', scoreH:2, scoreA:1, status:'finalizado', rodada:12, date:'20 Mai',         stage:'Rodada 12' },
  { id:7,  home:'eng', away:'rea', scoreH:3, scoreA:2, status:'finalizado', rodada:11, date:'18 Mai',         stage:'Rodada 11' },
  { id:8,  home:'tgr', away:'flc', scoreH:1, scoreA:1, status:'finalizado', rodada:11, date:'17 Mai',         stage:'Rodada 11' },
  { id:9,  home:'phx', away:'mmz', scoreH:4, scoreA:0, status:'finalizado', rodada:11, date:'16 Mai',         stage:'Rodada 11' },
  { id:10, home:'vsc', away:'cru', scoreH:0, scoreA:2, status:'finalizado', rodada:11, date:'15 Mai',         stage:'Rodada 11' },
  { id:2,  home:'rea', away:'tgr', scoreH:null, scoreA:null, status:'agendado', rodada:13, date:'Hoje · 22:30',   stage:'Rodada 13' },
  { id:3,  home:'flc', away:'mmz', scoreH:null, scoreA:null, status:'agendado', rodada:13, date:'Amanhã · 20:00', stage:'Rodada 13' },
  { id:4,  home:'cru', away:'orc', scoreH:null, scoreA:null, status:'agendado', rodada:13, date:'Amanhã · 21:30', stage:'Rodada 13' },
  { id:5,  home:'vsc', away:'jvt', scoreH:null, scoreA:null, status:'agendado', rodada:13, date:'Sáb · 19:00',    stage:'Rodada 13' },
  { id:6,  home:'gri', away:'imb', scoreH:null, scoreA:null, status:'agendado', rodada:13, date:'Sáb · 20:30',    stage:'Rodada 13' },
];

export const SCORERS: Scorer[] = [
  { nick:'Caue9',     club:'phx', goals:12, assists:4, jogos:11 },
  { nick:'Krl_007',   club:'eng', goals:10, assists:6, jogos:11 },
  { nick:'Vinizera',  club:'rea', goals:9,  assists:3, jogos:10 },
  { nick:'GabFalcao', club:'flc', goals:8,  assists:5, jogos:11 },
  { nick:'Mts.Vlt',   club:'tgr', goals:7,  assists:2, jogos:11 },
  { nick:'Dougl4s',   club:'phx', goals:6,  assists:7, jogos:10 },
  { nick:'Lucao.10',  club:'mmz', goals:6,  assists:1, jogos:11 },
  { nick:'JP_Cruz',   club:'cru', goals:5,  assists:3, jogos:9  },
];

export const NEWS: NewsItem[] = [
  { id:'n1', title:'Phoenix Rovers vence clássico e abre 2 pontos na liderança',
    excerpt:'No confronto direto contra o England FC, time de Brasília mostrou maturidade tática e amplia vantagem na ponta.',
    tag:'Cobertura', date:'20 Mai', readTime:'4 min', author:'Redação CFM', img:'Cobertura: PHX 2×1 ENG' },
  { id:'n2', title:'CFM oficializa final em formato presencial pela primeira vez',
    excerpt:'Após cinco edições, a liga confirma cerimônia ao vivo em São Paulo.',
    tag:'Liga', date:'19 Mai', readTime:'3 min', author:'Diretoria', img:'Estúdio' },
  { id:'n3', title:'Krl_007 atinge marca histórica de 50 gols pela ENG',
    excerpt:'Camisa 9 entra para o seleto grupo de jogadores com 50+ na competição.',
    tag:'Recordes', date:'18 Mai', readTime:'2 min', author:'Stats CFM', img:'Recordes' },
  { id:'n4', title:'Novo regulamento de fair play entra em vigor na rodada 13',
    excerpt:'Comitê disciplinar atualiza critérios após reunião com representantes.',
    tag:'Regulamento', date:'18 Mai', readTime:'5 min', author:'Comitê', img:'Documento' },
  { id:'n5', title:'Atlético Mamoz anuncia patrocínio com a Pix Sports',
    excerpt:'Acordo de dois anos inclui novo kit titular.',
    tag:'Mercado', date:'17 Mai', readTime:'2 min', author:'Redação', img:'Uniforme' },
  { id:'n6', title:'Inscrições da Copa Sub-19 abrem na próxima semana',
    excerpt:'Categoria retorna com 16 vagas e seletivas regionais.',
    tag:'Categorias', date:'17 Mai', readTime:'3 min', author:'Federação', img:'Sub-19' },
];
