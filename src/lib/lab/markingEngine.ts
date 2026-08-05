/**
 * ChemVM - honest marking engine.
 *
 * Builds a criterion-referenced rubric directly from the syllabus experiment
 * definition (required chemicals, steps, expected result), then scores it
 * against the evidence the student actually produced on the bench. Nothing is
 * awarded that was not observed in the action log / readings.
 */

import type { SyllabusExperiment } from "@/lib/lab/experimentsCatalog";
import type { Syllabus } from "@/data/syllabi";
import type { ActionKind } from "@/data/experiments";

export interface EvidenceEntry {
  ts: number;
  kind: string;
  label: string;
  experimentId?: number;
}

export interface Reading {
  ts: number;
  vessel: string;
  action: string;
  temperature: number;
  volume: number;
  pH: number;
  colour: string;
  observation: string;
}

export interface Criterion {
  id: string;
  label: string;
  kind: ActionKind;
  marks: number;
  achieved: boolean;
  evidence?: string;
  hint: string;
}

export interface MarkingOutcome {
  criteria: Criterion[];
  rawScore: number;
  rawTotal: number;
  percent: number;
  grade: string;
  descriptor: string;
  correct: { label: string }[];
  missed: { label: string }[];
}

const norm = (s: string) => s.toLowerCase().replace(/[_-]+/g, " ");

function stepsText(exp: SyllabusExperiment) {
  return norm([exp.objective, ...(exp.steps ?? []), exp.expectedResult ?? ""].join(" "));
}

function mentions(text: string, words: string[]) {
  return words.some((w) => text.includes(w));
}

/** Build the rubric this experiment should be marked against. */
export function buildRubric(exp: SyllabusExperiment): Omit<Criterion, "achieved" | "evidence">[] {
  const text = stepsText(exp);
  const out: Omit<Criterion, "achieved" | "evidence">[] = [];

  out.push({
    id: "safety",
    label: "Set the bench up safely (apparatus placed before reagents)",
    kind: "place", marks: 4,
    hint: "Place the apparatus you need on the bench before adding chemicals.",
  });

  for (const id of exp.requiredChemicalIds ?? []) {
    out.push({
      id: `chem:${id}`,
      label: `Used the correct reagent: ${id.replace(/_/g, " ")}`,
      kind: "add", marks: 8,
      hint: `This experiment requires ${id.replace(/_/g, " ")}.`,
    });
  }

  out.push({
    id: "measure",
    label: "Measured out reagent quantities",
    kind: "measure", marks: 6,
    hint: "Use the measurement dialog to add a specific volume or mass.",
  });

  if (mentions(text, ["heat", "warm", "boil", "burn", "combust", "flame", "ignite", "reflux", "evaporat", "distil"])) {
    out.push({
      id: "heat", label: "Applied heat as the method requires", kind: "heat", marks: 8,
      hint: "Light a burner under the vessel - this experiment needs heating.",
    });
  }
  if (mentions(text, ["litmus", "indicator", "phenolphthalein", "methyl orange", "ph "])) {
    out.push({
      id: "indicator", label: "Carried out the indicator / pH test", kind: "observe", marks: 8,
      hint: "Run an indicator test on the vessel (right-click -> Indicator...).",
    });
  }
  if (mentions(text, ["flame test"])) {
    out.push({
      id: "flametest", label: "Carried out the flame test", kind: "observe", marks: 8,
      hint: "Heat the sample in a flame and read the characteristic colour.",
    });
  }
  if (mentions(text, ["gas", "limewater", "splint", "effervesc", "bubbl"])) {
    out.push({
      id: "gastest", label: "Tested the gas evolved", kind: "observe", marks: 8,
      hint: "Identify the gas with the correct test (limewater, splint, damp litmus).",
    });
  }
  if (mentions(text, ["filter", "filtrat", "distil", "chromatograph", "sublim", "magnet", "decant", "crystallis", "crystalliz", "separat", "evaporat"])) {
    out.push({
      id: "separate", label: "Applied the correct separation technique", kind: "filter", marks: 8,
      hint: "Use Separate... and choose the technique named in the method.",
    });
  }
  if (mentions(text, ["pour", "transfer", "add to", "titrat", "mix"])) {
    out.push({
      id: "transfer", label: "Transferred / mixed contents between vessels", kind: "pour", marks: 5,
      hint: "Pour one vessel into another to combine the reagents.",
    });
  }

  out.push({
    id: "reaction", label: "Produced the expected chemical change", kind: "observe", marks: 15,
    hint: exp.expectedResult || "The expected reaction was not reached.",
  });
  out.push({
    id: "readings", label: "Recorded readings in the results table", kind: "measure", marks: 8,
    hint: "Record at least two readings (temperature / volume / pH) as you work.",
  });
  out.push({
    id: "observe", label: "Recorded written observations", kind: "observe", marks: 8,
    hint: "Write down what you saw - colour change, gas, precipitate.",
  });
  out.push({
    id: "nohazard", label: "Worked without breaking apparatus or causing an incident", kind: "safety", marks: 6,
    hint: "Overheating cracked or ruptured glassware - control the flame.",
  });

  return out;
}

