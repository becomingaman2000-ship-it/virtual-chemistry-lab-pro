import { COMPLETE_SYLLABUS_EXPERIMENTS as E } from "../src/lib/lab/experimentsCatalog";
import { APPARATUS } from "../src/data/apparatus";
const mats = new Map<string, number>();
E.forEach(e => e.materials.forEach(m => mats.set(m, (mats.get(m)||0)+1)));
console.log("experiments:", E.length, "distinct materials:", mats.size);
console.log([...mats.entries()].sort((a,b)=>b[1]-a[1]).map(([m,c])=>`${c}\t${m}`).join("\n"));
console.log("=== APPARATUS ===");
console.log(APPARATUS.map(a=>`${a.id}\t${a.name}`).join("\n"));
