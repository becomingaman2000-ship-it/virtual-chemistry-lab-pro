import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { ThemeProvider } from "../components/ThemeProvider";
import { SiteHeader } from "../components/SiteHeader";
import { SiteFooter } from "../components/SiteFooter";
import { I18nProvider } from "../lib/i18n";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="glass max-w-md rounded-3xl p-10 text-center">
        <h1 className="text-7xl font-bold text-gradient" style={{ fontFamily: "var(--font-display)" }}>404</h1>
        <h2 className="mt-4 text-xl font-semibold">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">This experiment doesn't exist yet.</p>
        <Link
          to="/"
          className="mt-6 inline-flex items-center justify-center rounded-full bg-navy px-5 py-2.5 text-sm font-medium text-peach transition hover:opacity-90 dark:bg-turquoise dark:text-charcoal"
        >
          Return to bench
        </Link>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  const router = useRouter();
  useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="glass max-w-md rounded-3xl p-10 text-center">
        <h1 className="text-xl font-semibold">This page didn't load</h1>
        <p className="mt-2 text-sm text-muted-foreground">Something went wrong on our end.</p>
        <div className="mt-6 flex justify-center gap-2">
          <button
            onClick={() => { router.invalidate(); reset(); }}
            className="rounded-full bg-navy px-5 py-2.5 text-sm font-medium text-peach dark:bg-turquoise dark:text-charcoal"
          >
            Try again
          </button>
          <Link to="/" className="rounded-full border border-border px-5 py-2.5 text-sm">Home</Link>
        </div>
      </div>
    </div>
  );
}

const asset = (path: string) => `${import.meta.env.BASE_URL}${path.replace(/^\//, "")}`;
const ogImage = "https://becomingaman2000-ship-it.github.io/virtual-chemistry-lab-pro/og-image.jpg";

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "ChemVM — Virtual Chemistry Laboratory" },
      { name: "description", content: "A fully interactive virtual chemistry laboratory for ZIMSEC and Cambridge students. Drag, mix, react, and observe — powered by a DWSIM-inspired simulation engine." },
      { name: "author", content: "Project X" },
      { property: "og:title", content: "ChemVM — Virtual Chemistry Laboratory" },
      { property: "og:description", content: "Experience chemistry without limits. Curriculum-aligned virtual lab for ZIMSEC & Cambridge." },
      { property: "og:type", content: "website" },
      { property: "og:image", content: ogImage },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: ogImage },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: asset("favicon.svg"), type: "image/svg+xml" },
      { rel: "icon", href: asset("favicon.ico"), type: "image/x-icon" },
      { rel: "apple-touch-icon", href: asset("apple-touch-icon.png") },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head><HeadContent /></head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <I18nProvider>
          <div className="relative min-h-screen">
            <SiteHeader />
            <main>
              <Outlet />
            </main>
            <SiteFooter />
          </div>
        </I18nProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
