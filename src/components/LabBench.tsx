/**
 * ChemVM — Virtual Lab Bench (v2, sidebar-driven)
 *
 * Complete rewrite focused on:
 *  - Fixed-viewport layout (no page scrolling on desktop)
 *  - Left sidebar with Apparatus / Chemicals tabs, search, collapsible sections
 *  - SVG apparatus using the shared ApparatusSVG library
 *  - Right-click context menu (heat / cool / freeze / empty / pour into… /
 *    connect / remove)
 *  - Pouring animation between two vessels
 *  - Auto-setup shortcuts (Tripod+Gauze+Beaker+Bunsen or Retort+Clamp+Tube)
 *  - Physics-lite liquid sloshing (surface sway tied to drag velocity)
 *  - Glassmorphic test report modal with reset
 *  - Semantic tokens for light + dark theming
 */

import {
  useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState,
} from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  Beaker, BookOpen, ChevronDown, ChevronRight,
  ClipboardList, Droplets, FlaskConical, Flame, GraduationCap, PanelLeftClose,
  PanelLeftOpen, Play, RotateCw, Search, Snowflake, TestTube, ThermometerSun,
  Trash2, Wand2, X,
} from "lucide-react";
import {
  Undo2, Redo2, Ruler, Lock, Unlock, AlertTriangle, Layers,
} from "lucide-react";
import { Wind, Magnet, Sparkles } from "lucide-react";
import { Table2, ListChecks, Timer as TimerIcon } from "lucide-react";

import { APPARATUS, CATEGORIES, type ApparatusItem, type ApparatusShape } from "@/data/apparatus";
import { ApparatusSVG } from "@/components/ApparatusSVG";
import { CHEMICAL_DATABASE, getChemical, type ChemicalSubstance } from "@/lib/lab/dwsimChemicals";
import { COMPLETE_SYLLABUS_EXPERIMENTS, type SyllabusExperiment } from "@/lib/lab/experimentsCatalog";
import { evaluateReaction, type ContainerState, type ReactionResult } from "@/lib/lab/dwsimEngine";
import { PDF_CATEGORY_LABELS, metaFor, fitsLevel, type PdfCategory } from "@/lib/lab/experimentMeta";
import { SYLLABI, type Syllabus } from "@/data/syllabi";
import { generateReportPdf, downloadReportPdf } from "@/lib/lab/reportPdf";
import {
  FLAMES, flameSpec, flamesFor, defaultFlameFor, stepPhysics,
  flameIntensity, measurementUnit, MEASURE_PRESETS, type FlameId,
} from "@/lib/lab/physics";
import {
  INDICATORS, GAS_TESTS, SEPARATIONS, runIndicator, runGasTest, runFlameTest,
  runSeparation, type TestOutcome,
} from "@/lib/lab/labTests";
import { markAttempt, type Reading, type Criterion } from "@/lib/lab/markingEngine";
import { resolveApparatus } from "@/lib/lab/apparatusResolver";
import { buildProcedure } from "@/lib/lab/experimentProcedure";

/* ============================================================
   Types
============================================================ */

type Mode = "manual" | "practice" | "test";

/** Length of a Test-mode paper, in seconds. */
const TEST_DURATION_S = 45 * 60;
type SidebarTab = "apparatus" | "chemicals";

type Role = "container" | "heat" | "support" | "measure" | "consumable" | "safety";

interface PlacedApparatus {
  uid: string;
  item: ApparatusItem;
  role: Role;
  containerType?: ContainerState["type"];
  x: number;
  y: number;
  z: number;
  swayAmp: number;                     // driven by drag velocity, decays
  ignited?: boolean;                   // burners / hotplates
  flame?: FlameId;                     // which heat source this burner produces
  rotation: number;                    // degrees
  sealed?: boolean;                    // stoppered / closed system
  broken?: boolean;                    // cracked or ruptured — unusable
  sooty?: boolean;                     // soot deposit from a yellow flame
  burning?: string | null;             // combustion flame colour
  dryTicks: number;
  pressure: number;
  /** boiling heat points — 1 at first boil, +1 each second while boiling */
  boilHeat: number;
  boilMs: number;
  state?: ContainerState;              // only if container
  fx: { boiling: boolean; freezing: boolean; foaming: boolean; crystallising: boolean; exploding: number; silverMirror: boolean };
  lastReaction?: ReactionResult | null;
  connectedTo?: string | null;         // uid of support it sits on
}

interface Particle {
  x: number; y: number; vx: number; vy: number;
  life: number; maxLife: number;
  color: string; size: number;
  type: "bubble" | "steam" | "smoke" | "spark" | "foam" | "crystal" | "flash";
}

interface PourStream {
  fromUid: string; toUid: string;
  progress: number;              // 0..1
  color: string;
  substanceIds: Record<string, number>;
  temperature: number;
}

interface LogEntry {
  ts: number;
  kind: "place" | "add" | "heat" | "cool" | "freeze" | "empty" | "pour" | "observe" | "safety" | "reaction" | "connect";
  label: string;
  experimentId?: number;
  /** Chemical IDs involved — the marking engine matches on these, not on `label`. */
  chemicalIds?: string[];
}

/* ============================================================
   Shape → role / container-type
============================================================ */

const CONTAINER_SHAPES: Record<string, ContainerState["type"]> = {
  "beaker": "beaker",
  "flask-conical": "conical_flask",
  "flask-round": "conical_flask",
  "flask-florence": "conical_flask",
  "flask-volumetric": "conical_flask",
  "test-tube": "test_tube",
  "boiling-tube": "test_tube",
  "cylinder": "beaker",
  "watch-glass": "watch_glass",
  "petri-dish": "watch_glass",
  "evap-dish": "watch_glass",
  "crucible": "watch_glass",
  "burette": "burette",
  "pipette": "pipette",
  "buchner-flask": "conical_flask",
  "sep-funnel": "conical_flask",
};

const HEAT_SHAPES = new Set<ApparatusShape>(["burner", "hotplate", "water-bath"]);
const SUPPORT_SHAPES = new Set<ApparatusShape>(["tripod", "stand", "ring", "clamp", "rack", "gauze"]);

function roleOf(item: ApparatusItem): Role {
  if (CONTAINER_SHAPES[item.shape]) return "container";
  if (HEAT_SHAPES.has(item.shape)) return "heat";
  if (SUPPORT_SHAPES.has(item.shape)) return "support";
  if (item.category === "Safety Equipment") return "safety";
  if (item.category === "Hand Tools" || item.shape === "paper") return "consumable";
  return "measure";
}

/**
 * Reagents that are alternative samples for the same test rather than
 * ingredients of one mixture. A flame-test experiment lists lithium, sodium,
 * potassium, calcium… salts because you test each in turn — mixing them gives a
 * meaningless result (and, historically, an instant overflow).
 */
const MUTUALLY_EXCLUSIVE_SAMPLES: string[][] = [
  // Group 1 / 2 / copper flame-test salts
  ["licl_sol", "nacl_sol", "nacl_solid", "kcl_sol", "cacl2_sol", "srcl2_sol", "bacl2_sol", "cuso4_sol"],
  // Halide salts for the silver-nitrate series
  ["nacl_sol", "nabr_sol", "nai_sol", "kcl_sol", "ki_solid"],
];

/**
 * Pick the reagents auto-setup should actually pour: keep everything that
 * combines, but at most one representative of each mutually-exclusive sample
 * group so the demonstration stays chemically meaningful.
 */
function selectAutoSetupReagents(required: string[]): string[] {
  const claimed = new Set<string>();
  const out: string[] = [];
  for (const id of required) {
    const group = MUTUALLY_EXCLUSIVE_SAMPLES.find((g) => g.includes(id));
    if (!group) { out.push(id); continue; }
    const key = MUTUALLY_EXCLUSIVE_SAMPLES.indexOf(group).toString();
    if (claimed.has(key)) continue;
    claimed.add(key);
    out.push(id);
  }
  return out;
}

function capacityOf(type: ContainerState["type"]): number {
  switch (type) {
    case "beaker": return 250;
    case "conical_flask": return 250;
    case "test_tube": return 25;
    case "burette": return 50;
    case "pipette": return 25;
    case "watch_glass": return 15;
    case "chromatography_tank": return 60;
    default: return 100;
  }
}

/* ============================================================
   Colour helpers
============================================================ */
function parseColor(c: string): [number, number, number, number] {
  const m = c.match(/rgba?\(([^)]+)\)/);
  if (m) {
    const parts = m[1].split(",").map((s) => parseFloat(s.trim()));
    return [parts[0] || 0, parts[1] || 0, parts[2] || 0, parts[3] ?? 1];
  }
  if (c.startsWith("#")) {
    const h = c.slice(1);
    const v = h.length === 3 ? h.split("").map((x) => x + x).join("") : h;
    return [
      parseInt(v.slice(0, 2), 16),
      parseInt(v.slice(2, 4), 16),
      parseInt(v.slice(4, 6), 16),
      1,
    ];
  }
  return [180, 200, 220, 1];
}
function toRgba([r, g, b, a]: [number, number, number, number]) {
  return `rgba(${Math.round(r)},${Math.round(g)},${Math.round(b)},${Number(a.toFixed(2))})`;
}
function blendLiquid(state: ContainerState): string {
  const ids = Object.keys(state.substanceIds);
  if (ids.length === 0) return "rgba(200, 220, 240, 0.15)";
  let r = 0, g = 0, b = 0, a = 0, total = 0;
  for (const id of ids) {
    const amt = state.substanceIds[id] || 1;
    const chem = getChemical(id);
    const [pr, pg, pb, pa] = parseColor(chem.color);
    r += pr * amt; g += pg * amt; b += pb * amt; a += pa * amt; total += amt;
  }
  if (!total) return "rgba(200,220,240,0.2)";
  const heat = Math.max(0, (state.temperature - 25) / 200);
  return toRgba([
    Math.min(255, r / total + heat * 20),
    Math.max(0, g / total - heat * 8),
    Math.max(0, b / total - heat * 14),
    Math.min(0.95, Math.max(0.35, a / total + 0.15)),
  ]);
}

