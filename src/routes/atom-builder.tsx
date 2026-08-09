import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { PageTransition } from "@/components/PageTransition";
import { Atom3D } from "@/components/Atom3D";
import { ELEMENTS, CATEGORY_META } from "@/data/periodicTable";
import { Plus, Minus } from "lucide-react";

export const Route = createFileRoute("/atom-builder")({
  head: () => ({
    meta: [
      { title: "ChemVM — Quantitative Chemistry & 3D Atom Builder" },
      { name: "description", content: "Build atoms in animated 3D, read isotope notation and stability, and run accurate molar mass, mole, concentration, gas volume and dilution calculations." },
      { property: "og:title", content: "ChemVM — 3D Atom Builder" },
      { property: "og:description", content: "Animated 3D atoms plus a formula-aware molar mass and stoichiometry calculator." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AtomBuilderPage,
});

const MASS: Record<string, number> = Object.fromEntries(ELEMENTS.map(e => [e.symbol, e.mass]));

/** Parses formulas with nested brackets and hydrates, e.g. CuSO4.5H2O */
export function molarMass(formula: string): { mass: number; parts: Record<string, number>; error?: string } {
  const parts: Record<string, number> = {};
  const segments = formula.replace(/\s/g, "").split(/[.·]/).filter(Boolean);
  for (const seg of segments) {
    const lead = seg.match(/^(\d+)/);
    const mult = lead ? parseInt(lead[1], 10) : 1;
    const body = lead ? seg.slice(lead[1].length) : seg;
    const stack: Record<string, number>[] = [{}];
    let i = 0;
    while (i < body.length) {
      const ch = body[i];
      if (ch === "(" || ch === "[") { stack.push({}); i++; continue; }
      if (ch === ")" || ch === "]") {
        const top = stack.pop()!;
        i++;
        const num = body.slice(i).match(/^\d+/);
        const k = num ? parseInt(num[0], 10) : 1;
        if (num) i += num[0].length;
        const cur = stack[stack.length - 1];
        for (const [el, n] of Object.entries(top)) cur[el] = (cur[el] ?? 0) + n * k;
        continue;
      }
      const m = body.slice(i).match(/^([A-Z][a-z]?)(\d*)/);
      if (!m || !m[1]) return { mass: 0, parts: {}, error: `Unexpected "${ch}"` };
      if (!(m[1] in MASS)) return { mass: 0, parts: {}, error: `Unknown element "${m[1]}"` };
      const cur = stack[stack.length - 1];
      cur[m[1]] = (cur[m[1]] ?? 0) + (m[2] ? parseInt(m[2], 10) : 1);
      i += m[0].length;
    }
    if (stack.length !== 1) return { mass: 0, parts: {}, error: "Unbalanced brackets" };
    for (const [el, n] of Object.entries(stack[0])) parts[el] = (parts[el] ?? 0) + n * mult;
  }
  const mass = Object.entries(parts).reduce((s, [el, n]) => s + MASS[el] * n, 0);
  return { mass, parts };
}

/** Simple magic-number / band-of-stability estimate. */
function stability(p: number, n: number) {
  if (p === 0) return { label: "No nucleus", tone: "text-muted-foreground" };
  const ratio = n / p;
  const ideal = p <= 20 ? 1 : 1 + (p - 20) * 0.0125;
  const d = ratio - ideal;
  if (p > 83) return { label: "Radioactive (Z > 83)", tone: "text-orange-400" };
  if (Math.abs(d) <= 0.12) return { label: "Likely stable", tone: "text-emerald-400" };
  if (d > 0) return { label: "Neutron-rich — β⁻ decay likely", tone: "text-sky-400" };
  return { label: "Proton-rich — β⁺ / EC likely", tone: "text-rose-400" };
}

function AtomBuilderPage() {
  const [p, setP] = useState(6);
  const [n, setN] = useState(6);
  const [e, setE] = useState(6);
  const el = useMemo(() => ELEMENTS.find(x => x.z === p), [p]);
  const charge = p - e;
  const massNo = p + n;
  const shells = useMemo(() => shellsOf(e), [e]);
  const valence = shells.length ? shells[shells.length - 1] : 0;
  const stab = stability(p, n);
  const color = el ? CATEGORY_META[el.category].color : "#6aa9e9";

  // Formula-aware calculators
  const [formula, setFormula] = useState("CuSO4.5H2O");
  const mm = useMemo(() => molarMass(formula), [formula]);
  const [grams, setGrams] = useState("24.97");
  const molesFromMass = mm.mass ? (parseFloat(grams) || 0) / mm.mass : 0;

  const [conc, setConc] = useState("0.100");
  const [vol, setVol] = useState("250");
  const molesFromConc = (parseFloat(conc) || 0) * (parseFloat(vol) || 0) / 1000;

  const [gasMoles, setGasMoles] = useState("0.50");
  const [gasCond, setGasCond] = useState<"rtp" | "stp">("rtp");
  const gasVol = (parseFloat(gasMoles) || 0) * (gasCond === "rtp" ? 24.0 : 22.4);

  const [c1, setC1] = useState("2.00"); const [v1, setV1] = useState("25");
  const [v2, setV2] = useState("250");
  const c2 = (parseFloat(v2) || 0) ? (parseFloat(c1) || 0) * (parseFloat(v1) || 0) / (parseFloat(v2) || 1) : 0;

  return (
    <PageTransition>
      <div className="mx-auto max-w-6xl px-4 py-6">
        <h1 className="text-3xl font-semibold text-gradient" style={{ fontFamily: "var(--font-display)" }}>Quantitative Chemistry & 3D Atom Builder</h1>
        <p className="text-sm text-muted-foreground">Add or remove particles — the animated atom rebuilds itself in real time.</p>

        <div className="mt-6 grid gap-4 lg:grid-cols-[1.15fr_1fr]">
          <div className="glass rounded-3xl p-6">
            <div className="mx-auto aspect-square w-full max-w-md">
              <Atom3D protons={p} neutrons={n} electrons={e} symbol={el?.symbol ?? "?"} color={color} className="h-full w-full"/>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2">
              <Particle label="Protons" value={p} onDec={() => setP(Math.max(1, p - 1))} onInc={() => setP(Math.min(118, p + 1))}/>
              <Particle label="Neutrons" value={n} onDec={() => setN(Math.max(0, n - 1))} onInc={() => setN(Math.min(200, n + 1))}/>
              <Particle label="Electrons" value={e} onDec={() => setE(Math.max(0, e - 1))} onInc={() => setE(Math.min(118, e + 1))}/>
            </div>
            <div className="mt-3 flex flex-wrap gap-2 text-xs">
              <button onClick={() => { if (!el) return; setN(Math.round(el.mass) - el.z); setE(el.z); }}
                className="rounded-full border border-border/60 px-3 py-1 hover:bg-foreground/5">Neutral isotope</button>
              <button onClick={() => setE(p)} className="rounded-full border border-border/60 px-3 py-1 hover:bg-foreground/5">Neutralise charge</button>
              <button onClick={() => { setP(6); setN(6); setE(6); }} className="rounded-full border border-border/60 px-3 py-1 hover:bg-foreground/5">Reset</button>
            </div>
          </div>

          <div className="space-y-4">
            <div className="glass rounded-3xl p-6">
              <div className="text-xs uppercase tracking-wide text-muted-foreground">Identification</div>
              <div className="mt-1 flex items-baseline gap-3">
                <span className="font-mono text-sm leading-none">
                  <sup>{massNo}</sup><sub>{p}</sub>
                </span>
                <span className="text-2xl font-semibold" style={{ fontFamily: "var(--font-display)" }}>
                  {el?.name ?? "Undefined"}
                </span>
                {charge !== 0 && <span className="text-lg text-muted-foreground">{el?.symbol}{charge > 0 ? `${charge > 1 ? charge : ""}+` : `${charge < -1 ? -charge : ""}−`}</span>}
              </div>
              <div className={`mt-1 text-xs ${stab.tone}`}>{stab.label} · n/p = {p ? (n / p).toFixed(2) : "—"}</div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                <Stat label="Mass number">{massNo}</Stat>
                <Stat label="Relative atomic mass">{el?.mass ?? "—"}</Stat>
                <Stat label="Charge">{charge > 0 ? `+${charge}` : charge}</Stat>
                <Stat label="Species">{charge === 0 ? "Neutral atom" : charge > 0 ? "Cation" : "Anion"}</Stat>
                <Stat label="Shells (2,8,…)">{shells.join(",") || "—"}</Stat>
                <Stat label="Valence electrons">{valence}</Stat>
                <Stat label="Config">{el?.config ?? "—"}</Stat>
                <Stat label="Category">{el ? CATEGORY_META[el.category].label : "—"}</Stat>
              </div>
            </div>

            <div className="glass rounded-3xl p-6">
              <div className="text-xs uppercase tracking-wide text-muted-foreground">Molar mass from formula</div>
              <input value={formula} onChange={(ev) => setFormula(ev.target.value)}
                className="mt-2 w-full rounded-lg border border-border bg-transparent px-3 py-1.5 font-mono text-sm"/>
              {mm.error ? (
                <div className="mt-2 text-xs text-rose-400">{mm.error}</div>
              ) : (
                <>
                  <div className="mt-2 font-mono text-sm">M = {mm.mass.toFixed(3)} g/mol</div>
                  <div className="mt-2 flex flex-wrap gap-1.5 text-[11px]">
                    {Object.entries(mm.parts).map(([sym, count]) => (
                      <span key={sym} className="rounded-full border border-border/60 px-2 py-0.5">
                        {sym}×{count} · {((MASS[sym] * count / mm.mass) * 100).toFixed(2)}%
                      </span>
                    ))}
                  </div>
                  <div className="mt-3 flex items-center gap-2 text-sm">
                    <input value={grams} onChange={ev => setGrams(ev.target.value)} className="w-24 rounded-lg border border-border bg-transparent px-2 py-1"/>
                    g ÷ M
                    <span className="ml-auto font-mono">= {molesFromMass.toFixed(4)} mol</span>
                  </div>
                </>
              )}
            </div>

            <div className="glass rounded-3xl p-6 space-y-3">
              <div>
                <div className="text-xs uppercase tracking-wide text-muted-foreground">Concentration → moles (n = cV)</div>
                <div className="mt-2 flex items-center gap-2 text-sm">
                  <input value={conc} onChange={ev => setConc(ev.target.value)} className="w-20 rounded-lg border border-border bg-transparent px-2 py-1"/>
                  M × <input value={vol} onChange={ev => setVol(ev.target.value)} className="w-20 rounded-lg border border-border bg-transparent px-2 py-1"/> cm³
                  <span className="ml-auto font-mono">= {molesFromConc.toFixed(4)} mol</span>
                </div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-wide text-muted-foreground">Gas volume (molar volume)</div>
                <div className="mt-2 flex items-center gap-2 text-sm">
                  <input value={gasMoles} onChange={ev => setGasMoles(ev.target.value)} className="w-20 rounded-lg border border-border bg-transparent px-2 py-1"/>
                  mol
                  <select value={gasCond} onChange={ev => setGasCond(ev.target.value as "rtp" | "stp")} className="rounded-lg border border-border bg-transparent px-2 py-1 text-xs">
                    <option value="rtp">RTP 24.0</option>
                    <option value="stp">STP 22.4</option>
                  </select>
                  <span className="ml-auto font-mono">= {gasVol.toFixed(2)} dm³</span>
                </div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-wide text-muted-foreground">Dilution (c₁V₁ = c₂V₂)</div>
                <div className="mt-2 flex items-center gap-2 text-sm">
                  <input value={c1} onChange={ev => setC1(ev.target.value)} className="w-16 rounded-lg border border-border bg-transparent px-2 py-1"/>M ×
                  <input value={v1} onChange={ev => setV1(ev.target.value)} className="w-16 rounded-lg border border-border bg-transparent px-2 py-1"/>→
                  <input value={v2} onChange={ev => setV2(ev.target.value)} className="w-16 rounded-lg border border-border bg-transparent px-2 py-1"/>cm³
                  <span className="ml-auto font-mono">= {c2.toFixed(4)} M</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}

function shellsOf(total: number): number[] {
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
        <button aria-label={`Remove ${label}`} onClick={onDec} className="rounded-full border border-border p-1 hover:bg-foreground/5"><Minus size={14}/></button>
        <button aria-label={`Add ${label}`} onClick={onInc} className="rounded-full border border-border p-1 hover:bg-foreground/5"><Plus size={14}/></button>
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
