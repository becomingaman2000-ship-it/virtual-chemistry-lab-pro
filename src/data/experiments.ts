/**
 * ChemVM — Experiment Library
 * Each experiment defines: what apparatus + chemicals are required, a step-by-step
 * procedure, safety notes, expected observations, and an objective marking rubric
 * (weighted checkpoints matched against the student's action log in Test mode).
 *
 * Marking is deliberately criterion-based, not subjective: every mark is tied to a
 * specific verifiable action (add reagent X to Y, heat item Z, record observation,
 * etc.). When a syllabus is added later, syllabusMarks can be re-weighted per exam
 * board without touching the underlying logic.
 */

export type ActionKind =
  | "place"      // place apparatus on bench
  | "add"        // add chemical to apparatus
  | "heat"       // start heating an apparatus (Bunsen / hotplate)
  | "cool"       // remove from heat / cool
  | "stir"       // stir contents
  | "pour"       // pour contents of A into B
  | "filter"     // filter mixture through funnel
  | "measure"    // record a measurement (temp / pH / volume)
  | "observe"    // record an observation
  | "safety";    // don PPE

export interface StepAction {
  kind: ActionKind;
  apparatus?: string;   // apparatus id
  chemical?: string;    // chemical id
  target?: string;      // apparatus id (for pour)
  value?: string | number;
  /** if true this action can happen in any order relative to other "any" steps */
  any?: boolean;
  /** marks awarded when this action is completed correctly */
  marks: number;
  /** feedback shown in the report if the student missed this step */
  hint: string;
}

export interface Experiment {
  id: string;
  title: string;
  category: "Acids & Bases" | "Redox" | "Qualitative Analysis" | "Preparation" | "Physical" | "Organic";
  level: "O-Level" | "A-Level" | "Both";
  duration: string;
  aim: string;
  theory: string;
  requiredApparatus: string[];
  requiredChemicals: string[];
  safety: string[];
  procedure: string[];        // human-readable instructions (Manual mode)
  observations: string[];     // expected observations
  marking: StepAction[];      // objective marking scheme
  totalMarks: number;
}

const exp = (e: Omit<Experiment, "totalMarks">): Experiment => ({
  ...e,
  totalMarks: e.marking.reduce((s, m) => s + m.marks, 0),
});

