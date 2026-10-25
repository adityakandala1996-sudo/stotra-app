// Builds the sankalpam (in IAST) from the user's country/city and today's panchangam.
import { findCountry, regionOf } from './data/countries.js';

function tithiForm(tithi) {
  return `${tithi.name} tithau`;
}

// Placeholders (§1..§4) survive transliteration and are filled with plain text afterwards,
// so city / name / gotra typed by the user are shown as written.
// profile: { country, city, dvipa_override?, full_name?, gotra?, deity? }
// p: result of computePanchang(); render: IAST -> display script; lang: 'te' | 'en'
export function buildSankalpam(profile, p, render, lang) {
  const country = findCountry(profile.country);
  const region = regionOf(country);
  const dvipa = profile.dvipa_override || region.dvipa;
  const place = country.region === 'india'
    ? `${dvipa} dvīpe, ${region.extra}`
    : `${dvipa} dvīpe, §1 deśe`;
  const city = profile.city ? ', §2 nagare' : '';
  const deity = profile.deity || 'śrī parameśvara';
  const masa = (p.masa.adhika ? 'adhika ' : '') + p.masa.name;
  const ayana = p.ayana.replace(/a$/, 'e');
  const fill = {
    '§1': lang === 'te' ? country.te : country.en,
    '§2': profile.city_label || profile.city || '',
    '§3': profile.gotra || '……',
    '§4': profile.full_name || '……',
  };

  const lines = [
    {
      t: 'mamopātta samasta durita kṣaya dvārā śrī parameśvara prītyarthaṁ,\nśubhe śobhane muhūrte, śrī mahāviṣṇor ājñayā pravartamānasya,\nadya brahmaṇaḥ dvitīya parārdhe, śveta varāha kalpe, vaivasvata manvantare,\nkaliyuge, prathama pāde,',
      key: 'kala',
    },
    { t: `${place}${city}, asmin vartamāne vyāvahārika cāndramānena,`, key: 'desha' },
    {
      t: `${p.samvatsara} nāma saṁvatsare, ${ayana}, ${p.ritu} ṛtau, ${masa} māse, ${p.tithi.paksha} pakṣe,\n${tithiForm(p.tithi)}, ${p.vasara} vāsare, ${p.nakshatra.name} nakṣatre,\nśubha yoge, śubha karaṇe, evaṁ guṇa viśeṣaṇa viśiṣṭāyāṁ, śubha tithau,`,
      key: 'panchang',
    },
    {
      t: `śrīmataḥ §3 gotrasya §4 nāmadheyasya,\ndharmapatnī sametasya, asmākaṁ saha kuṭumbānāṁ, kṣema sthairya vijaya abhaya āyur ārogya aiśvaryābhivṛddhyarthaṁ,\ndharmārtha kāma mokṣa caturvidha phala puruṣārtha siddhyarthaṁ,\n${deity} prītyarthaṁ, yāvacchakti dhyāna āvāhanādi ṣoḍaśopacāra pūjāṁ kariṣye ||`,
      key: 'purpose',
    },
  ];
  return lines.map((l) => ({
    key: l.key,
    text: render(l.t).replace(/§[1-4]/g, (m) => fill[m]),
  }));
}

export const SANKALPAM_MEANINGS = {
  kala: {
    en: 'To remove all my accumulated sins and to please the Supreme Lord, at this auspicious moment, by the command of Sri Maha Vishnu — today, in the second half of Brahma\'s life, in the Shveta Varaha kalpa, in the Vaivasvata manvantara, in the first quarter of the Kali yuga,',
    te: 'నేను చేసిన సమస్త పాపాలు తొలగి, పరమేశ్వరుని ప్రీతి కోసం, ఈ శుభ ముహూర్తంలో, శ్రీ మహావిష్ణువు ఆజ్ఞతో నడుస్తున్న ఈ సృష్టిలో — ఈరోజు బ్రహ్మదేవుని ఆయుష్షులో రెండవ భాగంలో, శ్వేతవరాహ కల్పంలో, వైవస్వత మన్వంతరంలో, కలియుగం మొదటి పాదంలో,',
  },
  desha: {
    en: 'in this place (the dvipa, country and city where you live, as selected in your profile), according to the lunar calendar now in use,',
    te: 'ఈ ప్రదేశంలో (మీ ప్రొఫైల్‌లో ఎంచుకున్న ద్వీపం, దేశం, నగరం), ప్రస్తుతం వాడుకలో ఉన్న చాంద్రమాన పంచాంగం ప్రకారం,',
  },
  panchang: {
    en: 'in this named year, ayana, season, month, fortnight, lunar day, weekday and star (all filled in from today\'s panchangam for your location), on this auspicious day with all its good qualities,',
    te: 'ఈ సంవత్సరం, ఆయనం, ఋతువు, మాసం, పక్షం, తిథి, వారం, నక్షత్రం (ఇవన్నీ మీ ప్రదేశానికి ఈరోజు పంచాంగం నుండి నింపబడ్డాయి) గల ఈ శుభదినాన,',
  },
  purpose: {
    en: 'I, of this gotra and this name, together with my wife and family, for our well-being, stability, success, fearlessness, long life, health and prosperity, and for attaining the four goals of life — dharma, artha, kama and moksha — to please the deity, will perform this worship with meditation, invocation and the sixteen offerings, as far as I am able.',
    te: 'ఈ గోత్రం, ఈ పేరు గల నేను, ధర్మపత్నీ సమేతంగా, మా కుటుంబ సభ్యులందరి క్షేమం, స్థైర్యం, విజయం, అభయం, ఆయురారోగ్యం, ఐశ్వర్యాల వృద్ధి కోసం, ధర్మ, అర్థ, కామ, మోక్ష పురుషార్థాల సిద్ధి కోసం, దేవత ప్రీతి కోసం, నా శక్తి మేరకు ధ్యాన ఆవాహనాది షోడశోపచార పూజ చేస్తాను.',
  },
};
