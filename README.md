# Allen Glossary

A searchable glossary and table reference for the Allen Institute datasets, across two
disciplines — **connectomics** (MICrONS, V1DD) and **physiology** (V1DD 2P, BCI, Dynamic
Foraging, NP Ultra, Dynamic Routing, CTLUT, MICrONS functional) — plus a printable cheat
sheet built from the same content. Further reading is listed in the site footer and lives in `data/config.js`
under `SITE.references`; a definition that leans on one particular source carries its
own link chip.

There is no build step, no server and no dependencies: clone the repo and double-click
`index.html`, and it behaves exactly as it would when hosted.

| | |
|---|---|
| `index.html` | The site: Glossary, Tables, Cheat sheet |
| `builder.html` | Cheat sheet builder — place blocks on pages by hand |
| `data/` | **Everything you would want to edit lives here** |
| `data/brand.js` | The Allen "a/" mark, inlined once and used for both the header and the favicon |
| `assets/` | Styling and behaviour |
| `dist/` | The same site squashed into one self-contained file, for emailing |
| `scripts/` | Importers and the bundler; not part of the site |

To refresh `dist/` after editing `data/`: `node scripts/bundle.mjs` (and
`node scripts/bundle.mjs builder.html`). Nothing else needs Node.

## Disciplines

**All / Connectomics / Physiology** sits above the view tabs and scopes everything below
it: which terms are in the glossary, which categories the legend offers, which datasets
the Tables view lists, and what the cheat sheet prints. A term inherits its discipline
from its category, unless it declares its own — cell types belong to `both`, because a
basket cell is the same cell however it was recorded.

Row one carries the scopes and the outbound **Community** link, which leaves the site
and so belongs beside them rather than among the views of this one. Row two carries the
views and is **shut until you reach for it**: pointing at the scope opens it over a
second, and leaving the header closes it again two seconds later. The liquid surface is
never told about any of this — it measures the live layout, so with the row shut there is
nothing to measure and the view blob retracts into the discipline blob, taking the neck
with it.

Keyboard focus opens the row too, since a focused control inside a zero-height box is one
nobody can see. Where there is no pointer to hover with, and for anyone who has asked for
less motion, the row is simply left open.

The two rows are one control, and the indicator behind them says so: two blobs and a
ligament joining them, run through a blur-then-threshold SVG filter, so they fuse into a
single surface when close and draw out into a thin strand when far apart. Geometry comes
from a spring integrator in `app.js` — about 15% overshoot, settled in half a second —
which is what makes it read as liquid rather than as a box being moved. It respects
`prefers-reduced-motion` by snapping, and is hidden when printing.

## The three views

**Glossary** — 249 terms, alphabetical by default, switchable to grouping by category.
Entries read left to right along each row. Search matches names, definitions and
category names; the category legend doubles as a filter, and clicking pills narrows the
glossary in either ordering. Every term has a permalink (`index.html#term-voxel`) you
can paste into an email.

The illustrations are generated rather than hand-drawn. They are under review, and
errors cannot be ruled out at this stage — the site says so next to the legend and in
the footer, and the note is repeated on the printed sheet.

**Tables** — one overview per dataset: colour-coded columns for the kinds of thing a
dataset records, side by side, above a row of headline numbers. Greyed entries are shown
for context and are not things you can query.

The two disciplines are shaped differently, and the view says so:

- **Connectomics** lists CAVE annotation tables with **row counts**. Groups: raw,
  detection, classification, proofreading, coregistration, functional, analysis.
- **Physiology** has no queryable database — it is an NWB file, and every file has the
  same top-level groups whatever the experiment was. The lanes *are* those groups:
  `general`, `acquisition`, `stimulus`, `intervals`, `processing`, `units`, `analysis`.
  Each entry carries the **`access` path** that gets you the object; counts, where shown,
  are for one session.

  Every physiology dataset names the **asset its structure was read from**, printed in
  the view. Nothing there comes from prose — see
  [AUDIT-physiology-tables.md](AUDIT-physiology-tables.md) for how the files were read
  and what turned out to be surprising. The AllenSDK project caches are deliberately not
  represented; the SDK is being retired in favour of reading NWB directly.

The dataset control applies here, and lists the datasets of the active discipline.

