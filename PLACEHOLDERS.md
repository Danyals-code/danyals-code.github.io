# Placeholders

93 placeholders across 14 pages.

Every image or film still to come, page by page. Each placeholder in the HTML carries
`data-ph="<id>"`, so `grep -rn 'data-ph="<id>"'` finds it. To fill one, put the file in that
project's image folder (for example `assets/img/almanac/` or `assets/img/work/`), then swap the
placeholder `<div class="ph" …>` for an `<img>` (or `<video>`) with the same aspect ratio. Or send
the files and ask for them to be swapped in.

Sizes are what to export at; JPEG for photos and renders (quality 80–85), H.264 MP4 for films
and screen recordings, with a poster frame. Screen recordings and films are muted loops.

## Also to replace

| What | Where | Notes |
| --- | --- | --- |
| App icons for AMVR and Swift Web Studio | `assets/img/apps/<app>.svg` | Placeholder icons. Replace with 1024 × 1024 PNGs with transparent corners (or light and dark pairs, like Almanac) and update `icon` in each page. |
| Transparent ("clear") app icons for Lemmy AR, AMVR and Swift Web Studio | `assets/img/apps/<app>-mono-light.png` and `-mono-dark.png` | Shown when another app is selected in the app bar. 256 × 256 PNGs, like Almanac's and ViewAR's; then add `clear=(…)` to the app in the generator. |
| Project hero images | `assets/img/work/*.webp` | The Design project pages reuse the 808 px card images as heroes. Full-resolution renders (2400 × 1350) will look sharper. |
| Tall project cards on `/design/` | `design/index.html`, the `.wcard` images | The CGI cards crop the 808 × 632 Behance covers to a tall frame, which looks soft on Retina screens. A portrait render per project (at least 744 × 1360, ideally 1116 × 2040) will make them sharp. Leave room at the top for the year and name. The demo reel card shows its whole cover on white; a portrait frame from the reel would let it fill the card too. |

## /tools/almanac/

| ID | Kind | What goes here | Size |
| --- | --- | --- | --- |
| `almanac-birthday` | Screenshot | The birthday card screen: day sign, season and animal | 1290 × 2796 |
| `almanac-glyphs` | Drawing | Sheet of the twenty Maya day signs as used in the app | 2400 × 1800 |
| `almanac-icon-explorations` | Drawing | Icon explorations, from the first wheel to the final mark | 1800 × 1200 |
| `almanac-site-photo` | Photo | Photograph of an ancient site at an alignment, such as Stonehenge at a solstice sunrise (own or licensed) | 2400 × 1200 |
| `almanac-sketches` | Drawing | Early sketches of the calendar wheels | 2400 × 1600 |
| `almanac-type-color` | Drawing | Type and color studies: serif, small capitals, paper and terracotta | 1800 × 1200 |
| `almanac-wheel-motion` | Screen recording | Screen recording: spinning the Tzolk’in wheel until it settles on a day | 1290 × 2796, 10 s loop |
| `almanac-widgets` | Screenshot | Home Screen with Almanac widgets: a calendar wheel, a site and a sky compass | 1290 × 2796 |
| `almanac-wireframes` | Drawing | Wireframes of the Today screen | 1200 × 1800 |

## /tools/viewar/

| ID | Kind | What goes here | Size |
| --- | --- | --- | --- |
| `viewar-blender` | Screenshot | Blender with the ViewAR panel open beside a scene | 2560 × 1600 |
| `viewar-devices` | Photo | Photo: two or three phones around one table, each showing the same scene | 2400 × 1350 |
| `viewar-iphone` | Screenshot | The same scene placed on a table in AR on iPhone | 1290 × 2796 |
| `viewar-live` | Screen recording | Screen recording: moving an object in Blender while the phone shows it move in AR | 1290 × 2796, 8 s |
| `viewar-modifier` | Screenshot | Blender: adding a Subdivision or Array modifier, mirrored on the phone | 2560 × 1600 |
| `viewar-nearby` | Screenshot | The app’s Nearby list showing a Blender computer | 1290 × 2796 |
| `viewar-panel` | Screenshot | The Streaming sub-panel: Visible, Selected or Collection, AR Origin and Include Instances | 2560 × 1600 |
| `viewar-scatter` | Screenshot | A Geometry Nodes scatter, such as a small forest, placed in AR | 1290 × 2796 |

