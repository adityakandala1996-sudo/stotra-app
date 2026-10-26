import { STRINGS } from './i18n.js';
import { toTelugu, toSimple, toPlainName, fromTelugu, nameToTelugu } from './translit.js';
import { backend, DEMO } from './backend.js';
import { CATEGORIES, STOTRAS } from './data/stotras.js';
import { COUNTRIES, findCountry, cityList, regionOf } from './data/countries.js';
import { computePanchang, todayIn } from './panchang.js';
import { buildSankalpam, SANKALPAM_MEANINGS } from './sankalpam.js';
import { GOTRAS, UNKNOWN_GOTRA, OTHER } from './data/gotras.js';
import { GOD_IMAGES } from './data/images.js';

const app = document.getElementById('app');

// Deities offered for the sankalpam ("<deity> prītyarthaṁ")
const DEITIES = ['śrī parameśvara', 'śrī mahāgaṇapati', 'śrī lakṣmī nārāyaṇa', 'śrī veṅkaṭeśvara', 'śrī satyanārāyaṇa',
  'śrī umā maheśvara', 'śrī mahālakṣmī', 'śrī durgā', 'śrī sarasvatī', 'śrī sītā rāma', 'śrī kṛṣṇa',
  'śrī āñjaneya', 'śrī subrahmaṇyeśvara', 'śrī dattātreya', 'śrī navagraha'];

const state = {
  lang: localGet('lang'),
  script: localGet('script') || 'iast', // English UI: 'iast' or 'simple'
  fontScale: Number(localGet('fontScale')) || 1,
  user: null,
  profile: null,
  showAllMeanings: localGet('showAllMeanings') === '1',
  panchangDate: null,
};

function localGet(k) { try { return localStorage.getItem(k); } catch { return null; } }
function localSet(k, v) { try { localStorage.setItem(k, v); } catch { /* storage unavailable */ } }

const t = (k) => STRINGS[state.lang || 'en'][k] ?? k;
const te = () => state.lang === 'te';

// IAST -> text in the user's script
function script(iast) {
  if (te()) return toTelugu(iast);
  return state.script === 'simple' ? toSimple(iast) : iast;
}
// Short names (tithi, masa...) -> Telugu or capitalised plain English
function nm(iast) {
  return te() ? toTelugu(iast) : toPlainName(iast);
}
// Built-in stotras are stored in IAST; imported ones in Telugu script (te_title / tt)
const stotraTitle = (s) => (te() ? (s.te_title || toTelugu(s.iast)) : s.en);
function verseText(v) {
  if (v.t) return script(v.t);
  if (te()) return v.tt.replace(/\|\|/g, '॥').replace(/\|/g, '।');
  const iast = fromTelugu(v.tt);
  return state.script === 'simple' ? toSimple(iast) : iast;
}
// Greeting / sankalpam name: Telugu script in Telugu mode, Roman letters in English mode
function displayName() {
  const p = state.profile || {};
  const en = (p.full_name || state.user?.user_metadata?.full_name || '').trim();
  if (te()) return (p.full_name_te || '').trim() || nameToTelugu(en);
  return /[\u0C00-\u0C7F]/.test(en) ? toPlainName(fromTelugu(en)) : en;
}

const verseCount = (s) => s.verses.filter((v) => !v.h && !v.note).length;
const hasMeanings = (s) => s.dynamic || s.verses.some((v) => v.en);

// Lower-cased text searched by the home search box, built once per stotra
const searchIndex = new Map();
function searchText(s) {
  if (!searchIndex.has(s.id)) {
    const titles = s.iast
      ? [s.en, s.iast, toSimple(s.iast), toTelugu(s.iast)]
      : [s.en, s.te_title, fromTelugu(s.te_title), toSimple(fromTelugu(s.te_title))];
    // Titles also without spaces, so "mantrapushpam" finds "mantra pushpamu"
    const parts = [...titles, ...titles.map((x) => (x || '').replace(/\s+/g, '')), ...s.verses.map((x) => x.t || x.tt),
      ...s.verses.filter((x) => x.note).map((x) => `${x.note.en} ${x.note.te}`)];
    searchIndex.set(s.id, parts.join('\n').toLowerCase());
  }
  return searchIndex.get(s.id);
}
const catTitle = (c) => (te() ? toTelugu(c.iast) : c.en);

