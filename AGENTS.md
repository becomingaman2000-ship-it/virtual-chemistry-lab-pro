# ChemVM

Virtual chemistry laboratory for ZIMSEC and Cambridge students.

- File-based routes live in `src/routes/`. Do not introduce Next.js-style `app/` or `pages/` trees.
- The lab simulation is client-side. Keep it deployable as a static site (GitHub Pages).
- Prefer relative router `Link`s over hardcoded absolute `href="/…"` so a custom `BASE_PATH` works.
