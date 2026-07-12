/**
 * ChemVM — Chemicals & Substances Database
 * Physical + visual properties for the virtual lab.
 * Colors are calibrated to real-world appearance (aqueous solutions or pure state).
 */

export type Phase = "solid" | "liquid" | "gas" | "aqueous" | "flame" | "vapour";
export type Hazard =
  | "toxic"
  | "corrosive"
  | "flammable"
  | "oxidiser"
  | "irritant"
  | "explosive"
  | "harmful"
  | "radioactive"
  | "environment";

export type Category =
  | "acid"
  | "base"
  | "salt"
  | "metal"
  | "non-metal"
  | "oxide"
  | "organic"
  | "indicator"
  | "gas"
  | "solvent"
  | "flame"
  | "vapour";

export interface Chemical {
  id: string;
  name: string;
  formula: string;
  category: Category;
  phase: Phase;
  /** primary display color (hex) */
  color: string;
  /** secondary tint (for gradient / flame core) */
  accent?: string;
  opacity?: number;         // 0-1 for liquid transparency
  glow?: boolean;           // aurora/glow effect (fire, gases)
  molarMass?: number;       // g/mol
  density?: number;         // g/cm³
  bp?: number;              // boiling point °C
  mp?: number;              // melting point °C
  solubility?: string;      // in water
  pH?: number;              // if applicable
  hazards: Hazard[];
  uses: string;
  notes?: string;
}

/* ============================================================
   ACIDS
============================================================ */
const ACIDS: Chemical[] = [
  { id: "hcl", name: "Hydrochloric Acid", formula: "HCl", category: "acid", phase: "aqueous",
    color: "#EAF6FB", accent: "#CFE8F0", opacity: 0.55,
    molarMass: 36.46, density: 1.18, bp: 110, mp: -30, solubility: "miscible", pH: 1,
    hazards: ["corrosive", "irritant"], uses: "Stomach acid, pH control, chloride prep." },
  { id: "h2so4", name: "Sulfuric Acid", formula: "H₂SO₄", category: "acid", phase: "liquid",
    color: "#F7EFD1", accent: "#E7D89A", opacity: 0.7,
    molarMass: 98.08, density: 1.84, bp: 337, mp: 10, solubility: "miscible", pH: 0,
    hazards: ["corrosive", "oxidiser"], uses: "Batteries, dehydration, titrations." },
  { id: "hno3", name: "Nitric Acid", formula: "HNO₃", category: "acid", phase: "liquid",
    color: "#FFF3D6", accent: "#F5C46A", opacity: 0.65,
    molarMass: 63.01, density: 1.51, bp: 83, mp: -42, solubility: "miscible", pH: 1,
    hazards: ["corrosive", "oxidiser", "toxic"], uses: "Nitration, fertilisers, explosives." },
  { id: "ch3cooh", name: "Ethanoic Acid", formula: "CH₃COOH", category: "acid", phase: "liquid",
    color: "#FBFAF3", accent: "#E9E4C8", opacity: 0.5,
    molarMass: 60.05, density: 1.05, bp: 118, mp: 17, solubility: "miscible", pH: 3,
    hazards: ["corrosive", "flammable"], uses: "Vinegar, esterification." },
  { id: "h3po4", name: "Phosphoric Acid", formula: "H₃PO₄", category: "acid", phase: "liquid",
    color: "#F4F7F5", accent: "#DCE7DF", opacity: 0.55,
    molarMass: 97.99, density: 1.69, bp: 158, mp: 42, solubility: "miscible", pH: 2,
    hazards: ["corrosive", "irritant"], uses: "Rust removal, fertilisers, food additive." },
  { id: "hcooh", name: "Methanoic Acid", formula: "HCOOH", category: "acid", phase: "liquid",
    color: "#FAFAF4", accent: "#E1E0C8", opacity: 0.55,
    molarMass: 46.03, density: 1.22, bp: 101, mp: 8, solubility: "miscible", pH: 2,
    hazards: ["corrosive", "irritant"], uses: "Preservative, leather tanning." },
  { id: "h2co3", name: "Carbonic Acid", formula: "H₂CO₃", category: "acid", phase: "aqueous",
    color: "#EFF7F6", accent: "#C7DEDA", opacity: 0.5,
    molarMass: 62.03, bp: -5, mp: -80, solubility: "unstable", pH: 4,
    hazards: ["irritant"], uses: "Carbonated water, buffers." },
  { id: "h2s", name: "Hydrosulfuric Acid", formula: "H₂S(aq)", category: "acid", phase: "aqueous",
    color: "#F0F2E8", accent: "#D8DBB8", opacity: 0.5,
    molarMass: 34.08, bp: -60, solubility: "soluble", pH: 4,
    hazards: ["toxic", "flammable"], uses: "Qualitative sulfide tests. Rotten-egg odour." },
];

