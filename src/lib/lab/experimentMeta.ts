/**
 * Category tags & level metadata for the 115 DWSIM experiments,
 * mapped onto the 13 sections (A–M) of the Master Chemistry
 * Experiment List (112 items — enriched with a few duplicates
 * to cover companion procedures).
 *
 * Each entry lets the UI:
 *   - group experiments by A–M for the sidebar
 *   - filter by O-Level / A-Level per syllabus
 *   - decide which boards typically examine which experiment
 */

export type PdfCategory =
  | "A" // Volumetric / Titration
  | "B" // Gravimetric
  | "C" // Qualitative — Cations
  | "D" // Qualitative — Anions
  | "E" // Gas Preparation & Tests
  | "F" // Rates / Kinetics
  | "G" // Thermochemistry
  | "H" // Electrochemistry
  | "I" // Chromatography & Separation
  | "J" // Organic
  | "K" // Equilibrium
  | "L" // Solubility & Physical Properties
  | "M"; // Applied / Miscellaneous

export const PDF_CATEGORY_LABELS: Record<PdfCategory, string> = {
  A: "Volumetric / Titration Analysis",
  B: "Gravimetric Analysis",
  C: "Qualitative Analysis — Cations",
  D: "Qualitative Analysis — Anions",
  E: "Gas Preparation & Tests",
  F: "Rates of Reaction / Kinetics",
  G: "Thermochemistry / Energetics",
  H: "Electrochemistry",
  I: "Chromatography & Separation",
  J: "Organic Chemistry",
  K: "Equilibrium",
  L: "Solubility & Physical Properties",
  M: "Applied / Miscellaneous",
};

export type ExpLevel = "O-Level" | "A-Level" | "Both";

export interface ExperimentMeta {
  category: PdfCategory;
  level: ExpLevel;
}

/**
 * Manual mapping. Every one of the 115 DWSIM experiments gets a
 * category + level so we can filter them per syllabus.
 * Where a DWSIM experiment straddles topics we pick the dominant one.
 */
