import { ChemicalSubstance } from "./dwsimChemicals";

export const EXTRA_CHEMICAL_DATABASE: Record<string, ChemicalSubstance> = {
  // --- ADDITIONAL ACIDS & BASES ---
  "h3po4_sol": {
    id: "h3po4_sol",
    name: "Phosphoric Acid / Phosphate (0.1M)",
    formula: "H3PO4(aq)",
    state: "solution",
    color: "rgba(255, 255, 255, 0.2)",
    opacity: 0.2,
    pH: 1.5,
    molarMass: 98.0,
    description: "Tribasic weak acid. Forms a vivid yellow precipitate when gently heated with ammonium molybdate.",
    hazards: ["Corrosive"]
  },
  "na2so3_sol": {
    id: "na2so3_sol",
    name: "Sodium Sulfite Solution (0.1M)",
    formula: "Na2SO3(aq)",
    state: "solution",
    color: "rgba(255, 255, 255, 0.2)",
    opacity: 0.2,
    pH: 8.5,
    molarMass: 126.0,
    description: "Sulfite salt solution. Reacts with dilute acids to evolve pungent sulfur dioxide gas (turns K2Cr2O7 green).",
    hazards: ["Mild Irritant"]
  },

  // --- ADDITIONAL METAL SALTS FOR FLAME TESTS & QUALITATIVE ---
  "licl_sol": {
    id: "licl_sol",
    name: "Lithium Chloride Sample",
    formula: "LiCl(aq)",
    state: "solution",
    color: "rgba(255, 255, 255, 0.2)",
    opacity: 0.2,
    pH: 6.5,
    molarMass: 42.4,
    description: "Alkali metal salt. When tested in a blue Bunsen flame, it imparts an intense Crimson / Scarlet Red color.",
    hazards: ["Harmful if swallowed"]
  },
  "nacl_sol": {
    id: "nacl_sol",
    name: "Sodium Chloride Solution / Brine",
    formula: "NaCl(aq)",
    state: "solution",
    color: "rgba(255, 255, 255, 0.2)",
    opacity: 0.2,
    pH: 7.0,
    molarMass: 58.4,
    description: "Common table salt solution. Imparts a persistent brilliant yellow flame, and yields curdy white AgCl with Silver Nitrate.",
    hazards: []
  },
  "kcl_sol": {
    id: "kcl_sol",
    name: "Potassium Chloride Solution",
    formula: "KCl(aq)",
    state: "solution",
    color: "rgba(255, 255, 255, 0.2)",
    opacity: 0.2,
    pH: 7.0,
    molarMass: 74.6,
    description: "Potassium salt. Imparts a delicate Lilac / Pale Violet color through a cobalt blue glass filter.",
    hazards: []
  },
  "srcl2_sol": {
    id: "srcl2_sol",
    name: "Strontium Chloride Sample",
    formula: "SrCl2(aq)",
    state: "solution",
    color: "rgba(255, 255, 255, 0.2)",
    opacity: 0.2,
    pH: 6.5,
    molarMass: 158.5,
    description: "Alkaline earth metal salt. Elicits a spectacular, blinding Bright Crimson Red flame upon thermal excitation.",
    hazards: ["Irritant"]
  },
  "alcl3_sol": {
    id: "alcl3_sol",
    name: "Aluminium Chloride Solution (0.1M)",
    formula: "AlCl3(aq)",
    state: "solution",
    color: "rgba(255, 255, 255, 0.2)",
    opacity: 0.2,
    pH: 3.5,
    molarMass: 133.3,
    isAmphoteric: true,
    description: "Aluminium salt. Produces a white gelatinous precipitate with NaOH that completely redissolves in excess alkali.",
    hazards: ["Corrosive"]
  },
  "nh4cl_sol": {
    id: "nh4cl_sol",
    name: "Ammonium Chloride Solution (0.1M)",
    formula: "NH4Cl(aq)",
    state: "solution",
    color: "rgba(255, 255, 255, 0.2)",
    opacity: 0.2,
    pH: 5.5,
    molarMass: 53.5,
    description: "Ammonium salt. Upon boiling with Sodium Hydroxide, it evolves pungent ammonia gas that turns damp red litmus blue.",
    hazards: ["Irritant"]
  },

  // --- BIOCHEMICAL & COMPLEXOMETRIC TITRATION REAGENTS ---
  "edta_sol": {
    id: "edta_sol",
    name: "Standard EDTA Solution (0.01M)",
    formula: "C10H16N2O8",
    state: "solution",
    color: "rgba(255, 255, 255, 0.2)",
    opacity: 0.2,
    pH: 8.0,
    molarMass: 292.2,
    description: "Hexadentate chelating titrant. Used to quantify total Water Hardness (Ca2+ and Mg2+) in complexometric assays.",
    hazards: []
  },
  "eriochrome_black_t": {
    id: "eriochrome_black_t",
    name: "Eriochrome Black T Indicator",
    formula: "C20H12N3NaO7S",
    state: "solution",
    color: "rgb(178, 34, 34)", // wine red
    opacity: 0.5,
    pH: 10.0,
    molarMass: 461.4,
    description: "Complexometric indicator. Forms a Wine Red complex with hard water ions, snapping purely to Blue at the EDTA equivalence point.",
    hazards: ["Irritant"]
  },
  "k2cro4_sol": {
    id: "k2cro4_sol",
    name: "Potassium Chromate Indicator (0.1M)",
    formula: "K2CrO4(aq)",
    state: "solution",
    color: "rgb(255, 255, 0)", // yellow
    opacity: 0.8,
    pH: 9.0,
    molarMass: 194.2,
    description: "Bright yellow solution used as the visual indicator in Mohr's Silver Nitrate precipitation titrations for chlorides.",
    hazards: ["Toxic", "Carcinogen"]
  },
  "ninhydrin_sol": {
    id: "ninhydrin_sol",
    name: "Ninhydrin Reagent (0.1%)",
    formula: "C9H6O4",
    state: "solution",
    color: "rgba(255, 255, 255, 0.3)",
    opacity: 0.3,
    pH: 6.0,
    molarMass: 178.1,
    description: "Biochemical diagnostic reagent. When warmed with solutions containing proteins or free amino acids, it produces a majestic deep Purple / Blue color (Ruhemann's purple).",
    hazards: ["Irritant", "Stains skin"]
  },
  "biuret_sol": {
    id: "biuret_sol",
    name: "Biuret Test Reagent (NaOH + CuSO4)",
    formula: "Cu/Alkali",
    state: "solution",
    color: "rgb(0, 150, 255)", // blue
    opacity: 0.7,
    pH: 13.5,
    molarMass: 200,
    description: "Alkaline copper complex. Coordinates to peptide bonds in proteins (milk, egg white) to instantly display a beautiful Violet / Purple hue.",
    hazards: ["Corrosive"]
  },
  "sudan_sol": {
    id: "sudan_sol",
    name: "Sudan III / IV Lipid Stain",
    formula: "C22H16N4O",
    state: "solution",
    color: "rgb(220, 20, 60)", // crimson red
    opacity: 0.8,
    pH: 7.0,
    molarMass: 352.4,
    description: "Fat-soluble dye. Selectively stains fats, oils, and waxes to yield an unmistakable, vibrant red top emulsion layer.",
    hazards: ["Flammable solvent"]
  },
  "nylon_reagents": {
    id: "nylon_reagents",
    name: "Nylon Interface Monomers (Adipoyl + Diamine)",
    formula: "Polymer Mix",
    state: "solution",
    color: "rgba(240, 250, 255, 0.6)",
    opacity: 0.6,
    pH: 11.0,
    molarMass: 300,
    description: "Two immiscible liquid phases (Adipoyl chloride in cyclohexane + 1,6-diaminohexane in water). Produces a continuous, pullable white Nylon-6,6 thread exactly at the liquid interface.",
    hazards: ["Corrosive", "Toxic vapor"]
  },

  // --- ADDITIONAL ORGANIC ALCOHOLS & HYDROCARBONS ---
  "methanol": {
    id: "methanol",
    name: "Methanol (Pure 99%)",
    formula: "CH3OH(l)",
    state: "liquid",
    color: "rgba(255, 255, 255, 0.2)",
    opacity: 0.2,
    pH: 7.0,
    molarMass: 32.0,
    boilingPoint: 64.7,
    specificHeat: 2.53,
    enthalpyFormation: -238.6,
    flammable: true,
    description: "Simplest primary alcohol. Highly toxic. Burned in spirit lamps to calibrate combustion calorimeters.",
    hazards: ["Highly Flammable", "Toxic", "Causes blindness if swallowed"]
  },
  "propanol": {
    id: "propanol",
    name: "Propan-2-ol / Isopropanol",
    formula: "C3H7OH(l)",
    state: "liquid",
    color: "rgba(255, 255, 255, 0.2)",
    opacity: 0.2,
    pH: 7.0,
    molarMass: 60.1,
    boilingPoint: 82.5,
    flammable: true,
    description: "Secondary alcohol. Undergoes controlled oxidation with acidified Potassium Dichromate to yield propanone (ketone).",
    hazards: ["Highly Flammable", "Irritant"]
  },
  "butanol": {
    id: "butanol",
    name: "Butan-1-ol",
    formula: "C4H9OH(l)",
    state: "liquid",
    color: "rgba(255, 255, 255, 0.2)",
    opacity: 0.2,
    pH: 7.0,
    molarMass: 74.1,
    boilingPoint: 117.7,
    flammable: true,
    description: "Heavier primary aliphatic alcohol. Used in esterifications and heat of combustion experiments.",
    hazards: ["Flammable", "Harmful if swallowed"]
  },

  // --- ADDITIONAL GASES ---
  "h2s_gas": {
    id: "h2s_gas",
    name: "Hydrogen Sulfide Gas",
    formula: "H2S(g)",
    state: "gas",
    color: "rgba(200, 200, 150, 0.4)",
    opacity: 0.4,
    pH: 4.0,
    molarMass: 34.1,
    description: "Extremely hazardous, foul-smelling gas (rotten eggs aroma). Instantly turns moist Lead Acetate test paper pitch black.",
    hazards: ["Highly Toxic", "Extremely Flammable"]
  },
  "so2_gas": {
    id: "so2_gas",
    name: "Sulfur Dioxide Gas",
    formula: "SO2(g)",
    state: "gas",
    color: "rgba(220, 220, 220, 0.5)",
    opacity: 0.5,
    pH: 2.5,
    molarMass: 64.1,
    description: "Choking, acidic sulfurous gas evolved from sulfites or copper in hot concentrated sulfuric acid. Redissolves to form sulfurous acid.",
    hazards: ["Toxic", "Choking irritant"]
  },
  "no2_gas": {
    id: "no2_gas",
    name: "Nitrogen Dioxide Gas",
    formula: "NO2(g)",
    state: "gas",
    color: "rgba(205, 133, 63, 0.7)", // brown gas
    opacity: 0.7,
    pH: 2.0,
    molarMass: 46.0,
    description: "Striking, toxic Reddish-Brown gas generated from reacting Copper turnings with concentrated Nitric Acid.",
    hazards: ["Highly Toxic", "Severe pulmonary irritant", "Oxidizer"]
  }
};
