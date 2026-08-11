import { COMPLETE_SYLLABUS_EXPERIMENTS as E } from "../src/lib/lab/experimentsCatalog";
import { APPARATUS } from "../src/data/apparatus";
const norm = (s:string)=>s.toLowerCase().replace(/[^a-z0-9 ]/g," ").replace(/\s+/g," ").trim();
const byName = new Map(APPARATUS.map(a=>[norm(a.name),a.id]));
const KEY: [RegExp,string][] = [
  [/test tube rack/,"test-tube-rack"],[/boiling tube/,"boiling-tube"],[/test tube/,"test-tube"],
  [/dropper|pasteur/,"pipette-pasteur"],[/balance/,"balance"],[/bunsen/,"bunsen"],
  [/conical flask|erlenmeyer/,"flask-conical"],[/beaker/,"beaker"],[/thermometer/,"thermometer"],
  [/stopwatch|timer/,"stopwatch"],[/stirring rod|glass rod/,"stirring-rod"],[/burette/,"burette"],
  [/water bath/,"water-bath"],[/round bottom flask|hard glass flask/,"flask-round"],
  [/delivery tube/,"delivery-tube"],[/litmus|indicator paper|ph color chart|test strip/,"indicator-paper"],
  [/volumetric flask/,"flask-volumetric"],[/pipette/,"pipette-vol"],[/filter paper/,"filter-paper"],
  [/filter funnel|glass funnel/,"filter-funnel"],[/retort stand/,"retort-stand"],
  [/separating funnel/,"sep-funnel"],[/watch glass/,"watch-glass"],[/splint/,"wooden-splint"],
  [/ruler/,"ruler"],[/white tile|white background/,"white-tile"],[/magnetic stirrer|hot plate/,"hotplate"],
  [/condenser/,"condenser"],[/gas jar/,"gas-jar"],[/measuring cylinder|graduated cylinder/,"cylinder"],
  [/conductivity meter/,"conductivity-meter"],[/mortar/,"mortar-pestle"],[/stopper|bung/,"rubber-stopper"],
  [/leads/,"connecting-leads"],[/power (supply|portal)|charging portal/,"dc-power-supply"],
  [/copper (electrode|plate)|cu strip/,"copper-electrode"],[/zinc electrode|zn strip/,"zinc-electrode"],
  [/voltmeter/,"voltmeter"],[/ammeter/,"ammeter"],[/gas syringe/,"gas-syringe"],
  [/water trough|gas collection trough/,"water-trough"],[/fume (cupboard|hood|shield)/,"fume-hood"],
  [/cuvette/,"cuvette"],[/ph (meter|probe)/,"ph-meter"],[/wire loop|nichrome/,"wire-loop"],
  [/chromatography tank|developing tank/,"chromatography-tank"],[/chromatography paper|tlc.*plate|silica gel plate/,"chromatography-paper"],
  [/capillary/,"capillary-tube"],[/spot plate/,"spot-plate"],
  [/spectrophotometer|colorimeter/,"colorimeter"],[/crucible/,"crucible"],[/pipeclay/,"pipeclay-triangle"],
  [/tripod/,"tripod"],[/wash bottle/,"wash-bottle"],[/cotton wool/,"cotton-wool"],
  [/tongs|tweezers/,"crucible-tongs"],[/ice bath/,"ice-bath"],[/combustion tube|cracking tube/,"combustion-tube"],
  [/electrolytic cell|voltameter/,"electrolytic-cell"],[/graphite|carbon electrode/,"carbon-electrode"],
  [/sandpaper|emery/,"sandpaper"],[/salt bridge/,"salt-bridge"],[/petri/,"petri-dish"],
  [/calorimeter can|copper can/,"copper-can"],[/calorimeter/,"calorimeter-cup"],[/draught shield|black paper shield/,"draught-shield"],
  [/spirit burner|spirit lamp/,"spirit-lamp"],[/data logger|digital sensor/,"data-logger"],
  [/thistle funnel/,"thistle-funnel"],[/dropping funnel/,"dropping-funnel"],
  [/fractionating column/,"fractionating-column"],[/evaporating dish/,"evap-dish"],
  [/visking|dialysis/,"visking-tubing"],[/electrophoresis/,"electrophoresis-tank"],
  [/victor meyer/,"victor-meyer"],[/steam generator/,"steam-generator"],[/blender/,"blender"],
  [/cheesecloth|muslin/,"cheesecloth"],[/spooling rod/,"spooling-rod"],[/laser|torch/,"laser-pointer"],
  [/led/,"led-bulb"],[/uv light|uv lamp|sunlight/,"uv-lamp"],[/magnet/,"bar-magnet"],
  [/spatula|scoopula/,"spatula"],[/desiccan?t|soda lime/,"desiccator"],[/iron nail|iron key/,"iron-nail"],
  [/agar/,"agar-jelly"],[/oil layer/,"oil-layer"],[/glass bulb|sample bulb/,"sample-bulb"],
  [/sealed .*tube/,"sealed-tube"],[/side arm/,"flask-side-arm"],[/dark room/,"dark-chamber"],
  [/oven|hairdryer/,"drying-oven"],[/spray reagent|ninhydrin spray/,"spray-bottle"],
  [/kipp/,"kipps-generator"],[/candle/,"candle"],[/metal plates/,"metal-strips"],[/lead plate/,"lead-plate"],
  [/goggles/,"goggles"],[/calculator|reference (table|data)|thermodynamic|bond reference|data portal|profile|template/,"__ref"],
];
const CHEMISH = /acid|limewater|water|nitrate|ferricyanide|phenolphthalein|peroxide|catalase|alumina|ribbon|spinach|buffer|caco|reagent|ethanol|silica gel stationary|media|masses of/i;
const miss = new Map<string,number>();
for (const e of E) for (const m of e.materials) {
  const n = norm(m);
  if (byName.has(n)) continue;
  if (KEY.some(([r])=>r.test(n))) continue;
  if (CHEMISH.test(m)) continue;
  miss.set(m,(miss.get(m)||0)+1);
}
console.log("UNRESOLVED", miss.size);
console.log([...miss.keys()].join("\n"));
