#!/usr/bin/env python3
"""Import stotras from Telugu and Sanskrit Wikisource (CC BY-SA 4.0) into js/data/library.js.

Usage:  python3 -I tools/import_wikisource.py [--refresh]
Telugu pages are downloaded here (cached in tools/.cache/pages.json); Sanskrit pages come
from tools/fetch_sa_wikisource.py (tools/.cache/sa_pages.json) and are converted from
Devanagari to Telugu script. Markup is cleaned, lines grouped into verses, a deity
category assigned, and anything already in the app is skipped. Meanings are not imported.
"""
import difflib
import json
import os
import re
import subprocess
import sys
import time
import unicodedata
import urllib.parse

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CACHE = os.path.join(ROOT, 'tools', '.cache', 'pages.json')
SA_CACHE = os.path.join(ROOT, 'tools', '.cache', 'sa_pages.json')
NODE = os.path.expanduser('~/.local/node/bin/node')
OUT = os.path.join(ROOT, 'js', 'data', 'library.js')
API = 'https://te.wikisource.org/w/api.php?'
UA = 'StotraMala/1.0 (personal devotional app)'
CATEGORIES = ['వర్గం:స్తోత్రములు', 'వర్గం:అష్టకములు']

# Not stotras (literary works, songs, other languages) or index pages
EXCLUDE = {
    'అష్టమస్కంధము', 'గీతాగోవిందం', 'భారత సావిత్రి (వచనము)', 'భారత సావిత్రీ', 'మేలుకొలుపు పాట',
    'వడ్డూరి అచ్యుతరామ కవి భక్తిమాల', 'వినాయకర్ అగవల్', 'స్తోత్రములు', 'గోమాత', 'ఆమ్నాయం',
    'శ్రీరామ సహస్రనామావళి', 'మంత్ర పుష్పము',
}
TITLE_FIX = {'Mantra pushpam': 'మంత్రపుష్పమ్'}
# Already in the app with meanings (stotras.js / stotras-more.js)
HAVE = {
    'కాలభైరవాష్టకం', 'బిల్వాష్టకము', 'మధురాష్టకము', 'మహాలక్ష్మ్యష్టకము', 'లింగాష్టకము',
    'ద్వాదశ జ్యోతిర్లింగస్తోస్త్రం', 'నవగ్రహ స్తోత్రము', 'పురుష సూక్తము', 'శివ పంచాక్షరీ స్తోత్రము',
    'శ్రీకృష్ణాష్టకం', 'శ్రీసూర్యాష్టకం',
}

