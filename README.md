# danyals-code.github.io

Portfolio of Danyal Sarfraz, HCI researcher and designer (mixed reality, spatial computing, human-centered AI, human–robot interaction).
Live at <https://danyals-code.github.io/>.

Plain HTML, CSS and JavaScript. No build step, no dependencies.

## Pages

```
/                              Home: name, role, pitch and four highlights, then selected work as promos in
                               the manner of Apple's home page (Bangudae XR, Almanac, then pairs: Synthetic
                               Realities, True RoboAnimator, Product form analysis, Waveform), what I do,
                               selected publications, the 3D rail (each render opens its project page) and contact.
                               A 30-second subtitled reel is in the page but hidden; remove `hidden` from the
                               `.reel` figure to show it
/research/                     Highlights (a carousel of the moments behind the papers), then publications as
                               large picture rows, industry projects at IID Lab as icon cards, personal projects,
                               and the app bar. Each entry has a "Learn more" button to its own page
/research/experiments/         Interaction experiments: Fitts' law pointing, window snapping, fish-tank VR
/research/bangudae-xr/         Case study: mixed-reality heritage app for Meta Quest 3 (first place, 2024)
/research/life-size-ar/        Case study: life-size AR for iPhone and Apple Vision Pro, tested at home on iPhone
/research/synthetic-realities/ Case study: detecting AI-generated video (IASDR 2025)
/research/product-form/        Case study: multi-view product form analysis (KSDS 2026)
/research/lemmy/               Case study: component-based robot motion (IASDR 2025, KSDS 2025)
/research/lemmy-framework/     Case study: MSc thesis framework (Blender add-on, AR app)
/tools/                        Artifacts: a bar of app icons, then "Explore the lineup", a rail of cards filtered by
                               kind (apps, Blender add-ons, web tools), then why the tools exist
/tools/almanac/                App pages, one per artifact, built like Apple product pages: hero, highlights,
/tools/viewar/                 features, a closer look, how it works, tech specs, and the app bar again at the
/tools/roboanimator/           end. Lemmy AR has no page of its own; its card links to /research/life-size-ar/
/tools/amvr/
/tools/swift-studio/
/publications/                 Redirects to /research/#publications
/design/<project>/             Project pages (dark), one per project: Lemmy product visualization, the wearable
                               posture sensor module (with LG Electronics), the 2024 demo reel, Waveform and the CGI
                               projects moved from Behance, each with facts, tools, process, galleries and details.
                               "Next project" follows the same order as the two rails
/design/                       Design and 3D (dark page): a row of software logos, freelance and studio work, then
                               two rails of tall cards, each newest first and each card opening its page:
                               product design projects (Lemmy, the posture sensor, Waveform), then 3D visualization
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

## Product and project pages

App pages (`/tools/<app>/`) and project pages (`/design/<project>/`) share a set of components in
`site.css` (the "Product and project pages" block): device frames (`.device--phone`, `.device--window`,
`.phones`, `.duo`), `.phero`, `.statband`, `.hl` highlights, `.closer`, `.segmedia`, `.fgrid`, `.flow`,
`.specs`, `.bigspecs`, `.monocard`, `.frame`, `.arch`, `.tree`, `.lineup` and `.lcard`, `.next-card`,
`.gallery`, `.project-hero` and `.tools-used`. The Design page shows its projects as tall
`.wcard` cards in a `.rail.works`, after Apple's "Get to know" cards: `--wc-pos` picks the part of a wide
picture a card shows, `.wcard--light` sets dark text on a light picture, and `.wcard--inset` (with `--wc-bg`,
`--wc-w` and `--wc-b`) shows a product shot whole on a plain background. The home page's promos are `.promos`, `.promo`
(`.promo--half`, `.promo--paper`, or `.theme-dark` for a black tile) and `.promo-pair`; the research
lists use `.rlist--feature` (picture rows, sides alternating) and `.rlist--cards` (icon tiles). An app page sets its accent on `<body class="tinted"
style="--tint-l: …; --tint-d: …">` (light and dark values).

**Icons** are line drawings on a 24-unit grid in one sprite, `assets/img/icons.svg`:
`<svg class="ico"><use href="/assets/img/icons.svg#compass"/></svg>`. Add a `<symbol>` to add one.

**Placeholders** (`.ph`) stand in for images and films still to come; each says what belongs there
and at what size. `PLACEHOLDERS.md` lists all of them. App and project pages are English only for
now (`data-langs="en"`); add Arabic and Chinese once their content is final.

## App icons

The Artifacts page opens with a row of app icons (`.appbar`), and every app page repeats it under
"More artifacts". To add an app, add an `<li>` to each bar, a card to the lineup on `/tools/`, and its
own page (copy one of the app pages). Icons live in `assets/img/apps/`: 256 px PNGs, or 1024 px SVG
placeholders until the real icon exists. An app with light and dark icons uses two `<img>` tags,
`class="icon-light"` and `class="icon-dark"`, with `loading="lazy"`; the page shows the one that
matches the current theme and never downloads the other.

Software logos on the Design page are white PNGs in `assets/img/software/` (264 px), so they only
work on dark backgrounds.

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
| `data-appbar` with `data-appbar-prev` / `data-appbar-next` | The Artifacts app bar: icons linking to each app's page; scrolls sideways with chevrons when it doesn't fit, and centres the current app (`aria-current="page"`) |
| `data-highlights` around `.hl__track` | "Get the highlights": large slides that advance while on screen; the current dot fills over `--hl-dur`; a button stops and starts it; reduced motion never autoplays |
| `data-closer` | "Take a closer look": pill buttons (`.closer__item`) beside a stage; opening one shows its text and its `.closer__media` |
| `data-sheet="<dialog id>"` on a button | Opens a `<dialog class="sheet">` with more detail (the + on "Get to know" cards); click outside or the close button to shut it |
| `data-seg-filter` with `data-filter` buttons and `data-group` items | A segmented control that filters a list or rail ("all" shows everything) |
| `data-seg-media` with `data-show` buttons, `.segmedia__item[data-item]` and `[data-cap]` | A segmented control under a stage that switches the media and its caption |
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
