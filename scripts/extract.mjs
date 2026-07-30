// One-off extraction: pull BUCKETS / LINEAGE_LANES / __DIAG out of the original
// single-file cheat sheet draft and emit the repo's shared data files.
// Kept in the repo for provenance; not part of the site.
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

const SRC = process.argv[2];
const OUT = path.resolve(process.argv[3] || "data");
const html = fs.readFileSync(SRC, "utf8");

const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m => m[1]);
const sandbox = { window: {}, document: { getElementById: () => ({ set innerHTML(_) {} }) } };
sandbox.window.window = sandbox.window;
vm.createContext(sandbox);
// top-level `const` in a script does not land on the sandbox global, so ask for it explicitly
const capture = `;try{globalThis.__CAP=Object.assign(globalThis.__CAP||{},{` +
  ["BUCKETS", "LINEAGE_LANES", "BCAT", "STAGES"]
    .map(n => `${n}: typeof ${n}!=="undefined" ? ${n} : (globalThis.__CAP||{}).${n}`).join(",") +
  `})}catch(e){}`;
for (const s of scripts) {
  try { vm.runInContext(s + capture, sandbox); } catch (e) { /* render script needs a DOM; data already captured */ }
}

const { BUCKETS, LINEAGE_LANES } = sandbox.__CAP;
const DIAG = sandbox.window.__DIAG || {};

fs.mkdirSync(OUT, { recursive: true });
fs.writeFileSync(path.join(OUT, "_raw.json"), JSON.stringify({ BUCKETS, LINEAGE_LANES, DIAG }, null, 1));
console.log("buckets", BUCKETS.length,
            "terms", BUCKETS.reduce((n, b) => n + b.terms.length, 0),
            "lanes", LINEAGE_LANES.length,
            "diagrams", Object.values(DIAG).reduce((n, d) => n + Object.keys(d).length, 0));
