/* Allen Connectomics Glossary — all behaviour.
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
const GROUPS = window.TABLE_GROUPS;
const TBL    = window.TABLES;
const SNIPS  = window.SNIPPETS;
const LANGS  = window.LANGUAGES;

const STORE = "acg.v1";
const S = Object.assign(
  // `ds` scopes the table catalogue only; the glossary always shows every term
  // and flags the few that belong to one dataset.
  { view: "glossary", ds: "all", sort: "alpha", q: "", cats: [],
    theme: "auto", lang: "python",
    art: true, tables: true, snips: true, dens: "normal", sheetDs: "all" },
  readStore()
);
// cats: the categories the legend pills have narrowed to. Empty means all of them.

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
  const hay = (t.term + " " + strip(t.def) + " " + CAT[t.category].label + " " +
               (t.tables || []).join(" ")).toLowerCase();
  return hay.includes(q);
}

function visibleTerms(){
  const q = S.q.trim().toLowerCase();
  const cats = S.cats && S.cats.length ? new Set(S.cats) : null;
  return TERMS.filter(t => matches(t, q) && (!cats || cats.has(t.category)));
}

// how many terms each category would contribute, ignoring the category filter
// itself, so the pill counts do not collapse to zero as you narrow
function catCounts(){
  const q = S.q.trim().toLowerCase();
  const n = {};
  TERMS.filter(t => matches(t, q)).forEach(t => { n[t.category] = (n[t.category] || 0) + 1; });
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
    ? `<span class="chip todo">background</span>` : "";
  const ng  = Object.entries(t.ng || {})
    .filter(([, url]) => url)
    .map(([k, url]) => `<a class="chip ng" href="${esc(url)}" target="_blank" rel="noopener">${DS[k] ? DS[k].label : esc(k)} ↗</a>`)
    .join("");
  const refs = (t.tables || []).length
    ? `<div class="refs">${t.tables.map(n => `<a href="#" data-goto-table="${esc(n)}">${esc(n)}</a>`).join("")}</div>` : "";
  const meta = ds + amb + ctx + ng;
  return `<article class="card" style="border-left-color:${c.color}" id="term-${t.id}">
    ${svg ? `<div class="art">${svg}</div>` : ""}
    <div class="eb" style="color:${c.color}">${c.short}</div>
    <h3><a class="perma" href="#term-${t.id}" title="Link to this term">${hl(esc(t.term), q)}</a></h3>
    <p>${hl(t.def, q)}</p>
    ${meta ? `<div class="meta">${meta}</div>` : ""}
    ${refs}
  </article>`;
}

function renderGlossary(){
  const q = S.q.trim().toLowerCase();
  const list = visibleTerms();
  const out = $("#glossary");

  if (!list.length){ out.innerHTML = ""; $("#glossEmpty").hidden = false; return; }
  $("#glossEmpty").hidden = true;

  const byName = (a, b) => a.term.toLowerCase().localeCompare(b.term.toLowerCase());

  if (S.sort === "alpha"){
    out.className = "grid";
    out.innerHTML = [...list].sort(byName).map(t => cardHTML(t, q)).join("");
  } else {
    // each category becomes its own titled section with its own grid, so the
    // grouping is unmistakable rather than implied by a thin rule
    out.className = "";
    out.innerHTML = CATS.map(c => {
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

  const filtered = S.q.trim() || (S.cats && S.cats.length);
  $("#count").textContent = filtered
    ? `${list.length} of ${TERMS.length} terms` : `${TERMS.length} terms`;
  renderCatPills();
}

function renderCatPills(){
  const n = catCounts();
  const on = new Set(S.cats || []);
  $("#catLegend").innerHTML = CATS.map(c =>
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

  return `<div class="statcard">${out.map(s => {
    const [v, u] = s.n != null ? compact(s.n) : [s.v, s.u];
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

  const lanes = GROUPS.map(g => {
    const items = rows.filter(t => t.group === g.id);
    return `<div class="lane${items.length ? "" : " dim"}">
      <div class="lane-h" style="background:${g.color}">${esc(g.label)}</div>
      <p class="lane-b" title="${esc(g.blurb)}">${esc(g.blurb)}</p>
      ${items.map(t => `
        <div class="node${t.derived ? " derived" : ""}" style="border-left-color:${g.color}"
             id="tbl-${esc(dsId)}-${esc(t.name)}" data-table="${esc(t.name)}">
          <div class="n-name">${hl(esc(t.name), q)}</div>
          <div class="n-keys">${t.rows && t.rows !== "—"
              ? `<b>${esc(t.rows)} rows</b>` : ""}${esc((t.keys || []).join(" · "))}</div>
          <p class="n-desc">${hl(esc(t.desc), q)}</p>
          ${t.ng ? `<a class="chip ng" href="${esc(t.ng)}" target="_blank" rel="noopener">Neuroglancer ↗</a>` : ""}
        </div>`).join("")}
    </div>`;
  }).join("");

  return `<section class="dsblock">
    <header>
      <h2>${esc(d.label)}</h2>
      <div class="facts">
        <span>datastack <b>${esc(d.datastack)}</b></span>
        <span>version <b>${esc(d.version)}</b></span>
        <span>voxel <b>${esc(d.resolution)}</b></span>
        <span>server <b>${esc(d.server)}</b></span>
        <span><a href="${esc(d.ng)}" target="_blank" rel="noopener">open in Neuroglancer ↗</a></span>
      </div>
    </header>
    <p class="blurb">${esc(d.blurb)}</p>
    ${datasetStats(dsId)}
    ${rows.length ? `<div class="lanes">${lanes}</div>`
                  : `<p class="empty">No tables match that search.</p>`}
  </section>`;
}

function renderTables(){
  const ids = S.ds === "all" ? ["microns", "v1dd"] : [S.ds];
  $("#tablesOut").innerHTML =
    `<h2 class="sec-h">Tables at a glance</h2>
     <p class="sec-p">Each column collects the tables that record one kind of thing. Greyed entries are
     the underlying measurements and the products you assemble yourself; the rest are CAVE tables you
     can query.</p>`
    + ids.map(datasetBlock).join("");
  renderSnips();
  $("#count").textContent = ids
    .map(i => `${tableRows(i).filter(t => !t.derived).length} ${DS[i].label} tables`).join(" · ");
}

function renderSnips(){
  $("#snips").innerHTML = SNIPS.map(s => {
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
  const dsIds = S.sheetDs === "all" ? ["microns", "v1dd"] : [S.sheetDs];
  const scope = dsIds.map(id => DS[id].label).join(" & ");

  const glossBody = byCat
    ? CATS.map(c => {
        const items = list.filter(t => t.category === c.id);
        if (!items.length) return "";
        return `<div class="sh-cat" style="color:${c.color}">${esc(c.label)}</div>` + items.map(g => sheetTerm(g)).join("");
      }).join("")
    : list.map(t => sheetTerm(t)).join("");

  const tablesBody = !S.tables ? "" :
    `<h2 class="sh-s">Tables at a glance</h2>` +
    dsIds.map(id => `<div class="sh-ds">${esc(DS[id].label)}</div><div class="sh-lanes">` +
      GROUPS.map(g => {
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

  const snipsBody = !S.snips ? "" :
    `<h2 class="sh-s">Recipes</h2><div class="sh-snips">` +
    SNIPS.filter(s => s[S.lang] || s.python).map(s =>
      `<pre class="sh-p"><b>${esc(s.title)}</b>${code(s[S.lang] || s.python)}</pre>`).join("") +
    `</div>`;

  $("#sheet").innerHTML = `
    <div class="sh-head">
      <h1>${esc(window.SITE.title)}</h1>
      <div class="sub"><b>${esc(scope)}</b><br>${esc(window.SITE.revision)}</div>
    </div>
    <div class="sh-leg"><b>Category</b>${CATS.map(c => `<span><i style="background:${c.color}"></i>${esc(c.short)}</span>`).join("")}</div>
    ${S.tables ? `<div class="sh-leg"><b>Table records</b>${GROUPS.map(g => `<span><i style="background:${g.color}"></i>${esc(g.label)}</span>`).join("")}</div>` : ""}
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
  return `<div class="sh-g" style="border-left-color:${c.color}">
    ${svg ? `<div class="art">${svg}</div>` : ""}
    <div class="eb" style="color:${c.color}">${c.short}</div>
    <div class="tn">${esc(t.term)}${amb}${only}</div>
    <div class="df">${t.def}</div>
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

/* ── view plumbing ───────────────────────────────────────────── */

