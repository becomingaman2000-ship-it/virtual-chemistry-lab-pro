/**
 * ChemVM — Qualitative test & separation engine.
 *
 * Slice 2 of the lab overhaul: everything the DWSIM reaction solver does not
 * cover but the syllabus experiments demand —
 *   • indicator papers and solutions (litmus, universal indicator, phenolphthalein,
 *     methyl orange) driven from the true pH of the vessel,
 *   • flame tests for the common cations,
 *   • gas tests (limewater, glowing/lighted splint, damp litmus, lead ethanoate),
 *   • physical separation of mixtures (magnet, filtration, decanting, evaporation,
 *     crystallisation, sublimation, distillation, chromatography, separating funnel).
 *
 * Every function is pure: it reports what SHOULD be observed and which substances
 * leave the vessel, so the bench can apply the change and the marker can score it.
 */

import type { ContainerState } from "./dwsimEngine";
import { getChemical } from "./dwsimChemicals";

export interface TestOutcome {
  ok: boolean;
  /** short colour swatch for the UI (CSS colour) */
  color?: string;
  /** the observation a student would write down */
  observation: string;
  /** teaching note / reason when the test cannot be performed */
  note?: string;
  /** substance ids removed from the vessel by the operation */
  removed?: string[];
  /** substance ids (with amounts) added to the vessel by the operation */
  added?: Record<string, number>;
  /** new pH forced onto the vessel */
  newPH?: number;
}

/* ============================================================
   1. Indicators
============================================================ */

export interface IndicatorSpec {
  id: string;
  label: string;
  kind: "paper" | "solution";
  /** neutral / stock colour shown in the picker */
  stock: string;
  read: (pH: number) => { color: string; text: string };
}

const uiColor = (pH: number): { color: string; text: string } => {
  if (pH < 1.5) return { color: "#d21f1f", text: "deep red (pH 0–1, strongly acidic)" };
  if (pH < 3.5) return { color: "#f04a1e", text: "red-orange (pH 2–3, strongly acidic)" };
  if (pH < 5.5) return { color: "#f5a623", text: "orange (pH 4–5, weakly acidic)" };
  if (pH < 6.5) return { color: "#f2e13c", text: "yellow (pH 6, very weakly acidic)" };
  if (pH <= 7.5) return { color: "#4caf50", text: "green (pH 7, neutral)" };
  if (pH < 9.5) return { color: "#1e88a8", text: "blue-green (pH 8–9, weakly alkaline)" };
  if (pH < 11.5) return { color: "#2b45c4", text: "blue (pH 10–11, alkaline)" };
  return { color: "#5b2ca8", text: "purple (pH 12–14, strongly alkaline)" };
};

export const INDICATORS: IndicatorSpec[] = [
  {
    id: "litmus_blue", label: "Blue litmus paper", kind: "paper", stock: "#2b45c4",
    read: (pH) => pH < 6.5
      ? { color: "#d21f1f", text: "blue litmus turns RED — the solution is acidic" }
      : { color: "#2b45c4", text: "blue litmus stays blue — the solution is not acidic" },
  },
  {
    id: "litmus_red", label: "Red litmus paper", kind: "paper", stock: "#d21f1f",
    read: (pH) => pH > 7.5
      ? { color: "#2b45c4", text: "red litmus turns BLUE — the solution is alkaline" }
      : { color: "#d21f1f", text: "red litmus stays red — the solution is not alkaline" },
  },
  {
    id: "universal_indicator", label: "Universal indicator", kind: "solution", stock: "#4caf50",
    read: (pH) => {
      const u = uiColor(pH);
      return { color: u.color, text: `universal indicator turns ${u.text}` };
    },
  },
  {
    id: "ui_paper", label: "Universal indicator paper", kind: "paper", stock: "#f2e13c",
    read: (pH) => {
      const u = uiColor(pH);
      return { color: u.color, text: `the pH paper matches ${u.text} on the chart` };
    },
  },
  {
    id: "phenolphthalein", label: "Phenolphthalein", kind: "solution", stock: "rgba(255,255,255,0.35)",
    read: (pH) => pH >= 8.3
      ? { color: "#e8508d", text: "phenolphthalein turns PINK — alkaline (endpoint reached)" }
      : { color: "rgba(255,255,255,0.35)", text: "phenolphthalein stays colourless — acidic or neutral" },
  },
  {
    id: "methyl_orange", label: "Methyl orange", kind: "solution", stock: "#f5a623",
    read: (pH) => pH < 3.1
      ? { color: "#e04a1e", text: "methyl orange turns RED — pH below 3.1" }
      : pH > 4.4
        ? { color: "#f2c94c", text: "methyl orange turns YELLOW — pH above 4.4" }
        : { color: "#f5a623", text: "methyl orange is ORANGE — in the 3.1–4.4 transition range" },
  },
];

