/* Allen Glossary — all behaviour.
   No build step, no dependencies. Data comes from the files in data/. */
(() => {
"use strict";

const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

const CATS   = window.CATEGORIES;
const CAT    = Object.fromEntries(CATS.map(c => [c.id, c]));
const TERMS  = window.TERMS;
const DS     = window.DATASETS;
const DIAG   = window.DIAGRAMS || {};
const GROUPS = window.TABLE_GROUPS;   // keyed by discipline
const TBL    = window.TABLES;         // keyed by dataset id
const SNIPS  = window.SNIPPETS;
const LANGS  = window.LANGUAGES;
const DISCS  = window.DISCIPLINES;

const STORE = "acg.v1";
const S = Object.assign(
  // `disc` is the top-level lens and scopes every view. `ds` scopes the table
  // catalogue only; the glossary always shows every term of the active
  // discipline and flags the few that belong to one dataset.
  { view: "glossary", disc: "all", ds: "all", sort: "alpha", q: "", cats: [],
    theme: "auto", lang: "python",
    art: true, tables: true, snips: true, dens: "normal", sheetDs: "all" },
  readStore()
);
// cats: the categories the legend pills have narrowed to. Empty means all of them.

/* ── discipline ──────────────────────────────────────────────────
   A term inherits its discipline from its category unless it names its own.
   "both" always passes: a cell type is the same cell however it was recorded. */
const discOf   = t => t.discipline || (CAT[t.category] && CAT[t.category].discipline) || "both";
const inDisc   = (d, want) => want === "all" || d === "both" || d === want;
const activeDiscs = () => S.disc === "all" ? DISCS.map(d => d.id) : [S.disc];
const visibleCats = () => CATS.filter(c => inDisc(c.discipline, S.disc));
// dataset ids in view, in declaration order, honouring both filters
const visibleDatasets = () => Object.keys(DS).filter(id =>
  inDisc(DS[id].discipline, S.disc) && (S.ds === "all" || S.ds === id));
const groupsFor = dsId => GROUPS[DS[dsId].discipline];

function readStore(){ try { return JSON.parse(localStorage.getItem(STORE)) || {}; } catch { return {}; } }
function save(){ try { localStorage.setItem(STORE, JSON.stringify(S)); } catch {} }

/* ── helpers ─────────────────────────────────────────────────── */

const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const strip = s => String(s).replace(/<[^>]+>/g, "");

// highlight query matches in a string that may already contain markup,
// touching only the text between tags
function hl(html, q){
  if (!q) return html;
  const rx = new RegExp("(" + q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + ")", "ig");
  return String(html).split(/(<[^>]+>)/).map(part =>
    part.startsWith("<") ? part : part.replace(rx, "<mark>$1</mark>")).join("");
}

function matches(t, q){
  if (!q) return true;
  const senses = (t.senses || []).map(s => strip(s.sense) + " " + strip(s.where)).join(" ");
  const hay = (t.term + " " + strip(t.def) + " " + senses + " " + CAT[t.category].label + " " +
               (t.tables || []).join(" ")).toLowerCase();
  return hay.includes(q);
}

// everything the discipline filter lets through, before search or category pills
function discTerms(){ return TERMS.filter(t => inDisc(discOf(t), S.disc)); }

function visibleTerms(){
  const q = S.q.trim().toLowerCase();
  const cats = S.cats && S.cats.length ? new Set(S.cats) : null;
  return discTerms().filter(t => matches(t, q) && (!cats || cats.has(t.category)));
}

// how many terms each category would contribute, ignoring the category filter
// itself, so the pill counts do not collapse to zero as you narrow
function catCounts(){
  const q = S.q.trim().toLowerCase();
  const n = {};
  discTerms().filter(t => matches(t, q)).forEach(t => { n[t.category] = (n[t.category] || 0) + 1; });
  return n;
}

// crude but stable Python/R colouring: comments, strings, keywords
function code(src){
  const KW = /\b(from|import|as|def|return|if|else|elif|for|in|not|None|True|False|library|function)\b/g;
  return esc(src)
    .replace(/(&quot;.*?&quot;|&#39;.*?&#39;|"[^"\n]*"|'[^'\n]*')/g, '<span class="s">$1</span>')
    .replace(/(^|\n)(\s*)(#[^\n]*)/g, '$1$2<span class="c">$3</span>')
    .replace(KW, '<span class="k">$&</span>');
}

/* ── glossary ────────────────────────────────────────────────── */

function cardHTML(t, q){
  const c = CAT[t.category];
  const svg = t.diagram ? DIAG[t.diagram] : null;
  const ds  = t.datasets && t.datasets.length && t.datasets.length < 2
    ? `<span class="chip ds">${DS[t.datasets[0]].label} only</span>` : "";
  const amb = (t.flags || []).includes("ambiguous")
    ? `<span class="chip warn" title="This word means different things in different places">⚠ ambiguous</span>` : "";
  const ctx = (t.flags || []).includes("context")
    ? `<span class="chip aside" title="An adjacent method, not used to acquire these datasets">adjacent method</span>` : "";
  const src = t.source && t.source.url
    ? `<a class="chip src" href="${esc(t.source.url)}" target="_blank" rel="noopener">${esc(t.source.label)} ↗</a>` : "";
  const ng  = Object.entries(t.ng || {})
    .filter(([, url]) => url)
    .map(([k, url]) => `<a class="chip ng" href="${esc(url)}" target="_blank" rel="noopener">${DS[k] ? DS[k].label : esc(k)} ↗</a>`)
    .join("");
  const refs = (t.tables || []).length
    ? `<div class="refs">${t.tables.map(n => `<a href="#" data-goto-table="${esc(n)}">${esc(n)}</a>`).join("")}</div>` : "";
  // a word with several incompatible meanings gets them listed rather than
  // squeezed into one paragraph
  const senses = (t.senses || []).length
    ? `<ul class="senses">${t.senses.map(s =>
        `<li><b>${hl(s.sense, q)}</b><span>${s.where}</span></li>`).join("")}</ul>` : "";
  const meta = ds + amb + ctx + ng + src;
  return `<article class="card" style="border-left-color:${c.color}" id="term-${t.id}">
    ${svg ? `<div class="art">${svg}</div>` : ""}
    <div class="eb" style="color:${c.color}">${c.short}</div>
    <h3><a class="perma" href="#term-${t.id}" title="Link to this term">${hl(esc(t.term), q)}</a></h3>
    <p>${hl(t.def, q)}</p>
    ${senses}
    ${meta ? `<div class="meta">${meta}</div>` : ""}
    ${refs}
  </article>`;
}

function renderGlossary(){
  const q = S.q.trim().toLowerCase();
  const list = visibleTerms();
  const out = $("#glossary");

  const byName = (a, b) => a.term.toLowerCase().localeCompare(b.term.toLowerCase());

  // an empty result still has to refresh the legend and the count, or they keep
  // describing the previous search
  $("#glossEmpty").hidden = !!list.length;

  if (!list.length){
    out.innerHTML = "";
  } else if (S.sort === "alpha"){
    out.className = "grid";
    out.innerHTML = [...list].sort(byName).map(t => cardHTML(t, q)).join("");
  } else {
    // each category becomes its own titled section with its own grid, so the
    // grouping is unmistakable rather than implied by a thin rule
    out.className = "";
    out.innerHTML = visibleCats().map(c => {
      const items = list.filter(t => t.category === c.id).sort(byName);
      if (!items.length) return "";
      return `<section class="catsec">
        <div class="sec-head" style="color:${c.color}">
          <i class="dot"></i><h2>${esc(c.label)}</h2><span class="n">${items.length}</span>
        </div>
        <div class="grid">${items.map(t => cardHTML(t, q)).join("")}</div>
      </section>`;
    }).join("");
  }

  const total = discTerms().length;
  const filtered = S.q.trim() || (S.cats && S.cats.length);
  $("#count").textContent = filtered
    ? `${list.length} of ${total} terms` : `${total} terms`;
  renderCatPills();
}

function renderCatPills(){
  const n = catCounts();
  const on = new Set(S.cats || []);
  $("#catLegend").innerHTML = visibleCats().map(c =>
    `<button class="catpill" data-cat="${c.id}" style="--cc:${c.color}"
             aria-pressed="${on.has(c.id)}"><i></i>${esc(c.label)}
       <span class="n">${n[c.id] || 0}</span></button>`).join("")
    + (on.size ? `<button class="catclear" type="button">show all</button>` : "");
}

function renderLegends(){
  renderCatPills();
  $("#anatLegend").innerHTML = window.ANATOMY.map(a =>
    `<span><i style="background:var(--${a.id})"></i>${esc(a.label)}</span>`).join("");
}

/* ── tables ──────────────────────────────────────────────────── */

function tableRows(dsId){
  const q = S.q.trim().toLowerCase();
  return TBL[dsId].filter(t => !q ||
    (t.name + " " + t.desc + " " + (t.keys || []).join(" ")).toLowerCase().includes(q));
}

/* Headline numbers, read straight off the catalogue so they cannot drift out of
   step with it. Anything the catalogue does not carry is simply left out. */
const num = s => { const n = +String(s).replace(/[^0-9]/g, ""); return Number.isFinite(n) && n ? n : null; };
const compact = n =>
  n >= 1e9 ? [(n / 1e9).toFixed(n < 1e10 ? 1 : 0), "B"] :
  n >= 1e6 ? [(n / 1e6).toFixed(n < 1e7 ? 1 : 0), "M"] :
  n >= 1e3 ? [(n / 1e3).toFixed(n < 1e4 ? 1 : 0), "k"] : [String(n), ""];

function datasetStats(dsId){
  const all = TBL[dsId];

  // Physiology counts are per session, not per dataset, so there is nothing to
  // read off the catalogue. Those datasets state their own headline numbers.
  if (DS[dsId].stats){
    const out = [{ v: String(all.filter(t => !t.derived).length), u: "", l: "objects" }]
      .concat(DS[dsId].stats);
    return statCard(out);
  }

  const find = name => all.find(t => t.name === name);
  const biggest = group => all.filter(t => t.group === group && num(t.rows))
    .sort((a, b) => num(b.rows) - num(a.rows))[0];

  const syn   = find(DS[dsId].synapses);
  const nuc   = find("nucleus_detection_v0");
  const proof = find("proofreading_status_and_strategy");
  const coreg = biggest("coregistration");
  const types = biggest("classification");

  const out = [
    { v: String(all.filter(t => !t.derived).length), u: "", l: "tables" },
    syn   && { n: num(syn.rows),   l: "synapses",        sub: syn.name },
    nuc   && { n: num(nuc.rows),   l: "nuclei detected", sub: nuc.name },
    types && { n: num(types.rows), l: "cells typed",     sub: types.name },
    proof && { n: num(proof.rows), l: "arbors proofread", sub: proof.name },
    coreg && { n: num(coreg.rows), l: "units coregistered", sub: coreg.name },
  ].filter(Boolean);

  return statCard(out);
}

function statCard(out){
  return `<div class="statcard">${out.map(s => {
    const [v, u] = s.n != null ? compact(s.n) : [s.v, s.u || ""];
    return `<div class="stat"><b>${esc(v)}${u ? `<span class="u">${u}</span>` : ""}</b>
      <span>${esc(s.l)}</span>${s.sub ? `<em>${esc(s.sub)}</em>` : ""}</div>`;
  }).join("")}</div>`;
}

/* One lane per group, colour-coded, laid out side by side. The lanes are a
   classification, not a sequence — there are deliberately no arrows between
   them and no claim that the left column comes before the right. */
function datasetBlock(dsId){
  const d = DS[dsId];
  const rows = tableRows(dsId);
  const q = S.q.trim().toLowerCase();

  const lanes = groupsFor(dsId).map(g => {
    const items = rows.filter(t => t.group === g.id);
    return `<div class="lane${items.length ? "" : " dim"}">
      <div class="lane-h" style="background:${g.color}">${esc(g.label)}</div>
      <p class="lane-b" title="${esc(g.blurb)}">${esc(g.blurb)}</p>
      ${items.map(t => `
        <div class="node${t.derived ? " derived" : ""}" style="border-left-color:${g.color}"
             id="tbl-${esc(dsId)}-${esc(t.name)}" data-table="${esc(t.name)}">
          <div class="n-name">${hl(esc(t.name), q)}</div>
          ${t.access && t.access !== "—"
              ? `<div class="n-access">${hl(esc(t.access), q)}</div>` : ""}
          <div class="n-keys">${t.rows && t.rows !== "—"
              ? `<b>${esc(t.rows)} rows</b>` : ""}${esc((t.keys || []).join(" · "))}</div>
          <p class="n-desc">${hl(esc(t.desc), q)}</p>
          ${t.ng ? `<a class="chip ng" href="${esc(t.ng)}" target="_blank" rel="noopener">Neuroglancer ↗</a>` : ""}
        </div>`).join("")}
    </div>`;
  }).join("");

  // connectomics datasets are described by their datastack, physiology ones by
  // how you open them — different facts, same row
  const facts = d.datastack
    ? [`datastack <b>${esc(d.datastack)}</b>`, `version <b>${esc(d.version)}</b>`,
       `voxel <b>${esc(d.resolution)}</b>`, `server <b>${esc(d.server)}</b>`,
       `<a href="${esc(d.ng)}" target="_blank" rel="noopener">open in Neuroglancer ↗</a>`]
    // for physiology the useful facts are how you open it and — so that any of
    // this can be checked — which asset was read to describe it
    : [`open with <b>${esc(d.access)}</b>`, `packaged as <b>${esc(d.backend)}</b>`]
        .concat(d.asset ? [`described from <b class="asset">${esc(d.asset)}</b>`] : [])
        .concat(d.ng ? [`<a href="${esc(d.ng)}" target="_blank" rel="noopener">open in Neuroglancer ↗</a>`] : []);

  return `<section class="dsblock">
    <header>
      <h2>${esc(d.label)}</h2>
      <div class="facts">${facts.map(f => `<span>${f}</span>`).join("")}</div>
    </header>
    <p class="blurb">${esc(d.blurb)}</p>
    ${datasetStats(dsId)}
    ${rows.length ? `<div class="lanes">${lanes}</div>`
                  : `<p class="empty">No tables match that search.</p>`}
  </section>`;
}

function renderTables(){
  const ids = visibleDatasets();
  const intro = S.disc === "physiology"
    ? `Physiology data is not a queryable database — it is an NWB file, and every file has the same
       top-level groups whatever the experiment was. The columns below are those groups; what differs
       between datasets is what fills them. Each entry names the path that gets you the object, and
       every dataset names the asset its structure was read from.`
    : `Each column collects the tables that record one kind of thing. Greyed entries are the underlying
       measurements and the products you assemble yourself; the rest are CAVE tables you can query.`;
  $("#tablesOut").innerHTML =
    `<h2 class="sec-h">Tables at a glance</h2><p class="sec-p">${intro}</p>`
    + (ids.length ? ids.map(datasetBlock).join("")
                  : `<p class="empty">No datasets in this discipline.</p>`);
  renderSnips();
  const nEntries = ids.reduce((n, i) => n + tableRows(i).filter(t => !t.derived).length, 0);
  $("#count").textContent = ids.length
    ? `${nEntries} ${nEntries === 1 ? "entry" : "entries"} · ${ids.length} ${ids.length === 1 ? "dataset" : "datasets"}`
    : "no datasets";
}

// a snippet with no `disc` belongs to every discipline
const visibleSnips = () => SNIPS.filter(s => inDisc(s.disc || "both", S.disc));

function renderSnips(){
  $("#snips").innerHTML = visibleSnips().map(s => {
    const have = LANGS.filter(l => s[l.id]);
    const lang = s[S.lang] ? S.lang : (have[0] && have[0].id);
    const body = s[lang]
      ? `<pre>${code(s[lang])}</pre>`
      : `<p class="soon">Not written for this language yet.</p>`;
    return `<article class="snip" data-snip="${esc(s.id)}">
      <header><h3>${esc(s.title)}</h3>
        <div class="langs">${LANGS.map(l =>
          `<button data-lang="${l.id}" aria-pressed="${l.id === lang}" ${s[l.id] ? "" : "disabled title='Not written yet'"}>${esc(l.label)}</button>`
        ).join("")}</div>
      </header>${body}</article>`;
  }).join("");
}

/* ── cheat sheet ─────────────────────────────────────────────── */

function renderSheet(){
  const list = [...visibleTerms()].sort((a, b) => a.term.toLowerCase().localeCompare(b.term.toLowerCase()));
  const byCat = S.sort === "category";
  const dsIds = Object.keys(DS).filter(id =>
    inDisc(DS[id].discipline, S.disc) && (S.sheetDs === "all" || S.sheetDs === id));
  const scope = S.disc === "all"
    ? DISCS.map(d => d.label).join(" & ")
    : DISCS.find(d => d.id === S.disc).label;

  const glossBody = byCat
    ? visibleCats().map(c => {
        const items = list.filter(t => t.category === c.id);
        if (!items.length) return "";
        return `<div class="sh-cat" style="color:${c.color}">${esc(c.label)}</div>` + items.map(g => sheetTerm(g)).join("");
      }).join("")
    : list.map(t => sheetTerm(t)).join("");

  // One section per discipline, each under its own heading with its own group
  // legend directly above it — the two group palettes must never be read
  // against a single shared key.
  const tablesBody = !S.tables ? "" : activeDiscs().map(dId => {
    const ids = dsIds.filter(id => DS[id].discipline === dId);
    if (!ids.length) return "";
    const gs = GROUPS[dId];
    return `<h2 class="sh-s">Tables at a glance · ${esc(DISCS.find(d => d.id === dId).label)}</h2>` +
      `<div class="sh-leg"><b>Records</b>${gs.map(g =>
        `<span><i style="background:${g.color}"></i>${esc(g.label)}</span>`).join("")}</div>` +
      ids.map(id => `<div class="sh-ds">${esc(DS[id].label)}</div><div class="sh-lanes">` +
        gs.map(g => {
          const items = TBL[id].filter(t => t.group === g.id);
          if (!items.length) return "";
          return `<div class="sh-lane"><div class="sh-lh" style="background:${g.color}">${esc(g.label)}</div>` +
            items.map(t =>
              `<div class="sh-t${t.derived ? " derived" : ""}" style="border-left-color:${g.color}">
                 <div class="n">${esc(t.name)}</div>
                 <div class="k">${esc((t.keys || []).slice(0, 4).join(" · "))}${
                   t.rows && t.rows !== "—" ? " · " + esc(t.rows) : ""}</div></div>`).join("") +
            `</div>`;
        }).join("") + `</div>`).join("");
  }).join("");

  const snipsBody = !S.snips ? "" :
    `<h2 class="sh-s">Recipes</h2><div class="sh-snips">` +
    visibleSnips().filter(s => s[S.lang] || s.python).map(s =>
      `<pre class="sh-p"><b>${esc(s.title)}</b>${code(s[S.lang] || s.python)}</pre>`).join("") +
    `</div>`;

  $("#sheet").innerHTML = `
    <div class="sh-head">
      <h1>${esc(window.SITE.title)}</h1>
      <div class="sub"><b>${esc(scope)}</b><br>${esc(window.SITE.revision)}</div>
    </div>
    <div class="sh-leg"><b>Category</b>${visibleCats().map(c => `<span><i style="background:${c.color}"></i>${esc(c.short)}</span>`).join("")}</div>
    <h2 class="sh-s">Glossary · ${list.length} terms · ${byCat ? "grouped by category" : "A to Z"}${S.q ? " · matching “" + esc(S.q) + "”" : ""}</h2>
    <div class="sh-gloss ${esc(S.dens)}">${glossBody}</div>
    ${tablesBody}
    ${snipsBody}
    <div class="sh-foot">Colour on a glossary card = its category. Colour in the table overview = what that table records. Colour inside a drawing = anatomy (structure · dendrite · axon · synapse).<br>
    Illustrations are generated and still under review; where a picture and a definition disagree, trust the definition. ${esc(window.SITE.title)} · ${esc(window.SITE.revision)}</div>`;
}

function sheetTerm(t){
  const c = CAT[t.category];
  const svg = S.art && t.diagram ? DIAG[t.diagram] : null;
  const only = t.datasets && t.datasets.length === 1 ? ` <span style="font-weight:400">(${DS[t.datasets[0]].label})</span>` : "";
  const amb = (t.flags || []).includes("ambiguous") ? ' <span style="color:#b07a2b">⚠</span>' : "";
  const senses = (t.senses || []).length
    ? `<ul class="sh-senses">${t.senses.map(s => `<li>${s.sense}</li>`).join("")}</ul>` : "";
  return `<div class="sh-g" style="border-left-color:${c.color}">
    ${svg ? `<div class="art">${svg}</div>` : ""}
    <div class="eb" style="color:${c.color}">${c.short}</div>
    <div class="tn">${esc(t.term)}${amb}${only}</div>
    <div class="df">${t.def}</div>
    ${senses}
  </div>`;
}

function doPrint(){
  let framed = false;
  try { framed = (self !== top); } catch { framed = true; }
  if (framed){
    $("#printTip").hidden = false;
    $("#printTip").textContent =
      "This page is running inside an embedded preview, where browsers block printing. " +
      "Open index.html directly in a browser tab and press Cmd+P / Ctrl+P. " +
      "In the print dialog choose US Letter, portrait, and turn on background graphics.";
    return;
  }
  window.print();
}

/* ── the mark, and a favicon that will not sit still ──────────────
   One asset does both. The artwork is a filled circle with the "a/" knocked
   out to transparency, so painting a colour through its alpha gives the mark
   in that colour: CSS does it with a mask for the header, and here a canvas
   does it with a destination-in composite for the tab.

   The hue walks a slow loop from the brand periwinkle. Saturation and
   lightness are held at the brand's own, so every frame of the cycle is a
   colour the mark could plausibly have shipped in. */
const FAVICON_STEP = 420, FAVICON_LOOP = 24000;

function brandHSL(){
  const hex = (window.BRAND && window.BRAND.color) || "#6464ff";
  const [r, g, b] = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255);
  const max = Math.max(r, g, b), min = Math.min(r, g, b), l = (max + min) / 2;
  const dl = max - min;
  const s = dl === 0 ? 0 : dl / (1 - Math.abs(2 * l - 1));
  let h = 0;
  if (dl){
    h = max === r ? ((g - b) / dl) % 6 : max === g ? (b - r) / dl + 2 : (r - g) / dl + 4;
    h *= 60; if (h < 0) h += 360;
  }
  return { h, s: s * 100, l: l * 100 };
}

function startBrand(){
  const link = $("#favicon");
  if (!window.BRAND || !window.BRAND.mark) return;
  const root = document.documentElement;
  root.style.setProperty("--mark", `url("${window.BRAND.mark}")`);
  root.style.setProperty("--brand", window.BRAND.color);
  if (!link || !document.createElement("canvas").getContext) return;

  const base = brandHSL();
  const img = new Image();
  img.onload = () => {
    const size = 64;
    const cv = document.createElement("canvas");
    cv.width = cv.height = size;
    const cx = cv.getContext("2d");
    let t0 = null, timer = null;

    const paint = now => {
      const phase = ((now - t0) % FAVICON_LOOP) / FAVICON_LOOP;
      const colour = `hsl(${(base.h + phase * 360) % 360} ${base.s}% ${base.l}%)`;
      cx.clearRect(0, 0, size, size);
      cx.fillStyle = colour;
      cx.fillRect(0, 0, size, size);
      cx.globalCompositeOperation = "destination-in";   // keep only the circle
      cx.drawImage(img, 0, 0, size, size);
      cx.globalCompositeOperation = "source-over";
      try { link.href = cv.toDataURL("image/png"); } catch { clearInterval(timer); }
      root.style.setProperty("--brand", colour);
    };

    t0 = Date.now();
    paint(t0);
    if (reduceMotion()) return;          // a blinking tab is exactly what that setting is about
    timer = setInterval(() => paint(Date.now()), FAVICON_STEP);
    // nothing to animate while the tab is in the background
    document.addEventListener("visibilitychange", () => {
      clearInterval(timer);
      if (!document.hidden) timer = setInterval(() => paint(Date.now()), FAVICON_STEP);
    });
  };
  img.src = window.BRAND.mark;
}

/* ── view plumbing ───────────────────────────────────────────── */

/* Deep links. #/tables and #/sheet open a view; #term-<id> opens the glossary at
   one entry, so a link to a single definition can be pasted into an email.
   The view routes carry a "/" so they cannot collide with an element id and make
   the browser jump the page on load. */
const VIEWS = ["glossary", "tables", "sheet"];

function readHash(){
  const h = decodeURIComponent(location.hash.replace(/^#/, ""));
  if (h.startsWith("/") && VIEWS.includes(h.slice(1))) { S.view = h.slice(1); return null; }
  if (VIEWS.includes(h)) { S.view = h; return null; }   // tolerate the older form
  if (h.startsWith("term-")) { S.view = "glossary"; return h; }
  if (h.startsWith("tbl-"))  { S.view = "tables";   return h; }
  return null;
}

function writeHash(){
  const want = "#/" + S.view;
  if (location.hash === want) return;
  // some browsers refuse replaceState on file:// — the anchors still work, so just skip
  try { history.replaceState(null, "", want); } catch { /* no-op */ }
}

/* The dataset pills depend on the discipline, so they are rebuilt rather than
   written into the markup. "All datasets" is always first. */
function renderDsPills(){
  const ids = Object.keys(DS).filter(id => inDisc(DS[id].discipline, S.disc));
  // a dataset selected under the previous discipline no longer exists here, so
  // drop it — and persist the correction rather than leaving it in storage
  let fixed = false;
  if (!ids.includes(S.ds)){ S.ds = "all"; fixed = true; }
  if (!ids.includes(S.sheetDs) && S.sheetDs !== "all"){ S.sheetDs = "all"; fixed = true; }
  if (fixed) save();
  $("#dsCtl").innerHTML = [["all", "All datasets"]]
    .concat(ids.map(id => [id, DS[id].label]))
    .map(([id, label]) =>
      `<button class="dsb" data-ds="${esc(id)}" aria-pressed="${id === S.ds}">${esc(label)}</button>`)
    .join("");

  const sel = $("#optSheetDs");
  sel.innerHTML = [["all", "all datasets"]].concat(ids.map(id => [id, DS[id].label]))
    .map(([id, label]) => `<option value="${esc(id)}">${esc(label)}</option>`).join("");
  sel.value = S.sheetDs;
}

/* ── the liquid scope indicator ───────────────────────────────────
   Each blob has four springs — x, y, width, height — integrated per frame.
   Underdamped, so a blob overshoots its target slightly and settles back:
   that is what makes the surface read as viscous rather than as a box being
   moved. Because the two blobs are inside a blur-then-threshold filter, a
   blob in flight also stretches the neck joining it to its neighbour, and
   snaps it once they are far enough apart. */
// ~15% overshoot, settled in about half a second: enough elasticity to read as
// liquid, not so much that the control keeps wobbling after you have moved on
const SPRING = { k: 0.26, damp: 0.62, eps: 0.05 };

// the surface sits a little inside the pills it marks, so it stays quieter than
// the rest of the page
const SURFACE = 0.9;

/* The neck is a rendering compensation rather than physics.

   The threshold erodes a blurred edge, so a bar has to clear a minimum width
   before any of it survives at all. Measured against this filter at
   stdDeviation 9: 12 px and below vanishes completely, 14 px is a faint
   sliver, 16 px is the first solid strand. Anything thinner than that is not a
   delicate neck, it is an invisible one.

   So: spans short enough that the two blobs already overlap need no bar — they
   fuse on their own into a narrow waist, which is the thin end of the range.
   Everything longer gets a bar, starting just above the survival width and
   growing with distance. Spans in this control run from ~7 px to ~187 px. */
const NECK = { near: 40, far: 187, thin: 16, thick: 20, floor: 7 };

const blobs = new Map();   // element -> {x,y,w,h} current + velocities
let springFrame = null;

function blobState(el){
  if (!blobs.has(el)) blobs.set(el, { v: {}, cur: {}, target: {}, settled: false });
  return blobs.get(el);
}

function step(){
  springFrame = null;
  let moving = false;

  for (const [el, s] of blobs){
    for (const key of ["x", "y", "w", "h"]){
      const target = s.target[key];
      if (target == null) continue;
      if (s.cur[key] == null){ s.cur[key] = target; s.v[key] = 0; }   // first placement: no flight
      const dx = target - s.cur[key];
      s.v[key] = (s.v[key] + dx * SPRING.k) * SPRING.damp;
      s.cur[key] += s.v[key];
      if (Math.abs(dx) > SPRING.eps || Math.abs(s.v[key]) > SPRING.eps) moving = true;
      else { s.cur[key] = target; s.v[key] = 0; }
    }
    el.style.setProperty("--x", s.cur.x + "px");
    el.style.setProperty("--y", s.cur.y + "px");
    el.style.setProperty("--w", s.cur.w + "px");
    el.style.setProperty("--h", s.cur.h + "px");
  }

  if (moving) springFrame = requestAnimationFrame(step);
}

/* ── row two: shut until you reach for it ─────────────────────────
   Hovering the scope opens it over a second; leaving the header closes it two
   seconds later, over another second. The liquid surface is never told any of
   this — it measures the live layout, so with the row shut there is nothing to
   measure, the view blob shrinks into the discipline blob and the neck retracts
   with it. A frame loop re-measures for as long as the height is moving, which
   is what keeps the surface attached to a layout sliding underneath it. */
const OPEN_MS = 1000, CLOSE_MS = 1000, CLOSE_DELAY = 2000;
let viewsTimer = null, viewsSettle = null, viewsOpen = false;

const mq = q => !!(window.matchMedia && window.matchMedia(q).matches);
function reduceMotion(){ return mq("(prefers-reduced-motion: reduce)"); }
// with a pointer the row hides and hover reveals it; without one it starts open
// and a swipe up puts it away, which is the only way to get the space back
function canHover(){ return !mq("(hover: none)"); }

/* Every so often, while the views are put away, the surface draws itself up
   into a ball, hangs for a moment and flows back into its pill. It only ever
   happens in the top row, where there is nothing to be mistaken for a link to
   something below. */
const BALL_MS = 1100, BALL_LIFT = 5, BALL_EVERY = [7000, 14000];
let ballAt = null, ballTimer = null;

/* The pill drawn back into a ball, k running 0 (pill) to 1 (gathered). Width
   collapses towards the height so it goes round, it plumps a little as it does,
   and it lifts — a drop pulling itself together. The springs chase whatever
   this returns, which is where the bounce comes from. */
function ballShape(pill, k){
  const cx = pill.x + pill.w / 2, cy = pill.y + pill.h / 2;
  const h = pill.h * (1 + 0.12 * k);       // plumps as it gathers
  const w = pill.w + (h - pill.w) * k;     // ...and closes on that height, so
  return { x: cx - w / 2,                  //    the peak is a circle, not an egg
           y: cy - h / 2 - BALL_LIFT * k, w, h };
}

function scheduleBall(){
  clearTimeout(ballTimer);
  // a hidden tab gets no timer at all, rather than a timer that wakes up to
  // decide it has nothing to do
  if (reduceMotion() || document.hidden) return;
  ballTimer = setTimeout(() => {
    const wrap = $("#viewsWrap");
    const shut = !wrap || wrap.getBoundingClientRect().height <= 10;
    if (shut){
      ballAt = Date.now();
      trackScope(BALL_MS + 400);        // keep measuring until it has settled
    }
    scheduleBall();
  }, rand(BALL_EVERY[0], BALL_EVERY[1]));
}

// keep re-measuring while a CSS transition is moving the layout under us
function trackScope(ms){
  const until = Date.now() + ms;
  const tick = () => { placeScope(); if (Date.now() < until) requestAnimationFrame(tick); };
  requestAnimationFrame(tick);
}

/* Measured on the wrapper, not on the nav inside it: the nav's top margin is
   part of the wrapper's height, and animating to the nav's height alone leaves
   the row snapping the difference when it goes back to auto. */
function viewsHeight(wrap){
  const before = wrap.style.height;
  wrap.style.height = "auto";
  const h = wrap.getBoundingClientRect().height;
  wrap.style.height = before;
  return h;
}

function setViews(open){
  const wrap = $("#viewsWrap");
  if (!wrap || open === viewsOpen) return;

  const h = viewsHeight(wrap);
  if (!h) return;               // nothing laid out yet, e.g. a test DOM. Bail
                                // before recording the state, or the next call
                                // sees it as already done and never runs.
  viewsOpen = open;
  clearTimeout(viewsSettle);

  // start from wherever it actually is, so an interrupted animation reverses
  // from that point instead of jumping to an end state first
  wrap.style.height = wrap.getBoundingClientRect().height + "px";
  void wrap.offsetHeight;
  wrap.classList.toggle("open", open);
  wrap.style.height = (open ? h : 0) + "px";

  const ms = reduceMotion() ? 0 : (open ? OPEN_MS : CLOSE_MS);
  trackScope(ms);
  // Once open, let the row size itself again so the tabs can wrap. This has to
  // be an explicit `auto` rather than clearing the inline height: the shut
  // state is `height:0` in the stylesheet, so clearing it would snap the row
  // straight back closed the moment it had finished opening.
  if (open) viewsSettle = setTimeout(() => {
    if (viewsOpen){ wrap.style.height = "auto"; placeScope(); }
  }, ms);
}

/* ── the mouse ────────────────────────────────────────────────────
   Now and then, when the row opens, one runs across it and disappears at the
   bottom edge of the scope — which is where the search field begins, so it
   reads as having gone behind it. Everything about the run is drawn fresh each
   time: which side it enters from, how the path bends, how fast it goes.

   Top-down, so the drawing is symmetric about its long axis and can simply be
   rotated onto the tangent whichever way it is heading. */
const MOUSE_CHANCE = 0.6, MOUSE_DELAY = 260;

/* How it crosses. A motif is a list of segments, each covering some fraction of
   the path over some time; a segment that covers no distance is the animal
   stopping. Speed is expressed as path per second so a slow segment simply
   takes longer, rather than being a different kind of motion. */
const MOUSE_SPEED = { run: 0.62, walk: 0.26 };   // fraction of the path per second

// sway is how far it swings off the tangent, stride how much the body squashes
// as it pushes off. Both are read against elapsed time, so the rhythm stays put
// when a segment is stretched or shortened.
const GAIT = {
  run:     { sway: [5, 22],  stride: [0.06, 44] },
  walk:    { sway: [3, 10],  stride: [0.03, 20] },
  stop:    { sway: [7, 6],   stride: [0.02, 14] },   // a sniff, on the spot
  explore: { sway: [26, 3.2], stride: [0.02, 7] },   // casting about
};

function mouseMotif(){
  const jit = (v, s = 0.15) => v * rand(1 - s, 1 + s);
  const seg = (kind, dist, ms) =>
    ({ kind, dist, ms: jit(ms != null ? ms : dist / MOUSE_SPEED[kind] * 1000) });

  switch (Math.floor(rand(0, 4))){
    case 0: {
      return { name: "run", segs: [seg("run", 1)] };
    }
    case 1: {
      const a = rand(0.38, 0.52);
      return { name: "run-stop-run",
               segs: [seg("run", a), seg("stop", 0, 520), seg("run", 1 - a)] };
    }
    case 2: {
      const a = rand(0.34, 0.46), e = rand(0.05, 0.10);
      return { name: "run-explore-run",
               segs: [seg("run", a), seg("explore", e, 820), seg("run", 1 - a - e)] };
    }
    default: {
      const a = rand(0.28, 0.40), e = rand(0.06, 0.12);
      return { name: "walk-explore-run",
               segs: [seg("walk", a), seg("explore", e, 900), seg("run", 1 - a - e)] };
    }
  }
}
const MOUSE_SVG =
  `<svg viewBox="-8 0 56 20" width="30" height="11" fill="currentColor" aria-hidden="true">
     <path d="M8,10 C1,11 -2,4 -7,6" fill="none" stroke="currentColor"
           stroke-width="1.3" stroke-linecap="round"/>
     <ellipse cx="14" cy="3.4" rx="2.8" ry="1.5"/><ellipse cx="14" cy="16.6" rx="2.8" ry="1.5"/>
     <ellipse cx="26" cy="3.8" rx="2.6" ry="1.4"/><ellipse cx="26" cy="16.2" rx="2.6" ry="1.4"/>
     <circle cx="33" cy="4.9" r="3.3"/><circle cx="33" cy="15.1" r="3.3"/>
     <ellipse cx="20" cy="10" rx="13" ry="6.3"/>
     <ellipse cx="36" cy="10" rx="6" ry="4.2"/>
     <ellipse cx="42.5" cy="10" rx="2.6" ry="2"/>
   </svg>`;

const rand = (a, b) => a + Math.random() * (b - a);

function runMouse(){
  const scope = $(".scope"), wrap = $("#viewsWrap");
  if (!scope || !wrap || reduceMotion()) return;
  if (scope.querySelector(".scope-mouse")) return;      // one at a time

  const box = scope.getBoundingClientRect();
  const row = wrap.getBoundingClientRect();
  if (!box.width || !row.height) return;
  const W = box.width, H = box.height;
  const y = row.top - box.top + row.height / 2;         // the middle of row two

  // right to left or left to right, and out through the floor at the end
  const rtl = Math.random() < 0.5;
  const x0 = rtl ? W + 40 : -40;
  const x3 = rand(W * 0.25, W * 0.75);
  const p = [
    { x: x0,                                   y: y + rand(-4, 4) },
    { x: rtl ? W * rand(0.55, 0.8) : W * rand(0.2, 0.45), y: y + rand(-11, -3) },
    { x: rtl ? W * rand(0.2, 0.45) : W * rand(0.55, 0.8), y: y + rand(3, 11) },
    { x: x3,                                   y: H + 30 },
  ];

  const at = t => {
    const u = 1 - t, a = u*u*u, b = 3*u*u*t, c = 3*u*t*t, d = t*t*t;
    return { x: a*p[0].x + b*p[1].x + c*p[2].x + d*p[3].x,
             y: a*p[0].y + b*p[1].y + c*p[2].y + d*p[3].y };
  };

  const el = document.createElement("i");
  el.className = "scope-mouse";
  el.innerHTML = MOUSE_SVG;
  scope.appendChild(el);

  // lay the motif out on a timeline, and on the path
  const motif = mouseMotif();
  let total = 0, covered = 0;
  motif.segs.forEach(s => { s.at = total; total += s.ms; s.from = covered; covered += s.dist; });
  el.dataset.motif = motif.name;

  // decelerating into a pause and accelerating out of one is what sells it as
  // an animal deciding to stop, rather than a sprite whose speed was changed
  const ease = u => u < 0.5 ? 4*u*u*u : 1 - Math.pow(-2*u + 2, 3) / 2;
  const t0 = performance.now();

  const frame = now => {
    const e = now - t0;
    if (e >= total){ el.remove(); return; }

    const seg = motif.segs.find(s => e < s.at + s.ms) || motif.segs[motif.segs.length - 1];
    const u = seg.ms ? (e - seg.at) / seg.ms : 1;
    const t = seg.from + seg.dist * (seg.kind === "run" ? ease(u) : u);

    const here = at(t), ahead = at(Math.min(1, t + 0.01));
    const angle = Math.atan2(ahead.y - here.y, ahead.x - here.x) * 180 / Math.PI;

    const g = GAIT[seg.kind], secs = e / 1000;
    const sway   = Math.sin(secs * g.sway[1]) * g.sway[0];
    const stride = 1 + Math.sin(secs * g.stride[1]) * g.stride[0];

    el.style.transform = `translate3d(${here.x - 15}px, ${here.y - 6}px, 0)` +
                         ` rotate(${angle + sway}deg) scaleX(${stride})`;
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
}

function openViews(){
  clearTimeout(viewsTimer);
  const was = viewsOpen;
  setViews(true);
  // only on the way open, and only sometimes: a mouse every time is vermin
  if (!was && viewsOpen && Math.random() < MOUSE_CHANCE) setTimeout(runMouse, MOUSE_DELAY);
}
function closeViewsSoon(){
  clearTimeout(viewsTimer);
  viewsTimer = setTimeout(() => setViews(false), CLOSE_DELAY);
}

// Measured from the live layout, so it survives wrapping, resizing, font swaps.
function placeScope(){
  const scope = $(".scope");
  if (!scope) return;
  const base = scope.getBoundingClientRect();
  const still = !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);

  const put = (el, target, padX, padY) => {
    if (!el) return null;
    if (!target){ el.style.setProperty("--on", "0"); return null; }
    const r = target.getBoundingClientRect();
    if (!r.width){ el.style.setProperty("--on", "0"); return null; }   // hidden, e.g. in jsdom
    const s = blobState(el);
    const boxW = r.width + padX * 2, boxH = r.height + padY * 2;
    const w = boxW * SURFACE, h = boxH * SURFACE;      // shrunk about its centre
    s.target = { x: r.left - base.left - padX + (boxW - w) / 2,
                 y: r.top  - base.top  - padY + (boxH - h) / 2, w, h };
    if (still) s.cur = { ...s.target };
    el.style.setProperty("--on", "1");
    return s.target;
  };

  const d = put($('.blob[data-row="disc"]'), $('.discb[aria-pressed="true"]'), 7, 4);

  /* With the row shut there is nothing down there to reach for, and a neck
     trailing off a pill towards nothing reads as a smudge rather than a link.
     So below a few pixels of open row, the lower blob and the neck are simply
     not drawn and the surface is a clean lozenge around the discipline. */
  const wrap = $("#viewsWrap");
  const rowOpen = wrap ? wrap.getBoundingClientRect().height : 0;
  const v = rowOpen > 10
    ? put($('.blob[data-row="view"]'), $('button.view[aria-current="page"]'), 5, 4)
    : put($('.blob[data-row="view"]'), null);

  // ...and while it is shut, the surface gathers itself into a ball now and
  // then. Interpolating the target rather than the position lets the springs
  // do the squashing, so it arrives with a wobble instead of a slide.
  if (d && ballAt != null){
    const p = (Date.now() - ballAt) / BALL_MS;
    if (p >= 1) ballAt = null;
    else {
      const s = blobState($('.blob[data-row="disc"]'));
      s.target = ballShape(d, Math.sin(Math.max(0, p) * Math.PI));   // out and back
      if (still) s.cur = { ...s.target };
    }
  }

  // the ligament runs centre to centre; the two blobs cover its ends, so what
  // shows is the neck between them
  const bridge = $(".blob.bridge");
  if (bridge){
    if (!d || !v){ bridge.style.setProperty("--on", "0"); }
    else {
      // bottom edge to top edge, so on a long span the neck runs along the
      // gutter between the rows instead of cutting across the labels. The ends
      // still sit inside the blobs, which is what makes them fuse.
      const from = { x: d.x + d.w / 2, y: d.y + d.h };
      const to   = { x: v.x + v.w / 2, y: v.y };
      const dx = to.x - from.x, dy = to.y - from.y;
      const len = Math.hypot(dx, dy);
      const t = Math.max(0, Math.min(1, (len - NECK.near) / (NECK.far - NECK.near)));
      const h = len < NECK.near ? NECK.floor
                                : NECK.thin + t * (NECK.thick - NECK.thin);
      const s = blobState(bridge);
      s.target = { x: from.x, y: from.y, w: len, h };
      s.targetAng = Math.atan2(dy, dx) * 180 / Math.PI;
      if (still) s.cur = { ...s.target };
      bridge.style.setProperty("--ang", s.targetAng + "deg");
      bridge.style.setProperty("--on", "1");
    }
  }

  if (still) step();
  else if (!springFrame) springFrame = requestAnimationFrame(step);
}

function render(){
  $$(".view-pane").forEach(p => { p.hidden = p.id !== "view-" + S.view; });
  $$("button.view").forEach(b => b.setAttribute("aria-current", b.dataset.view === S.view ? "page" : "false"));
  $$(".discb").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.disc === S.disc)));
  // each control appears only where it does something
  $("#sortCtl").hidden = S.view === "tables";
  $("#dsCtl").hidden   = S.view !== "tables";
  renderDsPills();
  if (S.view === "glossary") renderGlossary();
  else if (S.view === "tables") renderTables();
  else { renderSheet(); $("#count").textContent = `${visibleTerms().length} terms on the sheet`; }
  placeScope();
}

function applyTheme(){
  const r = document.documentElement;
  if (S.theme === "auto") r.removeAttribute("data-theme");
  else r.setAttribute("data-theme", S.theme);
}

/* Bind once. A second DOMContentLoaded — or the file being included twice —
   would otherwise attach every delegated listener again, and a toggle bound
   twice fires twice per click, so it turns on and straight back off. */
let started = false;

function init(){
  if (started) return;
  started = true;

  startBrand();
  $("#siteTitle").textContent = window.SITE.title;
  $("#refs").innerHTML = (window.SITE.references || []).map(r =>
    `<a href="${esc(r.url)}" target="_blank" rel="noopener">${esc(r.label)}</a>`).join(", ");
  const forum = $("#communityLink");
  if (window.SITE.community) forum.href = window.SITE.community;
  else forum.remove();
  $("#rev").textContent       = `${window.SITE.title} · revision ${window.SITE.revision} · ${TERMS.length} terms · ${Object.values(TBL).reduce((n, a) => n + a.length, 0)} tables`;
  document.title = window.SITE.title;

  renderLegends();

  $("#discCtl").innerHTML = [{ id: "all", label: "All" }].concat(DISCS)
    .map(d => `<button class="discb" data-disc="${esc(d.id)}"
       aria-pressed="${d.id === S.disc}"${d.blurb ? ` title="${esc(d.blurb)}"` : ""}>${esc(d.label)}</button>`)
    .join("");

  $("#q").value = S.q;
  $$(".sb").forEach(b  => b.setAttribute("aria-pressed", String(b.dataset.sort === S.sort)));
  $("#optArt").checked = S.art; $("#optTables").checked = S.tables; $("#optSnips").checked = S.snips;
  $("#optDens").value = S.dens;
  $("#optSheetDs").value = S.sheetDs;
  applyTheme();

  const target = readHash();

  $$("button.view").forEach(b => b.onclick = () => { S.view = b.dataset.view; save(); render(); writeHash(); });

  // switching discipline drops any category pills that no longer exist in it
  $("#discCtl").addEventListener("click", e => {
    const b = e.target.closest(".discb");
    if (!b) return;
    if (b.dataset.disc === S.disc) return;
    S.disc = b.dataset.disc;
    const live = new Set(visibleCats().map(c => c.id));
    S.cats = (S.cats || []).filter(c => live.has(c));
    save(); render();
  });

  // the pills are rebuilt whenever the discipline changes, so delegate
  $("#dsCtl").addEventListener("click", e => {
    const b = e.target.closest(".dsb");
    if (!b) return;
    S.ds = b.dataset.ds; save(); render();
  });
  $$(".sb").forEach(b => b.onclick = () => {
    S.sort = b.dataset.sort; $$(".sb").forEach(x => x.setAttribute("aria-pressed", String(x === b))); save(); render();
  });

  let t = null;
  $("#q").oninput = e => { S.q = e.target.value; clearTimeout(t); t = setTimeout(() => { save(); render(); }, 110); };

  $("#themeBtn").onclick = () => {
    S.theme = S.theme === "auto" ? "light" : S.theme === "light" ? "dark" : "auto";
    $("#themeBtn").title = `Theme: ${S.theme}`;
    applyTheme(); save();
  };

  ["art", "tables", "snips"].forEach(k => {
    $("#opt" + k[0].toUpperCase() + k.slice(1)).onchange = e => { S[k] = e.target.checked; save(); renderSheet(); };
  });
  $("#optDens").onchange = e => { S.dens = e.target.value; save(); renderSheet(); };
  $("#optSheetDs").onchange = e => { S.sheetDs = e.target.value; save(); renderSheet(); };
  $("#printBtn").onclick = doPrint;

  // language tabs on the recipe blocks
  $("#snips").addEventListener("click", e => {
    const b = e.target.closest("button[data-lang]");
    if (!b || b.disabled) return;
    S.lang = b.dataset.lang; save(); renderSnips();
  });

  // the category legend is also the filter
  $("#catLegend").addEventListener("click", e => {
    if (e.target.closest(".catclear")){ S.cats = []; save(); render(); return; }
    const b = e.target.closest(".catpill");
    if (!b) return;
    const id = b.dataset.cat, on = new Set(S.cats || []);
    on.has(id) ? on.delete(id) : on.add(id);
    S.cats = [...on];
    save(); render();
  });

  // a term's table chips jump to that table in the Tables view
  $("#glossary").addEventListener("click", e => {
    const a = e.target.closest("a[data-goto-table]");
    if (!a) return;
    e.preventDefault();
    S.view = "tables"; S.q = ""; $("#q").value = ""; save(); render(); writeHash();
    const el = document.querySelector(`.node[data-table="${CSS.escape(a.dataset.gotoTable)}"]`);
    if (el) el.scrollIntoView({ block: "center", behavior: "smooth" });
  });

  document.addEventListener("keydown", e => {
    if (e.key === "/" && document.activeElement !== $("#q")){ e.preventDefault(); $("#q").focus(); }
    if (e.key === "Escape" && document.activeElement === $("#q")){ $("#q").value = ""; S.q = ""; save(); render(); }
  });

  // printing from any view produces the sheet
  window.addEventListener("beforeprint", renderSheet);

  // the highlights are measured from layout, so anything that reflows moves them
  let rz = null;
  window.addEventListener("resize", () => { clearTimeout(rz); rz = setTimeout(placeScope, 80); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(placeScope);

  scheduleBall();
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) clearTimeout(ballTimer); else scheduleBall();
  });

  /* Reaching for the scope opens the views; leaving the header closes them a
     little later. The delay is generous because the row is between the pointer
     and the page, and a row that shuts while you are still travelling towards
     it is worse than one that lingers. */
  const scope = $(".scope"), bar = $(".topbar");
  if (scope && bar){
    // the stylesheet leaves the row open where there is no pointer, so start
    // the bookkeeping from what is actually on screen
    viewsOpen = !canHover();

    if (canHover()){
      scope.addEventListener("pointerenter", openViews);
      bar.addEventListener("pointerleave", closeViewsSoon);
    } else {
      /* No hover to reveal it with, so the row is put away and fetched back by
         swiping the scope: up to collapse, down to open. The strip sets
         touch-action:pan-x, so a vertical drag here is ours and the page does
         not scroll out from under the gesture. */
      const SWIPE = 26;                 // px before a drag counts as a swipe
      let x0 = 0, y0 = 0, live = false;
      scope.addEventListener("touchstart", e => {
        if (e.touches.length !== 1) { live = false; return; }
        x0 = e.touches[0].clientX; y0 = e.touches[0].clientY; live = true;
      }, { passive: true });
      scope.addEventListener("touchend", e => {
        if (!live) return;
        live = false;
        const t = e.changedTouches[0];
        const dy = t.clientY - y0, dx = t.clientX - x0;
        // vertical, and decisively so: a thumb on its way somewhere else
        // should not fold the menu away
        if (Math.abs(dy) < SWIPE || Math.abs(dy) < Math.abs(dx) * 1.4) return;
        setViews(dy > 0);
      }, { passive: true });
    }

    // keyboard users never fire pointerenter, and a focused control inside a
    // zero-height box is a control nobody can see
    scope.addEventListener("focusin", openViews);
    scope.addEventListener("focusout", e => {
      if (canHover() && !scope.contains(e.relatedTarget)) closeViewsSoon();
    });
  }

  window.addEventListener("hashchange", () => {
    const was = S.view;
    const t = readHash();
    if (S.view !== was) render();          // re-render only when the view actually changed
    if (t) document.getElementById(t)?.scrollIntoView({ block: "center" });
  });

  render();
  if (target) document.getElementById(target)?.scrollIntoView({ block: "center" });
  else writeHash();
}

document.addEventListener("DOMContentLoaded", init);
})();
