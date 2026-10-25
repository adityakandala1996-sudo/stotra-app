// Panchangam calculations (sidereal, Lahiri ayanamsa) using astronomy-engine.
// Names are IAST; the UI converts them to Telugu or plain English.

const A = () => globalThis.Astronomy;

export const TITHIS = ['pratipat', 'dvitīyā', 'tṛtīyā', 'caturthī', 'pañcamī', 'ṣaṣṭhī', 'saptamī', 'aṣṭamī',
  'navamī', 'daśamī', 'ekādaśī', 'dvādaśī', 'trayodaśī', 'caturdaśī'];
export const NAKSHATRAS = ['aśvinī', 'bharaṇī', 'kṛttikā', 'rohiṇī', 'mṛgaśirā', 'ārdrā', 'punarvasu', 'puṣyamī',
  'āśleṣā', 'maghā', 'pūrva phalgunī', 'uttara phalgunī', 'hastā', 'citrā', 'svātī', 'viśākhā', 'anūrādhā',
  'jyeṣṭhā', 'mūlā', 'pūrvāṣāḍhā', 'uttarāṣāḍhā', 'śravaṇā', 'dhaniṣṭhā', 'śatabhiṣā', 'pūrvābhādrā',
  'uttarābhādrā', 'revatī'];
export const YOGAS = ['viṣkambha', 'prīti', 'āyuṣmān', 'saubhāgya', 'śobhana', 'atigaṇḍa', 'sukarmā', 'dhṛti',
  'śūla', 'gaṇḍa', 'vṛddhi', 'dhruva', 'vyāghāta', 'harṣaṇa', 'vajra', 'siddhi', 'vyatīpāta', 'varīyān',
  'parigha', 'śiva', 'siddha', 'sādhya', 'śubha', 'śukla', 'brahma', 'aindra', 'vaidhṛti'];
const KARANA_MOVABLE = ['bava', 'bālava', 'kaulava', 'taitila', 'garaja', 'vaṇija', 'viṣṭi'];
export const MASAS = ['caitra', 'vaiśākha', 'jyeṣṭha', 'āṣāḍha', 'śrāvaṇa', 'bhādrapada', 'āśvayuja',
  'kārtika', 'mārgaśira', 'puṣya', 'māgha', 'phālguna'];
export const RASHIS = ['meṣa', 'vṛṣabha', 'mithuna', 'karkāṭaka', 'siṁha', 'kanyā', 'tulā', 'vṛścika',
  'dhanus', 'makara', 'kumbha', 'mīna'];
export const RITUS = ['vasanta', 'grīṣma', 'varṣa', 'śarad', 'hemanta', 'śiśira'];
// Weekday names used in panchangam display, and the forms used in sankalpam
export const VARAS = ['ravi', 'soma', 'maṅgala', 'budha', 'guru', 'śukra', 'śani'];
export const VASARAS = ['bhānu', 'indu', 'bhauma', 'saumya', 'bṛhaspati', 'bhṛgu', 'sthira'];
export const SAMVATSARAS = ['prabhava', 'vibhava', 'śukla', 'pramodūta', 'prajotpatti', 'āṅgīrasa', 'śrīmukha',
  'bhāva', 'yuva', 'dhātu', 'īśvara', 'bahudhānya', 'pramāthi', 'vikrama', 'vṛṣa', 'citrabhānu', 'svabhānu',
  'tāraṇa', 'pārthiva', 'vyaya', 'sarvajit', 'sarvadhāri', 'virodhi', 'vikṛti', 'khara', 'nandana', 'vijaya',
  'jaya', 'manmatha', 'durmukhi', 'hevilambi', 'vilambi', 'vikāri', 'śārvari', 'plava', 'śubhakṛt', 'śobhakṛt',
  'krodhi', 'viśvāvasu', 'parābhava', 'plavaṅga', 'kīlaka', 'saumya', 'sādhāraṇa', 'virodhikṛt', 'paridhāvi',
  'pramādi', 'ānanda', 'rākṣasa', 'nala', 'piṅgala', 'kālayukti', 'siddhārthi', 'raudri', 'durmati', 'dundubhi',
  'rudhirodgāri', 'raktākṣi', 'krodhana', 'akṣaya'];

const NAK = 360 / 27;

