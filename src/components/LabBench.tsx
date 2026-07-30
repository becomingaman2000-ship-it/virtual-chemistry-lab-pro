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
  useCallback, useEffect, useMemo, useRef, useState,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Beaker, BookOpen, ChevronDown, ChevronLeft, ChevronRight,
  ClipboardList, Droplets, FlaskConical, Flame, GraduationCap, PanelLeftClose,
  PanelLeftOpen, Play, RotateCw, Search, Snowflake, TestTube, ThermometerSun,
  Trash2, Wand2, X,
} from "lucide-react";
import {
  Undo2, Redo2, Ruler, Lock, Unlock, AlertTriangle, Layers,
} from "lucide-react";

import { APPARATUS, CATEGORIES, type ApparatusItem, type ApparatusShape } from "@/data/apparatus";
import { ApparatusSVG } from "@/components/ApparatusSVG";
import { CHEMICAL_DATABASE, getChemical, type ChemicalSubstance } from "@/lib/lab/dwsimChemicals";
import { COMPLETE_SYLLABUS_EXPERIMENTS, type SyllabusExperiment } from "@/lib/lab/experimentsCatalog";
import { evaluateReaction, type ContainerState, type ReactionResult } from "@/lib/lab/dwsimEngine";
import { PDF_CATEGORY_LABELS, metaFor, fitsLevel, type PdfCategory } from "@/lib/lab/experimentMeta";
import { SYLLABI, type Syllabus } from "@/data/syllabi";
import { generateReportPdf, downloadReportPdf } from "@/lib/lab/reportPdf";
import {
  FLAMES, flameSpec, flamesFor, defaultFlameFor, stepPhysics, vesselLimits,
  measurementUnit, MEASURE_PRESETS, type FlameId, type Hazard,
} from "@/lib/lab/physics";

/* ============================================================
   Types
============================================================ */

type Mode = "manual" | "practice" | "test";
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
  kind: "place" | "add" | "heat" | "cool" | "freeze" | "pour" | "observe" | "safety" | "reaction" | "connect";
  label: string;
  experimentId?: number;
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
    rotation: 0, dryTicks: 0, pressure: 0, sealed: false, broken: false,
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

