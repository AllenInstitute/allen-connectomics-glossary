# Allen Connectomics Glossary

### → [lappalainenj.github.io/allen-connectomics-glossary](https://lappalainenj.github.io/allen-connectomics-glossary/)

A searchable glossary and table reference for the two EM connectomics datasets used in
the course — **MICrONS** and **V1DD** — plus a printable cheat sheet built from the same
content. Definitions follow the [SWDB databook](https://allenswdb.github.io/anatomy/microns-em/em-background.html).

The live site above is the easiest way in. It is served by GitHub Pages from `main`, so
anything merged is live within a minute or so. There is no build step, no server and no
dependencies, which also means you can clone the repo and double-click `index.html` —
it behaves identically offline.

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
Entries read left to right along each row. Search matches names, definitions and
category names; the category legend doubles as a filter, and clicking pills narrows the
glossary in either ordering. Every term has a permalink (`index.html#term-voxel`) you
can paste into an email.

The illustrations are generated rather than hand-drawn. They are under review, and
errors cannot be ruled out at this stage — the site says so next to the legend and in
the footer, and the note is repeated on the printed sheet.

**Tables** — the CAVE annotation tables we suggest people actually query, one overview
per dataset, with row counts, key columns and one-line descriptions. One colour-coded
column per kind of thing a table records, side by side, so the whole catalogue reads at
a glance, above a row of headline numbers for the dataset. The greyed entries at each
end are the underlying measurements and the products you assemble yourself; they are
shown for context and are not queryable tables.

The dataset control applies here.

**Cheat sheet** — a printable sheet generated from whatever the dataset, search and sort
controls are set to. It flows across as many US Letter pages as the content needs and
never splits an entry across a page break. Print or save to PDF from the button, or just
press ⌘P / Ctrl+P from any view.

**Community** is not a view — it opens the [Allen Brain Map community forum](https://community.brain-map.org/)
in a new tab. The URL lives in `data/config.js` under `SITE.community`; clear it and the tab
disappears.

The dataset control (All / MICrONS / V1DD) belongs to the Tables view, where choosing
one is a real question. The glossary always shows every term and marks the handful that
belong to one dataset with a chip. The cheat sheet has its own dataset selector, next to
its other print options, for the table section it includes.

## Colour means one thing at a time

Each palette has one meaning, one place it appears, and a legend where it appears:

- **Glossary cards: colour = the term's category.** Left rule and eyebrow, nowhere else.
- **Table overview: colour = what the table records.** Lane headers and node rules,
  nowhere else. The lane headings are their own legend.
- **Illustrations: colour = anatomy** — structure, dendrite, axon, synapse.
- **Datasets are not colour-coded**, in any view.

The glossary and the table overview are separate views, so the first two palettes never
share a surface. The printed sheet is the one place both appear, and it carries both
legends. If you add a category or a table group, pick a hue distinguishable from its
own palette *and* from the four anatomy colours.

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
