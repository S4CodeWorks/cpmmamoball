import { chromium } from 'playwright';
import fs from 'node:fs';
import assert from 'node:assert/strict';
const out='.impeccable/review/match-implementation';fs.mkdirSync(out,{recursive:true});
const fixture=JSON.parse(fs.readFileSync('design/match-fixtures.json','utf8'));
const clubs=['Aurora FC','Atlético Paulista','União MamoBall','Vila Esportiva'].map((nome,i)=>({id:'club'+i,nome,tag:['AUR','ATP','UMM','VIL'][i],logo_url:null,color:'#11151B',color2:'#FFFFFF'}));
const comp={id:'liga',nome:'Liga Paulista',edicao:'2026',status:'em_andamento',rodada_atual:6,total_rodadas:14,classification_format:'league'};
const main={id:124,competition_id:'liga',home_id:'club0',away_id:'club1',score_h:3,score_a:1,status:'finalizado',rodada:6,date_str:'04 out 2026',stage:'Fase de grupos',home_scorers:fixture.match.home_scorers,away_scorers:fixture.match.away_scorers,is_wo:false,scheduled_at:'2026-10-04T20:30:00-03:00'};
const matches=[main,...fixture.previousFinalizedMatches.map((m,i)=>({...main,id:m.id,home_id:m.home==='AUR'?'club0':'club1',away_id:m.away==='AUR'?'club0':'club1',score_h:m.scoreH,score_a:m.scoreA,rodada:5-i,date_str:m.date,scheduled_at:`2026-09-${27-i*7}T20:30:00-03:00`})),...fixture.otherRoundMatches.map((m,i)=>({...main,id:m.id,home_id:i?'club1':'club2',away_id:'club3',score_h:m.scoreH,score_a:m.scoreA,home_scorers:[],away_scorers:[]}))];
const players=[{id:'p1',club_id:'club0',nick:'Kauan',game_id:'204812'},{id:'p2',club_id:'club1',nick:'Rafa',game_id:'309401'},{id:'p3',club_id:'club1',nick:'Dudu',game_id:'305710'}];
const browser=await chromium.launch({executablePath:'/home/essiquatru/.agent-browser/browsers/chrome-154.0.8037.92/chrome',args:['--no-sandbox']});
const errors=[],results=[];
async function open(theme,width,variant='normal',real=false){
 const context=await browser.newContext({viewport:{width,height:1400},colorScheme:theme,reducedMotion:'reduce'}),page=await context.newPage();
 page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(theme=>{localStorage.setItem('cpm_theme',theme);localStorage.setItem('cpm_cookie_consent','accepted');Object.defineProperty(navigator,'share',{value:undefined});Object.defineProperty(navigator,'clipboard',{value:{writeText:async text=>{window.__shared=text;}}});},theme);
 let broken=variant==='error';
 if(!real)await page.route('**/rest/v1/**',async route=>{
  const url=new URL(route.request().url()),table=url.pathname.split('/').at(-1),id=url.searchParams.get('id')?.replace('eq.','');
  if(table==='matches'&&broken)return route.fulfill({status:503,contentType:'application/json',body:'{"message":"offline"}'});
  if(table==='matches'&&variant==='loading')await new Promise(r=>setTimeout(r,2000));
  const changed={...main,...(variant==='scheduled'?{status:'agendado',score_h:null,score_a:null,scheduled_at:'2026-10-08T20:30:00-03:00',home_scorers:[],away_scorers:[]}:variant==='wo'?{is_wo:true}:variant==='live'?{status:'ao_vivo'}:variant==='empty'?{home_scorers:[],away_scorers:[]}:variant==='draw'?{score_h:2,score_a:2,home_scorers:[],away_scorers:[]}:variant==='unknown'?{score_h:null,score_a:null}: {})};
  const list=variant==='nohistory'?[changed]:matches.map(m=>m.id===124?changed:m);
  const clubList=variant==='long'?clubs.map(c=>({...c,nome:'Associação Esportiva MamoBall da Zona Sul Paulista'})):clubs;
  let data={clubs:clubList,competitions:[comp],matches:list,players:players.filter(p=>!url.searchParams.has('club_id')||url.searchParams.get('club_id')==='eq.'+p.club_id),standings:[],scorers:[],news:[],inscricoes:[]}[table]||[];
  if(id)data=variant==='missing'&&table==='matches'?null:data.find(r=>String(r.id)===id)??null;
  return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(data)});
 });
 await page.goto('http://localhost:3000/partida/124');await page.locator('.cpm-match').waitFor();
 if(variant!=='loading')await page.waitForFunction(()=>!document.querySelector('.cpm-match-loading'));
 if(!real&&variant==='normal')await page.locator('.cpm-match-player-id:visible').filter({hasText:'#204812'}).first().waitFor();
 await page.evaluate(()=>document.fonts.ready);
 return {page,context,recover:()=>broken=false};
}
async function capture(page,name){
 await page.mouse.move(0,0);await page.waitForTimeout(150);
 const h=await page.evaluate(()=>Math.ceil(document.querySelector('.cpm-match').getBoundingClientRect().height+document.querySelector('.cpm-header').clientHeight));
 await page.setViewportSize({width:page.viewportSize().width,height:h});await page.evaluate(()=>document.querySelector('.scroll').scrollTop=0);
 assert.equal(await page.evaluate(()=>document.querySelector('.scroll').scrollWidth>document.querySelector('.scroll').clientWidth),false,name+' overflow');
 await page.screenshot({path:out+'/'+name+'.png',fullPage:true});
 results.push({name,geometry:await page.locator('.cpm-match').evaluate(el=>({width:el.clientWidth,height:el.clientHeight,hero:el.querySelector('.cpm-match-scoreboard')?.getBoundingClientRect().height}))});
 fs.writeFileSync(out+'/report.json',JSON.stringify({results,errors},null,2));
}
try{
 for(const theme of ['light','dark']){
  for(const width of [1440,1024,2560,768,390,320]){const {page,context}=await open(theme,width);await capture(page,theme+'-final-'+width);assert.equal(await page.locator('.bottom-nav').count(),0);await context.close();}
  for(const tab of ['Confrontos','Rodada']){const {page,context}=await open(theme,390);await page.getByRole('tab',{name:tab,exact:true}).click();await capture(page,theme+'-'+tab.toLowerCase());await context.close();}
  for(const variant of ['scheduled','live','wo','empty','draw','unknown','nohistory','long','loading','missing','error']){const {page,context,recover}=await open(theme,variant==='long'?320:390,variant);await capture(page,theme+'-'+variant);if(variant==='scheduled'){await page.getByRole('button',{name:'Lembrar desta partida'}).click();await page.getByRole('button',{name:'Desativar lembrete desta partida'}).waitFor();}if(variant==='error'){recover();await page.getByRole('button',{name:'Tentar novamente'}).click();await page.locator('.cpm-match-scoreboard').waitFor();}await context.close();}
 }
 const {page,context}=await open('light',390);await page.getByRole('tab',{name:'Gols',exact:true}).focus();await page.keyboard.press('ArrowRight');await page.getByRole('tab',{name:'Confrontos',selected:true}).waitFor();await page.keyboard.press('End');await page.getByRole('tab',{name:'Rodada',selected:true}).waitFor();await page.keyboard.press('Home');await page.getByRole('tab',{name:'Gols',selected:true}).waitFor();
 await page.getByRole('button',{name:'Salvar partida',exact:true}).click();await page.getByRole('button',{name:'Remover partida dos salvos'}).waitFor();await page.getByRole('button',{name:'Compartilhar partida'}).click();await page.getByRole('status').filter({hasText:'Link copiado'}).waitFor();assert.equal(await page.evaluate(()=>window.__shared),'http://localhost:3000/partida/124');await page.reload();await page.getByRole('button',{name:'Remover partida dos salvos'}).waitFor();await page.getByRole('button',{name:'Remover partida dos salvos'}).click();await page.getByRole('button',{name:'Salvar partida',exact:true}).waitFor();
 await page.getByRole('tab',{name:'Confrontos',exact:true}).click();await page.locator('.cpm-match-compact .cpm-match-past').first().click();await page.waitForURL('**/partida/101');await page.locator('.cpm-match-scoreboard').waitFor();assert.match(await page.locator('.cpm-match-id').innerText(),/#101/);await context.close();
 const live=await open('light',1440,'normal',true);await capture(live.page,'real-supabase');await live.context.close();
 assert.deepEqual(errors,[]);console.log('PASS: 12 responsive/theme scenes, tabs, 22 states, retry, save persistence, share, navigation and live read.');
}finally{await browser.close();}