## /tools/roboanimator/

| ID | Kind | What goes here | Size |
| --- | --- | --- | --- |
| `roboanimator-manual` | Screen recording | Screen recording: the same path with wheel rotation keyed by hand | 1920 × 1200, 6 s loop |
| `roboanimator-overlay` | Screenshot | Viewport with the orange raw path and the cyan solution path over a robot | 2560 × 1600 |
| `roboanimator-raw` | Screen recording | Screen recording: a simple two-wheeled robot on a keyed path, chassis only, wheels still | 1920 × 1200, 6 s loop |
| `roboanimator-solved` | Screen recording | Screen recording: the same path with wheel angles from True RoboAnimator | 1920 × 1200, 6 s loop |

## /tools/amvr/

| ID | Kind | What goes here | Size |
| --- | --- | --- | --- |
| `amvr-cameras` | Screenshot | The camera rig around a product: six orthographic and three perspective cameras | 2560 × 1600 |
| `amvr-clay-full` | Render | One product as a clay render and as a full render, side by side | 2400 × 1350 |
| `amvr-hero` | Screenshot | Blender with the MultiView sidebar and a product in the viewport | 2560 × 1600 |
| `amvr-import` | Screenshot | The Import Products list with several STEP and STL files, and the status bar showing progress | 2560 × 1600 |
| `amvr-light-dramatic` | Render | The same product under Dramatic lighting | 1600 × 1200 |
| `amvr-light-hard` | Render | The same product under Studio Hard lighting | 1600 × 1200 |
| `amvr-light-highkey` | Render | The same product under High Key lighting | 1600 × 1200 |
| `amvr-light-soft` | Render | A product under Studio Soft lighting | 1600 × 1200 |
| `amvr-standardize` | Screenshot | Products of very different sizes, each fitted to the same one-meter cube | 2560 × 1600 |

## /tools/swift-studio/

| ID | Kind | What goes here | Size |
| --- | --- | --- | --- |
| `swift-code` | Screenshot | The Swift editor with a diagnostic and completion list open | 2880 × 1800 |
| `swift-components` | Screenshot | The components panel with an instance’s inputs and saved variants | 2880 × 1800 |
| `swift-content` | Screenshot | A list of records beside the row design that renders them | 2880 × 1800 |
| `swift-design` | Screenshot | Selecting a view on the canvas and editing its padding, with the Swift updating beside it | 2880 × 1800 |
| `swift-export` | Screenshot | The export dialog with Xcode, Swift Playgrounds, Swift package and XcodeGen options | 2880 × 1800 |
| `swift-hero` | Screenshot | The editor: canvas, Swift code and device preview side by side | 2880 × 1800 |
| `swift-review` | Screenshot | Review mode: one screen on several devices, with contrast and touch-target warnings | 2880 × 1800 |

## /design/waveform/

| ID | Kind | What goes here | Size |
| --- | --- | --- | --- |
| `waveform-detail` | Render | Close-up of the device on a monitor | 1200 × 1600 |
| `waveform-film` | Film | Product film or animation of Waveform | 1920 × 1080 |
| `waveform-form` | Render | Form development: iterations side by side | 2400 × 1200 |
| `waveform-hero` | Render | Hero render of Waveform on a monitor, full resolution | 2400 × 1350 |
| `waveform-mockups` | Photo | Physical mock-ups or early models | 1800 × 1200 |
| `waveform-render-2` | Render | Render: three-quarter view | 1800 × 1200 |
| `waveform-render-3` | Render | Render: color and material options | 1800 × 1200 |
| `waveform-research` | Drawing | Research summary: the problem, user insights and requirements | 2400 × 1350 |
| `waveform-sketches` | Drawing | Concept sketches | 1800 × 1200 |
| `waveform-ui` | Screenshot | Interface screens or prompt states | 2400 × 1600 |

## /design/thor-mjolnir/

| ID | Kind | What goes here | Size |
| --- | --- | --- | --- |
| `thor-bg-1` | Render | Still on the first background | 1800 × 1350 |
| `thor-bg-2` | Render | Still on the second background | 1800 × 1350 |
| `thor-detail` | Render | Close-up of the engraving | 1200 × 1600 |
| `thor-film` | Film | Animation of the hammer | 1920 × 1080 |
| `thor-still-1` | Render | Final still, full resolution | 2400 × 1350 |
| `thor-still-2` | Render | Still frame | 1200 × 1200 |
| `thor-still-3` | Render | Still frame | 1200 × 1200 |
| `thor-still-4` | Render | Still frame | 1200 × 1200 |
| `thor-wire` | Render | Wireframe or clay render of the hammer | 2400 × 1600 |