function ayanamsa(date) {
  // Lahiri (Chitrapaksha): 23°51'11" at J2000, precessing ~50.29"/year
  const t = (date.getTime() - Date.UTC(2000, 0, 1, 12)) / (365.25 * 86400000);
  return 23.853056 + t * (50.29 / 3600);
}

const norm = (x) => ((x % 360) + 360) % 360;
const sunLon = (d) => A().SunPosition(d).elon;
const moonLon = (d) => A().EclipticGeoMoon(d).lon;
const sidSun = (d) => norm(sunLon(d) - ayanamsa(d));
const sidMoon = (d) => norm(moonLon(d) - ayanamsa(d));
const elong = (d) => norm(moonLon(d) - sunLon(d));

// Angle functions whose integer "segment" defines each limb
const LIMBS = {
  tithi: { f: elong, span: 12 },
  nakshatra: { f: sidMoon, span: NAK },
  yoga: { f: (d) => norm(sidSun(d) + sidMoon(d)), span: NAK },
  karana: { f: elong, span: 6 },
};

// When does the segment containing `date` end? Step forward hourly, then bisect.
function segmentEnd(limb, date) {
  const { f, span } = LIMBS[limb];
  const seg = Math.floor(f(date) / span);
  let lo = date.getTime();
  let hi = lo;
  for (let h = 0; h < 72; h++) {
    hi = lo + 3600000;
    if (Math.floor(f(new Date(hi)) / span) !== seg) break;
    lo = hi;
  }
  for (let k = 0; k < 30; k++) {
    const mid = (lo + hi) / 2;
    if (Math.floor(f(new Date(mid)) / span) === seg) lo = mid; else hi = mid;
  }
  return new Date(hi);
}

function karanaName(idx) {
  // idx 0..59 (half-tithis from amavasya end)
  if (idx === 0) return 'kiṁstughna';
  if (idx === 57) return 'śakuni';
  if (idx === 58) return 'catuṣpāda';
  if (idx === 59) return 'nāga';
  return KARANA_MOVABLE[(idx - 1) % 7];
}

function tithiInfo(idx) {
  // idx 0..29
  const paksha = idx < 15 ? 'śukla' : 'kṛṣṇa';
  const n = idx % 15;
  let name;
  if (idx === 14) name = 'pūrṇimā';
  else if (idx === 29) name = 'amāvāsyā';
  else name = TITHIS[n];
  return { paksha, name };
}

function previousNewMoon(date) {
  let start = new Date(date.getTime() - 31 * 86400000);
  let last = null;
  for (;;) {
    const nm = A().SearchMoonPhase(0, start, 40);
    if (!nm || nm.date > date) break;
    last = nm.date;
    start = new Date(nm.date.getTime() + 86400000);
  }
  return last;
}

function lunarMonth(date) {
  const nm = previousNewMoon(date);
  const next = A().SearchMoonPhase(0, new Date(nm.getTime() + 86400000), 40).date;
  const r1 = Math.floor(sidSun(nm) / 30);
  const r2 = Math.floor(sidSun(next) / 30);
  return { index: (r1 + 1) % 12, adhika: r1 === r2 };
}

// --- time zone helpers -----------------------------------------------------
function tzOffsetMinutes(tz, date) {
  const p = Object.fromEntries(new Intl.DateTimeFormat('en-US', {
    timeZone: tz, hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  }).formatToParts(date).map((x) => [x.type, x.value]));
  const asUTC = Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour, +p.minute, +p.second);
  return (asUTC - date.getTime()) / 60000;
}

// Local midnight of (y, m, d) in `tz`, as a Date
export function zonedMidnight(y, m, d, tz) {
  const guess = new Date(Date.UTC(y, m, d));
  const off = tzOffsetMinutes(tz, guess);
  const t = new Date(guess.getTime() - off * 60000);
  const off2 = tzOffsetMinutes(tz, t);
  return off2 === off ? t : new Date(guess.getTime() - off2 * 60000);
}

export function todayIn(tz) {
  const p = Object.fromEntries(new Intl.DateTimeFormat('en-US', {
    timeZone: tz, year: 'numeric', month: 'numeric', day: 'numeric',
  }).formatToParts(new Date()).map((x) => [x.type, x.value]));
  return { y: +p.year, m: +p.month - 1, d: +p.day };
}

