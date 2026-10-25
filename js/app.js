import { STRINGS } from './i18n.js';
import { toTelugu, toSimple, toPlainName } from './translit.js';
import { backend, DEMO } from './backend.js';
import { CATEGORIES, STOTRAS } from './data/stotras.js';
import { COUNTRIES, findCountry, cityList, regionOf } from './data/countries.js';
import { computePanchang, todayIn } from './panchang.js';
import { buildSankalpam, SANKALPAM_MEANINGS } from './sankalpam.js';

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
const stotraTitle = (s) => (te() ? toTelugu(s.iast) : s.en);
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
        <label>${t('fullName')}<input name="full_name" value="${esc(p.full_name || state.user?.user_metadata?.full_name || '')}"></label>
        <label>${t('gotra')}<input name="gotra" value="${esc(p.gotra || '')}"></label>
        <button class="primary" type="submit">${t('continue')}</button>
      </form>
    </main>`);
  const form = app.querySelector('#country-form');
  wireCountryCity(form);
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const f = Object.fromEntries(new FormData(form));
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
    </header>
    ${DEMO ? `<p class="notice slim">${t('demoMode')}</p>` : ''}
    <main class="content">${body}</main>
    <nav class="tabbar">
      ${tabs.map(([id, icon, label]) => `<a href="#/${id}" class="${active === id ? 'on' : ''}"><span>${icon}</span>${label}</a>`).join('')}
    </nav>`);
}

function renderHome() {
  const cards = CATEGORIES.map((c) => {
    const n = STOTRAS.filter((s) => s.cat === c.id).length;
    return `<a class="cat" href="#/cat/${c.id}"><span class="cat-mark">${c.mark}</span><span class="cat-name">${esc(catTitle(c))}</span><span class="cat-count">${n}</span></a>`;
  }).join('');
  shell('home', t('appName'), `
    <div class="search"><input id="q" type="search" placeholder="${t('search')}" autocomplete="off"></div>
    <div id="results"></div>
    <div class="grid" id="cats">${cards}</div>`);
  const q = app.querySelector('#q');
  q.addEventListener('input', () => {
    const v = q.value.trim().toLowerCase();
    app.querySelector('#cats').hidden = !!v;
    if (!v) { app.querySelector('#results').innerHTML = ''; return; }
    const hits = STOTRAS.filter((s) => [s.en, s.iast, toSimple(s.iast), toTelugu(s.iast), ...s.verses.map((x) => x.t)]
      .some((x) => x.toLowerCase().includes(v)));
    app.querySelector('#results').innerHTML = hits.length ? listHtml(hits) : `<p class="muted center">${t('noResults')}</p>`;
  });
}

function listHtml(items) {
  return `<ul class="list">${items.map((s) => {
    const c = CATEGORIES.find((x) => x.id === s.cat);
    const fav = state.profile?.favorites?.includes(s.id);
    const count = s.dynamic ? '' : `${s.verses.length} ${t('verses')}`;
    return `<li><a href="#/s/${s.id}"><span class="cat-mark sm">${c.mark}</span><span class="li-main"><span class="li-title">${esc(stotraTitle(s))}</span><span class="li-sub">${esc(catTitle(c))}${count ? ` · ${count}` : ''}</span></span>${fav ? '<span class="star on">★</span>' : ''}<span class="chev">›</span></a></li>`;
  }).join('')}</ul>`;
}

function renderCategory(id) {
  const c = CATEGORIES.find((x) => x.id === id);
  if (!c) return renderHome();
  shell('home', esc(catTitle(c)), listHtml(STOTRAS.filter((s) => s.cat === id)), { back: '#/home' });
}

function verseHtml(text, meaning, i, label) {
  return `
    <article class="verse">
      <div class="verse-text">${label
        ? `${esc(text.replace(/\s*(\|\||॥)\s*$/, '')).replace(/\n/g, '<br>')} <span class="vnum">${label}</span>`
        : esc(text).replace(/\n/g, '<br>')}</div>
      <details class="ardham" ${state.showAllMeanings ? 'open' : ''}>
        <summary>${t('meaning')}</summary>
        <p>${esc(meaning)}</p>
      </details>
    </article>`;
}

