/**
 * Guards the marking engine against over-awarding.
 *
 * A student who does nothing should score close to nothing, hazards must cost
 * marks, and the safety criterion must depend on doing things in the right
 * order (apparatus before reagents).
 */
import { COMPLETE_SYLLABUS_EXPERIMENTS as EXPS } from "../../src/lib/lab/experimentsCatalog";
import { SYLLABI } from "../../src/data/syllabi";
import { markAttempt } from "../../src/lib/lab/markingEngine";

const syl = SYLLABI.find((s) => s.id === "zimsec-o-4024") ?? SYLLABI[0];
const failures: string[] = [];

// 1. An empty attempt may only pick up the "no incidents" mark, nothing else.
const empty = (EXPS as any[]).map((e) =>
  markAttempt({
    experiment: e, syllabus: syl, log: [], readings: [], observations: [],
    hazards: 0, reactionMatched: false, measuredAdds: 0,
  } as any),
);
const emptyPct = Math.max(...empty.map((o) => o.percent));
const emptyExtra = empty.filter((o) => o.criteria.some((c) => c.achieved && c.id !== "nohazard"));
console.log(`DID-NOTHING   : max ${emptyPct}% | experiments awarding anything beyond "no incidents": ${emptyExtra.length}`);
if (emptyExtra.length > 0) failures.push("an empty attempt is awarded work-based criteria");
if (emptyPct > 10) failures.push(`an empty attempt scores ${emptyPct}%, which is too generous`);

// 2. Spamming observations must not approach a pass.
const spam = (EXPS as any[]).map((e) =>
  markAttempt({
    experiment: e, syllabus: syl,
    log: Array.from({ length: 40 }, (_, i) => ({ ts: i, kind: "observe", label: "looked at it" })),
    readings: [], observations: ["x", "y", "z"], hazards: 0, reactionMatched: false, measuredAdds: 0,
  } as any),
);
const spamPct = Math.max(...spam.map((o) => o.percent));
console.log(`OBSERVE-SPAM  : max ${spamPct}%`);
if (spamPct >= 45) failures.push(`observation spam alone reaches ${spamPct}% (a pass) without any chemistry`);

// 3. Hazards must be penalised, and 4. safety depends on ordering.
const e0 = EXPS[0] as any;
const chem = (e0.requiredChemicalIds ?? [])[0];
const base = { experiment: e0, syllabus: syl, readings: [], observations: [], reactionMatched: false, measuredAdds: 0 } as any;
const place = { ts: 1, kind: "place", label: "Placed Beaker" };
const add = { ts: 2, kind: "add", label: "added", chemicalIds: [chem] };

const safe = markAttempt({ ...base, hazards: 0, log: [place] });
const unsafe = markAttempt({ ...base, hazards: 3, log: [place] });
console.log(`HAZARDS       : clean ${safe.rawScore} vs 3 incidents ${unsafe.rawScore}`);
if (unsafe.rawScore >= safe.rawScore) failures.push("causing incidents is not penalised");

const good = markAttempt({ ...base, hazards: 0, log: [place, add] });
const bad = markAttempt({ ...base, hazards: 0, log: [{ ...add, ts: 1 }, { ...place, ts: 2 }] });
const gs = good.criteria.find((c) => c.id === "safety")?.achieved;
const bs = bad.criteria.find((c) => c.id === "safety")?.achieved;
console.log(`SAFETY ORDER  : place-then-add ${gs} | add-then-place ${bs}`);
if (gs !== true || bs !== false) failures.push("the safety mark does not depend on apparatus being placed before reagents");

if (failures.length > 0) {
  console.error("\nFAIL - the marking engine over-awards:");
  failures.forEach((f) => console.error("  -", f));
  process.exit(1);
}
console.log("\nPASS - no free marks; effort is required for every criterion.");
