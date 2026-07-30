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
  { view: "glossary", ds: "all", sort: "alpha", q: "",
    theme: "auto", lang: "python",
    art: true, tables: true, snips: true, dens: "normal" },
  readStore()
);

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

const termDatasets = t => t.datasets && t.datasets.length ? t.datasets : ["microns", "v1dd"];
const inDataset = (t, ds) => ds === "all" || termDatasets(t).includes(ds);

function matches(t, q){
  if (!q) return true;
  const hay = (t.term + " " + strip(t.def) + " " + CAT[t.category].label + " " +
               (t.tables || []).join(" ")).toLowerCase();
  return hay.includes(q);
}

function visibleTerms(){
  const q = S.q.trim().toLowerCase();
  return TERMS.filter(t => inDataset(t, S.ds) && matches(t, q));
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

  if (S.sort === "alpha"){
    const sorted = [...list].sort((a, b) => a.term.toLowerCase().localeCompare(b.term.toLowerCase()));
    out.innerHTML = sorted.map(t => cardHTML(t, q)).join("");
  } else {
    out.innerHTML = CATS.map(c => {
      const items = list.filter(t => t.category === c.id)
        .sort((a, b) => a.term.toLowerCase().localeCompare(b.term.toLowerCase()));
      if (!items.length) return "";
      return `<div class="g-head" style="color:${c.color}"><h2>${esc(c.label)}</h2><span class="n">${items.length}</span></div>`
           + items.map(t => cardHTML(t, q)).join("");
    }).join("");
  }
  $("#count").textContent = `${list.length} of ${TERMS.length} terms`;
}

function renderLegends(){
  $("#catLegend").innerHTML = CATS.map(c =>
    `<span><i style="background:${c.color}"></i>${esc(c.label)}</span>`).join("");
  $("#anatLegend").innerHTML = window.ANATOMY.map(a =>
    `<span><i style="background:var(--${a.id})"></i>${esc(a.label)}</span>`).join("");
}

/* ── tables ──────────────────────────────────────────────────── */

function tableRows(dsId){
  const q = S.q.trim().toLowerCase();
  return TBL[dsId].filter(t => !q ||
    (t.name + " " + t.desc + " " + (t.keys || []).join(" ")).toLowerCase().includes(q));
}

