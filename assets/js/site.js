/* Danyal Sarfraz · Portfolio
   Shared behaviour for every page: menu, local nav, scroll reveal, counters,
   the spatial hero, video loops, galleries, copy buttons, disclosures and charts.
   No dependencies.

   Motion notes: a tiny inline script in each page's <head> adds `js` to <html>
   before first paint, so hidden start states never flash. If this file never
   runs, that script removes `js` shortly after the page loads and everything
   shows statically. */

(() => {
  'use strict';

  window.__site = true;

  const root = document.documentElement;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const canHover = window.matchMedia('(hover: hover) and (pointer: fine)');
  const hasIO = 'IntersectionObserver' in window;
  const motionOK = () => root.classList.contains('js') && hasIO && !reduceMotion.matches;

  const easeOutExpo = (t) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t));

  /* ------------------------------------------------------------------ global nav (mobile menu) */

  function initMenu() {
    const button = document.querySelector('[data-menu]');
    if (!button) return;
    const list = document.getElementById(button.getAttribute('aria-controls'));
    const setOpen = (open) => {
      document.body.classList.toggle('nav-open', open);
      button.setAttribute('aria-expanded', String(open));
      button.setAttribute('aria-label', open ? 'Close menu' : 'Menu');
    };
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
    window.matchMedia('(min-width: 834px)').addEventListener('change', (event) => {
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
    '.pubs > li',
    '.bars > li',
    '.gchart > *',
    '.t-two-tone > strong',
    '.principles > *',
    '.stage__scene > .callout',
    '.award-row > *',
  ].join(', ');

  function initCascade() {
    document.querySelectorAll(CASCADE).forEach((el) => {
      const index = Array.prototype.indexOf.call(el.parentElement.children, el);
      el.style.setProperty('--ci', String(Math.min(index, 12)));
    });
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
    const charts = Array.from(document.querySelectorAll('.bars'));
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

  /* ------------------------------------------------------------------ spatial hero: pointer depth and tilt */

  function initStage() {
    const stage = document.querySelector('[data-stage]');
    if (!stage) return;
    const layers = Array.from(stage.querySelectorAll('[data-depth]'));
    const tilt = stage.querySelector('[data-tilt]');
    let tx = 0;
    let ty = 0;
    let x = 0;
    let y = 0;
    let frame = 0;
    const allowed = () => motionOK() && canHover.matches && window.innerWidth >= 734;
    const render = () => {
      x += (tx - x) * 0.075;
      y += (ty - y) * 0.075;
      layers.forEach((layer) => {
        const d = parseFloat(layer.dataset.depth);
        layer.style.translate = `${(x * d).toFixed(2)}px ${(y * d).toFixed(2)}px`;
      });
      if (tilt) tilt.style.transform = `rotateX(${(-y * 2.6).toFixed(3)}deg) rotateY(${(x * 3.6).toFixed(3)}deg)`;
      frame = Math.abs(tx - x) > 0.0008 || Math.abs(ty - y) > 0.0008 ? requestAnimationFrame(render) : 0;
    };
    const kick = () => {
      if (!frame) frame = requestAnimationFrame(render);
    };
    stage.addEventListener('pointermove', (event) => {
      if (!allowed()) return;
      const rect = stage.getBoundingClientRect();
      tx = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
      ty = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
      kick();
    });
    stage.addEventListener('pointerleave', () => {
      tx = 0;
      ty = 0;
      kick();
    });
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
      const stepSize = () => {
        const item = track.querySelector('.rail__item');
        return item ? item.getBoundingClientRect().width + 20 : track.clientWidth * 0.8;
      };
      const update = () => {
        prev.disabled = track.scrollLeft <= 4;
        next.disabled = track.scrollLeft + track.clientWidth >= track.scrollWidth - 4;
      };
      const behavior = () => (reduceMotion.matches ? 'auto' : 'smooth');
      prev.addEventListener('click', () => track.scrollBy({ left: -stepSize(), behavior: behavior() }));
      next.addEventListener('click', () => track.scrollBy({ left: stepSize(), behavior: behavior() }));
      track.addEventListener('scroll', update, { passive: true });
      window.addEventListener('resize', update);
      update();
    });
  }

  /* ------------------------------------------------------------------ copy buttons */

  function initCopy() {
    document.querySelectorAll('[data-copy], [data-copy-target]').forEach((button) => {
      const label = button.querySelector('[data-copy-label]') || button;
      const original = label.textContent;
      let timer = 0;
      button.addEventListener('click', async () => {
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
        label.textContent = ok ? 'Copied' : 'Copy failed';
        button.classList.toggle('is-copied', ok);
        clearTimeout(timer);
        timer = setTimeout(() => {
          label.textContent = original;
          button.classList.remove('is-copied');
        }, 1800);
      });
      label.setAttribute('aria-live', 'polite');
    });
  }

  /* ------------------------------------------------------------------ disclosure toggles (summaries, BibTeX)
     Panels open and close with a height-and-fade animation. */

  function initToggles() {
    document.querySelectorAll('[data-toggle]').forEach((button) => {
      const panel = document.getElementById(button.getAttribute('aria-controls'));
      if (!panel) return;
      button.setAttribute('aria-expanded', String(!panel.hidden));
      let running = null;
      button.addEventListener('click', () => {
        const open = panel.hidden;
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
  }

  /* ------------------------------------------------------------------ segmented charts (e.g. Fitts' law metrics)
     A thumb slides between options; bars ease to their new lengths. */

  function initSegmented() {
    document.querySelectorAll('[data-seg-chart]').forEach((chart) => {
      const seg = chart.querySelector('.seg');
      const buttons = Array.from(chart.querySelectorAll('[data-seg]'));
      const rows = Array.from(chart.querySelectorAll('[data-values]'));
      const caption = chart.querySelector('[data-seg-caption]');
      if (!seg || !buttons.length) return;
      const thumb = document.createElement('span');
      thumb.className = 'seg__thumb';
      thumb.setAttribute('aria-hidden', 'true');
      seg.prepend(thumb);
      seg.classList.add('has-thumb');
      let active = 0;
      const place = () => {
        const button = buttons[active];
        thumb.style.width = `${button.offsetWidth}px`;
        thumb.style.height = `${button.offsetHeight}px`;
        thumb.style.translate = `${button.offsetLeft}px ${button.offsetTop}px`;
      };
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
      select(0);
      requestAnimationFrame(() => seg.classList.add('is-ready'));
      if ('ResizeObserver' in window) new ResizeObserver(place).observe(seg);
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(place);
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

  /* ------------------------------------------------------------------ boot */

  initMenu();
  initLocalNav();
  initCascade();
  initReveal();
  initBars();
  initCounters();
  initStage();
  initLoops();
  initRails();
  initCopy();
  initToggles();
  initSegmented();
  initImageFade();

  document.querySelectorAll('[data-year]').forEach((el) => {
    el.textContent = String(new Date().getFullYear());
  });

  root.classList.add('motion-ready');
})();
