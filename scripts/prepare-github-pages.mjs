import { copyFileSync, existsSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const outDir = process.env.PAGES_OUT_DIR ?? ".output/public";
const candidates = ["_shell.html", "index.html"];
const shell = candidates.map((name) => join(outDir, name)).find((path) => existsSync(path));

if (!shell) {
  console.error(`prepare-github-pages: no SPA shell found in ${outDir}`);
  process.exit(1);
}

copyFileSync(shell, join(outDir, "404.html"));
writeFileSync(join(outDir, ".nojekyll"), "");
console.log(`prepare-github-pages: copied ${shell} → 404.html and wrote .nojekyll`);
