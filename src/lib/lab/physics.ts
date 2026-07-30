/**
 * ChemVM — Lab physics & consequence engine (slice 1)
 *
 * Owns everything that happens to a vessel *because of physics* rather than
 * because of chemistry: which flame you chose, how fast it heats, when the
 * contents boil away, when the glass cracks, when a sealed vessel ruptures,
 * and when a flammable reagent in an open flame actually catches fire.
 */

import { getChemical } from "./dwsimChemicals";
import type { ContainerState } from "./dwsimEngine";

/* ------------------------------------------------------------------ flames */

export type FlameId =
  | "bunsen-blue"
  | "bunsen-yellow"
  | "spirit-lamp"
  | "hotplate"
  | "water-bath"
  | "match";

export interface FlameSpec {
  id: FlameId;
  label: string;
  short: string;
  /** highest temperature this heat source can drive a vessel to (°C) */
  maxTemp: number;
  /** °C added per simulation tick (~0.35 s) */
  ramp: number;
  /** inner cone / body colour used by the canvas flame renderer */
  color: string;
  outerColor: string;
  /** yellow safety flames deposit soot */
  sooty: boolean;
  /** an open flame can ignite flammable vapours; a water bath cannot */
  openFlame: boolean;
  note: string;
}

export const FLAMES: FlameSpec[] = [
  {
    id: "bunsen-blue", label: "Bunsen — air hole open", short: "Blue (roaring)",
    maxTemp: 700, ramp: 6, color: "#7fc4ff", outerColor: "rgba(60,120,255,0.55)",
    sooty: false, openFlame: true,
    note: "Roaring blue flame, ~1500 °C at the tip. Standard for strong heating and flame tests.",
  },
  {
    id: "bunsen-yellow", label: "Bunsen — air hole closed", short: "Yellow (safety)",
    maxTemp: 380, ramp: 3, color: "#ffc14d", outerColor: "rgba(255,150,40,0.55)",
    sooty: true, openFlame: true,
    note: "Luminous safety flame. Cooler, and deposits soot on the vessel.",
  },
  {
    id: "spirit-lamp", label: "Spirit lamp", short: "Spirit lamp",
    maxTemp: 300, ramp: 2.2, color: "#ffd9a0", outerColor: "rgba(255,190,110,0.45)",
    sooty: false, openFlame: true,
    note: "Ethanol wick flame. Gentle, portable, used where no gas tap is available.",
  },
  {
    id: "match", label: "Splint / match", short: "Splint",
    maxTemp: 180, ramp: 5, color: "#ffb347", outerColor: "rgba(255,140,60,0.5)",
    sooty: true, openFlame: true,
    note: "Momentary flame — for lighting gases and the glowing/lighted splint tests.",
  },
  {
    id: "hotplate", label: "Hot plate", short: "Hot plate",
    maxTemp: 340, ramp: 2.5, color: "#ff7a45", outerColor: "rgba(255,90,40,0.28)",
    sooty: false, openFlame: false,
    note: "Electrical element. No naked flame, so it is safe with flammable solvents.",
  },
  {
    id: "water-bath", label: "Water bath", short: "Water bath",
    maxTemp: 100, ramp: 1.6, color: "#9fd8ff", outerColor: "rgba(140,210,255,0.3)",
    sooty: false, openFlame: false,
    note: "Cannot exceed 100 °C. Required for warming ethanol and other flammables.",
  },
];

export const flameSpec = (id: FlameId | undefined): FlameSpec =>
  FLAMES.find((f) => f.id === id) ?? FLAMES[0];

/** the heat source an apparatus defaults to when it is placed */
export function defaultFlameFor(apparatusId: string): FlameId {
  if (apparatusId === "hotplate") return "hotplate";
  if (apparatusId === "water-bath") return "water-bath";
  if (/spirit/i.test(apparatusId)) return "spirit-lamp";
  return "bunsen-blue";
}

/** which flames a given heat apparatus is allowed to produce */
export function flamesFor(apparatusId: string): FlameSpec[] {
  if (apparatusId === "hotplate") return FLAMES.filter((f) => f.id === "hotplate");
  if (apparatusId === "water-bath") return FLAMES.filter((f) => f.id === "water-bath");
  return FLAMES.filter((f) => f.openFlame);
}

