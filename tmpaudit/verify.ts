import { COMPLETE_SYLLABUS_EXPERIMENTS as E } from "../src/lib/lab/experimentsCatalog";
import { resolveApparatus, unresolvedMaterials, missingChemicals } from "../src/lib/lab/apparatusResolver";
let bad = 0;
for (const e of E) {
  const u = unresolvedMaterials(e.materials);
  const c = missingChemicals(e.requiredChemicalIds);
  const kit = resolveApparatus(e.materials);
  if (u.length || c.length || kit.length < 3) { bad++; console.log(`#${e.id} ${e.title}\n  unresolved: ${u.join(" | ")}\n  missing chem: ${c.join(" | ")}\n  kit: ${kit.length}`); }
}
console.log(bad ? `FAIL ${bad}/115` : `OK all 115 experiments fully equipped`);
