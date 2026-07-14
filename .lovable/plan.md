# ChemVM v3 — Full Rebuild Plan

This is a large, multi-part rebuild. I've grouped it into 6 phases so we can validate as we go. Please confirm before I start (or tell me which phases to drop/reorder).

## Phase 1 — Lab actions that actually match the experiments

The current lab silently drops actions that no experiment step calls for. I'll audit all 112 syllabus experiments and add a real action for every verb any of them use:

- **Heating** — flame picker (Bunsen air-hole open/closed, spirit lamp, hot plate, water bath, direct match). Selected flame drives temperature ramp + colour + soot.
- **Litmus & universal indicator** — dip-strip apparatus; strip changes to the true pH-band colour of whatever's in the vessel.
- **Flame test** — nichrome-wire + watch-glass action; flame recolours to the cation's real emission colour.
- **Filtration, decanting, evaporation-to-dryness, crystallisation, sublimation, chromatography, magnetic separation (iron/sulfur), fractional distillation, solvent extraction, drying** — each gets its own action + visual.
- **Measure before adding** — every "add chemical" first opens a measured-volume/mass dialog (mL or g) with a graduated cylinder / balance visual; the measured amount is what actually enters the vessel and what marking checks.
- **Multi-select** — shift/ctrl click apparatus to apply an action (heat, stir, cover) to several at once.
- **Rotate** — R key / context-menu rotate for apparatus that need orientation (delivery tubes, condensers, retort clamps).
- **Undo / Redo** — full action-stack (Ctrl+Z / Ctrl+Y and toolbar buttons); every lab event is reversible including pours, heats, connections.
- **Consequences of misuse** — over-heating volatile liquid → evaporates then vessel dry-cracks; sealed vessel over flame → pressure build-up → explosion particle FX; flammable in open flame → ignites with correct flame colour (Na yellow, Cu green, S blue, etc.); foaming reactions actually overflow; freezing forms ice crystals.
- **Auto-setup rigs become live** — the tripod+gauze+Bunsen rig actually applies heat to whatever beaker you drop on the gauze; retort-stand clamps actually hold the tube; connected delivery tube actually transfers evolved gas to the next vessel.

## Phase 2 — Honest marking + results table + observation log

- Replace the current "always ~100%" report. Marking now runs off the *real* action log with hard requirements: correct reagent, correct measured amount (±tolerance from the rubric), correct order where order matters, correct apparatus, correct observation recorded.
- **Live results table** inside the lab (right dock): columns configurable per experiment (Trial, Initial volume, Final volume, Titre, Mass before, Mass after, Temperature, Colour observed, Time, pH…). Rows auto-fill from measured actions; student can also type.
- **Live observation log** — timestamped, editable, exportable.
- **Undo/redo** also rewinds table + observation entries so nothing gets out of sync.

## Phase 3 — Full PDF report

Glassmorphic "Finish & Report" modal:
1. Name + Level of Education + Syllabus + Date (student enters).
2. Preview of the full report inside the modal.
3. **Download PDF** button (reportlab-quality layout, generated client-side with pdf-lib).

Report contents, in this order, matching the format you sent:
- Title of experiment, syllabus, date, student name & level.
- Aim, brief theory, apparatus & chemicals list.
- **Step-by-step transcript**: every action the student took, with tick/cross vs the rubric and the marks awarded on that step.
- **Results table** (the live one from Phase 2).
- **Observations** (the live log).
- **Expected vs actual result** side-by-side.
- **Final assessment**: what was correct, what was wrong, missed steps, safety violations.
- **Final mark** — raw + weighted + grade band from the selected syllabus.
- **Recommendations** — generated from the specific mistakes.
- **Summary** of the experiment.

## Phase 4 — Restore the full 112-experiment catalog

I'll re-parse the syllabus PDF end-to-end (not just the section headers) so every experiment #1–#112 is present with: correct apparatus list, correct chemicals, correct measured amounts, correct step order, correct expected observations, correct rubric. Anything the lab engine can't yet do gets a Phase-1 action added rather than being silently dropped. Includes the ones you flagged as missing: litmus/universal indicator tests, flame tests for all common cations, iron+sulfur magnetic separation, evaporation to dryness after over-heating (exp 007), expansion/foaming demos, controlled explosion demos.

## Phase 5 — New top-level sections

- **/periodic-table** — full modern periodic table sized to viewport (no scroll). Category filter chips (alkali metals, alkaline earth, transition, post-transition, metalloids, non-metals, halogens, noble, lanthanides, actinides) — selecting one **glows the matching cells and dims the rest**. Click any element → glassmorphic detail panel using our palette (Z, symbol, name, group/period/block, atomic mass, electron config, oxidation states, electronegativity, densities, m.p./b.p., discovery, real-world uses).
- **/atom-builder (Quantitative Chemistry & Atom Building)** — drag protons/neutrons/electrons onto shells; live element/ion identification; mole / mass / concentration / limiting-reagent calculators with worked steps; can record observations + results and export the same PDF report style as Phase 3.
- **/structures (Atomic & Molecular Structures)** — gallery of atomic orbitals and molecular structures (H₂O, CH₄, C₂H₆, C₆H₆, DNA base pairs, etc.); rotate/zoom viewer; short chemistry blurb per structure.

## Phase 6 — Site chrome polish

- **Language switcher** in the top nav (globe icon). Ships with English + French + Spanish + Swahili + Arabic to start; every user-facing string routed through a tiny i18n dictionary so more languages are one-file adds. Selection persists per user.
- **Pricing** rewritten to real tiers:
  - **Free** — sandbox lab, 3 experiments, no report export.
  - **Student $7 / mo** — all 112 experiments, PDF reports, all syllabi.
  - **Dynamic (Recommended)** — pay-as-you-need; flexible payment + à-la-carte tool access.
  - **Project X Library (All-Access)** — everything above + full Project X content library, periodic table pro data, atom builder pro, structure gallery pro, priority support.
- Extra content pulled in from the zip (background articles, extra apparatus SVGs I hadn't ported, extra sample experiments) merged into the relevant library pages.

---

## Technical section (for the record, skip if not interested)

- New `src/lib/lab/actions.ts` with a proper reducer + history stack for undo/redo; every existing LabBench interaction refactored to dispatch through it.
- New `src/lib/lab/measurement.ts` for the pre-add measure dialog and tolerance-based marking.
- Reaction engine (`dwsimEngine.ts`) extended with: pH-indicator resolver, flame-emission resolver, thermal decomposition + evaporation-to-dryness, pressure/rupture model for sealed heated vessels, combustion branch for flammables in open flame, magnetic-separation resolver.
- PDF generation via `pdf-lib` (already Worker-safe); no server round-trip needed.
- New routes `src/routes/periodic-table.tsx`, `src/routes/atom-builder.tsx`, `src/routes/structures.tsx` (each with proper per-route head metadata).
- i18n via a lightweight `src/lib/i18n/` (no heavy runtime like i18next needed at this scale).
- Pricing tiers wired but payment provider not enabled yet — I'll ask about Paddle vs Stripe when you're ready to actually take money.

---

**This is roughly a full-day rebuild scope.** Confirm and I'll start with Phase 1 (lab actions) + Phase 4 (re-parse all 112 experiments) since they unblock everything else, then move through 2 → 3 → 5 → 6. Say "confirm" to proceed, or tell me to trim / reorder.