function runReactionOn(app: PlacedApparatus): ReactionResult | null {
  if (!app.state) return null;
  const vol = Object.values(app.state.substanceIds).reduce((s, v) => s + v, 0);
  app.state.currentVolume = vol;
  const res = evaluateReaction(app.state);
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
  const [mode, setMode] = useState<Mode>("manual");

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

  /* -------- bench state -------- */
  const benchRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [placed, setPlaced] = useState<PlacedApparatus[]>([]);
  const placedRef = useRef<PlacedApparatus[]>([]);
  useEffect(() => { placedRef.current = placed; }, [placed]);
  const [selectedUid, setSelectedUid] = useState<string | null>(null);
  const [message, setMessage] = useState("Select apparatus and chemicals from the sidebar to begin.");
  const [log, setLog] = useState<LogEntry[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const pourRef = useRef<PourStream | null>(null);
  const [pourPending, setPourPending] = useState<string | null>(null); // source uid awaiting target
  const timeRef = useRef(0);

  const pushLog = useCallback((entry: Omit<LogEntry, "ts">) => {
    setLog((l) => [{ ...entry, ts: Date.now() }, ...l].slice(0, 120));
  }, []);

  /* -------- context menu -------- */
  const [ctxMenu, setCtxMenu] = useState<{ x: number; y: number; uid: string } | null>(null);

  /* -------- report modal (test mode) -------- */
  const [report, setReport] = useState<null | {
    percent: number; grade: string; band: string;
    correct: { label: string }[]; missed: { label: string }[];
  }>(null);
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
              runReactionOn(to);
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
          drawFlame(ctx, app.x + app.item.width / 2, app.y + 4, t, "#ff9a3d");
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
      for (const app of placedRef.current) {
        if (!app.state) continue;
        // is any ignited burner within reach beneath?
        const heated = placedRef.current.some((h) =>
          h.role === "heat" && h.ignited
          && Math.abs((h.x + h.item.width / 2) - (app.x + app.item.width / 2)) < 60
          && (h.y - (app.y + app.item.height)) < 40 && h.y > app.y);
        app.state.isHeated = heated;
        if (heated && app.state.temperature < 220) {
          app.state.temperature = Math.min(220, app.state.temperature + 3); dirty = true;
        } else if (!heated && app.state.temperature > 22) {
          app.state.temperature = Math.max(22, app.state.temperature - 1.5); dirty = true;
        }
        if (app.fx.exploding > 0) { app.fx.exploding -= 1; dirty = true; }
        if (dirty && Object.keys(app.state.substanceIds).length > 0) runReactionOn(app);
      }
      if (dirty) setPlaced((p) => [...p]);
    }, 350);
    return () => clearInterval(t);
  }, []);

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

  function drawFlame(ctx: CanvasRenderingContext2D, cx: number, cy: number, time: number, color: string) {
    const jitter = Math.sin(time * 12) * 3;
    ctx.beginPath(); ctx.moveTo(cx - 12, cy);
    ctx.quadraticCurveTo(cx - 6 + jitter, cy - 28, cx + jitter, cy - 58);
    ctx.quadraticCurveTo(cx + 6 + jitter, cy - 28, cx + 12, cy);
    ctx.closePath();
    ctx.fillStyle = "rgba(90,140,255,0.55)"; ctx.fill();
    ctx.beginPath(); ctx.moveTo(cx - 6, cy);
    ctx.quadraticCurveTo(cx - 3, cy - 20, cx + jitter * 0.5, cy - 42);
    ctx.quadraticCurveTo(cx + 3, cy - 20, cx + 6, cy);
    ctx.closePath();
    ctx.fillStyle = color; ctx.fill();
    ctx.beginPath(); ctx.ellipse(cx, cy - 6, 3, 10, 0, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255,250,220,0.95)"; ctx.fill();
  }

  /* ============================================================
     Actions
  ============================================================ */

  const addApparatus = (item: ApparatusItem) => {
    const wrap = benchRef.current; if (!wrap) return;
    const rect = wrap.getBoundingClientRect();
    const x = 80 + (placed.length * 40) % (rect.width - 200);
    const y = rect.height - 180 - item.height;
    const app = makePlaced(item, x, Math.max(20, y), placed.length);
    setPlaced((p) => [...p, app]);
    setSelectedUid(app.uid);
    pushLog({ kind: "place", label: `Placed ${item.name}` });
    setMessage(`${item.name} placed. Right-click for actions.`);
  };

  const removePlaced = (uid: string) => {
    setPlaced((p) => p.filter((a) => a.uid !== uid));
    if (selectedUid === uid) setSelectedUid(null);
  };

  const emptyContainer = (uid: string) => {
    const app = placedRef.current.find((a) => a.uid === uid);
    if (!app?.state) return;
    app.state.substanceIds = {}; app.state.precipitate = null; app.state.bubblingGas = null;
    app.state.flameColor = null; app.state.color = "rgba(200,220,240,0.15)";
    app.state.pH = 7; app.state.currentVolume = 0;
    app.fx = { boiling: false, freezing: false, foaming: false, crystallising: false, exploding: 0, silverMirror: false };
    app.lastReaction = null;
    setPlaced((p) => [...p]);
  };

  const setIgnite = (uid: string, on: boolean) => {
    const app = placedRef.current.find((a) => a.uid === uid); if (!app) return;
    app.ignited = on;
    setPlaced((p) => [...p]);
    pushLog({ kind: on ? "heat" : "cool", label: `${on ? "Ignited" : "Extinguished"} ${app.item.name}` });
  };

  const chillContainer = (uid: string) => {
    const app = placedRef.current.find((a) => a.uid === uid); if (!app?.state) return;
    app.state.temperature = Math.max(-15, app.state.temperature - 40);
    if (Object.keys(app.state.substanceIds).length > 0) runReactionOn(app);
    pushLog({ kind: "freeze", label: `Chilled ${app.item.name} to ${app.state.temperature.toFixed(0)}°C` });
    setPlaced((p) => [...p]);
  };

  const addChemical = (chem: ChemicalSubstance) => {
    if (!selectedUid) { setMessage("Select a container on the bench first."); return; }
    const app = placedRef.current.find((a) => a.uid === selectedUid);
    if (!app?.state) { setMessage("That apparatus can't hold chemicals — select a beaker or tube."); return; }
    app.state.substanceIds[chem.id] = (app.state.substanceIds[chem.id] || 0) + 5;
    const res = runReactionOn(app);
    if (res?.message) setMessage(res.message);
    pushLog({
      kind: res?.successExperimentId ? "reaction" : "add",
      label: res?.successExperimentId
        ? `Added ${chem.name} · ✔ ${res.message}`
        : `Added ${chem.name} to ${app.item.name}`,
      experimentId: res?.successExperimentId,
    });
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
    runReactionOn(from);
    pushLog({ kind: "pour", label: `Poured from ${from.item.name} into ${to.item.name}` });
    setMessage(`Pouring ${from.item.name} → ${to.item.name}…`);
    setPlaced((p) => [...p]);
  };

  const autoSetup = (kind: "burner" | "retort") => {
    const wrap = benchRef.current; if (!wrap) return;
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
    setPlaced([]); setSelectedUid(null); particlesRef.current = []; pourRef.current = null; setPourPending(null);
    setLog([]);
    setMessage("Bench cleared.");
  };

  const resetTest = () => {
    setReport(null); setLog([]); clearBench();
  };

  const scoreAttempt = () => {
    const matched = log.some((l) => l.experimentId === experimentId);
    const weights = currentSyllabus.weights;
    const raw =
      (log.filter((l) => l.kind === "add").length * (weights.add ?? 1) * 4) +
      (log.filter((l) => l.kind === "heat").length * (weights.heat ?? 1) * 6) +
      (log.filter((l) => l.kind === "observe").length * (weights.observe ?? 1) * 5) +
      (log.filter((l) => l.kind === "reaction").length * 10) +
      (log.filter((l) => l.kind === "pour").length * 3) +
      (log.filter((l) => l.kind === "connect").length * 4);
    const percent = Math.min(100, Math.round(raw + (matched ? 25 : 0)));
    const band =
      currentSyllabus.grades.find((g) => percent >= g.min) ??
      currentSyllabus.grades[currentSyllabus.grades.length - 1];

    const correct: { label: string }[] = [];
    const missed: { label: string }[] = [];
    if (matched) correct.push({ label: `Achieved DWSIM outcome for experiment #${experimentId}` });
    else missed.push({ label: `Did not achieve DWSIM outcome for experiment #${experimentId}` });
    if (log.some((l) => l.kind === "heat")) correct.push({ label: "Used heat correctly" });
    else missed.push({ label: "No heating action recorded" });
    if (log.filter((l) => l.kind === "add").length >= 2) correct.push({ label: "Added multiple reagents" });
    else missed.push({ label: "Fewer than 2 reagents added" });
    if (log.some((l) => l.kind === "observe")) correct.push({ label: "Recorded observations" });
    else missed.push({ label: "No observations recorded" });

    setReport({ percent, grade: band.grade, band: band.descriptor, correct, missed });
  };

  const observeSelected = () => {
    const app = placedRef.current.find((a) => a.uid === selectedUid);
    if (!app?.state) { setMessage("Select a container first."); return; }
    const obs = app.lastReaction?.message
      ?? `Volume ${app.state.currentVolume.toFixed(1)} ml · T ${app.state.temperature.toFixed(1)}°C · pH ${app.state.pH.toFixed(2)}.`;
    setMessage(obs);
    pushLog({ kind: "observe", label: `Observed ${app.item.name}: ${obs}` });
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
    const rect = benchRef.current!.getBoundingClientRect();
    setCtxMenu({ x: e.clientX - rect.left, y: e.clientY - rect.top, uid: app.uid });
    setSelectedUid(app.uid);
  };

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

  const toggleGroup = (id: string) => setExpandedGroups((g) => ({ ...g, [id]: !g[id] }));

  const meta = metaFor(experimentId);

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
                    const open = expandedGroups[cat] ?? false;
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
                    const open = expandedGroups[grp] ?? grp === "Acids";
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
                                    onClick={() => addChemical(c)}
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
              DWSIM Bench · {applicableExperiments.length} experiments
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
              <div
                className="glass-strong absolute z-30 min-w-[190px] rounded-2xl border border-border/50 p-1 text-[12.5px] shadow-elegant"
                style={{ left: Math.min(ctxMenu.x, (benchRef.current?.clientWidth ?? 800) - 210), top: Math.min(ctxMenu.y, (benchRef.current?.clientHeight ?? 500) - 260) }}
                onClick={(e) => e.stopPropagation()}
              >
                <CtxHeader label={app.item.name} />
                {isC && <CtxItem icon={Flame} label="Heat (find burner)" onClick={() => { setMessage("Place under an ignited burner to heat."); setCtxMenu(null); }} />}
                {isC && <CtxItem icon={Snowflake} label="Chill (freeze)" onClick={() => { chillContainer(app.uid); setCtxMenu(null); }} />}
                {isC && <CtxItem icon={Droplets} label="Empty container" onClick={() => { emptyContainer(app.uid); setCtxMenu(null); }} />}
                {isC && <CtxItem icon={Wand2} label="Pour into…" onClick={() => { beginPour(app.uid); setCtxMenu(null); }} />}
                {isC && <CtxItem icon={ThermometerSun} label="Observe" onClick={() => { observeSelected(); setCtxMenu(null); }} />}
                {isH && <CtxItem icon={Flame} label={app.ignited ? "Extinguish" : "Ignite"} onClick={() => { setIgnite(app.uid, !app.ignited); setCtxMenu(null); }} />}
                <div className="my-1 h-px bg-border/50" />
                <CtxItem icon={Trash2} label="Remove from bench" danger onClick={() => { removePlaced(app.uid); setCtxMenu(null); }} />
              </div>
            );
          })()}

          {/* experiment brief drawer */}
          <AnimatePresence>
            {briefOpen && (
              <motion.aside
                initial={{ x: 60, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 60, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="glass-strong absolute right-3 top-14 z-20 w-[280px] max-h-[calc(100%-6rem)] overflow-y-auto rounded-2xl border border-border/50 p-3"
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
                <div className="mt-3">
                  <div className="text-[10px] font-semibold uppercase tracking-widest text-turquoise">Procedure</div>
                  <ol className="mt-1 space-y-1 text-[12px] text-foreground/80">
                    {experiment.steps.map((s, i) => (
                      <li key={i} className="flex gap-1.5">
                        <span className="mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full bg-turquoise/20 text-[9px] font-bold">{i + 1}</span>
                        <span className="leading-snug">{s}</span>
                      </li>
                    ))}
                  </ol>
                </div>
                <div className="mt-3">
                  <div className="text-[10px] font-semibold uppercase tracking-widest text-turquoise">Expected result</div>
                  <p className="mt-1 text-[12px] text-foreground/80">{experiment.expectedResult}</p>
                </div>
                {applicableChemicals.length > 0 && (
                  <div className="mt-3">
                    <div className="text-[10px] font-semibold uppercase tracking-widest text-turquoise">Required reagents</div>
                    <div className="mt-1 grid gap-1">
                      {applicableChemicals.map((c) => (
                        <button
                          key={c.id}
                          onClick={() => addChemical(c)}
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
          <ActionBtn onClick={observeSelected} icon={ThermometerSun} label="Observe" />
          <ActionBtn onClick={() => selectedUid && chillContainer(selectedUid)} icon={Snowflake} label="Chill" disabled={!selectedUid} />
          <ActionBtn onClick={() => selectedUid && emptyContainer(selectedUid)} icon={Droplets} label="Empty" disabled={!selectedUid} />
          <ActionBtn onClick={() => selectedUid && beginPour(selectedUid)} icon={Wand2} label="Pour…" disabled={!selectedUid} />
          <div className="ml-auto flex items-center gap-1.5">
            {mode === "test" && (
              <>
                <button
                  onClick={resetTest}
                  className="inline-flex items-center gap-1 rounded-full border border-border/50 bg-background/60 px-3 py-1.5 text-[12px] font-medium hover:bg-foreground/5"
                >
                  <RotateCw size={12} /> Reset test
                </button>
                <button
                  onClick={scoreAttempt}
                  className="inline-flex items-center gap-1 rounded-full bg-navy px-3 py-1.5 text-[12px] font-semibold text-peach shadow hover:opacity-90 dark:bg-turquoise dark:text-charcoal"
                >
                  <Play size={12} /> Score attempt
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

        {/* log strip */}
        <div className="flex items-center gap-2 border-t border-border/40 bg-background/30 px-3 py-1.5 text-[11px]">
          <span className="font-mono uppercase text-muted-foreground">Log</span>
          <div className="flex flex-1 gap-3 overflow-x-auto">
            {log.length === 0 && <span className="text-muted-foreground">Nothing yet — start by placing apparatus.</span>}
            {log.slice(0, 8).map((l, i) => (
              <span key={i} className={`shrink-0 ${l.kind === "reaction" ? "text-turquoise font-medium" : "text-foreground/75"}`}>
                <ChevronRight size={10} className="mr-0.5 inline" />
                {l.label}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ================= REPORT MODAL ================= */}
      <AnimatePresence>
        {report && (
          <motion.div
            className="fixed inset-0 z-[80] grid place-items-center bg-charcoal/60 p-4 backdrop-blur-md"
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
              className="glass-strong relative w-full max-w-2xl overflow-hidden rounded-3xl border border-border/50 p-6 shadow-elegant"
            >
              <button onClick={() => setReport(null)} className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-full border border-border/50 bg-background/50 hover:bg-foreground/10">
                <X size={14} />
              </button>
              <div className="text-[10px] font-mono uppercase tracking-widest text-turquoise">Test Report · {currentSyllabus.board}</div>
              <h2 className="mt-1 text-2xl font-semibold leading-tight" style={{ fontFamily: "var(--font-display)" }}>
                Experiment #{experiment.id} — {experiment.title}
              </h2>
              <div className="mt-5 grid gap-4 md:grid-cols-[180px_1fr]">
                <div className="rounded-2xl border border-border/40 bg-background/40 p-4 text-center">
                  <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Score</div>
                  <div className="text-4xl font-bold text-gradient" style={{ fontFamily: "var(--font-display)" }}>{report.percent}%</div>
                  <div className="mt-1 text-[13px] font-semibold">{report.grade}</div>
                  <div className="mt-1 text-[10px] text-muted-foreground">{report.band}</div>
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
              <div className="mt-6 flex justify-end gap-2">
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

function CtxHeader({ label }: { label: string }) {
  return (
    <div className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
      {label}
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
  app, selected, pourTarget, onPointerDown, onPointerMove, onPointerUp, onContextMenu,
}: {
  app: PlacedApparatus;
  selected: boolean;
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
      className={`absolute cursor-grab select-none touch-none ${selected ? "ring-2 ring-turquoise/70 ring-offset-2 ring-offset-transparent" : ""} ${pourTarget ? "ring-2 ring-aurora-red/70 animate-pulse" : ""}`}
      style={{ transform: `translate(${app.x}px, ${app.y}px)`, width: w, height: h + 4, zIndex: 10 + app.z }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onContextMenu={onContextMenu}
    >
      <div className="relative" style={{ width: w, height: h }}>
        {/* shadow */}
        <div
          className="absolute -bottom-1 left-1/2 h-2 rounded-full bg-black/30 blur-sm"
          style={{ width: w * 0.7, transform: "translateX(-50%)" }}
        />
        {/* apparatus SVG */}
        <ApparatusSVG item={app.item} className="absolute inset-0" />
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