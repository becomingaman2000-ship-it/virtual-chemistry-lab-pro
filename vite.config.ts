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
  },
  preview: {
    host: "0.0.0.0",
    port: 4173,
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
    nitro(),
  ],
});
