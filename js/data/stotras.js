// Stotra library. Text is IAST (rendered to Telugu script by translit.js).
// Each verse carries its meaning (Ardham) in English and Telugu.
// More stotras live in stotras-more.js; category ids must exist in CATEGORIES.
import { MORE_CATEGORIES, MORE_STOTRAS } from './stotras-more.js';
import { KARMA_CATEGORIES, KARMA_STOTRAS } from './stotras-karma.js';
import { VINAYAKA_STOTRAS } from './stotras-vinayaka.js';
import { LIBRARY } from './library.js';
import { fromTelugu, toPlainName } from '../translit.js';

const BASE_CATEGORIES = [
  { id: 'nitya', iast: 'nitya pārāyaṇa', en: 'Daily Prayers', mark: 'ॐ' },
  { id: 'pooja', iast: 'pūjā vidhānam', en: 'Pooja Vidhanam', mark: '🪔' },
  { id: 'ganesha', iast: 'gaṇeśa', en: 'Ganesha', mark: 'గ' },
  { id: 'shiva', iast: 'śiva', en: 'Shiva', mark: 'శి' },
  { id: 'vishnu', iast: 'viṣṇu', en: 'Vishnu', mark: 'వి' },
  { id: 'venkateswara', iast: 'veṅkaṭeśvara', en: 'Venkateswara', mark: 'వేం' },
  { id: 'devi', iast: 'devī', en: 'Devi', mark: 'దే' },
  { id: 'lakshmi', iast: 'lakṣmī', en: 'Lakshmi', mark: 'ల' },
  { id: 'saraswati', iast: 'sarasvatī', en: 'Saraswati', mark: 'స' },
  { id: 'rama', iast: 'rāma', en: 'Rama', mark: 'రా' },
  { id: 'krishna', iast: 'kṛṣṇa', en: 'Krishna', mark: 'కృ' },
  { id: 'hanuman', iast: 'hanumān', en: 'Hanuman', mark: 'హ' },
  { id: 'subrahmanya', iast: 'subrahmaṇya', en: 'Subrahmanya', mark: 'సు' },
  { id: 'navagraha', iast: 'navagraha', en: 'Navagraha', mark: 'న' },
  { id: 'surya', iast: 'sūrya', en: 'Surya', mark: 'సూ' },
  { id: 'guru', iast: 'guru', en: 'Guru', mark: 'గు' },
  { id: 'vedic', iast: 'vaidika mantrāḥ', en: 'Vedic Mantras', mark: 'వే' },
];