function esc(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function h(html) {
  app.innerHTML = html;
  document.documentElement.lang = state.lang === 'te' ? 'te' : 'en';
  document.documentElement.style.setProperty('--text-scale', state.fontScale);
}

function userLocation() {
  const country = findCountry(state.profile?.country);
  const cities = cityList(country);
  const city = cities.find((c) => c.en === state.profile?.city) || cities[0];
  return { country, city };
}

function cityLabel(city) {
  return te() ? city.te : city.en;
}

// Gotra is stored as IAST when picked from the list, or as typed text for "Other"
// In the sankalpam the gotra follows the verse script (Telugu / IAST / simple)
function sankalpaGotra(g) {
  if (!g) return '';
  return GOTRAS.includes(g) || g === UNKNOWN_GOTRA ? script(g) : g;
}

function gotraField(current) {
  const custom = current && !GOTRAS.includes(current) && current !== UNKNOWN_GOTRA;
  const sorted = [...GOTRAS].sort((a, b) => nm(a).localeCompare(nm(b), te() ? 'te' : 'en'));
  return `
    <label>${t('gotra')}
      <select name="gotra_pick">
        <option value="">—</option>
        ${sorted.map((g) => `<option value="${g}" ${current === g ? 'selected' : ''}>${esc(nm(g))}</option>`).join('')}
        <option value="${UNKNOWN_GOTRA}" ${current === UNKNOWN_GOTRA ? 'selected' : ''}>${t('gotraUnknown')}</option>
        <option value="${OTHER}" ${custom ? 'selected' : ''}>${t('gotraOther')}</option>
      </select>
    </label>
    <label class="gotra-other" ${custom ? '' : 'hidden'}>${t('gotraOtherLabel')}
      <input name="gotra_other" value="${custom ? esc(current) : ''}">
    </label>`;
}

// English name + Telugu name; the Telugu one follows the English until the user edits it
function nameFields(en, teName) {
  return `
    <label>${t('fullName')}<input name="full_name" value="${esc(en)}" autocomplete="name"></label>
    <label>${t('fullNameTe')}<input name="full_name_te" value="${esc(teName || nameToTelugu(en))}" lang="te">
      <small class="muted">${t('fullNameTeHelp')}</small></label>`;
}

function wireNames(root) {
  const en = root.querySelector('[name=full_name]');
  const tel = root.querySelector('[name=full_name_te]');
  let edited = tel.value !== nameToTelugu(en.value);
  tel.addEventListener('input', () => { edited = true; });
  en.addEventListener('input', () => { if (!edited) tel.value = nameToTelugu(en.value); });
}

function wireGotra(root) {
  const pick = root.querySelector('[name=gotra_pick]');
  const other = root.querySelector('.gotra-other');
  pick.addEventListener('change', () => {
    other.hidden = pick.value !== OTHER;
    if (!other.hidden) other.querySelector('input').focus();
  });
}

// FormData -> profile fields, folding the two gotra inputs into one
function readProfileForm(form) {
  const f = Object.fromEntries(new FormData(form));
  f.gotra = f.gotra_pick === OTHER ? String(f.gotra_other || '').trim() : f.gotra_pick;
  delete f.gotra_pick;
  delete f.gotra_other;
  return f;
}

async function setLanguage(lang) {
  state.lang = lang;
  localSet('lang', lang);
  if (state.user && state.profile) {
    state.profile = { ...state.profile, language: lang };
    backend.saveProfile(state.user, state.profile).catch(() => { /* keep local choice */ });
  }
}

const openSections = new Set();
const panchangCache = new Map();
function panchangFor(ymd, city) {
  const key = `${city.lat},${city.lon},${ymd.y}-${ymd.m}-${ymd.d}`;
  if (!panchangCache.has(key)) panchangCache.set(key, computePanchang(ymd, city));
  return panchangCache.get(key);
}

function godImage(catId, cls = '') {
  const img = GOD_IMAGES[catId];
  return img ? `<img class="${cls}" src="${img.src}" alt="" loading="lazy">` : '';
}

// ---------------------------------------------------------------- screens

function renderLanguage() {
  h(`
    <main class="splash">
      <div class="brand">
        <div class="brand-mark">ॐ</div>
        <h1>స్తోత్ర మాల <span>Stotra Mala</span></h1>
      </div>
      <p class="muted">భాషను ఎంచుకోండి · Choose your language</p>
      <div class="lang-buttons">
        <button class="lang-btn" data-lang="te"><span class="te-big">తెలుగు</span><small>Telugu</small></button>
        <button class="lang-btn" data-lang="en"><span class="en-big">English</span><small>ఇంగ్లీష్</small></button>
      </div>
    </main>`);
  app.querySelectorAll('[data-lang]').forEach((b) => b.addEventListener('click', () => {
    state.lang = b.dataset.lang;
    localSet('lang', state.lang);
    route();
  }));
}

function renderAuth(mode = 'login', error = '') {
  const isLogin = mode === 'login';
  h(`
    <main class="splash">
      <div class="brand">
        <div class="brand-mark">ॐ</div>
        <h1>${t('appName')}</h1>
        <p class="muted">${t('tagline')}</p>
      </div>
      ${DEMO ? `<p class="notice">${t('demoMode')}</p>` : ''}
      <form class="card form" id="auth-form" novalidate>
        <div class="segmented">
          <button type="button" class="${isLogin ? 'on' : ''}" data-mode="login">${t('login')}</button>
          <button type="button" class="${!isLogin ? 'on' : ''}" data-mode="signup">${t('signup')}</button>
        </div>
        ${isLogin ? '' : `<label>${t('fullName')}<input name="name" autocomplete="name"></label>`}
        <label>${t('email')}<input name="email" type="email" autocomplete="email" required></label>
        <label>${t('password')}<input name="password" type="password" minlength="6" autocomplete="${isLogin ? 'current-password' : 'new-password'}" required></label>
        ${error ? `<p class="error">${esc(error)}</p>` : ''}
        <button class="primary" type="submit">${isLogin ? t('loginBtn') : t('signupBtn')}</button>
      </form>
      <button class="link" id="switch-lang">${te() ? 'English' : 'తెలుగు'}</button>
    </main>`);
  app.querySelectorAll('[data-mode]').forEach((b) => b.addEventListener('click', () => renderAuth(b.dataset.mode)));
  app.querySelector('#switch-lang').addEventListener('click', () => {
    state.lang = te() ? 'en' : 'te';
    localSet('lang', state.lang);
    renderAuth(mode);
  });
  app.querySelector('#auth-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const f = new FormData(e.target);
    const email = String(f.get('email')).trim();
    const password = String(f.get('password'));
    if (!/^\S+@\S+\.\S+$/.test(email) || password.length < 6) return renderAuth(mode, t('errEmail'));
    const btn = e.target.querySelector('button[type=submit]');
    btn.disabled = true;
    try {
      state.user = isLogin
        ? await backend.signIn(email, password)
        : await backend.signUp(email, password, String(f.get('name') || '').trim());
      state.profile = await backend.getProfile(state.user);
      if (!state.profile && !isLogin) {
        state.profile = { full_name: String(f.get('name') || '').trim() };
      }
      route();
    } catch (err) {
      renderAuth(mode, err.message || String(err));
    }
  });
}

