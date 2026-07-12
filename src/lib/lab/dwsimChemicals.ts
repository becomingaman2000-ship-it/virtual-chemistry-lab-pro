// Chemical & Material Reagent Database for Virtual Chemistry Lab Engine

export interface ChemicalSubstance {
  id: string;
  name: string;
  formula: string;
  state: "liquid" | "solid" | "gas" | "solution";
  color: string; // CSS color or gradient
  opacity: number; // 0.1 to 1.0 for liquids/gases
  pH: number;
  molarMass: number; // g/mol
  density?: number; // g/cm3
  boilingPoint?: number; // °C
  meltingPoint?: number; // °C
  specificHeat?: number; // J/(g·°C)
  enthalpyFormation?: number; // kJ/mol (standard Delta Hf)
  reductionPotential?: number; // E° in Volts (for electrochemistry)
  description: string;
  hazards: string[];
  isAmphoteric?: boolean;
  flammable?: boolean;
}

export const CHEMICAL_DATABASE: Record<string, ChemicalSubstance> = {
  // --- ACIDS ---
  "hcl_dilute": {
    id: "hcl_dilute",
    name: "Dilute Hydrochloric Acid (1M)",
    formula: "HCl(aq)",
    state: "solution",
    color: "rgba(240, 248, 255, 0.2)",
    opacity: 0.2,
    pH: 0.5,
    molarMass: 36.5,
    density: 1.02,
    specificHeat: 4.18,
    description: "Strong monobasic mineral acid. Used in titrations, carbonate tests, and qualitative cation tests.",
    hazards: ["Corrosive", "Irritant"]
  },
  "hcl_conc": {
    id: "hcl_conc",
    name: "Concentrated Hydrochloric Acid (12M)",
    formula: "HCl(conc)",
    state: "solution",
    color: "rgba(245, 245, 245, 0.4)",
    opacity: 0.4,
    pH: -1.1,
    molarMass: 36.5,
    density: 1.18,
    description: "Fuming, extremely strong acid. Used in chlorine preparation and brown ring tests.",
    hazards: ["Toxic fumes", "Severe Corrosive"]
  },
  "h2so4_dilute": {
    id: "h2so4_dilute",
    name: "Dilute Sulfuric Acid (1M)",
    formula: "H2SO4(aq)",
    state: "solution",
    color: "rgba(255, 255, 255, 0.2)",
    opacity: 0.2,
    pH: 0.3,
    molarMass: 98.0,
    density: 1.06,
    specificHeat: 4.18,
    description: "Strong dibasic acid. Used in acid-base titrations, electrolysis, and salt preparations.",
    hazards: ["Corrosive"]
  },
  "h2so4_conc": {
    id: "h2so4_conc",
    name: "Concentrated Sulfuric Acid (18M)",
    formula: "H2SO4(conc)",
    state: "solution",
    color: "rgba(255, 250, 240, 0.5)",
    opacity: 0.5,
    pH: -1.3,
    molarMass: 98.0,
    density: 1.84,
    specificHeat: 1.42,
    description: "Powerful dehydrating and oxidizing acid. Used in esterification, aspirin synthesis, and brown ring tests.",
    hazards: ["Severe Corrosive", "Reactive with water"]
  },
  "hno3_dilute": {
    id: "hno3_dilute",
    name: "Dilute Nitric Acid (1M)",
    formula: "HNO3(aq)",
    state: "solution",
    color: "rgba(255, 255, 240, 0.2)",
    opacity: 0.2,
    pH: 0.5,
    molarMass: 63.0,
    description: "Strong oxidizing acid. Used in halide tests to acidify silver nitrate.",
    hazards: ["Corrosive", "Oxidizer"]
  },
  "ethanoic_acid": {
    id: "ethanoic_acid",
    name: "Ethanoic Acid / Acetic Acid (0.1M)",
    formula: "CH3COOH(aq)",
    state: "solution",
    color: "rgba(255, 255, 255, 0.2)",
    opacity: 0.2,
    pH: 2.9,
    molarMass: 60.0,
    specificHeat: 4.18,
    description: "Weak organic acid found in vinegar. Used in buffer preparation and esterification.",
    hazards: ["Mild Irritant"]
  },

  // --- BASES ---
  "naoh_dilute": {
    id: "naoh_dilute",
    name: "Sodium Hydroxide Solution (1M)",
    formula: "NaOH(aq)",
    state: "solution",
    color: "rgba(250, 250, 250, 0.2)",
    opacity: 0.2,
    pH: 13.8,
    molarMass: 40.0,
    specificHeat: 4.18,
    description: "Strong alkali. Essential reagent for testing metal cations (Fe2+, Fe3+, Cu2+, Al3+, Zn2+).",
    hazards: ["Corrosive"]
  },
  "nh3_dilute": {
    id: "nh3_dilute",
    name: "Ammonia Solution (1M)",
    formula: "NH3(aq)",
    state: "solution",
    color: "rgba(240, 255, 255, 0.2)",
    opacity: 0.2,
    pH: 11.2,
    molarMass: 17.0,
    description: "Weak alkali. Used in testing metal cations and forming royal blue tetraamminecopper(II) complexes.",
    hazards: ["Pungent odor", "Irritant"]
  },
  "limewater": {
    id: "limewater",
    name: "Limewater / Calcium Hydroxide",
    formula: "Ca(OH)2(aq)",
    state: "solution",
    color: "rgba(255, 255, 255, 0.2)",
    opacity: 0.2,
    pH: 12.4,
    molarMass: 74.1,
    description: "Saturated calcium hydroxide solution. Used primarily to confirm the presence of Carbon Dioxide gas (turns milky).",
    hazards: ["Mild Irritant"]
  },
  "na2co3_sol": {
    id: "na2co3_sol",
    name: "Sodium Carbonate Solution (0.1M)",
    formula: "Na2CO3(aq)",
    state: "solution",
    color: "rgba(255, 255, 255, 0.2)",
    opacity: 0.2,
    pH: 11.6,
    molarMass: 106.0,
    description: "Primary standard alkaline solution. Used in soda ash double titrations and neutralization.",
    hazards: ["Irritant"]
  },

  // --- METAL SALT SOLUTIONS & CATIONS ---
  "cuso4_sol": {
    id: "cuso4_sol",
    name: "Copper(II) Sulfate Solution (0.5M)",
    formula: "CuSO4(aq)",
    state: "solution",
    color: "rgb(0, 150, 255)",
    opacity: 0.8,
    pH: 4.5,
    molarMass: 159.6,
    reductionPotential: 0.34,
    description: "Vibrant blue transition metal salt solution. Used in qualitative analysis, iodometric titrations, and Daniel cells.",
    hazards: ["Toxic to aquatic life", "Harmful if swallowed"]
  },
  "feso4_sol": {
    id: "feso4_sol",
    name: "Iron(II) Sulfate Solution (0.1M)",
    formula: "FeSO4(aq)",
    state: "solution",
    color: "rgb(143, 188, 143)", // pale green
    opacity: 0.7,
    pH: 4.0,
    molarMass: 151.9,
    reductionPotential: -0.44,
    description: "Pale green iron salt solution. Acts as a reducing agent in permanganate titrations and brown ring tests.",
    hazards: ["Irritant"]
  },
  "fecl3_sol": {
    id: "fecl3_sol",
    name: "Iron(III) Chloride Solution (0.1M)",
    formula: "FeCl3(aq)",
    state: "solution",
    color: "rgb(218, 165, 32)", // golden yellow-brown
    opacity: 0.8,
    pH: 2.0,
    molarMass: 162.2,
    reductionPotential: 0.77,
    description: "Yellow-brown iron salt solution. Forms red-brown gelatinous precipitates with sodium hydroxide.",
    hazards: ["Corrosive", "Stains skin"]
  },
  "bacl2_sol": {
    id: "bacl2_sol",
    name: "Barium Chloride Solution (0.1M)",
    formula: "BaCl2(aq)",
    state: "solution",
    color: "rgba(255, 255, 255, 0.2)",
    opacity: 0.2,
    pH: 6.5,
    molarMass: 208.2,
    description: "Colorless solution used as the principal qualitative test reagent for Sulfate (SO4 2-) ions.",
    hazards: ["Toxic if swallowed"]
  },
  "agno3_sol": {
    id: "agno3_sol",
    name: "Silver Nitrate Solution (0.1M)",
    formula: "AgNO3(aq)",
    state: "solution",
    color: "rgba(255, 255, 255, 0.2)",
    opacity: 0.2,
    pH: 6.0,
    molarMass: 169.9,
    reductionPotential: 0.80,
    description: "Precipitating reagent for Halides (Cl- white, Br- cream, I- yellow) and Mohr's titrations.",
    hazards: ["Corrosive", "Causes black skin stains", "Toxic"]
  },
  "cacl2_sol": {
    id: "cacl2_sol",
    name: "Calcium Chloride Solution (0.1M)",
    formula: "CaCl2(aq)",
    state: "solution",
    color: "rgba(255, 255, 255, 0.2)",
    opacity: 0.2,
    pH: 6.5,
    molarMass: 110.9,
    description: "Used in flame tests (brick red flame) and precipitation tests.",
    hazards: ["Irritant"]
  },

  // --- OXIDIZING & REDUCING AGENTS ---
  "kmno4_sol": {
    id: "kmno4_sol",
    name: "Potassium Permanganate / Manganate(VII) (0.02M)",
    formula: "KMnO4(aq)",
    state: "solution",
    color: "rgb(128, 0, 128)", // deep purple
    opacity: 0.9,
    pH: 7.0,
    molarMass: 158.0,
    reductionPotential: 1.51,
    description: "Deep purple self-indicating oxidizing agent. Decolorizes in redox reactions with reducing agents like Fe2+.",
    hazards: ["Strong Oxidizer", "Stains"]
  },
  "k2cr2o7_sol": {
    id: "k2cr2o7_sol",
    name: "Potassium Dichromate(VI) Solution (0.017M)",
    formula: "K2Cr2O7(aq)",
    state: "solution",
    color: "rgb(255, 140, 0)", // bright orange
    opacity: 0.9,
    pH: 4.0,
    molarMass: 294.2,
    reductionPotential: 1.33,
    description: "Orange oxidizing agent. Turns green (Cr3+) when reduced by alcohols or sulfur dioxide.",
    hazards: ["Toxic", "Carcinogen", "Strong Oxidizer"]
  },
  "na2s2o3_sol": {
    id: "na2s2o3_sol",
    name: "Sodium Thiosulfate Solution (0.1M)",
    formula: "Na2S2O3(aq)",
    state: "solution",
    color: "rgba(255, 255, 255, 0.2)",
    opacity: 0.2,
    pH: 7.0,
    molarMass: 158.1,
    description: "Reducing agent used in iodometric titrations and reaction rate experiments (reacts with HCl to precipitate sulfur).",
    hazards: ["Mild Irritant"]
  },
  "kio3_sol": {
    id: "kio3_sol",
    name: "Potassium Iodate Solution (0.05M)",
    formula: "KIO3(aq)",
    state: "solution",
    color: "rgba(255, 255, 255, 0.2)",
    opacity: 0.2,
    pH: 6.5,
    molarMass: 214.0,
    description: "Oxidizing agent used in the dramatic Iodine Clock reaction.",
    hazards: ["Oxidizer", "Irritant"]
  },
  "h2o2_sol": {
    id: "h2o2_sol",
    name: "Hydrogen Peroxide (20 volume)",
    formula: "H2O2(aq)",
    state: "solution",
    color: "rgba(255, 255, 255, 0.2)",
    opacity: 0.2,
    pH: 5.0,
    molarMass: 34.0,
    description: "Decomposes quickly in the presence of Manganese Dioxide (MnO2) catalyst to yield Oxygen gas.",
    hazards: ["Oxidizer", "Irritant"]
  },
  "iodine_sol": {
    id: "iodine_sol",
    name: "Iodine Solution (0.05M)",
    formula: "I2(aq)",
    state: "solution",
    color: "rgb(139, 69, 19)", // yellow-brown
    opacity: 0.8,
    pH: 6.5,
    molarMass: 253.8,
    description: "Yellow-brown solution. Forms an intense deep blue-black complex with Starch.",
    hazards: ["Stains", "Irritant"]
  },

  // --- INDICATORS & REAGENTS ---
  "phenolphthalein": {
    id: "phenolphthalein",
    name: "Phenolphthalein Indicator",
    formula: "C20H14O4",
    state: "solution",
    color: "rgba(255, 192, 203, 0.3)",
    opacity: 0.3,
    pH: 7.0,
    molarMass: 318.3,
    description: "Acid-base indicator. Completely colorless in acid and neutral solutions, bright magenta/pink in alkali (pH > 8.2).",
    hazards: ["Flammable solvent"]
  },
  "methyl_orange": {
    id: "methyl_orange",
    name: "Methyl Orange Indicator",
    formula: "C14H14N3NaO3S",
    state: "solution",
    color: "rgb(255, 165, 0)", // orange
    opacity: 0.7,
    pH: 7.0,
    molarMass: 327.3,
    description: "Indicator for strong acid-weak base titrations. Red in acid (pH < 3.1), yellow in alkali.",
    hazards: ["Toxic"]
  },
  "universal_indicator": {
    id: "universal_indicator",
    name: "Universal Indicator Solution",
    formula: "Mix",
    state: "solution",
    color: "rgb(60, 179, 113)", // green at neutral
    opacity: 0.7,
    pH: 7.0,
    molarMass: 100,
    description: "Blend of indicators that displays a magnificent rainbow spectrum from pH 1 (red) to pH 7 (green) to pH 14 (violet).",
    hazards: ["Flammable solvent"]
  },
  "starch_sol": {
    id: "starch_sol",
    name: "Starch Indicator Solution",
    formula: "(C6H10O5)n",
    state: "solution",
    color: "rgba(255, 255, 255, 0.3)",
    opacity: 0.3,
    pH: 7.0,
    molarMass: 1000,
    description: "Sensitive specific indicator for iodine. Forms an unmistakable deep blue-black complex.",
    hazards: []
  },
  "benedicts_sol": {
    id: "benedicts_sol",
    name: "Benedict's Reagent",
    formula: "CuSO4/Citrate",
    state: "solution",
    color: "rgb(0, 191, 255)", // deep blue
    opacity: 0.9,
    pH: 10.5,
    molarMass: 250,
    description: "Used to test for reducing sugars (glucose, fructose). Turns from blue to a brick red/orange precipitate when heated.",
    hazards: ["Irritant"]
  },
  "fehlings_sol": {
    id: "fehlings_sol",
    name: "Fehling's Solution (A + B)",
    formula: "CuSO4/Tartrate",
    state: "solution",
    color: "rgb(0, 0, 139)", // royal dark blue
    opacity: 0.9,
    pH: 12.0,
    molarMass: 250,
    description: "Confirms aldehydes and reducing sugars by precipitating brick red Copper(I) Oxide (Cu2O) on boiling.",
    hazards: ["Corrosive"]
  },
  "tollens_reagent": {
    id: "tollens_reagent",
    name: "Tollens' Silver Mirror Reagent",
    formula: "[Ag(NH3)2]+",
    state: "solution",
    color: "rgba(240, 240, 240, 0.3)",
    opacity: 0.3,
    pH: 11.5,
    molarMass: 150,
    description: "Ammoniacal silver nitrate solution. Deposits a magnificent, flawless silver mirror on glassware when heated with aldehydes.",
    hazards: ["Corrosive", "Unstable over time"]
  },
  "bromine_water": {
    id: "bromine_water",
    name: "Bromine Water",
    formula: "Br2(aq)",
    state: "solution",
    color: "rgb(210, 105, 30)", // orange-brown
    opacity: 0.8,
    pH: 4.0,
    molarMass: 159.8,
    description: "Orange-brown test reagent for unsaturation (alkenes and alkynes). Decolorizes instantly upon addition of unsaturated compounds.",
    hazards: ["Toxic", "Corrosive", "Stains"]
  },

  // --- ORGANIC SOLVENTS & REAGENTS ---
  "ethanol": {
    id: "ethanol",
    name: "Ethanol (Pure 95%)",
    formula: "C2H5OH(l)",
    state: "liquid",
    color: "rgba(255, 255, 255, 0.2)",
    opacity: 0.2,
    pH: 7.0,
    molarMass: 46.1,
    boilingPoint: 78.3,
    specificHeat: 2.44,
    enthalpyFormation: -277.6,
    flammable: true,
    description: "Primary aliphatic alcohol. Used in esterification (produces fruity ethyl ethanoate), oxidation, and solvent extraction.",
    hazards: ["Highly Flammable"]
  },
  "glucose_sol": {
    id: "glucose_sol",
    name: "Glucose Solution (0.5M)",
    formula: "C6H12O6(aq)",
    state: "solution",
    color: "rgba(255, 255, 255, 0.2)",
    opacity: 0.2,
    pH: 7.0,
    molarMass: 180.2,
    description: "Monosaccharide reducing sugar. Fermented by yeast to make ethanol, and reduces Benedict's/Fehling's solution.",
    hazards: []
  },
  "sucrose_sol": {
    id: "sucrose_sol",
    name: "Sucrose Solution (0.5M)",
    formula: "C12H22O11(aq)",
    state: "solution",
    color: "rgba(255, 255, 255, 0.2)",
    opacity: 0.2,
    pH: 7.0,
    molarMass: 342.3,
    description: "Non-reducing disaccharide table sugar. Requires acid hydrolysis before reacting with Benedict's.",
    hazards: []
  },
  "hexane": {
    id: "hexane",
    name: "Hexane (Pure Alkane)",
    formula: "C6H14(l)",
    state: "liquid",
    color: "rgba(255, 255, 255, 0.2)",
    opacity: 0.2,
    pH: 7.0,
    molarMass: 86.2,
    boilingPoint: 68.7,
    flammable: true,
    description: "Saturated liquid hydrocarbon. Immiscible with water. Shows no reaction with bromine water in the dark.",
    hazards: ["Highly Flammable", "Toxic vapor"]
  },
  "cyclohexene": {
    id: "cyclohexene",
    name: "Cyclohexene (Pure Alkene)",
    formula: "C6H10(l)",
    state: "liquid",
    color: "rgba(255, 255, 255, 0.2)",
    opacity: 0.2,
    pH: 7.0,
    molarMass: 82.1,
    boilingPoint: 83.0,
    flammable: true,
    description: "Unsaturated liquid hydrocarbon containing a double bond (C=C). Instantly decolorizes bromine water and acidified KMnO4.",
    hazards: ["Highly Flammable", "Irritant"]
  },
  "vegetable_oil": {
    id: "vegetable_oil",
    name: "Vegetable Oil / Triglyceride",
    formula: "Lipid Mixture",
    state: "liquid",
    color: "rgba(255, 215, 0, 0.7)", // golden oil
    opacity: 0.7,
    pH: 7.0,
    molarMass: 885.4,
    flammable: true,
    description: "Unsaturated cooking oil. Used in saponification (making soap with NaOH) and transesterification (making biodiesel).",
    hazards: []
  },

  // --- SOLIDS & METALS ---
  "caco3_solid": {
    id: "caco3_solid",
    name: "Calcium Carbonate / Marble Chips",
    formula: "CaCO3(s)",
    state: "solid",
    color: "rgb(240, 240, 240)", // white chips/powder
    opacity: 1.0,
    pH: 8.5,
    molarMass: 100.1,
    specificHeat: 0.85,
    description: "White solid marble chips or limestone powder. Reacts rapidly with dilute acids to generate carbon dioxide gas.",
    hazards: []
  },
  "zn_solid": {
    id: "zn_solid",
    name: "Zinc Metal Granules / Ribbon",
    formula: "Zn(s)",
    state: "solid",
    color: "rgb(169, 169, 169)", // silver-grey
    opacity: 1.0,
    pH: 7.0,
    molarMass: 65.4,
    reductionPotential: -0.76,
    description: "Active transition metal granules. Dissolves in dilute sulfuric or hydrochloric acid to yield bubbles of pure hydrogen gas.",
    hazards: ["Flammable hydrogen evolved in acid"]
  },
  "cu_solid": {
    id: "cu_solid",
    name: "Copper Metal Turnings / Plate",
    formula: "Cu(s)",
    state: "solid",
    color: "rgb(184, 115, 51)", // shiny copper-red
    opacity: 1.0,
    pH: 7.0,
    molarMass: 63.5,
    reductionPotential: 0.34,
    description: "Reddish metallic turnings or active electrodes. Reacts with concentrated nitric or hot sulfuric acid.",
    hazards: []
  },
  "mg_solid": {
    id: "mg_solid",
    name: "Magnesium Metal Ribbon",
    formula: "Mg(s)",
    state: "solid",
    color: "rgb(211, 211, 211)", // brilliant bright silver
    opacity: 1.0,
    pH: 7.0,
    molarMass: 24.3,
    reductionPotential: -2.37,
    description: "Highly active alkaline earth metal. Burns in air with an intense blinding white flame, and reacts furiously with acids.",
    hazards: ["Flammable solid", "Intense bright light on combustion"]
  },
  "fe_solid": {
    id: "fe_solid",
    name: "Iron Nails / Filings",
    formula: "Fe(s)",
    state: "solid",
    color: "rgb(112, 128, 144)", // dark grey steel
    opacity: 1.0,
    pH: 7.0,
    molarMass: 55.8,
    reductionPotential: -0.44,
    description: "Used in electroplating experiments, rust investigations, and Daniel cells.",
    hazards: []
  },
  "salicylic_acid": {
    id: "salicylic_acid",
    name: "Salicylic Acid Solid Crystals",
    formula: "C7H6O3(s)",
    state: "solid",
    color: "rgb(255, 250, 250)", // white needles
    opacity: 1.0,
    pH: 2.4,
    molarMass: 138.1,
    meltingPoint: 158,
    description: "White aromatic crystal needles. Used as the precursor to synthesize Aspirin when reacted with acetic anhydride.",
    hazards: ["Irritant"]
  },
  "mno2_solid": {
    id: "mno2_solid",
    name: "Manganese Dioxide Powder (Catalyst)",
    formula: "MnO2(s)",
    state: "solid",
    color: "rgb(20, 20, 20)", // jet black powder
    opacity: 1.0,
    pH: 7.0,
    molarMass: 86.9,
    description: "Black catalyst powder. Dramatically accelerates the decomposition of hydrogen peroxide to produce oxygen.",
    hazards: ["Strong Oxidizer"]
  },
  "ki_solid": {
    id: "ki_solid",
    name: "Potassium Iodide Crystals",
    formula: "KI(s)",
    state: "solid",
    color: "rgb(255, 255, 255)", // white salt
    opacity: 1.0,
    pH: 7.0,
    molarMass: 166.0,
    description: "White crystals used in iodometric titrations to liberate free iodine from copper sulfate.",
    hazards: ["Irritant"]
  },
  "yeast_solid": {
    id: "yeast_solid",
    name: "Active Yeast / Catalase Extract",
    formula: "Enzyme",
    state: "solid",
    color: "rgb(222, 184, 135)", // light brown
    opacity: 1.0,
    pH: 7.0,
    molarMass: 1000,
    description: "Biological source of the enzymes zymase (for fermenting glucose to ethanol) and catalase (for breaking down H2O2).",
    hazards: []
  },

  // --- GASES ---
  "co2_gas": {
    id: "co2_gas",
    name: "Carbon Dioxide Gas",
    formula: "CO2(g)",
    state: "gas",
    color: "rgba(220, 220, 220, 0.4)",
    opacity: 0.4,
    pH: 5.5,
    molarMass: 44.0,
    density: 0.00198,
    description: "Denser-than-air colorless gas. Puts out burning splints and turns limewater milky white.",
    hazards: ["Suffocation hazard in high concentrations"]
  },
  "o2_gas": {
    id: "o2_gas",
    name: "Oxygen Gas",
    formula: "O2(g)",
    state: "gas",
    color: "rgba(135, 206, 250, 0.3)",
    opacity: 0.3,
    pH: 7.0,
    molarMass: 32.0,
    density: 0.00143,
    description: "Colorless gas essential for life and fire. Immediately relights a glowing wooden splint with a burst of flame.",
    hazards: ["Vigorously accelerates combustion"]
  },
  "h2_gas": {
    id: "h2_gas",
    name: "Hydrogen Gas",
    formula: "H2(g)",
    state: "gas",
    color: "rgba(240, 240, 240, 0.3)",
    opacity: 0.3,
    pH: 7.0,
    molarMass: 2.0,
    density: 0.000089,
    flammable: true,
    description: "Extremely light, highly flammable gas. When tested with a burning splint, it burns with a sharp 'squeaky pop'.",
    hazards: ["Highly Flammable", "Explosive"]
  },
  "cl2_gas": {
    id: "cl2_gas",
    name: "Chlorine Gas",
    formula: "Cl2(g)",
    state: "gas",
    color: "rgba(173, 255, 47, 0.6)", // green-yellow gas
    opacity: 0.6,
    pH: 2.0,
    molarMass: 70.9,
    description: "Pungent yellow-green toxic halogen gas. Bleaches damp colored litmus paper purely white.",
    hazards: ["Highly Toxic", "Choking vapor", "Strong Oxidizer"]
  },
};

import { EXTRA_CHEMICAL_DATABASE } from "./dwsimChemicalsExtra";

Object.assign(CHEMICAL_DATABASE, EXTRA_CHEMICAL_DATABASE);

export function getChemical(id: string): ChemicalSubstance {
  return CHEMICAL_DATABASE[id] || {
    id: id,
    name: id,
    formula: id,
    state: "solution",
    color: "rgba(150, 150, 150, 0.3)",
    opacity: 0.3,
    pH: 7.0,
    molarMass: 100,
    description: "Generic customized chemical substance.",
    hazards: []
  };
}
