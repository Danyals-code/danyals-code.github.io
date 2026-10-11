"""Checks the site against the rules in DESIGN.md.

    python3 scripts/check.py

Exits 1 if anything is broken: links, files, ids, headings, images, languages,
cache-busting numbers, the shared header and footer, placeholders or inline
styles. Warnings are printed but do not fail. Standard library only."""
import json
import os
import re
import subprocess
import sys
from collections import Counter, defaultdict
from html.parser import HTMLParser
from urllib.parse import unquote, urlsplit

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SITE = 'https://danyalportfolio.com/'
CSS = 'assets/css/site.css'
VERSIONED = re.compile(r'/(assets/[\w/.-]+\.(?:css|js|svg))\?v=(\d+)')
# Inline styles may set custom properties (data such as --v, --wc-pos, --tint-l)
# and a placeholder's aspect-ratio. Everything else belongs in site.css.
INLINE_OK = re.compile(r'^\s*(--[\w-]+\s*:[^;]+;?\s*)+$')
# One-off inline styles still waiting for a class. Lower this as they go;
# never raise it.
INLINE_BUDGET = 24
# A button or link label never says "case study"; it says "Learn more".
LINK_TEXT_BANNED = re.compile(r'\bcase stud(y|ies)\b', re.I)
LABEL_CLASSES = {'btn', 'link-more', 'link-ext'}

errors, warnings = [], []


def err(msg):
    errors.append(msg)


def warn(msg):
    warnings.append(msg)


