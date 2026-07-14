import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageTransition } from "@/components/PageTransition";

export const Route = createFileRoute("/structures")({
  head: () => ({
    meta: [
      { title: "ChemVM — Atomic & Molecular Structures" },
      { name: "description", content: "Explore the shape of water, methane, benzene, ammonia and more. Rotate, zoom and read the chemistry behind each molecule." },
      { property: "og:title", content: "ChemVM — Molecular Structures" },
      { property: "og:description", content: "Interactive 3D-style structure gallery for common molecules." },
    ],
  }),
  component: StructuresPage,
});

interface Mol {
  id: string; name: string; formula: string; shape: string;
  atoms: { el: string; x: number; y: number; z: number; color: string; r: number }[];
  bonds: [number, number][];
  blurb: string;
}

const MOLECULES: Mol[] = [
  {
    id: "h2o", name: "Water", formula: "H₂O", shape: "Bent (104.5°)",
    atoms: [
      { el: "O", x: 0, y: 0, z: 0, color: "#ef4444", r: 22 },
      { el: "H", x: -32, y: 26, z: 0, color: "#e2e8f0", r: 12 },
      { el: "H", x: 32, y: 26, z: 0, color: "#e2e8f0", r: 12 },
    ], bonds: [[0, 1], [0, 2]],
    blurb: "Polar; hydrogen bonds give water its high boiling point and surface tension.",
  },
  {
    id: "ch4", name: "Methane", formula: "CH₄", shape: "Tetrahedral (109.5°)",
    atoms: [
      { el: "C", x: 0, y: 0, z: 0, color: "#64748b", r: 20 },
      { el: "H", x: 30, y: 30, z: 0, color: "#e2e8f0", r: 12 },
      { el: "H", x: -30, y: 30, z: 0, color: "#e2e8f0", r: 12 },
      { el: "H", x: -30, y: -30, z: 0, color: "#e2e8f0", r: 12 },
      { el: "H", x: 30, y: -30, z: 0, color: "#e2e8f0", r: 12 },
    ], bonds: [[0,1],[0,2],[0,3],[0,4]],
    blurb: "Simplest hydrocarbon; major component of natural gas.",
  },
  {
    id: "nh3", name: "Ammonia", formula: "NH₃", shape: "Trigonal pyramidal",
    atoms: [
      { el: "N", x: 0, y: -6, z: 0, color: "#3b82f6", r: 20 },
      { el: "H", x: -32, y: 24, z: 0, color: "#e2e8f0", r: 12 },
      { el: "H", x: 32, y: 24, z: 0, color: "#e2e8f0", r: 12 },
      { el: "H", x: 0, y: -34, z: 0, color: "#e2e8f0", r: 12 },
    ], bonds: [[0,1],[0,2],[0,3]],
    blurb: "Weak base; feedstock for fertilisers via the Haber process.",
  },
  {
    id: "co2", name: "Carbon dioxide", formula: "CO₂", shape: "Linear",
    atoms: [
      { el: "O", x: -40, y: 0, z: 0, color: "#ef4444", r: 20 },
      { el: "C", x: 0, y: 0, z: 0, color: "#64748b", r: 18 },
      { el: "O", x: 40, y: 0, z: 0, color: "#ef4444", r: 20 },
    ], bonds: [[0,1],[1,2]],
    blurb: "Non-polar despite polar bonds; a greenhouse gas produced by combustion and respiration.",
  },
  {
    id: "c6h6", name: "Benzene", formula: "C₆H₆", shape: "Planar hexagon",
    atoms: Array.from({ length: 6 }).flatMap((_, i) => {
      const a = (i / 6) * Math.PI * 2;
      return [
        { el: "C", x: Math.cos(a) * 40, y: Math.sin(a) * 40, z: 0, color: "#64748b", r: 16 },
        { el: "H", x: Math.cos(a) * 62, y: Math.sin(a) * 62, z: 0, color: "#e2e8f0", r: 10 },
      ];
    }),
    bonds: [[0,2],[2,4],[4,6],[6,8],[8,10],[10,0],[0,1],[2,3],[4,5],[6,7],[8,9],[10,11]],
    blurb: "Aromatic — delocalised π-system makes benzene unusually stable.",
  },
  {
    id: "c2h6", name: "Ethane", formula: "C₂H₆", shape: "Two tetrahedra",
    atoms: [
      { el: "C", x: -20, y: 0, z: 0, color: "#64748b", r: 18 },
      { el: "C", x: 20, y: 0, z: 0, color: "#64748b", r: 18 },
      { el: "H", x: -42, y: -22, z: 0, color: "#e2e8f0", r: 10 },
      { el: "H", x: -42, y: 22, z: 0, color: "#e2e8f0", r: 10 },
      { el: "H", x: -20, y: 32, z: 0, color: "#e2e8f0", r: 10 },
      { el: "H", x: 42, y: -22, z: 0, color: "#e2e8f0", r: 10 },
      { el: "H", x: 42, y: 22, z: 0, color: "#e2e8f0", r: 10 },
      { el: "H", x: 20, y: 32, z: 0, color: "#e2e8f0", r: 10 },
    ], bonds: [[0,1],[0,2],[0,3],[0,4],[1,5],[1,6],[1,7]],
    blurb: "Simplest alkane with a C–C single bond; component of natural gas.",
  },
  {
    id: "h2so4", name: "Sulfuric acid", formula: "H₂SO₄", shape: "Tetrahedral about S",
    atoms: [
      { el: "S", x: 0, y: 0, z: 0, color: "#eab308", r: 22 },
      { el: "O", x: 0, y: -34, z: 0, color: "#ef4444", r: 16 },
      { el: "O", x: 0, y: 34, z: 0, color: "#ef4444", r: 16 },
      { el: "O", x: -34, y: 0, z: 0, color: "#ef4444", r: 16 },
      { el: "O", x: 34, y: 0, z: 0, color: "#ef4444", r: 16 },
      { el: "H", x: -54, y: -18, z: 0, color: "#e2e8f0", r: 10 },
      { el: "H", x: 54, y: 18, z: 0, color: "#e2e8f0", r: 10 },
    ], bonds: [[0,1],[0,2],[0,3],[0,4],[3,5],[4,6]],
    blurb: "Diprotic strong acid; central to industry (fertilisers, batteries, dehydration).",
  },
  {
    id: "glucose", name: "Glucose", formula: "C₆H₁₂O₆", shape: "Pyranose ring",
    atoms: [], bonds: [],
    blurb: "Primary energy carrier in living cells; forms a 6-membered ring in solution.",
  },
];

