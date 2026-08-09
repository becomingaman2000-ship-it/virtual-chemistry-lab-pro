export interface Atom3 { el: string; x: number; y: number; z: number }
export interface Molecule3 {
  id: string; name: string; formula: string; shape: string; angle: string;
  polarity: string; hybridisation: string; category: string; blurb: string;
  atoms: Atom3[]; bonds: [number, number, number?][]; // [a, b, order]
}

export const CPK: Record<string, { color: string; r: number }> = {
  H: { color: "#f1f5f9", r: 0.30 }, C: { color: "#475569", r: 0.55 },
  N: { color: "#3b82f6", r: 0.54 }, O: { color: "#ef4444", r: 0.52 },
  S: { color: "#eab308", r: 0.68 }, P: { color: "#fb923c", r: 0.68 },
  F: { color: "#84cc16", r: 0.45 }, Cl: { color: "#22c55e", r: 0.62 },
  Br: { color: "#b45309", r: 0.70 }, I: { color: "#7c3aed", r: 0.78 },
  Na: { color: "#ff8a5c", r: 0.75 }, K: { color: "#fb7185", r: 0.82 },
  Mg: { color: "#ffb86b", r: 0.72 }, Ca: { color: "#fcd34d", r: 0.80 },
  Fe: { color: "#f97316", r: 0.72 }, Cu: { color: "#d97706", r: 0.72 },
  Zn: { color: "#93c5fd", r: 0.72 }, Al: { color: "#a3a3a3", r: 0.70 },
  Si: { color: "#7bc4c1", r: 0.66 }, B: { color: "#f9a8d4", r: 0.58 },
  Xe: { color: "#f472b6", r: 0.80 }, Be: { color: "#fbbf24", r: 0.60 },
};
export const cpk = (el: string) => CPK[el] ?? { color: "#94a3b8", r: 0.6 };

const T = 1; // unit bond length scale
const tetra: [number, number, number][] = [[1,1,1],[-1,-1,1],[-1,1,-1],[1,-1,-1]];

/** central atom + ligands in a named geometry */
function geom(kind: string, n: number): [number, number, number][] {
  const d2r = Math.PI / 180;
  switch (kind) {
    case "linear": return [[1,0,0],[-1,0,0]].slice(0, n) as [number,number,number][];
    case "bent104": return [[Math.sin(52.25*d2r), -Math.cos(52.25*d2r), 0], [-Math.sin(52.25*d2r), -Math.cos(52.25*d2r), 0]];
    case "bent120": return [[Math.sin(60*d2r), -Math.cos(60*d2r), 0], [-Math.sin(60*d2r), -Math.cos(60*d2r), 0]];
    case "trigonal": return [0,1,2].map(i => [Math.cos(i*120*d2r), Math.sin(i*120*d2r), 0] as [number,number,number]);
    case "pyramidal": return [0,1,2].map(i => [Math.cos(i*120*d2r)*0.94, -0.34, Math.sin(i*120*d2r)*0.94] as [number,number,number]);
    case "tetrahedral": return tetra.slice(0, n).map(v => v.map(c => c / Math.sqrt(3)) as [number,number,number]);
    case "octahedral": return [[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]].slice(0, n) as [number,number,number][];
    case "bipyramidal": return [[1,0,0],[-0.5,0,0.866],[-0.5,0,-0.866],[0,1,0],[0,-1,0]].slice(0, n) as [number,number,number][];
    default: return [[1,0,0]];
  }
}

function central(centre: string, ligand: string, kind: string, n: number, len = 1.2, order = 1): { atoms: Atom3[]; bonds: [number, number, number?][] } {
  const atoms: Atom3[] = [{ el: centre, x: 0, y: 0, z: 0 }];
  const bonds: [number, number, number?][] = [];
  geom(kind, n).forEach((v, i) => {
    atoms.push({ el: ligand, x: v[0] * len * T, y: v[1] * len * T, z: v[2] * len * T });
    bonds.push([0, i + 1, order]);
  });
  return { atoms, bonds };
}

