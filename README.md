# danyals-code.github.io

Portfolio of Danyal Sarfraz, HCI researcher and designer (mixed reality, spatial computing, human-centered AI, human–robot interaction).
Live at <https://danyals-code.github.io/>.

Plain HTML, CSS and JavaScript. No build step, no dependencies.

## Pages

```
/                              Home: name, pitch and four highlights, then selected work, what I do,
                               selected publications, 3D work and contact. A 30-second subtitled reel is in
                               the page but hidden; remove `hidden` from the `.reel` figure to show it
/research/                     Publications, industry projects at IID Lab and personal projects; each
                               entry opens to its experiments, results and figures; ends with a nudge to the tools
/research/bangudae-xr/         Case study: mixed-reality heritage app for Meta Quest 3 (first place, 2024)
/research/life-size-ar/        Case study: life-size AR for iPhone and Apple Vision Pro, tested at home on iPhone
/research/synthetic-realities/ Case study: detecting AI-generated video (IASDR 2025)
/research/product-form/        Case study: multi-view product form analysis (KSDS 2026)
/research/lemmy/               Case study: component-based robot motion (IASDR 2025, KSDS 2025)
/research/lemmy-framework/     Case study: MSc thesis framework (Blender add-on, AR app)
/tools/                        Artifacts: Lemmy AR Experience, AR/VR UI Designer, True RoboAnimator, experiments
/publications/                 Redirects to /research/#publications
/design/                       Design and 3D (dark page): photoreal CGI first, then Waveform, product
                               visualization, freelance work, and the LG sensor module as a short entry
/about/                        Bio (short bio on request), conference photos, experience, education, skills,
                               recognition (certifications on request), contact
/404.html                      Not-found page
```

Every page is a folder with an `index.html`, so URLs end in `/`.

## Files

```
assets/css/site.css          All styles. Color tokens at the top (light, then dark); motion at the end
assets/js/site.js            Language and theme, menu, local nav, search, reveals, counters, charts,
                             video loops, the home reel, rails, copy buttons, disclosures
assets/js/i18n.js            Arabic and Simplified Chinese strings shared by every page (header,
                             footer, controls) and the home and 404 pages
assets/js/i18n/<page>.js     Each other page's Arabic and Chinese strings, as strict JSON
assets/img/<topic>/   Images, grouped by project (mostly JPEG, up to 2400 px wide)
assets/img/thumbs/    Home page card images (720 × 450) and the small avatar
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
- **After changing a CSS or JS file**, bump its `?v=` number in every page so returning
  visitors don't get a cached copy:

  ```bash
  grep -rl 'site.css?v=13' --include='*.html' . | xargs sed -i '' 's/site.css?v=13"/site.css?v=14"/g'
  ```

## Theme and languages

- **Theme:** the site follows the system's light or dark setting until the visitor uses the
  theme button; after that the button switches between light and dark, and the choice is
  remembered in `localStorage`.
- **Languages:** English, Arabic (right to left) and Simplified Chinese, from the globe button.
  On a first visit the language comes from `?lang=en|ar|zh`, then a saved choice, then the
  browser's preferred languages. Visitors whose time zone points to an Arabic- or
  Chinese-speaking region, but whose browser is in English, are offered that language in a
  slim bar; it never switches on its own.
- **What is translated:** every page, in full. Search results stay in English, because
  pages are indexed from their HTML. References (citations) stay in English, marked
  `lang="en" dir="ltr"`.
- **Translating text:** add `data-i18n="key"` to the element (its inner HTML is replaced) or
  `data-i18n-attr="alt:key; aria-label:key"` for attributes, then add the key to both
  languages: in `assets/js/i18n.js` for the home and shared strings, or in the page's own
  `assets/js/i18n/<page>.js` (strict JSON, keys prefixed with the page name). Never put
  `data-i18n` on an element that contains buttons, videos or other live elements, since its
  inner HTML is replaced; translate the text pieces inside instead. Text that must stay
  English (names, paper titles) gets `translate="no"`. A page whose content is fully
  translated lists its languages on the root element: `<html lang="en" data-langs="en ar zh">`.
- Names of people, papers, venues and products stay in English in every language. The Arabic
  avoids gendered self-descriptions.

## Motion

Entrances decelerate slowly (`--ease-out`, about a second); hover and state changes use `--ease`
(0.3–0.6 s). Only `transform` and `opacity` animate, apart from chart bars and disclosures.

- A one-line script in each `<head>` adds `js` to `<html>` before first paint, so hidden start
  states never flash. If `site.js` never runs, the class is removed after the page loads and
  everything shows statically.
- Elements that enter together are staggered; lists and grids inside a revealed block cascade.
- Pages cross-fade into each other with the View Transitions API where supported.
- Everything is disabled under `prefers-reduced-motion`.

### Behavior hooks

| Attribute | Effect |
| --- | --- |
| `data-reveal` | Fades and rises into view; `="fade"` fades only, `="scale"` also grows slightly |
| `data-count="25"` (+ `data-prefix`, `data-suffix`) | Counts up to the number when visible |
| `.loop` around a `<video>` | Plays muted while visible; `data-manual` waits for a click; `data-once` plays once, then offers a replay |
| `.parallax` on a media box | Its image drifts slightly slower than the page |
| `.rail` with `data-rail-prev` / `data-rail-next` | Horizontal scroller with paddles |
| `data-copy="text"` or `data-copy-target="id"` | Copies to the clipboard |
| `data-toggle` + `aria-controls` | Opens and closes a panel with a height-and-fade animation; a link or search result pointing inside a closed panel opens it |
| `data-seg-chart`, `data-seg`, `data-values` | Segmented control with a sliding thumb that switches a bar chart |
| `data-year` | Filled with the current year |
| `data-quiz` with `data-answer` buttons and `data-verdict` texts | Guess first: picking an answer fills in the chart and shows the matching explanation |
| `data-clips` with `data-src` / `data-poster` buttons | Switches which clip a `.loop` video plays; `data-alt` (with `{name}`) labels it |
| `data-reel` with a `.reel__shots` list | The home reel: plays each `<li>` in turn (`data-video` + `data-in`/`data-out`, or `data-img` + `data-dur`, or `data-end` for the title card) with its line as the subtitle; pauses off screen |
| `data-hover-play` around a `<video>` | Plays while the pointer is on its card (touch screens: while mostly on screen) |

## Preview locally

```bash
python3 -m http.server 4173
```

Then open <http://localhost:4173>.

## Deploy

GitHub Pages serves this repository from the `main` branch root.
Push to `main`, then check **Settings → Pages** once to confirm the source is "Deploy from a branch", `main`, `/ (root)`.