function datasetBlock(dsId){
  const d = DS[dsId];
  const rows = tableRows(dsId);
  const q = S.q.trim().toLowerCase();
  const groups = GROUPS.map(g => {
    const items = rows.filter(t => t.group === g.id);
    if (!items.length) return "";
    return `<section class="tgroup">
      <h3>${esc(g.label)}</h3>
      <p class="gb">${esc(g.blurb)}</p>
      <div class="tlist">${items.map(t => `
        <div class="trow" id="tbl-${esc(dsId)}-${esc(t.name)}" data-table="${esc(t.name)}">
          <div class="tn"><code>${hl(esc(t.name), q)}</code><span class="rows">${esc(t.rows)}</span></div>
          <p>${hl(esc(t.desc), q)}</p>
          ${(t.keys || []).length ? `<div class="keys">${t.keys.map(k => `<span>${esc(k)}</span>`).join("")}</div>` : ""}
          ${t.ng ? `<div class="keys"><a class="chip ng" href="${esc(t.ng)}" target="_blank" rel="noopener">Neuroglancer ↗</a></div>` : ""}
        </div>`).join("")}</div>
    </section>`;
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
    ${groups || `<p class="empty">No tables match that search.</p>`}
  </section>`;
}

function renderTables(){
  const ids = S.ds === "all" ? ["microns", "v1dd"] : [S.ds];
  $("#tablesOut").innerHTML =
    `<h2 class="sec-h">Tables worth querying</h2>
     <p class="sec-p">Grouped by what each table records. The groups are a way to find things — they are not a
     pipeline, and nothing here is downstream of anything else.</p>`
    + ids.map(datasetBlock).join("");
  renderSnips();
  $("#count").textContent = ids.map(i => `${tableRows(i).length} ${DS[i].label} tables`).join(" · ");
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
  const dsIds = S.ds === "all" ? ["microns", "v1dd"] : [S.ds];
  const scope = S.ds === "all" ? "MICrONS & V1DD" : DS[S.ds].label;

  const glossBody = byCat
    ? CATS.map(c => {
        const items = list.filter(t => t.category === c.id);
        if (!items.length) return "";
        return `<div class="sh-cat" style="color:${c.color}">${esc(c.label)}</div>` + items.map(g => sheetTerm(g)).join("");
      }).join("")
    : list.map(t => sheetTerm(t)).join("");

  const tablesBody = !S.tables ? "" :
    `<h2 class="sh-s">Tables worth querying · grouped by what they record, not a pipeline</h2>` +
    dsIds.map(id => `<div class="sh-tables">` + GROUPS.map(g => {
      const items = TBL[id].filter(t => t.group === g.id);
      if (!items.length) return "";
      return `<div class="sh-tg"><h4>${esc(DS[id].label)} · ${esc(g.label)}</h4>` + items.map(t =>
        `<div class="sh-t"><div class="n">${esc(t.name)}</div>
         <div class="k">${esc((t.keys || []).slice(0, 4).join(" · "))}${t.rows && t.rows !== "—" ? " · " + esc(t.rows) : ""}</div></div>`
      ).join("") + `</div>`;
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
    <div class="sh-leg">${CATS.map(c => `<span><i style="background:${c.color}"></i>${esc(c.short)}</span>`).join("")}</div>
    <h2 class="sh-s">Glossary · ${list.length} terms · ${byCat ? "grouped by category" : "A to Z"}${S.q ? " · matching “" + esc(S.q) + "”" : ""}</h2>
    <div class="sh-gloss ${esc(S.dens)}">${glossBody}</div>
    ${tablesBody}
    ${snipsBody}
    <div class="sh-foot">Colour on a card edge = category. Colour inside a drawing = anatomy (structure · dendrite · axon · synapse). ${esc(window.SITE.title)} · ${esc(window.SITE.revision)}</div>`;
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

function render(){
  $$(".view-pane").forEach(p => { p.hidden = p.id !== "view-" + S.view; });
  $$(".view").forEach(b => b.setAttribute("aria-current", b.dataset.view === S.view ? "page" : "false"));
  $("#sortCtl").hidden = S.view === "tables";   // sorting has no meaning there
  if (S.view === "glossary") renderGlossary();
  else if (S.view === "tables") renderTables();
  else { renderSheet(); $("#count").textContent = `${visibleTerms().length} terms on the sheet`; }
}

function applyTheme(){
  const r = document.documentElement;
  if (S.theme === "auto") r.removeAttribute("data-theme");
  else r.setAttribute("data-theme", S.theme);
}

function init(){
  $("#siteTitle").textContent = window.SITE.title;
  $("#siteSub").textContent   = window.SITE.subtitle;
  $("#dbLink").href           = window.SITE.databook;
  $("#rev").textContent       = `${window.SITE.title} · revision ${window.SITE.revision} · ${TERMS.length} terms · ${Object.values(TBL).reduce((n, a) => n + a.length, 0)} tables`;
  document.title = `${window.SITE.title} — ${window.SITE.subtitle}`;

  renderLegends();

  $("#q").value = S.q;
  $$(".dsb").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.ds === S.ds)));
  $$(".sb").forEach(b  => b.setAttribute("aria-pressed", String(b.dataset.sort === S.sort)));
  $("#optArt").checked = S.art; $("#optTables").checked = S.tables; $("#optSnips").checked = S.snips;
  $("#optDens").value = S.dens;
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
  $("#printBtn").onclick = doPrint;

  // language tabs on the recipe blocks
  $("#snips").addEventListener("click", e => {
    const b = e.target.closest("button[data-lang]");
    if (!b || b.disabled) return;
    S.lang = b.dataset.lang; save(); renderSnips();
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
