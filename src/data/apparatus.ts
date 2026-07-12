// ChemVM apparatus database — full 55-item reference library.
// Physical + rendering properties for the matter.js bench and detail modal.

export type ApparatusShape =
  | "beaker" | "flask-conical" | "flask-round" | "flask-florence" | "flask-volumetric"
  | "test-tube" | "boiling-tube" | "cylinder" | "watch-glass" | "petri-dish"
  | "bottle" | "crucible" | "evap-dish" | "desiccator"
  | "pipette" | "burette" | "funnel" | "sep-funnel" | "buchner-funnel" | "buchner-flask"
  | "condenser" | "retort" | "rod"
  | "burner" | "tripod" | "gauze" | "hotplate" | "water-bath" | "tongs"
  | "stand" | "clamp" | "ring" | "rack"
  | "balance" | "thermometer" | "ph-meter" | "stopwatch"
  | "spatula" | "forceps" | "mortar" | "brush" | "paper"
  | "goggles" | "coat" | "gloves" | "fume-hood" | "extinguisher" | "eyewash";

export type ApparatusCategory =
  | "Containers & Vessels"
  | "Measuring & Liquid Transfer"
  | "Distillation & Specialised"
  | "Heating Equipment"
  | "Support Stands & Clamps"
  | "Measuring Instruments"
  | "Hand Tools"
  | "Safety Equipment";

export interface ApparatusItem {
  id: string;
  name: string;
  category: ApparatusCategory;
  shape: ApparatusShape;
  width: number;
  height: number;
  mass: number;        // g
  friction: number;    // 0..1
  restitution: number; // bounciness
  color: string;       // stroke / accent
  fill: string;        // liquid / body tint
  capacity?: string;
  tolerance?: string;
  usage: string;
  hazards?: string;
}

// palette shortcuts
const INK = "#3E4C7A";
const METAL = "#8892A6";
const DARK = "#232323";
const TEAL = "#7BD3D1";
const PURPLE = "#B39CE0";
const PEACH = "#F4A69B";
const BLUE = "#9EB4D6";
const AMBER = "#E6B15A";
const RED = "#E86A5C";
const WHITE = "#E7EAF2";

