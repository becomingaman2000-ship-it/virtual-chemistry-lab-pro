import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, type Variants } from "framer-motion";
import {
  Beaker, Atom, Flame, Droplets, ShieldCheck, Cloud, GraduationCap,
  Users, Sparkles, PlayCircle, ArrowRight, Check, Wind, Snowflake, Zap,
} from "lucide-react";
import { PageTransition } from "@/components/PageTransition";
import { BeakerAnimation } from "@/components/BeakerAnimation";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ChemVM — Experience Chemistry Without Limits" },
      { name: "description", content: "A fully interactive virtual chemistry laboratory built for ZIMSEC and Cambridge students. Drag, mix, react, and observe from any device." },
      { property: "og:title", content: "ChemVM — Experience Chemistry Without Limits" },
      { property: "og:description", content: "Curriculum-aligned virtual lab for ZIMSEC & Cambridge. Built by Project X." },
    ],
  }),
  component: HomePage,
});

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.2, 0.8, 0.2, 1] as const } },
};
const stagger: Variants = { show: { transition: { staggerChildren: 0.08 } } };

const badges = ["Curriculum-Aligned", "Cloud-Synced Progress", "Built for African Classrooms", "Bank-Grade Data Security"];

const features = [
  { icon: Beaker, title: "Drag-and-Drop Apparatus", desc: "Beakers, burettes, Bunsen burners, test tubes — positioned exactly like a physical bench." },
  { icon: Atom, title: "~200-Reaction Engine", desc: "Curriculum-relevant reactions with accurate colour change, gas evolution, precipitates & heat effects." },
  { icon: Sparkles, title: "SVG-Animated Reactions", desc: "Smooth animations for bubbling, colour transitions, smoke, and crystallisation — no heavy video." },
  { icon: GraduationCap, title: "Three Learning Modes", desc: "Tutorial (guided), Practice (open), and Test (scored, timed) for every experiment." },
  { icon: Check, title: "Scored Checklists", desc: "Step-by-step marking mirroring real exam-style lab assessment." },
  { icon: ShieldCheck, title: "Safety-First Sandbox", desc: "Make mistakes, learn consequences — zero physical risk." },
];

const stats = [
  { k: "Global-caliber engineering", v: "A distributed team built to ship at the speed of the world's top software companies." },
  { k: "Education-first design", v: "Every interaction mapped to ZIMSEC and Cambridge syllabus outcomes." },
  { k: "Built for scale", v: "Infrastructure designed to support thousands of concurrent students without slowdown." },
  { k: "More coming soon", v: "Project X is preparing to launch additional tools across the ChemVM and KineticsVM ecosystem." },
];

const journey = [
  "Sign up and select your exam board (ZIMSEC / Cambridge) and level.",
  "Choose an experiment from the curriculum-mapped library.",
  "Pick a mode — Tutorial, Practice, or Test.",
  "Run the simulation — drag apparatus, add reagents, observe real-time reactions.",
  "Get scored feedback — see exactly which steps you nailed.",
  "Track progress — dashboard view of completed experiments and weak topics.",
];

const boards = [
  "ZIMSEC O-Level Chemistry",
  "ZIMSEC A-Level Chemistry",
  "Cambridge IGCSE Chemistry",
  "Cambridge A-Level Chemistry",
];

const topics = ["Acids & Bases", "Qualitative Analysis", "Organic Chemistry", "Electrochemistry", "Rates of Reaction", "Energetics"];


const testimonials = [
  { q: "Finally a chemistry lab that works even when our school's actual lab equipment doesn't.", by: "ZIMSEC student" },
  { q: "My students run experiments at home now instead of just reading about them.", by: "Chemistry teacher" },
];

const faqs = [
  ["Does this replace real lab work?", "No — ChemVM supplements physical lab time, builds intuition before hands-on sessions, and provides practice when lab access is limited."],
  ["Do I need to install anything?", "No. ChemVM runs entirely in the browser."],
  ["Is my data safe?", "All progress is synced and stored securely via a cloud backend, with role-based access control."],
  ["Who built ChemVM?", "ChemVM is built by Project X's engineering team, with continued development across the broader virtual-lab product line."],
];

