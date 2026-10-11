import { chromium } from 'playwright';
import fs from 'node:fs';
import assert from 'node:assert/strict';

// Fixtures are intercepted in this browser only; no database mutations are sent.
const out = '.impeccable/review/news-feedback';
fs.mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ executablePath: '/home/essiquatru/.agent-browser/browsers/chrome-154.0.8037.92/chrome', args: ['--no-sandbox'] });
const errors = [], captures = [], checks = [];
const news = [
  { id: 'news1', title: 'A nova rodada já tem data', excerpt: 'Os jogos da rodada 6 estão definidos.', body: 'A rodada 6 da Liga Paulista será disputada no dia 8 de outubro. Os horários e confrontos estão disponíveis na aba Jogos.\n\nClubes e jogadores podem acompanhar a programação e consultar os detalhes de cada partida pelo site da CPM.', category: 'noticia', date_str: '04 out 2026', read_time: '3 min', author: 'CPM', img: '/test-news-cover.png', tag: 'Notícia', published: true, competition_id: 'liga' },
  { id: 'news2', title: 'Aurora vence por 3 a 1', excerpt: 'Aurora FC · Atlético Paulista', body: 'Aurora FC e Atlético Paulista se enfrentaram pela rodada 6.', category: 'resultado', date_str: '04 out', read_time: '2 min', author: 'CPM', img: null, published: true, match_id: 124, competition_id: 'liga' },
  { id: 'news3', title: 'Inscrições da Liga Paulista', excerpt: 'Liga Paulista 2026', body: 'A Liga Paulista 2026 abriu as inscrições.', category: 'inscricoes', date_str: '03 out', read_time: '1 min', author: 'CPM', img: null, published: true, competition_id: 'open' },
  { id: 'news4', title: 'Rodada 7: novo horário', excerpt: 'CPM MamoBall', body: 'A programação da rodada 7 foi atualizada.', category: 'comunicado', date_str: '02 out', read_time: '1 min', author: 'CPM', img: null, published: true, competition_id: 'liga' },
];
const clubs = [{ id: 'aurora', nome: 'Aurora FC', tag: 'AUR', color: '#11151B', logo_url: null }, { id: 'atletico', nome: 'Atlético Paulista', tag: 'ATP', color: '#11151B', logo_url: null }];
const competitions = [{ id: 'liga', nome: 'Liga Paulista', edicao: '2026', status: 'em_andamento', rodada_atual: 6, total_rodadas: 14, classification_format: 'league' }, { id: 'open', nome: 'Liga Paulista', edicao: '2026', status: 'inscricoes', rodada_atual: 1, total_rodadas: 14, classification_format: 'league' }];
const matches = [{ id: 124, competition_id: 'liga', home_id: 'aurora', away_id: 'atletico', score_h: 3, score_a: 1, status: 'finalizado', rodada: 6, date_str: '04 out 2026', stage: 'Fase de grupos', home_scorers: [], away_scorers: [], is_wo: false }];
const uid = '00000000-0000-4000-8000-000000000099';
const user = { id: uid, aud: 'authenticated', role: 'authenticated', email: 'fixture@example.com', email_confirmed_at: new Date().toISOString(), user_metadata: { nick: 'Fixture' }, app_metadata: { provider: 'email', providers: ['email'] }, created_at: new Date().toISOString() };
const token = Buffer.from('{"alg":"HS256","typ":"JWT"}').toString('base64url') + '.' + Buffer.from(JSON.stringify({ sub: uid, exp: Math.floor(Date.now() / 1000) + 3600, role: 'authenticated' })).toString('base64url') + '.fixture';
const session = { access_token: token, refresh_token: 'fixture', token_type: 'bearer', expires_at: Math.floor(Date.now() / 1000) + 3600, expires_in: 3600, user };
const env = fs.readFileSync('.env.local', 'utf8');
const storageKey = 'sb-' + new URL(env.match(/^NEXT_PUBLIC_SUPABASE_URL\s*=\s*([^\r\n]+)/m)[1].replaceAll('"', '').replaceAll("'", '').trim()).hostname.split('.')[0] + '-auth-token';

