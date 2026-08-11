/**
 * Turns the catalogue's terse step list into a full, exam-style practical
 * procedure: risk assessment, apparatus set-up, an expanded method where every
 * instruction carries the technique detail a student actually needs, the
 * readings to record, and the analysis / clean-up expected by the boards.
 *
 * Everything is derived from the experiment record itself, so all 115
 * experiments gain the same depth without hand-editing the catalogue.
 */

import type { SyllabusExperiment } from "./experimentsCatalog";
import { CHEMICAL_DATABASE } from "./dwsimChemicals";
import { resolveApparatus } from "./apparatusResolver";
import { metaFor, PDF_CATEGORY_LABELS, type PdfCategory } from "./experimentMeta";

export interface MethodStep {
  text: string;
  /** technique note — the "how" behind the instruction */
  detail?: string;
}

export interface DetailedProcedure {
  safety: string[];
  setup: string[];
  method: MethodStep[];
  recording: string[];
  analysis: string[];
  cleanup: string[];
}

/** Technique notes attached when a step mentions a given technique. */
const TECHNIQUE: [RegExp, string][] = [
  [/flame test|wire loop|nichrome/i,
    "Clean the loop in concentrated HCl and hold it in the roaring flame until it gives no colour, then re-dip. View a potassium result through cobalt-blue glass to filter out sodium contamination."],
  [/titrat|burette|end ?point/i,
    "Run the titrant in fast to within 2 cm³ of the expected end-point, then dropwise, swirling constantly. Read the bottom of the meniscus at eye level to 0.05 cm³ against a white tile. Repeat until two titres agree within 0.10 cm³ and average only the concordant ones."],
  [/pipette/i,
    "Rinse the pipette with the solution it will deliver, fill above the graduation with a safety filler, then run out to the mark and touch the tip on the flask wall — never blow out the last drop."],
  [/weigh|mass|balance|constant mass/i,
    "Tare the balance with the container in place and record every mass to 0.01 g (0.001 g for gravimetric work). For constant mass, heat, cool in a desiccator and reweigh until two masses agree within 0.01 g."],
  [/dropwise|drop by drop|add .*drops/i,
    "Add drop by drop from a teat pipette, counting the drops and shaking the tube gently after each addition so a temporary excess never masks the true observation."],
  [/heat|bunsen|boil|warm/i,
    "Heat gently with a low blue flame, moving the flame to avoid bumping. Point a test-tube mouth away from everyone and never heat a sealed vessel. Use a water bath (below 80 °C) for flammable liquids."],
  [/filter|filtrat|residue/i,
    "Fold and wet the filter paper so it seats in the funnel, pour down a stirring rod, and wash the residue two or three times with a little distilled water before drying."],
  [/crystall/i,
    "Evaporate to the point of crystallisation — a drop on a cold rod should form crystals — then leave to cool slowly. Slow cooling gives larger, purer crystals; dry them between filter papers, not on a flame."],
  [/electro(lys|plat)|electrode|cell|voltmeter|ammeter/i,
    "Clean each electrode with sandpaper, rinse with distilled water, dry and weigh before use. Keep the current constant and time it precisely; connect the voltmeter across the cell, the ammeter in series."],
  [/chromatograp|rf|solvent front/i,
    "Draw the baseline in pencil 1 cm from the bottom and keep it above the solvent level. Spot small and dry between applications, and mark the solvent front immediately when the run is stopped."],
  [/indicator|litmus|\bph\b/i,
    "Use a fresh strip each time, dampen it with distilled water for a gas test, and compare the colour against the chart in good daylight — never dip the strip into a bulk reagent bottle."],
  [/precipitat|in excess/i,
    "Note the colour of the precipitate as it first forms, then continue to excess — redissolution is the diagnostic step for amphoteric and complex-forming ions."],
  [/distil|condens|fraction/i,
    "Add anti-bumping granules, start the condenser water before heating, and place the thermometer bulb level with the side-arm. Collect the fraction only while the temperature holds steady, and never distil to dryness."],
  [/temperature|thermometer|calorimet/i,
    "Record the temperature every 30 s, stirring gently. Plot temperature against time and extrapolate back to the moment of mixing to correct for heat loss."],
  [/gas|bubbl|collect over water|syringe/i,
    "Check every joint is gas-tight before starting and discard the first few cm³ (displaced air). Collect over water for insoluble gases, by downward delivery for dense gases, upward for less-dense gases."],
  [/stir|shake|swirl|mix/i,
    "Stir or swirl continuously so the mixture stays uniform; a stationary layer gives a false, delayed observation."],
  [/time|stopwatch|rate/i,
    "Start the stopwatch the instant the reagents meet and stop it on the agreed end-point. Repeat each run at least twice and only average concordant times."],
  [/dissolve|solution|dilute/i,
    "Dissolve in about half the final volume, then make up to the mark with distilled water and invert the stoppered flask ten times to mix thoroughly."],
];