export const EXPERIMENT_META: Record<number, ExperimentMeta> = {
  1:  { category: "C", level: "Both" },   // Flame tests
  2:  { category: "D", level: "Both" },   // Anion tests part 1
  3:  { category: "D", level: "A-Level" },// Brown ring
  4:  { category: "C", level: "Both" },   // Cation NaOH
  5:  { category: "C", level: "Both" },   // Cation NH3
  6:  { category: "E", level: "Both" },   // Gas ID
  7:  { category: "E", level: "Both" },
  8:  { category: "E", level: "Both" },
  9:  { category: "E", level: "Both" },
  10: { category: "E", level: "Both" },
  11: { category: "A", level: "Both" },   // Titrations
  12: { category: "A", level: "A-Level" },// Amino / ninhydrin quantification
  13: { category: "A", level: "A-Level" },
  14: { category: "A", level: "A-Level" },
  15: { category: "A", level: "A-Level" },
  16: { category: "B", level: "Both" },
  17: { category: "B", level: "Both" },
  18: { category: "B", level: "A-Level" },
  19: { category: "B", level: "A-Level" },
  20: { category: "B", level: "A-Level" },
  21: { category: "A", level: "Both" },   // Neutralisation titration
  22: { category: "A", level: "Both" },
  23: { category: "A", level: "A-Level" },
  24: { category: "A", level: "A-Level" },// KMnO4 vs Fe2+
  25: { category: "A", level: "A-Level" },// Iodometry
  26: { category: "L", level: "A-Level" },// EDTA hard-water
  27: { category: "F", level: "Both" },
  28: { category: "F", level: "Both" },
  29: { category: "F", level: "A-Level" },
  30: { category: "F", level: "A-Level" },
  31: { category: "F", level: "A-Level" },
  32: { category: "F", level: "A-Level" },
  33: { category: "F", level: "A-Level" },
  34: { category: "F", level: "A-Level" },
  35: { category: "F", level: "A-Level" },
  36: { category: "G", level: "Both" },
  37: { category: "G", level: "Both" },
  38: { category: "J", level: "A-Level" },// Esterification
  39: { category: "J", level: "A-Level" },// Saponification
  40: { category: "J", level: "A-Level" },
  41: { category: "J", level: "Both" },   // Bromine water
  42: { category: "J", level: "Both" },   // Fehling / Benedict
  43: { category: "J", level: "Both" },   // Starch iodine
  44: { category: "J", level: "A-Level" },// Ninhydrin / biuret
  45: { category: "J", level: "A-Level" },// Fermentation
  46: { category: "J", level: "A-Level" },
  47: { category: "J", level: "A-Level" },// Aspirin
  48: { category: "J", level: "A-Level" },// Oxidation of alcohols
  49: { category: "J", level: "A-Level" },
  50: { category: "J", level: "A-Level" },
  51: { category: "H", level: "Both" },   // Electrolysis
  52: { category: "H", level: "Both" },
  53: { category: "H", level: "Both" },
  54: { category: "H", level: "A-Level" },
  55: { category: "H", level: "A-Level" },
  56: { category: "H", level: "A-Level" },
  57: { category: "H", level: "Both" },   // Reactivity series
  58: { category: "H", level: "A-Level" },// Faraday
  59: { category: "I", level: "Both" },   // Paper chromatography
  60: { category: "I", level: "A-Level" },
  61: { category: "F", level: "A-Level" },// Iodine clock
  62: { category: "I", level: "Both" },   // Distillation
  63: { category: "I", level: "A-Level" },// Fractional distillation
  64: { category: "F", level: "Both" },   // Catalyst H2O2/MnO2
  65: { category: "I", level: "Both" },   // Filtration
  66: { category: "I", level: "Both" },   // Crystallisation
  67: { category: "I", level: "A-Level" },// Solvent extraction
  68: { category: "L", level: "Both" },   // Solubility vs temp
  69: { category: "L", level: "A-Level" },// Volatile liquid Mr
  70: { category: "L", level: "Both" },   // Melting point purity
  71: { category: "G", level: "Both" },   // Enthalpy of neutralisation
  72: { category: "G", level: "A-Level" },// Displacement enthalpy
  73: { category: "G", level: "A-Level" },// Enthalpy of solution
  74: { category: "G", level: "A-Level" },// Combustion calorimetry
  75: { category: "G", level: "A-Level" },// Hess's law
  76: { category: "G", level: "A-Level" },// Specific heat capacity
  77: { category: "G", level: "A-Level" },// Cooling curve correction
  78: { category: "G", level: "A-Level" },// Combined enthalpy + titration
  79: { category: "E", level: "Both" },   // CO2 (carbonates)
  80: { category: "E", level: "Both" },   // NH3 preparation
  81: { category: "E", level: "Both" },   // H2 preparation
  82: { category: "E", level: "Both" },   // O2 preparation
  83: { category: "E", level: "Both" },   // Cl2
  84: { category: "E", level: "A-Level" },// SO2
  85: { category: "E", level: "Both" },   // Water vapour test
  86: { category: "E", level: "Both" },   // HCl gas test
  87: { category: "E", level: "Both" },   // Gas collection methods
  88: { category: "E", level: "Both" },
  89: { category: "E", level: "A-Level" },// NO2 preparation
  90: { category: "E", level: "A-Level" },// H2S preparation
  91: { category: "K", level: "A-Level" },// Cobalt chloride equilibrium
  92: { category: "K", level: "A-Level" },// Chromate/dichromate
  93: { category: "K", level: "A-Level" },// Fe(III) thiocyanate
  94: { category: "K", level: "A-Level" },// NO2/N2O4
  95: { category: "L", level: "Both" },   // Rusting
  96: { category: "L", level: "A-Level" },// Water hardness
  97: { category: "M", level: "Both" },   // Environmental water
  98: { category: "M", level: "Both" },   // Household analysis
  99: { category: "M", level: "A-Level" },// Gas solubility
  100: { category: "M", level: "Both" },  // Multi-ion flame survey
  101: { category: "M", level: "Both" },  // Preparation of soluble salt
  102: { category: "M", level: "Both" },  // Preparation of insoluble salt
  103: { category: "J", level: "A-Level" },// Cracking hydrocarbon
  104: { category: "J", level: "A-Level" },// Addition polymerisation
  105: { category: "J", level: "A-Level" },
  106: { category: "J", level: "A-Level" },
  107: { category: "L", level: "A-Level" },
  108: { category: "L", level: "A-Level" },
  109: { category: "H", level: "A-Level" },// Voltaic cell EMF
  110: { category: "H", level: "Both" },   // Electroplating
  111: { category: "K", level: "A-Level" },
  112: { category: "M", level: "Both" },
  113: { category: "M", level: "A-Level" },
  114: { category: "M", level: "A-Level" },
  115: { category: "M", level: "A-Level" },
};

export function metaFor(id: number): ExperimentMeta {
  return EXPERIMENT_META[id] ?? { category: "M", level: "Both" };
}

export function fitsLevel(expLevel: ExpLevel, syllabusLevel: "O-Level" | "A-Level"): boolean {
  return expLevel === "Both" || expLevel === syllabusLevel;
}