## /design/hanzos-den/

| ID | Kind | What goes here | Size |
| --- | --- | --- | --- |
| `hanzo-film` | Film | 3D animation of the room | 1920 × 1080 |
| `hanzo-still-1` | Render | Wide still of the room, full resolution | 2400 × 1350 |
| `hanzo-still-2` | Render | Still: detail of the table | 1800 × 1200 |
| `hanzo-still-3` | Render | Still: the lounge chair | 1800 × 1200 |

## /design/omnitrix/

| ID | Kind | What goes here | Size |
| --- | --- | --- | --- |
| `omnitrix-model` | Render | The untextured model in Blender | 2400 × 1350 |
| `omnitrix-render-1` | Render | Final render | 1800 × 1350 |
| `omnitrix-render-2` | Render | Final render, second angle | 1800 × 1350 |
| `omnitrix-tex-1` | Render | Texture detail | 1200 × 1200 |
| `omnitrix-tex-2` | Render | Texture detail | 1200 × 1200 |
| `omnitrix-tex-3` | Render | Texture detail | 1200 × 1200 |

## /design/delorean/

| ID | Kind | What goes here | Size |
| --- | --- | --- | --- |
| `delorean-detail-1` | Render | Detail: the flux capacitor | 1200 × 1200 |
| `delorean-detail-2` | Render | Detail: the cockpit | 1200 × 1200 |
| `delorean-detail-3` | Render | Detail: the rear of the car | 1200 × 1200 |
| `delorean-portrait` | Render | Portrait still, 2707 × 3384 | 2707 × 3384 |
| `delorean-wide` | Render | Wide still, 3384 × 1440 | 3384 × 1440 |

## /design/demo-reel-2024/

| ID | Kind | What goes here | Size |
| --- | --- | --- | --- |
| `reel-film` | Film | The 2024 demo reel (video file or an embedded player) | 1920 × 1080 |
| `reel-shot-1` | Render | Frame from the reel | 1920 × 1080 |
| `reel-shot-2` | Render | Frame from the reel | 1920 × 1080 |
| `reel-shot-3` | Render | Frame from the reel | 1920 × 1080 |
| `reel-shot-4` | Render | Frame from the reel | 1920 × 1080 |
| `reel-shot-5` | Render | Frame from the reel | 1920 × 1080 |

## /design/swooshboard/

| ID | Kind | What goes here | Size |
| --- | --- | --- | --- |
| `swoosh-board` | Render | The final skateboard | 2400 × 1350 |
| `swoosh-film` | Film | The video animation | 1920 × 1080 |
| `swoosh-model-1` | Render | Clay or wireframe of the board | 1800 × 1200 |
| `swoosh-model-2` | Render | Clay or wireframe of the packaging | 1800 × 1200 |
| `swoosh-mood` | Drawing | The mood board | 2400 × 1350 |
| `swoosh-still-1` | Render | Still frame from the animation | 1200 × 1200 |
| `swoosh-still-2` | Render | Still frame from the animation | 1200 × 1200 |
| `swoosh-still-3` | Render | Still frame from the animation | 1200 × 1200 |

## /design/jf-17/

| ID | Kind | What goes here | Size |
| --- | --- | --- | --- |
| `jf17-detail-1` | Render | Detail of the surface modeling | 1800 × 1200 |
| `jf17-detail-2` | Render | Detail of the cockpit or intake | 1800 × 1200 |
| `jf17-film` | Film | One of the animations of the model | 1920 × 1080 |
| `jf17-wide` | Render | Wide render of the aircraft | 2400 × 1350 |

## /design/jurassic-park/

| ID | Kind | What goes here | Size |
| --- | --- | --- | --- |
| `jurassic-bones` | Render | Clay render of the hand-modeled bones | 1800 × 1200 |
| `jurassic-env` | Render | The procedural desert environment | 1800 × 1200 |
| `jurassic-film` | Film | The opening shot, and the second shot with a different camera | 1920 × 1080 |
| `jurassic-wide` | Render | The opening shot, full resolution | 2400 × 1350 |
