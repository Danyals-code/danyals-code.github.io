/* Danyal Sarfraz · Portfolio
   Shared behaviour for every page: language, theme, menu, local nav, search,
   scroll reveal, counters, video loops, galleries, copy buttons, disclosures
   and charts. No dependencies; translations live in i18n.js.

   Motion notes: a tiny inline script in each page's <head> adds `js` to <html>
   before first paint, so hidden start states never flash, and picks the theme
   and language. If this file never runs, that script removes `js` shortly
   after the page loads and everything shows statically, in English. */

(() => {
  'use strict';

  const root = document.documentElement;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const hasIO = 'IntersectionObserver' in window;
  const motionOK = () => root.classList.contains('js') && hasIO && !reduceMotion.matches;

  const easeOutExpo = (t) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t));

  const onMediaChange = (query, listener) => {
    if (query.addEventListener) query.addEventListener('change', listener);
    else query.addListener(listener);
  };

  const saved = (key, area = 'localStorage') => {
    try {
      return window[area].getItem(key);
    } catch (e) {
      return null;
    }
  };
  const save = (key, value, area = 'localStorage') => {
    try {
      window[area].setItem(key, value);
    } catch (e) {}
  };

  // Swaps that change the whole page (theme, language) cross-fade where supported.
  // The browser may skip the fade (a hidden tab, a second swap mid-fade); the
  // update still runs, so the skipped animation is not an error.
  const swap = (update) => {
    if (document.startViewTransition && motionOK()) document.startViewTransition(update).ready.catch(() => {});
    else update();
  };

  /* ------------------------------------------------------------------ language
     English is written in the HTML; Arabic and Simplified Chinese live in
     i18n.js, keyed by data-i18n (inner HTML) and data-i18n-attr ("attr:key; …").
     The inline script in each <head> picks the language before first paint
     (?lang=, then a saved choice, then the browser's languages) and hides the
     page until it is translated. A page whose own content is translated lists
     its languages on <html data-langs>. Elsewhere only the header, footer and
     controls switch, and a note says the page is in English for now. */

  const LANGS = {
    en: { name: 'English', tag: 'en', dir: 'ltr' },
    ar: { name: 'العربية', tag: 'ar', dir: 'rtl' },
    zh: { name: '简体中文', tag: 'zh-CN', dir: 'ltr' },
  };
  const STRINGS = window.SITE_I18N || {};
  // Each content page also loads its own strings (assets/js/i18n/<page>.js).
  (window.SITE_I18N_PAGES || []).forEach((pack) => {
    Object.keys(pack).forEach((code) => {
      STRINGS[code] = Object.assign(STRINGS[code] || {}, pack[code]);
    });
  });
  const pageLangs = (root.dataset.langs || 'en').split(/\s+/);
  const CHROME = '.skip-link, .gnav, .gfooter__dir, .gfooter__legal, .search';
  let lang = LANGS[root.dataset.uiLang] ? root.dataset.uiLang : 'en';

  // The string for `key` in `code` (default: the current language), else the
  // English fallback. {name} placeholders are filled from `vars`.
  const tr = (key, fallback, vars, code = lang) => {
    const text = (STRINGS[code] && STRINGS[code][key]) || fallback;
    return vars ? text.replace(/\{(\w+)\}/g, (_, name) => vars[name]) : text;
  };

  // Header, footer and controls follow the chosen language even on a page whose
  // content is English only.
  const matchChrome = (el) => {
    if (pageLangs.includes(lang)) {
      el.removeAttribute('lang');
      el.removeAttribute('dir');
    } else {
      el.lang = LANGS[lang].tag;
      el.dir = LANGS[lang].dir;
    }
  };

  const originals = new WeakMap();

  function translate() {
    document.querySelectorAll('[data-i18n], [data-i18n-attr]').forEach((el) => {
      let original = originals.get(el);
      if (!original) {
        original = { html: el.innerHTML, attrs: {} };
        originals.set(el, original);
      }
      // Only write what changed: in English, nothing is touched.
      if (el.dataset.i18n) {
        const html = tr(el.dataset.i18n, original.html);
        if (el.innerHTML !== html) el.innerHTML = html;
      }
      (el.dataset.i18nAttr || '').split(';').forEach((pair) => {
        const [name, key] = pair.split(':').map((part) => part.trim());
        if (!name || !key) return;
        if (!(name in original.attrs)) original.attrs[name] = el.getAttribute(name);
        const value = tr(key, original.attrs[name]);
        if (el.getAttribute(name) !== value) el.setAttribute(name, value);
      });
    });
    document.querySelectorAll('[data-year]').forEach((el) => {
      el.textContent = String(new Date().getFullYear());
    });
  }

  // Search results name headings by their English text (pages are indexed in
  // English), so each heading remembers it before any translation runs.
  let headingsNoted = false;
  function noteHeadings() {
    if (headingsNoted) return;
    headingsNoted = true;
    document.querySelectorAll('main h1, main h2, main h3, main h4').forEach((h) => {
      h.dataset.enText = clean(h.textContent);
    });
  }

  function applyLanguage() {
    try {
      noteHeadings();
      const whole = pageLangs.includes(lang);
      root.dataset.uiLang = lang;
      root.lang = whole ? LANGS[lang].tag : 'en';
      root.dir = whole ? LANGS[lang].dir : 'ltr';
      document.querySelectorAll(CHROME).forEach(matchChrome);
      translate();
      document.dispatchEvent(new CustomEvent('site:lang'));
    } finally {
      root.classList.remove('i18n-wait');
    }
  }

  function setLanguage(next) {
    if (!LANGS[next] || next === lang) return;
    lang = next;
    save('lang', next);
    // The choice is remembered, so a ?lang= that brought the visitor here can go.
    const url = new URL(location.href);
    if (url.searchParams.has('lang')) {
      url.searchParams.delete('lang');
      history.replaceState(history.state, '', url);
    }
    swap(applyLanguage);
  }

  function initLanguageMenu() {
    const button = document.querySelector('[data-lang-open]');
    if (!button) return;
    const menu = document.createElement('div');
    menu.className = 'lang-menu';
    menu.id = 'lang-menu';
    menu.setAttribute('role', 'menu');
    menu.hidden = true;
    menu.innerHTML = Object.entries(LANGS)
      .map(
        ([code, info]) =>
          `<button class="lang-menu__item" type="button" role="menuitemradio" data-lang="${code}" tabindex="-1"><span lang="${info.tag}" dir="${info.dir}">${info.name}</span><svg viewBox="0 0 16 16" aria-hidden="true"><path d="m3.5 8.4 3 3 6-6.8"/></svg></button>`
      )
      .join('');
    button.after(menu);
    button.setAttribute('aria-controls', menu.id);
    const items = Array.from(menu.querySelectorAll('[data-lang]'));

    const label = () => {
      button.setAttribute('aria-label', tr('lang.current', 'Language: {name}', { name: LANGS[lang].name }));
      button.title = tr('lang.menu', 'Language');
      menu.setAttribute('aria-label', tr('lang.menu', 'Language'));
      items.forEach((item) => item.setAttribute('aria-checked', String(item.dataset.lang === lang)));
    };
    const open = () => {
      menu.hidden = false;
      button.setAttribute('aria-expanded', 'true');
      (items.find((item) => item.dataset.lang === lang) || items[0]).focus();
    };
    const close = (refocus) => {
      if (menu.hidden) return;
      menu.hidden = true;
      button.setAttribute('aria-expanded', 'false');
      if (refocus) button.focus();
    };

    button.addEventListener('click', () => (menu.hidden ? open() : close()));
    menu.addEventListener('click', (event) => {
      const item = event.target.closest('[data-lang]');
      if (!item) return;
      close(true);
      setLanguage(item.dataset.lang);
    });
    menu.addEventListener('keydown', (event) => {
      const at = items.indexOf(document.activeElement);
      const moves = { ArrowDown: at + 1, ArrowUp: at - 1, Home: 0, End: items.length - 1 };
      if (event.key in moves) {
        event.preventDefault();
        items[(moves[event.key] + items.length) % items.length].focus();
      } else if (event.key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
        close(true);
      } else if (event.key === 'Tab') {
        close();
      }
    });
    document.addEventListener('click', (event) => {
      if (!menu.contains(event.target) && !button.contains(event.target)) close();
    });
    document.addEventListener('site:lang', label);
    label();
  }

  /* A slim bar under the header. On a translated page, visitors whose time zone
     points to an Arabic- or Chinese-speaking region are offered that language
     (once, in that language); it never switches on its own, since many people
     there read English. On a page that is not translated yet, a note says so. */

  const ZONE_LANGS = [
    ['ar', /^(Asia\/(Riyadh|Dubai|Qatar|Bahrain|Kuwait|Muscat|Baghdad|Amman|Beirut|Damascus|Aden|Gaza|Hebron)|Africa\/(Cairo|Tripoli|Tunis|Algiers|Casablanca|El_Aaiun|Khartoum|Nouakchott))$/],
    ['zh', /^(Asia\/(Shanghai|Chongqing|Chungking|Harbin|Urumqi|Kashgar|Hong_Kong|Macau|Taipei)|PRC|ROC)$/],
  ];

  function zoneLanguage() {
    let zone = '';
    try {
      zone = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    } catch (e) {}
    const match = ZONE_LANGS.find(([, pattern]) => pattern.test(zone));
    return match ? match[0] : null;
  }

  function initLanguageBar() {
    const header = document.querySelector('.gnav');
    if (!header) return;
    let bar = null;

    const build = (code, text, action, onAction, onClose) => {
      const el = document.createElement('div');
      el.className = 'lang-bar';
      el.setAttribute('role', 'note');
      el.lang = LANGS[code].tag;
      el.dir = LANGS[code].dir;
      el.innerHTML = `
        <div class="lang-bar__inner">
          <p class="lang-bar__text"></p>
          ${action ? '<button class="btn btn--sm lang-bar__action" type="button"></button>' : ''}
          <button class="lang-bar__close" type="button"><svg viewBox="0 0 16 16" aria-hidden="true"><path d="m4.5 4.5 7 7m0-7-7 7"/></svg></button>
        </div>`;
      el.querySelector('.lang-bar__text').textContent = text;
      const close = el.querySelector('.lang-bar__close');
      close.setAttribute('aria-label', tr('bar.close', 'Close', null, code));
      close.addEventListener('click', () => {
        onClose();
        el.remove();
        bar = null;
      });
      if (action) {
        const button = el.querySelector('.lang-bar__action');
        button.textContent = action;
        button.addEventListener('click', onAction);
      }
      return el;
    };

    const update = () => {
      if (bar) bar.remove();
      bar = null;
      const whole = pageLangs.includes(lang);
      if (lang !== 'en' && !whole) {
        if (saved('lang-note', 'sessionStorage') === lang) return;
        bar = build(lang, tr('bar.english', 'This page is in English for now.'), null, null, () => save('lang-note', lang, 'sessionStorage'));
      } else if (lang === 'en' && !saved('lang') && pageLangs.length > 1) {
        const offer = zoneLanguage();
        if (!offer || !pageLangs.includes(offer) || saved('lang-offer') === offer) return;
        bar = build(offer, tr('bar.offer', '', null, offer), tr('bar.offerAction', LANGS[offer].name, null, offer), () => setLanguage(offer), () => save('lang-offer', offer));
      }
      if (bar) header.after(bar);
    };

    update();
    document.addEventListener('site:lang', update);
  }

  /* ------------------------------------------------------------------ global nav (mobile menu) */

  function initMenu() {
    const button = document.querySelector('[data-menu]');
    if (!button) return;
    const list = document.getElementById(button.getAttribute('aria-controls'));
    const label = () => {
      const open = document.body.classList.contains('nav-open');
      button.setAttribute('aria-label', open ? tr('menu.close', 'Close menu') : tr('menu.open', 'Menu'));
    };
    const setOpen = (open) => {
      document.body.classList.toggle('nav-open', open);
      button.setAttribute('aria-expanded', String(open));
      label();
    };
    label();
    document.addEventListener('site:lang', label);
    button.addEventListener('click', () => setOpen(!document.body.classList.contains('nav-open')));
    if (list) {
      list.addEventListener('click', (event) => {
        if (event.target.closest('a')) setOpen(false);
      });
    }
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && document.body.classList.contains('nav-open')) {
        setOpen(false);
        button.focus();
      }
    });
    onMediaChange(window.matchMedia('(min-width: 834px)'), (event) => {
      if (event.matches) setOpen(false);
    });
  }

  /* ------------------------------------------------------------------ local nav: current section */

  function initLocalNav() {
    const links = Array.from(document.querySelectorAll('.lnav__links a[href^="#"]'));
    if (!links.length || !hasIO) return;
    const map = new Map();
    links.forEach((link) => {
      const target = document.getElementById(link.getAttribute('href').slice(1));
      if (target) map.set(target, link);
    });
    const visible = new Set();
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => (entry.isIntersecting ? visible.add(entry.target) : visible.delete(entry.target)));
        let current = null;
        for (const section of map.keys()) {
          if (visible.has(section)) {
            current = section;
            break;
          }
        }
        links.forEach((link) => link.removeAttribute('aria-current'));
        if (current) map.get(current).setAttribute('aria-current', 'true');
      },
      { rootMargin: '-40% 0px -55% 0px' }
    );
    map.forEach((_, section) => io.observe(section));
  }

  /* ------------------------------------------------------------------ global nav: hide on scroll down
     Only on pages with a local nav; elsewhere the global nav simply stays put. */

  function initNavReveal() {
    const body = document.body;
    if (!body.classList.contains('has-lnav')) return;
    const gnav = document.querySelector('.gnav');
    let lastY = window.scrollY;
    // Runs on every scroll event (it only toggles a class), so the bar
    // reacts to the very first upward movement.
    const update = () => {
      const y = Math.max(0, window.scrollY);
      if (y <= gnav.offsetHeight) {
        body.classList.remove('gnav-hidden');
        lastY = y;
        return;
      }
      if (y > lastY + 6) body.classList.add('gnav-hidden');
      else if (y < lastY - 4) body.classList.remove('gnav-hidden');
      else return;
      lastY = y;
    };
    window.addEventListener('scroll', update, { passive: true });
    // Keyboard users tabbing into the hidden bar should see it.
    document.querySelector('.gnav').addEventListener('focusin', () => body.classList.remove('gnav-hidden'));
  }

  /* ------------------------------------------------------------------ theme: light or dark
     Until the visitor chooses, the page follows the system setting. The button
     then switches between light and dark; the choice is remembered and applied
     before first paint by the inline script in each page's <head>. */

  function initTheme() {
    const button = document.querySelector('[data-theme-toggle]');
    if (!button) return;
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)');
    // Browser chrome colour and theme-specific images follow the choice too.
    const metas = Array.from(document.querySelectorAll('meta[name="theme-color"][media]'));
    const sources = Array.from(document.querySelectorAll('source[media*="prefers-color-scheme"]'));
    [...metas, ...sources].forEach((el) => (el.dataset.media = el.getAttribute('media')));
    const forced = (el, pref) => (el.dataset.media.includes(pref) ? 'all' : 'not all');

    // 'light' or 'dark' once chosen; null while following the system.
    let pref = root.getAttribute('data-theme');
    const current = () => pref || (systemDark.matches ? 'dark' : 'light');

    const apply = () => {
      if (pref) root.setAttribute('data-theme', pref);
      else root.removeAttribute('data-theme');
      const now = current();
      root.setAttribute('data-theme-now', now);
      [...metas, ...sources].forEach((el) => el.setAttribute('media', pref ? forced(el, pref) : el.dataset.media));
      button.setAttribute('aria-pressed', String(now === 'dark'));
      button.setAttribute('aria-label', tr('theme.dark', 'Dark theme'));
      button.title = now === 'dark' ? tr('theme.toLight', 'Switch to light theme') : tr('theme.toDark', 'Switch to dark theme');
    };

    apply();
    onMediaChange(systemDark, () => {
      if (!pref) apply();
    });
    button.addEventListener('click', () => {
      pref = current() === 'dark' ? 'light' : 'dark';
      save('theme', pref);
      swap(apply);
    });
    document.addEventListener('site:lang', apply);
  }

  /* ------------------------------------------------------------------ site search
     The index is built in the browser on first open: every page linked from the
     navigation is fetched and split into one entry per heading, so new content
     is searchable without a build step. Choosing a result opens that page and
     scrolls to the exact heading. */

  const SEARCH_KEY = 'search-target';
  const SEARCH_BOXES = '.pub, .row, .step, .tile, .rail__item, .chart, .feature__text, .shead, .page-hero, .hero, section';
  // Their translations: nav.<pageKey> for the page, search.go.<headingKey> for the heading.
  const SUGGESTIONS = [
    { page: 'Research', heading: 'Publications and projects', url: '/research/', pageKey: 'research', headingKey: 'research' },
    { page: 'Research', heading: 'Publications', url: '/research/#publications', pageKey: 'research', headingKey: 'publications' },
    { page: 'Artifacts', heading: 'Research tools and spatial applications', url: '/tools/', pageKey: 'tools', headingKey: 'tools' },
    { page: 'Design', heading: 'Industrial design and CGI', url: '/design/', pageKey: 'design', headingKey: 'design' },
    { page: 'About', heading: 'Experience and education', url: '/about/#experience', pageKey: 'about', headingKey: 'experience' },
    { page: 'About', heading: 'Contact', url: '/about/#contact', pageKey: 'about', headingKey: 'contact' },
  ];

  const clean = (text) => (text || '').replace(/\s+/g, ' ').trim();
  const fold = (text) => clean(text).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[’‘]/g, "'");
  // Index fields and query terms are reduced to space-separated words, so terms
  // match from the start of a word ("unity" finds Unity, not "community").
  const words = (text) => ` ${fold(text).replace(/[^a-z0-9']+/g, ' ').trim()}`;
  const escapeHTML = (text) => text.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

  function indexPage(path, doc) {
    const main = doc.querySelector('main');
    if (!main) return [];
    main.querySelectorAll('pre, script, style, svg, button, video, dialog').forEach((el) => el.remove());
    const title = clean(doc.title).split(' · ')[0].split(': ')[0];
    const page = path === '/' ? 'Home' : title;
    const description = doc.querySelector('meta[name="description"]');
    const entries = [{ page, heading: page, text: description ? description.content : '', path, id: '', top: true }];

    main.querySelectorAll('h1, h2, h3, h4').forEach((h) => {
      // Teaser cards that link to another page are covered by that page's own entries.
      const card = h.closest('a[href]');
      if (card) {
        const url = new URL(card.getAttribute('href'), location.origin + path);
        if (url.origin === location.origin && url.pathname !== path) return;
      }
      const heading = clean(h.textContent);
      if (!heading) return;
      let box = h.closest(SEARCH_BOXES) || h.parentElement;
      // A section title also stands for the loose text in its section.
      if (box.matches('.shead') && box.closest('section')) box = box.closest('section');
      const text = clean(box.textContent).replace(heading, '').trim().slice(0, 700);
      const anchor = h.id ? h : h.parentElement.closest('[id]');
      const id = anchor && anchor !== main ? anchor.id : '';
      entries.push({ page, heading, text, path, id });
    });
    return entries;
  }

  async function buildIndex() {
    const paths = new Set(['/']);
    document.querySelectorAll('.gnav a[href^="/"], .gfooter a[href^="/"]').forEach((a) => {
      const { pathname } = new URL(a.href);
      if (pathname.endsWith('/') && pathname !== '/publications/') paths.add(pathname);
    });
    // Pages one level down (an app's or a project's own page) are found
    // through the pages that list them.
    const fetchPage = async (path) => {
      try {
        const response = await fetch(path);
        if (!response.ok) return { entries: [], links: [] };
        const doc = new DOMParser().parseFromString(await response.text(), 'text/html');
        const links = Array.from(doc.querySelectorAll('main a[href^="/"]'))
          .map((a) => a.getAttribute('href').split('#')[0])
          .filter((href) => /^\/(tools|design|research)\/[^/]+\/$/.test(href));
        return { entries: indexPage(path, doc), links };
      } catch (e) {
        return { entries: [], links: [] };
      }
    };
    const first = await Promise.all(Array.from(paths).map(fetchPage));
    const deeper = new Set();
    first.forEach((result) => result.links.forEach((href) => paths.has(href) || deeper.add(href)));
    const second = await Promise.all(Array.from(deeper).map(fetchPage));
    const pages = first.concat(second).map((result) => result.entries);
    const seen = new Set();
    return pages.flat().filter((entry) => {
      const key = `${entry.path}#${entry.id}|${entry.heading}`;
      if (seen.has(key)) return false;
      seen.add(key);
      entry.h = words(entry.heading);
      entry.t = words(entry.text);
      entry.p = words(entry.page);
      return true;
    });
  }

  function searchIndex(index, query) {
    const q = words(query);
    const terms = q.split(' ').filter(Boolean);
    if (!terms.length) return [];
    const scored = [];
    for (const entry of index) {
      let score = 0;
      for (const term of terms) {
        const t = ` ${term}`;
        if (entry.h.includes(t)) score += entry.h.startsWith(t) ? 12 : 9;
        else if (entry.p.includes(t)) score += 4;
        else if (entry.t.includes(t)) score += 2;
        else {
          score = 0;
          break;
        }
      }
      if (!score) continue;
      if (entry.h === q) score += 20;
      if (entry.top) score += 3;
      scored.push({ entry, score });
    }
    return scored.sort((a, b) => b.score - a.score).slice(0, 24).map((s) => s.entry);
  }

  // Matches run on the raw text and the pieces are escaped around them, so a
  // term like "lt" can never land inside an entity such as &lt;.
  function highlight(text, terms) {
    const patterns = terms
      .filter((term) => term.length >= 2)
      .sort((a, b) => b.length - a.length)
      .map((term) => term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/'/g, "['’]"));
    if (!patterns.length) return escapeHTML(text);
    let html = '';
    let last = 0;
    for (const match of text.matchAll(new RegExp(`(^|[^\\p{L}\\p{N}])(${patterns.join('|')})`, 'giu'))) {
      const start = match.index + match[1].length;
      html += `${escapeHTML(text.slice(last, start))}<mark>${escapeHTML(match[2])}</mark>`;
      last = start + match[2].length;
    }
    return html + escapeHTML(text.slice(last));
  }

  function snippet(text, terms) {
    if (!text) return '';
    const lower = fold(text);
    const at = terms.map((t) => lower.indexOf(t)).filter((i) => i >= 0).sort((a, b) => a - b)[0] || 0;
    const start = Math.max(0, at - 50);
    return (start ? '…' : '') + text.slice(start, start + 170) + (start + 170 < text.length ? '…' : '');
  }

  function scrollToHeading(text) {
    const target = Array.from(document.querySelectorAll('main h1, main h2, main h3, main h4')).find((h) => (h.dataset.enText || clean(h.textContent)) === text);
    if (!target) return;
    revealInPanels(target);
    target.scrollIntoView({ block: 'start', behavior: reduceMotion.matches ? 'auto' : 'smooth' });
    target.classList.remove('search-target');
    void target.offsetWidth;
    target.classList.add('search-target');
    target.addEventListener('animationend', () => target.classList.remove('search-target'), { once: true });
  }

  function landOnSearchTarget() {
    let stored = null;
    try {
      stored = JSON.parse(sessionStorage.getItem(SEARCH_KEY));
      sessionStorage.removeItem(SEARCH_KEY);
    } catch (e) {}
    if (!stored || stored.path !== location.pathname) return;
    // Wait for layout to settle so lazy media above the target doesn't push it away.
    const go = () => setTimeout(() => scrollToHeading(stored.heading), 120);
    if (document.readyState === 'complete') go();
    else window.addEventListener('load', go, { once: true });
  }

  function initSearch() {
    landOnSearchTarget();
    const opener = document.querySelector('[data-search-open]');
    if (!opener) return;
    if (!window.HTMLDialogElement) {
      opener.hidden = true;
      return;
    }

    const dialog = document.createElement('dialog');
    dialog.className = 'search';
    dialog.innerHTML = `
      <div class="search__bar">
        <svg aria-hidden="true"><use href="/assets/img/icons.svg?v=4#search"/></svg>
        <input class="search__input" type="search" autocomplete="off" spellcheck="false" role="combobox" aria-expanded="true" aria-controls="search-results" aria-autocomplete="list">
        <kbd>esc</kbd>
      </div>
      <ul class="search__results" id="search-results" role="listbox"></ul>
      <p class="search__status" aria-live="polite"></p>`;
    document.body.appendChild(dialog);

    const input = dialog.querySelector('.search__input');
    const list = dialog.querySelector('.search__results');
    const status = dialog.querySelector('.search__status');
    const shortcut = /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent) ? '⌘K' : 'Ctrl K';
    let index = null;
    let indexing = null;
    let hits = [];
    let active = -1;

    const label = () => {
      matchChrome(dialog);
      opener.setAttribute('aria-label', tr('search.open', 'Search the site'));
      opener.title = tr('search.title', 'Search ({key})', { key: shortcut });
      dialog.setAttribute('aria-label', tr('search.open', 'Search the site'));
      input.placeholder = tr('search.placeholder', 'Search research, publications, artifacts…');
      input.setAttribute('aria-label', tr('search.open', 'Search the site'));
      list.setAttribute('aria-label', tr('search.results', 'Results'));
      if (dialog.open) render();
    };

    const urlFor = (entry) => entry.url || entry.path + (entry.id ? `#${entry.id}` : '');

    const setActive = (i) => {
      const links = list.querySelectorAll('.search__hit');
      if (!links.length) return;
      active = (i + links.length) % links.length;
      links.forEach((link, n) => link.setAttribute('aria-selected', String(n === active)));
      input.setAttribute('aria-activedescendant', links[active].id);
      links[active].scrollIntoView({ block: 'nearest' });
    };

    const render = () => {
      const query = input.value;
      const terms = words(query).split(' ').filter(Boolean);
      if (!terms.length) {
        hits = SUGGESTIONS;
        status.textContent = '';
      } else if (!index) {
        hits = [];
        status.textContent = tr('search.indexing', 'Indexing the site…');
      } else {
        hits = searchIndex(index, query);
        status.textContent = hits.length ? '' : tr('search.none', 'No results for “{query}”.', { query: clean(query) });
      }
      // Suggestions are translated; indexed results are the pages' own (English) text.
      const page = (entry) => (entry.pageKey ? tr(`nav.${entry.pageKey}`, entry.page) : entry.page);
      const heading = (entry) => (entry.headingKey ? tr(`search.go.${entry.headingKey}`, entry.heading) : entry.heading);
      list.innerHTML =
        (terms.length ? '' : `<li class="search__group" role="presentation">${escapeHTML(tr('search.goto', 'Go to'))}</li>`) +
        hits
          .map(
            (entry, i) => `
          <li role="presentation"><a class="search__hit" id="search-hit-${i}" role="option" aria-selected="false" href="${escapeHTML(urlFor(entry))}" data-i="${i}"${entry.pageKey ? '' : ' lang="en" dir="ltr"'}>
            <span class="search__page">${escapeHTML(page(entry))}</span>
            <span class="search__title">${highlight(heading(entry), terms)}</span>
            ${terms.length && entry.text ? `<span class="search__snip">${highlight(snippet(entry.text, terms), terms)}</span>` : ''}
          </a></li>`
          )
          .join('');
      active = -1;
      input.removeAttribute('aria-activedescendant');
      if (hits.length && terms.length) setActive(0);
    };

    const go = (entry) => {
      const url = urlFor(entry);
      dialog.close();
      if (entry.url) {
        location.href = url;
        return;
      }
      if (entry.path === location.pathname) {
        if (entry.top) window.scrollTo({ top: 0, behavior: reduceMotion.matches ? 'auto' : 'smooth' });
        else scrollToHeading(entry.heading);
        return;
      }
      try {
        if (!entry.top) sessionStorage.setItem(SEARCH_KEY, JSON.stringify({ path: entry.path, heading: entry.heading }));
      } catch (e) {}
      location.href = url;
    };

    const open = () => {
      if (dialog.open) return;
      dialog.showModal();
      input.select();
      render();
      if (!indexing) {
        indexing = buildIndex().then((built) => {
          index = built;
          if (dialog.open) render();
        });
      }
    };

    label();
    document.addEventListener('site:lang', label);
    opener.addEventListener('click', open);
    input.addEventListener('input', render);
    input.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault();
        setActive(active + (event.key === 'ArrowDown' ? 1 : -1));
      } else if (event.key === 'Enter') {
        event.preventDefault();
        // With nothing typed or picked, Enter stays put.
        if (active < 0 && !input.value.trim()) return;
        const entry = hits[Math.max(active, 0)];
        if (entry) go(entry);
      }
    });
    list.addEventListener('click', (event) => {
      const link = event.target.closest('.search__hit');
      if (!link || event.metaKey || event.ctrlKey || event.shiftKey) return;
      event.preventDefault();
      go(hits[Number(link.dataset.i)]);
    });
    // A click on the backdrop (outside the panel) closes it.
    dialog.addEventListener('click', (event) => {
      if (event.target === dialog) dialog.close();
    });
    document.addEventListener('keydown', (event) => {
      const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName) || document.activeElement.isContentEditable;
      if ((event.key === 'k' && (event.metaKey || event.ctrlKey)) || (event.key === '/' && !typing)) {
        event.preventDefault();
        open();
      }
    });
  }

  /* ------------------------------------------------------------------ cascade indices
     Children of lists and grids get --ci (their position) so CSS can stagger them. */

  const CASCADE = [
    '.rows > li',
    '.facts > *',
    '.steps > *',
    '.chips > li',
    '.findings > *',
    '.rail__track > li',
    '.icon-list > li',
    '.bars > li',
    '.gchart > *',
    '.t-two-tone > strong',
    '.principles > *',
  ].join(', ');

  function initCascade() {
    const set = () =>
      document.querySelectorAll(CASCADE).forEach((el) => {
        const index = Array.prototype.indexOf.call(el.parentElement.children, el);
        el.style.setProperty('--ci', String(Math.min(index, 12)));
      });
    set();
    // A new language rebuilds translated text, including staggered phrases.
    document.addEventListener('site:lang', set);
  }

  /* ------------------------------------------------------------------ reveal on scroll
     Elements entering together are staggered by position. The per-element delay
     (--rd) is removed once the entrance finishes, so later hover transitions
     respond immediately. */

  function initReveal() {
    const items = Array.from(document.querySelectorAll('[data-reveal]'));
    if (!items.length) return;
    const finish = (el) => {
      el.classList.add('in', 'is-done');
      el.style.removeProperty('--rd');
    };
    if (!motionOK()) {
      items.forEach(finish);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top || a.boundingClientRect.left - b.boundingClientRect.left)
          .forEach((entry, i) => {
            const el = entry.target;
            const delay = Math.min(i, 6) * 90;
            el.style.setProperty('--rd', `${delay}ms`);
            el.classList.add('in');
            io.unobserve(el);
            window.setTimeout(() => {
              el.classList.add('is-done');
              el.style.removeProperty('--rd');
            }, delay + 2400);
          });
      },
      { rootMargin: '0px 0px -9% 0px', threshold: 0 }
    );
    items.forEach((item) => io.observe(item));
  }

  /* ------------------------------------------------------------------ bar charts grow when seen */

  function initBars() {
    const charts = Array.from(document.querySelectorAll('.bars')).filter((chart) => !chart.closest('[data-quiz]'));
    if (!charts.length) return;
    if (!motionOK()) {
      charts.forEach((chart) => chart.classList.add('in'));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        });
      },
      { rootMargin: '0px 0px -12% 0px', threshold: 0.2 }
    );
    charts.forEach((chart) => io.observe(chart));
  }

  /* ------------------------------------------------------------------ count-up numbers */

  function initCounters() {
    const items = Array.from(document.querySelectorAll('[data-count]'));
    if (!items.length || !motionOK()) return;
    const parts = (el) => {
      const raw = el.dataset.count;
      return {
        target: parseFloat(raw),
        decimals: (raw.split('.')[1] || '').length,
        prefix: el.dataset.prefix || '',
        suffix: el.dataset.suffix || '',
      };
    };
    const format = (p, v) => p.prefix + v.toLocaleString('en-US', { minimumFractionDigits: p.decimals, maximumFractionDigits: p.decimals }) + p.suffix;

    items.forEach((el) => {
      const p = parts(el);
      // Inline numbers reserve their final width and count right-aligned,
      // so a suffix beside them ("+", "/ 10") never shifts while counting.
      if (getComputedStyle(el).display === 'inline') {
        el.textContent = format(p, p.target);
        el.style.display = 'inline-block';
        el.style.minWidth = `${el.getBoundingClientRect().width}px`;
        el.style.textAlign = 'right';
      }
      el.textContent = format(p, 0);
    });

    const run = (el) => {
      const p = parts(el);
      const duration = 1900;
      const start = performance.now() + 120;
      const step = (now) => {
        const t = Math.max(0, Math.min(1, (now - start) / duration));
        el.textContent = format(p, p.target * easeOutExpo(t));
        if (t < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          run(entry.target);
          io.unobserve(entry.target);
        });
      },
      { rootMargin: '0px 0px -10% 0px', threshold: 0.5 }
    );
    items.forEach((el) => io.observe(el));
  }

  /* ------------------------------------------------------------------ video loops
     .loop           plays muted while visible, pauses when scrolled away
     [data-manual]   waits for the play button
     [data-once]     plays once when first seen, then offers a replay */

  function initLoops() {
    const loops = Array.from(document.querySelectorAll('.loop'));
    if (!loops.length) return;
    loops.forEach((loop) => {
      const video = loop.querySelector('video');
      const toggle = loop.querySelector('.loop__toggle');
      if (!video) return;
      const once = loop.hasAttribute('data-once');
      video.muted = true;
      video.playsInline = true;
      if (once) video.loop = false;
      let userPaused = reduceMotion.matches || loop.hasAttribute('data-manual');
      let played = false;
      let visible = false;
      let selfPaused = false;
      const setState = () => {
        loop.classList.toggle('is-paused', video.paused);
        loop.classList.toggle('is-ended', video.ended);
      };
      ['play', 'pause', 'ended'].forEach((type) => video.addEventListener(type, setState));
      video.addEventListener('playing', () => loop.classList.add('is-playing'), { once: true });
      setState();
      const play = () => {
        if (video.preload === 'none') video.preload = 'auto';
        const attempt = video.play();
        if (attempt) attempt.catch(() => setState());
      };
      const pause = () => {
        selfPaused = true;
        video.pause();
      };
      // Browsers sometimes pause muted clips on their own (power saving,
      // buffering). If nobody asked for it and the clip is still on screen, resume.
      video.addEventListener('pause', () => {
        if (selfPaused) {
          selfPaused = false;
          return;
        }
        if (userPaused || !visible || video.ended || document.visibilityState !== 'visible') return;
        window.setTimeout(() => {
          if (video.paused && !userPaused && visible && !video.ended) play();
        }, 300);
      });
      if (toggle) {
        toggle.addEventListener('click', () => {
          if (video.ended) {
            video.currentTime = 0;
            userPaused = false;
            play();
          } else if (video.paused) {
            userPaused = false;
            play();
          } else {
            userPaused = true;
            pause();
          }
        });
      }
      // A page opened in a background tab, or a clip the browser paused while
      // the tab was hidden, starts again once the page is shown.
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState !== 'visible' || !visible || userPaused || !video.paused || video.ended) return;
        if (once && !played) return;
        play();
      });
      if (!hasIO) return;
      new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            visible = entry.isIntersecting;
            if (entry.isIntersecting) {
              if (userPaused || video.ended) return;
              if (once && played) return;
              played = true;
              play();
            } else if (!video.paused) {
              pause();
              if (once) played = false;
            }
          });
        },
        { threshold: 0.35 }
      ).observe(loop);
    });
  }

  /* ------------------------------------------------------------------ rails (horizontal galleries) */

  function initRails() {
    document.querySelectorAll('.rail').forEach((rail) => {
      const track = rail.querySelector('.rail__track');
      const prev = rail.querySelector('[data-rail-prev]');
      const next = rail.querySelector('[data-rail-next]');
      if (!track || !prev || !next) return;
      const forward = () => (getComputedStyle(track).direction === 'rtl' ? -1 : 1);
      const stepSize = () => {
        const item = track.querySelector('.rail__item');
        return (item ? item.getBoundingClientRect().width + 20 : track.clientWidth * 0.8) * forward();
      };
      const update = () => {
        const travelled = Math.abs(track.scrollLeft);
        prev.disabled = travelled <= 4;
        next.disabled = travelled + track.clientWidth >= track.scrollWidth - 4;
      };
      const behavior = () => (reduceMotion.matches ? 'auto' : 'smooth');
      prev.addEventListener('click', () => track.scrollBy({ left: -stepSize(), behavior: behavior() }));
      next.addEventListener('click', () => track.scrollBy({ left: stepSize(), behavior: behavior() }));
      track.addEventListener('scroll', update, { passive: true });
      window.addEventListener('resize', update);
      // A new reading direction starts the rail from its beginning.
      document.addEventListener('site:lang', () => {
        track.scrollLeft = 0;
        update();
      });
      update();
    });
  }

  /* ------------------------------------------------------------------ app bar (Artifacts)
     A row of app icons linking to each app's page. Chevrons show at whichever
     end of the row has more icons. */

  function initAppbar() {
    document.querySelectorAll('[data-appbar]').forEach((bar) => {
      const track = bar.querySelector('.appbar__track');
      const prev = bar.querySelector('[data-appbar-prev]');
      const next = bar.querySelector('[data-appbar-next]');
      if (!track || !prev || !next) return;
      const forward = () => (getComputedStyle(track).direction === 'rtl' ? -1 : 1);
      const update = () => {
        const travelled = Math.abs(track.scrollLeft);
        prev.disabled = travelled <= 4;
        next.disabled = travelled + track.clientWidth >= track.scrollWidth - 4;
      };
      const page = (sign) =>
        track.scrollBy({ left: sign * forward() * track.clientWidth * 0.7, behavior: reduceMotion.matches ? 'auto' : 'smooth' });
      prev.addEventListener('click', () => page(-1));
      next.addEventListener('click', () => page(1));
      track.addEventListener('scroll', update, { passive: true });
      window.addEventListener('resize', update);
      // Bring the current app's icon to the middle of the row (in either
      // direction), or go back to the start of the row.
      const current = track.querySelector('[aria-current="page"]');
      const center = () => {
        if (!current) {
          track.scrollLeft = 0;
          return;
        }
        const row = track.getBoundingClientRect();
        const icon = current.getBoundingClientRect();
        track.scrollLeft += icon.left + icon.width / 2 - (row.left + row.width / 2);
      };
      document.addEventListener('site:lang', () => {
        center();
        update();
      });
      center();
      update();
      // A sticky bar shrinks once it reaches the menu.
      if (bar.classList.contains('appbar--sticky')) {
        let queued = false;
        const stuck = () => {
          queued = false;
          const navH = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 48;
          bar.classList.toggle('is-stuck', window.scrollY > 0 && bar.getBoundingClientRect().top <= navH + 1);
        };
        window.addEventListener(
          'scroll',
          () => {
            if (queued) return;
            queued = true;
            requestAnimationFrame(stuck);
          },
          { passive: true }
        );
        stuck();
      }
    });
  }

  /* ------------------------------------------------------------------ highlights (data-highlights)
     Large slides that advance on their own while on screen. The current dot
     fills over --hl-dur; when it is full the next slide comes in. The button
     stops and restarts; reduced motion never autoplays. */

  function initHighlights() {
    document.querySelectorAll('[data-highlights]').forEach((hl) => {
      const track = hl.querySelector('.hl__track');
      const dotsBox = hl.querySelector('.hl__dots');
      const toggle = hl.querySelector('.hl__play');
      const slides = Array.from(track ? track.children : []);
      if (!slides.length || !dotsBox) return;
      let current = 0;
      let stopped = reduceMotion.matches;
      let visible = false;
      const dots = slides.map((slide, i) => {
        const dot = document.createElement('button');
        dot.type = 'button';
        dot.className = 'hl__dot';
        dot.setAttribute('aria-label', `${i + 1} / ${slides.length}`);
        dot.addEventListener('click', () => go(i));
        dot.addEventListener('animationend', () => {
          if (!stopped && visible) go(current + 1);
        });
        dotsBox.append(dot);
        return dot;
      });
      const state = () => {
        hl.classList.toggle('is-stopped', stopped);
        hl.classList.toggle('is-paused', stopped || !visible);
        hl.classList.toggle('is-static', reduceMotion.matches);
        if (toggle) toggle.setAttribute('aria-label', stopped ? toggle.dataset.playLabel || 'Play' : toggle.dataset.pauseLabel || 'Pause');
      };
      const mark = (index) => {
        current = index;
        dots.forEach((dot, i) => {
          dot.classList.toggle('is-current', i === index);
          if (i === index) dot.setAttribute('aria-current', 'true');
          else dot.removeAttribute('aria-current');
        });
        // Off-screen slides are hidden from screen readers and the Tab key.
        slides.forEach((slide, i) => {
          slide.setAttribute('aria-hidden', String(i !== index));
          slide.inert = i !== index;
        });
      };
      const go = (index) => {
        const i = (index + slides.length) % slides.length;
        const slide = slides[i];
        // Restart the fill even when the same dot stays current.
        dots[i].classList.remove('is-current');
        void dots[i].offsetWidth;
        mark(i);
        track.scrollTo({ left: slide.offsetLeft - (track.clientWidth - slide.offsetWidth) / 2, behavior: reduceMotion.matches ? 'auto' : 'smooth' });
      };
      // Swiping or scrolling the track picks whichever slide is nearest the middle.
      let ticking = false;
      track.addEventListener(
        'scroll',
        () => {
          if (ticking) return;
          ticking = true;
          requestAnimationFrame(() => {
            ticking = false;
            const middle = track.scrollLeft + track.clientWidth / 2;
            let best = 0;
            slides.forEach((slide, i) => {
              const d = Math.abs(slide.offsetLeft + slide.offsetWidth / 2 - middle);
              if (d < Math.abs(slides[best].offsetLeft + slides[best].offsetWidth / 2 - middle)) best = i;
            });
            if (best !== current) mark(best);
          });
        },
        { passive: true }
      );
      if (toggle)
        toggle.addEventListener('click', () => {
          stopped = !stopped;
          if (!stopped) go(current);
          state();
        });
      if (hasIO)
        new IntersectionObserver(
          (entries) => {
            visible = entries[0].isIntersecting;
            state();
          },
          { threshold: 0.5 }
        ).observe(track);
      document.addEventListener('site:lang', () => {
        go(0);
        state();
      });
      mark(0);
      state();
    });
  }

  /* ------------------------------------------------------------------ closer look (data-closer)
     Pill buttons beside a stage: opening one shows its text and its media. */

  function initCloser() {
    document.querySelectorAll('[data-closer]').forEach((box) => {
      const items = Array.from(box.querySelectorAll('.closer__item'));
      const media = Array.from(box.querySelectorAll('.closer__media'));
      const open = (index) => {
        items.forEach((item, i) => {
          item.classList.toggle('is-open', i === index);
          item.querySelector('.closer__btn').setAttribute('aria-expanded', String(i === index));
        });
        media.forEach((m, i) => m.classList.toggle('is-on', i === index));
      };
      items.forEach((item, i) => item.querySelector('.closer__btn').addEventListener('click', () => open(i)));
      open(0);
    });
  }

  /* ------------------------------------------------------------------ detail sheets (data-sheet)
     A + button opens the <dialog> it names; clicking outside or the close
     button shuts it. */

  function initSheets() {
    document.querySelectorAll('[data-sheet]').forEach((button) => {
      const sheet = document.getElementById(button.dataset.sheet);
      if (!sheet || typeof sheet.showModal !== 'function') return;
      button.addEventListener('click', () => sheet.showModal());
    });
    document.querySelectorAll('dialog.sheet').forEach((sheet) => {
      sheet.addEventListener('click', (event) => {
        if (event.target === sheet || event.target.closest('.sheet__close')) sheet.close();
      });
    });
  }

  /* ------------------------------------------------------------------ curved panorama (Bangudae XR)
     The Bangudae page opens on the cliff panorama bent into a curved cinema
     screen. It is drawn on a canvas one thin column at a time, each column
     squashed by its distance from the centre: the edges stay tallest, the
     middle shortest, and the outline smooth.

     A view of the picture is a scale (screen pixels per panorama pixel) and
     the panorama point at the frame's centre. Following a Bangudae card
     (Research, Home), the card's frame is handed over in sessionStorage, and
     a canvas over the page starts exactly where the card was, zoomed in on
     the carved panel. In one move it grows to full width, pulls back to the
     whole cliff, squares its corners and bends, while the site's page
     cross-fade swaps the pages around it. Opened any other way, the page
     plays the same pull-back in place. While zoomed in, the panel is drawn
     from its own full-resolution picture. */

  const PANO_PATH = '/research/bangudae-xr/';
  const PANO_KEY = 'pano-flight';
  const PANO_CURVE = 0.16;
  const PANO_TIME = 1600;
  // The panel's picture, as fractions of the panorama: x, y, width, height.
  const PANEL = [0.43003, 0.45947, 0.17394, 0.31899];
  const PANEL_SRC = '/assets/img/bangudae/panel-2143.jpg';
  const PANO_WIDTHS = [1600, 2400, 3600];
  const PANO_W = 3600;
  const PANO_H = 1107;

  const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const clamp01 = (t) => Math.min(1, Math.max(0, t));
  const lerp = (a, b, t) => a + (b - a) * t;

  // The view that fits a part of the picture (rx, ry, rw, rh, in its pixels) over a w × h frame, as CSS cover does.
  const coverView = (w, h, rx, ry, rw, rh, zoom = 1) => ({ s: Math.max(w / rw, h / rh) * zoom, cx: rx + rw / 2, cy: ry + rh / 2 });

  // Keeps a view inside the picture and the frame filled.
  function clampView(view, w, h, pw, ph) {
    const s = Math.max(view.s, w / pw, h / ph);
    const hx = w / 2 / s;
    const hy = h / 2 / s;
    return { s, cx: Math.min(Math.max(view.cx, hx), pw - hx), cy: Math.min(Math.max(view.cy, hy), ph - hy) };
  }

  // Draws the panorama over a frame (CSS pixels) from a view, bent by `curve`, with rounded corners.
  // Views are in reference units, the 3600 × 1107 panorama's pixels, whichever size has loaded.
  // Before the panorama arrives (`pano` null), only the panel is drawn, which is all a zoomed-in view shows.
  function drawPano(ctx, dpr, pano, panel, frame, view, curve, radius) {
    const pw = PANO_W;
    const ph = PANO_H;
    const pk = pano ? pano.naturalWidth / PANO_W : 0;
    const s = view.s * dpr;
    const left = Math.round(frame.x * dpr);
    const right = Math.round((frame.x + frame.w) * dpr);
    const height = frame.h * dpr;
    const mid = (frame.y + frame.h / 2) * dpr;
    const centre = (frame.x + frame.w / 2) * dpr;
    const sy = view.cy - height / 2 / s;
    const sh = height / s;
    // The panel's picture only where the panorama would otherwise be enlarged.
    const usePanel = panel && (!pano || s > 1.2 * pk);
    const px = PANEL[0] * pw;
    const py = PANEL[1] * ph;
    const pxw = PANEL[2] * pw;
    const pyh = PANEL[3] * ph;
    const kx = usePanel ? panel.naturalWidth / pxw : 0;
    const ky = usePanel ? panel.naturalHeight / pyh : 0;
    const step = dpr > 1.5 ? 2 : 1;

    ctx.save();
    ctx.beginPath();
    ctx.roundRect(frame.x * dpr, frame.y * dpr, frame.w * dpr, height, radius * dpr);
    ctx.clip();
    for (let dx = left; dx < right; dx += step) {
      const cw = Math.min(step, right - dx);
      const k = 1 - curve * Math.sin((Math.PI * (dx + cw / 2 - left)) / (right - left));
      const dh = height * k;
      const dy = mid - dh / 2;
      const sx = view.cx + (dx - centre) / s;
      const sw = cw / s;
      if (pano) ctx.drawImage(pano, sx * pk, sy * pk, sw * pk, sh * pk, dx, dy, cw, dh);
      if (usePanel && sx + sw > px && sx < px + pxw) {
        const a = Math.max(sy, py);
        const b = Math.min(sy + sh, py + pyh);
        if (b > a) ctx.drawImage(panel, (sx - px) * kx, (a - py) * ky, sw * kx, (b - a) * ky, dx, dy + ((a - sy) / sh) * dh, cw, ((b - a) / sh) * dh);
      }
    }
    ctx.restore();
  }

  const loadImage = (src) => new Promise((resolve, reject) => {
    const img = new Image();
    // Decoding first avoids a stutter on the first frame, but a hidden tab never finishes it, so it gets a moment, not a veto.
    img.onload = () => Promise.race([img.decode ? img.decode().catch(() => {}) : null, new Promise((r) => setTimeout(r, 250))]).then(() => resolve(img));
    img.onerror = reject;
    img.src = src;
  });

  function initPano() {
    // On the pages with a card: hand its frame to the next page, and fetch the panorama ahead of the click.
    const card = document.querySelector('.pano-src');
    if (card) {
      let warmed = false;
      const warm = (event) => {
        if (warmed || !event.target.closest || !event.target.closest(`a[href="${PANO_PATH}"]`)) return;
        warmed = true;
        // A low-priority prefetch, so the hover itself never waits on a large download or decode.
        const need = window.innerWidth * (window.devicePixelRatio || 1);
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.as = 'image';
        link.href = `/assets/img/bangudae/panorama-${PANO_WIDTHS.find((w) => w >= need) || 3600}.jpg`;
        document.head.append(link);
      };
      document.addEventListener('pointerover', warm);
      document.addEventListener('focusin', warm);
      document.addEventListener('click', (event) => {
        if (reduceMotion.matches || !event.target.closest(`a[href="${PANO_PATH}"]`)) return;
        const box = card.closest('.wcard, .promo__pano') || card;
        const r = box.getBoundingClientRect();
        if (r.bottom < 0 || r.top > window.innerHeight) return;
        const zoom = parseFloat(getComputedStyle(card).scale) || 1;
        const radius = parseFloat(getComputedStyle(box).borderTopLeftRadius) || 0;
        try {
          sessionStorage.setItem(PANO_KEY, JSON.stringify({ x: r.left, y: r.top, w: r.width, h: r.height, zoom, radius, src: card.currentSrc, at: Date.now() }));
        } catch (e) {}
      });
    }

    const pano = document.querySelector('[data-pano]');
    if (!pano) return;
    const img = pano.querySelector('img');
    let from = null;
    try {
      from = JSON.parse(sessionStorage.getItem(PANO_KEY));
      sessionStorage.removeItem(PANO_KEY);
    } catch (e) {}
    if (from && Date.now() - from.at > 4000) from = null;

    const canvas = document.createElement('canvas');
    canvas.setAttribute('aria-hidden', 'true');
    pano.append(canvas);
    const ctx = canvas.getContext('2d');
    if (!ctx || !ctx.roundRect) {
      canvas.remove();
      return;
    }
    // Hidden until drawn, so a half-loaded flat picture never shows before the move.
    pano.classList.add('is-drawn');

    // The moving canvas exists before the page's first paint, so the page
    // transition captures it on its own, outside the cross-fade (see the CSS).
    const flying = !reduceMotion.matches && !location.hash;
    let flight = null;
    if (flying) {
      flight = document.createElement('canvas');
      flight.className = 'pano-flight';
      flight.setAttribute('aria-hidden', 'true');
      document.body.append(flight);
      pano.classList.add('is-flying');
    }
    const land = () => {
      pano.classList.remove('is-flying');
      if (flight) flight.remove();
    };

    const pictureReady = (img.complete && img.naturalWidth ? Promise.resolve() : new Promise((resolve, reject) => {
      img.addEventListener('load', resolve, { once: true });
      img.addEventListener('error', reject, { once: true });
    })).then(() => loadImage(img.currentSrc || img.src));
    // The panel as the card showed it (already in the cache), or its full-resolution picture.
    const panelReady = loadImage((from && from.src) || PANEL_SRC).catch(() => null);
    const pw = PANO_W;
    const ph = PANO_H;

    // The resting screen, drawn once the panorama has loaded and again on resize.
    Promise.all([pictureReady, panelReady]).then(([picture, panelPicture]) => {
      const drawStill = () => {
        const dpr = window.devicePixelRatio || 1;
        const w = pano.clientWidth;
        const h = pano.clientHeight;
        canvas.width = Math.round(w * dpr);
        canvas.height = Math.round(h * dpr);
        ctx.imageSmoothingQuality = 'high';
        drawPano(ctx, dpr, picture, panelPicture, { x: 0, y: 0, w, h }, coverView(w, h, 0, 0, pw, ph), PANO_CURVE, 0);
      };
      drawStill();
      new ResizeObserver(drawStill).observe(pano);
    }).catch(() => {
      // The panorama failed: show the flat <img> again.
      land();
      pano.classList.remove('is-drawn');
      canvas.remove();
    });

    if (!flight) return;

    // The move. Its first frame, the card's frame zoomed in on the panel, needs only the panel,
    // which the card has already loaded, so it covers the card from the start; the camera begins
    // to pull back once the panorama has arrived. The visible width of the cliff widens on a log
    // scale, the steady pace of a camera pulling back.
    Promise.all([panelReady, window.__panoArrival || Promise.resolve()]).then(([panelPicture]) => {
      const start = pano.getBoundingClientRect();
      if (start.bottom < 0 || start.top > window.innerHeight) {
        land();
        return;
      }
      const fctx = flight.getContext('2d');
      const f0 = from ? { x: from.x, y: from.y, w: from.w, h: from.h } : { x: start.left, y: start.top, w: start.width, h: start.height };
      const r0 = from ? from.radius : 0;
      const v0 = coverView(f0.w, f0.h, PANEL[0] * pw, PANEL[1] * ph, PANEL[2] * pw, PANEL[3] * ph, from ? from.zoom : 1);
      const span0 = Math.log(f0.w / v0.s);
      const span1 = Math.log(pw);
      let picture = null;
      let t0 = 0;

      const frame = (now) => {
        if (!flight.isConnected) return;
        if (picture && !t0) t0 = now;
        const t = t0 ? clamp01((now - t0) / PANO_TIME) : 0;
        const e = easeInOut(t);
        const dpr = window.devicePixelRatio || 1;
        const end = pano.getBoundingClientRect();
        const f = { x: lerp(f0.x, end.left, e), y: lerp(f0.y, end.top, e), w: lerp(f0.w, end.width, e), h: lerp(f0.h, end.height, e) };
        const view = clampView({
          s: f.w / Math.exp(lerp(span0, span1, e)),
          cx: lerp(v0.cx, pw / 2, e),
          cy: lerp(v0.cy, ph / 2, e),
        }, f.w, f.h, pw, ph);
        const width = Math.round(window.innerWidth * dpr);
        const height = Math.round(window.innerHeight * dpr);
        if (flight.width !== width) flight.width = width;
        if (flight.height !== height) flight.height = height;
        fctx.clearRect(0, 0, width, height);
        fctx.imageSmoothingQuality = 'high';
        drawPano(fctx, dpr, picture, panelPicture, f, view, PANO_CURVE * easeInOut(clamp01((t - 0.06) / 0.94)), r0 * (1 - e));
        if (t < 1) requestAnimationFrame(frame);
        else land();
      };
      requestAnimationFrame(frame);
      pictureReady.then((p) => {
        picture = p;
      }, land);
    });
  }

  /* ------------------------------------------------------------------ paper reader
     "Read paper" opens the PDF in a sheet, in the browser's own viewer. Phones
     and browsers without an inline viewer keep the link's default: a new tab. */

  function initReader() {
    const reader = document.getElementById('paper-reader');
    if (!reader || typeof reader.showModal !== 'function') return;
    if (navigator.pdfViewerEnabled === false || !window.matchMedia('(hover: hover)').matches) return;
    let frame = reader.querySelector('.reader__frame');
    const title = reader.querySelector('.reader__title');
    const download = reader.querySelector('.reader__dl');
    document.addEventListener('click', (event) => {
      const link = event.target.closest('a[data-reader]');
      if (!link || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      const paper = link.closest('.paper');
      const heading = paper && paper.querySelector('.paper__title');
      title.textContent = heading ? heading.textContent : '';
      download.href = link.getAttribute('href');
      // A fresh frame per paper, so the last one never flashes before the next loads.
      const fresh = frame.cloneNode(false);
      fresh.src = `${link.getAttribute('href')}#view=FitH`;
      frame.replaceWith(fresh);
      frame = fresh;
      reader.showModal();
    });
    // Unload the PDF on close.
    reader.addEventListener('close', () => frame.removeAttribute('src'));
  }

  /* ------------------------------------------------------------------ copy buttons */

  function initCopy() {
    document.querySelectorAll('[data-copy], [data-copy-target]').forEach((button) => {
      const label = button.querySelector('[data-copy-label]') || button;
      let original = '';
      let timer = 0;
      button.addEventListener('click', async () => {
        // Read the label now rather than at load: the language may have changed since.
        if (!timer) original = label.textContent;
        let text = button.getAttribute('data-copy');
        if (!text && button.dataset.copyTarget) {
          const target = document.getElementById(button.dataset.copyTarget);
          text = target ? target.textContent.trim() : '';
        }
        let ok = false;
        try {
          await navigator.clipboard.writeText(text);
          ok = true;
        } catch (e) {
          const field = document.createElement('textarea');
          field.value = text;
          field.setAttribute('readonly', '');
          field.style.position = 'fixed';
          field.style.opacity = '0';
          document.body.appendChild(field);
          field.select();
          try {
            ok = document.execCommand('copy');
          } catch (err) {
            ok = false;
          }
          field.remove();
        }
        label.textContent = ok ? tr('copy.done', 'Copied') : tr('copy.failed', 'Copy failed');
        button.classList.toggle('is-copied', ok);
        clearTimeout(timer);
        timer = setTimeout(() => {
          label.textContent = original;
          button.classList.remove('is-copied');
          timer = 0;
        }, 1800);
      });
      label.setAttribute('aria-live', 'polite');
    });
  }

  /* ------------------------------------------------------------------ external links
     Links off the site open in a new tab. The HTML marks its own; this covers
     links that arrive later inside translated strings. Internal links are
     relative, so an absolute http(s) href means another site. */

  function initExternalLinks() {
    document.addEventListener('click', (event) => {
      const link = event.target.closest && event.target.closest('a[href^="http"]:not([target])');
      if (!link) return;
      link.target = '_blank';
      link.rel = 'noopener';
    }, true);
  }

  /* ------------------------------------------------------------------ disclosure toggles (summaries, BibTeX)
     Panels open and close with a height-and-fade animation. */

  // Opens any collapsed panel around an element (and the panel itself), so a
  // link or a search result can land on text inside it.
  function revealInPanels(el) {
    let panel = el && el.closest('[hidden]');
    while (panel) {
      const button = panel.id && document.querySelector(`[data-toggle][aria-controls="${panel.id}"]`);
      if (!button) return;
      panel.hidden = false;
      button.setAttribute('aria-expanded', 'true');
      panel = panel.parentElement && panel.parentElement.closest('[hidden]');
    }
  }

  function initToggles() {
    document.querySelectorAll('[data-toggle]').forEach((button) => {
      const panel = document.getElementById(button.getAttribute('aria-controls'));
      if (!panel) return;
      button.setAttribute('aria-expanded', String(!panel.hidden));
      let running = null;
      button.addEventListener('click', () => {
        const open = button.getAttribute('aria-expanded') !== 'true';
        button.setAttribute('aria-expanded', String(open));
        if (running) running.cancel();
        if (!motionOK() || !panel.animate) {
          panel.hidden = !open;
          return;
        }
        panel.hidden = false;
        const height = panel.scrollHeight;
        panel.style.overflow = 'hidden';
        const frames = [
          { height: '0px', opacity: 0, transform: 'translateY(-6px)' },
          { height: `${height}px`, opacity: 1, transform: 'none' },
        ];
        running = panel.animate(open ? frames : frames.slice().reverse(), {
          duration: open ? 480 : 320,
          easing: open ? 'cubic-bezier(0.16, 1, 0.3, 1)' : 'cubic-bezier(0.4, 0, 0.2, 1)',
        });
        running.onfinish = () => {
          panel.style.overflow = '';
          if (!open) panel.hidden = true;
          running = null;
        };
      });
    });
    const openFromHash = () => {
      // A stray % in a pasted link must not stop the rest of the page.
      let id = location.hash.slice(1);
      try {
        id = decodeURIComponent(id);
      } catch (error) {
        return;
      }
      const target = id && document.getElementById(id);
      if (!target || !target.closest('[hidden]')) return;
      revealInPanels(target);
      target.scrollIntoView({ block: 'start', behavior: 'instant' });
    };
    openFromHash();
    window.addEventListener('hashchange', openFromHash);
  }

  /* ------------------------------------------------------------------ segmented charts (e.g. Fitts' law metrics)
     A thumb slides between options; bars ease to their new lengths. */

  // A segmented control's sliding thumb. Returns a function that moves it to
  // the pressed button; call it after every change.
  function segThumb(seg, buttons) {
    const thumb = document.createElement('span');
    thumb.className = 'seg__thumb';
    thumb.setAttribute('aria-hidden', 'true');
    seg.prepend(thumb);
    seg.classList.add('has-thumb');
    const place = () => {
      const button = buttons.find((b) => b.getAttribute('aria-pressed') === 'true') || buttons[0];
      thumb.style.width = `${button.offsetWidth}px`;
      thumb.style.height = `${button.offsetHeight}px`;
      thumb.style.translate = `${button.offsetLeft}px ${button.offsetTop}px`;
    };
    requestAnimationFrame(() => seg.classList.add('is-ready'));
    if ('ResizeObserver' in window) new ResizeObserver(place).observe(seg);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(place);
    return place;
  }

  function initSegmented() {
    document.querySelectorAll('[data-seg-chart]').forEach((chart) => {
      const seg = chart.querySelector('.seg');
      const buttons = Array.from(chart.querySelectorAll('[data-seg]'));
      const rows = Array.from(chart.querySelectorAll('[data-values]'));
      const caption = chart.querySelector('[data-seg-caption]');
      if (!seg || !buttons.length) return;
      const place = segThumb(seg, buttons);
      let active = 0;
      const select = (index) => {
        active = index;
        buttons.forEach((b, i) => b.setAttribute('aria-pressed', String(i === index)));
        const values = rows.map((row) => JSON.parse(row.dataset.values)[index]);
        const max = Math.max(...values.map((v) => v.value));
        rows.forEach((row, i) => {
          const { value, label } = values[i];
          row.querySelector('.bar__fill').style.setProperty('--v', `${(value / max) * 100}%`);
          row.querySelector('.bar__value').textContent = label;
        });
        if (caption) caption.textContent = buttons[index].dataset.caption || '';
        place();
      };
      buttons.forEach((button, index) => button.addEventListener('click', () => select(index)));
      // The caption comes from the pressed button, whose text changes with the language.
      document.addEventListener('site:lang', () => select(active));
      select(0);
    });

    // Filters: each button names a group (data-filter); items carry data-group.
    // "all" shows everything. A rail scrolls back to its start after a change.
    document.querySelectorAll('[data-seg-filter]').forEach((box) => {
      const seg = box.querySelector('.seg');
      const buttons = Array.from(box.querySelectorAll('[data-filter]'));
      const items = Array.from(box.querySelectorAll('[data-group]'));
      if (!seg || !buttons.length) return;
      const place = segThumb(seg, buttons);
      const select = (button) => {
        const group = button.dataset.filter;
        buttons.forEach((b) => b.setAttribute('aria-pressed', String(b === button)));
        items.forEach((item) => (item.hidden = group !== 'all' && !item.dataset.group.split(' ').includes(group)));
        const track = box.querySelector('.rail__track');
        if (track) {
          track.scrollLeft = 0;
          track.dispatchEvent(new Event('scroll'));
        }
        place();
      };
      buttons.forEach((button) => button.addEventListener('click', () => select(button)));
      select(buttons[0]);
    });

    // Media switches: buttons under a stage show one item at a time, with its caption.
    document.querySelectorAll('[data-seg-media]').forEach((box) => {
      const seg = box.querySelector('.seg');
      const buttons = Array.from(box.querySelectorAll('[data-show]'));
      const items = Array.from(box.querySelectorAll('.segmedia__item'));
      const caps = Array.from(box.querySelectorAll('[data-cap]'));
      if (!seg || !buttons.length) return;
      const place = segThumb(seg, buttons);
      const select = (button) => {
        const id = button.dataset.show;
        buttons.forEach((b) => b.setAttribute('aria-pressed', String(b === button)));
        items.forEach((item) => item.classList.toggle('is-on', item.dataset.item === id));
        caps.forEach((cap) => (cap.hidden = cap.dataset.cap !== id));
        place();
      };
      buttons.forEach((button) => button.addEventListener('click', () => select(button)));
      select(buttons[0]);
    });
  }


  /* ------------------------------------------------------------------ images fade in as they load */

  function initImageFade() {
    if (!motionOK()) return;
    document.querySelectorAll('main img[loading="lazy"]').forEach((img) => {
      if (img.complete && img.naturalWidth) return;
      img.classList.add('is-loading');
      const done = () => img.classList.remove('is-loading');
      img.addEventListener('load', done, { once: true });
      img.addEventListener('error', done, { once: true });
    });
  }

  /* ------------------------------------------------------------------ guess, then reveal (home)
     Picking an answer marks it, fills in the chart and shows the matching
     explanation. Without the script, the chart is simply there. */

  function initQuiz() {
    document.querySelectorAll('[data-quiz]').forEach((quiz) => {
      const options = Array.from(quiz.querySelectorAll('[data-answer]'));
      const bars = quiz.querySelector('.bars');
      const verdicts = Array.from(quiz.querySelectorAll('[data-verdict]'));
      options.forEach((option) => {
        option.addEventListener('click', () => {
          const answer = option.dataset.answer;
          options.forEach((other) => other.setAttribute('aria-pressed', String(other === option)));
          verdicts.forEach((verdict) => (verdict.hidden = verdict.dataset.verdict !== answer));
          if (bars) {
            bars.querySelectorAll('[data-key]').forEach((bar) => bar.classList.toggle('is-picked', bar.dataset.key === answer));
            bars.classList.add('in');
          }
          quiz.classList.add('is-answered');
        });
      });
    });
  }

  /* ------------------------------------------------------------------ clip switcher (home)
     Buttons (data-src, data-poster) that change which clip a .loop video
     plays. The video's label comes from the container's data-alt, with
     {name} filled from the pressed button. */

  function initClips() {
    document.querySelectorAll('[data-clips]').forEach((clips) => {
      const video = clips.querySelector('video');
      const buttons = Array.from(clips.querySelectorAll('[data-src]'));
      if (!video || !buttons.length) return;
      const current = () => buttons.find((button) => button.getAttribute('aria-pressed') === 'true') || buttons[0];
      const label = () => {
        const name = current().textContent.trim();
        const template = clips.dataset.alt || '{name}';
        video.setAttribute('aria-label', template.replace('{name}', lang === 'en' ? name.toLowerCase() : name));
      };
      buttons.forEach((button) => {
        button.addEventListener('click', () => {
          if (button === current() && !video.paused) return;
          buttons.forEach((other) => other.setAttribute('aria-pressed', String(other === button)));
          if (video.getAttribute('src') !== button.dataset.src) {
            video.poster = button.dataset.poster || '';
            video.src = button.dataset.src;
          }
          label();
          // A click is a request to watch, so it plays even with reduced motion.
          const attempt = video.play();
          if (attempt) attempt.catch(() => {});
        });
      });
      document.addEventListener('site:lang', label);
      label();
    });
  }

  /* ------------------------------------------------------------------ reel (home)
     Plays the shots listed in .reel__shots in order: video shots between
     data-in and data-out, stills for data-dur seconds (drifting slowly) and a
     closing title card. Each shot's line becomes the subtitle. The reel pauses
     when scrolled away or when the tab is hidden; with reduced motion or Save
     Data it waits for the play button. */

  function initReel() {
    const reel = document.querySelector('[data-reel]');
    // A hidden reel stays idle: no videos load and nothing plays.
    if (!reel || reel.hidden) return;
    const stage = reel.querySelector('.reel__stage');
    const lineEl = reel.querySelector('.reel__line');
    const countEl = reel.querySelector('.reel__count');
    const labelEl = reel.querySelector('.reel__label');
    const endEl = reel.querySelector('.reel__end');
    const poster = reel.querySelector('.reel__poster');
    const toggle = reel.querySelector('.reel__toggle');
    const shots = Array.from(reel.querySelectorAll('.reel__shots > li')).map((li) => ({
      li,
      video: li.dataset.video || '',
      img: li.dataset.img || '',
      poster: li.dataset.poster || '',
      from: parseFloat(li.dataset.in) || 0,
      to: parseFloat(li.dataset.out) || 0,
      dur: parseFloat(li.dataset.dur) || 5,
      end: li.hasAttribute('data-end'),
      layer: null,
      broken: false,
    }));
    if (!shots.length || !stage) return;

    const textOf = (shot, part) => {
      const el = shot.li.querySelector(part === 'label' ? '.reel__shot-label' : '.reel__shot-line');
      return el ? clean(el.textContent) : '';
    };
    const pad = (n) => String(n).padStart(2, '0');

    // One progress segment per shot; each jumps to its shot.
    const bar = document.createElement('div');
    bar.className = 'reel__bar';
    const segs = shots.map((shot, i) => {
      const seg = document.createElement('button');
      seg.type = 'button';
      seg.className = 'reel__seg';
      seg.innerHTML = '<span></span>';
      seg.addEventListener('click', () => {
        userPaused = false;
        go(i);
        play();
      });
      bar.appendChild(seg);
      return seg;
    });
    stage.after(bar);
    const labelSegs = () =>
      segs.forEach((seg, i) =>
        seg.setAttribute('aria-label', tr('home.reel.goto', 'Shot {n} of {total}: {label}', { n: i + 1, total: shots.length, label: textOf(shots[i], 'label') }))
      );

    let index = -1;
    let playing = false;
    let visible = false;
    let started = 0; // stills and the title card: when the shot (re)started
    let elapsed = 0; // and how much of it had already played
    let watchdog = 0; // a video that stalls for good is skipped
    let raf = 0;
    let userPaused = reduceMotion.matches || Boolean(navigator.connection && navigator.connection.saveData);

    const layerFor = (shot) => {
      if (shot.layer) return shot.layer;
      let el = endEl;
      if (shot.video) {
        el = document.createElement('video');
        el.muted = true;
        el.playsInline = true;
        el.setAttribute('muted', '');
        el.setAttribute('playsinline', '');
        el.preload = playing ? 'auto' : 'metadata';
        el.poster = shot.poster;
        el.src = shot.video;
        const seek = () => {
          try {
            el.currentTime = shot.from;
          } catch (e) {}
        };
        if (el.readyState >= 1) seek();
        else el.addEventListener('loadedmetadata', seek, { once: true });
        el.addEventListener('error', () => {
          shot.broken = true;
          if (shots[index] === shot) next();
        });
      } else if (shot.img) {
        el = document.createElement('img');
        el.alt = '';
        el.decoding = 'async';
        el.src = shot.img;
        el.classList.add('reel__layer--still');
        el.style.setProperty('--dur', `${shot.dur}s`);
      }
      if (el !== endEl) {
        el.classList.add('reel__layer');
        el.setAttribute('aria-hidden', 'true');
        stage.insertBefore(el, endEl);
      }
      shot.layer = el;
      return el;
    };

    const setSeg = (i, p) => segs[i].firstChild.style.setProperty('--p', p.toFixed(4));

    const showLine = (shot) => {
      lineEl.classList.add('is-out');
      window.setTimeout(() => {
        if (shots[index] !== shot) return;
        lineEl.textContent = shot.end ? '' : textOf(shot, 'line');
        lineEl.classList.remove('is-out');
      }, motionOK() ? 280 : 0);
      countEl.textContent = `${pad(index + 1)}/${pad(shots.length)}`;
      labelEl.textContent = shot.end ? '' : textOf(shot, 'label');
      reel.classList.toggle('is-end', shot.end);
    };

    function go(i) {
      let target = (i + shots.length) % shots.length;
      for (let n = 0; n < shots.length && shots[target].broken; n++) target = (target + 1) % shots.length;
      const previous = shots[index];
      const shot = shots[target];
      index = target;
      const el = layerFor(shot);
      if (shot.video) {
        try {
          if (el.readyState >= 1) el.currentTime = shot.from;
        } catch (e) {}
        if (playing) {
          const attempt = el.play();
          if (attempt) attempt.catch(() => {});
        }
      } else if (shot.img) {
        // Restart the slow drift.
        el.classList.remove('is-on');
        void el.offsetWidth;
      }
      // The incoming shot sits above the outgoing one while they cross-fade.
      shots.forEach((s) => s.layer && s.layer !== endEl && (s.layer.style.zIndex = s === shot ? '1' : '0'));
      el.classList.add('is-on');
      if (previous && previous !== shot && previous.layer) {
        const old = previous.layer;
        old.classList.remove('is-on');
        if (old.tagName === 'VIDEO') window.setTimeout(() => !old.classList.contains('is-on') && old.pause(), 950);
      }
      // The still poster stays until the first shot can show a frame.
      if (poster && !poster.hidden) {
        const hide = () => (poster.hidden = true);
        if (el === endEl || (el.tagName === 'VIDEO' ? el.readyState >= 2 : el.complete)) hide();
        else el.addEventListener(el.tagName === 'VIDEO' ? 'loadeddata' : 'load', hide, { once: true });
      }
      started = performance.now();
      watchdog = started;
      elapsed = 0;
      segs.forEach((seg, n) => setSeg(n, n < index ? 1 : 0));
      showLine(shot);
      if (playing) preloadNext();
      if (playing && !raf) raf = requestAnimationFrame(tick);
    }

    function next() {
      go(index + 1);
    }

    // The next shot starts loading once the reel is actually playing.
    function preloadNext() {
      const upcoming = layerFor(shots[(index + 1) % shots.length]);
      if (upcoming.tagName === 'VIDEO') upcoming.preload = 'auto';
    }

    function tick(now) {
      raf = 0;
      if (!playing) return;
      const shot = shots[index];
      let progress;
      if (shot.video) {
        const v = shot.layer;
        const end = Math.min(shot.to || v.duration || 0, v.duration || Infinity);
        if (v.ended || (end && v.currentTime >= end - 0.06)) return next();
        if (now - watchdog > (end - shot.from + 8) * 1000) return next();
        progress = end > shot.from ? (v.currentTime - shot.from) / (end - shot.from) : 0;
      } else {
        const t = elapsed + (now - started) / 1000;
        if (t >= shot.dur) return next();
        progress = t / shot.dur;
      }
      setSeg(index, Math.max(0, Math.min(1, progress)));
      raf = requestAnimationFrame(tick);
    }

    function play() {
      if (playing) return;
      playing = true;
      reel.classList.remove('is-paused');
      const shot = shots[index];
      watchdog = performance.now();
      if (shot.video) {
        shot.layer.preload = 'auto';
        const attempt = shot.layer.play();
        if (attempt) attempt.catch(() => {});
      } else {
        started = performance.now();
      }
      preloadNext();
      if (!raf) raf = requestAnimationFrame(tick);
    }

    function pause() {
      if (!playing) return;
      playing = false;
      reel.classList.add('is-paused');
      const shot = shots[index];
      if (shot.video) shot.layer.pause();
      else elapsed += (performance.now() - started) / 1000;
      cancelAnimationFrame(raf);
      raf = 0;
    }

    const resume = () => {
      if (visible && !userPaused && document.visibilityState === 'visible') play();
    };

    toggle.addEventListener('click', () => {
      if (playing) {
        userPaused = true;
        pause();
      } else {
        userPaused = false;
        play();
      }
    });
    document.addEventListener('visibilitychange', () => (document.visibilityState === 'visible' ? resume() : pause()));
    document.addEventListener('site:lang', () => {
      labelSegs();
      if (shots[index]) showLine(shots[index]);
    });

    reel.classList.add('is-paused');
    labelSegs();
    go(0);
    if (hasIO) {
      new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            visible = entry.isIntersecting;
            if (visible) resume();
            else pause();
          });
        },
        { threshold: 0.25 }
      ).observe(stage);
    } else {
      visible = true;
      resume();
    }
  }

  /* ------------------------------------------------------------------ hover to play (home cards)
     [data-hover-play] around a video: it plays while the pointer is over the
     card (or the card has focus), and on touch screens while most of it is on
     screen. With reduced motion the poster stays. */

  function initHoverPlay() {
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)');
    document.querySelectorAll('[data-hover-play]').forEach((box) => {
      const video = box.querySelector('video');
      if (!video) return;
      const card = box.closest('.card') || box;
      video.muted = true;
      video.playsInline = true;
      const play = () => {
        if (reduceMotion.matches) return;
        if (video.preload === 'none') video.preload = 'auto';
        const attempt = video.play();
        if (attempt) attempt.catch(() => {});
      };
      const stop = () => video.pause();
      card.addEventListener('pointerenter', () => fine.matches && play());
      card.addEventListener('pointerleave', () => fine.matches && stop());
      card.addEventListener('focusin', play);
      card.addEventListener('focusout', stop);
      if (!hasIO) return;
      new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (fine.matches) return;
            if (entry.intersectionRatio >= 0.6) play();
            else stop();
          });
        },
        { threshold: [0, 0.6, 1] }
      ).observe(box);
    });
  }

  /* ------------------------------------------------------------------ boot
     Language first, so every control below is labelled in it from the start.
     Each feature starts on its own: if one throws, the others still run, and
     the page drops its hidden start states (.js) so nothing stays invisible. */

  let failed = false;
  [
    applyLanguage,
    initLanguageMenu,
    initLanguageBar,
    initMenu,
    initLocalNav,
    initNavReveal,
    initTheme,
    initSearch,
    initCascade,
    initReveal,
    initBars,
    initCounters,
    initLoops,
    initRails,
    initAppbar,
    initHighlights,
    initCloser,
    initSheets,
    initPano,
    initReader,
    initCopy,
    initExternalLinks,
    initToggles,
    initSegmented,
    initQuiz,
    initClips,
    initReel,
    initHoverPlay,
    initImageFade,
  ].forEach((init) => {
    try {
      init();
    } catch (error) {
      failed = true;
      console.error(error);
    }
  });

  if (failed) root.classList.remove('js', 'i18n-wait');
  else root.classList.add('motion-ready');
  // Tells the <head> fallback that the script ran.
  window.__site = true;
})();