function techniqueFor(step: string): string | undefined {
  for (const [re, note] of TECHNIQUE) if (re.test(step)) return note;
  return undefined;
}

const RECORDING: Partial<Record<PdfCategory, string[]>> = {
  A: ["Initial and final burette readings (cm³, to 0.05) for the rough and each accurate run.",
    "Titre for each run and the mean of the concordant titres.",
    "Colour at the end-point and the volume at which it became permanent."],
  B: ["Mass of empty vessel, vessel + sample and vessel + product (to 0.01 g).",
    "Each mass after successive heatings until constant mass is reached.",
    "Appearance of the residue at every stage."],
  C: ["The reagent added, the colour of any precipitate, and its behaviour in excess.",
    "The gas (if any) evolved and the result of its confirmatory test.",
    "Your deduction — the cation present — for each unknown."],
  D: ["Observation with each test reagent and whether the precipitate dissolved in acid.",
    "Effect on limewater, indicator paper or the confirmatory reagent.",
    "The anion deduced from the combined evidence."],
  E: ["Method of collection used and why it suits that gas.",
    "Result of each gas test (splint, limewater, damp litmus, dichromate paper).",
    "Volume of gas collected against time where measured."],
  F: ["Time for the reaction to reach the chosen end-point in each run.",
    "Volume of gas or loss in mass every 30 s.",
    "The variable changed (concentration, temperature, surface area, catalyst) and its value."],
  G: ["Steady initial temperature, then temperature every 30 s after mixing.",
    "Maximum (or minimum) temperature reached and the corrected value from the cooling graph.",
    "Masses and volumes needed for q = mcΔT."],
  H: ["Initial and final mass of each electrode (to 0.01 g).",
    "Current (A) and time (s), plus the cell voltage where measured.",
    "Observations at the anode and cathode, including any gas evolved."],
  I: ["Distance moved by each spot and by the solvent front (mm).",
    "Calculated Rf value for every component.",
    "Appearance of the separated fractions or layers."],
  J: ["Volumes and masses of reactants used, plus reflux or reaction time.",
    "Observations at each stage (colour, layering, smell described by wafting).",
    "Mass of product obtained and the percentage yield."],
  K: ["Colour of the equilibrium mixture before and after each change.",
    "Temperature or concentration applied and the direction the position shifted.",
    "Whether the change was reversible on returning to the original conditions."],
  L: ["Mass dissolved per 100 g of water at each temperature.",
    "Melting or boiling temperature observed, and the range over which it happened.",
    "Appearance of the sample before and after the measurement."],
  M: ["Every quantitative reading with its unit and instrument uncertainty.",
    "Qualitative observations at each stage of the procedure.",
    "The final calculated value and how it compares with the accepted value."],
};

