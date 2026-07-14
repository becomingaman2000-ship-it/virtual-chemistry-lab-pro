import { Link } from "@tanstack/react-router";
import { Moon, Sun, Menu, X, Globe } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AuroraLogo } from "./AuroraLogo";
import { useTheme } from "./ThemeProvider";
import { useI18n, LANGUAGES, type Lang } from "@/lib/i18n";

const nav = [
  { to: "/", key: "nav.home" },
  { to: "/lab", key: "nav.lab" },
  { to: "/periodic-table", key: "nav.periodic" },
  { to: "/atom-builder", key: "nav.atomBuilder" },
  { to: "/structures", key: "nav.structures" },
  { to: "/chemicals", key: "nav.chemicals" },
  { to: "/pricing", key: "nav.pricing" },
] as const;

export function SiteHeader() {
  const { theme, toggle } = useTheme();
  const { t, lang, setLang } = useI18n();
  const [open, setOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 px-4 pt-4">
      <div className="glass mx-auto flex max-w-7xl items-center justify-between rounded-2xl px-4 py-2.5 md:px-6">
        <Link to="/" className="flex items-center" aria-label="ChemVM home">
          <AuroraLogo size={28} />
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {nav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className="rounded-full px-3.5 py-1.5 text-sm text-foreground/75 transition hover:bg-foreground/5 hover:text-foreground"
              activeProps={{ className: "bg-foreground/8 text-foreground font-medium" }}
            >
              {t(n.key)}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <div className="relative">
            <button
              onClick={() => setLangOpen((v) => !v)}
              aria-label="Language"
              className="grid h-9 w-9 place-items-center rounded-full border border-border/60 bg-background/40 text-foreground transition hover:bg-foreground/5"
            >
              <Globe size={16} />
            </button>
            <AnimatePresence>
              {langOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                  className="glass absolute right-0 mt-2 w-40 overflow-hidden rounded-2xl p-1 z-50"
                >
                  {LANGUAGES.map((l) => (
                    <button
                      key={l.code}
                      onClick={() => { setLang(l.code as Lang); setLangOpen(false); }}
                      className={`flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm ${lang === l.code ? "bg-foreground/10 font-medium" : "hover:bg-foreground/5"}`}
                    >
                      <span>{l.flag}</span>{l.label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <button
            onClick={toggle}
            aria-label="Toggle theme"
            className="grid h-9 w-9 place-items-center rounded-full border border-border/60 bg-background/40 text-foreground transition hover:bg-foreground/5"
          >
            {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <Link
            to="/lab"
            className="hidden rounded-full bg-navy px-4 py-2 text-sm font-medium text-peach shadow-elegant transition hover:opacity-90 dark:bg-turquoise dark:text-charcoal md:inline-flex"
          >
            {t("nav.launch")}
          </Link>
          <button
            onClick={() => setOpen((v) => !v)}
            className="grid h-9 w-9 place-items-center rounded-full border border-border/60 md:hidden"
            aria-label="Menu"
          >
            {open ? <X size={16} /> : <Menu size={16} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="glass mx-auto mt-2 max-w-7xl rounded-2xl p-3 md:hidden"
          >
            {nav.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                onClick={() => setOpen(false)}
                className="block rounded-lg px-3 py-2 text-sm hover:bg-foreground/5"
              >
                {t(n.key)}
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
