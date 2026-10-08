import {chromium} from 'playwright';
import fs from 'node:fs';
import assert from 'node:assert/strict';
const out='.impeccable/review/games-implementation';fs.mkdirSync(out,{recursive:true});
const browser=await chromium.launch({executablePath:'/home/essiquatru/.agent-browser/browsers/chrome-154.0.8037.92/chrome',args:['--no-sandbox']});
const base=process.env.CPM_BASE_URL||'http://localhost:3000';
const meta=JSON.parse(fs.readFileSync('design/games-metadata.json','utf8'));
const comp={id:'copa',nome:'Copa Paulista',edicao:'2026',status:'em_andamento',rodada_atual:6,total_rodadas:14};
const names=['Aurora FC','Atlético Paulista','União MamoBall','Vila Esportiva'];
const clubs=names.map((nome,i)=>({id:'club'+i,nome,tag:['AUR','ATP','UMB','VES'][i],color:'#11151B',color2:'#FFFFFF',logo_url:null}));
const matches=Object.entries(meta.data).flatMap(([category,list])=>list.map((row,i)=>{
 const day=category==='today'?'05':category==='upcoming'?(i<2?'08':'10'):(i<2?'04':'03');
 const time=category==='results'?'20:30':row.Time.replace('h',':');
 return {id:category==='today'?i+1:category==='upcoming'?i+5:i+9,competition_id:'copa',home_id:'club'+names.indexOf(row.Home),away_id:'club'+names.indexOf(row.Away),score_h:row.ScoreHome==null?null:Number(row.ScoreHome),score_a:row.ScoreAway==null?null:Number(row.ScoreAway),status:category==='results'?'finalizado':'agendado',rodada:Number(row.Round.match(/\d+/)[0]),date_str:category==='today'?'Hoje · '+row.Time:row.Date+' · '+row.Time,stage:'Fase de grupos',home_scorers:[],away_scorers:[],is_wo:row.kind==='wo',scheduled_at:'2026-10-'+day+'T'+time+':00-03:00',finalized_at:category==='results'?'2026-10-'+day+'T23:00:00-03:00':null};
}));
const recapture=process.env.CPM_RECAPTURE?.split(',');
const results=recapture?JSON.parse(fs.readFileSync(out+'/report.json','utf8')).results:[],errors=[];
async function open(theme,width,variant='normal',real=false){
 const context=await browser.newContext({viewport:{width,height:1400},colorScheme:theme,reducedMotion:'reduce'}),page=await context.newPage();
 page.on('pageerror',e=>errors.push({theme,width,variant,error:e.message}));
 await page.addInitScript(theme=>{localStorage.setItem('cpm_theme',theme);localStorage.setItem('cpm_cookie_consent','accepted');Date.now=()=>Date.parse('2026-10-05T15:00:00Z');},theme);
 let offline=variant==='error';
 if(!real)await page.route('**/rest/v1/**',async route=>{
  const url=new URL(route.request().url()),table=url.pathname.split('/').at(-1),other=url.searchParams.get('competition_id')==='eq.liga';
  if(offline&&table==='matches')return route.fulfill({status:503,contentType:'application/json',body:'{"message":"offline"}'});
  if(variant==='loading'&&table==='matches')await new Promise(resolve=>setTimeout(resolve,5000));
  const rows=variant==='empty'?[]:variant==='missing'?matches.map(m=>m.id===1?{...m,scheduled_at:null,date_str:'Hoje'}:m):matches;
  const data={clubs:variant==='long'?clubs.map((c,i)=>i===0?{...c,nome:'Associação Esportiva MamoBall da Zona Sul Paulista'}:c):clubs,competitions:[comp,{...comp,id:'liga',nome:'Liga Paulista',status:'planejado'}],matches:other?[{...matches[4],id:99,competition_id:'liga'}]:rows,standings:[],scorers:[],news:[],inscricoes:[]}[table]||[];
  await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(data)});
 });
 await page.goto(base);await page.locator('.cpm-header').waitFor();
 if(width<1024){await page.getByRole('button',{name:'Abrir navegação'}).click();await page.getByRole('menuitem',{name:'Jogos',exact:true}).click();}
 else await page.getByRole('navigation',{name:'Navegação principal'}).getByRole('button',{name:'Jogos',exact:true}).click();
 await page.locator('.cpm-games').waitFor();
 if(real)await page.waitForFunction(()=>!document.querySelector('.cpm-games-state[aria-busy="true"]'));
 else if(variant==='normal'||variant==='long'||variant==='missing')await page.locator('.cpm-game-card').first().waitFor();
 else if(variant!=='loading')await page.waitForFunction(()=>!document.querySelector('.cpm-games-state[aria-busy="true"]'));
 await page.evaluate(()=>document.fonts.ready);
 return {page,context,recover:()=>{offline=false;}};
}
async function capture(page,name){
 await page.waitForTimeout(500); // Settle the exiting header menu before recording evidence.
 await page.mouse.move(0,0);
 await page.setViewportSize({width:page.viewportSize().width,height:await page.evaluate(()=>document.querySelector('.scroll').scrollHeight+document.querySelector('.cpm-header').clientHeight)});
 await page.evaluate(()=>document.querySelector('.scroll').scrollTop=0);
 assert.equal(await page.evaluate(()=>document.querySelector('.scroll').scrollWidth>document.querySelector('.scroll').clientWidth),false,name+' overflow');
 if(page.viewportSize().width<600){const tabs=await page.locator('.cpm-games-tab').evaluateAll(els=>els.map(el=>{const tab=el.getBoundingClientRect(),label=el.querySelector('.cpm-games-tab-label').getBoundingClientRect(),count=el.querySelector('.cpm-games-count')?.getBoundingClientRect();return {labelFits:label.left>=tab.left&&label.right<=tab.right,count:count?.width};}));for(const tab of tabs){assert.ok(tab.labelFits,name+' complete tab labels');if(tab.count!=null)assert.equal(tab.count,24,name+' count pill');}}
 await page.screenshot({path:out+'/'+name+'.png',fullPage:true});await page.locator('.cpm-games').screenshot({path:out+'/'+name+'-content.png'});
 const old=results.findIndex(result=>result.name===name);if(old>=0)results.splice(old,1);
 results.push({name,geometry:await page.locator('.cpm-games').evaluate(el=>({width:el.clientWidth,height:el.clientHeight,cards:[...el.querySelectorAll('.cpm-game-card')].map(c=>({width:c.clientWidth,height:c.clientHeight}))}))});
 fs.writeFileSync(out+'/report.json',JSON.stringify({results,errors},null,2));
}
try {
 if(recapture){for(const name of recapture){const [theme,variant,width]=name.split('-');const {page,context}=await open(theme,width?Number(width):variant==='long'?320:390,variant);await capture(page,name);await context.close();}console.log('PASS: settled evidence recaptured '+recapture.join(', '));process.exitCode=0;}
 else {
 for(const theme of ['light','dark']){
  for(const width of [1440,1024,2560,768,390,320]){const {page,context}=await open(theme,width);assert.equal(await page.locator('.cpm-game-card').count(),4);assert.deepEqual(await page.locator('.cpm-games-count').allTextContents(),['4','4','4']);await capture(page,theme+'-today-'+width);await context.close();}
  for(const width of [1440,390])for(const tab of ['Próximos','Resultados']){const {page,context}=await open(theme,width);await page.getByRole('tab',{name:tab}).click();await page.waitForTimeout(150);assert.equal(await page.locator('.cpm-game-card').count(),4);if(tab==='Resultados'){assert.deepEqual(await page.locator('.cpm-games-group h2').allTextContents(),['Rodada 6','Rodada 5']);assert.ok((await page.locator('.cpm-game-status').allTextContents()).includes('W.O.'));}await capture(page,theme+'-'+(tab==='Próximos'?'upcoming':'results')+'-'+width);await context.close();}
  for(const variant of ['empty','loading','error','long','missing']){
   const {page,context,recover}=await open(theme,variant==='long'?320:390,variant);
   if(variant==='loading'||variant==='error')assert.equal(await page.locator('.cpm-games-count').count(),0);
   if(variant==='empty')assert.deepEqual(await page.locator('.cpm-games-count').allTextContents(),['0','0','0']);
   if(variant==='missing')assert.match(await page.locator('.cpm-game-status').first().innerText(),/A definir/);
   await capture(page,theme+'-'+variant);
   if(variant==='empty'){await page.getByRole('button',{name:'Ver próximos jogos'}).click();await capture(page,theme+'-empty-upcoming');await page.getByRole('tab',{name:'Resultados'}).click();await capture(page,theme+'-empty-results');}
   if(variant==='error'){recover();await page.getByRole('button',{name:'Tentar novamente'}).click();await page.locator('.cpm-game-card').first().waitFor();}
   await context.close();
  }
  for(const variant of ['loading','error']){const {page,context}=await open(theme,320,variant);await capture(page,theme+'-'+variant+'-320');await context.close();}
 }
 const {page,context}=await open('light',1440);
 await page.getByRole('tab',{name:'Hoje'}).focus();await page.keyboard.press('ArrowRight');await page.getByRole('tab',{name:'Próximos',selected:true}).waitFor();await page.keyboard.press('End');await page.getByRole('tab',{name:'Resultados',selected:true}).waitFor();
 await page.getByRole('button',{name:'Mais opções'}).click();await page.getByRole('menuitem',{name:'Tema escuro'}).click();await page.keyboard.press('Escape');assert.equal(await page.getByRole('tab',{name:'Resultados'}).getAttribute('aria-selected'),'true');
 const card=page.locator('.cpm-game-card').first();await card.focus();assert.equal(await card.evaluate(el=>getComputedStyle(el).outlineStyle),'solid');assert.equal(await card.getAttribute('href'),'/partida/9');await page.keyboard.press('Enter');await page.waitForFunction(()=>document.querySelector('.app-root').dataset.surface==='match');await page.goBack();await page.locator('.cpm-games').waitFor();
 await page.getByRole('button',{name:'CPM MamoBall — início'}).click();await page.locator('.cpm-home').waitFor();await page.getByRole('button',{name:'Selecionar competição'}).click();await page.getByRole('option',{name:'Liga Paulista 2026'}).click();await page.getByRole('button',{name:'Ver jogos',exact:true}).click();await page.waitForFunction(()=>document.querySelector('.cpm-game-card')?.getAttribute('href')==='/partida/99');assert.match(await page.locator('.cpm-games-competition').innerText(),/Liga Paulista/);await context.close();
 for(const theme of ['light','dark']){const live=await open(theme,1440,'normal',true);await capture(live.page,'live-'+theme);await live.context.close();}
 assert.equal(errors.length,0,JSON.stringify(errors));fs.writeFileSync(out+'/report.json',JSON.stringify({results,errors},null,2));console.log('PASS: 20 exact theme/viewport scenes, 18 states, keyboard, history, theme, explicit competition, retry, live Supabase.');
 }
} finally { await browser.close(); }
