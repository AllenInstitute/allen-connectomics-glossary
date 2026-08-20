# Issue audit — AllenInstitute/allen-glossary, August 2026

Six open issues, five of them from @saskiad on 18 Aug and one from @bdpedigo.
Every card named below has been checked against `data/terms.js` as it stands
(265 terms). Tick what you want applied.

**Note first:** the repository was renamed to `AllenInstitute/allen-glossary`
and the site moved to `alleninstitute.github.io/allen-glossary/`. `SITE.repo`
in `data/config.js` still says `allen-connectomics-glossary`, and so does the
`origin` remote. Both work today only because GitHub redirects. One-line fix,
not applied yet — say the word.

---

## The one that matters: #6

> I think there's an awkward conflation of background and glossary here that
> I think in the long run is going to make it harder for people to find what
> they need.

This is correct, and it is measurable rather than a matter of taste. Four of
the cards on the removal list — **stimulus epoch table**, **trials table**,
**stimulus presentation table**, **channels table** — describe NWB objects
that the Tables view *already documents by path*:

| glossary card | the Tables view already carries |
|---|---|
| Stimulus epoch table | `intervals/epochs`, `stimulus/presentation/epochs` |
| Trials table | `intervals/trials`, `stimulus/presentation/Trials` |
| Stimulus presentations table | `intervals/stimulus_table`, `stimulus/presentation` |
| Channels table | `general/extracellular_ephys/electrodes` |

So a reader meets the same object twice, described two different ways, and has
to work out that they are the same thing. **NWB layout** is the sharpest case:
that card is a prose restatement of the Tables page's own opening paragraph.

The rule I would adopt from this, and apply beyond the listed items:

> A card earns its place if it names something you would **look up**. Something
> you would **read about** is background. Anything identified by an NWB path is
> a table, and belongs in the Tables view.

That rule shrinks `dataorg` from 26 cards to about 10 and makes the category
mean something again. It is currently the dumping ground where both kinds live.

---

## Per item

### #2 — Remove **Allen SDK**
> We are no longer using the AllenSDK and don't want people trying to use it.

**Agree, and it reaches further than one card.** The glossary currently
contradicts itself: `data/config.js` already says the SDK caches are
"deliberately not represented: they are being retired in favour of reading NWB
directly", while three cards still teach the SDK workflow.

- [ ] Remove `allensdk`
- [ ] Remove `project-cache` — SDK entry point; also on the #6 list
- [ ] Remove `manifest` — "the file a cache uses"; meaningless without the cache. Also on the #6 list
- [ ] Reword `default-filters` — the content is real (Visual Coding filters by default, VB Neuropixels does not) but it is framed as "Same SDK, opposite defaults". Keep the fact, drop the SDK framing

### #5 — Remove **NP 1.0 / 2.0 / Ultra / Opto**
> This isn't a glossary thing. Neuropixels is and has a separate card.

**Agree.** It is a spec table, not a term. `neuropixels` covers the term, and
the 6 µm Ultra pitch is already stated in the NP Ultra dataset blurb where it
is load-bearing.

- [ ] Remove `np-generations`

### #3 — **Session** is not ambiguous
> All of the uses use it in the same way. The fact that there is often a
> modifier to indicate what type of session does not imply that "session"
> means something different.

**Agree.** A modifier narrowing a term is not the term being overloaded — that
is the test, and `session` passes it where `experiment` does not.

- [ ] Drop the `ambiguous` flag from `session`
- [ ] Drop its four senses; keep the databook definition and its source link
- [ ] **Follows by the same logic, beyond what was asked:** if `session` always
      means one thing, then `behavior-session` and `ophys-session` are just
      sessions with a modifier and do not need cards either. @saskiad listed
      only `behavior session`; I would remove both for consistency, and keep
      `ophys-experiment`, because *experiment* genuinely does shift meaning

### #4 — **Experiment**
> Given that the term experiment is overloaded, I recommend not using it in the
> definition of other terms. Which of the different meanings applies?

Filed as "Add a card" with the name `asdf`, so read it as a comment on the
existing card. The card itself should stay — it documents the overloading. The
actionable part is the sweep. Three definitions use the word loosely:

- [ ] `imaging-plane` — "what an ophys experiment is defined on" → say *one imaging plane in one session*
- [ ] `field-of-view` — "Recorded per experiment" → say *per imaging plane*
- [ ] `cell-specimen-vs-roi-id` — "within one experiment" → moot if the card goes (see below)

### #6 — the list
Remaining items, with my read on each:

**Remove — agree, no reservation**

- [ ] `stimulus-epoch-table` · `trials-table` · `stimulus-presentations` · `channels-table` — duplicated by Tables, see above
- [ ] `nwb-layout` — restates the Tables page intro
- [ ] `retake` — a Visual Behavior QC procedure, not a term
- [ ] `motion-correction` — background method
- [ ] `kilosort` — a proper noun and a background method

**Remove, but check the consequence**

- [ ] `distance` — @saskiad is right that modifiers disambiguate it. The card is
      also redundant: `distance-to-root` and `isolation-distance` already exist
      as their own cards. What is lost is the warning that Euclidean, radial and
      geodesic give different answers across layers, plus the pointer to
      `standard_transform.radial_distance` — that part is connectomics, so it is
      worth @ceesem's view. Suggest removing the card and, if wanted, adding
      `radial-distance` to morphology
- [ ] `cell-specimen-vs-roi-id` — written as a comparison essay, which is the
      background style being objected to. But the failure it warns about
      (joining on the wrong id and silently losing the across-day link) is real.
      Suggest removing the card; optionally add `cell_specimen_id` as a plain term

**Where I would push back, gently**

- [ ] `event-detection` — proposed keep, narrowed. `events` is an array people
      actually open in the file, next to `dff`; they need to know what it holds.
      Cut the L0-method background, keep one line on what the array is
- [ ] `eye-tracking` — same shape of argument: it is a data stream in
      `processing/behavior`, not just a technique. Cut to what the fields are

**Consistency items not on the list** — flagged because the rule above catches
them too, not because anyone asked:

- [ ] `units-table` — same duplication as the other four table cards
- [ ] `container` / `ophys-container` — same family as the session modifiers

### #1 — @bdpedigo, minor suggestions [WIP]

- [ ] Move `synapse_target_predictions_ssa` from `detection` to `classification`
      — it appears twice in `data/tables.js` (MICrONS, 204,331,842 rows; V1DD,
      165,533,529). Note this table is superseded by `_v2`, which is worth
      resolving at the same time
- [ ] Prune the MICrONS cell-type tables — **needs @ceesem**; there are 7 under
      `classification` and no way for me to tell which are current
- [ ] Add an **annotation DB** card (@lappalainenj's comment)

---

## Suggested order of work

1. **The removals** — one commit, roughly 15 cards. Mechanical, low risk, and it
   is what delivers the #6 point. Count drops 265 → ~250.
2. **`session` and the experiment sweep** — small edits, needs care with wording.
3. **The two narrowings** (`event-detection`, `eye-tracking`) — only if you agree
   with the push-back; otherwise fold into step 1 as removals.
4. **`data/tables.js`** — the `ssa` move, which is independent of everything above.
5. **Blocked on @ceesem** — the MICrONS cell-type prune, and the radial-distance
   question.

Worth replying on the issues as they are applied, since @saskiad flagged there
is more to come and it would help to know the rule being applied.
