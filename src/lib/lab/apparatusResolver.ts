/**
 * Bridges the free-text `materials` list on each of the 115 catalogue
 * experiments to concrete apparatus ids in the ChemVM apparatus library.
 *
 * The catalogue was authored as prose ("Gas Collection Assembly",
 * "Pipette (25ml)"), so the lab needs a deterministic resolver before it can
 * show a clickable kit list — and before we can prove every experiment is
 * actually performable with the equipment we ship.
 */

import { APPARATUS, type ApparatusItem } from "@/data/apparatus";
import { CHEMICAL_DATABASE } from "./dwsimChemicals";

const norm = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9 ]/g, " ").replace(/\s+/g, " ").trim();

const BY_NAME = new Map(APPARATUS.map((a) => [norm(a.name), a.id]));
const BY_ID = new Map(APPARATUS.map((a) => [a.id, a]));

/** Ordered rules — first match wins. Values may be several apparatus ids. */
const RULES: [RegExp, string[]][] = [
  // composite rigs first
  [/gas collection (assembly|jars?|syringes?)|gas collection/, ["delivery-tube", "gas-jar", "water-trough", "rubber-stopper"]],
  [/distillation setup/, ["flask-round", "condenser", "thermometer", "retort-stand", "beaker"]],
  [/multi[- ]temperature kinetics setup/, ["water-bath", "thermometer", "stopwatch", "flask-conical"]],
  [/gaseous burner assembly/, ["bunsen", "tripod", "gauze"]],
  [/kipp/, ["kipps-generator"]],

  [/test tube rack/, ["test-tube-rack"]],
  [/test tube holder/, ["test-tube-holder"]],
  [/boiling tube/, ["boiling-tube"]],
  [/test tube/, ["test-tube"]],
  [/dropper|pasteur/, ["pipette-pasteur"]],
  [/balance/, ["balance"]],
  [/bunsen/, ["bunsen"]],
  [/conical flask with side arm|side arm/, ["buchner-flask"]],
  [/conical flask|erlenmeyer/, ["flask-conical"]],
  [/receiving beaker|beaker/, ["beaker"]],
  [/high[- ]precision digital thermometer|digital thermometer|thermometer/, ["thermometer"]],
  [/stopwatch|timer/, ["stopwatch"]],
  [/stirring rod|glass rod/, ["stirring-rod"]],
  [/burette/, ["burette", "burette-clamp", "retort-stand"]],
  [/water bath/, ["water-bath"]],
  [/hard glass (flask|cracking tube)|round bottom flask/, ["flask-round"]],
  [/delivery tube/, ["delivery-tube"]],
  [/lead acetate/, ["lead-acetate-paper"]],
  [/k cr o (paper|indicator paper)|dichromate paper/, ["dichromate-paper"]],
  [/litmus|indicator paper|ph colou?r chart|screening test strip|test strip/, ["indicator-paper"]],
  [/volumetric flask/, ["flask-volumetric"]],
  [/pipette/, ["pipette-vol"]],
  [/filter paper/, ["filter-paper"]],
  [/filter funnel|glass funnel/, ["filter-funnel"]],
  [/retort stand/, ["retort-stand"]],
  [/ground glass separating funnel|separating funnel/, ["sep-funnel", "retort-stand", "iron-ring"]],
  [/watch glass/, ["watch-glass"]],
  [/splint|candle/, ["wooden-splint"]],
  [/ruler/, ["ruler"]],
  [/white tile|white background/, ["white-tile"]],
  [/paper marked with an x|marked with a cross/, ["cross-card"]],
  [/magnetic stirrer|hot ?plate/, ["hotplate"]],
  [/condenser/, ["condenser"]],
  [/gas jars?/, ["gas-jar"]],
  [/measuring cylinder|graduated cylinder/, ["cylinder"]],
  [/conductivity meter/, ["conductivity-meter"]],
  [/mortar/, ["mortar-pestle"]],
  [/stoppers?|bung/, ["rubber-stopper"]],
  [/leads/, ["connecting-leads"]],
  [/power (supply|portal)|charging portal/, ["dc-power-supply", "connecting-leads"]],
  [/copper (electrode|plate)|cu strip/, ["copper-electrode"]],
  [/zinc electrode|zn strip/, ["zinc-electrode"]],
  [/lead plates?/, ["lead-plate"]],
  [/metal plates/, ["metal-strips"]],
  [/magnesium ribbon/, ["metal-strips", "sandpaper"]],
  [/iron nails?|iron key/, ["iron-nail"]],
  [/voltmeter/, ["voltmeter"]],
  [/ammeter/, ["ammeter"]],
  [/gas syringe/, ["gas-syringe"]],
  [/water trough|collection trough/, ["water-trough"]],
  [/fume (cupboard|hood|shield)/, ["fume-hood"]],
  [/cuvettes?/, ["cuvette"]],
  [/ph (meter|probe)|electronic digital ph/, ["ph-meter"]],
  [/wire loop|nichrome/, ["wire-loop"]],
  [/chromatography tank|developing tank/, ["chromatography-tank"]],
  [/chromatography (paper|column)|tlc.*plate|silica gel/, ["chromatography-paper"]],
  [/capillary/, ["capillary-tube"]],
  [/spot plate/, ["spot-plate"]],
  [/spectrophotometer|colorimeter/, ["colorimeter", "cuvette"]],
  [/crucible/, ["crucible", "pipeclay-triangle", "crucible-tongs"]],
  [/pipeclay/, ["pipeclay-triangle"]],
  [/tripod/, ["tripod", "gauze"]],
  [/wash bottle/, ["wash-bottle"]],
  [/cotton wool/, ["cotton-wool"]],
  [/tongs|tweezers/, ["crucible-tongs"]],
  [/ice bath/, ["ice-bath"]],
  [/combustion tube/, ["combustion-tube"]],
  [/electrolytic cell|voltameter/, ["electrolytic-cell"]],
  [/graphite|carbon electrode/, ["carbon-electrode"]],
  [/sandpaper|emery/, ["sandpaper"]],
  [/salt bridges?/, ["salt-bridge"]],
  [/agar/, ["petri-agar"]],
  [/petri/, ["petri-dish"]],
  [/calorimeter can|copper (calorimeter )?can/, ["copper-can"]],
  [/calorimeter/, ["calorimeter-cup", "thermometer"]],
  [/draught shield|black paper shield/, ["draught-shield"]],
  [/spirit burner|spirit lamp/, ["spirit-lamp"]],
  [/data logger|digital sensors?/, ["data-logger"]],
  [/thistle funnel/, ["thistle-funnel"]],
  [/dropping funnel/, ["dropping-funnel"]],
  [/fractionating column/, ["fractionating-column"]],
  [/evaporating dish/, ["evap-dish"]],
  [/visking|dialysis/, ["visking-tubing"]],
  [/electrophoresis/, ["electrophoresis-tank"]],
  [/victor meyer/, ["victor-meyer"]],
  [/sample bulb|glass bulb/, ["sample-bulb"]],
  [/sealed (ground[- ]glass )?(glass )?tubes?/, ["sealed-tube"]],
  [/steam generator/, ["steam-generator"]],
  [/blender/, ["blender"]],
  [/cheesecloth|muslin/, ["cheesecloth"]],
  [/spooling rod/, ["spooling-rod"]],
  [/laser|torch/, ["laser-pointer"]],
  [/dark room|dark chamber/, ["dark-chamber"]],
  [/oven|hairdryer/, ["drying-oven"]],
  [/spray/, ["spray-bottle"]],
  [/led/, ["led-bulb"]],
  [/uv light|uv lamp|sunlight/, ["uv-lamp"]],
  [/magnet/, ["bar-magnet"]],
  [/spatula|scoopula/, ["spatula"]],
  [/desiccan?t|soda lime|guard tube/, ["desiccant-tube"]],
  [/goggles/, ["goggles"]],
];

