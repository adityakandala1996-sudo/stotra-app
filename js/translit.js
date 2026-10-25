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
  return s.replace(/(^|[\s-])([a-z])/g, (_, p, ch) => p + ch.toUpperCase());
}
