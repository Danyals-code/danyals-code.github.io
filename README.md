# danyals-code.github.io

Portfolio of Danyal Sarfraz, HCI researcher and designer (mixed reality, spatial computing, human-centered AI, human–robot interaction).
Live at <https://danyals-code.github.io/>.

Plain HTML, CSS and JavaScript. No build step, no dependencies.

## Pages

```
/                              Home: spatial hero, featured XR project, highlights, numbers, news, papers
/research/                     Case studies grouped by area, methods, lab projects, interaction experiments
/research/bangudae-xr/         Case study: mixed-reality heritage app for Meta Quest 3 (first place, 2024)
/research/life-size-ar/        Case study: life-size AR on iPhone and Apple Vision Pro, tested at home
/research/synthetic-realities/ Case study: detecting AI-generated video (IASDR 2025)
/research/product-form/        Case study: multi-view product form analysis (KSDS 2026)
/research/lemmy/               Case study: component-based robot motion (IASDR 2025, KSDS 2025)
/research/lemmy-framework/     Case study: MSc thesis framework (Blender add-on, AR app)
/tools/                        Lemmy AR Experience, AR/VR UI Designer, True RoboAnimator, experiments
/publications/                 Papers with summaries, DOIs and BibTeX; thesis; talks
/design/                       Industrial design and 3D work (dark page)
/about/                        Bio, timeline, experience, education, skills, contact
/404.html                      Not-found page
```

Every page is a folder with an `index.html`, so URLs end in `/`.

## Files

```
assets/css/site.css   All styles. Color tokens at the top (light, then dark); motion at the end
assets/js/site.js     Menu, local nav, reveals, counters, charts, spatial hero, video loops,
                      rails, copy buttons, disclosures, segmented charts
assets/img/<topic>/   Images, grouped by project (mostly JPEG, up to 2400 px wide)
assets/video/<topic>/ Short muted H.264 clips, each with a poster image
assets/img/og.png     Link-preview image (1200 × 630)
favicon.svg
```

## Editing

- **Text:** edit the page's `index.html`. Sections are marked with comments.
- **Header and footer** are repeated on every page. When you add or rename a page, update the
  nav list and the footer directory on all pages. Mark the current section with `aria-current="page"`.
- **New case study:** copy a case study folder (for example `research/product-form/`), edit it,
  then add a card to `/research/` and, if it's a highlight, to the home page. Keep the
  "Next case study" links in a loop.
- **Colors:** change the tokens at the top of `site.css`. Dark values appear twice: once under
  `prefers-color-scheme: dark`, once under `.theme-dark` (pages and bands that are always dark).
- **Paths** are root-absolute (`/assets/...`). They work on GitHub Pages and a local server,
  but not when you open a file directly from disk.
- **After changing `site.css` or `site.js`**, bump the `?v=` number on both links in every page
  so returning visitors don't get a cached copy:

  ```bash
  grep -rl 'site.css?v=6' --include='*.html' . | xargs sed -i '' 's/?v=6"/?v=7"/g'
  ```

## Motion

Entrances decelerate slowly (`--ease-out`, about a second); hover and state changes use `--ease`
(0.3–0.6 s). Only `transform` and `opacity` animate, apart from chart bars and disclosures.

- A one-line script in each `<head>` adds `js` to `<html>` before first paint, so hidden start
  states never flash. If `site.js` never runs, the class is removed after the page loads and
  everything shows statically.
- Elements that enter together are staggered; lists and grids inside a revealed block cascade.
- On the home page, the hero window leans back and turns to face you as you scroll (CSS
  scroll-driven animation where supported), and follows the pointer on desktop.
- Pages cross-fade into each other with the View Transitions API where supported.
- Everything is disabled under `prefers-reduced-motion`.

### Behavior hooks

| Attribute | Effect |
| --- | --- |
| `data-reveal` | Fades and rises into view; `="fade"` fades only, `="scale"` also grows slightly |
| `data-count="25"` (+ `data-prefix`, `data-suffix`) | Counts up to the number when visible |
| `data-stage`, `data-tilt`, `data-depth` | Spatial hero: the window tilts and callouts drift with the pointer |
| `.loop` around a `<video>` | Plays muted while visible; `data-manual` waits for a click; `data-once` plays once, then offers a replay |
| `.parallax` on a media box | Its image drifts slightly slower than the page |
| `.rail` with `data-rail-prev` / `data-rail-next` | Horizontal scroller with paddles |
| `data-copy="text"` or `data-copy-target="id"` | Copies to the clipboard |
| `data-toggle` + `aria-controls` | Opens and closes a panel with a height-and-fade animation |
| `data-seg-chart`, `data-seg`, `data-values` | Segmented control with a sliding thumb that switches a bar chart |
| `data-year` | Filled with the current year |

## Preview locally

```bash
python3 -m http.server 4173
```

Then open <http://localhost:4173>.

## Deploy

GitHub Pages serves this repository from the `main` branch root.
Push to `main`, then check **Settings → Pages** once to confirm the source is "Deploy from a branch", `main`, `/ (root)`.