**Cheat sheet** — a printable sheet generated from whatever the dataset, search and sort
controls are set to. It flows across as many US Letter pages as the content needs and
never splits an entry across a page break. Print or save to PDF from the button, or just
press ⌘P / Ctrl+P from any view.

**Community** is not a view — it sits in the scope row and opens the
[Allen Brain Map community forum](https://community.brain-map.org/) in a new tab. The URL lives in `data/config.js` under `SITE.community`; clear it and the tab
disappears.

The dataset control belongs to the Tables view, where choosing one is a real question.
The glossary always shows every term of the active discipline and marks the handful that
belong to one dataset with a chip. The cheat sheet has its own dataset selector, next to
its other print options, for the table section it includes.

## The mark

`data/brand.js` carries the Allen Institute "a/" mark — the apple-touch-icon from
alleninstitute.org, inlined as a data URI so the site stays a folder of files with no
network calls. The artwork is a filled circle with the glyph knocked out to
transparency, so its alpha doubles as a mask: the header paints it with CSS `mask`, and
the favicon paints it onto a canvas with a `destination-in` composite. One asset, two
uses, any colour.

The colour walks a slow hue loop from the brand periwinkle — a full turn every 24
seconds — holding the brand's own saturation and lightness so every step is a colour the
mark could have shipped in. The header mark follows the same value, so tab and page
agree. Reduced motion paints it once and leaves it alone, and so does a hidden tab.

## Colour means one thing at a time

Each palette has one meaning, one place it appears, and a legend where it appears:

- **Glossary cards: colour = the term's category.** Left rule and eyebrow, nowhere else.
- **Table overview: colour = what the table records.** Lane headers and node rules,
  nowhere else. The lane headings are their own legend. Each discipline has its own set
  of seven hues, because the two group palettes mean different things.
- **Illustrations: colour = anatomy** — structure, dendrite, axon, synapse.
- **Datasets are not colour-coded**, in any view.

The glossary and the table overview are separate views, so those palettes never share a
surface. The printed sheet is the one place they meet, and it prints each discipline's
table section under its own heading with its own legend directly above it — never one
merged key. If you add a category or a table group, pick a hue distinguishable from its
own palette *and* from the four anatomy colours.

## Making changes

Everything readers see comes from four files in `data/`. They are plain JSON with a
one-line `window.X =` wrapper so they still load when the page is opened straight off
disk. Edit the data, reload the page.

See [CONTRIBUTING.md](CONTRIBUTING.md) for exactly what to edit for a given change —
fixing a definition, adding a term, adding a Neuroglancer link, adding an R snippet.

## Illustrations

147 of 249 terms have one, drawn on a `0 0 320 200` viewBox from `currentColor` and the
anatomy variables so they work in light, dark and on paper. Most are schematic. The
action potential is not: `scripts/hodgkin-huxley.py` integrates the 1952 equations with
RK4 and `scripts/hodgkin-huxley-svg.py` renders the result, simplified with
Douglas-Peucker so the shape survives and the file stays small. Peak +41 mV, undershoot
−76 mV, about 1.2 ms wide — the trace is the simulation, not a drawing of one.

## The mouse

Roughly two times in five, when the views row opens, a mouse runs across it and
disappears at the bottom edge of the scope — which is where the search field begins, so
it reads as having gone behind it. The path is a fresh cubic Bézier each time: which side
it enters from, how it bends, how fast it goes. It is drawn top-down, so it is symmetric
about its long axis and can simply be rotated onto the tangent whichever way it is
heading. `MOUSE_CHANCE` in `assets/app.js` is the dial; reduced motion turns it off.

## Multi-sense entries

Some words mean several incompatible things — Session, Experiment, Container, Unit,
Epoch, Distance, State. Those carry a `senses` array instead of trying to squeeze every
meaning into one paragraph, and render as a short disambiguation list. Prefer this to a
long definition whenever the honest answer is "it depends which one you mean".

## Still to do

- **Neuroglancer links per term.** Every term and every table has an `ng` field, empty
  for now; anything filled in renders as a link. Dataset-level viewer links are already
  wired up on the Tables page.
- **R alongside Python.** The recipe blocks are keyed by language and the R tab is
  already there, disabled. Adding an `r:` key to a snippet in `data/snippets.js` lights
  it up — no code change needed.
- **Illustrations.** 147 of 249 terms have one.
