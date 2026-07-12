import { useEffect, useMemo, useRef, useState } from "react";
import Matter from "matter-js";
import { motion, AnimatePresence } from "framer-motion";
import { Search, RotateCcw, Trash2, Info, X } from "lucide-react";
import { APPARATUS, CATEGORIES, type ApparatusItem } from "@/data/apparatus";
import { ApparatusSVG } from "./ApparatusSVG";

interface Placed {
  id: string;             // instance id
  item: ApparatusItem;
  body: Matter.Body;
}

export function ApparatusBench() {
  const sceneRef = useRef<HTMLDivElement | null>(null);
  const engineRef = useRef<Matter.Engine | null>(null);
  const renderRef = useRef<Matter.Render | null>(null);
  const runnerRef = useRef<Matter.Runner | null>(null);
  const placedRef = useRef<Placed[]>([]);
  const [, force] = useState(0);
  const rerender = () => force((n) => n + 1);

  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("All");
  const [selected, setSelected] = useState<ApparatusItem | null>(null);
  const [dragging, setDragging] = useState<ApparatusItem | null>(null);
  const [size, setSize] = useState({ w: 800, h: 520 });

  const filtered = useMemo(() => APPARATUS.filter((a) => {
    const cat = category === "All" || a.category === category;
    const q = query.trim().toLowerCase();
    const match = !q || a.name.toLowerCase().includes(q) || a.usage.toLowerCase().includes(q);
    return cat && match;
  }), [query, category]);

  /* ---------------- matter.js setup ---------------- */
  useEffect(() => {
    if (!sceneRef.current) return;
    const el = sceneRef.current;
    const rect = el.getBoundingClientRect();
    const w = rect.width;
    const h = rect.height;
    setSize({ w, h });

    const engine = Matter.Engine.create({ gravity: { x: 0, y: 1, scale: 0.0012 } });
    const render = Matter.Render.create({
      element: el,
      engine,
      options: { width: w, height: h, wireframes: false, background: "transparent", pixelRatio: window.devicePixelRatio || 1 },
    });
    const runner = Matter.Runner.create();

    // walls & floor
    const wallOpts = { isStatic: true, render: { visible: false } } as const;
    const floor = Matter.Bodies.rectangle(w / 2, h - 8, w, 20, { ...wallOpts, label: "bench-floor" });
    const left = Matter.Bodies.rectangle(-10, h / 2, 20, h, wallOpts);
    const right = Matter.Bodies.rectangle(w + 10, h / 2, 20, h, wallOpts);
    const ceiling = Matter.Bodies.rectangle(w / 2, -10, w, 20, wallOpts);
    Matter.World.add(engine.world, [floor, left, right, ceiling]);

    // mouse drag
    const mouse = Matter.Mouse.create(render.canvas);
    const mouseConstraint = Matter.MouseConstraint.create(engine, {
      mouse, constraint: { stiffness: 0.2, render: { visible: false } },
    });
    Matter.World.add(engine.world, mouseConstraint);
    render.mouse = mouse;

    Matter.Events.on(mouseConstraint, "mouseup", () => {
      const b = mouseConstraint.body;
      if (!b) return;
      const p = placedRef.current.find((x) => x.body.id === b.id);
      if (p) setSelected(p.item);
    });

    Matter.Render.run(render);
    Matter.Runner.run(runner, engine);

    // sync SVG overlays each frame
    Matter.Events.on(engine, "afterUpdate", rerender);

    engineRef.current = engine;
    renderRef.current = render;
    runnerRef.current = runner;

    const ro = new ResizeObserver(() => {
      const r = el.getBoundingClientRect();
      render.canvas.width = r.width * (window.devicePixelRatio || 1);
      render.canvas.height = r.height * (window.devicePixelRatio || 1);
      render.canvas.style.width = r.width + "px";
      render.canvas.style.height = r.height + "px";
      render.options.width = r.width;
      render.options.height = r.height;
      Matter.Body.setPosition(floor, { x: r.width / 2, y: r.height - 8 });
      Matter.Body.setPosition(right, { x: r.width + 10, y: r.height / 2 });
      setSize({ w: r.width, h: r.height });
    });
    ro.observe(el);

    return () => {
      ro.disconnect();
      Matter.Render.stop(render);
      Matter.Runner.stop(runner);
      Matter.World.clear(engine.world, false);
      Matter.Engine.clear(engine);
      render.canvas.remove();
      render.textures = {};
    };
  }, []);

  /* ---------------- drop from tray ---------------- */
  const onDropAt = (item: ApparatusItem, clientX: number, clientY: number) => {
    const engine = engineRef.current;
    const el = sceneRef.current;
    if (!engine || !el) return;
    const r = el.getBoundingClientRect();
    const x = Math.min(Math.max(clientX - r.left, item.width / 2), r.width - item.width / 2);
    const y = Math.min(Math.max(clientY - r.top, item.height / 2), r.height - item.height / 2);

    const body = Matter.Bodies.rectangle(x, y, item.width, item.height, {
      mass: item.mass / 100,
      friction: item.friction,
      restitution: item.restitution,
      chamfer: { radius: 6 },
      render: { visible: false },
      label: item.id,
    });
    Matter.World.add(engine.world, body);
    placedRef.current = [...placedRef.current, { id: `${item.id}-${Date.now()}`, item, body }];
    rerender();
  };

  const clearBench = () => {
    const engine = engineRef.current;
    if (!engine) return;
    placedRef.current.forEach((p) => Matter.World.remove(engine.world, p.body));
    placedRef.current = [];
    rerender();
  };

  const removeOne = (instanceId: string) => {
    const engine = engineRef.current;
    if (!engine) return;
    const p = placedRef.current.find((x) => x.id === instanceId);
    if (!p) return;
    Matter.World.remove(engine.world, p.body);
    placedRef.current = placedRef.current.filter((x) => x.id !== instanceId);
    rerender();
  };

  return (
    <div className="mx-auto grid max-w-7xl gap-4 px-4 py-8 lg:grid-cols-[300px_1fr]">
      {/* Tray */}
      <aside className="glass rounded-3xl p-4">
        <div className="mb-3 flex items-center gap-2 rounded-full border border-border/60 bg-background/40 px-3 py-2">
          <Search size={14} className="text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search apparatus…"
            className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>
        <div className="mb-3 flex flex-wrap gap-1.5">
          {(["All", ...CATEGORIES] as const).map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`rounded-full px-3 py-1 text-xs transition ${category === c ? "bg-navy text-peach dark:bg-turquoise dark:text-charcoal" : "border border-border/60 text-foreground/70 hover:bg-foreground/5"}`}
            >{c}</button>
          ))}
        </div>
        <div className="grid max-h-[520px] grid-cols-2 gap-2 overflow-y-auto pr-1">
          {filtered.map((item) => (
            <div
              key={item.id}
              draggable
              onDragStart={(e) => {
                setDragging(item);
                e.dataTransfer.setData("text/plain", item.id);
                e.dataTransfer.effectAllowed = "copy";
              }}
              onDragEnd={() => setDragging(null)}
              onDoubleClick={() => setSelected(item)}
              className="group flex cursor-grab flex-col items-center gap-1 rounded-2xl border border-border/60 bg-background/40 p-2 transition hover:-translate-y-0.5 hover:border-turquoise/60 hover:shadow-elegant active:cursor-grabbing"
              title={item.name}
            >
              <div className="flex h-[80px] w-full items-end justify-center overflow-hidden">
                <ApparatusSVG item={{ ...item, width: Math.min(item.width, 70), height: Math.min(item.height, 78) }} />
              </div>
              <div className="w-full truncate text-center text-[11px] text-foreground/80">{item.name}</div>
            </div>
          ))}
        </div>
        <p className="mt-3 text-[11px] text-muted-foreground">Drag onto the bench · double-click for info</p>
      </aside>

      {/* Bench */}
      <div className="glass relative overflow-hidden rounded-3xl">
        {/* toolbar */}
        <div className="absolute left-4 right-4 top-4 z-20 flex items-center justify-between">
          <div>
            <div className="text-xs font-mono uppercase tracking-widest text-turquoise">Piece 2</div>
            <div className="text-sm font-semibold">Apparatus Bench · matter.js physics</div>
          </div>
          <div className="flex gap-2">
            <button onClick={clearBench} className="flex items-center gap-1.5 rounded-full border border-border/60 bg-background/60 px-3 py-1.5 text-xs hover:bg-foreground/5">
              <Trash2 size={12} /> Clear
            </button>
            <button onClick={() => window.location.reload()} className="flex items-center gap-1.5 rounded-full border border-border/60 bg-background/60 px-3 py-1.5 text-xs hover:bg-foreground/5">
              <RotateCcw size={12} /> Reset
            </button>
          </div>
        </div>

        <div
          ref={sceneRef}
          onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = "copy"; }}
          onDrop={(e) => {
            e.preventDefault();
            const id = e.dataTransfer.getData("text/plain");
            const item = APPARATUS.find((a) => a.id === id) || dragging;
            if (item) onDropAt(item, e.clientX, e.clientY);
          }}
          className="relative h-[600px] w-full"
          style={{
            backgroundImage:
              "linear-gradient(180deg, transparent 0%, transparent 78%, color-mix(in oklab, var(--navy) 18%, transparent) 78%, color-mix(in oklab, var(--navy) 22%, transparent) 100%), radial-gradient(1200px 400px at 50% 20%, color-mix(in oklab, var(--turquoise) 12%, transparent), transparent 60%)",
          }}
        >
          {/* SVG overlay synced to matter bodies */}
          <div className="pointer-events-none absolute inset-0">
            {placedRef.current.map((p) => {
              const { position, angle } = p.body;
              return (
                <div
                  key={p.id}
                  className="pointer-events-auto absolute"
                  style={{
                    left: position.x - p.item.width / 2,
                    top: position.y - p.item.height / 2,
                    width: p.item.width,
                    height: p.item.height,
                    transform: `rotate(${angle}rad)`,
                    transformOrigin: "center",
                  }}
                >
                  <ApparatusSVG item={p.item} className="drop-shadow-[0_6px_10px_rgba(0,0,0,0.25)]" />
                  <button
                    onClick={(e) => { e.stopPropagation(); removeOne(p.id); }}
                    className="absolute -right-2 -top-2 hidden h-5 w-5 place-items-center rounded-full bg-background/90 text-foreground shadow group-hover:grid"
                    title="Remove"
                  >
                    <X size={10} />
                  </button>
                </div>
              );
            })}
          </div>

          {placedRef.current.length === 0 && (
            <div className="pointer-events-none absolute inset-0 grid place-items-center">
              <div className="rounded-2xl border border-dashed border-border/70 bg-background/40 px-5 py-3 text-sm text-muted-foreground">
                Drop apparatus here — physics is live
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 px-4 py-3 text-xs text-muted-foreground">
          <Info size={12} /> Bench size {Math.round(size.w)}×{Math.round(size.h)}px · items: {placedRef.current.length}
        </div>
      </div>

      {/* Details modal */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 grid place-items-center bg-charcoal/40 p-4 backdrop-blur-sm"
            onClick={() => setSelected(null)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 10, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 10, opacity: 0 }}
              transition={{ duration: 0.25, ease: [0.2, 0.8, 0.2, 1] }}
              className="glass w-full max-w-lg rounded-3xl p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-xs font-mono uppercase tracking-widest text-turquoise">{selected.category}</div>
                  <h3 className="mt-1 text-2xl font-semibold" style={{ fontFamily: "var(--font-display)" }}>{selected.name}</h3>
                </div>
                <button onClick={() => setSelected(null)} className="grid h-8 w-8 place-items-center rounded-full border border-border/60"><X size={14} /></button>
              </div>
              <div className="mt-4 grid grid-cols-[120px_1fr] gap-5">
                <div className="grid h-[140px] place-items-end justify-center rounded-2xl border border-border/60 bg-background/40 p-3">
                  <ApparatusSVG item={selected} />
                </div>
                <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                  {selected.capacity && (<><dt className="text-muted-foreground">Capacity</dt><dd>{selected.capacity}</dd></>)}
                  {selected.tolerance && (<><dt className="text-muted-foreground">Tolerance</dt><dd>{selected.tolerance}</dd></>)}
                  <dt className="text-muted-foreground">Mass</dt><dd>{selected.mass} g</dd>
                  <dt className="text-muted-foreground">Friction</dt><dd>{selected.friction}</dd>
                  <dt className="text-muted-foreground">Bounce</dt><dd>{selected.restitution}</dd>
                </dl>
              </div>
              <p className="mt-4 text-sm text-foreground/80">{selected.usage}</p>
              {selected.hazards && (
                <p className="mt-2 rounded-xl bg-aurora-red/10 p-3 text-xs text-aurora-red">⚠ {selected.hazards}</p>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