export function runIndicator(state: ContainerState, indicatorId: string): TestOutcome {
  const ind = INDICATORS.find((i) => i.id === indicatorId);
  if (!ind) return { ok: false, observation: "Unknown indicator." };
  const volume = Object.values(state.substanceIds).reduce((s, v) => s + v, 0);
  if (volume <= 0) {
    return { ok: false, observation: "Nothing to test.", note: "The vessel is empty — add a solution before testing it." };
  }
  const anyLiquid = Object.keys(state.substanceIds).some((id) => {
    const c = getChemical(id);
    return c.state === "liquid" || c.state === "solution";
  });
  if (!anyLiquid) {
    return {
      ok: false,
      observation: "No colour change.",
      note: "Indicators only work on solutions — dry solids must be dissolved in distilled water first.",
    };
  }
  const r = ind.read(state.pH);
  return {
    ok: true,
    color: r.color,
    observation: `${ind.label}: ${r.text} (pH ${state.pH.toFixed(1)}).`,
    added: ind.kind === "solution" ? { [indicatorId === "ui_paper" ? "universal_indicator" : indicatorId]: 1 } : undefined,
  };
}

/* ============================================================
   2. Flame tests
============================================================ */

interface FlameCation { match: string[]; ion: string; color: string; name: string }

const FLAME_CATIONS: FlameCation[] = [
  { match: ["licl_sol"], ion: "Li⁺", color: "#d81b2a", name: "crimson red" },
  { match: ["nacl_sol", "nacl_solid", "naoh_dilute", "na2co3_sol", "na2so3_sol", "na2s2o3_sol"], ion: "Na⁺", color: "#ffb400", name: "persistent golden-yellow" },
  { match: ["kcl_sol", "ki_solid", "kio3_sol", "kmno4_sol", "k2cr2o7_sol", "k2cro4_sol"], ion: "K⁺", color: "#b06be0", name: "lilac (view through cobalt-blue glass)" },
  { match: ["cacl2_sol"], ion: "Ca²⁺", color: "#ff4500", name: "brick-red" },
  { match: ["srcl2_sol"], ion: "Sr²⁺", color: "#e02020", name: "scarlet-crimson" },
  { match: ["bacl2_sol"], ion: "Ba²⁺", color: "#9acd32", name: "apple-green" },
  { match: ["cuso4_sol", "cu_solid"], ion: "Cu²⁺", color: "#00ced1", name: "blue-green" },
];

export function runFlameTest(state: ContainerState, isHeated: boolean): TestOutcome {
  const ids = Object.keys(state.substanceIds).filter((id) => (state.substanceIds[id] || 0) > 0);
  if (!ids.length) {
    return { ok: false, observation: "Nothing on the wire.", note: "Dip the clean nichrome wire in the sample first." };
  }
  if (!isHeated) {
    return {
      ok: false,
      observation: "No flame colour.",
      note: "A flame test needs a hot, roaring blue Bunsen flame — ignite the burner beneath the sample.",
    };
  }
  const hit = FLAME_CATIONS.find((c) => c.match.some((m) => ids.includes(m)));
  if (!hit) {
    return {
      ok: true,
      color: "#7aa7ff",
      observation: "No characteristic colour — the sample contains no Group 1/2 or copper cation.",
    };
  }
  return {
    ok: true,
    color: hit.color,
    observation: `Flame test: ${hit.name} flame → ${hit.ion} present.`,
  };
}

/* ============================================================
   3. Gas tests
============================================================ */

export interface GasTestSpec { id: string; label: string; hint: string }

