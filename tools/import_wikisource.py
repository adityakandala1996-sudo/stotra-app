#!/usr/bin/env python3
"""Import stotras from Telugu Wikisource (CC BY-SA 4.0) into js/data/library.js.

Usage:  python3 -I tools/import_wikisource.py [--refresh]
Downloads every page in the stotra categories (cached in tools/.cache/pages.json),
cleans the wiki markup, groups lines into verses, assigns a deity category and
writes the result. Texts are kept in Telugu script; meanings are not imported.
"""
import json
import os
import re
import subprocess
import sys
import time
import urllib.parse

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CACHE = os.path.join(ROOT, 'tools', '.cache', 'pages.json')
OUT = os.path.join(ROOT, 'js', 'data', 'library.js')
API = 'https://te.wikisource.org/w/api.php?'
UA = 'StotraMala/1.0 (personal devotional app)'
CATEGORIES = ['వర్గం:స్తోత్రములు', 'వర్గం:అష్టకములు']

# Not stotras (literary works, songs, other languages) or index pages
EXCLUDE = {
    'అష్టమస్కంధము', 'గీతాగోవిందం', 'భారత సావిత్రి (వచనము)', 'భారత సావిత్రీ', 'మేలుకొలుపు పాట',
    'వడ్డూరి అచ్యుతరామ కవి భక్తిమాల', 'వినాయకర్ అగవల్', 'స్తోత్రములు', 'గోమాత', 'ఆమ్నాయం',
    'శ్రీరామ సహస్రనామావళి',
}
# Already in the app with meanings (stotras.js / stotras-more.js)
HAVE = {
    'కాలభైరవాష్టకం', 'బిల్వాష్టకము', 'మధురాష్టకము', 'మహాలక్ష్మ్యష్టకము', 'లింగాష్టకము',
    'ద్వాదశ జ్యోతిర్లింగస్తోస్త్రం', 'నవగ్రహ స్తోత్రము', 'పురుష సూక్తము', 'శివ పంచాక్షరీ స్తోత్రము',
    'శ్రీకృష్ణాష్టకం', 'శ్రీసూర్యాష్టకం',
}

# First matching rule wins, so specific deities come before generic words
RULES = [
    ('subrahmanya', ['సుబ్రహ్మణ్య', 'స్కంద', 'షణ్ముఖ', 'కార్తికేయ']),
    ('ayyappa', ['అయ్యప్ప', 'శాస్తా']),
    ('datta', ['దత్త']),
    ('guru', ['దక్షిణామూర్తి', 'గురు', 'తోటక', 'మనీషా', 'సాధన పంచకం', 'భజగోవింద', 'సాయి']),
    ('hanuman', ['హనుమ', 'ఆంజనేయ', 'మారుతి', 'మారుతీ']),
    ('vishnu', ['నృసింహ', 'నరసింహ', 'హయగ్రీవ']),
    ('venkateswara', ['వేంకటేశ', 'శ్రీనివాస', 'దివ్యదేశ']),
    ('navagraha', ['నవగ్రహ']),
    ('surya', ['సూర్య', 'ఆదిత్య']),
    ('ganesha', ['గణ', 'వినాయక', 'విఘ్నేశ']),
    ('saraswati', ['సరస్వతి', 'సరస్వతీ', 'శారద']),
    ('lakshmi', ['లక్ష్మి', 'లక్ష్మీ', 'కనకధార']),
    ('rama', ['రామ', 'సీతా']),
    ('krishna', ['కృష్ణ', 'క్రిష్ణ', 'గోవింద', 'బాలముకుంద', 'పాండురంగ']),
    ('devi', ['దుర్గ', 'దేవీ', 'దేవి', 'లలిత', 'గౌరీ', 'గౌర్య', 'భ్రమరాంబ', 'అన్నపూర్ణ', 'మీనాక్షీ', 'త్రిపురసుందర',
              'రాజరాజేశ్వర', 'శక్తిపీఠ', 'భద్రకాళీ', 'మణిద్వీప', 'సౌందర్యలహరి', 'గాయత్రి']),
    ('shiva', ['శివ', 'లింగ', 'శంకర', 'రుద్ర', 'నమకము', 'చంద్రశేఖర', 'వైద్యనాథ', 'గౌరీశ', 'శత రుద్రీయం']),
    ('vishnu', ['విష్ణు', 'నారాయణ', 'అచ్యుత', 'జనార్దన', 'జగన్నాథ', 'దశావతార', 'శాలిగ్రామ', 'ఆర్తత్రాణ']),
    ('vedic', ['సూక్త', 'మంత్ర పుష్ప', 'Mantra', 'స్వస్తి']),
]


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


def category(title):
    for cat, words in RULES:
        if any(w in title for w in words):
            return cat
    return 'vividha'


def fingerprint(verses):
    for v in verses:
        if not v.get('h'):
            return re.sub(r'[^అ-హ]', '', v['tt'])[:40]
    return ''


def main():
    pages = download() if '--refresh' in sys.argv or not os.path.exists(CACHE) else json.load(open(CACHE))
    items, seen, skipped = [], {}, []
    for title in sorted(pages):
        if title in EXCLUDE or title in HAVE:
            skipped.append((title, 'excluded' if title in EXCLUDE else 'already have'))
            continue
        about, verses = to_verses(strip_markup(pages[title]), title)
        text_len = sum(len(v['tt']) for v in verses if not v.get('h'))
        if text_len < 200 or len([v for v in verses if not v.get('h')]) < 2:
            skipped.append((title, f'too little text ({text_len})'))
            continue
        fp = fingerprint(verses)
        if fp in seen:
            other = seen[fp]
            if text_len <= other['_len']:
                skipped.append((title, f'duplicate of {other["title"]}'))
                continue
            skipped.append((other['title'], f'duplicate of {title}'))
            items.remove(other)
        item = {
            'title': title.replace('‌', ''),
            'cat': category(title),
            'about': ' '.join(about)[:1200],
            'source': 'https://te.wikisource.org/wiki/' + urllib.parse.quote(title.replace(' ', '_')),
            'verses': verses,
            '_len': text_len,
        }
        seen[fp] = item
        items.append(item)
    for i, it in enumerate(items):
        it['id'] = f'ws{i + 1:03d}'
        del it['_len']
    header = ('// Generated by tools/import_wikisource.py — do not edit by hand.\n'
              '// Texts from Telugu Wikisource (te.wikisource.org), CC BY-SA 4.0. Meanings not included.\n')
    with open(OUT, 'w') as f:
        f.write(header + 'export const LIBRARY = ' + json.dumps(items, ensure_ascii=False, indent=0) + ';\n')
    from collections import Counter
    print(f'{len(items)} stotras, {sum(len(i["verses"]) for i in items)} verses -> {os.path.relpath(OUT, ROOT)}')
    print(dict(Counter(i['cat'] for i in items)))
    print('skipped:', *[f'  {t}: {why}' for t, why in skipped], sep='\n')


if __name__ == '__main__':
    main()
