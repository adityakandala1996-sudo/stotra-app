// IAST (Sanskrit romanisation) -> Telugu script, and IAST -> simple English.
// All stotra text is stored once in IAST and rendered per the chosen language.

const VOWELS = {
  a: ['అ', ''], 'ā': ['ఆ', 'ా'], i: ['ఇ', 'ి'], 'ī': ['ఈ', 'ీ'], u: ['ఉ', 'ు'], 'ū': ['ఊ', 'ూ'],
  'ṛ': ['ఋ', 'ృ'], 'ṝ': ['ౠ', 'ౄ'], 'ḷ': ['ఌ', 'ౢ'], 'ḹ': ['ౡ', 'ౣ'],
  e: ['ఏ', 'ే'], ai: ['ఐ', 'ై'], o: ['ఓ', 'ో'], au: ['ఔ', 'ౌ'],
};
const CONSONANTS = {
  kh: 'ఖ', k: 'క', gh: 'ఘ', g: 'గ', 'ṅ': 'ఙ',
  ch: 'ఛ', c: 'చ', jh: 'ఝ', j: 'జ', 'ñ': 'ఞ',
  'ṭh': 'ఠ', 'ṭ': 'ట', 'ḍh': 'ఢ', 'ḍ': 'డ', 'ṇ': 'ణ',
  th: 'థ', t: 'త', dh: 'ధ', d: 'ద', n: 'న',
  ph: 'ఫ', p: 'ప', bh: 'భ', b: 'బ', m: 'మ',
  y: 'య', r: 'ర', l: 'ల', 'ḻ': 'ళ', v: 'వ', 'ś': 'శ', 'ṣ': 'ష', s: 'స', h: 'హ',
};
const OTHERS = { 'ṁ': 'ం', 'ṃ': 'ం', 'ḥ': 'ః', "'": 'ఽ', '’': 'ఽ', '||': '॥', '|': '।' };
// A nasal before a consonant of its own class is written as anusvara (శంకర, not శఙ్కర).
const NASAL_CLASS = { 'ṅ': 'k|kh|g|gh', 'ñ': 'c|ch|j|jh', 'ṇ': 'ṭ|ṭh|ḍ|ḍh', n: 't|th|d|dh', m: 'p|ph|b|bh' };

const VKEYS = Object.keys(VOWELS).sort((a, b) => b.length - a.length);
const CKEYS = Object.keys(CONSONANTS).sort((a, b) => b.length - a.length);
const OKEYS = Object.keys(OTHERS).sort((a, b) => b.length - a.length);

function match(s, i, keys) {
  for (const k of keys) if (s.startsWith(k, i)) return k;
  return null;
}

export function toTelugu(iast) {
  const s = iast.normalize('NFC').toLowerCase();
  let out = '';
  let i = 0;
  let pendingConsonant = false; // last emitted char is a bare consonant awaiting vowel/virama
  while (i < s.length) {
    const c = match(s, i, CKEYS);
    if (c) {
      const next = match(s, i + c.length, CKEYS);
      if (pendingConsonant) out += '్';
      if (NASAL_CLASS[c] && next && new RegExp(`^(${NASAL_CLASS[c]})$`).test(next)) {
        out += 'ం';
        pendingConsonant = false;
      } else {
        out += CONSONANTS[c];
        pendingConsonant = true;
      }
      i += c.length;
      continue;
    }
    const v = match(s, i, VKEYS);
    if (v) {
      out += pendingConsonant ? VOWELS[v][1] : VOWELS[v][0];
      pendingConsonant = false;
      i += v.length;
      continue;
    }
    if (pendingConsonant) { out += '్'; pendingConsonant = false; }
    const o = match(s, i, OKEYS);
    if (o) { out += OTHERS[o]; i += o.length; continue; }
    out += s[i];
    i += 1;
  }
  if (pendingConsonant) out += '్';
  return out;
}