const animations = [
  { icon: Droplets, label: "Mix & Pour" },
  { icon: Flame, label: "Heat & Boil" },
  { icon: Wind, label: "Bubble & Gas" },
  { icon: Snowflake, label: "Freeze & Crystal" },
  { icon: Zap, label: "Explode & Foam" },
  { icon: Sparkles, label: "Color Change" },
];

const howItWorks = [
  {
    step: 1,
    title: "Pick a syllabus & experiment",
    desc: "Choose your board and level — ZIMSEC, Cambridge, WAEC and more — then pick from the matching experiments. The brief lists aim, apparatus, reagents and safety notes.",
  },
  {
    step: 2,
    title: "Set up the bench",
    desc: "Drag apparatus from the sidebar or hit Auto-setup to have the glassware and reagents laid out for you, dosed to each vessel's real capacity.",
  },
  {
    step: 3,
    title: "React, heat and measure",
    desc: "Add reagents, light the Bunsen, take pH and temperature readings, and run flame, gas and indicator tests. Every observation lands in the results table.",
  },
  {
    step: 4,
    title: "Get marked, export the report",
    desc: "Switch to Test mode to hide the answers, then score your attempt against the exam rubric and download a PDF lab report of the whole session.",
  },
];

function HomePage() {
  return (
    <PageTransition>
      {/* HERO */}
      <section className="relative overflow-hidden px-4 pt-16 pb-24 md:pt-24 md:pb-32">
        <div className="pointer-events-none absolute inset-0 bg-hero-radial" />
        <div className="mx-auto grid max-w-7xl items-center gap-12 md:grid-cols-2">
          <motion.div variants={stagger} initial="hidden" animate="show">
            <motion.h1
              variants={fadeUp}
              className="text-5xl font-semibold leading-[1.05] tracking-tight md:text-7xl"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Experience Chemistry <span className="text-gradient animate-aurora">Without Limits</span>
            </motion.h1>
            <motion.p variants={fadeUp} className="mt-6 max-w-xl text-lg text-muted-foreground">
              A fully interactive virtual chemistry laboratory built for ZIMSEC and Cambridge students —
              mix, react, and observe real chemical behavior from any device, anytime.
            </motion.p>
            <motion.div variants={fadeUp} className="mt-8 flex flex-wrap gap-3">
              {/* The lab is free and needs no account, so "Start Free Trial"
                  promised a signup flow that does not exist. */}
              <Link
                to="/lab"
                className="group inline-flex items-center gap-2 rounded-full bg-navy px-6 py-3 text-sm font-medium text-peach shadow-elegant transition hover:shadow-glow dark:bg-turquoise dark:text-charcoal"
              >
                Open the Lab
                <ArrowRight size={16} className="transition group-hover:translate-x-1" />
              </Link>
              {/* There is no demo video to play; this scrolls to the written
                  walkthrough instead of pretending to open one. */}
              <a
                href="#how-it-works"
                className="glass inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-medium"
              >
                <PlayCircle size={16} /> See how it works
              </a>
            </motion.div>
            <motion.div variants={fadeUp} className="mt-10 flex flex-wrap gap-2">
              {badges.map((b) => (
                <span key={b} className="glass rounded-full px-3 py-1 text-xs text-foreground/80">{b}</span>
              ))}
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, ease: [0.2, 0.8, 0.2, 1] }}
            className="relative mx-auto aspect-square w-full max-w-md"
          >
            <BeakerAnimation className="h-full w-full" />
          </motion.div>
        </div>
      </section>

      {/* CREATOR STRIP */}
      <section className="px-4">
        <div className="glass mx-auto max-w-7xl rounded-2xl px-6 py-4 text-center text-sm text-muted-foreground">
          Built by <span className="font-semibold text-foreground">Project X</span> — engineered by one of the most capable software engineering teams working today.
        </div>
      </section>

      {/* HOW IT WORKS — the target of the hero's "See how it works" link. */}
      <Section id="how-it-works" eyebrow="How it works" title="From empty bench to marked report in four steps">
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {howItWorks.map(({ step, title, desc }) => (
            <div key={step} className="glass hover-lift rounded-2xl p-6">
              <div className="mb-3 inline-grid h-9 w-9 place-items-center rounded-full bg-aurora animate-aurora text-sm font-semibold text-white">
                {step}
              </div>
              <h3 className="mb-1.5 text-base font-semibold" style={{ fontFamily: "var(--font-display)" }}>{title}</h3>
              <p className="text-sm text-muted-foreground">{desc}</p>
            </div>
          ))}
        </div>
        <div className="mt-8">
          <Link
            to="/lab"
            className="group inline-flex items-center gap-2 rounded-full bg-navy px-6 py-3 text-sm font-medium text-peach shadow-elegant transition hover:shadow-glow dark:bg-turquoise dark:text-charcoal"
          >
            Try it now
            <ArrowRight size={16} className="transition group-hover:translate-x-1" />
          </Link>
        </div>
      </Section>

      {/* ABOUT */}
      <Section id="about" eyebrow="Who's behind ChemVM" title="Powered by Project X">
        <div className="grid gap-10 md:grid-cols-2">
          <p className="text-muted-foreground leading-relaxed">
            ChemVM is developed and maintained by <span className="text-foreground font-medium">Project X</span>, an emerging technology
            company assembling one of the most capable website and software engineering teams in the world. Its engineering bench spans
            simulation engineering, cloud infrastructure, instructional design, and African EdTech deployment — giving ChemVM a level of
            technical depth rarely seen in educational software built for this market.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {stats.map((s) => (
              <div key={s.k} className="glass hover-lift rounded-2xl p-5">
                <div className="text-sm font-semibold text-gradient">{s.k}</div>
                <div className="mt-2 text-sm text-muted-foreground">{s.v}</div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* FEATURES */}
      <Section eyebrow="Core Features" title="Everything a Real Lab Has — Without the Real-World Risk">
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          className="grid gap-5 md:grid-cols-2 lg:grid-cols-3"
        >
          {features.map(({ icon: Icon, title, desc }) => (
            <motion.div key={title} variants={fadeUp} className="glass hover-lift group rounded-2xl p-6">
              <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-aurora animate-aurora text-white shadow-elegant">
                <Icon size={20} />
              </div>
              <h3 className="mb-1.5 text-lg font-semibold" style={{ fontFamily: "var(--font-display)" }}>{title}</h3>
              <p className="text-sm text-muted-foreground">{desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </Section>

      {/* ANIMATION LIBRARY PREVIEW */}
      <Section eyebrow="Animation Library" title="Reactions that look — and behave — like the real thing">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
          {animations.map(({ icon: Icon, label }) => (
            <div key={label} className="glass hover-lift group flex flex-col items-center gap-3 rounded-2xl p-5 text-center">
              <div className="grid h-12 w-12 place-items-center rounded-full bg-aurora animate-aurora text-white">
                <Icon size={20} />
              </div>
              <div className="text-xs font-mono uppercase tracking-widest text-muted-foreground">{label}</div>
            </div>
          ))}
        </div>
      </Section>

      {/* CURRICULUM */}
      <Section eyebrow="Curriculum Alignment" title="Mapped to the Syllabus You're Actually Studying">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="glass rounded-2xl p-6">
            <h4 className="mb-3 text-sm font-semibold uppercase tracking-widest text-muted-foreground">Exam Boards</h4>
            <ul className="space-y-2">
              {boards.map((b) => (
                <li key={b} className="flex items-center gap-2 text-sm">
                  <Check size={16} className="text-turquoise" /> {b}
                </li>
              ))}
            </ul>
          </div>
          <div className="glass rounded-2xl p-6">
            <h4 className="mb-3 text-sm font-semibold uppercase tracking-widest text-muted-foreground">Topics Covered</h4>
            <div className="flex flex-wrap gap-2">
              {topics.map((t) => (
                <span key={t} className="rounded-full border border-border bg-background/40 px-3 py-1 text-sm">{t}</span>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* JOURNEY */}
      <Section eyebrow="How it works" title="The Student Journey">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {journey.map((step, i) => (
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.5 }}
              viewport={{ once: true }}
              className="glass rounded-2xl p-6"
            >
              <div className="mb-3 text-xs font-mono uppercase tracking-widest text-gradient">Step {String(i + 1).padStart(2, "0")}</div>
              <p className="text-sm text-foreground/90">{step}</p>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* INSTRUCTORS */}
      <Section eyebrow="For Instructors" title="Built for Teachers, Not Just Students">
        <div className="glass rounded-3xl p-8 md:p-12">
          <div className="grid gap-8 md:grid-cols-2">
            <div>
              <Users size={32} className="mb-4 text-turquoise" />
              <p className="text-muted-foreground">
                Role-based instructor tools designed around how teachers actually work — assign experiments,
                monitor progress, and export results without leaving the platform.
              </p>
            </div>
            <ul className="space-y-3">
              {[
                "Role-based instructor dashboard",
                "Assign specific experiments to a class",
                "View aggregated and individual performance",
                "Identify common mistakes across a cohort",
                "Export results for record-keeping",
              ].map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm"><Check size={18} className="mt-0.5 shrink-0 text-turquoise" /> {f}</li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      {/* TESTIMONIALS */}
      <Section eyebrow="What people say" title="Loved by Students & Teachers">
        <div className="grid gap-5 md:grid-cols-2">
          {testimonials.map((t) => (
            <blockquote key={t.by} className="glass rounded-2xl p-7">
              <p className="text-lg leading-relaxed" style={{ fontFamily: "var(--font-display)" }}>
                "{t.q}"
              </p>
              <footer className="mt-4 text-xs font-mono uppercase tracking-widest text-muted-foreground">— {t.by}</footer>
            </blockquote>
          ))}
        </div>
      </Section>

      {/* FAQ */}
      <Section eyebrow="FAQ" title="Questions, Answered">
        <div className="mx-auto grid max-w-3xl gap-3">
          {faqs.map(([q, a]) => (
            <details key={q} className="glass group rounded-2xl p-5 [&_summary::-webkit-details-marker]:hidden">
              <summary className="flex cursor-pointer items-center justify-between gap-4 text-base font-medium">
                {q}
                <span className="text-turquoise transition group-open:rotate-45">＋</span>
              </summary>
              <p className="mt-3 text-sm text-muted-foreground">{a}</p>
            </details>
          ))}
        </div>
      </Section>

      {/* FINAL CTA */}
      <section className="px-4 pb-24 pt-8">
        <div className="glass-strong relative mx-auto max-w-5xl overflow-hidden rounded-3xl p-10 text-center md:p-16">
          <div className="absolute inset-0 -z-10 bg-aurora animate-aurora opacity-20" />
          <Cloud className="mx-auto mb-4 text-turquoise" size={32} />
          <h2 className="text-4xl font-semibold md:text-5xl" style={{ fontFamily: "var(--font-display)" }}>
            Step into the <span className="text-gradient">lab</span>.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            No downloads. No setup. Just chemistry — running live in your browser.
          </p>
          <Link
            to="/lab"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-navy px-6 py-3 text-sm font-medium text-peach shadow-elegant transition hover:shadow-glow dark:bg-turquoise dark:text-charcoal"
          >
            Launch ChemVM <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </PageTransition>
  );
}

function Section({
  eyebrow, title, children, id,
}: { eyebrow: string; title: string; children: React.ReactNode; id?: string }) {
  return (
    <section id={id} className="px-4 py-20 md:py-28">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="mb-10 md:mb-14"
        >
          <div className="mb-3 text-xs font-mono uppercase tracking-widest text-turquoise">{eyebrow}</div>
          <h2 className="max-w-3xl text-3xl font-semibold leading-tight md:text-5xl" style={{ fontFamily: "var(--font-display)" }}>
            {title}
          </h2>
        </motion.div>
        {children}
      </div>
    </section>
  );
}
