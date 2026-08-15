import { COMPLETE_SYLLABUS_EXPERIMENTS as EXPS } from "../../src/lib/lab/experimentsCatalog";
import { CHEMICAL_DATABASE } from "../../src/lib/lab/dwsimChemicals";
import { MISSING_CHEMICAL_DATABASE } from "../../src/lib/lab/dwsimChemicalsMissing";
import { EXTRA_CHEMICAL_DATABASE } from "../../src/lib/lab/dwsimChemicalsExtra";
import { APPARATUS } from "../../src/data/apparatus";

const chemIds = new Set<string>([
  ...Object.keys(CHEMICAL_DATABASE),
  ...Object.keys(MISSING_CHEMICAL_DATABASE),
  ...Object.keys(EXTRA_CHEMICAL_DATABASE),
]);
const appIds = new Set(APPARATUS.map((a) => a.id));
console.log("experiments:", EXPS.length, "| chemicals:", chemIds.size, "| apparatus:", appIds.size);

const seen = new Map<number, number>();
const badChem: string[] = [], badApp: string[] = [], noChem: string[] = [], noSteps: string[] = [];
for (const e of EXPS as any[]) {
  seen.set(e.id, (seen.get(e.id) ?? 0) + 1);
  const cs: string[] = e.requiredChemicalIds ?? [];
  if (!cs.length) noChem.push(`#${e.id} ${e.title}`);
  for (const c of cs) if (!chemIds.has(c)) badChem.push(`#${e.id} ${e.title.slice(0,34)} → ${c}`);
  for (const a of (e.requiredApparatusIds ?? [])) if (!appIds.has(a)) badApp.push(`#${e.id} → ${a}`);
  if (!(e.steps ?? []).length) noSteps.push(`#${e.id} ${e.title}`);
}
const dups = [...seen].filter(([, n]) => n > 1);
console.log("\nDUPLICATE ids            :", dups.length ? JSON.stringify(dups) : "none");
console.log("UNKNOWN chemical refs    :", badChem.length);
badChem.slice(0, 15).forEach((x) => console.log("    ", x));
console.log("UNKNOWN apparatus refs   :", badApp.length);
badApp.slice(0, 15).forEach((x) => console.log("    ", x));
console.log("experiments w/o chemicals:", noChem.length);
noChem.slice(0, 8).forEach((x) => console.log("    ", x));
console.log("experiments w/o steps    :", noSteps.length);
noSteps.slice(0, 8).forEach((x) => console.log("    ", x));

const defects =
  dups.length + badChem.length + badApp.length + noChem.length + noSteps.length;
if (defects > 0) {
  console.error(`\nFAIL - ${defects} data defect(s).`);
  process.exit(1);
}
console.log("\nPASS - catalog, chemical and apparatus registries are consistent.");
