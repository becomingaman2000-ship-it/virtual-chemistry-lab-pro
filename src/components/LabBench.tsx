import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import {
  BookOpen, ClipboardList, GraduationCap, Play, RotateCw,
  Trash2, Flame, ChevronRight, X, Search, CheckCircle2, Award, Beaker,
  TestTube, FlaskConical, Snowflake, Droplets, Waves,
} from "lucide-react";
import { CHEMICAL_DATABASE, getChemical, type ChemicalSubstance } from "@/lib/lab/dwsimChemicals";
import { COMPLETE_SYLLABUS_EXPERIMENTS, type SyllabusExperiment } from "@/lib/lab/experimentsCatalog";
import { evaluateReaction, type ContainerState, type ReactionResult } from "@/lib/lab/dwsimEngine";
import { SYLLABI } from "@/data/syllabi";
import type { Syllabus } from "@/data/syllabi";
import { EXPERIMENT_META, PDF_CATEGORY_LABELS, metaFor, fitsLevel, type PdfCategory } from "@/lib/lab/experimentMeta";

/* =========================================================================
   Types — bench state
========================================================================= */
type Mode = "manual" | "practice" | "test";

type ApparatusType =
  | "beaker" | "conical_flask" | "test_tube" | "burette"
  | "pipette" | "watch_glass" | "chromatography_tank" | "evap_dish";

interface VisualFx {
  bubbling: number;      // 0..1 gas evolution rate
  boiling: boolean;
  freezing: boolean;
  foaming: boolean;
  crystallising: boolean;
  exploding: number;     // frames left, 0 if not exploding
  hasFlame: boolean;
  flameColor: string | null;
  silverMirror: boolean;
}

interface PlacedApparatus {
  id: string;
  kind: ApparatusType;
  x: number;
  y: number;
  w: number;
  h: number;
  state: ContainerState;
  lastReaction: ReactionResult | null;
  fx: VisualFx;
}

interface Particle {
  x: number; y: number; vx: number; vy: number;
  life: number; maxLife: number;
  color: string; size: number;
  type: "bubble" | "steam" | "precipitate" | "smoke" | "spark" | "foam" | "crystal" | "flash";
}

interface LogEntry {
  ts: number;
  label: string;
  kind: "place" | "add" | "heat" | "cool" | "pour" | "observe" | "safety" | "reaction";
  experimentId?: number;
}

/* =========================================================================
   Apparatus factory
========================================================================= */
const APP_DIMS: Record<ApparatusType, { w: number; h: number; max: number; label: string }> = {
  beaker:             { w: 110, h: 120, max: 250, label: "Beaker" },
  conical_flask:      { w: 120, h: 140, max: 250, label: "Conical Flask" },
  test_tube:          { w: 44,  h: 130, max: 25,  label: "Test Tube" },
  burette:            { w: 34,  h: 220, max: 50,  label: "Burette" },
  pipette:            { w: 26,  h: 200, max: 25,  label: "Pipette" },
  watch_glass:        { w: 90,  h: 34,  max: 15,  label: "Watch Glass" },
  chromatography_tank:{ w: 150, h: 130, max: 60,  label: "Chromatography Tank" },
  evap_dish:          { w: 100, h: 46,  max: 60,  label: "Evaporating Dish" },
};