export const APPARATUS: ApparatusItem[] = [
  // ---- Containers & Vessels ----
  { id: "beaker", name: "Beaker", category: "Containers & Vessels", shape: "beaker",
    width: 90, height: 110, mass: 120, friction: 0.35, restitution: 0.15, color: INK, fill: TEAL,
    capacity: "50 – 2000 mL",
    usage: "General mixing, heating and approximate volume measurement (±5%)." },
  { id: "flask-conical", name: "Erlenmeyer (Conical) Flask", category: "Containers & Vessels", shape: "flask-conical",
    width: 90, height: 120, mass: 140, friction: 0.4, restitution: 0.12, color: INK, fill: PURPLE,
    capacity: "50 – 1000 mL",
    usage: "Swirling/mixing without splashing; titration receiving vessel; recrystallisation." },
  { id: "flask-round", name: "Round-Bottom Flask", category: "Containers & Vessels", shape: "flask-round",
    width: 90, height: 120, mass: 150, friction: 0.3, restitution: 0.25, color: INK, fill: TEAL,
    capacity: "50 – 5000 mL",
    usage: "Refluxing and distillation; even heat distribution over the curved surface." },
  { id: "flask-florence", name: "Florence (Boiling) Flask", category: "Containers & Vessels", shape: "flask-florence",
    width: 90, height: 130, mass: 160, friction: 0.35, restitution: 0.15, color: INK, fill: BLUE,
    capacity: "125 – 2000 mL",
    usage: "Boiling / distilling over direct flame or hot plate on a tripod." },
  { id: "flask-volumetric", name: "Volumetric (Graduated) Flask", category: "Containers & Vessels", shape: "flask-volumetric",
    width: 70, height: 150, mass: 180, friction: 0.4, restitution: 0.1, color: INK, fill: TEAL,
    capacity: "10 – 1000 mL", tolerance: "±0.1–0.3 mL",
    usage: "Preparing solutions of precisely known concentration." },
  { id: "test-tube", name: "Test Tube", category: "Containers & Vessels", shape: "test-tube",
    width: 26, height: 110, mass: 30, friction: 0.25, restitution: 0.3, color: INK, fill: PEACH,
    capacity: "15 – 20 mL",
    usage: "Small-scale reactions, qualitative tests, precipitate observation." },
  { id: "boiling-tube", name: "Boiling Tube", category: "Containers & Vessels", shape: "boiling-tube",
    width: 34, height: 130, mass: 60, friction: 0.3, restitution: 0.2, color: INK, fill: PEACH,
    capacity: "Ø 25–35 mm",
    usage: "Heating larger liquid volumes directly over a flame without cracking." },
  { id: "cylinder", name: "Graduated (Measuring) Cylinder", category: "Containers & Vessels", shape: "cylinder",
    width: 36, height: 170, mass: 180, friction: 0.4, restitution: 0.08, color: INK, fill: BLUE,
    capacity: "10 – 1000 mL", tolerance: "±1%",
    usage: "Measuring a specific liquid volume more precisely than a beaker." },
  { id: "watch-glass", name: "Watch Glass", category: "Containers & Vessels", shape: "watch-glass",
    width: 70, height: 20, mass: 40, friction: 0.3, restitution: 0.2, color: INK, fill: WHITE,
    capacity: "Ø 50 – 150 mm",
    usage: "Holding solids while weighing; covering a beaker; evaporating small samples." },
  { id: "petri-dish", name: "Petri Dish", category: "Containers & Vessels", shape: "petri-dish",
    width: 90, height: 24, mass: 60, friction: 0.35, restitution: 0.15, color: INK, fill: WHITE,
    capacity: "Ø 50 – 150 mm",
    usage: "Holding solids, growing crystals, evaporating small liquid volumes." },
  { id: "reagent-bottle", name: "Reagent (Storage) Bottle", category: "Containers & Vessels", shape: "bottle",
    width: 60, height: 120, mass: 220, friction: 0.4, restitution: 0.1, color: INK, fill: AMBER,
    capacity: "30 mL – 2.5 L",
    usage: "Long-term storage of reagents; amber for light-sensitive substances." },
  { id: "crucible", name: "Crucible (with lid)", category: "Containers & Vessels", shape: "crucible",
    width: 50, height: 60, mass: 90, friction: 0.55, restitution: 0.05, color: INK, fill: WHITE,
    capacity: "10 – 50 mL",
    usage: "Heating solids to very high temperatures — igniting, roasting, ashing.",
    hazards: "Extremely hot after use — handle with tongs only." },
  { id: "evap-dish", name: "Evaporating Dish", category: "Containers & Vessels", shape: "evap-dish",
    width: 80, height: 34, mass: 120, friction: 0.4, restitution: 0.1, color: INK, fill: WHITE,
    capacity: "Ø 60 – 150 mm",
    usage: "Evaporating solvent from a solution to leave a solid residue." },
  { id: "desiccator", name: "Desiccator", category: "Containers & Vessels", shape: "desiccator",
    width: 100, height: 90, mass: 500, friction: 0.5, restitution: 0.05, color: INK, fill: BLUE,
    capacity: "Ø 150 – 300 mm",
    usage: "Storing moisture-sensitive substances; cooling hot samples before weighing." },

  // ---- Measuring & Liquid Transfer ----
  { id: "pipette-vol", name: "Volumetric (Bulb) Pipette", category: "Measuring & Liquid Transfer", shape: "pipette",
    width: 20, height: 220, mass: 90, friction: 0.4, restitution: 0.08, color: INK, fill: TEAL,
    capacity: "1 – 50 mL", tolerance: "±0.02–0.06 mL",
    usage: "Transferring one precise, fixed volume of liquid." },
  { id: "pipette-mohr", name: "Graduated (Mohr) Pipette", category: "Measuring & Liquid Transfer", shape: "pipette",
    width: 16, height: 200, mass: 70, friction: 0.4, restitution: 0.08, color: INK, fill: TEAL,
    capacity: "1 – 10 mL", tolerance: "±1%",
    usage: "Delivering variable, adjustable volumes where extreme precision isn't essential." },
  { id: "pipette-pasteur", name: "Pasteur (Dropper) Pipette", category: "Measuring & Liquid Transfer", shape: "pipette",
    width: 14, height: 140, mass: 20, friction: 0.35, restitution: 0.1, color: INK, fill: PEACH,
    capacity: "≈0.05 mL/drop",
    usage: "Adding or removing small approximate quantities drop by drop." },
  { id: "burette", name: "Burette", category: "Measuring & Liquid Transfer", shape: "burette",
    width: 24, height: 220, mass: 260, friction: 0.5, restitution: 0.05, color: INK, fill: TEAL,
    capacity: "25 or 50 mL", tolerance: "±0.05 mL",
    usage: "Delivering precisely measured variable volumes of titrant." },
  { id: "filter-funnel", name: "Filter (Stem) Funnel", category: "Measuring & Liquid Transfer", shape: "funnel",
    width: 80, height: 90, mass: 90, friction: 0.35, restitution: 0.1, color: INK, fill: PURPLE,
    capacity: "Ø 50 – 150 mm",
    usage: "Gravity filtration; pouring liquids into narrow-necked containers." },
  { id: "sep-funnel", name: "Separating (Separatory) Funnel", category: "Measuring & Liquid Transfer", shape: "sep-funnel",
    width: 70, height: 160, mass: 220, friction: 0.4, restitution: 0.08, color: INK, fill: PURPLE,
    capacity: "60 – 2000 mL",
    usage: "Separating two immiscible liquids (liquid–liquid extraction)." },
  { id: "buchner-funnel", name: "Buchner Funnel", category: "Measuring & Liquid Transfer", shape: "buchner-funnel",
    width: 70, height: 90, mass: 180, friction: 0.5, restitution: 0.05, color: INK, fill: WHITE,
    capacity: "Ø 40 – 250 mm",
    usage: "Vacuum (suction) filtration — much faster than gravity filtration." },
  { id: "buchner-flask", name: "Buchner (Filter) Flask", category: "Measuring & Liquid Transfer", shape: "buchner-flask",
    width: 100, height: 130, mass: 260, friction: 0.4, restitution: 0.1, color: INK, fill: BLUE,
    capacity: "125 – 1000 mL",
    usage: "Collecting filtrate during vacuum filtration." },
  { id: "thistle-funnel", name: "Thistle Funnel", category: "Measuring & Liquid Transfer", shape: "funnel",
    width: 40, height: 180, mass: 80, friction: 0.35, restitution: 0.1, color: INK, fill: PURPLE,
    capacity: "≈30 cm long",
    usage: "Adding liquid reagents gradually into a closed reaction vessel." },

  // ---- Distillation & Specialised ----
  { id: "condenser", name: "Liebig Condenser", category: "Distillation & Specialised", shape: "condenser",
    width: 48, height: 200, mass: 320, friction: 0.5, restitution: 0.05, color: INK, fill: TEAL,
    capacity: "200 – 500 mm",
    usage: "Cooling and condensing vapour back to liquid during distillation/reflux." },
  { id: "retort", name: "Retort", category: "Distillation & Specialised", shape: "retort",
    width: 130, height: 90, mass: 300, friction: 0.4, restitution: 0.1, color: INK, fill: TEAL,
    capacity: "250 – 1000 mL",
    usage: "Simple distillation — vapour condenses down the curved neck into a receiver." },
  { id: "stirring-rod", name: "Stirring Rod", category: "Distillation & Specialised", shape: "rod",
    width: 10, height: 180, mass: 40, friction: 0.3, restitution: 0.2, color: INK, fill: WHITE,
    capacity: "150 – 300 mm",
    usage: "Manual stirring/mixing; guiding liquid during pouring." },
  { id: "wash-bottle", name: "Wash Bottle", category: "Distillation & Specialised", shape: "bottle",
    width: 60, height: 130, mass: 100, friction: 0.4, restitution: 0.15, color: INK, fill: TEAL,
    capacity: "250 – 1000 mL",
    usage: "Dispensing controlled jets of distilled water to rinse glassware." },

  // ---- Heating Equipment ----
  { id: "bunsen", name: "Bunsen Burner", category: "Heating Equipment", shape: "burner",
    width: 60, height: 140, mass: 400, friction: 0.7, restitution: 0.02, color: DARK, fill: PEACH,
    capacity: "15 – 20 cm tall",
    usage: "Standard direct-flame heat source; air hole controls flame type.",
    hazards: "Open flame up to 1500 °C — keep flammables away." },
  { id: "tripod", name: "Tripod Stand", category: "Heating Equipment", shape: "tripod",
    width: 90, height: 110, mass: 500, friction: 0.7, restitution: 0.02, color: METAL, fill: METAL,
    capacity: "≈15 cm tall",
    usage: "Supporting a vessel above a Bunsen flame at a safe height." },
  { id: "gauze", name: "Wire Gauze", category: "Heating Equipment", shape: "gauze",
    width: 90, height: 16, mass: 60, friction: 0.5, restitution: 0.05, color: METAL, fill: WHITE,
    capacity: "≈12–15 cm square",
    usage: "Spreading heat evenly across a beaker/flask base on a tripod." },
  { id: "hotplate", name: "Hot Plate / Magnetic Stirrer", category: "Heating Equipment", shape: "hotplate",
    width: 120, height: 60, mass: 1500, friction: 0.8, restitution: 0.02, color: DARK, fill: METAL,
    capacity: "≈15×15 – 20×20 cm",
    usage: "Flameless controllable heat, optional magnetic stirring." },
  { id: "water-bath", name: "Water Bath", category: "Heating Equipment", shape: "water-bath",
    width: 130, height: 70, mass: 2000, friction: 0.7, restitution: 0.02, color: METAL, fill: TEAL,
    capacity: "15 – 30 cm",
    usage: "Gentle, even, controlled sub-100°C heating." },
  { id: "crucible-tongs", name: "Crucible Tongs", category: "Heating Equipment", shape: "tongs",
    width: 100, height: 30, mass: 120, friction: 0.6, restitution: 0.1, color: METAL, fill: METAL,
    capacity: "20 – 30 cm",
    usage: "Safely moving hot crucibles or lids without hand contact." },

  // ---- Support Stands & Clamps ----
  { id: "retort-stand", name: "Retort Stand (Stand, Boss & Clamp)", category: "Support Stands & Clamps", shape: "stand",
    width: 90, height: 220, mass: 1200, friction: 0.8, restitution: 0.02, color: METAL, fill: DARK,
    capacity: "Rod height 40–90 cm",
    usage: "Central scaffolding supporting burettes, flasks, condensers, clamps." },
  { id: "burette-clamp", name: "Burette Clamp", category: "Support Stands & Clamps", shape: "clamp",
    width: 80, height: 30, mass: 100, friction: 0.6, restitution: 0.1, color: METAL, fill: DARK,
    capacity: "15 – 20 cm",
    usage: "Holding a burette firmly and vertically during titration." },
  { id: "iron-ring", name: "Iron (Support) Ring / Ring Clamp", category: "Support Stands & Clamps", shape: "ring",
    width: 90, height: 30, mass: 200, friction: 0.6, restitution: 0.05, color: METAL, fill: METAL,
    capacity: "Ø 5 – 15 cm",
    usage: "Supporting a funnel, beaker or gauze at adjustable height." },
  { id: "test-tube-rack", name: "Test Tube Rack", category: "Support Stands & Clamps", shape: "rack",
    width: 130, height: 50, mass: 200, friction: 0.6, restitution: 0.05, color: "#8B5A2B", fill: "#B7844C",
    capacity: "Holds 6–12 tubes",
    usage: "Storing and organising multiple upright test tubes on the bench." },
  { id: "test-tube-holder", name: "Test Tube Holder (Clamp)", category: "Support Stands & Clamps", shape: "clamp",
    width: 110, height: 26, mass: 80, friction: 0.5, restitution: 0.1, color: METAL, fill: METAL,
    capacity: "18 – 20 cm",
    usage: "Holding a test tube while heating it directly in a flame." },

  // ---- Measuring Instruments ----
  { id: "balance", name: "Analytical / Electronic Balance", category: "Measuring Instruments", shape: "balance",
    width: 140, height: 90, mass: 2500, friction: 0.9, restitution: 0.01, color: DARK, fill: WHITE,
    capacity: "0.1 mg – 0.01 g readability",
    usage: "Precisely measuring solid or liquid sample mass (tare-and-weigh)." },
  { id: "thermometer", name: "Thermometer", category: "Measuring Instruments", shape: "thermometer",
    width: 14, height: 180, mass: 40, friction: 0.3, restitution: 0.15, color: INK, fill: RED,
    capacity: "-10°C to 110/250°C",
    usage: "Measuring reaction, bath, or vapour temperature.",
    hazards: "Mercury thermometers are hazardous if broken — prefer alcohol/digital." },
  { id: "ph-meter", name: "pH Meter (with Electrode)", category: "Measuring Instruments", shape: "ph-meter",
    width: 100, height: 80, mass: 500, friction: 0.7, restitution: 0.05, color: DARK, fill: TEAL,
    capacity: "±0.01–0.1 pH units",
    usage: "Quantitative acidity/alkalinity measurement, more precise than indicator paper." },
  { id: "stopwatch", name: "Stopwatch / Timer", category: "Measuring Instruments", shape: "stopwatch",
    width: 60, height: 70, mass: 80, friction: 0.5, restitution: 0.2, color: DARK, fill: WHITE,
    capacity: "Readable to 0.01 s",
    usage: "Precisely timing reaction durations in kinetics experiments." },

  // ---- Hand Tools ----
  { id: "spatula", name: "Spatula", category: "Hand Tools", shape: "spatula",
    width: 120, height: 16, mass: 40, friction: 0.4, restitution: 0.15, color: METAL, fill: METAL,
    capacity: "15 – 20 cm",
    usage: "Scooping, transferring and levelling small solid quantities." },
  { id: "forceps", name: "Forceps / Tweezers", category: "Hand Tools", shape: "forceps",
    width: 100, height: 20, mass: 30, friction: 0.4, restitution: 0.15, color: METAL, fill: METAL,
    capacity: "10 – 15 cm",
    usage: "Picking up small solid objects without hand contact." },
  { id: "mortar-pestle", name: "Mortar and Pestle", category: "Hand Tools", shape: "mortar",
    width: 100, height: 70, mass: 600, friction: 0.7, restitution: 0.02, color: INK, fill: WHITE,
    capacity: "Ø 70 – 150 mm",
    usage: "Grinding and crushing solid chemicals into a fine powder." },
  { id: "scoopula", name: "Scoopula / Spoon-Spatula", category: "Hand Tools", shape: "spatula",
    width: 110, height: 22, mass: 40, friction: 0.4, restitution: 0.15, color: METAL, fill: METAL,
    capacity: "15 – 18 cm",
    usage: "Transferring larger quantities of granular/powdered solids." },
  { id: "test-tube-brush", name: "Test Tube Brush", category: "Hand Tools", shape: "brush",
    width: 130, height: 24, mass: 30, friction: 0.5, restitution: 0.2, color: METAL, fill: "#C9B27A",
    capacity: "20 – 30 cm",
    usage: "Cleaning the inside of test tubes and narrow glassware." },
  { id: "filter-paper", name: "Filter Paper", category: "Hand Tools", shape: "paper",
    width: 70, height: 70, mass: 5, friction: 0.6, restitution: 0.02, color: INK, fill: WHITE,
    capacity: "Ø 70 – 150 mm",
    usage: "Separating insoluble solids from liquid during filtration." },
  { id: "indicator-paper", name: "Universal Indicator / Litmus Paper", category: "Hand Tools", shape: "paper",
    width: 30, height: 90, mass: 3, friction: 0.6, restitution: 0.02, color: INK, fill: "#F0C674",
    capacity: "≈7×70 mm strips",
    usage: "Quick acid/neutral/alkaline test by colour comparison." },
  { id: "beaker-tongs", name: "Crucible / Beaker Tongs", category: "Hand Tools", shape: "tongs",
    width: 110, height: 32, mass: 140, friction: 0.6, restitution: 0.1, color: METAL, fill: METAL,
    capacity: "20 – 30 cm",
    usage: "Lifting and carrying hot beakers without hand contact." },

  // ---- Safety Equipment ----
  { id: "goggles", name: "Safety Goggles", category: "Safety Equipment", shape: "goggles",
    width: 100, height: 50, mass: 80, friction: 0.5, restitution: 0.2, color: DARK, fill: TEAL,
    capacity: "Fits over glasses",
    usage: "Protecting eyes from splashes, fumes and flying particles." },
  { id: "lab-coat", name: "Lab Coat", category: "Safety Equipment", shape: "coat",
    width: 90, height: 130, mass: 300, friction: 0.7, restitution: 0.02, color: INK, fill: WHITE,
    capacity: "Sizes XS–XXL",
    usage: "Protecting skin and clothing from spills and contamination." },
  { id: "gloves", name: "Chemical-Resistant Gloves", category: "Safety Equipment", shape: "gloves",
    width: 80, height: 90, mass: 60, friction: 0.6, restitution: 0.15, color: INK, fill: BLUE,
    capacity: "Sizes S–XL",
    usage: "Protecting skin from corrosive, toxic or irritant chemicals." },
  { id: "fume-hood", name: "Fume Hood (Fume Cupboard)", category: "Safety Equipment", shape: "fume-hood",
    width: 160, height: 130, mass: 5000, friction: 0.9, restitution: 0.01, color: METAL, fill: WHITE,
    capacity: "1.2 – 1.8 m wide",
    usage: "Containing and extracting toxic or flammable fumes." },
  { id: "extinguisher", name: "Fire Extinguisher", category: "Safety Equipment", shape: "extinguisher",
    width: 50, height: 130, mass: 4000, friction: 0.7, restitution: 0.05, color: DARK, fill: RED,
    capacity: "30 – 60 cm tall",
    usage: "Suppressing small fires — type must match the fire class." },
  { id: "eyewash", name: "Eyewash Station", category: "Safety Equipment", shape: "eyewash",
    width: 110, height: 100, mass: 1500, friction: 0.8, restitution: 0.02, color: METAL, fill: TEAL,
    capacity: "Ø 20 – 25 cm basin",
    usage: "Emergency 15-minute eye flushing after chemical contact." },
];

export const CATEGORIES: ApparatusCategory[] = [
  "Containers & Vessels",
  "Measuring & Liquid Transfer",
  "Distillation & Specialised",
  "Heating Equipment",
  "Support Stands & Clamps",
  "Measuring Instruments",
  "Hand Tools",
  "Safety Equipment",
];
