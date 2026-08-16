import { cpSync, existsSync, rmSync } from "node:fs";
import { join } from "node:path";
import { PUBLISHED } from "./pages-manifest.mjs";

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


for (const name of PUBLISHED) {
  const from = join(src, name);
  if (!existsSync(from)) continue;
  rmSync(name, { recursive: true, force: true });
  cpSync(from, name, { recursive: true });
  console.log(`published ${name}`);
}
