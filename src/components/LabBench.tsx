import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import Matter from "matter-js";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen, ClipboardList, FlaskConical, GraduationCap, Play, RotateCw,
  Trash2, Flame, Snowflake, Droplets, Wind, ChevronRight, ChevronLeft,
  CheckCircle2, XCircle, Award, X, Search, Info, Beaker, TestTube,
} from "lucide-react";
import { APPARATUS, type ApparatusItem } from "@/data/apparatus";
import { CHEMICALS, type Chemical } from "@/data/chemicals";
import { EXPERIMENTS, type Experiment, type ActionKind, type StepAction } from "@/data/experiments";
import { ApparatusSVG } from "./ApparatusSVG";

/* =====================================================================
   Types
===================================================================== */
type Mode = "tutorial" | "manual" | "practice" | "test";

interface Placed {
  id: string;
  item: ApparatusItem;
  body: Matter.Body;
  contents: string[];      // chemical ids inside
  heated: boolean;
  temperature: number;     // °C
  stirred: boolean;
}

interface LogEntry extends StepAction {
  ts: number;
  label: string;
}

/* =====================================================================
   Small helpers
===================================================================== */
const chemById = (id: string) => CHEMICALS.find((c) => c.id === id);
const appById = (id: string) => APPARATUS.find((a) => a.id === id);

function blendColors(ids: string[]): string {
  const cols = ids.map((i) => chemById(i)?.color).filter(Boolean) as string[];
  if (cols.length === 0) return "#7BD3D1";
  if (cols.length === 1) return cols[0];
  // simple average blend
  const toRgb = (h: string) => [1, 3, 5].map((k) => parseInt(h.slice(k, k + 2), 16));
  const avg = cols.reduce((a, c) => a.map((v, i) => v + toRgb(c)[i]), [0, 0, 0]).map((v) => Math.round(v / cols.length));
  return "#" + avg.map((v) => v.toString(16).padStart(2, "0")).join("");
}