function makeApparatus(kind: ApparatusType, x: number, y: number): PlacedApparatus {
  const d = APP_DIMS[kind];
  const id = `${kind}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  return {
    id, kind, x, y, w: d.w, h: d.h,
    state: {
      id, name: d.label, type: kind as ContainerState["type"],
      maxVolume: d.max, currentVolume: 0,
      temperature: 22, pH: 7, color: "rgba(232, 240, 255, 0.15)",
      opacity: 0.2, substanceIds: {}, precipitate: null,
      bubblingGas: null, flameColor: null, isHeated: false, stirSpeed: 0,
    },
    lastReaction: null,
    fx: { bubbling: 0, boiling: false, freezing: false, foaming: false,
      crystallising: false, exploding: 0, hasFlame: false, flameColor: null, silverMirror: false },
  };
}

/* =========================================================================
   Colour utils
========================================================================= */
function parseColor(c: string): [number, number, number, number] {
  const m = c.match(/rgba?\(([^)]+)\)/);
  if (m) {
    const parts = m[1].split(",").map(s => parseFloat(s.trim()));
    return [parts[0] || 0, parts[1] || 0, parts[2] || 0, parts[3] ?? 1];
  }
  if (c.startsWith("#")) {
    const h = c.slice(1);
    const v = h.length === 3 ? h.split("").map(x => x + x).join("") : h;
    return [
      parseInt(v.slice(0, 2), 16),
      parseInt(v.slice(2, 4), 16),
      parseInt(v.slice(4, 6), 16),
      1,
    ];
  }
  return [128, 128, 128, 1];
}
function toRgba([r, g, b, a]: [number, number, number, number]) {
  return `rgba(${Math.round(r)},${Math.round(g)},${Math.round(b)},${a.toFixed(2)})`;
}
function blendColors(states: ContainerState): string {
  const ids = Object.keys(states.substanceIds);
  if (ids.length === 0) return "rgba(232, 240, 255, 0.1)";
  let r = 0, g = 0, b = 0, a = 0, total = 0;
  for (const id of ids) {
    const amt = states.substanceIds[id] || 1;
    const c = getChemical(id).color;
    const [pr, pg, pb, pa] = parseColor(c);
    r += pr * amt; g += pg * amt; b += pb * amt; a += pa * amt; total += amt;
  }
  if (!total) return "rgba(232, 240, 255, 0.1)";
  // temperature shift: hot -> warmer red tint
  const heatShift = Math.max(0, (states.temperature - 25) / 200);
  const rr = Math.min(255, r / total + heatShift * 30);
  const gg = Math.max(0, g / total - heatShift * 10);
  const bb = Math.max(0, b / total - heatShift * 20);
  return toRgba([rr, gg, bb, Math.min(0.95, Math.max(0.25, a / total))]);
}

/* =========================================================================
   Reaction evaluation wrapper
========================================================================= */
function runReactionOn(app: PlacedApparatus): ReactionResult {
  // Update volume from substances
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
    app.state.color = blendColors(app.state);
  }
  // Derive visible FX
  const solvBp = 100; // treat water solvent
  const solvFp = 0;
  app.fx.boiling = app.state.temperature >= solvBp - 5 && vol > 0;
  app.fx.freezing = app.state.temperature <= solvFp + 2 && vol > 0;
  app.fx.bubbling = res.newGas ? 1 : app.fx.boiling ? 0.6 : 0;
  app.fx.foaming = !!res.newGas && (res.message?.toLowerCase().includes("foam") || res.message?.toLowerCase().includes("saponif"));
  app.fx.crystallising = !!res.newPrecipitate && res.newPrecipitate.name.toLowerCase().includes("crystal");
  app.fx.exploding = res.isExplosive ? 60 : app.fx.exploding;
  app.fx.hasFlame = !!app.state.flameColor;
  app.fx.flameColor = app.state.flameColor;
  app.fx.silverMirror = !!app.state.hasSilverMirror;
  return res;
}

/* =========================================================================
   Main component
========================================================================= */
export function LabBench() {
  /* -------- syllabus & experiment selection -------- */
  const [syllabusId, setSyllabusId] = useState<string>(SYLLABI[0]?.id ?? "");
  const currentSyllabus = SYLLABI.find(s => s.id === syllabusId) ?? SYLLABI[0];
  const [selectedCategory, setSelectedCategory] = useState<PdfCategory | "ALL">("ALL");
  const [experimentId, setExperimentId] = useState<number>(1);
  const experiment: SyllabusExperiment =
    COMPLETE_SYLLABUS_EXPERIMENTS.find(e => e.id === experimentId) ?? COMPLETE_SYLLABUS_EXPERIMENTS[0];
  const [mode, setMode] = useState<Mode>("manual");

  const applicableExperiments = useMemo(() => {
    return COMPLETE_SYLLABUS_EXPERIMENTS.filter(e => {
      const m = metaFor(e.id);
      if (!fitsLevel(m.level, currentSyllabus.level)) return false;
      if (selectedCategory !== "ALL" && m.category !== selectedCategory) return false;
      return true;
    });
  }, [currentSyllabus.level, selectedCategory]);

  /* -------- bench state -------- */
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const [placed, setPlaced] = useState<PlacedApparatus[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedChemical, setSelectedChemical] = useState<string | null>(null);
  const [heatSelected, setHeatSelected] = useState(false);
  const particlesRef = useRef<Particle[]>([]);
  const rafRef = useRef<number>(0);
  const draggingRef = useRef<{ id: string; ox: number; oy: number } | null>(null);
  const [log, setLog] = useState<LogEntry[]>([]);
  const [message, setMessage] = useState<string>("Drop apparatus onto the bench, then add reagents.");
  const [ppeOn, setPpeOn] = useState(false);

  const pushLog = useCallback((entry: Omit<LogEntry, "ts">) => {
    setLog(l => [{ ...entry, ts: Date.now() }, ...l].slice(0, 200));
  }, []);

  /* -------- tray filters -------- */
  const [tray, setTray] = useState<"apparatus" | "chemicals">("chemicals");
  const [query, setQuery] = useState("");
  const chemicalList = useMemo(() => Object.values(CHEMICAL_DATABASE), []);
  const filteredChemicals = useMemo(() => {
    const q = query.trim().toLowerCase();
    return chemicalList.filter(c => !q || c.name.toLowerCase().includes(q) || c.formula.toLowerCase().includes(q));
  }, [chemicalList, query]);

  /* -------- canvas rendering -------- */
  useEffect(() => {
    const canvas = canvasRef.current; const wrap = wrapRef.current;
    if (!canvas || !wrap) return;

    const dpr = window.devicePixelRatio || 1;
    const resize = () => {
      const rect = wrap.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = rect.width + "px";
      canvas.style.height = rect.height + "px";
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);

    const ctx = canvas.getContext("2d")!;
    let t = 0;

    const draw = () => {
      t += 0.016;
      const W = canvas.width / dpr;
      const H = canvas.height / dpr;
      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, W, H);

      // Backdrop wall (warm plaster)
      const wall = ctx.createLinearGradient(0, 0, 0, H - 170);
      wall.addColorStop(0, "#f2ead8");
      wall.addColorStop(1, "#e8dcbe");
      ctx.fillStyle = wall;
      ctx.fillRect(0, 0, W, H - 170);

      // Faint grid tiles
      ctx.strokeStyle = "rgba(120,90,50,0.06)";
      ctx.lineWidth = 0.6;
      for (let x = 0; x < W; x += 60) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H - 170); ctx.stroke();
      }
      for (let y = 0; y < H - 170; y += 60) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
      }

      // Bench edge shadow
      const edge = ctx.createLinearGradient(0, H - 175, 0, H - 165);
      edge.addColorStop(0, "rgba(0,0,0,0)");
      edge.addColorStop(1, "rgba(0,0,0,0.25)");
      ctx.fillStyle = edge;
      ctx.fillRect(0, H - 175, W, 10);

      // Wooden benchtop
      const wood = ctx.createLinearGradient(0, H - 170, 0, H);
      wood.addColorStop(0, "#7a5a34");
      wood.addColorStop(0.35, "#69502d");
      wood.addColorStop(0.7, "#5a4426");
      wood.addColorStop(1, "#4a3820");
      ctx.fillStyle = wood;
      ctx.fillRect(0, H - 170, W, 170);

      // Wood plank seams
      ctx.strokeStyle = "rgba(20,10,0,0.35)";
      ctx.lineWidth = 1;
      const plankW = 180;
      for (let px = 0; px < W; px += plankW) {
        ctx.beginPath(); ctx.moveTo(px, H - 170); ctx.lineTo(px, H); ctx.stroke();
      }

      // Wood grain waves
      ctx.strokeStyle = "rgba(20,10,0,0.09)";
      ctx.lineWidth = 1;
      for (let i = 0; i < 22; i++) {
        const gy = H - 168 + i * 8;
        ctx.beginPath();
        ctx.moveTo(0, gy);
        for (let gx = 0; gx <= W; gx += 12) {
          ctx.lineTo(gx, gy + Math.sin(gx * 0.013 + i * 1.9) * 1.6);
        }
        ctx.stroke();
      }
      // Grain knots
      ctx.fillStyle = "rgba(30,15,0,0.12)";
      for (let k = 0; k < 6; k++) {
        const kx = (k * 173 % W);
        const ky = H - 90 + ((k * 37) % 60);
        ctx.beginPath(); ctx.ellipse(kx, ky, 14, 5, 0, 0, Math.PI * 2); ctx.fill();
      }

      // Sort placed by y for depth
      const items = [...placed].sort((a, b) => (a.y + a.h) - (b.y + b.h));
      for (const app of items) drawApparatus(ctx, app, t);

      // Particles
      const parts = particlesRef.current;
      for (const p of parts) {
        const alpha = Math.max(0, p.life / p.maxLife);
        ctx.globalAlpha = alpha;
        if (p.type === "bubble") {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.strokeStyle = "rgba(255,255,255,0.9)";
          ctx.lineWidth = 1;
          ctx.stroke();
          ctx.fillStyle = "rgba(255,255,255,0.25)";
          ctx.fill();
        } else if (p.type === "steam" || p.type === "smoke") {
          const sz = p.size * (1 + (1 - alpha) * 1.8);
          ctx.beginPath();
          ctx.arc(p.x, p.y, sz, 0, Math.PI * 2);
          ctx.fillStyle = p.type === "smoke"
            ? `rgba(70,60,55,${alpha * 0.5})`
            : `rgba(215,225,235,${alpha * 0.55})`;
          ctx.fill();
        } else if (p.type === "precipitate") {
          ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = p.color; ctx.fill();
        } else if (p.type === "foam") {
          ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255,255,255,${alpha * 0.85})`;
          ctx.fill();
          ctx.strokeStyle = "rgba(220,220,220,0.4)"; ctx.stroke();
        } else if (p.type === "crystal") {
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.vx);
          ctx.fillStyle = p.color;
          ctx.strokeStyle = "rgba(255,255,255,0.5)";
          ctx.beginPath();
          const s = p.size;
          ctx.moveTo(0, -s); ctx.lineTo(s, 0); ctx.lineTo(0, s); ctx.lineTo(-s, 0); ctx.closePath();
          ctx.fill(); ctx.stroke();
          ctx.restore();
        } else if (p.type === "spark") {
          ctx.fillStyle = p.color;
          ctx.fillRect(p.x, p.y, p.size, p.size);
        } else if (p.type === "flash") {
          const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
          grad.addColorStop(0, `rgba(255,240,160,${alpha})`);
          grad.addColorStop(0.4, `rgba(255,140,40,${alpha * 0.7})`);
          grad.addColorStop(1, "rgba(120,20,0,0)");
          ctx.fillStyle = grad;
          ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill();
        }
      }
      ctx.globalAlpha = 1;

      // Update / cull particles
      for (const p of parts) {
        p.x += p.vx; p.y += p.vy; p.life -= 1;
        if (p.type === "steam" || p.type === "smoke") p.vy -= 0.03;
        if (p.type === "bubble") p.vy = Math.min(p.vy, -0.6);
        if (p.type === "precipitate") { p.vy = Math.min(1.6, p.vy + 0.05); p.vx *= 0.98; }
        if (p.type === "crystal") { p.vy = Math.min(0.4, p.vy + 0.02); }
      }
      particlesRef.current = parts.filter(p => p.life > 0);

      // Spawn particles for active FX
      for (const app of items) spawnFx(app, t);

      ctx.restore();
      rafRef.current = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(rafRef.current); ro.disconnect(); };
  }, [placed]);

  /* ---- temperature dynamics ---- */
  useEffect(() => {
    const t = setInterval(() => {
      let changed = false;
      for (const app of placed) {
        if (app.state.isHeated && app.state.temperature < 220) {
          app.state.temperature = Math.min(220, app.state.temperature + 3);
          changed = true;
        } else if (!app.state.isHeated && app.state.temperature > 22) {
          app.state.temperature = Math.max(22, app.state.temperature - 1.5);
          changed = true;
        }
        if (app.fx.exploding > 0) { app.fx.exploding -= 1; changed = true; }
      }
      if (changed) {
        // Re-evaluate reactions if any container has substances
        for (const app of placed) {
          if (Object.keys(app.state.substanceIds).length > 0) runReactionOn(app);
        }
        setPlaced(p => [...p]);
      }
    }, 350);
    return () => clearInterval(t);
  }, [placed]);

  /* -------- apparatus rendering helpers -------- */
  function drawApparatus(ctx: CanvasRenderingContext2D, app: PlacedApparatus, time: number) {
    const { x, y, w, h, kind } = app;
    const cx = x + w / 2;
    const baseY = y + h;
    ctx.save();

    // Shadow
    ctx.fillStyle = "rgba(0,0,0,0.35)";
    ctx.beginPath();
    ctx.ellipse(cx, baseY + 3, w / 2 + 4, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Glass gradient
    const glass = ctx.createLinearGradient(x, y, x + w, y);
    glass.addColorStop(0, "rgba(180,205,235,0.22)");
    glass.addColorStop(0.3, "rgba(255,255,255,0.42)");
    glass.addColorStop(0.7, "rgba(255,255,255,0.14)");
    glass.addColorStop(1, "rgba(180,205,235,0.2)");

    const liquid = app.state.color;
    const totalVol = Object.values(app.state.substanceIds).reduce((s, v) => s + v, 0);
    const capacity = APP_DIMS[kind].max;

    const drawBody = (path: () => void) => {
      ctx.beginPath(); path();
      ctx.fillStyle = glass; ctx.fill();
      ctx.strokeStyle = "rgba(70,90,120,0.75)";
      ctx.lineWidth = 1.5; ctx.stroke();
    };

    if (kind === "beaker") {
      drawBody(() => {
        ctx.moveTo(x + 8, y + 14);
        ctx.lineTo(x + 8, baseY - 6);
        ctx.lineTo(x + w - 8, baseY - 6);
        ctx.lineTo(x + w - 8, y + 14);
      });
      // Spout
      ctx.beginPath(); ctx.moveTo(x + 8, y + 14); ctx.lineTo(x - 6, y + 20);
      ctx.strokeStyle = "rgba(70,90,120,0.7)"; ctx.stroke();
      // Rim
      ctx.beginPath(); ctx.moveTo(x - 2, y + 14); ctx.lineTo(x + w + 2, y + 14);
      ctx.lineWidth = 2.5; ctx.stroke();
      // Ticks
      for (let i = 1; i <= 4; i++) {
        const my = baseY - 12 - (i * (h - 30) / 5);
        ctx.beginPath(); ctx.moveTo(x + w - 8, my); ctx.lineTo(x + w - 20, my);
        ctx.strokeStyle = "rgba(70,90,120,0.4)"; ctx.lineWidth = 1; ctx.stroke();
      }
      // Liquid
      if (totalVol > 0) {
        const lh = Math.min((totalVol / capacity) * (h - 26), h - 26);
        const ly = baseY - 8 - lh;
        drawLiquid(ctx, x + 9, ly, w - 18, lh, liquid, time);
      }
    } else if (kind === "test_tube") {
      drawBody(() => {
        ctx.moveTo(x + 4, y + 4);
        ctx.lineTo(x + 4, baseY - 16);
        ctx.quadraticCurveTo(x + 4, baseY + 2, cx, baseY + 2);
        ctx.quadraticCurveTo(x + w - 4, baseY + 2, x + w - 4, baseY - 16);
        ctx.lineTo(x + w - 4, y + 4);
      });
      if (totalVol > 0) {
        const lh = Math.min((totalVol / capacity) * (h - 24), h - 24);
        const ly = baseY - 6 - lh;
        ctx.beginPath();
        ctx.moveTo(x + 6, ly);
        for (let lx = 0; lx <= w - 12; lx += 2) {
          ctx.lineTo(x + 6 + lx, ly + Math.sin(lx * 0.4 + time * 3) * 0.8);
        }
        ctx.lineTo(x + w - 6, baseY - 12);
        ctx.quadraticCurveTo(cx, baseY - 2, x + 6, baseY - 12);
        ctx.closePath();
        ctx.fillStyle = liquid; ctx.fill();
      }
    } else if (kind === "conical_flask") {
      const neckW = 24; const shoulderY = y + 24;
      drawBody(() => {
        ctx.moveTo(cx - neckW / 2, y + 4);
        ctx.lineTo(cx - neckW / 2, shoulderY);
        ctx.lineTo(x + 6, baseY - 8);
        ctx.lineTo(x + w - 6, baseY - 8);
        ctx.lineTo(cx + neckW / 2, shoulderY);
        ctx.lineTo(cx + neckW / 2, y + 4);
      });
      if (totalVol > 0) {
        const lh = Math.min((totalVol / capacity) * (h - 30), h - 30);
        const ly = baseY - 10 - lh;
        const taper = Math.max(0, (ly - shoulderY) / (baseY - shoulderY));
        const lw = (w - 12) * (0.3 + 0.7 * (1 - taper));
        ctx.beginPath();
        ctx.moveTo(cx - lw / 2, ly);
        ctx.lineTo(x + 8, baseY - 10);
        ctx.lineTo(x + w - 8, baseY - 10);
        ctx.lineTo(cx + lw / 2, ly);
        ctx.closePath();
        ctx.fillStyle = liquid; ctx.fill();
      }
    } else if (kind === "burette") {
      drawBody(() => {
        ctx.rect(x + 6, y + 6, w - 12, h - 30);
      });
      // Stopcock
      ctx.fillStyle = "#5a5a5a";
      ctx.fillRect(x - 4, baseY - 24, w + 8, 6);
      ctx.fillRect(cx - 2, baseY - 18, 4, 14);
      if (totalVol > 0) {
        const lh = Math.min((totalVol / capacity) * (h - 40), h - 40);
        const ly = y + h - 30 - lh;
        ctx.fillStyle = liquid;
        ctx.fillRect(x + 8, ly, w - 16, lh);
      }
    } else if (kind === "pipette") {
      drawBody(() => {
        ctx.moveTo(cx - 3, y);
        ctx.lineTo(cx - 3, y + 30);
        ctx.lineTo(x + 4, y + 40);
        ctx.lineTo(x + 4, baseY - 30);
        ctx.lineTo(cx - 1, baseY);
        ctx.lineTo(cx + 1, baseY);
        ctx.lineTo(x + w - 4, baseY - 30);
        ctx.lineTo(x + w - 4, y + 40);
        ctx.lineTo(cx + 3, y + 30);
        ctx.lineTo(cx + 3, y);
      });
    } else if (kind === "watch_glass") {
      ctx.beginPath();
      ctx.ellipse(cx, y + h - 10, w / 2, 8, 0, 0, Math.PI * 2);
      ctx.fillStyle = glass; ctx.fill();
      ctx.strokeStyle = "rgba(70,90,120,0.75)"; ctx.stroke();
      if (totalVol > 0) {
        ctx.beginPath();
        ctx.ellipse(cx, y + h - 10, w / 2 - 4, 5, 0, 0, Math.PI * 2);
        ctx.fillStyle = liquid; ctx.fill();
      }
    } else if (kind === "evap_dish") {
      ctx.beginPath();
      ctx.ellipse(cx, y + 12, w / 2, 10, 0, 0, Math.PI * 2);
      ctx.lineTo(x + w - 4, baseY - 4);
      ctx.quadraticCurveTo(cx, baseY + 4, x + 4, baseY - 4);
      ctx.closePath();
      ctx.fillStyle = glass; ctx.fill();
      ctx.strokeStyle = "rgba(70,90,120,0.75)"; ctx.stroke();
      if (totalVol > 0) {
        const lh = Math.min((totalVol / capacity) * 20, 20);
        ctx.beginPath();
        ctx.ellipse(cx, y + 14 + (18 - lh), w / 2 - 8, Math.max(2, lh), 0, 0, Math.PI * 2);
        ctx.fillStyle = liquid; ctx.fill();
      }
    } else if (kind === "chromatography_tank") {
      drawBody(() => { ctx.rect(x + 4, y + 6, w - 8, h - 12); });
      // Solvent front
      if (totalVol > 0) {
        const lh = Math.min((totalVol / capacity) * (h - 20), h - 20);
        const ly = baseY - 8 - lh;
        ctx.fillStyle = liquid;
        ctx.fillRect(x + 6, ly, w - 12, lh);
      }
      // Paper strip
      ctx.fillStyle = "rgba(250,245,220,0.85)";
      ctx.fillRect(cx - 3, y + 10, 6, h - 24);
    }

    // Precipitate deposit at bottom
    if (app.state.precipitate) {
      const c = app.state.precipitate.color;
      ctx.fillStyle = c;
      ctx.beginPath();
      ctx.ellipse(cx, baseY - 10, w / 2 - 10, 4, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // Crystals overlay
    if (app.fx.crystallising) {
      ctx.fillStyle = "rgba(255,255,255,0.85)";
      for (let i = 0; i < 6; i++) {
        const cxs = x + 12 + i * ((w - 24) / 5);
        const cys = baseY - 12 - (Math.abs(Math.sin(time * 2 + i)) * 6);
        ctx.beginPath();
        ctx.moveTo(cxs, cys - 4);
        ctx.lineTo(cxs + 3, cys); ctx.lineTo(cxs, cys + 4); ctx.lineTo(cxs - 3, cys);
        ctx.closePath(); ctx.fill();
      }
    }

    // Freeze overlay (hex lattice)
    if (app.fx.freezing) {
      ctx.globalAlpha = 0.6;
      ctx.strokeStyle = "rgba(150,220,255,0.9)";
      ctx.lineWidth = 0.8;
      for (let iy = 0; iy < h - 30; iy += 8) {
        for (let ix = 0; ix < w - 20; ix += 10) {
          ctx.beginPath();
          ctx.arc(x + 10 + ix, y + 20 + iy, 3, 0, Math.PI * 2);
          ctx.stroke();
        }
      }
      ctx.globalAlpha = 1;
    }

    // Silver mirror
    if (app.fx.silverMirror) {
      const g = ctx.createLinearGradient(x, y, x + w, y);
      g.addColorStop(0, "rgba(220,225,235,0.85)");
      g.addColorStop(0.5, "rgba(255,255,255,0.95)");
      g.addColorStop(1, "rgba(200,210,225,0.8)");
      ctx.fillStyle = g;
      ctx.fillRect(x + 8, y + 20, w - 16, h - 40);
    }

    // Heating glow
    if (app.state.isHeated) {
      const glow = ctx.createRadialGradient(cx, baseY + 4, 0, cx, baseY + 4, w * 0.7);
      glow.addColorStop(0, "rgba(255,100,0,0.75)");
      glow.addColorStop(0.5, "rgba(255,60,0,0.35)");
      glow.addColorStop(1, "rgba(255,30,0,0)");
      ctx.globalAlpha = 0.4 + Math.sin(time * 6) * 0.1;
      ctx.fillStyle = glow;
      ctx.beginPath(); ctx.ellipse(cx, baseY + 4, w * 0.7, 14, 0, 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha = 1;
      // Flame under it
      drawFlame(ctx, cx, baseY + 20, time, app.fx.flameColor || "#ffb040");
    }

    // Explosion flash
    if (app.fx.exploding > 0) {
      const p = app.fx.exploding / 60;
      const grad = ctx.createRadialGradient(cx, y + h / 2, 0, cx, y + h / 2, 120);
      grad.addColorStop(0, `rgba(255,240,180,${p})`);
      grad.addColorStop(0.4, `rgba(255,120,20,${p * 0.7})`);
      grad.addColorStop(1, "rgba(120,20,0,0)");
      ctx.fillStyle = grad;
      ctx.beginPath(); ctx.arc(cx, y + h / 2, 120, 0, Math.PI * 2); ctx.fill();
    }

    // Selection
    if (app.id === selectedId) {
      ctx.strokeStyle = "#3ddcff";
      ctx.setLineDash([6, 3]);
      ctx.lineWidth = 2;
      ctx.strokeRect(x - 6, y - 6, w + 12, h + 12);
      ctx.setLineDash([]);
    }

    // Temperature label
    if (app.state.temperature > 30 || app.state.isHeated) {
      ctx.fillStyle = "rgba(255,240,220,0.95)";
      ctx.font = "bold 11px monospace";
      ctx.textAlign = "center";
      ctx.fillText(`${app.state.temperature.toFixed(0)}°C`, cx, y - 10);
    }

    // Formula label
    const ids = Object.keys(app.state.substanceIds);
    if (ids.length > 0) {
      const label = ids.slice(0, 3).map(i => getChemical(i).formula.replace(/\([a-z]+\)/g, "")).join(" + ");
      ctx.font = "bold 10px monospace";
      const m = ctx.measureText(label);
      const lw = m.width + 10;
      ctx.fillStyle = "rgba(15,10,5,0.72)";
      roundRect(ctx, cx - lw / 2, y - 26, lw, 14, 3);
      ctx.fill();
      ctx.fillStyle = "#fff5e0"; ctx.textAlign = "center";
      ctx.fillText(label, cx, y - 16);
    }

    ctx.restore();
  }

  function drawLiquid(ctx: CanvasRenderingContext2D, lx: number, ly: number, lw: number, lh: number, color: string, time: number) {
    ctx.fillStyle = color; ctx.fillRect(lx, ly, lw, lh);
    // Surface wave
    ctx.beginPath();
    ctx.moveTo(lx, ly);
    for (let i = 0; i <= lw; i += 2) {
      ctx.lineTo(lx + i, ly + Math.sin(i * 0.15 + time * 2.6) * 1.4);
    }
    ctx.lineTo(lx + lw, ly);
    ctx.fillStyle = "rgba(255,255,255,0.14)";
    ctx.fill();
  }

  function drawFlame(ctx: CanvasRenderingContext2D, cx: number, cy: number, time: number, color: string) {
    const jitter = Math.sin(time * 12) * 3;
    // Outer
    ctx.beginPath();
    ctx.moveTo(cx - 12, cy);
    ctx.quadraticCurveTo(cx - 6 + jitter, cy - 28, cx + jitter, cy - 58);
    ctx.quadraticCurveTo(cx + 6 + jitter, cy - 28, cx + 12, cy);
    ctx.closePath();
    ctx.fillStyle = "rgba(90,140,255,0.55)"; ctx.fill();
    // Inner
    ctx.beginPath();
    ctx.moveTo(cx - 6, cy);
    ctx.quadraticCurveTo(cx - 3, cy - 20, cx + jitter * 0.5, cy - 42);
    ctx.quadraticCurveTo(cx + 3, cy - 20, cx + 6, cy);
    ctx.closePath();
    ctx.fillStyle = color; ctx.fill();
    // Core
    ctx.beginPath(); ctx.ellipse(cx, cy - 6, 3, 10, 0, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255,250,220,0.95)"; ctx.fill();
  }

  function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function spawnFx(app: PlacedApparatus, _t: number) {
    const p = particlesRef.current;
    const totalVol = Object.values(app.state.substanceIds).reduce((s, v) => s + v, 0);
    if (totalVol === 0) return;
    const cx = app.x + app.w / 2;
    const lh = Math.min((totalVol / APP_DIMS[app.kind].max) * (app.h - 26), app.h - 26);
    const ly = app.y + app.h - 8 - lh;

    if (app.fx.bubbling > 0 && Math.random() < 0.35 * app.fx.bubbling) {
      p.push({
        x: cx + (Math.random() - 0.5) * app.w * 0.4,
        y: app.y + app.h - 10 - Math.random() * lh * 0.6,
        vx: (Math.random() - 0.5) * 0.4, vy: -0.8 - Math.random() * 0.8,
        life: 60, maxLife: 60, color: "#fff", size: 2 + Math.random() * 3, type: "bubble",
      });
    }
    if (app.fx.boiling && Math.random() < 0.3) {
      p.push({
        x: cx + (Math.random() - 0.5) * 20, y: ly - 5,
        vx: (Math.random() - 0.5) * 0.4, vy: -1 - Math.random(),
        life: 90, maxLife: 90, color: "#eef", size: 3 + Math.random() * 4, type: "steam",
      });
    }
    if (app.fx.foaming && Math.random() < 0.4) {
      p.push({
        x: cx + (Math.random() - 0.5) * app.w * 0.5, y: ly + Math.random() * 4,
        vx: (Math.random() - 0.5) * 0.2, vy: -0.2,
        life: 100, maxLife: 100, color: "#fff", size: 3 + Math.random() * 3, type: "foam",
      });
    }
    if (app.fx.crystallising && Math.random() < 0.12) {
      p.push({
        x: cx + (Math.random() - 0.5) * app.w * 0.4, y: app.y + app.h - 14,
        vx: (Math.random() - 0.5) * 0.4, vy: 0,
        life: 200, maxLife: 200,
        color: app.state.precipitate?.color || "#fff",
        size: 3 + Math.random() * 3, type: "crystal",
      });
    }
    if (app.state.precipitate && Math.random() < 0.15) {
      p.push({
        x: cx + (Math.random() - 0.5) * app.w * 0.4, y: ly + Math.random() * lh * 0.3,
        vx: (Math.random() - 0.5) * 0.15, vy: 0.4 + Math.random() * 0.4,
        life: 80, maxLife: 80,
        color: app.state.precipitate.color,
        size: 1.5 + Math.random() * 2, type: "precipitate",
      });
    }
    if (app.fx.exploding > 45) {
      for (let i = 0; i < 3; i++) {
        const ang = Math.random() * Math.PI * 2;
        p.push({
          x: cx, y: app.y + app.h / 2,
          vx: Math.cos(ang) * (2 + Math.random() * 3),
          vy: Math.sin(ang) * (2 + Math.random() * 3) - 1,
          life: 40, maxLife: 40,
          color: "#ffb020", size: 2, type: "spark",
        });
      }
      p.push({
        x: cx, y: app.y + app.h / 2, vx: 0, vy: -0.5,
        life: 30, maxLife: 30, color: "", size: 80, type: "flash",
      });
    }
  }

  /* -------- bench actions -------- */
  const addApparatus = (kind: ApparatusType) => {
    const wrap = wrapRef.current; if (!wrap) return;
    const rect = wrap.getBoundingClientRect();
    const d = APP_DIMS[kind];
    const x = 40 + placed.length * 30 + Math.random() * 40;
    const y = rect.height - 200 - d.h;
    const app = makeApparatus(kind, Math.min(x, rect.width - d.w - 40), Math.max(20, y));
    setPlaced(p => [...p, app]);
    setSelectedId(app.id);
    pushLog({ kind: "place", label: `Placed ${d.label}` });
  };

  const clearBench = () => {
    setPlaced([]); setSelectedId(null); particlesRef.current = [];
    setMessage("Bench cleared. Drop apparatus to start again.");
  };

  const removeSelected = () => {
    if (!selectedId) return;
    setPlaced(p => p.filter(a => a.id !== selectedId)); setSelectedId(null);
  };

  const addChemicalToSelected = (chem: ChemicalSubstance) => {
    if (!selectedId) { setMessage("Click an apparatus on the bench first, then add reagents."); return; }
    const app = placed.find(a => a.id === selectedId); if (!app) return;
    app.state.substanceIds[chem.id] = (app.state.substanceIds[chem.id] || 0) + 5;
    const res = runReactionOn(app);
    app.lastReaction = res;
    if (res.message) setMessage(res.message);
    pushLog({
      kind: res.successExperimentId ? "reaction" : "add",
      label: res.successExperimentId
        ? `Added ${chem.name} · ✔ ${res.message}`
        : `Added ${chem.name} to ${APP_DIMS[app.kind].label}`,
      experimentId: res.successExperimentId,
    });
    setPlaced(p => [...p]);
  };

  const toggleHeatSelected = () => {
    if (!selectedId) return;
    const app = placed.find(a => a.id === selectedId); if (!app) return;
    app.state.isHeated = !app.state.isHeated;
    setHeatSelected(app.state.isHeated);
    if (Object.keys(app.state.substanceIds).length > 0) runReactionOn(app);
    pushLog({ kind: app.state.isHeated ? "heat" : "cool", label: `${app.state.isHeated ? "Heating" : "Removed heat from"} ${APP_DIMS[app.kind].label}` });
    setPlaced(p => [...p]);
  };

  const observeSelected = () => {
    if (!selectedId) return;
    const app = placed.find(a => a.id === selectedId); if (!app) return;
    const obs = app.lastReaction?.message || `Volume ${app.state.currentVolume.toFixed(1)} ml, T ${app.state.temperature.toFixed(1)}°C, pH ${app.state.pH.toFixed(2)}.`;
    pushLog({ kind: "observe", label: `Observed: ${obs}` });
    setMessage(obs);
  };

  const emptySelected = () => {
    if (!selectedId) return;
    const app = placed.find(a => a.id === selectedId); if (!app) return;
    app.state.substanceIds = {}; app.state.precipitate = null; app.state.bubblingGas = null;
    app.state.flameColor = null; app.state.color = "rgba(232, 240, 255, 0.15)";
    app.state.pH = 7; app.state.currentVolume = 0;
    app.fx = { bubbling: 0, boiling: false, freezing: false, foaming: false,
      crystallising: false, exploding: 0, hasFlame: false, flameColor: null, silverMirror: false };
    app.lastReaction = null;
    setPlaced(p => [...p]);
  };

  /* -------- mouse interaction on canvas -------- */
  const onCanvasMouseDown = (e: React.MouseEvent) => {
    const wrap = wrapRef.current; if (!wrap) return;
    const rect = wrap.getBoundingClientRect();
    const mx = e.clientX - rect.left, my = e.clientY - rect.top;
    // find topmost hit
    for (let i = placed.length - 1; i >= 0; i--) {
      const app = placed[i];
      if (mx >= app.x && mx <= app.x + app.w && my >= app.y && my <= app.y + app.h) {
        setSelectedId(app.id);
        setHeatSelected(app.state.isHeated);
        draggingRef.current = { id: app.id, ox: mx - app.x, oy: my - app.y };
        return;
      }
    }
    setSelectedId(null);
  };
  const onCanvasMouseMove = (e: React.MouseEvent) => {
    const drag = draggingRef.current; if (!drag) return;
    const wrap = wrapRef.current; if (!wrap) return;
    const rect = wrap.getBoundingClientRect();
    const mx = e.clientX - rect.left, my = e.clientY - rect.top;
    const app = placed.find(a => a.id === drag.id); if (!app) return;
    app.x = Math.min(rect.width - app.w, Math.max(0, mx - drag.ox));
    app.y = Math.min(rect.height - app.h, Math.max(0, my - drag.oy));
    setPlaced(p => [...p]);
  };
  const onCanvasMouseUp = () => { draggingRef.current = null; };

  /* -------- marking (test mode) -------- */
  const [testResult, setTestResult] = useState<null | { total: number; matched: boolean; observed: string[]; grade: string; band: string }>(null);
  const runTestScore = () => {
    const observed = log.filter(l => l.kind === "reaction" || l.kind === "observe").map(l => l.label);
    const matched = log.some(l => l.experimentId === experimentId);
    const weights = currentSyllabus.weights;
    const raw =
      (log.filter(l => l.kind === "add").length * (weights.add ?? 1) * 4) +
      (log.filter(l => l.kind === "heat").length * (weights.heat ?? 1) * 6) +
      (log.filter(l => l.kind === "observe").length * (weights.observe ?? 1) * 5) +
      (log.filter(l => l.kind === "reaction").length * 10) +
      (ppeOn ? (weights.safety ?? 1) * 8 : 0);
    const total = Math.min(100, Math.round(raw + (matched ? 25 : 0)));
    const band = currentSyllabus.grades.find(g => total >= g.min) ?? currentSyllabus.grades[currentSyllabus.grades.length - 1];
    setTestResult({ total, matched, observed, grade: band.grade, band: band.descriptor });
  };

  /* =========================================================================
     UI
  ========================================================================= */
  const meta = metaFor(experimentId);
  const applicableChemicals = useMemo(() => {
    return chemicalList.filter(c => experiment.requiredChemicalIds.includes(c.id));
  }, [chemicalList, experiment.requiredChemicalIds]);

  return (
    <div className="mx-auto max-w-[1600px] px-3 pb-8 pt-4">
      {/* Top bar: syllabus + mode + experiment */}
      <div className="glass mb-3 rounded-3xl p-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="mr-2">
            <div className="text-[10px] font-mono uppercase tracking-widest text-turquoise">Virtual Lab</div>
            <div className="text-base font-semibold" style={{ fontFamily: "var(--font-display)" }}>
              DWSIM-verified · 115 experiments · 13 categories
            </div>
          </div>

          {/* Mode toggle */}
          <div className="flex gap-1">
            {[
              { id: "manual", label: "Manual", icon: BookOpen },
              { id: "practice", label: "Practice", icon: FlaskConical },
              { id: "test", label: "Test", icon: ClipboardList },
            ].map(({ id, label, icon: Icon }) => (
              <button key={id} onClick={() => setMode(id as Mode)}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition ${mode === id ? "bg-navy text-peach shadow dark:bg-turquoise dark:text-charcoal" : "border border-border/60 text-foreground/80 hover:bg-foreground/5"}`}>
                <Icon size={13} /> {label}
              </button>
            ))}
          </div>

          <div className="ml-auto flex flex-wrap items-center gap-2">
            <label className="text-[10px] uppercase tracking-widest text-muted-foreground">Syllabus</label>
            <select value={syllabusId} onChange={(e) => setSyllabusId(e.target.value)}
              className="rounded-full border border-border/60 bg-background/60 px-3 py-1.5 text-xs max-w-[260px] truncate">
              {SYLLABI.map((s: Syllabus) => (
                <option key={s.id} value={s.id}>
                  {s.board} · {s.level} · {s.country}
                </option>
              ))}
            </select>

            <label className="text-[10px] uppercase tracking-widest text-muted-foreground">Experiment</label>
            <select value={experimentId} onChange={(e) => setExperimentId(Number(e.target.value))}
              className="rounded-full border border-border/60 bg-background/60 px-3 py-1.5 text-xs max-w-[300px] truncate">
              {applicableExperiments.map(e => (
                <option key={e.id} value={e.id}>
                  {String(e.id).padStart(3, "0")} · {e.title}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="grid gap-3 lg:grid-cols-[280px_1fr_340px]">
        {/* ================= LEFT: categories + experiment browser ================= */}
        <aside className="glass rounded-3xl p-3 max-h-[820px] overflow-hidden flex flex-col">
          <div className="mb-2 text-xs font-semibold text-foreground/90">
            Categories · {currentSyllabus.level}
          </div>
          <div className="flex flex-wrap gap-1 mb-3">
            <button onClick={() => setSelectedCategory("ALL")}
              className={`rounded-full px-2 py-1 text-[10px] font-medium ${selectedCategory === "ALL" ? "bg-navy text-peach dark:bg-turquoise dark:text-charcoal" : "border border-border/60 text-foreground/70 hover:bg-foreground/5"}`}>
              All
            </button>
            {(Object.keys(PDF_CATEGORY_LABELS) as PdfCategory[]).map(c => (
              <button key={c} onClick={() => setSelectedCategory(c)}
                title={PDF_CATEGORY_LABELS[c]}
                className={`rounded-full px-2 py-1 text-[10px] font-mono ${selectedCategory === c ? "bg-navy text-peach dark:bg-turquoise dark:text-charcoal" : "border border-border/60 text-foreground/70 hover:bg-foreground/5"}`}>
                {c}
              </button>
            ))}
          </div>
          <div className="text-[10px] text-muted-foreground mb-2">
            {applicableExperiments.length} experiment{applicableExperiments.length === 1 ? "" : "s"} available under {currentSyllabus.board}
          </div>
          <div className="flex-1 overflow-y-auto pr-1 space-y-1">
            {applicableExperiments.map(e => {
              const m = metaFor(e.id);
              const active = e.id === experimentId;
              return (
                <button key={e.id} onClick={() => setExperimentId(e.id)}
                  className={`w-full rounded-xl border p-2 text-left transition ${active ? "border-turquoise/70 bg-turquoise/10" : "border-border/50 bg-background/40 hover:border-turquoise/40"}`}>
                  <div className="flex items-center gap-2">
                    <span className="rounded-md bg-foreground/10 px-1.5 py-0.5 text-[9px] font-mono">{m.category}·{String(e.id).padStart(3, "0")}</span>
                    <span className="text-[10px] text-muted-foreground truncate">{m.level}</span>
                  </div>
                  <div className="mt-0.5 text-[11px] font-medium leading-tight">{e.title}</div>
                </button>
              );
            })}
          </div>
        </aside>

        {/* ================= CENTER: bench canvas ================= */}
        <section className="glass rounded-3xl overflow-hidden relative">
          {/* Toolbar */}
          <div className="absolute inset-x-3 top-3 z-20 flex flex-wrap items-center gap-2">
            <div className="rounded-full border border-border/60 bg-background/85 px-3 py-1.5 text-[11px] font-medium">
              {message}
            </div>
            <div className="ml-auto flex flex-wrap gap-1">
              <button title="Toggle heat on selected" onClick={toggleHeatSelected} disabled={!selectedId}
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1.5 text-[11px] font-medium disabled:opacity-40 ${heatSelected ? "bg-orange-500 text-white" : "border border-border/60 bg-background/80"}`}>
                <Flame size={12} /> Heat
              </button>
              <button title="Empty selected" onClick={emptySelected} disabled={!selectedId}
                className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-background/80 px-2.5 py-1.5 text-[11px] disabled:opacity-40">
                <Droplets size={12} /> Empty
              </button>
              <button title="Observe" onClick={observeSelected} disabled={!selectedId}
                className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-background/80 px-2.5 py-1.5 text-[11px] disabled:opacity-40">
                <CheckCircle2 size={12} /> Observe
              </button>
              <button title="Remove selected" onClick={removeSelected} disabled={!selectedId}
                className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-background/80 px-2.5 py-1.5 text-[11px] disabled:opacity-40">
                <X size={12} /> Remove
              </button>
              <button title="Clear bench" onClick={clearBench}
                className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-background/80 px-2.5 py-1.5 text-[11px]">
                <RotateCw size={12} /> Reset
              </button>
            </div>
          </div>

          <div ref={wrapRef} className="relative h-[720px] w-full">
            <canvas ref={canvasRef}
              className="absolute inset-0 h-full w-full cursor-crosshair"
              onMouseDown={onCanvasMouseDown}
              onMouseMove={onCanvasMouseMove}
              onMouseUp={onCanvasMouseUp}
              onMouseLeave={onCanvasMouseUp}
            />
          </div>

          {/* Apparatus tray */}
          <div className="absolute inset-x-3 bottom-3 z-20 flex flex-wrap items-center gap-1 rounded-2xl border border-border/60 bg-background/85 px-3 py-2 text-[11px]">
            <Beaker size={13} className="text-turquoise" />
            {(Object.keys(APP_DIMS) as ApparatusType[]).map(k => (
              <button key={k} onClick={() => addApparatus(k)}
                className="rounded-full border border-border/60 bg-background/80 px-2.5 py-1 text-[11px] hover:bg-turquoise/20">
                + {APP_DIMS[k].label}
              </button>
            ))}
            <div className="ml-auto flex items-center gap-1">
              <label className="inline-flex items-center gap-1 text-[11px]">
                <input type="checkbox" checked={ppeOn} onChange={(e) => { setPpeOn(e.target.checked); if (e.target.checked) pushLog({ kind: "safety", label: "PPE: goggles + lab coat on" }); }} />
                <span>PPE on</span>
              </label>
            </div>
          </div>
        </section>

        {/* ================= RIGHT: brief / reagents / marking ================= */}
        <aside className="glass rounded-3xl p-3 max-h-[820px] overflow-y-auto space-y-3">
          {/* Experiment brief */}
          <div>
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
              {PDF_CATEGORY_LABELS[meta.category]} · #{experiment.id}
            </div>
            <h3 className="text-sm font-semibold leading-snug" style={{ fontFamily: "var(--font-display)" }}>
              {experiment.title}
            </h3>
            <p className="mt-1 text-[11px] text-muted-foreground">{experiment.objective}</p>
          </div>

          <div>
            <div className="text-[10px] font-semibold uppercase tracking-widest text-turquoise">Procedure</div>
            <ol className="mt-1 space-y-1 text-[11px] text-foreground/80">
              {experiment.steps.map((s, i) => (
                <li key={i} className="flex gap-1.5">
                  <span className="mt-0.5 inline-flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-turquoise/20 text-[9px] font-bold">{i + 1}</span>
                  <span className="leading-snug">{s}</span>
                </li>
              ))}
            </ol>
          </div>

          <div>
            <div className="text-[10px] font-semibold uppercase tracking-widest text-turquoise">Expected Result</div>
            <p className="mt-1 text-[11px] text-foreground/80">{experiment.expectedResult}</p>
          </div>

          <div className="rounded-xl border border-border/50 bg-background/50 p-2">
            <div className="text-[10px] font-semibold uppercase tracking-widest text-purple">Verified Equation</div>
            <div className="mt-0.5 font-mono text-[10px] leading-snug text-foreground/85">
              {experiment.theoreticalEquation}
            </div>
            <div className="mt-1 text-[10px] text-muted-foreground">
              DWSIM · {experiment.dwsimProof.reactionType}
              {experiment.dwsimProof.gibbsEnergy ? ` · ΔG ${experiment.dwsimProof.gibbsEnergy}` : ""}
              {experiment.dwsimProof.equilibriumConstant ? ` · K = ${experiment.dwsimProof.equilibriumConstant}` : ""}
            </div>
          </div>

          {/* Required reagents shortcut */}
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-widest text-turquoise">Required Reagents</div>
            <div className="mt-1 grid grid-cols-1 gap-1">
              {applicableChemicals.map(c => (
                <button key={c.id} onClick={() => addChemicalToSelected(c)}
                  className="flex items-center gap-2 rounded-lg border border-border/50 bg-background/60 p-1.5 text-left hover:bg-turquoise/10">
                  <span className="h-4 w-4 flex-shrink-0 rounded-full border border-border/50" style={{ background: c.color }} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[11px] font-medium">{c.name}</span>
                    <span className="block truncate text-[9px] text-muted-foreground">{c.formula}</span>
                  </span>
                </button>
              ))}
              {applicableChemicals.length === 0 && (
                <p className="text-[10px] text-muted-foreground">This experiment uses only apparatus + observation.</p>
              )}
            </div>
          </div>

          {/* Chemicals browser (all) */}
          <div>
            <div className="mb-1 flex items-center gap-1 rounded-full border border-border/50 bg-background/40 px-2 py-1">
              <Search size={11} className="text-muted-foreground" />
              <input value={query} onChange={(e) => setQuery(e.target.value)}
                placeholder="Search all reagents…"
                className="w-full bg-transparent text-[11px] outline-none placeholder:text-muted-foreground" />
            </div>
            <div className="max-h-48 overflow-y-auto grid grid-cols-1 gap-0.5">
              {filteredChemicals.map(c => (
                <button key={c.id} onClick={() => addChemicalToSelected(c)}
                  className="flex items-center gap-2 rounded-md p-1 text-left hover:bg-foreground/5">
                  <span className="h-3 w-3 flex-shrink-0 rounded-full border border-border/50" style={{ background: c.color }} />
                  <span className="text-[10px] truncate">{c.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Test mode marking */}
          {mode === "test" && (
            <div className="rounded-xl border border-turquoise/40 bg-turquoise/5 p-2">
              <div className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-widest text-turquoise">
                <Award size={11} /> Test — {currentSyllabus.board}
              </div>
              <p className="mt-1 text-[10px] text-muted-foreground">
                Perform the procedure. Marking uses the {currentSyllabus.board} weights + grade bands.
              </p>
              <button onClick={runTestScore}
                className="mt-2 inline-flex items-center gap-1 rounded-full bg-navy px-3 py-1 text-[11px] font-medium text-peach dark:bg-turquoise dark:text-charcoal">
                <Play size={11} /> Score my attempt
              </button>
              {testResult && (
                <div className="mt-2 rounded-lg border border-border/50 bg-background/70 p-2 text-[11px]">
                  <div>Score: <strong>{testResult.total}%</strong></div>
                  <div>Grade: <strong>{testResult.grade}</strong> — {testResult.band}</div>
                  <div className="mt-1 text-[10px] text-muted-foreground">
                    Match with expected DWSIM outcome: {testResult.matched ? "✔" : "✘"}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Log */}
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Action Log</div>
            <div className="mt-1 max-h-40 overflow-y-auto space-y-0.5 text-[10px]">
              {log.length === 0 && <p className="text-muted-foreground">Nothing yet.</p>}
              {log.map((l, i) => (
                <div key={i} className={`flex gap-1 ${l.kind === "reaction" ? "text-turquoise" : "text-foreground/80"}`}>
                  <ChevronRight size={10} className="mt-0.5 flex-shrink-0" />
                  <span>{l.label}</span>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default LabBench;