import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PageTransition } from "@/components/PageTransition";
import { ELEMENTS, CATEGORY_META, type Category, type Element } from "@/data/periodicTable";
import { X } from "lucide-react";

export const Route = createFileRoute("/periodic-table")({
  head: () => ({
    meta: [
      { title: "ChemVM — Interactive Periodic Table" },
      { name: "description", content: "Explore all 118 elements with category filters, electron configurations, oxidation states, densities and real-world uses in a glassmorphic dossier." },
      { property: "og:title", content: "ChemVM — Interactive Periodic Table" },
      { property: "og:description", content: "Filter by alkali metals, halogens, noble gases and more. Click any element for a full dossier." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PeriodicTablePage,
});

function PeriodicTablePage() {
  const [filter, setFilter] = useState<Category | "all">("all");
  const [selected, setSelected] = useState<Element | null>(null);

  const cats = useMemo(() => Object.entries(CATEGORY_META).filter(([k]) => k !== "unknown"), []);

  return (
    <PageTransition>
      <div className="mx-auto max-w-[1600px] px-3 py-4">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h1 className="text-2xl font-semibold text-gradient" style={{ fontFamily: "var(--font-display)" }}>
              Periodic Table
            </h1>
            <p className="text-xs text-muted-foreground">Click a category to isolate it — click any element for the full dossier.</p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setFilter("all")}
              className={`rounded-full px-3 py-1 text-xs transition ${filter === "all" ? "bg-navy text-peach dark:bg-turquoise dark:text-charcoal" : "border border-border/60 hover:bg-foreground/5"}`}
            >All</button>
            {cats.map(([k, meta]) => (
              <button
                key={k}
                onClick={() => setFilter(k as Category)}
                className={`rounded-full px-3 py-1 text-xs transition ${filter === k ? "text-white" : "border border-border/60 hover:bg-foreground/5"}`}
                style={filter === k ? { background: meta.color } : undefined}
              >{meta.label}</button>
            ))}
          </div>
        </div>

        <div className="grid gap-[3px]" style={{ gridTemplateColumns: "repeat(18, minmax(0, 1fr))" }}>
          {ELEMENTS.filter(e => !(e.category === "lanthanide" || e.category === "actinide") || e.z === 57 || e.z === 89).map((e) => {
            const meta = CATEGORY_META[e.category];
            const dim = filter !== "all" && filter !== e.category;
            const col = e.group;
            const row = e.period;
            return (
              <button
                key={e.z}
                onClick={() => setSelected(e)}
                className="group relative aspect-square rounded-md text-left transition-all"
                style={{
                  gridColumn: col,
                  gridRow: row,
                  background: meta.color,
                  opacity: dim ? 0.15 : 1,
                  boxShadow: !dim && filter !== "all" ? `0 0 12px ${meta.color}` : undefined,
                  filter: dim ? "grayscale(0.8)" : undefined,
                }}
              >
                <div className="p-[3px] leading-none text-[8px] text-black/70">{e.z}</div>
                <div className="text-center text-[13px] font-bold text-black/90">{e.symbol}</div>
                <div className="truncate text-center text-[6px] text-black/60">{e.name}</div>
              </button>
            );
          })}

          {/* Lanthanide/Actinide placeholders */}
          <div style={{ gridColumn: 3, gridRow: 6, background: "#d4a373" }} className="aspect-square rounded-md text-center text-[9px] flex items-center justify-center text-black/70">57-71</div>
          <div style={{ gridColumn: 3, gridRow: 7, background: "#c084fc" }} className="aspect-square rounded-md text-center text-[9px] flex items-center justify-center text-black/70">89-103</div>
        </div>

        <div className="mt-4 grid gap-[3px]" style={{ gridTemplateColumns: "repeat(15, minmax(0, 1fr))" }}>
          {ELEMENTS.filter(e => (e.category === "lanthanide" && e.z >= 58) || (e.category === "actinide" && e.z >= 90)).map((e) => {
            const meta = CATEGORY_META[e.category];
            const dim = filter !== "all" && filter !== e.category;
            return (
              <button key={e.z} onClick={() => setSelected(e)}
                className="aspect-square rounded-md text-left transition-all"
                style={{
                  background: meta.color,
                  opacity: dim ? 0.15 : 1,
                  boxShadow: !dim && filter !== "all" ? `0 0 12px ${meta.color}` : undefined,
                }}>
                <div className="p-[3px] leading-none text-[8px] text-black/70">{e.z}</div>
                <div className="text-center text-[13px] font-bold text-black/90">{e.symbol}</div>
                <div className="truncate text-center text-[6px] text-black/60">{e.name}</div>
              </button>
            );
          })}
        </div>

        <AnimatePresence>
          {selected && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 grid place-items-center bg-black/40 backdrop-blur-sm p-4"
              onClick={() => setSelected(null)}
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="glass relative w-full max-w-2xl rounded-3xl p-8"
                style={{ boxShadow: `0 20px 60px -20px ${CATEGORY_META[selected.category].color}` }}
              >
                <button onClick={() => setSelected(null)} className="absolute right-4 top-4 rounded-full p-2 hover:bg-foreground/10"><X size={18}/></button>
                <div className="flex items-start gap-6">
                  <div className="rounded-2xl p-6 text-center" style={{ background: CATEGORY_META[selected.category].color }}>
                    <div className="text-xs text-black/70">{selected.z}</div>
                    <div className="text-5xl font-bold text-black/90" style={{ fontFamily: "var(--font-display)" }}>{selected.symbol}</div>
                    <div className="mt-1 text-xs text-black/70">{selected.mass}</div>
                  </div>
                  <div className="flex-1">
                    <h2 className="text-3xl font-semibold" style={{ fontFamily: "var(--font-display)" }}>{selected.name}</h2>
                    <div className="text-sm text-muted-foreground">{CATEGORY_META[selected.category].label}</div>
                    <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                      <Field label="Group / Period">{selected.group} / {selected.period}</Field>
                      <Field label="Electron config">{selected.config}</Field>
                      <Field label="Oxidation">{selected.oxidation}</Field>
                      <Field label="Electronegativity">{selected.electronegativity ?? "—"}</Field>
                    </div>
                    <div className="mt-4 rounded-xl border border-border/60 bg-foreground/5 p-3 text-sm">
                      <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Common uses</div>
                      {selected.uses}
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageTransition>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="font-mono text-[13px]">{children}</div>
    </div>
  );
}