// ---- Telugu script -> IAST (for texts imported in Telugu, shown in English mode)
const TE_CONS = Object.fromEntries(Object.entries(CONSONANTS).map(([k, v]) => [v, k]));
TE_CONS['ఱ'] = 'r';
const TE_VOWEL = Object.fromEntries(Object.entries(VOWELS).map(([k, [ind]]) => [ind, k]));
TE_VOWEL['ఎ'] = 'e';
TE_VOWEL['ఒ'] = 'o';
const TE_MATRA = Object.fromEntries(Object.entries(VOWELS).filter(([, [, m]]) => m).map(([k, [, m]]) => [m, k]));
TE_MATRA['ె'] = 'e';
TE_MATRA['ొ'] = 'o';
TE_MATRA['ౖ'] = 'ai';
// '౽' is often typed in place of the avagraha
const TE_OTHER = { 'ం': 'ṁ', 'ఁ': 'ṁ', 'ః': 'ḥ', 'ఽ': "'", '౽': "'", '॥': '||', '।': '|' };
// Anusvara before a stop is read as that stop's nasal: kuṁcita -> kuñcita
const NASAL_OF = [[/ṁ(?=k|g)/g, 'ṅ'], [/ṁ(?=c|j)/g, 'ñ'], [/ṁ(?=ṭ|ḍ)/g, 'ṇ'], [/ṁ(?=t|d)/g, 'n'], [/ṁ(?=p|b)/g, 'm']];
// Vedic accent marks and joiners carry no sound in plain transliteration
const TE_DROP = /[॒॑᳚᳛‌‍﻿”]/g;

export function fromTelugu(te) {
  const s = te.normalize('NFC').replace(TE_DROP, '');
  let out = '';
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (TE_CONS[ch]) {
      out += TE_CONS[ch];
      const next = s[i + 1];
      if (next === '్') i += 1;
      else if (TE_MATRA[next]) { out += TE_MATRA[next]; i += 1; } else out += 'a';
    } else if (TE_VOWEL[ch]) out += TE_VOWEL[ch];
    else if (TE_OTHER[ch]) out += TE_OTHER[ch];
    else if (ch >= '౦' && ch <= '౯') out += String(ch.charCodeAt(0) - 0x0C66);
    else out += ch;
  }
  return NASAL_OF.reduce((acc, [re, n]) => acc.replace(re, n), out);
}

const SIMPLE = [
  ['ā', 'aa'], ['ī', 'ee'], ['ū', 'oo'], ['ṛ', 'ru'], ['ṝ', 'roo'], ['ḷ', 'lu'],
  ['ṁ', 'm'], ['ṃ', 'm'], ['ḥ', 'h'], ['ṅ', 'n'], ['ñ', 'n'], ['ṭ', 't'], ['ḍ', 'd'], ['ṇ', 'n'],
  ['ś', 'sh'], ['ṣ', 'sh'], ['ḻ', 'l'], ['c', 'ch'],
];

// IAST -> easy-to-read English (no diacritics), e.g. "śuklāmbaradharaṁ" -> "shuklaambaradharam"
export function toSimple(iast) {
  let s = iast.normalize('NFC');
  for (const [a, b] of SIMPLE) s = s.split(a).join(b);
  return s;
}

// For short names (tithi, nakshatra...): plain capitalised English
export function toPlainName(iast) {
  let s = iast.normalize('NFC');
  const map = { 'ā': 'a', 'ī': 'i', 'ū': 'u', 'ṛ': 'ri', 'ṁ': 'm', 'ṃ': 'm', 'ḥ': 'h', 'ṅ': 'n', 'ñ': 'n', 'ṭ': 't', 'ḍ': 'd', 'ṇ': 'n', 'ś': 'sh', 'ṣ': 'sh', 'ḻ': 'l' };
  s = s.replace(/[āīūṛṁṃḥṅñṭḍṇśṣḻ]/g, (m) => map[m]);
  s = s.replace(/c(h?)/g, (_, h) => (h ? 'chh' : 'ch'));
  return s.replace(/(^|[\s-])([a-z])/g, (_, p, ch) => p + ch.toUpperCase());
}

