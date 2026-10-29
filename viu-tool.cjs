#!/usr/bin/env node
// ────────────────────────────────────────────────────────────────────────
//  VIU AUTO CREATE — PRO EDITION
//  Credits : @inireii3   |   Channel : @garapinajaaaa
// ────────────────────────────────────────────────────────────────────────

const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');

// ── WARNA / EMOJI ───────────────────────────────────────────────────────
const C = {
  reset: '\x1b[0m', bold: '\x1b[1m', dim: '\x1b[2m',
  red: '\x1b[31m', green: '\x1b[32m', yellow: '\x1b[33m',
  blue: '\x1b[34m', cyan: '\x1b[36m', white: '\x1b[37m',
};
const EM = { ok: '🟢', err: '🔴', wait: '🟡', info: '🔵', acc: '👤', tok: '🔑', prox: '🌐', cap: '🧩' };

// ── LOAD .ENV ───────────────────────────────────────────────────────────
function loadEnv(file = '.env') {
  const p = path.resolve(__dirname, file);
  if (!fs.existsSync(p)) return {};
  const out = {};
  for (const raw of fs.readFileSync(p, 'utf8').split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    const i = line.indexOf('=');
    if (i < 1) continue;
    out[line.slice(0, i).trim()] = line.slice(i + 1).trim().replace(/^["']|["']$/g, '');
  }
  return out;
}
const ENV = loadEnv();
const D = {
  PROXY: 'http://residential-budget.novaproxy.io:6969',
  PUSER: '9rqbr64vxn-country-ID-session-el7c5vzuo2-time-30',
  PPASS: '8cp0i50wvd',
  CAPSOLVER_KEY: 'CAP-AE72A8E8DCF1EDE9257EEDAB2AD17162434EA71EB2CB9463055B8ED2595AF4AD',
  SITE: 'https://umc-global.viu.com/?platform=phone',
  SITEKEY_REG: '6LdwwfYpAAAAABauDi5yjKFCyMhNx8LE_tgOUH-W',
  SITEKEY_LOGIN: '6LfZQl0qAAAAAIsn7uV130PULEpZpsafJ15dgedc',
  COUNT: '1', OUT: 'results.jsonl',
};
const get = (k) => ENV[k] || process.env[k] || D[k];

const PROXY = { server: get('PROXY'), username: get('PUSER'), password: get('PPASS') };
const CK = get('CAPSOLVER_KEY');
const SITE = get('SITE');
const KEY_REG = get('SITEKEY_REG');
const KEY_LOGIN = get('SITEKEY_LOGIN');
const PW = get('PASSWORD') || 'Test1234';
const DEFAULT_COUNT = parseInt(get('COUNT'), 10) || 1;
const DEFAULT_OUT = get('OUT');

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const log = (...a) => console.log(...a);
const paint = (c, s) => `${c}${s}${C.reset}`;

function fail(msg) {
  log('');
  log(`${C.red}${C.bold}✗ ${msg}${C.reset}`);
  log(`${C.dim}  Cek file .env lalu coba lagi.${C.reset}`);
  process.exit(1);
}

// ── BANNER ──────────────────────────────────────────────────────────────
function banner() {
  const line = '─'.repeat(66);
  log('');
  log(paint(C.cyan + C.bold, `┌${line}┐`));
  log(paint(C.cyan + C.bold, '│  🎬  V I U   A U T O   C R E A T E   —   P R O   E D I T I O N  │'));
  log(paint(C.cyan + C.bold, `└${line}┘`));
  log(paint(C.dim, '   Credits : @inireii3   |   Channel : @garapinajaaaa'));
  log('');
}

function config(n) {
  log(paint(C.blue, `┌─ KONFIGURASI ${'─'.repeat(54)}`));
  log(`${paint(C.blue, '│')} ${EM.prox} Proxy      : ${paint(C.green, PROXY.server)}`);
  log(`${paint(C.blue, '│')} ${EM.acc} Target     : ${paint(C.yellow, n + ' akun')}`);
  log(`${paint(C.blue, '│')} ${EM.cap} Captcha    : ${paint(C.green, 'Capsolver v2 (invisible)')}`);
  log(`${paint(C.blue, '│')} ${EM.info} Output     : ${paint(C.green, DEFAULT_OUT || 'results.jsonl')}`);
  log(`${paint(C.blue, `└${'─'.repeat(66)}`)}`);
  log('');
}

// ── STEP LOGGER ─────────────────────────────────────────────────────────
let STEP = 0;
function step(label, ok) {
  STEP++;
  const mark = ok ? paint(C.green, '✓') : paint(C.red, '✗');
  log(`   ${paint(C.dim, String(STEP).padStart(2, '0') + '.')} ${label} ${mark}`);
}

// ── CAPTCHA ─────────────────────────────────────────────────────────────
async function solveCaptcha(sitekey) {
  const r = await fetch('https://api.capsolver.com/createTask', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      clientKey: CK,
      task: { type: 'ReCaptchaV2TaskProxyLess', websiteURL: SITE, websiteKey: sitekey, isInvisible: true },
    }),
  }).then((x) => x.json());
  if (r.errorId) throw new Error('capsolver: ' + (r.errorDescription || r.errorCode));

  for (let i = 0; i < 30; i++) {
    await sleep(3000);
    const p = await fetch('https://api.capsolver.com/getTaskResult', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clientKey: CK, taskId: r.taskId }),
    }).then((x) => x.json());
    if (p.status === 'ready') return p.solution.gRecaptchaResponse;
    if (p.errorId) throw new Error('capsolver: ' + (p.errorDescription || p.errorCode));
  }
  throw new Error('capsolver timeout');
}

