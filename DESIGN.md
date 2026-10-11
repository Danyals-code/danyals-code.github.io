# Design rules

The rules every page of this site follows: what to use, with exact values, and what never to do.
They apply to anyone changing the site, person or coding agent. README.md says where things live and
how each behaviour hook works; this file says how things must look and read.

The reference is apple.com: quiet chrome, large type, pictures that carry the story, depth one click away.

**A change is finished when** `python3 scripts/check.py` reports 0 errors and every item in the
[review checklist](#13-review-checklist) holds.

---

## 1. Principles

1. **Show, then tell.** A section leads with a picture, film, chart or device frame; the words explain it.
2. **Few things, each deep.** Prefer adding depth to an existing entry or page over adding a section,
   card or chip. No overview cards, jump-link clouds, badges, fact rows or "research question" framing.
3. **One job, one component.** When two pages do the same job, they use the same component
   ([section 7](#7-components-one-job-one-component)). A new component is the last resort.
4. **Quiet chrome, loud content.** Interface text is grey and small; colour is spent on actions (blue)
   and a few accents (indigo).
5. **Works for everyone, everywhere.** Light and dark; English, Arabic (right to left) and Chinese;
   320 px phones to wide desktops; keyboard, screen reader, reduced motion, and no JavaScript at all.
6. **Nothing borrowed, nothing fake.** Missing media is a labelled placeholder, never someone else's
   image. No AI credits anywhere.

## 2. Colour

Use the tokens in `site.css`. A hex value outside the token blocks is allowed only for media stages
(`#fff` behind product shots, `#000`/`#1d1d1f` behind film), device frames and the macOS window dots.

| Token | Light | Dark | Use |
| --- | --- | --- | --- |
| `--bg` | `#ffffff` | `#000000` | Page |
| `--bg-2` / `--tile` | `#f5f5f7` | `#161617` | Alternate sections (`.section--alt`), tiles |
| `--bg-3` | `#e8e8ed` | `#232326` | Chart tracks, pressed states |
| `--tile-2` | `#ffffff` | `#1d1d1f` | A tile on an alternate section, menus |
| `--fg` | `#1d1d1f` | `#f5f5f7` | Text |
| `--fg-2` | `#6e6e73` | `#a1a1a6` | Secondary text, captions, small grey labels |
| `--fg-3` | `#86868b` | `#86868b` | Large grey text only (see contrast) and decoration |
| `--line` / `--line-soft` | `#d2d2d7` / 8% black | `#424245` / 10% white | Dividers / hairlines on glass |
| `--link` | `#0066cc` | `#2997ff` | Text links |
| `--btn` / `--btn-hover` | `#0071e3` / `#0066cc` | same | Filled buttons, focus ring |
| `--accent` / `--accent-text` | `#5856d6` / `#4c4ac4` | `#7d7aff` / `#9b99ff` | Icons, "New", one gradient figure |
| `--accent-2` | `#30b0c7` | `#40c8e0` | Second chart series only, never text |
| `--good` | `#248a3d` | `#30d158` | A positive result in a chart |
| `--grad` | indigo → blue | lighter | `.t-grad`: one hero figure per page at most |

**Contrast (WCAG AA).** Text under 24 px (19 px semibold) needs 4.5:1, so it uses `--fg` or `--fg-2`,
never `--fg-3`: grey `#86868b` on white is 3.6:1. Large text and non-text marks need 3:1. Chart bars and
dots that carry meaning need 3:1 against their track.

**Accent.** Blue means "you can act on this". Indigo is the site accent. Orange is never a site colour.
An app page may take its accent from its own icon (`<body class="tinted" style="--tint-l: …; --tint-d: …">`),
as AMVR's orange does, if `--tint-l` reaches 4.5:1 on white and on `#f5f5f7`, and `--tint-d` on black.

**Dark mode.** The dark values are written twice: under `prefers-color-scheme: dark`, and under
`:root[data-theme="dark"], .theme-dark`. Change both together; `check.py` fails if they drift.
`.theme-dark` makes any element (a promo, a tile, the whole Design section) dark in both themes.
An always-dark page sets a single `<meta name="theme-color" content="#000000">`.

## 3. Type

The font is the system stack (SF Pro on Apple devices, Inter elsewhere). Body text is 17 px / 1.47.

**The scale.** Every `font-size` in `site.css` is one of these tokens, or an `em` value for a piece
inside a line (a superscript, a unit after a number). `check.py` fails on any other value.

| Token | Size (phone → desktop) | Use |
| --- | --- | --- |
| `--fs-micro` | 12 px | Navigation links, footer, chips, chart labels, kinds and dates on cards |
| `--fs-small` | 14 px | Captions, notes, meta lines, authors, card eyebrows, tables |
| `--fs-body` | 17 px | Body text, buttons, values |
| `--fs-body-l` | 19 px | Larger body: sheet text, list titles, the local-nav title on phones |
| `--fs-title-s` | 21 px | Small titles: local-nav title, step, chart and skill titles |
| `--fs-eyebrow` | 17 → 21 px | Eyebrows over titles |
| `--fs-lead` | 19 → 24 px | Leads, `h4`, paper titles, promo subtitles |
| `--fs-statement` | 21 → 32 px | Two-tone statements, the home pitch, highlight captions |
| `--fs-title` | 24 → 28 px | Card titles (`.wcard`, `.lcard`, small tiles) |
| `--fs-h3` | 26 → 36 px | `h3`, tile titles, Next-card names, the mobile menu |
| `--fs-subhead` | 28 → 44 px | Half-width promo titles, wide card titles, finding numbers, pull quotes |
| `--fs-h2` | 32 → 56 px | Section titles, promo titles, big spec numbers |
| `--fs-h1` | 40 → 72 px | Index-page `h1`, stat-band numbers |
| `--fs-display` | 44 → 84 px | The `h1` of a case study, app or project page; the home name |
| `--fs-giant` | 56 → 104 px | One hero number on a tile |

**The classes** that apply them to running content:

| Class | Token | Line height | Weight | Use |
| --- | --- | --- | --- | --- |
| `.t-display` | display | 1.04 | 600 | Page `h1` on case studies, app and project pages |
| `.t-h1` | h1 | 1.05 | 600 | Page `h1` on index pages (Research, About) |
| `.t-h2` | h2 | 1.07 | 600 | Section titles (`.shead__title`) |
| `.t-h3` | h3 | 1.11 | 600 | Sub-sections, sheet titles, "More artifacts" |
| `.t-h4` | lead | 1.2 | 600 | Small headings inside a section |
| `.t-lead` | lead | 1.38 | 400 | The paragraph under a page or section title |
| `.t-two-tone` | statement | 1.24 | 600 | A statement in `--fg-3` with key phrases in `<strong>` |
| `.t-eyebrow` | eyebrow | 1.19 | 600, `--fg-2` | The line above a title |
| `.t-small` | small | 1.43 | 400 | Notes under charts |
| `.t-fine` | micro | 1.34 | 400 | Legal lines |

- A new component picks a token by its job in the table above. A new size is a change to the scale,
  made in `:root`, never in a component.
- One `h1` per page, then `h2` for sections, `h3` inside them, without skipping a level.
- Measure: leads up to 32–36 em, body up to 34 em, captions up to 44 em. Titles use `text-wrap: balance`
  (set globally).
- Arabic and Chinese get no negative tracking and more leading (1.6 / 1.65) automatically; Arabic body
  text that runs small steps up one size (`:lang(ar)` rules at the end of the home block).

## 4. Space and layout

**Containers** (all centred, with a side gutter `--g` of 20 → 44 px):
`.container-text` 692 px for reading, `.container` 980 px for most sections, `.container-wide` 1200 px
for heroes, rails and wide figures.

**Sections.** `.section` pads 80 → 150 px top and bottom; `.section--tight` 56 → 96 px. Alternate
backgrounds with `.section--alt`. Two plain sections in a row share one gap automatically, so never add
margin between sections.

**Space above a block** inside a section comes from its component or from one step of this scale.
Never write a margin in a `style` attribute.

| Class | Space | Typical use |
| --- | --- | --- |
| `.mt-1` | 8 px | A title under its eyebrow |
| `.mt-2` | 20 px | A chart, table, note or list under its heading or text |
| `.mt-3` | 32 px | A row of actions or links under a paragraph |
| `.mt-4` | 40 → 64 px | A figure or callout after a block of text |
| `.mt-5` | 48 → 80 px | A second group inside one section |
| `.mt-6` | 56 → 96 px | A feature row or statement after a grid |
| `.mt-7` | 64 → 112 px | A closing statement at the end of a long section |

Component spacing to reuse rather than reinvent: `.shead` leaves 32 → 56 px below a section title;
tiles pad 26 → 44 px; `.bento` and `.fig-row` gaps are 12 → 20 px; a hero's media sits 28 → 56 px under
its text (`.hero__media`).

**Grids.** `.bento` is six columns; tiles take `.span-2`, `.span-3`, `.span-4` or `.span-6` from 734 px
and stack below. `.fig-row--2/3/4` for rows of figures; `.rail` for a sideways row of cards.

**Breakpoints.** Only these, always as a pair: `(max-width: 733px)` / `(min-width: 734px)` for phone →
tablet, `833/834` for the desktop navigation, `1068/1069` for wide layouts. `599/600` is reserved for
dense data (charts, tables, the icon grid). Container queries handle placeholders.

**Layers** (z-index): content 0–3 · sticky app bar 40 (80 under a local nav) · the panorama flight 80 ·
local nav 90 · mobile menu 99 · global nav 100 · language menu 120 · skip link 200. Dialogs use the top
layer. Add nothing between these without a reason written beside it.

## 5. Shape and depth

| Radius | Value | Use |
| --- | --- | --- |
| `--r-sm` | 12 px | Code blocks, small media inside panels |
| `--r-md` | 18 px | Media inset in a tile, cards inside cards |
| `--r-lg` | 28 px | Tiles, figures, cards, promos |
| `--r-xl` | 32 px | Hero media and large lead figures (`.fig__media--xl`) |
| pill | 980 px | Buttons, segmented controls, dots, chips |
| circle | 50% | Icon buttons, paddles |
| app icon | 23.5% | App icon images (the bar's mask is 22.5%) |

- **No half-rounded media.** A picture either fills its tile edge to edge, or sits fully inside it with
  all four corners rounded (`.tile__media--inset`, `.fig__media--pad`). Never a rounded box whose
  bottom or side is cut by its container. Check every tile in dark mode, where white composites show.
- Inner corners are concentric: an inset picture's radius is the tile's radius minus the padding, and
  at least `--r-sm`.
- Shadows: `--shadow-soft` for resting cards, `--shadow-lift` for hover and menus. Glass bars
  (`--nav-bg`, `--glass`) blur 20 px with 180% saturation and a `--line-soft` hairline.

## 6. Motion

- Easing: `--ease-out` (slow deceleration) for entrances, about 0.8–1.2 s; `--ease` for hover and state
  changes, 0.3–0.6 s; 0.2 s for opacity on hover. `--ease-spring` only for a button press.
- Animate `transform` and `opacity` only. The exceptions are chart bar widths, disclosure heights and
  the highlight dot's fill.
- Entrances use `data-reveal`; lists and grids cascade. Nothing animates on load above the fold except
  the hero.
- Moving content: muted loops play only while on screen; every film and carousel has a pause button;
  carousels hold still while a keyboard user is inside them; nothing autoplays under
  `prefers-reduced-motion`, which turns every animation off.
- Lemmy (the robot) never animates on its own: its clips carry `data-manual` and wait for a click.

## 7. Components: one job, one component

| Job | Use | Not |
| --- | --- | --- |
| Index page title (Research, About) | `.page-hero` with `h1.t-h1` | A centred hero |
| Case study title | `.hero` (centred): eyebrow, `h1.t-display`, `.t-lead`, then `.hero__media` | |
| App page title | `.phero` (icon, name, tagline, lead, actions, device media) | |
| Design project title | `.project-hero` (eyebrow, `h1.t-display`, lead, media) | Inline margins |
| Section title | `.shead` with `h2.t-h2.shead__title`, optional `.shead__text` and `.shead__link` | Bare `h2` |
| Card in a grid | `.tile` (+ `.tile--white` on an alternate section) in a `.bento` | A tile with a `style` background |
| Sideways list of cards | `.rail` with paddles; `.wcard` on /design/, `.lcard` in the lineup | |
| Facts about a project | `.facts`: Role, Team, Platform, Duration, Methods, Published | Ad-hoc label sets |
| Data | `.chart` with `.bars` or `.gchart` in HTML | A picture of a chart |
| Limitations, caveats | `.callout-note` | A feature column |
| Moments carousel | `.hl` (`data-highlights`) | A home-made slider |
| Detail on demand | `<dialog class="sheet">` opened by `data-sheet` | Expand-in-place panels |
| Next item | `.next-card` in a `.section--alt` at the end of the page: picture (or app icon), label, name, one line, arrow. Case studies, app pages, project pages and the experiments page all use it | A tile, a feature row or half a bento |
| Device shots | `.device--phone`, `--duo`, `--window`, `.phones`, `.duo` | Screenshots without a frame |
| Missing media | `.ph` with `data-ph`, listed in PLACEHOLDERS.md | Stock or borrowed images |

Each page type has a fixed spine. Leave sections out when there is nothing to say; do not reorder them.

- **Case study:** local nav → hero → facts and a two-tone problem statement → method sections
  (alternating backgrounds) → results (charts, findings) → implications and a limitations callout →
  `.next-card` to the next case study (after a "Related tool" card, if any) → references in the footer.
- **App page:** app bar → local nav → hero → overview (two-tone line and stat band) → highlights →
  features → page-specific sections → tech specs → "More artifacts" with one `.next-card`.
- **Design project page (dark):** local nav → hero → overview (facts, tools, two-tone line) → process →
  galleries → film → details → `.next-card`.

How each hook behaves (`data-reveal`, `data-highlights`, `data-sheet`, `.loop` and the rest) is in
README.md under "Behavior hooks". Do not restate it here.

## 8. Words

Sentence case for every heading, button, label and menu item. Title Case only for names of products,
papers and venues.

| To | Label |
| --- | --- |
| A page on this site about the item (button or `.link-more`) | **Learn more** |
| The next item in a loop | The `.next-card` label: **Next project** (design pages), **Next** (app pages), **Next case study** (case studies), **Related tool** (an artifact a case study used). The card has no button; the arrow is the action |
| A paper's PDF | **Read the paper** |
| A citation | **Cite** (copies BibTeX) |
| Another website | **Visit the site** |
| A download or store page | **Get it** (in a hero: "Get it on Blender Extensions") |
| A live web tool | **Try the live demo** |

- Never "case study", "View project" or "See the project" on a button or link.
- Eyebrows and meta lines: `Year · Kind · Partner`, joined by a middle dot with spaces
  ("2026 · Conference paper · KSDS 2026"). Ranges use a spaced en dash ("2024 – 2025"); "Feb 2024 – present".
- Numbers: "7,000+", "91%", "8.6 out of 10". Stats are always numerals.
- Curly quotes and apostrophes (’ “ ”). "and", not "&", in running text.
- Statement headings end with a full stop ("Hi, I’m Danyal."); label headings do not ("Selected work").
- The home page shows capability, achievements, papers and projects: no study results on cards, no
  quizzes, nothing about Lemmy.
- Names of people, papers, venues, products and tools stay in English in every language, marked
  `translate="no"`. The Arabic avoids gendered self-descriptions.

## 9. Media

- Every `<img>` has `width`, `height` and `alt` (`alt=""` when it repeats nearby text or decorates).
  Images below the fold are `loading="lazy"`. The hero image is `fetchpriority="high"` and never lazy.
- Photos and renders: JPEG at quality 80–85, up to 2400 px wide. Screenshots: WebP. App icons: 256 px PNG,
  a light and a dark version (`.icon-light` / `.icon-dark`, both lazy, so only the one shown downloads).
- Films: H.264, muted, with a poster frame and `preload="none"`; the loop script loads them when they
  come into view.
- A decorative duplicate of a link (a picture that links where the title links) gets `aria-hidden="true"`
  and `tabindex="-1"`.
- Avoid text inside images on translated pages; when it is unavoidable, the alt text says what it says.
- Placeholders: `<div class="ph" data-ph="<id>" style="aspect-ratio: w / h">` that names what belongs
  there and at what size, with a row in PLACEHOLDERS.md (`check.py` compares the two).

## 10. Accessibility

- Contrast as in [section 2](#2-colour). Focus is always visible: a 2 px `--btn` outline, never removed.
- Targets: buttons are at least 28 px tall (44 px for the main action); icon buttons 34 px. Nothing
  interactive is under 24 × 24 px, except text links in running text, menus and the footer, which are
  spaced apart instead.
- Every control has a name; icon-only buttons have an `aria-label`, translated with `data-i18n-attr`.
  Repeated "Learn more" links sit inside the card they belong to.
- An overlay (mobile menu, search, sheet, paper reader) takes focus, makes the page behind it inert, closes
  on Escape and gives focus back to the control that opened it.
- A control that turns itself off (a paddle at the end of its rail) passes focus on first.
- Animated numbers (`data-count`) are hidden from screen readers, which read the final value instead.
- Headings in order inside `<main>`; landmarks: header, one main, footer.

## 11. Languages

How translation works is in README.md under "Theme and languages". The rules:

- `data-i18n` goes on an element whose content is text with at most `<a>`, `<strong>`, `<em>`, `<b>`,
  `<br>`. Its translations repeat the same links with the same `href`. Never on an element that holds
  buttons, videos or dialogs: its inner HTML is replaced.
- Keys carry the page's prefix (`tools.hero.title`); shared ones live in `assets/js/i18n.js`.
  Arabic and Chinese have the same keys; page files are strict JSON.
- A page lists its languages on `<html data-langs>`. New pages are English only (`data-langs="en"`)
  until their content is final.

## 12. Implementation

- **No inline styles**, except custom properties that carry data (`--v`, `--wc-pos`, `--tint-l`,
  `--cols`, `--n`, `--hl-dur`) and a placeholder's `aspect-ratio`. The few one-offs left are counted in
  `scripts/check.py` (`INLINE_BUDGET`); that number only goes down.
- **CSS:** new rules go in their section of `site.css` and use tokens. No new hex values, font sizes,
  radii or breakpoints. `!important` only in utilities (`.mt-*`, `.visually-hidden`).
- **Delete, don't keep for later.** Removing a feature removes its HTML, CSS, JavaScript, README rows and
  translation keys in the same change. Primitives that are part of the system (the type scale,
  `.ratio-*`, `.span-*`, `.device--tablet`) stay even when unused.
- **Cache-busting:** when a CSS, JS or SVG file changes, bump its `?v=` on every page. `check.py` fails
  if a changed file keeps its old number.
- **Shared header and footer** are copied onto every page; change all of them together (`check.py`
  compares the navigation and the footer directory).
- **JavaScript:** one `init…` function per feature, started from the boot list in `site.js`. Each must
  do nothing when its elements are missing, survive `localStorage` throwing, respect reduced motion,
  work right to left, and re-label itself on `site:lang`.

## 13. Review checklist

A change is done when all of these hold:

- [ ] `python3 scripts/check.py` reports 0 errors.
- [ ] Viewed at 390 px and 1280 px wide, in light and dark, with nothing cut off or overflowing sideways.
- [ ] Viewed in Arabic on a translated page: text runs right to left, arrows point the right way.
- [ ] Every new colour, size, radius and gap comes from sections 2–5.
- [ ] Every new section uses the component its job calls for (section 7) and keeps its page's spine.
- [ ] Every new label follows section 8; no "case study" on a button; no results on home cards.
- [ ] Every new picture has width, height and alt; none is half-rounded; placeholders are listed.
- [ ] Every new control can be reached and used with the keyboard and has a name.
- [ ] Every new string has Arabic and Chinese on pages that declare them.
- [ ] Nothing new autoplays without a pause button, and nothing autoplays under reduced motion.
- [ ] `?v=` bumped for every changed CSS, JS or SVG file.

## 14. Known deviations

Places where the site breaks these rules today. Do not copy them; fix them when you touch them.

- **Case-study local-nav buttons** differ: "Contact", "View project" (links back to /tools/, which links
  back), "Read the paper" + "Cite", "Cite" alone, "All research".
- **Research index:** paper stacks say "View details" and "Read paper" where section 8 says "Learn more"
  and "Read the paper".
- **App page actions** vary for the same job: "Visit site" / "Visit the site" / "Visit the Almanac site",
  "Get it" / "Get the add-on", "Live demo" / "Open the live demo" / "Try the live demo".
- **Limitations** appear as a callout on some case studies, a feature column on product form and a feature
  block on the thesis page; **facts** labels differ between case studies.
- **The product-form chart** (`assets/img/product-form/consistency.png`) is an image with orange and red
  bars, an axis starting at 50% and English text baked in.
- **About page:** the short bio and certifications open in place (`.expand`), and skills are chip clouds.
- **Highlight dots** are 8 px targets.
- **Artifacts vs Tools:** the English menu says "Artifacts"; the Arabic and Chinese say "Tools", and the
  URL is /tools/.
- **The 24 one-off inline styles** counted by `check.py`, mostly on the Synthetic Realities hero (its
  "60%" is set larger than `--fs-giant`) and the Lemmy chart legend.
- **The stat band on True RoboAnimator** wraps "4.2–5.0" onto two lines; a stat must fit one line.

## Vocabulary

| Term | Means |
| --- | --- |
| Artifact | Software Danyal built and released: an app, a Blender add-on or a web tool (/tools/) |
| Case study | A research project's page under /research/<project>/ |
| Project page | A design or 3D project's page under /design/<project>/ (always dark) |
| App page | An artifact's page under /tools/<app>/, built like an Apple product page |
| Highlights | The "Get the highlights" carousel of large slides |
| Promo | A tile on the home page that sells one project |
| Placeholder | A labelled stand-in for media that does not exist yet |