async function open(theme, width, path = '/noticias', variant = 'normal', authenticated = false) {
  const context = await browser.newContext({ viewport: { width, height: 1000 }, colorScheme: theme, reducedMotion: 'reduce' });
  const page = await context.newPage();
  page.on('pageerror', error => errors.push(error.message));
  let failed = variant === 'error', bookmarkFailure = variant === 'save-error', keys = [], mutations = 0;
  await page.addInitScript(({ theme, authenticated, storageKey, session, variant }) => {
    localStorage.setItem('cpm_theme', theme);
    localStorage.setItem('cpm_cookie_consent', variant === 'session' ? 'declined' : 'accepted');
    if (authenticated) localStorage.setItem(storageKey, JSON.stringify(session));
    Object.defineProperty(navigator, 'share', { configurable: true, value: undefined });
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: async value => { window.__copied = value; } } });
  }, { theme, authenticated, storageKey, session, variant });
  await page.route('**/test-news-cover.png', route => route.fulfill({ contentType: 'image/png', body: fs.readFileSync('design/news-feedback-implementation/fixtures/83-3656.png') }));
  await page.route('**/auth/v1/**', route => route.fulfill({ json: route.request().url().endsWith('/user') ? user : session }));
  await page.route('**/rest/v1/**', async route => {
    const request = route.request(), url = new URL(request.url()), table = url.pathname.split('/').at(-1), id = url.searchParams.get('id')?.replace(/^eq\./, '');
    if (table === 'bookmarks') {
      if (request.method() !== 'GET') {
        mutations++;
        await new Promise(resolve => setTimeout(resolve, 200));
        if (bookmarkFailure) return route.fulfill({ status: 503, json: { message: 'fixture unavailable' } });
        if (request.method() === 'POST') keys.push(request.postDataJSON().key);
        if (request.method() === 'DELETE') keys = keys.filter(key => key !== url.searchParams.get('key')?.replace(/^eq\./, ''));
      }
      return route.fulfill({ json: keys.map(key => ({ key })) });
    }
    if (table === 'news' && failed) return route.fulfill({ status: 503, json: { message: 'fixture unavailable' } });
    if (table === 'news' && variant === 'loading') await new Promise(resolve => setTimeout(resolve, 1500));
    let articles = news.map(item => ({ ...item }));
    if (variant === 'empty') articles = [];
    if (variant === 'filter-empty') articles = articles.slice(0, 1);
    if (variant === 'long') articles[0].title = 'A programação da próxima rodada do Campeonato Paulista de MamoBall foi atualizada para todos os clubes participantes';
    if (variant === 'no-cover' || variant === 'no-body') articles[0].img = null;
    if (variant === 'no-body') articles[0].body = '';
    if (variant === 'broken-cover') articles[0].img = '/nonexistent-upload.jpg';
    const comps = competitions.map(comp => ({ ...comp, ...(variant === 'closed' && comp.id === 'open' ? { status: 'encerrado' } : {}) }));
    let data = { news: articles, clubs, competitions: comps, matches, profiles: [{ id: uid, nick: 'Fixture', role: 'user' }], standings: [], scorers: [], inscricoes: [] }[table] ?? [];
    if (id) data = variant === 'missing' && table === 'news' ? null : data.find(item => String(item.id) === id) ?? null;
    return route.fulfill({ json: data });
  });
  await page.goto('http://localhost:3000' + path);
  await page.locator('.cpm-editorial').waitFor();
  if (variant !== 'loading') await page.locator('.cpm-editorial-loading').waitFor({ state: 'detached' });
  await page.waitForFunction(() => { const element = document.querySelector('.app-root'); return element && Object.keys(element).some(key => key.startsWith('__reactFiber$')); });
  await page.evaluate(() => {
    window.__app = () => {
      const element = document.querySelector('.app-root');
      let fiber = element[Object.keys(element).find(key => key.startsWith('__reactFiber$'))];
      while (fiber) {
        const value = fiber.memoizedProps?.value;
        if (value?.showToast && value?.saveWithFeedback) return value;
        let dependency = fiber.dependencies?.firstContext;
        while (dependency) { if (dependency.memoizedValue?.showToast && dependency.memoizedValue?.saveWithFeedback) return dependency.memoizedValue; dependency = dependency.next; }
        fiber = fiber.return;
      }
      throw new Error('App context not found by test harness');
    };
  });
  await page.waitForFunction(() => !window.__app().savedLoading);
  return { page, context, recover: () => { failed = false; bookmarkFailure = false; }, keys: () => keys, mutations: () => mutations };
}