// ── API ─────────────────────────────────────────────────────────────────
const API = 'https://api-gateway-global.viu.com/api';

// Retry buat error jaringan/proxy (TLS putus, socket hang up, timeout)
async function retry(fn, label, tries = 4) {
  let last;
  for (let i = 1; i <= tries; i++) {
    try { return await fn(); }
    catch (e) {
      last = e;
      const m = String(e.message || e);
      const netErr = /socket|TLS|ECONNRESET|ETIMEDOUT|EAI_AGAIN|EPIPE|aborted|reset/i.test(m);
      if (!netErr) throw e;
      if (i < tries) {
        log(`   ${EM.wait} ${label}: ${m.slice(0, 60)} — retry ${i}/${tries - 1}`);
        await sleep(3000 * i);
      }
    }
  }
  throw last;
}

async function clientToken(req) {
  const r = await retry(() => req.post(API + '/auth/token', {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    data: 'grant_type=client_credentials&deviceId=web&dataTrackingDeviceId=web&countryCode=ID&platform=browser&platformFlagLabel=Web&language=id',
    timeout: 45000,
  }), 'token');
  const j = await r.json().catch(() => ({}));
  return j.token || j.access_token || null;
}

async function createOne(req, idx, total) {
  const email = `u${Date.now()}${idx}@gmail.com`;
  const out = { email, password: PW, ok: false };
  log(`\n${EM.acc} ${paint(C.bold, `[${idx}/${total}] ${email}`)}`);

  // 1. captcha register
  let cap;
  try { cap = await solveCaptcha(KEY_REG); step('Solve reCAPTCHA register', true); }
  catch (e) { step('Solve reCAPTCHA register', false); out.err = e.message; return out; }

  // 2. register
  let reg, regT;
  try {
    const ct = await clientToken(req);
    reg = await retry(() => req.post(API + '/auth/register', {
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + ct },
      data: { email, password: PW, provider: 'email', 'g-recaptcha-response': cap },
      timeout: 45000,
    }), 'register');
    regT = await reg.text();
  } catch (e) {
    step('Register (network)', false); out.err = String(e.message).slice(0, 80); return out;
  }
  const uj = (() => { try { return JSON.parse(regT); } catch { return {}; } })();
  if (reg.status() !== 200 || !uj.identity) {
    step(`Register (HTTP ${reg.status()})`, false);
    out.err = reg.status() !== 200 ? `register ${reg.status()}` : 'no identity';
    out.raw = regT.slice(0, 200);
    return out;
  }
  step(`Register (HTTP ${reg.status()})`, true);
  out.identity = uj.identity;
  out.userId = uj.userId || uj.identity;

  // 3. captcha login
  try { cap = await solveCaptcha(KEY_LOGIN); step('Solve reCAPTCHA login', true); }
  catch (e) { step('Solve reCAPTCHA login', false); out.err = e.message; return out; }

  // 4. login
  let lg, lgT;
  try {
    const ct2 = await clientToken(req);
    lg = await retry(() => req.post(API + '/auth/login', {
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + ct2 },
      data: { email, password: PW, provider: 'email', 'g-recaptcha-response': cap },
      timeout: 45000,
    }), 'login');
    lgT = await lg.text();
  } catch (e) {
    step('Login (network)', false); out.err = String(e.message).slice(0, 80); return out;
  }
  const lj = (() => { try { return JSON.parse(lgT); } catch { return {}; } })();
  const token = lj.token || (lj.mc && lj.mc.accessToken) || null;
  step(`Login (HTTP ${lg.status()})`, !!(lg.status() === 200 && token));
  if (!token) { out.err = `login ${lg.status()}`; out.raw = lgT.slice(0, 200); return out; }
  out.accessToken = token;

  // 5. cek tier
  try {
    const st = await retry(() => req.get(API + '/subscription/status', {
      headers: { Authorization: 'Bearer ' + token }, timeout: 45000,
    }), 'tier');
    const sj = await st.json().catch(() => ({}));
    step(`Cek tier (HTTP ${st.status()})`, st.status() === 200);
    out.plan = sj.plan?.name || null;
    out.planName = sj.plan?.displayName || null;
  } catch (e) {
    step('Cek tier (network)', false);
  }

  out.ok = true;
  return out;
}

