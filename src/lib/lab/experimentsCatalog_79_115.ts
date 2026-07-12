import { SyllabusExperiment } from "./experimentsCatalog";

export const EXPERIMENTS_79_115: SyllabusExperiment[] = [
  // --- SECTION 8: GAS PREPARATIONS AND TESTS (79 - 88) ---
  {
    id: 79,
    title: "Laboratory Preparation of Carbon Dioxide Gas",
    section: "Section 8: Gas Preparations & Tests",
    objective: "To prepare pure carbon dioxide gas from calcium carbonate and verify its density and fire-extinguishing capability.",
    materials: ["Conical Flask", "Thistle Funnel", "Delivery Tube", "Gas Jars", "Candle / Splint"],
    requiredChemicalIds: ["caco3_solid", "hcl_dilute", "limewater"],
    steps: [
      "Place 20 grams of marble chips (CaCO₃) into the flask and secure the thistle funnel assembly.",
      "Pour dilute Hydrochloric Acid through the funnel to submerge the marble chips.",
      "Collect the evolved heavy CO₂ gas by downward displacement of air in a gas jar.",
      "Pour the invisible dense gas directly over a burning candle flame and watch it get snuffed out instantly!"
    ],
    expectedResult: "Vigorous bubbling occurs. The dense CO₂ gas successfully pools at the bottom of containers, puts out flames instantly, and turns limewater milky.",
    theoreticalEquation: "CaCO₃(s) + 2HCl(aq) -> CaCl₂(aq) + H₂O(l) + CO₂↑",
    dwsimProof: {
      reactionType: "Acid-Carbonate Gas Generation",
      notes: "CO₂ has a molar mass of 44 g/mol (approximately 1.5 times heavier than ambient air at ~29 g/mol), allowing it to be poured like an invisible liquid."
    }
  },
  {
    id: 80,
    title: "Laboratory Preparation of Oxygen Gas",
    section: "Section 8: Gas Preparations & Tests",
    objective: "To prepare pure oxygen gas by catalytic decomposition of hydrogen peroxide and test its incredible combustion support.",
    materials: ["Conical Flask", "Delivery Tube", "Water Trough", "Gas Jars", "Glowing Splint"],
    requiredChemicalIds: ["h2o2_sol", "mno2_solid"],
    steps: [
      "Place a spatula of black Manganese Dioxide (MnO₂) powder into the flask.",
      "Slowly drizzle in 50ml Hydrogen Peroxide solution.",
      "Collect evolved oxygen gas by downward displacement of water.",
      "Plunge a glowing wooden wooden splint inside the gathered gas jar."
    ],
    expectedResult: "Furious rapid effervescence. The glowing splint instantly relights with a magnificent burst of brilliant golden flame.",
    theoreticalEquation: "2H₂O₂(aq) --(MnO₂ Catalyst)--> 2H₂O(l) + O₂↑",
    dwsimProof: {
      reactionType: "Catalyzed Disproportionation Volumetry",
      notes: "Oxygen is slightly soluble in water, allowing easy downward displacement gathering over water troughs."
    }
  },
  {
    id: 81,
    title: "Laboratory Preparation of Pure Hydrogen Gas",
    section: "Section 8: Gas Preparations & Tests",
    objective: "To prepare pure pure hydrogen gas by reacting active zinc metal with dilute sulfuric acid.",
    materials: ["Conical Flask", "Delivery Tube", "Water Trough", "Gas Syringe", "Burning Splint"],
    requiredChemicalIds: ["zn_solid", "h2so4_dilute"],
    steps: [
      "Place 15 grams of pure Zinc granules into the conical flask.",
      "Add 50ml of dilute Sulfuric Acid and immediately seal the flask with a delivery tube leading into a water trough.",
      "Collect the evolving lightweight Hydrogen gas by downward displacement of water.",
      "Hold a test tube of the gathered gas upside down and apply a burning wooden splint."
    ],
    expectedResult: "Rapid fizzing occurs. The gathered gas ignites with an unmistakable, incredibly satisfying sharp 'squeaky pop' sound.",
    theoreticalEquation: "Zn(s) + H₂SO₄(aq) -> ZnSO₄(aq) + H₂↑",
    dwsimProof: {
      reactionType: "Single Displacement Redox",
      nernstPotential: "E° = +0.76 V (Spontaneous reduction of protons by metallic zinc)",
      notes: "Hydrogen has a molar mass of only 2 g/mol, making it the lightest gas in the universe."
    }
  },
  {
    id: 82,
    title: "Laboratory Preparation of Ammonia Gas",
    section: "Section 8: Gas Preparations & Tests",
    objective: "To prepare pungent, highly soluble alkaline ammonia gas from ammonium salts and prove it turns red litmus blue.",
    materials: ["Hard Glass Flask", "Cotton Wool Plug", "Damp Red Litmus Paper", "Concentrated HCl Bottle"],
    requiredChemicalIds: ["nh4cl_sol", "limewater", "hcl_conc"],
    steps: [
      "Combine solid Ammonium Chloride with Calcium Hydroxide in a hard glass flask.",
      "Heat gently over a Bunsen burner.",
      "Collect lightweight evolving ammonia gas by upward displacement of air.",
      "Test with damp red litmus paper, then bring an open bottle of concentrated HCl near the gas mouth."
    ],
    expectedResult: "Pungent ammonia gas turns damp red litmus purely blue. Contact with HCl vapors creates dense white smoke clouds of solid Ammonium Chloride.",
    theoreticalEquation: "2NH₄Cl + Ca(OH)₂ -> CaCl₂ + 2H₂O + 2NH₃↑ | NH₃(g) + HCl(g) -> NH₄Cl(s, White Fumes)",
    dwsimProof: {
      reactionType: "Base Displacement Gas Evolution",
      notes: "Ammonia is less dense than ambient air and exceptionally soluble in water, necessitating collection by upward displacement of air."
    }
  },
  {
    id: 83,
    title: "Laboratory Preparation of Pure Chlorine Gas",
    section: "Section 8: Gas Preparations & Tests",
    objective: "To prepare pungent yellow-green halogen gas by oxidizing concentrated hydrochloric acid with manganese dioxide.",
    materials: ["Round Bottom Flask", "Fume Cupboard Assembly", "Damp Blue Litmus Paper"],
    requiredChemicalIds: ["mno2_solid", "hcl_conc", "cl2_gas"],
    steps: [
      "Place solid Manganese Dioxide powder into a flask with a dropping funnel in a fume cupboard.",
      "Carefully drizzle in concentrated 12M Hydrochloric Acid and warm gently.",
      "Collect evolved yellow-green chlorine gas in dry gas jars.",
      "Submerge damp blue litmus paper into the pungent green gas."
    ],
    expectedResult: "A spectacular greenish-yellow gas fills the jar. It instantly turns damp blue litmus red (acidic) and then bleaches it purely white.",
    theoreticalEquation: "MnO₂ + 4HCl(conc) -> MnCl₂ + 2H₂O + Cl₂↑",
    dwsimProof: {
      reactionType: "Halide Redox Oxidation",
      notes: "Chlorine is highly toxic, completely mandatory to execute inside certified laboratory fume hoods."
    }
  },
  {
    id: 84,
    title: "Laboratory Preparation of Hydrogen Chloride Gas",
    section: "Section 8: Gas Preparations & Tests",
    objective: "To prepare highly soluble, strongly acidic hydrogen chloride gas by reacting table salt with concentrated sulfuric acid.",
    materials: ["Round Bottom Flask", "Dropping Funnel", "Gas Jars", "Silver Nitrate Reagent"],
    requiredChemicalIds: ["nacl_sol", "h2so4_conc", "agno3_sol"],
    steps: [
      "Place solid Sodium Chloride powder in a dry flask inside a fume cupboard.",
      "Drizzle concentrated H₂SO₄ onto the salt and collect evolved HCl gas by downward displacement of air.",
      "Dissolve the gas in water and test with Silver Nitrate solution."
    ],
    expectedResult: "Steamy acidic fumes evolve. Dissolving in water yields strong Hydrochloric Acid that instantly precipitates curdy white AgCl.",
    theoreticalEquation: "NaCl + H₂SO₄(conc) -> NaHSO₄ + HCl↑ (Steamy Acid Fumes)",
    dwsimProof: {
      reactionType: "Volatile Acid Displacement",
      notes: "Concentrated sulfuric acid possesses an immeasurably lower vapor pressure than volatile hydrogen chloride."
    }
  },
  {
    id: 85,
    title: "Laboratory Preparation of Sulfur Dioxide Gas",
    section: "Section 8: Gas Preparations & Tests",
    objective: "To prepare dense, strongly reducing sulfur dioxide gas by reacting copper turnings with hot concentrated sulfuric acid.",
    materials: ["Round Bottom Flask", "Bunsen Burner", "Fume Hood Portal", "K₂Cr₂O₇ Indicator Paper"],
    requiredChemicalIds: ["cu_solid", "h2so4_conc", "so2_gas", "k2cr2o7_sol"],
    steps: [
      "Add concentrated H₂SO₄ to metallic Copper turnings inside a flask.",
      "Roast strongly over a Bunsen burner.",
      "Collect evolved choking gas and test with moist Potassium Dichromate indicator paper."
    ],
    expectedResult: "Choking sulfurous gas bubbles off, turning orange dichromate indicator paper a vivid, beautiful emerald green.",
    theoreticalEquation: "Cu(s) + 2H₂SO₄(conc) --(Heat)--> CuSO₄(aq) + 2H₂O + SO₂↑",
    dwsimProof: {
      reactionType: "Hot Concentrated Sulfuric Acid Oxidation",
      notes: "Unlike dilute sulfuric acid, the concentrated fuming acid acts as an exceptionally powerful oxidizing agent."
    }
  },
  {
    id: 86,
    title: "Laboratory Preparation of Nitrogen Dioxide Gas",
    section: "Section 8: Gas Preparations & Tests",
    objective: "To prepare magnificent, incredibly toxic Reddish-Brown nitrogen dioxide gas by reacting copper with concentrated nitric acid.",
    materials: ["Round Bottom Flask", "Fume Hood Setup", "Gas Collection Jars"],
    requiredChemicalIds: ["cu_solid", "hno3_dilute", "no2_gas"],
    steps: [
      "Carefully add concentrated Nitric Acid to pure Copper turnings in a flask inside a fume cupboard.",
      "Observe an instantaneous furious eruption of steamy Reddish-Brown toxic gas.",
      "Capture in gas jars and demonstrate its exceptionally rapid dissolution in water to make nitric acid."
    ],
    expectedResult: "An intense, dense reddish-brown gas erupts instantly, turning water highly acidic.",
    theoreticalEquation: "Cu(s) + 4HNO₃(conc) -> Cu(NO₃)₂ + 2H₂O + 2NO₂↑ (Reddish-Brown Gas)",
    dwsimProof: {
      reactionType: "Powerful Nitric Acid Oxidative Cleavage",
      notes: "Nitrogen dioxide is deeply colored and acts as a dangerous pulmonary irritant."
    }
  },
  {
    id: 87,
    title: "Comprehensive Gas Identification Master Review",
    section: "Section 8: Gas Preparations & Tests",
    objective: "To execute multi-gas diagnostic matrix profiling across six unlabelled mystery gas jars.",
    materials: ["Six Unknown Mystery Gas Jars", "Bunsen Burner", "Limewater", "Litmus Paper", "Splints"],
    requiredChemicalIds: ["h2_gas", "o2_gas", "co2_gas", "cl2_gas", "h2s_gas", "so2_gas"],
    steps: [
      "Inspect visible colors: Yellow-green = Cl₂; Red-brown = NO₂; Colorless = H₂, O₂, CO₂, SO₂, H₂S.",
      "Execute targeted splint assays, limewater routines, and indicator strip arrays systematically."
    ],
    expectedResult: "Flawless deductive multi-gas assignment identifying every unknown perfectly.",
    theoreticalEquation: "Multivariate Qualitative Elimination Algorithms",
    dwsimProof: {
      reactionType: "Systematic Multi-Gas Profiling",
      notes: "Combines unique physical densities with selective combustion and chemical affinity thresholds."
    }
  },
  {
    id: 88,
    title: "Preparation of Hydrogen Sulfide (Teacher Fume Demonstration)",
    section: "Section 8: Gas Preparations & Tests",
    objective: "To prepare highly toxic, foul-smelling H₂S gas and prove it instantly turns lead acetate paper pitch black.",
    materials: ["Kipp's Generator / Fume Assembly", "Lead Acetate Test Strip", "Dilute HCl"],
    requiredChemicalIds: ["fe_solid", "hcl_dilute", "h2s_gas"],
    steps: [
      "Place solid Iron(II) Sulfide (FeS) lumps into a Kipp's generator in an active fume cupboard.",
      "Pour in dilute Hydrochloric Acid and capture evolved rotten-egg smelling gas.",
      "Expose a strip of damp Lead Acetate indicator paper to the escaping vapor."
    ],
    expectedResult: "The white test strip turns instantly, flawlessly pitch black as highly stable Lead Sulfide precipitates.",
    theoreticalEquation: "FeS + 2HCl -> FeCl₂ + H₂S↑ | Pb(CH₃COO)₂ + H₂S -> PbS↓ (Pitch Black Precipitate) + 2CH₃COOH",
    dwsimProof: {
      reactionType: "Acid-Sulfide Sulfide Displacement",
      notes: "Lead sulfide possesses an exceptionally low solubility product, providing a flawless diagnostic threshold."
    }
  },

  // --- SECTION 9: SEPARATION TECHNIQUES (89 - 96) ---
  {
    id: 89,
    title: "Simple Distillation of Salt Water",
    section: "Section 9: Separation Techniques",
    objective: "To separate and recover pure potable distilled water from a concentrated salt solution.",
    materials: ["Round Bottom Flask", "Liebig Condenser", "Bunsen Burner", "Thermometer", "Receiving Beaker"],
    requiredChemicalIds: ["nacl_sol", "agno3_sol"],
    steps: [
      "Pour 100ml of salty water into the round bottom flask.",
      "Connect the Liebig condenser and circulate cold tap water from the bottom inlet to the top outlet.",
      "Heat the flask steadily with a Bunsen burner until the liquid boils and watch the thermometer lock at 100 °C.",
      "Collect the crystal-clear condensed drops in the receiver beaker and confirm absence of chloride with AgNO₃."
    ],
    expectedResult: "Pure, colorless condensed distilled water collects in the receiving beaker. All salt remains trapped behind in the boiling flask.",
    theoreticalEquation: "H₂O(l, Salty Mash) --(Boiling at 100°C)--> H₂O(g, Steam) --(Cold Condensation)--> H₂O(l, Pure Distillate)",
    dwsimProof: {
      reactionType: "Thermodynamic Vaporization & Condensation",
      notes: "The non-volatile dissolved salt ions have an immeasurably low vapor pressure, allowing flawless 100% thermal separation."
    }
  },
  {
    id: 90,
    title: "Fractional Distillation of Miscible Ethanol-Water Mixtures",
    section: "Section 9: Separation Techniques",
    objective: "To separate miscible liquids with different boiling points using a packed fractionating column.",
    materials: ["Round Bottom Flask", "Fractionating Column packed with glass rings", "Liebig Condenser", "Thermometer"],
    requiredChemicalIds: ["ethanol"],
    steps: [
      "Set up full fractional distillation apparatus with a packed fractionating column.",
      "Add a 50:50 mixture of ethanol and water, heat slowly, and observe thermometer plateaus.",
      "Collect Fraction 1 exactly at 78 °C (pure ethanol) versus Fraction 2 at 100 °C (pure water)."
    ],
    expectedResult: "Exceptional multi-stage vapor-liquid enrichment in the packed column separates the mixture beautifully into 95% ethanol and pure water.",
    theoreticalEquation: "Multi-stage Theoretical Rayleigh Distillation Trays",
    dwsimProof: {
      reactionType: "Packed Column Theoretical Plate Separation",
      notes: "Repeated cycles of condensation and revaporization on the glass beads enrich the ascending steams in the more volatile ethanol component."
    }
  },
  {
    id: 91,
    title: "Liquid-Liquid Extraction using a Ground Glass Separating Funnel",
    section: "Section 9: Separation Techniques",
    objective: "To extract dissolved iodine from water into an immiscible organic solvent (Hexane) where it has greater solubility.",
    materials: ["Ground Glass Separating Funnel", "Retort Stand", "Beakers"],
    requiredChemicalIds: ["iodine_sol", "hexane"],
    steps: [
      "Pour 50ml of aqueous iodine solution (brown) into a separating funnel.",
      "Add 50ml of pure Hexane (colorless).",
      "Stopper firmly, invert, and shake gently, opening the stopcock regularly to release pressure.",
      "Let settle into two separate layers (Hexane floats on water) and drain off the bottom aqueous layer."
    ],
    expectedResult: "The top Hexane layer acquires an exceptionally spectacular deep Violet/Purple color as iodine preferentially transfers into it. The bottom water layer becomes almost colorless.",
    theoreticalEquation: "Partition Coefficient K_p = [I₂]in Hexane / [I₂]in Water >> 1",
    dwsimProof: {
      reactionType: "Liquid-Liquid Organic Extraction",
      notes: "Non-polar molecular iodine is much more soluble in non-polar organic solvents than in highly polar water."
    }
  },
  {
    id: 92,
    title: "Purification of Impure Copper Sulfate via Hot Recrystallization",
    section: "Section 9: Separation Techniques",
    objective: "To purify crude contaminated Copper(II) Sulfate crystals by dissolving in hot solvent and cooling slowly.",
    materials: ["Beaker", "Evaporating Dish", "Filter Funnel", "Filter Paper", "Watch Glass"],
    requiredChemicalIds: ["cuso4_sol"],
    steps: [
      "Dissolve impure CuSO₄ in a minimum volume of boiling distilled water.",
      "Filter the hot solution quickly to trap insoluble sand sediment on the filter paper.",
      "Allow the highly saturated filtrate to cool exceptionally slowly in an evaporating dish.",
      "Watch magnificent, flawless pure royal blue crystal gems grow as the liquid cools."
    ],
    expectedResult: "Pristine, spectacular large blue crystals of pure CuSO₄·5H₂O precipitate out. Soluble impurities remain locked in the cold mother liquor.",
    theoreticalEquation: "Solubility S(T) climbs immensely steeply with boiling temperature transitions.",
    dwsimProof: {
      reactionType: "Thermal Saturation Recrystallization",
      notes: "Cooling slowly provides ideal conditions for highly ordered crystal packing self-assembly."
    }
  },
  {
    id: 93,
    title: "Solvent Extraction and Thin Layer Chromatography (TLC) of Plant Pigments",
    section: "Section 9: Separation Techniques",
    objective: "To separate complex photosynthetic green leaf pigments (Carotenes, Xanthophylls, Chlorophylls) on a silica gel TLC plate.",
    materials: ["TLC Silica Gel Plates", "TLC Developing Tank", "Mortar and Pestle", "Capillary Tubes", "Spinach Leaves"],
    requiredChemicalIds: ["ethanol", "hexane"],
    steps: [
      "Grind fresh green spinach leaves in pure ethanol/propanone to extract rich green photosynthetic pigments.",
      "Spot the green extract onto a pencil line on a silica gel TLC plate.",
      "Develop in an enclosed tank using a 9:1 organic petroleum ether:propanone mixture.",
      "Inspect the separated multi-colored spots under UV and daylight."
    ],
    expectedResult: "Separates flawlessly into 4 distinct colorful dots: Carotene (Yellow-Orange, top), Xanthophyll (Yellow), Chlorophyll a (Blue-Green), and Chlorophyll b (Olive Green, bottom).",
    theoreticalEquation: "Rf values mapped against standard TLC silica reference libraries.",
    dwsimProof: {
      reactionType: "Adsorption Thin Layer Chromatography",
      notes: "Polar chlorophylls adsorb tightly to polar silica gel, migrating slowly compared to highly non-polar carotenes."
    }
  },
  {
    id: 94,
    title: "Column Chromatography Multi-Dye Separation",
    section: "Section 9: Separation Techniques",
    objective: "To separate a blended mixture of laboratory laboratory running them through a vertical packed silica column.",
    materials: ["Glass Chromatography Column / Burette", "Silica Gel stationary phase", "Beakers"],
    requiredChemicalIds: ["methyl_orange", "universal_indicator"],
    steps: [
      "Pack a vertical glass burette with a smooth slurry of silica gel in organic solvent.",
      "Carefully pipette a mixed layer of Methyl Orange and Universal Indicator onto the flat top sand layer.",
      "Drizzle mobile solvent continuously through the column and watch colored rings separate as they travel downward.",
      "Collect the separated colored pure liquid fractions individually in separate beakers."
    ],
    expectedResult: "The mixed dyes separate into perfectly distinct yellow, orange, and blue descending bands that elute out the bottom tap at different speeds.",
    theoreticalEquation: "Preparative Elution Chromatographic Enrichment",
    dwsimProof: {
      reactionType: "Preparative Packed Column Chromatography",
      notes: "Exceptional analytical utility for scaling up the isolation of pure organic reaction products."
    }
  },
  {
    id: 95,
    title: "Paper Chromatography of Free Amino Acid Mixtures",
    section: "Section 9: Separation Techniques",
    objective: "To separate invisible amino acid mixtures on paper and visualize them by spraying with Ninhydrin developer.",
    materials: ["Chromatography Paper Strip", "Ninhydrin Spray Reagent", "Oven / Hairdryer Profile", "Ruler"],
    requiredChemicalIds: ["ninhydrin_sol", "ethanol"],
    steps: [
      "Spot a mixed sample of invisible Glycine, Alanine, and Leucine onto a baseline.",
      "Develop the paper in an organic solvent tank until the liquid rises near the top.",
      "Dry the paper completely, spray evenly with Ninhydrin solution, and blast with warm heat for 3 minutes."
    ],
    expectedResult: "The completely invisible baseline dots magically appear as spectacular, highly distinct purple spots at specific Rf migration coordinates.",
    theoreticalEquation: "Ruhemann's Purple complexation at distinct paper partition coordinates.",
    dwsimProof: {
      reactionType: "Reactive Visualized Paper Chromatography",
      notes: "Exceptional proof of partition chromatography tracking organic biochemical residues."
    }
  },
  {
    id: 96,
    title: "Separation of Charged Biochemical Particles via Gel Electrophoresis",
    section: "Section 9: Separation Techniques",
    objective: "To demonstrate how applying a high-voltage DC electric field separates charged amino acids and DNA fragments.",
    materials: ["Electrophoresis Tank / U-Tube", "Buffer Media", "High-Voltage DC Power Portal (100V)"],
    requiredChemicalIds: ["ninhydrin_sol"],
    steps: [
      "Soak a porous gel strip or specialized filter paper in standard pH buffer.",
      "Spot the mixed charged biochemical sample into the center.",
      "Hook up the positive Anode (+) and negative Cathode (-) leads and apply 100V DC for 45 minutes.",
      "Visualize migration paths."
    ],
    expectedResult: "Positively charged cations migrate cleanly toward the negative Cathode (-). Negatively charged anions migrate toward the Anode (+). Neutral zwitterions remain at the center.",
    theoreticalEquation: "Electrophoretic Mobility directly proportional to Net Electrical Charge and Voltage Gradient.",
    dwsimProof: {
      reactionType: "High-Voltage Gel Electrophoresis",
      notes: "Fundamental analytical protocol powering modern forensic DNA fingerprinting and protein blood typing."
    }
  },

  // --- SECTION 10: PHYSICAL CHEMISTRY (97 - 110) ---
  {
    id: 97,
    title: "Determination of Molar Mass by Victor Meyer Vapor Volumetry",
    section: "Section 10: Physical Chemistry",
    objective: "To determine the exact molar mass of a volatile organic liquid by vaporizing it to displace an equal air volume.",
    materials: ["Victor Meyer Heating Apparatus", "Sealed Glass Sample Bulb", "Gas Collection Assembly", "Analytical Balance"],
    requiredChemicalIds: ["hexane"],
    steps: [
      "Weigh a sealed fragile glass bulb containing a volatile liquid (e.g. Hexane) accurately on an analytical balance.",
      "Drop the sample bulb inside a Victor Meyer tube jacketed by boiling water.",
      "The fragile bulb bursts, sample vaporizes instantly, and pushes an equivalent volume of air into a measuring cylinder over water.",
      "Measure actual displaced air volume and calculate exact molar mass using the ideal gas law."
    ],
    expectedResult: "The actual mass and vaporized volume flawlessly calculate the true organic molar mass ($M = \frac{m \cdot R \cdot T}{P \cdot V}$).",
    theoreticalEquation: "PV = nRT | Molar Mass M = (mass of sample * R * absolute Temperature) / (Pressure * Volume)",
    dwsimProof: {
      reactionType: "Ideal Gas Law Volumetry Core",
      notes: "Flawless experimental proof confirming ideal gas behavior for volatile organic vapors."
    }
  },
  {
    id: 98,
    title: "Demonstration of Osmosis Across a Semi-Permeable Dialysis Membrane",
    section: "Section 10: Physical Chemistry",
    objective: "To observe water migrating against gravity into a concentrated sugar solution across a Visking dialysis membrane.",
    materials: ["Visking Dialysis Tubing", "Glass Capillary Tube", "Ruler", "Stopwatch", "Beaker"],
    requiredChemicalIds: ["sucrose_sol", "benedicts_sol"],
    steps: [
      "Tie one end of a Visking dialysis tube tightly and fill with concentrated sucrose solution containing red food color.",
      "Secure a tall vertical glass capillary tube to the open end and submerge the pouch in a beaker of pure distilled water.",
      "Mark initial liquid height in the capillary tube and observe every 10 minutes for an hour."
    ],
    expectedResult: "The red liquid column steadily, spectacularly climbs upward inside the capillary tube as water molecules enter the pouch by osmosis.",
    theoreticalEquation: "Osmotic Pressure Pi = Molarity * R * Temperature in Kelvin",
    dwsimProof: {
      reactionType: "Semi-Permeable Membrane Osmotic Migration",
      notes: "Water molecules diffuse spontaneously from regions of high water chemical potential (pure water) to regions of low water chemical potential (sugar mash)."
    }
  },
  {
    id: 99,
    title: "Determination of the Partition Coefficient of Iodine",
    section: "Section 10: Physical Chemistry",
    objective: "To find the exact partition equilibrium constant ($K_{eq}$) for iodine distributing between aqueous and organic solvents.",
    materials: ["Ground Glass Separating Funnel", "Burette Systems", "Conical Flasks"],
    requiredChemicalIds: ["iodine_sol", "hexane", "na2s2o3_sol", "starch_sol"],
    steps: [
      "Combine iodine, distilled water, and pure Hexane in a separating funnel and shake vigorously until dynamic partition equilibrium is reached.",
      "Drain and separate the aqueous layer from the organic Hexane layer.",
      "Titrate both layers separately against standard Sodium Thiosulfate to determine exact free iodine molarities.",
      "Compute Partition Coefficient $K_{eq}$."
    ],
    expectedResult: "Highly reliable calculation confirming that iodine distributes in a strict, predictable equilibrium ratio between the two immiscible solvents.",
    theoreticalEquation: "Partition Constant K_eq = [I₂]in non-polar Hexane / [I₂]in polar Water",
    dwsimProof: {
      reactionType: "Thermodynamic Liquid-Liquid Partitioning",
      notes: "Flawless validation of Nernst distribution equilibrium laws."
    }
  },
  {
    id: 100,
    title: "Constructing an Empirical Solubility Curve Across Variable Temperatures",
    section: "Section 10: Physical Chemistry",
    objective: "To draw a high-precision S-shaped empirical empirical matching saturation temperatures of potassium nitrate.",
    materials: ["Boiling Tubes", "Thermometer", "Water Bath Systems", "Stirring Rod", "Analytical Balance"],
    requiredChemicalIds: ["nacl_sol", "nh4cl_sol"],
    steps: [
      "Weigh exact variable masses of solid salt (10g, 20g, 30g, 40g, 50g) into 5 separate boiling tubes.",
      "Add exactly 20.0 ml distilled water into each tube and heat gently until all solids dissolve entirely.",
      "Let cool slowly, stirring steadily, and record the exact thermometer temperature at which first sparkling crystals precipitate.",
      "Plot Saturation Solubility (g/100g water) versus Temperature."
    ],
    expectedResult: "A wonderful, highly diagnostic S-shaped curve is obtained, showing that salt solubility climbs exceptionally steeply as temperature increases.",
    theoreticalEquation: "S(T) directly proportional to exponential thermal transitions.",
    dwsimProof: {
      reactionType: "Thermal Saturation Equilibrium Modeling",
      notes: "Flawless validation of structural solubility phase regression algorithms."
    }
  },
  {
    id: 101,
    title: "Verification of Raoult's Law — Colligative Boiling Point Elevation",
    section: "Section 10: Physical Chemistry",
    objective: "To prove that adding a non-volatile non-electrolyte solute elevates the boiling point of pure water directly in proportion to molality.",
    materials: ["High-Precision Digital Thermometer (0.1°C)", "Bunsen Burner System", "Beaker", "Analytical Balance"],
    requiredChemicalIds: ["sucrose_sol"],
    steps: [
      "Measure the exact baseline boiling plateau of pure distilled water.",
      "Dissolve precise, increasing masses of non-volatile sugar (sucrose) in 100ml water.",
      "Boil each highly concentrated mash and record the new elevated boiling plateaus.",
      "Plot Boiling Point Elevation ($\Delta T_b$) versus Solute Molality ($m$)."
    ],
    expectedResult: "A perfect straight line passing through the origin is formed, flawlessly verifying Raoult's colligative relationship ($\Delta T_b = K_b \cdot m$).",
    theoreticalEquation: "DeltaT_b = K_b * Molality m (where K_b = 0.512 °C kg/mol for water)",
    dwsimProof: {
      reactionType: "Colligative Vapor Pressure Depression",
      notes: "The solute particles dilute the liquid surface water fraction, lowering overall vapor pressure and necessitating higher temperatures to reach 1 atm."
    }
  },
  {
    id: 102,
    title: "Colligative Freezing Point Depression to Determine Solute Molar Mass",
    section: "Section 10: Physical Chemistry",
    objective: "To find the true molar mass of an organic solid (Naphthalene) by measuring how much it depresses the freezing point of cyclohexane.",
    materials: ["Test Tube in highly controlled Ice Bath", "Digital Thermometer (0.1°C)", "Analytical Balance"],
    requiredChemicalIds: ["hexane"],
    steps: [
      "Determine the freezing point of pure liquid cyclohexane accurately.",
      "Dissolve a precisely weighed mass of organic Naphthalene powder into a known mass of cyclohexane.",
      "Cool inside an ice bath while stirring and record the exact depressed freezing plateau ($\Delta T_f$).",
      "Calculate the exact Naphthalene molar mass ($M$)."
    ],
    expectedResult: "The actual freezing point depression flawlessly computes the true Naphthalene molar mass ($M = 128.2$ g/mol).",
    theoreticalEquation: "DeltaT_f = K_f * Molality m (where K_f = 20.0 °C kg/mol for cyclohexane) | Molar Mass = (K_f * mass Solute) / (DeltaT_f * mass Solvent in kg)",
    dwsimProof: {
      reactionType: "Cryoscopic Colligative Modeling",
      notes: "Exceptionally precise physical chemistry protocol for characterizing new organic compounds."
    }
  },
  {
    id: 103,
    title: "Spectroscopy — Visible Light Absorption Spectrum Profiling",
    section: "Section 10: Physical Chemistry",
    objective: "To record the complete visible absorption spectrum (400nm to 700nm) of vibrant blue copper sulfate.",
    materials: ["Scientific Spectrophotometer Profile", "Cuvettes Assembly"],
    requiredChemicalIds: ["cuso4_sol"],
    steps: [
      "Prepare a standard 0.5M Copper(II) Sulfate solution in a cuvette.",
      "Scan Absorbance automatically at 10nm increments from 400nm (violet) to 700nm (deep red).",
      "Plot Absorbance versus Wavelength."
    ],
    expectedResult: "Produces a beautiful, highly diagnostic Gaussian absorption mountain with maximum absorption exactly in the red zone (630nm-640nm).",
    theoreticalEquation: "Quantized visible photon excitation across transition metal d-orbitals.",
    dwsimProof: {
      reactionType: "Electronic Spectrophotometry Scans",
      notes: "Absorbing red light allows the complementary cyan/blue frequencies to transmit freely to our eyes."
    }
  },
  {
    id: 104,
    title: "Determination of an Organic Reaction Equilibrium Constant ($K_c$)",
    section: "Section 10: Physical Chemistry",
    objective: "To find the exact numerical equilibrium constant ($K_c$) for the Fischer esterification of ethanol and ethanoic acid.",
    materials: ["Sealed Ground-Glass Tubes", "Water Bath", "Burette Portal", "Standard NaOH Reagents"],
    requiredChemicalIds: ["ethanoic_acid", "ethanol", "naoh_dilute", "phenolphthalein", "h2so4_conc"],
    steps: [
      "Combine exactly 1.0 mole of pure Ethanol and 1.0 mole of Ethanoic acid with a tiny acid catalyst in a sealed ground-glass tube.",
      "Incubate in a warm water bath for several days until complete dynamic equilibrium is secured.",
      "Open the tube and immediately titrate with standard NaOH to determine exact unreacted ethanoic acid moles ($1-x$).",
      "Compute exact numerical $K_c$."
    ],
    expectedResult: "Exceptional mathematical determination yielding exactly $K_c \approx 4.0$ for standard Fischer aliphatic esterification.",
    theoreticalEquation: "K_c = [Ethyl Ethanoate][Water] / [Ethanoic Acid][Ethanol] = x² / (1-x)²",
    dwsimProof: {
      reactionType: "Fischer Reversible Equilibrium Quantification",
      notes: "Exceptional proof showing that organic esterifications do not proceed 100% to completion without continuous water removal."
    }
  },
  {
    id: 105,
    title: "Le Chatelier's Principle — Chromate / Dichromate Reversible Shifts",
    section: "Section 10: Physical Chemistry",
    objective: "To observe reversible color shifts by perturbing chemical equilibrium with acid and alkali.",
    materials: ["Test Tubes", "Test Tube Rack", "Droppers", "Stirring Rod"],
    requiredChemicalIds: ["k2cr2o7_sol", "hcl_dilute", "naoh_dilute", "k2cro4_sol"],
    steps: [
      "Place 5ml of bright orange Potassium Dichromate (K₂Cr₂O₇) solution into a test tube.",
      "Add 3ml of dilute Sodium Hydroxide (NaOH) to increase pH and watch the liquid shift to brilliant bright yellow.",
      "Add 5ml of dilute Hydrochloric Acid (HCl) to lower pH and watch the magnificent orange color instantly return!"
    ],
    expectedResult: "The solution toggles flawlessly back and forth between bright yellow (high pH Chromate) and deep orange (low pH Dichromate).",
    theoreticalEquation: "2CrO₄²⁻ (Yellow Chromate) + 2H⁺ <--(Equilibrium Shift)--> Cr₂O₇²⁻ (Orange Dichromate) + H₂O",
    dwsimProof: {
      reactionType: "pH-Dependent Reversible Equilibrium",
      equilibriumConstant: "K_eq = 4.2 x 10¹⁴",
      notes: "According to Le Chatelier's principle, adding H⁺ ions forces the equilibrium to shift to the right to consume the added protons."
    }
  },
  {
    id: 106,
    title: "Effect of Temperature on Thermal Reversible Equilibrium Position",
    section: "Section 10: Physical Chemistry",
    objective: "To demonstrate how perturbing temperature shifts an endothermic gas reaction toward its colored products.",
    materials: ["Sealed Glass Tubes containing prepared N₂O₄ / NO₂ gas", "Beaker of Hot Water (60°C)", "Ice Bath Portal"],
    requiredChemicalIds: ["no2_gas"],
    steps: [
      "Inspect the steady pale brown gas mixture inside the sealed tube at baseline room temperature.",
      "Case 1 (Roasting Heat): Plunge the tube inside a 60 °C hot water bath (the gas instantly turns an intense, opaque dark reddish-brown!).",
      "Case 2 (Freezing Cold): Plunge the exact same tube into an ice bath (the brown hue completely fades to virtually pure colorless!)."
    ],
    expectedResult: "Flawless real-time demonstration of thermal equilibrium toggling according to Le Chatelier.",
    theoreticalEquation: "N₂O₄(g, Colorless) <--(Equilibrium Toggle)--> 2NO₂(g, Brown) DeltaH = +57.2 kJ/mol (Endothermic)",
    dwsimProof: {
      reactionType: "Thermal Gas Equilibrium Reversibility",
      notes: "Heating shifts the endothermic forward pathway to absorb thermal energy. Cooling shifts the exothermic reverse pathway."
    }
  },
  {
    id: 107,
    title: "Determination of the Acid Dissociation Constant ($pK_a$) of a Weak Organic Acid",
    section: "Section 10: Physical Chemistry",
    objective: "To construct a complete pH titration S-curve to interpolate the exact half-equivalence point where $pH = pK_a$.",
    materials: ["Electronic Digital pH Meter", "Burette System", "Beaker", "Magnetic Stirrer"],
    requiredChemicalIds: ["ethanoic_acid", "naoh_dilute"],
    steps: [
      "Place exactly 25.0 ml of 0.1M Ethanoic Acid into a beaker and continuously log its pH with a digital probe.",
      "Add standard 0.1M NaOH from a burette in 1ml increments, stirring steadily, and log the complete titration curve.",
      "Graph pH versus Volume of NaOH added and pinpoint the equivalence volume $V_{equiv}$.",
      "Interpolate the exact live pH exactly at the half-equivalence volume ($V_{equiv}/2$)."
    ],
    expectedResult: "At exactly half-equivalence ($V = 12.5$ ml), the logged pH locks beautifully at exactly 4.76, flawlessly confirming the true ethanoic acid $pK_a$.",
    theoreticalEquation: "pH = pK_a + log([Salt] / [Acid]) (Henderson-Hasselbalch Relationship)",
    dwsimProof: {
      reactionType: "Potentiometric Half-Equivalence Derivation",
      notes: "When $[Salt] = [Acid]$ exactly midway through the titration, the logarithmic ratio cancels entirely ($log(1) = 0$), leaving $pH = pK_a$ exactly."
    }
  },
  {
    id: 108,
    title: "Preparation and Analytical Stress-Testing of Standard Buffer Solutions",
    section: "Section 10: Physical Chemistry",
    objective: "To prepare an authentic weak acid/conjugate base buffer solution and prove it stubbornly resists drastic pH spikes.",
    materials: ["Electronic Digital pH Meter", "Beakers", "Burette Portals"],
    requiredChemicalIds: ["ethanoic_acid", "na2co3_sol", "hcl_dilute", "naoh_dilute"],
    steps: [
      "Combine 50ml of 0.1M Ethanoic acid with 50ml of 0.1M Sodium Ethanoate salt in a clean beaker to create an authentic pH 4.76 buffer.",
      "In an identical control beaker, place 100ml plain distilled water.",
      "Case 1 (Acid Stress): Add 1ml of 1.0M HCl into both beakers and record the exact pH change.",
      "Case 2 (Alkali Stress): Add 1ml of 1.0M NaOH and contrast the stability."
    ],
    expectedResult: "The buffer beaker shifts by less than 0.05 pH units under both stresses. The plain water control beaker suffers violent spikes of 3 to 5 pH units!",
    theoreticalEquation: "Conjugate buffer actions absorbing added protons or hydroxyl ions flawlessly.",
    dwsimProof: {
      reactionType: "Conjugate Buffer Capacity Verification",
      notes: "Flawless real-time proof of physiological buffering mechanisms (resembling mammalian blood blood pH homeostasis)."
    }
  },
  {
    id: 109,
    title: "Investigating the Tyndall Effect Across Colloidal Suspensions",
    section: "Section 10: Physical Chemistry",
    objective: "To synthesize an authentic Iron(III) Hydroxide colloid and prove it scatters a visible laser beam cone.",
    materials: ["Laser Pointer / Torch Portal", "Dark Room Chamber", "Beaker of Boiling Distilled Water", "Droppers"],
    requiredChemicalIds: ["fecl3_sol"],
    steps: [
      "Add 5 drops of concentrated Iron(III) Chloride (FeCl₃) solution into a beaker of actively boiling distilled water.",
      "A magnificent deep wine-red colloidal suspension of Iron(III) Hydroxide forms immediately.",
      "Shine a bright laser pointer through the beaker inside a fully dark room.",
      "Contrast against a plain transparent true solution."
    ],
    expectedResult: "The laser beam is invisibly clear in plain water but illuminates into a spectacular, dazzling bright light cone (Tyndall effect) inside the colloid.",
    theoreticalEquation: "Optical Rayleigh and Mie Light Scattering by Mesoscopic Particles",
    dwsimProof: {
      reactionType: "Colloidal Hydrolysis & Mesoscopic Scattering",
      notes: "Colloidal particles have dimensions between 1nm and 1000nm (significantly larger than true molecular solutions), matching visible wavelengths to scatter light."
    }
  },
  {
    id: 110,
    title: "Determination of Relative Molecular Mass via Multi-Component Steam Distillation",
    section: "Section 10: Physical Chemistry",
    objective: "To determine the molar mass of an immiscible high-boiling organic unknown (Aniline / Toluene) by co-distilling with live steam below 100°C.",
    materials: ["Live Steam Generator Assembly", "Distillation Setup", "Ground Glass Separating Funnel", "Analytical Balance"],
    requiredChemicalIds: ["vegetable_oil", "hexane"],
    steps: [
      "Combine the high-boiling organic liquid with water inside a distillation boiling flask.",
      "Inject live steam continuously and gather the co-distilled condensed emulsion fraction coming over below 100 °C.",
      "Separate the recovered layers in a ground-glass funnel, weigh both fractions accurately, and apply Dalton's law of partial pressures."
    ],
    expectedResult: "Flawless mathematical mathematical computing true organic molar mass from empirical co-distilled steam weight ratios.",
    theoreticalEquation: "m_organic / m_water = (Partial_P(organic) * M_organic) / (Partial_P(water) * 18.0 g/mol)",
    dwsimProof: {
      reactionType: "Dalton's Partial Pressure Steam Volumetry",
      notes: "Allows highly gentle, efficient thermal purification of heat-sensitive organic oils without risking pyrolytic decomposition."
    }
  },

  // --- BONUS: ADDITIONAL EXPERIMENTS (111 - 115) ---
  {
    id: 111,
    title: "Drinking Water Quality Assays & Contaminant Screening",
    section: "Section 10: Physical Chemistry",
    objective: "To execute multi-parameter screening on local drinking water samples to detect harmful inorganic impurities.",
    materials: ["Water Screening Test Strips", "Digital Sensors", "Reagent Arrays", "Beakers"],
    requiredChemicalIds: ["nacl_sol", "bacl2_sol", "agno3_sol", "edta_sol", "nh3_dilute"],
    steps: [
      "Screen for Chlorides: Acidify sample and add Silver Nitrate (look for white turbidity).",
      "Screen for Sulfates: Add Barium Chloride solution.",
      "Quantify Hardness: Perform EDTA chelation loops.",
      "Measure live pH and electrical turbidity."
    ],
    expectedResult: "Flawless analytical diagnostics screening municipal water portability across all key chemical vectors.",
    theoreticalEquation: "Multivariate Contaminant Qualification Arrays",
    dwsimProof: {
      reactionType: "Comprehensive Municipal Water Screening",
      notes: "Professional automated validation protocol ensuring safe drinking standard thresholds."
    }
  },
  {
    id: 112,
    title: "Spectrophotometric Quantification of Total Iron in Green Spinach Extract",
    section: "Section 10: Physical Chemistry",
    objective: "To quantify the exact milligrams of bioavailable Iron in spinach using 1,10-phenanthroline complexation.",
    materials: ["Spectrophotometer Portal", "Cuvettes Assembly", "Acid Digestion Beakers", "Analytical Balance"],
    requiredChemicalIds: ["fecl3_sol", "feso4_sol", "h2so4_conc"],
    steps: [
      "Digest 10g of fresh green spinach leaves in boiling acid to liberate cellular bioavailable iron.",
      "Mix in hydroxylamine reductant to guarantee all Iron resides in the divalent Fe²⁺ state.",
      "Add 1,10-phenanthroline reagent to develop an incredibly spectacular, deep Orange-Red complex.",
      "Measure absorbance exactly at 510nm and compare against standard iron regression lines."
    ],
    expectedResult: "Flawless numerical quantification determining total iron content per 100g of spinach with outstanding analytical fidelity.",
    theoreticalEquation: "Fe²⁺ + 3 1,10-Phenanthroline Ligands -> Deep Orange-Red Tris(phenanthroline)iron(II) Complex",
    dwsimProof: {
      reactionType: "Bio-Inorganic Spectrophotometric Regressions",
      notes: "Exceptionally sensitive highly robust diagnostic method for nutritional elemental assays."
    }
  },
  {
    id: 113,
    title: "Screening Industrial Water Samples for Toxic Heavy Metals (Lead & Copper)",
    section: "Section 10: Physical Chemistry",
    objective: "To detect hazardous trace quantities of heavy metals in wastewater using Dithizone complexation probes.",
    materials: ["Fume Cupboard Assembly", "Ground Glass Separating Funnel", "Spectrophotometer", "Beakers"],
    requiredChemicalIds: ["cuso4_sol", "agno3_sol", "chloroform_reagent"],
    steps: [
      "Adjust industrial wastewater sample to exact diagnostic pH plateaus.",
      "Add green Dithizone extraction solution in organic solvent and shake gently in a Ground-Glass Ground-Glass Funnel.",
      "Case 1 (Lead): The green drops turn an unmistakable, vibrant Brick Red.",
      "Case 2 (Copper): The drops shift to a spectacular deep Purple-Violet."
    ],
    expectedResult: "Flawless multi-color heavy metal screening cleanly identifying trace Lead and Copper contaminants.",
    theoreticalEquation: "Heavy Metal + Surfactant Dithizone -> Highly Colored Fat-Soluble Chelate",
    dwsimProof: {
      reactionType: "Organo-Metallic Trace Extraction",
      notes: "Exceptionally sensitive highly robust colorimetric method for monitoring industrial ecological compliance."
    }
  },
  {
    id: 114,
    title: "Simple Educational Extraction of Cellular DNA from Plant Tissues",
    section: "Section 10: Physical Chemistry",
    objective: "To extract and recover real visible, pristine white stringy genomic DNA from ripe bananas or onions.",
    materials: ["Cellular Blender Assembly", "Cheesecloth Filters", "Tall Glass Beaker", "Ice Cold Ethanol Bottle", "Glass Spooling Rod"],
    requiredChemicalIds: ["nacl_sol", "ethanol"],
    steps: [
      "Blend ripe banana tissue with table salt and warm water to break open rigid cellulose plant cell walls.",
      "Filter the mush through cheesecloth, then stir in 5ml of liquid detergent to dissolve fatty nuclear membranes.",
      "Tilt the glass and exceptionally carefully float 20ml of ice-cold 90% Ethanol down the inner glass wall.",
      "Watch an amazing, dense white stringy cloud of genuine genomic DNA instantly precipitate exactly at the alcohol boundary!"
    ],
    expectedResult: "Spectacular genuine white strands of cellular DNA coagulate at the top, easily collected by spooling around a glass rod.",
    theoreticalEquation: "Deoxyribonucleic Acid Solvation phase collapse in non-polar alcohol media",
    dwsimProof: {
      reactionType: "Biochemical Macromolecular Precipitation",
      notes: "DNA is highly soluble in polar saline water but completely insoluble in cold organic ethanol, causing immediate macromolecular collapse."
    }
  },
  {
    id: 115,
    title: "Hard & Soft Water Analysis (Soap vs Detergent comparison)",
    section: "Section 10: Physical Chemistry",
    objective: "To prove why synthetic detergents outperform traditional soaps in calcium-rich hard water.",
    materials: ["Test Tubes", "Test Tube Rack", "Stoppers", "Stopwatch"],
    requiredChemicalIds: ["vegetable_oil", "cacl2_sol", "naoh_dilute"],
    steps: [
      "Place 5ml of soft distilled water in Tube 1 and 5ml of Calcium Chloride hard water in Tube 2.",
      "Add 5 drops of real soap solution into both tubes, stopper them, and give exactly 10 vigorous shakes.",
      "Observe the height of the foam lather.",
      "Repeat the experiment in new tubes using synthetic laboratory detergent."
    ],
    expectedResult: "Soap produces fantastic foam in soft water but zero foam and unsightly white curdy scum in hard water. Synthetic detergent lathers flawlessly in both hard and soft water!",
    theoreticalEquation: "2R-COONa (Soap) + Ca²⁺ -> (R-COO)₂Ca↓ (Insoluble Calcium Scum)",
    dwsimProof: {
      reactionType: "Precipitation vs Soluble Surfactant Actions",
      notes: "Synthetic sulfonate and sulfate detergents form highly water-soluble calcium salts, completely avoiding the precipitation pitfalls of traditional carboxylate soaps."
    }
  }
];
