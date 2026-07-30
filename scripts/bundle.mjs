// Inline every stylesheet and script into one self-contained HTML file, for
// emailing to someone or hosting where a folder is inconvenient.
//
//   node scripts/bundle.mjs                 -> dist/allen-connectomics-glossary.html
//   node scripts/bundle.mjs builder.html    -> dist/builder.html
//
// The bundle is a build artefact. Edit data/ and re-run; never edit dist/.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const src = process.argv[2] || "index.html";
const outName = src === "index.html" ? "allen-connectomics-glossary.html" : path.basename(src);

const read = p => fs.readFileSync(path.join(ROOT, p), "utf8");
// a </script> inside a string literal would close the host tag early
const safe = s => s.replace(/<\/script>/gi, "<\\/script>");

const shell = read(src)
  .replace(/href="(index|builder)\.html"/g,
           'href="#" onclick="return false" title="not available in the single-file bundle"');

// check the page shell for anything still pointing at a file, before the
// inlined scripts fill it with template literals that look like URLs
const left = [...shell.matchAll(/(?:src|href)="(?!#|https?:|mailto:|data:)([^"]+)"/g)]
  .map(m => m[1]).filter(p => !fs.existsSync(path.join(ROOT, p)));
if (left.length) console.warn("warning: unresolved local reference(s):", left);

const html = shell
  .replace(/<link rel="stylesheet" href="([^"]+)">/g,
           (_, href) => `<style>\n${read(href)}\n</style>`)
  .replace(/<script src="([^"]+)"><\/script>/g,
           (_, s) => `<script>\n${safe(read(s))}\n</script>`);

fs.mkdirSync(path.join(ROOT, "dist"), { recursive: true });
fs.writeFileSync(path.join(ROOT, "dist", outName), html);
console.log(`dist/${outName}  ${(html.length / 1024).toFixed(0)} kB`);