export const GAS_TESTS: GasTestSpec[] = [
  { id: "limewater", label: "Bubble through limewater", hint: "Test for carbon dioxide" },
  { id: "glowing_splint", label: "Glowing splint", hint: "Test for oxygen" },
  { id: "lighted_splint", label: "Lighted splint", hint: "Test for hydrogen" },
  { id: "damp_red_litmus", label: "Damp red litmus at the mouth", hint: "Test for ammonia" },
  { id: "damp_blue_litmus", label: "Damp blue litmus at the mouth", hint: "Test for chlorine / acidic gases" },
  { id: "dichromate_paper", label: "Acidified dichromate paper", hint: "Test for sulfur dioxide" },
];

export function runGasTest(state: ContainerState, testId: string): TestOutcome {
  const gas = state.bubblingGas?.formula?.toUpperCase() ?? "";
  const named = state.bubblingGas?.name ?? "no gas";
  const nothing = (msg: string): TestOutcome => ({ ok: false, observation: msg, note: "No gas is being evolved — start the reaction first." });
  const is = (f: string) => gas.includes(f);

  switch (testId) {
    case "limewater":
      if (!gas) return nothing("Limewater stays clear.");
      return is("CO2")
        ? { ok: true, color: "#f2f2f2", observation: "Limewater turns milky (white CaCO₃ precipitate) → the gas is carbon dioxide." }
        : { ok: true, color: "#e8f4ff", observation: `Limewater stays clear — the gas is not CO₂ (it is ${named}).` };
    case "glowing_splint":
      if (!gas) return nothing("The glowing splint simply goes out.");
      return is("O2")
        ? { ok: true, color: "#ffcf6b", observation: "The glowing splint relights → the gas is oxygen." }
        : { ok: true, color: "#9aa4b2", observation: `The glowing splint is extinguished — the gas is not oxygen (it is ${named}).` };
    case "lighted_splint":
      if (!gas) return nothing("The lighted splint keeps burning quietly.");
      return is("H2")
        ? { ok: true, color: "#ff7a45", observation: "A squeaky pop is heard → the gas is hydrogen." }
        : { ok: true, color: "#9aa4b2", observation: `No squeaky pop — the gas is not hydrogen (it is ${named}).` };
    case "damp_red_litmus":
      if (!gas) return nothing("The damp red litmus is unchanged.");
      return is("NH3")
        ? { ok: true, color: "#2b45c4", observation: "Damp red litmus turns blue → the gas is ammonia." }
        : { ok: true, color: "#d21f1f", observation: `Damp red litmus stays red — the gas is not ammonia (it is ${named}).` };
    case "damp_blue_litmus":
      if (!gas) return nothing("The damp blue litmus is unchanged.");
      if (is("CL2")) return { ok: true, color: "#ffffff", observation: "Damp blue litmus turns red then is bleached white → the gas is chlorine." };
      return { ok: true, color: "#d21f1f", observation: `Damp blue litmus turns red — ${named} is an acidic gas.` };
    case "dichromate_paper":
      if (!gas) return nothing("The orange paper is unchanged.");
      return is("SO2")
        ? { ok: true, color: "#2e7d32", observation: "Acidified dichromate paper turns orange → green → the gas is sulfur dioxide." }
        : { ok: true, color: "#f5a623", observation: `The dichromate paper stays orange — the gas is not SO₂ (it is ${named}).` };
    default:
      return { ok: false, observation: "Unknown gas test." };
  }
}

/* ============================================================
   4. Separation of mixtures
============================================================ */

export interface SeparationSpec {
  id: string;
  label: string;
  hint: string;
  /** apparatus that should be on the bench for the technique to be credited */
  needs?: string[];
}

export const SEPARATIONS: SeparationSpec[] = [
  { id: "magnet", label: "Magnetic separation", hint: "Pull iron filings out of a mixture", needs: [] },
  { id: "filtration", label: "Filtration", hint: "Remove an insoluble solid", needs: ["filter-funnel", "filter-paper"] },
  { id: "decant", label: "Decanting", hint: "Pour off the liquid from a settled solid" },
  { id: "evaporation", label: "Evaporation", hint: "Drive off the solvent to leave the solute", needs: ["evap-dish"] },
  { id: "crystallisation", label: "Crystallisation", hint: "Cool a saturated solution to grow crystals" },
  { id: "sublimation", label: "Sublimation", hint: "Heat a subliming solid and collect the deposit" },
  { id: "distillation", label: "Simple distillation", hint: "Separate liquids by boiling point", needs: ["condenser"] },
  { id: "chromatography", label: "Paper chromatography", hint: "Separate coloured dyes", needs: ["filter-paper"] },
  { id: "sep_funnel", label: "Separating funnel", hint: "Split two immiscible liquids", needs: ["sep-funnel"] },
];

