# Allen Glossary

A searchable glossary and table reference for the Allen Institute datasets, across two
disciplines — **connectomics** (MICrONS, V1DD) and **physiology** (Visual Coding, Visual
Behavior, V1DD 2P, BCI, Dynamic Foraging, NP Ultra, CTLUT) — plus a printable cheat sheet
built from the same content. Further reading is listed in the site footer and lives in `data/config.js`
under `SITE.references`; a definition that leans on one particular source carries its
own link chip.

There is no build step, no server and no dependencies: clone the repo and double-click
`index.html`, and it behaves exactly as it would when hosted.

| | |
|---|---|
| `index.html` | The site: Glossary, Tables, Cheat sheet |
| `builder.html` | Cheat sheet builder — place blocks on pages by hand |
| `data/` | **Everything you would want to edit lives here** |
| `assets/` | Styling and behaviour |
| `dist/` | The same site squashed into one self-contained file, for emailing |
| `scripts/` | Importers and the bundler; not part of the site |

To refresh `dist/` after editing `data/`: `node scripts/bundle.mjs` (and
`node scripts/bundle.mjs builder.html`). Nothing else needs Node.

## Disciplines

**All / Connectomics / Physiology** sits under the view tabs and scopes everything below
it: which terms are in the glossary, which categories the legend offers, which datasets
the Tables view lists, and what the cheat sheet prints. A term inherits its discipline
from its category, unless it declares its own — cell types belong to `both`, because a
basket cell is the same cell however it was recorded.

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
- **Physiology** has no queryable database. A cache hands you manifest tables, or you
  open an NWB file and read objects at known paths — so each entry carries the
  **`access` expression** that gets you the object instead of a row count. Groups: find,
  cells & units, quality, activity, stimulus, behavior, analysis.

The dataset control applies here, and lists the datasets of the active discipline.

**Cheat sheet** — a printable sheet generated from whatever the dataset, search and sort
controls are set to. It flows across as many US Letter pages as the content needs and
never splits an entry across a page break. Print or save to PDF from the button, or just
press ⌘P / Ctrl+P from any view.

**Community** is not a view — it opens the [Allen Brain Map community forum](https://community.brain-map.org/)
in a new tab. The URL lives in `data/config.js` under `SITE.community`; clear it and the tab
disappears.

The dataset control belongs to the Tables view, where choosing one is a real question.
The glossary always shows every term of the active discipline and marks the handful that
belong to one dataset with a chip. The cheat sheet has its own dataset selector, next to
its other print options, for the table section it includes.

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