/* ============================================================
   BASES / ALKALIS
============================================================ */
const BASES: Chemical[] = [
  { id: "naoh", name: "Sodium Hydroxide", formula: "NaOH", category: "base", phase: "aqueous",
    color: "#F1F4F9", accent: "#D6DEEC", opacity: 0.55,
    molarMass: 40, density: 2.13, bp: 1388, mp: 318, solubility: "very soluble", pH: 14,
    hazards: ["corrosive"], uses: "Soap making, drain cleaner, titrations." },
  { id: "koh", name: "Potassium Hydroxide", formula: "KOH", category: "base", phase: "aqueous",
    color: "#EFF3F8", accent: "#D2DAE8", opacity: 0.55,
    molarMass: 56.11, density: 2.12, bp: 1327, mp: 360, solubility: "very soluble", pH: 14,
    hazards: ["corrosive"], uses: "Soft soaps, biodiesel, batteries." },
  { id: "nh3", name: "Ammonia (aq)", formula: "NH₃·H₂O", category: "base", phase: "aqueous",
    color: "#F0F7EE", accent: "#CDE5C6", opacity: 0.5,
    molarMass: 17.03, bp: -33, solubility: "very soluble", pH: 12,
    hazards: ["corrosive", "toxic"], uses: "Cleaning, nitrogen source, complex ions." },
  { id: "ca(oh)2", name: "Calcium Hydroxide", formula: "Ca(OH)₂", category: "base", phase: "aqueous",
    color: "#F6F6F1", accent: "#DEDECC", opacity: 0.6,
    molarMass: 74.09, density: 2.21, mp: 580, solubility: "slightly soluble", pH: 12,
    hazards: ["irritant"], uses: "Limewater, mortar, sewage treatment." },
  { id: "mg(oh)2", name: "Magnesium Hydroxide", formula: "Mg(OH)₂", category: "base", phase: "aqueous",
    color: "#F7F7F0", accent: "#E1E1C9", opacity: 0.75,
    molarMass: 58.32, density: 2.34, mp: 350, solubility: "insoluble", pH: 10,
    hazards: ["irritant"], uses: "Antacid (milk of magnesia)." },
  { id: "nahco3", name: "Sodium Bicarbonate", formula: "NaHCO₃", category: "base", phase: "aqueous",
    color: "#F5F5EE", accent: "#DDDCC4", opacity: 0.5,
    molarMass: 84.01, density: 2.20, mp: 50, solubility: "soluble", pH: 8,
    hazards: [], uses: "Baking soda, mild antacid." },
  { id: "na2co3", name: "Sodium Carbonate", formula: "Na₂CO₃", category: "base", phase: "aqueous",
    color: "#F1F3ED", accent: "#D5D9C6", opacity: 0.55,
    molarMass: 105.99, density: 2.54, mp: 851, solubility: "soluble", pH: 11,
    hazards: ["irritant"], uses: "Washing soda, glass making." },
];