const MAGNETIC = ["iron_filings", "fe_solid"];
const INSOLUBLE = ["sand_solid", "caco3_solid", "sulfur_solid", "mno2_solid", "cu_solid", "zn_solid", "mg_solid", "fe_solid", "iron_filings"];
const SUBLIMES = ["iodine_solid", "nh4cl_solid"];
const SOLVENTS = ["water_distilled", "ethanol", "methanol", "hexane", "propanol", "butanol"];
const IMMISCIBLE = ["hexane", "vegetable_oil", "cyclohexene"];

const names = (ids: string[]) => ids.map((i) => getChemical(i).name).join(" and ");

/**
 * Decide what a separation technique does to a vessel.
 * `available` is the set of apparatus ids currently on the bench.
 */
export function runSeparation(
  state: ContainerState,
  methodId: string,
  available: string[],
  isHeated: boolean,
): TestOutcome {
  const spec = SEPARATIONS.find((s) => s.id === methodId);
  if (!spec) return { ok: false, observation: "Unknown technique." };
  const ids = Object.keys(state.substanceIds).filter((id) => (state.substanceIds[id] || 0) > 0);
  if (!ids.length) {
    return { ok: false, observation: "Nothing to separate.", note: "The vessel is empty." };
  }
  const missing = (spec.needs ?? []).filter((n) => !available.includes(n));
  if (missing.length) {
    return {
      ok: false,
      observation: "Technique not set up.",
      note: `Place the required apparatus first: ${missing.join(", ")}.`,
    };
  }

  const solids = ids.filter((id) => getChemical(id).state === "solid");
  const liquids = ids.filter((id) => getChemical(id).state !== "solid");

  switch (methodId) {
    case "magnet": {
      const mag = ids.filter((id) => MAGNETIC.includes(id));
      if (!mag.length) {
        return { ok: false, observation: "The magnet attracts nothing.", note: "Only iron (and other ferromagnetic solids) can be removed with a magnet." };
      }
      if (isHeated || state.substanceIds["fes_solid"]) {
        return {
          ok: false,
          observation: "The magnet attracts nothing.",
          note: "Once iron and sulfur are heated they react to form iron(II) sulfide — a compound whose properties differ from the elements, so the mixture can no longer be separated physically.",
        };
      }
      return {
        ok: true, color: "#5a5c60", removed: mag,
        observation: `Magnetic separation: the grey ${names(mag)} is drawn onto the magnet, leaving the non-magnetic ${names(ids.filter((i) => !mag.includes(i))) || "residue"} behind. A physical change.`,
      };
    }
    case "filtration": {
      const insol = solids.filter((id) => INSOLUBLE.includes(id));
      if (!insol.length) {
        return { ok: false, observation: "Everything passes through the filter paper.", note: "Filtration only removes an insoluble solid — dissolved solutes pass straight through." };
      }
      if (!liquids.length) {
        return { ok: false, observation: "Nothing runs through.", note: "Add water (or another solvent) so the mixture can be filtered." };
      }
      return {
        ok: true, color: "#d6bd8d", removed: insol,
        observation: `Filtration: ${names(insol)} is retained as the residue on the filter paper; the clear filtrate collects below.`,
      };
    }
    case "decant": {
      const insol = solids.filter((id) => INSOLUBLE.includes(id));
      if (!insol.length || !liquids.length) {
        return { ok: false, observation: "Nothing settles out.", note: "Decanting needs a dense insoluble solid settled under a liquid." };
      }
      return {
        ok: true, removed: insol,
        observation: `Decanting: the sediment (${names(insol)}) is left behind as the liquid is poured off. Quicker than filtering but less complete.`,
      };
    }
    case "evaporation": {
      const solv = ids.filter((id) => SOLVENTS.includes(id));
      if (!solv.length) {
        return { ok: false, observation: "There is no solvent to evaporate." };
      }
      if (!isHeated) {
        return { ok: false, observation: "Nothing evaporates.", note: "Heat the evaporating dish gently — evaporation needs energy." };
      }
      const left = ids.filter((id) => !solv.includes(id));
      return {
        ok: true, removed: solv,
        observation: left.length
          ? `Evaporation: the ${names(solv)} boils away and ${names(left)} is left as a dry solid in the dish.`
          : "Evaporation: the solvent boils away and the dish is left dry.",
      };
    }
    case "crystallisation": {
      const solv = ids.filter((id) => SOLVENTS.includes(id));
      const solutes = ids.filter((id) => !SOLVENTS.includes(id));
      if (!solutes.length) return { ok: false, observation: "There is no dissolved solute to crystallise." };
      if (state.temperature > 60) {
        return { ok: false, observation: "The solution is still too hot.", note: "Cool the saturated solution slowly — crystals only grow below about 60 °C." };
      }
      return {
        ok: true, color: "#bfe3ff",
        removed: solv.length ? [solv[0]] : [],
        observation: `Crystallisation: as the saturated solution cools, well-formed crystals of ${names(solutes)} grow and are filtered off and dried between filter papers.`,
      };
    }
    case "sublimation": {
      const sub = ids.filter((id) => SUBLIMES.includes(id));
      if (!sub.length) return { ok: false, observation: "Nothing sublimes.", note: "Only solids such as iodine or ammonium chloride sublime on gentle heating." };
      if (!isHeated) return { ok: false, observation: "Nothing happens.", note: "Warm the tube gently to make the solid sublime." };
      const violet = sub.includes("iodine_solid");
      return {
        ok: true, color: violet ? "#7b3fa0" : "#f2f2f2", removed: sub,
        observation: violet
          ? "Sublimation: iodine turns straight from solid to a dense purple vapour and re-forms as shiny grey-violet crystals on the cool upper wall of the tube."
          : "Sublimation: ammonium chloride vaporises and re-deposits as a white solid ring higher up the cool tube.",
      };
    }
    case "distillation": {
      if (liquids.length < 2) {
        return { ok: false, observation: "Nothing separates.", note: "Distillation separates a solvent from a solution, or two liquids of different boiling points." };
      }
      if (!isHeated) return { ok: false, observation: "No distillate collects.", note: "Heat the flask so the more volatile liquid boils." };
      const bps = liquids
        .map((id) => ({ id, bp: getChemical(id).boilingPoint ?? 100 }))
        .sort((a, b) => a.bp - b.bp);
      const first = bps[0];
      return {
        ok: true, removed: [first.id],
        observation: `Distillation: ${getChemical(first.id).name} boils first at about ${first.bp} °C, its vapour condenses in the Liebig condenser and the pure distillate collects in the receiver. The thermometer plateaus at that temperature.`,
      };
    }
    case "chromatography": {
      const dyes = ids.filter((id) => id === "ink_sol" || getChemical(id).name.toLowerCase().includes("dye"));
      if (!dyes.length) return { ok: false, observation: "The paper stays blank.", note: "Spot a coloured dye mixture (such as ink) on the baseline first." };
      return {
        ok: true, color: "#3a6ea5",
        observation: "Chromatography: the solvent rises up the paper and the ink separates into distinct coloured spots; each spot's Rf = distance moved by spot ÷ distance moved by solvent front.",
      };
    }
    case "sep_funnel": {
      const org = ids.filter((id) => IMMISCIBLE.includes(id));
      const aq = ids.filter((id) => !IMMISCIBLE.includes(id) && getChemical(id).state !== "solid");
      if (!org.length || !aq.length) {
        return { ok: false, observation: "Only one layer forms.", note: "A separating funnel needs two immiscible liquids, e.g. oil (or hexane) and water." };
      }
      return {
        ok: true, removed: aq,
        observation: `Separating funnel: two layers form — the denser aqueous layer (${names(aq)}) is run off through the tap first, leaving the ${names(org)} layer behind.`,
      };
    }
    default:
      return { ok: false, observation: "Unknown technique." };
  }
}