class Page(HTMLParser):
    VOID = {'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'source', 'track', 'wbr'}
    LIVE = {'button', 'video', 'audio', 'input', 'select', 'textarea', 'iframe', 'dialog'}

    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.stack, self.ids, self.refs, self.idrefs = [], Counter(), [], []
        self.keys, self.imgs, self.headings, self.styles, self.classes = [], [], [], [], Counter()
        self.nesting, self.live_in_i18n, self.links, self.ph = [], [], [], []
        self.langs, self.meta, self.canonical, self.in_main = None, {}, None, 0
        self.link = None
        self.chrome = defaultdict(str)
        self.capture = None

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        line = self.getpos()[0]
        if tag == 'html':
            self.langs = (a.get('data-langs') or 'en').split()
        if tag == 'main':
            self.in_main += 1
        if tag == 'meta' and (a.get('name') or a.get('property')):
            self.meta[a.get('name') or a.get('property')] = a.get('content')
        if tag == 'link' and a.get('rel') == 'canonical':
            self.canonical = a.get('href')
        if 'id' in a:
            self.ids[a['id']] += 1
        for k in ('href', 'src', 'poster', 'data-src', 'data-poster', 'data-img', 'data-video'):
            if a.get(k):
                self.refs.append((k, a[k], line, tag, a))
        for part in (a.get('srcset') or '').split(','):
            if part.strip():
                self.refs.append(('srcset', part.split()[0], line, tag, a))
        for k in ('aria-controls', 'aria-labelledby', 'aria-describedby', 'data-sheet', 'data-copy-target', 'for'):
            for v in (a.get(k) or '').split():
                self.idrefs.append((k, v, line))
        if a.get('data-i18n'):
            self.keys.append((a['data-i18n'], line))
        for pair in (a.get('data-i18n-attr') or '').split(';'):
            if ':' in pair and pair.split(':', 1)[1].strip():
                self.keys.append((pair.split(':', 1)[1].strip(), line))
        if tag in self.LIVE and any(t[2] for t in self.stack):
            self.live_in_i18n.append((tag, line))
        if tag == 'img':
            self.imgs.append((a, line))
        if re.fullmatch(r'h[1-6]', tag) and self.in_main:
            self.headings.append((int(tag[1]), line, any(t[3] for t in self.stack) or 'hidden' in a))
        for c in (a.get('class') or '').split():
            self.classes[c] += 1
        if a.get('style') is not None:
            self.styles.append((tag, a['style'], line, a))
        if a.get('data-ph'):
            self.ph.append(a['data-ph'])
        names = [t[0] for t in self.stack]
        if tag in {'div', 'p', 'ul', 'ol', 'section', 'figure', 'pre', 'table', 'h1', 'h2', 'h3', 'h4', 'blockquote'} and names and names[-1] == 'p':
            self.nesting.append(f'<{tag}> inside <p> (line {line})')
        if tag in ('a', 'button') and ('a' in names or 'button' in names):
            self.nesting.append(f'<{tag}> inside <a>/<button> (line {line})')
        if tag == 'a':
            self.link = [a, '', line]
        for part in ('gnav__list', 'gfooter__dir'):
            if part in (a.get('class') or '').split() or a.get('id') == 'gnav-list' and part == 'gnav__list':
                self.capture = part
        if self.capture and tag == 'a':
            href = a.get('href', '')
            self.chrome[self.capture] += f'[{href}]'
        if tag not in self.VOID:
            self.stack.append((tag, line, bool(a.get('data-i18n')), 'hidden' in a or a.get('aria-hidden') == 'true'))

    def handle_endtag(self, tag):
        if tag == 'main':
            self.in_main -= 1
        if tag == 'a' and self.link:
            self.links.append(self.link)
            self.link = None
        if tag in ('ul', 'nav') and self.capture:
            if self.capture == 'gnav__list' and tag == 'ul':
                self.capture = None
            if self.capture == 'gfooter__dir' and tag == 'nav':
                self.capture = None
        for i in range(len(self.stack) - 1, -1, -1):
            if self.stack[i][0] == tag:
                del self.stack[i:]
                break

    def handle_data(self, data):
        if self.link:
            self.link[1] += data


def rel(path):
    return os.path.relpath(path, ROOT)


def html_files():
    out = []
    for d, dirs, files in os.walk(ROOT):
        dirs[:] = [x for x in dirs if not x.startswith('.') and x != 'scripts']
        out += [os.path.join(d, f) for f in files if f.endswith('.html')]
    return sorted(out)


def target(path):
    full = os.path.join(ROOT, unquote(path).lstrip('/'))
    return os.path.join(full, 'index.html') if path.endswith('/') else full


def page_url(path):
    r = rel(path)
    return SITE + ('' if r == 'index.html' else r[:-len('index.html')])


def load_strings():
    """Keys per language: shared (i18n.js) and per page (i18n/<page>.js)."""
    keys = {'ar': set(), 'zh': set(), 'files': {}}
    src = open(os.path.join(ROOT, 'assets/js/i18n.js'), encoding='utf8').read()
    ar, zh = src.index('ar: {'), src.index('zh: {')
    keys['ar'] |= set(re.findall(r"^\s*'([^']+)':", src[ar:zh], re.M))
    keys['zh'] |= set(re.findall(r"^\s*'([^']+)':", src[zh:], re.M))
    if keys['ar'] != keys['zh']:
        err(f'i18n.js: Arabic and Chinese differ: {sorted(keys["ar"] ^ keys["zh"])[:6]}')
    folder = os.path.join(ROOT, 'assets/js/i18n')
    for name in sorted(os.listdir(folder)):
        s = open(os.path.join(folder, name), encoding='utf8').read()
        try:
            data = json.loads(s[s.index('.push(') + 6:s.rindex(')')])
        except ValueError as e:
            err(f'assets/js/i18n/{name}: not strict JSON ({e})')
            continue
        if set(data.get('ar', {})) != set(data.get('zh', {})):
            err(f'assets/js/i18n/{name}: Arabic and Chinese keys differ: {sorted(set(data.get("ar", {})) ^ set(data.get("zh", {})))[:6]}')
        for code in ('ar', 'zh'):
            empty = [k for k, v in data.get(code, {}).items() if not str(v).strip()]
            if empty:
                err(f'assets/js/i18n/{name}: empty {code} strings {empty[:4]}')
            keys[code] |= set(data.get(code, {}))
        keys['files'][f'assets/js/i18n/{name}'] = set(data.get('ar', {}))
    keys['files']['assets/js/i18n.js'] = set(keys['ar']) - set().union(*keys['files'].values())
    return keys


def git_head(path):
    try:
        return subprocess.run(['git', 'show', f'HEAD:{path}'], cwd=ROOT, capture_output=True, text=True, check=True).stdout
    except (OSError, subprocess.CalledProcessError):
        return None


def changed_since_head(path):
    try:
        return subprocess.run(['git', 'diff', '--quiet', 'HEAD', '--', path], cwd=ROOT).returncode == 1
    except OSError:
        return False


def check_css():
    css = open(os.path.join(ROOT, CSS), encoding='utf8').read()
    bare = re.sub(r'/\*.*?\*/', '', css, flags=re.S)
    if bare.count('{') != bare.count('}'):
        err(f'{CSS}: unbalanced braces')
    # Dark tokens are written twice (system dark, and forced dark); they must match.
    blocks = re.findall(r'(?:@media \(prefers-color-scheme: dark\) \{\s*:root:not\(\[data-theme="light"\]\)|:root\[data-theme="dark"\],\s*\.theme-dark) \{(.*?)\}', css, re.S)
    if len(blocks) >= 2:
        a = dict(re.findall(r'(--[\w-]+):\s*([^;]+);', blocks[0]))
        b = dict(re.findall(r'(--[\w-]+):\s*([^;]+);', blocks[1]))
        if a != b:
            err(f'{CSS}: the two dark token blocks differ: {sorted(k for k in set(a) | set(b) if a.get(k) != b.get(k))}')
    # Every font size is a step of the type scale (or an em inside a line).
    steps = set(re.findall(r'(--fs-[\w-]+):', bare))
    for m in re.finditer(r'font-size:\s*([^;]+);', bare):
        value = m.group(1).strip()
        line = bare[:m.start()].count('\n') + 1
        token = re.fullmatch(r'var\((--fs-[\w-]+)\)', value)
        if token and token.group(1) not in steps:
            err(f'{CSS}: font-size {value} is not a step of the type scale (line ~{line})')
        elif not token and not re.fullmatch(r'[\d.]+em|inherit', value):
            err(f'{CSS}: font-size {value} bypasses the type scale; use a var(--fs-…) step (line ~{line})')
    for u in re.findall(r'url\(["\']?(/[^"\')]+)', bare):
        if not os.path.exists(target(urlsplit(u).path)):
            err(f'{CSS}: url({u}) is missing')
    return bare


def main():
    files = html_files()
    pages = {}
    for f in files:
        p = Page()
        p.feed(open(f, encoding='utf8').read())
        pages[f] = p
    strings = load_strings()
    bare_css = check_css()
    sprite = open(os.path.join(ROOT, 'assets/img/icons.svg'), encoding='utf8').read()
    versions = defaultdict(Counter)
    chrome = defaultdict(Counter)
    inline_extra = []
    placeholders = Counter()
    all_classes = Counter()

    for f, p in pages.items():
        r = rel(f)
        redirect = 'http-equiv' in open(f, encoding='utf8').read()[:1500] and 'refresh' in open(f, encoding='utf8').read()[:1500]
        for k, n in p.ids.items():
            if n > 1:
                err(f'{r}: id "{k}" used {n} times')
        for attr, v, line in p.idrefs:
            if v not in p.ids:
                err(f'{r}:{line}: {attr}="{v}" points to no element')
        for attr, v, line, tag, a in p.refs:
            u = urlsplit(v)
            if u.scheme in ('http', 'https', 'mailto', 'tel', 'data', 'javascript'):
                if u.scheme in ('http', 'https') and tag == 'a' and a.get('target') == '_blank' and 'noopener' not in (a.get('rel') or ''):
                    err(f'{r}:{line}: target="_blank" without rel="noopener"')
                continue
            m = VERSIONED.search(v)
            if m:
                versions[m.group(1)][m.group(2)] += 1
            if not u.path:
                if u.fragment and u.fragment not in p.ids and tag != 'use':
                    err(f'{r}:{line}: {attr}="{v}" points to no id on this page')
                if tag == 'use' and u.fragment and u.fragment not in p.ids:
                    err(f'{r}:{line}: <use href="{v}"> has no symbol on this page')
                continue
            path = u.path if u.path.startswith('/') else '/' + os.path.join(os.path.dirname(r), u.path)
            t = target(path)
            if not os.path.exists(t):
                if os.path.exists(target(path + '/')):
                    err(f'{r}:{line}: {attr}="{v}" needs a trailing slash')
                elif path == '/assets/papers/' and 'reader' in (a.get('class') or ''):
                    pass  # the paper reader fills this in when it opens
                else:
                    err(f'{r}:{line}: {attr}="{v}" is missing')
                continue
            if u.fragment and t.endswith('.html') and t in pages and u.fragment not in pages[t].ids:
                err(f'{r}:{line}: {attr}="{v}" points to no id on {rel(t)}')
            if u.fragment and t.endswith('icons.svg') and f'id="{u.fragment}"' not in sprite:
                err(f'{r}:{line}: icon "{u.fragment}" is not in icons.svg')
        for a, line in p.imgs:
            if 'alt' not in a:
                err(f'{r}:{line}: <img> without alt')
            if not (a.get('width') and a.get('height')):
                err(f'{r}:{line}: <img> without width and height')
            if a.get('fetchpriority') == 'high' and a.get('loading') == 'lazy':
                err(f'{r}:{line}: a high-priority image must not be lazy')
        if not redirect:
            shown = [h for h in p.headings if not h[2]]
            if sum(1 for h in shown if h[0] == 1) != 1:
                err(f'{r}: needs exactly one visible <h1> in <main>')
            last = 0
            for level, line, _ in shown:
                if last and level > last + 1:
                    err(f'{r}:{line}: heading jumps from h{last} to h{level}')
                last = level
            if p.canonical != page_url(f) and '404' not in r:
                err(f'{r}: canonical is {p.canonical}, expected {page_url(f)}')
            if p.meta.get('og:url') and p.meta['og:url'] != page_url(f):
                err(f'{r}: og:url is {p.meta["og:url"]}, expected {page_url(f)}')
            for part, text in p.chrome.items():
                chrome[part][text] += 1
        for n in p.nesting:
            err(f'{r}: {n}')
        for tag, line in p.live_in_i18n:
            err(f'{r}:{line}: <{tag}> inside a data-i18n element (its inner HTML is replaced)')
        for code in ('ar', 'zh'):
            if code in (p.langs or []):
                missing = sorted({k for k, _ in p.keys if k not in strings[code]})
                if missing:
                    err(f'{r}: {len(missing)} {code} strings missing, e.g. {missing[:5]}')
        for a, text, line in p.links:
            label = ' '.join(text.split())
            is_label = LABEL_CLASSES & set((a.get('class') or '').split()) or len(label.split()) <= 3
            if is_label and (LINK_TEXT_BANNED.search(label) or LINK_TEXT_BANNED.search(a.get('aria-label') or '')):
                err(f'{r}:{line}: link text says "case study"; buttons say "Learn more"')
        for tag, style, line, a in p.styles:
            if INLINE_OK.match(style):
                continue
            if 'ph' in (a.get('class') or '').split() and re.fullmatch(r'\s*aspect-ratio:\s*[\d.]+\s*/\s*[\d.]+;?\s*', style):
                continue
            if tag == 'svg' and style.replace(' ', '') == 'position:absolute':
                continue  # the inline sprite holder
            inline_extra.append(f'{r}:{line} <{tag} style="{style}">')
        placeholders.update(p.ph)
        all_classes.update(p.classes)

    for name, seen in versions.items():
        if len(seen) > 1:
            err(f'{name} is loaded with different ?v= numbers: {dict(seen)}')
        if len(seen) == 1 and changed_since_head(name):
            head_index = git_head('index.html') or ''
            now = next(iter(seen))
            for f in files:
                old = git_head(rel(f))
                if old is None:
                    continue
                m = re.search(re.escape('/' + name) + r'\?v=(\d+)', old)
                if m and m.group(1) == now:
                    err(f'{name} changed since the last commit but its ?v={now} did not: bump it on every page')
                    break
    for part, texts in chrome.items():
        if len(texts) > 1:
            common = texts.most_common(1)[0][0]
            odd = [rel(f) for f, p in pages.items() if p.chrome.get(part) and p.chrome[part] != common]
            err(f'the {part} links differ on: {", ".join(odd)}')

    if len(inline_extra) > INLINE_BUDGET:
        err(f'{len(inline_extra)} inline styles that are not custom properties (budget {INLINE_BUDGET}); move the new ones into site.css:')
        errors.extend('    ' + s for s in inline_extra)
    elif len(inline_extra) < INLINE_BUDGET:
        warn(f'only {len(inline_extra)} one-off inline styles left: lower INLINE_BUDGET in scripts/check.py to {len(inline_extra)}')

    doc = open(os.path.join(ROOT, 'PLACEHOLDERS.md'), encoding='utf8').read()
    listed = set(re.findall(r'^\| `([\w-]+)` \|', doc, re.M))
    for ph in sorted(set(placeholders) - listed):
        err(f'placeholder "{ph}" is on a page but not in PLACEHOLDERS.md')
    for ph in sorted(listed - set(placeholders)):
        err(f'PLACEHOLDERS.md lists "{ph}", which is on no page')
    m = re.search(r'(\d+) placeholders across (\d+) pages', doc)
    on_pages = sum(1 for p in pages.values() if p.ph)
    if m and (int(m.group(1)), int(m.group(2))) != (sum(placeholders.values()), on_pages):
        err(f'PLACEHOLDERS.md says {m.group(1)} across {m.group(2)} pages; the pages have {sum(placeholders.values())} across {on_pages}')

    js = open(os.path.join(ROOT, 'assets/js/site.js'), encoding='utf8').read()
    js_words = set(re.findall(r'[\w-]+', js))

    # Strings nothing asks for: keys no page uses and site.js never looks up.
    asked = {k for p in pages.values() for k, _ in p.keys}
    asked |= set(re.findall(r"""['"`]([a-z][\w-]*(?:\.[\w-]+)+)['"`]""", js))
    prefixes = tuple(re.findall(r'`([a-z][\w.-]*\.)\$\{', js))
    for name, file_keys in strings['files'].items():
        unused = sorted(k for k in file_keys if k not in asked and not k.startswith(prefixes))
        if unused:
            warn(f'{name}: strings no page uses: {", ".join(unused[:8])}')
    defined = set(re.findall(r'\.(-?[_a-zA-Z][\w-]*)', re.sub(r'url\([^)]*\)', '', bare_css)))
    unknown = sorted(c for c in all_classes if c not in defined and c not in js_words)
    if unknown:
        warn(f'classes with no rule in {CSS} and no use in site.js: {", ".join(unknown)}')

    for w in warnings:
        print('warning:', w)
    for e in errors:
        print('error:', e)
    print(f'{len(files)} pages checked: {len(errors)} errors, {len(warnings)} warnings')
    return 1 if errors else 0


if __name__ == '__main__':
    sys.exit(main())