function countryOptions(selected) {
  return COUNTRIES.map((c) => `<option value="${c.code}" ${c.code === selected ? 'selected' : ''}>${esc(te() ? `${c.te} (${c.en})` : c.en)}</option>`).join('');
}
function cityOptions(code, selected) {
  return cityList(findCountry(code)).map((c) => `<option value="${esc(c.en)}" ${c.en === selected ? 'selected' : ''}>${esc(te() ? `${c.te} (${c.en})` : c.en)}</option>`).join('');
}
function wireCountryCity(root) {
  const cs = root.querySelector('[name=country]');
  const ci = root.querySelector('[name=city]');
  cs.addEventListener('change', () => { ci.innerHTML = cityOptions(cs.value); });
}

function renderCountrySetup() {
  const p = state.profile || {};
  const guess = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
  const guessCountry = p.country || COUNTRIES.find((c) => c.tz === guess || c.cities.some((x) => x[4] === guess))?.code || 'IN';
  h(`
    <main class="splash">
      <div class="brand"><div class="brand-mark">🌏</div><h1>${t('selectCountry')}</h1>
      <p class="muted">${t('countryHelp')}</p></div>
      <form class="card form" id="country-form">
        <label>${t('country')}<select name="country">${countryOptions(guessCountry)}</select></label>
        <label>${t('city')}<select name="city">${cityOptions(guessCountry, p.city || cityList(findCountry(guessCountry)).find((c) => c.tz === guess)?.en)}</select></label>
        ${nameFields(p.full_name || state.user?.user_metadata?.full_name || '', p.full_name_te)}
        ${gotraField(p.gotra)}
        <button class="primary" type="submit">${t('continue')}</button>
      </form>
    </main>`);
  const form = app.querySelector('#country-form');
  wireCountryCity(form);
  wireGotra(form);
  wireNames(form);
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const f = readProfileForm(form);
    state.profile = await backend.saveProfile(state.user, { ...state.profile, ...f, language: state.lang, favorites: state.profile?.favorites || [] });
    location.hash = '#/home';
    route();
  });
}

// ---------------------------------------------------------------- shell