export interface MarkInput {
  experiment: SyllabusExperiment;
  syllabus: Syllabus | null;
  log: EvidenceEntry[];
  readings: Reading[];
  observations: string[];
  hazards: number;
  reactionMatched: boolean;
  measuredAdds: number;
}

export function markAttempt(input: MarkInput): MarkingOutcome {
  const { experiment, syllabus, log, readings, observations, hazards, reactionMatched, measuredAdds } = input;
  const labels = log.map((l) => norm(l.label));
  const has = (kind: string) => log.some((l) => l.kind === kind);
  const labelHas = (...words: string[]) => labels.some((l) => words.some((w) => w.length > 2 && l.includes(w)));

  const criteria: Criterion[] = buildRubric(experiment).map((c) => {
    let achieved = false;
    let evidence: string | undefined;

    if (c.id === "safety") {
      const firstAdd = log.find((l) => l.kind === "add");
      const firstPlace = log.find((l) => l.kind === "place");
      achieved = !!firstPlace && (!firstAdd || firstPlace.ts <= firstAdd.ts);
      if (achieved) evidence = "Apparatus placed before reagents";
    } else if (c.id.startsWith("chem:")) {
      const chem = norm(c.id.slice(5));
      achieved = labelHas(chem, chem.split(" ")[0]);
      if (achieved) evidence = "Reagent added on the bench";
    } else if (c.id === "measure") {
      achieved = measuredAdds > 0;
      if (achieved) evidence = `${measuredAdds} measured addition(s)`;
    } else if (c.id === "heat") {
      achieved = has("heat");
      if (achieved) evidence = "Heat applied";
    } else if (c.id === "indicator") {
      achieved = labelHas("litmus", "indicator", "phenolphthalein", "methyl orange");
    } else if (c.id === "flametest") {
      achieved = labelHas("flame test");
    } else if (c.id === "gastest") {
      achieved = labelHas("limewater", "splint", "gas test", "damp litmus");
    } else if (c.id === "separate") {
      achieved = labelHas("filtrat", "filter", "distil", "chromatograph", "sublim", "magnet", "decant", "crystallis", "evaporat", "separat");
    } else if (c.id === "transfer") {
      achieved = has("pour");
    } else if (c.id === "reaction") {
      achieved = reactionMatched;
      if (achieved) evidence = "Expected chemical change observed";
    } else if (c.id === "readings") {
      achieved = readings.length >= 2;
      if (achieved) evidence = `${readings.length} readings recorded`;
    } else if (c.id === "observe") {
      achieved = observations.length > 0 || has("observe");
      if (achieved) evidence = `${observations.length} written observation(s)`;
    } else if (c.id === "nohazard") {
      achieved = hazards === 0;
      if (!achieved) evidence = `${hazards} incident(s)`;
    }

    return { ...c, achieved, evidence };
  });

  const weight = (k: ActionKind) => (syllabus ? syllabus.weights[k] ?? 1 : 1);
  const rawTotal = criteria.reduce((s, c) => s + c.marks * weight(c.kind), 0);
  const rawScore = criteria.reduce((s, c) => s + (c.achieved ? c.marks * weight(c.kind) : 0), 0);
  const percent = rawTotal > 0 ? Math.round((rawScore / rawTotal) * 100) : 0;

  const band = syllabus
    ? syllabus.grades.find((g) => percent >= g.min) ?? syllabus.grades[syllabus.grades.length - 1]
    : { grade: percent >= 50 ? "Pass" : "Fail", min: 50, descriptor: percent >= 50 ? "Meets the general practical standard" : "Below the general practical standard" };

  return {
    criteria,
    rawScore: Math.round(rawScore),
    rawTotal: Math.round(rawTotal),
    percent,
    grade: band.grade,
    descriptor: band.descriptor,
    correct: criteria.filter((c) => c.achieved).map((c) => ({ label: `${c.label}${c.evidence ? ` - ${c.evidence}` : ""} (${c.marks})` })),
    missed: criteria.filter((c) => !c.achieved).map((c) => ({ label: `${c.label} - ${c.hint}` })),
  };
}
