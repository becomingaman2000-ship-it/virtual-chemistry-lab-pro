/**
 * Fails if the published site committed at the repository root is out of date
 * with respect to a fresh build of src/.
 *
 * Why this exists: GitHub Pages serves this project from the repository root,
 * so the built bundle is committed. That bundle silently went stale — the root
 * carried a lab bundle in which "Score my attempt" appeared three times, long
 * after the source had been reduced to one button, and the deployed site showed
 * a duplicate button that nobody could reproduce locally.
 *
 * Run the build first, then:  node scripts/check-pages-current.mjs
 * Fix any reported drift with:  npm run publish:pages
 */
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, posix } from "node:path";
import { PUBLISHED, normalise } from "./pages-manifest.mjs";

const src = process.env.PAGES_OUT_DIR ?? ".output/public";

if (!existsSync(src)) {
  console.error(`check-pages-current: ${src} is missing — run the build first.`);
  process.exit(1);
}

/** Every file under `entry`, relative to its parent, depth first. */
function walk(root, entry) {
  const abs = join(root, entry);
  if (!existsSync(abs)) return [];
  if (!statSync(abs).isDirectory()) return [entry];
  return readdirSync(abs)
    .sort()
    .flatMap((child) => walk(root, posix.join(entry, child)));
}

const missing = [];
const changed = [];
const extra = [];

for (const name of PUBLISHED) {
  const built = walk(src, name);
  const committed = walk(".", name);

  for (const rel of built) {
    if (!existsSync(rel)) {
      missing.push(rel);
      continue;
    }
    const a = normalise(rel, readFileSync(join(src, rel)));
    const b = normalise(rel, readFileSync(rel));
    if (!a.equals(b)) changed.push(rel);
  }

  // Stale hashed bundles are the dangerous case: the old lab-*.js sat at the
  // root for weeks because nothing ever pruned files the build stopped emitting.
  const builtSet = new Set(built);
  for (const rel of committed) if (!builtSet.has(rel)) extra.push(rel);
}

const report = (label, files) => {
  if (files.length === 0) return;
  console.error(`\n${label} (${files.length}):`);
  for (const f of files.slice(0, 40)) console.error(`  ${f}`);
  if (files.length > 40) console.error(`  … and ${files.length - 40} more`);
};

if (missing.length || changed.length || extra.length) {
  console.error("check-pages-current: FAIL — the published site is out of date with src/.");
  report("missing from the repository root", missing);
  report("differs from a fresh build", changed);
  report("left over from an older build", extra);
  console.error(`\nRegenerate it with:\n  BASE_PATH=/virtual-chemistry-lab-pro/ npm run build && npm run publish:pages\n`);
  process.exit(1);
}

console.log("check-pages-current: PASS — the published site matches a fresh build of src/.");