function shell(active, title, body, { back } = {}) {
  const tabs = [
    ['home', '📿', t('stotras')],
    ['panchang', '🗓️', t('panchangam')],
    ['fav', '★', t('favorites')],
    ['settings', '⚙︎', t('settings')],
  ];
  h(`
    <header class="topbar">
      ${back ? `<a class="icon-btn" href="${back}" aria-label="Back">‹</a>` : '<span class="brand-mini">ॐ</span>'}
      <h1>${title}</h1>
      <span class="spacer"></span>
      <button class="lang-toggle" id="lang-toggle" aria-label="${te() ? 'Switch to English' : 'తెలుగుకు మార్చండి'}">${te() ? 'English' : 'తెలుగు'}</button>
    </header>
    ${DEMO ? `<p class="notice slim">${t('demoMode')}</p>` : ''}
    <main class="content">${body}</main>
    <nav class="tabbar">
      ${tabs.map(([id, icon, label]) => `<a href="#/${id}" class="${active === id ? 'on' : ''}"><span>${icon}</span>${label}</a>`).join('')}
    </nav>`);
  app.querySelector('#lang-toggle').addEventListener('click', () => {
    const y = window.scrollY;
    setLanguage(te() ? 'en' : 'te');
    route({ keepScroll: true }).then(() => window.scrollTo(0, y));
  });
}

function todayBanner() {
  const { city } = userLocation();
  const ymd = todayIn(city.tz);
  const p = panchangFor(ymd, city);
  const loc = te() ? 'te-IN' : 'en-GB';
  const date = new Intl.DateTimeFormat(loc, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })
    .format(new Date(Date.UTC(ymd.y, ymd.m, ymd.d)));
  const tf = new Intl.DateTimeFormat(loc, { hour: 'numeric', minute: '2-digit', hour12: true, timeZone: city.tz });
  const paksha = p.tithi.paksha === 'śukla' ? (te() ? 'శుక్ల' : 'Shukla') : (te() ? 'కృష్ణ' : 'Krishna');
  const masa = `${p.masa.adhika ? `${t('adhika')} ` : ''}${nm(p.masa.name)}`;
  const item = (k, v, sub) => `<div class="tb-item"><small>${t(k)}</small><strong>${v}</strong>${sub ? `<em>${sub}</em>` : ''}</div>`;
  return `
    <a class="today-banner" href="#/panchang">
      <div class="tb-head">
        <div>
          <div class="tb-date">${esc(date)}</div>
          <div class="tb-sub">${nm(p.samvatsara)} ${te() ? 'నామ సంవత్సరం' : 'Samvatsara'} · ${esc(masa)} ${te() ? 'మాసం' : 'Masa'} · ${paksha} ${te() ? 'పక్షం' : 'Paksha'}</div>
        </div>
        <span class="tb-loc">📍 ${esc(cityLabel(city))}</span>
      </div>
      <div class="tb-grid">
        ${item('tithi', nm(p.tithi.name), `${t('till')} ${tf.format(p.tithi.end)}`)}
        ${item('nakshatra', nm(p.nakshatra.name), `${t('till')} ${tf.format(p.nakshatra.end)}`)}
        ${item('sunrise', tf.format(p.sunrise), `${t('sunset')} ${tf.format(p.sunset)}`)}
        ${item('rahu', `${tf.format(p.rahu.start)}`, `– ${tf.format(p.rahu.end)}`)}
      </div>
      <span class="tb-more">${t('fullPanchangam')} ›</span>
    </a>`;
}

const BANNER_SHLOKA = 'vakratuṇḍa mahākāya sūryakoṭi samaprabha |\nnirvighnaṁ kuru me deva sarvakāryeṣu sarvadā ||';