function ring(n: number, el: string, r: number, sub?: { el: string; r: number }): { atoms: Atom3[]; bonds: [number, number, number?][] } {
  const atoms: Atom3[] = [];
  const bonds: [number, number, number?][] = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    atoms.push({ el, x: Math.cos(a) * r, y: Math.sin(a) * r, z: i % 2 && el === "C" && n === 6 && sub === undefined ? 0 : 0 });
  }
  for (let i = 0; i < n; i++) bonds.push([i, (i + 1) % n, n === 6 && el === "C" ? (i % 2 ? 2 : 1) : 1]);
  if (sub) {
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      atoms.push({ el: sub.el, x: Math.cos(a) * sub.r, y: Math.sin(a) * sub.r, z: 0 });
      bonds.push([i, n + i, 1]);
    }
  }
  return { atoms, bonds };
}

const M = (
  id: string, name: string, formula: string, shape: string, angle: string,
  hybridisation: string, polarity: string, category: string, blurb: string,
  g: { atoms: Atom3[]; bonds: [number, number, number?][] },
): Molecule3 => ({ id, name, formula, shape, angle, hybridisation, polarity, category, blurb, atoms: g.atoms, bonds: g.bonds });

export const MOLECULES3D: Molecule3[] = [
  M("h2","Hydrogen","H₂","Linear","180°","s-s σ","Non-polar","Element","Diatomic element; single covalent bond, lowest density gas.", central("H","H","linear",1,1.0)),
  M("o2","Oxygen","O₂","Linear","180°","sp²","Non-polar","Element","Double bond, paramagnetic; supports combustion — relights a glowing splint.", central("O","O","linear",1,1.15,2)),
  M("n2","Nitrogen","N₂","Linear","180°","sp","Non-polar","Element","Triple bond (945 kJ/mol) makes N₂ very unreactive.", central("N","N","linear",1,1.05,3)),
  M("cl2","Chlorine","Cl₂","Linear","180°","p-p σ","Non-polar","Element","Green gas; bleaches damp litmus paper.", central("Cl","Cl","linear",1,1.5)),
  M("hcl","Hydrogen chloride","HCl","Linear","180°","p-s σ","Polar","Acid","Dissolves in water to give hydrochloric acid; fumes in moist air.", central("Cl","H","linear",1,1.2)),
  M("h2o","Water","H₂O","Bent","104.5°","sp³","Polar","Oxide","Hydrogen bonding gives an anomalously high boiling point of 100 °C.", central("O","H","bent104",2,1.1)),
  M("h2s","Hydrogen sulfide","H₂S","Bent","92°","sp³","Polar","Hydride","Rotten-egg smell; blackens lead(II) ethanoate paper.", central("S","H","bent104",2,1.25)),
  M("co2","Carbon dioxide","CO₂","Linear","180°","sp","Non-polar","Oxide","Polar bonds cancel; turns limewater milky.", central("C","O","linear",2,1.25,2)),
  M("so2","Sulfur dioxide","SO₂","Bent","119°","sp²","Polar","Oxide","Acidic gas; decolourises acidified potassium manganate(VII).", central("S","O","bent120",2,1.3,2)),
  M("so3","Sulfur trioxide","SO₃","Trigonal planar","120°","sp²","Non-polar","Oxide","Contact-process intermediate; dissolves to form H₂SO₄.", central("S","O","trigonal",3,1.3,2)),
  M("nh3","Ammonia","NH₃","Trigonal pyramidal","107°","sp³","Polar","Base","Lone pair makes it a weak base; turns damp red litmus blue.", central("N","H","pyramidal",3,1.1)),
  M("ch4","Methane","CH₄","Tetrahedral","109.5°","sp³","Non-polar","Alkane","Simplest alkane; burns with a clean blue flame.", central("C","H","tetrahedral",4,1.15)),
  M("ccl4","Tetrachloromethane","CCl₄","Tetrahedral","109.5°","sp³","Non-polar","Halogenoalkane","Symmetrical, so dipoles cancel; dense non-polar solvent.", central("C","Cl","tetrahedral",4,1.5)),
  M("sif4","Silicon tetrafluoride","SiF₄","Tetrahedral","109.5°","sp³","Non-polar","Halide","Formed when HF attacks glass.", central("Si","F","tetrahedral",4,1.4)),
  M("bf3","Boron trifluoride","BF₃","Trigonal planar","120°","sp²","Non-polar","Halide","Electron-deficient — a classic Lewis acid.", central("B","F","trigonal",3,1.25)),
  M("becl2","Beryllium chloride","BeCl₂","Linear","180°","sp","Non-polar","Halide","Only 2 bonding pairs on Be, so the molecule is linear.", central("Be","Cl","linear",2,1.5)),
  M("pcl5","Phosphorus pentachloride","PCl₅","Trigonal bipyramidal","120°/90°","sp³d","Non-polar","Halide","Expanded octet; axial bonds are longer than equatorial.", central("P","Cl","bipyramidal",5,1.55)),
  M("sf6","Sulfur hexafluoride","SF₆","Octahedral","90°","sp³d²","Non-polar","Halide","Inert, dense gas used as an electrical insulator.", central("S","F","octahedral",6,1.45)),
  M("xef4","Xenon tetrafluoride","XeF₄","Square planar","90°","sp³d²","Non-polar","Noble compound","Proof that noble gases do react.", { atoms: [{el:"Xe",x:0,y:0,z:0},{el:"F",x:1.5,y:0,z:0},{el:"F",x:-1.5,y:0,z:0},{el:"F",x:0,y:0,z:1.5},{el:"F",x:0,y:0,z:-1.5}], bonds: [[0,1],[0,2],[0,3],[0,4]] }),
  M("c6h6","Benzene","C₆H₆","Planar hexagon","120°","sp²","Non-polar","Arene","Delocalised π-system; all C–C bonds equal length (0.139 nm).", ring(6,"C",1.4,{ el:"H", r:2.5 })),
  M("c2h6","Ethane","C₂H₆","Two tetrahedra","109.5°","sp³","Non-polar","Alkane","Free rotation about the C–C σ bond.", { atoms: [
    {el:"C",x:-0.77,y:0,z:0},{el:"C",x:0.77,y:0,z:0},
    {el:"H",x:-1.15,y:1.0,z:0.0},{el:"H",x:-1.15,y:-0.5,z:0.87},{el:"H",x:-1.15,y:-0.5,z:-0.87},
    {el:"H",x:1.15,y:-1.0,z:0.0},{el:"H",x:1.15,y:0.5,z:0.87},{el:"H",x:1.15,y:0.5,z:-0.87}],
    bonds: [[0,1],[0,2],[0,3],[0,4],[1,5],[1,6],[1,7]] }),
  M("c2h4","Ethene","C₂H₄","Planar","120°","sp²","Non-polar","Alkene","π bond restricts rotation; decolourises bromine water.", { atoms: [
    {el:"C",x:-0.67,y:0,z:0},{el:"C",x:0.67,y:0,z:0},
    {el:"H",x:-1.25,y:0.93,z:0},{el:"H",x:-1.25,y:-0.93,z:0},
    {el:"H",x:1.25,y:0.93,z:0},{el:"H",x:1.25,y:-0.93,z:0}],
    bonds: [[0,1,2],[0,2],[0,3],[1,4],[1,5]] }),
  M("c2h2","Ethyne","C₂H₂","Linear","180°","sp","Non-polar","Alkyne","Triple bond; burns at ~3000 °C in oxy-acetylene welding.", { atoms: [
    {el:"C",x:-0.6,y:0,z:0},{el:"C",x:0.6,y:0,z:0},{el:"H",x:-1.7,y:0,z:0},{el:"H",x:1.7,y:0,z:0}],
    bonds: [[0,1,3],[0,2],[1,3]] }),
  M("ethanol","Ethanol","C₂H₅OH","Chain with –OH","109.5°","sp³","Polar","Alcohol","Hydrogen bonds through the –OH group; miscible with water.", { atoms: [
    {el:"C",x:-1.3,y:0,z:0},{el:"C",x:0,y:0.4,z:0},{el:"O",x:1.15,y:-0.45,z:0},{el:"H",x:1.95,y:0.05,z:0},
    {el:"H",x:-1.5,y:-0.6,z:0.9},{el:"H",x:-1.5,y:-0.6,z:-0.9},{el:"H",x:-2.0,y:0.85,z:0},
    {el:"H",x:0.1,y:1.05,z:0.9},{el:"H",x:0.1,y:1.05,z:-0.9}],
    bonds: [[0,1],[1,2],[2,3],[0,4],[0,5],[0,6],[1,7],[1,8]] }),
  M("ethanoic","Ethanoic acid","CH₃COOH","Planar –COOH","120°","sp²/sp³","Polar","Carboxylic acid","Weak acid; forms hydrogen-bonded dimers in non-polar solvents.", { atoms: [
    {el:"C",x:-1.3,y:0,z:0},{el:"C",x:0.1,y:0.2,z:0},{el:"O",x:0.7,y:1.3,z:0},{el:"O",x:0.8,y:-0.95,z:0},{el:"H",x:1.75,y:-0.8,z:0},
    {el:"H",x:-1.6,y:-0.6,z:0.9},{el:"H",x:-1.6,y:-0.6,z:-0.9},{el:"H",x:-1.8,y:0.95,z:0}],
    bonds: [[0,1],[1,2,2],[1,3],[3,4],[0,5],[0,6],[0,7]] }),
  M("glucose","Glucose (α-D)","C₆H₁₂O₆","Chair pyranose ring","111°","sp³","Polar","Sugar","Ring of 5 C + 1 O; respiration substrate, reduces Benedict's solution.", (() => {
    const atoms: Atom3[] = []; const bonds: [number, number, number?][] = [];
    const els = ["C","C","C","C","C","O"];
    for (let i = 0; i < 6; i++) { const a = (i/6)*Math.PI*2; atoms.push({ el: els[i], x: Math.cos(a)*1.45, y: (i%2?0.25:-0.25), z: Math.sin(a)*1.45 }); bonds.push([i,(i+1)%6]); }
    for (let i = 0; i < 5; i++) { const a=(i/6)*Math.PI*2; atoms.push({ el:"O", x: Math.cos(a)*2.6, y:(i%2?1.1:-1.1), z: Math.sin(a)*2.6 }); bonds.push([i, 6+i]); }
    return { atoms, bonds };
  })()),
  M("cyclohexane","Cyclohexane","C₆H₁₂","Chair","109.5°","sp³","Non-polar","Cycloalkane","Puckered chair conformation relieves ring strain.", (() => {
    const atoms: Atom3[] = []; const bonds: [number, number, number?][] = [];
    for (let i = 0; i < 6; i++) { const a=(i/6)*Math.PI*2; atoms.push({ el:"C", x: Math.cos(a)*1.5, y: i%2?0.3:-0.3, z: Math.sin(a)*1.5 }); bonds.push([i,(i+1)%6]); }
    for (let i = 0; i < 6; i++) { const a=(i/6)*Math.PI*2; atoms.push({ el:"H", x: Math.cos(a)*2.5, y: i%2?1.1:-1.1, z: Math.sin(a)*2.5 }); bonds.push([i, 6+i]); }
    return { atoms, bonds };
  })()),
  M("h2so4","Sulfuric acid","H₂SO₄","Tetrahedral about S","109.5°","sp³","Polar","Acid","Diprotic strong acid; powerful dehydrating agent.", { atoms: [
    {el:"S",x:0,y:0,z:0},{el:"O",x:0.85,y:0.85,z:0.85},{el:"O",x:-0.85,y:-0.85,z:0.85},
    {el:"O",x:-0.85,y:0.85,z:-0.85},{el:"O",x:0.85,y:-0.85,z:-0.85},
    {el:"H",x:-1.7,y:1.4,z:-1.3},{el:"H",x:1.7,y:-1.4,z:-1.3}],
    bonds: [[0,1,2],[0,2,2],[0,3],[0,4],[3,5],[4,6]] }),
  M("hno3","Nitric acid","HNO₃","Trigonal planar about N","120°","sp²","Polar","Acid","Strong oxidising acid; used in nitration.", { atoms: [
    {el:"N",x:0,y:0,z:0},{el:"O",x:1.2,y:0.6,z:0},{el:"O",x:-1.2,y:0.6,z:0},{el:"O",x:0,y:-1.3,z:0},{el:"H",x:0.8,y:-1.9,z:0}],
    bonds: [[0,1,2],[0,2],[0,3],[3,4]] }),
  M("naoh","Sodium hydroxide","NaOH","Ionic pair","—","Ionic","Ionic","Base","Ionic lattice in the solid; fully dissociates in water.", { atoms: [
    {el:"Na",x:-1.4,y:0,z:0},{el:"O",x:0.5,y:0,z:0},{el:"H",x:1.5,y:0.4,z:0}], bonds: [[0,1],[1,2]] }),
  M("nacl","Sodium chloride","NaCl","Cubic lattice","90°","Ionic","Ionic","Salt","Giant ionic lattice — each ion is 6-coordinate.", (() => {
    const atoms: Atom3[] = []; const bonds: [number, number, number?][] = [];
    const idx: Record<string, number> = {};
    for (let x = 0; x < 2; x++) for (let y = 0; y < 2; y++) for (let z = 0; z < 2; z++) {
      idx[`${x}${y}${z}`] = atoms.length;
      atoms.push({ el: (x + y + z) % 2 ? "Cl" : "Na", x: (x - 0.5) * 2.2, y: (y - 0.5) * 2.2, z: (z - 0.5) * 2.2 });
    }
    for (let x = 0; x < 2; x++) for (let y = 0; y < 2; y++) for (let z = 0; z < 2; z++) {
      if (x === 0) bonds.push([idx[`0${y}${z}`], idx[`1${y}${z}`]]);
      if (y === 0) bonds.push([idx[`${x}0${z}`], idx[`${x}1${z}`]]);
      if (z === 0) bonds.push([idx[`${x}${y}0`], idx[`${x}${y}1`]]);
    }
    return { atoms, bonds };
  })()),
  M("diamond","Diamond","C (giant)","Tetrahedral network","109.5°","sp³","Non-polar","Allotrope","Every carbon bonded to 4 others — hardest natural substance.", central("C","C","tetrahedral",4,1.55)),
  M("graphite","Graphite layer","C (giant)","Hexagonal layers","120°","sp²","Non-polar","Allotrope","Layers slide over each other; delocalised electrons conduct.", ring(6,"C",1.42)),
  M("ch3cl","Chloromethane","CH₃Cl","Tetrahedral","109.5°","sp³","Polar","Halogenoalkane","Polar C–Cl bond; substitution site for nucleophiles.", { atoms: [
    {el:"C",x:0,y:0,z:0},{el:"Cl",x:0,y:1.5,z:0},{el:"H",x:1.0,y:-0.5,z:0.6},{el:"H",x:-1.0,y:-0.5,z:0.6},{el:"H",x:0,y:-0.5,z:-1.1}],
    bonds: [[0,1],[0,2],[0,3],[0,4]] }),
  M("methanal","Methanal","HCHO","Trigonal planar","120°","sp²","Polar","Aldehyde","C=O carbonyl; reduces Tollens' reagent to a silver mirror.", { atoms: [
    {el:"C",x:0,y:0,z:0},{el:"O",x:0,y:1.3,z:0},{el:"H",x:1.1,y:-0.6,z:0},{el:"H",x:-1.1,y:-0.6,z:0}],
    bonds: [[0,1,2],[0,2],[0,3]] }),
  M("propanone","Propanone","CH₃COCH₃","Trigonal planar carbonyl","120°","sp²/sp³","Polar","Ketone","Common solvent; carbonyl carbon is electrophilic.", { atoms: [
    {el:"C",x:0,y:0,z:0},{el:"O",x:0,y:1.35,z:0},{el:"C",x:-1.3,y:-0.75,z:0},{el:"C",x:1.3,y:-0.75,z:0},
    {el:"H",x:-2.1,y:-0.1,z:0.4},{el:"H",x:-1.4,y:-1.6,z:0.7},{el:"H",x:-1.5,y:-1.1,z:-1.0},
    {el:"H",x:2.1,y:-0.1,z:-0.4},{el:"H",x:1.4,y:-1.6,z:-0.7},{el:"H",x:1.5,y:-1.1,z:1.0}],
    bonds: [[0,1,2],[0,2],[0,3],[2,4],[2,5],[2,6],[3,7],[3,8],[3,9]] }),
  M("h2o2","Hydrogen peroxide","H₂O₂","Open book","94.8°","sp³","Polar","Oxide","Decomposes to water and oxygen — catalysed by MnO₂.", { atoms: [
    {el:"O",x:-0.73,y:0,z:0},{el:"O",x:0.73,y:0,z:0},{el:"H",x:-1.1,y:0.9,z:0.6},{el:"H",x:1.1,y:-0.9,z:0.6}],
    bonds: [[0,1],[0,2],[1,3]] }),
  M("caco3","Calcium carbonate","CaCO₃","Trigonal planar anion","120°","sp²","Ionic","Salt","Thermally decomposes above ~840 °C to CaO + CO₂.", { atoms: [
    {el:"Ca",x:0,y:2.4,z:0},{el:"C",x:0,y:0,z:0},{el:"O",x:1.25,y:-0.6,z:0},{el:"O",x:-1.25,y:-0.6,z:0},{el:"O",x:0,y:1.35,z:0}],
    bonds: [[1,2],[1,3],[1,4,2],[0,4]] }),
  M("cuso4","Copper(II) sulfate hexaaqua","[Cu(H₂O)₆]²⁺","Octahedral","90°","d²sp³","Ionic complex","Complex","Blue hydrated ion; turns white anhydrous on heating.", central("Cu","O","octahedral",6,1.9)),
  M("ptcl4","Tetraamminecopper","[Cu(NH₃)₄]²⁺","Square planar","90°","dsp²","Ionic complex","Complex","Deep blue solution formed with excess ammonia.", { atoms: [
    {el:"Cu",x:0,y:0,z:0},{el:"N",x:1.8,y:0,z:0},{el:"N",x:-1.8,y:0,z:0},{el:"N",x:0,y:0,z:1.8},{el:"N",x:0,y:0,z:-1.8}],
    bonds: [[0,1],[0,2],[0,3],[0,4]] }),
  M("ozone","Ozone","O₃","Bent","117°","sp²","Polar","Allotrope","Absorbs UV in the stratosphere; a powerful oxidant.", central("O","O","bent120",2,1.28)),
  M("methylamine","Methylamine","CH₃NH₂","Pyramidal at N","107°","sp³","Polar","Amine","Basic — the lone pair on N accepts a proton.", { atoms: [
    {el:"C",x:-0.75,y:0,z:0},{el:"N",x:0.75,y:0.15,z:0},{el:"H",x:1.2,y:-0.4,z:0.75},{el:"H",x:1.15,y:1.05,z:0},
    {el:"H",x:-1.1,y:-0.6,z:0.85},{el:"H",x:-1.1,y:-0.5,z:-0.9},{el:"H",x:-1.2,y:0.98,z:0.1}],
    bonds: [[0,1],[1,2],[1,3],[0,4],[0,5],[0,6]] }),
];