/* --------------------------------------------------- vessel thermal limits */

export interface VesselLimits {
  /** temperature above which the glass/ceramic fails (°C) */
  thermalLimit: number;
  /** true if the vessel is designed for direct flame */
  flameSafe: boolean;
}

export function vesselLimits(shape: string): VesselLimits {
  switch (shape) {
    case "crucible":
      return { thermalLimit: 1200, flameSafe: true };
    case "evap-dish":
    case "test-tube":
    case "boiling-tube":
      return { thermalLimit: 600, flameSafe: true };
    case "beaker":
    case "flask-conical":
    case "flask-round":
    case "flask-florence":
      return { thermalLimit: 500, flameSafe: true };
    case "cylinder":
    case "flask-volumetric":
    case "burette":
    case "pipette":
      return { thermalLimit: 90, flameSafe: false };
    case "watch-glass":
    case "petri-dish":
      return { thermalLimit: 180, flameSafe: false };
    default:
      return { thermalLimit: 300, flameSafe: false };
  }
}

/* ------------------------------------------------------------ consequences */

export type HazardKind =
  | "evaporating"
  | "boiled-dry"
  | "cracked"
  | "ruptured"
  | "ignited"
  | "overflow"
  | "frozen"
  | "soot";

export interface Hazard {
  kind: HazardKind;
  message: string;
  /** true when the vessel is destroyed and can no longer be used */
  destroys?: boolean;
  /** flame colour for a combustion event */
  burnColor?: string;
}

/** characteristic combustion flame colour, by reagent */
export function combustionColor(substanceId: string): string {
  const id = substanceId.toLowerCase();
  if (/sodium|nacl|na_/.test(id)) return "#ffd23f";     // Na — intense yellow
  if (/copper|cu_/.test(id)) return "#3ddc97";           // Cu — green
  if (/sulfur|sulphur|s8/.test(id)) return "#7ea6ff";    // S — pale blue
  if (/potassium|k_/.test(id)) return "#c58cff";         // K — lilac
  if (/lithium|li_/.test(id)) return "#ff5f6d";          // Li — crimson
  if (/calcium|ca_/.test(id)) return "#ff8b4a";          // Ca — brick red
  if (/magnesium|mg/.test(id)) return "#ffffff";         // Mg — blinding white
  if (/hydrogen|h2/.test(id)) return "#bcd9ff";          // H₂ — near-invisible pale blue
  if (/methane|ethanol|propan|butan|alkane|petrol|hexane/.test(id)) return "#5aa9ff";
  return "#ff9a3d";
}

export interface PhysicsInput {
  state: ContainerState;
  shape: string;
  /** heat source currently under the vessel, if any */
  flame: FlameSpec | null;
  sealed: boolean;
  /** ticks the vessel has already been dry while heated */
  dryTicks: number;
}

export interface PhysicsOutput {
  hazards: Hazard[];
  /** ml of contents lost to evaporation this tick */
  evaporated: number;
  dryTicks: number;
  /** pressure 0..1 for sealed heated vessels */
  pressure: number;
}

/**
 * Advance one tick of physical consequence for a single vessel.
 * Mutates `state.substanceIds` when contents evaporate.
 */