function renderStotra(id) {
  const s = STOTRAS.find((x) => x.id === id);
  if (!s) return renderHome();
  const fav = state.profile?.favorites?.includes(id);
  let versesHtml;
  let extra = '';
  if (s.dynamic) {
    const { country, city } = userLocation();
    const ymd = todayIn(city.tz);
    const p = computePanchang(ymd, city);
    const prof = { ...state.profile, city_label: cityLabel(city) };
    const lines = buildSankalpam(prof, p, script, state.lang);
    versesHtml = lines.map((l, i) => verseHtml(l.text, SANKALPAM_MEANINGS[l.key][state.lang], i, '')).join('');
    const dateStr = new Intl.DateTimeFormat(te() ? 'te-IN' : 'en-GB', { dateStyle: 'full', timeZone: city.tz }).format(p.sunrise);
    extra = `<div class="card info"><strong>${t('sankalpamFor')}</strong> · ${esc(dateStr)}<br>
      <span class="muted">${esc(cityLabel(city))}, ${esc(te() ? country.te : country.en)} — ${t('sankalpamNote')}</span><br>
      <a href="#/settings" class="link">${t('editProfile')}</a></div>`;
  } else {
    versesHtml = s.verses.map((v, i) => verseHtml(script(v.t), v[state.lang], i, s.verses.length > 1 ? `॥ ${i + 1} ॥` : '')).join('');
  }
  shell('home', esc(stotraTitle(s)), `
    <div class="reader-tools">
      <button class="chip" id="toggle-all">${state.showAllMeanings ? t('hideAllMeanings') : t('showAllMeanings')}</button>
      <button class="chip" id="font-down" aria-label="Smaller text">A−</button>
      <button class="chip" id="font-up" aria-label="Larger text">A+</button>
      <button class="chip star ${fav ? 'on' : ''}" id="fav" aria-label="Favorite">${fav ? '★' : '☆'}</button>
    </div>
    <details class="card about" open><summary>${t('about')}</summary><p>${esc(s.about[state.lang])}</p></details>
    ${extra}
    <div class="verses ${te() ? 'te' : 'latin'}">${versesHtml}</div>`, { back: `#/cat/${s.cat}` });

  app.querySelector('#toggle-all').addEventListener('click', () => {
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
  shell('fav', t('favorites'), favs.length ? listHtml(favs) : `<p class="muted center pad">${t('noFavorites')}</p>`);
}

// ---------------------------------------------------------------- panchangam

function renderPanchang() {
  const { country, city } = userLocation();
  if (!state.panchangDate) state.panchangDate = todayIn(city.tz);
  const ymd = state.panchangDate;
  const p = computePanchang(ymd, city);
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
    <form class="card form" id="settings-form">
      <label>${t('language')}
        <select name="language"><option value="te" ${te() ? 'selected' : ''}>తెలుగు</option><option value="en" ${!te() ? 'selected' : ''}>English</option></select>
      </label>
      <label>${t('script')}
        <select name="script"><option value="iast" ${state.script === 'iast' ? 'selected' : ''}>IAST (śuklāmbaradharaṁ)</option><option value="simple" ${state.script === 'simple' ? 'selected' : ''}>Simple (shuklaambaradharam)</option></select>
      </label>
      <label>${t('country')}<select name="country">${countryOptions(country.code)}</select></label>
      <label>${t('city')}<select name="city">${cityOptions(country.code, p.city)}</select></label>
      <label>${t('fullName')}<input name="full_name" value="${esc(p.full_name || '')}"></label>
      <label>${t('gotra')}<input name="gotra" value="${esc(p.gotra || '')}"></label>
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
    <p class="muted small center">${esc(state.user?.email || '')}</p>
    <button class="danger wide" id="logout">${t('logout')}</button>`);
  const form = app.querySelector('#settings-form');
  wireCountryCity(form);
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const f = Object.fromEntries(new FormData(form));
    state.lang = f.language;
    state.script = f.script;
    localSet('lang', state.lang);
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

async function route() {
  if (!state.lang) return renderLanguage();
  if (!state.user) {
    state.user = await backend.currentUser();
    if (state.user) state.profile = await backend.getProfile(state.user);
  }
  if (!state.user) return renderAuth();
  if (!state.profile?.country) return renderCountrySetup();
  if (state.profile.language && !localGet('lang')) state.lang = state.profile.language;

  const [, view, arg] = (location.hash || '#/home').split('/');
  window.scrollTo(0, 0);
  switch (view) {
    case 'cat': return renderCategory(arg);
    case 's': return renderStotra(arg);
    case 'panchang': return renderPanchang();
    case 'fav': return renderFavorites();
    case 'settings': return renderSettings();
    default: return renderHome();
  }
}

window.addEventListener('hashchange', route);
route().catch((e) => {
  app.innerHTML = `<p class="error pad">${esc(e.message || e)}</p>`;
});