function renderHome() {
  // Each section expands in place to list everything it contains
  const sections = CATEGORIES.map((c) => {
    const items = STOTRAS.filter((s) => s.cat === c.id);
    const art = GOD_IMAGES[c.id] ? godImage(c.id, 'acc-img') : `<span class="acc-img acc-symbol">${c.mark}</span>`;
    return `
      <details class="acc" data-cat="${c.id}">
        <summary>${art}<span class="acc-main"><span class="acc-name">${esc(catTitle(c))}</span>
          <span class="acc-count">${items.length} ${t(items.length === 1 ? 'stotraOne' : 'stotrasCount')}</span></span>
          <span class="acc-chev">›</span></summary>
        <ul class="acc-list">${items.map((s) => `<li><a href="#/s/${s.id}">${esc(stotraTitle(s))}${state.profile?.favorites?.includes(s.id) ? ' <span class="star on">★</span>' : ''}</a></li>`).join('')}</ul>
      </details>`;
  }).join('');
  const name = displayName();
  shell('home', t('appName'), `
    <section class="ganesha-banner">
      ${godImage('ganesha', 'gb-img')}
      <div class="gb-text">
        <h2 class="greeting">🙏 ${t('namaskaram')}${name ? `, <span>${esc(name)}</span>` : ''}</h2>
        <p class="gb-shloka">${esc(script(BANNER_SHLOKA)).replace(/\n/g, '<br>')}</p>
      </div>
    </section>
    ${todayBanner()}
    <div class="search"><input id="q" type="search" placeholder="${t('search')}" autocomplete="off"></div>
    <div id="results"></div>
    <div id="cats" class="acc-wrap">${sections}</div>`);
  // Remember which sections were open while moving around the app
  app.querySelectorAll('.acc').forEach((d) => {
    if (openSections.has(d.dataset.cat)) d.open = true;
    d.addEventListener('toggle', () => (d.open ? openSections.add(d.dataset.cat) : openSections.delete(d.dataset.cat)));
  });
  const q = app.querySelector('#q');
  q.addEventListener('input', () => {
    const v = q.value.trim().toLowerCase();
    const results = app.querySelector('#results');
    const hits = v ? STOTRAS.filter((s) => searchText(s).includes(v)) : [];
    // sections stay visible when there is nothing to show instead of them
    app.querySelector('#cats').hidden = hits.length > 0;
    if (!v) { results.innerHTML = ''; return; }
    results.innerHTML = hits.length
      ? `<p class="result-count">${hits.length} ${t('resultsFound')}</p>${listHtml(hits)}`
      : emptyState('🔍', `“${esc(q.value.trim())}” — ${t('noResults')}`, t('noResultsHelp'), `<button class="chip" id="clear-q">${t('clearSearch')}</button>`);
    results.querySelector('#clear-q')?.addEventListener('click', () => {
      q.value = '';
      q.dispatchEvent(new Event('input'));
      q.focus();
    });
  });
}

function emptyState(icon, title, text, action = '') {
  return `<div class="empty card"><div class="empty-icon">${icon}</div><h2>${title}</h2><p class="muted">${text}</p>${action}</div>`;
}

function renderNotFound() {
  shell('home', t('appName'), emptyState('🙏', t('notFoundTitle'), t('notFound'), `<a class="chip" href="#/home">${t('browseStotras')}</a>`));
}

function listHtml(items) {
  return `<ul class="list">${items.map((s) => {
    const c = CATEGORIES.find((x) => x.id === s.cat);
    const fav = state.profile?.favorites?.includes(s.id);
    const nv = verseCount(s);
    const count = s.dynamic || !nv ? '' : `${nv} ${t(nv === 1 ? 'verseOne' : 'verses')}`;
    const thumb = GOD_IMAGES[c.id] ? godImage(c.id, 'li-thumb') : `<span class="cat-mark sm">${c.mark}</span>`;
    return `<li><a href="#/s/${s.id}">${thumb}<span class="li-main"><span class="li-title">${esc(stotraTitle(s))}</span><span class="li-sub">${esc(catTitle(c))}${count ? ` · ${count}` : ''}</span></span>${fav ? '<span class="star on">★</span>' : ''}<span class="chev">›</span></a></li>`;
  }).join('')}</ul>`;
}

function renderCategory(id) {
  const c = CATEGORIES.find((x) => x.id === id);
  if (!c) return renderNotFound();
  const hero = GOD_IMAGES[c.id]
    ? `<div class="cat-hero">${godImage(c.id)}<div class="cat-hero-title">${esc(catTitle(c))}</div></div>`
    : '';
  shell('home', esc(catTitle(c)), hero + listHtml(STOTRAS.filter((s) => s.cat === id)), { back: '#/home' });
}

function verseHtml(text, meaning, i, label) {
  return `
    <article class="verse">
      <div class="verse-text">${label
        ? `${esc(text.replace(/\s*(\|\||॥)\s*$/, '')).replace(/\n/g, '<br>')} <span class="vnum">${label}</span>`
        : esc(text).replace(/\n/g, '<br>')}</div>
      ${meaning ? `<details class="ardham" ${state.showAllMeanings ? 'open' : ''}>
        <summary>${t('meaning')}</summary>
        <p>${esc(meaning)}</p>
      </details>` : ''}
    </article>`;
}