/* ============================================================
   SALTS — colored solutions (transition metal & indicator salts)
============================================================ */
const SALTS: Chemical[] = [
  { id: "cuso4", name: "Copper(II) Sulfate", formula: "CuSO₄·5H₂O", category: "salt", phase: "aqueous",
    color: "#1976D2", accent: "#42A5F5", opacity: 0.85,
    molarMass: 249.68, density: 2.28, mp: 110, solubility: "soluble",
    hazards: ["harmful", "environment"], uses: "Fungicide, electroplating, Fehling's test." },
  { id: "fecl3", name: "Iron(III) Chloride", formula: "FeCl₃", category: "salt", phase: "aqueous",
    color: "#8D5A1B", accent: "#C48438", opacity: 0.9,
    molarMass: 162.2, density: 2.9, mp: 306, solubility: "very soluble",
    hazards: ["corrosive"], uses: "Water treatment, phenol test (violet)." },
  { id: "feso4", name: "Iron(II) Sulfate", formula: "FeSO₄·7H₂O", category: "salt", phase: "aqueous",
    color: "#5F8F6E", accent: "#8FB99C", opacity: 0.8,
    molarMass: 278.02, mp: 64, solubility: "soluble",
    hazards: ["irritant"], uses: "Anaemia treatment, brown-ring test." },
  { id: "kmno4", name: "Potassium Permanganate", formula: "KMnO₄", category: "salt", phase: "aqueous",
    color: "#5E1670", accent: "#B93AC7", opacity: 0.95,
    molarMass: 158.03, density: 2.7, mp: 240, solubility: "soluble",
    hazards: ["oxidiser", "harmful"], uses: "Strong oxidiser, redox titrations. Deep purple." },
  { id: "k2cr2o7", name: "Potassium Dichromate", formula: "K₂Cr₂O₇", category: "salt", phase: "aqueous",
    color: "#D6841A", accent: "#F2B255", opacity: 0.95,
    molarMass: 294.19, mp: 398, solubility: "soluble",
    hazards: ["oxidiser", "toxic", "environment"], uses: "Oxidiser; orange → green (Cr³⁺)." },
  { id: "cr2so4", name: "Chromium(III) Sulfate", formula: "Cr₂(SO₄)₃", category: "salt", phase: "aqueous",
    color: "#2E7D5B", accent: "#5FB48A", opacity: 0.9,
    molarMass: 392.18, solubility: "soluble",
    hazards: ["irritant"], uses: "Green Cr³⁺ solution, tanning." },
  { id: "nicl2", name: "Nickel(II) Chloride", formula: "NiCl₂", category: "salt", phase: "aqueous",
    color: "#0E7A5F", accent: "#38B58F", opacity: 0.9,
    molarMass: 129.6, mp: 1001, solubility: "soluble",
    hazards: ["toxic", "environment"], uses: "Electroplating, catalyst." },
  { id: "cocl2", name: "Cobalt(II) Chloride", formula: "CoCl₂", category: "salt", phase: "aqueous",
    color: "#B7255A", accent: "#E85C88", opacity: 0.9,
    molarMass: 129.84, solubility: "very soluble",
    hazards: ["toxic", "environment"], uses: "Humidity indicator (pink ↔ blue)." },
  { id: "agno3", name: "Silver Nitrate", formula: "AgNO₃", category: "salt", phase: "aqueous",
    color: "#F4F7FA", accent: "#DDE6EE", opacity: 0.55,
    molarMass: 169.87, density: 4.35, mp: 212, solubility: "very soluble",
    hazards: ["corrosive", "oxidiser", "environment"], uses: "Halide tests: AgCl white, AgBr cream, AgI yellow." },
  { id: "pb(no3)2", name: "Lead(II) Nitrate", formula: "Pb(NO₃)₂", category: "salt", phase: "aqueous",
    color: "#F6F8FB", accent: "#DFE6EE", opacity: 0.55,
    molarMass: 331.2, density: 4.53, mp: 470, solubility: "soluble",
    hazards: ["toxic", "oxidiser", "environment"], uses: "Yellow PbI₂ precipitate — golden rain." },
  { id: "ki", name: "Potassium Iodide", formula: "KI", category: "salt", phase: "aqueous",
    color: "#F7F9F2", accent: "#DFE4D0", opacity: 0.5,
    molarMass: 166, density: 3.12, mp: 681, solubility: "very soluble",
    hazards: ["irritant"], uses: "Iodine test, radioprotectant." },
  { id: "nacl", name: "Sodium Chloride", formula: "NaCl", category: "salt", phase: "aqueous",
    color: "#FAFAF3", accent: "#E4E4CC", opacity: 0.45,
    molarMass: 58.44, density: 2.16, mp: 801, solubility: "soluble",
    hazards: [], uses: "Table salt, electrolysis." },
  { id: "caco3", name: "Calcium Carbonate", formula: "CaCO₃", category: "salt", phase: "solid",
    color: "#EFEFE7", accent: "#CCCCB8", opacity: 1,
    molarMass: 100.09, density: 2.71, mp: 825, solubility: "insoluble",
    hazards: [], uses: "Marble, chalk, limestone. Reacts with acids → CO₂." },
  { id: "cuco3", name: "Copper(II) Carbonate", formula: "CuCO₃", category: "salt", phase: "solid",
    color: "#3E9B8E", accent: "#6DC9BB", opacity: 1,
    molarMass: 123.55, density: 3.9,
    hazards: ["irritant"], uses: "Green pigment, verdigris." },
  { id: "znso4", name: "Zinc Sulfate", formula: "ZnSO₄", category: "salt", phase: "aqueous",
    color: "#F5F7F2", accent: "#DDE3D0", opacity: 0.5,
    molarMass: 161.47, mp: 680, solubility: "very soluble",
    hazards: ["irritant", "environment"], uses: "Dietary supplement, electrolyte." },
  { id: "mnso4", name: "Manganese(II) Sulfate", formula: "MnSO₄", category: "salt", phase: "aqueous",
    color: "#F4D9E4", accent: "#F0AFC7", opacity: 0.85,
    molarMass: 151, solubility: "soluble",
    hazards: ["harmful"], uses: "Very pale pink Mn²⁺." },
];