export function buildProcedure(exp: SyllabusExperiment): DetailedProcedure {
  const kit = resolveApparatus(exp.materials);
  const chems = exp.requiredChemicalIds.map((id) => CHEMICAL_DATABASE[id]).filter(Boolean);
  const hazardous = chems.filter((c) => (c.hazards?.length ?? 0) > 0);
  const meta = metaFor(exp.id);

  const safety: string[] = [
    "Put on safety goggles and a lab coat before you collect any reagent, and tie back long hair.",
  ];
  for (const c of hazardous.slice(0, 6)) {
    safety.push(`${c.name} — ${c.hazards!.join("; ")}. Handle over a tray and rinse any spill with plenty of water.`);
  }
  if (kit.some((a) => a.id === "fume-hood")) safety.push("Carry out every step that releases gas inside a working fume cupboard with the sash low.");
  if (kit.some((a) => a.id === "bunsen" || a.id === "spirit-lamp")) safety.push("A naked flame is in use — keep flammable solvents stoppered and well away from the bench.");
  if (kit.some((a) => a.id === "dc-power-supply")) safety.push("Keep the supply at or below 6 V, switch off before altering the circuit, and keep leads clear of the electrolyte.");
  safety.push("Know where the eyewash, fire blanket and extinguisher are before you start.");

  const setup: string[] = [
    `Collect the apparatus: ${kit.map((a) => a.name).join(", ")}.`,
    "Rinse all glassware with tap water and then with distilled water; rinse anything that will hold a standard solution with that solution.",
  ];
  if (kit.some((a) => a.id === "retort-stand")) setup.push("Clamp the stand securely at the back of the bench so the assembly is vertical and cannot topple.");
  if (kit.some((a) => a.id === "tripod")) setup.push("Stand the tripod over the burner and lay the gauze flat before any vessel is placed on it.");
  if (kit.some((a) => a.id === "burette")) setup.push("Fill the burette through a funnel with the tap closed, run the titrant through to expel the air bubble below the tap, then remove the funnel and set the level on the scale.");
  if (kit.some((a) => a.id === "delivery-tube")) setup.push("Fit the bung and delivery tube, then test the assembly is gas-tight by warming the flask with your hands and watching for bubbles.");
  if (kit.some((a) => a.id === "balance")) setup.push("Check the balance reads zero with nothing on the pan and keep it out of any draught.");
  setup.push("Label every vessel before you fill it and lay out a results table before the first reading.");

  const method: MethodStep[] = exp.steps.map((s) => ({ text: s, detail: techniqueFor(s) }));
  method.unshift({
    text: "Record the starting conditions: room temperature, and the exact concentration or mass of every reagent on its label.",
    detail: "Any calculated result is only as good as these starting values — copy them down before the first mixing step.",
  });
  method.push({
    text: "Repeat the measurement or test until your results are consistent, then confirm the identity of the product with the appropriate confirmatory test.",
    detail: "A single run is never sufficient evidence; concordant repeats are what earn accuracy marks.",
  });

  const recording = [
    ...(RECORDING[meta.category] ?? RECORDING.M!),
    "Every observation in the moment it happens — colour change, effervescence, heat, smell, precipitate or crystals — with the time it occurred.",
  ];

  const analysis = [
    `Expected outcome: ${exp.expectedResult}`,
    `Equation(s): ${exp.theoreticalEquation}`,
    `Chemistry behind it (${exp.dwsimProof.reactionType}): ${exp.dwsimProof.notes}`,
    ...(exp.dwsimProof.deltaH ? [`ΔH = ${exp.dwsimProof.deltaH}`] : []),
    ...(exp.dwsimProof.gibbsEnergy ? [`ΔG = ${exp.dwsimProof.gibbsEnergy} — a negative value means the change is spontaneous.`] : []),
    ...(exp.dwsimProof.equilibriumConstant ? [`K = ${exp.dwsimProof.equilibriumConstant}`] : []),
    ...(exp.dwsimProof.nernstPotential ? [`E(cell) = ${exp.dwsimProof.nernstPotential}`] : []),
    ...(exp.dwsimProof.kineticsRate ? [`Rate data: ${exp.dwsimProof.kineticsRate}`] : []),
    "Compare your value with the accepted one, quote the percentage error, and state the largest source of uncertainty in your measurements.",
    `This procedure is assessed as ${PDF_CATEGORY_LABELS[meta.category]} at ${meta.level} standard.`,
  ];

  const cleanup = [
    "Switch off the burner, hotplate or power supply and let hot apparatus cool before you handle it.",
    "Neutralise acid or alkali residues before pouring them away; put heavy-metal, halogenated and organic waste in the labelled waste bottle.",
    "Wash and rinse all glassware with distilled water and return it to the tray, then wash your hands.",
  ];

  return { safety, setup, method, recording, analysis, cleanup };
}