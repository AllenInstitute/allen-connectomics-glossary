# Making changes

No build step and no toolchain. Edit a file in `data/`, reload `index.html`, done.

Each data file is JSON with one line of wrapper on top:

```js
window.TERMS = [
  {"id":"voxel","term":"Voxel","category":"volume","def":"…"},
  …
];
```

Leave the `window.X = ` line and the closing `];` alone. Everything between them is
ordinary JSON — same rules: double quotes, commas between entries, no trailing comma
after the last one. If the page comes up blank, that is almost always a missing comma;
open the browser console (⌥⌘I / F12) and it will name the line.

## What to edit for what

### Fix or reword a definition
`data/terms.js`, the `def` field. Inline `<code>…</code>` is allowed and is how
identifiers are marked up. So is `&amp;` for a literal ampersand.

### Add a term
Add an object to `data/terms.js`:

```js
{"id":"my-term", "term":"My term", "category":"tables",
 "def":"One or two sentences. Mark identifiers with <code>like_this</code>.",
 "ng":{}}
```

- `id` — lowercase, hyphens, unique. It becomes the permalink (`index.html#term-my-term`).
- `category` — one of the ids in `data/config.js`.
- `datasets` — **omit it** if the term applies to both. Add `"datasets":["v1dd"]` only
  when a term is genuinely specific to one.
- `flags` — `"ambiguous"` marks a word that means different things in different places
  (it gets a ⚠). `"context"` marks background that is not really databook material.
- `ng` — see below.
- Order does not matter; the site sorts.

### Add a Neuroglancer link
Put the URL in a term's `ng` object, keyed by dataset:

```js
"ng": {"microns": "https://spelunker.cave-explorer.org/#!middleauth+…"}
```

It renders as a link chip on the card, labelled with the dataset. Tables work the same
way — `data/tables.js`, the `ng` field on a table, which takes a single URL string.
Dataset-wide viewer links live in `data/config.js` under each dataset's `ng`.

### Add, remove or re-describe a table
`data/tables.js`. Tables are listed per dataset under `window.TABLES`, each with a
`group` from `window.TABLE_GROUPS`. Groups describe **what a table records** — they are
not stages and imply no ordering, so please do not add one that reads as a pipeline
step. Row counts are copy-and-paste from the databook's *CAVE Annotation Tables* page.

### Add an R version of a recipe
`data/snippets.js`. Each snippet already has a `python` key; add an `r` key next to it:

```js
{ id:"setup", title:"Connect to a datastack",
  python: `…`,
  r: `…` },
```

The R tab on that block stops being greyed out. Nothing else needs to change. To add a
third language, add it to `window.LANGUAGES` too.

### Change a category or its colour
`data/config.js`, `window.CATEGORIES`. Pick a hue distinguishable from the other eleven
**and** from the four anatomy colours in `window.ANATOMY` — the site's one colour rule is
that category hues never appear inside an illustration and vice versa. See the README.

### Change or add an illustration
`data/diagrams.js` maps a term `id` to an inline SVG string. They are hand-drawn on a
`0 0 320 200` viewBox and use `currentColor` plus the anatomy variables
(`var(--neuron)`, `var(--axon)`, `var(--dendrite)`, `var(--synapse)`, `var(--scaffold)`)
so they work in light and dark and on paper. Add `"diagram":"<term-id>"` to the term to
turn it on.

### Change the wording of a heading, or the revision stamp
`data/config.js`, `window.SITE`. Bump `revision` when you make a change worth flagging
to readers — it is printed on the cheat sheet.

## Checking your change

Reload the page and look at it. Beyond that:

- Search for the term you touched; make sure it appears where you expect.
- Switch the dataset control to MICrONS and to V1DD.
- Open the Cheat sheet view and print to PDF — that is where a too-long definition
  shows up as an awkward column.
- Try the dark theme (the ◐ button), since illustrations are drawn for both.

## `scripts/`

`extract.mjs` and `build-terms.mjs` were used once, to lift the content out of the
original single-file draft into `data/`. They are kept for provenance. **Do not re-run
them** — they would overwrite `data/terms.js` and throw away everything edited since.