/* ============================================================
   METALS
============================================================ */
const METALS: Chemical[] = [
  { id: "na", name: "Sodium", formula: "Na", category: "metal", phase: "solid",
    color: "#C9CDD1", accent: "#F1F3F5", opacity: 1,
    molarMass: 22.99, density: 0.97, mp: 98, bp: 883,
    hazards: ["flammable", "corrosive"], uses: "Reactive Group 1 metal, stored in oil." },
  { id: "k", name: "Potassium", formula: "K", category: "metal", phase: "solid",
    color: "#BEC2C6", accent: "#E7EAED", opacity: 1,
    molarMass: 39.1, density: 0.86, mp: 63, bp: 759,
    hazards: ["flammable", "corrosive"], uses: "Lilac flame; violent with water." },
  { id: "mg", name: "Magnesium", formula: "Mg", category: "metal", phase: "solid",
    color: "#B8BCC1", accent: "#E3E6E9", opacity: 1,
    molarMass: 24.31, density: 1.74, mp: 650, bp: 1090,
    hazards: ["flammable"], uses: "Blindingly bright white flame." },
  { id: "ca", name: "Calcium", formula: "Ca", category: "metal", phase: "solid",
    color: "#C7CACC", accent: "#EDEEEE", opacity: 1,
    molarMass: 40.08, density: 1.55, mp: 842, bp: 1484,
    hazards: ["flammable", "irritant"], uses: "Reacts steadily with cold water." },
  { id: "al", name: "Aluminium", formula: "Al", category: "metal", phase: "solid",
    color: "#C6CACD", accent: "#EBEDEF", opacity: 1,
    molarMass: 26.98, density: 2.70, mp: 660, bp: 2470,
    hazards: [], uses: "Passivated by oxide layer. Thermite." },
  { id: "zn", name: "Zinc", formula: "Zn", category: "metal", phase: "solid",
    color: "#B0B7BD", accent: "#DBE0E4", opacity: 1,
    molarMass: 65.38, density: 7.14, mp: 420, bp: 907,
    hazards: [], uses: "Galvanising; reacts with HCl → H₂." },
  { id: "fe", name: "Iron", formula: "Fe", category: "metal", phase: "solid",
    color: "#7C7A78", accent: "#A9A6A2", opacity: 1,
    molarMass: 55.85, density: 7.87, mp: 1538, bp: 2861,
    hazards: [], uses: "Structural metal, rusting." },
  { id: "cu", name: "Copper", formula: "Cu", category: "metal", phase: "solid",
    color: "#B87333", accent: "#E39A55", opacity: 1,
    molarMass: 63.55, density: 8.96, mp: 1085, bp: 2562,
    hazards: [], uses: "Wiring, catalysts, verdigris." },
  { id: "ag", name: "Silver", formula: "Ag", category: "metal", phase: "solid",
    color: "#C0C0C0", accent: "#EAEAEA", opacity: 1,
    molarMass: 107.87, density: 10.49, mp: 962, bp: 2162,
    hazards: [], uses: "Best electrical conductor; tarnishes to Ag₂S." },
  { id: "au", name: "Gold", formula: "Au", category: "metal", phase: "solid",
    color: "#D4AF37", accent: "#F1D264", opacity: 1,
    molarMass: 196.97, density: 19.32, mp: 1064, bp: 2856,
    hazards: [], uses: "Unreactive noble metal." },
  { id: "hg", name: "Mercury", formula: "Hg", category: "metal", phase: "liquid",
    color: "#B7B9BC", accent: "#DDDEE0", opacity: 1,
    molarMass: 200.59, density: 13.53, mp: -39, bp: 357,
    hazards: ["toxic", "environment"], uses: "Liquid metal; thermometers." },
  { id: "pb", name: "Lead", formula: "Pb", category: "metal", phase: "solid",
    color: "#7A7F85", accent: "#A5A9AE", opacity: 1,
    molarMass: 207.2, density: 11.34, mp: 327, bp: 1749,
    hazards: ["toxic", "environment"], uses: "Batteries, radiation shielding." },
  { id: "sn", name: "Tin", formula: "Sn", category: "metal", phase: "solid",
    color: "#BFC3C7", accent: "#E4E6E8", opacity: 1,
    molarMass: 118.71, density: 7.31, mp: 232, bp: 2602,
    hazards: [], uses: "Solder, tin-plating." },
];

