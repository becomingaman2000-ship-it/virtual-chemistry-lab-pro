import { SyllabusExperiment } from "./experimentsCatalog";

export const EXPERIMENTS_51_78: SyllabusExperiment[] = [
  // --- SECTION 5: ELECTROCHEMISTRY (51 - 60) ---
  {
    id: 51,
    title: "Electrolysis of Dilute Sulfuric Acid",
    section: "Section 5: Electrochemistry",
    objective: "To split water into hydrogen and oxygen gas at exact 2:1 volumetric proportions using electric current.",
    materials: ["Electrolytic Cell / Voltameter", "DC Power Supply (6V)", "Connecting Leads", "Gas Collection Syringes"],
    requiredChemicalIds: ["h2so4_dilute"],
    steps: [
      "Fill the voltameter cell with dilute Sulfuric Acid to act as an excellent conductive electrolyte.",
      "Submerge two inert Platinum or Graphite electrodes and connect them to the 6V DC power supply.",
      "Switch on the power and monitor the bubbles ascending simultaneously in both gas collection burettes.",
      "Record the exact volume of gas gathered at the negative Cathode versus the positive Anode."
    ],
    expectedResult: "Hydrogen gas is produced at the Cathode (-) and Oxygen gas at the Anode (+) in exactly a 2:1 volume ratio.",
    theoreticalEquation: "Cathode (-): 2H⁺ + 2e⁻ -> H₂↑ | Anode (+): 2H₂O -> O₂↑ + 4H⁺ + 4e⁻",
    dwsimProof: {
      reactionType: "Electrolytic Water Cleavage",
      nernstPotential: "E°_cell = -1.23 V (Requires external DC voltage > 1.23V to overcome overpotentials)",
      notes: "Faraday's first law proves that the moles of hydrogen evolved is exactly double the moles of oxygen per coulomb of electrical charge passed."
    }
  },
  {
    id: 52,
    title: "Electrolysis of Copper Sulfate (Inert vs Active Electrodes)",
    section: "Section 5: Electrochemistry",
    objective: "To demonstrate how active Copper anodes dissolve to maintain Cu²⁺ concentration, while inert carbon anodes yield oxygen.",
    materials: ["Beakers", "DC Power Supply", "Graphite Electrodes", "Copper Electrodes", "Analytical Balance"],
    requiredChemicalIds: ["cuso4_sol"],
    steps: [
      "Case 1 (Inert Graphite): Electrolyze CuSO₄ for 15 mins (solution pales as Cu²⁺ deposits on cathode and O₂ bubbles at anode).",
      "Case 2 (Active Copper): Use Copper electrodes and reweigh both after current passage."
    ],
    expectedResult: "With active copper electrodes, the Cu Anode dissolves by the exact same mass gained by the Cu Cathode. Solution color remains perfectly constant.",
    theoreticalEquation: "Active Anode: Cu(s) -> Cu²⁺ + 2e⁻ | Cathode: Cu²⁺ + 2e⁻ -> Cu(s)",
    dwsimProof: {
      reactionType: "Electrolytic Refining & Deposition",
      notes: "Active metal anodes possess a significantly lower oxidation threshold potential than water molecules."
    }
  },
  {
    id: 53,
    title: "Commercial Electroplating of Iron Objects",
    section: "Section 5: Electrochemistry",
    objective: "To deposit an exceptionally shiny, pristine pink protective copper layer onto an iron key or nail.",
    materials: ["Beaker", "Iron Key / Nail Cathode", "Pure Copper Plate Anode", "Sandpaper", "DC Power Portal"],
    requiredChemicalIds: ["cuso4_sol", "h2so4_dilute"],
    steps: [
      "Thoroughly polish the iron key with sandpaper and degrease in organic solvent.",
      "Hook the iron key to the negative Cathode (-) terminal and submerge in acidified CuSO₄ solution.",
      "Submerge the pure copper plate as the Anode (+) and apply a steady 3V DC current for 20 minutes."
    ],
    expectedResult: "A flawless, beautifully uniform shiny pink metallic copper coating deposits tightly all over the iron object.",
    theoreticalEquation: "Cu²⁺(aq) + 2e⁻ -> Cu(s, Metallic Layer Plated on Iron Key)",
    dwsimProof: {
      reactionType: "Electrochemical Plating Core",
      notes: "Acidifying the bath significantly improves electrolyte throwing power and conductivity."
    }
  },
  {
    id: 54,
    title: "Validation of Faraday's First and Second Laws of Electrolysis",
    section: "Section 5: Electrochemistry",
    objective: "To prove that gravimetric mass deposited is directly proportional to electrical charge (Coulombs) passed.",
    materials: ["DC Power Supply", "Digital Ammeter", "Stopwatch Timer", "Copper Electrodes", "Analytical Balance"],
    requiredChemicalIds: ["cuso4_sol"],
    steps: [
      "Weigh a perfectly cleaned copper cathode accurately on an analytical balance.",
      "Pass an exceptionally steady 0.50A current through CuSO₄ for exactly 1800 seconds (30 mins).",
      "Rinse, dry, and reweigh the cathode to compute actual experimental mass gained versus theoretical."
    ],
    expectedResult: "Experimental mass perfectly matches the theoretical Faraday calculation ($m = \frac{Q \cdot M}{n \cdot F}$, typically ~0.296g).",
    theoreticalEquation: "Theoretical Mass = (Current in Amps * Time in Seconds * Molar Mass) / (96485 * 2)",
    dwsimProof: {
      reactionType: "Faradaic Gravimetric Electrolysis",
      notes: "Flawless validation of charge quantization ($1 F = 96485$ C/mol of electrons)."
    }
  },
  {
    id: 55,
    title: "Construction of a Simple Daniel Galvanic Cell",
    section: "Section 5: Electrochemistry",
    objective: "To build a classic Daniel voltaic battery and measure its spontaneous standard electromotive force (EMF).",
    materials: ["Beakers (2)", "Voltmeter", "Connecting Leads", "Salt Bridge", "Zinc Electrode", "Copper Electrode"],
    requiredChemicalIds: ["cuso4_sol", "zn_solid", "cu_solid"],
    steps: [
      "Pour 100ml of Zinc Sulfate or dilute acid into Beaker 1 and submerge the shiny Zinc metal plate.",
      "Pour 100ml of vibrant blue Copper(II) Sulfate into Beaker 2 and submerge the shiny Copper plate.",
      "Connect a potassium chloride Salt Bridge linking the two solutions to complete the inner circuit.",
      "Hook the digital Voltmeter leads to the metallic electrodes and observe the stable generated voltage."
    ],
    expectedResult: "The Voltmeter springs to life, displaying a highly stable electromotive force of approximately +1.10 Volts.",
    theoreticalEquation: "Anode (Oxidation): Zn(s) -> Zn²⁺ + 2e⁻ | Cathode (Reduction): Cu²⁺ + 2e⁻ -> Cu(s)",
    dwsimProof: {
      reactionType: "Spontaneous Voltaic Electron Transfer",
      gibbsEnergy: "-212.3 kJ/mol (Highly spontaneous)",
      nernstPotential: "EMF = E°_cathode (0.34V) - E°_anode (-0.76V) = +1.10 Volts",
      notes: "The salt bridge permits K⁺ and Cl⁻ ion migration to prevent counter-voltage charge polarization in the half-cells."
    }
  },
  {
    id: 56,
    title: "Determination of the Electrochemical Activity Series",
    section: "Section 5: Electrochemistry",
    objective: "To rank active metals (Mg, Zn, Fe, Cu) by coupling each half-cell against a standard reference electrode.",
    materials: ["Voltmeter", "Salt Bridges", "Metal Plates (Mg, Zn, Fe, Cu)", "Beakers"],
    requiredChemicalIds: ["cuso4_sol", "zn_solid", "mg_solid", "fe_solid", "cu_solid"],
    steps: [
      "Set up individual 1M salt half-cells for Magnesium, Zinc, Iron, and Copper.",
      "Couple each in sequence to a copper reference cell and record cell EMF voltage.",
      "Arrange the metals from most negative standard electrode potential to most positive."
    ],
    expectedResult: "Flawless standard electrode ranking: Mg (-2.37V) > Zn (-0.76V) > Fe (-0.44V) > Cu (+0.34V).",
    theoreticalEquation: "E°_cell = E°_reduction(Cathode) - E°_reduction(Anode)",
    dwsimProof: {
      reactionType: "Comparative Standard Half-Cell EMF Derivation",
      notes: "Magnesium serves as an exceptionally strong reducing agent, readily donating electrons to transition metal ions."
    }
  },
  {
    id: 57,
    title: "Industrial Electrolysis of Saturated Sodium Chloride (Brine)",
    section: "Section 5: Electrochemistry",
    objective: "To demonstrate the chemistry of the Chlor-Alkali industry, generating chlorine, hydrogen, and caustic soda.",
    materials: ["Electrolytic Cell", "Carbon Electrodes", "DC Power Portal", "Damp Litmus Paper"],
    requiredChemicalIds: ["nacl_sol", "phenolphthalein"],
    steps: [
      "Electrolyze concentrated brine (NaCl solution) using carbon electrodes.",
      "Collect and verify Hydrogen gas at the Cathode (-) and pungent Chlorine gas at the Anode (+).",
      "Add Phenolphthalein into the remaining cell liquor (turns intense magenta pink confirming NaOH)."
    ],
    expectedResult: "Brine splits into H₂ and Cl₂ gas, leaving pure commercial Sodium Hydroxide behind.",
    theoreticalEquation: "2NaCl + 2H₂O -> Cl₂↑ + H₂↑ + 2NaOH",
    dwsimProof: {
      reactionType: "Industrial Chlor-Alkali Electrolysis",
      notes: "Water is reduced at the cathode instead of Na⁺ because the sodium overpotential is exceptionally high."
    }
  },
  {
    id: 58,
    title: "Investigating the Necessary Environmental Conditions for Iron Rusting",
    section: "Section 5: Electrochemistry",
    objective: "To prove that both unbonded oxygen and liquid water are mandatory for iron corrosion, and that salt accelerates it.",
    materials: ["Test Tubes (5)", "Rubber Stoppers", "Iron Nails", "Boiled Water", "Oil Layer", "Calcium Chloride Desiccant"],
    requiredChemicalIds: ["fe_solid", "nacl_sol"],
    steps: [
      "Tube 1: Nail in plain air; Tube 2: Nail in tap water + air; Tube 3: Nail in boiled water + oil layer (no air).",
      "Tube 4: Nail in perfectly dry tube with CaCl₂ desiccant (no water); Tube 5: Nail in salt water + air.",
      "Leave for 7 days and inspect rust scale formation."
    ],
    expectedResult: "Heavy rust scale forms only in Tube 2 (water + air) and Tube 5 (salt water). Tubes 1, 3, and 4 show zero rust.",
    theoreticalEquation: "4Fe(s) + 3O₂ + 2xH₂O -> 2Fe₂O₃·xH₂O(s, Reddish Brown Rust)",
    dwsimProof: {
      reactionType: "Electrochemical Corrosion Oxidation",
      notes: "Dissolved salt significantly increases electrolyte conductivity, accelerating galvanic localized corrosion."
    }
  },
  {
    id: 59,
    title: "Sacrificial Cathodic and Anodic Protection of Iron",
    section: "Section 5: Electrochemistry",
    objective: "To prove how connecting iron to a more active metal (Zinc) absolutely completely completely rust, while Copper accelerates it.",
    materials: ["Petri Dishes", "Agar Jelly", "Phenolphthalein", "Potassium Ferricyanide Indicator", "Iron Nails", "Zn Strip", "Cu Strip"],
    requiredChemicalIds: ["fe_solid", "zn_solid", "cu_solid", "phenolphthalein"],
    steps: [
      "Embed Iron nail alone in agar jelly containing rust indicators (turns deep blue over time confirming Fe²⁺ corrosion).",
      "Embed Iron nail closely contacting a Zinc strip (turns pink at Zn confirming OH⁻, zero blue on Iron!).",
      "Embed Iron nail contacting a Copper strip (intense rapid blue forms all over the Iron nail)."
    ],
    expectedResult: "Zinc acts as a sacrificial anode, oxidizing itself to perfectly preserve the iron nail. Copper forces iron to become the oxidizing anode.",
    theoreticalEquation: "Sacrificial Anode Mechanism: Zn(s) -> Zn²⁺ + 2e⁻ (Protects Iron Flawlessly)",
    dwsimProof: {
      reactionType: "Galvanic Sacrificial Protection",
      notes: "Zinc possesses a more negative electrode potential than Iron, supplying electrons to polarize Iron as the protected cathode."
    }
  },
  {
    id: 60,
    title: "Chemistry of the Reversible Lead-Acid Storage Battery",
    section: "Section 5: Electrochemistry",
    objective: "To demonstrate the multi-electron charging and discharging chemistry of a commercial car storage cell.",
    materials: ["Two Pure Lead Plates", "Dilute H₂SO₄ Electrolyte", "DC Charging Portal", "LED Bulb System"],
    requiredChemicalIds: ["fe_solid", "h2so4_dilute"],
    steps: [
      "Submerge two perfectly grey Lead (Pb) plates in dilute H₂SO₄.",
      "Apply 6V DC charging current for 15 mins (Anode oxidizes to a deep brown layer of commercial Lead(IV) Oxide PbO₂).",
      "Disconnect charger and hook an LED bulb across the plates (the bulb glows brightly as the cell spontaneously discharges!)."
    ],
    expectedResult: "Reversible redox transformation. The lead plates store electrical energy and deliver a powerful 2.0V EMF upon discharge.",
    theoreticalEquation: "Discharge: Pb + PbO₂ + 2H₂SO₄ -> 2PbSO₄ (Lead Sulfate) + 2H₂O",
    dwsimProof: {
      reactionType: "Reversible Storage Cell Redox Logic",
      notes: "Sulfuric acid is actively consumed during battery discharge, lowering electrolyte specific gravity."
    }
  },

  // --- SECTION 6: RATES OF REACTION / KINETICS (61 - 70) ---
  {
    id: 61,
    title: "Reaction Rate — The Iodine Clock Experiment",
    section: "Section 6: Rates of Reaction",
    objective: "To observe the spectacular sudden color snap of the Iodine Clock and verify how reactant concentration determines reaction time.",
    materials: ["Conical Flasks", "Stopwatch", "Measuring Cylinders", "Beakers", "Stirring Rod"],
    requiredChemicalIds: ["kio3_sol", "na2s2o3_sol", "h2so4_dilute", "starch_sol"],
    steps: [
      "Pour 20ml of Potassium Iodate (KIO₃) solution into the conical flask.",
      "In a separate beaker, combine 10ml of Sodium Thiosulfate (Na₂S₂O₃), 10ml of dilute H₂SO₄, and 3ml of Starch indicator.",
      "Pour the beaker contents into the flask, hit the Stopwatch instantly, and swirl steadily.",
      "Stare at the clear liquid and stop the timer the exact millisecond the solution suddenly flashes to an opaque deep blue-black."
    ],
    expectedResult: "The liquid remains completely transparent for many seconds, then abruptly flashes to pitch blue-black in a single split second!",
    theoreticalEquation: "IO₃⁻ + 3HSO₃⁻ -> I⁻ + 3SO₄²⁻ + 3H⁺ | IO₃⁻ + 5I⁻ + 6H⁺ -> 3I₂ + 3H₂O | I₂ + 2S₂O₃²⁻ -> 2I⁻ + S₄O₆²⁻",
    dwsimProof: {
      reactionType: "Chemical Kinetics & Clock Delay",
      notes: "The generated iodine is instantly consumed by thiosulfate until the exact moment thiosulfate runs out entirely. The liberated iodine then binds starch instantly."
    }
  },
  {
    id: 62,
    title: "Effect of Temperature on Reaction Rate (Sodium Thiosulfate & HCl)",
    section: "Section 6: Rates of Reaction",
    objective: "To prove that increasing reaction temperature dramatically accelerates rate by monitoring sulfur precipitation clouding time.",
    materials: ["Conical Flask", "Stopwatch", "Thermometer", "Water Baths (20°C to 60°C)", "Paper marked with an X"],
    requiredChemicalIds: ["na2s2o3_sol", "hcl_dilute"],
    steps: [
      "Place a conical flask containing 50ml Na₂S₂O₃ over a paper marked with a bold X.",
      "Bring the liquid to 20 °C, add 5ml HCl, hit the stopwatch, and stare down through the liquid until the X disappears.",
      "Repeat the experiment accurately at 30 °C, 40 °C, 50 °C, and 60 °C.",
      "Plot Reaction Rate ($1/t$) versus Temperature."
    ],
    expectedResult: "Reaction rate approximately doubles approximately every 10 °C rise in temperature. The X gets obscured almost instantly at 60 °C.",
    theoreticalEquation: "Na₂S₂O₃ + 2HCl -> S↓ (Opaque Yellow Precipitate) + SO₂↑ + 2NaCl + H₂O",
    dwsimProof: {
      reactionType: "Disproportionation Activation Energy Tracking",
      notes: "Higher temperature dramatically increases the fraction of successful molecular collisions exceeding the activation threshold Delta_E."
    }
  },
  {
    id: 63,
    title: "Effect of Solid Surface Area on Reaction Rate (Marble Chips)",
    section: "Section 6: Rates of Reaction",
    objective: "To demonstrate how smaller solid particle size (fine powder) vastly accelerates gas evolution compared to large solid lumps.",
    materials: ["Conical Flask", "Gas Syringe / Analytical Balance", "Stopwatch", "Equal Masses of CaCO₃"],
    requiredChemicalIds: ["caco3_solid", "hcl_dilute"],
    steps: [
      "Case 1 (Large Chips): React 10g of large marble lumps with 50ml HCl and record CO₂ volume collected every minute.",
      "Case 2 (Fine Powder): React exactly 10g of fine marble powder with equal HCl under identical conditions.",
      "Compare the gradients of both volumetric production curves."
    ],
    expectedResult: "The fine powder reacts incredibly rapidly (extremely steep initial gradient) but both reactions ultimately produce the exact same total CO₂ volume.",
    theoreticalEquation: "CaCO₃(s) + 2HCl(aq) -> CaCl₂ + H₂O + CO₂↑",
    dwsimProof: {
      reactionType: "Heterogeneous Solid-Liquid Interface Kinetics",
      notes: "Grinding solid lumps multiplies the exposed reactive two-dimensional surface area available for successful hydronium ion collisions."
    }
  },
  {
    id: 64,
    title: "Catalytic Decomposition of Hydrogen Peroxide (MnO₂ Catalyst)",
    section: "Section 6: Rates of Reaction",
    objective: "To prove how a solid heterogeneous catalyst dramatically lowers activation energy to speed up reaction rate.",
    materials: ["Conical Flask", "Gas Syringe", "Stopwatch", "Glowing Splint", "Spatula"],
    requiredChemicalIds: ["h2o2_sol", "mno2_solid"],
    steps: [
      "Pour 50ml of Hydrogen Peroxide (H₂O₂) solution into the conical flask.",
      "Note the extremely slow natural bubbling rate.",
      "Add one spatula scoop of black solid Manganese Dioxide (MnO₂) powder into the flask.",
      "Watch an instant furious eruption of fizzing, capture the evolving oxygen gas, and verify it relights a glowing splint!"
    ],
    expectedResult: "Adding black MnO₂ triggers a furious, rapid eruption of oxygen bubbles and warm exothermic steam. The catalyst is fully recoverable at the end.",
    theoreticalEquation: "2H₂O₂(aq) --(MnO₂ Catalyst)--> 2H₂O(l) + O₂↑",
    dwsimProof: {
      reactionType: "Catalytic Disproportionation",
      deltaH: "-196.2 kJ/mol",
      kineticsRate: "Activation energy lowered from 75 kJ/mol (uncatalyzed) to 58 kJ/mol (catalyzed)",
      notes: "MnO₂ provides an alternative reaction pathway with a significantly lower transition state barrier, increasing the rate constant k exponentially."
    }
  },
  {
    id: 65,
    title: "Continuous Kinetic Tracking via Gas Syringe Volumetry",
    section: "Section 6: Rates of Reaction",
    objective: "To continuously track a reaction progress curve from start to plateau exhaustion by gathering hydrogen gas.",
    materials: ["Conical Flask with Side Arm", "Gas Syringe Portal", "Stopwatch", "Analytical Balance"],
    requiredChemicalIds: ["zn_solid", "h2so4_dilute"],
    steps: [
      "Place 2g of Zinc granules into a flask connected to a 100ml gas syringe.",
      "Pour in 50ml dilute H₂SO₄, stopper instantly, and record syringe volume every 15 seconds.",
      "Plot Gas Volume versus Time to inspect reactant depletion dynamics."
    ],
    expectedResult: "An excellent scientific kinetic curve. Initial steep linear climb flattens gradually as acid and zinc get exhausted.",
    theoreticalEquation: "Zn + H₂SO₄ -> ZnSO₄ + H₂↑",
    dwsimProof: {
      reactionType: "Single Displacement Reaction Volumetry",
      notes: "The instantaneous reaction rate is directly proportional to the slope tangent ($dV/dt$) at any given curve point."
    }
  },
  {
    id: 66,
    title: "Determination of Reaction Activation Energy (Arrhenius Derivation)",
    section: "Section 6: Rates of Reaction",
    objective: "To construct an authentic Arrhenius plot ($\ln k$ vs $1/T$) from multi-temperature experimental data to extract exact $E_a$.",
    materials: ["Multi-Temperature Kinetics Setup", "Thermometer", "Scientific Calculator Profile"],
    requiredChemicalIds: ["kio3_sol", "na2s2o3_sol"],
    steps: [
      "Measure exact reaction rate constants ($k$) across 5 highly controlled temperature baths.",
      "Convert Celsius to absolute Kelvin ($T$) and compute reciprocal $1/T$.",
      "Compute natural logarithm $\ln k$ and plot $\ln k$ versus $1/T$.",
      "Compute exact Activation Energy $E_a$ from the regression line gradient."
    ],
    expectedResult: "A flawless straight line with a negative slope (-E_a / R) is formed, allowing exceptionally reliable extraction of $E_a$ (typically ~52.4 kJ/mol).",
    theoreticalEquation: "k = A * e^(-E_a / R*T) | ln k = ln A - (E_a / R) * (1 / T)",
    dwsimProof: {
      reactionType: "Arrhenius Exponential Regression",
      notes: "Rigorous mathematical proof that thermal activation follows Boltzmann exponential statistical mechanics."
    }
  },
  {
    id: 67,
    title: "Monitoring Reaction Rates Spectrophotometrically (Colorimetry)",
    section: "Section 6: Rates of Reaction",
    objective: "To continuously record the fading absorbance curve of a colored organic reactant (Crystal Violet) reacting with NaOH.",
    materials: ["Colorimeter Portal", "CuvettesPortal", "Data Logger profile", "Stopwatch"],
    requiredChemicalIds: ["phenolphthalein", "naoh_dilute"],
    steps: [
      "Combine dilute Crystal Violet or Phenolphthalein with standard NaOH in a cuvette.",
      "Lock inside the colorimeter and record live absorbance at 590nm every 10 seconds.",
      "Graph Absorbance versus Time to determine kinetic reaction order."
    ],
    expectedResult: "A beautiful, exceptionally smooth exponential decay curve is obtained, demonstrating first-order dependency on the organic chromophore.",
    theoreticalEquation: "Colored Chromophore + OH⁻ -> Colorless Carbinol Base",
    dwsimProof: {
      reactionType: "Spectrophotometric First-Order Regression",
      notes: "Flawless real-time validation without needing intrusive manual chemical sampling or quenching."
    }
  },
  {
    id: 68,
    title: "Heterogeneous Catalysis — Laboratory Catalytic Cracking",
    section: "Section 6: Rates of Reaction",
    objective: "To demonstrate the pyrolytic breakdown of heavy liquid liquid over hot solid alumina catalyst into lightweight alkenes.",
    materials: ["Hard Glass Cracking Tube", "Alumina Catalyst Profile", "Bunsen Burner", "Gas Collection Assembly"],
    requiredChemicalIds: ["vegetable_oil", "bromine_water"],
    steps: [
      "Pack the middle of a hard glass tube with solid alumina (Al₂O₃) catalyst beads.",
      "Soak mineral wool in heavy liquid paraffin/oil and push to the closed tube end.",
      "Roast the alumina catalyst section with a roaring blue Bunsen flame, then gently warm the oil to vaporize it over the hot beads.",
      "Collect cracked gases over water and test their reaction with bromine water."
    ],
    expectedResult: "The heavy paraffin cracks successfully, evolving lightweight flammable gases (ethene/propene) that instantly decolorize orange bromine water.",
    theoreticalEquation: "C₁₆H₃₄(heavy alkane) --(Hot Alumina Al₂O₃)--> C₈H₁₈ + C₆H₁₂ + C₂H₄ (Alkenes)",
    dwsimProof: {
      reactionType: "Solid-Acid Catalyzed Hydrocarbon Cracking",
      notes: "Alumina acts as a powerful solid Lewis acid to initiate highly stable carbocation intermediates."
    }
  },
  {
    id: 69,
    title: "Enzyme Kintetics — Michaelis-Menten Substrate Saturation",
    section: "Section 6: Rates of Reaction",
    objective: "To prove why biological enzyme catalysts reach a velocity plateau ($V_{max}$) upon saturating active binding sites with substrate.",
    materials: ["Catalase Enzyme Profile", "Hydrogen Peroxide Solutions (1% to 10%)", "Gas Syringe Setup", "Stopwatch"],
    requiredChemicalIds: ["yeast_solid", "h2o2_sol"],
    steps: [
      "Prepare a standard active yeast catalase enzyme suspension in 5 test tubes.",
      "Add increasing substrate concentrations of H₂O₂ (1%, 2%, 4%, 8%, 10%) into each tube.",
      "Record the exact volume of oxygen gas liberated in the first 60 seconds.",
      "Plot Reaction Velocity versus Substrate Concentration."
    ],
    expectedResult: "Reaction rate climbs linearly initially, then curves nicely to an absolute horizontal plateau ($V_{max}$) saturation threshold.",
    theoreticalEquation: "V = (V_max * [S]) / (K_m + [S]) (Michaelis-Menten Equation)",
    dwsimProof: {
      reactionType: "Enzymatic Saturation Kinetics",
      notes: "Once every enzyme active pocket is occupied by a substrate molecule, increasing substrate concentration cannot further increase velocity."
    }
  },
  {
    id: 70,
    title: "Investigating How Gas Concentration (Pressure) Controls Reaction Velocity",
    section: "Section 6: Rates of Reaction",
    objective: "To simulate how compressing reacting gases multiplies collision frequency and reaction rate constants.",
    materials: ["Gas Syringe Systems", "Magnesium Ribbon", "Hydrochloric Acid Reagents"],
    requiredChemicalIds: ["mg_solid", "hcl_dilute", "hcl_conc"],
    steps: [
      "Simulate high pressure by contrasting highly concentrated 12M HCl against dilute 1M HCl reacting with equal Magnesium strips.",
      "Record the explosive volumetric production of hydrogen gas in both chambers.",
      "Demonstrate why doubling gaseous partial pressure doubles collision frequency."
    ],
    expectedResult: "The highly concentrated/compressed simulation erupts with immense rapid fury compared to the sluggish dilute chamber.",
    theoreticalEquation: "Collision Rate Constant Z_AB directly proportional to gaseous partial pressure Partial_P",
    dwsimProof: {
      reactionType: "Gaseous Collision Frequency Modeling",
      notes: "Flawless thermodynamic proof of why high pressure is mandatory for industrial gas syntheses."
    }
  },

  // --- SECTION 7: THERMOCHEMISTRY (71 - 78) ---
  {
    id: 71,
    title: "Determination of Enthalpy of Neutralization",
    section: "Section 7: Thermochemistry",
    objective: "To accurately measure the heat released during acid-base neutralization using a coffee-cup calorimeter.",
    materials: ["Coffee Cup Calorimeter (Polystyrene)", "Thermometer (0.1°C)", "Measuring Cylinders", "Stopwatch"],
    requiredChemicalIds: ["hcl_dilute", "naoh_dilute"],
    steps: [
      "Measure exactly 50.0 ml of 1.0M HCl into the polystyrene cup calorimeter and record its steady baseline temperature.",
      "Measure exactly 50.0 ml of 1.0M NaOH in a separate cylinder and verify it is at the exact same temperature.",
      "Pour the NaOH quickly into the acid cup, seal the insulating lid, stir steadily, and record the absolute peak temperature reached."
    ],
    expectedResult: "The temperature climbs rapidly by approximately 6.8 °C. The computed standard molar enthalpy is beautifully close to -57 kJ/mol.",
    theoreticalEquation: "H⁺(aq) + OH⁻(aq) -> H₂O(l) | q = m * c * DeltaT | DeltaH = -q / moles",
    dwsimProof: {
      reactionType: "Thermochemical Calorimetry",
      deltaH: "-57.1 kJ/mol (Standard Enthalpy of Water Formation from Ions)",
      notes: "Polystyrene prevents adiabatic heat loss to the surroundings. The specific heat capacity c of the dilute mixture is taken as 4.18 J/(g·°C)."
    }
  },
  {
    id: 72,
    title: "Gravimetric Determination of Enthalpy of Combustion of Commercial Alcohols",
    section: "Section 7: Thermochemistry",
    objective: "To quantify the kilojoules of heat released per mole of burned Methanol, Ethanol, and Butanol using a copper calorimeter.",
    materials: ["Spirit Burners with Lids", "Copper Calorimeter Can", "Thermometer System", "Analytical Balance", "Draught Shield"],
    requiredChemicalIds: ["methanol", "ethanol", "butanol"],
    steps: [
      "Weigh a spirit burner containing pure Methanol accurately on an analytical balance.",
      "Place 200ml distilled water into the copper calorimeter can and record initial water temperature.",
      "Ignite the spirit lamp beneath the can, stir the water steadily, and heat by exactly 30.0 °C.",
      "Snuff out the lamp, reweigh the burner to find mass of alcohol burned, and repeat for Ethanol."
    ],
    expectedResult: "Ethanol liberates significantly more kilojoules per gram than Methanol. Computed DeltaH values closely mirror standard reference literature.",
    theoreticalEquation: "q = m_water * 4.18 * DeltaT | DeltaH_combustion = -q / Moles Alcohol Burned",
    dwsimProof: {
      reactionType: "Aliphatic Alcohol Heat of Combustion",
      notes: "Adding CH₂ groups extends the hydrocarbon aliphatic chain, increasing standard combustion enthalpy systematically."
    }
  },
  {
    id: 73,
    title: "Experimental Verification of Hess's Law of Constant Heat Summation",
    section: "Section 7: Thermochemistry",
    objective: "To prove that total enthalpy change is completely identical whether a reaction executes in one direct jump or two multi-step stages.",
    materials: ["Polystyrene Coffee Cup Calorimeter", "Thermometer", "Analytical Balance"],
    requiredChemicalIds: ["naoh_dilute", "hcl_dilute"],
    steps: [
      "Route 1 (Direct): Measure enthalpy of reacting solid NaOH directly with dilute HCl.",
      "Route 2 (Stepwise): Measure Stage A (dissolving solid NaOH in water) + Stage B (neutralizing aqueous NaOH with HCl).",
      "Verify that DeltaH(Route 1) perfectly equals DeltaH(Stage A) + DeltaH(Stage B)."
    ],
    expectedResult: "Flawless mathematical mathematical identical thermodynamic summation independent of the intermediate route.",
    theoreticalEquation: "DeltaH_total = Sum of multi-step individual enthalpy increments",
    dwsimProof: {
      reactionType: "Thermodynamic State Function Validation",
      notes: "Enthalpy is a fundamental state function dependent strictly on initial and final states, not path history."
    }
  },
  {
    id: 74,
    title: "Comparative Enthalpy of Dissolution for Exothermic & Endothermic Salts",
    section: "Section 7: Thermochemistry",
    objective: "To quantify how dissolving salts can cause powerful endothermic freezing (NH₄NO₃) or intense exothermic boiling (CaCl₂).",
    materials: ["Polystyrene Calorimeter Setup", "Thermometer", "Analytical Balance"],
    requiredChemicalIds: ["cacl2_sol", "nh4cl_sol"],
    steps: [
      "Pour 100ml distilled water into the calorimeter and record steady baseline temperature.",
      "Case 1 (Endothermic): Mix in 10g of Ammonium Nitrate/Chloride salt (temperature drops steeply simulating commercial cold packs!).",
      "Case 2 (Exothermic): Mix in 10g of Calcium Chloride (temperature climbs rapidly simulating military hot packs!)."
    ],
    expectedResult: "Ammonium salts produce spectacular endothermic cooling, while Calcium Chloride liberates intense exothermic warming.",
    theoreticalEquation: "DeltaH_solution = Lattice Dissociation Energy + Hydration Solvation Enthalpies",
    dwsimProof: {
      reactionType: "Salt Solvation Thermodynamics",
      notes: "When hydration energy exceeds crystal lattice energy, the net dissolution is highly exothermic."
    }
  },
  {
    id: 75,
    title: "Experimental Calculation vs Theoretical Bond Energy Appraisals",
    section: "Section 7: Thermochemistry",
    objective: "To calculate gaseous reaction enthalpy by summing broken versus formed covalent bond dissociation energies.",
    materials: ["Gaseous Burner Assembly", "Calorimeter System", "Theoretical Bond Reference Table"],
    requiredChemicalIds: ["h2_gas", "o2_gas"],
    steps: [
      "Burn a precise volume of Hydrogen or Methane gas under a calibrated copper calorimeter.",
      "Compute experimental DeltaH from water temperature rise.",
      "Compute theoretical DeltaH by subtracting formed bond energies from broken bond energies.",
      "Compare the experimental thermodynamic precision."
    ],
    expectedResult: "Exceptional agreement between calculated covalent bond dissociation totals and empirical physical thermometry.",
    theoreticalEquation: "DeltaH_reaction = Sum of Bonds Broken (Endothermic) - Sum of Bonds Formed (Exothermic)",
    dwsimProof: {
      reactionType: "Covalent Bond Dissociation Calculations",
      notes: "Flawless validation of structural thermochemical regression matrices."
    }
  },
  {
    id: 76,
    title: "Construction of an Advanced Born-Haber Cycle for Sodium Chloride",
    section: "Section 7: Thermochemistry",
    objective: "To compute the exact Crystal Lattice Energy of NaCl by resolving the Born-Haber thermodynamic loop.",
    materials: ["Scientific Calculator Profile", "Standard Thermodynamic Reference Data Hub"],
    requiredChemicalIds: ["nacl_sol"],
    steps: [
      "Retrieve empirical data: DeltaH_formation (-411 kJ/mol), Na atomization (+108), Na Ionization Energy (+496), Cl₂ atomization (+121), Cl Electron Affinity (-349).",
      "Set up the closed thermodynamic loop equation according to Hess's Law.",
      "Resolve the exact unknown Crystal Lattice Energy LE."
    ],
    expectedResult: "Flawless extraction yielding exactly LE = -787 kJ/mol for the pristine sodium chloride ionic lattice.",
    theoreticalEquation: "DeltaH_f = DeltaH_atom(Na) + IE(Na) + DeltaH_atom(Cl) + EA(Cl) + Lattice Energy LE",
    dwsimProof: {
      reactionType: "Thermodynamic Born-Haber Matrix Resolution",
      notes: "Exceptionally reliable analytical method to determine non-measurable solid crystal packing energies."
    }
  },
  {
    id: 77,
    title: "Comparative Precision Appraisals: Coffee Cup vs High-Pressure Bomb Calorimetry",
    section: "Section 7: Thermochemistry",
    objective: "To investigate why high-pressure oxygen Bomb Calorimeters outperform open polystyrene coffee cups for combustion assays.",
    materials: ["Calorimeter Can", "Bomb Calorimeter Data Portal", "Analytical Balance"],
    requiredChemicalIds: ["ethanol"],
    steps: [
      "Contrast open-vessel simple calorimetry (subject to evaporation and draught heat losses) against adiabatic constant-volume bomb systems.",
      "Apply specific heat capacity corrections for the metallic container apparatus ($C_{cal}$ corrections).",
      "Demonstrate professional analytical data reconciliation."
    ],
    expectedResult: "Bomb calorimetry reconciliation provides virtually flawless DeltaH accuracy matching exact NIST standard references.",
    theoreticalEquation: "q_total = q_water + q_bomb apparatus (C_cal * DeltaT)",
    dwsimProof: {
      reactionType: "Adiabatic Constant-Volume Thermometry",
      notes: "Ensures absolutely zero unmeasured energy escapes as uncaptured hot combustion vapors."
    }
  },
  {
    id: 78,
    title: "Solar Energy Trapping & Silver Halide Photochemistry",
    section: "Section 7: Thermochemistry",
    objective: "To demonstrate how visible solar photons provide energy to homolytically cleave Silver Halide bonds into metallic grey silver.",
    materials: ["Filter Paper", "Opaque Object Templates", "Sunlight Portal", "Droppers"],
    requiredChemicalIds: ["agno3_sol", "nacl_sol"],
    steps: [
      "Mix AgNO₃ with NaCl to precipitate curdy white Silver Chloride (AgCl) in a dark room.",
      "Coat a filter paper strip with the white AgCl suspension and place an opaque key over the center.",
      "Expose directly to bright solar UV light for 10 minutes.",
      "Remove the key and observe the spectacular photographic silhouette."
    ],
    expectedResult: "The unmasked areas exposed to sunlight turn dark grey/black (elemental silver). The area masked by the key remains perfectly pristine white.",
    theoreticalEquation: "2AgCl(s, White) --(Solar UV Light h*nu)--> 2Ag↓ (Grey Metallic Silhouette) + Cl₂↑",
    dwsimProof: {
      reactionType: "Photochemical Solid-State Redox Cleavage",
      notes: "This fundamental light-driven redox reduction forms the chemical foundation of classical analogue photography."
    }
  }
];
