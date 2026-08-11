import { COMPLETE_SYLLABUS_EXPERIMENTS as E } from "../src/lib/lab/experimentsCatalog";
import { resolveApparatus, unresolvedMaterials, missingChemicals } from "../src/lib/lab/apparatusResolver";
import { buildProcedure } from "../src/lib/lab/experimentProcedure";
let bad = 0;
for (const e of E) {
  const u = unresolvedMaterials(e.materials);
  const c = missingChemicals(e.requiredChemicalIds);
  const kit = resolveApparatus(e.materials);
  const pr = buildProcedure(e);
  const noteless = pr.method.filter(m => !m.detail).length;
  if (u.length || c.length || !kit.length || pr.method.length < 4 || noteless > pr.method.length - 2) {
    bad++; console.log(`#${e.id} ${e.title} | unresolved:${u.join("|")} chem:${c.join("|")} kit:${kit.length} steps:${pr.method.length} noteless:${noteless}`);
  }
}
console.log(bad ? `FAIL ${bad}/115` : `OK — all 115 experiments have full apparatus, reagents and a detailed procedure`);
