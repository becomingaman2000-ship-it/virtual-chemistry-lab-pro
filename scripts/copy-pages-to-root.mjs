import { cpSync, existsSync, rmSync } from "node:fs";
import { join } from "node:path";

const src = process.env.PAGES_OUT_DIR ?? ".output/public";
const indexPath = join(src, "index.html");
const shellPath = join(src, "_shell.html");
if (!existsSync(indexPath) && existsSync(shellPath)) {
  cpSync(shellPath, indexPath);
}
if (!existsSync(indexPath)) {
  console.error(`copy-pages-to-root: ${src}/index.html is missing — run the build first`);
  process.exit(1);
}

const published = [
  "index.html",
  "404.html",
  "_shell.html",
  "favicon.ico",
  "favicon.svg",
  "apple-touch-icon.png",
  "aurora-logo.png",
  "og-image.jpg",
  ".nojekyll",
  "assets",
  "about",
  "apparatus",
  "atom-builder",
  "chemicals",
  "contact",
  "lab",
  "periodic-table",
  "pricing",
  "structures",
  "syllabus",
];

for (const name of published) {
  const from = join(src, name);
  if (!existsSync(from)) continue;
  rmSync(name, { recursive: true, force: true });
  cpSync(from, name, { recursive: true });
  console.log(`published ${name}`);
}
