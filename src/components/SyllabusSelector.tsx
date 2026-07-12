import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "@tanstack/react-router";
import {
  Award,
  BookOpen,
  Check,
  ChevronRight,
  FileText,
  GraduationCap,
  Scale,
  Sparkles,
  X,
} from "lucide-react";
import { SYLLABI, REGIONS, type Level, type Region, type Syllabus } from "@/data/syllabi";
import { EXPERIMENTS } from "@/data/experiments";
import { useSyllabus } from "@/hooks/use-syllabus";

const LEVELS: (Level | "All")[] = ["All", "O-Level", "A-Level"];
const REGION_TABS: (Region | "All")[] = ["All", ...REGIONS];

const MODE_LABEL: Record<Syllabus["practicalMode"], string> = {
  "standalone": "Standalone practical",
  "alternative": "Alternative-to-practical",
  "written-scenario": "Written scenarios",
  "school-based": "School-based (SBA)",
};

export function SyllabusSelector() {
  const { syllabus, setSyllabus, hydrated } = useSyllabus();
  const [region, setRegion] = useState<Region | "All">("All");
  const [level, setLevel] = useState<Level | "All">("All");
  const [query, setQuery] = useState("");
  const [detail, setDetail] = useState<Syllabus | null>(null);

  const filtered = useMemo(
    () =>
      SYLLABI.filter((s) => {
        if (region !== "All" && s.region !== region) return false;
        if (level !== "All" && s.level !== level) return false;
        if (query.trim()) {
          const q = query.toLowerCase();
          return (
            s.title.toLowerCase().includes(q) ||
            s.country.toLowerCase().includes(q) ||
            s.board.toLowerCase().includes(q) ||
            s.code.toLowerCase().includes(q)
          );
        }
        return true;
      }),
    [region, level, query],
  );

  return (
    <section className="px-4 py-16">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/40 px-3 py-1 text-xs font-mono uppercase tracking-widest text-turquoise">
            <GraduationCap size={14} /> Piece 5 · Syllabus & Marking
          </div>
          <h1
            className="mt-4 text-4xl font-semibold md:text-6xl"
            style={{ fontFamily: "var(--font-display)" }}
          >
            <span className="text-gradient">Choose your syllabus</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            Every experiment is marked against a criterion-referenced rubric.
            Pick the exam board and level you're preparing for — ChemVM
            re-weights each mark and formats every report to that syllabus.
          </p>
        </motion.div>

        {/* Active syllabus banner */}
        <AnimatePresence>
          {hydrated && syllabus && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="glass mx-auto mt-8 flex max-w-3xl items-center justify-between gap-4 rounded-2xl px-5 py-3"
            >
              <div className="flex items-center gap-3">
                <div className="grid h-9 w-9 place-items-center rounded-xl bg-aurora animate-aurora text-white">
                  <Check size={16} />
                </div>
                <div className="text-left">
                  <div className="text-xs font-mono uppercase tracking-widest text-turquoise">
                    Active
                  </div>
                  <div className="text-sm font-medium">{syllabus.title}</div>
                </div>
              </div>
              <button
                onClick={() => setSyllabus(null)}
                className="rounded-full border border-border/60 px-3 py-1.5 text-xs text-muted-foreground hover:bg-foreground/5"
              >
                Clear
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Region / Level / Search */}
        <div className="mt-10 flex flex-col items-center gap-3">
          <div className="glass inline-flex flex-wrap justify-center rounded-full p-1">
            {REGION_TABS.map((r) => (
              <button
                key={r}
                onClick={() => setRegion(r)}
                className={`rounded-full px-3.5 py-1.5 text-xs transition md:text-sm ${
                  region === r
                    ? "bg-navy text-peach dark:bg-turquoise dark:text-charcoal"
                    : "text-foreground/70 hover:text-foreground"
                }`}
              >
                {r}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <div className="glass inline-flex rounded-full p-1">
              {LEVELS.map((l) => (
                <button
                  key={l}
                  onClick={() => setLevel(l)}
                  className={`rounded-full px-4 py-1.5 text-sm transition ${
                    level === l
                      ? "bg-navy text-peach dark:bg-turquoise dark:text-charcoal"
                      : "text-foreground/70 hover:text-foreground"
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search board, country or code…"
              className="glass w-64 rounded-full px-4 py-2 text-sm outline-none placeholder:text-muted-foreground/70 focus:ring-2 focus:ring-turquoise/60"
            />
          </div>
          <div className="text-xs text-muted-foreground">
            {filtered.length} syllabus{filtered.length === 1 ? "" : "es"} · sourced from the ChemVM African Chemistry Practicals research reports (Vol. I & II)
          </div>
        </div>

        {/* Syllabus cards */}
        <div className="mt-8 grid gap-5 md:grid-cols-2">
          <AnimatePresence mode="popLayout">
            {filtered.map((s, i) => {
              const active = syllabus?.id === s.id;
              return (
                <motion.div
                  key={s.id}
                  layout
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.35, delay: i * 0.05 }}
                  className={`glass group relative flex flex-col rounded-3xl p-6 transition ${
                    active ? "ring-2 ring-turquoise" : ""
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
                        {s.board} · {s.level} · Code {s.code}
                      </div>
                      <h3
                        className="mt-2 text-xl font-semibold md:text-2xl"
                        style={{ fontFamily: "var(--font-display)" }}
                      >
                        {s.title}
                      </h3>
                      <div className="mt-1 text-xs text-muted-foreground">
                        {s.country} · {s.region}
                      </div>
                    </div>
                    <div className="grid h-11 w-11 place-items-center rounded-2xl bg-foreground/5">
                      <BookOpen size={20} />
                    </div>
                  </div>

                  <p className="mt-3 text-sm text-muted-foreground">
                    {s.summary}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <Chip icon={<Sparkles size={12} />}>
                      {MODE_LABEL[s.practicalMode]}
                    </Chip>
                    <Chip icon={<Scale size={12} />}>
                      {s.topics.length} topics
                    </Chip>
                    <Chip icon={<FileText size={12} />}>
                      {s.topics.reduce((n, t) => n + t.experiments.length, 0)}{" "}
                      experiments
                    </Chip>
                    <Chip icon={<Award size={12} />}>
                      {s.grades.length} grade bands
                    </Chip>
                  </div>

                  <div className="mt-5 flex items-center gap-2 pt-4">
                    <button
                      onClick={() => setSyllabus(s.id)}
                      className={`inline-flex flex-1 items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition ${
                        active
                          ? "bg-foreground/10 text-foreground"
                          : "bg-navy text-peach hover:opacity-90 dark:bg-turquoise dark:text-charcoal"
                      }`}
                    >
                      {active ? (
                        <>
                          <Check size={14} /> Selected
                        </>
                      ) : (
                        <>
                          <Sparkles size={14} /> Use this syllabus
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => setDetail(s)}
                      className="inline-flex items-center gap-1 rounded-full border border-border/60 px-4 py-2 text-sm hover:bg-foreground/5"
                    >
                      Details <ChevronRight size={14} />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* How marking works */}
        <div className="mt-16 grid gap-4 md:grid-cols-3">
          {[
            {
              icon: <Scale size={18} />,
              title: "Weighted rubric",
              body: "Each syllabus multiplies raw action marks — Cambridge rewards precision, ZIMSEC rewards technique.",
            },
            {
              icon: <Award size={18} />,
              title: "Board grade bands",
              body: "A*/A/B/C/D/E/U mapped to the percentage cut-offs published by each exam board.",
            },
            {
              icon: <FileText size={18} />,
              title: "Report format",
              body: "Section headings, signature blocks and mark visibility follow the paper's rubric — automatically.",
            },
          ].map((c) => (
            <div key={c.title} className="glass rounded-2xl p-5">
              <div className="grid h-9 w-9 place-items-center rounded-xl bg-foreground/5">
                {c.icon}
              </div>
              <div className="mt-3 font-medium">{c.title}</div>
              <p className="mt-1 text-sm text-muted-foreground">{c.body}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link
            to="/lab"
            className="inline-flex items-center gap-2 rounded-full bg-navy px-5 py-2.5 text-sm font-medium text-peach dark:bg-turquoise dark:text-charcoal"
          >
            Continue to the Lab <ChevronRight size={16} />
          </Link>
        </div>
      </div>

      {/* Detail modal */}
      <AnimatePresence>
        {detail && <SyllabusDetail syllabus={detail} onClose={() => setDetail(null)} onSelect={() => { setSyllabus(detail.id); setDetail(null); }} active={syllabus?.id === detail.id} />}
      </AnimatePresence>
    </section>
  );
}

function Chip({ children, icon }: { children: React.ReactNode; icon?: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-background/40 px-2.5 py-1 text-[11px] text-muted-foreground">
      {icon}
      {children}
    </span>
  );
}

function SyllabusDetail({
  syllabus,
  onClose,
  onSelect,
  active,
}: {
  syllabus: Syllabus;
  onClose: () => void;
  onSelect: () => void;
  active: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.98 }}
        transition={{ duration: 0.25 }}
        onClick={(e) => e.stopPropagation()}
        className="glass relative flex max-h-[85vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl"
      >
        <div className="flex items-start justify-between gap-4 border-b border-border/40 p-6">
          <div>
            <div className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
              {syllabus.board} · {syllabus.code} · {syllabus.year}
            </div>
            <h3
              className="mt-1 text-2xl font-semibold"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {syllabus.title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="grid h-9 w-9 place-items-center rounded-full border border-border/60 hover:bg-foreground/5"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        <div className="grid gap-6 overflow-y-auto p-6 md:grid-cols-2">
          <div>
            <h4 className="text-sm font-semibold">Grade bands</h4>
            <div className="mt-2 divide-y divide-border/40 rounded-xl border border-border/40">
              {syllabus.grades.map((g) => (
                <div key={g.grade} className="flex items-center gap-3 px-3 py-2">
                  <div className="w-8 text-center font-mono text-sm font-semibold">
                    {g.grade}
                  </div>
                  <div className="w-14 text-xs text-muted-foreground">
                    ≥ {g.min}%
                  </div>
                  <div className="flex-1 text-xs">{g.descriptor}</div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold">Weighting multipliers</h4>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {Object.entries(syllabus.weights).map(([k, v]) => (
                <div
                  key={k}
                  className="flex items-center justify-between rounded-lg border border-border/40 bg-background/40 px-2.5 py-1.5 text-xs"
                >
                  <span className="capitalize text-muted-foreground">{k}</span>
                  <span
                    className={`font-mono ${
                      v > 1 ? "text-turquoise" : v < 1 ? "text-muted-foreground" : ""
                    }`}
                  >
                    ×{v.toFixed(2)}
                  </span>
                </div>
              ))}
              {syllabus.precisionBonus > 0 && (
                <div className="col-span-2 rounded-lg border border-turquoise/40 bg-turquoise/5 px-2.5 py-1.5 text-xs">
                  Precision bonus: +{Math.round(syllabus.precisionBonus * 100)}%
                  for concordant measurements
                </div>
              )}
            </div>
          </div>

          <div className="md:col-span-2">
            <h4 className="text-sm font-semibold">Topics & experiments</h4>
            <div className="mt-2 space-y-2">
              {syllabus.topics.map((t) => (
                <div
                  key={t.id}
                  className="rounded-xl border border-border/40 bg-background/40 p-3"
                >
                  <div className="text-sm font-medium">{t.title}</div>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {t.experiments.map((eid) => {
                      const exp = EXPERIMENTS.find((e) => e.id === eid);
                      return (
                        <span
                          key={eid}
                          className="rounded-full bg-foreground/5 px-2 py-0.5 text-[11px]"
                        >
                          {exp?.title ?? eid}
                        </span>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="md:col-span-2">
            <h4 className="text-sm font-semibold">Report format</h4>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {syllabus.reportFormat.sections.map((s) => (
                <span
                  key={s}
                  className="rounded-full border border-border/40 bg-background/40 px-2.5 py-1 text-[11px]"
                >
                  {s}
                </span>
              ))}
            </div>
            <div className="mt-2 text-xs text-muted-foreground">
              {syllabus.reportFormat.signatureRequired
                ? "Requires student & supervisor signature."
                : "No signature required."}{" "}
              {syllabus.reportFormat.showRawMarks
                ? "Raw marks shown on report."
                : "Grade-only report (marks hidden)."}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-border/40 p-4">
          <button
            onClick={onClose}
            className="rounded-full border border-border/60 px-4 py-2 text-sm hover:bg-foreground/5"
          >
            Close
          </button>
          <button
            onClick={onSelect}
            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium ${
              active
                ? "bg-foreground/10"
                : "bg-navy text-peach dark:bg-turquoise dark:text-charcoal"
            }`}
          >
            {active ? (
              <>
                <Check size={14} /> Currently selected
              </>
            ) : (
              <>
                <Sparkles size={14} /> Use this syllabus
              </>
            )}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