# First matching rule wins, so specific deities come before generic words
RULES = [
    ('pooja', ['మంత్ర పుష్ప', 'మంత్రపుష్ప', 'Mantra pushpam']),
    # names that contain another deity's keyword (రామ, సుందర, చంద్ర) are settled first
    ('shiva', ['రామేశ్వర', 'అర్ధనారీశ్వర', 'అట్టాలసుందర', 'సుందరేశ', 'అఘోర', 'చంద్రశేఖర', 'చంద్రమౌళ', 'సోమనాథ',
               'విశ్వనాథ', 'కాశీ', 'కాశ్య', 'నటరాజ', 'పశుపత', 'మహాదేవ', 'హర ', 'హరాష్ట', 'శంభు', 'మృత్యుంజయ', 'భైరవ', 'అర్ధనారీ', 'కిరాత', 'సాంబ', 'పరమేశ్వరస్తుతి', 'మల్హారీ']),
    ('vishnu', ['పరశురామ', 'వామన', 'వరాహ', 'మత్స్య', 'కూర్మ', 'నృసింహ', 'నరసింహ', 'సుదర్శన', 'గజేంద్ర', 'విష్ణో', 'హర్యష్ట', 'మధుసూదన', 'ఆర్త్తత్రాణ', 'చతుర్వింశతినామ', 'నఖస్తుతి']),
    ('navagraha', ['అంగారక', 'బుధ', 'బృహస్పతి', 'శుక్ర', 'శనైశ్చర', 'శని', 'రాహు', 'కేతు', 'గ్రహ', 'కేత్వ']),
    ('venkateswara', ['అంజనశైల', 'వేంకట', 'శ్రీనివాస', 'వృషశైల', 'వ్యంకటేశ']),
    ('ganesha', ['ఏకదంత', 'గజానన', 'లంబోదర', 'విఘ్న', 'హేరంబ', 'వక్రతుండ']),
    ('subrahmanya', ['సుబ్రహ్మణ్య', 'స్కంద', 'షణ్ముఖ', 'కార్తికేయ', 'సుబ్రమణ్య']),
    ('ayyappa', ['అయ్యప్ప', 'శాస్తా']),
    ('datta', ['దత్త', 'అనసూయ']),
    ('guru', ['దక్షిణామూర్తి', 'గురు', 'తోటక', 'మనీషా', 'సాధన పంచకం', 'భజగోవింద', 'సాయి', 'అద్వైత', 'అవధూత',
              'శంకరాచార్య', 'శంకర భగవత్పాద', 'వ్యాస', 'ఏకశ్లోకీ', 'యతి', 'కౌపీన', 'నిర్వాణ', 'పరమాద్వైత', 'బ్రహ్మానుచింతన', 'మనోబోధ', 'మానసోల్లాస', 'వాక్యవృత్తి', 'విజ్ఞాననౌకా', 'వేదాంత', 'వైరాగ్య', 'సాధక', 'సాధన', 'స్వరూపానుసంధాన', 'హస్తామలక', 'శ్రుతిగీతా', 'ఏకాత్మతా', 'ప్రాతఃస్మర', 'ప్రాత:స్మర', 'పాదుకా', 'గుర్వ']),
    ('hanuman', ['హనుమ', 'ఆంజనేయ', 'మారుత', 'వాయుపుత్ర']),
    ('vishnu', ['నృసింహ', 'నరసింహ', 'హయగ్రీవ']),
    ('venkateswara', ['వేంకటేశ', 'శ్రీనివాస', 'దివ్యదేశ']),
    ('navagraha', ['నవగ్రహ']),
    ('surya', ['సూర్య', 'ఆదిత్య', 'భాస్కర', 'సవితృ', 'మార్తాండ', 'దినేశ']),
    ('ganesha', ['గణ', 'వినాయక', 'విఘ్నేశ']),
    ('saraswati', ['సరస్వత', 'శారద', 'వాగ్దేవ', 'భారతీ', 'కమలజదయితా']),
    ('lakshmi', ['లక్ష్మ', 'కనకధార', 'కమలా', 'పద్మావతీ', 'మహాలక్ష్మ']),
    ('rama', ['రామ', 'సీతా', 'రఘునాథ']),
    ('krishna', ['కృష్ణ', 'క్రిష్ణ', 'గోవింద', 'బాలముకుంద', 'పాండురంగ', 'గోపాల', 'విఠ్ఠల', 'విఠల', 'మురారి', 'రాధా', 'జగన్నాథ', 'శిక్షాష్టక']),
    ('devi', ['దుర్గ', 'దేవీ', 'దేవి', 'లలిత', 'గౌరీ', 'గౌర్య', 'భ్రమరాంబ', 'అన్నపూర్ణ', 'మీనాక్షీ', 'త్రిపురసుందర',
              'రాజరాజేశ్వర', 'శక్తిపీఠ', 'భద్రకాళీ', 'మణిద్వీప', 'సౌందర్యలహరి', 'గాయత్రి', 'గాయత్రీ', 'దేవ్య', 'ఆర్యా',
              'కాలీ', 'కాళీ', 'కాలికా', 'భవానీ', 'చండీ', 'చాముండా', 'త్రిపుర', 'సుందరీ', 'బాలా', 'శ్యామలా',
              'వారాహీ', 'అంబా', 'అంబికా', 'ఉమా', 'పార్వతీ', 'కామాక్షీ', 'విశాలాక్షీ', 'మహిషాసుర', 'అపరాజితా',
              'భ్రమరాంబ', 'శక్తి', 'కుమారీ', 'మాతృకా', 'సరస్వత్య', 'నవదుర్గా', 'అర్గలా', 'కీలక', 'ఆద్యా', 'కర్పూరాది', 'కల్యాణవృష్టి', 'కాకిన', 'కాత్యాయన', 'కుండలిన', 'చండికా', 'ఛిన్నమస్తా', 'తారాసహస్ర', 'తులజా', 'జగదంబ', 'ఆదిమాతా', 'రేణుకా', 'వింధ్యవాసిని', 'కామాక్షి', 'ఆనందలహరీ', 'ఆనందసాగర', 'గాయత్ర్య', 'భవాన్య']),
    ('shiva', ['శివ', 'లింగ', 'శంకర', 'రుద్ర', 'నమకము', 'చంద్రశేఖర', 'వైద్యనాథ', 'గౌరీశ', 'శత రుద్రీయం']),
    ('vishnu', ['విష్ణు', 'నారాయణ', 'అచ్యుత', 'జనార్దన', 'జగన్నాథ', 'దశావతార', 'శాలిగ్రామ', 'ఆర్తత్రాణ']),
    ('vedic', ['సూక్త', 'స్వస్తి', 'ఉపనిష']),
]
# Sanskrit Wikisource categories that settle the section when the title alone does not
SA_CAT_HINTS = {'शिवस्तोत्राणि': 'shiva', 'देवीस्तोत्राणि': 'devi', 'विष्णुस्तोत्राणि': 'vishnu'}
SA_SKIP_CATS = {'प्रबोधसुधाकरः'}  # a philosophical treatise, not stotras


