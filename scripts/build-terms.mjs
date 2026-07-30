// One-off transform: _raw.json (from extract.mjs) -> data/terms.js + data/diagrams.js
// Kept in the repo for provenance; not part of the site. Edit data/terms.js directly.
import fs from "node:fs";
import path from "node:path";

const RAW = JSON.parse(fs.readFileSync(process.argv[2], "utf8"));
const OUT = path.resolve(process.argv[3] || "data");

const slug = s => s.toLowerCase()
  .replace(/&amp;/g, "and").replace(/<[^>]+>/g, "")
  .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

// tags in the draft that carry meaning we keep
const FLAG = { amb: "ambiguous", ctx: "context" };

// a term tagged xref is a pointer to a definition that lives in another category;
// drop it when the real definition is present, keep it otherwise.
const primary = new Set();
for (const b of RAW.BUCKETS)
  for (const t of b.terms) if (!(t.tags || []).includes("xref")) primary.add(t.t);

const terms = [];
const diagrams = {};
for (const b of RAW.BUCKETS) {
  for (const t of b.terms) {
    const tags = t.tags || [];
    if (tags.includes("xref") && primary.has(t.t)) continue;
    const id = slug(t.t);
    const datasets = [];
    if (tags.includes("micron")) datasets.push("microns");
    if (tags.includes("v1dd")) datasets.push("v1dd");
    const svg = RAW.DIAG?.[b.id]?.[t.t];
    if (svg) diagrams[id] = svg;
    terms.push({
      id,
      term: t.t,
      category: b.id,
      def: t.d,
      ...(datasets.length ? { datasets } : {}),
      ...(tags.map(x => FLAG[x]).filter(Boolean).length
        ? { flags: tags.map(x => FLAG[x]).filter(Boolean) } : {}),
      ...(t.refs ? { tables: t.refs } : {}),
      ...(svg ? { diagram: id } : {}),
      // brief for an illustration that has not been drawn yet — a contributor backlog
      ...(!svg && t.viz ? { viz_todo: t.viz } : {}),
      ng: {},
    });
  }
}
terms.sort((a, b) => a.term.toLowerCase().localeCompare(b.term.toLowerCase()));

const head = f => `// ${f}
// Plain data. Everything below the first line is JSON — edit it like JSON and
// leave the "window.X =" wrapper alone so the file keeps working over file://.
`;

const body = terms.map(t => "  " + JSON.stringify(t)).join(",\n");
fs.writeFileSync(path.join(OUT, "terms.js"),
  head("terms.js — glossary entries, one object per term") +
  `window.TERMS = [\n${body}\n];\n`);

const dbody = Object.entries(diagrams)
  .map(([k, v]) => `  ${JSON.stringify(k)}: ${JSON.stringify(v)}`).join(",\n");
fs.writeFileSync(path.join(OUT, "diagrams.js"),
  head("diagrams.js — inline SVG illustration per term id (generated, large)") +
  `window.DIAGRAMS = {\n${dbody}\n};\n`);

console.log("terms", terms.length, "diagrams", Object.keys(diagrams).length);