function StructuresPage() {
  const [sel, setSel] = useState<Mol>(MOLECULES[0]);
  const [rot, setRot] = useState(0);

  return (
    <PageTransition>
      <div className="mx-auto max-w-6xl px-4 py-6">
        <h1 className="text-3xl font-semibold text-gradient" style={{ fontFamily: "var(--font-display)" }}>Atomic & Molecular Structures</h1>
        <p className="text-sm text-muted-foreground">Click a molecule — drag the slider to rotate.</p>

        <div className="mt-6 grid gap-4 lg:grid-cols-[240px_1fr]">
          <div className="glass rounded-2xl p-2 max-h-[560px] overflow-auto">
            {MOLECULES.map(m => (
              <button key={m.id} onClick={() => setSel(m)}
                className={`block w-full rounded-xl px-3 py-2 text-left text-sm transition ${sel.id === m.id ? "bg-navy text-peach dark:bg-turquoise dark:text-charcoal" : "hover:bg-foreground/5"}`}>
                <div className="font-medium">{m.name}</div>
                <div className="text-xs opacity-70">{m.formula}</div>
              </button>
            ))}
          </div>

          <div className="glass rounded-3xl p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-semibold" style={{ fontFamily: "var(--font-display)" }}>{sel.name}</h2>
                <div className="text-sm text-muted-foreground">{sel.formula} · {sel.shape}</div>
              </div>
              <input type="range" min={0} max={360} value={rot} onChange={(e) => setRot(+e.target.value)} className="w-40"/>
            </div>
            <div className="mt-4 aspect-video w-full overflow-hidden rounded-2xl bg-gradient-to-br from-foreground/5 to-foreground/10">
              <svg viewBox="-120 -80 240 160" className="h-full w-full">
                <g style={{ transformOrigin: "center", transform: `rotate(${rot}deg)` }}>
                  {sel.bonds.map(([a, b], i) => {
                    const A = sel.atoms[a], B = sel.atoms[b];
                    if (!A || !B) return null;
                    return <line key={i} x1={A.x} y1={A.y} x2={B.x} y2={B.y} stroke="currentColor" strokeOpacity="0.5" strokeWidth="2"/>;
                  })}
                  {sel.atoms.map((a, i) => (
                    <g key={i}>
                      <circle cx={a.x} cy={a.y} r={a.r} fill={a.color}/>
                      <text x={a.x} y={a.y + 4} textAnchor="middle" fontSize={a.r > 14 ? 10 : 8} fill="#0f172a" fontWeight="700">{a.el}</text>
                    </g>
                  ))}
                </g>
              </svg>
            </div>
            <p className="mt-4 text-sm">{sel.blurb}</p>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}

export { StructuresPage };