def fetch(params):
    url = API + urllib.parse.urlencode(params)
    out = subprocess.run(['curl', '-s', '-A', UA, url], capture_output=True, text=True, check=True).stdout
    return json.loads(out)


def download():
    titles = set()
    for cat in CATEGORIES:
        cont = {}
        while True:
            d = fetch({'action': 'query', 'list': 'categorymembers', 'cmtitle': cat, 'cmlimit': 500,
                       'cmnamespace': 0, 'format': 'json', **cont})
            titles |= {m['title'] for m in d['query']['categorymembers']}
            if 'continue' not in d:
                break
            cont = d['continue']
            time.sleep(1)
    titles = sorted(titles)
    pages = {}
    for i in range(0, len(titles), 40):
        d = fetch({'action': 'query', 'prop': 'revisions', 'rvprop': 'content', 'rvslots': 'main',
                   'titles': '|'.join(titles[i:i + 40]), 'format': 'json', 'redirects': 1})
        for p in d['query']['pages'].values():
            if 'revisions' in p:
                pages[p['title']] = p['revisions'][0]['slots']['main']['*']
        time.sleep(2)
    os.makedirs(os.path.dirname(CACHE), exist_ok=True)
    json.dump(pages, open(CACHE, 'w'), ensure_ascii=False)
    return pages


def strip_markup(text):
    text = re.sub(r'(?s)<!--.*?-->', '', text)
    text = re.sub(r'(?s)<ref[^>]*?/>|<ref[^>]*>.*?</ref>', '', text)
    for _ in range(5):  # templates can nest
        text = re.sub(r'\{\{[^{}]*\}\}', '', text)
    text = re.sub(r'\{\|.*?\|\}', '', text, flags=re.S)  # tables
    text = re.sub(r'__[A-Z]+__', '', text)
    text = re.sub(r'\[\[(?:వర్గం|Category|దస్త్రం|File|Image):[^\]]*\]\]', '', text)
    text = re.sub(r'\[\[(?:[^\]|]*\|)?(?:[a-z]+:)?([^\]]*)\]\]', r'\1', text)
    text = re.sub(r'\[https?://\S+\s*([^\]]*)\]', r'\1', text)
    text = re.sub(r"'{2,}", '', text)
    text = re.sub(r'<br\s*/?>', '\n', text)
    text = re.sub(r'<[^>]+>', '', text)
    text = text.replace('&nbsp;', ' ')
    # Visarga typed as a colon after a Telugu letter
    text = re.sub(r'([ఀ-౿]):', r'\1ః', text)
    return text


