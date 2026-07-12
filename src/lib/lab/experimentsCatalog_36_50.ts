import { SyllabusExperiment } from "./experimentsCatalog";

export const EXPERIMENTS_36_50: SyllabusExperiment[] = [
  {
    id: 36,
    title: "Preparation of Ethanol by Yeast Fermentation",
    section: "Section 4: Organic Chemistry",
    objective: "To prepare ethanol and carbon dioxide anaerobically through enzyme-catalyzed fermentation of glucose.",
    materials: ["Conical Flask (500ml)", "Delivery Tube", "Beaker", "Thermometer", "Cotton Wool"],
    requiredChemicalIds: ["glucose_sol", "yeast_solid", "limewater"],
    steps: [
      "Pour 200ml of warm Glucose solution (32°C) into the conical flask.",
      "Add 10 grams of active Yeast powder and stir gently.",
      "Seal the flask with a stopper and delivery tube that bubbles directly into a beaker of fresh limewater.",
      "Incubate at 32 °C and observe continuous bubbling and limewater clouding over time.",
      "Filter out the yeast sediment to obtain the fragrant fermented alcoholic mash."
    ],
    expectedResult: "Active effervescence occurs, turning limewater milky white. The liquid acquires a distinctive sweet alcoholic aroma.",
    theoreticalEquation: "C₆H₁₂O₆(aq) --(Yeast Zymase Enzymes)--> 2C₂H₅OH(aq) + 2CO₂↑",
    dwsimProof: {
      reactionType: "Anaerobic Biochemical Glycolysis",
      deltaH: "-69.4 kJ/mol",
      notes: "Zymase enzymes break down hexose molecules into ethanol and CO₂. Fermentation naturally halts around 15% alcohol due to yeast toxicity."
    }
  },
  {
    id: 37,
    title: "Distillation of Fermented Liquid to Obtain Pure Ethanol",
    section: "Section 4: Organic Chemistry",
    objective: "To purify ethanol from a crude fermentation mixture by thermal simple distillation.",
    materials: ["Round Bottom Flask (500ml)", "Liebig Condenser", "Bunsen Burner", "Thermometer (0-110°C)"],
    requiredChemicalIds: ["ethanol"],
    steps: [
      "Set up full laboratory distillation apparatus with tight ground-glass joints.",
      "Pour the fermented liquid into the round bottom flask and add anti-bumping granules.",
      "Circulate cooling tap water from the bottom condenser inlet to the top outlet.",
      "Heat gently and collect the fragrant distillate fraction that comes over exactly at 78 °C.",
      "Verify that the gathered colorless liquid ignites with a clean, faint blue flame."
    ],
    expectedResult: "Pure concentrated ethanol collects in the receiving flask, boiling steadily at 78 °C.",
    theoreticalEquation: "C₂H₅OH(aq) --(Thermal Distillation at 78.3°C)--> C₂H₅OH(l, 95% Pure Azeotrope)",
    dwsimProof: {
      reactionType: "Thermodynamic Fractional Vaporization",
      notes: "Ethanol forms a positive minimum-boiling azeotrope with water at 95.6% composition."
    }
  },
  {
    id: 38,
    title: "Esterification — Preparation of Ethyl Ethanoate",
    section: "Section 4: Organic Chemistry",
    objective: "To synthesize a fragrant, fruity ester by reacting an aliphatic alcohol with a carboxylic acid under acid catalysis.",
    materials: ["Conical Flask", "Water Bath", "Bunsen Burner", "Separating Funnel", "Thermometer"],
    requiredChemicalIds: ["ethanoic_acid", "ethanol", "h2so4_conc", "na2co3_sol"],
    steps: [
      "Mix equal 10ml volumes of Ethanoic Acid and pure Ethanol inside a flask.",
      "Carefully add 5 drops of concentrated Sulfuric Acid (H₂SO₄) to serve as a hygroscopic catalyst.",
      "Warm the mixture in a 65°C water bath for 10 minutes (or reflux gently).",
      "Pour the cooled product into a separating funnel containing Sodium Carbonate solution to neutralize excess acid.",
      "Shake gently, drain off the bottom aqueous layer, and collect the top organic layer."
    ],
    expectedResult: "A wonderful, unmistakable sweet fruity aroma (resembling pear drops or nail polish remover) fills the laboratory.",
    theoreticalEquation: "CH₃COOH + C₂H₅OH <--(Conc. H₂SO₄ Catalyst)--> CH₃COOC₂H₅(l) + H₂O",
    dwsimProof: {
      reactionType: "Fischer Esterification Equilibrium",
      equilibriumConstant: "K_eq ≈ 4.0",
      notes: "Concentrated sulfuric acid acts both as an acid catalyst to protonate the carbonyl oxygen and as a dehydrating agent to drive equilibrium forward according to Le Chatelier."
    }
  },
  {
    id: 39,
    title: "Preparation of Real Laboratory Soap (Saponification)",
    section: "Section 4: Organic Chemistry",
    objective: "To prepare authentic authentic laboratory soap by alkaline hydrolysis of vegetable oil triglycerides.",
    materials: ["Beaker (250ml)", "Bunsen Burner", "Stirring Rod", "Filter Funnel", "Filter Paper"],
    requiredChemicalIds: ["vegetable_oil", "naoh_dilute", "ethanol", "nacl_sol"],
    steps: [
      "Pour 20ml of Vegetable Oil and 20ml of concentrated Sodium Hydroxide (NaOH) solution into a beaker.",
      "Add 10ml of ethanol to serve as a co-solvent and boil gently while stirring continuously for 20 minutes.",
      "Once the paste thickens, pour in 50ml of saturated Sodium Chloride (table salt) solution to 'salt out' the soap.",
      "Filter the creamy precipitated soap curds, press into a firm cake, and test its excellent foaming lather in distilled water."
    ],
    expectedResult: "A solid, authentic white soap bar is formed. It lathers profusely in soft water but forms solid calcium scum when tested with CaCl₂.",
    theoreticalEquation: "Triglyceride (Vegetable Oil) + 3NaOH -> Glycerol + 3R-COONa (Sodium Soap Bar)",
    dwsimProof: {
      reactionType: "Base-Catalyzed Ester Saponification",
      notes: "Salting out works by increasing the ionic strength of the aqueous phase, significantly lowering the solubility of traditional carboxylate soap salts."
    }
  },
  {
    id: 40,
    title: "Preparation of Nylon-6,6 Polymer Threads",
    section: "Section 4: Organic Chemistry",
    objective: "To synthesize a spectacular synthetic nylon polymer thread exactly at the boundary boundary boundary of two immiscible liquid phases.",
    materials: ["Beakers", "Glass Rod / Tweezers", "Fume Cupboard System"],
    requiredChemicalIds: ["nylon_reagents"],
    steps: [
      "Pour 10ml of the aqueous diamine solution into a small clean beaker.",
      "Carefully float an equal volume of the organic adipoyl chloride solution down the inner glass wall.",
      "A pristine white polymer film immediately coagulates at the interface boundary.",
      "Use tweezers to gently pinch the center of the film and pull upward, winding continuously around a glass rod."
    ],
    expectedResult: "A wonderful, apparently endless continuous white strand of Nylon-6,6 thread is pulled from the beaker.",
    theoreticalEquation: "n Adipoyl Chloride + n Hexamethylenediamine -> [Nylon-6,6 Thread]_n + 2n HCl",
    dwsimProof: {
      reactionType: "Interfacial Step-Growth Condensation Polymerization",
      notes: "The organic and aqueous layers are immiscible, restricting polymer formation strictly to the self-healing two-dimensional interface."
    }
  },
  {
    id: 41,
    title: "Properties of Alkanes & Alkenes (Bromine Water Assay)",
    section: "Section 4: Organic Chemistry",
    objective: "To quickly distinguish between saturated (Hexane) and unsaturated (Cyclohexene) organic hydrocarbons.",
    materials: ["Test Tubes", "Test Tube Rack", "Droppers", "Black Paper Shield"],
    requiredChemicalIds: ["hexane", "cyclohexene", "bromine_water", "kmno4_sol"],
    steps: [
      "Place 3ml of Hexane (alkane) into Test Tube 1 and 3ml of Cyclohexene (alkene) into Test Tube 2.",
      "Add 1ml of bright orange Bromine Water into both test tubes and shake vigorously.",
      "Repeat the assay in fresh tubes using acidified Potassium Permanganate (KMnO₄) drops."
    ],
    expectedResult: "Cyclohexene instantly decolorizes orange bromine water to colorless and turns purple KMnO₄ brown/colorless. Hexane shows absolutely no reaction, remaining completely orange/purple.",
    theoreticalEquation: "Cyclohexene (C₆H₁₀) + Br₂ -> trans-1,2-dibromocyclohexane (Colorless Liquid)",
    dwsimProof: {
      reactionType: "Electrophilic Halogen Addition",
      deltaH: "-121 kJ/mol (Exothermic addition)",
      notes: "The electron-rich C=C pi bond easily polarizes the approaching Br-Br molecule, forming a cyclic bromonium intermediate that is attacked by bromide."
    }
  },
  {
    id: 42,
    title: "Photochemical Substitution Reaction of Alkanes",
    section: "Section 4: Organic Chemistry",
    objective: "To demonstrate UV light-driven free radical substitution of chlorine or bromine into an alkane.",
    materials: ["Test Tubes", "Stoppers", "UV Light or Sunlight Portal", "Litmus Paper"],
    requiredChemicalIds: ["hexane", "bromine_water"],
    steps: [
      "Place 3ml of Hexane in a test tube and add 1ml of bright orange Bromine water.",
      "Stopper firmly and expose to intense UV sunlight for 10 minutes.",
      "In a control tube, wrap completely in black paper and store in the dark.",
      "Check for decolorization and test escaping vapors with damp blue litmus paper."
    ],
    expectedResult: "The tube in sunlight decolorizes and turns blue litmus red (confirming evolved HBr gas). The dark control tube remains completely unchanged.",
    theoreticalEquation: "C₆H₁₄ + Br₂ --(UV Light h*nu)--> C₆H₁₃Br + HBr↑",
    dwsimProof: {
      reactionType: "Free Radical Photochemical Substitution",
      notes: "UV photons homolytically cleave the non-polar halogen bond to generate highly reactive atomic radical initiators."
    }
  },
  {
    id: 43,
    title: "Addition Reaction of Alkenes — Halogenation",
    section: "Section 4: Organic Chemistry",
    objective: "To demonstrate the extremely rapid stereospecific trans-addition of liquid halogen across an alkene double bond.",
    materials: ["Test Tubes", "Droppers", "Fume Shield"],
    requiredChemicalIds: ["cyclohexene", "bromine_water"],
    steps: [
      "Place 2ml of pure Cyclohexene into a clean test tube.",
      "Add drops of concentrated bromine water or bromine in organic solvent.",
      "Observe the spectacular instant disappearance of the rich halogen hue upon shaking."
    ],
    expectedResult: "The orange-brown drops vanish instantaneously, leaving an exceptionally clean, dense, colorless organic liquid.",
    theoreticalEquation: "C₆H₁₀ + Br₂ -> trans-1,2-dibromocyclohexane",
    dwsimProof: {
      reactionType: "Stereospecific Electrophilic Addition",
      notes: "The rigid cyclic structure enforces strict anti-periplanar attack by the incoming nucleophilic bromide ion."
    }
  },
  {
    id: 44,
    title: "Synthesis of Biodiesel (Transesterification)",
    section: "Section 4: Organic Chemistry",
    objective: "To synthesize authentic clean-burning biodiesel from vegetable cooking oils using methanol and a base catalyst.",
    materials: ["Beaker", "Water Bath at 55°C", "Separating Funnel", "Stirring Rod"],
    requiredChemicalIds: ["vegetable_oil", "methanol", "naoh_dilute"],
    steps: [
      "Dissolve 1g of solid NaOH in 20ml Methanol to prepare active sodium methoxide.",
      "Warm 100ml of Vegetable Oil to 55 °C in a water bath.",
      "Pour the methoxide into the warm oil and stir steadily for 30 minutes.",
      "Transfer into a separating funnel and let settle into two distinct liquid layers.",
      "Drain off the bottom dense dark glycerol layer and recover the top golden biodiesel."
    ],
    expectedResult: "Excellent phase separation. The gathered top biodiesel burns exceptionally cleanly with virtually zero soot or foul odor.",
    theoreticalEquation: "Triglyceride + 3CH₃OH <--(NaOH Catalyst)--> Glycerol + 3R-COOCH₃ (Fatty Acid Methyl Esters / Biodiesel)",
    dwsimProof: {
      reactionType: "Catalyzed Lipid Transesterification",
      notes: "Converts highly viscous, heavy branched triglycerides into lightweight, linear mono-alkyl esters suitable for diesel engines."
    }
  },
  {
    id: 45,
    title: "Controlled Oxidation of Primary and Secondary Alcohols",
    section: "Section 4: Organic Chemistry",
    objective: "To oxidize primary alcohols to carboxylic acids and secondary alcohols to ketones, showing that tertiary alcohols resist oxidation.",
    materials: ["Test Tubes", "Water Bath", "Droppers"],
    requiredChemicalIds: ["ethanol", "propanol", "butanol", "k2cr2o7_sol", "h2so4_dilute"],
    steps: [
      "Place 2ml of primary (ethanol), secondary (propanol), and tertiary alcohol into 3 clean tubes.",
      "Add 3ml of acidified Potassium Dichromate (K₂Cr₂O₇) solution and warm gently in a water bath."
    ],
    expectedResult: "Primary and secondary alcohols oxidize instantly, turning the bright orange dichromate solution a gorgeous deep green. Tertiary alcohol shows zero reaction, remaining completely orange.",
    theoreticalEquation: "CH₃CH₂OH --([O] Acidified Dichromate)--> CH₃CHO -> CH₃COOH + 2Cr³⁺ (Green)",
    dwsimProof: {
      reactionType: "Aliphatic Organic Redox Cleavage",
      notes: "Tertiary alcohols possess zero alpha-hydrogen atoms on the carbinol carbon, completely preventing elimination-oxidation pathways."
    }
  },
  {
    id: 46,
    title: "Acid & Alkaline Hydrolysis of Commercial Esters",
    section: "Section 4: Organic Chemistry",
    objective: "To compare reversible acid hydrolysis of ethyl ethanoate against irreversible base saponification.",
    materials: ["Test Tubes", "Water Bath", "Droppers", "Litmus Paper"],
    requiredChemicalIds: ["ethanoic_acid", "ethanol", "naoh_dilute", "hcl_dilute"],
    steps: [
      "Acid Hydrolysis: Warm ethyl ethanoate with dilute HCl; test product with litmus (acidic).",
      "Base Hydrolysis: Boil ester with NaOH (sweet fruity aroma completely vanishes as non-volatile sodium ethanoate forms)."
    ],
    expectedResult: "Acid hydrolysis achieves a dynamic equilibrium. Base hydrolysis runs 100% to completion, consuming the ester entirely.",
    theoreticalEquation: "R-COOR' + NaOH -> R-COONa + R'-OH (Irreversible Saponification Mechanism)",
    dwsimProof: {
      reactionType: "Nucleophilic Acyl Cleavage",
      notes: "Alkaline saponification is completely irreversible because the leaving alkoxide instantly deprotonates the resulting carboxylic acid."
    }
  },
  {
    id: 47,
    title: "Synthesis of Aspirin (Acetylsalicylic Acid)",
    section: "Section 4: Organic Chemistry",
    objective: "To synthesize pure analytical grade Aspirin crystals by acetylating salicylic acid.",
    materials: ["Conical Flask (150ml)", "Water Bath", "Ice Bath", "Filter Funnel", "Stirring Rod"],
    requiredChemicalIds: ["salicylic_acid", "ethanoic_acid", "h2so4_conc", "ethanol", "fecl3_sol"],
    steps: [
      "Place 2.0 grams of white Salicylic Acid crystals into the conical flask.",
      "Add 4 ml of Acetic Anhydride (or ethanoic acid) and 5 drops of concentrated Sulfuric Acid (H₂SO₄) catalyst.",
      "Swirl to dissolve and heat in a 60°C water bath for 15 minutes.",
      "Slowly drizzle in 20ml of cold water to decompose excess anhydride, then plunge the flask into an ice bath.",
      "Watch beautiful, glistening needle-like Aspirin crystals precipitate, filter them out, and verify purity with FeCl₃ drops."
    ],
    expectedResult: "Magnificent white crystal needles of pure Aspirin form in the ice bath. Pure aspirin shows no color with FeCl₃, while impure unreacted salicylic acid would turn deep purple.",
    theoreticalEquation: "C₇H₆O₃ (Salicylic Acid) + (CH₃CO)₂O -> C₉H₈O₄ (Aspirin) + CH₃COOH",
    dwsimProof: {
      reactionType: "Nucleophilic Acyl Substitution",
      deltaH: "-38.6 kJ/mol",
      notes: "The phenolic OH group attacks the protonated acetic anhydride carbonyl. Recrystallization from hot ethanol ensures 99.8% analytical purity."
    }
  },
  {
    id: 48,
    title: "Dehydration of Alcohols to Prepare Ethene Gas",
    section: "Section 4: Organic Chemistry",
    objective: "To prepare ethene gas by thermally dehydrating ethanol using concentrated sulfuric acid or hot alumina.",
    materials: ["Round Bottom Flask", "Thermometer System", "Gas Collection Trough", "Bunsen Burner"],
    requiredChemicalIds: ["ethanol", "h2so4_conc", "bromine_water"],
    steps: [
      "Place 10ml of absolute ethanol in a flask and carefully mix in 20ml concentrated H₂SO₄.",
      "Heat the mixture strongly to 170 °C over a Bunsen burner.",
      "Collect evolved ethene gas over water and verify that it instantly decolorizes orange bromine water."
    ],
    expectedResult: "Copious flammable alkene gas bubbles off, burning with a luminous flame and decolorizing halogen solutions instantly.",
    theoreticalEquation: "C₂H₅OH --(Conc H₂SO₄ at 170°C)--> C₂H₄↑ (Ethene) + H₂O",
    dwsimProof: {
      reactionType: "E1 Elimination & Dehydration Enthalpy",
      notes: "Sulfuric acid acts as a powerful dehydrating agent, protonating the hydroxyl oxygen to form an excellent water leaving group."
    }
  },
  {
    id: 49,
    title: "Polymer Identification via Diagnostic Combustion",
    section: "Section 4: Organic Chemistry",
    objective: "To identify commercial plastics (Polythene, PVC, Nylon, Polystyrene) by holding them in a Bunsen flame.",
    materials: ["Bunsen Burner", "Metal Tongs", "Damp Litmus Paper", "Fume Shield Container"],
    requiredChemicalIds: ["hexane", "hcl_dilute"],
    steps: [
      "Use metal tongs to hold small plastic fragments in a blue Bunsen flame for 5 seconds.",
      "Observe burning rate, flame hue, melting drips, and test evolved smoke with litmus."
    ],
    expectedResult: "Polythene: Melts and burns like wax; PVC: Burns with a green-edged flame and releases acidic HCl smoke (turns blue litmus red); Nylon: Melts into a hard celery-smelling bead.",
    theoreticalEquation: "Pyrolytic Polymer Thermal Decomposition",
    dwsimProof: {
      reactionType: "Pyrolysis & Radical Combustion",
      notes: "Chlorinated polymers (PVC) release pungent hydrogen chloride vapors upon thermal bond cleavage."
    }
  },
  {
    id: 50,
    title: "Determination of Empirical Molecular Formula (Combustion Analysis)",
    section: "Section 4: Organic Chemistry",
    objective: "To compute the exact C:H:O empirical empirical atomic ratio of an organic unknown by absorbing combustion gases.",
    materials: ["Combustion Tube", "Calcium Chloride Desiccant Tubes", "Soda Lime CO₂ Traps", "Analytical Balance"],
    requiredChemicalIds: ["caco3_solid", "co2_gas", "h2_gas", "o2_gas"],
    steps: [
      "Weigh the anhydrous CaCl₂ and Soda Lime absorption tubes perfectly on an analytical balance.",
      "Burn exactly 1.000g of the organic hydrocarbon in a pure oxygen stream.",
      "Pass the products through the tubes and reweigh to quantify trapped H₂O and CO₂."
    ],
    expectedResult: "Flawless mathematical reduction confirming exact empirical formula (e.g. C₆H₁₂O₆ or CH₂O).",
    theoreticalEquation: "Moles Carbon = Moles CO₂ | Moles Hydrogen = 2 * Moles H₂O",
    dwsimProof: {
      reactionType: "Gravimetric Combustion Elemental Analysis",
      notes: "Calcium chloride specifically binds steam, whereas basic soda lime sequesters acidic carbon dioxide completely."
    }
  }
];