/* =====================================================================
   Main component
===================================================================== */
export function LabBench() {
  /* ---------- mode + experiment selection ---------- */
  const [mode, setMode] = useState<Mode>("tutorial");
  const [experiment, setExperiment] = useState<Experiment>(EXPERIMENTS[0]);
  const [manualStep, setManualStep] = useState(0);
  const [tutorialStep, setTutorialStep] = useState(0);
  const [testRunning, setTestRunning] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);

  /* ---------- bench state ---------- */
  const sceneRef = useRef<HTMLDivElement | null>(null);
  const engineRef = useRef<Matter.Engine | null>(null);
  const renderRef = useRef<Matter.Render | null>(null);
  const runnerRef = useRef<Matter.Runner | null>(null);
  const placedRef = useRef<Placed[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [, force] = useState(0);
  const rerender = () => force((n) => n + 1);

  /* ---------- tray filters ---------- */
  const [tray, setTray] = useState<"apparatus" | "chemicals">("apparatus");
  const [query, setQuery] = useState("");
  const [pouring, setPouring] = useState<string | null>(null); // placed id of source when in pour-mode

  /* ---------- action log ---------- */
  const [log, setLog] = useState<LogEntry[]>([]);
  const pushLog = useCallback((entry: Omit<LogEntry, "ts" | "label"> & { label?: string }) => {
    const label = entry.label ?? describe(entry);
    setLog((L) => [...L, { ...entry, label, ts: Date.now(), marks: entry.marks ?? 0, hint: entry.hint ?? "" } as LogEntry]);
  }, []);

  /* =====================================================================
     Physics setup
  ===================================================================== */
  useEffect(() => {
    if (!sceneRef.current) return;
    const el = sceneRef.current;
    const rect = el.getBoundingClientRect();
    const w = rect.width, h = rect.height;
    const engine = Matter.Engine.create({ gravity: { x: 0, y: 1, scale: 0.0011 } });
    const render = Matter.Render.create({
      element: el, engine,
      options: { width: w, height: h, wireframes: false, background: "transparent", pixelRatio: window.devicePixelRatio || 1 },
    });
    const runner = Matter.Runner.create();
    const wallOpts = { isStatic: true, render: { visible: false } } as const;
    const floor = Matter.Bodies.rectangle(w / 2, h - 8, w, 20, { ...wallOpts, label: "floor" });
    const left = Matter.Bodies.rectangle(-10, h / 2, 20, h, wallOpts);
    const right = Matter.Bodies.rectangle(w + 10, h / 2, 20, h, wallOpts);
    const ceil = Matter.Bodies.rectangle(w / 2, -10, w, 20, wallOpts);
    Matter.World.add(engine.world, [floor, left, right, ceil]);

    const mouse = Matter.Mouse.create(render.canvas);
    const mc = Matter.MouseConstraint.create(engine, { mouse, constraint: { stiffness: 0.2, render: { visible: false } } });
    Matter.World.add(engine.world, mc);
    render.mouse = mouse;

    Matter.Events.on(mc, "mouseup", () => {
      const b = mc.body; if (!b) return;
      const p = placedRef.current.find((x) => x.body.id === b.id);
      if (p) setSelectedId(p.id);
    });

    Matter.Render.run(render);
    Matter.Runner.run(runner, engine);
    Matter.Events.on(engine, "afterUpdate", rerender);

    engineRef.current = engine; renderRef.current = render; runnerRef.current = runner;

    const ro = new ResizeObserver(() => {
      const r = el.getBoundingClientRect();
      render.canvas.width = r.width * (window.devicePixelRatio || 1);
      render.canvas.height = r.height * (window.devicePixelRatio || 1);
      render.canvas.style.width = r.width + "px";
      render.canvas.style.height = r.height + "px";
      render.options.width = r.width; render.options.height = r.height;
      Matter.Body.setPosition(floor, { x: r.width / 2, y: r.height - 8 });
      Matter.Body.setPosition(right, { x: r.width + 10, y: r.height / 2 });
    });
    ro.observe(el);

    // keyboard: R rotate, Delete remove
    const onKey = (e: KeyboardEvent) => {
      if (!selectedId) return;
      const p = placedRef.current.find((x) => x.id === selectedId); if (!p) return;
      if (e.key === "r" || e.key === "R") {
        Matter.Body.rotate(p.body, Math.PI / 12);
      } else if (e.key === "Delete" || e.key === "Backspace") {
        removeOne(selectedId);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      ro.disconnect();
      Matter.Render.stop(render); Matter.Runner.stop(runner);
      Matter.World.clear(engine.world, false); Matter.Engine.clear(engine);
      render.canvas.remove(); render.textures = {};
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // temperature dynamics for heated / non-heated items
  useEffect(() => {
    const t = setInterval(() => {
      let dirty = false;
      placedRef.current.forEach((p) => {
        if (p.heated && p.temperature < 400) { p.temperature = Math.min(400, p.temperature + 4); dirty = true; }
        else if (!p.heated && p.temperature > 20) { p.temperature = Math.max(20, p.temperature - 2); dirty = true; }
      });
      if (dirty) rerender();
    }, 250);
    return () => clearInterval(t);
  }, []);

  /* =====================================================================
     Bench actions
  ===================================================================== */
  const drop = (item: ApparatusItem, cx: number, cy: number) => {
    const engine = engineRef.current, el = sceneRef.current; if (!engine || !el) return;
    const r = el.getBoundingClientRect();
    const x = Math.min(Math.max(cx - r.left, item.width / 2), r.width - item.width / 2);
    const y = Math.min(Math.max(cy - r.top, item.height / 2), r.height - item.height / 2);
    const body = Matter.Bodies.rectangle(x, y, item.width, item.height, {
      mass: item.mass / 100, friction: item.friction, restitution: item.restitution,
      chamfer: { radius: 6 }, render: { visible: false }, label: item.id,
    });
    Matter.World.add(engine.world, body);
    const p: Placed = { id: `${item.id}-${Date.now()}`, item, body, contents: [], heated: false, temperature: 22, stirred: false };
    placedRef.current = [...placedRef.current, p];
    pushLog({ kind: "place", apparatus: item.id, marks: 0, hint: "", label: `Placed ${item.name}` });
    rerender();
  };

  const removeOne = (id: string) => {
    const engine = engineRef.current; if (!engine) return;
    const p = placedRef.current.find((x) => x.id === id); if (!p) return;
    Matter.World.remove(engine.world, p.body);
    placedRef.current = placedRef.current.filter((x) => x.id !== id);
    if (selectedId === id) setSelectedId(null);
    rerender();
  };

  const clearBench = () => {
    const engine = engineRef.current; if (!engine) return;
    placedRef.current.forEach((p) => Matter.World.remove(engine.world, p.body));
    placedRef.current = [];
    setSelectedId(null); rerender();
  };

  const addChemical = (chem: Chemical, placedId: string) => {
    const p = placedRef.current.find((x) => x.id === placedId); if (!p) return;
    p.contents = [...p.contents, chem.id];
    pushLog({ kind: "add", apparatus: p.item.id, chemical: chem.id, marks: 0, hint: "", label: `Added ${chem.name} to ${p.item.name}` });
    rerender();
  };

  const toggleHeat = (id: string) => {
    const p = placedRef.current.find((x) => x.id === id); if (!p) return;
    p.heated = !p.heated;
    pushLog({ kind: p.heated ? "heat" : "cool", apparatus: p.item.id, marks: 0, hint: "",
      label: `${p.heated ? "Started heating" : "Removed from heat"} ${p.item.name}` });
    rerender();
  };

  const stir = (id: string) => {
    const p = placedRef.current.find((x) => x.id === id); if (!p) return;
    p.stirred = true;
    pushLog({ kind: "stir", apparatus: p.item.id, marks: 0, hint: "", label: `Stirred ${p.item.name}` });
    rerender();
  };

  const filterInto = (id: string) => {
    const p = placedRef.current.find((x) => x.id === id); if (!p) return;
    pushLog({ kind: "filter", apparatus: p.item.id, marks: 0, hint: "", label: `Filtered through ${p.item.name}` });
  };

  const pour = (fromId: string, toId: string) => {
    if (fromId === toId) return;
    const from = placedRef.current.find((x) => x.id === fromId);
    const to = placedRef.current.find((x) => x.id === toId);
    if (!from || !to) return;
    if (from.contents.length === 0) { setPouring(null); return; }
    to.contents = [...to.contents, ...from.contents];
    pushLog({ kind: "pour", apparatus: from.item.id, target: to.item.id, marks: 0, hint: "",
      label: `Poured ${from.item.name} into ${to.item.name}` });
    from.contents = []; setPouring(null); rerender();
  };

  const observe = (obs: string) => {
    pushLog({ kind: "observe", value: obs, marks: 0, hint: "", label: `Observed: ${obs}` });
  };
  const measure = (what: string) => {
    pushLog({ kind: "measure", value: what, marks: 0, hint: "", label: `Measured: ${what}` });
  };
  const donPPE = () => {
    pushLog({ kind: "safety", marks: 0, hint: "", label: "Put on goggles + lab coat" });
  };

  /* =====================================================================
     Marking (Test mode)
  ===================================================================== */
  const marking = useMemo(() => markLog(log, experiment), [log, experiment]);

  const startTest = () => {
    clearBench(); setLog([]); setTestRunning(true); setReportOpen(false);
  };
  const submitTest = () => { setTestRunning(false); setReportOpen(true); };

  /* =====================================================================
     Rendering helpers
  ===================================================================== */
  const filteredApparatus = useMemo(() => {
    const q = query.trim().toLowerCase();
    return APPARATUS.filter((a) => !q || a.name.toLowerCase().includes(q));
  }, [query]);
  const filteredChemicals = useMemo(() => {
    const q = query.trim().toLowerCase();
    return CHEMICALS.filter((c) => !q || c.name.toLowerCase().includes(q) || c.formula.toLowerCase().includes(q));
  }, [query]);

  const selected = placedRef.current.find((p) => p.id === selectedId);

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-6">
      {/* ============== Mode + Experiment header ============== */}
      <div className="glass mb-4 rounded-3xl p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="mr-2">
            <div className="text-xs font-mono uppercase tracking-widest text-turquoise">Piece 4</div>
            <div className="text-lg font-semibold" style={{ fontFamily: "var(--font-display)" }}>Virtual Lab Bench</div>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {[
              { id: "tutorial", label: "Tutorial", icon: GraduationCap },
              { id: "manual", label: "Manual", icon: BookOpen },
              { id: "practice", label: "Practice", icon: FlaskConical },
              { id: "test", label: "Test", icon: ClipboardList },
            ].map(({ id, label, icon: Icon }) => (
              <button key={id}
                onClick={() => { setMode(id as Mode); setReportOpen(false); }}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition ${mode === id ? "bg-navy text-peach shadow dark:bg-turquoise dark:text-charcoal" : "border border-border/60 text-foreground/80 hover:bg-foreground/5"}`}>
                <Icon size={13} /> {label}
              </button>
            ))}
          </div>
          <div className="ml-auto flex items-center gap-2">
            <label className="text-xs text-muted-foreground">Experiment</label>
            <select
              value={experiment.id}
              onChange={(e) => { const x = EXPERIMENTS.find((p) => p.id === e.target.value)!; setExperiment(x); setManualStep(0); setLog([]); }}
              className="rounded-full border border-border/60 bg-background/60 px-3 py-1.5 text-xs">
              {EXPERIMENTS.map((e) => <option key={e.id} value={e.id}>{e.title}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[260px_1fr_320px]">
        {/* ================= LEFT: tray ================= */}
        <aside className="glass rounded-3xl p-3">
          <div className="mb-2 grid grid-cols-2 gap-1 rounded-full bg-background/40 p-1 text-xs">
            <button onClick={() => setTray("apparatus")}
              className={`rounded-full py-1.5 transition ${tray === "apparatus" ? "bg-navy text-peach dark:bg-turquoise dark:text-charcoal" : "text-foreground/70"}`}>
              <Beaker size={12} className="mx-auto" /> Apparatus
            </button>
            <button onClick={() => setTray("chemicals")}
              className={`rounded-full py-1.5 transition ${tray === "chemicals" ? "bg-navy text-peach dark:bg-turquoise dark:text-charcoal" : "text-foreground/70"}`}>
              <TestTube size={12} className="mx-auto" /> Reagents
            </button>
          </div>
          <div className="mb-2 flex items-center gap-2 rounded-full border border-border/60 bg-background/40 px-3 py-1.5">
            <Search size={12} className="text-muted-foreground" />
            <input value={query} onChange={(e) => setQuery(e.target.value)}
              placeholder="Search…"
              className="w-full bg-transparent text-xs outline-none placeholder:text-muted-foreground" />
          </div>

          {tray === "apparatus" ? (
            <div className="grid max-h-[560px] grid-cols-2 gap-2 overflow-y-auto pr-1">
              {filteredApparatus.map((a) => (
                <div key={a.id} draggable
                  onDragStart={(e) => e.dataTransfer.setData("app/id", a.id)}
                  className="group flex cursor-grab flex-col items-center gap-1 rounded-2xl border border-border/60 bg-background/40 p-2 transition hover:-translate-y-0.5 hover:border-turquoise/60"
                  title={a.name}>
                  <div className="flex h-[70px] w-full items-end justify-center">
                    <ApparatusSVG item={{ ...a, width: Math.min(a.width, 60), height: Math.min(a.height, 68) }} />
                  </div>
                  <div className="w-full truncate text-center text-[10px] text-foreground/80">{a.name}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid max-h-[560px] grid-cols-1 gap-1.5 overflow-y-auto pr-1">
              {filteredChemicals.map((c) => (
                <button key={c.id}
                  onClick={() => {
                    if (!selectedId) return alert("Select an apparatus on the bench first (click it).");
                    addChemical(c, selectedId);
                  }}
                  className="flex items-center gap-2 rounded-xl border border-border/60 bg-background/40 p-2 text-left transition hover:bg-foreground/5">
                  <span className="h-5 w-5 flex-shrink-0 rounded-full border border-border/60" style={{ background: c.color }} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-xs font-medium">{c.name}</span>
                    <span className="block truncate text-[10px] text-muted-foreground">{c.formula} · {c.phase}</span>
                  </span>
                </button>
              ))}
              <p className="mt-2 text-[10px] text-muted-foreground">Select an item on the bench, then click a reagent to add it.</p>
            </div>
          )}
        </aside>

        {/* ================= CENTER: bench ================= */}
        <div className="glass relative overflow-hidden rounded-3xl">
          <div className="absolute inset-x-3 top-3 z-20 flex flex-wrap items-center gap-2">
            <div className="rounded-full border border-border/60 bg-background/70 px-3 py-1.5 text-[11px]">
              <span className="text-muted-foreground">Mode:</span> <span className="font-semibold capitalize">{mode}</span>
              {mode === "test" && testRunning && <span className="ml-2 text-aurora-red">● recording</span>}
            </div>
            {selected && (
              <div className="flex items-center gap-1 rounded-full border border-border/60 bg-background/70 px-2 py-1 text-[11px]">
                <span className="font-semibold">{selected.item.name}</span>
                <span className="text-muted-foreground">· {Math.round(selected.temperature)}°C</span>
                {selected.contents.length > 0 && (
                  <span className="ml-1 flex items-center gap-1">
                    <span className="h-3 w-3 rounded-full border border-border/60" style={{ background: blendColors(selected.contents) }} />
                    {selected.contents.length}
                  </span>
                )}
              </div>
            )}
            <div className="ml-auto flex flex-wrap gap-1.5">
              <ToolBtn onClick={donPPE} icon={<Award size={12} />}>PPE</ToolBtn>
              <ToolBtn onClick={() => selected && toggleHeat(selected.id)} icon={<Flame size={12} />} disabled={!selected} active={!!selected?.heated}>Heat</ToolBtn>
              <ToolBtn onClick={() => selected && !selected.heated ? null : selected && toggleHeat(selected.id)} icon={<Snowflake size={12} />} disabled={!selected}>Cool</ToolBtn>
              <ToolBtn onClick={() => selected && stir(selected.id)} icon={<Wind size={12} />} disabled={!selected}>Stir</ToolBtn>
              <ToolBtn onClick={() => selected && setPouring(selected.id)} icon={<Droplets size={12} />} disabled={!selected} active={pouring === selectedId}>Pour</ToolBtn>
              <ToolBtn onClick={() => selected && Matter.Body.rotate(selected.body, Math.PI / 12)} icon={<RotateCw size={12} />} disabled={!selected}>Rotate</ToolBtn>
              <ToolBtn onClick={() => selected && filterInto(selected.id)} icon={<FlaskConical size={12} />} disabled={!selected}>Filter</ToolBtn>
              <ToolBtn onClick={() => { const v = prompt("Record measurement (e.g. 24.90 mL, 78°C, pH 7):"); if (v) measure(v); }} icon={<ClipboardList size={12} />}>Measure</ToolBtn>
              <ToolBtn onClick={() => { const v = prompt("Record observation (e.g. pink, blue-crystals, effervescence):"); if (v) observe(v); }} icon={<Info size={12} />}>Observe</ToolBtn>
              <ToolBtn onClick={() => selected && removeOne(selected.id)} icon={<Trash2 size={12} />} disabled={!selected}>Remove</ToolBtn>
              <ToolBtn onClick={clearBench} icon={<X size={12} />}>Clear</ToolBtn>
            </div>
          </div>

          <div
            ref={sceneRef}
            onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = "copy"; }}
            onDrop={(e) => {
              e.preventDefault();
              const id = e.dataTransfer.getData("app/id");
              const item = appById(id); if (item) drop(item, e.clientX, e.clientY);
            }}
            className="relative h-[620px] w-full"
            style={{
              backgroundImage:
                "linear-gradient(180deg, transparent 0%, transparent 78%, color-mix(in oklab, var(--navy) 18%, transparent) 78%, color-mix(in oklab, var(--navy) 22%, transparent) 100%), radial-gradient(1200px 400px at 50% 20%, color-mix(in oklab, var(--turquoise) 12%, transparent), transparent 60%)",
            }}
          >
            {/* SVG overlay synced to matter bodies */}
            <div className="pointer-events-none absolute inset-0">
              {placedRef.current.map((p) => {
                const { position, angle } = p.body;
                const isSel = p.id === selectedId;
                const isPourSrc = pouring === p.id;
                const tint = p.contents.length ? blendColors(p.contents) : p.item.fill;
                const itemWithTint: ApparatusItem = { ...p.item, fill: tint };
                return (
                  <div key={p.id}
                    className="pointer-events-auto absolute cursor-pointer"
                    style={{
                      left: position.x - p.item.width / 2, top: position.y - p.item.height / 2,
                      width: p.item.width, height: p.item.height,
                      transform: `rotate(${angle}rad)`, transformOrigin: "center",
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (pouring && pouring !== p.id) pour(pouring, p.id);
                      else setSelectedId(p.id);
                    }}
                  >
                    <ApparatusSVG item={itemWithTint} className="drop-shadow-[0_6px_10px_rgba(0,0,0,0.25)]" />
                    {p.heated && (
                      <div className="pointer-events-none absolute -bottom-8 left-1/2 -translate-x-1/2">
                        <motion.div animate={{ scaleY: [1, 1.15, 0.95, 1.1, 1], opacity: [0.8, 1, 0.9, 1, 0.85] }}
                          transition={{ duration: 0.9, repeat: Infinity }}
                          className="h-10 w-6 rounded-full"
                          style={{ background: "radial-gradient(ellipse at center, #F4A69B, #E86A5C 40%, transparent 70%)" }} />
                      </div>
                    )}
                    {(isSel || isPourSrc) && (
                      <div className={`pointer-events-none absolute inset-0 rounded-md ring-2 ${isPourSrc ? "ring-aurora-red" : "ring-turquoise"}`} />
                    )}
                  </div>
                );
              })}
            </div>

            {placedRef.current.length === 0 && (
              <div className="pointer-events-none absolute inset-0 grid place-items-center">
                <div className="rounded-2xl border border-dashed border-border/70 bg-background/40 px-5 py-3 text-sm text-muted-foreground">
                  Drag apparatus from the tray → drop here. Click to select. R to rotate. Del to remove.
                </div>
              </div>
            )}

            {/* Tutorial overlay */}
            {mode === "tutorial" && <TutorialOverlay step={tutorialStep} setStep={setTutorialStep} />}
          </div>

          <div className="flex items-center gap-2 px-4 py-2 text-xs text-muted-foreground">
            <Info size={12} /> Items: {placedRef.current.length} · Actions logged: {log.length}
            {pouring && <span className="text-aurora-red">· Pour mode: click a target</span>}
          </div>
        </div>

        {/* ================= RIGHT: mode panel ================= */}
        <aside className="glass flex flex-col gap-3 rounded-3xl p-4">
          {mode === "tutorial" && <TutorialPanel step={tutorialStep} setStep={setTutorialStep} />}
          {mode === "manual" && <ManualPanel exp={experiment} step={manualStep} setStep={setManualStep} />}
          {mode === "practice" && <PracticePanel exp={experiment} log={log} />}
          {mode === "test" && (
            <TestPanel exp={experiment} log={log} running={testRunning}
              onStart={startTest} onSubmit={submitTest} marking={marking}
              onOpenReport={() => setReportOpen(true)} />
          )}
        </aside>
      </div>

      {/* ================= Report modal ================= */}
      <AnimatePresence>
        {reportOpen && (
          <ReportModal exp={experiment} marking={marking} log={log}
            onClose={() => setReportOpen(false)} onRetry={startTest} />
        )}
      </AnimatePresence>
    </div>
  );
}

/* =====================================================================
   Marking engine — objective, criterion-referenced
===================================================================== */
function markLog(log: LogEntry[], exp: Experiment) {
  const results = exp.marking.map((crit) => {
    const hit = log.find((L) =>
      L.kind === crit.kind &&
      (crit.apparatus == null || L.apparatus === crit.apparatus) &&
      (crit.chemical == null || L.chemical === crit.chemical) &&
      (crit.target == null || L.target === crit.target) &&
      (crit.value == null || String(L.value ?? "").toLowerCase().includes(String(crit.value).toLowerCase()))
    );
    return { crit, awarded: hit ? crit.marks : 0, hit: !!hit };
  });
  const scored = results.reduce((s, r) => s + r.awarded, 0);
  const percent = exp.totalMarks ? Math.round((scored / exp.totalMarks) * 100) : 0;
  return { results, scored, total: exp.totalMarks, percent };
}

function describe(e: Partial<LogEntry>): string {
  return `${e.kind}${e.apparatus ? " " + e.apparatus : ""}${e.chemical ? " ← " + e.chemical : ""}${e.target ? " → " + e.target : ""}${e.value != null ? " [" + e.value + "]" : ""}`;
}

/* =====================================================================
   UI subcomponents
===================================================================== */
function ToolBtn({ children, icon, onClick, disabled, active }: {
  children: React.ReactNode; icon: React.ReactNode; onClick: () => void; disabled?: boolean; active?: boolean;
}) {
  return (
    <button onClick={onClick} disabled={disabled}
      className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium transition ${active ? "bg-aurora-red text-white" : "border border-border/60 bg-background/70 text-foreground/80 hover:bg-foreground/5"} disabled:cursor-not-allowed disabled:opacity-40`}>
      {icon}{children}
    </button>
  );
}

/* ---------- Tutorial ---------- */
const TUTORIAL_STEPS = [
  { title: "Welcome to the Virtual Lab", body: "This bench simulates real chemistry apparatus with live physics. You'll learn how to set up, interact and record experiments — exactly as you would in a real lab." },
  { title: "1 · Drag apparatus onto the bench", body: "Open the Apparatus tray on the left, then drag any item onto the bench. Physics kicks in — items fall, collide and rest just like real glassware." },
  { title: "2 · Select and manipulate", body: "Click an item to select it. Use R to rotate, Delete to remove, or the toolbar for Heat / Cool / Stir / Pour / Filter / Measure / Observe." },
  { title: "3 · Add reagents", body: "Switch the tray to Reagents. Select an apparatus on the bench, then click a chemical to add it. Contents show as a blended colour with a live indicator." },
  { title: "4 · Pour, heat and mix", body: "Click Pour, then click a target apparatus to transfer contents. Heat toggles a live flame under the item; temperature rises in real time." },
  { title: "5 · Follow an experiment", body: "Switch to Manual for step-by-step instructions. Practice lets you free-form. Test mode records every action and marks you against the syllabus rubric." },
  { title: "6 · Get graded", body: "In Test mode, click Submit to see your marked report. Every mark is tied to a specific verifiable action — no subjective grading, just the criteria." },
];

function TutorialOverlay({ step, setStep }: { step: number; setStep: (n: number) => void }) {
  const t = TUTORIAL_STEPS[step];
  return (
    <div className="pointer-events-none absolute inset-0 grid place-items-end p-4">
      <motion.div key={step} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
        className="pointer-events-auto glass max-w-md rounded-2xl border border-turquoise/40 p-4">
        <div className="text-xs font-mono uppercase tracking-widest text-turquoise">Tutorial · {step + 1} / {TUTORIAL_STEPS.length}</div>
        <div className="mt-1 text-sm font-semibold">{t.title}</div>
        <p className="mt-1 text-xs text-muted-foreground">{t.body}</p>
        <div className="mt-3 flex justify-between">
          <button disabled={step === 0} onClick={() => setStep(step - 1)}
            className="rounded-full border border-border/60 px-3 py-1 text-xs disabled:opacity-40"><ChevronLeft size={12} /></button>
          <button onClick={() => setStep(Math.min(TUTORIAL_STEPS.length - 1, step + 1))}
            className="rounded-full bg-navy px-3 py-1 text-xs text-peach dark:bg-turquoise dark:text-charcoal">Next <ChevronRight size={12} className="inline" /></button>
        </div>
      </motion.div>
    </div>
  );
}

function TutorialPanel({ step, setStep }: { step: number; setStep: (n: number) => void }) {
  return (
    <div>
      <div className="text-xs font-mono uppercase tracking-widest text-turquoise">Tutorial mode</div>
      <div className="mt-1 text-sm font-semibold">How to use the lab</div>
      <ol className="mt-3 space-y-1.5">
        {TUTORIAL_STEPS.map((s, i) => (
          <li key={i}>
            <button onClick={() => setStep(i)}
              className={`w-full rounded-xl border p-2 text-left text-xs transition ${i === step ? "border-turquoise/60 bg-turquoise/10" : "border-border/60 hover:bg-foreground/5"}`}>
              <div className="font-medium">{i + 1}. {s.title}</div>
            </button>
          </li>
        ))}
      </ol>
      <button onClick={() => setStep(0)} className="mt-3 rounded-full border border-border/60 px-3 py-1 text-xs">Restart tutorial</button>
    </div>
  );
}

/* ---------- Manual ---------- */
function ManualPanel({ exp, step, setStep }: { exp: Experiment; step: number; setStep: (n: number) => void }) {
  return (
    <div className="flex h-full flex-col">
      <div className="text-xs font-mono uppercase tracking-widest text-turquoise">Instruction manual</div>
      <div className="mt-1 text-sm font-semibold">{exp.title}</div>
      <div className="mt-1 text-[11px] text-muted-foreground">{exp.category} · {exp.level} · {exp.duration}</div>

      <div className="mt-3 rounded-xl border border-border/60 bg-background/40 p-3 text-xs">
        <div className="font-semibold">Aim</div>
        <p className="mt-1 text-muted-foreground">{exp.aim}</p>
      </div>

      <div className="mt-3 rounded-xl border border-aurora-red/40 bg-aurora-red/5 p-3 text-xs">
        <div className="font-semibold text-aurora-red">Safety</div>
        <ul className="mt-1 space-y-1 text-foreground/80">
          {exp.safety.map((s, i) => <li key={i}>• {s}</li>)}
        </ul>
      </div>

      <div className="mt-3 flex-1 overflow-y-auto rounded-xl border border-border/60 bg-background/40 p-3 text-xs">
        <div className="font-semibold">Procedure</div>
        <ol className="mt-2 space-y-1.5">
          {exp.procedure.map((p, i) => (
            <li key={i}
              className={`rounded-lg p-2 transition ${i === step ? "bg-turquoise/15 ring-1 ring-turquoise/60" : ""}`}>
              <span className="mr-1 font-mono text-turquoise">{i + 1}.</span>{p}
            </li>
          ))}
        </ol>
        <div className="mt-3 font-semibold">Expected observations</div>
        <ul className="mt-1 space-y-1 text-muted-foreground">
          {exp.observations.map((o, i) => <li key={i}>• {o}</li>)}
        </ul>
      </div>

      <div className="mt-3 flex justify-between">
        <button disabled={step === 0} onClick={() => setStep(step - 1)}
          className="flex items-center gap-1 rounded-full border border-border/60 px-3 py-1 text-xs disabled:opacity-40">
          <ChevronLeft size={12} /> Prev
        </button>
        <button disabled={step >= exp.procedure.length - 1} onClick={() => setStep(step + 1)}
          className="flex items-center gap-1 rounded-full bg-navy px-3 py-1 text-xs text-peach disabled:opacity-40 dark:bg-turquoise dark:text-charcoal">
          Next <ChevronRight size={12} />
        </button>
      </div>
    </div>
  );
}

/* ---------- Practice ---------- */
function PracticePanel({ exp, log }: { exp: Experiment; log: LogEntry[] }) {
  return (
    <div className="flex h-full flex-col">
      <div className="text-xs font-mono uppercase tracking-widest text-turquoise">Practice mode</div>
      <div className="mt-1 text-sm font-semibold">Free-form: {exp.title}</div>
      <p className="mt-1 text-[11px] text-muted-foreground">No marking. Explore, break things, learn the apparatus. Your action log is kept below.</p>

      <div className="mt-3 rounded-xl border border-border/60 bg-background/40 p-3 text-xs">
        <div className="font-semibold">Required apparatus</div>
        <div className="mt-1 text-muted-foreground">{exp.requiredApparatus.map((id) => appById(id)?.name).filter(Boolean).join(" · ")}</div>
        <div className="mt-2 font-semibold">Required reagents</div>
        <div className="mt-1 text-muted-foreground">{exp.requiredChemicals.map((id) => chemById(id)?.name).filter(Boolean).join(" · ")}</div>
      </div>

      <div className="mt-3 flex-1 overflow-y-auto rounded-xl border border-border/60 bg-background/40 p-3 text-xs">
        <div className="font-semibold">Action log ({log.length})</div>
        <ul className="mt-1 space-y-1">
          {log.slice().reverse().map((L, i) => (
            <li key={log.length - i - 1} className="rounded-md bg-background/40 px-2 py-1 text-[11px]">{L.label}</li>
          ))}
          {log.length === 0 && <li className="text-muted-foreground">Nothing logged yet.</li>}
        </ul>
      </div>
    </div>
  );
}

/* ---------- Test ---------- */
function TestPanel({ exp, log, running, onStart, onSubmit, marking, onOpenReport }: {
  exp: Experiment; log: LogEntry[]; running: boolean;
  onStart: () => void; onSubmit: () => void; onOpenReport: () => void;
  marking: ReturnType<typeof markLog>;
}) {
  return (
    <div className="flex h-full flex-col">
      <div className="text-xs font-mono uppercase tracking-widest text-turquoise">Test mode</div>
      <div className="mt-1 text-sm font-semibold">Assessment: {exp.title}</div>
      <p className="mt-1 text-[11px] text-muted-foreground">Every action is graded against an objective rubric. When a syllabus is added, marks are re-weighted per exam board — the criteria stay the same.</p>

      {!running ? (
        <button onClick={onStart}
          className="mt-3 flex items-center justify-center gap-2 rounded-full bg-aurora animate-aurora px-4 py-2 text-sm font-medium text-white">
          <Play size={14} /> Start test
        </button>
      ) : (
        <button onClick={onSubmit}
          className="mt-3 flex items-center justify-center gap-2 rounded-full bg-navy px-4 py-2 text-sm font-medium text-peach dark:bg-turquoise dark:text-charcoal">
          <ClipboardList size={14} /> Submit for marking
        </button>
      )}

      <div className="mt-3 rounded-xl border border-border/60 bg-background/40 p-3 text-xs">
        <div className="flex justify-between font-semibold"><span>Live provisional score</span><span>{marking.scored}/{marking.total} · {marking.percent}%</span></div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-background/60">
          <div className="h-full bg-aurora animate-aurora" style={{ width: `${marking.percent}%` }} />
        </div>
      </div>

      <div className="mt-3 flex-1 overflow-y-auto rounded-xl border border-border/60 bg-background/40 p-3 text-xs">
        <div className="font-semibold">Criteria ({exp.marking.length})</div>
        <ul className="mt-1 space-y-1">
          {marking.results.map((r, i) => (
            <li key={i} className={`flex items-start gap-2 rounded-md p-1.5 ${r.hit ? "bg-emerald-500/10" : "bg-background/40"}`}>
              {r.hit ? <CheckCircle2 size={12} className="mt-0.5 flex-shrink-0 text-emerald-500" /> : <XCircle size={12} className="mt-0.5 flex-shrink-0 text-muted-foreground" />}
              <span className="flex-1">
                <span className="text-[11px]">{r.crit.hint}</span>
                <span className="ml-1 text-[10px] text-muted-foreground">({r.crit.marks} mk)</span>
              </span>
            </li>
          ))}
        </ul>
      </div>

      {!running && log.length > 0 && (
        <button onClick={onOpenReport} className="mt-3 rounded-full border border-border/60 px-3 py-1.5 text-xs">Open last report</button>
      )}
    </div>
  );
}

/* ---------- Report ---------- */
function ReportModal({ exp, marking, log, onClose, onRetry }: {
  exp: Experiment; marking: ReturnType<typeof markLog>; log: LogEntry[];
  onClose: () => void; onRetry: () => void;
}) {
  const grade =
    marking.percent >= 80 ? "A" :
    marking.percent >= 70 ? "B" :
    marking.percent >= 60 ? "C" :
    marking.percent >= 50 ? "D" :
    marking.percent >= 40 ? "E" : "U";
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 grid place-items-center bg-charcoal/50 p-4 backdrop-blur-sm" onClick={onClose}>
      <motion.div initial={{ scale: 0.95, y: 10, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.95, y: 10, opacity: 0 }}
        transition={{ duration: 0.25, ease: [0.2, 0.8, 0.2, 1] }}
        className="glass max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-3xl p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between">
          <div>
            <div className="text-xs font-mono uppercase tracking-widest text-turquoise">Marking report</div>
            <h3 className="mt-1 text-2xl font-semibold" style={{ fontFamily: "var(--font-display)" }}>{exp.title}</h3>
            <div className="mt-1 text-xs text-muted-foreground">{exp.category} · {exp.level} · Criterion-referenced</div>
          </div>
          <button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-full border border-border/60"><X size={14} /></button>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-3">
          <div className="rounded-2xl border border-border/60 bg-background/40 p-3 text-center">
            <div className="text-[10px] uppercase text-muted-foreground">Score</div>
            <div className="mt-1 text-2xl font-semibold">{marking.scored}<span className="text-sm text-muted-foreground">/{marking.total}</span></div>
          </div>
          <div className="rounded-2xl border border-border/60 bg-background/40 p-3 text-center">
            <div className="text-[10px] uppercase text-muted-foreground">Percentage</div>
            <div className="mt-1 text-2xl font-semibold">{marking.percent}%</div>
          </div>
          <div className="rounded-2xl border border-turquoise/60 bg-turquoise/10 p-3 text-center">
            <div className="text-[10px] uppercase text-muted-foreground">Grade</div>
            <div className="mt-1 text-2xl font-semibold text-turquoise">{grade}</div>
          </div>
        </div>

        <div className="mt-2 text-[11px] text-muted-foreground">Provisional grade band. When a syllabus is added (ZIMSEC / Cambridge / etc.) marks are re-weighted per exam board.</div>

        <div className="mt-4">
          <div className="text-sm font-semibold">What you did well</div>
          <ul className="mt-2 space-y-1.5">
            {marking.results.filter((r) => r.hit).map((r, i) => (
              <li key={i} className="flex items-start gap-2 rounded-lg bg-emerald-500/10 p-2 text-xs">
                <CheckCircle2 size={14} className="mt-0.5 flex-shrink-0 text-emerald-500" />
                <span>{r.crit.hint} <span className="text-[10px] text-muted-foreground">(+{r.crit.marks})</span></span>
              </li>
            ))}
            {marking.results.every((r) => !r.hit) && <li className="text-xs text-muted-foreground">No criteria met — start the experiment again and follow the procedure.</li>}
          </ul>
        </div>

        <div className="mt-4">
          <div className="text-sm font-semibold">What you missed & should have done</div>
          <ul className="mt-2 space-y-1.5">
            {marking.results.filter((r) => !r.hit).map((r, i) => (
              <li key={i} className="flex items-start gap-2 rounded-lg bg-aurora-red/10 p-2 text-xs">
                <XCircle size={14} className="mt-0.5 flex-shrink-0 text-aurora-red" />
                <span>{r.crit.hint} <span className="text-[10px] text-muted-foreground">({r.crit.marks} mk lost)</span></span>
              </li>
            ))}
            {marking.results.every((r) => r.hit) && <li className="text-xs text-emerald-500">Perfect — all criteria met.</li>}
          </ul>
        </div>

        <div className="mt-4">
          <div className="text-sm font-semibold">Your action log</div>
          <ol className="mt-2 max-h-40 overflow-y-auto rounded-lg border border-border/60 bg-background/40 p-2 text-[11px]">
            {log.map((L, i) => <li key={i}>{i + 1}. {L.label}</li>)}
            {log.length === 0 && <li className="text-muted-foreground">No actions recorded.</li>}
          </ol>
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button onClick={onClose} className="rounded-full border border-border/60 px-4 py-1.5 text-xs">Close</button>
          <button onClick={onRetry} className="rounded-full bg-navy px-4 py-1.5 text-xs text-peach dark:bg-turquoise dark:text-charcoal">Retry test</button>
        </div>
      </motion.div>
    </motion.div>
  );
}
