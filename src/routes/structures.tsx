import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { PageTransition } from "@/components/PageTransition";
import { Molecule3D } from "@/components/Molecule3D";
import { Atom3D } from "@/components/Atom3D";
import { MOLECULES3D, cpk, type Molecule3 } from "@/data/molecules3d";
import { ELEMENTS, CATEGORY_META, type Category, type Element } from "@/data/periodicTable";
import { Search, RotateCw, Pause, Play } from "lucide-react";

export const Route = createFileRoute("/structures")({
  head: () => ({
    meta: [
      { title: "ChemVM — 3D Atomic & Molecular Structures" },
      { name: "description", content: "Rotate animated 3D models of 40+ molecules and the atomic structure of all 118 elements, with bond angles, hybridisation and polarity." },
      { property: "og:title", content: "ChemVM — 3D Molecular Structures" },
      { property: "og:description", content: "Animated, draggable 3D ball-and-stick models plus every element's electron shells." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: StructuresPage,
});

function StructuresPage() {
  const [tab, setTab] = useState<"molecules" | "elements">("molecules");
  const [q, setQ] = useState("");
  const [sel, setSel] = useState<Molecule3>(MOLECULES3D[0]);
  const [elSel, setElSel] = useState<Element>(ELEMENTS[5]);
  const [cat, setCat] = useState<Category | "all">("all");
  const [spinning, setSpinning] = useState(true);

  const mols = useMemo(() => MOLECULES3D.filter(m =>
    (m.name + m.formula + m.category).toLowerCase().includes(q.toLowerCase())), [q]);
  const els = useMemo(() => ELEMENTS.filter(e =>
    (cat === "all" || e.category === cat) &&
    (e.name + e.symbol + e.z).toLowerCase().includes(q.toLowerCase())), [q, cat]);

  return (
    <PageTransition>
      <div className="mx-auto max-w-6xl px-4 py-6">
        <h1 className="text-3xl font-semibold text-gradient" style={{ fontFamily: "var(--font-display)" }}>Atomic & Molecular Structures</h1>
        <p className="text-sm text-muted-foreground">Drag to rotate, scroll to zoom — every model is live 3D.</p>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <div className="flex rounded-full border border-border/60 p-1">
            {(["molecules", "elements"] as const).map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={`rounded-full px-4 py-1 text-sm capitalize transition ${tab === t ? "bg-navy text-peach dark:bg-turquoise dark:text-charcoal" : "hover:bg-foreground/5"}`}>
                {t === "molecules" ? `Molecules (${MOLECULES3D.length})` : `Elements (${ELEMENTS.length})`}
              </button>
            ))}
          </div>
          <div className="relative">
            <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"/>
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search…"
              className="rounded-full border border-border/60 bg-transparent py-1.5 pl-8 pr-3 text-sm outline-none focus:border-foreground/30"/>
          </div>
          <button onClick={() => setSpinning(s => !s)}
            className="flex items-center gap-1.5 rounded-full border border-border/60 px-3 py-1.5 text-xs hover:bg-foreground/5">
            {spinning ? <Pause size={13}/> : <Play size={13}/>}{spinning ? "Pause spin" : "Resume spin"}
          </button>
          {tab === "elements" && (
            <select value={cat} onChange={(e) => setCat(e.target.value as Category | "all")}
              className="rounded-full border border-border/60 bg-transparent px-3 py-1.5 text-xs">
              <option value="all">All categories</option>
              {Object.entries(CATEGORY_META).filter(([k]) => k !== "unknown").map(([k, m]) => (
                <option key={k} value={k}>{m.label}</option>
              ))}
            </select>
          )}
        </div>

        {tab === "molecules" ? (
          <div className="mt-4 grid gap-4 lg:grid-cols-[240px_1fr]">
            <div className="glass rounded-2xl p-2 max-h-[560px] overflow-auto">
              {mols.map(m => (
                <button key={m.id} onClick={() => setSel(m)}
                  className={`block w-full rounded-xl px-3 py-2 text-left text-sm transition ${sel.id === m.id ? "bg-navy text-peach dark:bg-turquoise dark:text-charcoal" : "hover:bg-foreground/5"}`}>
                  <div className="font-medium">{m.name}</div>
                  <div className="text-xs opacity-70">{m.formula} · {m.category}</div>
                </button>
              ))}
            </div>

            <div className="glass rounded-3xl p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-2xl font-semibold" style={{ fontFamily: "var(--font-display)" }}>{sel.name}</h2>
                  <div className="text-sm text-muted-foreground">{sel.formula} · {sel.shape}</div>
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground"><RotateCw size={13}/> drag to rotate · scroll to zoom</div>
              </div>
              <div className="mt-4 aspect-video w-full overflow-hidden rounded-2xl bg-gradient-to-br from-foreground/5 to-foreground/10">
                <Molecule3D mol={sel} autoRotate={spinning} className="h-full w-full"/>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
                <Field label="Bond angle">{sel.angle}</Field>
                <Field label="Hybridisation">{sel.hybridisation}</Field>
                <Field label="Polarity">{sel.polarity}</Field>
                <Field label="Atoms">{sel.atoms.length}</Field>
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {[...new Set(sel.atoms.map(a => a.el))].map(el => (
                  <span key={el} className="flex items-center gap-1.5 rounded-full border border-border/60 px-2 py-0.5 text-xs">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: cpk(el).color }}/>{el}
                    <span className="text-muted-foreground">×{sel.atoms.filter(a => a.el === el).length}</span>
                  </span>
                ))}
              </div>
              <p className="mt-4 text-sm">{sel.blurb}</p>
            </div>
          </div>
        ) : (
          <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_300px]">
            <div className="glass rounded-3xl p-4">
              <div className="grid max-h-[560px] grid-cols-[repeat(auto-fill,minmax(64px,1fr))] gap-1.5 overflow-auto">
                {els.map(e => (
                  <button key={e.z} onClick={() => setElSel(e)}
                    className={`rounded-lg p-1 text-center transition ${elSel.z === e.z ? "ring-2 ring-offset-1 ring-offset-transparent" : "hover:scale-105"}`}
                    style={{ background: CATEGORY_META[e.category].color }}>
                    <div className="text-[8px] text-black/60">{e.z}</div>
                    <div className="text-sm font-bold text-black/90">{e.symbol}</div>
                    <div className="truncate text-[7px] text-black/60">{e.name}</div>
                  </button>
                ))}
              </div>
            </div>
            <div className="glass rounded-3xl p-5">
              <div className="aspect-square w-full">
                <Atom3D protons={elSel.z} neutrons={Math.round(elSel.mass) - elSel.z} electrons={elSel.z}
                  symbol={elSel.symbol} color={CATEGORY_META[elSel.category].color} speed={spinning ? 1 : 0} className="h-full w-full"/>
              </div>
              <h2 className="mt-2 text-2xl font-semibold" style={{ fontFamily: "var(--font-display)" }}>{elSel.name}</h2>
              <div className="text-sm text-muted-foreground">{CATEGORY_META[elSel.category].label}</div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                <Field label="Protons">{elSel.z}</Field>
                <Field label="Neutrons">{Math.round(elSel.mass) - elSel.z}</Field>
                <Field label="Config">{elSel.config}</Field>
                <Field label="Relative mass">{elSel.mass}</Field>
                <Field label="Shells">{shellString(elSel.z)}</Field>
                <Field label="Oxidation">{elSel.oxidation}</Field>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageTransition>
  );
}

function shellString(z: number) {
  const caps = [2, 8, 18, 32, 32, 18, 8];
  const out: number[] = [];
  let left = z;
  for (const c of caps) { if (left <= 0) break; out.push(Math.min(left, c)); left -= c; }
  return out.join(",");
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="font-mono text-[13px] break-words">{children}</div>
    </div>
  );
}
