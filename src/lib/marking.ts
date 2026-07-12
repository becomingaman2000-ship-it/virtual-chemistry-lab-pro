/**
 * Weighted marking bridge — combines an experiment's raw rubric with the
 * selected syllabus's per-action multipliers to produce a final percentage
 * and board-appropriate grade.
 *
 * Consumed later by LabBench Test mode; kept in /lib so both the report
 * screen and any offline PDF export can share the same math.
 */

import type { Experiment, StepAction } from "@/data/experiments";
import { gradeFor, type Syllabus } from "@/data/syllabi";

export interface CheckpointResult {
  action: StepAction;
  achieved: boolean;
  rawMarks: number;
  weightedMarks: number;
}

export interface MarkingReport {
  experimentId: string;
  syllabusId: string | null;
  checkpoints: CheckpointResult[];
  rawScore: number;
  rawTotal: number;
  weightedScore: number;
  weightedTotal: number;
  percent: number;
  grade: string;
  descriptor: string;
  missedHints: string[];
}

/** Given a set of achieved rubric action indexes, compute the report. */
export function markExperiment(
  experiment: Experiment,
  achieved: Set<number>,
  syllabus: Syllabus | null,
  precisionAchieved = false,
): MarkingReport {
  const checkpoints: CheckpointResult[] = experiment.marking.map((action, i) => {
    const isDone = achieved.has(i);
    const weight = syllabus ? syllabus.weights[action.kind] : 1;
    return {
      action,
      achieved: isDone,
      rawMarks: isDone ? action.marks : 0,
      weightedMarks: isDone ? action.marks * weight : 0,
    };
  });

  const rawScore = checkpoints.reduce((s, c) => s + c.rawMarks, 0);
  const rawTotal = experiment.marking.reduce((s, a) => s + a.marks, 0);
  let weightedScore = checkpoints.reduce((s, c) => s + c.weightedMarks, 0);
  const weightedTotal = experiment.marking.reduce(
    (s, a) => s + a.marks * (syllabus ? syllabus.weights[a.kind] : 1),
    0,
  );

  if (syllabus && precisionAchieved) {
    weightedScore *= 1 + syllabus.precisionBonus;
  }

  const percent = weightedTotal > 0 ? Math.min(100, (weightedScore / weightedTotal) * 100) : 0;
  const band = syllabus
    ? gradeFor(syllabus, percent)
    : { grade: percent >= 50 ? "Pass" : "Fail", min: 50, descriptor: percent >= 50 ? "Meets a general practical standard" : "Below the general practical standard" };

  return {
    experimentId: experiment.id,
    syllabusId: syllabus?.id ?? null,
    checkpoints,
    rawScore,
    rawTotal,
    weightedScore,
    weightedTotal,
    percent,
    grade: band.grade,
    descriptor: band.descriptor,
    missedHints: checkpoints.filter((c) => !c.achieved).map((c) => c.action.hint),
  };
}