// ── MAIN ────────────────────────────────────────────────────────────────
(async () => {
  const n = parseInt(process.argv[2] || String(DEFAULT_COUNT), 10);
  const outFile = process.env.OUT || DEFAULT_OUT || 'results.jsonl';

  banner();
  if (!CK || !CK.startsWith('CAP-')) fail('CAPSOLVER_KEY kosong / tidak valid di .env');
  if (!PROXY.server) fail('PROXY kosong di .env');
  config(n);

  const results = [];
  const t0 = Date.now();

  let browser;
  try {
    browser = await chromium.launch({
      headless: false,
      args: ['--no-sandbox', '--disable-dev-shm-usage'],
      proxy: PROXY,
    });
  } catch (e) {
    fail('Gagal buka Chromium: ' + e.message + '\n  Jalankan: npx playwright-core install chromium');
  }

  const newCtx = () => browser.newContext({
    locale: 'id-ID',
    timezoneId: 'Asia/Jakarta',
    userAgent: 'Mozilla/5.0 (Linux; Android 13; SM-G991B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Mobile Safari/537.36',
    ignoreHTTPSErrors: true,
  });

  let ctx = await newCtx();
  let page = await ctx.newPage();
  let req = ctx.request;

  // buka origin dulu biar cookie/CDN kebentuk
  try { await page.goto(SITE, { waitUntil: 'domcontentloaded', timeout: 60000 }); }
  catch { /* lanjut walau gagal, request context tetap jalan */ }

  for (let i = 1; i <= n; i++) {
    let r;
    try {
      r = await createOne(req, i, n);
    } catch (e) {
      // jaring pengaman: satu akun error ga boleh matiin seluruh proses
      r = { email: `[${i}/${n}]`, ok: false, err: String(e.message || e).slice(0, 90) };
      log(`   ${EM.err} Fatal: ${r.err}`);
    }
    results.push(r);
    fs.appendFileSync(outFile, JSON.stringify(r) + '\n');

    if (r.ok) {
      log(`   ${EM.tok} Token : ${paint(C.green, r.accessToken.slice(0, 28) + '...')}`);
      log(`   ${EM.info} Tier  : ${paint(C.yellow, `${r.planName || '-'} (${r.plan || '-'})`)}`);
    } else if (r.raw) {
      log(`   ${EM.err} Server: ${paint(C.dim, r.raw)}`);
    }

    // proxy session mati / jaringan jelek → ganti context baru (cookie + socket fresh)
    const netFail = !r.ok && /socket|TLS|ECONNRESET|ETIMEDOUT|EAI_AGAIN|network/i.test(r.err || '');
    if (netFail && i < n) {
      log(`   ${EM.wait} Jaringan/proxy bermasalah — restart browser context`);
      try { await ctx.close(); } catch {}
      try {
        ctx = await newCtx();
        page = await ctx.newPage();
        req = ctx.request;
        await page.goto(SITE, { waitUntil: 'domcontentloaded', timeout: 60000 }).catch(() => {});
        log(`   ${EM.ok} Context baru siap`);
      } catch (e) {
        log(`   ${EM.err} Gagal restart context: ${String(e.message).slice(0, 80)}`);
      }
      await sleep(5000);
    }

    if (i < n) await sleep(2000);
  }

  await browser.close();

  const ok = results.filter((x) => x.ok).length;
  const fail2 = results.length - ok;
  const secs = ((Date.now() - t0) / 1000).toFixed(1);

  log('');
  log(paint(C.blue, `┌─ RINGKASAN ${'─'.repeat(56)}`));
  log(`${paint(C.blue, '│')} ${EM.ok} Sukses : ${paint(C.green, String(ok))}`);
  log(`${paint(C.blue, '│')} ${EM.err} Gagal  : ${paint(C.red, String(fail2))}`);
  log(`${paint(C.blue, '│')} ⏱  Waktu  : ${secs}s`);
  log(`${paint(C.blue, '│')} 💾 File   : ${paint(C.cyan, outFile)}`);
  log(paint(C.blue, `└${'─'.repeat(66)}`));
  log(paint(C.dim, 'Credits : @inireii3  |  Channel : @garapinajaaaa'));
  log('');
  process.exit(ok > 0 ? 0 : 1);
})();
