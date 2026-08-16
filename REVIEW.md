# ChemVM — an honest review after actually using it

**Reviewer:** a student/teacher who sat down and tried to do a practical, end to end.
**What I used:** a clean production build served locally, every route in the nav, and the lab bench driven the way a real user drives it — clicking, placing glassware, adding reagents, running tests, scoring, exporting.
**Verdict: 4/10.** Gorgeous shell, genuinely impressive content library, and a simulation core that quietly falls apart the moment you rely on it. Not usable as a graded practical tool today. Very fixable.

---

## First impressions: this thing looks expensive

I'll say the nice part first and I mean it.

The landing page is legitimately beautiful. "Experience Chemistry Without Limits", the gradient wordmark, the glass beaker illustration, the little pill badges — it looks like a funded product, not a school project. Dark mode is not an afterthought; I toggled it and the whole palette re-tuned properly, deep navy-to-purple with the turquoise accent still readable. Five languages in the switcher, including Kiswahili and Arabic. Somebody cared here.

The breadth is real too:

- **115 experiments** in the catalog, each with objective, safety and risk assessment, apparatus list, method, what to record, results and analysis, clearing away. That's not filler — that's a syllabus.
- **29 syllabuses across 6 regions** (ZIMSEC, Cambridge, WAEC, NECO, KNEC…).
- **119 pieces of apparatus** sorted into ten sensible trays: Containers 15, Measuring & Transfer 11, Distillation 9, Heating 13, Stands 5, Instruments 9, Hand Tools 20, Safety 6, Gas Handling 12, Electrochemistry 19. Desiccator. Petri dish *with agar jelly*. Someone has stood in an actual prep room.
- **111 reagents** with real formulae and concentrations on every card — `HCl(aq) 1M`, `H2SO4(conc) 18M`, `H2C2O4 0.05M`.

And two pages are straightforwardly good. **Atom Builder** is the best thing in the app: bump protons to 6 and it tells you carbon-12, n/p = 1.00, likely stable, shells 2,4, config [He]2s2 2p2, and there's a molar-mass calculator that parsed `CuSO4.5H2O` into 249.677 g/mol with a per-element percentage breakdown. That's a tool I'd actually use for homework. **Structures** gives 42 molecules and all 118 elements in live 3D you can drag and spin. **Periodic Table** has ten category filters and a full dossier per element.

If the review stopped at the tour, this would be an 8.

Then I tried to do a practical.

---

## The lab bench: where it breaks

### 1. The app's own tutorial button ruins the experiment

Experiment #1 is Flame Tests for Metal Ions. There's a "Practice auto-setup" button, so I pressed it — that's what it's for. Instantly, a red overflow toast. The auto-setup had poured **all eight** of the experiment's listed reagents, 10 ml each, into a **15 ml watch glass**. Eighty millilitres into fifteen.

I did nothing wrong. The button did it. My first ten seconds in the lab were spent cleaning up a mess the app made for me.

### 2. It got the chemistry wrong, and confidently

Same bench, I hit **Flame test**. It reported:

> **crimson red flame → Li⁺**

There is no lithium in a calcium chloride bench. There *is* calcium, and the app's own Method panel — three inches to the right, on screen at the same time — says calcium gives **brick red**. The app contradicted itself in a single viewport.

Why: the auto-setup had dumped seven mutually-exclusive flame salts into one dish, and the flame-test routine just returns the *first* match in its lookup table. Lithium chloride happens to be entry #1. It's not identifying anything; it's reading the top of a list.

For a chemistry teaching tool this is the worst possible category of bug. A student who trusts this fails the question. Everything else in this review is an inconvenience — this is misinformation.

### 3. The marking is unwinnable

I ran a clean, honest attempt in Practice mode. Placed apparatus, added reagents, observed, recorded a reading, hit **Score my attempt**.

> **32% — Grade U — 44/136**

Grade U. On the app's own auto-setup, on experiment #1, doing exactly what the app told me to do.

