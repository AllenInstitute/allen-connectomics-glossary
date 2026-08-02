/* Cheat-sheet builder — manual, drag-and-drop layout onto printed pages.
   Reads the same data/ files as the glossary, so nothing is duplicated here.
   For an auto-flowing sheet that paginates itself, use the Cheat sheet view
   on index.html; this page is for when you want to place things by hand. */

/* ---- adapt the shared data to the builder's flat ITEM list ---- */
const BCAT = Object.fromEntries(
  window.CATEGORIES.map(c => [c.id, {l: c.short, c: c.color}])
    .concat([["special", {l: "BLOCK", c: "#0e7f8c"}]]));

const BW = {term: 180, tables: 400, code: 340, notes: 340};

function esc(s){ return String(s).replace(/[&<>]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;"}[c])); }

// one block per dataset: its tables, grouped by what they record.
// No arrows and no ordering — the groups are a finding aid, not a pipeline.
function tablesBlockHTML(dsId){
  const d = window.DATASETS[dsId];
  return `<div class="tblblock">` + window.TABLE_GROUPS.map(g => {
    const rows = window.TABLES[dsId].filter(t => t.group === g.id);
    if(!rows.length) return "";
    return `<div class="tbg"><div class="tbh">${esc(d.label)} · ${esc(g.label)}</div>` +
      rows.map(t => `<div class="tbr"><div class="tbn">${esc(t.name)}</div>` +
        `<div class="tbk">${esc((t.keys||[]).slice(0,4).join(" · "))}` +
        `${t.rows && t.rows !== "\u2014" ? " · " + esc(t.rows) : ""}</div></div>`).join("") +
      `</div>`;
  }).join("") + `</div>`;
}

function codeBlockHTML(snip){
  const src = snip[window.BUILDER_LANG] || snip.python || "";
  const html = esc(src)
    .replace(/(&quot;.*?&quot;|"[^"\n]*"|'[^'\n]*')/g, '<span class="s">$1</span>')
    .replace(/(^|\n)(\s*)(#[^\n]*)/g, '$1$2<span class="c">$3</span>');
  return `<pre class="pandas">${html}</pre>`;
}

const NOTES_HTML = (() => {
  const m = window.DATASETS.microns, v = window.DATASETS.v1dd;
  return `<div class="notesgrid">
  <div><b>Synapse tables</b>MICrONS <code>${m.synapses}</code> · V1DD <code>${v.synapses}</code></div>
  <div><b>CAVE servers</b>MICrONS <code>${m.server}</code> · V1DD <code>${v.server}</code></div>
  <div><b>Datastacks</b><code>${m.datastack}</code> · <code>${v.datastack}</code></div>
  <div><b>Versions</b>MICrONS ${m.version} · V1DD ${v.version}</div>
  <div><b>ID rule</b>nucleus <code>id</code> static; <code>pt_root_id</code> changes with edits</div>
  <div><b>Coordinates</b>annotations in voxels, meshes in nm; y increases with depth</div></div>`;
})();

window.BUILDER_LANG = "python";

const ITEMS = window.TERMS.map(t => ({
  id: "term|" + t.id, type: "term", bw: BW.term,
  cat: t.category, catL: BCAT[t.category].l, cc: BCAT[t.category].c,
  name: t.term, def: t.def,
  svg: t.diagram ? window.DIAGRAMS[t.diagram] : null,
})).sort((a,b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));

ITEMS.unshift(
  ...Object.keys(window.DATASETS).map(dsId => ({
    id: "special|tables-" + dsId, type: "tables", bw: BW.tables, cat: "special",
    catL: "BLOCK", cc: BCAT.special.c,
    name: window.DATASETS[dsId].label + " tables",
    def: "Grouped by what each table records.",
    html: tablesBlockHTML(dsId),
  })),
  ...window.SNIPPETS.map(s => ({
    id: "special|snip-" + s.id, type: "code", bw: BW.code, cat: "special",
    catL: "BLOCK", cc: BCAT.special.c, name: s.title, def: "Recipe.",
    html: codeBlockHTML(s),
  })),
  {id: "special|notes", type: "notes", bw: BW.notes, cat: "special", catL: "BLOCK",
   cc: BCAT.special.c, name: "Canonical notes", def: "Servers, datastacks, ID rules.",
   html: NOTES_HTML},
);

const ITEM=Object.fromEntries(ITEMS.map(i=>[i.id,i]));

/* ============ state ============ */
const LS="emcheat.builder.v1";
let S={ byId:{}, order:[], step:0, fit:1, sel:null, zTop:1, hMargin:0.4, vMargin:0.4, pages:2 };
const MAXPAGES=12;
const pageList=()=>[...Array(S.pages).keys()];
function initItem(id){ if(!S.byId[id]){ const it=ITEM[id]; S.byId[id]={sel:false,name:it.name,def:it.def,diag:!!it.svg,page:0,x:20,y:20,scale:1,z:1}; } return S.byId[id]; }
ITEMS.forEach(i=>initItem(i.id));
function load(){ try{const j=JSON.parse(localStorage.getItem(LS)); if(j&&j.byId){ S=Object.assign(S,j); ITEMS.forEach(i=>initItem(i.id)); }}catch(e){} }
function save(){ try{localStorage.setItem(LS,JSON.stringify(S));}catch(e){} }
load();

const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));

/* ============ STEP 1: SELECT ============ */
let catOff=new Set(); let searchTxt="";
function buildCatFilters(){
  $("#catfilters").innerHTML=Object.entries(BCAT).map(([k,v])=>
    `<span class="catf" data-cat="${k}"><i style="background:${v.c}"></i>${v.l}</span>`).join("");
  $$(".catf").forEach(el=>el.onclick=()=>{const c=el.dataset.cat; if(catOff.has(c)){catOff.delete(c);el.classList.remove("off");}else{catOff.add(c);el.classList.add("off");} renderSelect();});
}
function miniArt(it){ return it.svg?`<div class="art">${it.svg}</div>`:""; }
function renderSelect(){
  const q=searchTxt.toLowerCase();
  const html=ITEMS.filter(it=>!catOff.has(it.cat) && (!q || it.name.toLowerCase().includes(q) || (it.def||"").toLowerCase().includes(q)))
    .map(it=>{
      const st=S.byId[it.id];
      return `<div class="selcard ${st.sel?"on":""} ${it.type!=="term"?"special":""}" data-id="${it.id}" style="--cc:${it.cc}">
        <div class="chk">${st.sel?"✓":""}</div>
        <div class="eb">${it.catL}</div>
        <div class="nm">${st.name}</div>
        ${miniArt(it)}
        <div class="df">${st.def}</div>
      </div>`;
    }).join("");
  $("#selgrid").innerHTML=html || `<div class="empty">No terms match.</div>`;
  $$(".selcard").forEach(c=>c.onclick=()=>toggleSel(c.dataset.id));
  updateSelCount();
}
function toggleSel(id){ const st=S.byId[id]; st.sel=!st.sel;
  if(st.sel){ if(!S.order.includes(id)) S.order.push(id); } else { S.order=S.order.filter(x=>x!==id); if(S.sel===id)S.sel=null; }
  save(); renderSelect();
}
function selectedIds(){ return S.order.filter(id=>S.byId[id] && S.byId[id].sel); }
function updateSelCount(){ const n=selectedIds().length; $("#selCount").textContent=`${n} selected`; $("#editCount").textContent=`${n} boxes`; }

$("#search").oninput=e=>{searchTxt=e.target.value;renderSelect();};
$("#selAll").onclick=()=>{ const q=searchTxt.toLowerCase();
  ITEMS.filter(it=>!catOff.has(it.cat)&&(!q||it.name.toLowerCase().includes(q)||(it.def||"").toLowerCase().includes(q)))
    .forEach(it=>{const st=S.byId[it.id]; if(!st.sel){st.sel=true; if(!S.order.includes(it.id))S.order.push(it.id);}});
  save(); renderSelect(); };
$("#selNone").onclick=()=>{ selectedIds().forEach(id=>S.byId[id].sel=false); S.order=[]; save(); renderSelect(); };

/* ============ STEP 2: EDIT ============ */
function renderEdit(){
  const ids=selectedIds();
  if(!ids.length){ $("#editlist").innerHTML=`<div class="empty"><div class="big">No boxes selected</div>Go back to step 1 and pick some terms.</div>`; return; }
  $("#editlist").innerHTML=ids.map((id,idx)=>{
    const it=ITEM[id], st=S.byId[id];
    const art=it.svg?`<div class="art">${it.svg}</div><label class="tog"><input type="checkbox" data-diag="${id}" ${st.diag?"checked":""}> show diagram</label>`:"";
    return `<div class="editrow ${st.diag?"":"hidden-diag"}" style="--cc:${it.cc}">
      <div class="ord">
        <button class="btn sm" data-up="${idx}" ${idx===0?"disabled":""}>↑</button>
        <button class="btn sm" data-down="${idx}" ${idx===ids.length-1?"disabled":""}>↓</button>
      </div>
      <div class="fields">
        <span class="eb">${it.catL}</span>
        <input class="nm" data-name="${id}" value="${st.name.replace(/"/g,"&quot;")}">
        <textarea class="df" data-def="${id}">${st.def.replace(/</g,"&lt;")}</textarea>
      </div>
      <div class="side">${art}<button class="btn sm" data-rm="${id}" style="color:var(--danger)">Remove</button></div>
    </div>`;
  }).join("");
  $$("[data-name]").forEach(el=>el.oninput=e=>{S.byId[el.dataset.name].name=e.target.value;save();});
  $$("[data-def]").forEach(el=>el.oninput=e=>{S.byId[el.dataset.def].def=e.target.value;save();});
  $$("[data-diag]").forEach(el=>el.onchange=e=>{S.byId[el.dataset.diag].diag=e.target.checked;save();renderEdit();});
  $$("[data-rm]").forEach(el=>el.onclick=()=>{const id=el.dataset.rm;S.byId[id].sel=false;S.order=S.order.filter(x=>x!==id);save();renderEdit();updateSelCount();});
  $$("[data-up]").forEach(el=>el.onclick=()=>{const i=+el.dataset.up;reorder(i,i-1);});
  $$("[data-down]").forEach(el=>el.onclick=()=>{const i=+el.dataset.down;reorder(i,i+1);});
  updateSelCount();
}
function reorder(i,j){ const ids=selectedIds(); const id=ids[i]; ids.splice(i,1); ids.splice(j,0,id);
  const others=S.order.filter(x=>!ids.includes(x)); S.order=[...ids,...others]; save(); renderEdit(); }

/* ============ STEP 3: ARRANGE ============ */
const PGW=8.5*96, PGH=11*96, GAP=8;
function inW(){ return PGW-2*(S.hMargin||0.4)*96; }
function inH(){ return PGH-2*(S.vMargin||0.4)*96; }
function applyMargins(){
  const hm=+(S.hMargin||0.4), vm=+(S.vMargin||0.4);
  document.documentElement.style.setProperty("--pg-hm", hm+"in");
  document.documentElement.style.setProperty("--pg-vm", vm+"in");
  const hs=$("#hMargin"), vs=$("#vMargin");
  if(hs){ hs.value=hm; $("#hMarginVal").textContent=hm.toFixed(2)+'″'; }
  if(vs){ vs.value=vm; $("#vMarginVal").textContent=vm.toFixed(2)+'″'; }
}
function boxContentHTML(id){
  const it=ITEM[id], st=S.byId[id];
  if(it.type==="term"){
    const art=(st.diag&&it.svg)?`<div class="art">${it.svg}</div>`:"";
    return `<div class="content" style="--cc:${it.cc};width:${it.bw}px"><div class="eb">${it.catL}</div><div class="nm">${st.name}</div>${art}<div class="df">${st.def}</div></div>`;
  }
  return `<div class="content special" style="--cc:${it.cc};width:${it.bw}px"><div class="eb">${it.catL}</div><div class="nm">${st.name}</div>${it.html}</div>`;
}
function measure(){ // render offscreen to get natural heights
  const ids=selectedIds(); const ghost=document.createElement("div");
  ghost.style.cssText="position:absolute;left:-99999px;top:0;visibility:hidden";
  ghost.innerHTML=ids.map(id=>`<div class="box" data-mid="${id}">${boxContentHTML(id)}</div>`).join("");
  document.body.appendChild(ghost);
  ids.forEach(id=>{ const c=ghost.querySelector(`[data-mid="${id}"] .content`); S.byId[id]._w=c.offsetWidth; S.byId[id]._h=c.offsetHeight; });
  document.body.removeChild(ghost);
}
function autoArrange(){
  measure();
  const ids=selectedIds(), IW=inW(), IH=inH();
  let page=0,x=0,y=0,shelf=0;
  ids.forEach(id=>{ const st=S.byId[id]; const s=st.scale*S.fit; const w=st._w*s, h=st._h*s;
    if(x>0 && x+w>IW){ x=0; y+=shelf+GAP; shelf=0; }
    if(y+h>IH){ page++; x=0; y=0; shelf=0; }
    st.page=page; st.x=x; st.y=y; x+=w+GAP; shelf=Math.max(shelf,h); });
  S.pages=Math.min(MAXPAGES, Math.max(1, 1+Math.max(0,...ids.map(id=>S.byId[id].page))));
  ids.forEach(id=>{ S.byId[id].page=Math.min(S.byId[id].page, S.pages-1); });
  save(); renderArrange();
}
function autoFit(){
  measure(); let lo=0.4,hi=1.3,best=0.4;
  for(let k=0;k<18;k++){ const mid=(lo+hi)/2; if(fitsWithin(mid,S.pages)){best=mid;lo=mid;}else hi=mid; }
  S.fit=best;
  const ids=selectedIds(), IW=inW(), IH=inH(); let page=0,x=0,y=0,shelf=0;
  ids.forEach(id=>{const st=S.byId[id];const s=st.scale*S.fit,w=st._w*s,h=st._h*s;
    if(x>0&&x+w>IW){x=0;y+=shelf+GAP;shelf=0;} if(y+h>IH){page++;x=0;y=0;shelf=0;}
    st.page=Math.min(page,S.pages-1);st.x=x;st.y=y;x+=w+GAP;shelf=Math.max(shelf,h);});
  save(); renderArrange();
}
function fitsWithin(fit,maxPages){ const ids=selectedIds(), IW=inW(), IH=inH(); let page=0,x=0,y=0,shelf=0;
  for(const id of ids){ const st=S.byId[id]; const s=st.scale*fit,w=st._w*s,h=st._h*s;
    if(w>IW||h>IH) return false;
    if(x>0&&x+w>IW){x=0;y+=shelf+GAP;shelf=0;} if(y+h>IH){page++;x=0;y=0;shelf=0;}
    if(page>maxPages-1) return false; x+=w+GAP; shelf=Math.max(shelf,h); }
  return true;
}
function renderArrange(){
  const ids=selectedIds();
  buildPages();
  pageList().forEach(p=>$(`.page-inner[data-page="${p}"]`).innerHTML="");
  if(!ids.length){ $("#page0 .page-inner").innerHTML=`<div class="empty"><div class="big">Nothing to arrange</div>Select boxes in step 1.</div>`; updateFitMsg(); return; }
  ids.forEach(id=>{
    const it=ITEM[id], st=S.byId[id];
    const inner=$(`.page-inner[data-page="${st.page}"]`); if(!inner)return;
    const box=document.createElement("div"); box.className="box"+(S.sel===id?" selected":"");
    box.dataset.id=id; box.style.left=st.x+"px"; box.style.top=st.y+"px";
    box.style.transform=`scale(${st.scale*S.fit})`; box.style.zIndex=st.z;
    box.style.setProperty("--cc",it.cc);
    box.innerHTML=`<div class="pgbadge">${st.page+1}</div>${boxContentHTML(id)}<div class="rh"></div>`;
    inner.appendChild(box);
    dragify(box,id);
  });
  updateSelTools(); updateFitMsg();
}
function updateFitMsg(){
  const ids=selectedIds(); let over=false;
  $$(".page").forEach(pg=>pg.classList.remove("over"));
  const IW=inW(), IH=inH();
  ids.forEach(id=>{const st=S.byId[id];const s=st.scale*S.fit;const w=st._w*s,h=st._h*s;
    if(st.page>S.pages-1||st.x+w>IW+2||st.y+h>IH+2){ over=true; const pg=$(`#page${Math.min(st.page,S.pages-1)}`); pg&&pg.classList.add("over"); }});
  const n=ids.length;
  const per=pageList().map(p=>ids.filter(i=>S.byId[i].page===p).length);
  const m=$("#fitMsg"); m.className="fitmsg"+(over?" over":(n?" ok":""));
  m.textContent = n? (over? `\u26a0 overflow \u2014 auto-fit, scale down, or add a page` : `fits \u2713 \u00b7 ` + per.map((c,i)=>`p${i+1}:${c}`).join(" \u00b7 ")) : "";
  $("#pageCount").textContent = S.pages + (S.pages===1?" page":" pages");
}
function selectBox(id){ S.sel=id; $$(".box").forEach(b=>b.classList.toggle("selected",b.dataset.id===id)); updateSelTools(); }
function updateSelTools(){
  const t=$("#selTools"); if(!S.sel||!S.byId[S.sel]||!S.byId[S.sel].sel){t.style.visibility="hidden";return;}
  t.style.visibility="visible"; const st=S.byId[S.sel];
  $("#selName").textContent=st.name.slice(0,28); $("#scaleRange").value=st.scale; $("#scaleVal").textContent=st.scale.toFixed(2)+"×";
  $("#toPage").innerHTML = pageList().map(p=>`<option value="${p}"${p===st.page?" selected":""}>page ${p+1}</option>`).join("");
}
function dragify(box,id){
  box.addEventListener("pointerdown",e=>{
    if(e.target.classList.contains("rh")) return;
    selectBox(id); const st=S.byId[id]; const s=st.scale*S.fit;
    const w=st._w*s,h=st._h*s; const sx=e.clientX,sy=e.clientY,ox=st.x,oy=st.y;
    box.classList.add("dragging"); box.setPointerCapture(e.pointerId);
    const mv=ev=>{ st.x=clamp(ox+(ev.clientX-sx),0,Math.max(0,inW()-w)); st.y=clamp(oy+(ev.clientY-sy),0,Math.max(0,inH()-h)); box.style.left=st.x+"px"; box.style.top=st.y+"px"; };
    const up=ev=>{ box.classList.remove("dragging"); box.releasePointerCapture(e.pointerId); box.removeEventListener("pointermove",mv); box.removeEventListener("pointerup",up); save(); updateFitMsg(); };
    box.addEventListener("pointermove",mv); box.addEventListener("pointerup",up);
  });
  box.querySelector(".rh").addEventListener("pointerdown",e=>{
    e.stopPropagation(); selectBox(id); const st=S.byId[id]; const sx=e.clientX, os=st.scale, bw=st._w;
    box.setPointerCapture(e.pointerId);
    const mv=ev=>{ st.scale=clamp(os+(ev.clientX-sx)/bw,0.4,2.5); box.style.transform=`scale(${st.scale*S.fit})`; $("#scaleRange").value=st.scale; $("#scaleVal").textContent=st.scale.toFixed(2)+"×"; };
    const up=ev=>{ box.releasePointerCapture(e.pointerId); box.removeEventListener("pointermove",mv); box.removeEventListener("pointerup",up); save(); updateFitMsg(); };
    box.addEventListener("pointermove",mv); box.addEventListener("pointerup",up);
  });
}
$("#scaleRange").oninput=e=>{ if(!S.sel)return; S.byId[S.sel].scale=+e.target.value; $("#scaleVal").textContent=(+e.target.value).toFixed(2)+"×";
  const box=$(`.box[data-id="${S.sel}"]`); if(box)box.style.transform=`scale(${S.byId[S.sel].scale*S.fit})`; save(); updateFitMsg(); };
$("#toPage").onchange=e=>{ if(!S.sel)return; S.byId[S.sel].page=+e.target.value; save(); renderArrange(); };
$("#addPage").onclick=()=>{ if(S.pages<MAXPAGES){ S.pages++; save(); renderArrange(); } };
$("#delPage").onclick=()=>{ if(S.pages<=1) return;
  S.pages--; selectedIds().forEach(id=>{ S.byId[id].page=Math.min(S.byId[id].page,S.pages-1); });
  save(); renderArrange(); };
$("#toFront").onclick=()=>{ if(!S.sel)return; S.byId[S.sel].z=++S.zTop; save(); renderArrange(); };
$("#autoAll").onclick=()=>{ S.fit=1; autoArrange(); };
$("#autoFit").onclick=autoFit;

// the page canvases are generated, so the count can change at any time
function buildPages(){
  const host=$("#pages");
  if(host.childElementCount===S.pages) return;
  host.innerHTML=pageList().map(p=>
    `<div class="pagewrap"><div class="pagelbl">Page ${p+1}</div>`+
    `<div class="page" id="page${p}"><div class="page-inner" data-page="${p}"></div></div></div>`).join("");
}
$("#hMargin").oninput=e=>{ S.hMargin=+e.target.value; $("#hMarginVal").textContent=(+e.target.value).toFixed(2)+'″'; applyMargins(); save(); renderArrange(); };
$("#vMargin").oninput=e=>{ S.vMargin=+e.target.value; $("#vMarginVal").textContent=(+e.target.value).toFixed(2)+'″'; applyMargins(); save(); renderArrange(); };
function doPrint(){
  /* window.print() is blocked inside sandboxed iframes (e.g. claude.ai artifact viewer).
     Detect the iframe context and guide the user instead. */
  let inFrame=false;
  try{ inFrame=(self!==top); }catch(e){ inFrame=true; }
  if(inFrame){
    alert("This page is running inside an embedded preview, where browsers block printing.\n\nOpen builder.html directly in a browser tab and press Cmd+P / Ctrl+P.\n\nIn the print dialog choose US Letter, portrait, and turn on background graphics.");
    return;
  }
  window.print();
}
$("#printBtn").onclick=doPrint;

/* ============ step navigation ============ */
function go(step){
  S.step=step; save();
  [0,1,2].forEach(i=>{ $("#view"+i).hidden=(i!==step); const s=$("#st"+i); s.classList.toggle("active",i===step); s.classList.toggle("done",i<step); });
  const nb=$("#nextBtn");
  if(step===0){ nb.textContent="Next: Edit →"; nb.disabled=false; renderSelect(); }
  if(step===1){ nb.textContent="Next: Arrange →"; renderEdit(); }
  if(step===2){ nb.textContent="Print / Save PDF"; applyMargins(); setTimeout(()=>{ if(selectedIds().every(id=>S.byId[id].x===20&&S.byId[id].y===20)) autoArrange(); else { measure(); renderArrange(); } },30); }
}
$("#nextBtn").onclick=()=>{ if(S.step<2) go(S.step+1); else doPrint(); };
$$(".step").forEach(s=>s.onclick=()=>go(+s.dataset.step));
$("#resetBtn").onclick=()=>{ if(confirm("Clear all selections and edits?")){ localStorage.removeItem(LS); location.reload(); } };
$("#pages").addEventListener("pointerdown",e=>{ if(e.target.closest(".page-inner")===e.target){ S.sel=null; $$(".box").forEach(b=>b.classList.remove("selected")); updateSelTools(); } });

buildCatFilters(); go(S.step||0);
