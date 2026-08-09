import { useEffect, useRef } from "react";

export interface Atom3DProps {
  protons: number;
  neutrons: number;
  electrons: number;
  symbol: string;
  color?: string;
  className?: string;
  speed?: number;
}

export function shellsFor(total: number): number[] {
  const caps = [2, 8, 18, 32, 32, 18, 8];
  const shells: number[] = [];
  let left = total;
  for (const c of caps) { if (left <= 0) break; shells.push(Math.min(left, c)); left -= c; }
  return shells;
}

/** Canvas ball-and-orbit atom with true 3D projection + animation. */
export function Atom3D({ protons, neutrons, electrons, symbol, color = "#6aa9e9", className, speed = 1 }: Atom3DProps) {
  const ref = useRef<HTMLCanvasElement | null>(null);
  const props = useRef({ protons, neutrons, electrons, symbol, color, speed });
  props.current = { protons, neutrons, electrons, symbol, color, speed };

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let raf = 0;
    let t = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      const r = canvas.getBoundingClientRect();
      canvas.width = Math.max(1, r.width * dpr);
      canvas.height = Math.max(1, r.height * dpr);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const rotY = (p: number[], a: number) => [p[0] * Math.cos(a) + p[2] * Math.sin(a), p[1], -p[0] * Math.sin(a) + p[2] * Math.cos(a)];
    const rotX = (p: number[], a: number) => [p[0], p[1] * Math.cos(a) - p[2] * Math.sin(a), p[1] * Math.sin(a) + p[2] * Math.cos(a)];

    const draw = () => {
      const { protons: P, neutrons: N, electrons: E, symbol: S, color: C, speed: SP } = props.current;
      const w = canvas.width, h = canvas.height;
      const cx = w / 2, cy = h / 2;
      const R = Math.min(w, h) / 2;
      ctx.clearRect(0, 0, w, h);
      t += 0.008 * SP;

      const shells = shellsFor(E);
      const nucCount = Math.min(P + N, 60);
      const nucR = R * (0.10 + Math.min(0.09, (P + N) / 700));

      type Item = { z: number; fn: () => void };
      const items: Item[] = [];

      // nucleons
      for (let i = 0; i < nucCount; i++) {
        const g = 2.399963;
        const y = 1 - (i / Math.max(1, nucCount - 1)) * 2;
        const rr = Math.sqrt(Math.max(0, 1 - y * y));
        let p = [Math.cos(g * i) * rr, y, Math.sin(g * i) * rr].map((v) => v * nucR);
        p = rotY(p, t * 0.6);
        p = rotX(p, 0.45);
        const isP = i % 2 === 0 ? i / 2 < P : true;
        const rad = nucR * 0.34 * (1 + p[2] / (nucR * 6));
        items.push({ z: p[2], fn: () => {
          ctx.beginPath();
          ctx.fillStyle = isP ? "#ff8a5c" : "#a78bfa";
          ctx.globalAlpha = 0.85 + p[2] / (nucR * 12);
          ctx.arc(cx + p[0], cy + p[1], Math.max(1, rad), 0, Math.PI * 2);
          ctx.fill();
          ctx.globalAlpha = 1;
        } });
      }

      // shells
      shells.forEach((count, si) => {
        const orbitR = nucR + R * 0.14 + si * (R * 0.115);
        const tiltX = 0.42 + si * 0.35;
        const tiltY = si * 0.7 + t * 0.15;
        // ring path
        items.push({ z: -9999 + si, fn: () => {
          ctx.beginPath();
          for (let a = 0; a <= 64; a++) {
            const ang = (a / 64) * Math.PI * 2;
            let p = [Math.cos(ang) * orbitR, Math.sin(ang) * orbitR, 0];
            p = rotX(p, tiltX); p = rotY(p, tiltY);
            const s = 1 + p[2] / (R * 4);
            a === 0 ? ctx.moveTo(cx + p[0] * s, cy + p[1] * s) : ctx.lineTo(cx + p[0] * s, cy + p[1] * s);
          }
          ctx.closePath();
          ctx.strokeStyle = C;
          ctx.globalAlpha = 0.22;
          ctx.lineWidth = Math.max(1, dpr);
          ctx.stroke();
          ctx.globalAlpha = 1;
        } });

        for (let j = 0; j < count; j++) {
          const ang = (j / count) * Math.PI * 2 + t * (1.4 / (si + 1)) * SP;
          let p = [Math.cos(ang) * orbitR, Math.sin(ang) * orbitR, 0];
          p = rotX(p, tiltX); p = rotY(p, tiltY);
          const s = 1 + p[2] / (R * 4);
          const rad = Math.max(1.2, R * 0.022 * s * dpr * 0.9);
          items.push({ z: p[2], fn: () => {
            const gx = cx + p[0] * s, gy = cy + p[1] * s;
            const grd = ctx.createRadialGradient(gx, gy, 0, gx, gy, rad * 3);
            grd.addColorStop(0, C);
            grd.addColorStop(1, "rgba(0,0,0,0)");
            ctx.globalAlpha = 0.35;
            ctx.fillStyle = grd;
            ctx.beginPath(); ctx.arc(gx, gy, rad * 3, 0, Math.PI * 2); ctx.fill();
            ctx.globalAlpha = 1;
            ctx.beginPath(); ctx.fillStyle = C;
            ctx.arc(gx, gy, rad, 0, Math.PI * 2); ctx.fill();
          } });
        }
      });

      items.sort((a, b) => a.z - b.z).forEach((i) => i.fn());

      // nucleus glow + label
      const g2 = ctx.createRadialGradient(cx, cy, 0, cx, cy, nucR * 1.9);
      g2.addColorStop(0, "rgba(255,138,92,0.28)");
      g2.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g2;
      ctx.beginPath(); ctx.arc(cx, cy, nucR * 1.9, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,0.95)";
      ctx.font = `700 ${Math.round(R * 0.16)}px ui-sans-serif, system-ui`;
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText(S, cx, cy);

      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, []);

  return <canvas ref={ref} className={className} aria-label={`Animated 3D model of ${symbol}`} />;
}
