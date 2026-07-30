# Allen Connectomics Glossary

A searchable glossary and table reference for the two EM connectomics datasets used in
the course — **MICrONS** and **V1DD** — plus a printable cheat sheet built from the same
content. Definitions follow the [SWDB databook](https://allenswdb.github.io/anatomy/microns-em/em-background.html).

**Open `index.html` in a browser.** There is no build step, no server, and no
dependencies — double-clicking the file works, and so does GitHub Pages.

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

## The three views

**Glossary** — 116 terms, alphabetical by default, switchable to grouping by category.
Search matches names, definitions and category names. Every term has a permalink
(`index.html#term-voxel`) you can paste into an email.

**Tables** — the CAVE annotation tables we suggest people actually query, one catalogue
per dataset, with row counts, key columns and one-line descriptions. Tables are grouped
by *what they record*. The groups are a finding aid: nothing in them is upstream or
downstream of anything else, and there are no arrows, because the real dependency
structure is not a line.

**Cheat sheet** — a printable sheet generated from whatever the dataset, search and sort
controls are set to. It flows across as many US Letter pages as the content needs and
never splits an entry across a page break. Print or save to PDF from the button, or just
press ⌘P / Ctrl+P from any view.

The dataset control (Both / MICrONS / V1DD) applies everywhere. Terms that only make
sense for one dataset are labelled and filtered; the rest are shared.

## Colour means one thing at a time

This was a specific piece of feedback on the earlier draft, so it is worth stating as a
rule the code follows:

- **The colour on a glossary card's left edge and its eyebrow label = its category.**
  That is the only place category hues appear.
- **Colour inside an illustration = anatomy** — structure, dendrite, axon, synapse.
  A separate, deliberately different family of hues. Both legends are on the page.
- **Table groups and datasets are not colour-coded at all.** They are distinguished by
  position and heading, so no palette does double duty.

If you add a category, pick a hue that is distinguishable from the eleven others *and*
from the four anatomy colours.

## Making changes

Everything readers see comes from four files in `data/`. They are plain JSON with a
one-line `window.X =` wrapper so they still load when the page is opened straight off
disk. Edit the data, reload the page.

See [CONTRIBUTING.md](CONTRIBUTING.md) for exactly what to edit for a given change —
fixing a definition, adding a term, adding a Neuroglancer link, adding an R snippet.

## Still to do

- **Neuroglancer links per term.** Every term and every table has an `ng` field, empty
  for now; anything filled in renders as a link. Dataset-level viewer links are already
  wired up on the Tables page.
- **R alongside Python.** The recipe blocks are keyed by language and the R tab is
  already there, disabled. Adding an `r:` key to a snippet in `data/snippets.js` lights
  it up — no code change needed.
- **Illustrations.** 81 of 116 terms have one.
