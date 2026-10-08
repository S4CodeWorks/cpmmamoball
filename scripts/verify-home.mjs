import { chromium } from 'playwright';
import fs from 'node:fs';
import assert from 'node:assert/strict';
const out='design/home-implementation/browser';fs.mkdirSync(out,{recursive:true});
const browser=await chromium.launch({executablePath:process.env.CPM_BROWSER||'/home/essiquatru/.agent-browser/browsers/chrome-154.0.8037.92/chrome',args:['--no-sandbox']});
const base=process.env.CPM_BASE_URL||'http://localhost:3000';
const comp={id:'copa',nome:'Copa Paulista',edicao:'2026',status:'em_andamento',rodada_atual:6,total_rodadas:14};
const clubs=['Aurora FC','Atlético Paulista','União MamoBall','Vila Esportiva'].map((nome,i)=>({id:'club'+i,nome,tag:['AUR','ATP','UMB','VES'][i],color:'#11151B',color2:'#FFFFFF',logo_url:null}));
const pairs=[[0,1],[2,3],[3,0],[0,1],[2,3],[1,3]];
const matches=pairs.map(([h,a],i)=>({id:i+1,competition_id:'copa',home_id:'club'+h,away_id:'club'+a,score_h:i<3?null:[3,2,2][i-3],score_a:i<3?null:[1,2,0][i-3],status:i<3?'agendado':'finalizado',rodada:i===5?5:6,date_str:'',stage:'',home_scorers:[],away_scorers:[],is_wo:false,scheduled_at:['2026-10-08T23:30:00Z','2026-10-09T00:00:00Z','2026-10-10T23:30:00Z','2026-10-04T23:30:00Z','2026-10-03T23:30:00Z','2026-10-03T22:30:00Z'][i],finalized_at:i<3?null:['2026-10-05T00:00:00Z','2026-10-04T00:00:00Z','2026-10-03T23:00:00Z'][i-3]}));
const standings=clubs.map((c,i)=>({club_id:c.id,competition_id:'copa',p:[15,12,10,8][i],j:6,v:0,e:0,d:0,gp:0,gc:0,sg:0,form:[]}));
const results=[];const errors=[];
async function pageFor(theme,width,height,variant='result',real=false){
 const context=await browser.newContext({viewport:{width,height},colorScheme:theme,reducedMotion:'reduce'});
 const page=await context.newPage();page.on('pageerror',e=>errors.push({theme,width,error:e.message}));
 await page.addInitScript(({theme,variant})=>{localStorage.setItem('cpm_cookie_consent','accepted');localStorage.setItem('cpm_theme',theme);if(variant==='approval')localStorage.setItem('cpm_fav_comps',JSON.stringify(['copa']));const now=variant==='upcoming'?Date.parse('2026-10-07T15:00:00Z'):Date.parse('2026-10-05T15:00:00Z');Date.now=()=>now;},{theme,variant});
 if(!real)await page.route('**/rest/v1/**',async route=>{
  const table=new URL(route.request().url()).pathname.split('/').at(-1);
  if(variant==='error'&&table==='competitions')return route.fulfill({status:503,contentType:'application/json',body:JSON.stringify({message:'offline'})});
  const data={clubs,competitions:[comp,{...comp,id:'liga',nome:'Liga Paulista',status:'planejado'}],matches:variant==='empty'?[]:matches.map(m=>m.id===4&&variant==='draw'?{...m,score_h:2,score_a:2}:m.id===4&&variant==='wo'?{...m,is_wo:true,score_h:null,score_a:null}:m),standings:variant==='empty'?[]:standings,scorers:[],news:[],inscricoes:variant==='approval'?[{id:1,competition_id:'copa',nome:'União MamoBall',tag:'UMB',status:'aprovado',reviewed_at:'2026-10-05T13:00:00Z',created_at:'2026-10-05T12:00:00Z'}]:[]}[table]||[];
  if(variant==='loading')await new Promise(r=>setTimeout(r,10000));
  await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(data)});
 });
 await page.goto(base);await page.locator('.cpm-home').waitFor();
 if(variant!=='loading')await page.waitForFunction(()=>!document.querySelector('.cpm-feature[aria-busy="true"]'));
 await page.evaluate(()=>document.fonts.ready);await page.waitForTimeout(200);
 return {page,context};
}
for(const theme of ['light','dark'])for(const [width,height]of [[1440,997],[1024,1057],[2560,997],[768,1698],[390,1698],[320,1800]]){
 const {page,context}=await pageFor(theme,width,height);
 const dimensions=await page.evaluate(()=>{const r=s=>{const b=document.querySelector(s)?.getBoundingClientRect();return b?{x:b.x,y:b.y,width:b.width,height:b.height}:null;};return {header:r('.cpm-header'),home:r('.cpm-home'),feature:r('.cpm-feature'),standings:r('.cpm-standings'),lists:r('.cpm-home-lists'),overflow:document.querySelector('.scroll').scrollWidth>document.querySelector('.scroll').clientWidth,loadedImages:[...document.querySelectorAll('.cpm-home img,.cpm-header img')].every(i=>i.complete&&i.naturalWidth>0)};});
 assert.equal(dimensions.overflow,false,theme+' '+width+' overflow');assert.equal(dimensions.loadedImages,true);
 await page.screenshot({path:out+'/'+theme+'-'+width+'.png'});results.push({theme,width,height,...dimensions});await context.close();
}
for(const theme of ['light','dark'])for(const variant of ['upcoming','approval','empty','error','loading']){
 const {page,context}=await pageFor(theme,390,900,variant);await page.screenshot({path:out+'/'+theme+'-'+variant+'.png'});await context.close();
}
for(const theme of ['light','dark'])for(const variant of ['draw','wo'])for(const [width,height]of [[1440,997],[390,1698],[320,1800]]){
 const {page,context}=await pageFor(theme,width,height,variant);assert.equal(await page.locator('.cpm-feature-state').innerText(),variant==='draw'?'Empate':'W.O.');assert.equal(await page.locator('.cpm-feature-score').innerText(),variant==='draw'?'2 – 2':'W.O.');await page.screenshot({path:out+'/'+theme+'-'+variant+'-'+width+'.png'});await context.close();
}
const {page,context}=await pageFor('light',1440,997);
await page.getByRole('button',{name:'Mais opções'}).click();await page.waitForTimeout(250);await page.screenshot({path:out+'/light-more.png'});
await page.getByRole('menuitem',{name:'Tema escuro'}).click();await page.waitForFunction(()=>document.querySelector('.app-root').dataset.theme==='dark');await page.waitForTimeout(250);await page.screenshot({path:out+'/dark-more.png'});
await page.keyboard.press('Escape');assert.equal(await page.getByRole('button',{name:'Mais opções'}).getAttribute('aria-expanded'),'false');
await page.getByRole('button',{name:'Selecionar competição'}).focus();await page.keyboard.press('ArrowDown');await page.keyboard.press('ArrowDown');await page.waitForTimeout(250);await page.screenshot({path:out+'/selector.png'});await page.keyboard.press('Enter');assert.match(await page.locator('.cpm-competition-selector').innerText(),/Liga Paulista/);
await page.getByRole('button',{name:'Ver jogos',exact:true}).click();await page.waitForFunction(()=>document.querySelector('.cpm-games-tab.is-selected')?.textContent?.includes('Próximos'));
await page.goBack();await page.locator('.cpm-home').waitFor();
await page.getByRole('button',{name:'Salvar competição'}).click();await page.locator('.cpm-saved-context').waitFor();
await page.getByRole('button',{name:'Mais opções'}).click();await page.getByRole('menuitem',{name:'Salvos',exact:true}).click();await page.getByRole('button',{name:'Voltar',exact:true}).click();await page.locator('.cpm-home').waitFor();
await context.close();
const live=await pageFor('light',1440,997,'result',true);await live.page.screenshot({path:out+'/live-light.png'});results.push({liveText:await live.page.locator('.cpm-home').innerText()});await live.page.getByRole('button',{name:'Mais opções'}).click();await live.page.getByRole('menuitem',{name:'Tema escuro'}).click();await live.page.keyboard.press('Escape');await live.page.screenshot({path:out+'/live-dark.png'});await live.context.close();
fs.writeFileSync(out+'/report.json',JSON.stringify({results,errors},null,2));await browser.close();assert.equal(errors.length,0,JSON.stringify(errors));console.log('PASS: 12 responsive/theme scenes, 10 highlight states, exact assets, keyboard, selector, theme, favorites, history, live Supabase.');