/* ============================================================
   NON-METALS & HALOGENS
============================================================ */
const NONMETALS: Chemical[] = [
  { id: "c", name: "Carbon (graphite)", formula: "C", category: "non-metal", phase: "solid",
    color: "#222226", accent: "#3A3A40", opacity: 1,
    molarMass: 12.01, density: 2.26, mp: 3550,
    hazards: [], uses: "Pencils, electrodes, allotropes." },
  { id: "s", name: "Sulfur", formula: "S₈", category: "non-metal", phase: "solid",
    color: "#F1D000", accent: "#FCE55A", opacity: 1,
    molarMass: 32.07, density: 2.07, mp: 115, bp: 445,
    hazards: ["flammable", "irritant"], uses: "Vulcanisation, H₂SO₄ manufacture." },
  { id: "p_red", name: "Red Phosphorus", formula: "P (red)", category: "non-metal", phase: "solid",
    color: "#8A1E1E", accent: "#C13939", opacity: 1,
    molarMass: 30.97, density: 2.34,
    hazards: ["flammable"], uses: "Match strikers." },
  { id: "p_white", name: "White Phosphorus", formula: "P₄", category: "non-metal", phase: "solid",
    color: "#F3EFD8", accent: "#E4DFB6", opacity: 1, glow: true,
    molarMass: 123.9, density: 1.82, mp: 44,
    hazards: ["flammable", "toxic", "explosive"], uses: "Extremely reactive; kept under water." },
  { id: "i2", name: "Iodine", formula: "I₂", category: "non-metal", phase: "solid",
    color: "#3A1E4D", accent: "#6C33A2", opacity: 1,
    molarMass: 253.81, density: 4.93, mp: 114, bp: 184,
    hazards: ["toxic", "irritant"], uses: "Sublimes to violet vapour. Starch test." },
  { id: "br2", name: "Bromine", formula: "Br₂", category: "non-metal", phase: "liquid",
    color: "#7B2E1A", accent: "#C24E2F", opacity: 0.95,
    molarMass: 159.81, density: 3.10, mp: -7, bp: 59,
    hazards: ["toxic", "corrosive", "environment"], uses: "Red-brown liquid; fumes orange vapour." },
  { id: "cl2", name: "Chlorine", formula: "Cl₂", category: "non-metal", phase: "gas",
    color: "#C7D46A", accent: "#E4EE9B", opacity: 0.7, glow: true,
    molarMass: 70.9, density: 0.003, bp: -34,
    hazards: ["toxic", "oxidiser"], uses: "Pale green gas; bleach, PVC." },
];

/* ============================================================
   OXIDES
============================================================ */
const OXIDES: Chemical[] = [
  { id: "co2", name: "Carbon Dioxide", formula: "CO₂", category: "gas", phase: "gas",
    color: "#E9EEF2", accent: "#FFFFFF", opacity: 0.35, glow: true,
    molarMass: 44.01, density: 0.00198, bp: -78,
    hazards: [], uses: "Limewater test — turns milky." },
  { id: "co", name: "Carbon Monoxide", formula: "CO", category: "gas", phase: "gas",
    color: "#EEF1F3", accent: "#FFFFFF", opacity: 0.3, glow: true,
    molarMass: 28.01, bp: -191,
    hazards: ["toxic", "flammable"], uses: "Silent killer; reduces iron ore in blast furnace." },
  { id: "no2", name: "Nitrogen Dioxide", formula: "NO₂", category: "gas", phase: "gas",
    color: "#A0450F", accent: "#D8791F", opacity: 0.75, glow: true,
    molarMass: 46.01, bp: 21,
    hazards: ["toxic", "oxidiser"], uses: "Brown fumes; forms HNO₃." },
  { id: "so2", name: "Sulfur Dioxide", formula: "SO₂", category: "gas", phase: "gas",
    color: "#EAECEB", accent: "#FFFFFF", opacity: 0.45, glow: true,
    molarMass: 64.07, bp: -10,
    hazards: ["toxic", "irritant"], uses: "Bleach for wool; acid rain." },
  { id: "cuo", name: "Copper(II) Oxide", formula: "CuO", category: "oxide", phase: "solid",
    color: "#1F1F22", accent: "#3A3A3D", opacity: 1,
    molarMass: 79.55, density: 6.31, mp: 1326,
    hazards: ["irritant", "environment"], uses: "Black solid; reduced to copper by H₂." },
  { id: "cu2o", name: "Copper(I) Oxide", formula: "Cu₂O", category: "oxide", phase: "solid",
    color: "#B04A1F", accent: "#DE7040", opacity: 1,
    molarMass: 143.09, density: 6.0, mp: 1235,
    hazards: ["harmful", "environment"], uses: "Brick-red Fehling's positive test." },
  { id: "fe2o3", name: "Iron(III) Oxide", formula: "Fe₂O₃", category: "oxide", phase: "solid",
    color: "#8A2A0F", accent: "#C7472A", opacity: 1,
    molarMass: 159.69, density: 5.24, mp: 1565,
    hazards: [], uses: "Rust; thermite." },
  { id: "mgo", name: "Magnesium Oxide", formula: "MgO", category: "oxide", phase: "solid",
    color: "#F7F7F0", accent: "#E0E0C9", opacity: 1,
    molarMass: 40.30, density: 3.58, mp: 2852,
    hazards: [], uses: "Refractory; formed when Mg burns." },
  { id: "cao", name: "Calcium Oxide", formula: "CaO", category: "oxide", phase: "solid",
    color: "#F4F4EA", accent: "#DBDBBF", opacity: 1,
    molarMass: 56.08, density: 3.34, mp: 2613,
    hazards: ["corrosive"], uses: "Quicklime; exothermic with water." },
  { id: "al2o3", name: "Aluminium Oxide", formula: "Al₂O₃", category: "oxide", phase: "solid",
    color: "#EEEEE6", accent: "#D2D2BE", opacity: 1,
    molarMass: 101.96, density: 3.95, mp: 2072,
    hazards: [], uses: "Corundum; sapphires; electrolysis of alumina." },
];