// --- main ------------------------------------------------------------------
// loc: { lat, lon, tz }. ymd: { y, m (0-based), d } in the location's calendar.
export function computePanchang(ymd, loc) {
  const Astro = A();
  const observer = new Astro.Observer(loc.lat, loc.lon, 0);
  const midnight = zonedMidnight(ymd.y, ymd.m, ymd.d, loc.tz);
  const rise = Astro.SearchRiseSet(Astro.Body.Sun, observer, +1, midnight, 1.2);
  const sunrise = rise ? rise.date : new Date(midnight.getTime() + 6 * 3600000);
  const set = Astro.SearchRiseSet(Astro.Body.Sun, observer, -1, sunrise, 1);
  const sunset = set ? set.date : new Date(sunrise.getTime() + 12 * 3600000);
  const mr = Astro.SearchRiseSet(Astro.Body.Moon, observer, +1, midnight, 1);
  const ms = Astro.SearchRiseSet(Astro.Body.Moon, observer, -1, midnight, 1);
  const nextDay = new Date(midnight.getTime() + 86400000);
  const inDay = (r) => (r && r.date < nextDay ? r.date : null);

  const at = sunrise; // Panchangam is reckoned at local sunrise
  const tIdx = Math.floor(elong(at) / 12);
  const tInfo = tithiInfo(tIdx);
  const nIdx = Math.floor(sidMoon(at) / NAK);
  const yIdx = Math.floor(norm(sidSun(at) + sidMoon(at)) / NAK);
  const kIdx = Math.floor(elong(at) / 6);

  const weekday = new Date(Date.UTC(ymd.y, ymd.m, ymd.d)).getUTCDay();
  const month = lunarMonth(at);
  const sunSid = sidSun(at);
  const sunRashi = Math.floor(sunSid / 30);

  // Telugu year (Ugadi = Chaitra shukla pratipada)
  let lunarYear = ymd.y;
  if (ymd.m <= 4 && month.index >= 9) lunarYear -= 1;
  const samvatsara = SAMVATSARAS[(((lunarYear - 1987) % 60) + 60) % 60];

  // Rahu kalam etc.: daytime split into 8 parts; part numbers depend on weekday (Sun..Sat)
  const part = (sunset - sunrise) / 8;
  const seg = (n) => ({ start: new Date(sunrise.getTime() + (n - 1) * part), end: new Date(sunrise.getTime() + n * part) });
  const RAHU = [8, 2, 7, 5, 6, 4, 3];
  const YAMA = [5, 4, 3, 2, 1, 7, 6];
  const GULIKA = [7, 6, 5, 4, 3, 2, 1];
  // Abhijit: the 8th of 15 daytime muhurtas
  const muh = (sunset - sunrise) / 15;

  // Second tithi/nakshatra of the day if the first ends before next sunrise
  const nextRise = Astro.SearchRiseSet(Astro.Body.Sun, observer, +1, new Date(sunrise.getTime() + 3600000), 1.2)?.date;
  const tithiEnd = segmentEnd('tithi', at);
  const nakEnd = segmentEnd('nakshatra', at);

  return {
    date: midnight,
    sunrise, sunset,
    moonrise: inDay(mr), moonset: inDay(ms),
    vara: VARAS[weekday], vasara: VASARAS[weekday], weekday,
    tithi: { ...tInfo, index: tIdx, end: tithiEnd,
      next: nextRise && tithiEnd < nextRise ? tithiInfo((tIdx + 1) % 30).name : null },
    nakshatra: { name: NAKSHATRAS[nIdx], index: nIdx, end: nakEnd,
      next: nextRise && nakEnd < nextRise ? NAKSHATRAS[(nIdx + 1) % 27] : null },
    yoga: { name: YOGAS[yIdx], end: segmentEnd('yoga', at) },
    karana: { name: karanaName(kIdx), end: segmentEnd('karana', at) },
    masa: { name: MASAS[month.index], index: month.index, adhika: month.adhika },
    ritu: RITUS[Math.floor(month.index / 2)],
    ayana: sunSid >= 270 || sunSid < 90 ? 'uttarāyaṇa' : 'dakṣiṇāyana',
    samvatsara,
    sunRashi: RASHIS[sunRashi],
    moonRashi: RASHIS[Math.floor(sidMoon(at) / 30)],
    rahu: seg(RAHU[weekday]), yamaganda: seg(YAMA[weekday]), gulika: seg(GULIKA[weekday]),
    abhijit: { start: new Date(sunrise.getTime() + 7 * muh), end: new Date(sunrise.getTime() + 8 * muh) },
  };
}
