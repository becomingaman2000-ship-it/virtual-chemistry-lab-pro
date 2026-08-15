import { COMPLETE_SYLLABUS_EXPERIMENTS as EXPS } from "../../src/lib/lab/experimentsCatalog";
import { SYLLABI } from "../../src/data/syllabi";
import { markAttempt } from "../../src/lib/lab/markingEngine";

const syl = SYLLABI.find((s) => s.id === "zimsec-o-4024") ?? SYLLABI[0];
let t = Date.now();
const tick = () => (t += 1000);

// An ideal student: safety first, every reagent measured in, heat, all tests, readings, observations.
function perfectLog(e: any) {
  const log: any[] = [{ ts: tick(), kind: "place", label: "Placed Beaker" }];
  for (const c of e.requiredChemicalIds ?? [])
    log.push({ ts: tick(), kind: "add", label: `Measured 10 ml of ${c}`, chemicalIds: [c] });
  log.push({ ts: tick(), kind: "heat",   label: "Ignited Bunsen burner — blue flame" });
  log.push({ ts: tick(), kind: "observe",label: "Flame test: brick-red flame observed" });
  log.push({ ts: tick(), kind: "observe",label: "Gas test: limewater turned milky" });
  log.push({ ts: tick(), kind: "observe",label: "Indicator: universal indicator turned red" });
  log.push({ ts: tick(), kind: "filter", label: "Separated the mixture by filtration" });
  log.push({ ts: tick(), kind: "pour",   label: "Poured into a clean test tube" });
  return log;
}
const reading = (i: number) => ({ ts: tick(), vessel: "Beaker", action: "Observation",
  temperature: 25 + i, volume: 10, pH: 7, colour: "blue", observation: "recorded" });

const rows: any[] = [];
for (const e of EXPS as any[]) {
  const out = markAttempt({
    experiment: e, syllabus: syl, log: perfectLog(e),
    readings: [reading(0), reading(1), reading(2)],
    observations: ["Full written observation of the reaction and conclusion."],
    hazards: 0, reactionMatched: true,
    measuredAdds: (e.requiredChemicalIds ?? []).length,
  } as any);
  rows.push({ id: e.id, title: e.title, pct: out.percent, raw: out.rawScore, tot: out.rawTotal,
    missed: out.missed.map((m: any) => m.label) });
}
rows.sort((a, b) => a.pct - b.pct);
console.log("PERFECT-STUDENT SWEEP over", rows.length, "experiments");
console.log("min:", rows[0].pct + "%", "| max:", rows[rows.length-1].pct + "%");
const imperfect = rows.filter((r) => r.pct < 100);
console.log("\nexperiments NOT reaching 100%:", imperfect.length);
for (const r of imperfect.slice(0, 14)) {
  console.log(`  #${String(r.id).padStart(3)} ${r.pct}% (${r.raw}/${r.tot}) ${r.title.slice(0,40)}`);
  r.missed.slice(0, 3).forEach((m: string) => console.log("        missed:", m.slice(0, 88)));
}

if (imperfect.length > 0) {
  console.error(`\nFAIL - ${imperfect.length} experiment(s) cannot reach 100%.`);
  process.exit(1);
}
console.log("\nPASS - every experiment is completable to full marks.");