TELUGU = re.compile(r'[ఀ-౿]')
NASAL_CLASS = {'ఙ': 'కఖగఘ', 'ఞ': 'చఛజఝ', 'ణ': 'టఠడఢ', 'న': 'తథదధ', 'మ': 'పఫబభ'}


def anusvara(text):
    # Telugu writes a nasal before a stop of its own class as anusvara: చన్ద్ర -> చంద్ర
    for nasal, stops in NASAL_CLASS.items():
        text = re.sub(nasal + '్(?=[' + stops + '])', 'ం', text)
    return text


def deva_to_telugu(text):
    """Devanagari and Telugu Unicode blocks are aligned: most letters are 0x300 apart."""
    out = []
    for ch in text:
        o = ord(ch)
        if 0x0966 <= o <= 0x096F:
            out.append(str(o - 0x0966))
        elif ch == 'ॐ':
            out.append('ఓం')
        elif ch in '।॥\u0951\u0952':
            out.append(ch)
        elif ch == '\u093C':  # nukta has no Telugu counterpart here
            continue
        elif ch == '॰':
            out.append('.')
        elif 0x0900 <= o <= 0x097F:
            te = chr(o + 0x300)
            out.append(te if 'TELUGU' in unicodedata.name(te, '') else ch)
        else:
            out.append(ch)
    return anusvara(''.join(out))


END_MARK = re.compile(r'(\|\||॥|\|\s*\d+\s*\||॥\s*[\d౦-౯]+\s*॥|\s[\d౦-౯]+\s*\.?)\s*$')
HEADING = re.compile(r'^=+\s*(.*?)\s*=+$')


def is_prose(line):
    marks = len(re.findall(r'[|॥।]', line))
    if marks > 1 or (marks == 1 and len(line) < 200):
        return False
    if line.count(',') >= 3 and len(line) < 200:
        return False  # a whole verse on one line, quarters split by commas
    return len(line) > 160 or (len(line) > 80 and line.endswith('.') and line.count(' ') > 10)


def is_intro(line):
    # "ఇది ... రచించిన ... స్తోత్రం." — a one-line description before the text starts
    if re.search(r'[|॥।]', line) or len(line) <= 30 or line.count(',') >= 2:
        return False
    return line.startswith('ఇది ') or bool(re.search(r'(\.|\s:)$', line))


def terminal(line):
    return bool(re.search(r'[.।॥|]\s*$', line))


# Short label lines: "పూర్వపీఠిక :", "శ్రీ భీష్మ ఉవాచ", "ధ్యానమ్ :"
LABEL = re.compile(r'^[^|॥।]{2,40}?(\s:|::|ఉవాచః?\s*:?)\s*$|^\S{2,14}(ం|్)ః$')


def similar(a, b):
    a, b = re.sub(r'[^\u0C05-\u0C39]', '', a), re.sub(r'[^\u0C05-\u0C39]', '', b)
    return bool(a) and sum(ch in b for ch in a) / len(a) > 0.7 and len(a) < len(b) * 1.6


def normalize_line(line):
    line = re.sub(r'^[*#:;]+\s*', '', line.strip())
    line = re.sub(r'\s+', ' ', line)
    # bare trailing verse number -> ॥ n ॥
    line = re.sub(r'([^\d\s|॥])[\s.]+(\d{1,3})\s*$', r'\1 ॥ \2 ॥', line)
    return line


