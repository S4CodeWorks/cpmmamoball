import { chromium } from 'playwright';
import fs from 'node:fs';
import assert from 'node:assert/strict';
const out='.impeccable/review/search-implementation';fs.mkdirSync(out,{recursive:true});
const browser=await chromium.launch({executablePath:'/home/essiquatru/.agent-browser/browsers/chrome-154.0.8037.92/chrome',args:['--no-sandbox']});
const clubs=[['aurora','Aurora FC','AUR'],['atletico','Atlético Paulista','ATP'],['uniao','União MamoBall','UMB']].map(([id,nome,tag])=>({id,nome,tag,logo_url:null,color:'#11151B',color2:'#FFFFFF'}));
const row=(kind,id,title,extra={})=>({kind,id,title,subtitle:null,club_id:null,game_id:null,image:null,tag:null,date_str:null,total_count:1,...extra});
const initial=clubs.map(c=>row('Club',c.id,c.nome,{club_id:c.id,tag:c.tag,total_count:3}));
const data={Club:[{...initial[0],total_count:1}],Player:[row('Player','p1','aurora10',{club_id:'aurora',subtitle:'Aurora FC',game_id:'48219',total_count:2}),row('Player','p2','aurora.gg',{club_id:'aurora',subtitle:'Aurora FC',game_id:'19084',total_count:2})],News:[row('News','n1','Aurora abre a rodada com vitória',{image:'/cpm-official.jpg',date_str:'06 out',tag:'Competição',total_count:2}),row('News','n2','Aurora: elenco confirmado para a temporada',{date_str:'04 out',tag:'Clubes',total_count:2})]};
const previous=process.env.CPM_RECAPTURE_LIVE?JSON.parse(fs.readFileSync(out+'/report.json','utf8')):null;
const errors=[],captures=previous?.captures??(process.env.CPM_FUNCTIONAL_ONLY?fs.readdirSync(out).filter(n=>/^(light|dark)-.*\.png$/.test(n)).map(n=>n.replace('.png','')):[]),checks=previous?.checks??[];
async function open(theme,width,variant='normal',real=false){
 const context=await browser.newContext({viewport:{width,height:1100},colorScheme:theme,reducedMotion:'reduce'}),page=await context.newPage();
 page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(theme=>{localStorage.setItem('cpm_theme',theme);localStorage.setItem('cpm_cookie_consent','accepted');},theme);
 let failure=true;
 if(!real)await page.route('**/rest/v1/**',async route=>{
  const table=new URL(route.request().url()).pathname.split('/').at(-1);
  if(table==='cpm_search'){
   const {search_kind:kind,search_query:q,page_size:take,page_offset:offset}=route.request().postDataJSON();
   if((variant==='unavailable'||variant==='partial'&&kind==='Player'||variant==='pagination-error'&&offset>0)&&failure)return route.fulfill({status:503,contentType:'application/json',body:'{"message":"offline"}'});
   if(variant==='loading'&&kind==='Player')await new Promise(r=>setTimeout(r,3500));
   if(q==='old')await new Promise(r=>setTimeout(r,900));
   let rows=q?data[kind]:initial;
   if(variant==='empty'||q==='nohit')rows=[];
   if(variant.startsWith('pagination')&&q)rows=kind==='Player'?Array.from({length:20},(_,i)=>row('Player','p'+i,'aurora'+i,{club_id:'aurora',game_id:String(40000+i),subtitle:'Aurora FC',total_count:20})).slice(offset,offset+take):[];
   if(variant==='long'&&q)rows=kind==='News'?[row('News','long','Aurora anuncia o calendário completo de jogos da temporada e confirma a participação do elenco na próxima fase do Campeonato Paulista de MamoBall',{date_str:'06 out',tag:'Competição'})]:[];
   return route.fulfill({contentType:'application/json',body:JSON.stringify(rows)});
  }
  const tables={clubs,players:data.Player.map(p=>({id:p.id,nick:p.title,game_id:p.game_id,club_id:'aurora',is_captain:false})),news:data.News.map(n=>({id:n.id,title:n.title,tag:n.tag,date_str:n.date_str,img:n.image,published:true,body:'Texto de demonstração'})),competitions:[],matches:[],standings:[],scorers:[],inscricoes:[],bracket_ties:[]};
  await route.fulfill({contentType:'application/json',body:JSON.stringify(tables[table]??[])});
 });
 await page.goto(process.env.CPM_BASE_URL||'http://localhost:3000',{waitUntil:'domcontentloaded',timeout:60000});await page.locator('.cpm-header-search').click();await page.locator('#cpm-search-input').waitFor();
 if(variant==='unavailable')await page.getByRole('heading',{name:'Busca indisponível'}).waitFor();else await page.locator('.cpm-search-result').first().waitFor({timeout:60000});
 return {page,context,recover:()=>{failure=false;}};
}
async function search(page,q='aurora',loading=false){await page.locator('#cpm-search-input').fill(q);await page.waitForTimeout(loading?550:800);await page.locator('#cpm-search-input').blur();}
async function capture(page,name){
 await page.mouse.move(0,0);await page.evaluate(()=>document.fonts.ready);await page.waitForTimeout(150);
 assert.equal(await page.locator('.scroll').evaluate(e=>e.scrollWidth>e.clientWidth),false,name+' overflow');
 await page.setViewportSize({width:page.viewportSize().width,height:Math.max(740,await page.evaluate(()=>document.querySelector('.cpm-search').scrollHeight+document.querySelector('.cpm-header').clientHeight))});
 await page.evaluate(()=>{document.querySelector('.scroll').scrollTop=0;window.scrollTo(0,0);});await page.waitForTimeout(150);
 assert.equal(await page.locator('.cpm-header').evaluate(e=>Math.round(e.getBoundingClientRect().top)),0,name+' header at top');
 await page.screenshot({path:out+'/'+name+'.png',fullPage:true});if(!captures.includes(name))captures.push(name);
}
try{
 for(const theme of process.env.CPM_FUNCTIONAL_ONLY||process.env.CPM_RECAPTURE_LIVE?[]:['light','dark']){
  const baseScene=await open(theme,1440);
  for(const width of [1440,1024,2560,768,390,320]){
   const {page}=baseScene;await page.setViewportSize({width,height:1100});
   if(await page.locator('#cpm-search-input').inputValue())await page.getByRole('button',{name:'Limpar busca',exact:true}).click();
   await page.waitForFunction(()=>document.querySelectorAll('.cpm-search-result').length===3);
   await page.locator('#cpm-search-input').blur();await capture(page,theme+'-initial-'+width);
   await search(page);assert.equal(await page.locator('.cpm-search-result').count(),5);await capture(page,theme+'-results-'+width);
  }
  await baseScene.context.close();
  for(const width of [1440,390]){
   const {page,context}=await open(theme,width);await search(page);
   for(const [kind,label]of [['Club','Clubes'],['Player','Jogadores'],['News','Notícias']]){await page.getByRole('button',{name:new RegExp('^'+label+'\\s*\\d')}).click();assert.equal(await page.locator('.cpm-search-group').count(),1);await capture(page,theme+'-'+kind+'-'+width);}
   await context.close();
   for(const variant of ['empty','loading','partial','unavailable']){const {page,context,recover}=await open(theme,width,variant==='empty'?'normal':variant);if(variant!=='unavailable')await search(page,variant==='empty'?'nohit':'aurora',variant==='loading');await capture(page,theme+'-'+variant+'-'+width);
    if(variant==='partial'){assert.equal(await page.locator('.cpm-search-result').count(),3);recover();await page.getByRole('button',{name:'Tentar novamente',exact:true}).click();await page.locator('.cpm-search-group[aria-label="Jogadores"] .cpm-search-result').first().waitFor();}
    if(variant==='unavailable'){assert.ok(await page.locator('#cpm-search-input').isDisabled());recover();await page.getByRole('button',{name:'Tentar novamente',exact:true}).click();await page.locator('.cpm-search-result').first().waitFor();}
    await context.close();
   }
  }
  const long=await open(theme,320,'long');await search(long.page);assert.equal(await long.page.locator('.cpm-search-result').getAttribute('aria-label'),data.News[0].title.replace(data.News[0].title,'Aurora anuncia o calendário completo de jogos da temporada e confirma a participação do elenco na próxima fase do Campeonato Paulista de MamoBall'));await capture(long.page,theme+'-long-320');await long.context.close();
 }
 if(!process.env.CPM_RECAPTURE_LIVE){
 for(const variant of ['pagination','pagination-error']){const {page,context,recover}=await open('light',390,variant);await search(page);assert.equal(await page.locator('.cpm-search-result').count(),8);await page.getByRole('button',{name:'Ver mais jogadores'}).click();if(variant==='pagination-error'){await page.getByRole('button',{name:'Tentar carregar mais'}).waitFor();assert.equal(await page.locator('.cpm-search-result').count(),8);recover();await page.getByRole('button',{name:'Tentar carregar mais'}).click();}await page.waitForFunction(()=>document.querySelectorAll('.cpm-search-result').length===16);await page.getByRole('button',{name:'Ver mais jogadores'}).click();await page.waitForFunction(()=>document.querySelectorAll('.cpm-search-result').length===20);assert.equal(await page.locator('.cpm-search-more').count(),0);checks.push(variant);await context.close();}
 const {page,context}=await open('light',390);await search(page);await page.getByRole('button',{name:/^Jogadores\s*\d/}).click();const result=page.locator('.cpm-search-result').first();assert.equal(await result.getAttribute('href'),'/clube/aurora');await result.focus();await page.keyboard.press('Tab');await page.keyboard.press('Shift+Tab');assert.equal(await result.evaluate(e=>getComputedStyle(e).outlineStyle),'solid');await page.keyboard.press('Enter');await page.waitForFunction(()=>document.querySelector('.app-root').dataset.surface==='club');await page.goBack();await page.locator('.cpm-search-result').first().waitFor();assert.equal(await page.locator('#cpm-search-input').inputValue(),'aurora');assert.equal(await page.getByRole('button',{name:/^Jogadores\s*\d/}).getAttribute('aria-pressed'),'true');await page.getByRole('button',{name:'Limpar busca',exact:true}).click();assert.equal(await page.locator('#cpm-search-input').inputValue(),'');assert.ok(await page.locator('#cpm-search-input').evaluate(e=>e===document.activeElement));await page.locator('#cpm-search-input').fill('old');await page.waitForTimeout(400);await page.locator('#cpm-search-input').fill('nohit');await page.getByRole('heading',{name:'Nenhum resultado'}).waitFor();await page.waitForTimeout(1100);assert.equal(await page.locator('.cpm-search-result').count(),0);await page.keyboard.press('Escape');await page.locator('.cpm-home').waitFor();checks.push('keyboard, focus, destination, history, clear, cancellation');await context.close();
 }
 for(const theme of process.env.CPM_RECAPTURE_LIVE?[process.env.CPM_RECAPTURE_LIVE]:['light','dark']){const live=await open(theme,1440,'normal',true);for(const [q,expected]of [['RMA','Real Madrid'],['real madird','Real Madrid'],['madrid real','Real Madrid'],['#IDJ1','Jogador1'],['atenção','ATENCAO']]){await search(live.page,q);await live.page.locator('.cpm-search-result-title',{hasText:expected}).first().waitFor();}await capture(live.page,'live-'+theme);await live.context.close();}if(!checks.includes('live tag, typo, unordered words, hash ID, accented news'))checks.push('live tag, typo, unordered words, hash ID, accented news');
 assert.equal(errors.length,0,JSON.stringify(errors));fs.writeFileSync(out+'/report.json',JSON.stringify({captures,checks,errors},null,2));console.log('PASS',captures.length,'captures',checks);
}finally{await browser.close();}
