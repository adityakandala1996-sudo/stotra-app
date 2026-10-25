// Countries with major cities (lat, lon, IANA time zone) and the sankalpam
// "desha" words. The dvipa for places outside India follows the mapping most
// widely used by diaspora temples; traditions differ, so users can edit it in Settings.

const REGION = {
  india: { dvipa: 'jambū', extra: 'bhārata varṣe bharata khaṇḍe meroḥ dakṣiṇa digbhāge' },
  asia: { dvipa: 'jambū', extra: '' },
  europe: { dvipa: 'plakṣa', extra: '' },
  africa: { dvipa: 'kuśa', extra: '' },
  namerica: { dvipa: 'krauñca', extra: '' },
  samerica: { dvipa: 'puṣkara', extra: '' },
  oceania: { dvipa: 'śālmali', extra: '' },
};

export const COUNTRIES = [
  { code: 'IN', en: 'India', te: 'భారతదేశం', iast: 'bhārata', region: 'india', cities: [
    ['Hyderabad', 'హైదరాబాద్', 17.385, 78.4867], ['Vijayawada', 'విజయవాడ', 16.5062, 80.648], ['Visakhapatnam', 'విశాఖపట్నం', 17.6868, 83.2185],
    ['Tirupati', 'తిరుపతి', 13.6288, 79.4192], ['Guntur', 'గుంటూరు', 16.3067, 80.4365], ['Warangal', 'వరంగల్', 17.9689, 79.5941],
    ['Rajahmundry', 'రాజమండ్రి', 17.0005, 81.804], ['Nellore', 'నెల్లూరు', 14.4426, 79.9865], ['Kurnool', 'కర్నూలు', 15.8281, 78.0373],
    ['Chennai', 'చెన్నై', 13.0827, 80.2707], ['Bengaluru', 'బెంగళూరు', 12.9716, 77.5946], ['Mumbai', 'ముంబై', 19.076, 72.8777],
    ['Delhi', 'ఢిల్లీ', 28.6139, 77.209], ['Pune', 'పుణె', 18.5204, 73.8567], ['Kolkata', 'కోల్‌కతా', 22.5726, 88.3639],
  ], tz: 'Asia/Kolkata' },
  { code: 'US', en: 'United States', te: 'అమెరికా', iast: 'amerikā', region: 'namerica', cities: [
    ['New York', 'న్యూయార్క్', 40.7128, -74.006, 'America/New_York'], ['New Jersey (Edison)', 'న్యూజెర్సీ', 40.5187, -74.4121, 'America/New_York'],
    ['Washington DC', 'వాషింగ్టన్ డీసీ', 38.9072, -77.0369, 'America/New_York'], ['Atlanta', 'అట్లాంటా', 33.749, -84.388, 'America/New_York'],
    ['Charlotte', 'షార్లెట్', 35.2271, -80.8431, 'America/New_York'], ['Detroit', 'డెట్రాయిట్', 42.3314, -83.0458, 'America/Detroit'],
    ['Chicago', 'చికాగో', 41.8781, -87.6298, 'America/Chicago'], ['Dallas', 'డాలస్', 32.7767, -96.797, 'America/Chicago'],
    ['Houston', 'హ్యూస్టన్', 29.7604, -95.3698, 'America/Chicago'], ['Austin', 'ఆస్టిన్', 30.2672, -97.7431, 'America/Chicago'],
    ['Phoenix', 'ఫీనిక్స్', 33.4484, -112.074, 'America/Phoenix'], ['Denver', 'డెన్వర్', 39.7392, -104.9903, 'America/Denver'],
    ['San Francisco Bay Area', 'బే ఏరియా', 37.3382, -121.8863, 'America/Los_Angeles'], ['Los Angeles', 'లాస్ ఏంజెల్స్', 34.0522, -118.2437, 'America/Los_Angeles'],
    ['Seattle', 'సియాటిల్', 47.6062, -122.3321, 'America/Los_Angeles'],
  ] },
  { code: 'CA', en: 'Canada', te: 'కెనడా', iast: 'kenaḍā', region: 'namerica', cities: [
    ['Toronto', 'టొరంటో', 43.6532, -79.3832, 'America/Toronto'], ['Ottawa', 'ఒట్టావా', 45.4215, -75.6972, 'America/Toronto'],
    ['Montreal', 'మాంట్రియల్', 45.5019, -73.5674, 'America/Toronto'], ['Calgary', 'కాల్గరీ', 51.0447, -114.0719, 'America/Edmonton'],
    ['Vancouver', 'వాంకూవర్', 49.2827, -123.1207, 'America/Vancouver'],
  ] },
  { code: 'GB', en: 'United Kingdom', te: 'యునైటెడ్ కింగ్‌డమ్', iast: 'iṅglāṇḍ', region: 'europe', tz: 'Europe/London', cities: [
    ['London', 'లండన్', 51.5074, -0.1278], ['Birmingham', 'బర్మింగ్‌హామ్', 52.4862, -1.8904], ['Manchester', 'మాంచెస్టర్', 53.4808, -2.2426],
    ['Leicester', 'లెస్టర్', 52.6369, -1.1398],
  ] },
  { code: 'IE', en: 'Ireland', te: 'ఐర్లాండ్', iast: 'airlāṇḍ', region: 'europe', tz: 'Europe/Dublin', cities: [['Dublin', 'డబ్లిన్', 53.3498, -6.2603]] },
  { code: 'DE', en: 'Germany', te: 'జర్మనీ', iast: 'jarmanī', region: 'europe', tz: 'Europe/Berlin', cities: [
    ['Berlin', 'బెర్లిన్', 52.52, 13.405], ['Frankfurt', 'ఫ్రాంక్‌ఫర్ట్', 50.1109, 8.6821], ['Munich', 'మ్యూనిక్', 48.1351, 11.582],
  ] },
  { code: 'NL', en: 'Netherlands', te: 'నెదర్లాండ్స్', iast: 'nedarlāṇḍs', region: 'europe', tz: 'Europe/Amsterdam', cities: [['Amsterdam', 'ఆమ్‌స్టర్‌డామ్', 52.3676, 4.9041]] },
  { code: 'FR', en: 'France', te: 'ఫ్రాన్స్', iast: 'phrāns', region: 'europe', tz: 'Europe/Paris', cities: [['Paris', 'పారిస్', 48.8566, 2.3522]] },
  { code: 'AU', en: 'Australia', te: 'ఆస్ట్రేలియా', iast: 'āsṭreliyā', region: 'oceania', cities: [
    ['Sydney', 'సిడ్నీ', -33.8688, 151.2093, 'Australia/Sydney'], ['Melbourne', 'మెల్‌బోర్న్', -37.8136, 144.9631, 'Australia/Melbourne'],
    ['Brisbane', 'బ్రిస్బేన్', -27.4698, 153.0251, 'Australia/Brisbane'], ['Perth', 'పెర్త్', -31.9505, 115.8605, 'Australia/Perth'],
    ['Adelaide', 'అడిలైడ్', -34.9285, 138.6007, 'Australia/Adelaide'], ['Canberra', 'కాన్‌బెర్రా', -35.2809, 149.13, 'Australia/Sydney'],
  ] },
  { code: 'NZ', en: 'New Zealand', te: 'న్యూజిలాండ్', iast: 'nyūjilāṇḍ', region: 'oceania', tz: 'Pacific/Auckland', cities: [
    ['Auckland', 'ఆక్లాండ్', -36.8485, 174.7633], ['Wellington', 'వెల్లింగ్టన్', -41.2865, 174.7762],
  ] },
  { code: 'SG', en: 'Singapore', te: 'సింగపూర్', iast: 'siṅgapūr', region: 'asia', tz: 'Asia/Singapore', cities: [['Singapore', 'సింగపూర్', 1.3521, 103.8198]] },
  { code: 'MY', en: 'Malaysia', te: 'మలేషియా', iast: 'maleṣiyā', region: 'asia', tz: 'Asia/Kuala_Lumpur', cities: [['Kuala Lumpur', 'కౌలాలంపూర్', 3.139, 101.6869]] },
  { code: 'AE', en: 'United Arab Emirates', te: 'యూఏఈ', iast: 'arab amīrāt', region: 'asia', tz: 'Asia/Dubai', cities: [
    ['Dubai', 'దుబాయ్', 25.2048, 55.2708], ['Abu Dhabi', 'అబుదాబి', 24.4539, 54.3773], ['Sharjah', 'షార్జా', 25.3463, 55.4209],
  ] },
  { code: 'SA', en: 'Saudi Arabia', te: 'సౌదీ అరేబియా', iast: 'saudī arebiyā', region: 'asia', tz: 'Asia/Riyadh', cities: [['Riyadh', 'రియాద్', 24.7136, 46.6753], ['Jeddah', 'జెద్దా', 21.4858, 39.1925]] },
  { code: 'QA', en: 'Qatar', te: 'ఖతార్', iast: 'khatār', region: 'asia', tz: 'Asia/Qatar', cities: [['Doha', 'దోహా', 25.2854, 51.531]] },
  { code: 'KW', en: 'Kuwait', te: 'కువైట్', iast: 'kuvaiṭ', region: 'asia', tz: 'Asia/Kuwait', cities: [['Kuwait City', 'కువైట్ సిటీ', 29.3759, 47.9774]] },
  { code: 'OM', en: 'Oman', te: 'ఒమన్', iast: 'oman', region: 'asia', tz: 'Asia/Muscat', cities: [['Muscat', 'మస్కట్', 23.588, 58.3829]] },
  { code: 'JP', en: 'Japan', te: 'జపాన్', iast: 'japān', region: 'asia', tz: 'Asia/Tokyo', cities: [['Tokyo', 'టోక్యో', 35.6762, 139.6503]] },
  { code: 'NP', en: 'Nepal', te: 'నేపాల్', iast: 'nepāla', region: 'india', tz: 'Asia/Kathmandu', cities: [['Kathmandu', 'ఖాట్మండు', 27.7172, 85.324]] },
  { code: 'LK', en: 'Sri Lanka', te: 'శ్రీలంక', iast: 'śrīlaṅkā', region: 'india', tz: 'Asia/Colombo', cities: [['Colombo', 'కొలంబో', 6.9271, 79.8612]] },
  { code: 'ZA', en: 'South Africa', te: 'దక్షిణాఫ్రికా', iast: 'dakṣiṇa āphrikā', region: 'africa', tz: 'Africa/Johannesburg', cities: [
    ['Johannesburg', 'జోహన్నెస్‌బర్గ్', -26.2041, 28.0473], ['Durban', 'డర్బన్', -29.8587, 31.0218],
  ] },
  { code: 'MU', en: 'Mauritius', te: 'మారిషస్', iast: 'mārīṣas', region: 'africa', tz: 'Indian/Mauritius', cities: [['Port Louis', 'పోర్ట్ లూయిస్', -20.1609, 57.5012]] },
  { code: 'FJ', en: 'Fiji', te: 'ఫిజీ', iast: 'phijī', region: 'oceania', tz: 'Pacific/Fiji', cities: [['Suva', 'సువా', -18.1248, 178.4501]] },
];

export function findCountry(code) {
  return COUNTRIES.find((c) => c.code === code) || COUNTRIES[0];
}

export function cityList(country) {
  return country.cities.map(([en, te, lat, lon, tz]) => ({ en, te, lat, lon, tz: tz || country.tz }));
}

export function regionOf(country) {
  return REGION[country.region];
}
