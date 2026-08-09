import { useEffect, useRef } from "react";
import { cpk, type Molecule3 } from "@/data/molecules3d";

/** Rotating, draggable 3D ball-and-stick renderer (canvas, z-sorted). */
export function Molecule3D({ mol, className, autoRotate = true }: { mol: Molecule3; className?: string; autoRotate?: boolean }) {
  const ref = useRef<HTMLCanvasElement | null>(null);
  const molRef = useRef(mol);
  molRef.current = mol;
  const spin = useRef({ ry: 0.6, rx: 0.35, drag: false, lx: 0, ly: 0, zoom: 1, auto: autoRotate });
  spin.current.auto = autoRotate;

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let raf = 0;

    const resize = () => {
      const r = canvas.getBoundingClientRect();
      canvas.width = Math.max(1, r.width * dpr);
      canvas.height = Math.max(1, r.height * dpr);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const down = (e: PointerEvent) => { spin.current.drag = true; spin.current.lx = e.clientX; spin.current.ly = e.clientY; canvas.setPointerCapture(e.pointerId); };
    const move = (e: PointerEvent) => {
      if (!spin.current.drag) return;
      spin.current.ry += (e.clientX - spin.current.lx) * 0.01;
      spin.current.rx += (e.clientY - spin.current.ly) * 0.01;
      spin.current.lx = e.clientX; spin.current.ly = e.clientY;
    };
    const up = () => { spin.current.drag = false; };
    const wheel = (e: WheelEvent) => { e.preventDefault(); spin.current.zoom = Math.min(2.5, Math.max(0.5, spin.current.zoom - e.deltaY * 0.001)); };
    canvas.addEventListener("pointerdown", down);
    canvas.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    canvas.addEventListener("wheel", wheel, { passive: false });

    const draw = () => {
      const m = molRef.current;
      const w = canvas.width, h = canvas.height;
      ctx.clearRect(0, 0, w, h);
      if (spin.current.auto && !spin.current.drag) spin.current.ry += 0.006;
      const { rx, ry, zoom } = spin.current;

      const maxR = Math.max(1, ...m.atoms.map(a => Math.hypot(a.x, a.y, a.z))) + 1;
      const scale = (Math.min(w, h) / 2 / maxR) * 0.82 * zoom;
      const cx = w / 2, cy = h / 2;

      const proj = m.atoms.map((a) => {
        let x = a.x * Math.cos(ry) + a.z * Math.sin(ry);
        let z = -a.x * Math.sin(ry) + a.z * Math.cos(ry);
        let y = a.y * Math.cos(rx) - z * Math.sin(rx);
        z = a.y * Math.sin(rx) + z * Math.cos(rx);
        const persp = 1 / (1 - z / (maxR * 6));
        return { sx: cx + x * scale * persp, sy: cy + y * scale * persp, z, persp, el: a.el };
      });

      type Item = { z: number; fn: () => void };
      const items: Item[] = [];

      m.bonds.forEach(([a, b, order = 1]) => {
        const A = proj[a], B = proj[b];
        if (!A || !B) return;
        const dx = B.sx - A.sx, dy = B.sy - A.sy;
        const len = Math.hypot(dx, dy) || 1;
        const nx = -dy / len, ny = dx / len;
        const gap = Math.max(2, scale * 0.11);
        const offs = order === 1 ? [0] : order === 2 ? [-gap, gap] : [-gap * 1.3, 0, gap * 1.3];
        items.push({ z: (A.z + B.z) / 2 - 0.01, fn: () => {
          offs.forEach((o) => {
            ctx.beginPath();
            ctx.moveTo(A.sx + nx * o, A.sy + ny * o);
            ctx.lineTo(B.sx + nx * o, B.sy + ny * o);
            ctx.strokeStyle = "rgba(148,163,184,0.85)";
            ctx.lineWidth = Math.max(1.5, scale * 0.09);
            ctx.lineCap = "round";
            ctx.stroke();
          });
        } });
      });

      proj.forEach((p) => {
        const { color, r } = cpk(p.el);
        const rad = r * scale * 0.55 * p.persp;
        items.push({ z: p.z, fn: () => {
          const g = ctx.createRadialGradient(p.sx - rad * 0.35, p.sy - rad * 0.4, rad * 0.1, p.sx, p.sy, rad);
          g.addColorStop(0, "rgba(255,255,255,0.85)");
          g.addColorStop(0.35, color);
          g.addColorStop(1, "rgba(0,0,0,0.55)");
          ctx.beginPath(); ctx.fillStyle = g;
          ctx.arc(p.sx, p.sy, rad, 0, Math.PI * 2); ctx.fill();
          if (rad > 9) {
            ctx.fillStyle = "rgba(15,23,42,0.9)";
            ctx.font = `700 ${Math.round(rad * 0.85)}px ui-sans-serif, system-ui`;
            ctx.textAlign = "center"; ctx.textBaseline = "middle";
            ctx.fillText(p.el, p.sx, p.sy);
          }
        } });
      });

      items.sort((a, b) => a.z - b.z).forEach(i => i.fn());
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf); ro.disconnect();
      canvas.removeEventListener("pointerdown", down);
      canvas.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      canvas.removeEventListener("wheel", wheel);
    };
  }, []);

  return <canvas ref={ref} className={className} style={{ touchAction: "none", cursor: "grab" }} aria-label={`3D model of ${mol.name}`} />;
}
