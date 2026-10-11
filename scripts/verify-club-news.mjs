import { chromium } from 'playwright';
import fs from 'node:fs';
import assert from 'node:assert/strict';

// Synthetic data is intercepted in this browser only. No production writes or seeds.
const out = '.impeccable/review/club-news-implementation';
fs.mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ executablePath: '/home/essiquatru/.agent-browser/browsers/chrome-154.0.8037.92/chrome', args: ['--no-sandbox'] });
const errors = [], captures = [], checks = [];
const clubs = [
 { id: 'aurora', nome: 'Aurora FC', tag: 'AUR', color: '#000000', color2: '#FFFFFF', logo_url: null },
 { id: 'atletico', nome: 'Atlético Paulista', tag: 'ATP', color: '#000000', color2: '#FFFFFF', logo_url: null },
 { id: 'vila', nome: 'Vila Nova', tag: 'VLN', color: '#000000', color2: '#FFFFFF', logo_url: null },
 { id: 'uniao', nome: 'União Paulista', tag: 'UNP', color: '#000000', color2: '#FFFFFF', logo_url: null },
];
const competitions = [
 { id: 'liga', nome: 'Liga Paulista', edicao: '2026', status: 'em_andamento', rodada_atual: 6, classification_format: 'league' },
 { id: 'cup', nome: 'Copa Paulista', edicao: '2026', status: 'em_andamento', rodada_atual: 1, classification_format: 'knockout_single' },
 { id: 'cup2', nome: 'Taça CPM', edicao: '2026', status: 'em_andamento', rodada_atual: 1, classification_format: 'knockout_two_leg' },
];
const match = (id, home, away, status, h, a, date, rodada, comp = 'liga', stage = 'Liga') => ({ id, home_id: home, away_id: away, score_h: h, score_a: a, date_str: date, rodada, competition_id: comp, status, stage, home_scorers: [], away_scorers: [], is_wo: false });
const matches = [
 match(124, 'aurora', 'atletico', 'agendado', null, null, '08 out 2026 · 20h30', 6),
 match(125, 'aurora', 'vila', 'agendado', null, null, '12 out 2026', 7),
 match(123, 'aurora', 'atletico', 'finalizado', 3, 1, '04 out 2026', 5),
 match(122, 'aurora', 'vila', 'finalizado', 2, 0, '01 out 2026', 4),
 match(121, 'aurora', 'uniao', 'finalizado', 0, 2, '28 set 2026', 3),
 match(120, 'aurora', 'vila', 'finalizado', 1, 1, '25 set 2026', 2),
 match(119, 'aurora', 'uniao', 'finalizado', 2, 1, '22 set 2026', 1),
 match(201, 'aurora', 'vila', 'agendado', null, null, '08 out 2026 · 20h30', 1, 'cup', 'Semifinal'),
 match(202, 'vila', 'aurora', 'finalizado', 1, 2, '05 out 2026', 1, 'cup2', 'Semifinal · Ida'),
 match(203, 'aurora', 'vila', 'agendado', null, null, '08 out 2026 · 20h30', 1, 'cup2', 'Semifinal · Volta'),
];
const standings = [
 { club_id: 'vila', competition_id: 'liga', p: 15, sg: 9 },
 { club_id: 'atletico', competition_id: 'liga', p: 12, sg: 7 },
 { club_id: 'aurora', competition_id: 'liga', p: 10, j: 5, v: 3, e: 1, d: 1, gp: 9, gc: 5, sg: 4, form: ['V', 'E', 'D', 'V', 'V'] },
];
const players = ['Atlas', 'Nova', 'Lume', 'Vega', 'Ícaro'].map((nick, i) => ({ id: 'p' + i, club_id: 'aurora', nick, game_id: ['12345678', '23456789', '34567890', '45678901', '56789012'][i], is_captain: i === 0, posicao: ['GK', 'PV/ATK', 'MC', 'VL', 'MC'][i] }));
const scorers = players.map((player, i) => ({ nick: player.nick, game_id: player.game_id, club_id: 'aurora', competition_id: 'liga', goals: [4, 3, 2, 0, 0][i], assists: [1, 2, 3, 0, 0][i] }));
const ties = ['cup', 'cup2'].map((id, i) => ({ id: id + '-tie', competition_id: id, stage_order: 1, stage_name: 'Semifinal', tie_order: 1, home_club_id: 'aurora', away_club_id: 'vila', home_source_tie_id: null, away_source_tie_id: null, first_leg_match_id: i ? 202 : 201, second_leg_match_id: i ? 203 : null, is_bye: false }));
const news = [
 { id: 'news1', title: 'A nova rodada já tem data', excerpt: 'Os jogos da rodada 6 estão definidos.', body: 'A rodada 6 da Liga Paulista será disputada no dia 8 de outubro. Os horários e confrontos estão disponíveis na aba Jogos.\n\nClubes e jogadores podem acompanhar a programação e consultar os detalhes de cada partida pelo site da CPM.', category: 'noticia', date_str: '04 out 2026', read_time: '3 min', author: 'CPM', img: '/cpm-official.jpg', published: true, competition_id: 'liga' },
 { id: 'news2', title: 'Aurora vence por 3 a 1', excerpt: 'Aurora FC · Atlético Paulista', body: 'A partida terminou em 3 a 1 para o Aurora FC.', category: 'resultado', date_str: '04 out', read_time: '3 min', author: 'CPM', published: true, match_id: 123, competition_id: 'liga' },
 { id: 'news3', title: 'Inscrições da Liga Paulista', excerpt: 'Liga Paulista 2026', body: 'Os clubes podem enviar os dados da equipe pelo formulário de inscrição.', category: 'inscricoes', date_str: '03 out', author: 'CPM', published: true, competition_id: 'cup' },
 { id: 'news4', title: 'Rodada 7: novo horário', excerpt: 'CPM MamoBall', body: 'A programação da rodada 7 foi atualizada.', category: 'comunicado', date_str: '02 out', author: 'CPM', published: true, competition_id: 'liga' },
];
async function open(theme, width, path = '/clube/aurora', variant = 'normal') {
 console.log('OPEN', theme, width, path, variant);
 const context = await browser.newContext({ viewport: { width, height: 1000 }, colorScheme: theme, reducedMotion: 'reduce' });
 const page = await context.newPage(); let failed = variant === 'error';
 page.on('pageerror', error => errors.push(error.message));
 await page.addInitScript(theme => {
  localStorage.setItem('cpm_theme', theme); localStorage.setItem('cpm_cookie_consent', 'accepted');
  Object.defineProperty(navigator, 'share', { configurable: true, value: undefined });
  Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: async value => { window.__copied = value; } } });
 }, theme);
 await page.route('**/test-cover.png', route => route.fulfill({ contentType: 'image/png', body: fs.readFileSync(`${out}/cover-${theme}.png`) }));
 await page.route('**/rest/v1/**', async route => {
  const request = route.request(), url = new URL(request.url()), table = url.pathname.split('/').at(-1);
  assert.equal(request.method(), 'GET', 'Fixture browser must never send writes');
  if (failed && (table === 'clubs' || table === 'news')) return route.fulfill({ status: 503, json: { message: 'fixture unavailable' } });
  if (variant === 'loading' && (table === 'clubs' || table === 'news')) await new Promise(resolve => setTimeout(resolve, 2500));
  if (variant === 'roster-error' && table === 'players' || variant === 'stats-error' && table === 'scorers') return route.fulfill({ status: 503, json: { message: 'fixture unavailable' } });
  const clubRows = clubs.map(club => ({ ...club, ...(variant === 'long' && club.id === 'aurora' ? { nome: 'Associação Atlética Paulista de MamoBall' } : {}) }));
  let playerRows = players.map(player => ({ ...player, ...(variant === 'long' && player.id === 'p1' ? { nick: 'JogadorComUmNickMuitoLongo' } : {}) }));
  if (variant === 'unknown') playerRows = playerRows.map((player, i) => i === 1 ? { ...player, game_id: '', posicao: null } : player);
  let scoreRows = variant === 'unknown' ? scorers.filter(row => row.nick !== 'Nova') : scorers;
  if (variant === 'identity') { playerRows = playerRows.map(player => player.id === 'p1' ? { ...player, nick: 'Atlas' } : player); scoreRows = scorers.map(row => row.game_id === players[1].game_id ? { ...row, nick: 'Atlas' } : row); }
  let fixtures = variant === 'live' ? matches.map(item => item.id === 124 ? { ...item, status: 'ao_vivo', score_h: 3, score_a: 1 } : item) : matches;
  let data = { clubs: clubRows, competitions: competitions.map(comp => ({ ...comp, status: comp.id === 'cup' && variant === 'open' ? 'inscricoes' : comp.status })), matches: fixtures, standings, scorers: scoreRows, players: playerRows, club_competitions: competitions.map(comp => ({ club_id: 'aurora', competition_id: comp.id })), player_competitions: competitions.flatMap(comp => players.map(player => ({ player_id: player.id, competition_id: comp.id }))), competition_bracket_ties: ties, news, inscricoes: [] }[table] ?? [];
  if (variant === 'empty' && ['matches', 'players', 'standings', 'scorers', 'news'].includes(table)) data = [];
  if (variant === 'no-comp' && ['matches', 'club_competitions', 'standings', 'scorers'].includes(table)) data = [];
  if (variant === 'closed' && table === 'competitions') data = data.map(comp => ({ ...comp, status: 'encerrado' }));
  if (variant === 'no-cover' && table === 'news') data = data.map(item => ({ ...item, img: null, body: '' }));
  if (variant === 'missing' && ['clubs', 'news'].includes(table)) data = [];
  for (const [key, value] of url.searchParams) {
   if (value.startsWith('eq.')) data = data.filter(item => String(item[key]) === value.slice(3));
   if (value.startsWith('in.(')) { const values = value.slice(4, -1).split(','); data = data.filter(item => values.includes(String(item[key]))); }
  }
  if (url.searchParams.get('id')?.startsWith('eq.')) data = data[0] ?? null;
  return route.fulfill({ json: data });
 });
 await page.goto('http://localhost:3000' + path);
 await page.locator(path.startsWith('/clube/') ? '.cpm-club' : '.cpm-editorial').waitFor();
 await page.waitForFunction(() => document.querySelector('.app-root')?.dataset.theme === localStorage.getItem('cpm_theme'));
 await page.waitForTimeout(250);
 await page.locator('.cpm-cookie-banner').waitFor({ state: 'detached' });
 if (variant !== 'loading') {
  await page.locator('.cpm-club > .cpm-club-loading, .cpm-editorial-loading').waitFor({ state: 'detached' });
  if (path.startsWith('/noticia/')) await page.locator('.cpm-editorial-related-loading').waitFor({ state: 'detached' });
  if (path.startsWith('/clube/') && !['error', 'missing', 'no-comp'].includes(variant)) await page.locator('.cpm-club-participation > .cpm-club-loading').waitFor({ state: 'detached' });
 }
 return { context, page, recover: () => { failed = false; } };
}
async function capture(page, name) {
 await page.mouse.move(0, 0); await page.evaluate(() => document.fonts.ready);
 const height = await page.evaluate(() => Math.ceil((document.querySelector('.cpm-club, .cpm-editorial')?.getBoundingClientRect().height ?? 800) + document.querySelector('.cpm-header').getBoundingClientRect().height));
 await page.setViewportSize({ width: page.viewportSize().width, height: Math.max(700, height) });
 await page.evaluate(() => { document.querySelector('.scroll').scrollTop = 0; window.scrollTo(0, 0); });
 assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1 || document.querySelector('.scroll').scrollWidth > document.querySelector('.scroll').clientWidth + 1), false, name + ' overflow');
 const geometry = await page.evaluate(() => Object.fromEntries(['.cpm-club', '.cpm-club-identity', '.cpm-club-tabs', '.cpm-club-next', '.cpm-match-scoreboard', '.cpm-club-participation', '.cpm-club-campaign', '.cpm-club-recent', '.cpm-editorial', '.cpm-editorial-lead'].map(selector => { const e = document.querySelector(selector), r = e?.getBoundingClientRect(); return [selector, e ? { x: r.x, y: r.y, width: r.width, height: r.height, background: getComputedStyle(e).backgroundColor } : null]; })));
 await page.screenshot({ path: `${out}/${name}.png`, fullPage: true }); captures.push({ name, width: page.viewportSize().width, height: page.viewportSize().height, geometry });
 assert.equal(await page.locator('.bottom-nav').count(), 0);
}
try {
 // Test editorial imagery is composited using the approved native cover structure and integral official logo.
 for (const theme of ['light', 'dark']) {
  const page = await browser.newPage({ viewport: { width: 400, height: 264 } });
  await page.setContent(`<style>body{margin:0}.cover{height:264px;background:${theme === 'dark' ? '#203F6A' : '#EFF5FF'};border-radius:16px;display:grid;place-items:center}.cover img{width:128px;height:128px;object-fit:contain;background:white;border-radius:12px}</style><div class="cover"><img src="data:image/jpeg;base64,${fs.readFileSync('public/cpm-official.jpg').toString('base64')}"></div>`);
  await page.locator('img').evaluate(image => image.decode()); await page.screenshot({ path: `${out}/cover-${theme}.png` }); await page.close();
 }
 if (!process.env.CPM_STATES_ONLY) for (const theme of ['light', 'dark']) for (const width of [1440, 1024, 2560, 768, 390, 320]) {
  const test = await open(theme, width);
  for (const [tab, name] of [['Resumo', 'summary'], ['Jogos', 'games'], ['Elenco', 'roster']]) {
   await test.page.getByRole('tab', { name: tab, exact: true }).click();
   if (tab === 'Elenco') await test.page.locator('.cpm-club-roster-table').waitFor();
   await capture(test.page, `${theme}-club-${name}-${width}`);
  }
  await test.context.close();
  for (const [path, name] of [['/noticias', 'list'], ['/noticia/news1', 'article']]) { const newsTest = await open(theme, width, path); await capture(newsTest.page, `${theme}-news-${name}-${width}`); await newsTest.context.close(); }
 }
 for (const theme of ['light', 'dark']) for (const width of [1440, 390]) {
  for (const variant of ['empty', 'no-comp', 'error', 'missing', 'loading', 'long', 'unknown', 'live', 'roster-error', 'stats-error']) {
   const test = await open(theme, width, '/clube/aurora', variant);
   if (['unknown', 'roster-error', 'stats-error'].includes(variant)) await test.page.getByRole('tab', { name: 'Elenco', exact: true }).click();
   await capture(test.page, `${theme}-club-${variant}-${width}`);
   if (variant === 'error') { test.recover(); await test.page.getByRole('button', { name: 'Tentar novamente', exact: true }).click(); await test.page.locator('.cpm-club-identity').waitFor(); }
   if (variant === 'missing') assert.equal(await test.page.getByRole('heading', { name: 'Aurora FC' }).count(), 0);
   await test.context.close();
  }
  const test = await open(theme, width);
  await test.page.getByRole('button', { name: 'Competição do clube', exact: true }).click(); await capture(test.page, `${theme}-club-selector-${width}`);
  for (const [name, slug] of [['Copa Paulista 2026', 'single'], ['Taça CPM 2026', 'two-leg']]) {
   if (slug === 'two-leg') await test.page.getByRole('button', { name: 'Competição do clube', exact: true }).click();
   await test.page.getByRole('option', { name, exact: true }).click(); await test.page.locator('.cpm-club-knockout').waitFor();
   assert.equal(await test.page.locator('.cpm-club-campaign').count(), 0); await capture(test.page, `${theme}-club-${slug}-${width}`);
   await test.page.getByRole('tab', { name: 'Jogos', exact: true }).click();
   assert.equal(await test.page.locator('.cpm-club-fixture').count(), 1);
   await test.page.getByRole('button', { name: /Resultados/ }).click(); assert.equal(await test.page.locator('.cpm-club-fixture').count(), slug === 'single' ? 0 : 1);
   await test.page.getByRole('tab', { name: 'Resumo', exact: true }).click();
  }
  checks.push('Edition selection persists across tabs; league metrics absent from both knockout formats'); await test.context.close();
  for (const [path, variant, name] of [['/noticias', 'empty', 'empty'], ['/noticias', 'error', 'error'], ['/noticia/news2', 'normal', 'result'], ['/noticia/news3', 'closed', 'closed'], ['/noticia/news3', 'open', 'open'], ['/noticia/news4', 'normal', 'notice'], ['/noticia/news1', 'no-cover', 'no-cover']]) { const n = await open(theme, width, path, variant); await capture(n.page, `${theme}-news-${name}-${width}`); await n.context.close(); }
 }
 const test = await open('dark', 390);
 const tab = test.page.getByRole('tab', { name: 'Resumo', exact: true }); await tab.focus(); await tab.press('ArrowRight'); await assert.equal(await test.page.getByRole('tab', { name: 'Jogos', exact: true }).getAttribute('aria-selected'), 'true');
 await test.page.getByRole('tab', { name: 'Resumo', exact: true }).click();
 await test.page.getByRole('button', { name: 'Competição do clube', exact: true }).focus(); await test.page.keyboard.press('ArrowDown'); await test.page.keyboard.press('Escape'); assert.equal(await test.page.getByRole('button', { name: 'Competição do clube', exact: true }).getAttribute('aria-expanded'), 'false');
 await test.page.getByRole('button', { name: 'Favoritar clube', exact: true }).click(); await test.page.getByRole('button', { name: 'Remover clube dos salvos', exact: true }).waitFor(); await capture(test.page, 'dark-club-saved-390');
 await test.page.getByRole('button', { name: 'Compartilhar clube', exact: true }).click(); assert.match(await test.page.evaluate(() => window.__copied), /\/clube\/aurora$/);
 await capture(test.page, 'dark-club-copied-390'); await test.page.reload(); await test.page.getByRole('button', { name: 'Remover clube dos salvos', exact: true }).waitFor(); checks.push('Guest favorite survives reload; clipboard URL, keyboard tabs, listbox Escape work'); await test.context.close();
 const identity = await open('light', 320, '/clube/aurora', 'identity'); await identity.page.getByRole('tab', { name: 'Elenco', exact: true }).click(); const rows = identity.page.locator('tbody tr'); assert.equal(await rows.nth(0).locator('td').nth(1).innerText(), '4'); assert.equal(await rows.nth(1).locator('td').nth(1).innerText(), '3'); checks.push('Same nickname keeps separate game-ID statistics'); await identity.context.close();
 assert.deepEqual(errors, []);
 fs.writeFileSync(`${out}/report.json`, JSON.stringify({ captures, checks, errors }, null, 2)); console.log(JSON.stringify({ captures: captures.length, checks, errors }));
} catch (error) { console.error('CHECK FAILED', error, 'CAPTURES', captures.map(c => c.name).slice(-3)); throw error; } finally { await browser.close(); }