/* ============================================================
   ORGANICS
============================================================ */
const ORGANICS: Chemical[] = [
  { id: "ch4", name: "Methane", formula: "CH₄", category: "gas", phase: "gas",
    color: "#F0F3F5", accent: "#FFFFFF", opacity: 0.25, glow: true,
    molarMass: 16.04, bp: -161,
    hazards: ["flammable"], uses: "Natural gas; blue flame." },
  { id: "c2h4", name: "Ethene", formula: "C₂H₄", category: "gas", phase: "gas",
    color: "#EFF3F5", accent: "#FFFFFF", opacity: 0.25, glow: true,
    molarMass: 28.05, bp: -104,
    hazards: ["flammable"], uses: "Ripens fruit; polymerises to polyethene." },
  { id: "c2h2", name: "Ethyne", formula: "C₂H₂", category: "gas", phase: "gas",
    color: "#EEF2F4", accent: "#FFFFFF", opacity: 0.3, glow: true,
    molarMass: 26.04, bp: -84,
    hazards: ["flammable", "explosive"], uses: "Oxyacetylene torch, sooty flame." },
  { id: "ethanol", name: "Ethanol", formula: "C₂H₅OH", category: "organic", phase: "liquid",
    color: "#FAFAF3", accent: "#E4E3CB", opacity: 0.45,
    molarMass: 46.07, density: 0.789, bp: 78, mp: -114,
    hazards: ["flammable", "irritant"], uses: "Solvent, fuel, sanitiser. Blue flame." },
  { id: "methanol", name: "Methanol", formula: "CH₃OH", category: "organic", phase: "liquid",
    color: "#F9FAF3", accent: "#E1E3CA", opacity: 0.45,
    molarMass: 32.04, density: 0.792, bp: 65, mp: -98,
    hazards: ["toxic", "flammable"], uses: "Antifreeze, biodiesel. Pale blue flame." },
  { id: "propanone", name: "Propanone (Acetone)", formula: "(CH₃)₂CO", category: "organic", phase: "liquid",
    color: "#F8F9F2", accent: "#DFE0C8", opacity: 0.4,
    molarMass: 58.08, density: 0.784, bp: 56, mp: -95,
    hazards: ["flammable", "irritant"], uses: "Solvent, nail polish remover." },
  { id: "benzene", name: "Benzene", formula: "C₆H₆", category: "organic", phase: "liquid",
    color: "#F7F8F1", accent: "#DDDDC6", opacity: 0.4,
    molarMass: 78.11, density: 0.876, bp: 80, mp: 5,
    hazards: ["toxic", "flammable"], uses: "Aromatic parent; carcinogen." },
  { id: "chloroform", name: "Chloroform", formula: "CHCl₃", category: "organic", phase: "liquid",
    color: "#F5F7F1", accent: "#D8DCC6", opacity: 0.55,
    molarMass: 119.38, density: 1.49, bp: 61, mp: -63,
    hazards: ["toxic", "harmful"], uses: "Solvent; dense, sinks below water." },
  { id: "hexane", name: "Hexane", formula: "C₆H₁₄", category: "solvent", phase: "liquid",
    color: "#FAFAF3", accent: "#E4E4CC", opacity: 0.4,
    molarMass: 86.18, density: 0.655, bp: 69,
    hazards: ["flammable", "harmful", "environment"], uses: "Non-polar solvent; chromatography." },
  { id: "glucose", name: "Glucose", formula: "C₆H₁₂O₆", category: "organic", phase: "aqueous",
    color: "#F9F5DC", accent: "#EBE0A5", opacity: 0.55,
    molarMass: 180.16, mp: 146, solubility: "very soluble",
    hazards: [], uses: "Reducing sugar; Fehling's / Benedict's." },
  { id: "starch", name: "Starch", formula: "(C₆H₁₀O₅)ₙ", category: "organic", phase: "aqueous",
    color: "#F5F3E4", accent: "#DED9B0", opacity: 0.75,
    hazards: [], uses: "Iodine test → blue-black." },
];