// ---- English-spelled Indian names -> Telugu (best guess; users can correct it in Settings)
const NAME_EXCEPTIONS = {
  aditya: 'ఆదిత్య', aaditya: 'ఆదిత్య', krishna: 'కృష్ణ', lakshmi: 'లక్ష్మి', laxmi: 'లక్ష్మి', sri: 'శ్రీ', shri: 'శ్రీ',
  srinivas: 'శ్రీనివాస్', srinivasa: 'శ్రీనివాస', venkat: 'వెంకట్', venkata: 'వెంకట', venkatesh: 'వెంకటేష్',
  rama: 'రామ', ram: 'రామ్', sai: 'సాయి', satya: 'సత్య', surya: 'సూర్య', anand: 'ఆనంద్', ananth: 'అనంత్',
  arjun: 'అర్జున్', bharat: 'భరత్', durga: 'దుర్గ', ganesh: 'గణేష్', gowri: 'గౌరి', gauri: 'గౌరి', hari: 'హరి',
  kiran: 'కిరణ్', kumar: 'కుమార్', mahesh: 'మహేష్', naveen: 'నవీన్', prasad: 'ప్రసాద్', priya: 'ప్రియ',
  rajesh: 'రాజేష్', raju: 'రాజు', ramesh: 'రమేష్', ravi: 'రవి', sarada: 'శారద', sita: 'సీత', suresh: 'సురేష్',
  vijay: 'విజయ్', vamsi: 'వంశీ', varma: 'వర్మ', reddy: 'రెడ్డి', rao: 'రావు', naidu: 'నాయుడు', sharma: 'శర్మ',
};
const N_CONS = [
  ['ksh', 'క్ష'], ['chh', 'ఛ'], ['sh', 'ష'], ['ch', 'చ'], ['th', 'త'], ['dh', 'ధ'], ['bh', 'భ'], ['gh', 'ఘ'],
  ['kh', 'ఖ'], ['ph', 'ఫ'], ['jh', 'ఝ'], ['k', 'క'], ['g', 'గ'], ['c', 'క'], ['j', 'జ'], ['t', 'త'], ['d', 'ద'],
  ['n', 'న'], ['p', 'ప'], ['b', 'బ'], ['m', 'మ'], ['y', 'య'], ['r', 'ర'], ['l', 'ల'], ['v', 'వ'], ['w', 'వ'],
  ['s', 'స'], ['h', 'హ'], ['f', 'ఫ'], ['z', 'జ'], ['q', 'క'], ['x', 'క్స'],
];
const N_VOW = [
  ['aa', 'ఆ', 'ా'], ['ee', 'ఈ', 'ీ'], ['ii', 'ఈ', 'ీ'], ['oo', 'ఊ', 'ూ'], ['uu', 'ఊ', 'ూ'], ['ai', 'ఐ', 'ై'],
  ['au', 'ఔ', 'ౌ'], ['ou', 'ఔ', 'ౌ'], ['ow', 'ఔ', 'ౌ'], ['a', 'అ', ''], ['i', 'ఇ', 'ి'], ['u', 'ఉ', 'ు'], ['e', 'ఎ', 'ె'], ['o', 'ఒ', 'ొ'],
];

function wordToTelugu(word) {
  const w = word.toLowerCase();
  if (NAME_EXCEPTIONS[w]) return NAME_EXCEPTIONS[w];
  let out = '';
  let i = 0;
  let bare = false; // last output is a consonant without a vowel yet
  while (i < w.length) {
    const c = N_CONS.find(([k]) => w.startsWith(k, i));
    if (c) {
      const after = w.slice(i + c[0].length);
      // n/m before another consonant is written as anusvara (Anand -> ఆనంద్)
      if ((c[0] === 'n' || c[0] === 'm') && after && N_CONS.some(([k]) => after.startsWith(k)) && !/^[yrvhnm]/.test(after)) {
        out += 'ం';
        bare = false;
      } else {
        if (bare) out += '్';
        // word-initial "sh" is usually శ (Shiva, Shankar)
        out += c[0] === 'sh' && i === 0 ? 'శ' : c[1];
        bare = true;
      }
      i += c[0].length;
      continue;
    }
    const v = N_VOW.find(([k]) => w.startsWith(k, i));
    if (v) {
      out += bare ? v[2] : v[1];
      bare = false;
      i += v[0].length;
      continue;
    }
    if (bare) { out += '్'; bare = false; }
    out += w[i];
    i += 1;
  }
  if (bare) out += '్';
  return out;
}

export function nameToTelugu(name) {
  if (!name || /[ఀ-౿]/.test(name)) return name || '';
  return name.trim().split(/(\s+)/).map((part) => (/\s/.test(part) ? part : wordToTelugu(part))).join('');
}
