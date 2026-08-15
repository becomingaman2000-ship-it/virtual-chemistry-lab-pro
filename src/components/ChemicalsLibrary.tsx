import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Beaker, Flame, Wind, Droplets, X, FlaskConical, Eye, ShieldCheck } from "lucide-react";
import { CHEMICALS, CATEGORY_LABEL, HAZARD_LABEL, type Chemical, type Category } from "@/data/chemicals";
import { CHEMICAL_DETAILS, type DetailStat } from "@/data/chemicalDetails";
import { ChemicalVisual } from "./ChemicalVisual";

const CATEGORY_ORDER: Category[] = [
  "acid", "base", "salt", "metal", "non-metal", "oxide",
  "organic", "solvent", "indicator", "gas", "vapour", "flame",
];

const PHASE_ICON: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  liquid: Droplets,
  aqueous: Droplets,
  solid: Beaker,
  gas: Wind,
  vapour: Wind,
  flame: Flame,
};

export function ChemicalsLibrary() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<Category | "all">("all");
  const [active, setActive] = useState<Chemical | null>(null);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return CHEMICALS.filter((c) => {
      if (cat !== "all" && c.category !== cat) return false;
      if (!needle) return true;
      return (
        c.name.toLowerCase().includes(needle) ||
        c.formula.toLowerCase().includes(needle) ||
        c.category.includes(needle)
      );
    });
  }, [q, cat]);

  const grouped = useMemo(() => {
    const map = new Map<Category, Chemical[]>();
    filtered.forEach((c) => {
      const list = map.get(c.category) ?? [];
      list.push(c);
      map.set(c.category, list);
    });
    return CATEGORY_ORDER.filter((k) => map.has(k)).map((k) => [k, map.get(k)!] as const);
  }, [filtered]);

  return (
    <div className="mx-auto max-w-7xl px-4 pb-24 pt-10 md:pt-14">
      {/* header */}
      <div className="mb-8 flex flex-col gap-2">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Piece 3</p>
        <h1 className="font-display text-4xl md:text-5xl">
          <span className="text-gradient">Chemicals & Substances</span>
        </h1>
        <p className="max-w-2xl text-sm text-muted-foreground md:text-base">
          {CHEMICALS.length} reagents, gases, vapours and flame colours — each with true colour,
          physical constants, hazard flags and live motion. Click any card to inspect.
        </p>
      </div>

      {/* controls */}
      <div className="glass sticky top-24 z-30 mb-6 flex flex-col gap-3 rounded-2xl p-3 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by name, formula, or category…"
            className="w-full rounded-xl border border-border/50 bg-background/40 py-2 pl-9 pr-3 text-sm outline-none focus:border-turquoise"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          <FilterChip active={cat === "all"} onClick={() => setCat("all")}>All</FilterChip>
          {CATEGORY_ORDER.map((k) => (
            <FilterChip key={k} active={cat === k} onClick={() => setCat(k)}>
              {CATEGORY_LABEL[k]}
            </FilterChip>
          ))}
        </div>
      </div>

      {/* results */}
      {grouped.length === 0 ? (
        <div className="glass rounded-2xl p-10 text-center text-muted-foreground">
          No chemicals match your search.
        </div>
      ) : (
        <div className="space-y-10">
          {grouped.map(([category, items]) => (
            <section key={category}>
              <div className="mb-3 flex items-baseline justify-between">
                <h2 className="font-display text-2xl">{CATEGORY_LABEL[category]}</h2>
                <span className="text-xs text-muted-foreground">{items.length} items</span>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {items.map((c) => (
                  <ChemCard key={c.id} chem={c} onOpen={() => setActive(c)} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      <AnimatePresence>
        {active && <ChemicalModal chem={active} onClose={() => setActive(null)} />}
      </AnimatePresence>
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-3 py-1 text-xs transition ${
        active
          ? "bg-navy text-peach shadow dark:bg-turquoise dark:text-charcoal"
          : "bg-background/40 text-foreground/70 hover:bg-foreground/10"
      }`}
    >
      {children}
    </button>
  );
}

function ChemCard({ chem, onOpen }: { chem: Chemical; onOpen: () => void }) {
  const Icon = PHASE_ICON[chem.phase] ?? Beaker;
  return (
    <motion.button
      onClick={onOpen}
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
      className="group glass hover-lift relative overflow-hidden rounded-2xl p-3 text-left"
    >
      <div
        className="absolute inset-0 -z-10 opacity-40 blur-2xl transition group-hover:opacity-70"
        style={{ background: `radial-gradient(60% 60% at 50% 40%, ${chem.color}, transparent 70%)` }}
      />
      <div className="mx-auto aspect-square w-full max-w-[180px]">
        <ChemicalVisual chem={chem} />
      </div>
      <div className="mt-2 flex items-center justify-between gap-2">
        <div className="min-w-0">
          <div className="truncate text-sm font-medium">{chem.name}</div>
          <div className="truncate font-mono text-[11px] text-muted-foreground">{chem.formula}</div>
        </div>
        <Icon size={14} className="shrink-0 text-muted-foreground" />
      </div>
    </motion.button>
  );
}

function ChemicalModal({ chem, onClose }: { chem: Chemical; onClose: () => void }) {
  const detail = CHEMICAL_DETAILS[chem.id];
  const showUses = !(chem.category === "flame" && detail);
  const stats = useMemo(() => {
    const out: DetailStat[] = [];
    const push = (label: string, value: string | null) => {
      if (value) out.push({ label, value });
    };
    push("Molar mass", chem.molarMass ? `${chem.molarMass} g/mol` : null);
    push("Density", chem.density ? `${chem.density} g/cm³` : null);
    push("Melting pt", chem.mp != null ? `${chem.mp} °C` : null);
    push("Boiling pt", chem.bp != null ? `${chem.bp} °C` : null);
    push("Solubility", chem.solubility ?? null);
    push("pH", chem.pH != null ? String(chem.pH) : null);
    // Category-specific figures fill the gap where the generic constants
    // do not apply — indicator ranges, flame wavelengths, gas densities.
    for (const s of detail?.stats ?? []) {
      if (!out.some((o) => o.label === s.label)) out.push(s);
    }
    return out;
  }, [chem, detail]);

  return (
    <motion.div
      className="fixed inset-0 z-[70] grid place-items-center bg-charcoal/60 p-4 backdrop-blur-md"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        onClick={(e) => e.stopPropagation()}
        initial={{ y: 30, opacity: 0, scale: 0.95 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 20, opacity: 0, scale: 0.97 }}
        transition={{ duration: 0.35, ease: [0.2, 0.8, 0.2, 1] }}
        className="glass-strong relative grid max-h-[88vh] w-full max-w-3xl grid-cols-1 gap-6 overflow-y-auto rounded-3xl p-6 md:grid-cols-[280px_1fr] md:items-start"
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full border border-border/60 bg-background/40 hover:bg-foreground/10"
        >
          <X size={16} />
        </button>

        <div
          className="relative grid aspect-square place-items-center rounded-2xl md:sticky md:top-0"
          style={{ background: `radial-gradient(70% 70% at 50% 40%, ${chem.color}22, transparent 70%)` }}
        >
          <ChemicalVisual chem={chem} size={260} />
        </div>

        <div className="min-w-0">
          <div className="text-xs uppercase tracking-widest text-muted-foreground">
            {CATEGORY_LABEL[chem.category]} · {chem.phase}
          </div>
          <h3 className="mt-1 font-display text-3xl">{chem.name}</h3>
          <div className="mt-1 font-mono text-sm text-muted-foreground">{chem.formula}</div>

          {detail && (
            <p className="mt-3 text-sm leading-relaxed text-foreground/85">{detail.appearance}</p>
          )}
          {detail?.odour && (
            <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">
              <span className="font-medium text-foreground/70">Odour: </span>
              {detail.odour}
            </p>
          )}

          {/* Only the constants this substance actually has, plus whatever its
              category makes meaningful. A flame test has no boiling point, and
              printing six dashes teaches nobody anything. */}
          {stats.length > 0 && (
            <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
              {stats.map((s) => (
                <Stat key={s.label} label={s.label} value={s.value} />
              ))}
            </div>
          )}

          {chem.hazards.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-1.5">
              {chem.hazards.map((h) => (
                <span
                  key={h}
                  className="rounded-full border border-aurora-red/50 bg-aurora-red/10 px-2 py-0.5 text-[11px] font-medium text-aurora-red"
                >
                  {HAZARD_LABEL[h]}
                </span>
              ))}
            </div>
          )}

          {/* For flames the legacy `uses` string is just the colour again,
              which the appearance line already says better. */}
          {showUses && (
            <div className="mt-4 rounded-xl border border-border/50 bg-background/40 p-3 text-sm">
              <div className="mb-1 text-xs uppercase tracking-widest text-muted-foreground">Uses</div>
              <p className="text-foreground/85">{chem.uses}</p>
            </div>
          )}
          {chem.notes && <p className="mt-2 text-xs text-muted-foreground">{chem.notes}</p>}

          {detail?.reactions && detail.reactions.length > 0 && (
            <DetailList icon={FlaskConical} title="Characteristic reactions" items={detail.reactions} />
          )}
          {detail?.tests && detail.tests.length > 0 && (
            <DetailList icon={Eye} title="How you identify it" items={detail.tests} />
          )}
          {detail?.safety && (
            <div className="mt-3 flex gap-2 rounded-xl border border-aurora-red/30 bg-aurora-red/5 p-3">
              <ShieldCheck size={14} className="mt-0.5 shrink-0 text-aurora-red" />
              <div>
                <div className="text-xs uppercase tracking-widest text-muted-foreground">
                  Handling in the lab
                </div>
                <p className="mt-0.5 text-[13px] leading-relaxed text-foreground/85">{detail.safety}</p>
              </div>
            </div>
          )}

          <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
            <span className="inline-block h-4 w-4 rounded border border-border/60" style={{ background: chem.color }} />
            <span className="font-mono">{chem.color}</span>
            {chem.accent && (
              <>
                <span className="inline-block h-4 w-4 rounded border border-border/60" style={{ background: chem.accent }} />
                <span className="font-mono">{chem.accent}</span>
              </>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function DetailList({
  icon: Icon,
  title,
  items,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  title: string;
  items: string[];
}) {
  return (
    <div className="mt-3 rounded-xl border border-border/50 bg-background/40 p-3">
      <div className="mb-1.5 flex items-center gap-1.5 text-xs uppercase tracking-widest text-muted-foreground">
        <Icon size={12} className="text-turquoise" />
        {title}
      </div>
      <ul className="space-y-1.5">
        {items.map((t, i) => (
          <li key={i} className="flex gap-2 text-[13px] leading-relaxed text-foreground/85">
            <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-turquoise" />
            <span className="min-w-0">{t}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border/40 bg-background/30 px-2.5 py-1.5">
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className="text-sm font-medium">{value}</div>
    </div>
  );
}