/** Materials that are really reagents, data sources or samples, not glassware. */
const NON_APPARATUS =
  /acid|limewater|distilled water|boiled water|nitrate reagent|ferricyanide|phenolphthalein|peroxide|catalase|alumina|spinach|buffer|caco|reagent array|standard naoh|ethanol|media|masses of|calculator|reference (table|data)|thermodynamic|bond reference|data portal|profile$|template|electrolyte|oil layer|mystery gas|unknown/i;

export function resolveMaterial(material: string): string[] {
  const n = norm(material);
  const direct = BY_NAME.get(n);
  if (direct) return [direct];
  for (const [re, ids] of RULES) if (re.test(n)) return ids;
  return [];
}

/** Every apparatus item an experiment needs, de-duplicated and ordered. */
export function resolveApparatus(materials: string[]): ApparatusItem[] {
  const ids: string[] = [];
  for (const m of materials) for (const id of resolveMaterial(m)) if (!ids.includes(id)) ids.push(id);
  // universal PPE — every practical needs it
  for (const id of ["goggles", "lab-coat"]) if (!ids.includes(id)) ids.push(id);
  return ids.map((id) => BY_ID.get(id)).filter((a): a is ApparatusItem => !!a);
}

/** Materials the resolver could not map to apparatus — reagents/data are fine. */
export function unresolvedMaterials(materials: string[]): string[] {
  return materials.filter((m) => resolveMaterial(m).length === 0 && !NON_APPARATUS.test(m));
}

/** True when every reagent id the experiment names exists in the engine. */
export function missingChemicals(ids: string[]): string[] {
  return ids.filter((id) => !CHEMICAL_DATABASE[id]);
}