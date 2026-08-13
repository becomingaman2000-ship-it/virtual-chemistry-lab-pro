# ChemVM — Virtual Chemistry Lab

A fully interactive virtual chemistry laboratory for ZIMSEC and Cambridge students. Drag, mix, react, and observe — all in the browser.

**Live:** https://becomingaman2000-ship-it.github.io/virtual-chemistry-lab-pro/

## Local development

```bash
bun install
bun run dev
```

Then open [http://localhost:3000](http://localhost:3000).

`npm install` / `npm run dev` also work if you prefer npm.

## Build a static site

```bash
bun run build
```

The deployable files land in `.output/public` (plus a `404.html` SPA fallback and `.nojekyll` for GitHub Pages).

## Host for free on GitHub Pages

The live site is:

**https://becomingaman2000-ship-it.github.io/virtual-chemistry-lab-pro/**

GitHub Pages serves this branch's root (`index.html`, `assets/`, and the prerendered route folders). Republish after a source change with:

```bash
BASE_PATH=/virtual-chemistry-lab-pro/ bun run build
bun run publish:pages
git add index.html 404.html _shell.html .nojekyll favicon.ico assets about apparatus atom-builder chemicals contact lab periodic-table pricing structures syllabus
git commit -m "Publish GitHub Pages build"
git push
```

### Custom domain or `username.github.io` root site

By default the build uses a project-site base path (`/virtual-chemistry-lab-pro/`).

If you attach a custom domain, or this repo *is* `username.github.io`, add a repository variable:

- **Settings → Secrets and variables → Actions → Variables**
- Name: `BASE_PATH`
- Value: `/`

### Local preview of the production build

```bash
BASE_PATH=/ bun run build
bun run preview
```

## Scripts

| Command | What it does |
| --- | --- |
| `bun run dev` | Vite dev server |
| `bun run build` | Static production build for GitHub Pages |
| `bun run preview` | Preview the last Vite build |
| `bun run lint` | ESLint |
| `bun run format` | Prettier |
