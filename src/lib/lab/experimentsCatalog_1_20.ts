import { SyllabusExperiment } from "./experimentsCatalog";

export const EXPERIMENTS_1_20: SyllabusExperiment[] = [
  {
    id: 1,
    title: "Flame Tests for Metal Ions",
    section: "Section 2: Qualitative Analysis",
    objective: "To identify metal cation impurities using characteristic Bunsen burner flame test colors.",
    materials: ["Bunsen Burner", "Platinum/Nichrome Wire Loop", "Watch Glass", "Dilute HCl"],
    requiredChemicalIds: ["cacl2_sol", "cuso4_sol", "bacl2_sol", "licl_sol", "nacl_sol", "kcl_sol", "srcl2_sol", "hcl_dilute"],
    steps: [
      "Clean the platinum wire loop by dipping it in dilute HCl.",
      "Hold the clean wire in the hottest blue flame of the Bunsen burner until no color is produced.",
      "Dip the clean wire into the metal salt sample (e.g. Lithium, Sodium, Calcium, Copper, or Strontium).",
      "Place the wire back into the blue flame and observe the spectacular visible color emitted."
    ],
    expectedResult: "Lithium: Crimson; Sodium: Persistent yellow-orange; Potassium: Lilac; Calcium: Brick red; Barium: Apple green; Copper: Blue-green; Strontium: Bright crimson.",
    theoreticalEquation: "M²⁺(excited) -> M²⁺(ground) + h*nu (Quantized Visible Photon Emission)",
    dwsimProof: {
      reactionType: "Atomic Emission Spectroscopy",
      notes: "Electrons absorb thermal energy to ascend to higher d/p orbitals, emitting characteristic visible wavelengths upon relaxation."
    }
  },
  {
    id: 2,
    title: "Tests for Anions (Carbonate, Sulfate, Halides) — Part 1",
    section: "Section 2: Qualitative Analysis",
    objective: "To systematically identify negative ions (CO₃²⁻, SO₄²⁻, Cl⁻, Br⁻, I⁻) in aqueous salt samples.",
    materials: ["Test Tube Rack", "Test Tubes", "Droppers", "Delivery Tube", "Beaker"],
    requiredChemicalIds: ["caco3_solid", "hcl_dilute", "limewater", "bacl2_sol", "agno3_sol", "hno3_dilute"],
    steps: [
      "For Carbonate (CO₃²⁻): Add dilute HCl to the solid sample. Capture escaping bubbles and route through limewater.",
      "For Sulfate (SO₄²⁻): Acidify with HCl, then add Barium Chloride (BaCl₂) drops.",
      "For Halides (Cl⁻): Acidify the sample with dilute HNO₃, then add Silver Nitrate (AgNO₃) solution."
    ],
    expectedResult: "Limewater turns milky (Carbonate confirmed); Heavy white precipitate of BaSO₄ insoluble in HCl forms (Sulfate confirmed); Curdy white precipitate of AgCl forms (Chloride confirmed).",
    theoreticalEquation: "CaCO₃ + 2HCl -> CaCl₂ + H₂O + CO₂↑ | Ba²⁺ + SO₄²⁻ -> BaSO₄↓ | Ag⁺ + Cl⁻ -> AgCl↓",
    dwsimProof: {
      reactionType: "Precipitation & Gas Evolution",
      gibbsEnergy: "-42.5 kJ/mol (Spontaneous BaSO₄ precipitation)",
      notes: "Solubility product Ksp of BaSO₄ is 1.08 x 10⁻¹⁰, proving virtually instantaneous precipitation."
    }
  },
  {
    id: 3,
    title: "Tests for Anions (Nitrate) — Brown Ring Test",
    section: "Section 2: Qualitative Analysis",
    objective: "To confirm the presence of Nitrate (NO₃⁻) ions using the delicate Brown Ring interface reaction.",
    materials: ["Test Tubes", "Test Tube Rack", "Droppers", "Conical Flask"],
    requiredChemicalIds: ["hno3_dilute", "feso4_sol", "h2so4_conc"],
    steps: [
      "Place 2ml of the nitrate salt solution in a clean test tube.",
      "Add an equal volume of freshly prepared Iron(II) Sulfate (FeSO₄) solution.",
      "Tilt the test tube at a 45-degree angle and gently slide concentrated H₂SO₄ down the inner glass wall.",
      "Hold the tube perfectly still and inspect the junction between the two liquid layers."
    ],
    expectedResult: "A striking, crisp brown ring forms exactly at the interface between the dense sulfuric acid and aqueous layer.",
    theoreticalEquation: "NO₃⁻ + 3Fe²⁺ + 4H⁺ -> NO + 3Fe³⁺ + 2H₂O | [Fe(H₂O)₆]²⁺ + NO -> [Fe(H₂O)₅(NO)]²⁺ + H₂O",
    dwsimProof: {
      reactionType: "Redox & Coordination Complexation",
      gibbsEnergy: "-68.2 kJ/mol",
      notes: "The unstable nitrosyliron(II) complex forms at the highly acidic interface, yielding the classic brown ring."
    }
  },
  {
    id: 4,
    title: "Tests for Cations Using Sodium Hydroxide",
    section: "Section 2: Qualitative Analysis",
    objective: "To identify metallic cations (Cu²⁺, Fe²⁺, Fe³⁺, Zn²⁺, Al³⁺) by adding dilute and excess NaOH.",
    materials: ["Test Tubes", "Test Tube Rack", "Droppers", "Bunsen Burner"],
    requiredChemicalIds: ["cuso4_sol", "feso4_sol", "fecl3_sol", "zn_solid", "alcl3_sol", "naoh_dilute"],
    steps: [
      "Place 2ml of each unknown metal solution into separate test tubes.",
      "Add dilute Sodium Hydroxide (NaOH) dropwise to each tube and note the color of the gelatinous hydroxide precipitate.",
      "Add excess Sodium Hydroxide to test for amphoteric redissolution (Zn²⁺ and Al³⁺)."
    ],
    expectedResult: "Cu²⁺: Royal blue ppt; Fe²⁺: Dirty green ppt; Fe³⁺: Rust red-brown ppt; Zn²⁺ and Al³⁺: White ppt that completely redissolves in excess NaOH to form soluble aluminate/zincate.",
    theoreticalEquation: "Cu²⁺ + 2OH⁻ -> Cu(OH)₂↓ (Blue) | Al³⁺ + 3OH⁻ -> Al(OH)₃↓ -> [Al(OH)₄]⁻ (in excess)",
    dwsimProof: {
      reactionType: "Precipitation & Amphoteric Complexation",
      notes: "Transition metal hydroxides precipitate at specific solubility products. Zinc and aluminium exhibit amphoterism."
    }
  },
  {
    id: 5,
    title: "Tests for Cations Using Ammonia Solution",
    section: "Section 2: Qualitative Analysis",
    objective: "To identify Copper(II) ions and distinguish Aluminium from Zinc using dilute and excess ammonia.",
    materials: ["Beaker", "Test Tubes", "Droppers", "Stirring Rod"],
    requiredChemicalIds: ["cuso4_sol", "alcl3_sol", "zn_solid", "nh3_dilute"],
    steps: [
      "Place 2ml of each metal salt solution into separate test tubes.",
      "Add dilute Ammonia (NH₃) solution dropwise to produce initial precipitates.",
      "Add 5ml of excess concentrated Ammonia solution and swirl vigorously."
    ],
    expectedResult: "Cu²⁺ initial pale blue precipitate redissolves in excess NH₃ to form an incredibly deep royal blue solution. Al³⁺ white precipitate remains insoluble in excess NH₃, whereas Zn²⁺ dissolves.",
    theoreticalEquation: "Cu(OH)₂↓ + 4NH₃ -> [Cu(NH₃)₄]²⁺(aq) + 2OH⁻",
    dwsimProof: {
      reactionType: "Ligand Substitution Equilibrium",
      equilibriumConstant: "K_f = 1.1 x 10¹³",
      notes: "Water ligands on Cu²⁺ are displaced by ammonia, deepening the blue crystal field splitting hue."
    }
  },
  {
    id: 6,
    title: "Identification of Common Laboratory Gases",
    section: "Section 2: Qualitative Analysis",
    objective: "To conclusively detect evolved laboratory gases (H₂, O₂, CO₂, Cl₂, NH₃, SO₂) using specific qualitative assays.",
    materials: ["Test Tubes", "Glowing Splint", "Burning Splint", "Limewater", "Litmus Paper", "K₂Cr₂O₇ Paper"],
    requiredChemicalIds: ["h2_gas", "o2_gas", "co2_gas", "cl2_gas", "h2s_gas", "so2_gas", "no2_gas"],
    steps: [
      "H₂: Apply a burning splint (squeaky pop).",
      "O₂: Apply a glowing splint (relights).",
      "CO₂: Pass through limewater (turns milky).",
      "Cl₂: Test with damp blue litmus (bleaches).",
      "SO₂: Expose to acidified Potassium Dichromate paper (orange to green)."
    ],
    expectedResult: "Each gas yields its classic diagnostic reaction flawlessly.",
    theoreticalEquation: "2H₂ + O₂ -> 2H₂O | 3SO₂ + Cr₂O₇²⁻ + 2H⁺ -> 2Cr³⁺ (Green) + 3SO₄²⁻ + H₂O",
    dwsimProof: {
      reactionType: "Combustion & Qualitative Redox Assays",
      notes: "Dichromate reduction proves the strong reducing nature of SO₂ gas."
    }
  },
  {
    id: 7,
    title: "Systematic Identification of an Unknown Salt",
    section: "Section 2: Qualitative Analysis",
    objective: "To execute a complete multi-step systematic analysis to identify a fully unknown inorganic mixture.",
    materials: ["Test Tubes", "Bunsen Burner", "Litmus Paper", "pH Probe", "Droppers"],
    requiredChemicalIds: ["cuso4_sol", "fecl3_sol", "naoh_dilute", "nh3_dilute", "bacl2_sol", "agno3_sol", "hcl_dilute"],
    steps: [
      "Observe physical appearance and note solubility in water.",
      "Heat a small sample in a dry tube and check for gas evolution or color changes.",
      "Perform systematic cation tests with dilute NaOH and NH₃.",
      "Perform systematic anion assays with BaCl₂ and AgNO₃."
    ],
    expectedResult: "Flawless deductive identification of the salt's cation and anion constituents.",
    theoreticalEquation: "Systematic Matrix Logic Derivation",
    dwsimProof: {
      reactionType: "Multi-Component Matrix Resolution",
      notes: "Combines solubility algorithms with selective coordination and redox reactions."
    }
  },
  {
    id: 8,
    title: "Test for Water & Identification of Pure Water",
    section: "Section 2: Qualitative Analysis",
    objective: "To verify the chemical presence of water with anhydrous copper sulfate and validate physical purity by boiling point measurement.",
    materials: ["Thermometer", "Beaker", "Bunsen Burner", "Watch Glass"],
    requiredChemicalIds: ["ethanol", "hcl_dilute", "cuso4_sol"],
    steps: [
      "Place white anhydrous Copper(II) Sulfate powder onto a watch glass and add sample drops.",
      "To test physical purity, pour 50ml into a beaker, boil strongly, and record the exact temperature plateau."
    ],
    expectedResult: "White anhydrous powder turns intensely blue instantly. The pure water boiling point locks exactly at 100.0 °C.",
    theoreticalEquation: "CuSO₄(s, White) + 5H₂O(l) -> CuSO₄·5H₂O(s, Royal Blue)",
    dwsimProof: {
      reactionType: "Hydration Enthalpy & Phase Transition",
      deltaH: "-78.2 kJ/mol (Exothermic hydration)",
      notes: "Collaborative hydrogen bond networks cause pure water to boil exactly at 100°C at 1 atm."
    }
  },
  {
    id: 9,
    title: "Testing for Reducing and Oxidizing Agents",
    section: "Section 2: Qualitative Analysis",
    objective: "To distinguish between reducing agents (Fe²⁺) and oxidizing agents (KMnO₄, K₂Cr₂O₇) using targeted redox probes.",
    materials: ["Test Tubes", "Droppers", "Conical Flasks"],
    requiredChemicalIds: ["kmno4_sol", "k2cr2o7_sol", "feso4_sol", "na2s2o3_sol", "iodine_sol", "starch_sol"],
    steps: [
      "Add acidified KMnO₄ to an unknown reducing agent and look for rapid purple decolorization.",
      "Add acidified K₂Cr₂O₇ to the sample and look for an orange to green shift.",
      "Mix iodine with starch (blue-black) and add a strong reductant to decolorize it."
    ],
    expectedResult: "KMnO₄ turns purely colorless and K₂Cr₂O₇ turns green in the presence of reducing agents.",
    theoreticalEquation: "2MnO₄⁻ + 10Fe²⁺ + 16H⁺ -> 2Mn²⁺ + 10Fe³⁺ + 8H₂O",
    dwsimProof: {
      reactionType: "Spontaneous Redox Electron Transfer",
      nernstPotential: "E° > +0.70V (Spontaneous overall)",
      notes: "Manganate(VII) and Dichromate(VI) serve as powerful electron acceptors."
    }
  },
  {
    id: 10,
    title: "Paper Chromatography of Food Dyes",
    section: "Section 2: Qualitative Analysis",
    objective: "To separate and compute Rf values of a colorful ink or dye mixture using ascending paper chromatography.",
    materials: ["Chromatography Tank", "Chromatography Paper", "Capillary Tube", "Ruler", "Beaker"],
    requiredChemicalIds: ["ethanol", "cuso4_sol", "fecl3_sol"],
    steps: [
      "Draw a horizontal pencil baseline 1.5 cm from the bottom of the chromatography paper.",
      "Place a concentrated spot of the dye mixture onto the center of the baseline.",
      "Pour 1 cm depth of ethanol/water solvent into the tank.",
      "Hang the paper so the bottom dips in the solvent (below the baseline) and let the solvent rise.",
      "Measure the distance traveled by each separated colored band versus the solvent front."
    ],
    expectedResult: "The mixture separates beautifully into blue, yellow, and green pigment dots traveling at distinct Rf migration speeds.",
    theoreticalEquation: "Rf = (Distance traveled by specific spot) / (Distance traveled by solvent front)",
    dwsimProof: {
      reactionType: "Partition & Adsorption Chromatography",
      notes: "Molecules distribute based on relative partition coefficients between the hydrophilic cellulose and mobile organic solvent."
    }
  },
  {
    id: 11,
    title: "Detection of Functional Groups in Organic Compounds",
    section: "Section 2: Qualitative Analysis",
    objective: "To execute diagnostic assays for alkenes (bromine water), aldehydes (Tollens'/Fehling's), and carboxylic acids (Na₂CO₃).",
    materials: ["Test Tubes", "Water Bath", "Droppers", "Delivery Tube"],
    requiredChemicalIds: ["cyclohexene", "ethanol", "ethanoic_acid", "glucose_sol", "bromine_water", "tollens_reagent", "na2co3_sol"],
    steps: [
      "Test for Alkenes: Shake sample with bromine water (decolorizes instantly).",
      "Test for Aldehydes: Warm with Tollens' reagent in a water bath (silver mirror forms).",
      "Test for Carboxylic Acids: Add Sodium Carbonate solution (effervescence of CO₂)."
    ],
    expectedResult: "Unsaturated hydrocarbons decolorize bromine; Aldehydes create a spectacular silver mirror; Acids liberate CO₂ bubbles.",
    theoreticalEquation: "R-CHO + 2[Ag(NH₃)₂]⁺ + 3OH⁻ --(Heat)--> R-COO⁻ + 2Ag↓ (Silver Mirror) + 4NH₃ + 2H₂O",
    dwsimProof: {
      reactionType: "Selective Functional Group Redox & Addition",
      notes: "Tollens' reagent mildly oxidizes aldehydes while reducing complexed Ag⁺ to elemental metallic silver."
    }
  },
  {
    id: 12,
    title: "Testing for Proteins and Amino Acids (Biuret & Ninhydrin)",
    section: "Section 2: Qualitative Analysis",
    objective: "To identify peptide bonds in proteins using the Biuret assay and detect free amino acids with Ninhydrin.",
    materials: ["Test Tubes", "Water Bath", "Droppers", "Stirring Rod"],
    requiredChemicalIds: ["biuret_sol", "ninhydrin_sol", "naoh_dilute", "cuso4_sol"],
    steps: [
      "Biuret Test: Add 2ml of protein solution to 1ml of NaOH, then add 2 drops of CuSO₄ (turns gorgeous violet/purple).",
      "Ninhydrin Test: Add 1ml of Ninhydrin reagent to an amino acid sample and gently boil in a water bath."
    ],
    expectedResult: "Proteins display an unmistakable deep violet Biuret complex. Free amino acids yield an intense purple/blue hue (Ruhemann's purple).",
    theoreticalEquation: "Cu²⁺ + 4 Peptide NH Groups -> Deep Violet Tetradentate Chelated Complex",
    dwsimProof: {
      reactionType: "Biochemical Coordination Complexation",
      notes: "Copper(II) coordinates firmly to unshared nitrogen electron pairs in polypeptide chains in strongly alkaline media."
    }
  },
  {
    id: 13,
    title: "Tests for Carbohydrates (Reducing Sugars & Starch)",
    section: "Section 2: Qualitative Analysis",
    objective: "To confirm reducing sugars with Benedict's/Fehling's reagent and verify polysaccharides with Iodine.",
    materials: ["Test Tubes", "Water Bath", "Droppers", "Beaker"],
    requiredChemicalIds: ["glucose_sol", "sucrose_sol", "starch_sol", "benedicts_sol", "fehlings_sol", "iodine_sol", "hcl_dilute"],
    steps: [
      "Reducing Sugars: Mix equal volumes of glucose and Benedict's solution, then boil for 5 minutes.",
      "Non-Reducing Sugars (Sucrose): Boil with dilute HCl for acid hydrolysis, neutralize with NaOH, and repeat Benedict's test.",
      "Starch: Drizzle yellow-brown iodine solution onto the sample."
    ],
    expectedResult: "Glucose precipitates brick-red Cu₂O; Hydrolyzed sucrose yields a positive brick-red result; Starch instantly snaps to deep blue-black.",
    theoreticalEquation: "R-CHO + 2Cu²⁺ + 5OH⁻ --(Boil)--> R-COO⁻ + Cu₂O↓ (Brick Red Ppt) + 3H₂O",
    dwsimProof: {
      reactionType: "Alkaline Sugar Oxidation & Helical Intercalation",
      notes: "Reducing sugars tautomerize in alkali to powerful enediol reductants that precipitate cuprous oxide."
    }
  },
  {
    id: 14,
    title: "Testing for Lipids and Fats (Emulsion & Sudan III)",
    section: "Section 2: Qualitative Analysis",
    objective: "To detect lipids using the ethanol emulsion test and confirm degree of unsaturation with bromine water.",
    materials: ["Test Tubes", "Filter Paper", "Droppers", "Beaker"],
    requiredChemicalIds: ["vegetable_oil", "ethanol", "sudan_sol", "bromine_water"],
    steps: [
      "Emulsion Test: Dissolve vegetable oil in 2ml pure ethanol, then pour the mixture vigorously into distilled water.",
      "Sudan III Test: Add Sudan stain to lipid mixture (vibrant red emulsion layer floats on top).",
      "Unsaturation Check: Add bromine water drops and shake."
    ],
    expectedResult: "A dense, milky white cloudy emulsion forms when the lipid-ethanol mix hits water. Unsaturated lipids decolorize bromine water.",
    theoreticalEquation: "Hydrophobic Solvation phase separation in aqueous media",
    dwsimProof: {
      reactionType: "Surfactant Solubility & Phase Emulsification",
      notes: "Lipids are soluble in non-polar organic ethanol but completely insoluble in polar water, coalescing into highly visible micellar droplets."
    }
  },
  {
    id: 15,
    title: "Acid-Base Indicators and Universal pH Measurement",
    section: "Section 2: Qualitative Analysis",
    objective: "To map the complete rainbow spectrum of Universal Indicator and calibrate acid/alkali threshold points.",
    materials: ["Test Tubes", "Spot Plate", "Droppers", "pH Color Chart"],
    requiredChemicalIds: ["hcl_dilute", "ethanoic_acid", "naoh_dilute", "nh3_dilute", "universal_indicator", "phenolphthalein", "methyl_orange"],
    steps: [
      "Place samples of strong acid (HCl), weak acid (ethanoic), pure water, weak base (NH₃), and strong alkali (NaOH) into 5 clean test tubes.",
      "Add 3 drops of Universal Indicator solution into each tube.",
      "Compare the magnificent resulting colors against the standard universal pH rainbow chart."
    ],
    expectedResult: "HCl: Vivid Red (pH 1); Ethanoic: Orange (pH 3); Water: Green (pH 7); NH₃: Purple (pH 11); NaOH: Deep Violet (pH 14).",
    theoreticalEquation: "HIn(Color A) ⇌ H⁺ + In⁻(Color B)",
    dwsimProof: {
      reactionType: "Protonated Chromophore Resonance shifts",
      notes: "Universal indicator contains a precise blend of thymol blue, methyl red, bromothymol blue, and phenolphthalein."
    }
  },
  {
    id: 16,
    title: "Preparation and Testing of Natural Anthocyanin Indicators",
    section: "Section 2: Qualitative Analysis",
    objective: "To prepare powerful natural pH indicators from red cabbage and turmeric and test their titration utility.",
    materials: ["Beakers", "Bunsen Burner", "Filter Funnel", "Test Tubes"],
    requiredChemicalIds: ["hcl_dilute", "naoh_dilute", "ethanol"],
    steps: [
      "Boil finely chopped red cabbage leaves in distilled water for 10 minutes and filter the beautiful purple anthocyanin extract.",
      "Test the cabbage juice with dilute HCl, plain water, and dilute NaOH.",
      "Prepare a turmeric extract in ethanol and test its response to strong alkali."
    ],
    expectedResult: "Red cabbage extract flips from bright red in acid to purple in neutral, and brilliant yellow-green in alkali. Turmeric turns rich deep red-brown in alkali.",
    theoreticalEquation: "Anthocyanin Flavylium Cation (Red) ⇌ Neutral Quinonoidal (Purple) ⇌ Chalcone (Yellow-Green)",
    dwsimProof: {
      reactionType: "Conjugated Electronic Ring Cleavage",
      notes: "Natural plant polyphenols exhibit exquisite pH-dependent structural resonance transitions."
    }
  },
  {
    id: 17,
    title: "Transition Metal Complex Formation (Fe³⁺, Co²⁺, Cu²⁺)",
    section: "Section 2: Qualitative Analysis",
    objective: "To observe multi-colored coordination complex changes by substituting water ligands with ammonia and halides.",
    materials: ["Test Tubes", "Test Tube Rack", "Droppers"],
    requiredChemicalIds: ["cuso4_sol", "fecl3_sol", "nh3_dilute", "hcl_conc"],
    steps: [
      "Place 2ml of Iron(III) Chloride (FeCl₃) solution in a tube and add concentrated HCl (turns intense golden yellow [FeCl₄]⁻).",
      "Place pale blue CuSO₄ in a tube and add concentrated HCl to produce a vibrant green [CuCl₄]²⁻ complex.",
      "Dilute the green copper mix with water to restore the blue [Cu(H₂O)₆]²⁺ state."
    ],
    expectedResult: "Reversible ligand exchange shifts colors flawlessly between green tetrachlorocuprate and royal blue hexaaquacopper complexes.",
    theoreticalEquation: "[Cu(H₂O)₆]²⁺ (Blue) + 4Cl⁻ ⇌ [CuCl₄]²⁻ (Yellow-Green) + 6H₂O",
    dwsimProof: {
      reactionType: "Crystal Field d-Orbital Ligand Splitting",
      notes: "Different ligands alter the energy gap Delta_o between the t2g and eg d-orbitals."
    }
  },
  {
    id: 18,
    title: "Accurate Calibration and Measurement Using a pH Meter",
    section: "Section 2: Qualitative Analysis",
    objective: "To professionally calibrate an electronic pH probe using standard buffer solutions and measure analytical unknowns.",
    materials: ["Electronic pH Meter", "pH 4, 7, and 10 Buffers", "Distilled Water", "Beakers"],
    requiredChemicalIds: ["hcl_dilute", "ethanoic_acid", "naoh_dilute"],
    steps: [
      "Rinse the pH electrode carefully with distilled water and blot dry.",
      "Submerge the probe in pH 7.00 buffer and calibrate the digital zero.",
      "Submerge in pH 4.00 buffer to set the acid slope gradient.",
      "Measure the exact live pH of dilute HCl, ethanoic acid, and NaOH."
    ],
    expectedResult: "The digital pH meter displays exceptionally steady, highly precise two-decimal readings matching theoretical ion activity.",
    theoreticalEquation: "E_cell = E° - (2.303*R*T / F) * pH",
    dwsimProof: {
      reactionType: "Electrochemical Nernst Glass Membrane Potential",
      notes: "The potential difference across the fragile hydrated glass gel layer is strictly proportional to the hydrogen ion concentration gradient."
    }
  },
  {
    id: 19,
    title: "Tests for Oxidation States of Manganese (+2, +4, +6, +7)",
    section: "Section 2: Qualitative Analysis",
    objective: "To demonstrate the magnificent multi-colored oxidation states of manganese by targeted redox manipulation.",
    materials: ["Test Tubes", "Test Tube Rack", "Droppers"],
    requiredChemicalIds: ["kmno4_sol", "mno2_solid", "feso4_sol", "naoh_dilute", "h2so4_dilute"],
    steps: [
      "Mn⁷⁺ (Purple): Inspect standard Potassium Permanganate solution.",
      "Mn⁶⁺ (Green): Add concentrated NaOH to KMnO₄ to generate green manganate(VI).",
      "Mn⁴⁺ (Black): Note solid Manganese Dioxide powder.",
      "Mn²⁺ (Rose Pink): Reduce KMnO₄ with acidified Iron(II) sulfate."
    ],
    expectedResult: "Flawless multi-colored showcase of Manganese transitions: Purple (+7) -> Green (+6) -> Black (+4) -> Pink (+2).",
    theoreticalEquation: "MnO₄⁻ (Purple) + e⁻ ⇌ MnO₄²⁻ (Green) | MnO₄⁻ + 5e⁻ + 8H⁺ ⇌ Mn²⁺ (Pink) + 4H₂O",
    dwsimProof: {
      reactionType: "Multi-Electron Variable Redox Core",
      notes: "Each distinct oxidation state possesses a unique electronic configuration and absorption spectrum."
    }
  },
  {
    id: 20,
    title: "Colorimetry — Determining Solute Concentration",
    section: "Section 2: Qualitative Analysis",
    objective: "To construct a Beer-Lambert calibration curve using known copper sulfate concentrations and quantify an unknown.",
    materials: ["Spectrophotometer / Colorimeter", "Cuvettes", "Pipettes", "Distilled Water"],
    requiredChemicalIds: ["cuso4_sol"],
    steps: [
      "Zero the colorimeter at 630nm using a pure distilled water blank cuvette.",
      "Measure and record the absorbance of 0.1M, 0.2M, 0.4M, 0.6M, 0.8M, and 1.0M standard CuSO₄ solutions.",
      "Plot Absorbance versus Concentration (produces a perfect straight line).",
      "Measure the absorbance of the unknown copper sample and interpolate its precise molarity from the regression line."
    ],
    expectedResult: "A flawless, perfectly linear calibration graph passing through the origin is achieved.",
    theoreticalEquation: "A = log(I₀ / I) = ε · l · c",
    dwsimProof: {
      reactionType: "Beer-Lambert Absorbance Regression",
      notes: "The molar extinction coefficient ε of CuSO₄ remains rigorously constant across the analytical range."
    }
  }
];