def to_verses(body, title=''):
    raw = [normalize_line(l) for l in body.split('\n')]
    about, verses, block = [], [], []
    has_marks = sum(1 for l in raw if END_MARK.search(l)) >= 3
    is_namavali = sum(1 for l in raw if l.startswith('ఓం') and l.endswith(('నమః', 'నమః ॥'))) >= 10

    def flush():
        if block:
            verses.append({'tt': '\n'.join(block)})
            block.clear()

    for line in raw:
        if not line:
            # A blank line ends a verse only once it is complete (2+ lines, or ends with a stop)
            if not has_marks and not is_namavali and (len(block) >= 2 or (block and terminal(block[-1]))):
                flush()
            continue
        m = HEADING.match(line)
        if m:
            flush()
            if m.group(1):
                verses.append({'tt': m.group(1), 'h': 1})
            continue
        if not TELUGU.search(line):
            continue
        if not verses and not block and len(line) < 50 and not re.search(r'[|॥।]', line) and similar(line, title):
            continue  # the page repeats its own title
        if LABEL.match(line):
            flush()
            verses.append({'tt': re.sub(r'(\s*:+|(?<=[ం్])ః)\s*$', '', line), 'h': 1})
            continue
        started = any(not v.get('h') for v in verses)
        if is_prose(line) or (not started and not block and is_intro(line)):
            flush()
            if not started:
                about.append(line)
            continue
        block.append(line)
        if is_namavali and len(block) >= 10:
            flush()
        elif has_marks and END_MARK.search(line):
            flush()
        elif not has_marks and not is_namavali and len(block) >= 4:
            flush()
    flush()
    while verses and verses[-1].get('h'):
        verses.pop()
    return about, verses


def category(title, hints=()):
    for cat, words in RULES:
        if any(w in title for w in words):
            return cat
    for hint in hints:
        if hint in SA_CAT_HINTS:
            return SA_CAT_HINTS[hint]
    return 'vividha'


def builtin_stotras():
    """Telugu title and verses of every stotra written into the app (the ones with meanings)."""
    code = (
        "const tr = await import('./js/translit.js');"
        "const { STOTRAS } = await import('./js/data/stotras.js');"
        "const own = STOTRAS.filter((s) => s.iast && s.verses.length);"
        "console.log(JSON.stringify(own.map((s) => ({ title: tr.toTelugu(s.iast),"
        " verses: s.verses.filter((v) => !v.h && !v.note).map((v) => v.t ? tr.toTelugu(v.t) : v.tt) }))));"
    )
    out = subprocess.run([NODE, '--input-type=module', '-e', code], cwd=ROOT, capture_output=True, text=True)
    if out.returncode:
        raise SystemExit('could not read built-in stotras: ' + out.stderr[-500:])
    return json.loads(out.stdout)


def sa_pages():
    """Sanskrit Wikisource pages, converted to Telugu script with the page header removed."""
    if not os.path.exists(SA_CACHE):
        return {}
    pages = {}
    for title, page in json.load(open(SA_CACHE)).items():
        if SA_SKIP_CATS & set(c.replace('_', ' ') for c in page['cats']):
            continue
        lines = page['text'].split('\n')
        # The rendered page opens with title/author/year; the text starts at the first danda line
        start = next((i for i, l in enumerate(lines) if re.search(r'[।॥|]', l)), 0)
        lines = [l for l in lines[start:] if '[[' not in l and ']]' not in l]
        start = 0
        clean_title = re.sub(r'\s*\(.*?\)\s*', ' ', title).strip()
        pages[deva_to_telugu(clean_title)] = {
            'text': deva_to_telugu('\n'.join(lines[start:])),
            'cats': [c.replace('_', ' ') for c in page['cats']],
            'source': 'https://sa.wikisource.org/wiki/' + urllib.parse.quote(title.replace(' ', '_')),
        }
    return pages


def letters(text):
    return re.sub(r'[^అ-హ]', '', anusvara(text))


def same_title(a, b):
    a, b = letters(a.replace('శ్రీ', '')), letters(b.replace('శ్రీ', ''))
    return difflib.SequenceMatcher(None, a, b).ratio() >= 0.8


