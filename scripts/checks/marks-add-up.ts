import { COMPLETE_SYLLABUS_EXPERIMENTS as EXPS } from "../../src/lib/lab/experimentsCatalog";
import { SYLLABI } from "../../src/data/syllabi";
import { markAttempt } from "../../src/lib/lab/markingEngine";
let bad = 0, checked = 0;
for (const syl of SYLLABI) {
  for (const e of EXPS as any[]) {
    let t = 0; const tick = () => ++t;
    const log: any[] = [{ ts: tick(), kind: "place", label: "Placed Beaker" }];
    for (const c of e.requiredChemicalIds ?? []) log.push({ ts: tick(), kind: "add", label: `Measured 10 ml of ${c}`, chemicalIds: [c] });
    log.push({ ts: tick(), kind: "heat", label: "Ignited Bunsen" }, { ts: tick(), kind: "observe", label: "Flame test" });
    const o = markAttempt({ experiment: e, syllabus: syl, log, readings: [{}, {}] as any,
      observations: ["obs"], hazards: 0, reactionMatched: true, measuredAdds: (e.requiredChemicalIds ?? []).length } as any);
    const sumA = o.criteria.filter(c => c.achieved).reduce((s, c) => s + (c as any).weightedMarks, 0);
    const sumT = o.criteria.reduce((s, c) => s + (c as any).weightedMarks, 0);
    checked++;
    if (sumA !== o.rawScore || sumT !== o.rawTotal) {
      if (bad < 3) console.log("MISMATCH", syl.id, e.id, `table ${sumA}/${sumT} vs headline ${o.rawScore}/${o.rawTotal}`);
      bad++;
    }
  }
}
console.log(`\nChecked ${checked} experiment x syllabus combinations.`);
if (bad > 0) {
  console.error(`FAIL - ${bad} combination(s) where the mark scheme does not add up.`);
  process.exit(1);
}
console.log("PASS - the mark scheme column always adds up to the headline total.");
