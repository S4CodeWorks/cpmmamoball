import { chromium } from 'playwright';
import fs from 'node:fs';
import assert from 'node:assert/strict';
const out='.impeccable/review/home-news-implementation';fs.mkdirSync(out,{recursive:true});
const browser=await chromium.launch({executablePath:process.env.CPM_BROWSER||'/home/essiquatru/.agent-browser/browsers/chrome-154.0.8037.92/chrome',args:['--no-sandbox']});
const base=process.env.CPM_BASE_URL||'http://localhost:3000';
const comp={id:'copa',nome:'Copa Paulista',edicao:'2026',status:'em_andamento',rodada_atual:6,total_rodadas:14};
const clubs=['Aurora FC','Atlético Paulista','União MamoBall','Vila Esportiva'].map((nome,i)=>({id:'club'+i,nome,tag:['AUR','ATP','UMB','VES'][i],color:'#11151B',color2:'#FFFFFF',logo_url:null}));
const pairs=[[0,1],[2,3],[3,0],[0,1],[2,3],[1,3]];
const matches=pairs.map(([h,a],i)=>({id:i+1,competition_id:'copa',home_id:'club'+h,away_id:'club'+a,score_h:i<3?null:[3,2,2][i-3],score_a:i<3?null:[1,2,0][i-3],status:i<3?'agendado':'finalizado',rodada:i===5?5:6,date_str:'',stage:'',home_scorers:[],away_scorers:[],is_wo:false,scheduled_at:['2026-10-08T23:30:00Z','2026-10-09T00:00:00Z','2026-10-10T23:30:00Z','2026-10-04T23:30:00Z','2026-10-03T23:30:00Z','2026-10-03T22:30:00Z'][i],finalized_at:i<3?null:['2026-10-05T00:00:00Z','2026-10-04T00:00:00Z','2026-10-03T23:00:00Z'][i-3]}));
const standings=clubs.map((c,i)=>({club_id:c.id,competition_id:'copa',p:[15,12,10,8][i],j:6,v:0,e:0,d:0,gp:0,gc:0,sg:0,form:[]}));
const titles=['A marca da CPM, de perto','Calendário da temporada','O que muda na próxima rodada','Guia da competição'];
const summaries=['O símbolo que acompanha os clubes em cada rodada.','Datas e informações da próxima etapa da competição.','Horários e confrontos reunidos em um só lugar.','Formato, regras e os caminhos até a decisão.'];
const articles=titles.map((title,i)=>({id:'news'+i,title,excerpt:summaries[i],body:'',tag:'CPM',author:'CPM',date_str:'06 out',read_time:'2 min',img:i===0?'/cpm-official.jpg':'',category:'noticia',published:true}));
const edgeArticles=[{...articles[1],title:'Uma publicação com título bastante longo para conferir a leitura e a organização em telas pequenas',body:'conteúdo '.repeat(401),read_time:'inaccurate',tag:'Comunicado da organização da competição',img:'/missing-article-image.png'}, {...articles[2],excerpt:'',date_str:'',read_time:'',tag:''}, {...articles[3],title:'x'.repeat(130)}, {...articles[1],id:'hiddenfourth'}];
const results=[];const errors=[];
async function pageFor(theme,width,height,variant='result',real=false){
 const context=await browser.newContext({viewport:{width,height},colorScheme:theme,reducedMotion:'reduce'});
 const page=await context.newPage();page.on('pageerror',e=>errors.push({theme,width,error:e.message}));
 await page.addInitScript(({theme,variant})=>{localStorage.setItem('cpm_cookie_consent','accepted');localStorage.setItem('cpm_theme',theme);if(variant==='approval')localStorage.setItem('cpm_fav_comps',JSON.stringify(['copa']));const now=variant==='upcoming'?Date.parse('2026-10-07T15:00:00Z'):Date.parse('2026-10-05T15:00:00Z');Date.now=()=>now;},{theme,variant});
 if(!real)await page.route('**/rest/v1/**',async route=>{
  const table=new URL(route.request().url()).pathname.split('/').at(-1);
  if(variant==='error'&&table==='competitions')return route.fulfill({status:503,contentType:'application/json',body:JSON.stringify({message:'offline'})});
  const data={clubs,competitions:[comp,{...comp,id:'liga',nome:'Liga Paulista',status:'planejado'}],matches:variant==='empty'?[]:matches.map(m=>m.id===4&&variant==='draw'?{...m,score_h:2,score_a:2}:m.id===4&&variant==='wo'?{...m,is_wo:true,score_h:null,score_a:null}:m),standings:variant==='empty'?[]:standings,scorers:[],news:variant==='none'?[]:variant==='one'?[articles[0]]:variant==='edge'?edgeArticles:articles.slice(1),inscricoes:variant==='approval'?[{id:1,competition_id:'copa',nome:'União MamoBall',tag:'UMB',status:'aprovado',reviewed_at:'2026-10-05T13:00:00Z',created_at:'2026-10-05T12:00:00Z'}]:[]}[table]||[];
  if(variant==='loading')await new Promise(r=>setTimeout(r,10000));
  await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(data)});
 });
 await page.goto(base);await page.locator('.cpm-home').waitFor();
 if(variant!=='loading')await page.waitForFunction(()=>!document.querySelector('.cpm-feature[aria-busy="true"]'));
 await page.evaluate(()=>document.fonts.ready);await page.waitForTimeout(200);
 return {page,context};
}
for(const theme of ['light','dark'])for(const variant of ['one','many'])for(const width of [1440,390,320]){
 const {page,context}=await pageFor(theme,width,1400,variant);
 const section=page.locator('.cpm-home-news');await section.waitFor();await section.scrollIntoViewIfNeeded();
 await page.waitForFunction(()=>[...document.querySelectorAll('.cpm-home-news img')].every(i=>i.complete&&i.naturalWidth>0));
 assert.equal(await section.locator('.cpm-news-item').count(),variant==='one'?1:3);
 assert.equal(await page.locator('.cpm-registration').count(),0);
 assert.equal(await page.evaluate(()=>document.querySelector('.scroll').scrollWidth>document.querySelector('.scroll').clientWidth),false);
 await section.screenshot({path:out+'/'+theme+'-'+variant+'-'+width+'-section.png'});
 await page.setViewportSize({width,height:await page.evaluate(()=>document.querySelector('.scroll').scrollHeight+document.querySelector('.cpm-header').clientHeight)});
 await page.evaluate(()=>document.querySelector('.scroll').scrollTop=0);
 await page.screenshot({path:out+'/'+theme+'-'+variant+'-'+width+'.png',fullPage:true});
 results.push({theme,variant,width,geometry:await section.evaluate(el=>({width:el.clientWidth,height:el.clientHeight,cards:[...el.querySelectorAll('.cpm-news-item')].map(c=>({width:c.clientWidth,height:c.clientHeight}))}))});
 await context.close();
}
for(const theme of ['light','dark']){
 const empty=await pageFor(theme,390,1400,'none');assert.equal(await empty.page.locator('.cpm-home-news').count(),0);await empty.context.close();
 const {page,context}=await pageFor(theme,320,1400,'edge');const section=page.locator('.cpm-home-news');await section.scrollIntoViewIfNeeded();await page.waitForFunction(()=>!document.querySelector('.cpm-home-news img'));
 assert.equal(await section.locator('.cpm-news-item').count(),3);assert.equal(await section.locator('img').count(),0);
 assert.match(await section.innerText(),/3 min/);assert.doesNotMatch(await section.innerText(),/inaccurate/);
 assert.equal(await page.evaluate(()=>document.querySelector('.scroll').scrollWidth>document.querySelector('.scroll').clientWidth),false);
 await section.screenshot({path:out+'/'+theme+'-edge-320.png'});await context.close();
}
const {page,context}=await pageFor('light',1440,1400,'many');
const article=page.locator('.cpm-news-item').first();await article.focus();assert.equal(await article.evaluate(el=>getComputedStyle(el).outlineStyle),'solid');
assert.equal(await article.getAttribute('href'),'/noticia/news1');await page.keyboard.press('Enter');await page.waitForFunction(()=>location.pathname==='/noticia/news1');await page.getByText('Calendário da temporada',{exact:true}).first().waitFor();
await page.goBack();await page.locator('.cpm-home-news').waitFor();await page.getByRole('button',{name:'Ver todas',exact:true}).click();await page.locator('.cpm-home').waitFor({state:'detached'});assert.ok(await page.getByText('Notícias',{exact:true}).count());await context.close();
fs.writeFileSync(out+'/report.json',JSON.stringify({results,errors},null,2));await browser.close();assert.equal(errors.length,0,JSON.stringify(errors));console.log('PASS: 12 theme/viewport news scenes, empty, cap, broken image, long copy, computed reading time, keyboard article, index navigation.');