const BASE_STOTRAS = [
  // ---------------- Daily prayers ----------------
  {
    id: 'karagre', cat: 'nitya', iast: 'prātaḥ smaraṇam (karāgre vasate)', en: 'Morning Prayer (Karagre Vasate)',
    about: {
      en: 'Recited on waking up while looking at one\'s palms, before starting the day.',
      te: 'నిద్ర లేవగానే అరచేతులను చూస్తూ, రోజును ప్రారంభించే ముందు చదివే శ్లోకం.',
    },
    verses: [
      {
        t: 'karāgre vasate lakṣmīḥ karamadhye sarasvatī |\nkaramūle tu govindaḥ prabhāte karadarśanam ||',
        en: 'At the tips of the fingers dwells Lakshmi, in the middle of the palm Saraswati, and at the base of the palm Govinda. So, in the morning, one should look at one\'s hands.',
        te: 'చేతి వేళ్ల చివర లక్ష్మీదేవి, అరచేతి మధ్యలో సరస్వతీదేవి, అరచేతి మూలంలో గోవిందుడు నివసిస్తారు. అందుకే ఉదయాన్నే అరచేతులను దర్శించాలి.',
      },
      {
        t: 'samudra vasane devi parvata stana maṇḍale |\nviṣṇupatni namastubhyaṁ pāda sparśaṁ kṣamasva me ||',
        en: 'O Mother Earth, clothed by the oceans, adorned with mountains, consort of Vishnu — I bow to you. Forgive me for touching you with my feet.',
        te: 'సముద్రాలనే వస్త్రంగా, పర్వతాలనే అలంకారంగా కలిగిన ఓ భూదేవీ, విష్ణుపత్నీ! నీకు నమస్కారం. నా పాదాలతో నిన్ను తాకుతున్నందుకు నన్ను క్షమించు.',
      },
    ],
  },
  {
    id: 'shubham-karoti', cat: 'nitya', iast: 'dīpa prārthanā (śubhaṁ karoti)', en: 'Lamp Prayer (Shubham Karoti)',
    about: {
      en: 'Recited when lighting the lamp in the evening.',
      te: 'సాయంకాలం దీపం వెలిగించేటప్పుడు చదివే శ్లోకం.',
    },
    verses: [
      {
        t: 'śubhaṁ karoti kalyāṇam ārogyaṁ dhanasampadaḥ |\nśatrubuddhi vināśāya dīpajyotir namo\'stu te ||',
        en: 'Salutations to the light of the lamp, which brings auspiciousness, prosperity, health and wealth, and destroys hostile thoughts.',
        te: 'శుభాన్ని, మంగళాన్ని, ఆరోగ్యాన్ని, ధనసంపదను ఇచ్చి, శత్రుభావాన్ని నశింపజేసే ఓ దీపజ్యోతీ! నీకు నమస్కారం.',
      },
    ],
  },
  {
    id: 'sarve-bhavantu', cat: 'nitya', iast: 'sarve bhavantu sukhinaḥ', en: 'Sarve Bhavantu Sukhinah',
    about: {
      en: 'A universal prayer for the well-being of all.',
      te: 'సకల జీవుల క్షేమాన్ని కోరే సార్వత్రిక ప్రార్థన.',
    },
    verses: [
      {
        t: 'sarve bhavantu sukhinaḥ sarve santu nirāmayāḥ |\nsarve bhadrāṇi paśyantu mā kaścid duḥkha bhāg bhavet ||\noṁ śāntiḥ śāntiḥ śāntiḥ ||',
        en: 'May all be happy, may all be free from illness, may all see what is auspicious, may no one suffer. Om peace, peace, peace.',
        te: 'అందరూ సుఖంగా ఉండాలి, అందరూ ఆరోగ్యంగా ఉండాలి, అందరూ శుభాలను చూడాలి, ఎవరూ దుఃఖపడకూడదు. ఓం శాంతిః శాంతిః శాంతిః.',
      },
    ],
  },
  {
    id: 'kayena-vacha', cat: 'nitya', iast: 'samarpaṇam (kāyena vācā)', en: 'Offering (Kayena Vacha)',
    about: {
      en: 'Recited at the end of any prayer or action, offering all of it to Narayana.',
      te: 'ఏ పూజ లేదా కార్యం చివరనైనా, చేసినదంతా నారాయణునికి సమర్పిస్తూ చదివే శ్లోకం.',
    },
    verses: [
      {
        t: 'kāyena vācā manasendriyair vā\nbuddhyātmanā vā prakṛteḥ svabhāvāt |\nkaromi yadyat sakalaṁ parasmai\nnārāyaṇāyeti samarpayāmi ||',
        en: 'Whatever I do — with my body, speech, mind, senses, intellect or self, or out of my natural tendencies — all of it I offer to the Supreme, Narayana.',
        te: 'శరీరంతో, మాటతో, మనస్సుతో, ఇంద్రియాలతో, బుద్ధితో లేదా నా స్వభావం వల్ల నేను ఏది చేసినా, అదంతా పరమాత్ముడైన నారాయణునికే సమర్పిస్తున్నాను.',
      },
    ],
  },

  // ---------------- Pooja vidhanam ----------------
  // 'sankalpam' is generated from the user's country & today's panchangam (see sankalpam.js)
  {
    id: 'sankalpam', cat: 'pooja', iast: 'saṅkalpam', en: 'Sankalpam', dynamic: true,
    about: {
      en: 'The formal statement of intention before a pooja. It names the time (from today\'s panchangam) and place (from your country/city), then the purpose of the worship.',
      te: 'పూజకు ముందు చెప్పే సంకల్పం. ఇందులో కాలం (ఈరోజు పంచాంగం ప్రకారం), ప్రదేశం (మీ దేశం/నగరం ప్రకారం), పూజ ఉద్దేశం చెప్పబడతాయి.',
    },
    verses: [],
  },
  {
    id: 'achamanam', cat: 'pooja', iast: 'ācamanam (keśava nāmāni)', en: 'Achamanam (24 names of Keshava)',
    about: {
      en: 'Purification at the start of every pooja: sip water three times with the first three names, then touch the body while reciting the rest.',
      te: 'ప్రతి పూజ ప్రారంభంలో చేసే శుద్ధి. మొదటి మూడు నామాలతో మూడుసార్లు జలం స్వీకరించి, మిగిలిన నామాలు చెప్పాలి.',
    },
    verses: [
      {
        t: 'oṁ keśavāya svāhā | oṁ nārāyaṇāya svāhā | oṁ mādhavāya svāhā |',
        en: 'Offerings to Keshava, Narayana and Madhava (sip a little water with each name).',
        te: 'కేశవ, నారాయణ, మాధవ నామాలతో మూడుసార్లు ఆచమనం (జలం స్వీకరించడం) చేయాలి.',
      },
      {
        t: 'oṁ govindāya namaḥ | oṁ viṣṇave namaḥ | oṁ madhusūdanāya namaḥ | oṁ trivikramāya namaḥ | oṁ vāmanāya namaḥ | oṁ śrīdharāya namaḥ | oṁ hṛṣīkeśāya namaḥ | oṁ padmanābhāya namaḥ | oṁ dāmodarāya namaḥ | oṁ saṅkarṣaṇāya namaḥ | oṁ vāsudevāya namaḥ | oṁ pradyumnāya namaḥ | oṁ aniruddhāya namaḥ | oṁ puruṣottamāya namaḥ | oṁ adhokṣajāya namaḥ | oṁ nārasiṁhāya namaḥ | oṁ acyutāya namaḥ | oṁ janārdanāya namaḥ | oṁ upendrāya namaḥ | oṁ haraye namaḥ | oṁ śrī kṛṣṇāya namaḥ ||',
        en: 'Salutations to the remaining twenty-one names of Vishnu, from Govinda to Sri Krishna. Together with the first three, these are the 24 names of Keshava.',
        te: 'గోవిందుడి నుండి శ్రీకృష్ణుడి వరకు విష్ణువు యొక్క మిగిలిన ఇరవై ఒక్క నామాలకు నమస్కారం. మొదటి మూడుతో కలిపి ఇవి కేశవుని 24 నామాలు.',
      },
    ],
  },
  {
    id: 'kshama-prarthana', cat: 'pooja', iast: 'kṣamā prārthanā', en: 'Kshama Prarthana (Prayer for Forgiveness)',
    about: {
      en: 'Recited at the end of a pooja, asking forgiveness for any mistakes made.',
      te: 'పూజ చివరలో, తెలియక జరిగిన లోపాలను క్షమించమని ప్రార్థించే శ్లోకాలు.',
    },
    verses: [
      {
        t: 'āvāhanaṁ na jānāmi na jānāmi visarjanam |\npūjāṁ caiva na jānāmi kṣamasva parameśvara ||',
        en: 'I do not know how to invoke you, nor how to bid you farewell; I do not even know how to worship. Forgive me, O Supreme Lord.',
        te: 'నిన్ను ఆవాహన చేయడం గానీ, విసర్జన చేయడం గానీ నాకు తెలియదు. పూజా విధానం కూడా తెలియదు. ఓ పరమేశ్వరా, నన్ను క్షమించు.',
      },
      {
        t: 'mantrahīnaṁ kriyāhīnaṁ bhaktihīnaṁ janārdana |\nyatpūjitaṁ mayā deva paripūrṇaṁ tadastu me ||',
        en: 'O Janardana, whatever worship I have done — lacking in mantra, in ritual, or in devotion — may it become complete, O Lord.',
        te: 'ఓ జనార్దనా! మంత్రలోపం, క్రియాలోపం, భక్తిలోపంతో నేను చేసిన ఈ పూజ కూడా పరిపూర్ణమగుగాక.',
      },
    ],
  },

  // ---------------- Ganesha ----------------
  {
    id: 'ganesha-prarthana', cat: 'ganesha', iast: 'gaṇeśa prārthanā', en: 'Ganesha Prarthana',
    about: {
      en: 'Opening prayers to Lord Ganesha, the remover of obstacles, recited before beginning any task.',
      te: 'ఏ కార్యం ప్రారంభించే ముందైనా విఘ్నాలను తొలగించే వినాయకుని ప్రార్థించే శ్లోకాలు.',
    },
    verses: [
      {
        t: 'śuklāmbaradharaṁ viṣṇuṁ śaśivarṇaṁ caturbhujam |\nprasannavadanaṁ dhyāyet sarvavighnopaśāntaye ||',
        en: 'To remove all obstacles, meditate on the all-pervading Lord dressed in white, with the complexion of the moon, four arms and a gracious, smiling face.',
        te: 'తెల్లని వస్త్రాలు ధరించినవాడు, సర్వవ్యాపి, చంద్రుని వంటి కాంతి గలవాడు, నాలుగు భుజాలు గలవాడు, ప్రసన్నమైన ముఖం గలవాడు అయిన వినాయకుని, సకల విఘ్నాలు తొలగడానికి ధ్యానించాలి.',
      },
      {
        t: 'agajānana padmārkaṁ gajānanam aharniśam |\nanekadaṁ taṁ bhaktānām ekadantam upāsmahe ||',
        en: 'We worship day and night the elephant-faced one, who is the sun that makes the lotus face of Parvati bloom, the single-tusked one who grants many boons to devotees.',
        te: 'పార్వతీదేవి ముఖపద్మానికి సూర్యుని వంటివాడు, భక్తులకు అనేక వరాలు ఇచ్చేవాడు, ఏకదంతుడు అయిన గజాననుని రాత్రింబవళ్లు ఉపాసిస్తాము.',
      },
      {
        t: 'vakratuṇḍa mahākāya sūryakoṭi samaprabha |\nnirvighnaṁ kuru me deva sarvakāryeṣu sarvadā ||',
        en: 'O Lord with the curved trunk and mighty body, radiant as a million suns — always make all my undertakings free of obstacles.',
        te: 'వంకర తొండం, భారీ శరీరం గలవాడా, కోటి సూర్యుల కాంతి గలవాడా! ఓ దేవా, నా అన్ని పనులను ఎల్లప్పుడూ విఘ్నాలు లేకుండా చేయి.',
      },
    ],
  },
  {
    id: 'ganesha-pancharatnam', cat: 'ganesha', iast: 'gaṇeśa pañcaratnam', en: 'Ganesha Pancharatnam',
    about: {
      en: 'Five "jewel" verses on Ganesha composed by Adi Shankaracharya.',
      te: 'ఆది శంకరాచార్యులు రచించిన వినాయకునిపై ఐదు రత్నాల వంటి శ్లోకాలు.',
    },
    verses: [
      {
        t: 'mudākarātta modakaṁ sadā vimukti sādhakaṁ\nkalādharāvataṁsakaṁ vilāsiloka rakṣakam |\nanāyakaika nāyakaṁ vināśitebha daityakaṁ\nnatāśubhāśu nāśakaṁ namāmi taṁ vināyakam ||',
        en: 'I bow to Vinayaka, who joyfully holds modakas in his hand, who always leads to liberation, who wears the crescent moon as an ornament, who protects the world; the one leader of those who have no leader, who destroyed the elephant-demon, and who quickly removes the misfortunes of those who bow to him.',
        te: 'ఆనందంగా చేతిలో మోదకాలు ధరించినవాడు, ఎల్లప్పుడూ మోక్షాన్ని ఇచ్చేవాడు, చంద్రకళను ఆభరణంగా ధరించినవాడు, లోకాలను రక్షించేవాడు, నాయకుడు లేనివారికి ఏకైక నాయకుడు, గజాసురుని సంహరించినవాడు, నమస్కరించేవారి అశుభాలను త్వరగా నశింపజేసేవాడు అయిన వినాయకునికి నమస్కరిస్తున్నాను.',
      },
      {
        t: 'natetarāti bhīkaraṁ navoditārka bhāsvaraṁ\nnamatsurāri nirjaraṁ natādhikāpaduddharam |\nsureśvaraṁ nidhīśvaraṁ gajeśvaraṁ gaṇeśvaraṁ\nmaheśvaraṁ tamāśraye parātparaṁ nirantaram ||',
        en: 'I always take refuge in Him who is fearsome to the arrogant, who shines like the newly risen sun, who is bowed to by gods and demons, who rescues devotees from great dangers — Lord of the gods, Lord of treasures, Lord of elephants, Lord of the ganas, the Great Lord, higher than the highest.',
        te: 'నమస్కరించనివారికి భయంకరుడు, అప్పుడే ఉదయించిన సూర్యునిలా ప్రకాశించేవాడు, దేవతలు, రాక్షసులు నమస్కరించేవాడు, భక్తులను గొప్ప ఆపదల నుండి కాపాడేవాడు, దేవతలకు, నిధులకు, గజాలకు, గణాలకు అధిపతి, పరాత్పరుడు అయిన ఆ మహేశ్వరుని ఎల్లప్పుడూ ఆశ్రయిస్తాను.',
      },
      {
        t: 'samasta loka śaṅkaraṁ nirasta daitya kuñjaraṁ\ndaretarodaraṁ varaṁ varebha vaktram akṣaram |\nkṛpākaraṁ kṣamākaraṁ mudākaraṁ yaśaskaraṁ\nmanaskaraṁ namaskṛtāṁ namaskaromi bhāsvaram ||',
        en: 'I bow to the radiant one who brings good to all worlds, who drove away the demon-elephant, who has a large belly, who is supreme and imperishable, with the face of a noble elephant — the source of compassion, forgiveness and joy, who grants fame and a good mind to those who bow to him.',
        te: 'సకల లోకాలకు శుభం చేసేవాడు, గజాసురుని తొలగించినవాడు, పెద్ద ఉదరం గలవాడు, శ్రేష్ఠుడు, గజముఖుడు, నాశనం లేనివాడు, దయ, క్షమ, ఆనందాలకు నిలయం, నమస్కరించేవారికి కీర్తిని, సద్బుద్ధిని ఇచ్చేవాడు, ప్రకాశించేవాడు అయిన గణేశునికి నమస్కరిస్తున్నాను.',
      },
      {
        t: 'akiñcanārti mārjanaṁ cirantanokti bhājanaṁ\npurāri pūrva nandanaṁ surāri garva carvaṇam |\nprapañca nāśa bhīṣaṇaṁ dhanañjayādi bhūṣaṇaṁ\nkapola dāna vāraṇaṁ bhaje purāṇa vāraṇam ||',
        en: 'I worship the ancient elephant-god, who wipes away the sorrow of the poor, who is praised by the ancient scriptures, the first son of Shiva, who crushes the pride of demons, who is fearsome at the dissolution of the universe, who is adorned with serpents like Dhananjaya, and who is like a mighty elephant in rut.',
        te: 'దీనుల దుఃఖాన్ని తుడిచివేసేవాడు, పురాతన వేదవాక్కులచే కీర్తించబడేవాడు, త్రిపురారి అయిన శివుని ప్రథమ పుత్రుడు, రాక్షసుల గర్వాన్ని అణచేవాడు, ప్రళయకాలంలో భయంకరుడు, ధనంజయుడు మొదలైన సర్పాలను ఆభరణాలుగా ధరించినవాడు అయిన పురాతన గజరాజును భజిస్తాను.',
      },
      {
        t: 'nitānta kānta danta kāntim antakāntakātmajaṁ\nacintya rūpam anta hīnam antarāya kṛntanam |\nhṛdantare nirantaraṁ vasantam eva yogināṁ\ntam ekadantam eva taṁ vicintayāmi santatam ||',
        en: 'I constantly meditate on that single-tusked one, whose tusk shines with great beauty, the son of Shiva (who conquered Yama), whose form is beyond thought, who is endless, who cuts through all obstacles, and who forever dwells in the hearts of yogis.',
        te: 'అత్యంత మనోహరమైన దంతకాంతి గలవాడు, యముని జయించిన శివుని కుమారుడు, ఊహకందని రూపం గలవాడు, అంతం లేనివాడు, విఘ్నాలను ఛేదించేవాడు, యోగుల హృదయాలలో నిరంతరం నివసించేవాడు అయిన ఆ ఏకదంతుని ఎల్లప్పుడూ ధ్యానిస్తాను.',
      },
      {
        t: 'mahāgaṇeśa pañcaratnam ādareṇa yo\'nvahaṁ\nprajalpati prabhātake hṛdi smaran gaṇeśvaram |\narogatām adoṣatāṁ susāhitīṁ suputratāṁ\nsamāhitāyur aṣṭabhūtim abhyupaiti so\'cirāt ||',
        en: 'Whoever recites these five jewels on Mahaganesha with devotion every morning, remembering Ganesha in the heart, soon attains good health, freedom from faults, good learning, good children, a long and peaceful life, and the eight kinds of prosperity.',
        te: 'ప్రతిరోజూ ఉదయాన్నే గణేశుని హృదయంలో స్మరిస్తూ ఈ మహాగణేశ పంచరత్నాన్ని భక్తితో పఠించేవారు త్వరలోనే ఆరోగ్యం, దోషరాహిత్యం, మంచి విద్య, సత్సంతానం, ప్రశాంతమైన దీర్ఘాయుష్షు, అష్టైశ్వర్యాలు పొందుతారు.',
      },
    ],
  },

  // ---------------- Shiva ----------------
  {
    id: 'lingashtakam', cat: 'shiva', iast: 'liṅgāṣṭakam', en: 'Lingashtakam',
    about: {
      en: 'Eight verses in praise of the Shiva Linga, attributed to Adi Shankaracharya.',
      te: 'శివలింగ మహిమను కీర్తించే ఎనిమిది శ్లోకాలు. ఆది శంకరాచార్యుల రచనగా ప్రసిద్ధి.',
    },
    verses: [
      {
        t: 'brahma murāri surārcita liṅgaṁ\nnirmala bhāsita śobhita liṅgam |\njanmaja duḥkha vināśaka liṅgaṁ\ntat praṇamāmi sadāśiva liṅgam ||',
        en: 'I bow to that eternal Shiva Linga, worshipped by Brahma, Vishnu and the gods, pure and shining, which destroys the sorrows born of birth.',
        te: 'బ్రహ్మ, విష్ణువు, దేవతలచే పూజించబడేది, నిర్మలంగా ప్రకాశించేది, జన్మల వల్ల కలిగే దుఃఖాన్ని నశింపజేసేది అయిన ఆ సదాశివ లింగానికి నమస్కరిస్తున్నాను.',
      },
      {
        t: 'deva muni pravarārcita liṅgaṁ\nkāma dahana karuṇākara liṅgam |\nrāvaṇa darpa vināśana liṅgaṁ\ntat praṇamāmi sadāśiva liṅgam ||',
        en: 'I bow to that eternal Shiva Linga, worshipped by gods and great sages, which burnt Kama (desire), which is an ocean of compassion, and which destroyed the pride of Ravana.',
        te: 'దేవతలు, మునిశ్రేష్ఠులచే పూజించబడేది, మన్మథుని దహించినది, కరుణకు నిలయం, రావణుని గర్వాన్ని అణచినది అయిన ఆ సదాశివ లింగానికి నమస్కరిస్తున్నాను.',
      },
      {
        t: 'sarva sugandha sulepita liṅgaṁ\nbuddhi vivardhana kāraṇa liṅgam |\nsiddha surāsura vandita liṅgaṁ\ntat praṇamāmi sadāśiva liṅgam ||',
        en: 'I bow to that eternal Shiva Linga, anointed with all fragrances, which causes the growth of wisdom, and which is saluted by siddhas, gods and demons.',
        te: 'సకల సుగంధ ద్రవ్యాలతో అలంకరించబడినది, బుద్ధి వికాసానికి కారణమైనది, సిద్ధులు, దేవతలు, రాక్షసులచే నమస్కరించబడేది అయిన ఆ సదాశివ లింగానికి నమస్కరిస్తున్నాను.',
      },
      {
        t: 'kanaka mahāmaṇi bhūṣita liṅgaṁ\nphaṇipati veṣṭita śobhita liṅgam |\ndakṣa suyajña vināśana liṅgaṁ\ntat praṇamāmi sadāśiva liṅgam ||',
        en: 'I bow to that eternal Shiva Linga, adorned with gold and great gems, beautiful with the king of serpents coiled around it, which destroyed the sacrifice of Daksha.',
        te: 'బంగారం, మహామణులతో అలంకరించబడినది, సర్పరాజుచే చుట్టబడి శోభిల్లేది, దక్షుని యజ్ఞాన్ని నాశనం చేసినది అయిన ఆ సదాశివ లింగానికి నమస్కరిస్తున్నాను.',
      },
      {
        t: 'kuṅkuma candana lepita liṅgaṁ\npaṅkaja hāra suśobhita liṅgam |\nsañcita pāpa vināśana liṅgaṁ\ntat praṇamāmi sadāśiva liṅgam ||',
        en: 'I bow to that eternal Shiva Linga, smeared with kumkum and sandal paste, beautiful with garlands of lotuses, which destroys accumulated sins.',
        te: 'కుంకుమ, చందనంతో అలంకరించబడినది, తామరపూల మాలలతో శోభిల్లేది, పోగుపడిన పాపాలను నశింపజేసేది అయిన ఆ సదాశివ లింగానికి నమస్కరిస్తున్నాను.',
      },
      {
        t: 'devagaṇārcita sevita liṅgaṁ\nbhāvair bhaktibhir eva ca liṅgam |\ndinakara koṭi prabhākara liṅgaṁ\ntat praṇamāmi sadāśiva liṅgam ||',
        en: 'I bow to that eternal Shiva Linga, worshipped and served by hosts of gods with feeling and devotion, and radiant as ten million suns.',
        te: 'దేవగణాలచే భావంతో, భక్తితో పూజించబడి సేవించబడేది, కోటి సూర్యుల కాంతి గలది అయిన ఆ సదాశివ లింగానికి నమస్కరిస్తున్నాను.',
      },
      {
        t: 'aṣṭadalopari veṣṭita liṅgaṁ\nsarva samudbhava kāraṇa liṅgam |\naṣṭa daridra vināśita liṅgaṁ\ntat praṇamāmi sadāśiva liṅgam ||',
        en: 'I bow to that eternal Shiva Linga, seated upon an eight-petalled lotus, the cause of all creation, which destroys the eight kinds of poverty.',
        te: 'ఎనిమిది రేకుల పద్మంపై వెలసినది, సకల సృష్టికి కారణమైనది, ఎనిమిది రకాల దారిద్ర్యాలను నశింపజేసేది అయిన ఆ సదాశివ లింగానికి నమస్కరిస్తున్నాను.',
      },
      {
        t: 'suraguru suravara pūjita liṅgaṁ\nsuravana puṣpa sadārcita liṅgam |\nparātparaṁ paramātmaka liṅgaṁ\ntat praṇamāmi sadāśiva liṅgam ||',
        en: 'I bow to that eternal Shiva Linga, worshipped by Brihaspati (the gods\' guru) and the best of gods, always worshipped with flowers from the celestial gardens; higher than the highest, the Supreme Self.',
        te: 'దేవగురువు బృహస్పతి, దేవశ్రేష్ఠులచే పూజించబడేది, దేవలోకపు ఉద్యానవన పుష్పాలతో ఎల్లప్పుడూ అర్చించబడేది, పరాత్పరమైనది, పరమాత్మ స్వరూపమైనది అయిన ఆ సదాశివ లింగానికి నమస్కరిస్తున్నాను.',
      },
      {
        t: 'liṅgāṣṭakam idaṁ puṇyaṁ yaḥ paṭhec chiva sannidhau |\nśivalokam avāpnoti śivena saha modate ||',
        en: 'Whoever recites this sacred Lingashtakam in the presence of Shiva attains the abode of Shiva and rejoices with him.',
        te: 'పవిత్రమైన ఈ లింగాష్టకాన్ని శివుని సన్నిధిలో పఠించేవారు శివలోకాన్ని పొంది శివునితో కలిసి ఆనందిస్తారు.',
      },
    ],
  },
  {
    id: 'shiva-panchakshara', cat: 'shiva', iast: 'śiva pañcākṣara stotram', en: 'Shiva Panchakshara Stotram',
    about: {
      en: 'By Adi Shankaracharya. Each verse is built on one syllable of the five-syllable mantra "na-maḥ-śi-vā-ya".',
      te: 'ఆది శంకరాచార్యుల రచన. "న-మః-శి-వా-య" అనే పంచాక్షరి మంత్రంలోని ఒక్కొక్క అక్షరంతో ఒక్కొక్క శ్లోకం.',
    },
    verses: [
      {
        t: 'nāgendra hārāya trilocanāya\nbhasmāṅga rāgāya maheśvarāya |\nnityāya śuddhāya digambarāya\ntasmai nakārāya namaḥ śivāya ||',
        en: 'Salutations to Shiva, the syllable "Na" — who wears the king of serpents as a garland, who has three eyes, whose body is smeared with sacred ash, the Great Lord, eternal, pure, clothed by the directions.',
        te: 'సర్పరాజును హారంగా ధరించినవాడు, మూడు కన్నులవాడు, విభూతిని శరీరానికి పూసుకున్నవాడు, మహేశ్వరుడు, నిత్యుడు, శుద్ధుడు, దిక్కులనే వస్త్రాలుగా కలవాడు, "న" కార స్వరూపుడు అయిన శివునికి నమస్కారం.',
      },
      {
        t: 'mandākinī salila candana carcitāya\nnandīśvara pramatha nātha maheśvarāya |\nmandāra puṣpa bahupuṣpa supūjitāya\ntasmai makārāya namaḥ śivāya ||',
        en: 'Salutations to Shiva, the syllable "Ma" — anointed with the waters of the Ganga and sandal paste, Lord of Nandi and the pramathas, the Great Lord, worshipped with mandara and many other flowers.',
        te: 'గంగాజలం, చందనంతో అర్చించబడినవాడు, నందీశ్వరునికి, ప్రమథగణాలకు అధిపతి, మహేశ్వరుడు, మందార మొదలైన అనేక పుష్పాలతో పూజించబడేవాడు, "మ" కార స్వరూపుడు అయిన శివునికి నమస్కారం.',
      },
      {
        t: 'śivāya gaurī vadanābja vṛnda\nsūryāya dakṣādhvara nāśakāya |\nśrī nīlakaṇṭhāya vṛṣadhvajāya\ntasmai śikārāya namaḥ śivāya ||',
        en: 'Salutations to Shiva, the syllable "Shi" — the auspicious one, the sun that makes Gauri\'s lotus face bloom, destroyer of Daksha\'s sacrifice, the blue-throated one, whose banner bears the bull.',
        te: 'మంగళస్వరూపుడు, గౌరీదేవి ముఖపద్మానికి సూర్యుని వంటివాడు, దక్షయజ్ఞాన్ని నాశనం చేసినవాడు, నీలకంఠుడు, వృషభ ధ్వజం గలవాడు, "శి" కార స్వరూపుడు అయిన శివునికి నమస్కారం.',
      },
      {
        t: 'vasiṣṭha kumbhodbhava gautamārya\nmunīndra devārcita śekharāya |\ncandrārka vaiśvānara locanāya\ntasmai vakārāya namaḥ śivāya ||',
        en: 'Salutations to Shiva, the syllable "Va" — worshipped by great sages like Vasishtha, Agastya and Gautama and by the gods, whose three eyes are the moon, the sun and fire.',
        te: 'వసిష్ఠుడు, అగస్త్యుడు, గౌతముడు మొదలైన మునిశ్రేష్ఠులు, దేవతలచే పూజించబడే శిరస్సు గలవాడు, చంద్రుడు, సూర్యుడు, అగ్ని కన్నులుగా గలవాడు, "వ" కార స్వరూపుడు అయిన శివునికి నమస్కారం.',
      },
      {
        t: 'yakṣa svarūpāya jaṭādharāya\npināka hastāya sanātanāya |\ndivyāya devāya digambarāya\ntasmai yakārāya namaḥ śivāya ||',
        en: 'Salutations to Shiva, the syllable "Ya" — who took the form of a Yaksha, who wears matted locks, who holds the Pinaka bow, the eternal, the divine, clothed by the directions.',
        te: 'యక్ష రూపం ధరించినవాడు, జటాధారి, పినాకమనే ధనుస్సు చేతిలో గలవాడు, సనాతనుడు, దివ్యుడు, దిగంబరుడు, "య" కార స్వరూపుడు అయిన శివునికి నమస్కారం.',
      },
      {
        t: 'pañcākṣaram idaṁ puṇyaṁ yaḥ paṭhec chiva sannidhau |\nśivalokam avāpnoti śivena saha modate ||',
        en: 'Whoever recites this sacred Panchakshara hymn in the presence of Shiva attains the abode of Shiva and rejoices with him.',
        te: 'పవిత్రమైన ఈ పంచాక్షర స్తోత్రాన్ని శివుని సన్నిధిలో పఠించేవారు శివలోకాన్ని పొంది శివునితో కలిసి ఆనందిస్తారు.',
      },
    ],
  },
  {
    id: 'mrityunjaya', cat: 'shiva', iast: 'mahā mṛtyuñjaya mantraḥ', en: 'Maha Mrityunjaya Mantra',
    about: {
      en: 'From the Rig Veda (7.59.12). A prayer to Shiva (Tryambaka) for health and liberation.',
      te: 'ఋగ్వేదం (7.59.12) లోని మంత్రం. ఆరోగ్యం, మోక్షం కోసం త్ర్యంబకుడైన శివుని ప్రార్థన.',
    },
    verses: [
      {
        t: 'oṁ tryambakaṁ yajāmahe sugandhiṁ puṣṭivardhanam |\nurvārukam iva bandhanān mṛtyor mukṣīya mā\'mṛtāt ||',
        en: 'We worship the three-eyed Lord, who is fragrant and who nourishes all beings. As a ripe cucumber is freed from its vine, may He free us from death, and not from immortality.',
        te: 'సుగంధభరితుడు, సకల జీవులను పోషించేవాడు అయిన మూడు కన్నుల శివుని పూజిస్తాము. పండిన దోసకాయ తీగ నుండి సహజంగా విడిపోయినట్లు, మమ్మల్ని మృత్యువు నుండి విడిపించి, అమృతత్వం నుండి దూరం చేయకుండా ఉండుగాక.',
      },
    ],
  },

  // ---------------- Vishnu ----------------
  {
    id: 'vishnu-dhyanam', cat: 'vishnu', iast: 'viṣṇu dhyānam (śāntākāram)', en: 'Vishnu Dhyanam (Shantakaram)',
    about: {
      en: 'The best-known meditation verse on Lord Vishnu.',
      te: 'శ్రీ మహావిష్ణువుపై అత్యంత ప్రసిద్ధమైన ధ్యాన శ్లోకం.',
    },
    verses: [
      {
        t: 'śāntākāraṁ bhujagaśayanaṁ padmanābhaṁ sureśaṁ\nviśvādhāraṁ gaganasadṛśaṁ meghavarṇaṁ śubhāṅgam |\nlakṣmīkāntaṁ kamalanayanaṁ yogibhir dhyānagamyaṁ\nvande viṣṇuṁ bhavabhayaharaṁ sarvalokaika nātham ||',
        en: 'I salute Vishnu — of peaceful form, resting on the serpent, with a lotus in his navel, Lord of the gods, support of the universe, vast like the sky, dark as a rain cloud, of auspicious body, beloved of Lakshmi, lotus-eyed, reached by yogis through meditation, remover of the fear of worldly existence, the one Lord of all worlds.',
        te: 'ప్రశాంతమైన ఆకారం గలవాడు, శేషశయనుడు, నాభిలో పద్మం గలవాడు, దేవతలకు ప్రభువు, విశ్వానికి ఆధారం, ఆకాశం వలె వ్యాపించినవాడు, మేఘవర్ణుడు, శుభమైన అవయవాలు గలవాడు, లక్ష్మీపతి, పద్మనేత్రుడు, యోగులకు ధ్యానంలో లభించేవాడు, సంసార భయాన్ని పోగొట్టేవాడు, సకల లోకాలకు ఏకైక నాథుడు అయిన విష్ణువుకు నమస్కరిస్తున్నాను.',
      },
    ],
  },

  // ---------------- Venkateswara ----------------
  {
    id: 'venkatesa-suprabhatam', cat: 'venkateswara', iast: 'śrī veṅkaṭeśa suprabhātam (prārambha ślokāḥ)', en: 'Sri Venkatesa Suprabhatam (opening verses)',
    about: {
      en: 'The opening verses of the morning hymn sung to wake Lord Venkateswara at Tirumala. The first verse is from the Valmiki Ramayana.',
      te: 'తిరుమలలో శ్రీ వేంకటేశ్వర స్వామిని మేల్కొలిపే సుప్రభాతంలోని మొదటి శ్లోకాలు. మొదటి శ్లోకం వాల్మీకి రామాయణంలోనిది.',
    },
    verses: [
      {
        t: 'kausalyā suprajā rāma pūrvā sandhyā pravartate |\nuttiṣṭha naraśārdūla kartavyaṁ daivam āhnikam ||',
        en: 'O Rama, blessed son of Kausalya, the eastern dawn is breaking. Arise, O tiger among men; the day\'s sacred duties must be performed.',
        te: 'కౌసల్యాదేవి సుపుత్రా, ఓ రామా! తూర్పు సంధ్య ప్రారంభమవుతోంది. ఓ నరశ్రేష్ఠా, లే! నిత్యం చేయవలసిన దైవకార్యాలు చేయాలి.',
      },
      {
        t: 'uttiṣṭhottiṣṭha govinda uttiṣṭha garuḍadhvaja |\nuttiṣṭha kamalākānta trailokyaṁ maṅgalaṁ kuru ||',
        en: 'Arise, arise, O Govinda! Arise, O Lord whose banner bears Garuda! Arise, O beloved of Lakshmi, and bless the three worlds with auspiciousness.',
        te: 'లే లే గోవిందా! గరుడ ధ్వజం గలవాడా, లే! ఓ లక్ష్మీపతీ, లే! మూడు లోకాలకు మంగళం చేయి.',
      },
    ],
  },
  {
    id: 'venkatesa-mangalam', cat: 'venkateswara', iast: 'śrī veṅkaṭeśa prārthanā', en: 'Sri Venkatesa Prarthana',
    about: {
      en: 'A verse of the Mangalashasanam and a verse from the Venkatesa Stotram.',
      te: 'మంగళాశాసనం లోని ఒక శ్లోకం, వేంకటేశ స్తోత్రంలోని ఒక శ్లోకం.',
    },
    verses: [
      {
        t: 'śriyaḥ kāntāya kalyāṇa nidhaye nidhaye\'rthinām |\nśrī veṅkaṭa nivāsāya śrīnivāsāya maṅgalam ||',
        en: 'May all be auspicious for Srinivasa, who dwells on the Venkata hill — the beloved of Lakshmi, the treasure-house of auspicious qualities, the treasure of those who seek.',
        te: 'లక్ష్మీదేవికి ప్రియుడు, కళ్యాణ గుణాలకు నిధి, కోరేవారికి నిధి వంటివాడు, వేంకటాద్రిపై నివసించేవాడు అయిన శ్రీనివాసునికి మంగళం.',
      },
      {
        t: 'vinā veṅkaṭeśaṁ na nātho na nāthaḥ\nsadā veṅkaṭeśaṁ smarāmi smarāmi |\nhare veṅkaṭeśa prasīda prasīda\npriyaṁ veṅkaṭeśa prayaccha prayaccha ||',
        en: 'Other than Venkatesa there is no lord, no protector. I always remember Venkatesa, I remember him. O Hari, O Venkatesa, be gracious, be gracious; grant what is dear, grant it.',
        te: 'వేంకటేశుడు తప్ప వేరే ప్రభువు లేడు, రక్షకుడు లేడు. ఎల్లప్పుడూ వేంకటేశుని స్మరిస్తాను. ఓ హరీ, వేంకటేశా, ప్రసన్నుడవు కమ్ము; ప్రియమైనది ప్రసాదించు.',
      },
    ],
  },

  // ---------------- Devi ----------------
  {
    id: 'devi-prarthana', cat: 'devi', iast: 'devī prārthanā', en: 'Devi Prarthana',
    about: {
      en: 'Two well-known verses from the Devi Mahatmyam (Durga Saptashati).',
      te: 'దేవీ మాహాత్మ్యం (దుర్గా సప్తశతి) లోని రెండు ప్రసిద్ధ శ్లోకాలు.',
    },
    verses: [
      {
        t: 'sarva maṅgala māṅgalye śive sarvārtha sādhike |\nśaraṇye tryambake gauri nārāyaṇi namo\'stu te ||',
        en: 'O auspiciousness of all that is auspicious, O Shivaa, who fulfils every aim, the refuge of all, three-eyed Gauri, Narayani — salutations to you.',
        te: 'సకల మంగళాలకు మంగళమైనదానా, శివా, అన్ని కోరికలు తీర్చేదానా, శరణు ఇచ్చేదానా, మూడు కన్నుల గౌరీ, నారాయణీ! నీకు నమస్కారం.',
      },
      {
        t: 'yā devī sarvabhūteṣu śakti rūpeṇa saṁsthitā |\nnamastasyai namastasyai namastasyai namo namaḥ ||',
        en: 'To the Goddess who dwells in all beings in the form of power (Shakti) — salutations to her, salutations to her, salutations again and again.',
        te: 'సకల జీవులలో శక్తి రూపంలో నెలకొని ఉన్న ఆ దేవికి నమస్కారం, నమస్కారం, మళ్లీ మళ్లీ నమస్కారం.',
      },
    ],
  },

  // ---------------- Lakshmi ----------------
  {
    id: 'mahalakshmi-ashtakam', cat: 'lakshmi', iast: 'mahālakṣmyaṣṭakam', en: 'Mahalakshmi Ashtakam',
    about: {
      en: 'Eight verses to Goddess Mahalakshmi, sung by Indra (from the Padma Purana).',
      te: 'ఇంద్రుడు మహాలక్ష్మీదేవిని స్తుతించిన ఎనిమిది శ్లోకాలు (పద్మపురాణం).',
    },
    verses: [
      {
        t: 'namaste\'stu mahāmāye śrīpīṭhe surapūjite |\nśaṅkha cakra gadā haste mahālakṣmi namo\'stu te ||',
        en: 'Salutations to you, O Mahamaya, seated on the throne of prosperity, worshipped by the gods, holding conch, discus and mace — O Mahalakshmi, salutations to you.',
        te: 'మహామాయా, శ్రీపీఠంపై కూర్చున్నదానా, దేవతలచే పూజించబడేదానా, శంఖం, చక్రం, గద చేతుల్లో ధరించినదానా, ఓ మహాలక్ష్మీ! నీకు నమస్కారం.',
      },
      {
        t: 'namaste garuḍārūḍhe kolāsura bhayaṅkari |\nsarva pāpa hare devi mahālakṣmi namo\'stu te ||',
        en: 'Salutations to you who ride on Garuda, who terrified the demon Kolasura, who removes all sins — O Goddess Mahalakshmi, salutations to you.',
        te: 'గరుడునిపై ఆసీనురాలైనదానా, కోలాసురునికి భయం కలిగించినదానా, సకల పాపాలను హరించే దేవీ, ఓ మహాలక్ష్మీ! నీకు నమస్కారం.',
      },
      {
        t: 'sarvajñe sarvavarade sarva duṣṭa bhayaṅkari |\nsarva duḥkha hare devi mahālakṣmi namo\'stu te ||',
        en: 'O all-knowing one, giver of all boons, terror of all the wicked, remover of all sorrow — O Goddess Mahalakshmi, salutations to you.',
        te: 'సర్వజ్ఞురాలా, అన్ని వరాలు ఇచ్చేదానా, దుష్టులందరికీ భయం కలిగించేదానా, అన్ని దుఃఖాలను హరించే దేవీ, ఓ మహాలక్ష్మీ! నీకు నమస్కారం.',
      },
      {
        t: 'siddhi buddhi prade devi bhukti mukti pradāyini |\nmantra mūrte sadā devi mahālakṣmi namo\'stu te ||',
        en: 'O Goddess who grants success and wisdom, who gives both worldly enjoyment and liberation, whose form is the mantra — O Mahalakshmi, salutations to you always.',
        te: 'సిద్ధిని, బుద్ధిని ఇచ్చే దేవీ, భుక్తిని, ముక్తిని ప్రసాదించేదానా, మంత్ర స్వరూపిణీ, ఓ మహాలక్ష్మీ! నీకు ఎల్లప్పుడూ నమస్కారం.',
      },
      {
        t: 'ādyanta rahite devi ādyaśakti maheśvari |\nyogaje yoga sambhūte mahālakṣmi namo\'stu te ||',
        en: 'O Goddess without beginning or end, the primordial power, the great ruler, born of yoga, manifested through yoga — O Mahalakshmi, salutations to you.',
        te: 'ఆది, అంతం లేని దేవీ, ఆదిశక్తీ, మహేశ్వరీ, యోగం నుండి జన్మించినదానా, యోగంతో ప్రత్యక్షమైనదానా, ఓ మహాలక్ష్మీ! నీకు నమస్కారం.',
      },
      {
        t: 'sthūla sūkṣma mahāraudre mahāśakti mahodare |\nmahā pāpa hare devi mahālakṣmi namo\'stu te ||',
        en: 'O Goddess who is both gross and subtle, terrible when needed, the great power, vast in being, remover of great sins — O Mahalakshmi, salutations to you.',
        te: 'స్థూల, సూక్ష్మ రూపాలు గలదానా, మహారౌద్రీ, మహాశక్తీ, గొప్ప ఉదరం గలదానా, మహాపాపాలను హరించే దేవీ, ఓ మహాలక్ష్మీ! నీకు నమస్కారం.',
      },
      {
        t: 'padmāsana sthite devi parabrahma svarūpiṇi |\nparameśi jaganmātar mahālakṣmi namo\'stu te ||',
        en: 'O Goddess seated on the lotus, whose form is the Supreme Brahman, supreme ruler, Mother of the universe — O Mahalakshmi, salutations to you.',
        te: 'పద్మాసనంపై కూర్చున్న దేవీ, పరబ్రహ్మ స్వరూపిణీ, పరమేశ్వరీ, జగన్మాతా, ఓ మహాలక్ష్మీ! నీకు నమస్కారం.',
      },
      {
        t: 'śvetāmbaradhare devi nānālaṅkāra bhūṣite |\njagat sthite jaganmātar mahālakṣmi namo\'stu te ||',
        en: 'O Goddess dressed in white, adorned with many ornaments, who pervades and sustains the world, Mother of the universe — O Mahalakshmi, salutations to you.',
        te: 'తెల్లని వస్త్రాలు ధరించిన దేవీ, అనేక ఆభరణాలతో అలంకరించబడినదానా, జగత్తంతా వ్యాపించినదానా, జగన్మాతా, ఓ మహాలక్ష్మీ! నీకు నమస్కారం.',
      },
      {
        t: 'mahālakṣmyaṣṭakaṁ stotraṁ yaḥ paṭhed bhaktimān naraḥ |\nsarva siddhim avāpnoti rājyaṁ prāpnoti sarvadā ||',
        en: 'The devotee who recites this Mahalakshmi Ashtakam attains every success and always gains prosperity.',
        te: 'ఈ మహాలక్ష్మ్యష్టకాన్ని భక్తితో పఠించేవారు సకల సిద్ధులను, ఎల్లప్పుడూ ఐశ్వర్యాన్ని పొందుతారు.',
      },
    ],
  },

  // ---------------- Saraswati ----------------
  {
    id: 'saraswati-prarthana', cat: 'saraswati', iast: 'sarasvatī prārthanā', en: 'Saraswati Prarthana',
    about: {
      en: 'Prayers to Goddess Saraswati, recited before study or any learning.',
      te: 'చదువు ప్రారంభించే ముందు సరస్వతీదేవిని ప్రార్థించే శ్లోకాలు.',
    },
    verses: [
      {
        t: 'sarasvati namastubhyaṁ varade kāmarūpiṇi |\nvidyārambhaṁ kariṣyāmi siddhir bhavatu me sadā ||',
        en: 'O Saraswati, giver of boons, who takes any form at will — salutations to you. I am beginning my studies; may I always succeed.',
        te: 'వరాలు ఇచ్చే, కోరిన రూపం ధరించే ఓ సరస్వతీదేవీ, నీకు నమస్కారం. నేను విద్యను ప్రారంభిస్తున్నాను; నాకు ఎల్లప్పుడూ సిద్ధి కలుగుగాక.',
      },
      {
        t: 'yā kundendu tuṣārahāra dhavalā yā śubhravastrāvṛtā\nyā vīṇā varadaṇḍa maṇḍitakarā yā śvetapadmāsanā |\nyā brahmācyuta śaṅkara prabhṛtibhir devaiḥ sadā vanditā\nsā māṁ pātu sarasvatī bhagavatī niḥśeṣa jāḍyāpahā ||',
        en: 'She who is white like the jasmine, the moon and a garland of snow, who is clothed in pure white, whose hands are adorned with the veena and the staff of boons, who sits on a white lotus, who is always worshipped by Brahma, Vishnu, Shiva and the gods — may that Goddess Saraswati, who removes all dullness, protect me.',
        te: 'మల్లెపూవు, చంద్రుడు, మంచు హారం వలె తెల్లనిది, తెల్లని వస్త్రాలు ధరించినది, వీణ, వరదండంతో అలంకరించిన చేతులు గలది, తెల్లని పద్మంపై కూర్చున్నది, బ్రహ్మ, విష్ణువు, శివుడు మొదలైన దేవతలచే ఎల్లప్పుడూ నమస్కరించబడేది, జడత్వాన్ని పూర్తిగా పోగొట్టేది అయిన ఆ భగవతి సరస్వతి నన్ను రక్షించుగాక.',
      },
    ],
  },

  // ---------------- Rama ----------------
  {
    id: 'rama-shlokas', cat: 'rama', iast: 'śrī rāma ślokāḥ', en: 'Sri Rama Shlokas',
    about: {
      en: 'Well-known verses on Sri Rama. The first, spoken by Shiva to Parvati, says that the name of Rama equals the thousand names of Vishnu.',
      te: 'శ్రీరామునిపై ప్రసిద్ధ శ్లోకాలు. మొదటి శ్లోకంలో శివుడు పార్వతితో రామనామం విష్ణు సహస్రనామాలకు సమానమని చెప్తాడు.',
    },
    verses: [
      {
        t: 'śrī rāma rāma rāmeti rame rāme manorame |\nsahasranāma tat tulyaṁ rāma nāma varānane ||',
        en: '(Shiva to Parvati) O beautiful one, I delight in the enchanting name of Rama, chanting "Rama, Rama, Rama". The name of Rama is equal to the thousand names of Vishnu.',
        te: '(శివుడు పార్వతితో) ఓ సుందరీ! "శ్రీరామ రామ రామ" అని మనోహరమైన రామనామంలో నేను రమిస్తాను. రామనామం విష్ణు సహస్రనామాలకు సమానం.',
      },
      {
        t: 'rāmāya rāmabhadrāya rāmacandrāya vedhase |\nraghunāthāya nāthāya sītāyāḥ pataye namaḥ ||',
        en: 'Salutations to Rama, the auspicious Ramabhadra, Ramachandra, the creator, the Lord of the Raghus, the protector, the husband of Sita.',
        te: 'రామునికి, రామభద్రునికి, రామచంద్రునికి, సృష్టికర్తకు, రఘునాథునికి, రక్షకునికి, సీతాపతికి నమస్కారం.',
      },
      {
        t: 'āpadām apahartāraṁ dātāraṁ sarvasampadām |\nlokābhirāmaṁ śrīrāmaṁ bhūyo bhūyo namāmyaham ||',
        en: 'Again and again I bow to Sri Rama, the delight of the world, who removes all calamities and bestows every kind of wealth.',
        te: 'ఆపదలను తొలగించేవాడు, సకల సంపదలను ఇచ్చేవాడు, లోకాలకు ఆనందం కలిగించేవాడు అయిన శ్రీరామునికి మళ్లీ మళ్లీ నమస్కరిస్తున్నాను.',
      },
    ],
  },

  // ---------------- Krishna ----------------
  {
    id: 'madhurashtakam', cat: 'krishna', iast: 'madhurāṣṭakam', en: 'Madhurashtakam',
    about: {
      en: 'By Sri Vallabhacharya. Eight verses describing everything about Krishna, the Lord of sweetness, as sweet.',
      te: 'శ్రీ వల్లభాచార్యుల రచన. మధురాధిపతి అయిన శ్రీకృష్ణుని ప్రతిదీ మధురమేనని వర్ణించే ఎనిమిది శ్లోకాలు.',
    },
    verses: [
      {
        t: 'adharaṁ madhuraṁ vadanaṁ madhuraṁ\nnayanaṁ madhuraṁ hasitaṁ madhuram |\nhṛdayaṁ madhuraṁ gamanaṁ madhuraṁ\nmadhurādhipater akhilaṁ madhuram ||',
        en: 'His lips are sweet, his face is sweet, his eyes are sweet, his smile is sweet, his heart is sweet, his walk is sweet — everything about the Lord of sweetness is sweet.',
        te: 'ఆయన పెదవులు మధురం, ముఖం మధురం, కన్నులు మధురం, నవ్వు మధురం, హృదయం మధురం, నడక మధురం — మధురాధిపతి అయిన కృష్ణునిలో అంతా మధురమే.',
      },
      {
        t: 'vacanaṁ madhuraṁ caritaṁ madhuraṁ\nvasanaṁ madhuraṁ valitaṁ madhuram |\ncalitaṁ madhuraṁ bhramitaṁ madhuraṁ\nmadhurādhipater akhilaṁ madhuram ||',
        en: 'His words are sweet, his deeds are sweet, his clothes are sweet, his posture is sweet, his movements are sweet, his wanderings are sweet — everything about the Lord of sweetness is sweet.',
        te: 'ఆయన మాటలు మధురం, చరిత్ర మధురం, వస్త్రాలు మధురం, భంగిమ మధురం, కదలిక మధురం, సంచారం మధురం — మధురాధిపతిలో అంతా మధురమే.',
      },
      {
        t: 'veṇur madhuro reṇur madhuraḥ\npāṇir madhuraḥ pādau madhurau |\nnṛtyaṁ madhuraṁ sakhyaṁ madhuraṁ\nmadhurādhipater akhilaṁ madhuram ||',
        en: 'His flute is sweet, the dust of his feet is sweet, his hands are sweet, his feet are sweet, his dance is sweet, his friendship is sweet — everything about the Lord of sweetness is sweet.',
        te: 'ఆయన వేణువు మధురం, పాదధూళి మధురం, చేతులు మధురం, పాదాలు మధురం, నృత్యం మధురం, స్నేహం మధురం — మధురాధిపతిలో అంతా మధురమే.',
      },
      {
        t: 'gītaṁ madhuraṁ pītaṁ madhuraṁ\nbhuktaṁ madhuraṁ suptaṁ madhuram |\nrūpaṁ madhuraṁ tilakaṁ madhuraṁ\nmadhurādhipater akhilaṁ madhuram ||',
        en: 'His song is sweet, his drinking is sweet, his eating is sweet, his sleep is sweet, his form is sweet, his tilaka is sweet — everything about the Lord of sweetness is sweet.',
        te: 'ఆయన పాట మధురం, తాగడం మధురం, తినడం మధురం, నిద్ర మధురం, రూపం మధురం, తిలకం మధురం — మధురాధిపతిలో అంతా మధురమే.',
      },
      {
        t: 'karaṇaṁ madhuraṁ taraṇaṁ madhuraṁ\nharaṇaṁ madhuraṁ ramaṇaṁ madhuram |\nvamitaṁ madhuraṁ śamitaṁ madhuraṁ\nmadhurādhipater akhilaṁ madhuram ||',
        en: 'His actions are sweet, his saving of devotees is sweet, his stealing is sweet, his playfulness is sweet, his offerings are sweet, his calm is sweet — everything about the Lord of sweetness is sweet.',
        te: 'ఆయన పనులు మధురం, భక్తులను తరింపజేయడం మధురం, దొంగిలించడం మధురం, క్రీడించడం మధురం, ప్రసాదించడం మధురం, శాంతి మధురం — మధురాధిపతిలో అంతా మధురమే.',
      },
      {
        t: 'guñjā madhurā mālā madhurā\nyamunā madhurā vīcī madhurā |\nsalilaṁ madhuraṁ kamalaṁ madhuraṁ\nmadhurādhipater akhilaṁ madhuram ||',
        en: 'His gunja-berry necklace is sweet, his garland is sweet, the Yamuna is sweet, its ripples are sweet, its water is sweet, its lotuses are sweet — everything about the Lord of sweetness is sweet.',
        te: 'ఆయన గురివింద హారం మధురం, మాల మధురం, యమునా నది మధురం, అలలు మధురం, జలం మధురం, తామరలు మధురం — మధురాధిపతిలో అంతా మధురమే.',
      },
      {
        t: 'gopī madhurā līlā madhurā\nyuktaṁ madhuraṁ muktaṁ madhuram |\ndṛṣṭaṁ madhuraṁ śiṣṭaṁ madhuraṁ\nmadhurādhipater akhilaṁ madhuram ||',
        en: 'The gopis are sweet, his play is sweet, his union is sweet, his release is sweet, his glance is sweet, his courtesy is sweet — everything about the Lord of sweetness is sweet.',
        te: 'గోపికలు మధురం, లీలలు మధురం, కలయిక మధురం, విడుదల మధురం, చూపు మధురం, మర్యాద మధురం — మధురాధిపతిలో అంతా మధురమే.',
      },
      {
        t: 'gopā madhurā gāvo madhurā\nyaṣṭir madhurā sṛṣṭir madhurā |\ndalitaṁ madhuraṁ phalitaṁ madhuraṁ\nmadhurādhipater akhilaṁ madhuram ||',
        en: 'The cowherds are sweet, the cows are sweet, his staff is sweet, his creation is sweet, his destroying of evil is sweet, his granting of fruits is sweet — everything about the Lord of sweetness is sweet.',
        te: 'గోపాలురు మధురం, గోవులు మధురం, కర్ర మధురం, సృష్టి మధురం, దుష్టులను అణచడం మధురం, ఫలాలు ఇవ్వడం మధురం — మధురాధిపతిలో అంతా మధురమే.',
      },
    ],
  },
  {
    id: 'krishna-shlokas', cat: 'krishna', iast: 'śrī kṛṣṇa ślokāḥ', en: 'Sri Krishna Shlokas',
    about: {
      en: 'Popular prayers to Lord Krishna.',
      te: 'శ్రీకృష్ణునిపై ప్రసిద్ధ ప్రార్థనా శ్లోకాలు.',
    },
    verses: [
      {
        t: 'vasudeva sutaṁ devaṁ kaṁsa cāṇūra mardanam |\ndevakī paramānandaṁ kṛṣṇaṁ vande jagadgurum ||',
        en: 'I salute Krishna, the teacher of the world — the divine son of Vasudeva, slayer of Kamsa and Chanura, the supreme joy of Devaki.',
        te: 'వసుదేవుని కుమారుడు, దేవుడు, కంసుని, చాణూరుని సంహరించినవాడు, దేవకీదేవికి పరమానందం కలిగించినవాడు, జగద్గురువు అయిన శ్రీకృష్ణునికి నమస్కరిస్తున్నాను.',
      },
      {
        t: 'kṛṣṇāya vāsudevāya haraye paramātmane |\npraṇata kleśa nāśāya govindāya namo namaḥ ||',
        en: 'Salutations again and again to Krishna, son of Vasudeva, Hari, the Supreme Self, Govinda, who destroys the troubles of those who surrender to him.',
        te: 'కృష్ణునికి, వాసుదేవునికి, హరికి, పరమాత్మకు, శరణు వేడినవారి కష్టాలను నశింపజేసే గోవిందునికి మళ్లీ మళ్లీ నమస్కారం.',
      },
    ],
  },

  // ---------------- Hanuman ----------------
  {
    id: 'hanuman-shlokas', cat: 'hanuman', iast: 'śrī hanumat ślokāḥ', en: 'Sri Hanuman Shlokas',
    about: {
      en: 'Popular prayers to Sri Hanuman for courage, strength and wisdom.',
      te: 'ధైర్యం, బలం, బుద్ధి కోసం శ్రీ హనుమంతుని ప్రార్థించే ప్రసిద్ధ శ్లోకాలు.',
    },
    verses: [
      {
        t: 'manojavaṁ māruta tulya vegaṁ\njitendriyaṁ buddhimatāṁ variṣṭham |\nvātātmajaṁ vānara yūtha mukhyaṁ\nśrī rāmadūtaṁ śaraṇaṁ prapadye ||',
        en: 'I take refuge in the messenger of Sri Rama — swift as the mind, fast as the wind, master of the senses, foremost among the wise, son of the Wind god, chief of the vanara army.',
        te: 'మనస్సు వేగం, వాయువేగం గలవాడు, ఇంద్రియాలను జయించినవాడు, బుద్ధిమంతులలో శ్రేష్ఠుడు, వాయుపుత్రుడు, వానర సేనకు నాయకుడు అయిన శ్రీరామదూతను శరణు వేడుతున్నాను.',
      },
      {
        t: 'buddhir balaṁ yaśo dhairyaṁ nirbhayatvam arogatā |\najāḍyaṁ vākpaṭutvaṁ ca hanumat smaraṇād bhavet ||',
        en: 'By remembering Hanuman one gains intelligence, strength, fame, courage, fearlessness, good health, alertness and eloquence.',
        te: 'హనుమంతుని స్మరించడం వల్ల బుద్ధి, బలం, కీర్తి, ధైర్యం, నిర్భయత్వం, ఆరోగ్యం, చురుకుదనం, వాక్చాతుర్యం కలుగుతాయి.',
      },
    ],
  },

  // ---------------- Subrahmanya ----------------
  {
    id: 'subrahmanya-dhyanam', cat: 'subrahmanya', iast: 'subrahmaṇya dhyānam', en: 'Subrahmanya Dhyanam',
    about: {
      en: 'A meditation verse on Lord Subrahmanya (Kartikeya / Murugan).',
      te: 'శ్రీ సుబ్రహ్మణ్య స్వామిపై ధ్యాన శ్లోకం.',
    },
    verses: [
      {
        t: 'ṣaḍānanaṁ kuṅkuma raktavarṇaṁ\nmahāmatiṁ divya mayūra vāhanam |\nrudrasya sūnuṁ suranātha senaṁ\nguhaṁ sadāhaṁ śaraṇaṁ prapadye ||',
        en: 'I always take refuge in Guha — six-faced, red like kumkum, of great wisdom, riding the divine peacock, son of Rudra, commander of the army of the gods.',
        te: 'ఆరు ముఖాలు గలవాడు, కుంకుమ వంటి ఎర్రని వర్ణం గలవాడు, మహాబుద్ధిమంతుడు, దివ్యమైన నెమలి వాహనం గలవాడు, రుద్రుని కుమారుడు, దేవసేనాధిపతి అయిన గుహుని ఎల్లప్పుడూ శరణు వేడుతున్నాను.',
      },
    ],
  },

  // ---------------- Navagraha ----------------
  {
    id: 'navagraha-stotram', cat: 'navagraha', iast: 'navagraha stotram', en: 'Navagraha Stotram',
    about: {
      en: 'Attributed to Sage Vyasa. One verse for each of the nine planetary deities, from Surya to Ketu.',
      te: 'వ్యాస మహర్షి రచనగా ప్రసిద్ధి. సూర్యుని నుండి కేతువు వరకు తొమ్మిది గ్రహాలకు ఒక్కొక్క శ్లోకం.',
    },
    verses: [
      {
        t: 'japākusuma saṅkāśaṁ kāśyapeyaṁ mahādyutim |\ntamo\'riṁ sarva pāpaghnaṁ praṇato\'smi divākaram ||',
        en: '(Surya) I bow to the Sun — red like the hibiscus flower, son of Kashyapa, of great brilliance, enemy of darkness, destroyer of all sins.',
        te: '(సూర్యుడు) మందార పువ్వు వంటి కాంతి గలవాడు, కశ్యపుని కుమారుడు, మహాతేజస్సు గలవాడు, చీకటికి శత్రువు, సకల పాపాలను నశింపజేసేవాడు అయిన సూర్యునికి నమస్కరిస్తున్నాను.',
      },
      {
        t: 'dadhi śaṅkha tuṣārābhaṁ kṣīrodārṇava sambhavam |\nnamāmi śaśinaṁ somaṁ śambhor mukuṭa bhūṣaṇam ||',
        en: '(Chandra) I bow to the Moon — white like curd, the conch and snow, born of the ocean of milk, the ornament on Shiva\'s crown.',
        te: '(చంద్రుడు) పెరుగు, శంఖం, మంచు వంటి తెల్లని కాంతి గలవాడు, పాలసముద్రం నుండి పుట్టినవాడు, శివుని కిరీటానికి ఆభరణమైన చంద్రునికి నమస్కరిస్తున్నాను.',
      },
      {
        t: 'dharaṇī garbha sambhūtaṁ vidyut kānti samaprabham |\nkumāraṁ śakti hastaṁ taṁ maṅgalaṁ praṇamāmyaham ||',
        en: '(Mangala / Mars) I bow to Mangala — born of the Earth, shining like lightning, youthful, holding a spear.',
        te: '(కుజుడు) భూదేవి గర్భం నుండి జన్మించినవాడు, మెరుపు వంటి కాంతి గలవాడు, కుమారుడు, శక్తి ఆయుధం చేతిలో గలవాడు అయిన అంగారకునికి నమస్కరిస్తున్నాను.',
      },
      {
        t: 'priyaṅgu kalikā śyāmaṁ rūpeṇāpratimaṁ budham |\nsaumyaṁ saumya guṇopetaṁ taṁ budhaṁ praṇamāmyaham ||',
        en: '(Budha / Mercury) I bow to Budha — dark like the priyangu bud, of matchless form, wise, gentle and full of gentle qualities.',
        te: '(బుధుడు) ప్రియంగు మొగ్గ వంటి శ్యామవర్ణం గలవాడు, సాటిలేని రూపం గలవాడు, జ్ఞాని, సౌమ్యుడు, సౌమ్య గుణాలు గలవాడు అయిన బుధునికి నమస్కరిస్తున్నాను.',
      },
      {
        t: 'devānāṁ ca ṛṣīṇāṁ ca guruṁ kāñcana sannibham |\nbuddhibhūtaṁ trilokeśaṁ taṁ namāmi bṛhaspatim ||',
        en: '(Guru / Jupiter) I bow to Brihaspati — teacher of the gods and sages, golden in hue, the embodiment of wisdom, lord of the three worlds.',
        te: '(గురువు) దేవతలకు, ఋషులకు గురువు, బంగారు వర్ణం గలవాడు, బుద్ధి స్వరూపుడు, మూడు లోకాలకు ప్రభువు అయిన బృహస్పతికి నమస్కరిస్తున్నాను.',
      },
      {
        t: 'himakunda mṛṇālābhaṁ daityānāṁ paramaṁ gurum |\nsarva śāstra pravaktāraṁ bhārgavaṁ praṇamāmyaham ||',
        en: '(Shukra / Venus) I bow to Shukra, son of Bhrigu — white like snow, jasmine and lotus stalks, the great teacher of the daityas, expounder of all the shastras.',
        te: '(శుక్రుడు) మంచు, మల్లెపూవు, తామరతూడు వంటి తెల్లని కాంతి గలవాడు, రాక్షసులకు గురువు, అన్ని శాస్త్రాలను బోధించేవాడు అయిన శుక్రునికి నమస్కరిస్తున్నాను.',
      },
      {
        t: 'nīlāñjana samābhāsaṁ raviputraṁ yamāgrajam |\nchāyā mārtāṇḍa sambhūtaṁ taṁ namāmi śanaiścaram ||',
        en: '(Shani / Saturn) I bow to Shanaishchara — dark like blue collyrium, son of the Sun, elder brother of Yama, born of Chhaya and Surya.',
        te: '(శని) నల్లని కాటుక వంటి కాంతి గలవాడు, సూర్యపుత్రుడు, యమునికి అన్న, ఛాయాదేవి, సూర్యులకు జన్మించినవాడు అయిన శనైశ్చరునికి నమస్కరిస్తున్నాను.',
      },
      {
        t: 'ardhakāyaṁ mahāvīryaṁ candrāditya vimardanam |\nsiṁhikā garbha sambhūtaṁ taṁ rāhuṁ praṇamāmyaham ||',
        en: '(Rahu) I bow to Rahu — with half a body, of great valour, who eclipses the Moon and the Sun, born of Simhika.',
        te: '(రాహువు) సగం శరీరం గలవాడు, మహా పరాక్రమవంతుడు, సూర్యచంద్రులను గ్రహించేవాడు, సింహిక గర్భం నుండి జన్మించినవాడు అయిన రాహువుకు నమస్కరిస్తున్నాను.',
      },
      {
        t: 'palāśa puṣpa saṅkāśaṁ tārakā graha mastakam |\nraudraṁ raudrātmakaṁ ghoraṁ taṁ ketuṁ praṇamāmyaham ||',
        en: '(Ketu) I bow to Ketu — red like the palasha flower, head among stars and planets, fierce, of fierce nature and terrifying.',
        te: '(కేతువు) మోదుగ పువ్వు వంటి కాంతి గలవాడు, నక్షత్రాలు, గ్రహాలలో శిరస్సు వంటివాడు, రౌద్రుడు, భయంకరుడు అయిన కేతువుకు నమస్కరిస్తున్నాను.',
      },
    ],
  },

  // ---------------- Surya ----------------
  {
    id: 'surya-namaskara', cat: 'surya', iast: 'sūrya namaskāra mantrāḥ', en: 'Surya Namaskara Mantras',
    about: {
      en: 'The twelve names of the Sun recited with the twelve rounds of Surya Namaskara.',
      te: 'సూర్య నమస్కారాల పన్నెండు ఆవృత్తులతో చెప్పే సూర్యుని పన్నెండు నామాలు.',
    },
    verses: [
      {
        t: 'oṁ mitrāya namaḥ | oṁ ravaye namaḥ | oṁ sūryāya namaḥ | oṁ bhānave namaḥ |\noṁ khagāya namaḥ | oṁ pūṣṇe namaḥ | oṁ hiraṇyagarbhāya namaḥ | oṁ marīcaye namaḥ |\noṁ ādityāya namaḥ | oṁ savitre namaḥ | oṁ arkāya namaḥ | oṁ bhāskarāya namaḥ ||',
        en: 'Salutations to the Sun as: the friend of all (Mitra), the shining one (Ravi), the one who moves (Surya), the giver of light (Bhanu), who moves in the sky (Khaga), the nourisher (Pushan), the golden womb (Hiranyagarbha), the rays of light (Marichi), son of Aditi (Aditya), the life-giver (Savitr), the one worthy of praise (Arka), and the illuminator (Bhaskara).',
        te: 'అందరికీ మిత్రుడు (మిత్ర), ప్రకాశించేవాడు (రవి), సంచరించేవాడు (సూర్య), వెలుగునిచ్చేవాడు (భాను), ఆకాశంలో సంచరించేవాడు (ఖగ), పోషించేవాడు (పూష), హిరణ్యగర్భుడు, కిరణ స్వరూపుడు (మరీచి), అదితి పుత్రుడు (ఆదిత్య), ప్రాణం ఇచ్చేవాడు (సవిత), పూజ్యుడు (అర్క), వెలుగును ప్రసరించేవాడు (భాస్కర) — ఈ పన్నెండు నామాలతో సూర్యునికి నమస్కారం.',
      },
    ],
  },

  // ---------------- Guru ----------------
  {
    id: 'guru-shlokas', cat: 'guru', iast: 'guru ślokāḥ', en: 'Guru Shlokas',
    about: {
      en: 'Verses in praise of the Guru, from the Guru Gita.',
      te: 'గురువును కీర్తించే గురుగీతలోని శ్లోకాలు.',
    },
    verses: [
      {
        t: 'gurur brahmā gurur viṣṇuḥ gurur devo maheśvaraḥ |\nguruḥ sākṣāt paraṁ brahma tasmai śrī gurave namaḥ ||',
        en: 'The Guru is Brahma, the Guru is Vishnu, the Guru is Lord Maheshvara. The Guru is verily the Supreme Brahman itself. Salutations to that revered Guru.',
        te: 'గురువే బ్రహ్మ, గురువే విష్ణువు, గురువే మహేశ్వరుడు. గురువే సాక్షాత్ పరబ్రహ్మ. అటువంటి శ్రీ గురువుకు నమస్కారం.',
      },
      {
        t: 'akhaṇḍa maṇḍalākāraṁ vyāptaṁ yena carācaram |\ntat padaṁ darśitaṁ yena tasmai śrī gurave namaḥ ||',
        en: 'Salutations to the revered Guru who showed me that state (of the Supreme) which pervades all that moves and does not move, the unbroken whole of the universe.',
        te: 'అఖండమైన విశ్వమంతా వ్యాపించి, చరాచర జగత్తంతా నిండి ఉన్న ఆ పరమపదాన్ని నాకు చూపించిన శ్రీ గురువుకు నమస్కారం.',
      },
    ],
  },

  // ---------------- Vedic ----------------
  {
    id: 'gayatri', cat: 'vedic', iast: 'gāyatrī mantraḥ', en: 'Gayatri Mantra',
    about: {
      en: 'From the Rig Veda (3.62.10), by Sage Vishvamitra. A prayer to Savitr, the divine light, for an illumined intellect.',
      te: 'విశ్వామిత్ర మహర్షి దర్శించిన ఋగ్వేద (3.62.10) మంత్రం. బుద్ధిని ప్రకాశింపజేయమని సవితృ దేవుని ప్రార్థన.',
    },
    verses: [
      {
        t: 'oṁ bhūr bhuvaḥ svaḥ |\ntat savitur vareṇyaṁ bhargo devasya dhīmahi |\ndhiyo yo naḥ pracodayāt ||',
        en: 'Om. Earth, atmosphere and heaven. We meditate on the adorable radiance of the divine Savitr. May He inspire and illumine our intellect.',
        te: 'ఓం. భూలోకం, భువర్లోకం, స్వర్లోకం. శ్రేష్ఠమైన సవితృ దేవుని దివ్య తేజస్సును ధ్యానిస్తాము. ఆ దేవుడు మా బుద్ధులను ప్రేరేపించుగాక.',
      },
    ],
  },
  {
    id: 'shanti-mantras', cat: 'vedic', iast: 'śānti mantrāḥ', en: 'Shanti Mantras',
    about: {
      en: 'Peace invocations from the Upanishads, recited at the start or end of study and worship.',
      te: 'ఉపనిషత్తుల నుండి శాంతి మంత్రాలు. అధ్యయనం, పూజ ప్రారంభంలో లేదా చివరలో చదువుతారు.',
    },
    verses: [
      {
        t: 'oṁ saha nāvavatu | saha nau bhunaktu |\nsaha vīryaṁ karavāvahai |\ntejasvi nāvadhītam astu mā vidviṣāvahai ||\noṁ śāntiḥ śāntiḥ śāntiḥ ||',
        en: '(Katha / Taittiriya Upanishad) May He protect us both (teacher and student). May He nourish us both. May we work together with energy. May our study be brilliant. May we not dislike each other. Om peace, peace, peace.',
        te: '(కఠ / తైత్తిరీయ ఉపనిషత్తు) మా ఇద్దరినీ (గురుశిష్యులను) దేవుడు రక్షించుగాక. మా ఇద్దరినీ పోషించుగాక. కలిసి శక్తితో కృషి చేద్దాం. మా అధ్యయనం తేజోవంతం అగుగాక. మేము ఒకరినొకరు ద్వేషించకుండా ఉందాం. ఓం శాంతిః శాంతిః శాంతిః.',
      },
      {
        t: 'oṁ asato mā sad gamaya |\ntamaso mā jyotir gamaya |\nmṛtyor mā\'mṛtaṁ gamaya ||\noṁ śāntiḥ śāntiḥ śāntiḥ ||',
        en: '(Brihadaranyaka Upanishad) Lead me from the unreal to the real. Lead me from darkness to light. Lead me from death to immortality. Om peace, peace, peace.',
        te: '(బృహదారణ్యక ఉపనిషత్తు) అసత్యం నుండి సత్యానికి నన్ను నడిపించు. చీకటి నుండి వెలుగుకు నడిపించు. మృత్యువు నుండి అమృతత్వానికి నడిపించు. ఓం శాంతిః శాంతిః శాంతిః.',
      },
      {
        t: 'oṁ pūrṇam adaḥ pūrṇam idaṁ pūrṇāt pūrṇam udacyate |\npūrṇasya pūrṇam ādāya pūrṇam evāvaśiṣyate ||\noṁ śāntiḥ śāntiḥ śāntiḥ ||',
        en: '(Isha Upanishad) That is whole, this is whole. From the whole, the whole arises. Taking the whole from the whole, the whole alone remains. Om peace, peace, peace.',
        te: '(ఈశావాస్య ఉపనిషత్తు) అది పూర్ణం, ఇది పూర్ణం. పూర్ణం నుండే పూర్ణం ఉద్భవిస్తుంది. పూర్ణం నుండి పూర్ణాన్ని తీసివేసినా పూర్ణమే మిగులుతుంది. ఓం శాంతిః శాంతిః శాంతిః.',
      },
    ],
  },
];

// Texts imported from Telugu Wikisource: Telugu script (`tt`), no meanings yet
const IMPORTED = LIBRARY.map((x) => ({
  id: x.id,
  cat: x.cat,
  te_title: x.title,
  // Telugu "-ము/-మ్" endings read as "-am" in English titles
  en: toPlainName(fromTelugu(x.title)).replace(/amu\b|am\b/g, 'am'),
  about: { te: x.about, en: '' },
  source: x.source,
  verses: x.verses,
}));

// Insert extra categories after the one named in `after`
export const CATEGORIES = [...MORE_CATEGORIES, ...KARMA_CATEGORIES].reduce((list, { after, ...cat }) => {
  const i = list.findIndex((c) => c.id === after);
  return [...list.slice(0, i + 1), cat, ...list.slice(i + 1)];
}, BASE_CATEGORIES);

// Keep each category's stotras together: ones with meanings first, then imported texts
export const STOTRAS = CATEGORIES.flatMap((c) => [...BASE_STOTRAS, ...KARMA_STOTRAS, ...VINAYAKA_STOTRAS, ...MORE_STOTRAS, ...IMPORTED].filter((x) => x.cat === c.id));
