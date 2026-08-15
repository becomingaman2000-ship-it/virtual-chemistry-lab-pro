// DWSIM Reaction Engine — Thermodynamic & Qualitative Logic Solver

import { getChemical, ChemicalSubstance } from "./dwsimChemicals";
import { COMPLETE_SYLLABUS_EXPERIMENTS } from "./experimentsCatalog";

export interface ContainerState {
  id: string;
  name: string;
  type: "beaker" | "conical_flask" | "test_tube" | "burette" | "pipette" | "watch_glass" | "chromatography_tank";
  maxVolume: number;
  currentVolume: number; // ml or grams
  temperature: number; // °C
  pH: number;
  color: string; // CSS rgb or rgba
  opacity: number;
  substanceIds: Record<string, number>; // substance ID -> amount (ml or g)
  precipitate: { name: string; color: string; formula: string; amount: number } | null;
  bubblingGas: { name: string; formula: string } | null;
  flameColor: string | null; // For flame tests
  isHeated: boolean;
  stirSpeed: number; // 0 to 1
  hasSilverMirror?: boolean;
}

export interface ReactionResult {
  message: string;
  successExperimentId?: number;
  deltaTemperature?: number;
  newPrecipitate?: { name: string; color: string; formula: string; amount: number };
  newGas?: { name: string; formula: string };
  newColor?: string;
  newOpacity?: number;
  newPH?: number;
  soundEffect?: "pop" | "fizz" | "success" | "splash" | "glass";
  isExplosive?: boolean;
  /** True when nothing in the rule base matched: the mixture is genuinely
   *  unreactive under these conditions rather than merely unimplemented. */
  noVisibleChange?: boolean;
}

/* ------------------------------------------------------------------
   Acid / base reference data used by the pH model.
   `molarity` is the concentration the bench bottle is labelled with,
   `protons`/`hydroxides` the basicity/acidity, and Ka/Kb drive the weak
   species. Ordered strongest-first so the dominant species is easy to find.
------------------------------------------------------------------- */
interface AcidSpec { id: string; molarity: number; protons: number; strong: boolean; ka?: number; }
interface BaseSpec { id: string; molarity: number; hydroxides: number; strong: boolean; kb?: number; }

const ACID_SPECS: AcidSpec[] = [
  { id: "h2so4_conc", molarity: 18.0, protons: 2, strong: true },
  { id: "hcl_conc", molarity: 11.0, protons: 1, strong: true },
  { id: "hno3_dilute", molarity: 1.0, protons: 1, strong: true },
  { id: "h2so4_dilute", molarity: 1.0, protons: 2, strong: true },
  { id: "hcl_dilute", molarity: 1.0, protons: 1, strong: true },
  { id: "ethanoic_acid", molarity: 1.0, protons: 1, strong: false, ka: 1.8e-5 },
  { id: "citric_acid_sol", molarity: 0.5, protons: 3, strong: false, ka: 7.4e-4 },
  { id: "carbonic_acid", molarity: 0.1, protons: 2, strong: false, ka: 4.3e-7 },
];

const BASE_SPECS: BaseSpec[] = [
  { id: "naoh_dilute", molarity: 1.0, hydroxides: 1, strong: true },
  { id: "koh_sol", molarity: 0.1, hydroxides: 1, strong: true },
  { id: "limewater", molarity: 0.02, hydroxides: 2, strong: true },
  { id: "na2co3_sol", molarity: 1.0, hydroxides: 2, strong: false, kb: 2.1e-4 },
  { id: "nahco3_sol", molarity: 1.0, hydroxides: 1, strong: false, kb: 2.3e-8 },
  { id: "nh3_dilute", molarity: 1.0, hydroxides: 1, strong: false, kb: 1.8e-5 },
];

/** The species present in the greatest molar amount — it sets the pH regime. */
function strongestPresent<T extends { id: string; molarity: number }>(
  specs: T[],
  getAmt: (id: string) => number,
): T | undefined {
  let best: T | undefined;
  let bestMoles = 0;
  for (const spec of specs) {
    const moles = getAmt(spec.id) * spec.molarity;
    if (moles > bestMoles) { bestMoles = moles; best = spec; }
  }
  return best;
}