function renderStotra(id) {
  const s = STOTRAS.find((x) => x.id === id);
  if (!s) return renderNotFound();
  const fav = state.profile?.favorites?.includes(id);
  let versesHtml;
  let extra = '';
  if (s.dynamic) {
    const { country, city } = userLocation();
    const ymd = todayIn(city.tz);
    const p = panchangFor(ymd, city);
    const prof = { ...state.profile, full_name: displayName(), city_label: cityLabel(city), gotra_label: sankalpaGotra(state.profile?.gotra) };
    const lines = buildSankalpam(prof, p, script, state.lang);
    versesHtml = lines.map((l, i) => verseHtml(l.text, SANKALPAM_MEANINGS[l.key][state.lang], i, '')).join('');
    const dateStr = new Intl.DateTimeFormat(te() ? 'te-IN' : 'en-GB', { dateStyle: 'full', timeZone: city.tz }).format(p.sunrise);
    extra = `<div class="card info"><strong>${t('sankalpamFor')}</strong> · ${esc(dateStr)}<br>
      <span class="muted">${esc(cityLabel(city))}, ${esc(te() ? country.te : country.en)} — ${t('sankalpamNote')}</span><br>
      <a href="#/settings" class="link">${t('editProfile')}</a></div>`;
  } else {
    // Imported texts and procedures carry their own numbering; step headings and notes are not verses
    const numbered = !s.source && !s.nonum && s.verses.length > 1;
    versesHtml = s.verses.map((v, i) => {
      if (v.h) return `<h3 class="verse-h">${esc(verseText(v))}</h3>`;
      if (v.note) return `<p class="step-note">${esc(v.note[state.lang])}</p>`;
      return verseHtml(verseText(v), v[state.lang], i, numbered ? `॥ ${i + 1} ॥` : '');
    }).join('');
  }
  const aboutText = s.about[state.lang] || s.about.te || '';
  const source = s.source
    ? `<p class="source">${t('sourceNote')} <a href="${s.source}" target="_blank" rel="noopener">${t('sourceLink')}</a> (CC BY-SA 4.0)</p>`
    : '';
  shell('home', esc(stotraTitle(s)), `
    <div class="reader-tools">
      ${hasMeanings(s) ? `<button class="chip" id="toggle-all">${state.showAllMeanings ? t('hideAllMeanings') : t('showAllMeanings')}</button>` : ''}
      <button class="chip" id="font-down" aria-label="Smaller text">A−</button>
      <button class="chip" id="font-up" aria-label="Larger text">A+</button>
      <button class="chip star ${fav ? 'on' : ''}" id="fav" aria-label="Favorite">${fav ? '★' : '☆'}</button>
    </div>
    ${GOD_IMAGES[s.cat] ? `<div class="stotra-hero">${godImage(s.cat)}</div>` : ''}
    ${aboutText || source ? `<details class="card about" ${s.about[state.lang] || !aboutText ? 'open' : ''}><summary>${t('about')}</summary>${aboutText ? `<p>${esc(aboutText)}</p>` : ''}${source}</details>` : ''}
    ${extra}
    <div class="verses ${te() ? 'te' : 'latin'}">${versesHtml}</div>`, { back: `#/cat/${s.cat}` });

  app.querySelector('#toggle-all')?.addEventListener('click', () => {
    state.showAllMeanings = !state.showAllMeanings;
    localSet('showAllMeanings', state.showAllMeanings ? '1' : '0');
    renderStotra(id);
  });
  const setScale = (d) => {
    state.fontScale = Math.min(1.8, Math.max(0.8, +(state.fontScale + d).toFixed(2)));
    localSet('fontScale', state.fontScale);
    document.documentElement.style.setProperty('--text-scale', state.fontScale);
  };
  app.querySelector('#font-down').addEventListener('click', () => setScale(-0.1));
  app.querySelector('#font-up').addEventListener('click', () => setScale(0.1));
  app.querySelector('#fav').addEventListener('click', async () => {
    const favs = new Set(state.profile?.favorites || []);
    if (favs.has(id)) favs.delete(id); else favs.add(id);
    state.profile = await backend.saveProfile(state.user, { ...state.profile, favorites: [...favs] });
    renderStotra(id);
  });
}

function renderFavorites() {
  const favs = (state.profile?.favorites || []).map((id) => STOTRAS.find((s) => s.id === id)).filter(Boolean);
  shell('fav', t('favorites'), favs.length
    ? listHtml(favs)
    : emptyState('☆', t('noFavoritesTitle'), t('noFavorites'), `<a class="chip" href="#/home">${t('browseStotras')}</a>`));
}

// ---------------------------------------------------------------- panchangam

