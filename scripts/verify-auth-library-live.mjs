import {chromium} from 'playwright';
import fs from 'node:fs';
import assert from 'node:assert/strict';
const out='.impeccable/review/auth-library-implementation',errors=[],checks=[];
const browser=await chromium.launch({executablePath:'/home/essiquatru/.agent-browser/browsers/chrome-154.0.8037.92/chrome',args:['--no-sandbox']});
try{for(const theme of ['light','dark']){
 const context=await browser.newContext({viewport:{width:390,height:1000},colorScheme:theme,reducedMotion:'reduce'}),page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(theme=>{localStorage.setItem('cpm_theme',theme);localStorage.setItem('cpm_cookie_consent','accepted');},theme);
 await page.goto('http://localhost:3000/avisos',{waitUntil:'domcontentloaded'});await page.getByRole('heading',{name:'Nenhum aviso por aqui'}).waitFor();await page.evaluate(()=>document.fonts.ready);await page.screenshot({path:out+'/live-'+theme+'-notices-390.png'});checks.push(theme+' real public announcements empty');
 await page.goto('http://localhost:3000/salvos',{waitUntil:'domcontentloaded'});await page.getByRole('heading',{name:'Nada salvo ainda'}).waitFor();await page.screenshot({path:out+'/live-'+theme+'-saved-390.png'});checks.push(theme+' real anonymous saved empty');await context.close();
}assert.equal(errors.length,0,JSON.stringify(errors));fs.writeFileSync(out+'/live-report.json',JSON.stringify({checks,errors,network:'real Supabase public reads; no writes or email sends'},null,2));console.log('PASS',checks);}finally{await browser.close();}
