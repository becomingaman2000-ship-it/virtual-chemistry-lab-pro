import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";
import { defineConfig } from "vite";

function resolveBasePath(): string {
  const raw = process.env.BASE_PATH ?? process.env.VITE_BASE_PATH ?? "/";
  if (raw === "/") return "/";
  return raw.endsWith("/") ? raw : `${raw}/`;
}

const base = resolveBasePath();
const routerBasepath = base === "/" ? undefined : base.replace(/\/$/, "");

export default defineConfig({
  base,
  resolve: {
    tsconfigPaths: true,
  },
  server: {
    host: "0.0.0.0",
    port: 3000,
    // Allow proxied/tunnelled preview hosts (e.g. cloud sandboxes) to reach
    // the dev server; Vite blocks unknown Host headers by default.
    allowedHosts: true,
  },
  preview: {
    host: "0.0.0.0",
    port: 4173,
    allowedHosts: true,
  },
  plugins: [
    tailwindcss(),
    tanstackStart({
      srcDirectory: "src",
      router: routerBasepath ? { basepath: routerBasepath } : undefined,
      server: { entry: "server" },
      spa: {
        enabled: true,
      },
      prerender: {
        enabled: true,
        crawlLinks: false,
        autoStaticPathsDiscovery: true,
      },
    }),
    viteReact(),
    // `renderer: false` stops Nitro auto-adopting the repo-root `index.html`
    // (a committed GitHub Pages publish artifact) as its HTML template. Without
    // this, dev and every subsequent build serve the *previous* deploy's shell,
    // which hardcodes the `/virtual-chemistry-lab-pro/` base path and breaks
    // asset URLs whenever BASE_PATH differs. TanStack Start supplies the real
    // document renderer, so Nitro's fallback is never needed.
    nitro({ renderer: false }),
  ],
});
