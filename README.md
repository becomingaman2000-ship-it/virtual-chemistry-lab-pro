# ChemVM — Virtual Chemistry Lab

A fully interactive virtual chemistry laboratory for ZIMSEC and Cambridge students. Drag, mix, react, and observe — all in the browser.

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

This repo is set up for **GitHub Pages** — no paid host required.

### One-time setup

1. Merge this branch to `main`.
2. Copy the workflow into place (GitHub requires this path):

   ```bash
   mkdir -p .github/workflows
   cp docs/deploy-pages.yml .github/workflows/deploy-pages.yml
   git add .github/workflows/deploy-pages.yml
   git commit -m "Add GitHub Pages workflow"
   git push
   ```

3. In the GitHub repo: **Settings → Pages → Build and deployment → Source → GitHub Actions**.
4. Push to `main` (or run the **Deploy to GitHub Pages** workflow manually).
5. The site will be at:

   `https://<your-username>.github.io/virtual-chemistry-lab-pro/`

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