function renderPanchang() {
  const { country, city } = userLocation();
  if (!state.panchangDate) state.panchangDate = todayIn(city.tz);
  const ymd = state.panchangDate;
  const p = panchangFor(ymd, city);
  const tf = new Intl.DateTimeFormat(te() ? 'te-IN' : 'en-GB', { hour: '2-digit', minute: '2-digit', hour12: true, timeZone: city.tz });
  const df = new Intl.DateTimeFormat(te() ? 'te-IN' : 'en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
  const dshort = new Intl.DateTimeFormat(te() ? 'te-IN' : 'en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', hour12: true, timeZone: city.tz });
  const time = (d) => (d ? tf.format(d) : '—');
  const until = (d) => `${t('till')} ${dshort.format(d)}`;
  const range = (r) => `${time(r.start)} – ${time(r.end)}`;
  const row = (k, v, sub = '') => `<div class="prow"><span class="pk">${t(k)}</span><span class="pv">${v}${sub ? `<small>${sub}</small>` : ''}</span></div>`;
  const pakshaName = p.tithi.paksha === 'śukla' ? (te() ? 'శుక్ల పక్షం' : 'Shukla Paksha') : (te() ? 'కృష్ణ పక్షం' : 'Krishna Paksha');
  const masa = `${p.masa.adhika ? `${t('adhika')} ` : ''}${nm(p.masa.name)}`;
  const isToday = JSON.stringify(ymd) === JSON.stringify(todayIn(city.tz));

  shell('panchang', t('panchangam'), `
    <div class="date-nav">
      <button class="icon-btn" id="prev" aria-label="Previous day">‹</button>
      <div class="date-label">
        <strong>${esc(df.format(new Date(Date.UTC(ymd.y, ymd.m, ymd.d))))}</strong>
        <span class="muted">📍 ${esc(cityLabel(city))}, ${esc(te() ? country.te : country.en)}</span>
      </div>
      <button class="icon-btn" id="next" aria-label="Next day">›</button>
    </div>
    <div class="row-center">
      ${isToday ? '' : `<button class="chip" id="today">${t('today')}</button>`}
      <input type="date" id="pick" class="chip" value="${ymd.y}-${String(ymd.m + 1).padStart(2, '0')}-${String(ymd.d).padStart(2, '0')}">
    </div>

    <section class="card hero">
      <div class="hero-main">${nm(p.tithi.name)}</div>
      <div class="hero-sub">${esc(masa)} ${te() ? 'మాసం' : 'Masa'} · ${pakshaName}</div>
      <div class="hero-sub muted">${nm(p.samvatsara)} ${te() ? 'నామ సంవత్సరం' : 'Samvatsara'}</div>
    </section>

    <section class="card sun">
      <div><span>🌅</span><small>${t('sunrise')}</small><strong>${time(p.sunrise)}</strong></div>
      <div><span>🌇</span><small>${t('sunset')}</small><strong>${time(p.sunset)}</strong></div>
      <div><span>🌙</span><small>${t('moonrise')}</small><strong>${time(p.moonrise)}</strong></div>
      <div><span>🌑</span><small>${t('moonset')}</small><strong>${time(p.moonset)}</strong></div>
    </section>

    <section class="card">
      ${row('samvatsara', nm(p.samvatsara))}
      ${row('ayana', nm(p.ayana))}
      ${row('ritu', nm(p.ritu))}
      ${row('masa', esc(masa))}
      ${row('paksha', pakshaName)}
      ${row('tithi', nm(p.tithi.name), `${until(p.tithi.end)}${p.tithi.next ? ` · ${t('then')} ${nm(p.tithi.next)}` : ''}`)}
      ${row('vara', `${nm(p.vara)}${te() ? 'వారం' : 'vara'}`)}
      ${row('nakshatra', nm(p.nakshatra.name), `${until(p.nakshatra.end)}${p.nakshatra.next ? ` · ${t('then')} ${nm(p.nakshatra.next)}` : ''}`)}
      ${row('yoga', nm(p.yoga.name), until(p.yoga.end))}
      ${row('karana', nm(p.karana.name), until(p.karana.end))}
      ${row('sunRashi', nm(p.sunRashi))}
      ${row('moonRashi', nm(p.moonRashi))}
    </section>

    <section class="card">
      <h3 class="card-h bad">${t('inauspicious')}</h3>
      ${row('rahu', range(p.rahu))}
      ${row('yamaganda', range(p.yamaganda))}
      ${row('gulika', range(p.gulika))}
      <h3 class="card-h good">${t('auspicious')}</h3>
      ${row('abhijit', range(p.abhijit))}
    </section>
    <p class="muted small center">${t('timesIn')} ${esc(city.tz)} · ${t('calcNote')}</p>`);

  const shift = (days) => {
    const d = new Date(Date.UTC(ymd.y, ymd.m, ymd.d + days));
    state.panchangDate = { y: d.getUTCFullYear(), m: d.getUTCMonth(), d: d.getUTCDate() };
    renderPanchang();
  };
  app.querySelector('#prev').addEventListener('click', () => shift(-1));
  app.querySelector('#next').addEventListener('click', () => shift(1));
  app.querySelector('#today')?.addEventListener('click', () => { state.panchangDate = null; renderPanchang(); });
  app.querySelector('#pick').addEventListener('change', (e) => {
    const [y, m, d] = e.target.value.split('-').map(Number);
    if (y) { state.panchangDate = { y, m: m - 1, d }; renderPanchang(); }
  });
}