async function capture(page, name, fit = true) {
  await page.mouse.move(0, 0);
  await page.evaluate(() => { document.querySelector('.scroll').scrollTop = 0; window.scrollTo(0, 0); });
  await page.evaluate(() => document.fonts.ready);
  if (fit) {
    const height = await page.evaluate(() => Math.ceil(document.querySelector('.cpm-editorial').getBoundingClientRect().height + document.querySelector('.cpm-header').getBoundingClientRect().height));
    await page.setViewportSize({ width: page.viewportSize().width, height: Math.max(700, height) });
  }
  await page.waitForTimeout(120);
  assert.equal(await page.evaluate(() => document.querySelector('.scroll').scrollWidth > document.querySelector('.scroll').clientWidth + 1), false, name + ' horizontal overflow');
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1), false, name + ' document overflow');
  await page.screenshot({ path: out + '/' + name + '.png', fullPage: true });
  captures.push({ name, width: page.viewportSize().width, height: page.viewportSize().height, geometry: await page.locator('.cpm-editorial').evaluate(element => ({ width: element.getBoundingClientRect().width, font: getComputedStyle(element).fontFamily })) });
}

try {
  for (const width of [1440, 1024, 2560, 768, 390, 320]) {
    for (const type of ['list', 'article']) {
      const test = await open('light', width, type === 'list' ? '/noticias' : '/noticia/news1');
      if (type === 'article') await test.page.getByRole('button', { name: 'Ver jogos', exact: true }).waitFor();
      await capture(test.page, 'light-' + type + '-' + width);
      assert.equal(await test.page.locator('.bottom-nav').count(), 0);
      await test.context.close();
    }
  }
  for (const width of [1440, 390]) {
    for (const variant of ['empty', 'filter-empty', 'error', 'loading']) {
      const test = await open('light', width, '/noticias', variant);
      if (variant === 'filter-empty') {
        if (width < 1024) { await test.page.getByRole('button', { name: 'Categoria de notícias' }).click(); await test.page.getByRole('option', { name: /Resultados/ }).click(); }
        else await test.page.getByRole('button', { name: /Resultados/ }).click();
      }
      await capture(test.page, 'light-list-' + variant + '-' + width);
      if (variant === 'error') { test.recover(); await test.page.getByRole('button', { name: 'Tentar novamente', exact: true }).click(); await test.page.locator('.cpm-editorial-lead').waitFor(); }
      await test.context.close();
    }
    for (const [id, variant] of [['news1', 'missing'], ['news1', 'no-cover'], ['news1', 'no-body'], ['news1', 'error'], ['news2', 'normal'], ['news3', 'normal'], ['news3', 'closed'], ['news4', 'normal']]) {
      const test = await open('light', width, '/noticia/' + id, variant);
      if (variant !== 'missing' && variant !== 'error') await test.page.locator('.cpm-editorial-related-loading').waitFor({ state: 'detached' });
      await capture(test.page, 'light-article-' + id + '-' + variant + '-' + width);
      if (variant === 'closed') assert.equal(await test.page.getByRole('button', { name: 'Inscrever time', exact: true }).count(), 0);
      if (id === 'news2') { await test.page.getByRole('button', { name: 'Ver partida', exact: true }).click(); await test.page.locator('.cpm-match-scoreboard').waitFor(); assert.match(test.page.url(), /partida\/124/); }
      await test.context.close();
    }
  }
  for (const path of ['/noticias', '/noticia/news1']) { const test = await open('light', 320, path, 'long'); await capture(test.page, 'light-long-' + (path === '/noticias' ? 'list' : 'article') + '-320'); await test.context.close(); }
  for (const theme of ['light', 'dark']) {
    for (const width of [320, 390, 768, 1024, 1440, 2560]) {
      const test = await open(theme, width, '/noticia/news1');
      await test.page.getByRole('button', { name: 'Salvar notícia', exact: true }).click();
      await test.page.getByRole('button', { name: 'Remover notícia dos salvos', exact: true }).click();
      await test.page.getByRole('button', { name: 'Desfazer', exact: true }).waitFor();
      await capture(test.page, theme + '-feedback-undo-' + width, false);
      await test.page.getByRole('button', { name: 'Desfazer', exact: true }).click();
      await test.page.getByRole('status').filter({ hasText: 'Item restaurado' }).waitFor();
      assert.equal(await test.page.getByRole('button', { name: 'Remover notícia dos salvos', exact: true }).getAttribute('aria-pressed'), 'true');
      await test.context.close();
    }
    for (const width of [390, 1440]) {
      const test = await open(theme, width, '/noticia/news1');
      for (const [kind, message] of [['success', 'Notícia salva'], ['restored', 'Item restaurado'], ['copied', 'Link copiado'], ['pending', 'Salvando…'], ['error', 'Não foi possível salvar a alteração.'], ['warning', 'Permissão de notificações indisponível.'], ['info', 'Salvo nesta sessão'], ['error', 'Não foi possível atualizar os dados deste clube. Confira sua conexão e tente novamente para concluir a alteração.']]) {
        await test.page.evaluate(({ kind, message }) => { const app = window.__app(); app.showToast(message, { id: 'catalog', variant: kind, ...(kind === 'error' ? { action: { label: 'Tentar novamente', onClick: () => {} } } : {}) }); }, { kind, message });
        await capture(test.page, theme + '-feedback-' + (message.startsWith('Não foi possível atualizar') ? 'long' : kind) + '-' + width, false);
        if (kind === 'pending') assert.equal(await test.page.locator('.cpm-feedback-progress span').evaluate(element => getComputedStyle(element).animationName), 'none');
      }
      await test.context.close();
    }
  }
  // Category navigation and keyboard focus recovery.
  const selector = await open('light', 390);
  await selector.page.getByRole('button', { name: 'Categoria de notícias' }).focus();
  await selector.page.keyboard.press('ArrowDown');
  await selector.page.getByRole('listbox').waitFor();
  await capture(selector.page, 'light-selector-open-390');
  await selector.page.keyboard.press('Escape');
  assert.equal(await selector.page.getByRole('button', { name: 'Categoria de notícias' }).evaluate(element => element === document.activeElement), true);
  await selector.page.getByRole('button', { name: 'Categoria de notícias' }).click();
  await selector.page.getByRole('option', { name: /Resultados/ }).click();
  await selector.page.locator('.cpm-editorial-lead').filter({ hasText: 'Aurora vence' }).waitFor();
  await selector.page.locator('.cpm-editorial-lead').click();
  await selector.page.locator('.cpm-match-scoreboard').waitFor();
  await selector.context.close();
  checks.push('Category filtering/counts, keyboard menu Escape/focus return, correct article and related match navigation');

  const cloud = await open('dark', 390, '/noticia/news1', 'save-error', true);
  await cloud.page.getByRole('button', { name: 'Salvar notícia', exact: true }).click();
  await cloud.page.locator('.cpm-action-feedback.is-pending').waitFor();
  await cloud.page.locator('.cpm-action-feedback.is-error').waitFor();
  assert.equal(await cloud.page.getByRole('button', { name: 'Salvar notícia', exact: true }).getAttribute('aria-pressed'), 'false');
  await capture(cloud.page, 'dark-save-error-real-operation-390', false);
  cloud.recover(); await cloud.page.getByRole('button', { name: 'Tentar novamente', exact: true }).click();
  await cloud.page.locator('.cpm-action-feedback.is-success').waitFor();
  assert.deepEqual(cloud.keys(), ['art:news1']);
  assert.equal(await cloud.page.locator('.cpm-feedback-message').innerText(), 'Notícia salva');
  await cloud.page.getByRole('button', { name: 'Remover notícia dos salvos', exact: true }).click();
  await cloud.page.locator('.cpm-action-feedback.is-undo').waitFor();
  assert.deepEqual(cloud.keys(), []);
  await cloud.page.getByRole('button', { name: 'Desfazer', exact: true }).click();
  await cloud.page.locator('.cpm-action-feedback.is-restored').waitFor();
  assert.deepEqual(cloud.keys(), ['art:news1']);
  assert.equal(cloud.mutations(), 4);
  await cloud.page.getByRole('button', { name: 'Fechar aviso' }).click();
  for (const [key, expected] of [['favcomp:liga', 'Competição salva'], ['match:124', 'Partida salva'], ['club:aurora', 'Clube salvo']]) {
    await cloud.page.evaluate(async key => { await window.__app().saveWithFeedback(key, true); }, key);
    await cloud.page.locator('.cpm-action-feedback.is-success').waitFor();
    assert.equal(await cloud.page.locator('.cpm-feedback-message').innerText(), expected);
    assert.ok(cloud.keys().includes(key));
    await cloud.page.getByRole('button', { name: 'Fechar aviso' }).click();
  }
  await cloud.context.close();
  checks.push('Intercepted authenticated storage: pending, failure rollback, retry, removal and real restoration; no production writes');

  const sharing = await open('light', 390, '/noticia/news1');
  await sharing.page.getByRole('button', { name: 'Compartilhar notícia' }).click();
  await sharing.page.locator('.cpm-action-feedback.is-copied').waitFor();
  assert.match(await sharing.page.evaluate(() => window.__copied), /noticia\/news1$/);
  await sharing.page.getByRole('button', { name: 'Fechar aviso' }).click();
  await sharing.page.evaluate(() => Object.defineProperty(navigator, 'share', { value: async () => { throw new DOMException('cancelled', 'AbortError'); } }));
  await sharing.page.getByRole('button', { name: 'Compartilhar notícia' }).click();
  assert.equal(await sharing.page.locator('.cpm-action-feedback').count(), 0);
  await sharing.context.close();
  checks.push('Clipboard confirms after successful copy; native sharing cancellation stays silent');

  const timing = await open('light', 1440, '/noticia/news1');
  await timing.page.clock.install();
  await timing.page.evaluate(() => window.__app().showToast('Primeiro', { id: 'first' }));
  await timing.page.locator('.cpm-action-feedback').hover();
  await timing.page.clock.fastForward(5000);
  assert.equal(await timing.page.locator('.cpm-feedback-message').innerText(), 'Primeiro');
  await timing.page.mouse.move(0, 0); await timing.page.clock.fastForward(4100);
  await timing.page.locator('.cpm-action-feedback').waitFor({ state: 'detached' });
  await timing.page.evaluate(() => { const app = window.__app(); app.showToast('Falha', { id: 'blocked', variant: 'error' }); app.showToast('Depois', { id: 'next' }); });
  await timing.page.clock.fastForward(10000);
  assert.equal(await timing.page.locator('.cpm-feedback-message').innerText(), 'Falha');
  await timing.page.getByRole('button', { name: 'Fechar aviso' }).focus();
  await timing.page.keyboard.press('Escape');
  await timing.page.locator('.cpm-feedback-message').filter({ hasText: 'Depois' }).waitFor();
  await timing.context.close();
  checks.push('Hover pauses dismissal, success expires, persistent error blocks queued arrivals, focused Escape dismisses');
  const guest = await open('light', 390, '/noticia/news1', 'session');
  await guest.page.getByRole('button', { name: 'Salvar notícia', exact: true }).click();
  await guest.page.locator('.cpm-feedback-message').filter({ hasText: 'Salvo nesta sessão' }).waitFor();
  assert.equal(await guest.page.evaluate(() => localStorage.getItem('cpm_bookmarks')), null);
  await guest.context.close();
  checks.push('Guest declined storage keeps session state and truthful acknowledgement');
  assert.deepEqual(errors, []);
  console.log('PASS:', captures.length, 'captures;', checks.length, 'functional groups; zero browser errors');
} finally {
  fs.writeFileSync(out + '/report.json', JSON.stringify({ captures, checks, errors }, null, 2));
  await browser.close();
}
