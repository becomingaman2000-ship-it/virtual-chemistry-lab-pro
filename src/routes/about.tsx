import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, FlaskConical, GraduationCap, ShieldCheck, Beaker } from "lucide-react";
import { PageTransition } from "@/components/PageTransition";
import { COMPLETE_SYLLABUS_EXPERIMENTS } from "@/lib/lab/experimentsCatalog";
import { SYLLABI } from "@/data/syllabi";
import { APPARATUS } from "@/data/apparatus";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — ChemVM" },
      {
        name: "description",
        content:
          "What ChemVM is, who it is for, and an honest account of what the simulation can and cannot do.",
      },
    ],
  }),
  component: AboutPage,
});

// Counted from the real catalogue so the copy can never drift from the app.
const EXPERIMENT_COUNT = COMPLETE_SYLLABUS_EXPERIMENTS.length;
const SYLLABUS_COUNT = SYLLABI.length;
const REGION_COUNT = new Set(SYLLABI.map((s) => s.region)).size;
const APPARATUS_COUNT = APPARATUS.length;

const STATS = [
  { icon: FlaskConical, value: `${EXPERIMENT_COUNT}`, label: "syllabus experiments" },
  { icon: GraduationCap, value: `${SYLLABUS_COUNT}`, label: `syllabuses across ${REGION_COUNT} regions` },
  { icon: Beaker, value: `${APPARATUS_COUNT}`, label: "pieces of apparatus" },
  { icon: ShieldCheck, value: "0", label: "accounts or downloads needed" },
];

export function AboutPage() {
  return (
    <PageTransition>
      <section className="mx-auto max-w-4xl px-4 py-16 md:py-24">
        <div className="text-xs font-mono uppercase tracking-widest text-turquoise">About</div>
        <h1
          className="mt-3 text-4xl font-semibold md:text-5xl"
          style={{ fontFamily: "var(--font-display)" }}
        >
          A chemistry lab for students who <span className="text-gradient">don&apos;t have one</span>
        </h1>
        <p className="mt-5 max-w-2xl text-lg text-muted-foreground">
          Across much of the world a practical chemistry syllabus is examined but never taught with real
          glassware — the reagents are expensive, the fume cupboard doesn&apos;t exist, and the class is
          fifty strong. ChemVM is a bench that runs in a browser tab, so the practical can at least be
          rehearsed before it is sat.
        </p>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STATS.map(({ icon: Icon, value, label }) => (
            <div key={label} className="glass rounded-2xl p-5">
              <Icon size={18} className="mb-3 text-turquoise" />
              <div className="text-2xl font-semibold" style={{ fontFamily: "var(--font-display)" }}>
                {value}
              </div>
              <div className="mt-0.5 text-[13px] text-muted-foreground">{label}</div>
            </div>
          ))}
        </div>

        <h2 className="mt-14 text-2xl font-semibold" style={{ fontFamily: "var(--font-display)" }}>
          How it works
        </h2>
        <p className="mt-3 text-muted-foreground">
          Pick your board and level — ZIMSEC, Cambridge, WAEC, NECTA and more — and the experiment list
          filters to the practicals that syllabus actually examines. Each one carries a brief with the aim,
          apparatus, reagents, safety notes and method. You lay out the glassware, add reagents, heat,
          measure pH and temperature, and run flame, gas and indicator tests. Every observation is logged.
          When you submit, the attempt is marked against the exam rubric and you can export the whole
          session as a PDF lab report.
        </p>

        <h2 className="mt-12 text-2xl font-semibold" style={{ fontFamily: "var(--font-display)" }}>
          What it is not
        </h2>
        <p className="mt-3 text-muted-foreground">
          The simulation is a teaching model, not a research-grade chemistry engine. Reactions are drawn
          from a curated rule base covering the reagent combinations these syllabuses examine; mix
          something outside that set and the bench will honestly tell you it saw no visible change rather
          than invent a result. Rates, yields and thermodynamics are approximations chosen to behave the
          way a textbook says they should. It is a rehearsal for the real practical, and no substitute for
          time in a real laboratory where one is available.
        </p>

        <h2 className="mt-12 text-2xl font-semibold" style={{ fontFamily: "var(--font-display)" }}>
          Access
        </h2>
        <p className="mt-3 text-muted-foreground">
          The lab, the periodic table, the atom builder and the 3D structure viewer are free and need no
          account. Nothing is installed and nothing leaves your device — the whole simulation runs in the
          browser.
        </p>

        <div className="mt-10 flex flex-wrap gap-3">
          <Link
            to="/lab"
            className="group inline-flex items-center gap-2 rounded-full bg-navy px-6 py-3 text-sm font-medium text-peach shadow-elegant transition hover:shadow-glow dark:bg-turquoise dark:text-charcoal"
          >
            Open the Lab
            <ArrowRight size={16} className="transition group-hover:translate-x-1" />
          </Link>
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 rounded-full border border-border/60 px-6 py-3 text-sm font-medium transition hover:bg-foreground/5"
          >
            Get in touch
          </Link>
        </div>
      </section>
    </PageTransition>
  );
}