/* ============================================================
   INDICATORS
============================================================ */
const INDICATORS: Chemical[] = [
  { id: "litmus", name: "Litmus (neutral)", formula: "—", category: "indicator", phase: "aqueous",
    color: "#8E5FA6", accent: "#B892C8", opacity: 0.8,
    hazards: [], uses: "Red in acid, blue in base." },
  { id: "phenolphthalein", name: "Phenolphthalein", formula: "C₂₀H₁₄O₄", category: "indicator", phase: "aqueous",
    color: "#F6EDF2", accent: "#E6C8DA", opacity: 0.5,
    hazards: ["harmful"], uses: "Colourless in acid, pink in base (pH > 8)." },
  { id: "methyl-orange", name: "Methyl Orange", formula: "C₁₄H₁₄N₃NaO₃S", category: "indicator", phase: "aqueous",
    color: "#E37B1E", accent: "#F0A356", opacity: 0.9,
    hazards: ["toxic"], uses: "Red in acid, yellow in base." },
  { id: "bromothymol", name: "Bromothymol Blue", formula: "C₂₇H₂₈Br₂O₅S", category: "indicator", phase: "aqueous",
    color: "#1F7A98", accent: "#59B2CC", opacity: 0.9,
    hazards: ["irritant"], uses: "Yellow (acid), green (neutral), blue (base)." },
  { id: "universal", name: "Universal Indicator", formula: "—", category: "indicator", phase: "aqueous",
    color: "#5FA83B", accent: "#8BCB6C", opacity: 0.9,
    hazards: [], uses: "Rainbow across the pH scale." },
];

/* ============================================================
   COMMON GASES (extra beyond oxides)
============================================================ */
const GASES: Chemical[] = [
  { id: "o2", name: "Oxygen", formula: "O₂", category: "gas", phase: "gas",
    color: "#EEF6FF", accent: "#FFFFFF", opacity: 0.2, glow: true,
    molarMass: 32, bp: -183,
    hazards: ["oxidiser"], uses: "Relights glowing splint." },
  { id: "h2", name: "Hydrogen", formula: "H₂", category: "gas", phase: "gas",
    color: "#F1F5FB", accent: "#FFFFFF", opacity: 0.2, glow: true,
    molarMass: 2.02, bp: -253,
    hazards: ["flammable", "explosive"], uses: "Squeaky-pop test." },
  { id: "n2", name: "Nitrogen", formula: "N₂", category: "gas", phase: "gas",
    color: "#EFF2F6", accent: "#FFFFFF", opacity: 0.18, glow: true,
    molarMass: 28.02, bp: -196,
    hazards: [], uses: "Inert atmosphere; 78% of air." },
  { id: "hcl_g", name: "Hydrogen Chloride", formula: "HCl(g)", category: "gas", phase: "gas",
    color: "#F0F2E8", accent: "#DDE0BC", opacity: 0.35, glow: true,
    molarMass: 36.46, bp: -85,
    hazards: ["toxic", "corrosive"], uses: "White fumes with NH₃ → NH₄Cl smoke." },
  { id: "nh3_g", name: "Ammonia gas", formula: "NH₃", category: "gas", phase: "gas",
    color: "#EFF6EC", accent: "#D1E5CA", opacity: 0.35, glow: true,
    molarMass: 17.03, bp: -33,
    hazards: ["toxic", "corrosive"], uses: "Turns damp red litmus blue." },
  { id: "h2o_vapour", name: "Water Vapour", formula: "H₂O(g)", category: "vapour", phase: "vapour",
    color: "#EAF0F5", accent: "#FFFFFF", opacity: 0.3, glow: true,
    molarMass: 18.02, bp: 100,
    hazards: [], uses: "Condenses on cool surfaces." },
  { id: "br_vapour", name: "Bromine Vapour", formula: "Br₂(g)", category: "vapour", phase: "vapour",
    color: "#B8571D", accent: "#E5813B", opacity: 0.65, glow: true,
    molarMass: 159.81, bp: 59,
    hazards: ["toxic", "corrosive"], uses: "Dense orange-brown fumes." },
  { id: "i_vapour", name: "Iodine Vapour", formula: "I₂(g)", category: "vapour", phase: "vapour",
    color: "#6C33A2", accent: "#9E63D1", opacity: 0.55, glow: true,
    molarMass: 253.81, bp: 184,
    hazards: ["toxic", "irritant"], uses: "Violet sublimation vapour." },
  { id: "no_vapour", name: "Nitric Oxide", formula: "NO", category: "vapour", phase: "vapour",
    color: "#EDF0F0", accent: "#FFFFFF", opacity: 0.3, glow: true,
    molarMass: 30.01, bp: -152,
    hazards: ["toxic"], uses: "Colourless → brown NO₂ in air." },
];

