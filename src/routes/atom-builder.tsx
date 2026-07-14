import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { PageTransition } from "@/components/PageTransition";
import { ELEMENTS } from "@/data/periodicTable";
import { Plus, Minus } from "lucide-react";

export const Route = createFileRoute("/atom-builder")({
  head: () => ({
    meta: [
      { title: "ChemVM — Quantitative Chemistry & Atom Builder" },
      { name: "description", content: "Build atoms proton by proton, run mole/mass/concentration calculations, and see your element identify itself in real time." },
      { property: "og:title", content: "ChemVM — Atom Builder" },
      { property: "og:description", content: "Add protons, neutrons and electrons to build any atom. Includes stoichiometry calculators." },
    ],
  }),
  component: AtomBuilderPage,
});

function AtomBuilderPage() {
  const [p, setP] = useState(1);
  const [n, setN] = useState(0);
  const [e, setE] = useState(1);
  const el = useMemo(() => ELEMENTS.find(x => x.z === p), [p]);
  const charge = p - e;
  const mass = p + n;

  // Calculator state
  const [moles, setMoles] = useState("1");
  const [molarMass, setMolarMass] = useState("18.02");
  const grams = (parseFloat(moles) || 0) * (parseFloat(molarMass) || 0);

  const [conc, setConc] = useState("0.1");
  const [vol, setVol] = useState("250");
  const molesFromConc = (parseFloat(conc) || 0) * (parseFloat(vol) || 0) / 1000;

  const shells = electronShells(e);

  return (
    <PageTransition>
      <div className="mx-auto max-w-6xl px-4 py-6">
        <h1 className="text-3xl font-semibold text-gradient" style={{ fontFamily: "var(--font-display)" }}>Quantitative Chemistry & Atom Builder</h1>
        <p className="text-sm text-muted-foreground">Add or remove particles — the element identifies itself.</p>

        <div className="mt-6 grid gap-4 lg:grid-cols-[1.2fr_1fr]">
          <div className="glass rounded-3xl p-6">
            <div className="relative mx-auto aspect-square w-full max-w-md">
              <svg viewBox="-160 -160 320 320" className="h-full w-full">
                {shells.map((count, i) => {
                  const r = 40 + i * 32;
                  return (
                    <g key={i}>
                      <circle cx="0" cy="0" r={r} fill="none" stroke="currentColor" strokeOpacity="0.2" strokeDasharray="2 4"/>
                      {Array.from({ length: count }).map((_, j) => {
                        const a = (j / count) * Math.PI * 2;
                        return <circle key={j} cx={Math.cos(a) * r} cy={Math.sin(a) * r} r="4" fill="#6aa9e9"/>;
                      })}
                    </g>
                  );
                })}
                <circle cx="0" cy="0" r="22" fill="url(#nuc)"/>
                <defs>
                  <radialGradient id="nuc">
                    <stop offset="0" stopColor="#ff8a5c"/>
                    <stop offset="1" stopColor="#a78bfa"/>
                  </radialGradient>
                </defs>
                <text x="0" y="4" textAnchor="middle" fontSize="14" fill="white" fontWeight="700">{el?.symbol ?? "?"}</text>
              </svg>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2">
              <Particle label="Protons" value={p} onDec={() => setP(Math.max(1, p - 1))} onInc={() => setP(Math.min(118, p + 1))}/>
              <Particle label="Neutrons" value={n} onDec={() => setN(Math.max(0, n - 1))} onInc={() => setN(n + 1)}/>
              <Particle label="Electrons" value={e} onDec={() => setE(Math.max(0, e - 1))} onInc={() => setE(e + 1)}/>
            </div>
          </div>

          <div className="space-y-4">
            <div className="glass rounded-3xl p-6">
              <div className="text-xs uppercase tracking-wide text-muted-foreground">Identification</div>
              <div className="mt-1 text-2xl font-semibold" style={{ fontFamily: "var(--font-display)" }}>
                {el?.name ?? "Undefined"} {charge !== 0 && <span className="text-lg text-muted-foreground">({charge > 0 ? `+${charge}` : charge})</span>}
              </div>
              <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                <Stat label="Mass number">{mass}</Stat>
                <Stat label="Charge">{charge > 0 ? `+${charge}` : charge}</Stat>
                <Stat label="Config">{el?.config ?? "—"}</Stat>
                <Stat label="Category">{el?.category ?? "—"}</Stat>
              </div>
            </div>

            <div className="glass rounded-3xl p-6">
              <div className="text-xs uppercase tracking-wide text-muted-foreground">Mole ↔ Mass</div>
              <div className="mt-2 flex items-center gap-2 text-sm">
                <input value={moles} onChange={ev => setMoles(ev.target.value)} className="w-20 rounded-lg border border-border bg-transparent px-2 py-1"/>
                mol × <input value={molarMass} onChange={ev => setMolarMass(ev.target.value)} className="w-24 rounded-lg border border-border bg-transparent px-2 py-1"/> g/mol
                <span className="ml-auto font-mono">= {grams.toFixed(3)} g</span>
              </div>
            </div>

            <div className="glass rounded-3xl p-6">
              <div className="text-xs uppercase tracking-wide text-muted-foreground">Concentration → Moles</div>
              <div className="mt-2 flex items-center gap-2 text-sm">
                <input value={conc} onChange={ev => setConc(ev.target.value)} className="w-20 rounded-lg border border-border bg-transparent px-2 py-1"/>
                M × <input value={vol} onChange={ev => setVol(ev.target.value)} className="w-20 rounded-lg border border-border bg-transparent px-2 py-1"/> mL
                <span className="ml-auto font-mono">= {molesFromConc.toFixed(4)} mol</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}

function electronShells(total: number): number[] {
  const caps = [2, 8, 18, 32, 32, 18, 8];
  const shells: number[] = [];
  let left = total;
  for (const c of caps) { if (left <= 0) break; shells.push(Math.min(left, c)); left -= c; }
  return shells;
}

function Particle({ label, value, onInc, onDec }: { label: string; value: number; onInc: () => void; onDec: () => void }) {
  return (
    <div className="rounded-2xl border border-border/60 p-3 text-center">
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="my-1 text-2xl font-semibold">{value}</div>
      <div className="flex justify-center gap-1">
        <button onClick={onDec} className="rounded-full border border-border p-1 hover:bg-foreground/5"><Minus size={14}/></button>
        <button onClick={onInc} className="rounded-full border border-border p-1 hover:bg-foreground/5"><Plus size={14}/></button>
      </div>
    </div>
  );
}

function Stat({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border/60 p-2">
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="font-mono text-sm truncate">{children}</div>
    </div>
  );
}