def fingerprint(verses, n=3):
    """Letters of the first n verses. Many pages open with the same invocation, so one verse is not enough."""
    # skip one-line invocations like "॥ శ్రీ గణేశాయ నమః ॥" that open many unrelated pages
    body = [v['tt'] for v in verses if not v.get('h') and len(letters(v['tt'])) >= 20][:n]
    return letters(' '.join(body))[:160]


def main():
    te_pages = download() if '--refresh' in sys.argv or not os.path.exists(CACHE) else json.load(open(CACHE))
    sources = [(title, strip_markup(text), [], 'https://te.wikisource.org/wiki/' + urllib.parse.quote(title.replace(' ', '_')), 'ws')
               for title, text in sorted(te_pages.items())]
    sources += [(title, p['text'], p['cats'], p['source'], 'sa') for title, p in sorted(sa_pages().items())]

    own = builtin_stotras()
    def sig(title, verses):
        # fingerprints are computed once per stotra; comparing them is then cheap
        return {'fp3': fingerprint(verses), 'fp1': fingerprint(verses, 1), 'tl': letters(title.replace('శ్రీ', '')),
                'n': len([v for v in verses if not v.get('h')])}

    def same_text(a, b):
        # same first three verses, or same first verse under a similar title
        if a['fp3'] and a['fp3'] == b['fp3']:
            return True
        return bool(a['fp1']) and a['fp1'] == b['fp1'] and difflib.SequenceMatcher(None, a['tl'], b['tl']).ratio() >= 0.8

    own = [sig(b['title'], [{'tt': t} for t in b['verses']]) for b in own]
    items, skipped = [], []
    for title, body, cats, source, kind in sources:
        if title in EXCLUDE or title in HAVE:
            skipped.append((title, 'excluded' if title in EXCLUDE else 'already have'))
            continue
        about, verses = to_verses(body, title)
        text_len = sum(len(v['tt']) for v in verses if not v.get('h'))
        if text_len < 200 or len([v for v in verses if not v.get('h')]) < 2:
            skipped.append((title, f'too little text ({text_len})'))
            continue
        me = sig(title, verses)
        # a same-titled page is skipped only when ours is a full stotra, not a short excerpt of it
        if any(same_text(me, b) or (b['n'] >= 4 and difflib.SequenceMatcher(None, me['tl'], b['tl']).ratio() >= 0.9) for b in own):
            skipped.append((title, 'already in the app with meanings'))
            continue
        other = next((it for it in items if same_text(me, it['_sig'])), None)
        if other:
            if text_len <= other['_len']:
                skipped.append((title, f'duplicate of {other["title"]}'))
                continue
            skipped.append((other['title'], f'duplicate of {title}'))
            items.remove(other)
        item = {
            'title': TITLE_FIX.get(title, title).replace('\u200c', ''),
            'cat': category(title, cats),
            'about': ' '.join(about)[:1200],
            'source': source,
            'verses': verses,
            '_len': text_len,
            '_kind': kind,
            '_sig': me,
        }
        items.append(item)
    counters = {'ws': 0, 'sa': 0}
    for it in items:
        counters[it['_kind']] += 1
        it['id'] = f"{it['_kind']}{counters[it['_kind']]:03d}"
        del it['_len'], it['_kind'], it['_sig']
    header = ('// Generated by tools/import_wikisource.py — do not edit by hand.\n'
              '// Texts from Telugu and Sanskrit Wikisource (te/sa.wikisource.org), CC BY-SA 4.0. Meanings not included.\n')
    with open(OUT, 'w') as f:
        f.write(header + 'export const LIBRARY = ' + json.dumps(items, ensure_ascii=False, indent=0) + ';\n')
    from collections import Counter
    print(f'{len(items)} stotras ({counters}), {sum(len(i["verses"]) for i in items)} verses -> {os.path.relpath(OUT, ROOT)}')
    print(dict(Counter(i['cat'] for i in items)))
    print('skipped:', *[f'  {t}: {why}' for t, why in skipped], sep='\n')


if __name__ == '__main__':
    main()
