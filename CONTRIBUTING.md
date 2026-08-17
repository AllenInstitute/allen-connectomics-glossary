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
after the last one. `/* … */` section comments between entries are fine; nothing else. If the page comes up blank, that is almost always a missing comma;
open the browser console (⌥⌘I / F12) and it will name the line.

## What to edit for what

### Say general things generally

The glossary is grounded in the Allen datasets but is not only about them. So:

- A term that would appear in any neuroscience textbook — *astrocyte*, *dendritic spine*,
  *action potential*, *chandelier cell* — is defined **without naming a dataset, a table
  or a pipeline**. Someone arriving from another lab should be able to use it.
- A term that only exists because of this data — `pcg_skel`, *multifeature cell types*,
  `distance_to_root` — is named as such, and should be. Pretending it is general is worse
  than admitting it is specific.
- The test is not where you first met the word, but whether the definition would still be
  true and useful somewhere else. "Sixty were proofread in the V1 column" is a fact about
  a dataset, not about microglia.
- Where a general term also has a local convention, that belongs in `senses` or on the
  specific term, not smuggled into the general definition.

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
- `category` — one of the ids in `data/config.js`. The category decides the term's
  discipline, and so which of All / Connectomics / Physiology it appears under.
- `discipline` — **omit it** unless the category's default is wrong for this one term.
  `"both"` shows it under either discipline.
- `datasets` — **omit it** unless the term is genuinely specific to one. A general term
  should carry no dataset at all. Add `"datasets":["v1dd"]` only
  when a term is genuinely specific to one.
- `flags` — `"ambiguous"` marks a word that means different things in different places
  (it gets a ⚠). `"context"` marks an adjacent technique that these datasets do not
  themselves use, listed so the contrast is clear.
- `source` — optional `{"label":"…","url":"…"}`, rendered as a small link chip. Use it
  when a definition leans on one particular reference. Cite in this field, never in the
  prose: a definition should read as a definition, not as a note about a document.
- `ng` — see below.
- Order does not matter; the site sorts.

### Add a term that means several different things
Give it a `senses` array instead of a paragraph that tries to cover every meaning:

```js
{"id":"epoch", "term":"Epoch", "category":"dataorg", "flags":["ambiguous"],
 "def":"A labelled stretch of time — but of what, and on whose clock, differs.",
 "senses":[
   {"sense":"A block during which one stimulus type was shown",
    "where":"stimulus epoch table; <code>nwb.epochs</code>"},
   {"sense":"One pass of a training set", "where":"machine learning"}],
 "ng":{}}
```

`sense` is what it means, `where` is where you will meet that meaning. Both accept
inline `<code>`. They render as a short disambiguation list on the card and on the
printed sheet.

### Add a Neuroglancer link
Put the URL in a term's `ng` object, keyed by dataset:

```js
"ng": {"microns": "https://spelunker.cave-explorer.org/#!middleauth+…"}
```

It renders as a link chip on the card, labelled with the dataset. Tables work the same
way — `data/tables.js`, the `ng` field on a table, which takes a single URL string.
Dataset-wide viewer links live in `data/config.js` under each dataset's `ng`.

### Add, remove or re-describe a table
`data/tables.js`. Entries are listed per dataset under `window.TABLES`, each with a
`group` from `window.TABLE_GROUPS[<discipline>]` — the two disciplines have separate
group lists and separate colours.

A connectomics entry carries `rows` (a row count). A physiology entry carries `access`
instead: the expression that gets you the object, such as `session.units` or
`nwb.intervals['trials']`. Physiology data is not a queryable database, so a row count
would be per session and meaningless here.

Groups describe **what an entry records** and each becomes one colour-coded column in
the overview. They imply no ordering, so please do not add one that reads as a pipeline
step. Row counts are copy-and-paste from the dataset's published table listing.

Set `"derived": true` on an entry that is not something you can query — the raw
measurements and the things you assemble yourself. It renders greyed and dashed, and is
left out of the table count.

Group blurbs are read in the printed sheet as well as on screen, where the lanes may
wrap. Do not describe a group by where it sits on the page.

### Add an R version of a recipe
`data/snippets.js`. Each snippet already has a `python` key; add an `r` key next to it:

```js
{ id:"setup", title:"Connect to a datastack",
  python: `…`,
  r: `…` },
```

The R tab on that block stops being greyed out. Nothing else needs to change. To add a
third language, add it to `window.LANGUAGES` too.

### Add a dataset
`data/config.js`, `window.DATASETS`. Give it a `discipline`, a label and a blurb. A
connectomics dataset describes itself with `datastack` / `version` / `resolution` /
`server`; a physiology dataset with `access` / `backend`, plus a `stats` array of
headline numbers, since those cannot be derived from a catalogue. Then add its
catalogue to `window.TABLES` under the same id. The dataset pills build themselves.

### Change a category or a colour
Glossary categories live in `data/config.js` under `window.CATEGORIES`; table-group
colours live in `data/tables.js` under `window.TABLE_GROUPS`, per discipline. Pick a hue distinguishable
from the others in its own palette **and** from the four anatomy colours in
`window.ANATOMY`. The site's colour rule — one palette, one meaning, one place — is
spelled out in the README; please keep it true.

### Change or add an illustration
`data/diagrams.js` maps a term `id` to an inline SVG string. They are hand-drawn on a
`0 0 320 200` viewBox and use `currentColor` plus the anatomy variables
(`var(--neuron)`, `var(--axon)`, `var(--dendrite)`, `var(--synapse)`, `var(--scaffold)`)
so they work in light and dark and on paper. Add `"diagram":"<term-id>"` to the term to
turn it on.

### Change the wording of a heading, or the revision stamp
`data/config.js`, `window.SITE`. Bump `revision` when you make a change worth flagging
to readers — it is printed on the cheat sheet. `references` is the further-reading list
in the footer; add to it rather than naming a source inside a definition.

## Checking your change

Reload the page and look at it. Beyond that:

- Search for the term you touched; make sure it appears where you expect.
- Switch the discipline control through All, Connectomics and Physiology.
- Switch the dataset control across a few datasets.
- Open the Cheat sheet view and print to PDF — that is where a too-long definition
  shows up as an awkward column.
- Try the dark theme (the ◐ button), since illustrations are drawn for both.

## `scripts/`

`extract.mjs` and `build-terms.mjs` were used once, to lift the content out of the
original single-file draft into `data/`. They are kept for provenance. **Do not re-run
them** — they would overwrite `data/terms.js` and throw away everything edited since.