// Compute the combined thermodynamic & chemical state of a container
export function evaluateReaction(container: ContainerState, activeExperimentId?: number): ReactionResult {
  const out = evaluateReactionRules(container, activeExperimentId);
  // A rule fired if it changed the message or produced any observable effect.
  // Only then is the "no visible reaction" claim withdrawn.
  const acted =
    out.message !== NO_CHANGE_MESSAGE ||
    out.successExperimentId !== undefined ||
    out.newPrecipitate !== undefined ||
    out.newGas !== undefined ||
    out.newPH !== undefined ||
    out.deltaTemperature !== undefined ||
    out.isExplosive === true ||
    container.flameColor !== undefined ||
    container.hasSilverMirror === true;
  out.noVisibleChange = !acted;
  return out;
}

const NO_CHANGE_MESSAGE = "Substances mixed. No visible reaction under these conditions.";

function evaluateReactionRules(container: ContainerState, activeExperimentId?: number): ReactionResult {
  const ids = Object.keys(container.substanceIds);
  // Default to an honest null result. Claiming success for every mixture
  // taught students that any two reagents "work"; 66 of the 111 bench
  // chemicals have no rule here, and they should say so plainly.
  const result: ReactionResult = {
    message: NO_CHANGE_MESSAGE,
    noVisibleChange: true,
  };

  if (ids.length === 0) return result;

  // Helper to check presence
  const has = (id: string) => (container.substanceIds[id] || 0) > 0;
  const getAmt = (id: string) => container.substanceIds[id] || 0;

  // 1. FLAME TESTS (Experiment 1)
  if (container.isHeated && container.type === "watch_glass" || container.isHeated && has("hcl_dilute")) {
    if (has("cacl2_sol")) {
      container.flameColor = "#ff4500"; // Brick Red
      result.message = "Calcium ions (Ca²⁺) emit a spectacular Brick Red flame!";
      result.successExperimentId = 1;
      return result;
    }
    if (has("cuso4_sol")) {
      container.flameColor = "#00ced1"; // Turquoise Blue-Green
      result.message = "Copper ions (Cu²⁺) emit a dazzling Turquoise Blue-Green flame!";
      result.successExperimentId = 1;
      return result;
    }
    if (has("bacl2_sol")) {
      container.flameColor = "#7cfc00"; // Apple Green
      result.message = "Barium ions (Ba²⁺) emit a vibrant Apple Green flame!";
      result.successExperimentId = 1;
      return result;
    }
  }

  // 2. QUALITATIVE CATION TESTS WITH NaOH (Experiment 4)
  if (has("naoh_dilute") || has("na2co3_sol")) {
    if (has("cuso4_sol")) {
      result.newPrecipitate = { name: "Copper(II) Hydroxide", formula: "Cu(OH)₂↓", color: "rgb(0, 50, 200)", amount: 5 };
      result.message = "Royal blue gelatinous precipitate of Copper(II) Hydroxide formed.";
      result.successExperimentId = 4;
    } else if (has("feso4_sol")) {
      result.newPrecipitate = { name: "Iron(II) Hydroxide", formula: "Fe(OH)₂↓", color: "rgb(46, 139, 87)", amount: 5 };
      result.message = "Dirty green gelatinous precipitate of Iron(II) Hydroxide formed.";
      result.successExperimentId = 4;
    } else if (has("fecl3_sol")) {
      result.newPrecipitate = { name: "Iron(III) Hydroxide", formula: "Fe(OH)₃↓", color: "rgb(178, 34, 34)", amount: 5 };
      result.message = "Rust red-brown precipitate of Iron(III) Hydroxide formed.";
      result.successExperimentId = 4;
    } else if (has("zn_solid") || has("zn_sol")) {
      if (getAmt("naoh_dilute") > 15) {
        // Redissolves in excess
        container.precipitate = null;
        result.newPrecipitate = undefined;
        result.newColor = "rgba(255, 255, 255, 0.1)";
        result.message = "Initial white Zinc Hydroxide precipitate completely redissolved in excess NaOH to form soluble sodium tetrahydroxozincate!";
        result.successExperimentId = 4;
      } else {
        result.newPrecipitate = { name: "Zinc Hydroxide", formula: "Zn(OH)₂↓", color: "rgb(255, 255, 255)", amount: 4 };
        result.message = "White precipitate of Zinc Hydroxide formed (add excess NaOH to test amphoterism).";
      }
    }
  }

  // 3. AMMONIA COMPLEXATION OF Cu²⁺ (Experiment 5)
  if (has("nh3_dilute") && has("cuso4_sol")) {
    if (getAmt("nh3_dilute") > 12) {
      container.precipitate = null;
      result.newPrecipitate = undefined;
      result.newColor = "rgb(0, 0, 139)"; // Deep royal blue
      result.newOpacity = 0.95;
      result.message = "Initial pale precipitate dissolved magically in excess ammonia to yield an intense, royal blue tetraamminecopper(II) complex!";
      result.successExperimentId = 5;
    } else {
      result.newPrecipitate = { name: "Copper(II) Hydroxide", formula: "Cu(OH)₂↓", color: "rgb(65, 105, 225)", amount: 3 };
      result.message = "Pale blue precipitate formed. Add excess ammonia to produce deep royal blue solution!";
    }
  }

  // 4. TESTS FOR ANIONS — HALIDES & SULFATE (Experiment 2)
  if (has("agno3_sol")) {
    if (has("hcl_dilute") || has("nacl_sol")) {
      result.newPrecipitate = { name: "Silver Chloride", formula: "AgCl↓", color: "rgb(255, 255, 255)", amount: 6 };
      result.message = "Curdy white precipitate of Silver Chloride formed (confirms Chloride ions Cl⁻).";
      result.successExperimentId = 2;
    }
  }
  if (has("bacl2_sol") && (has("h2so4_dilute") || has("cuso4_sol") || has("feso4_sol"))) {
    result.newPrecipitate = { name: "Barium Sulfate", formula: "BaSO₄↓", color: "rgb(255, 255, 255)", amount: 8 };
    result.message = "Dense white precipitate of Barium Sulfate formed, insoluble in strong acids (confirms Sulfate SO₄²⁻).";
    result.successExperimentId = 2;
  }

  // 5. BROWN RING TEST FOR NITRATE (Experiment 3)
  if (has("hno3_dilute") && has("feso4_sol") && has("h2so4_conc")) {
    result.newColor = "rgba(180, 100, 50, 0.8)";
    result.message = "A striking, crisp brown ring of [Fe(H₂O)₅(NO)]²⁺ complex formed at the acid interface!";
    result.successExperimentId = 3;
    result.soundEffect = "success";
  }

  // 6. GAS EVOLUTION — CARBONATES & HYDROGEN (Experiments 79 & 81)
  if (has("caco3_solid") && (has("hcl_dilute") || has("h2so4_dilute") || has("hcl_conc"))) {
    result.newGas = { name: "Carbon Dioxide", formula: "CO₂↑" };
    result.soundEffect = "fizz";
    result.message = "Furious effervescence! Dense Carbon Dioxide gas evolving (turns limewater milky).";
    result.successExperimentId = 79;
    // Consume some solid
    if (container.substanceIds["caco3_solid"] > 1) container.substanceIds["caco3_solid"] -= 0.5;
  }
  if (has("zn_solid") && (has("h2so4_dilute") || has("hcl_dilute") || has("hcl_conc"))) {
    result.newGas = { name: "Hydrogen", formula: "H₂↑" };
    result.soundEffect = "fizz";
    result.message = "Rapid effervescence! Pure flammable Hydrogen gas bubbling up (explodes with a squeaky pop).";
    result.successExperimentId = 81;
  }
  if (has("mg_solid") && (has("h2so4_dilute") || has("hcl_dilute") || has("ethanoic_acid"))) {
    result.newGas = { name: "Hydrogen", formula: "H₂↑" };
    result.soundEffect = "fizz";
    result.message = "Furious fizzing! Magnesium reacts vigorously to liberate Hydrogen gas.";
    result.deltaTemperature = 15; // Exothermic
  }

  // 7. CATALYTIC H₂O₂ DECOMPOSITION (Experiment 64)
  if (has("h2o2_sol") && has("mno2_solid")) {
    result.newGas = { name: "Oxygen", formula: "O₂↑" };
    result.soundEffect = "fizz";
    result.deltaTemperature = 12;
    result.message = "Furious catalytic eruption! Oxygen gas evolving rapidly in the presence of black MnO₂ catalyst.";
    result.successExperimentId = 64;
  }

  // 8. ACID-BASE CHEMISTRY (Experiment 21 & Enthalpy Exp 71)
  // A proper equilibrium model: every acid and base contributes moles of H+ or
  // OH- scaled by its molarity and basicity/acidity, the excess is diluted into
  // the real vessel volume, and weak species use their Ka/Kb. This runs for a
  // lone acid or a lone base too — previously pH only ever changed when an acid
  // and a base were both present, so a beaker of pure HCl still read pH 7.
  const acidMolesIn = ACID_SPECS.reduce((sum, a) => sum + getAmt(a.id) / 1000 * a.molarity * a.protons, 0);
  const baseMolesIn = BASE_SPECS.reduce((sum, b) => sum + getAmt(b.id) / 1000 * b.molarity * b.hydroxides, 0);
  const isAcid = acidMolesIn > 0;
  const isBase = baseMolesIn > 0;

  if (isAcid || isBase) {
    const totalV = Math.max(container.currentVolume || 0, 1) / 1000; // litres
    const net = baseMolesIn - acidMolesIn; // + => base in excess

    // The species left in excess decides whether we use a strong or weak model.
    const dominantAcid = strongestPresent(ACID_SPECS, getAmt);
    const dominantBase = strongestPresent(BASE_SPECS, getAmt);

    let newPH: number;
    const excess = Math.abs(net) / totalV; // mol/dm3 of excess H+ or OH-

    if (excess < 1e-7) {
      // Equivalence point. A strong/strong titration lands on 7; a weak acid
      // leaves a basic salt behind, a weak base an acidic one.
      const weakAcid = dominantAcid && !dominantAcid.strong;
      const weakBase = dominantBase && !dominantBase.strong;
      if (weakAcid && !weakBase) newPH = 8.8;
      else if (weakBase && !weakAcid) newPH = 5.2;
      else newPH = 7.0;
    } else if (net < 0) {
      // Acid in excess
      const spec = dominantAcid;
      if (spec && !spec.strong) {
        // Weak acid: [H+] = sqrt(Ka * C)
        newPH = -Math.log10(Math.sqrt((spec.ka ?? 1.8e-5) * excess));
      } else {
        newPH = -Math.log10(excess);
      }
    } else {
      // Base in excess
      const spec = dominantBase;
      if (spec && !spec.strong) {
        // Weak base: [OH-] = sqrt(Kb * C)
        newPH = 14 + Math.log10(Math.sqrt((spec.kb ?? 1.8e-5) * excess));
      } else {
        newPH = 14 + Math.log10(excess);
      }
    }

    newPH = Math.max(0, Math.min(14, newPH));
    result.newPH = Math.round(newPH * 100) / 100;
    
    // Indicators behavior
    if (has("phenolphthalein")) {
      if (result.newPH >= 8.2) result.newColor = "rgba(255, 20, 147, 0.6)"; // Bright Magenta Pink
      else result.newColor = "rgba(240, 248, 255, 0.1)"; // Colorless
    } else if (has("methyl_orange")) {
      if (result.newPH <= 3.5) result.newColor = "rgb(255, 0, 0)"; // Red
      else if (result.newPH >= 4.5) result.newColor = "rgb(255, 215, 0)"; // Yellow
      else result.newColor = "rgb(255, 140, 0)"; // Orange
    } else if (has("universal_indicator")) {
      if (result.newPH <= 2) result.newColor = "rgb(255, 30, 30)"; // Red
      else if (result.newPH <= 5) result.newColor = "rgb(255, 165, 0)"; // Orange
      else if (result.newPH <= 7.5) result.newColor = "rgb(60, 179, 113)"; // Green
      else if (result.newPH <= 11) result.newColor = "rgb(30, 144, 255)"; // Blue
      else result.newColor = "rgb(138, 43, 226)"; // Violet
    }

    if (isAcid && isBase) {
      // Heat of neutralisation: -57.3 kJ per mole of water formed for a
      // strong acid + strong base. Scale by the moles actually neutralised and
      // by the thermal mass of the mixture (4.18 J/g/K, 1 g per ml) instead of
      // stamping on a fixed +6.8 that only appeared above 40 ml.
      const molesNeutralised = Math.min(acidMolesIn, baseMolesIn);
      const massGrams = Math.max(container.currentVolume || 0, 1);
      const weakened = (dominantAcid && !dominantAcid.strong) || (dominantBase && !dominantBase.strong);
      const enthalpy = weakened ? 52000 : 57300; // J/mol; weak species cost ionisation energy
      const deltaT = (molesNeutralised * enthalpy) / (massGrams * 4.18);
      if (deltaT > 0.05) {
        result.deltaTemperature = Math.round(deltaT * 10) / 10;
        result.successExperimentId = 71;
      }
      const state = Math.abs(net) / totalV < 1e-7
        ? "The mixture has reached the equivalence point"
        : net > 0 ? "Alkali is still in excess" : "Acid is still in excess";
      result.message = `${state}. Measured pH ${result.newPH.toFixed(2)}${result.deltaTemperature ? `, temperature rose ${result.deltaTemperature.toFixed(1)} °C` : ""}.`;
    } else {
      // An earlier rule may already have reported the headline observation
      // (effervescence, a precipitate, a colour change). The pH is extra
      // information, so append it rather than overwriting the observation --
      // "Acidic solution, pH 0.40" used to erase "Furious effervescence!".
      const phNote = isAcid
        ? `Acidic solution, pH ${result.newPH.toFixed(2)}.`
        : `Alkaline solution, pH ${result.newPH.toFixed(2)}.`;
      result.message = result.message === NO_CHANGE_MESSAGE ? phNote : `${result.message} ${phNote}`;
    }
  }

  // 9. PERMANGANATE REDOX (Experiment 24)
  if (has("kmno4_sol") && (has("feso4_sol") || has("h2o2_sol") || has("ethanoic_acid"))) {
    // Decolorizes
    let kmAmt = getAmt("kmno4_sol");
    let feAmt = getAmt("feso4_sol");
    if (feAmt >= kmAmt * 2) {
      result.newColor = "rgba(255, 192, 203, 0.2)"; // Rose pale pink / colorless
      result.message = "Intense purple KMnO₄ reduced to permanent pale rose pink by Iron(II) reducing agent!";
      result.successExperimentId = 24;
    } else {
      result.newColor = "rgb(128, 0, 128)"; // Remains purple
    }
  }

  // 10. IODOMETRY & IODINE CLOCK (Experiments 25 & 61)
  if (has("kio3_sol") && has("na2s2o3_sol") && has("starch_sol")) {
    result.newColor = "rgb(10, 10, 40)"; // Pitch deep blue-black
    result.newOpacity = 0.98;
    result.message = "Spectacular Iodine Clock Color Snap! The transparent liquid suddenly flashed to deep pitch blue-black!";
    result.successExperimentId = 61;
    result.soundEffect = "success";
  } else if (has("iodine_sol") && has("starch_sol")) {
    result.newColor = "rgb(0, 0, 60)"; // Intense blue-black
    result.message = "Starch-iodine complex formed with unmistakable intense blue-black hue.";
  }

  // 11. ORGANIC FUNCTIONAL GROUP ASSAYS (Exp 38 Ester, Exp 39 Soap, Exp 41 Bromine, Exp 47 Aspirin)
  if (has("ethanol") && has("ethanoic_acid") && has("h2so4_conc") && container.isHeated) {
    result.message = "Fischer Esterification successful! A delightful fruity sweet aroma of Ethyl Ethanoate fills the room.";
    result.successExperimentId = 38;
    result.soundEffect = "success";
  }
  if (has("vegetable_oil") && has("naoh_dilute") && container.isHeated) {
    result.newPrecipitate = { name: "Sodium Carboxylate Soap", formula: "R-COONa↓", color: "rgb(250, 250, 250)", amount: 10 };
    result.message = "Saponification completed successfully! Authentic white soap curds formed at the top.";
    result.successExperimentId = 39;
    result.soundEffect = "success";
  }
  if (has("cyclohexene") && has("bromine_water")) {
    result.newColor = "rgba(255, 255, 255, 0.1)"; // Colorless
    result.message = "Unsaturated Cyclohexene instantly decolorized the orange Bromine water purely to colorless!";
    result.successExperimentId = 41;
  }
  if (has("salicylic_acid") && (has("ethanoic_acid") || has("h2so4_conc")) && !container.isHeated) {
    result.newPrecipitate = { name: "Aspirin Crystals", formula: "C₉H₈O₄↓", color: "rgb(255, 255, 255)", amount: 8 };
    result.message = "Flawless white crystal needles of pure Aspirin precipitated upon cooling!";
    result.successExperimentId = 47;
    result.soundEffect = "success";
  }
  if (has("tollens_reagent") && (has("glucose_sol") || has("ethanol")) && container.isHeated) {
    container.hasSilverMirror = true;
    result.message = "Tollens' Silver Mirror test positive! A magnificent, dazzling silver metallic mirror deposited on the glass walls!";
    result.soundEffect = "success";
  }
  if ((has("benedicts_sol") || has("fehlings_sol")) && has("glucose_sol") && container.isHeated) {
    result.newPrecipitate = { name: "Copper(I) Oxide", formula: "Cu₂O↓", color: "rgb(178, 34, 34)", amount: 7 };
    result.message = "Brick-red precipitate of Copper(I) Oxide formed (confirms reducing sugar Glucose).";
  }

  // 12. SPECIAL ADDITIONAL BIOCHEMICAL & FLAME & HALIDE ASSAYS
  if (has("licl_sol") && container.isHeated) {
    container.flameColor = "#dc143c"; // Crimson
    result.message = "Lithium ions (Li⁺) emit an intense Crimson Red flame!";
    result.successExperimentId = 1;
  } else if (has("srcl2_sol") && container.isHeated) {
    container.flameColor = "#ff0040"; // Bright Crimson
    result.message = "Strontium ions (Sr²⁺) emit a spectacular Bright Crimson Red flame!";
    result.successExperimentId = 1;
  } else if (has("kcl_sol") && container.isHeated) {
    container.flameColor = "#dda0dd"; // Lilac
    result.message = "Potassium ions (K⁺) emit a delicate Lilac / Pale Violet flame!";
    result.successExperimentId = 1;
  } else if (has("nacl_sol") && container.isHeated && container.type === "watch_glass") {
    container.flameColor = "#ffd700"; // Persistent yellow
    result.message = "Sodium ions (Na⁺) emit a brilliant persistent Yellow flame!";
    result.successExperimentId = 1;
  }

  if (has("ninhydrin_sol") && container.isHeated) {
    result.newColor = "rgb(75, 0, 130)"; // Ruhemann's purple
    result.newOpacity = 0.9;
    result.message = "Ninhydrin assay positive! A majestic deep Purple / Blue hue developed confirming free amino acids.";
    result.successExperimentId = 12;
    result.soundEffect = "success";
  }

  if (has("edta_sol") && has("eriochrome_black_t")) {
    result.newColor = "rgb(0, 191, 255)"; // Pure blue
    result.message = "EDTA fully chelated hard water ions, snapping Eriochrome Black T indicator flawlessly from Wine Red to Sky Blue!";
    result.successExperimentId = 26;
    result.soundEffect = "success";
  }

  // 13. UNIVERSAL DWSIM 115-EXPERIMENT PATTERN MATCHING FALLBACK
  if (!result.successExperimentId && ids.length >= 2) {
    // Only ever auto-validate the experiment the student actually has open.
    // Scanning the whole catalogue used to announce (and spoil the expected
    // result of) an unrelated experiment that happened to share reagents.
    const candidates = activeExperimentId
      ? COMPLETE_SYLLABUS_EXPERIMENTS.filter((exp) => exp.id === activeExperimentId)
      : [];

    for (const exp of candidates) {
      if (exp.requiredChemicalIds.length >= 2) {
        // Are all required chemicals present?
        const allPresent = exp.requiredChemicalIds.every((reqId: string) => has(reqId));
        if (allPresent) {
          result.successExperimentId = exp.id;
          // Never restate expectedResult: that is the answer the student is
          // being marked on. Confirm the setup instead.
          result.message = `All reagents for #${exp.id} (${exp.title}) are now in the vessel. Observe carefully and record what you see.`;
          result.soundEffect = "success";
          break;
        }
      }
    }
  }

  // Calculate generic color blend if no custom color was assigned
  if (!result.newColor && ids.length > 1 && !result.newPrecipitate && !result.newGas) {
    let r = 0, g = 0, b = 0, op = 0, count = 0;
    for (const id of ids) {
      const chem = getChemical(id);
      // parse rgb
      const m = chem.color.match(/(\d+),\s*(\d+),\s*(\d+)/);
      if (m) {
        r += parseInt(m[1], 10);
        g += parseInt(m[2], 10);
        b += parseInt(m[3], 10);
        op += chem.opacity || 0.3;
        count++;
      }
    }
    if (count > 0) {
      result.newColor = `rgba(${Math.round(r/count)}, ${Math.round(g/count)}, ${Math.round(b/count)}, ${(op/count).toFixed(2)})`;
    }
  }

  return result;
}
