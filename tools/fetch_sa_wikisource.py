#!/usr/bin/env python3
"""Download stotra pages from Sanskrit Wikisource (CC BY-SA 4.0) into tools/.cache/sa_pages.json.

Pages there transclude scanned-book pages, so the rendered text is fetched (action=parse).
Re-running only fetches pages missing from the cache. Then run import_wikisource.py.
"""
import html
import json
import os
import re
import subprocess
import time
import urllib.parse

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CACHE = os.path.join(ROOT, 'tools', '.cache', 'sa_pages.json')
API = 'https://sa.wikisource.org/w/api.php?'
UA = 'StotraMala/1.0 (https://adityakandala1996-sudo.github.io/stotra-app/)'
CATEGORIES = ['वर्गः:स्तोत्राणि', 'वर्गः:देवीस्तोत्राणि', 'वर्गः:शिवस्तोत्राणि', 'वर्गः:विष्णुस्तोत्राणि',
              'वर्गः:बृहत्स्तोत्ररत्नाकरः']


def fetch(params, tries=6):
    # Wikisource answers 429 with a non-JSON body when we go too fast; back off and retry
    for i in range(tries):
        out = subprocess.run(['curl', '-s', '-A', UA, API + urllib.parse.urlencode(params)],
                             capture_output=True, text=True, check=True).stdout
        try:
            return json.loads(out)
        except ValueError:
            pass
        time.sleep(5 * 2 ** i)
    raise RuntimeError('rate limited')


def members(cat):
    titles, cont = [], {}
    while True:
        d = fetch({'action': 'query', 'list': 'categorymembers', 'cmtitle': cat, 'cmlimit': 500,
                   'cmnamespace': 0, 'format': 'json', **cont})
        titles += [m['title'] for m in d['query']['categorymembers']]
        if 'continue' not in d:
            return titles
        cont = d['continue']
        time.sleep(1)


def page_text(title):
    d = fetch({'action': 'parse', 'page': title, 'prop': 'text|categories', 'format': 'json',
               'disablelimitreport': 1, 'redirects': 1})
    if 'parse' not in d:
        return None
    t = d['parse']['text']['*']
    t = re.sub(r'(?s)<span[^>]*class="pagenum[^>]*>.*?</span>', '', t)
    t = re.sub(r'(?s)<div[^>]*(?:ws-noexport|header|licenseContainer)[^>]*>.*?</div>', '', t)
    t = re.sub(r'(?s)<sup.*?</sup>|<style.*?</style>', '', t)
    t = re.sub(r'<br\s*/?>', '\n', t)
    t = re.sub(r'</p>|</div>|</h\d>|</li>|</dd>', '\n', t)
    t = html.unescape(re.sub(r'<[^>]+>', '', t))
    cats = [c['*'] for c in d['parse'].get('categories', [])]
    return {'text': re.sub(r'\n{3,}', '\n\n', t).strip(), 'cats': cats}


def main():
    cache = json.load(open(CACHE)) if os.path.exists(CACHE) else {}
    titles = []
    for cat in CATEGORIES:
        titles += members(cat)
        time.sleep(1)
    titles = sorted(set(titles))
    todo = [t for t in titles if t not in cache]
    print(f'{len(titles)} pages listed, {len(todo)} to fetch', flush=True)
    for i, title in enumerate(todo, 1):
        try:
            got = page_text(title)
        except Exception as e:  # keep going; a re-run retries failures
            print('failed:', title, e, flush=True)
            got = None
        if got:
            cache[title] = got
        if i % 25 == 0:
            json.dump(cache, open(CACHE, 'w'), ensure_ascii=False)
            print(f'  {i}/{len(todo)}', flush=True)
        time.sleep(2.5)
    os.makedirs(os.path.dirname(CACHE), exist_ok=True)
    json.dump(cache, open(CACHE, 'w'), ensure_ascii=False)
    print(f'done: {len(cache)} pages cached', flush=True)


if __name__ == '__main__':
    main()