/* ============================================================
   FLAMES (bunsen, splints, flame tests)
============================================================ */
const FLAMES: Chemical[] = [
  { id: "flame-bunsen-blue", name: "Bunsen Roaring Flame", formula: "—", category: "flame", phase: "flame",
    color: "#1E4FD1", accent: "#7BB5FF", opacity: 0.9, glow: true,
    hazards: ["flammable"], uses: "Complete combustion, ~1500°C." },
  { id: "flame-bunsen-yellow", name: "Bunsen Safety Flame", formula: "—", category: "flame", phase: "flame",
    color: "#F4A013", accent: "#FFD87A", opacity: 0.9, glow: true,
    hazards: ["flammable"], uses: "Incomplete combustion, ~700°C, visible." },
  { id: "flame-li", name: "Lithium Flame Test", formula: "Li⁺", category: "flame", phase: "flame",
    color: "#C81E3A", accent: "#FF6D82", opacity: 0.95, glow: true,
    hazards: ["flammable"], uses: "Crimson red." },
  { id: "flame-na", name: "Sodium Flame Test", formula: "Na⁺", category: "flame", phase: "flame",
    color: "#F5C518", accent: "#FFE882", opacity: 0.95, glow: true,
    hazards: ["flammable"], uses: "Bright golden-yellow." },
  { id: "flame-k", name: "Potassium Flame Test", formula: "K⁺", category: "flame", phase: "flame",
    color: "#8E4DBD", accent: "#C89AE0", opacity: 0.95, glow: true,
    hazards: ["flammable"], uses: "Lilac (view through cobalt blue glass)." },
  { id: "flame-ca", name: "Calcium Flame Test", formula: "Ca²⁺", category: "flame", phase: "flame",
    color: "#E56B1C", accent: "#FFA65F", opacity: 0.95, glow: true,
    hazards: ["flammable"], uses: "Brick red." },
  { id: "flame-cu", name: "Copper Flame Test", formula: "Cu²⁺", category: "flame", phase: "flame",
    color: "#2AB37A", accent: "#7EE6B3", opacity: 0.95, glow: true,
    hazards: ["flammable"], uses: "Blue-green (halide: emerald)." },
  { id: "flame-ba", name: "Barium Flame Test", formula: "Ba²⁺", category: "flame", phase: "flame",
    color: "#7BC94F", accent: "#B7EA92", opacity: 0.95, glow: true,
    hazards: ["flammable", "toxic"], uses: "Apple green." },
  { id: "flame-sr", name: "Strontium Flame Test", formula: "Sr²⁺", category: "flame", phase: "flame",
    color: "#D91E4B", accent: "#FF6D8E", opacity: 0.95, glow: true,
    hazards: ["flammable"], uses: "Bright scarlet." },
  { id: "flame-mg", name: "Magnesium Burn", formula: "Mg", category: "flame", phase: "flame",
    color: "#FFFFFF", accent: "#F6FCFF", opacity: 1, glow: true,
    hazards: ["flammable"], uses: "Blinding white — do not stare." },
];

/* ============================================================
   Master export
============================================================ */
export const CHEMICALS: Chemical[] = [
  ...ACIDS,
  ...BASES,
  ...SALTS,
  ...METALS,
  ...NONMETALS,
  ...OXIDES,
  ...ORGANICS,
  ...INDICATORS,
  ...GASES,
  ...FLAMES,
];

export const CATEGORY_LABEL: Record<Category, string> = {
  acid: "Acids",
  base: "Bases & Alkalis",
  salt: "Salts",
  metal: "Metals",
  "non-metal": "Non-metals",
  oxide: "Oxides",
  organic: "Organic",
  indicator: "Indicators",
  gas: "Gases",
  solvent: "Solvents",
  flame: "Flames",
  vapour: "Vapours",
};

export const HAZARD_LABEL: Record<Hazard, string> = {
  toxic: "Toxic",
  corrosive: "Corrosive",
  flammable: "Flammable",
  oxidiser: "Oxidiser",
  irritant: "Irritant",
  explosive: "Explosive",
  harmful: "Harmful",
  radioactive: "Radioactive",
  environment: "Env. hazard",
};