export const EXPERIMENTS: Experiment[] = [
  exp({
    id: "acid-base-titration",
    title: "Acid–Base Titration (HCl vs NaOH)",
    category: "Acids & Bases",
    level: "Both",
    duration: "30 min",
    aim: "Determine the concentration of hydrochloric acid by titrating against a standard sodium hydroxide solution using phenolphthalein indicator.",
    theory: "HCl + NaOH → NaCl + H₂O. At the endpoint moles of acid equal moles of base. Concentration is calculated from titre volume × standard concentration ÷ pipetted volume.",
    requiredApparatus: ["burette", "burette-clamp", "retort-stand", "flask-conical", "pipette-vol", "filter-funnel", "beaker", "goggles"],
    requiredChemicals: ["hcl", "naoh", "phenolphthalein"],
    safety: [
      "Wear safety goggles and lab coat throughout.",
      "HCl and NaOH are corrosive — rinse spills with plenty of water.",
      "Clamp the burette vertically; read the meniscus at eye level.",
    ],
    procedure: [
      "Put on goggles and lab coat.",
      "Clamp the burette to the retort stand using the burette clamp.",
      "Rinse the burette with NaOH, then fill to the 0.00 mL mark using the filter funnel.",
      "Pipette 25.0 mL of HCl into a clean conical flask.",
      "Add 2–3 drops of phenolphthalein — solution stays colourless.",
      "Titrate NaOH into the flask, swirling constantly, until a permanent pale pink endpoint.",
      "Record the titre volume. Repeat until two concordant titres within 0.10 mL.",
    ],
    observations: [
      "Colourless → pale pink at the endpoint.",
      "Typical titre: 24.8 – 25.2 mL depending on concentrations.",
    ],
    marking: [
      { kind: "safety", marks: 1, hint: "Always don goggles before starting.", any: true },
      { kind: "place", apparatus: "retort-stand", marks: 1, hint: "Set up the retort stand first." },
      { kind: "place", apparatus: "burette", marks: 1, hint: "Clamp the burette to the stand." },
      { kind: "place", apparatus: "flask-conical", marks: 1, hint: "Place the conical flask under the burette." },
      { kind: "add", apparatus: "burette", chemical: "naoh", marks: 2, hint: "Fill the burette with NaOH — the titrant." },
      { kind: "add", apparatus: "flask-conical", chemical: "hcl", marks: 2, hint: "Pipette HCl into the conical flask." },
      { kind: "add", apparatus: "flask-conical", chemical: "phenolphthalein", marks: 2, hint: "Add 2–3 drops of phenolphthalein indicator." },
      { kind: "pour", apparatus: "burette", target: "flask-conical", marks: 3, hint: "Titrate NaOH from the burette into the flask." },
      { kind: "observe", value: "pink", marks: 2, hint: "Record the colour change to pale pink at the endpoint." },
      { kind: "measure", value: "titre", marks: 3, hint: "Record the titre volume from the burette." },
    ],
  }),
  exp({
    id: "cuso4-crystals",
    title: "Preparation of Copper(II) Sulfate Crystals",
    category: "Preparation",
    level: "O-Level",
    duration: "45 min",
    aim: "Prepare pure hydrated copper(II) sulfate crystals from copper(II) oxide and dilute sulfuric acid.",
    theory: "CuO + H₂SO₄ → CuSO₄ + H₂O. Excess insoluble base ensures all acid reacts; unreacted CuO is filtered off, then the filtrate is evaporated and crystallised.",
    requiredApparatus: ["beaker", "spatula", "stirring-rod", "filter-funnel", "filter-paper", "evap-dish", "tripod", "gauze", "bunsen", "goggles"],
    requiredChemicals: ["h2so4", "cuo"],
    safety: [
      "Dilute H₂SO₄ is corrosive — wear goggles.",
      "Do not heat the evaporating dish to dryness; remove from heat when crystals start to form.",
    ],
    procedure: [
      "Put on goggles.",
      "Measure ~25 mL of dilute H₂SO₄ into a beaker.",
      "Warm gently on the tripod + gauze using the Bunsen burner.",
      "Add CuO a spatula-full at a time, stirring, until no more dissolves (excess).",
      "Filter the hot mixture through filter paper in a funnel into an evaporating dish.",
      "Heat the filtrate gently until the solution is saturated (crystals form on a cool rod).",
      "Leave to cool and crystallise. Filter and dry the crystals.",
    ],
    observations: [
      "Colourless acid turns blue as CuSO₄ forms.",
      "Blue triclinic crystals of CuSO₄·5H₂O on cooling.",
    ],
    marking: [
      { kind: "safety", marks: 1, hint: "Wear goggles.", any: true },
      { kind: "place", apparatus: "beaker", marks: 1, hint: "Start with a clean beaker." },
      { kind: "add", apparatus: "beaker", chemical: "h2so4", marks: 2, hint: "Add dilute sulfuric acid to the beaker." },
      { kind: "place", apparatus: "bunsen", marks: 1, hint: "Set up the Bunsen burner with tripod and gauze." },
      { kind: "heat", apparatus: "beaker", marks: 2, hint: "Warm the acid gently before adding the oxide." },
      { kind: "add", apparatus: "beaker", chemical: "cuo", marks: 3, hint: "Add copper(II) oxide in excess, stirring." },
      { kind: "stir", apparatus: "beaker", marks: 1, hint: "Stir continuously while adding CuO." },
      { kind: "filter", apparatus: "filter-funnel", marks: 2, hint: "Filter to remove unreacted CuO." },
      { kind: "pour", apparatus: "beaker", target: "evap-dish", marks: 1, hint: "Transfer the filtrate to an evaporating dish." },
      { kind: "heat", apparatus: "evap-dish", marks: 2, hint: "Evaporate the filtrate until saturated." },
      { kind: "observe", value: "blue-crystals", marks: 2, hint: "Record the formation of blue crystals." },
    ],
  }),
  exp({
    id: "flame-tests",
    title: "Flame Tests for Group 1 & 2 Cations",
    category: "Qualitative Analysis",
    level: "Both",
    duration: "20 min",
    aim: "Identify metal cations by the characteristic colour they impart to a Bunsen flame.",
    theory: "Electrons excited by heat drop back releasing photons of characteristic wavelength. Na → yellow, K → lilac, Li → crimson, Ca → brick-red, Cu → blue-green.",
    requiredApparatus: ["bunsen", "watch-glass", "forceps", "goggles"],
    requiredChemicals: ["nacl", "ki", "ca", "cu"],
    safety: [
      "Use a hot (blue) Bunsen flame.",
      "Never look directly through the flame for extended periods.",
    ],
    procedure: [
      "Wear goggles. Light the Bunsen and open the air hole for a roaring blue flame.",
      "Dip a clean nichrome wire in concentrated HCl, then in the salt.",
      "Hold the wire in the edge of the blue flame and record the colour.",
      "Repeat for each cation, cleaning the wire between tests.",
    ],
    observations: [
      "Na⁺: persistent yellow.  K⁺: lilac (view through cobalt-blue glass).",
      "Ca²⁺: brick-red.  Cu²⁺: blue-green.",
    ],
    marking: [
      { kind: "safety", marks: 1, hint: "Goggles on.", any: true },
      { kind: "place", apparatus: "bunsen", marks: 1, hint: "Set up the Bunsen burner." },
      { kind: "heat", apparatus: "watch-glass", marks: 1, hint: "Present the sample to the flame." },
      { kind: "add", apparatus: "watch-glass", chemical: "nacl", marks: 2, hint: "Test sodium chloride and record yellow." },
      { kind: "add", apparatus: "watch-glass", chemical: "ki", marks: 2, hint: "Test potassium iodide and record lilac." },
      { kind: "add", apparatus: "watch-glass", chemical: "cu", marks: 2, hint: "Test copper and record blue-green." },
      { kind: "observe", value: "flame-colour", marks: 2, hint: "Record the colour of each flame." },
    ],
  }),
  exp({
    id: "electrolysis-cuso4",
    title: "Electrolysis of Copper(II) Sulfate with Copper Electrodes",
    category: "Redox",
    level: "A-Level",
    duration: "40 min",
    aim: "Observe the transfer of copper from anode to cathode and verify electrode mass change.",
    theory: "At the cathode: Cu²⁺ + 2e⁻ → Cu. At the anode: Cu → Cu²⁺ + 2e⁻. Solution concentration stays constant; anode loses mass, cathode gains mass.",
    requiredApparatus: ["beaker", "balance", "stopwatch", "goggles"],
    requiredChemicals: ["cuso4", "cu"],
    safety: [
      "Keep the power supply low voltage (<6 V).",
      "Rinse electrodes with distilled water and dry gently before weighing.",
    ],
    procedure: [
      "Weigh both copper electrodes and record initial masses.",
      "Pour CuSO₄ solution into the beaker.",
      "Connect the electrodes to the power supply and immerse in the solution.",
      "Run for a measured time at constant current (e.g. 0.5 A for 10 min).",
      "Remove, rinse, dry, and reweigh both electrodes.",
    ],
    observations: [
      "Cathode gains a pink copper deposit.",
      "Anode loses copper; solution stays blue.",
    ],
    marking: [
      { kind: "safety", marks: 1, hint: "Goggles on.", any: true },
      { kind: "place", apparatus: "beaker", marks: 1, hint: "Place the electrolysis cell (beaker)." },
      { kind: "measure", apparatus: "balance", value: "initial-mass", marks: 2, hint: "Weigh the electrodes before electrolysis." },
      { kind: "add", apparatus: "beaker", chemical: "cuso4", marks: 2, hint: "Fill the cell with copper(II) sulfate." },
      { kind: "add", apparatus: "beaker", chemical: "cu", marks: 2, hint: "Immerse the copper electrodes." },
      { kind: "measure", apparatus: "stopwatch", value: "time", marks: 2, hint: "Time the electrolysis accurately." },
      { kind: "measure", apparatus: "balance", value: "final-mass", marks: 2, hint: "Reweigh the dried electrodes." },
      { kind: "observe", value: "pink-deposit", marks: 2, hint: "Record the pink copper deposit at the cathode." },
    ],
  }),
  exp({
    id: "ethanol-distillation",
    title: "Simple Distillation of Ethanol / Water Mixture",
    category: "Organic",
    level: "A-Level",
    duration: "50 min",
    aim: "Separate ethanol (b.p. 78 °C) from water by simple distillation.",
    theory: "Ethanol boils first; its vapour is condensed and collected. A thermometer at the still-head records the boiling point of the distillate.",
    requiredApparatus: ["flask-round", "condenser", "thermometer", "bunsen", "tripod", "gauze", "beaker", "retort-stand", "clamp", "goggles"],
    requiredChemicals: ["ethanol"],
    safety: [
      "Ethanol is highly flammable — do not heat with a naked flame if possible; use a water bath.",
      "Ensure the condenser has cold water flowing before heating begins.",
    ],
    procedure: [
      "Clamp the round-bottom flask to the retort stand.",
      "Add the ethanol/water mixture and a few anti-bumping granules.",
      "Fit the still-head with thermometer and connect the Liebig condenser.",
      "Turn on cooling water; then start heating gently.",
      "Collect the distillate in a clean beaker while the thermometer holds ~78 °C.",
      "Stop heating before the flask boils dry.",
    ],
    observations: [
      "Clear distillate collects; thermometer plateaus around 78 °C.",
      "Residue in the flask is mostly water.",
    ],
    marking: [
      { kind: "safety", marks: 1, hint: "Goggles + no naked flame near ethanol.", any: true },
      { kind: "place", apparatus: "flask-round", marks: 1, hint: "Set up the distillation flask." },
      { kind: "place", apparatus: "condenser", marks: 2, hint: "Attach a Liebig condenser." },
      { kind: "place", apparatus: "thermometer", marks: 1, hint: "Fit the thermometer at the still-head." },
      { kind: "add", apparatus: "flask-round", chemical: "ethanol", marks: 2, hint: "Add the ethanol/water mixture." },
      { kind: "heat", apparatus: "flask-round", marks: 2, hint: "Heat the flask gently." },
      { kind: "measure", apparatus: "thermometer", value: 78, marks: 3, hint: "Record the boiling point around 78 °C." },
      { kind: "observe", value: "distillate", marks: 2, hint: "Collect a clear distillate in the receiver." },
    ],
  }),
];

export const EXPERIMENT_CATEGORIES = Array.from(new Set(EXPERIMENTS.map((e) => e.category)));
