import { SyllabusExperiment } from "./experimentsCatalog";

export const EXPERIMENTS_21_35: SyllabusExperiment[] = [
  {
    id: 21,
    title: "Acid-Base Titration — Standard HCl vs NaOH",
    section: "Section 3: Titration & Volumetric Analysis",
    objective: "To determine the exact molar concentration of an unknown NaOH solution by titration against standard 0.1M HCl.",
    materials: ["Burette (50ml)", "Conical Flask (250ml)", "Pipette (25ml)", "White Tile", "Retort Stand"],
    requiredChemicalIds: ["hcl_dilute", "naoh_dilute", "phenolphthalein"],
    steps: [
      "Fill the 50ml burette with standard 0.1M HCl solution and adjust the meniscus to exactly 0.00 ml.",
      "Use the pipette to transfer exactly 25.0 ml of the unknown NaOH solution into the conical flask.",
      "Add 3 drops of Phenolphthalein indicator into the flask (solution turns beautiful magenta pink).",
      "Open the burette stopcock tap to drizzle HCl drops into the flask while continuously swirling.",
      "Stop the burette the split-second the magenta color completely vanishes to colorless and read the endpoint volume."
    ],
    expectedResult: "The Phenolphthalein indicator flips instantly from bright magenta to colorless at equivalence (typically 25.0 ml).",
    theoreticalEquation: "HCl(aq) + NaOH(aq) -> NaCl(aq) + H₂O(l) | C_acid * V_acid = C_base * V_base",
    dwsimProof: {
      reactionType: "Strong Acid - Strong Base Neutralization",
      deltaH: "-57.1 kJ/mol",
      equilibriumConstant: "K_w = 1.0 x 10⁻¹⁴",
      notes: "The pH drops incredibly steeply from ~11 to ~3 at equivalence. Phenolphthalein changes state precisely in the pH 8.2 - 10.0 window."
    }
  },
  {
    id: 22,
    title: "Acid-Base Titration — Sulfuric Acid vs NaOH",
    section: "Section 3: Titration & Volumetric Analysis",
    objective: "To find the molarity of dibasic sulfuric acid using standard sodium hydroxide and methyl orange indicator.",
    materials: ["Burette (50ml)", "Conical Flask (250ml)", "Pipette (25ml)", "White Tile"],
    requiredChemicalIds: ["h2so4_dilute", "naoh_dilute", "methyl_orange"],
    steps: [
      "Fill the burette with standard 0.1M NaOH solution.",
      "Pipette 25.0 ml of unknown H₂SO₄ into the conical flask.",
      "Add 3 drops of Methyl Orange indicator (the liquid turns bright red).",
      "Titrate with NaOH until the characteristic sharp color flip from red to yellow-orange occurs."
    ],
    expectedResult: "Methyl orange snaps flawlessly from red to an unmistakable yellow-orange equivalence point.",
    theoreticalEquation: "H₂SO₄ + 2NaOH -> Na₂SO₄ + 2H₂O | C_acid * V_acid * 2 = C_base * V_base",
    dwsimProof: {
      reactionType: "Dibasic Acid Neutralization",
      notes: "Requires exactly two moles of Sodium Hydroxide to fully neutralize one mole of dibasic sulfuric acid."
    }
  },
  {
    id: 23,
    title: "Back Titration — Percentage Purity of Limestone",
    section: "Section 3: Titration & Volumetric Analysis",
    objective: "To determine the exact percentage purity of calcium carbonate in an impure limestone sample via back titration.",
    materials: ["Burette", "Pipette", "Conical Flask", "Volumetric Flask (250ml)", "Analytical Balance"],
    requiredChemicalIds: ["caco3_solid", "hcl_dilute", "naoh_dilute", "phenolphthalein"],
    steps: [
      "Weigh exactly 2.50 grams of impure limestone and dissolve in 50.0 ml of 1.0M HCl (excess).",
      "Transfer the reacted mash into a 250ml volumetric flask and make up to the mark with distilled water.",
      "Pipette 25.0 ml portions into a conical flask and titrate unreacted unconsumed HCl against standard 0.1M NaOH."
    ],
    expectedResult: "The unreacted acid is quantified, allowing flawless calculation of the calcium carbonate consumed (typically ~92% pure).",
    theoreticalEquation: "CaCO₃ + 2HCl -> CaCl₂ + CO₂ + H₂O | Unreacted HCl + NaOH -> NaCl + H₂O",
    dwsimProof: {
      reactionType: "Indirect Gravimetric & Volumetric Quantification",
      notes: "Back titration is essential for solid carbonates that dissolve too slowly for direct end-point titration."
    }
  },
  {
    id: 24,
    title: "Permanganate Redox Titration (Fe²⁺ vs KMnO₄)",
    section: "Section 3: Titration & Volumetric Analysis",
    objective: "To determine the concentration of Iron(II) Sulfate solution by self-indicating redox titration with Potassium Permanganate.",
    materials: ["Burette (50ml)", "Conical Flask (250ml)", "Pipette (25ml)", "White Tile", "Retort Stand"],
    requiredChemicalIds: ["kmno4_sol", "feso4_sol", "h2so4_dilute"],
    steps: [
      "Fill the burette with brilliant purple 0.02M Potassium Permanganate (KMnO₄) solution.",
      "Pipette 25.0 ml of Iron(II) Sulfate (FeSO₄) into the conical flask and add 15 ml of dilute H₂SO₄ to highly acidify.",
      "Titrate the purple KMnO₄ from the burette into the flask with swirling.",
      "Initially, the purple drops disappear instantly upon touching the iron solution.",
      "Stop the tap the precise moment one single extra drop produces a permanent, delicate pale pink tint throughout the flask."
    ],
    expectedResult: "A permanent, beautiful pale rose pink endpoint is achieved without needing any external indicator.",
    theoreticalEquation: "MnO₄⁻ + 5Fe²⁺ + 8H⁺ -> Mn²⁺ + 5Fe³⁺ + 4H₂O",
    dwsimProof: {
      reactionType: "Redox Volumetric Analysis",
      nernstPotential: "E°_cell = 1.51V - 0.77V = +0.74V (Spontaneous overall)",
      notes: "Mn⁷⁺ (deep purple) is reduced to Mn²⁺ (almost colorless) by oxidizing five equivalents of Fe²⁺ to Fe³⁺."
    }
  },
  {
    id: 25,
    title: "Iodometric Titration of Copper(II) Ions",
    section: "Section 3: Titration & Volumetric Analysis",
    objective: "To determine Copper concentration by liberating iodine with Potassium Iodide and titrating with Sodium Thiosulfate.",
    materials: ["Burette (50ml)", "Conical Flask (250ml)", "Pipette (25ml)", "Retort Stand", "Stirring Rod"],
    requiredChemicalIds: ["cuso4_sol", "ki_solid", "na2s2o3_sol", "starch_sol"],
    steps: [
      "Pipette 25.0 ml of Copper(II) Sulfate solution into the conical flask.",
      "Add 2 grams of solid Potassium Iodide (KI) crystals and swirl. The solution turns muddy yellow-brown as free Iodine is liberated.",
      "Titrate with standard Sodium Thiosulfate (Na₂S₂O₃) from the burette until the liquid becomes a straw yellow color.",
      "Add 2ml of Starch indicator (the liquid instantly turns intense deep blue-black).",
      "Continue titrating dropwise until the blue-black color abruptly snaps to a creamy white precipitate of Copper(I) Iodide."
    ],
    expectedResult: "The deep blue-black starch-iodine complex decolorizes perfectly to leave a clean, milky white suspension of CuI.",
    theoreticalEquation: "2Cu²⁺ + 4I⁻ -> 2CuI↓ + I₂ | I₂ + 2S₂O₃²⁻ -> 2I⁻ + S₄O₆²⁻ (Tetrathionate)",
    dwsimProof: {
      reactionType: "Coupled Redox Iodometry",
      notes: "Starch traps linear polyiodide chains (I₅⁻) in its amylose helices, providing an exquisitely sharp visual threshold."
    }
  },
  {
    id: 26,
    title: "EDTA Complexometric Hard Water Titration",
    section: "Section 3: Titration & Volumetric Analysis",
    objective: "To quantify total calcium and magnesium water hardness using standard EDTA and Eriochrome Black T indicator.",
    materials: ["Burette", "Pipette (50ml)", "Conical Flask", "Buffer pH 10"],
    requiredChemicalIds: ["cacl2_sol", "edta_sol", "eriochrome_black_t", "nh3_dilute"],
    steps: [
      "Pipette 50.0 ml of hard water sample into the conical flask and add 5ml of ammonia buffer to secure pH 10.0.",
      "Add 3 drops of Eriochrome Black T indicator (the liquid turns Wine Red).",
      "Titrate with standard 0.01M EDTA solution with vigorous continuous swirling.",
      "Stop titrating exactly when the Wine Red hue snaps to a pure, flawless Sky Blue."
    ],
    expectedResult: "The wine red indicator chelate is completely displaced by EDTA, snapping instantly to pure blue.",
    theoreticalEquation: "Ca²⁺ + EDTA⁴⁻ -> [Ca-EDTA]²⁻ (Stable Chelate) | In-Ca (Wine Red) + EDTA -> [Ca-EDTA] + In (Blue)",
    dwsimProof: {
      reactionType: "Hexadentate Chelation Titration",
      notes: "EDTA forms an exceptionally stable 1:1 cage complex with divalent alkaline earth metals."
    }
  },
  {
    id: 27,
    title: "Determination of Water of Crystallization",
    section: "Section 3: Titration & Volumetric Analysis",
    objective: "To determine the exact hydration integer x in hydrated Copper(II) Sulfate crystals (CuSO₄·xH₂O) via thermal gravimetry.",
    materials: ["Crucible", "Pipeclay Triangle", "Tripod Stand", "Bunsen Burner", "Analytical Balance"],
    requiredChemicalIds: ["cuso4_sol"],
    steps: [
      "Weigh a perfectly dry crucible accurately.",
      "Add approximately 5.0 grams of bright blue hydrated copper sulfate crystals and reweigh.",
      "Heat the crucible gently, then strongly over a Bunsen burner for 10 minutes until all blue crystals turn pure white.",
      "Cool in a desiccator and reweigh to determine the exact gravimetric mass of evaporated steam."
    ],
    expectedResult: "Flawless mathematical extraction confirming exactly x = 5 moles of water per mole of copper sulfate.",
    theoreticalEquation: "CuSO₄·5H₂O(s, Royal Blue) --(Heat)--> CuSO₄(s, White) + 5H₂O↑",
    dwsimProof: {
      reactionType: "Thermal Dehydration Enthalpy",
      notes: "Mass loss perfectly matches the theoretical 36% water fraction by weight in blue vitriol."
    }
  },
  {
    id: 28,
    title: "Preparation of a Primary Standard Solution",
    section: "Section 3: Titration & Volumetric Analysis",
    objective: "To prepare a flawless, analytically pristine primary standard solution of 0.1M Sodium Carbonate.",
    materials: ["Analytical Balance", "Volumetric Flask (250ml)", "Beaker", "Glass Funnel", "Wash Bottle"],
    requiredChemicalIds: ["na2co3_sol"],
    steps: [
      "Compute exact mass required: 0.1M * 0.25L * 106.0 g/mol = 2.650 grams.",
      "Weigh exactly 2.650 grams of pure anhydrous Na₂CO₃ powder on an analytical balance.",
      "Dissolve in 100ml distilled water in a beaker, then quantitatively transfer into the 250ml volumetric flask via a funnel.",
      "Rinse the beaker three times into the flask, make up exactly to the meniscus line, stopper, and invert 15 times."
    ],
    expectedResult: "A perfectly reliable standard alkaline solution ready for high-precision laboratory titrations.",
    theoreticalEquation: "Molarity = Moles / Volume in Liters",
    dwsimProof: {
      reactionType: "Volumetric Primary Calibration",
      notes: "Anhydrous sodium carbonate is extremely stable, non-hygroscopic, and available in exceptionally high analytical purity."
    }
  },
  {
    id: 29,
    title: "Double Titration — Soda Ash Mixture Analysis",
    section: "Section 3: Titration & Volumetric Analysis",
    objective: "To determine the individual molar concentrations of Na₂CO₃ and NaHCO₃ in a blended mixture using two indicators.",
    materials: ["Burette", "Pipette", "Conical Flask"],
    requiredChemicalIds: ["na2co3_sol", "hcl_dilute", "phenolphthalein", "methyl_orange"],
    steps: [
      "Pipette 25.0 ml of the mixture into a flask and add Phenolphthalein indicator (pink).",
      "Titrate with standard HCl until pink vanishes to colorless and record volume V₁.",
      "Add Methyl Orange indicator to the exact same flask (liquid turns yellow).",
      "Continue titrating with HCl until the liquid turns red and record total volume V₂."
    ],
    expectedResult: "V₁ quantifies half the carbonate ($CO_3^{2-} \rightarrow HCO_3^-$). The difference ($V_2 - V_1$) quantifies total bicarbonate.",
    theoreticalEquation: "Na₂CO₃ + HCl -> NaHCO₃ + NaCl (Stage 1 V₁) | NaHCO₃ + HCl -> NaCl + CO₂ + H₂O (Stage 2)",
    dwsimProof: {
      reactionType: "Sequential Two-Stage Neutralization",
      notes: "Carbonate undergoes stepwise protonation at distinct pKa thresholds (pKa1 = 10.3, pKa2 = 6.3)."
    }
  },
  {
    id: 30,
    title: "Dichromate Redox Titration for Iron Content",
    section: "Section 3: Titration & Volumetric Analysis",
    objective: "To quantify iron in an ore sample using standard Potassium Dichromate and diphenylamine sulfonate indicator.",
    materials: ["Burette", "Pipette", "Conical Flask", "Phosphoric Acid"],
    requiredChemicalIds: ["k2cr2o7_sol", "feso4_sol", "h2so4_dilute", "h3po4_sol"],
    steps: [
      "Pipette 25.0 ml of Iron(II) solution into a flask, add 15ml dilute H₂SO₄ and 5ml Phosphoric acid (H₃PO₄).",
      "Add 4 drops of diphenylamine indicator.",
      "Titrate with standard K₂Cr₂O₇ from the burette until the liquid flips from green to a spectacular, deep Violet-Blue."
    ],
    expectedResult: "An incredibly sharp, beautiful permanent violet-blue equivalence snap is obtained.",
    theoreticalEquation: "Cr₂O₇²⁻ + 6Fe²⁺ + 14H⁺ -> 2Cr³⁺ (Green) + 6Fe³⁺ + 7H₂O",
    dwsimProof: {
      reactionType: "Catalyzed Redox Volumetric Assay",
      notes: "Phosphoric acid binds complexed Fe³⁺ as colorless phosphate ions, preventing the yellow ferric tint from obscuring the endpoint."
    }
  },
  {
    id: 31,
    title: "Conductimetric Titration — Monitoring Ions",
    section: "Section 3: Titration & Volumetric Analysis",
    objective: "To determine the exact equivalence point of an acid-base neutralization continuously using an electrical conductivity probe.",
    materials: ["Burette", "Beaker (250ml)", "Conductivity Meter", "Magnetic Stirrer"],
    requiredChemicalIds: ["hcl_dilute", "naoh_dilute"],
    steps: [
      "Pour 50.0 ml of 0.1M HCl into a beaker and submerge the digital conductivity probe.",
      "Add standard NaOH from a burette in 2ml increments, stirring steadily, and record electrical conductance.",
      "Plot Conductance versus Volume of NaOH added."
    ],
    expectedResult: "A wonderful V-shaped graph is formed. Conductance dips steeply to a sharp minimum at equivalence, then climbs upward.",
    theoreticalEquation: "H⁺ (high mobility) replaced by Na⁺ (lower mobility) prior to equivalence.",
    dwsimProof: {
      reactionType: "Electrolytic Ion Mobility Tracking",
      notes: "Protons possess exceptionally high ionic conductance due to rapid Grotthuss proton-hopping mechanisms."
    }
  },
  {
    id: 32,
    title: "Precipitation Titration — Mohr's Argentometric Method",
    section: "Section 3: Titration & Volumetric Analysis",
    objective: "To determine chloride ion concentration in drinking water by Silver Nitrate titration using potassium chromate indicator.",
    materials: ["Burette", "Pipette", "Conical Flask", "White Background"],
    requiredChemicalIds: ["nacl_sol", "agno3_sol", "k2cro4_sol"],
    steps: [
      "Pipette 25.0 ml of Chloride solution into a conical flask and add 1ml of bright yellow Potassium Chromate (K₂CrO₄).",
      "Titrate with standard 0.1M Silver Nitrate (AgNO₃) while swirling constantly.",
      "White AgCl precipitates continuously. Stop exactly when one extra drop produces a permanent Brick-Red precipitate of Silver Chromate."
    ],
    expectedResult: "The endpoint shows a magnificent permanent brick-red curdy hue against the white background.",
    theoreticalEquation: "Ag⁺ + Cl⁻ -> AgCl↓ (White) | 2Ag⁺ + CrO₄²⁻ -> Ag₂CrO₄↓ (Brick Red Endpoint)",
    dwsimProof: {
      reactionType: "Differential Solubility Precipitation",
      notes: "AgCl ($K_{sp} = 1.8 \times 10^{-10}$) precipitates preferentially before Ag₂CrO₄ ($K_{sp} = 1.1 \times 10^{-12}$) reaches its solubility threshold."
    }
  },
  {
    id: 33,
    title: "Determination of Ethanoic Acid Content in Commercial Vinegar",
    section: "Section 3: Titration & Volumetric Analysis",
    objective: "To determine the exact percentage concentration of ethanoic acid in vinegar by standard alkaline titration.",
    materials: ["Burette", "Pipette (25ml)", "Conical Flask", "Volumetric Flask (250ml)"],
    requiredChemicalIds: ["ethanoic_acid", "naoh_dilute", "phenolphthalein"],
    steps: [
      "Pipette exactly 25.0 ml of commercial vinegar into a 250ml volumetric flask and dilute to the mark with water.",
      "Pipette 25.0 ml of the diluted vinegar into a conical flask and add Phenolphthalein indicator.",
      "Titrate against standard 0.1M NaOH until a permanent pale magenta pink tint persists for 30 seconds."
    ],
    expectedResult: "Flawless volumetric validation confirming vinegar commercial strength (typically 5.0% ethanoic acid by weight).",
    theoreticalEquation: "CH₃COOH + NaOH -> CH₃COONa + H₂O | Mass % = (Molarity * 60.0 g/mol) / 10",
    dwsimProof: {
      reactionType: "Weak Acid - Strong Base Volumetric Analysis",
      notes: "The endpoint occurs in the basic range (pH ~8.8) due to hydrolysis of the sodium ethanoate salt."
    }
  },
  {
    id: 34,
    title: "Titration of Vitamin C (Ascorbic Acid Content)",
    section: "Section 3: Titration & Volumetric Analysis",
    objective: "To quantify the milligrams of Vitamin C in commercial tablets or fresh fruit juices via redox iodate titration.",
    materials: ["Burette", "Conical Flask", "Mortar and Pestle", "Pipette"],
    requiredChemicalIds: ["kio3_sol", "ki_solid", "hcl_dilute", "starch_sol"],
    steps: [
      "Crush a Vitamin C tablet in a mortar, dissolve in 100ml distilled water, and add 5ml dilute HCl and 1g KI crystals.",
      "Add 2ml of fresh Starch indicator solution.",
      "Titrate with standard Potassium Iodate (KIO₃) from the burette until the liquid suddenly flashes to permanent Blue-Black."
    ],
    expectedResult: "The liberated iodine is immediately reduced by Vitamin C until ascorbic acid runs out entirely, causing starch to turn blue-black instantly.",
    theoreticalEquation: "IO₃⁻ + 5I⁻ + 6H⁺ -> 3I₂ + 3H₂O | C₆H₈O₆ (Vitamin C) + I₂ -> C₆H₆O₆ (Dehydroascorbic Acid) + 2HI",
    dwsimProof: {
      reactionType: "Rapid Coupled Redox Iodometry",
      notes: "Ascorbic acid serves as an exceptionally fast, highly powerful organic antioxidant."
    }
  },
  {
    id: 35,
    title: "Advanced Conductimetric Weak Acid Titration",
    section: "Section 3: Titration & Volumetric Analysis",
    objective: "To track the precise conductimetric curve of a weak organic acid reacting with a strong alkali.",
    materials: ["Burette", "Conductivity Meter", "Beaker", "Magnetic Stirrer"],
    requiredChemicalIds: ["ethanoic_acid", "naoh_dilute"],
    steps: [
      "Pour 50.0 ml of 0.1M Ethanoic Acid into a beaker with a conductivity probe.",
      "Add standard NaOH from a burette in 1ml increments, stirring steadily, and record conductance.",
      "Graph Conductance versus Volume of NaOH added."
    ],
    expectedResult: "A beautiful, highly diagnostic curved profile. Initial conductance is extremely low, gently rising curves as highly ionized sodium ethanoate salt forms.",
    theoreticalEquation: "Formation of fully dissociated weak acid buffer salt.",
    dwsimProof: {
      reactionType: "Conductimetric Buffer Salt tracking",
      notes: "Unlike strong acids, weak ethanoic acid contributes exceptionally few free initial protons."
    }
  }
];