The mark scheme itemises where it went: every reagent line scored zero. `cacl2 sol` — 0/8. `cuso4 sol` — 0/8. Eight reagents, all present in the beaker, all visible in the results table, all marked absent.

This isn't bad luck on one experiment. I checked the whole catalog: **236 of 343 reagent criteria — 68.8% — across all 115 experiments can never be awarded to anyone, ever.** They're worth 8 marks each. The rubric is asking for something the scorer is structurally incapable of seeing.

And the marks that *do* work are the wrong ones. Placement (4), measurement (6), reaction, readings, observation, no-hazard — all of those fire from a single auto-setup click. So the app awards marks for pressing one button and withholds marks for doing the actual chemistry. It is precisely inverted.

I cannot use this to assess a student. Neither can a teacher.

### 4. "Where to improve" is empty

Fine, I failed — tell me why. The report modal has a **WHERE TO IMPROVE** heading with nothing under it. Not vague advice. Zero items. Grade U and silence.

### 5. Download PDF has never worked

The report modal offers **Download PDF**. PDF export is also the headline feature of the $7/month tier ("PDF report export").

I clicked it. Nothing downloaded. A toast said *"PDF generation failed — check console."* The button quietly went back to idle.

I instrumented the page to be sure I wasn't fighting my own browser. No file is blocked — **no file is ever created.** The generator throws before a single byte exists. Here's the actual exception:

```
Error: WinAnsi cannot encode "⁺" (0x207a)
  at encodeUnicodeCodePoint
  at widthOfTextAtSize
```

The PDF library is on the standard WinAnsi font, which can't represent superscript characters. So the moment the report tries to print an ion — **Ca²⁺**, **SO₄²⁻**, anything with a charge or a subscript — it dies.

Which means it dies on chemistry. I counted: **84 of the 115 experiments** contain superscripts, subscripts or reaction arrows in their text. This feature cannot work for three-quarters of the catalog and never could have. The fix is one line — embed a Unicode font, or transliterate `²⁺` to `2+` — but nobody has ever successfully downloaded a report from this app.

The paid tier's flagship deliverable is a feature that has never once produced a file.

### 6. The reaction engine is a lookup table wearing a lab coat

This one I only noticed because I went off-script. Fresh beaker, 10 ml sodium hydroxide, 10 ml hydrochloric acid — the most famous reaction in school chemistry.

The app said:

> **[DWSIM Auto-Validated] Executed reaction parameters for #31: Conductimetric Titration — Monitoring Ions. A wonderful V-shaped graph is formed. Conductance dips steeply to a sharp minimum at equivalence, then climbs upward.**

I have a beaker. I have no conductivity meter, no burette, no magnetic stirrer, no graph. It announced results from equipment that isn't on the bench, for an experiment I didn't select, because those two reagents happen to appear in experiment #31's ingredient list. It pattern-matched my beaker to a recipe and narrated the recipe's ending.

The results table then logged **pH 7** for a beaker containing nothing but hydrochloric acid. Acid alone: pH 7. The pH only moves when an acid and a base are both present — and then it snaps to one of three hardcoded values (1.8, 7.0, 12.5). There is no pH model. There's an if-statement.

Behind all of it: **66 of the 111 reagents appear in no reaction rule at all.** Iodine, hexane, sulfur, iron filings, the gases, four alcohols — inert props. Mix them and you get "Mixed substances successfully" and an averaged blend of their two colours. The "DWSIM engine" branding suggests a thermodynamic solver. It's a chain of `if (has("cacl2_sol"))` checks keyed to specific experiment IDs. Stay exactly on the rails and it performs; step one inch off and it either says nothing or invents something.

That's the deepest problem here, and it's not a bug — it's the architecture. "Mix, react, and observe real chemical behavior" is the homepage promise. It doesn't simulate chemistry. It replays scripted outcomes.

---

## Smaller things that add up