// ---------------------------------------------------------------- settings

function renderSettings(msg = '') {
  const p = state.profile || {};
  const { country } = userLocation();
  const dvipas = ['jambū', 'plakṣa', 'śālmali', 'kuśa', 'krauñca', 'śāka', 'puṣkara'];
  shell('settings', t('settings'), `
    <section class="card form">
      <span class="field-label">${t('language')}</span>
      <div class="segmented" id="lang-seg">
        <button type="button" data-lang="te" class="${te() ? 'on' : ''}">తెలుగు</button>
        <button type="button" data-lang="en" class="${!te() ? 'on' : ''}">English</button>
      </div>
    </section>
    <form class="card form" id="settings-form">
      <label>${t('script')}
        <select name="script"><option value="iast" ${state.script === 'iast' ? 'selected' : ''}>IAST (śuklāmbaradharaṁ)</option><option value="simple" ${state.script === 'simple' ? 'selected' : ''}>Simple (shuklaambaradharam)</option></select>
      </label>
      <label>${t('country')}<select name="country">${countryOptions(country.code)}</select></label>
      <label>${t('city')}<select name="city">${cityOptions(country.code, p.city)}</select></label>
      ${nameFields(p.full_name || '', p.full_name_te)}
      ${gotraField(p.gotra)}
      <label>${t('deity')}
        <select name="deity">${DEITIES.map((d) => `<option value="${d}" ${(p.deity || DEITIES[0]) === d ? 'selected' : ''}>${nm(d)}</option>`).join('')}</select>
      </label>
      <label>${t('dvipa')}
        <select name="dvipa_override"><option value="">${t('auto')} (${nm(regionOf(country).dvipa)})</option>
          ${dvipas.map((d) => `<option value="${d}" ${p.dvipa_override === d ? 'selected' : ''}>${nm(d)}</option>`).join('')}
        </select>
        <small class="muted">${t('dvipaHelp')}</small>
      </label>
      ${msg ? `<p class="ok">${msg}</p>` : ''}
      <button class="primary" type="submit">${t('save')}</button>
    </form>
    <details class="card credits">
      <summary>${t('imageCredits')}</summary>
      <ul>${Object.entries(GOD_IMAGES).map(([cat, img]) => `<li><strong>${esc(catTitle(CATEGORIES.find((c) => c.id === cat)))}</strong>: <a href="${img.url}" target="_blank" rel="noopener">${esc(img.title)}</a> · ${esc(img.artist)} · ${esc(img.license)}</li>`).join('')}</ul>
      <p class="muted small">${t('creditsNote')}</p>
    </details>
    <p class="muted small center">${esc(state.user?.email || '')}</p>
    <button class="danger wide" id="logout">${t('logout')}</button>`);
  app.querySelectorAll('#lang-seg [data-lang]').forEach((b) => b.addEventListener('click', () => {
    if (b.dataset.lang === state.lang) return;
    setLanguage(b.dataset.lang);
    renderSettings();
  }));
  const form = app.querySelector('#settings-form');
  wireCountryCity(form);
  wireGotra(form);
  wireNames(form);
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const f = readProfileForm(form);
    state.script = f.script;
    localSet('script', state.script);
    delete f.script;
    state.profile = await backend.saveProfile(state.user, { ...state.profile, ...f });
    state.panchangDate = null;
    renderSettings(t('saved'));
  });
  app.querySelector('#logout').addEventListener('click', async () => {
    await backend.signOut();
    state.user = null;
    state.profile = null;
    location.hash = '';
    route();
  });
}

// ---------------------------------------------------------------- router

async function route({ keepScroll = false } = {}) {
  if (!state.lang) return renderLanguage();
  if (!state.user) {
    state.user = await backend.currentUser();
    if (state.user) state.profile = await backend.getProfile(state.user);
  }
  if (!state.user) return renderAuth();
  if (!state.profile?.country) return renderCountrySetup();
  // The language picked on this device wins; keep the profile in sync with it
  if (state.profile.language !== state.lang) setLanguage(state.lang);

  const [, view, arg] = (location.hash || '#/home').split('/');
  if (!keepScroll) window.scrollTo(0, 0);
  switch (view) {
    case 'cat': return renderCategory(arg);
    case 's': return renderStotra(arg);
    case 'panchang': return renderPanchang();
    case 'fav': return renderFavorites();
    case 'settings': return renderSettings();
    default: return renderHome();
  }
}

window.addEventListener('hashchange', () => route());
route().catch((e) => {
  app.innerHTML = `<p class="error pad">${esc(e.message || e)}</p>`;
});
