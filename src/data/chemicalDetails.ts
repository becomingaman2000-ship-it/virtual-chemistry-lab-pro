/**
 * ChemVM — per-chemical detail.
 *
 * `chemicals.ts` carries the numbers a renderer needs (colour, phase, a few
 * physical constants). That is not enough to *learn* from: a flame test has no
 * boiling point, an indicator has no useful density, and a card showing six
 * dashes teaches nothing. This file carries the part a student actually reads —
 * what the substance looks like in the bottle, how it behaves, how you identify
 * it, and how to handle it — plus category-appropriate extra stats.
 *
 * Everything here is O-/A-level syllabus content (ZIMSEC, Cambridge IGCSE).
 */

export interface DetailStat {
  label: string;
  value: string;
}

export interface ChemicalDetail {
  /** What it actually looks like on the bench. */
  appearance: string;
  /** Smell, where it is safe and normal to note one. */
  odour?: string;
  /** Category-appropriate figures the shared stat grid cannot express. */
  stats?: DetailStat[];
  /** Characteristic reactions, written the way a syllabus states them. */
  reactions?: string[];
  /** How you confirm this substance is present. */
  tests?: string[];
  /** School-lab handling, beyond the hazard pictograms. */
  safety?: string;
}

export const CHEMICAL_DETAILS: Record<string, ChemicalDetail> = {
  /* ---------------------------------------------------------------- ACIDS */
  hcl: {
    appearance: "Colourless, mobile solution — indistinguishable from water by eye.",
    odour: "Sharp and choking when concentrated; dilute bench acid is almost odourless.",
    stats: [
      { label: "Bench strength", value: "1.0 mol/dm³" },
      { label: "Acid type", value: "Strong, monobasic" },
      { label: "Ionisation", value: "Complete — HCl → H⁺ + Cl⁻" },
    ],
    reactions: [
      "Metal + acid → salt + hydrogen: Zn + 2HCl → ZnCl₂ + H₂",
      "Carbonate + acid → salt + water + carbon dioxide: CaCO₃ + 2HCl → CaCl₂ + H₂O + CO₂",
      "Base + acid → salt + water: NaOH + HCl → NaCl + H₂O",
    ],
    tests: [
      "Turns blue litmus red and universal indicator red (pH 1).",
      "Chloride ion: add dilute HNO₃ then AgNO₃ → white precipitate, soluble in ammonia.",
    ],
    safety: "Corrosive above 2 mol/dm³. Add acid to water, never water to acid.",
  },
  h2so4: {
    appearance: "Colourless, oily and noticeably viscous — it pours slowly.",
    stats: [
      { label: "Bench strength", value: "1.0 mol/dm³ (conc. is 18 mol/dm³)" },
      { label: "Acid type", value: "Strong, dibasic" },
      { label: "Dilution", value: "Strongly exothermic" },
    ],
    reactions: [
      "Dibasic, so it forms two salts: NaHSO₄ (acid salt) and Na₂SO₄ (normal salt).",
      "Mg + H₂SO₄ → MgSO₄ + H₂",
      "Concentrated acid dehydrates sugar: C₁₂H₂₂O₁₁ → 12C + 11H₂O (black column).",
    ],
    tests: ["Sulfate ion: acidify with dilute HCl, add BaCl₂ → white precipitate of BaSO₄."],
    safety:
      "The concentrated acid dehydrates skin and burns on contact. Always add the acid to the water — the reverse boils and spits.",
  },
  hno3: {
    appearance: "Colourless when fresh; older bottles go pale yellow as dissolved NO₂ builds up.",
    odour: "Acrid.",
    stats: [
      { label: "Acid type", value: "Strong, monobasic" },
      { label: "Also acts as", value: "Powerful oxidising agent" },
    ],
    reactions: [
      "With most metals it gives NO or NO₂ rather than hydrogen — nitric acid is the exception to the metal + acid rule.",
      "Cu + 4HNO₃(conc) → Cu(NO₃)₂ + 2NO₂ + 2H₂O (brown fumes)",
    ],
    tests: [
      "Nitrate ion: brown ring test — add FeSO₄, then concentrated H₂SO₄ down the side of the tube.",
    ],
    safety: "Stains skin yellow (it reacts with protein). Keep away from organic material.",
  },
  ch3cooh: {
    appearance: "Colourless liquid; the glacial acid freezes to ice-like crystals below 17 °C.",
    odour: "Vinegar.",
    stats: [
      { label: "Acid type", value: "Weak, monobasic" },
      { label: "pKa", value: "4.76" },
      { label: "Ionisation", value: "Partial — about 1% at bench strength" },
    ],
    reactions: [
      "CH₃COOH ⇌ CH₃COO⁻ + H⁺ — the equilibrium lies well to the left.",
      "Esterification: CH₃COOH + C₂H₅OH ⇌ CH₃COOC₂H₅ + H₂O (conc. H₂SO₄ catalyst, fruity smell).",
    ],
    tests: [
      "Fizzes with sodium carbonate — that rules out alcohols and phenols.",
      "pH about 3 at the same concentration where HCl reads 1: the classic strong-vs-weak comparison.",
    ],
    safety: "Glacial ethanoic acid is corrosive and its vapour irritates the eyes.",
  },
  h3po4: {
    appearance: "Colourless, syrupy liquid.",
    stats: [
      { label: "Acid type", value: "Weak, tribasic" },
      { label: "Salts formed", value: "H₂PO₄⁻, HPO₄²⁻, PO₄³⁻" },
    ],
    reactions: ["Neutralised in three steps, giving three different sodium salts."],
    safety: "Irritant; less aggressive than the mineral acids but still corrosive when concentrated.",
  },
  hcooh: {
    appearance: "Colourless liquid.",
    odour: "Pungent — this is the acid in an ant or nettle sting.",
    stats: [
      { label: "Acid type", value: "Weak, monobasic" },
      { label: "pKa", value: "3.75 — stronger than ethanoic" },
    ],
    reactions: [
      "Uniquely among the carboxylic acids it also behaves as an aldehyde, so it reduces Tollens' and Fehling's reagents.",
    ],
    tests: ["Positive silver-mirror test, unlike ethanoic acid."],
    safety: "Corrosive; blisters skin.",
  },
  h2co3: {
    appearance: "Colourless — it only exists in solution and cannot be bottled pure.",
    stats: [
      { label: "Acid type", value: "Weak, dibasic" },
      { label: "Stability", value: "Decomposes readily to H₂O + CO₂" },
    ],
    reactions: [
      "CO₂ + H₂O ⇌ H₂CO₃ — this is why rain is naturally pH 5.6.",
      "Warming or shaking drives the equilibrium back to CO₂, so the acid fizzes away.",
    ],
    safety: "Essentially harmless at the concentrations reached in the lab.",
  },
  h2s: {
    appearance: "Colourless solution of a colourless gas.",
    odour: "Rotten eggs — but it deadens the sense of smell, which is exactly what makes it dangerous.",
    stats: [
      { label: "Acid type", value: "Weak, dibasic" },
      { label: "Also acts as", value: "Reducing agent" },
    ],
    reactions: [
      "Precipitates coloured metal sulfides: Cu²⁺ → black CuS, Cd²⁺ → yellow CdS.",
      "Reduces acidified dichromate from orange to green.",
    ],
    tests: ["Blackens lead ethanoate paper."],
    safety: "Toxic. Fume cupboard only. Do not rely on the smell as a warning.",
  },

  /* ---------------------------------------------------------------- BASES */
  naoh: {
    appearance: "Colourless solution; the solid pellets are white and go wet in air.",
    stats: [
      { label: "Base type", value: "Strong alkali" },
      { label: "Bench strength", value: "1.0 mol/dm³" },
      { label: "Solid behaviour", value: "Deliquescent — absorbs water from air" },
    ],
    reactions: [
      "Neutralisation: NaOH + HCl → NaCl + H₂O",
      "Precipitates metal hydroxides — Cu²⁺ blue, Fe²⁺ green, Fe³⁺ rust-brown.",
      "Excess NaOH redissolves the amphoteric hydroxides of Al³⁺, Zn²⁺ and Pb²⁺.",
      "Warmed with an ammonium salt it releases NH₃.",
    ],
    tests: ["Turns red litmus blue; phenolphthalein pink; universal indicator violet (pH 14)."],
    safety:
      "More dangerous to eyes than acid of the same strength — it saponifies tissue. Goggles at all times.",
  },
  koh: {
    appearance: "Colourless solution; white deliquescent solid.",
    stats: [
      { label: "Base type", value: "Strong alkali" },
      { label: "vs NaOH", value: "Chemically near-identical, more soluble" },
    ],
    reactions: ["Behaves like NaOH throughout; makes soft soaps rather than hard ones."],
    safety: "Corrosive; treat exactly as sodium hydroxide.",
  },
  nh3: {
    appearance: "Colourless solution.",
    odour: "Sharp and unmistakable; it makes the eyes water.",
    stats: [
      { label: "Base type", value: "Weak alkali" },
      { label: "pKb", value: "4.75" },
      { label: "pH at 1 mol/dm³", value: "About 11.6, not 14" },
    ],
    reactions: [
      "NH₃ + H₂O ⇌ NH₄⁺ + OH⁻ — only partially ionised, hence the weaker alkalinity.",
      "Excess ammonia dissolves Cu(OH)₂ to a deep royal-blue complex, [Cu(NH₃)₄]²⁺.",
      "Also redissolves AgCl, which is how you separate the silver halides.",
    ],
    tests: [
      "Distinguished from NaOH by the smell, and by the fact that its precipitates dissolve in excess for Cu²⁺ and Ag⁺ but not Al³⁺.",
    ],
    safety: "The vapour is a respiratory irritant. Keep the bottle stoppered.",
  },
  "ca(oh)2": {
    appearance: "Cloudy white suspension when fresh; the clear liquid above it is limewater.",
    stats: [
      { label: "Base type", value: "Strong but sparingly soluble" },
      { label: "Solubility", value: "Only 1.7 g/dm³ — hence the milkiness" },
      { label: "Saturated pH", value: "About 12.4" },
    ],
    reactions: [
      "Limewater test: Ca(OH)₂ + CO₂ → CaCO₃ + H₂O (milky).",
      "Excess CO₂ then clears it again: CaCO₃ + CO₂ + H₂O → Ca(HCO₃)₂.",
    ],
    tests: ["The standard confirmatory test for carbon dioxide."],
    safety: "Irritant to eyes and skin; slaked lime is alkaline enough to burn on long contact.",
  },
  "mg(oh)2": {
    appearance: "White solid that settles out as a chalky suspension — milk of magnesia.",
    stats: [
      { label: "Base type", value: "Weak, almost insoluble" },
      { label: "Suspension pH", value: "About 10" },
    ],
    reactions: ["Neutralises stomach acid: Mg(OH)₂ + 2HCl → MgCl₂ + 2H₂O"],
    safety: "Low hazard — it is sold as a medicine.",
  },
  nahco3: {
    appearance: "White crystalline powder; colourless in solution.",
    stats: [
      { label: "Base type", value: "Weakly alkaline salt" },
      { label: "Solution pH", value: "About 8.3" },
      { label: "Decomposes at", value: "50–100 °C" },
    ],
    reactions: [
      "Thermal decomposition: 2NaHCO₃ → Na₂CO₃ + H₂O + CO₂ — the reason it raises a cake.",
      "With acid: NaHCO₃ + HCl → NaCl + H₂O + CO₂ (immediate fizz).",
    ],
    tests: ["Fizzes with dilute acid and gives a gas that turns limewater milky."],
    safety: "Low hazard.",
  },
  na2co3: {
    appearance: "White crystals; the hydrate effloresces to a powder in dry air.",
    stats: [
      { label: "Base type", value: "Alkaline salt of a weak acid" },
      { label: "Solution pH", value: "About 11.5" },
      { label: "Hydrate", value: "Na₂CO₃·10H₂O, washing soda" },
    ],
    reactions: [
      "Carbonate + acid → salt + water + CO₂.",
      "Softens hard water by precipitating Ca²⁺ and Mg²⁺ as their carbonates.",
    ],
    tests: ["Vigorous effervescence with dilute acid; the gas turns limewater milky."],
    safety: "Irritant; the solution is alkaline enough to dry out skin.",
  },

  /* ---------------------------------------------------------------- SALTS */
  cuso4: {
    appearance: "Bright blue crystals; a striking blue solution.",
    stats: [
      { label: "Hydrate", value: "CuSO₄·5H₂O, blue" },
      { label: "Anhydrous", value: "CuSO₄, white" },
      { label: "Solution pH", value: "About 4 — Cu²⁺ hydrolyses slightly" },
    ],
    reactions: [
      "Heating drives off water: CuSO₄·5H₂O ⇌ CuSO₄ + 5H₂O — blue to white, and back on adding water.",
      "With NaOH: pale-blue Cu(OH)₂ precipitate.",
      "With excess ammonia: deep royal-blue [Cu(NH₃)₄]²⁺.",
      "Displacement: Fe + CuSO₄ → FeSO₄ + Cu (pink copper coats the iron).",
    ],
    tests: [
      "Anhydrous copper(II) sulfate turning white → blue is the standard test for water.",
      "Flame test gives blue-green.",
    ],
    safety: "Harmful if swallowed and toxic to aquatic life — do not pour down the sink.",
  },
  fecl3: {
    appearance: "Yellow-brown solution; the solid is almost black.",
    stats: [
      { label: "Oxidation state", value: "Fe(III)" },
      { label: "Solution pH", value: "About 2 — strongly hydrolysed" },
    ],
    reactions: [
      "With NaOH: rust-brown Fe(OH)₃ precipitate, insoluble in excess.",
      "Oxidises iodide: 2Fe³⁺ + 2I⁻ → 2Fe²⁺ + I₂ (brown).",
    ],
    tests: ["Gives an intense violet colour with phenol — the standard phenol test."],
    safety: "Corrosive and staining.",
  },
  feso4: {
    appearance: "Pale green crystals and a pale green solution; goes yellow-brown as it oxidises in air.",
    stats: [
      { label: "Oxidation state", value: "Fe(II)" },
      { label: "Hydrate", value: "FeSO₄·7H₂O, green vitriol" },
      { label: "Stability", value: "Air-oxidises to Fe(III) — make fresh" },
    ],
    reactions: [
      "With NaOH: dirty-green Fe(OH)₂, which browns at the surface as it oxidises.",
      "Decolourises acidified KMnO₄ — Fe²⁺ is a reducing agent.",
    ],
    tests: ["Green precipitate with NaOH; brown ring test for nitrate uses this salt."],
    safety: "Harmful if swallowed.",
  },
  kmno4: {
    appearance: "Almost black needle-like crystals; an intense purple solution even when very dilute.",
    stats: [
      { label: "Role", value: "Strong oxidising agent" },
      { label: "In acid", value: "MnO₄⁻ (purple) → Mn²⁺ (colourless)" },
      { label: "In alkali", value: "MnO₄⁻ → MnO₂ (brown solid)" },
    ],
    reactions: [
      "MnO₄⁻ + 8H⁺ + 5e⁻ → Mn²⁺ + 4H₂O (E° = +1.51 V)",
      "Self-indicating in titration: the first permanent pink is the end point.",
    ],
    tests: ["Decolourised by Fe²⁺, by sulfite, and by C=C double bonds."],
    safety: "Oxidiser — keep away from paper, ethanol and glycerol. Stains skin brown.",
  },
  k2cr2o7: {
    appearance: "Orange crystals; an orange solution.",
    stats: [
      { label: "Role", value: "Oxidising agent (acidified)" },
      { label: "Colour change", value: "Orange Cr₂O₇²⁻ → green Cr³⁺" },
    ],
    reactions: [
      "Cr₂O₇²⁻ + 14H⁺ + 6e⁻ → 2Cr³⁺ + 7H₂O",
      "Oxidises primary alcohols to aldehydes, then to carboxylic acids.",
    ],
    tests: ["Orange-to-green is the classic test for an oxidisable alcohol — and for alcohol in breath."],
    safety: "Toxic and a category-1 carcinogen. Many schools have replaced it.",
  },
  cr2so4: {
    appearance: "Deep green solution.",
    stats: [{ label: "Oxidation state", value: "Cr(III)" }],
    reactions: [
      "With NaOH: grey-green Cr(OH)₃, which redissolves in excess to a green chromite solution — Cr(OH)₃ is amphoteric.",
    ],
    safety: "Harmful; chromium salts are environmental pollutants.",
  },
  nicl2: {
    appearance: "Green crystals and a green solution.",
    stats: [{ label: "Oxidation state", value: "Ni(II)" }],
    reactions: [
      "With NaOH: green Ni(OH)₂, insoluble in excess.",
      "With excess ammonia: blue-violet [Ni(NH₃)₆]²⁺.",
    ],
    safety: "Toxic and a skin sensitiser — nickel is the commonest contact allergen.",
  },
  cocl2: {
    appearance: "Pink when hydrated, blue when dry — the change is fully reversible.",
    stats: [
      { label: "Hydrated", value: "CoCl₂·6H₂O, pink" },
      { label: "Anhydrous", value: "CoCl₂, blue" },
    ],
    reactions: ["[Co(H₂O)₆]²⁺ (pink) ⇌ [CoCl₄]²⁻ (blue) + 6H₂O"],
    tests: ["Blue cobalt chloride paper turning pink is the standard test for water."],
    safety: "Toxic and a suspected carcinogen.",
  },
  agno3: {
    appearance: "Colourless crystals and a colourless solution — it looks like nothing at all.",
    stats: [
      { label: "Used for", value: "Halide identification" },
      { label: "Light", value: "Photosensitive — kept in brown bottles" },
    ],
    reactions: [
      "Ag⁺ + Cl⁻ → AgCl, white, dissolves in dilute ammonia",
      "Ag⁺ + Br⁻ → AgBr, cream, dissolves only in concentrated ammonia",
      "Ag⁺ + I⁻ → AgI, pale yellow, insoluble in ammonia",
    ],
    tests: ["Acidify with dilute nitric acid first, or carbonate gives a false white precipitate."],
    safety: "Corrosive; stains skin black where it is reduced to silver by light.",
  },
  "pb(no3)2": {
    appearance: "White crystals; a colourless solution.",
    stats: [{ label: "Notable", value: "One of the few soluble lead salts" }],
    reactions: [
      "Golden rain: Pb(NO₃)₂ + 2KI → PbI₂ (bright yellow) + 2KNO₃ — dissolve hot, recrystallise as glittering plates.",
      "With NaOH: white Pb(OH)₂, redissolving in excess because it is amphoteric.",
    ],
    tests: ["Yellow precipitate with iodide; white with sulfate and with chloride (chloride dissolves in hot water)."],
    safety: "Toxic and a cumulative poison. Collect the waste — never rinse it away.",
  },
  ki: {
    appearance: "White crystals; a colourless solution that yellows as iodine forms.",
    stats: [{ label: "Role", value: "Iodide source and reducing agent" }],
    reactions: [
      "Oxidised to iodine by chlorine, by Fe³⁺ and by acidified peroxide — the solution turns brown.",
      "Dissolves solid iodine as I₃⁻, which is how iodine solutions are made at all.",
    ],
    tests: ["The brown iodine formed goes blue-black with starch."],
    safety: "Low hazard.",
  },
  nacl: {
    appearance: "White cubic crystals; a colourless solution.",
    stats: [
      { label: "Solution pH", value: "7 — neutral salt of a strong acid and strong base" },
      { label: "Structure", value: "Giant ionic lattice, 6:6 coordination" },
      { label: "Electrolysis", value: "Brine → NaOH + Cl₂ + H₂" },
    ],
    reactions: [
      "Molten NaCl electrolyses to sodium and chlorine; the solution gives hydrogen instead of sodium.",
    ],
    tests: ["Golden-yellow flame; white AgCl precipitate that dissolves in dilute ammonia."],
    safety: "None beyond common sense.",
  },
  caco3: {
    appearance: "White solid — chalk, marble chips or limestone powder.",
    stats: [
      { label: "Solubility", value: "Insoluble in water" },
      { label: "Decomposes at", value: "About 900 °C" },
      { label: "Structure", value: "Giant ionic" },
    ],
    reactions: [
      "Thermal decomposition: CaCO₃ → CaO + CO₂ (the lime kiln).",
      "With acid: CaCO₃ + 2HCl → CaCl₂ + H₂O + CO₂ — the standard rate-of-reaction experiment.",
    ],
    tests: ["Effervescence with dilute acid; the gas turns limewater milky."],
    safety: "Low hazard; the dust is a nuisance irritant.",
  },
  cuco3: {
    appearance: "Green powder — the same green as weathered copper roofs.",
    stats: [{ label: "Decomposes at", value: "About 290 °C" }],
    reactions: ["CuCO₃ → CuO + CO₂ — green to black, a clean demonstration of decomposition."],
    tests: ["Fizzes with acid to give a blue copper(II) solution."],
    safety: "Harmful if swallowed.",
  },
  znso4: {
    appearance: "Colourless crystals and a colourless solution.",
    stats: [{ label: "Solution pH", value: "About 5 — slightly acidic" }],
    reactions: [
      "With NaOH: white Zn(OH)₂ that redissolves in excess — the amphoteric giveaway.",
      "With excess ammonia it also redissolves, as [Zn(NH₃)₄]²⁺.",
    ],
    tests: ["A white precipitate soluble in both excess NaOH and excess ammonia points to Zn²⁺."],
    safety: "Harmful; toxic to aquatic life.",
  },
  mnso4: {
    appearance: "Very pale pink — often mistaken for colourless.",
    stats: [{ label: "Oxidation state", value: "Mn(II)" }],
    reactions: ["With NaOH: off-white Mn(OH)₂ that darkens in air as it oxidises."],
    tests: ["The faint pink is itself the clue that permanganate has been fully reduced."],
    safety: "Harmful.",
  },

  /* --------------------------------------------------------------- METALS */
  na: {
    appearance: "Soft silvery metal, dull grey the moment it is cut and exposed to air.",
    stats: [
      { label: "Group", value: "1 — alkali metal" },
      { label: "With water", value: "Violent; melts to a ball and skates about" },
      { label: "Stored under", value: "Oil" },
    ],
    reactions: [
      "2Na + 2H₂O → 2NaOH + H₂ — the solution turns universal indicator purple.",
      "Burns in air with a golden-yellow flame to Na₂O.",
    ],
    tests: ["Golden-yellow flame test."],
    safety: "Fiercely reactive. Pea-sized pieces only, behind a screen. Never touch with wet hands.",
  },
  k: {
    appearance: "Soft silvery metal; tarnishes even faster than sodium.",
    stats: [
      { label: "Group", value: "1 — alkali metal" },
      { label: "With water", value: "Violent; the hydrogen ignites" },
      { label: "Reactivity", value: "Above sodium — reactivity increases down the group" },
    ],
    reactions: ["2K + 2H₂O → 2KOH + H₂, with a lilac flame as the hydrogen burns."],
    tests: ["Lilac flame — view through cobalt-blue glass to filter out any sodium contamination."],
    safety: "More dangerous than sodium. Demonstration only.",
  },
  mg: {
    appearance: "Silvery ribbon or grey powder; the ribbon needs cleaning with emery paper first.",
    stats: [
      { label: "Group", value: "2" },
      { label: "With cold water", value: "Extremely slow" },
      { label: "With steam", value: "Vigorous → MgO + H₂" },
    ],
    reactions: [
      "2Mg + O₂ → 2MgO, with a brilliant white light.",
      "Mg + 2HCl → MgCl₂ + H₂ — steady fizzing, the standard rate experiment.",
    ],
    tests: ["The intense white flame is unmistakable."],
    safety: "Do not look directly at burning magnesium — the UV damages eyes. Never put it out with water or CO₂.",
  },
  ca: {
    appearance: "Silvery-white metal, usually supplied as dull greyish turnings.",
    stats: [
      { label: "Group", value: "2" },
      { label: "With water", value: "Steady fizzing, no melting" },
    ],
    reactions: ["Ca + 2H₂O → Ca(OH)₂ + H₂ — the solution goes cloudy as limewater forms."],
    tests: ["Brick-red flame."],
    safety: "Flammable as a powder; irritant.",
  },
  al: {
    appearance: "Silvery, light, with a dull matt oxide film.",
    stats: [
      { label: "Protection", value: "A tough Al₂O₃ layer forms instantly" },
      { label: "Amphoteric", value: "Yes — reacts with acids and alkalis" },
    ],
    reactions: [
      "The oxide layer is why aluminium seems unreactive despite sitting high in the reactivity series.",
      "Thermite: 2Al + Fe₂O₃ → Al₂O₃ + 2Fe, hot enough to weld rail.",
    ],
    tests: ["With NaOH: white Al(OH)₃ precipitate that redissolves in excess; ammonia does not redissolve it."],
    safety: "The powder is flammable; the metal is not.",
  },
  zn: {
    appearance: "Blue-grey metal, supplied as granules or foil.",
    stats: [
      { label: "Use", value: "Galvanising — sacrificial protection" },
      { label: "Amphoteric", value: "Yes" },
    ],
    reactions: [
      "Zn + 2HCl → ZnCl₂ + H₂ — the usual laboratory hydrogen generator.",
      "Zn + CuSO₄ → ZnSO₄ + Cu, and the tube warms noticeably.",
    ],
    tests: ["Zn²⁺ gives a white precipitate soluble in both excess NaOH and excess ammonia."],
    safety: "The dust is flammable; the granules are safe to handle.",
  },
  fe: {
    appearance: "Grey metal; iron filings are dark grey and magnetic.",
    stats: [
      { label: "Oxidation states", value: "+2 and +3" },
      { label: "Magnetic", value: "Yes — the basis of the sulfur/iron separation" },
    ],
    reactions: [
      "Rusting needs both water and oxygen: 4Fe + 3O₂ + xH₂O → 2Fe₂O₃·xH₂O.",
      "Fe + CuSO₄ → FeSO₄ + Cu.",
    ],
    tests: ["Fe²⁺ → dirty-green precipitate with NaOH; Fe³⁺ → rust-brown."],
    safety: "Low hazard; fine powder is flammable.",
  },
  cu: {
    appearance: "Distinctive pink-brown metal; goes green over years as verdigris.",
    stats: [
      { label: "Reactivity", value: "Below hydrogen — no reaction with dilute acid" },
      { label: "Conductivity", value: "Second only to silver" },
    ],
    reactions: [
      "It does not displace hydrogen from acids, which is why copper vessels survive.",
      "2Cu + O₂ → 2CuO on heating — bright metal turns black.",
    ],
    tests: ["Blue-green flame; blue solutions; deep blue with excess ammonia."],
    safety: "Low hazard as the metal.",
  },
  ag: {
    appearance: "Bright white lustrous metal; tarnishes black.",
    stats: [
      { label: "Conductivity", value: "The best of any metal" },
      { label: "Tarnish", value: "Ag₂S, from traces of H₂S in air" },
    ],
    reactions: ["Unreactive to water and dilute acids; dissolves in nitric acid."],
    safety: "Low hazard as the metal; its soluble salts are corrosive.",
  },
  au: {
    appearance: "Unmistakable yellow metallic lustre; does not tarnish at all.",
    stats: [
      { label: "Reactivity", value: "Bottom of the series — found native" },
      { label: "Dissolves in", value: "Aqua regia only (3 HCl : 1 HNO₃)" },
    ],
    reactions: ["Its refusal to react is the point: this is why gold is used for contacts and jewellery."],
    safety: "None.",
  },
  hg: {
    appearance: "The only metal that is liquid at room temperature — a mobile, mirror-bright silver bead.",
    stats: [
      { label: "Melting point", value: "-39 °C" },
      { label: "Vapour", value: "Toxic and given off at room temperature" },
    ],
    reactions: ["Dissolves many metals to form amalgams."],
    safety:
      "A cumulative neurotoxin whose vapour is the real danger. Most schools have withdrawn it entirely; spills need sulfur powder, not a brush.",
  },
  pb: {
    appearance: "Dull grey, soft enough to mark paper; a fresh cut is briefly bright.",
    stats: [
      { label: "Density", value: "11.3 g/cm³ — very heavy for its size" },
      { label: "Amphoteric oxide", value: "Yes" },
    ],
    reactions: ["Reacts only slowly with dilute acids because the insoluble salt coats the surface."],
    tests: ["Pb²⁺ + 2I⁻ → bright yellow PbI₂."],
    safety: "Cumulative poison. Wash hands after handling; never machine or heat it in class.",
  },
  sn: {
    appearance: "Soft silvery metal; a bar 'cries' audibly when bent.",
    stats: [{ label: "Oxidation states", value: "+2 and +4" }],
    reactions: ["Sn²⁺ is a reducing agent, oxidised to Sn⁴⁺."],
    safety: "Low hazard.",
  },

  /* ----------------------------------------------------------- NON-METALS */
  c: {
    appearance: "Black, soft and greasy to the touch as graphite; brilliantly clear as diamond.",
    stats: [
      { label: "Allotropes", value: "Diamond, graphite, fullerenes" },
      { label: "Graphite conducts", value: "Yes — one delocalised electron per atom" },
      { label: "Diamond conducts", value: "No — all four electrons bonded" },
    ],
    reactions: [
      "C + O₂ → CO₂ in plenty of air; 2C + O₂ → 2CO when air is limited.",
      "Reduces metal oxides above it in the reactivity series: 2CuO + C → 2Cu + CO₂.",
    ],
    tests: ["The structure question is the syllabus favourite: same element, different properties."],
    safety: "Low hazard; the dust is messy.",
  },
  s: {
    appearance: "Bright yellow brittle powder or crystals.",
    stats: [
      { label: "Molecule", value: "S₈ puckered ring" },
      { label: "On melting", value: "Amber → dark red and viscous → runny again" },
    ],
    reactions: ["S + O₂ → SO₂, burning with a blue flame and a choking smell."],
    tests: ["Insoluble in water but soluble in CS₂ — the classic separation from iron filings."],
    safety: "Low hazard itself; the SO₂ it makes is toxic.",
  },
  p_red: {
    appearance: "Dull red-brown powder.",
    stats: [
      { label: "Allotrope of", value: "Phosphorus" },
      { label: "Ignition", value: "About 240 °C — needs friction" },
    ],
    reactions: ["Converts to white phosphorus on strong heating in the absence of air."],
    safety: "Flammable; far safer than the white allotrope but still handled dry and cool.",
  },
  p_white: {
    appearance: "Waxy, pale yellow-white solid; glows faintly green in the dark.",
    stats: [
      { label: "Ignition", value: "About 35 °C — below body temperature" },
      { label: "Stored under", value: "Water" },
    ],
    reactions: ["P₄ + 5O₂ → P₄O₁₀, dense white smoke."],
    safety: "Spontaneously flammable in air and severely toxic. Not a school reagent.",
  },
  i2: {
    appearance: "Shiny grey-black crystals with a metallic sheen; the vapour is deep violet.",
    stats: [
      { label: "Sublimes", value: "Yes — solid straight to vapour" },
      { label: "In water", value: "Barely soluble; brown in KI(aq)" },
      { label: "In hexane", value: "Purple — the solvent-extraction test" },
    ],
    reactions: ["Displaced from iodide by chlorine and bromine, but displaces nothing itself."],
    tests: ["Blue-black with starch — sensitive to a trace."],
    safety: "Harmful; the vapour irritates eyes and lungs.",
  },
  br2: {
    appearance: "Dense, dark red-brown liquid that constantly fumes orange.",
    stats: [
      { label: "State at rtp", value: "The only non-metal liquid" },
      { label: "Bromine water", value: "Orange; decolourised by alkenes" },
    ],
    reactions: [
      "Displaces iodine from iodide but is itself displaced by chlorine.",
      "Adds across C=C: the orange colour vanishing is the unsaturation test.",
    ],
    tests: ["Decolourising bromine water distinguishes an alkene from an alkane."],
    safety: "Severely corrosive and toxic. Fume cupboard, gloves, and never above eye level.",
  },
  cl2: {
    appearance: "Pale yellow-green gas — hard to see in a small tube, obvious in a gas jar.",
    odour: "Sharp bleach-like smell; irritating even at low concentration.",
    stats: [
      { label: "Density", value: "3.2 g/dm³ — much denser than air" },
      { label: "In water", value: "Chlorine water, pH about 3" },
    ],
    reactions: [
      "Cl₂ + H₂O ⇌ HCl + HOCl — the HOCl is what bleaches.",
      "Displaces both bromine and iodine from their salts.",
    ],
    tests: ["Bleaches damp litmus paper — it turns red first, then white."],
    safety: "Toxic. Fume cupboard only; this gas was used as a chemical weapon.",
  },

  /* ---------------------------------------------------------------- GASES */
  co2: {
    appearance: "Colourless gas; visible only as bubbles or as the mist above dry ice.",
    stats: [
      { label: "Density (rtp)", value: "1.98 g/dm³ — 1.5× air" },
      { label: "Solution pH", value: "About 5.6" },
      { label: "Sublimes at", value: "-78 °C" },
    ],
    reactions: [
      "Ca(OH)₂ + CO₂ → CaCO₃ + H₂O — milky.",
      "Excess CO₂ clears the milkiness again as the soluble hydrogencarbonate forms.",
    ],
    tests: ["Turns limewater milky. Puts out a lighted splint."],
    safety: "An asphyxiant in quantity — it collects in low, unventilated spaces.",
  },
  co: {
    appearance: "Colourless — completely undetectable by eye.",
    odour: "None. This is exactly what makes it lethal.",
    stats: [
      { label: "Density (rtp)", value: "1.15 g/dm³ — about the same as air" },
      { label: "Binds haemoglobin", value: "200× more strongly than oxygen" },
    ],
    reactions: [
      "A reducing agent: Fe₂O₃ + 3CO → 2Fe + 3CO₂ in the blast furnace.",
      "Burns with a pale blue flame to CO₂.",
    ],
    safety: "Acutely toxic with no warning properties. Never generate it in an open lab.",
  },
  no2: {
    appearance: "Deep red-brown gas — the colour of photochemical smog.",
    odour: "Sharp and acrid.",
    stats: [
      { label: "Density (rtp)", value: "1.88 g/dm³" },
      { label: "Equilibrium", value: "2NO₂ (brown) ⇌ N₂O₄ (colourless)" },
    ],
    reactions: [
      "Cooling shifts the equilibrium to pale N₂O₄, warming back to brown — the standard Le Chatelier demonstration.",
      "With water it forms a mixture of nitric and nitrous acids: acid rain.",
    ],
    tests: ["The brown colour plus acidic damp litmus is enough."],
    safety: "Toxic; the damage to lungs can be delayed by hours. Fume cupboard only.",
  },
  so2: {
    appearance: "Colourless gas.",
    odour: "The smell of a struck match; choking.",
    stats: [
      { label: "Density (rtp)", value: "2.62 g/dm³ — much denser than air" },
      { label: "Solubility", value: "Very soluble, about 94 g/dm³" },
      { label: "Solution pH", value: "About 1.5 (sulfurous acid)" },
    ],
    reactions: [
      "SO₂ + H₂O → H₂SO₃ — a major contributor to acid rain.",
      "A reducing agent: it turns acidified dichromate from orange to green.",
    ],
    tests: ["Turns acidified potassium dichromate paper orange → green."],
    safety: "Toxic and a severe respiratory irritant, especially for asthmatics.",
  },
  ch4: {
    appearance: "Colourless gas.",
    stats: [
      { label: "Density (rtp)", value: "0.66 g/dm³ — lighter than air" },
      { label: "Shape", value: "Tetrahedral, 109.5°" },
      { label: "Family", value: "Alkane — saturated" },
    ],
    reactions: [
      "CH₄ + 2O₂ → CO₂ + 2H₂O, a clean blue flame.",
      "Substitution with chlorine in UV light: CH₄ + Cl₂ → CH₃Cl + HCl.",
    ],
    tests: ["Does not decolourise bromine water — that is what separates it from ethene."],
    safety: "Extremely flammable; explosive between 5% and 15% in air.",
  },
  c2h4: {
    appearance: "Colourless gas.",
    stats: [
      { label: "Density (rtp)", value: "1.15 g/dm³" },
      { label: "Family", value: "Alkene — unsaturated, C=C" },
      { label: "Shape", value: "Planar, 120°" },
    ],
    reactions: [
      "Decolourises bromine water instantly: C₂H₄ + Br₂ → C₂H₄Br₂.",
      "Polymerises to poly(ethene) under pressure with a catalyst.",
      "Hydration with steam gives ethanol.",
    ],
    tests: ["The bromine-water test for unsaturation."],
    safety: "Extremely flammable.",
  },
  c2h2: {
    appearance: "Colourless gas; burns with a bright, very sooty flame.",
    stats: [
      { label: "Density (rtp)", value: "1.07 g/dm³" },
      { label: "Family", value: "Alkyne — triple bond" },
      { label: "Flame temperature", value: "About 3300 °C with oxygen" },
    ],
    reactions: [
      "Made from calcium carbide: CaC₂ + 2H₂O → C₂H₂ + Ca(OH)₂.",
      "The high carbon fraction is why the flame smokes so heavily in air.",
    ],
    tests: ["Also decolourises bromine water — twice over, since there are two bonds to break."],
    safety: "Extremely flammable and unstable under pressure.",
  },
  o2: {
    appearance: "Colourless, odourless gas.",
    stats: [
      { label: "Density (rtp)", value: "1.33 g/dm³ — slightly denser than air" },
      { label: "In air", value: "21%" },
      { label: "Solubility", value: "Slight, about 0.04 g/dm³ — enough for fish" },
    ],
    reactions: [
      "Supports combustion without burning itself.",
      "Prepared by decomposing hydrogen peroxide over manganese(IV) oxide.",
    ],
    tests: ["Relights a glowing splint."],
    safety: "Not flammable, but it makes everything else burn ferociously.",
  },
  h2: {
    appearance: "Colourless, odourless gas.",
    stats: [
      { label: "Density (rtp)", value: "0.083 g/dm³ — the lightest substance there is" },
      { label: "Flame", value: "Almost invisible in daylight" },
    ],
    reactions: [
      "2H₂ + O₂ → 2H₂O, strongly exothermic.",
      "A reducing agent: CuO + H₂ → Cu + H₂O, black to pink.",
    ],
    tests: ["Squeaky pop with a lighted splint."],
    safety: "Extremely flammable; explosive across a very wide range in air.",
  },
  n2: {
    appearance: "Colourless, odourless gas.",
    stats: [
      { label: "Density (rtp)", value: "1.16 g/dm³ — near enough air" },
      { label: "In air", value: "78%" },
      { label: "Bond", value: "N≡N, 945 kJ/mol — why it is so inert" },
    ],
    reactions: [
      "Fixed industrially in the Haber process: N₂ + 3H₂ ⇌ 2NH₃ (450 °C, 200 atm, iron catalyst).",
    ],
    tests: ["Puts out a lighted splint and does nothing else — identification is by elimination."],
    safety: "An asphyxiant in an enclosed space; otherwise you are breathing it now.",
  },
  hcl_g: {
    appearance: "Colourless gas that fumes visibly in damp air.",
    odour: "Sharply acidic.",
    stats: [
      { label: "Density (rtp)", value: "1.52 g/dm³" },
      { label: "Solubility", value: "Extreme — about 720 g/dm³" },
    ],
    reactions: ["NH₃ + HCl → NH₄Cl, a dense white smoke where the two gases meet."],
    tests: ["White fumes with a stopper wetted in ammonia."],
    safety: "Toxic and corrosive to the airway.",
  },
  nh3_g: {
    appearance: "Colourless gas.",
    odour: "Pungent and eye-watering.",
    stats: [
      { label: "Density (rtp)", value: "0.71 g/dm³ — lighter than air" },
      { label: "Solubility", value: "Extreme — about 520 g/dm³, the fountain experiment" },
    ],
    reactions: [
      "The only common alkaline gas.",
      "Released when any ammonium salt is warmed with sodium hydroxide.",
    ],
    tests: ["Turns damp red litmus blue; white smoke with HCl."],
    safety: "Toxic; the vapour is a serious respiratory irritant.",
  },

  /* --------------------------------------------------------------- OXIDES */
  cuo: {
    appearance: "Black powder.",
    stats: [
      { label: "Oxide type", value: "Basic" },
      { label: "Solubility", value: "Insoluble in water" },
    ],
    reactions: [
      "CuO + H₂SO₄ → CuSO₄ + H₂O — the standard way to prepare a copper salt.",
      "Reduced by hydrogen or carbon: CuO + H₂ → Cu + H₂O, black to pink.",
    ],
    tests: ["Dissolves in warm dilute acid to a blue solution."],
    safety: "Harmful if swallowed; toxic to aquatic life.",
  },
  cu2o: {
    appearance: "Brick-red powder.",
    stats: [{ label: "Oxidation state", value: "Cu(I)" }],
    reactions: ["Formed when a reducing sugar reduces Fehling's or Benedict's solution."],
    tests: ["The red precipitate is the positive result for a reducing sugar."],
    safety: "Harmful.",
  },
  fe2o3: {
    appearance: "Red-brown powder — the colour of rust.",
    stats: [
      { label: "Oxide type", value: "Basic (weakly amphoteric)" },
      { label: "Solubility", value: "Insoluble" },
    ],
    reactions: [
      "Reduced by CO in the blast furnace: Fe₂O₃ + 3CO → 2Fe + 3CO₂.",
      "The oxidant in the thermite reaction.",
    ],
    safety: "Low hazard; nuisance dust.",
  },
  mgo: {
    appearance: "Fine white powder — the ash left after magnesium burns.",
    stats: [
      { label: "Oxide type", value: "Basic" },
      { label: "Melting point", value: "2852 °C — a refractory" },
      { label: "With water", value: "Slightly soluble, weakly alkaline" },
    ],
    reactions: ["MgO + H₂O → Mg(OH)₂, turning universal indicator blue."],
    tests: ["A white oxide that gives an alkaline solution points to a Group 2 metal."],
    safety: "Irritant dust.",
  },
  cao: {
    appearance: "White lumps or powder — quicklime.",
    stats: [
      { label: "Oxide type", value: "Basic" },
      { label: "With water", value: "Violently exothermic slaking" },
    ],
    reactions: [
      "CaO + H₂O → Ca(OH)₂, hot enough to steam and crack the lumps apart.",
      "Made by roasting limestone: CaCO₃ → CaO + CO₂.",
    ],
    tests: ["The heat of slaking is the identification."],
    safety: "Corrosive, and the heat it generates is a burn hazard in its own right.",
  },
  al2o3: {
    appearance: "White powder; as a single crystal it is corundum, ruby or sapphire.",
    stats: [
      { label: "Oxide type", value: "Amphoteric" },
      { label: "Melting point", value: "2072 °C — dissolved in cryolite to electrolyse" },
    ],
    reactions: [
      "With acid: Al₂O₃ + 6HCl → 2AlCl₃ + 3H₂O",
      "With alkali: Al₂O₃ + 2NaOH + 3H₂O → 2NaAl(OH)₄",
    ],
    tests: ["Reacting with both acid and alkali is the definition of amphoteric."],
    safety: "Nuisance dust.",
  },

  /* -------------------------------------------------------------- ORGANIC */
  ethanol: {
    appearance: "Colourless, mobile liquid; burns with a pale blue, almost invisible flame.",
    odour: "Familiar spirit smell.",
    stats: [
      { label: "Family", value: "Alcohol, -OH" },
      { label: "Solubility", value: "Miscible with water in all proportions" },
      { label: "Made by", value: "Fermentation, or hydration of ethene" },
    ],
    reactions: [
      "Complete combustion: C₂H₅OH + 3O₂ → 2CO₂ + 3H₂O.",
      "Oxidised by acidified dichromate to ethanal, then ethanoic acid — orange to green.",
      "Dehydrated over hot aluminium oxide to ethene.",
    ],
    tests: ["Orange-to-green with acidified dichromate; no fizz with carbonate (that rules out an acid)."],
    safety: "Highly flammable, and the vapour travels. No naked flames when decanting.",
  },
  methanol: {
    appearance: "Colourless liquid, visually identical to ethanol — which is the danger.",
    stats: [
      { label: "Family", value: "Alcohol, -OH" },
      { label: "Toxicity", value: "Metabolised to formaldehyde and formic acid" },
    ],
    reactions: ["Burns with a pale blue flame: 2CH₃OH + 3O₂ → 2CO₂ + 4H₂O."],
    safety:
      "Highly flammable and severely toxic — 10 ml can blind, 30 ml can kill. It is absorbed through skin.",
  },
  propanone: {
    appearance: "Colourless, very mobile liquid that evaporates while you watch.",
    odour: "Sweet, like nail-polish remover.",
    stats: [
      { label: "Family", value: "Ketone, C=O" },
      { label: "Solubility", value: "Miscible with water" },
      { label: "Volatility", value: "Boils at 56 °C" },
    ],
    reactions: [
      "Resists oxidation by dichromate — that is how a ketone is told from an aldehyde.",
      "Gives a yellow-orange precipitate with 2,4-DNPH, like all carbonyls.",
    ],
    tests: ["Positive 2,4-DNPH, negative Tollens' — ketone confirmed."],
    safety: "Highly flammable; dries and cracks skin.",
  },
  benzene: {
    appearance: "Colourless liquid; burns with a very smoky flame.",
    odour: "Sweet and aromatic — the smell the whole class of compounds is named for.",
    stats: [
      { label: "Family", value: "Arene" },
      { label: "Structure", value: "Planar ring, delocalised π system" },
      { label: "Solubility", value: "Insoluble in water; floats" },
    ],
    reactions: [
      "Substitutes rather than adds, because addition would destroy the delocalisation.",
      "Does not decolourise bromine water, despite being formally unsaturated.",
    ],
    safety: "A proven carcinogen. Banned from school laboratories; methylbenzene is used instead.",
  },
  chloroform: {
    appearance: "Colourless, dense liquid that sinks clearly below water.",
    odour: "Sweet.",
    stats: [
      { label: "Density", value: "1.49 g/cm³ — sinks in water" },
      { label: "Solubility", value: "Insoluble" },
    ],
    reactions: ["Used to extract iodine and bromine from aqueous solution — the halogen colours the lower layer."],
    tests: ["Forming the lower layer in a separating funnel is itself the clue."],
    safety: "Harmful, an anaesthetic, and a suspected carcinogen.",
  },
  glucose: {
    appearance: "White crystalline solid; a colourless solution.",
    stats: [
      { label: "Family", value: "Monosaccharide, C₆H₁₂O₆" },
      { label: "Reducing sugar", value: "Yes" },
      { label: "Solubility", value: "Very soluble" },
    ],
    reactions: [
      "Reduces Benedict's solution from blue to a brick-red Cu₂O precipitate on warming.",
      "Fermented by yeast: C₆H₁₂O₆ → 2C₂H₅OH + 2CO₂.",
    ],
    tests: ["Positive Benedict's/Fehling's test; negative iodine test."],
    safety: "None.",
  },
  starch: {
    appearance: "White powder; forms a translucent, slightly cloudy suspension rather than a true solution.",
    stats: [
      { label: "Type", value: "Polysaccharide — a polymer of glucose" },
      { label: "Molar mass", value: "Variable; it is a polymer, so no single value" },
      { label: "Reducing sugar", value: "No" },
    ],
    reactions: [
      "Hydrolysed by acid or by amylase to glucose, which then gives a positive Benedict's test.",
    ],
    tests: ["Iodine solution turns blue-black — sensitive enough to detect a smear on a leaf."],
    safety: "None.",
  },
  hexane: {
    appearance: "Colourless, watery liquid that floats on water in a distinct upper layer.",
    stats: [
      { label: "Family", value: "Alkane, C₆H₁₄" },
      { label: "Polarity", value: "Non-polar" },
      { label: "Solubility", value: "Insoluble in water; floats" },
    ],
    reactions: [
      "Dissolves iodine to a purple solution, and bromine to orange — the solvent-extraction test for halogens.",
    ],
    tests: ["Does not decolourise bromine water: saturated."],
    safety: "Highly flammable; the vapour affects the nervous system.",
  },

  /* ----------------------------------------------------------- INDICATORS */
  litmus: {
    appearance: "Purple in neutral solution; supplied as paper or as a dye solution.",
    stats: [
      { label: "In acid", value: "Red" },
      { label: "In neutral", value: "Purple" },
      { label: "In alkali", value: "Blue" },
      { label: "pH range", value: "5.0 – 8.0" },
      { label: "Source", value: "Lichen extract" },
    ],
    reactions: [
      "Too broad a range for titration — it only tells you which side of neutral you are on.",
    ],
    tests: [
      "Damp red litmus turning blue tests for ammonia; damp blue litmus turning red then white tests for chlorine.",
    ],
    safety: "None.",
  },
  phenolphthalein: {
    appearance: "Colourless in the bottle; a startling magenta pink in alkali.",
    stats: [
      { label: "In acid", value: "Colourless" },
      { label: "In alkali", value: "Pink" },
      { label: "pH range", value: "8.3 – 10.0" },
      { label: "Best for", value: "Strong base into strong or weak acid" },
      { label: "Molar mass", value: "318.3 g/mol" },
    ],
    reactions: [
      "Its range sits above 7, so it is the wrong choice for titrating a weak base with a strong acid.",
    ],
    tests: ["The end point is the first permanent faint pink — one drop should do it."],
    safety: "Harmful if swallowed; the solutions are alcoholic and so flammable.",
  },
  "methyl-orange": {
    appearance: "Orange in the bottle; red in acid, yellow in alkali.",
    stats: [
      { label: "In acid", value: "Red" },
      { label: "In alkali", value: "Yellow" },
      { label: "pH range", value: "3.1 – 4.4" },
      { label: "Best for", value: "Strong acid into weak base" },
      { label: "Molar mass", value: "327.3 g/mol" },
    ],
    reactions: ["Its low range makes it the mirror image of phenolphthalein in titration choice."],
    tests: ["End point is the first orange tinge as yellow shifts towards red."],
    safety: "Toxic if swallowed.",
  },
  bromothymol: {
    appearance: "Blue-green in the bottle; yellow in acid, blue in alkali.",
    stats: [
      { label: "In acid", value: "Yellow" },
      { label: "In neutral", value: "Green" },
      { label: "In alkali", value: "Blue" },
      { label: "pH range", value: "6.0 – 7.6" },
      { label: "Best for", value: "Anything near neutral; respiration experiments" },
    ],
    reactions: ["Because its range straddles 7 it shows dissolved CO₂ acidifying water in real time."],
    safety: "Irritant.",
  },
  universal: {
    appearance: "Green when neutral, running through the full spectrum with pH.",
    stats: [
      { label: "pH 1–3", value: "Red" },
      { label: "pH 4–6", value: "Orange to yellow" },
      { label: "pH 7", value: "Green" },
      { label: "pH 8–11", value: "Blue" },
      { label: "pH 12–14", value: "Violet" },
      { label: "Composition", value: "A blend of several indicators" },
    ],
    reactions: [
      "The blend is what gives the continuous scale — no single dye changes colour more than once.",
    ],
    tests: [
      "Good for estimating pH, poor for titration: the change is gradual, so there is no sharp end point.",
    ],
    safety: "The solutions contain ethanol and are flammable.",
  },

  /* -------------------------------------------------------------- VAPOURS */
  h2o_vapour: {
    appearance: "Invisible as true vapour; the white cloud you can see is already condensed droplets.",
    stats: [
      { label: "Condenses at", value: "100 °C at 1 atm" },
      { label: "Density (rtp)", value: "0.80 g/dm³ — lighter than air" },
    ],
    reactions: ["Condenses to a colourless liquid that boils at exactly 100 °C if pure."],
    tests: [
      "Turns white anhydrous copper(II) sulfate blue, or blue cobalt chloride paper pink.",
      "For pure water you also need the boiling point — the chemical tests only show water is present.",
    ],
    safety: "Steam scalds worse than boiling water because it releases its latent heat on your skin.",
  },
  br_vapour: {
    appearance: "Thick orange-brown fumes that pour downwards out of the bottle.",
    odour: "Choking and bleach-like.",
    stats: [
      { label: "Density (rtp)", value: "7.1 g/dm³ — 5.5× air" },
      { label: "Boils at", value: "59 °C — it fumes at room temperature" },
    ],
    reactions: ["Decolourised on contact with an alkene."],
    safety: "Toxic and corrosive. Fume cupboard, always.",
  },
  i_vapour: {
    appearance: "Beautiful deep violet vapour formed by sublimation.",
    stats: [
      { label: "Sublimes at", value: "114 °C" },
      { label: "Density (rtp)", value: "11.3 g/dm³ — very heavy" },
    ],
    reactions: ["Recondenses to grey crystals on a cold surface — the standard sublimation demonstration."],
    tests: ["Blue-black with starch."],
    safety: "Harmful; irritates the eyes and airway.",
  },
  no_vapour: {
    appearance: "Colourless as it leaves the flask, turning brown the instant it meets air.",
    stats: [
      { label: "Density (rtp)", value: "1.34 g/dm³" },
      { label: "In air", value: "2NO + O₂ → 2NO₂, immediately" },
    ],
    reactions: ["The brown ring test depends on NO forming and complexing with Fe²⁺."],
    safety: "Toxic. Fume cupboard.",
  },

  /* --------------------------------------------------------------- FLAMES */
  "flame-bunsen-blue": {
    appearance: "A quiet blue cone inside a paler blue outer flame; noisy and hard to see in daylight.",
    stats: [
      { label: "Air hole", value: "Fully open" },
      { label: "Temperature", value: "About 1500 °C at the cone tip" },
      { label: "Combustion", value: "Complete — CH₄ + 2O₂ → CO₂ + 2H₂O" },
      { label: "Hottest point", value: "Just above the inner blue cone" },
    ],
    reactions: ["Complete combustion means no soot, so glassware stays clean."],
    tests: ["This is the flame to use for heating and for flame tests."],
    safety:
      "Nearly invisible in a bright lab — the commonest burn in school chemistry. Return to the yellow flame whenever the burner is unattended.",
  },
  "flame-bunsen-yellow": {
    appearance: "A wavering, luminous yellow flame that deposits soot on anything held in it.",
    stats: [
      { label: "Air hole", value: "Closed" },
      { label: "Temperature", value: "About 700 °C" },
      { label: "Combustion", value: "Incomplete — glowing carbon gives the colour" },
    ],
    reactions: ["Incomplete combustion also produces carbon monoxide, so ventilation matters."],
    tests: ["Useless for flame tests: the yellow drowns every colour you are looking for."],
    safety: "The safety flame — clearly visible, so this is the setting to idle on.",
  },
  "flame-li": {
    appearance: "A deep crimson-red flame.",
    stats: [
      { label: "Ion", value: "Li⁺" },
      { label: "Colour", value: "Crimson red" },
      { label: "Wavelength", value: "About 671 nm" },
    ],
    reactions: [
      "Heat promotes an electron to a higher level; the colour is the photon emitted as it falls back.",
    ],
    tests: ["Easily confused with strontium — lithium is a deeper red, strontium more scarlet."],
    safety: "Clean the wire in concentrated HCl between tests or the previous ion carries over.",
  },
  "flame-na": {
    appearance: "An intense golden-yellow that floods the whole flame.",
    stats: [
      { label: "Ion", value: "Na⁺" },
      { label: "Colour", value: "Golden yellow" },
      { label: "Wavelength", value: "589 nm — the sodium D lines" },
    ],
    reactions: ["The same emission that makes old street lamps orange."],
    tests: [
      "So intense that a fingerprint on the wire will show it. A trace of sodium masks every other colour, which is why potassium is viewed through cobalt-blue glass.",
    ],
    safety: "Standard burner precautions.",
  },
  "flame-k": {
    appearance: "A pale lilac, easily lost against the burner's own light.",
    stats: [
      { label: "Ion", value: "K⁺" },
      { label: "Colour", value: "Lilac" },
      { label: "Wavelength", value: "About 766 nm" },
      { label: "View through", value: "Cobalt-blue glass" },
    ],
    reactions: ["The cobalt glass absorbs the yellow sodium light and lets the lilac through."],
    tests: ["If you see yellow, you have sodium contamination — clean the wire and repeat."],
    safety: "Standard burner precautions.",
  },
  "flame-ca": {
    appearance: "A brick-red or orange-red flame.",
    stats: [
      { label: "Ion", value: "Ca²⁺" },
      { label: "Colour", value: "Brick red" },
      { label: "Wavelength", value: "About 622 nm" },
    ],
    tests: ["Duller and more orange than lithium's crimson."],
    safety: "Standard burner precautions.",
  },
  "flame-cu": {
    appearance: "A blue-green flame; emerald green when a halide is present.",
    stats: [
      { label: "Ion", value: "Cu²⁺" },
      { label: "Colour", value: "Blue-green" },
      { label: "Wavelength", value: "About 526 nm" },
    ],
    reactions: ["Copper halides give the strongest green because the volatile halide vaporises readily."],
    tests: ["Confirm with the ammonia test: a deep royal-blue solution."],
    safety: "Standard burner precautions.",
  },
  "flame-ba": {
    appearance: "A pale apple-green flame.",
    stats: [
      { label: "Ion", value: "Ba²⁺" },
      { label: "Colour", value: "Apple green" },
      { label: "Wavelength", value: "About 524 nm" },
    ],
    tests: ["Very close to copper's green — confirm barium with a white BaSO₄ precipitate."],
    safety: "Soluble barium salts are toxic. Wash hands afterwards.",
  },
  "flame-sr": {
    appearance: "A bright scarlet flame — the red of distress flares and fireworks.",
    stats: [
      { label: "Ion", value: "Sr²⁺" },
      { label: "Colour", value: "Scarlet" },
      { label: "Wavelength", value: "About 606 nm" },
    ],
    tests: ["Brighter and more scarlet than calcium's brick red."],
    safety: "Standard burner precautions.",
  },
  "flame-mg": {
    appearance: "A blinding white light — far brighter than any other flame test.",
    stats: [
      { label: "Burning", value: "The metal itself, not an ion in a flame" },
      { label: "Temperature", value: "About 3100 °C" },
      { label: "Product", value: "White MgO ash" },
    ],
    reactions: ["2Mg + O₂ → 2MgO, and it will go on burning in CO₂ or nitrogen."],
    tests: ["This is combustion, not a flame test — Mg²⁺ in solution gives no flame colour at all."],
    safety:
      "Do not look directly at it: the ultraviolet damages the retina. Never extinguish with water, CO₂ or sand-free foam.",
  },
};