- **Practice, Test and Manual mode are the same.** Test mode still shows the full Method with every step spelled out, still offers Practice auto-setup, still shows the live score. There's no exam condition anywhere — nothing hidden, no timer. Three tabs, one behaviour.
- **The nav highlights "Home" on every single page.** I was on `/lab`, on `/atom-builder`, on `/periodic-table` — "Home" stayed lit the whole time. I lost track of where I was.
- **The experiment brief panel can't be worked around.** It's a fixed slab over the right third of the bench, it covers the apparatus, and its "Method" body text is low-contrast italic fading into a brown background — I genuinely struggled to read steps 2 and 3. You can close it, but then you've lost the instructions you need.
- **Two "Score my attempt" buttons overlap each other**, a floating one sitting on top of the bottom-bar one.
- **Reagent search doesn't open its results.** I typed "Iodine" and got `Other 1 / Solids & Metals 1` — collapsed accordion headers. The thing I searched for is behind another click, in a category I now have to guess. Search should surface matches, not count them.
- **"Watch Demo" doesn't play a demo.** It dumps you in the lab. No video, no walkthrough, no tour.
- **The pricing buttons are dead.** "Start Student" and "Get started" — clicked both, nothing happens. No checkout, no signup, no "coming soon". Just an unresponsive button on the page where you take people's money.
- **Three different experiment counts.** Pricing says "All 112". The lab header says "50". The catalog actually has 115. All three are visible in one session.
- **`/about` and `/contact` are "coming soon" stubs** but sit in the global footer of every page.
- **Console errors on the visual layer** — `<path> d="undefined"`, `<ellipse> cx="undefined"` — on the home page, chemicals page and lab. Some apparatus is rendering from broken geometry.
- **Mobile is fine, actually.** 390px, no horizontal overflow, trays stack sensibly. Credit where due.
- **`npm run dev` serves a blank page.** Committed build output at the repo root shadows the dev app. Anyone cloning this to contribute hits a white screen as their first experience.

---

## What I'd fix, in order

1. **Flame test / cation ID returning the wrong element.** Wrong chemistry taught confidently is the one unforgivable thing in an education product. Fix before anything else.
2. **The 68.8% of mark-scheme criteria that can never be awarded.** Right now the app cannot grade. Everything sold on top of grading is hollow until this is fixed.
3. **PDF export.** One embedded Unicode font away from working. It's a paid feature that has never produced a file.
4. **Practice auto-setup overflowing its own glassware.** The first button a new user presses shouldn't fail.
5. **Stop reporting other experiments' conclusions** when a reagent pair coincidentally matches a recipe, and give the 66 orphaned reagents at least a truthful "no visible reaction."
6. **Make Test mode actually a test** — hide the method, hide the live score, add a timer.
7. Fill in "Where to improve". Fix the nav active state. Make search show results. Wire up or disable the pricing buttons. Pick one experiment count.

---

## Would I recommend it?

**As a reference and a visual aid — yes, genuinely.** The Atom Builder is excellent, the 3D structures are lovely, the periodic table is solid, and the written experiment library (safety, method, what to record) is better than a lot of paid material. A teacher could project this tomorrow and get value.

**As a virtual lab you practise and get marked in — no.** Not yet. It marked a correct attempt as a U, told me calcium was lithium, couldn't produce the PDF it charges for, and narrated a conductimetric titration I never performed. A student who trusts it will learn wrong chemistry and conclude they're failing.

The distance between what this app looks like and what it does is the whole story. The shell is 9/10. The engine underneath is a demo that hasn't been tested against the promises the front page makes. Nothing I hit is architecturally hopeless — the flame test is a filter, the marking bug is an ID-vs-name mismatch, the PDF is a font. A focused fortnight on the six items above and this is a product I'd tell people to pay for.

Right now it's a beautiful building with the wiring not yet connected.

**4/10 — recommend once the simulation and marking are honest.**