/* Deep links. #/tables and #/sheet open a view; #term-<id> opens the glossary at
   one entry, so a link to a single definition can be pasted into an email.
   The view routes carry a "/" so they cannot collide with an element id and make
   the browser jump the page on load. */
const VIEWS = ["glossary", "tables", "sheet", "community"];

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

function render(){
  $$(".view-pane").forEach(p => { p.hidden = p.id !== "view-" + S.view; });
  $$(".view").forEach(b => b.setAttribute("aria-current", b.dataset.view === S.view ? "page" : "false"));
  // each control appears only where it does something
  $("#sortCtl").hidden  = S.view === "tables"    || S.view === "community";
  $("#dsCtl").hidden    = S.view !== "tables";
  $("#searchCtl").hidden = S.view === "community";
  $(".views").classList.toggle("alone", S.view === "community");
  if (S.view === "glossary") renderGlossary();
  else if (S.view === "tables") renderTables();
  else if (S.view === "community") $("#count").textContent = "";
  else { renderSheet(); $("#count").textContent = `${visibleTerms().length} terms on the sheet`; }
}

function applyTheme(){
  const r = document.documentElement;
  if (S.theme === "auto") r.removeAttribute("data-theme");
  else r.setAttribute("data-theme", S.theme);
}

function init(){
  $("#siteTitle").textContent = window.SITE.title;
  $("#dbLink").href           = window.SITE.databook;
  $("#rev").textContent       = `${window.SITE.title} · revision ${window.SITE.revision} · ${TERMS.length} terms · ${Object.values(TBL).reduce((n, a) => n + a.length, 0)} tables`;
  document.title = window.SITE.title;

  renderLegends();

  $("#q").value = S.q;
  $$(".dsb").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.ds === S.ds)));
  $$(".sb").forEach(b  => b.setAttribute("aria-pressed", String(b.dataset.sort === S.sort)));
  $("#optArt").checked = S.art; $("#optTables").checked = S.tables; $("#optSnips").checked = S.snips;
  $("#optDens").value = S.dens;
  $("#optSheetDs").value = S.sheetDs;
  applyTheme();

  const target = readHash();

  $$(".view").forEach(b => b.onclick = () => { S.view = b.dataset.view; save(); render(); writeHash(); });
  $$(".dsb").forEach(b => b.onclick = () => {
    S.ds = b.dataset.ds; $$(".dsb").forEach(x => x.setAttribute("aria-pressed", String(x === b))); save(); render();
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
    const el = document.querySelector(`.trow[data-table="${CSS.escape(a.dataset.gotoTable)}"]`);
    if (el) el.scrollIntoView({ block: "center", behavior: "smooth" });
  });

  document.addEventListener("keydown", e => {
    if (e.key === "/" && document.activeElement !== $("#q")){ e.preventDefault(); $("#q").focus(); }
    if (e.key === "Escape" && document.activeElement === $("#q")){ $("#q").value = ""; S.q = ""; save(); render(); }
  });

  // printing from any view produces the sheet
  window.addEventListener("beforeprint", renderSheet);

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
