import {chromium} from 'playwright';
import fs from 'node:fs';
import assert from 'node:assert/strict';
const out='.impeccable/review/auth-library-implementation';fs.mkdirSync(out,{recursive:true});
const browser=await chromium.launch({executablePath:'/home/essiquatru/.agent-browser/browsers/chrome-154.0.8037.92/chrome',args:['--no-sandbox']});
const errors=[],captures=fs.readdirSync(out).filter(name=>/^(light|dark)-.*\.png$/.test(name)).map(name=>name.slice(0,-4)),checks=[];
const clubs=[{id:'aurora',nome:'Aurora FC',tag:'AUR',color:'#11151B',color2:'#fff',logo_url:null},{id:'uniao',nome:'Atlético Paulista',tag:'ATP',color:'#11151B',color2:'#fff',logo_url:null}];
const competitions=[{id:'paulista',nome:'Liga Paulista',edicao:'Temporada 2026',status:'em_andamento',rodada_atual:4,total_rodadas:10,classification_format:'league'}];
const matches=[{id:101,competition_id:'paulista',home_id:'aurora',away_id:'uniao',score_h:null,score_a:null,status:'agendado',rodada:8,date_str:'06 out',stage:'Liga',scheduled_at:'2026-10-06T23:30:00Z'}];
const news=[{id:'news1',title:'Inscrições da próxima temporada',excerpt:'',body:'Texto de demonstração',date_str:'06 out',tag:'CPM',published:true}];
const notices=[['Horários da rodada atualizados','Confira os novos horários.','jogos'],['Inscrições abertas','Veja as competições disponíveis.','subscription'],['Regulamento atualizado','Consulte as regras da temporada.','rules']].map(([title,excerpt,destination],i)=>({id:`00000000-0000-4000-8000-00000000000${i+1}`,title,excerpt,body:i===0?'Os horários da rodada 8 foram atualizados. Confira a programação antes da sua partida.':'Confira as informações da CPM.',destination,destination_id:null,published_at:['2026-10-06T21:00:00Z','2026-10-05T15:00:00Z','2026-10-04T13:00:00Z'][i],created_at:'2026-10-06T12:00:00Z',created_by:null}));
const uid='00000000-0000-4000-8000-000000000099';
const user={id:uid,aud:'authenticated',role:'authenticated',email:'teste@example.com',email_confirmed_at:new Date().toISOString(),user_metadata:{nick:'aurora10'},app_metadata:{provider:'email',providers:['email']},created_at:new Date().toISOString()};
const jwt=()=>Buffer.from(JSON.stringify({alg:'HS256',typ:'JWT'})).toString('base64url')+'.'+Buffer.from(JSON.stringify({sub:uid,exp:Math.floor(Date.now()/1000)+3600,role:'authenticated'})).toString('base64url')+'.test';
const session=()=>({access_token:jwt(),token_type:'bearer',expires_in:3600,expires_at:Math.floor(Date.now()/1000)+3600,refresh_token:'test',user});
async function open(theme,width,path='/entrar',variant='normal'){
 const context=await browser.newContext({viewport:{width,height:900},colorScheme:theme,timezoneId:'America/Sao_Paulo',reducedMotion:'reduce'}),page=await context.newPage();
 let announcementRows=notices.map(item=>({...item}));let fail=variant==='error',authCalls=0,readIDs=new Set(),savedKeys=['favcomp:paulista','club:aurora','club:uniao','match:101','art:news1'];
 page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(({theme,keys,uid,variant})=>{localStorage.setItem('cpm_theme',theme);localStorage.setItem('cpm_cookie_consent','accepted');if(!localStorage.getItem('cpm_test_seed')){localStorage.setItem('cpm_test_seed','1');localStorage.setItem('cpm_fav_clubs',JSON.stringify(['aurora','uniao']));localStorage.setItem('cpm_fav_comps',JSON.stringify(['paulista']));localStorage.setItem('cpm_bookmarks',JSON.stringify(['match:101','art:news1']));localStorage.setItem('cpm_read_announcements',JSON.stringify(['00000000-0000-4000-8000-000000000003']));}let options;window.turnstile={render:(el,opts)=>{options=opts;if(variant!=='security')setTimeout(()=>opts.callback('test-only-token'),0);return 'mock';},reset:()=>{if(variant!=='security')setTimeout(()=>options?.callback('test-only-token'),0);},remove:()=>{}};}, {theme,keys:savedKeys,uid,variant});
 await page.route('**/auth/v1/**',async route=>{
  const url=new URL(route.request().url()),endpoint=url.pathname.split('/').at(-1);const data=route.request().postDataJSON();
  if(['token','verify','otp'].includes(endpoint))authCalls++;
  if(endpoint==='otp')return route.fulfill({json:{}});
  if(endpoint==='verify'&&data?.token!=='12345678')return route.fulfill({status:403,json:{msg:'Token expired',error_code:'otp_expired'}});
  if(endpoint==='token'&&data?.password==='wrong')return route.fulfill({status:400,json:{msg:'Invalid login credentials',error_code:'invalid_credentials'}});
  return route.fulfill({json:endpoint==='user'?user:endpoint==='logout'?{}:session()});
 });
 await page.route('**/rest/v1/**',async route=>{
  const request=route.request(),url=new URL(request.url()),table=url.pathname.split('/').at(-1);
  if(table==='announcements'&&request.method()==='POST'){const values=request.postDataJSON();announcementRows.push({...values,id:'00000000-0000-4000-8000-000000000050',created_at:new Date().toISOString(),created_by:uid});return route.fulfill({status:201,json:[]});}
  if(table==='announcements'&&request.method()==='PATCH'){const id=url.searchParams.get('id')?.replace(/^eq\./,'');announcementRows=announcementRows.map(item=>item.id===id?{...item,...request.postDataJSON()}:item);return route.fulfill({json:[]});}
  if(table==='announcements'&&fail)return route.fulfill({status:503,json:{message:'offline'}});
  if(variant==='loading'&&['announcements','clubs'].includes(table))await new Promise(r=>setTimeout(r,2500));
  if(table==='announcement_reads'){
   if(request.method()==='POST'){for(const row of request.postDataJSON())readIDs.add(row.announcement_id);return route.fulfill({status:201,json:[]});}
   return route.fulfill({json:[...readIDs].map(announcement_id=>({announcement_id}))});
  }
  if(table==='bookmarks'){
   if(request.method()==='POST'){savedKeys.push(request.postDataJSON().key);return route.fulfill({status:201,json:[]});}
   if(request.method()==='DELETE'){if(variant==='bookmark-error')return route.fulfill({status:503,json:{message:'offline'}});savedKeys=savedKeys.filter(k=>k!==url.searchParams.get('key')?.replace(/^eq\./,''));return route.fulfill({status:204});}
   return route.fulfill({json:savedKeys.map(key=>({key}))});
  }
  if(table==='profiles')return route.fulfill({json:request.method()==='PATCH'?[]:{id:uid,nick:'aurora10',role:variant==='staff'?'staff':'torcedor'}});
  const tables={clubs,competitions,matches,news,announcements:variant==='empty'?[]:announcementRows.filter(item=>url.searchParams.has('published_at')?!!item.published_at:true),players:[],standings:[],scorers:[],inscricoes:[],bracket_ties:[]};
  let rows=tables[table]??[];const ids=url.searchParams.get('id');if(ids?.startsWith('in.')){const selected=ids.slice(4,-1).split(',').map(id=>id.replaceAll('"',''));rows=rows.filter(r=>selected.includes(String(r.id)));}
  return route.fulfill({json:rows});
 });
 await page.goto('http://localhost:3000'+path,{waitUntil:'domcontentloaded',timeout:60000});await page.evaluate(()=>document.fonts.ready);
 await page.locator(path==='/entrar'?'.cpm-auth':'.cpm-library').waitFor();await page.waitForTimeout(350);
 return {page,context,recover:()=>{fail=false;},calls:()=>authCalls,readIDs};
}
async function capture(page,name){
 if(await page.locator('.cpm-library').count())await page.setViewportSize({width:page.viewportSize().width,height:Math.max(1000,await page.locator('.cpm-library').evaluate(e=>e.scrollHeight+88))});
 await page.evaluate(()=>{document.querySelector('.scroll').scrollTop=0;});await page.mouse.move(0,0);await page.locator('input:focus').evaluateAll(es=>es.forEach(e=>e.blur()));await page.waitForTimeout(100);
 assert.equal(await page.locator('.scroll').evaluate(e=>e.scrollWidth>e.clientWidth),false,name+' overflow');
 await page.screenshot({timeout:60000,path:out+'/'+name+'.png',fullPage:true});if(!captures.includes(name))captures.push(name);
}
async function register(page,recovery=false){await page.getByRole('button',{name:recovery?'Esqueci minha senha':'Criar conta',exact:true}).click();if(!recovery)await page.getByLabel('Nick no jogo').fill('aurora10');await page.getByLabel(recovery?'E-mail da conta':'E-mail', {exact:true}).fill('teste@example.com');}
try{
 if(!process.env.CPM_FUNCTIONAL_ONLY&&!process.env.CPM_ADMIN_ONLY&&!process.env.CPM_TABLET_FIX) for(const theme of process.env.CPM_THEME?[process.env.CPM_THEME]:['light','dark']){
  if(!process.env.CPM_LIBRARY_ONLY){const login=await open(theme,1440);
  for(const width of [1440,1024,2560,768,390,320]){await login.page.setViewportSize({width,height:900});await capture(login.page,theme+'-login-'+width);}
  await login.context.close();
  for(const recovery of [false,true]){
   const scene=await open(theme,1440);await register(scene.page,recovery);const family=recovery?'recovery':'register';
   for(let stage=0;stage<3;stage++){
    for(const width of [1440,1024,2560,768,390,320]){await scene.page.setViewportSize({width,height:900});await capture(scene.page,theme+'-'+family+'-'+stage+'-'+width);}
    if(stage===0){await scene.page.getByRole('button',{name:'Enviar código',exact:true}).click();await scene.page.getByLabel('Código de 8 dígitos',{exact:true}).waitFor();}
    if(stage===1){await scene.page.getByLabel('Código de 8 dígitos',{exact:true}).fill('12345678');await scene.page.getByRole('button',{name:'Verificar código',exact:true}).click();await scene.page.getByLabel(recovery?'Nova senha':'Crie sua senha',{exact:true}).waitFor();}
   }
   await scene.page.getByLabel(recovery?'Nova senha':'Crie sua senha',{exact:true}).fill('SecurePassword123!');await scene.page.getByRole('button',{name:recovery?'Salvar nova senha':'Criar conta',exact:true}).click();await scene.page.locator('.cpm-home').waitFor();checks.push(theme+' '+family+' complete');await scene.context.close();
  }
  }
  for(const surface of ['saved','notices','detail']){
   const path=surface==='saved'?'/salvos':surface==='notices'?'/avisos':'/avisos/'+notices[0].id;
   const scene=await open(theme,1440,path);await scene.page.getByText(surface==='saved'?'Liga Paulista':surface==='notices'?notices[0].title:notices[0].body,{exact:true}).waitFor();
   for(const width of [1440,1024,2560,768,390,320]){await scene.page.setViewportSize({width,height:900});await capture(scene.page,theme+'-'+surface+'-'+width);}
   if(surface==='saved'){await scene.page.getByRole('button',{name:'Remover Aurora FC dos salvos'}).click();assert.equal(await scene.page.getByRole('button',{name:'Remover Aurora FC dos salvos'}).count(),0);await scene.page.getByRole('button',{name:'Desfazer'}).click();await scene.page.getByRole('button',{name:'Remover Aurora FC dos salvos'}).waitFor();checks.push(theme+' remove undo');}
   if(surface==='notices'){await scene.page.getByRole('button',{name:'Marcar como lidos'}).click();await scene.page.getByRole('button',{name:'Tudo lido'}).waitFor();await scene.page.getByRole('button',{name:/^Não lidos/}).click();await scene.page.getByRole('heading',{name:'Tudo lido'}).waitFor();checks.push(theme+' mark all read');}
   await scene.context.close();
  }
  const error=await open(theme,390,'/avisos','error');await error.page.getByRole('heading',{name:'Não foi possível carregar'}).waitFor();await capture(error.page,theme+'-notices-error-390');error.recover();await error.page.getByRole('button',{name:'Tentar novamente'}).click();await error.page.getByText(notices[0].title,{exact:true}).waitFor();await error.context.close();
  const empty=await open(theme,390,'/avisos','empty');await empty.page.getByRole('heading',{name:'Nenhum aviso por aqui'}).waitFor();await capture(empty.page,theme+'-notices-empty-390');await empty.context.close();
 }
 const bad=await open('light',390);await bad.page.getByLabel('E-mail',{exact:true}).fill('teste@example.com');await bad.page.getByLabel('Senha',{exact:true}).fill('wrong');await bad.page.getByRole('button',{name:'Mostrar senha'}).click();assert.equal(await bad.page.getByLabel('Senha',{exact:true}).getAttribute('type'),'text');await bad.page.getByRole('button',{name:'Entrar',exact:true}).click();await bad.page.getByRole('alert').filter({hasText:'E-mail ou senha incorretos.'}).waitFor();await capture(bad.page,'light-login-error-390');await bad.context.close();checks.push('password visibility; invalid credentials; retry; numeric OTP; responsive no overflow');
 if(process.env.CPM_FUNCTIONAL_ONLY){
 const otp=await open('light',390);await register(otp.page);await otp.page.getByRole('button',{name:'Enviar código',exact:true}).click();await otp.page.getByLabel('Código de 8 dígitos',{exact:true}).fill('87654321');await otp.page.getByRole('button',{name:'Verificar código',exact:true}).click();await otp.page.getByRole('alert').filter({hasText:'Código inválido ou expirado.'}).waitFor();await capture(otp.page,'light-register-invalid-code-390');await otp.page.getByLabel('Código de 8 dígitos',{exact:true}).evaluate(element=>{const data=new DataTransfer();data.setData('text','1234 5678');element.dispatchEvent(new ClipboardEvent('paste',{bubbles:true,clipboardData:data}));});assert.equal(await otp.page.getByLabel('Código de 8 dígitos',{exact:true}).inputValue(),'12345678');await otp.context.close();checks.push('OTP rejection and numeric sanitization');
 const saved=await open('light',390,'/salvos');await saved.page.getByRole('button',{name:'Remover Aurora FC dos salvos'}).waitFor();await saved.page.getByRole('button',{name:'Remover Aurora FC dos salvos'}).click();await saved.page.reload();await saved.page.getByText('Liga Paulista',{exact:true}).waitFor();assert.equal(await saved.page.getByRole('button',{name:'Remover Aurora FC dos salvos'}).count(),0);await saved.page.getByRole('button',{name:/^Clubes/}).click();await saved.page.getByRole('button',{name:/Atlético Paulista.*ATP/}).click();await saved.page.waitForFunction(()=>document.querySelector('.app-root').dataset.surface==='club');await saved.page.goBack();await saved.page.getByRole('button',{name:/^Clubes/}).waitFor();await saved.page.waitForFunction(()=>[...document.querySelectorAll('.cpm-library-filter')].some(button=>button.textContent.startsWith('Clubes')&&button.getAttribute('aria-pressed')==='true'));await saved.context.close();checks.push('guest saved persistence; filter preserved across browser history');
 const account=await open('light',390,'/entrar','bookmark-error');await account.page.getByLabel('E-mail',{exact:true}).fill('teste@example.com');await account.page.getByLabel('Senha',{exact:true}).fill('SecurePassword123!');await account.page.getByRole('button',{name:'Entrar',exact:true}).click();await account.page.locator('.cpm-home').waitFor();await account.page.goto('http://localhost:3000/salvos');await account.page.getByRole('button',{name:'Remover Aurora FC dos salvos'}).waitFor();await account.page.getByRole('button',{name:'Remover Aurora FC dos salvos'}).click();await account.page.getByRole('button',{name:'Remover Aurora FC dos salvos'}).waitFor();await account.page.goto('http://localhost:3000/avisos/'+notices[0].id);await account.page.getByText('Lido',{exact:true}).waitFor();assert.ok(account.readIDs.has(notices[0].id));await account.page.reload();await account.page.getByText('Lido',{exact:true}).waitFor();await account.context.close();checks.push('account favorite rollback on server failure; account read-one persists across reload');
 const empty=await open('light',390,'/salvos');await empty.page.evaluate(()=>{for(const key of ['cpm_fav_clubs','cpm_fav_comps','cpm_bookmarks'])localStorage.setItem(key,'[]');});await empty.page.reload();await empty.page.getByRole('heading',{name:'Nada salvo ainda'}).waitFor();await capture(empty.page,'light-saved-empty-390');await empty.context.close();
 const unavailable=await open('light',390,'/salvos');await unavailable.page.evaluate(()=>localStorage.setItem('cpm_bookmarks','["art:deleted"]'));await unavailable.page.reload();await unavailable.page.getByRole('button',{name:/Item indisponível.*Notícia/}).click();await unavailable.page.getByRole('heading',{name:'Item indisponível'}).waitFor();await capture(unavailable.page,'light-saved-unavailable-390');await unavailable.page.getByRole('button',{name:'Voltar aos salvos'}).click();await unavailable.page.getByText('Liga Paulista',{exact:true}).waitFor();await unavailable.context.close();checks.push('empty and removed resource states');
 }
 if(process.env.CPM_ADMIN_ONLY){
 const staff=await open('light',1440,'/entrar','staff');await staff.page.getByLabel('E-mail',{exact:true}).fill('teste@example.com');await staff.page.getByLabel('Senha',{exact:true}).fill('SecurePassword123!');await staff.page.getByRole('button',{name:'Entrar',exact:true}).click();await staff.page.locator('.cpm-home').waitFor();await staff.page.getByRole('button',{name:'Menu da conta',exact:true}).click();await staff.page.getByRole('menuitem',{name:'Painel staff',exact:true}).click();await staff.page.getByRole('button',{name:'Avisos',exact:true}).click();await staff.page.getByLabel('Título',{exact:true}).fill('Aviso de teste do editor');await staff.page.getByLabel('Aviso',{exact:true}).fill('Conteúdo de teste controlado.');await staff.page.getByRole('button',{name:'Salvar rascunho',exact:true}).click();await staff.page.getByText('Rascunho',{exact:true}).waitFor();const card=staff.page.locator('div').filter({has:staff.page.getByText('Aviso de teste do editor',{exact:true})}).filter({has:staff.page.getByRole('button',{name:'Editar',exact:true})}).last();await card.getByRole('button',{name:'Editar',exact:true}).click();await staff.page.getByRole('button',{name:'Publicar aviso',exact:true}).click();await staff.page.waitForFunction(()=>!document.body.textContent.includes('Rascunho'));await staff.page.goto('http://localhost:3000/avisos');await staff.page.getByText('Aviso de teste do editor',{exact:true}).waitFor();await staff.context.close();checks.push('staff draft/create/edit/publish and public inbox visibility (controlled adapter only)');
 }
 if(process.env.CPM_TABLET_FIX){for(const theme of ['light','dark']){const scene=await open(theme,768,'/avisos');await scene.page.getByText(notices[0].title,{exact:true}).waitFor();assert.equal(await scene.page.locator('.cpm-library-notice-row').first().evaluate(el=>el.getBoundingClientRect().top),300);await capture(scene.page,theme+'-notices-768');await scene.context.close();}checks.push('Avisos tablet first-row y300 in both themes');}
 assert.equal(errors.length,0,JSON.stringify(errors));fs.writeFileSync(out+'/report.json',JSON.stringify({captures,checks,errors,fixture:true},null,2));console.log('PASS',captures.length,'captures',checks);
}finally{await browser.close();}