export function stepPhysics(input: PhysicsInput, pressure: number): PhysicsOutput {
  const { state, shape, flame, sealed } = input;
  const hazards: Hazard[] = [];
  const limits = vesselLimits(shape);
  const ids = Object.keys(state.substanceIds).filter((k) => state.substanceIds[k] > 0);
  const volume = ids.reduce((s, k) => s + state.substanceIds[k], 0);
  let evaporated = 0;
  let dryTicks = input.dryTicks;
  let newPressure = pressure;

  /* --- 1. glass that was never meant to see a flame --- */
  if (flame && !limits.flameSafe && state.temperature > limits.thermalLimit) {
    hazards.push({
      kind: "cracked",
      destroys: true,
      message: `The ${shape.replace(/-/g, " ")} is not flame-proof — it cracked at ${state.temperature.toFixed(0)} °C.`,
    });
    return { hazards, evaporated, dryTicks, pressure: 0 };
  }

  /* --- 2. combustion of flammables in an open flame --- */
  if (flame?.openFlame && volume > 0) {
    for (const id of ids) {
      const chem = getChemical(id);
      const ignition = chem.boilingPoint ?? 80;
      if (chem.flammable && state.temperature >= Math.min(ignition, 120)) {
        hazards.push({
          kind: "ignited",
          burnColor: combustionColor(id),
          message: `${chem.name} ignited in the open flame — use a water bath for flammable liquids.`,
        });
        state.substanceIds[id] = Math.max(0, state.substanceIds[id] - 2.5);
        evaporated += 2.5;
        break;
      }
    }
  }

  /* --- 3. boiling → evaporation → boiled dry --- */
  if (volume > 0) {
    let lost = 0;
    for (const id of ids) {
      const chem = getChemical(id);
      const bp = chem.boilingPoint ?? (chem.state === "solid" ? 900 : 100);
      if (state.temperature >= bp) {
        const rate = Math.min(3, 0.4 + (state.temperature - bp) / 40);
        const take = Math.min(state.substanceIds[id], rate);
        state.substanceIds[id] -= take;
        lost += take;
      }
    }
    if (lost > 0) {
      evaporated += lost;
      hazards.push({
        kind: "evaporating",
        message: `Contents are boiling off — ${lost.toFixed(1)} ml lost as vapour.`,
      });
    }
  }

  const volAfter = Object.values(state.substanceIds).reduce((s, v) => s + v, 0);
  state.currentVolume = volAfter;

  if (flame && volAfter <= 0.05 && volume > 0.05) {
    hazards.push({ kind: "boiled-dry", message: "The vessel has boiled dry. Remove it from the heat." });
  }

  /* --- 4. dry vessel left on the flame cracks --- */
  if (flame && volAfter <= 0.05) {
    dryTicks += 1;
    if (dryTicks > 18) {
      hazards.push({
        kind: "cracked",
        destroys: true,
        message: "Heated to dryness for too long — thermal shock shattered the vessel.",
      });
      return { hazards, evaporated, dryTicks: 0, pressure: 0 };
    }
  } else {
    dryTicks = 0;
  }

  /* --- 5. sealed vessel over heat → pressure → rupture --- */
  if (sealed && flame && volAfter > 0) {
    newPressure = Math.min(1.4, newPressure + 0.03 + Math.max(0, (state.temperature - 90) / 900));
    if (newPressure >= 1) {
      hazards.push({
        kind: "ruptured",
        destroys: true,
        message: "Pressure exceeded the vessel's limit — the sealed apparatus exploded. Never heat a closed system.",
      });
      return { hazards, evaporated, dryTicks, pressure: 0 };
    }
  } else {
    newPressure = Math.max(0, newPressure - 0.05);
  }

  /* --- 6. overflow --- */
  if (volAfter > state.maxVolume) {
    hazards.push({
      kind: "overflow",
      message: `Contents overflowed the ${shape.replace(/-/g, " ")} — it only holds ${state.maxVolume} ml.`,
    });
    const scale = state.maxVolume / volAfter;
    for (const id of Object.keys(state.substanceIds)) state.substanceIds[id] *= scale;
    state.currentVolume = state.maxVolume;
  }

  /* --- 7. freezing --- */
  if (volAfter > 0 && state.temperature <= 0) {
    hazards.push({ kind: "frozen", message: "Contents froze solid — ice crystals formed." });
  }

  /* --- 8. soot --- */
  if (flame?.sooty && state.temperature > 120) {
    hazards.push({ kind: "soot", message: "A black soot deposit is forming on the base of the vessel." });
  }

  return { hazards, evaporated, dryTicks, pressure: newPressure };
}

/* ------------------------------------------------------------- measurement */

export function measurementUnit(state: string): "ml" | "g" {
  return state === "solid" ? "g" : "ml";
}

export const MEASURE_PRESETS = [1, 2, 5, 10, 25, 50];