/* ============================================================
   Factory + engine wrapper
============================================================ */
function makePlaced(item: ApparatusItem, x: number, y: number, z: number): PlacedApparatus {
  const role = roleOf(item);
  const ct = CONTAINER_SHAPES[item.shape];
  const uid = `${item.id}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  return {
    uid, item, role, x, y, z, swayAmp: 0, ignited: false,
    flame: role === "heat" ? defaultFlameFor(item.id) : undefined,
    rotation: 0, dryTicks: 0, pressure: 0, boilHeat: 0, boilMs: 0, sealed: false, broken: false,
    sooty: false, burning: null,
    containerType: ct,
    state: ct
      ? {
          id: uid, name: item.name, type: ct,
          maxVolume: capacityOf(ct), currentVolume: 0,
          temperature: 22, pH: 7, color: "rgba(200,220,240,0.15)", opacity: 0.2,
          substanceIds: {}, precipitate: null, bubblingGas: null,
          flameColor: null, isHeated: false, stirSpeed: 0,
        }
      : undefined,
    fx: { boiling: false, freezing: false, foaming: false, crystallising: false, exploding: 0, silverMirror: false },
    connectedTo: null,
  };
}

function runReactionOn(app: PlacedApparatus, activeExperimentId?: number): ReactionResult | null {
  if (!app.state) return null;
  const vol = Object.values(app.state.substanceIds).reduce((s, v) => s + v, 0);
  app.state.currentVolume = vol;
  const res = evaluateReaction(app.state, activeExperimentId);
  if (res.newColor) app.state.color = res.newColor;
  if (res.newOpacity !== undefined) app.state.opacity = res.newOpacity;
  if (res.newPrecipitate) app.state.precipitate = res.newPrecipitate;
  if (res.newGas) app.state.bubblingGas = res.newGas;
  if (res.newPH !== undefined) app.state.pH = res.newPH;
  if (res.deltaTemperature) app.state.temperature += res.deltaTemperature;
  if (!app.state.color || app.state.color === "rgba(232, 240, 255, 0.15)") {
    app.state.color = blendLiquid(app.state);
  }
  app.fx.boiling = app.state.temperature >= 95 && vol > 0;
  app.fx.freezing = app.state.temperature <= 2 && vol > 0;
  app.fx.foaming = !!res.newGas && !!res.message && /foam|saponif/i.test(res.message);
  app.fx.crystallising = !!res.newPrecipitate && /crystal/i.test(res.newPrecipitate.name);
  app.fx.exploding = res.isExplosive ? 60 : app.fx.exploding;
  app.fx.silverMirror = !!app.state.hasSilverMirror;
  app.lastReaction = res;
  return res;
}

/* ============================================================
   Main component
============================================================ */
export function LabBench() {
  /* -------- syllabus + experiment -------- */
  const [syllabusId, setSyllabusId] = useState(SYLLABI[0]?.id ?? "");
  const currentSyllabus = SYLLABI.find((s) => s.id === syllabusId) ?? SYLLABI[0];
  const [selectedCategory, setSelectedCategory] = useState<PdfCategory | "ALL">("ALL");
  const [experimentId, setExperimentId] = useState(1);
  const experiment: SyllabusExperiment =
    COMPLETE_SYLLABUS_EXPERIMENTS.find((e) => e.id === experimentId) ?? COMPLETE_SYLLABUS_EXPERIMENTS[0];
  const [mode, setMode] = useState<Mode>("practice");

  const applicableExperiments = useMemo(
    () => COMPLETE_SYLLABUS_EXPERIMENTS.filter((e) => {
      const m = metaFor(e.id);
      if (!fitsLevel(m.level, currentSyllabus.level)) return false;
      if (selectedCategory !== "ALL" && m.category !== selectedCategory) return false;
      return true;
    }),
    [currentSyllabus.level, selectedCategory],
  );

  /* -------- sidebar UI -------- */
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarTab, setSidebarTab] = useState<SidebarTab>("apparatus");
  const [query, setQuery] = useState("");
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    "Containers & Vessels": true,
  });
  const [briefOpen, setBriefOpen] = useState(true);
  // In Test mode the brief is an answer sheet, so the method/analysis sections
  // are withheld until the student switches back to Practice.
  const hideAnswers = mode === "test";

  /* -------- exam conditions (Test mode) --------
     Test mode used to differ from Practice only by a label: the live running
     score stayed on screen and there was no time pressure at all. A real
     paper is timed and gives you no feedback until you hand it in, so Test
     mode now runs a countdown and withholds the score until you submit. */
  const [testRemaining, setTestRemaining] = useState(TEST_DURATION_S);
  const [testStartedAt, setTestStartedAt] = useState<number | null>(null);
  const testExpired = mode === "test" && testRemaining <= 0;

  /* -------- bench state -------- */
  const benchRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [placed, setPlaced] = useState<PlacedApparatus[]>([]);
  const placedRef = useRef<PlacedApparatus[]>([]);
  useEffect(() => { placedRef.current = placed; }, [placed]);
  const [selectedUid, setSelectedUid] = useState<string | null>(null);
  const [selectedUids, setSelectedUids] = useState<string[]>([]);
  const [message, setMessage] = useState("Select apparatus and chemicals from the sidebar to begin.");
  const [log, setLog] = useState<LogEntry[]>([]);
  const logRef = useRef<LogEntry[]>([]);
  useEffect(() => { logRef.current = log; }, [log]);
  const particlesRef = useRef<Particle[]>([]);
  const pourRef = useRef<PourStream | null>(null);
  const [pourPending, setPourPending] = useState<string | null>(null); // source uid awaiting target
  const timeRef = useRef(0);

  const pushLog = useCallback((entry: Omit<LogEntry, "ts">) => {
    setLog((l) => [{ ...entry, ts: Date.now() }, ...l].slice(0, 120));
    // First recorded action starts the exam clock (no-op outside Test mode).
    setTestStartedAt((prev) => prev ?? Date.now());
  }, []);

  /* -------- undo / redo history -------- */
  interface Snapshot { placed: PlacedApparatus[]; log: LogEntry[] }
  const historyRef = useRef<{ past: Snapshot[]; future: Snapshot[] }>({ past: [], future: [] });
  const [histVer, setHistVer] = useState(0);

  const takeSnapshot = useCallback((): Snapshot => ({
    placed: placedRef.current.map((a) => ({
      ...a,
      fx: { ...a.fx },
      state: a.state
        ? { ...a.state, substanceIds: { ...a.state.substanceIds } }
        : undefined,
    })),
    log: [...logRef.current],
  }), []);

  /** call immediately BEFORE any bench-mutating action */
  const commit = useCallback(() => {
    const h = historyRef.current;
    h.past.push(takeSnapshot());
    if (h.past.length > 60) h.past.shift();
    h.future = [];
    setHistVer((v) => v + 1);
  }, [takeSnapshot]);

  const applySnapshot = (s: Snapshot) => {
    placedRef.current = s.placed;
    setPlaced(s.placed);
    setLog(s.log);
    logRef.current = s.log;
    particlesRef.current = [];
    pourRef.current = null;
  };

  const undo = useCallback(() => {
    const h = historyRef.current;
    const prev = h.past.pop();
    if (!prev) { setMessage("Nothing left to undo."); return; }
    h.future.push(takeSnapshot());
    applySnapshot(prev);
    setMessage("Undid last action.");
    setHistVer((v) => v + 1);
  }, [takeSnapshot]);

  const redo = useCallback(() => {
    const h = historyRef.current;
    const next = h.future.pop();
    if (!next) { setMessage("Nothing left to redo."); return; }
    h.past.push(takeSnapshot());
    applySnapshot(next);
    setMessage("Redid action.");
    setHistVer((v) => v + 1);
  }, [takeSnapshot]);

  const canUndo = historyRef.current.past.length > 0;
  const canRedo = historyRef.current.future.length > 0;
  void histVer;

  /* -------- measurement dialog -------- */
  const [measure, setMeasure] = useState<null | { chem: ChemicalSubstance; amount: number }>(null);

  /* -------- flame picker -------- */
  const [flamePicker, setFlamePicker] = useState<string | null>(null); // burner uid

  /* -------- qualitative tests & separations -------- */
  const [testPanel, setTestPanel] = useState<null | { kind: "indicator" | "gas" | "separate"; uid: string }>(null);
  const [testResult, setTestResult] = useState<null | { title: string; outcome: TestOutcome }>(null);
  useEffect(() => {
    if (!testResult) return;
    const t = setTimeout(() => setTestResult(null), 11000);
    return () => clearTimeout(t);
  }, [testResult]);

  /* -------- context menu -------- */
  const [ctxMenu, setCtxMenu] = useState<{ x: number; y: number; uid: string } | null>(null);

  /* -------- report modal (test mode) -------- */
  const [report, setReport] = useState<null | {
    percent: number; grade: string; band: string;
    correct: { label: string }[]; missed: { label: string }[];
    criteria: Criterion[]; rawScore: number; rawTotal: number;
  }>(null);

  /* -------- live results table -------- */
  const [readings, setReadings] = useState<Reading[]>([]);
  const [resultsOpen, setResultsOpen] = useState(false);
  const hazardsRef = useRef(0);
  const measuredAddsRef = useRef(0);

  const recordReading = useCallback((app: PlacedApparatus, action: string, observation: string) => {
    if (!app.state) return;
    setReadings((r) => [
      ...r,
      {
        ts: Date.now(),
        vessel: app.item.name,
        action,
        temperature: Number(app.state!.temperature.toFixed(1)),
        volume: Number(app.state!.currentVolume.toFixed(1)),
        pH: Number(app.state!.pH.toFixed(2)),
        colour: app.state!.color ?? "—",
        observation,
      },
    ].slice(-60));
  }, []);
  const [student, setStudent] = useState({ name: "", level: "", date: new Date().toISOString().slice(0, 10) });
  const [observations, setObservations] = useState<string[]>([]);
  const [obsDraft, setObsDraft] = useState("");
  const [pdfBusy, setPdfBusy] = useState(false);

  const downloadPdf = async () => {
    if (!report) return;
    setPdfBusy(true);
    try {
      const bytes = await generateReportPdf({
        student,
        syllabus: { id: currentSyllabus.id, board: currentSyllabus.board, level: currentSyllabus.level },
        experiment,
        percent: report.percent,
        grade: report.grade,
        band: report.band,
        correct: report.correct,
        missed: report.missed,
        transcript: log.map((l) => ({ ts: l.ts, kind: l.kind, label: l.label })),
        observations,
        readings,
        criteria: report.criteria,
        rawScore: report.rawScore,
        rawTotal: report.rawTotal,
      });
      const safeTitle = experiment.title.replace(/[^a-z0-9]+/gi, "_").slice(0, 40);
      downloadReportPdf(bytes, `ChemVM_Exp${experiment.id}_${safeTitle}.pdf`);
    } catch (err) {
      console.error("PDF generation failed", err);
      setMessage("PDF generation failed — check console.");
    } finally {
      setPdfBusy(false);
    }
  };

  /* ---------------- animation loop ---------------- */
  useEffect(() => {
    const canvas = canvasRef.current; const wrap = benchRef.current;
    if (!canvas || !wrap) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const resize = () => {
      const r = wrap.getBoundingClientRect();
      canvas.width = r.width * dpr; canvas.height = r.height * dpr;
      canvas.style.width = r.width + "px"; canvas.style.height = r.height + "px";
    };
    resize();
    const ro = new ResizeObserver(resize); ro.observe(wrap);

    const ctx = canvas.getContext("2d")!;
    let raf = 0;

    const loop = () => {
      timeRef.current += 0.016;
      const t = timeRef.current;
      const W = canvas.width / dpr, H = canvas.height / dpr;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, W, H);

      // decay sway
      for (const app of placedRef.current) {
        if (app.swayAmp > 0.01) app.swayAmp *= 0.9;
        else app.swayAmp = 0;
      }

      // pour stream
      const pour = pourRef.current;
      if (pour) {
        const from = placedRef.current.find((a) => a.uid === pour.fromUid);
        const to = placedRef.current.find((a) => a.uid === pour.toUid);
        if (from && to) {
          const fx = from.x + from.item.width / 2;
          const fy = from.y + 8;
          const tx = to.x + to.item.width / 2;
          const ty = to.y + 14;
          const p = pour.progress;
          // arc
          const cpX = (fx + tx) / 2, cpY = Math.min(fy, ty) - 40;
          ctx.beginPath();
          for (let i = 0; i <= 30; i++) {
            const u = i / 30;
            if (u > p) break;
            const x = (1 - u) * (1 - u) * fx + 2 * (1 - u) * u * cpX + u * u * tx;
            const y = (1 - u) * (1 - u) * fy + 2 * (1 - u) * u * cpY + u * u * ty;
            if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
          }
          ctx.strokeStyle = pour.color;
          ctx.lineWidth = 4;
          ctx.lineCap = "round";
          ctx.stroke();
          // droplets
          for (let k = 0; k < 3; k++) {
            const u = Math.max(0, p - k * 0.06);
            const x = (1 - u) * (1 - u) * fx + 2 * (1 - u) * u * cpX + u * u * tx;
            const y = (1 - u) * (1 - u) * fy + 2 * (1 - u) * u * cpY + u * u * ty;
            ctx.beginPath(); ctx.arc(x, y, 3, 0, Math.PI * 2);
            ctx.fillStyle = pour.color; ctx.fill();
          }
          pour.progress += 0.03;
          if (pour.progress >= 1) {
            // deposit
            if (to.state) {
              for (const [id, amt] of Object.entries(pour.substanceIds)) {
                to.state.substanceIds[id] = (to.state.substanceIds[id] || 0) + amt;
              }
              to.state.temperature = (to.state.temperature + pour.temperature) / 2;
              runReactionOn(to, experimentId);
            }
            pourRef.current = null;
            setPlaced((p2) => [...p2]);
          }
        } else {
          pourRef.current = null;
        }
      }

      // particles
      const parts = particlesRef.current;
      for (const app of placedRef.current) {
        spawnFx(app, parts);
      }
      for (const p of parts) {
        const alpha = Math.max(0, p.life / p.maxLife);
        ctx.globalAlpha = alpha;
        if (p.type === "bubble") {
          ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.strokeStyle = "rgba(255,255,255,0.9)"; ctx.lineWidth = 1; ctx.stroke();
          ctx.fillStyle = "rgba(255,255,255,0.25)"; ctx.fill();
        } else if (p.type === "steam" || p.type === "smoke") {
          const sz = p.size * (1 + (1 - alpha) * 1.5);
          ctx.beginPath(); ctx.arc(p.x, p.y, sz, 0, Math.PI * 2);
          ctx.fillStyle = p.type === "smoke"
            ? `rgba(70,60,55,${alpha * 0.5})`
            : `rgba(215,225,235,${alpha * 0.55})`;
          ctx.fill();
        } else if (p.type === "foam") {
          ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255,255,255,${alpha * 0.85})`; ctx.fill();
        } else if (p.type === "crystal") {
          ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.vx);
          ctx.fillStyle = p.color; const s = p.size;
          ctx.beginPath(); ctx.moveTo(0, -s); ctx.lineTo(s, 0); ctx.lineTo(0, s); ctx.lineTo(-s, 0); ctx.closePath();
          ctx.fill(); ctx.restore();
        } else if (p.type === "spark") {
          ctx.fillStyle = p.color; ctx.fillRect(p.x, p.y, p.size, p.size);
        } else if (p.type === "flash") {
          const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
          g.addColorStop(0, `rgba(255,240,160,${alpha})`);
          g.addColorStop(0.4, `rgba(255,140,40,${alpha * 0.7})`);
          g.addColorStop(1, "rgba(120,20,0,0)");
          ctx.fillStyle = g;
          ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill();
        }
      }
      ctx.globalAlpha = 1;

      // step + cull
      for (const p of parts) {
        p.x += p.vx; p.y += p.vy; p.life -= 1;
        if (p.type === "steam" || p.type === "smoke") p.vy -= 0.03;
        if (p.type === "bubble") p.vy = Math.min(p.vy, -0.6);
        if (p.type === "crystal") p.vy = Math.min(0.4, p.vy + 0.02);
      }
      particlesRef.current = parts.filter((p) => p.life > 0);

      // burner flames (overlay above SVG)
      for (const app of placedRef.current) {
        if (app.role === "heat" && app.ignited) {
          const spec = flameSpec(app.flame);
          drawFlame(ctx, app.x + app.item.width / 2, app.y + 4, t, spec.color, spec.outerColor, spec.maxTemp);
        }
      }

      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, []);

  /* -------- heat propagation (interval, not every frame) -------- */
  useEffect(() => {
    const t = setInterval(() => {
      let dirty = false;
      const destroyed: string[] = [];
      let notice = "";
      for (const app of placedRef.current) {
        if (!app.state || app.broken) continue;
        // Closest ignited heat source. Further away → weaker flame (cooler max T).
        const vesselCx = app.x + app.item.width / 2;
        const vesselBottom = app.y + app.item.height;
        let bestIntensity = 0;
        let spec: ReturnType<typeof flameSpec> | null = null;
        for (const h of placedRef.current) {
          if (h.role !== "heat" || !h.ignited) continue;
          const hx = h.x + h.item.width / 2;
          const hy = h.y;
          const dx = hx - vesselCx;
          const dy = hy - vesselBottom;
          // Flame sitting well above the vessel cannot heat it from underneath.
          if (dy < -20) continue;
          const intensity = flameIntensity(Math.hypot(dx, dy));
          if (intensity > bestIntensity) {
            bestIntensity = intensity;
            spec = flameSpec(h.flame);
          }
        }
        const heated = !!spec && bestIntensity > 0.02;
        app.state.isHeated = heated;
        if (spec && heated) {
          const maxT = 22 + (spec.maxTemp - 22) * bestIntensity;
          const ramp = spec.ramp * bestIntensity;
          if (app.state.temperature < maxT) {
            app.state.temperature = Math.min(maxT, app.state.temperature + ramp);
            dirty = true;
          } else if (app.state.temperature > maxT + 0.5) {
            app.state.temperature = Math.max(maxT, app.state.temperature - 0.8);
            dirty = true;
          }
        } else if (app.state.temperature > 22) {
          app.state.temperature = Math.max(22, app.state.temperature - 1.5);
          dirty = true;
        }

        // Boiling heat points: start at 1, +1 every second while boiling.
        const volNow = Object.values(app.state.substanceIds).reduce((s, v) => s + v, 0);
        const boilingIdsNow = Object.keys(app.state.substanceIds).filter((id) => {
          if (!(app.state!.substanceIds[id] > 0)) return false;
          const chem = getChemical(id);
          const bp = chem.boilingPoint ?? (chem.state === "solid" ? 900 : 100);
          return app.state!.temperature >= bp;
        });
        const boilingNow = volNow > 0 && boilingIdsNow.length > 0;
        if (boilingNow) {
          if (app.boilHeat < 1) app.boilHeat = 1;
          app.boilMs += 350;
          while (app.boilMs >= 1000) {
            app.boilMs -= 1000;
            app.boilHeat += 1;
          }
          dirty = true;
        } else if (app.boilHeat !== 0 || app.boilMs !== 0) {
          app.boilHeat = 0;
          app.boilMs = 0;
          dirty = true;
        }

        // ---- physical consequences ----
        const out = stepPhysics(
          {
            state: app.state, shape: app.item.shape, flame: heated ? spec : null,
            sealed: !!app.sealed, dryTicks: app.dryTicks, boilHeat: app.boilHeat,
          },
          app.pressure,
        );
        app.dryTicks = out.dryTicks;
        app.pressure = out.pressure;
        app.burning = null;
        for (const hz of out.hazards) {
          dirty = true;
          notice = hz.message;
          if (hz.kind === "ignited") { app.burning = hz.burnColor ?? "#ff9a3d"; app.fx.foaming = false; }
          if (hz.kind === "soot") app.sooty = true;
          if (hz.kind === "frozen") app.fx.freezing = true;
          if (hz.destroys) {
            app.broken = true;
            app.fx.exploding = hz.kind === "ruptured" ? 60 : 30;
            destroyed.push(`${app.item.name}: ${hz.message}`);
            hazardsRef.current += 1;
          }
        }

        if (app.fx.exploding > 0) { app.fx.exploding -= 1; dirty = true; }
        if (dirty && Object.keys(app.state.substanceIds).length > 0) runReactionOn(app, experimentId);
      }
      if (dirty) setPlaced((p) => [...p]);
      if (notice) setMessage(notice);
      for (const d of destroyed) pushLog({ kind: "observe", label: `⚠ ${d}` });
    }, 350);
    return () => clearInterval(t);
  }, [pushLog]);

  /* -------- spawn fx particles -------- */
  function spawnFx(app: PlacedApparatus, parts: Particle[]) {
    if (!app.state) return;
    const vol = Object.values(app.state.substanceIds).reduce((s, v) => s + v, 0);
    if (vol === 0 && app.fx.exploding === 0) return;
    const cx = app.x + app.item.width / 2;
    const topY = app.y + app.item.height * 0.35;
    if (app.fx.boiling && Math.random() < 0.3) {
      parts.push({ x: cx + (Math.random() - 0.5) * 20, y: topY, vx: (Math.random() - 0.5) * 0.4, vy: -1 - Math.random(), life: 90, maxLife: 90, color: "#eef", size: 3 + Math.random() * 3, type: "steam" });
    }
    if (app.state.bubblingGas && Math.random() < 0.35) {
      parts.push({ x: cx + (Math.random() - 0.5) * app.item.width * 0.35, y: app.y + app.item.height - 10 - Math.random() * 20, vx: (Math.random() - 0.5) * 0.3, vy: -0.8 - Math.random() * 0.6, life: 60, maxLife: 60, color: "#fff", size: 2 + Math.random() * 3, type: "bubble" });
    }
    if (app.fx.foaming && Math.random() < 0.4) {
      parts.push({ x: cx + (Math.random() - 0.5) * app.item.width * 0.5, y: topY + Math.random() * 4, vx: (Math.random() - 0.5) * 0.2, vy: -0.2, life: 100, maxLife: 100, color: "#fff", size: 3 + Math.random() * 3, type: "foam" });
    }
    if (app.fx.crystallising && Math.random() < 0.1) {
      parts.push({ x: cx + (Math.random() - 0.5) * app.item.width * 0.4, y: app.y + app.item.height - 14, vx: (Math.random() - 0.5) * 0.3, vy: 0, life: 200, maxLife: 200, color: app.state.precipitate?.color || "#fff", size: 3 + Math.random() * 3, type: "crystal" });
    }
    if (app.fx.exploding > 45) {
      for (let i = 0; i < 3; i++) {
        const ang = Math.random() * Math.PI * 2;
        parts.push({ x: cx, y: app.y + app.item.height / 2, vx: Math.cos(ang) * (2 + Math.random() * 3), vy: Math.sin(ang) * (2 + Math.random() * 3) - 1, life: 40, maxLife: 40, color: "#ffb020", size: 2, type: "spark" });
      }
      parts.push({ x: cx, y: app.y + app.item.height / 2, vx: 0, vy: 0, life: 30, maxLife: 30, color: "", size: 80, type: "flash" });
    }
  }

  function drawFlame(
    ctx: CanvasRenderingContext2D, cx: number, cy: number, time: number,
    color: string, outer: string, maxTemp: number,
  ) {
    const jitter = Math.sin(time * 12) * 3;
    const scale = Math.max(0.45, Math.min(1.2, maxTemp / 600));
    ctx.beginPath(); ctx.moveTo(cx - 12 * scale, cy);
    ctx.quadraticCurveTo(cx - 6 + jitter, cy - 28 * scale, cx + jitter, cy - 58 * scale);
    ctx.quadraticCurveTo(cx + 6 + jitter, cy - 28 * scale, cx + 12 * scale, cy);
    ctx.closePath();
    ctx.fillStyle = outer; ctx.fill();
    ctx.beginPath(); ctx.moveTo(cx - 6 * scale, cy);
    ctx.quadraticCurveTo(cx - 3, cy - 20 * scale, cx + jitter * 0.5, cy - 42 * scale);
    ctx.quadraticCurveTo(cx + 3, cy - 20 * scale, cx + 6 * scale, cy);
    ctx.closePath();
    ctx.fillStyle = color; ctx.fill();
    ctx.beginPath(); ctx.ellipse(cx, cy - 6 * scale, 3, 10 * scale, 0, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255,250,220,0.95)"; ctx.fill();
  }

  /* ============================================================
     Actions
  ============================================================ */

  const addApparatus = (item: ApparatusItem) => {
    const wrap = benchRef.current; if (!wrap) return;
    commit();
    const rect = wrap.getBoundingClientRect();
    const x = 80 + (placed.length * 40) % (rect.width - 200);
    const y = rect.height - 180 - item.height;
    const app = makePlaced(item, x, Math.max(20, y), placed.length);
    setPlaced((p) => [...p, app]);
    setSelectedUid(app.uid);
    setSelectedUids([app.uid]);
    pushLog({ kind: "place", label: `Placed ${item.name}` });
    setMessage(`${item.name} placed. Right-click for actions.`);
  };

  const removePlaced = (uid: string) => {
    commit();
    setPlaced((p) => p.filter((a) => a.uid !== uid));
    setSelectedUids((s) => s.filter((u) => u !== uid));
    if (selectedUid === uid) setSelectedUid(null);
  };

  const emptyContainer = (uid: string) => {
    const app = placedRef.current.find((a) => a.uid === uid);
    if (!app?.state) return;
    commit();
    app.state.substanceIds = {}; app.state.precipitate = null; app.state.bubblingGas = null;
    app.state.flameColor = null; app.state.color = "rgba(200,220,240,0.15)";
    app.state.pH = 7; app.state.currentVolume = 0;
    app.burning = null; app.dryTicks = 0; app.pressure = 0; app.boilHeat = 0; app.boilMs = 0;
    app.fx = { boiling: false, freezing: false, foaming: false, crystallising: false, exploding: 0, silverMirror: false };
    app.lastReaction = null;
    pushLog({ kind: "empty", label: `Emptied and rinsed the ${app.item.name}` });
    setMessage(`Emptied the ${app.item.name} — contents discarded, vessel rinsed.`);
    setPlaced((p) => [...p]);
  };

  const setIgnite = (uid: string, on: boolean) => {
    const app = placedRef.current.find((a) => a.uid === uid); if (!app) return;
    commit();
    app.ignited = on;
    setPlaced((p) => [...p]);
    pushLog({
      kind: on ? "heat" : "cool",
      label: on
        ? `Ignited ${app.item.name} — ${flameSpec(app.flame).label}`
        : `Extinguished ${app.item.name}`,
    });
  };

  /**
   * The ignited burner currently close enough underneath `uid` to heat it.
   * Mirrors the proximity rule used by the heat-propagation loop.
   */
  const heatSourceFor = (uid: string) => {
    const app = placedRef.current.find((a) => a.uid === uid);
    if (!app?.state) return null;
    const cx = app.x + app.item.width / 2;
    const bottom = app.y + app.item.height;
    return (
      placedRef.current.find((h) => {
        if (h.role !== "heat" || !h.ignited) return false;
        const dy = h.y - bottom;
        if (dy < -20) return false;
        return flameIntensity(Math.hypot(h.x + h.item.width / 2 - cx, dy)) > 0.02;
      }) ?? null
    );
  };

  /**
   * One-click heating from a vessel's own menu: right-clicking a beaker and
   * asking for heat should just work. Reuses a burner already under the
   * vessel, otherwise slides an unlit one into position, and only as a last
   * resort places a new burner directly underneath before lighting it.
   */
  const toggleHeatFor = (uid: string) => {
    const app = placedRef.current.find((a) => a.uid === uid);
    if (!app?.state) return;

    const lit = heatSourceFor(uid);
    if (lit) {
      setIgnite(lit.uid, false);
      setMessage(`Heat removed from the ${app.item.name}.`);
      return;
    }

    const cx = app.x + app.item.width / 2;
    const bottom = app.y + app.item.height;
    const burnerItem =
      APPARATUS.find((a) => a.id === "bunsen") ?? APPARATUS.find((a) => roleOf(a) === "heat");
    if (!burnerItem) {
      setMessage("No burner is available in this apparatus set.");
      return;
    }

    commit();
    const idle = placedRef.current.find((h) => h.role === "heat" && !h.ignited);
    const target = idle ?? makePlaced(burnerItem, 0, 0, placedRef.current.length);
    target.x = cx - target.item.width / 2;
    target.y = bottom - 2;
    target.ignited = true;

    if (idle) {
      setPlaced((p) => [...p]);
      setMessage(`Moved the ${target.item.name} under the ${app.item.name} and lit it.`);
    } else {
      setPlaced((p) => [...p, target]);
      pushLog({ kind: "place", label: `Placed ${target.item.name}` });
      setMessage(`Placed a lit ${target.item.name} under the ${app.item.name}.`);
    }
    pushLog({ kind: "heat", label: `Ignited ${target.item.name} — ${flameSpec(target.flame).label}` });
  };

  const setFlame = (uid: string, flame: FlameId) => {
    const app = placedRef.current.find((a) => a.uid === uid); if (!app) return;
    commit();
    app.flame = flame;
    app.ignited = true;
    setPlaced((p) => [...p]);
    const spec = flameSpec(flame);
    pushLog({ kind: "heat", label: `Selected ${spec.label} (max ${spec.maxTemp} °C)` });
    setMessage(spec.note);
  };

  const rotateSelected = (delta = 45) => {
    const targets = selectedUids.length ? selectedUids : selectedUid ? [selectedUid] : [];
    if (!targets.length) { setMessage("Select apparatus to rotate."); return; }
    commit();
    for (const uid of targets) {
      const app = placedRef.current.find((a) => a.uid === uid);
      if (app) app.rotation = (app.rotation + delta) % 360;
    }
    setPlaced((p) => [...p]);
    pushLog({ kind: "connect", label: `Rotated ${targets.length} item(s) by ${delta}°` });
  };

  const toggleSeal = (uid: string) => {
    const app = placedRef.current.find((a) => a.uid === uid); if (!app?.state) return;
    commit();
    app.sealed = !app.sealed;
    setPlaced((p) => [...p]);
    pushLog({ kind: "connect", label: `${app.sealed ? "Sealed" : "Unsealed"} ${app.item.name}` });
    setMessage(app.sealed
      ? "Vessel sealed — never heat a closed system, pressure will build."
      : "Vessel opened to the atmosphere.");
  };

  const chillContainer = (uid: string) => {
    const app = placedRef.current.find((a) => a.uid === uid); if (!app?.state) return;
    const lit = heatSourceFor(uid);
    if (lit) setIgnite(lit.uid, false);
    app.state.temperature = Math.max(-15, app.state.temperature - 40);
    const empty = Object.keys(app.state.substanceIds).length === 0;
    if (!empty) runReactionOn(app, experimentId);
    const temp = `${app.state.temperature.toFixed(0)}°C`;
    pushLog({ kind: "freeze", label: `Chilled ${app.item.name} to ${temp}` });
    setMessage(
      empty
        ? `Chilled the empty ${app.item.name} to ${temp}. Add a reagent to see an effect.`
        : `Chilled the ${app.item.name} to ${temp}.`,
    );
    setPlaced((p) => [...p]);
  };

  /** open the measured-amount dialog — nothing enters the vessel until it is confirmed */
  const requestChemical = (chem: ChemicalSubstance) => {
    if (!selectedUid) { setMessage("Select a container on the bench first."); return; }
    const app = placedRef.current.find((a) => a.uid === selectedUid);
    if (!app?.state) { setMessage("That apparatus can't hold chemicals — select a beaker or tube."); return; }
    if (app.broken) { setMessage("That vessel is broken — remove it and place a new one."); return; }
    setMeasure({ chem, amount: 10 });
  };

  const addChemical = (chem: ChemicalSubstance, amount: number) => {
    if (!selectedUid) { setMessage("Select a container on the bench first."); return; }
    const app = placedRef.current.find((a) => a.uid === selectedUid);
    if (!app?.state) { setMessage("That apparatus can't hold chemicals — select a beaker or tube."); return; }
    commit();
    const unit = measurementUnit(chem.state);
    app.state.substanceIds[chem.id] = (app.state.substanceIds[chem.id] || 0) + amount;
    const res = runReactionOn(app, experimentId);
    measuredAddsRef.current += 1;
    if (res?.message) setMessage(res.message);
    pushLog({
      kind: res?.successExperimentId ? "reaction" : "add",
      label: res?.successExperimentId
        ? `Measured ${amount} ${unit} ${chem.name} · ✔ ${res.message}`
        : `Measured ${amount} ${unit} of ${chem.name} into ${app.item.name}`,
      experimentId: res?.successExperimentId,
      chemicalIds: [chem.id],
    });
    recordReading(app, `Added ${amount} ${unit} ${chem.name}`, res?.message ?? "Reagent added");
    setPlaced((p) => [...p]);
  };

  const beginPour = (fromUid: string) => {
    setPourPending(fromUid);
    setMessage("Click a target container to pour into.");
  };

  const completePour = (toUid: string) => {
    if (!pourPending) return;
    const from = placedRef.current.find((a) => a.uid === pourPending);
    const to = placedRef.current.find((a) => a.uid === toUid);
    setPourPending(null);
    if (!from?.state || !to?.state || from.uid === to.uid) { setMessage("Pick a different container."); return; }
    commit();
    // transfer half the substances
    const transfer: Record<string, number> = {};
    for (const [id, amt] of Object.entries(from.state.substanceIds)) {
      const half = amt / 2;
      transfer[id] = half;
      from.state.substanceIds[id] = amt - half;
    }
    pourRef.current = {
      fromUid: from.uid, toUid: to.uid, progress: 0,
      color: blendLiquid(from.state), substanceIds: transfer, temperature: from.state.temperature,
    };
    runReactionOn(from, experimentId);
    pushLog({ kind: "pour", label: `Poured from ${from.item.name} into ${to.item.name}` });
    setMessage(`Pouring ${from.item.name} → ${to.item.name}…`);
    setPlaced((p) => [...p]);
  };

  const practiceAutoSetup = () => {
    const wrap = benchRef.current; if (!wrap) return;
    commit();
    const rect = wrap.getBoundingClientRect();
    const additions: PlacedApparatus[] = [];
    let cursorX = 48;
    const floorY = rect.height - 210;
    const usedIds = new Set<string>();

    const needsHeat = /heat|warm|boil|burn|flame|ignite|reflux|evaporat|distil/i
      .test([experiment.objective, ...(experiment.steps ?? [])].join(" "));

    // Stack vessel over tripod + gauze + ignited burner so the student can just watch.
    if (needsHeat) {
      const bunsen = APPARATUS.find((a) => a.id === "bunsen");
      const tripod = APPARATUS.find((a) => a.id === "tripod");
      const gauze = APPARATUS.find((a) => a.id === "gauze");
      const vesselItem = requiredApparatus.find((a) => !!CONTAINER_SHAPES[a.shape])
        ?? APPARATUS.find((a) => a.id === "beaker");
      if (tripod && gauze && bunsen && vesselItem) {
        const bx = 70;
        const by = floorY;
        const tripodP = makePlaced(tripod, bx, by, 0);
        const gauzeP = makePlaced(gauze, bx + (tripod.width - gauze.width) / 2, by - 4, 1);
        const vesselP = makePlaced(
          vesselItem,
          bx + (tripod.width - vesselItem.width) / 2,
          Math.max(16, by - 4 - vesselItem.height),
          3,
        );
        const bunsenP = makePlaced(
          bunsen,
          bx + (tripod.width - bunsen.width) / 2,
          by + tripod.height - 20,
          0,
        );
        bunsenP.ignited = true;
        additions.push(tripodP, gauzeP, bunsenP, vesselP);
        usedIds.add(tripod.id); usedIds.add(gauze.id); usedIds.add(bunsen.id); usedIds.add(vesselItem.id);
        cursorX = bx + tripod.width + 36;
      }
    }

    for (const item of requiredApparatus) {
      if (usedIds.has(item.id)) continue;
      const x = cursorX;
      const y = Math.max(24, floorY + 30 - item.height);
      additions.push(makePlaced(item, x, y, additions.length));
      cursorX += item.width + 28;
      usedIds.add(item.id);
    }

    if (needsHeat) {
      for (const a of additions) if (a.role === "heat") a.ignited = true;
    }

    let vessel = additions.find((a) => a.state);
    if (!vessel) {
      const beaker = APPARATUS.find((a) => a.id === "beaker");
      if (beaker) {
        const beakerP = makePlaced(beaker, 80, Math.max(24, floorY - beaker.height), additions.length);
        additions.push(beakerP);
        vessel = beakerP;
      }
    }

    if (vessel?.state) {
      // Only ever pour reagents that belong together. Qualitative-analysis
      // experiments list several mutually-exclusive cation salts (each is a
      // separate trial, not one mixture) — dumping them all in one dish gave a
      // meaningless mixture and an instantly-overflowing vessel.
      const chosen = selectAutoSetupReagents(experiment.requiredChemicalIds);

      // Size the doses to the vessel actually on the bench so auto-setup can
      // never overflow the glassware it just placed.
      const capacity = vessel.state.maxVolume;
      const budget = capacity * 0.6;
      const liquids = chosen.filter((c) => getChemical(c).state !== "solid").length;
      const perLiquid = liquids > 0
        ? Math.max(1, Math.min(10, Math.floor(budget / liquids)))
        : 10;

      for (const id of chosen) {
        const chem = getChemical(id);
        const amount = chem.state === "solid" ? 2 : perLiquid;
        vessel.state.substanceIds[chem.id] = (vessel.state.substanceIds[chem.id] || 0) + amount;
        measuredAddsRef.current += 1;
        pushLog({
          kind: "add",
          label: `Measured ${amount} ${measurementUnit(chem.state)} of ${chem.name} into ${vessel.item.name}`,
          chemicalIds: [chem.id],
        });
      }
      const skipped = experiment.requiredChemicalIds.length - chosen.length;
      if (skipped > 0) {
        pushLog({
          kind: "observe",
          label: `${skipped} further reagent(s) left in the rack — test them one at a time in a clean vessel.`,
        });
      }
      runReactionOn(vessel, experimentId);
      setSelectedUid(vessel.uid);
      setSelectedUids([vessel.uid]);
    }

    for (const a of additions) {
      if (a.role !== "container" || a === vessel) {
        pushLog({ kind: "place", label: `Placed ${a.item.name}` });
      } else {
        pushLog({ kind: "place", label: `Placed ${a.item.name}` });
      }
    }
    if (needsHeat) {
      const burner = additions.find((a) => a.role === "heat" && a.ignited);
      if (burner) pushLog({ kind: "heat", label: `Ignited ${burner.item.name} — ${flameSpec(burner.flame).label}` });
    }

    setPlaced(additions);
    setMessage("Practice auto-setup ready. Watch the reaction, record observations, then tap Score my attempt.");
  };

  const autoSetup = (kind: "burner" | "retort") => {
    const wrap = benchRef.current; if (!wrap) return;
    commit();
    const rect = wrap.getBoundingClientRect();
    const bx = rect.width / 2 - 80;
    const by = rect.height - 210;
    const additions: PlacedApparatus[] = [];
    if (kind === "burner") {
      const tripod = APPARATUS.find((a) => a.id === "tripod");
      const gauze = APPARATUS.find((a) => a.id === "gauze");
      const beaker = APPARATUS.find((a) => a.id === "beaker");
      const bunsen = APPARATUS.find((a) => a.id === "bunsen");
      if (tripod && gauze && beaker && bunsen) {
        const tripodP = makePlaced(tripod, bx, by, 0);
        const gauzeP = makePlaced(gauze, bx + (tripod.width - gauze.width) / 2, by - 4, 1);
        const beakerP = makePlaced(beaker, bx + (tripod.width - beaker.width) / 2, by - 4 - beaker.height, 3);
        const bunsenP = makePlaced(bunsen, bx + (tripod.width - bunsen.width) / 2, by + tripod.height - 20, 0);
        bunsenP.ignited = true;
        additions.push(tripodP, gauzeP, bunsenP, beakerP);
        setSelectedUid(beakerP.uid);
      }
    } else {
      const stand = APPARATUS.find((a) => a.id === "retort-stand");
      const clamp = APPARATUS.find((a) => a.id === "test-tube-holder");
      const tube = APPARATUS.find((a) => a.id === "test-tube");
      const bunsen = APPARATUS.find((a) => a.id === "bunsen");
      if (stand && clamp && tube && bunsen) {
        const standP = makePlaced(stand, bx, by - 80, 0);
        const clampP = makePlaced(clamp, bx + 40, by - 20, 1);
        const tubeP = makePlaced(tube, bx + 78, by - 30, 2);
        const bunsenP = makePlaced(bunsen, bx + 60, by + 40, 0);
        bunsenP.ignited = true;
        additions.push(standP, clampP, bunsenP, tubeP);
        setSelectedUid(tubeP.uid);
      }
    }
    if (additions.length) {
      setPlaced((p) => [...p, ...additions]);
      pushLog({ kind: "connect", label: `Auto-setup: ${kind === "burner" ? "beaker over Bunsen" : "test-tube on retort stand"}` });
      setMessage("Auto-setup complete. Add reagents to the highlighted vessel.");
    }
  };

  const clearBench = () => {
    commit();
    setPlaced([]); setSelectedUid(null); particlesRef.current = []; pourRef.current = null; setPourPending(null);
    setSelectedUids([]); setLog([]);
    setMessage("Bench cleared.");
  };

  const resetTest = () => {
    setReport(null); setLog([]); setReadings([]); setObservations([]);
    hazardsRef.current = 0; measuredAddsRef.current = 0;
    clearBench();
    // Put the exam clock back to a full paper, unstarted.
    setTestRemaining(TEST_DURATION_S); setTestStartedAt(null);
    setMessage("Test reset — score cleared, bench empty, clock back to 45:00.");
  };

  const scoreAttempt = () => {
    const outcome = markAttempt({
      experiment,
      syllabus: currentSyllabus,
      log: log.map((l) => ({ ts: l.ts, kind: l.kind, label: l.label, experimentId: l.experimentId, chemicalIds: l.chemicalIds })),
      readings,
      observations,
      hazards: hazardsRef.current,
      reactionMatched: log.some((l) => l.experimentId === experimentId),
      measuredAdds: measuredAddsRef.current,
    });
    setReport({
      percent: outcome.percent,
      grade: outcome.grade,
      band: outcome.descriptor,
      correct: outcome.correct,
      missed: outcome.missed,
      criteria: outcome.criteria,
      rawScore: outcome.rawScore,
      rawTotal: outcome.rawTotal,
    });
  };

  // Keep a stable handle so the countdown can auto-submit without re-arming
  // the interval on every state change.
  const scoreAttemptRef = useRef(scoreAttempt);
  scoreAttemptRef.current = scoreAttempt;

  // The clock only runs in Test mode, and only once the student has actually
  // started working (first bench action), so opening the tab to look around
  // does not silently burn their time.
  useEffect(() => {
    if (mode !== "test" || testStartedAt === null) return;
    const t = window.setInterval(() => {
      setTestRemaining((prev) => {
        const next = Math.max(0, TEST_DURATION_S - Math.round((Date.now() - testStartedAt) / 1000));
        if (next === 0 && prev > 0) scoreAttemptRef.current();
        return next;
      });
    }, 1000);
    return () => window.clearInterval(t);
  }, [mode, testStartedAt]);

  const observeSelected = () => {
    const app = placedRef.current.find((a) => a.uid === selectedUid);
    if (!app?.state) { setMessage("Select a container first."); return; }
    const obs = app.lastReaction?.message
      ?? `Volume ${app.state.currentVolume.toFixed(1)} ml · T ${app.state.temperature.toFixed(1)}°C · pH ${app.state.pH.toFixed(2)}.`;
    setMessage(obs);
    pushLog({ kind: "observe", label: `Observed ${app.item.name}: ${obs}` });
    recordReading(app, "Observation", obs);
  };

  /* ============================================================
     Qualitative tests, flame tests & separation of mixtures
  ============================================================ */
  const targetApp = (uid?: string | null) =>
    placedRef.current.find((a) => a.uid === (uid ?? selectedUid));

  const applyOutcome = (app: PlacedApparatus, title: string, outcome: TestOutcome) => {
    if (outcome.ok && app.state) {
      commit();
      for (const id of outcome.removed ?? []) delete app.state.substanceIds[id];
      for (const [id, amt] of Object.entries(outcome.added ?? {})) {
        app.state.substanceIds[id] = (app.state.substanceIds[id] || 0) + amt;
      }
      if (outcome.newPH !== undefined) app.state.pH = outcome.newPH;
      if (outcome.color && (outcome.removed?.length || outcome.added)) {
        app.state.color = outcome.color;
      }
      runReactionOn(app, experimentId);
      setPlaced((p) => [...p]);
    }
    setTestResult({ title, outcome });
    setMessage(outcome.note ? `${outcome.observation} ${outcome.note}` : outcome.observation);
    recordReading(app, title, outcome.observation);
    pushLog({
      kind: "observe",
      label: `${title} on ${app.item.name}: ${outcome.ok ? outcome.observation : `${outcome.observation} ${outcome.note ?? ""}`.trim()}`,
    });
    if (outcome.ok) setObservations((o) => [...o, outcome.observation]);
  };

  const doIndicator = (uid: string, indicatorId: string) => {
    const app = targetApp(uid);
    if (!app?.state) { setMessage("Select a container first."); return; }
    const spec = INDICATORS.find((i) => i.id === indicatorId);
    applyOutcome(app, spec?.label ?? "Indicator test", runIndicator(app.state, indicatorId));
    setTestPanel(null);
  };

  const doGasTest = (uid: string, testId: string) => {
    const app = targetApp(uid);
    if (!app?.state) { setMessage("Select a container first."); return; }
    const spec = GAS_TESTS.find((g) => g.id === testId);
    applyOutcome(app, spec?.label ?? "Gas test", runGasTest(app.state, testId));
    setTestPanel(null);
  };

  const doFlameTest = (uid?: string) => {
    const app = targetApp(uid);
    if (!app?.state) { setMessage("Select the vessel or watch-glass holding the sample."); return; }
    applyOutcome(app, "Flame test", runFlameTest(app.state, !!app.state.isHeated));
  };

  const doSeparation = (uid: string, methodId: string) => {
    const app = targetApp(uid);
    if (!app?.state) { setMessage("Select a container first."); return; }
    const available = placedRef.current.map((a) => a.item.id);
    const spec = SEPARATIONS.find((s) => s.id === methodId);
    applyOutcome(app, spec?.label ?? "Separation", runSeparation(app.state, methodId, available, !!app.state.isHeated));
    setTestPanel(null);
  };

  /* ============================================================
     Pointer / drag
  ============================================================ */
  const dragRef = useRef<{ uid: string; dx: number; dy: number; lastX: number; lastY: number; moved: boolean } | null>(null);

  const onPieceDown = (e: React.PointerEvent, app: PlacedApparatus) => {
    if (e.button === 2) return; // context menu handled separately
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    const rect = benchRef.current!.getBoundingClientRect();
    const px = e.clientX - rect.left, py = e.clientY - rect.top;
    dragRef.current = { uid: app.uid, dx: px - app.x, dy: py - app.y, lastX: px, lastY: py, moved: false };
    setSelectedUid(app.uid);
    if (e.shiftKey || e.ctrlKey || e.metaKey) {
      setSelectedUids((s) => (s.includes(app.uid) ? s.filter((u) => u !== app.uid) : [...s, app.uid]));
    } else {
      setSelectedUids([app.uid]);
    }
    if (pourPending && pourPending !== app.uid) { completePour(app.uid); }
  };
  const onPieceMove = (e: React.PointerEvent) => {
    const d = dragRef.current; if (!d) return;
    const rect = benchRef.current!.getBoundingClientRect();
    const px = e.clientX - rect.left, py = e.clientY - rect.top;
    const app = placedRef.current.find((a) => a.uid === d.uid); if (!app) return;
    const nx = Math.max(0, Math.min(rect.width - app.item.width, px - d.dx));
    const ny = Math.max(0, Math.min(rect.height - app.item.height, py - d.dy));
    const vx = px - d.lastX;
    app.x = nx; app.y = ny;
    app.swayAmp = Math.min(6, app.swayAmp * 0.6 + Math.abs(vx) * 0.3);
    d.lastX = px; d.lastY = py; d.moved = true;
    (e.currentTarget as HTMLElement).style.transform = `translate(${nx}px, ${ny}px)`;
  };
  const onPieceUp = (e: React.PointerEvent) => {
    const d = dragRef.current; dragRef.current = null;
    if (d?.moved) setPlaced((p) => [...p]);
    (e.currentTarget as HTMLElement).releasePointerCapture?.(e.pointerId);
  };

  const onPieceContext = (e: React.MouseEvent, app: PlacedApparatus) => {
    e.preventDefault();
    setCtxMenu({ x: e.clientX, y: e.clientY, uid: app.uid });
    setSelectedUid(app.uid);
    if (!selectedUids.includes(app.uid)) setSelectedUids([app.uid]);
  };

  /* -------- keyboard shortcuts -------- */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      const mod = e.ctrlKey || e.metaKey;
      if (mod && e.key.toLowerCase() === "z" && !e.shiftKey) { e.preventDefault(); undo(); }
      else if (mod && (e.key.toLowerCase() === "y" || (e.shiftKey && e.key.toLowerCase() === "z"))) { e.preventDefault(); redo(); }
      else if (!mod && e.key.toLowerCase() === "r") { e.preventDefault(); rotateSelected(45); }
      else if (e.key === "Escape") { setCtxMenu(null); setMeasure(null); setFlamePicker(null); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  /* ============================================================
     Derived UI data
  ============================================================ */
  const filteredApparatus = useMemo(() => {
    const q = query.trim().toLowerCase();
    return APPARATUS.filter((a) => !q || a.name.toLowerCase().includes(q) || a.shape.toLowerCase().includes(q));
  }, [query]);
  const apparatusByCat = useMemo(() => {
    const map = new Map<string, ApparatusItem[]>();
    for (const a of filteredApparatus) {
      const arr = map.get(a.category) ?? []; arr.push(a); map.set(a.category, arr);
    }
    return CATEGORIES.filter((c) => map.has(c)).map((c) => [c, map.get(c)!] as const);
  }, [filteredApparatus]);

  const chemicalList = useMemo(() => Object.values(CHEMICAL_DATABASE), []);
  const filteredChemicals = useMemo(() => {
    const q = query.trim().toLowerCase();
    return chemicalList.filter((c) => !q || c.name.toLowerCase().includes(q) || c.formula.toLowerCase().includes(q));
  }, [chemicalList, query]);

  const chemicalsByGroup = useMemo(() => {
    const map = new Map<string, ChemicalSubstance[]>();
    for (const c of filteredChemicals) {
      let g = "Other";
      if (/acid/i.test(c.name)) g = "Acids";
      else if (/hydroxide|carbonate.*sodium|potassium|ammonia/i.test(c.name)) g = "Bases";
      else if (/sulfate|chloride|nitrate|carbonate/i.test(c.formula)) g = "Salts & Solutions";
      else if (c.state === "gas") g = "Gases";
      else if (c.state === "solid") g = "Solids & Metals";
      else if (/indicator|litmus/i.test(c.name)) g = "Indicators";
      const arr = map.get(g) ?? []; arr.push(c); map.set(g, arr);
    }
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [filteredChemicals]);

  const applicableChemicals = useMemo(
    () => chemicalList.filter((c) => experiment.requiredChemicalIds.includes(c.id)),
    [chemicalList, experiment.requiredChemicalIds],
  );

  const requiredApparatus = useMemo(() => resolveApparatus(experiment.materials), [experiment.materials]);
  const procedure = useMemo(() => buildProcedure(experiment), [experiment]);
  const placeApparatusById = (id: string) => {
    const item = APPARATUS.find((a) => a.id === id);
    if (item) addApparatus(item);
  };

  const toggleGroup = (id: string) => setExpandedGroups((g) => ({ ...g, [id]: !g[id] }));
  /**
   * A search only filters *within* the accordions, so with every group
   * collapsed a query like "hydroxide" updated the counts while the matching
   * cards stayed hidden. Force groups open whenever a query is active.
   */
  const searching = query.trim().length > 0;

  const meta = metaFor(experimentId);

  const liveScore = useMemo(() => markAttempt({
    experiment,
    syllabus: currentSyllabus,
    log: log.map((l) => ({ ts: l.ts, kind: l.kind, label: l.label, experimentId: l.experimentId, chemicalIds: l.chemicalIds })),
    readings,
    observations,
    hazards: hazardsRef.current,
    reactionMatched: log.some((l) => l.experimentId === experimentId),
    measuredAdds: measuredAddsRef.current,
  }), [experiment, currentSyllabus, log, readings, observations, experimentId]);

  /* ============================================================
     Render
  ============================================================ */
  return (
    <div
      className="mx-auto flex w-full max-w-[1720px] gap-3 px-3 py-3"
      style={{ height: "calc(100vh - 5rem)", fontFamily: "var(--font-sans)" }}
      onClick={() => setCtxMenu(null)}
    >
      {/* ================= SIDEBAR ================= */}
      <aside
        className="glass flex shrink-0 flex-col overflow-hidden rounded-3xl transition-[width] duration-300"
        style={{ width: sidebarOpen ? 320 : 60 }}
      >
        <div className="flex items-center gap-2 border-b border-border/40 p-3">
          <button
            onClick={() => setSidebarOpen((v) => !v)}
            className="grid h-8 w-8 place-items-center rounded-lg border border-border/50 bg-background/60 hover:bg-turquoise/15"
            aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
          >
            {sidebarOpen ? <PanelLeftClose size={16} /> : <PanelLeftOpen size={16} />}
          </button>
          {sidebarOpen && (
            <div className="flex flex-1 rounded-xl border border-border/50 bg-background/50 p-0.5 text-[13px] font-medium">
              <button
                onClick={() => setSidebarTab("apparatus")}
                className={`flex-1 rounded-lg px-2 py-1.5 transition ${sidebarTab === "apparatus" ? "bg-navy text-peach shadow dark:bg-turquoise dark:text-charcoal" : "text-foreground/70 hover:bg-foreground/5"}`}
              >
                <Beaker size={13} className="mr-1 inline" /> Apparatus
              </button>
              <button
                onClick={() => setSidebarTab("chemicals")}
                className={`flex-1 rounded-lg px-2 py-1.5 transition ${sidebarTab === "chemicals" ? "bg-navy text-peach shadow dark:bg-turquoise dark:text-charcoal" : "text-foreground/70 hover:bg-foreground/5"}`}
              >
                <TestTube size={13} className="mr-1 inline" /> Chemicals
              </button>
            </div>
          )}
        </div>

        {sidebarOpen && (
          <>
            <div className="border-b border-border/40 p-2">
              <div className="flex items-center gap-1.5 rounded-xl border border-border/50 bg-background/50 px-2 py-1.5">
                <Search size={13} className="text-muted-foreground" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={sidebarTab === "apparatus" ? "Search apparatus…" : "Search reagents…"}
                  className="w-full bg-transparent text-[13px] outline-none placeholder:text-muted-foreground"
                />
                {query && (
                  <button onClick={() => setQuery("")} className="text-muted-foreground hover:text-foreground">
                    <X size={12} />
                  </button>
                )}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-2">
              {sidebarTab === "apparatus" ? (
                <div className="space-y-1.5">
                  {apparatusByCat.map(([cat, items]) => {
                    const open = searching || (expandedGroups[cat] ?? false);
                    return (
                      <section key={cat} className="rounded-xl border border-border/40 bg-background/30">
                        <button
                          onClick={() => toggleGroup(cat)}
                          className="flex w-full items-center justify-between px-2.5 py-2 text-left text-[12px] font-semibold text-foreground/90 hover:bg-foreground/5"
                        >
                          <span>{cat} <span className="ml-1 text-muted-foreground">{items.length}</span></span>
                          <ChevronDown size={14} className={`transition-transform ${open ? "rotate-0" : "-rotate-90"}`} />
                        </button>
                        <AnimatePresence initial={false}>
                          {open && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden"
                            >
                              <div className="grid grid-cols-2 gap-1.5 p-2 pt-0">
                                {items.map((it) => (
                                  <button
                                    key={it.id}
                                    onClick={() => addApparatus(it)}
                                    className="group flex flex-col items-center gap-1 rounded-lg border border-border/40 bg-background/60 p-2 text-center transition hover:-translate-y-0.5 hover:border-turquoise/60 hover:shadow"
                                    title={it.usage}
                                  >
                                    <div className="grid h-14 w-full place-items-center overflow-hidden">
                                      <ApparatusSVG item={{ ...it, width: Math.min(it.width, 60), height: Math.min(it.height, 56) }} />
                                    </div>
                                    <span className="line-clamp-2 text-[10.5px] leading-tight text-foreground/85">
                                      {it.name}
                                    </span>
                                  </button>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </section>
                    );
                  })}
                </div>
              ) : (
                <div className="space-y-1.5">
                  {chemicalsByGroup.map(([grp, items]) => {
                    const open = searching || (expandedGroups[grp] ?? grp === "Acids");
                    return (
                      <section key={grp} className="rounded-xl border border-border/40 bg-background/30">
                        <button
                          onClick={() => toggleGroup(grp)}
                          className="flex w-full items-center justify-between px-2.5 py-2 text-left text-[12px] font-semibold text-foreground/90 hover:bg-foreground/5"
                        >
                          <span>{grp} <span className="ml-1 text-muted-foreground">{items.length}</span></span>
                          <ChevronDown size={14} className={`transition-transform ${open ? "rotate-0" : "-rotate-90"}`} />
                        </button>
                        <AnimatePresence initial={false}>
                          {open && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden"
                            >
                              <div className="grid grid-cols-1 gap-1 p-2 pt-0">
                                {items.map((c) => (
                                  <button
                                    key={c.id}
                                    onClick={() => requestChemical(c)}
                                    className="flex items-center gap-2 rounded-lg border border-border/40 bg-background/60 px-2 py-1.5 text-left transition hover:border-turquoise/60 hover:bg-turquoise/10"
                                    title={c.description}
                                  >
                                    <span
                                      className="h-6 w-6 shrink-0 rounded-md border border-border/50"
                                      style={{ background: c.color }}
                                    />
                                    <span className="min-w-0 flex-1">
                                      <span className="block truncate text-[12px] font-medium">{c.name}</span>
                                      <span className="block truncate font-mono text-[10px] text-muted-foreground">{c.formula}</span>
                                    </span>
                                  </button>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </section>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </aside>

      {/* ================= MAIN ================= */}
      <section className="glass relative flex min-w-0 flex-1 flex-col overflow-hidden rounded-3xl">
        {/* top bar */}
        <div className="flex flex-wrap items-center gap-2 border-b border-border/40 bg-background/40 px-3 py-2">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-widest text-turquoise">Virtual Lab</div>
            <div className="text-[15px] font-semibold leading-tight" style={{ fontFamily: "var(--font-display)" }}>
              DWSIM Bench ·{" "}
              <span
                title={
                  applicableExperiments.length === COMPLETE_SYLLABUS_EXPERIMENTS.length
                    ? `All ${COMPLETE_SYLLABUS_EXPERIMENTS.length} experiments`
                    : `${applicableExperiments.length} of ${COMPLETE_SYLLABUS_EXPERIMENTS.length} experiments match the selected syllabus level and category`
                }
              >
                {/* Show the filtered count against the catalogue total. Showing
                    the bare filtered number reads as "the app only has 50
                    experiments" when an O-Level syllabus hides the 65 A-Level
                    ones. */}
                {applicableExperiments.length === COMPLETE_SYLLABUS_EXPERIMENTS.length
                  ? `${COMPLETE_SYLLABUS_EXPERIMENTS.length} experiments`
                  : `${applicableExperiments.length} of ${COMPLETE_SYLLABUS_EXPERIMENTS.length} experiments`}
              </span>
            </div>
          </div>
          <div className="mx-2 flex rounded-full border border-border/50 bg-background/60 p-0.5">
            {([
              { id: "manual", label: "Manual", icon: BookOpen },
              { id: "practice", label: "Practice", icon: FlaskConical },
              { id: "test", label: "Test", icon: ClipboardList },
            ] as const).map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setMode(id)}
                className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-[12px] font-medium transition ${mode === id ? "bg-navy text-peach shadow dark:bg-turquoise dark:text-charcoal" : "text-foreground/70 hover:bg-foreground/5"}`}
              >
                <Icon size={12} /> {label}
              </button>
            ))}
          </div>
          <select
            value={syllabusId}
            onChange={(e) => setSyllabusId(e.target.value)}
            className="max-w-[220px] truncate rounded-full border border-border/50 bg-background/60 px-3 py-1.5 text-[12px]"
          >
            {SYLLABI.map((s: Syllabus) => (
              <option key={s.id} value={s.id}>{s.board} · {s.level}</option>
            ))}
          </select>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value as PdfCategory | "ALL")}
            className="rounded-full border border-border/50 bg-background/60 px-3 py-1.5 text-[12px]"
          >
            <option value="ALL">All categories</option>
            {(Object.keys(PDF_CATEGORY_LABELS) as PdfCategory[]).map((c) => (
              <option key={c} value={c}>{c} · {PDF_CATEGORY_LABELS[c]}</option>
            ))}
          </select>
          <select
            value={experimentId}
            onChange={(e) => setExperimentId(Number(e.target.value))}
            className="max-w-[320px] truncate rounded-full border border-border/50 bg-background/60 px-3 py-1.5 text-[12px]"
          >
            {applicableExperiments.map((e) => (
              <option key={e.id} value={e.id}>#{String(e.id).padStart(3, "0")} · {e.title}</option>
            ))}
          </select>

          <div className="ml-auto flex items-center gap-1">
            <button
              onClick={() => setBriefOpen((v) => !v)}
              className="inline-flex items-center gap-1 rounded-full border border-border/50 bg-background/60 px-3 py-1.5 text-[12px] hover:bg-foreground/5"
              title="Toggle experiment brief"
            >
              <GraduationCap size={12} /> Brief
            </button>
          </div>
        </div>

        {/* bench + brief row: the brief used to be absolutely positioned
            *inside* the bench, so on anything narrower than a wide desktop it
            sat on top of the apparatus. It is now a flex sibling that takes its
            own column on large screens and only overlays on small ones. */}
        <div className="relative flex min-h-0 flex-1">
        {/* bench */}
        <div
          ref={benchRef}
          className="relative flex-1 overflow-hidden"
          style={{
            background:
              "linear-gradient(180deg, color-mix(in oklab, var(--background) 85%, transparent) 0%, color-mix(in oklab, var(--background) 60%, transparent) 62%, #7a5a34 62%, #4a3820 100%)",
          }}
          onClick={(e) => {
            // clicked empty bench: cancel context menu, cancel pour-pending
            if (e.target === e.currentTarget) {
              setCtxMenu(null);
              if (pourPending) { setPourPending(null); setMessage("Pour cancelled."); }
            }
          }}
        >
          {/* wood grain lines */}
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 h-[38%] opacity-70"
            style={{
              backgroundImage:
                "repeating-linear-gradient(90deg, rgba(20,10,0,0.18) 0 1px, transparent 1px 180px), repeating-linear-gradient(0deg, rgba(20,10,0,0.05) 0 8px, transparent 8px 16px)",
            }}
          />

          {/* status pill */}
          <div className="pointer-events-none absolute inset-x-3 top-3 z-10 flex items-center gap-2">
            <div className="pointer-events-auto rounded-full border border-border/40 bg-background/85 px-3 py-1.5 text-[12px] font-medium shadow">
              {message}
            </div>
            {pourPending && (
              <div className="pointer-events-auto rounded-full border border-turquoise/50 bg-turquoise/15 px-3 py-1.5 text-[12px] font-medium text-turquoise">
                Pouring — click a target container
              </div>
            )}
          </div>

          {/* placed apparatus (SVG layer) */}
          {placed.map((app) => (
            <PlacedPiece
              key={app.uid}
              app={app}
              selected={selectedUid === app.uid}
              multi={selectedUids.length > 1 && selectedUids.includes(app.uid)}
              pourTarget={!!pourPending && pourPending !== app.uid && !!app.state}
              onPointerDown={(e) => onPieceDown(e, app)}
              onPointerMove={onPieceMove}
              onPointerUp={onPieceUp}
              onContextMenu={(e) => onPieceContext(e, app)}
            />
          ))}

          {/* particle / flame canvas ABOVE apparatus */}
          <canvas
            ref={canvasRef}
            className="pointer-events-none absolute inset-0 h-full w-full"
          />

          {/* context menu */}
          {ctxMenu && (() => {
            const app = placed.find((a) => a.uid === ctxMenu.uid);
            if (!app) return null;
            const isC = !!app.state;
            const isH = app.role === "heat";
            return (
              <CtxMenuSurface x={ctxMenu.x} y={ctxMenu.y} onDismiss={() => setCtxMenu(null)}>
                <CtxHeader label={app.item.name} />

                {/* Heating first: this is what people right-click a vessel for. */}
                {isC && (
                  <CtxItem
                    icon={Flame}
                    label={heatSourceFor(app.uid) ? (app.state?.isHeated ? "Stop heating" : "Heat over flame") : "Heat over flame (needs a burner)"}
                    onClick={() => { toggleHeatFor(app.uid); setCtxMenu(null); }}
                  />
                )}
                {isC && <CtxItem icon={Sparkles} label="Flame test" onClick={() => { doFlameTest(app.uid); setCtxMenu(null); }} />}
                {isH && <CtxItem icon={Flame} label={app.ignited ? "Extinguish burner" : "Ignite burner"} onClick={() => { setIgnite(app.uid, !app.ignited); setCtxMenu(null); }} />}
                {isH && <CtxItem icon={Flame} label="Choose flame…" onClick={() => { setFlamePicker(app.uid); setCtxMenu(null); }} />}
                {(isC || isH) && <div className="my-1 h-px bg-border/50" />}

                {isC && <CtxItem icon={Ruler} label="Measure & add reagent…" onClick={() => { setSidebarTab("chemicals"); setMessage("Pick a reagent in the sidebar — you'll be asked for the amount."); setCtxMenu(null); }} />}
                {isC && <CtxItem icon={ThermometerSun} label="Observe" onClick={() => { observeSelected(); setCtxMenu(null); }} />}
                {isC && <CtxItem icon={TestTube} label="Indicator test…" onClick={() => { setTestPanel({ kind: "indicator", uid: app.uid }); setCtxMenu(null); }} />}
                {isC && <CtxItem icon={Wind} label="Test the gas…" onClick={() => { setTestPanel({ kind: "gas", uid: app.uid }); setCtxMenu(null); }} />}
                {isC && <CtxItem icon={Wand2} label="Pour into…" onClick={() => { beginPour(app.uid); setCtxMenu(null); }} />}
                {isC && <CtxItem icon={Magnet} label="Separate mixture…" onClick={() => { setTestPanel({ kind: "separate", uid: app.uid }); setCtxMenu(null); }} />}
                {isC && <CtxItem icon={Snowflake} label="Chill (freeze)" onClick={() => { chillContainer(app.uid); setCtxMenu(null); }} />}
                {isC && <CtxItem icon={Droplets} label="Empty container" onClick={() => { emptyContainer(app.uid); setCtxMenu(null); }} />}
                {isC && <CtxItem icon={app.sealed ? Unlock : Lock} label={app.sealed ? "Remove stopper" : "Seal with stopper"} onClick={() => { toggleSeal(app.uid); setCtxMenu(null); }} />}

                <div className="my-1 h-px bg-border/50" />
                <CtxItem icon={RotateCw} label="Rotate 45° (R)" onClick={() => { rotateSelected(45); setCtxMenu(null); }} />
                <CtxItem icon={Trash2} label="Remove from bench" danger onClick={() => { removePlaced(app.uid); setCtxMenu(null); }} />
              </CtxMenuSurface>
            );
          })()}

        </div>
          {/* experiment brief drawer */}
          <AnimatePresence>
            {briefOpen && (
              <motion.aside
                initial={{ x: 60, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 60, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="glass-strong absolute right-3 top-3 bottom-3 z-20 w-[280px] overflow-y-auto rounded-2xl border border-border/50 p-3 xl:static xl:my-0 xl:ml-2 xl:h-auto xl:w-[300px] xl:shrink-0 xl:self-stretch"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="text-[10px] font-mono uppercase tracking-widest text-turquoise">
                      {PDF_CATEGORY_LABELS[meta.category]} · #{experiment.id}
                    </div>
                    <h3 className="text-[15px] font-semibold leading-tight" style={{ fontFamily: "var(--font-display)" }}>
                      {experiment.title}
                    </h3>
                  </div>
                  <button onClick={() => setBriefOpen(false)} className="text-muted-foreground hover:text-foreground">
                    <X size={14} />
                  </button>
                </div>
                <p className="mt-2 text-[12px] text-muted-foreground">{experiment.objective}</p>

                <BriefSection title="Safety & risk assessment">
                  <ul className="space-y-1">
                    {procedure.safety.map((s, i) => <li key={i} className="leading-snug">· {s}</li>)}
                  </ul>
                </BriefSection>

                <BriefSection title={`Apparatus (${requiredApparatus.length}) — tap to place`}>
                  <div className="grid gap-1">
                    {requiredApparatus.map((a) => (
                      <button
                        key={a.id}
                        onClick={() => placeApparatusById(a.id)}
                        className="flex items-center gap-2 rounded-lg border border-border/40 bg-background/60 px-2 py-1.5 text-left text-[11px] hover:border-turquoise/60"
                      >
                        <span className="h-4 w-4 shrink-0 rounded border border-border/50" style={{ background: a.fill }} />
                        <span className="truncate">{a.name}</span>
                      </button>
                    ))}
                  </div>
                </BriefSection>

                {hideAnswers ? (
                  <div className="mt-3 rounded-xl border border-turquoise/40 bg-turquoise/10 p-2.5">
                    <div className="text-[10px] font-semibold uppercase tracking-widest text-turquoise">
                      Test conditions
                    </div>
                    <p className="mt-1 text-[11.5px] leading-snug text-muted-foreground">
                      The method, expected observations and analysis are hidden while you are being assessed. Plan the
                      experiment yourself from the aim, apparatus and reagents above. Switch to Practice mode if you
                      want to be walked through it.
                    </p>
                  </div>
                ) : (
                  <>
                    <BriefSection title="Setting up">
                      <ol className="space-y-1">
                        {procedure.setup.map((s, i) => <li key={i} className="leading-snug">{i + 1}. {s}</li>)}
                      </ol>
                    </BriefSection>

                    <BriefSection title="Method" defaultOpen>
                      <ol className="space-y-1.5">
                        {procedure.method.map((s, i) => (
                          <li key={i} className="flex gap-1.5">
                            <span className="mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full bg-turquoise/20 text-[9px] font-bold">{i + 1}</span>
                            <span className="leading-snug">
                              {s.text}
                              {s.detail && <span className="mt-0.5 block text-[11px] text-muted-foreground">{s.detail}</span>}
                            </span>
                          </li>
                        ))}
                      </ol>
                    </BriefSection>

                    <BriefSection title="What to record">
                      <ul className="space-y-1">
                        {procedure.recording.map((s, i) => <li key={i} className="leading-snug">· {s}</li>)}
                      </ul>
                    </BriefSection>

                    <BriefSection title="Results & analysis">
                      <ul className="space-y-1">
                        {procedure.analysis.map((s, i) => <li key={i} className="leading-snug">· {s}</li>)}
                      </ul>
                    </BriefSection>

                    <BriefSection title="Clearing away">
                      <ul className="space-y-1">
                        {procedure.cleanup.map((s, i) => <li key={i} className="leading-snug">· {s}</li>)}
                      </ul>
                    </BriefSection>
                  </>
                )}
                {applicableChemicals.length > 0 && (
                  <div className="mt-3">
                    <div className="text-[10px] font-semibold uppercase tracking-widest text-turquoise">Required reagents</div>
                    <div className="mt-1 grid gap-1">
                      {applicableChemicals.map((c) => (
                        <button
                          key={c.id}
                          onClick={() => requestChemical(c)}
                          className="flex items-center gap-2 rounded-lg border border-border/40 bg-background/60 px-2 py-1.5 text-left text-[11px] hover:border-turquoise/60"
                        >
                          <span className="h-4 w-4 shrink-0 rounded border border-border/50" style={{ background: c.color }} />
                          <span className="truncate">{c.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </motion.aside>
            )}
          </AnimatePresence>
        </div>

        {/* action strip */}
        <div className="flex flex-wrap items-center gap-1.5 border-t border-border/40 bg-background/40 px-3 py-2">
          {mode === "practice" && (
            <button
              onClick={practiceAutoSetup}
              className="inline-flex items-center gap-1 rounded-full bg-turquoise px-3.5 py-2 text-[12.5px] font-bold text-charcoal shadow ring-2 ring-turquoise/60 hover:opacity-90"
              title="Place every required item and reagent so you can just observe, then score"
            >
              <Wand2 size={13} /> Practice auto-setup
            </button>
          )}
          <button
            onClick={() => autoSetup("burner")}
            className="inline-flex items-center gap-1 rounded-full border border-border/50 bg-background/60 px-3 py-1.5 text-[12px] font-medium hover:bg-turquoise/15"
            title="Auto-setup: beaker on tripod + gauze + Bunsen"
          >
            <Flame size={12} /> Auto-setup: Beaker+Bunsen
          </button>
          <button
            onClick={() => autoSetup("retort")}
            className="inline-flex items-center gap-1 rounded-full border border-border/50 bg-background/60 px-3 py-1.5 text-[12px] font-medium hover:bg-turquoise/15"
          >
            <Wand2 size={12} /> Auto-setup: Retort+Tube
          </button>
          <div className="mx-1 h-6 w-px bg-border/50" />
          <ActionBtn onClick={undo} icon={Undo2} label="Undo" disabled={!canUndo} />
          <ActionBtn onClick={redo} icon={Redo2} label="Redo" disabled={!canRedo} />
          <div className="mx-1 h-6 w-px bg-border/50" />
          <ActionBtn onClick={observeSelected} icon={ThermometerSun} label="Observe" />
          <ActionBtn onClick={() => selectedUid && chillContainer(selectedUid)} icon={Snowflake} label="Chill" disabled={!selectedUid} />
          <ActionBtn onClick={() => selectedUid && emptyContainer(selectedUid)} icon={Droplets} label="Empty" disabled={!selectedUid} />
          <ActionBtn onClick={() => selectedUid && beginPour(selectedUid)} icon={Wand2} label="Pour…" disabled={!selectedUid} />
          <ActionBtn onClick={() => rotateSelected(45)} icon={RotateCw} label="Rotate" disabled={!selectedUid} />
          <ActionBtn onClick={() => selectedUid && toggleSeal(selectedUid)} icon={Lock} label="Seal" disabled={!selectedUid} />
          <ActionBtn onClick={() => selectedUid && setTestPanel({ kind: "indicator", uid: selectedUid })} icon={TestTube} label="Indicator…" disabled={!selectedUid} />
          <ActionBtn onClick={() => selectedUid && setTestPanel({ kind: "gas", uid: selectedUid })} icon={Wind} label="Gas test…" disabled={!selectedUid} />
          <ActionBtn onClick={() => doFlameTest()} icon={Sparkles} label="Flame test" disabled={!selectedUid} />
          <ActionBtn onClick={() => selectedUid && setTestPanel({ kind: "separate", uid: selectedUid })} icon={Magnet} label="Separate…" disabled={!selectedUid} />
          <ActionBtn
            onClick={() => {
              const burner = placedRef.current.find((a) => a.role === "heat");
              if (burner) setFlamePicker(burner.uid);
              else setMessage("Place a Bunsen burner, hot plate or water bath first.");
            }}
            icon={Flame}
            label="Flame…"
          />
          {selectedUids.length > 1 && (
            <span className="inline-flex items-center gap-1 rounded-full border border-amber-400/50 bg-amber-400/10 px-2.5 py-1 text-[11px] font-medium text-amber-500">
              <Layers size={11} /> {selectedUids.length} selected
            </span>
          )}
          <div className="ml-auto flex items-center gap-1.5">
            <button
              onClick={() => {
                const app = placedRef.current.find((a) => a.uid === selectedUid);
                if (!app?.state) { setMessage("Select a container to record a reading."); return; }
                recordReading(app, "Manual reading", app.lastReaction?.message ?? "Reading taken");
                setResultsOpen(true);
                setMessage("Reading added to the results table.");
              }}
              className="inline-flex items-center gap-1 rounded-full border border-border/50 bg-background/60 px-3 py-1.5 text-[12px] font-medium hover:bg-turquoise/15"
            >
              <ListChecks size={12} /> Record reading
            </button>
            <button
              onClick={() => setResultsOpen((v) => !v)}
              className={`inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-[12px] font-medium ${resultsOpen ? "border-turquoise/60 bg-turquoise/15" : "border-border/50 bg-background/60 hover:bg-foreground/5"}`}
            >
              <Table2 size={12} /> Results ({readings.length})
            </button>
            {(mode === "test" || mode === "practice") && (
              <>
                {mode === "test" && (
                  <button
                    onClick={resetTest}
                    className="inline-flex items-center gap-1 rounded-full border border-border/50 bg-background/60 px-3 py-1.5 text-[12px] font-medium hover:bg-foreground/5"
                  >
                    <RotateCw size={12} /> Reset test
                  </button>
                )}
                {/* Practice shows the running total as coaching; under test
                    conditions that would be an open mark scheme, so the exam
                    clock takes its place and the score waits for submission. */}
                {mode === "practice" ? (
                  <span className="inline-flex rounded-full border border-turquoise/40 bg-turquoise/10 px-2.5 py-1 font-mono text-[11px] font-semibold text-turquoise">
                    Live {liveScore.percent}% · {liveScore.rawScore}/{liveScore.rawTotal}
                  </span>
                ) : (
                  <span
                    title={testStartedAt === null ? "Timer starts on your first action" : "Time remaining"}
                    className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 font-mono text-[11px] font-semibold ${
                      testExpired
                        ? "border-aurora-red/50 bg-aurora-red/15 text-aurora-red"
                        : testRemaining <= 300
                          ? "border-amber-500/50 bg-amber-500/15 text-amber-600 dark:text-amber-400"
                          : "border-border/50 bg-background/60 text-foreground/80"
                    }`}
                  >
                    <TimerIcon size={11} />
                    {testExpired
                      ? "Time up"
                      : `${String(Math.floor(testRemaining / 60)).padStart(2, "0")}:${String(testRemaining % 60).padStart(2, "0")}`}
                    {testStartedAt === null && " · not started"}
                  </span>
                )}
                <button
                  onClick={scoreAttempt}
                  disabled={testExpired}
                  className="inline-flex items-center gap-1 rounded-full bg-navy px-4 py-2 text-[13px] font-bold text-peach shadow-elegant ring-2 ring-peach/50 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-turquoise dark:text-charcoal"
                >
                  <Play size={14} /> {mode === "test" ? "Submit for marking" : "Score my attempt"}
                </button>
              </>
            )}
            <button
              onClick={clearBench}
              className="inline-flex items-center gap-1 rounded-full border border-border/50 bg-background/60 px-3 py-1.5 text-[12px] font-medium hover:bg-foreground/5"
            >
              <Trash2 size={12} /> Clear bench
            </button>
          </div>
        </div>

        {/* results table */}
        <AnimatePresence>
          {resultsOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden border-t border-border/40 bg-background/50"
            >
              <div className="max-h-44 overflow-auto px-3 py-2">
                <div className="mb-1.5 flex items-center gap-2">
                  <Table2 size={12} className="text-turquoise" />
                  <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Table of results</span>
                  {readings.length > 0 && (
                    <button onClick={() => setReadings([])} className="ml-auto text-[11px] text-muted-foreground hover:text-aurora-red">Clear table</button>
                  )}
                </div>
                {readings.length === 0 ? (
                  <p className="py-2 text-[12px] text-muted-foreground">
                    No readings yet — use “Record reading”, Observe, or run a test to fill the table.
                  </p>
                ) : (
                  <table className="w-full border-collapse text-left text-[12px]">
                    <thead>
                      <tr className="text-[10px] uppercase tracking-widest text-muted-foreground">
                        <th className="py-1 pr-2 font-medium">#</th>
                        <th className="py-1 pr-2 font-medium">Time</th>
                        <th className="py-1 pr-2 font-medium">Vessel</th>
                        <th className="py-1 pr-2 font-medium">Action</th>
                        <th className="py-1 pr-2 font-medium">T (°C)</th>
                        <th className="py-1 pr-2 font-medium">Vol (ml)</th>
                        <th className="py-1 pr-2 font-medium">pH</th>
                        <th className="py-1 pr-2 font-medium">Colour</th>
                        <th className="py-1 font-medium">Observation</th>
                      </tr>
                    </thead>
                    <tbody>
                      {readings.map((r, i) => (
                        <tr key={r.ts + "-" + i} className="border-t border-border/30">
                          <td className="py-1 pr-2 tabular-nums text-muted-foreground">{i + 1}</td>
                          <td className="py-1 pr-2 tabular-nums text-muted-foreground">{new Date(r.ts).toLocaleTimeString()}</td>
                          <td className="py-1 pr-2">{r.vessel}</td>
                          <td className="py-1 pr-2">{r.action}</td>
                          <td className="py-1 pr-2 tabular-nums">{r.temperature}</td>
                          <td className="py-1 pr-2 tabular-nums">{r.volume}</td>
                          <td className="py-1 pr-2 tabular-nums">{r.pH}</td>
                          <td className="py-1 pr-2">
                            <span className="inline-flex items-center gap-1">
                              <span className="h-2.5 w-2.5 rounded-full border border-border/50" style={{ background: r.colour }} />
                            </span>
                          </td>
                          <td className="py-1 text-foreground/80">{r.observation}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </section>

      {/* The floating "Score my attempt" FAB that used to sit here was a second
          copy of the toolbar button above — same handler, same label — and it
          hovered over the bottom-right of the bench, covering apparatus. The
          lab shell does not scroll, so the toolbar button is always in view and
          one button is enough. */}

      {/* ================= REPORT MODAL ================= */}
      {/* ---------- measured-amount dialog ---------- */}
      <AnimatePresence>
        {measure && (
          <motion.div
            className="fixed inset-0 z-[85] grid place-items-center bg-charcoal/55 p-4 backdrop-blur-md"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setMeasure(null)}
          >
            <motion.div
              onClick={(e) => e.stopPropagation()}
              initial={{ y: 24, opacity: 0, scale: 0.96 }} animate={{ y: 0, opacity: 1, scale: 1 }} exit={{ y: 16, opacity: 0 }}
              className="glass-strong w-full max-w-md rounded-3xl border border-border/50 p-5 shadow-elegant"
            >
              <div className="text-[10px] font-mono uppercase tracking-widest text-turquoise">
                Measure before adding
              </div>
              <h3 className="mt-1 text-xl font-semibold leading-tight" style={{ fontFamily: "var(--font-display)" }}>
                {measure.chem.name}
              </h3>
              <p className="mt-1 font-mono text-[12px] text-muted-foreground">{measure.chem.formula}</p>

              {/* graduated visual */}
              <div className="mt-4 flex items-end gap-4">
                <div className="relative h-32 w-16 shrink-0 overflow-hidden rounded-b-xl border-2 border-border/60 bg-background/40">
                  <div
                    className="absolute inset-x-0 bottom-0 transition-all"
                    style={{ height: `${Math.min(100, (measure.amount / 50) * 100)}%`, background: measure.chem.color }}
                  />
                  {[0.25, 0.5, 0.75].map((f) => (
                    <div key={f} className="absolute inset-x-0 h-px bg-border/60" style={{ bottom: `${f * 100}%` }} />
                  ))}
                </div>
                <div className="flex-1">
                  <label className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                    Amount ({measurementUnit(measure.chem.state)})
                  </label>
                  <input
                    type="range" min={0.5} max={50} step={0.5}
                    value={measure.amount}
                    onChange={(e) => setMeasure({ ...measure, amount: Number(e.target.value) })}
                    className="mt-2 w-full accent-turquoise"
                  />
                  <div className="mt-2 flex items-center gap-2">
                    <input
                      type="number" min={0.1} step={0.1}
                      value={measure.amount}
                      onChange={(e) => setMeasure({ ...measure, amount: Math.max(0.1, Number(e.target.value)) })}
                      className="w-24 rounded-lg border border-border/50 bg-background/60 px-2 py-1.5 text-[14px] font-semibold outline-none focus:border-turquoise"
                    />
                    <span className="text-[13px] text-muted-foreground">{measurementUnit(measure.chem.state)}</span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {MEASURE_PRESETS.map((p) => (
                      <button
                        key={p}
                        onClick={() => setMeasure({ ...measure, amount: p })}
                        className="rounded-full border border-border/50 bg-background/60 px-2 py-0.5 text-[11px] hover:bg-turquoise/15"
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {measure.chem.hazards?.length > 0 && (
                <div className="mt-3 flex items-start gap-1.5 rounded-xl border border-aurora-red/40 bg-aurora-red/10 px-3 py-2 text-[11.5px] text-aurora-red">
                  <AlertTriangle size={13} className="mt-0.5 shrink-0" />
                  <span>{measure.chem.hazards.join(" · ")}</span>
                </div>
              )}

              <div className="mt-5 flex justify-end gap-2">
                <button onClick={() => setMeasure(null)}
                  className="rounded-full border border-border/50 bg-background/60 px-4 py-2 text-[13px] font-medium hover:bg-foreground/5">
                  Cancel
                </button>
                <button
                  onClick={() => { addChemical(measure.chem, measure.amount); setMeasure(null); }}
                  className="rounded-full bg-navy px-4 py-2 text-[13px] font-semibold text-peach shadow hover:opacity-90 dark:bg-turquoise dark:text-charcoal"
                >
                  Add {measure.amount} {measurementUnit(measure.chem.state)}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ---------- flame picker ---------- */}
      <AnimatePresence>
        {flamePicker && (() => {
          const burner = placed.find((a) => a.uid === flamePicker);
          if (!burner) return null;
          const options = flamesFor(burner.item.id);
          return (
            <motion.div
              className="fixed inset-0 z-[85] grid place-items-center bg-charcoal/55 p-4 backdrop-blur-md"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setFlamePicker(null)}
            >
              <motion.div
                onClick={(e) => e.stopPropagation()}
                initial={{ y: 24, opacity: 0, scale: 0.96 }} animate={{ y: 0, opacity: 1, scale: 1 }} exit={{ y: 16, opacity: 0 }}
                className="glass-strong w-full max-w-lg rounded-3xl border border-border/50 p-5 shadow-elegant"
              >
                <div className="text-[10px] font-mono uppercase tracking-widest text-turquoise">Heat source</div>
                <h3 className="mt-1 text-xl font-semibold" style={{ fontFamily: "var(--font-display)" }}>
                  {burner.item.name}
                </h3>
                <div className="mt-4 grid gap-2">
                  {options.map((f) => (
                    <button
                      key={f.id}
                      onClick={() => { setFlame(burner.uid, f.id); setFlamePicker(null); }}
                      className={`flex items-start gap-3 rounded-2xl border px-3 py-2.5 text-left transition hover:border-turquoise/60 hover:bg-turquoise/10 ${
                        burner.flame === f.id ? "border-turquoise/70 bg-turquoise/10" : "border-border/50 bg-background/50"
                      }`}
                    >
                      <span className="mt-0.5 h-8 w-4 shrink-0 rounded-full"
                        style={{ background: `linear-gradient(180deg, ${f.color}, ${f.outerColor})` }} />
                      <span className="min-w-0">
                        <span className="block text-[13.5px] font-semibold">{f.label}</span>
                        <span className="block text-[11.5px] text-muted-foreground">{f.note}</span>
                        <span className="mt-0.5 block font-mono text-[10.5px] text-turquoise">
                          max {f.maxTemp} °C · {f.sooty ? "sooty" : "clean"} · {f.openFlame ? "open flame" : "no naked flame"}
                        </span>
                      </span>
                    </button>
                  ))}
                </div>
                {options.length < FLAMES.length && (
                  <p className="mt-3 text-[11.5px] text-muted-foreground">
                    Place a hot plate or water bath for flame-free heating of flammable solvents.
                  </p>
                )}
              </motion.div>
            </motion.div>
          );
        })()}
      </AnimatePresence>

      {/* ---------- indicator / gas / separation picker ---------- */}
      <AnimatePresence>
        {testPanel && (() => {
          const app = placed.find((a) => a.uid === testPanel.uid);
          if (!app) return null;
          const title =
            testPanel.kind === "indicator" ? "Indicator test"
              : testPanel.kind === "gas" ? "Test the gas evolved"
                : "Separate the mixture";
          const options =
            testPanel.kind === "indicator"
              ? INDICATORS.map((i) => ({ id: i.id, label: i.label, hint: i.kind === "paper" ? "Dip a fresh strip" : "Add 2–3 drops", swatch: i.stock }))
              : testPanel.kind === "gas"
                ? GAS_TESTS.map((g) => ({ id: g.id, label: g.label, hint: g.hint, swatch: "rgba(160,200,255,0.5)" }))
                : SEPARATIONS.map((s) => ({
                    id: s.id, label: s.label,
                    hint: (s.needs ?? []).length ? `${s.hint} · needs ${(s.needs ?? []).join(", ")}` : s.hint,
                    swatch: "rgba(255,200,120,0.6)",
                  }));
          const run = (id: string) =>
            testPanel.kind === "indicator" ? doIndicator(app.uid, id)
              : testPanel.kind === "gas" ? doGasTest(app.uid, id)
                : doSeparation(app.uid, id);
          return (
            <motion.div
              className="fixed inset-0 z-[85] grid place-items-center bg-charcoal/55 p-4 backdrop-blur-md"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setTestPanel(null)}
            >
              <motion.div
                onClick={(e) => e.stopPropagation()}
                initial={{ y: 24, opacity: 0, scale: 0.96 }} animate={{ y: 0, opacity: 1, scale: 1 }} exit={{ y: 16, opacity: 0 }}
                className="glass-strong w-full max-w-lg rounded-3xl border border-border/50 p-5 shadow-elegant"
              >
                <div className="text-[10px] font-mono uppercase tracking-widest text-turquoise">{title}</div>
                <h3 className="mt-1 text-xl font-semibold" style={{ fontFamily: "var(--font-display)" }}>{app.item.name}</h3>
                <p className="mt-1 text-[11.5px] text-muted-foreground">
                  pH {app.state?.pH.toFixed(1) ?? "—"} · {app.state?.temperature.toFixed(0) ?? "—"} °C ·
                  {" "}{app.state?.bubblingGas ? `${app.state.bubblingGas.name} evolving` : "no gas evolving"}
                </p>
                <div className="mt-4 grid max-h-[52vh] gap-2 overflow-y-auto pr-1">
                  {options.map((o) => (
                    <button
                      key={o.id}
                      onClick={() => run(o.id)}
                      className="flex items-start gap-3 rounded-2xl border border-border/50 bg-background/50 px-3 py-2.5 text-left transition hover:border-turquoise/60 hover:bg-turquoise/10"
                    >
                      <span className="mt-0.5 h-7 w-4 shrink-0 rounded-full border border-border/50" style={{ background: o.swatch }} />
                      <span className="min-w-0">
                        <span className="block text-[13.5px] font-semibold">{o.label}</span>
                        <span className="block text-[11.5px] text-muted-foreground">{o.hint}</span>
                      </span>
                    </button>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          );
        })()}
      </AnimatePresence>

      {/* ---------- test result card ---------- */}
      <AnimatePresence>
        {testResult && (
          <motion.div
            className="pointer-events-none fixed inset-x-0 bottom-36 z-[90] flex justify-center px-4"
            initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }}
          >
            <div className="glass-strong pointer-events-auto flex w-full max-w-xl items-start gap-3 rounded-2xl border border-border/50 p-4 shadow-elegant">
              <span
                className="mt-0.5 h-10 w-10 shrink-0 rounded-xl border border-border/50"
                style={{ background: testResult.outcome.color ?? "rgba(150,160,175,0.35)" }}
              />
              <div className="min-w-0 flex-1">
                <div className="text-[10px] font-mono uppercase tracking-widest text-turquoise">
                  {testResult.title} · {testResult.outcome.ok ? "result" : "not possible"}
                </div>
                <p className="mt-0.5 text-[13px] leading-snug">{testResult.outcome.observation}</p>
                {testResult.outcome.note && (
                  <p className="mt-1 text-[11.5px] text-muted-foreground">{testResult.outcome.note}</p>
                )}
              </div>
              <button
                onClick={() => setTestResult(null)}
                className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-border/50 bg-background/50 hover:bg-foreground/10"
              >
                <X size={13} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {report && (
          <motion.div
            className="fixed inset-0 z-[200] flex items-start justify-center overflow-y-auto bg-charcoal/80 p-3 py-5 backdrop-blur-md sm:p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setReport(null)}
          >
            <motion.div
              onClick={(e) => e.stopPropagation()}
              initial={{ y: 30, opacity: 0, scale: 0.96 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 20, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="glass-strong relative my-auto flex w-full max-w-4xl max-h-[min(94vh,960px)] flex-col overflow-hidden rounded-3xl border border-border/50 shadow-elegant"
            >
              <div className="sticky top-0 z-10 shrink-0 border-b border-border/40 bg-background/90 px-5 py-4 backdrop-blur-md sm:px-7">
                <button onClick={() => setReport(null)} className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-full border border-border/50 bg-background/50 hover:bg-foreground/10">
                  <X size={14} />
                </button>
                <div className="text-[10px] font-mono uppercase tracking-widest text-turquoise">
                  {mode === "practice" ? "Practice" : "Test"} report · {currentSyllabus.board}
                </div>
                <h2 className="mt-1 pr-10 text-2xl font-semibold leading-tight" style={{ fontFamily: "var(--font-display)" }}>
                  Experiment #{experiment.id} — {experiment.title}
                </h2>
                <p className="mt-1 text-[12.5px] text-muted-foreground">{experiment.expectedResult}</p>
              </div>
              <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-5 sm:px-7">
              <div className="grid gap-4 md:grid-cols-[200px_1fr]">
                <div className="rounded-2xl border border-border/40 bg-background/40 p-4 text-center">
                  <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Score</div>
                  <div className="text-4xl font-bold text-gradient" style={{ fontFamily: "var(--font-display)" }}>{report.percent}%</div>
                  <div className="mt-1 text-[13px] font-semibold">{report.grade}</div>
                  <div className="mt-1 text-[10px] text-muted-foreground">{report.band}</div>
                  <div className="mt-2 border-t border-border/40 pt-2 text-[11px] tabular-nums text-muted-foreground">
                    {report.rawScore} / {report.rawTotal} weighted marks
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <div className="text-[10px] font-semibold uppercase tracking-widest text-turquoise">What you got right</div>
                    <ul className="mt-1 space-y-1 text-[12.5px]">
                      {report.correct.length === 0 && <li className="text-muted-foreground">Nothing scored — try again.</li>}
                      {report.correct.map((r, i) => (
                        <li key={i} className="flex items-start gap-1.5"><span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-turquoise" />{r.label}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <div className="text-[10px] font-semibold uppercase tracking-widest text-aurora-red">Where to improve</div>
                    <ul className="mt-1 space-y-1 text-[12.5px]">
                      {report.missed.length === 0 && <li className="text-muted-foreground">Nothing missed.</li>}
                      {report.missed.map((r, i) => (
                        <li key={i} className="flex items-start gap-1.5"><span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-aurora-red" />{r.label}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
              {/* mark scheme breakdown */}
              <div className="mt-4 rounded-2xl border border-border/40 bg-background/40 p-3">
                <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Mark scheme — {currentSyllabus.board} {currentSyllabus.level}</div>
                <table className="w-full text-left text-[12px]">
                  <tbody>
                    {report.criteria.map((c) => (
                      <tr key={c.id} className="border-t border-border/30">
                        <td className="py-1 pr-2">{c.achieved ? "✓" : "✗"}</td>
                        <td className="py-1 pr-2">
                          <div>{c.label}</div>
                          {!c.achieved && c.hint && (
                            <div className="text-[11px] text-muted-foreground">{c.hint}</div>
                          )}
                          {c.achieved && c.evidence && (
                            <div className="text-[11px] text-turquoise/80">{c.evidence}</div>
                          )}
                        </td>
                        <td className={`py-1 text-right tabular-nums ${c.achieved ? "text-turquoise" : "text-muted-foreground"}`}>{c.achieved ? c.weightedMarks : 0}/{c.weightedMarks}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-3 rounded-2xl border border-border/40 bg-background/40 p-3">
                <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Action transcript ({log.length})</div>
                {log.length === 0 ? (
                  <p className="text-[12px] text-muted-foreground">No actions recorded on this attempt.</p>
                ) : (
                  <ul className="space-y-1 text-[11.5px]">
                    {[...log].reverse().map((l, i) => (
                      <li key={`${l.ts}-${i}`} className="flex gap-2 border-t border-border/20 py-1">
                        <span className="w-16 shrink-0 tabular-nums text-muted-foreground">{new Date(l.ts).toLocaleTimeString()}</span>
                        <span className="w-14 shrink-0 font-mono text-[10px] uppercase text-turquoise">{l.kind}</span>
                        <span className="min-w-0 flex-1">{l.label}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="mt-3 rounded-2xl border border-border/40 bg-background/40 p-3">
                <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Table of results ({readings.length})</div>
                {readings.length === 0 ? (
                  <p className="text-[12px] text-muted-foreground">No readings recorded — use Record reading or Observe during the attempt.</p>
                ) : (
                  <table className="w-full text-left text-[11.5px]">
                    <tbody>
                      {readings.map((r, i) => (
                        <tr key={i} className="border-t border-border/30">
                          <td className="py-1 pr-2 tabular-nums text-muted-foreground">{i + 1}</td>
                          <td className="py-1 pr-2">{r.vessel}</td>
                          <td className="py-1 pr-2">{r.action}</td>
                          <td className="py-1 pr-2 tabular-nums">{r.temperature}°C</td>
                          <td className="py-1 pr-2 tabular-nums">{r.volume} ml</td>
                          <td className="py-1 pr-2 tabular-nums">pH {r.pH}</td>
                          <td className="py-1">{r.observation}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
              {/* Student info + observations for PDF */}
              <div className="mt-5 grid gap-3 rounded-2xl border border-border/40 bg-background/40 p-4 md:grid-cols-3">
                <label className="text-[11px]">
                  <span className="mb-1 block font-semibold uppercase tracking-widest text-muted-foreground">Student name</span>
                  <input value={student.name} onChange={(e) => setStudent({ ...student, name: e.target.value })}
                    className="w-full rounded-lg border border-border/50 bg-background/60 px-2 py-1.5 text-[12.5px] outline-none focus:border-turquoise" />
                </label>
                <label className="text-[11px]">
                  <span className="mb-1 block font-semibold uppercase tracking-widest text-muted-foreground">Level</span>
                  <input value={student.level} onChange={(e) => setStudent({ ...student, level: e.target.value })}
                    placeholder="e.g. IGCSE Year 11"
                    className="w-full rounded-lg border border-border/50 bg-background/60 px-2 py-1.5 text-[12.5px] outline-none focus:border-turquoise" />
                </label>
                <label className="text-[11px]">
                  <span className="mb-1 block font-semibold uppercase tracking-widest text-muted-foreground">Date</span>
                  <input type="date" value={student.date} onChange={(e) => setStudent({ ...student, date: e.target.value })}
                    className="w-full rounded-lg border border-border/50 bg-background/60 px-2 py-1.5 text-[12.5px] outline-none focus:border-turquoise" />
                </label>
                <div className="md:col-span-3">
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Observations ({observations.length})</span>
                    <button onClick={() => { if (obsDraft.trim()) { setObservations([...observations, obsDraft.trim()]); setObsDraft(""); } }}
                      className="rounded-full border border-border/50 bg-background/60 px-2 py-0.5 text-[10px] font-medium hover:bg-foreground/5">
                      + Add
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <input value={obsDraft} onChange={(e) => setObsDraft(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter" && obsDraft.trim()) { setObservations([...observations, obsDraft.trim()]); setObsDraft(""); } }}
                      placeholder="Record what you observed…"
                      className="flex-1 rounded-lg border border-border/50 bg-background/60 px-2 py-1.5 text-[12.5px] outline-none focus:border-turquoise" />
                  </div>
                  {observations.length > 0 && (
                    <ul className="mt-2 max-h-24 space-y-1 overflow-y-auto text-[11.5px]">
                      {observations.map((o, i) => (
                        <li key={i} className="flex items-start justify-between gap-2 rounded-md bg-background/40 px-2 py-1">
                          <span>• {o}</span>
                          <button onClick={() => setObservations(observations.filter((_, k) => k !== i))} className="text-muted-foreground hover:text-aurora-red">×</button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
              </div>
              <div className="shrink-0 border-t border-border/40 bg-background/90 px-5 py-3 backdrop-blur-md sm:px-7">
                <div className="flex flex-wrap justify-end gap-2">
                <button
                  onClick={() => { setReport(null); resetTest(); }}
                  className="inline-flex items-center gap-1 rounded-full border border-border/50 bg-background/60 px-4 py-2 text-[13px] font-medium hover:bg-foreground/5"
                >
                  <RotateCw size={13} /> Start new attempt
                </button>
                <button
                  onClick={downloadPdf}
                  disabled={pdfBusy}
                  className="inline-flex items-center gap-1 rounded-full border border-turquoise/50 bg-turquoise/10 px-4 py-2 text-[13px] font-semibold text-turquoise hover:bg-turquoise/20 disabled:opacity-50"
                >
                  {pdfBusy ? "Generating…" : "Download PDF"}
                </button>
                <button
                  onClick={() => setReport(null)}
                  className="inline-flex items-center gap-1 rounded-full bg-navy px-4 py-2 text-[13px] font-semibold text-peach shadow hover:opacity-90 dark:bg-turquoise dark:text-charcoal"
                >
                  Close report
                </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default LabBench;

/* ============================================================
   Sub-components
============================================================ */

function ActionBtn({
  onClick, icon: Icon, label, disabled,
}: {
  onClick: () => void; icon: React.ComponentType<{ size?: number }>; label: string; disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="inline-flex items-center gap-1 rounded-full border border-border/50 bg-background/60 px-3 py-1.5 text-[12px] font-medium hover:bg-foreground/5 disabled:opacity-40"
    >
      <Icon size={12} /> {label}
    </button>
  );
}

/**
 * Anchors the right-click menu to the pointer.
 *
 * The previous version clamped against hard-coded guesses (250 x 180) for its
 * own size, so a tall menu opened near the bottom of the bench was pushed far
 * from the cursor. This measures the rendered menu and only moves it when it
 * would actually leave the viewport, flipping above/left of the pointer first
 * so the menu always stays attached to the item that was clicked.
 */
function CtxMenuSurface({
  x, y, children, onDismiss,
}: {
  x: number; y: number; children: React.ReactNode; onDismiss: () => void;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [pos, setPos] = useState<{ left: number; top: number }>({ left: x, top: y });
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const M = 8;
    const { width: w, height: h } = el.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    // Prefer down-right of the cursor; flip when there is not enough room.
    let left = x;
    if (x + w + M > vw) left = x - w >= M ? x - w : Math.max(M, vw - w - M);
    let top = y;
    if (y + h + M > vh) top = y - h >= M ? y - h : Math.max(M, vh - h - M);

    setPos({ left: Math.max(M, left), top: Math.max(M, top) });
  }, [x, y]);

  useEffect(() => {
    const close = () => onDismiss();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onDismiss();
    // `true` = capture, so the menu closes even when a child stops propagation.
    window.addEventListener("pointerdown", close, true);
    window.addEventListener("resize", close);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("pointerdown", close, true);
      window.removeEventListener("resize", close);
      window.removeEventListener("keydown", onKey);
    };
  }, [onDismiss]);

  // Rendered into <body>. Inside the bench the menu sits under ancestors with
  // `backdrop-filter` (the .glass panel) and a transition `filter`, each of
  // which becomes the containing block for `position: fixed` and shifted the
  // menu ~345px away from the pointer. A portal escapes both.
  // The menu only ever renders in response to a real right-click, so `document`
  // exists by then; the guard is belt-and-braces for the prerender pass.
  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      ref={ref}
      className="glass-strong fixed z-[160] min-w-[230px] max-h-[min(70vh,420px)] overflow-y-auto overscroll-contain rounded-2xl border border-border/50 p-1 text-[12.5px] shadow-elegant [scrollbar-width:thin]"
      style={{ left: pos.left, top: pos.top }}
      onClick={(e) => e.stopPropagation()}
      onWheel={(e) => e.stopPropagation()}
      onContextMenu={(e) => e.preventDefault()}
      onPointerDown={(e) => e.stopPropagation()}
    >
      {children}
    </div>,
    document.body,
  );
}

function CtxHeader({ label }: { label: string }) {
  return (
    <div className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
      {label}
    </div>
  );
}

/** Collapsible block inside the experiment brief drawer. */
function BriefSection({
  title, children, defaultOpen = false,
}: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="mt-3 border-t border-border/40 pt-2">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-1 text-left text-[10px] font-semibold uppercase tracking-widest text-turquoise"
      >
        <ChevronRight size={11} className={`transition-transform ${open ? "rotate-90" : ""}`} />
        {title}
      </button>
      {open && <div className="mt-1.5 text-[12px] text-foreground/80">{children}</div>}
    </div>
  );
}

function CtxItem({
  icon: Icon, label, onClick, danger,
}: { icon: React.ComponentType<{ size?: number }>; label: string; onClick: () => void; danger?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-left transition hover:bg-foreground/5 ${danger ? "text-aurora-red" : ""}`}
    >
      <Icon size={13} /> {label}
    </button>
  );
}

/* ------------- Placed piece (SVG + liquid overlay) ------------- */
function PlacedPiece({
  app, selected, multi, pourTarget, onPointerDown, onPointerMove, onPointerUp, onContextMenu,
}: {
  app: PlacedApparatus;
  selected: boolean;
  multi: boolean;
  pourTarget: boolean;
  onPointerDown: (e: React.PointerEvent) => void;
  onPointerMove: (e: React.PointerEvent) => void;
  onPointerUp: (e: React.PointerEvent) => void;
  onContextMenu: (e: React.MouseEvent) => void;
}) {
  const w = app.item.width, h = app.item.height;
  const state = app.state;
  const vol = state ? Object.values(state.substanceIds).reduce((s, v) => s + v, 0) : 0;
  const cap = state?.maxVolume ?? 1;
  const fill = vol > 0 ? Math.min(1, vol / cap) : 0;
  const liquidColor = state ? blendLiquid(state) : "transparent";
  const showTemp = state && (state.isHeated || state.temperature > 30);

  return (
    <div
      className={`absolute cursor-grab select-none touch-none ${selected ? "ring-2 ring-turquoise/70 ring-offset-2 ring-offset-transparent" : ""} ${multi ? "ring-2 ring-amber-400/80" : ""} ${pourTarget ? "ring-2 ring-aurora-red/70 animate-pulse" : ""}`}
      style={{ transform: `translate(${app.x}px, ${app.y}px)`, width: w, height: h + 4, zIndex: 10 + app.z }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onContextMenu={onContextMenu}
    >
      <div
        className="relative"
        style={{
          width: w, height: h,
          transform: `rotate(${app.rotation}deg)${app.broken ? " skewX(4deg)" : ""}`,
          transformOrigin: "50% 85%",
          opacity: app.broken ? 0.55 : 1,
          filter: app.broken ? "grayscale(0.6)" : undefined,
        }}
      >
        {/* shadow */}
        <div
          className="absolute -bottom-1 left-1/2 h-2 rounded-full bg-black/30 blur-sm"
          style={{ width: w * 0.7, transform: "translateX(-50%)" }}
        />
        {/* apparatus SVG */}
        <ApparatusSVG item={app.item} className="absolute inset-0" />
        {/* soot deposit from a luminous flame */}
        {app.sooty && (
          <div
            className="pointer-events-none absolute inset-x-2 bottom-1 h-1/4 rounded-b-full"
            style={{ background: "radial-gradient(ellipse at 50% 100%, rgba(20,16,14,0.7), transparent 70%)" }}
          />
        )}
        {/* combustion */}
        {app.burning && (
          <div
            className="pointer-events-none absolute inset-x-0 -top-6 h-8 animate-pulse rounded-full blur-[2px]"
            style={{ background: `radial-gradient(ellipse at 50% 100%, ${app.burning}, transparent 70%)` }}
          />
        )}
        {/* pressure warning on a sealed heated vessel */}
        {app.sealed && app.pressure > 0.15 && !app.broken && (
          <div className="pointer-events-none absolute -top-3 left-1/2 h-1.5 w-12 -translate-x-1/2 overflow-hidden rounded-full bg-background/70">
            <div className="h-full bg-aurora-red transition-all" style={{ width: `${Math.min(100, app.pressure * 100)}%` }} />
          </div>
        )}
        {/* liquid overlay for containers */}
        {state && fill > 0 && (
          <svg
            viewBox={`0 0 ${w} ${h}`}
            width={w} height={h}
            className="pointer-events-none absolute inset-0"
          >
            <defs>
              <clipPath id={`clip-${app.uid}`}>
                <path d={liquidClipPath(app.item.shape, w, h)} />
              </clipPath>
            </defs>
            <g clipPath={`url(#clip-${app.uid})`}>
              <LiquidBody w={w} h={h} fill={fill} color={liquidColor} sway={app.swayAmp} boiling={app.fx.boiling} uid={app.uid} />
            </g>
          </svg>
        )}
        {/* silver mirror overlay */}
        {app.fx.silverMirror && (
          <div
            className="pointer-events-none absolute inset-2 rounded"
            style={{
              background: "linear-gradient(90deg, rgba(220,225,235,0.85), rgba(255,255,255,0.95), rgba(200,210,225,0.8))",
            }}
          />
        )}
        {/* labels */}
        {state && Object.keys(state.substanceIds).length > 0 && (
          <div
            className="absolute -top-5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-charcoal/85 px-1.5 py-0.5 font-mono text-[9.5px] text-peach shadow"
          >
            {Object.keys(state.substanceIds).slice(0, 2).map((id) => getChemical(id).formula.replace(/\(.*?\)/g, "")).join(" + ")}
          </div>
        )}
        {showTemp && (
          <div className="absolute -top-5 right-0 whitespace-nowrap rounded-md bg-orange-500/90 px-1.5 py-0.5 font-mono text-[9.5px] text-white shadow">
            {state!.temperature.toFixed(0)}°C
            {app.fx.boiling && app.boilHeat > 0 ? ` · H${app.boilHeat}` : ""}
          </div>
        )}
      </div>
    </div>
  );
}

function liquidClipPath(shape: ApparatusShape, w: number, h: number): string {
  switch (shape) {
    case "beaker":
    case "cylinder":
      return `M6 6 L${w - 6} 6 L${w - 6} ${h - 6} Q${w - 6} ${h - 3} ${w - 10} ${h - 3} L10 ${h - 3} Q6 ${h - 3} 6 ${h - 6} Z`;
    case "test-tube":
    case "boiling-tube":
      return `M4 4 L${w - 4} 4 L${w - 4} ${h - w / 2} Q${w - 4} ${h - 4} ${w / 2} ${h - 4} Q4 ${h - 4} 4 ${h - w / 2} Z`;
    case "flask-conical": {
      const neck = w * 0.28;
      return `M${(w - neck) / 2} 4 L${(w + neck) / 2} 4 L${(w + neck) / 2} ${h * 0.35} L${w - 6} ${h - 6} L6 ${h - 6} L${(w - neck) / 2} ${h * 0.35} Z`;
    }
    case "flask-round":
    case "flask-florence":
    case "flask-volumetric": {
      const r = Math.min(w, h) * 0.4;
      const cx = w / 2, cy = h - r - 4;
      return `M${cx - r} ${cy} a${r} ${r} 0 1 0 ${r * 2} 0 a${r} ${r} 0 1 0 ${-r * 2} 0`;
    }
    case "watch-glass":
    case "petri-dish":
    case "evap-dish":
      return `M4 ${h - 4} Q${w / 2} ${h * 0.2} ${w - 4} ${h - 4} Z`;
    case "burette":
      return `M${w / 2 - 8} 2 L${w / 2 + 8} 2 L${w / 2 + 8} ${h - 30} L${w / 2 - 8} ${h - 30} Z`;
    case "crucible":
      return `M${w * 0.15} ${h * 0.3} L${w * 0.85} ${h * 0.3} L${w * 0.75} ${h - 4} L${w * 0.25} ${h - 4} Z`;
    default:
      return `M4 4 L${w - 4} 4 L${w - 4} ${h - 4} L4 ${h - 4} Z`;
  }
}

function LiquidBody({
  w, h, fill, color, sway, boiling, uid,
}: {
  w: number; h: number; fill: number; color: string; sway: number; boiling: boolean; uid: string;
}) {
  // liquid rectangle from bottom up
  const lh = h * fill * 0.9;
  const ly = h - 4 - lh;
  const amp = Math.max(1.5, sway) + (boiling ? 2.5 : 0);
  const gradId = `lg-${uid}`;
  return (
    <>
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={color} stopOpacity="0.95" />
          <stop offset="1" stopColor={color} stopOpacity="0.7" />
        </linearGradient>
      </defs>
      <rect x={0} y={ly} width={w} height={lh + 4} fill={`url(#${gradId})`} />
      {/* animated surface wave */}
      <motion.path
        d={surfacePath(w, ly, amp, 0)}
        fill="rgba(255,255,255,0.18)"
        initial={{ d: surfacePath(w, ly, amp, 0) }}
        animate={{ d: [surfacePath(w, ly, amp, 0), surfacePath(w, ly, amp, Math.PI), surfacePath(w, ly, amp, Math.PI * 2)] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: "linear" }}
      />
    </>
  );
}
function surfacePath(w: number, y: number, amp: number, phase: number): string {
  const pts: string[] = [];
  for (let x = 0; x <= w; x += 6) {
    const yy = y + Math.sin((x / w) * Math.PI * 2 + phase) * amp;
    pts.push(`${x === 0 ? "M" : "L"}${x} ${yy}`);
  }
  pts.push(`L${w} ${y + amp + 4} L0 ${y + amp + 4} Z`);
  return pts.join(" ");
}
