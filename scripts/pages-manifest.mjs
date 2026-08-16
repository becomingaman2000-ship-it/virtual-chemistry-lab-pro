/**
 * Single source of truth for what gets published to the repository root.
 *
 * GitHub Pages for this project serves from the root of the default branch,
 * so the built site is committed alongside the source. Both the publish step
 * and the CI drift check read this list — keeping it in one place is what
 * stops them disagreeing about which files matter.
 */
export const PUBLISHED = [
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

/**
 * Remove the parts of a built file that legitimately change on every build.
 *
 * TanStack Start stamps each prerendered HTML file with the build time in its
 * router payload (`u:1786863284952`). Two builds of identical source differ
 * only in those digits, so a byte-for-byte comparison would report drift on
 * every run and quickly be ignored. The hashed asset filenames are content
 * derived and stay stable, so everything else is compared verbatim.
 */
export function normalise(name, buffer) {
  if (!name.endsWith(".html")) return buffer;
  return Buffer.from(buffer.toString("utf8").replace(/\bu:\d{13}\b/g, "u:0"), "utf8");
}
