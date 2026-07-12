import type { ApparatusItem } from "@/data/apparatus";

/** Vector renderings for each apparatus shape, drawn to fit width x height. */
export function ApparatusSVG({ item, className }: { item: ApparatusItem; className?: string }) {
  const { width: w, height: h, color, fill, shape, id } = item;
  const s = { stroke: color, strokeWidth: 1.6, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };
  const V = ({ children }: { children: React.ReactNode }) => (
    <svg viewBox={`0 0 ${w} ${h}`} className={className} width={w} height={h}>{children}</svg>
  );
  const liqId = `liq-${id}`;
  const liqGrad = (
    <defs>
      <linearGradient id={liqId} x1="0" x2="0" y1="0" y2="1">
        <stop offset="0" stopColor={fill} stopOpacity="0.9" />
        <stop offset="1" stopColor={fill} stopOpacity="0.55" />
      </linearGradient>
    </defs>
  );

  switch (shape) {
    case "beaker": {
      const lip = 6;
      return (
        <V>{liqGrad}
          <path d={`M4 ${lip} L${w - 4} ${lip} L${w - 4} ${h - 6} Q${w - 4} ${h - 2} ${w - 8} ${h - 2} L8 ${h - 2} Q4 ${h - 2} 4 ${h - 6} Z`} {...s} fill="none" />
          <path d={`M6 ${h * 0.55} L${w - 6} ${h * 0.55} L${w - 6} ${h - 8} Q${w - 6} ${h - 4} ${w - 10} ${h - 4} L10 ${h - 4} Q6 ${h - 4} 6 ${h - 8} Z`} fill={`url(#${liqId})`} />
          <line x1="4" y1={lip} x2="10" y2={lip - 3} {...s} fill="none" />
          <line x1={w - 4} y1={lip} x2={w - 10} y2={lip - 3} {...s} fill="none" />
        </V>
      );
    }
    case "flask-conical": {
      const neck = w * 0.28;
      return (
        <V>
          <path d={`M${(w - neck) / 2} 4 L${(w + neck) / 2} 4 L${(w + neck) / 2} ${h * 0.35} L${w - 6} ${h - 6} L6 ${h - 6} L${(w - neck) / 2} ${h * 0.35} Z`} {...s} fill="none" />
          <path d={`M12 ${h * 0.72} L${w - 12} ${h * 0.72} L${w - 8} ${h - 8} L8 ${h - 8} Z`} fill={fill} opacity="0.8" />
        </V>
      );
    }
    case "flask-round": {
      const bulbR = Math.min(w, h) * 0.4;
      const cx = w / 2, cy = h - bulbR - 4;
      return (
        <V>
          <rect x={cx - 6} y="2" width="12" height={cy - bulbR + 4} {...s} fill="none" />
          <circle cx={cx} cy={cy} r={bulbR} {...s} fill="none" />
          <path d={`M ${cx - bulbR * 0.95} ${cy + bulbR * 0.2} A ${bulbR} ${bulbR} 0 0 0 ${cx + bulbR * 0.95} ${cy + bulbR * 0.2} L ${cx + bulbR * 0.95} ${cy + bulbR} L ${cx - bulbR * 0.95} ${cy + bulbR} Z`} fill={fill} opacity="0.75" />
        </V>
      );
    }
    case "flask-florence": {
      const bulbR = Math.min(w, h) * 0.4;
      const cx = w / 2, cy = h - bulbR - 6;
      return (
        <V>
          <rect x={cx - 6} y="2" width="12" height={cy - bulbR + 4} {...s} fill="none" />
          <circle cx={cx} cy={cy} r={bulbR} {...s} fill="none" />
          <line x1={cx - bulbR * 0.7} y1={h - 4} x2={cx + bulbR * 0.7} y2={h - 4} {...s} fill="none" />
          <path d={`M ${cx - bulbR * 0.95} ${cy + bulbR * 0.2} A ${bulbR} ${bulbR} 0 0 0 ${cx + bulbR * 0.95} ${cy + bulbR * 0.2} L ${cx + bulbR * 0.7} ${h - 4} L ${cx - bulbR * 0.7} ${h - 4} Z`} fill={fill} opacity="0.75" />
        </V>
      );
    }
    case "flask-volumetric": {
      const bulbR = w * 0.45;
      const cx = w / 2, cy = h - bulbR - 4;
      return (
        <V>
          <rect x={cx - 5} y="2" width="10" height={cy - bulbR + 4} {...s} fill="none" />
          <line x1={cx - 5} y1={h * 0.32} x2={cx + 5} y2={h * 0.32} stroke={color} strokeWidth="1.2" />
          <path d={`M ${cx - bulbR} ${cy} Q ${cx - bulbR} ${cy + bulbR} ${cx} ${h - 4} Q ${cx + bulbR} ${cy + bulbR} ${cx + bulbR} ${cy} Q ${cx} ${cy - bulbR * 0.4} ${cx - bulbR} ${cy} Z`} {...s} fill={fill} fillOpacity="0.5" />
        </V>
      );
    }
    case "test-tube":
      return (
        <V>
          <path d={`M2 2 L${w - 2} 2 L${w - 2} ${h - w / 2} Q${w - 2} ${h - 2} ${w / 2} ${h - 2} Q2 ${h - 2} 2 ${h - w / 2} Z`} {...s} fill="none" />
          <path d={`M4 ${h * 0.55} L${w - 4} ${h * 0.55} L${w - 4} ${h - w / 2} Q${w - 4} ${h - 4} ${w / 2} ${h - 4} Q4 ${h - 4} 4 ${h - w / 2} Z`} fill={fill} opacity="0.85" />
        </V>
      );
    case "boiling-tube":
      return (
        <V>
          <path d={`M3 2 L${w - 3} 2 L${w - 3} ${h - w / 2} Q${w - 3} ${h - 2} ${w / 2} ${h - 2} Q3 ${h - 2} 3 ${h - w / 2} Z`} {...s} fill="none" strokeWidth="2.2" />
          <path d={`M6 ${h * 0.45} L${w - 6} ${h * 0.45} L${w - 6} ${h - w / 2} Q${w - 6} ${h - 4} ${w / 2} ${h - 4} Q6 ${h - 4} 6 ${h - w / 2} Z`} fill={fill} opacity="0.85" />
        </V>
      );
    case "cylinder":
      return (
        <V>
          <rect x="4" y="4" width={w - 8} height={h - 14} rx="3" {...s} fill="none" />
          <rect x="6" y={h * 0.35} width={w - 12} height={h * 0.55} fill={fill} opacity="0.8" />
          <ellipse cx={w / 2} cy={h - 6} rx={w / 2 - 2} ry="4" {...s} fill="none" />
          {Array.from({ length: 6 }).map((_, i) => (
            <line key={i} x1={w - 10} y1={10 + i * ((h - 30) / 6)} x2={w - 6} y2={10 + i * ((h - 30) / 6)} stroke={color} strokeWidth="1" />
          ))}
        </V>
      );
    case "watch-glass":
      return (
        <V>
          <path d={`M4 ${h - 4} Q${w / 2} -4 ${w - 4} ${h - 4} Z`} fill={fill} {...s} />
        </V>
      );
    case "petri-dish":
      return (
        <V>
          <ellipse cx={w / 2} cy={h - 6} rx={w / 2 - 4} ry={h / 3} fill={fill} {...s} />
          <ellipse cx={w / 2} cy={h - 6} rx={w / 2 - 2} ry={h / 3 + 2} {...s} fill="none" />
        </V>
      );
    case "bottle": {
      const neckW = w * 0.35;
      return (
        <V>
          <rect x={(w - neckW) / 2} y="2" width={neckW} height={h * 0.18} {...s} fill={color} fillOpacity="0.4" />
          <rect x={(w - neckW) / 2 - 2} y={h * 0.18} width={neckW + 4} height="4" {...s} fill={color} />
          <path d={`M6 ${h * 0.28} Q6 ${h * 0.24} 12 ${h * 0.24} L${w - 12} ${h * 0.24} Q${w - 6} ${h * 0.24} ${w - 6} ${h * 0.28} L${w - 6} ${h - 6} Q${w - 6} ${h - 2} ${w - 10} ${h - 2} L10 ${h - 2} Q6 ${h - 2} 6 ${h - 6} Z`} {...s} fill={fill} fillOpacity="0.55" />
        </V>
      );
    }
    case "crucible":
      return (
        <V>
          <path d={`M${w * 0.15} ${h * 0.3} L${w * 0.85} ${h * 0.3} L${w * 0.75} ${h - 4} L${w * 0.25} ${h - 4} Z`} {...s} fill={fill} fillOpacity="0.6" />
          <ellipse cx={w / 2} cy={h * 0.28} rx={w * 0.4} ry="5" {...s} fill={fill} />
          <ellipse cx={w / 2} cy={h * 0.22} rx={w * 0.25} ry="3" {...s} fill={color} fillOpacity="0.3" />
        </V>
      );
    case "evap-dish":
      return (
        <V>
          <path d={`M4 ${h * 0.35} Q${w / 2} ${h + 8} ${w - 4} ${h * 0.35} Z`} {...s} fill={fill} fillOpacity="0.7" />
          <path d={`M${w - 8} ${h * 0.35} l6 -2`} {...s} fill="none" />
        </V>
      );
    case "desiccator":
      return (
        <V>
          <path d={`M6 ${h * 0.35} Q${w / 2} 2 ${w - 6} ${h * 0.35}`} {...s} fill="none" />
          <rect x="6" y={h * 0.35} width={w - 12} height={h * 0.55} {...s} fill={fill} fillOpacity="0.4" />
          <line x1="6" y1={h * 0.6} x2={w - 6} y2={h * 0.6} {...s} fill="none" strokeDasharray="3 3" />
          <ellipse cx={w / 2} cy={h - 4} rx={w / 2 - 4} ry="4" {...s} fill="none" />
        </V>
      );
    case "pipette":
      return (
        <V>
          <rect x={w / 2 - 2} y="2" width="4" height={h * 0.15} {...s} fill={color} fillOpacity="0.4" />
          <ellipse cx={w / 2} cy={h * 0.35} rx={w / 2 - 2} ry={h * 0.18} {...s} fill={fill} fillOpacity="0.6" />
          <path d={`M${w / 2 - 3} ${h * 0.53} L${w / 2 - 1} ${h - 2} L${w / 2 + 1} ${h - 2} L${w / 2 + 3} ${h * 0.53} Z`} {...s} fill={fill} fillOpacity="0.6" />
        </V>
      );
    case "burette":
      return (
        <V>
          <rect x={w / 2 - 8} y="2" width="16" height={h - 30} rx="4" {...s} fill="none" />
          <rect x={w / 2 - 6} y="10" width="12" height={h - 50} fill={fill} opacity="0.8" />
          <circle cx={w / 2} cy={h - 18} r="8" {...s} fill={DARK_ACCENT} />
          <line x1={w / 2 - 12} y1={h - 18} x2={w / 2 + 12} y2={h - 18} stroke={color} strokeWidth="2" />
          {Array.from({ length: 8 }).map((_, i) => (
            <line key={i} x1={w / 2 + 4} y1={12 + i * ((h - 60) / 8)} x2={w / 2 + 8} y2={12 + i * ((h - 60) / 8)} stroke={color} strokeWidth="1" />
          ))}
        </V>
      );
    case "funnel":
      return (
        <V>
          <path d={`M4 4 L${w - 4} 4 L${w / 2 + 6} ${h * 0.7} L${w / 2 + 6} ${h - 4} L${w / 2 - 6} ${h - 4} L${w / 2 - 6} ${h * 0.7} Z`} {...s} fill="none" />
          <path d={`M10 8 L${w - 10} 8 L${w / 2 + 4} ${h * 0.55} L${w / 2 - 4} ${h * 0.55} Z`} fill={fill} opacity="0.7" />
        </V>
      );
    case "sep-funnel":
      return (
        <V>
          <rect x={w / 2 - 5} y="2" width="10" height="10" {...s} fill="none" />
          <path d={`M6 ${h * 0.12} L${w - 6} ${h * 0.12} L${w / 2 + 4} ${h * 0.72} L${w / 2 + 4} ${h - 20} L${w / 2 - 4} ${h - 20} L${w / 2 - 4} ${h * 0.72} Z`} {...s} fill={fill} fillOpacity="0.6" />
          <circle cx={w / 2 + 8} cy={h - 22} r="4" {...s} fill={color} fillOpacity="0.4" />
          <rect x={w / 2 - 2} y={h - 20} width="4" height="14" {...s} fill="none" />
        </V>
      );
    case "buchner-funnel":
      return (
        <V>
          <rect x="4" y="4" width={w - 8} height={h * 0.55} {...s} fill={fill} fillOpacity="0.5" />
          <line x1="6" y1={h * 0.45} x2={w - 6} y2={h * 0.45} {...s} fill="none" strokeDasharray="2 3" />
          <rect x={w / 2 - 5} y={h * 0.6} width="10" height={h * 0.4} {...s} fill="none" />
        </V>
      );
    case "buchner-flask":
      return (
        <V>
          <rect x={w / 2 - 6} y="4" width="12" height={h * 0.2} {...s} fill="none" />
          <path d={`M12 ${h * 0.28} L${w - 12} ${h * 0.28} L${w - 6} ${h - 6} L6 ${h - 6} Z`} {...s} fill={fill} fillOpacity="0.6" />
          <rect x={w - 6} y={h * 0.35} width={w * 0.15} height="6" {...s} fill="none" />
        </V>
      );
    case "condenser":
      return (
        <V>
          <rect x={w / 2 - 6} y="2" width="12" height={h - 4} rx="3" fill={color} opacity="0.15" {...s} />
          <rect x="4" y="20" width={w - 8} height={h - 40} rx="8" {...s} fill="none" />
          {Array.from({ length: 6 }).map((_, i) => (
            <path key={i} d={`M8 ${28 + i * ((h - 60) / 6)} Q${w / 2} ${34 + i * ((h - 60) / 6)} ${w - 8} ${28 + i * ((h - 60) / 6)}`} stroke={fill} strokeWidth="1.5" fill="none" />
          ))}
        </V>
      );
    case "retort": {
      const bulbR = Math.min(w, h) * 0.35;
      const cx = bulbR + 6, cy = h / 2;
      return (
        <V>
          <circle cx={cx} cy={cy} r={bulbR} {...s} fill={fill} fillOpacity="0.4" />
          <path d={`M ${cx + bulbR - 2} ${cy} Q ${w - 20} ${cy - 10} ${w - 8} ${h - 10}`} {...s} fill="none" />
        </V>
      );
    }
    case "rod":
      return (
        <V>
          <rect x={w / 2 - 3} y="4" width="6" height={h - 8} rx="3" {...s} fill={fill} fillOpacity="0.5" />
        </V>
      );
    case "burner":
      return (
        <V>
          <ellipse cx={w / 2} cy={h - 6} rx={w / 2 - 2} ry="5" fill={color} />
          <rect x={w / 2 - 12} y={h * 0.35} width="24" height={h * 0.55} fill={color} />
          <rect x={w / 2 - 8} y={h * 0.15} width="16" height={h * 0.25} fill={color} />
          <path d={`M${w / 2 - 8} ${h * 0.15} Q${w / 2} -4 ${w / 2 + 8} ${h * 0.15}`} fill={fill} opacity="0.9" />
          <path d={`M${w / 2 - 5} ${h * 0.15} Q${w / 2} 4 ${w / 2 + 5} ${h * 0.15}`} fill="#F5D76E" opacity="0.9" />
        </V>
      );
    case "tripod":
      return (
        <V>
          <circle cx={w / 2} cy={h * 0.35} r={w * 0.35} {...s} fill="none" strokeWidth="2.5" />
          <line x1={w / 2} y1={h * 0.35} x2={w * 0.1} y2={h - 4} {...s} fill="none" strokeWidth="2.5" />
          <line x1={w / 2} y1={h * 0.35} x2={w * 0.9} y2={h - 4} {...s} fill="none" strokeWidth="2.5" />
          <line x1={w / 2} y1={h * 0.35} x2={w / 2} y2={h - 4} {...s} fill="none" strokeWidth="2.5" />
        </V>
      );
    case "gauze":
      return (
        <V>
          <rect x="2" y="2" width={w - 4} height={h - 4} {...s} fill={fill} fillOpacity="0.4" />
          {Array.from({ length: 8 }).map((_, i) => <line key={"v" + i} x1={2 + i * ((w - 4) / 8)} y1="2" x2={2 + i * ((w - 4) / 8)} y2={h - 2} stroke={color} strokeWidth="0.6" />)}
          {Array.from({ length: 3 }).map((_, i) => <line key={"h" + i} x1="2" y1={2 + i * ((h - 4) / 3)} x2={w - 2} y2={2 + i * ((h - 4) / 3)} stroke={color} strokeWidth="0.6" />)}
          <circle cx={w / 2} cy={h / 2} r={Math.min(w, h) * 0.2} fill="#F1E6D0" {...s} />
        </V>
      );
    case "hotplate":
      return (
        <V>
          <rect x="2" y={h * 0.3} width={w - 4} height={h * 0.6} rx="4" {...s} fill={color} fillOpacity="0.3" />
          <ellipse cx={w * 0.35} cy={h * 0.55} rx={w * 0.22} ry={h * 0.12} fill={fill} {...s} />
          <circle cx={w * 0.75} cy={h * 0.55} r="6" {...s} fill="#E7EAF2" />
          <circle cx={w * 0.9} cy={h * 0.55} r="4" {...s} fill={RED_ACCENT} />
        </V>
      );
    case "water-bath":
      return (
        <V>
          <rect x="2" y={h * 0.3} width={w - 4} height={h * 0.65} rx="4" {...s} fill={fill} fillOpacity="0.5" />
          <path d={`M4 ${h * 0.4} Q${w * 0.25} ${h * 0.34} ${w / 2} ${h * 0.4} T ${w - 4} ${h * 0.4}`} {...s} fill="none" />
          {[0.3, 0.5, 0.7].map((r, i) => <circle key={i} cx={w / 2} cy={h * 0.6} r={w * r * 0.3} {...s} fill="none" />)}
        </V>
      );
    case "tongs":
      return (
        <V>
          <path d={`M4 ${h / 2} L${w * 0.7} ${h / 2 - 4} L${w - 4} ${h / 2 - 8}`} {...s} fill="none" strokeWidth="2.4" />
          <path d={`M4 ${h / 2} L${w * 0.7} ${h / 2 + 4} L${w - 4} ${h / 2 + 8}`} {...s} fill="none" strokeWidth="2.4" />
          <circle cx={w * 0.35} cy={h / 2} r="3" fill={color} />
        </V>
      );
    case "stand":
      return (
        <V>
          <rect x={w / 2 - 20} y={h - 10} width="40" height="8" rx="2" {...s} fill={color} fillOpacity="0.5" />
          <rect x={w / 2 - 3} y="4" width="6" height={h - 12} {...s} fill={color} fillOpacity="0.5" />
          <rect x={w / 2 + 2} y={h * 0.25} width={w * 0.4} height="6" {...s} fill={color} />
          <circle cx={w / 2 + 4} cy={h * 0.28} r="3" fill={color} />
        </V>
      );
    case "clamp":
      return (
        <V>
          <rect x="4" y={h / 2 - 3} width={w * 0.6} height="6" {...s} fill={color} fillOpacity="0.5" />
          <path d={`M${w * 0.6} 4 Q${w - 8} 4 ${w - 4} ${h / 2} Q${w - 8} ${h - 4} ${w * 0.6} ${h - 4}`} {...s} fill="none" strokeWidth="2.4" />
          <circle cx={w * 0.65} cy={h / 2} r="3" fill={color} />
        </V>
      );
    case "ring":
      return (
        <V>
          <ellipse cx={w * 0.55} cy={h / 2} rx={w * 0.35} ry={h * 0.35} {...s} fill="none" strokeWidth="3" />
          <rect x="2" y={h / 2 - 2} width={w * 0.25} height="4" {...s} fill={color} />
        </V>
      );
    case "rack":
      return (
        <V>
          <rect x="2" y={h * 0.55} width={w - 4} height={h * 0.4} rx="3" {...s} fill={fill} />
          <rect x="2" y={h * 0.2} width={w - 4} height="6" {...s} fill={fill} />
          {Array.from({ length: 6 }).map((_, i) => (
            <circle key={i} cx={6 + i * ((w - 12) / 5)} cy={h * 0.23} r="4" {...s} fill="#fff" />
          ))}
        </V>
      );
    case "balance":
      return (
        <V>
          <rect x="2" y={h * 0.35} width={w - 4} height={h * 0.6} rx="4" {...s} fill={fill} />
          <rect x={w * 0.15} y={h * 0.5} width={w * 0.4} height={h * 0.18} {...s} fill="#B7F0BF" />
          <text x={w * 0.35} y={h * 0.65} fontSize="10" fill={color} textAnchor="middle" fontFamily="monospace">0.000</text>
          <rect x={w * 0.6} y={h * 0.2} width={w * 0.3} height="4" {...s} fill="#C9CED8" />
          <circle cx={w * 0.75} cy={h * 0.15} r="6" {...s} fill="#C9CED8" />
        </V>
      );
    case "thermometer":
      return (
        <V>
          <rect x={w / 2 - 3} y="6" width="6" height={h - 20} rx="3" {...s} fill="#fff" />
          <rect x={w / 2 - 2} y={h * 0.4} width="4" height={h * 0.5} fill={fill} />
          <circle cx={w / 2} cy={h - 8} r="6" {...s} fill={fill} />
          {Array.from({ length: 6 }).map((_, i) => <line key={i} x1={w / 2 + 3} y1={10 + i * ((h - 30) / 6)} x2={w / 2 + 6} y2={10 + i * ((h - 30) / 6)} stroke={color} strokeWidth="0.8" />)}
        </V>
      );
    case "ph-meter":
      return (
        <V>
          <rect x="2" y={h * 0.4} width={w * 0.6} height={h * 0.55} rx="4" {...s} fill="#E7EAF2" />
          <rect x={w * 0.08} y={h * 0.5} width={w * 0.45} height={h * 0.2} {...s} fill="#B7F0BF" />
          <text x={w * 0.3} y={h * 0.66} fontSize="9" fill={color} textAnchor="middle" fontFamily="monospace">pH 7.0</text>
          <path d={`M${w * 0.65} ${h * 0.45} Q${w - 10} ${h * 0.1} ${w - 6} ${h - 4}`} {...s} fill="none" />
          <circle cx={w - 6} cy={h - 4} r="4" {...s} fill={fill} />
        </V>
      );
    case "stopwatch":
      return (
        <V>
          <rect x={w / 2 - 4} y="2" width="8" height="4" {...s} fill={color} />
          <circle cx={w / 2} cy={h - w / 2 - 2} r={w / 2 - 3} {...s} fill={fill} />
          <line x1={w / 2} y1={h - w / 2 - 2} x2={w / 2} y2={h - w + 2} stroke={color} strokeWidth="1.5" />
          <line x1={w / 2} y1={h - w / 2 - 2} x2={w * 0.75} y2={h - w / 2 - 2} stroke={RED_ACCENT} strokeWidth="1.5" />
        </V>
      );
    case "spatula":
      return (
        <V>
          <rect x={w * 0.25} y={h / 2 - 3} width={w * 0.5} height="6" {...s} fill="#C9B27A" />
          <path d={`M2 ${h / 2} l${w * 0.25} -4 l0 8 Z`} {...s} fill={fill} />
          <path d={`M${w - 2} ${h / 2} l-${w * 0.25} -4 l0 8 Z`} {...s} fill={fill} />
        </V>
      );
    case "forceps":
      return (
        <V>
          <path d={`M4 ${h / 2} L${w - 8} ${h / 2 - 6}`} {...s} fill="none" strokeWidth="2.4" />
          <path d={`M4 ${h / 2} L${w - 8} ${h / 2 + 6}`} {...s} fill="none" strokeWidth="2.4" />
          <path d={`M${w - 8} ${h / 2 - 6} L${w - 2} ${h / 2 - 8}`} {...s} fill="none" strokeWidth="2.4" />
          <path d={`M${w - 8} ${h / 2 + 6} L${w - 2} ${h / 2 + 8}`} {...s} fill="none" strokeWidth="2.4" />
        </V>
      );
    case "mortar":
      return (
        <V>
          <path d={`M6 ${h * 0.35} Q${w / 2} ${h + 6} ${w - 6} ${h * 0.35}`} {...s} fill={fill} strokeWidth="2.4" />
          <ellipse cx={w / 2} cy={h * 0.35} rx={w / 2 - 6} ry="4" fill={color} fillOpacity="0.15" {...s} />
          <path d={`M${w * 0.75} ${h * 0.35} L${w - 6} 4`} {...s} fill="none" strokeWidth="6" strokeLinecap="round" />
          <circle cx={w - 6} cy="4" r="6" fill={color} />
        </V>
      );
    case "brush":
      return (
        <V>
          <rect x={w * 0.6} y={h / 2 - 2} width={w * 0.4} height="4" {...s} fill={METAL_ACCENT} />
          <g stroke={fill} strokeWidth="1.5">
            {Array.from({ length: 14 }).map((_, i) => (
              <line key={i} x1={4 + i * 4} y1={h / 2 - 8} x2={4 + i * 4} y2={h / 2 + 8} />
            ))}
          </g>
        </V>
      );
    case "paper":
      return (
        <V>
          <rect x="4" y="4" width={w - 8} height={h - 8} rx="3" {...s} fill={fill} />
          <line x1="8" y1={h * 0.3} x2={w - 8} y2={h * 0.3} stroke={color} strokeWidth="0.6" />
          <line x1="8" y1={h * 0.55} x2={w - 8} y2={h * 0.55} stroke={color} strokeWidth="0.6" />
        </V>
      );
    case "goggles":
      return (
        <V>
          <ellipse cx={w * 0.28} cy={h / 2} rx={w * 0.22} ry={h * 0.35} {...s} fill={fill} fillOpacity="0.5" />
          <ellipse cx={w * 0.72} cy={h / 2} rx={w * 0.22} ry={h * 0.35} {...s} fill={fill} fillOpacity="0.5" />
          <line x1={w * 0.5} y1={h / 2} x2={w * 0.5} y2={h / 2} {...s} fill="none" />
          <path d={`M${w * 0.5} ${h / 2 - 2} L${w * 0.5} ${h / 2 + 2}`} {...s} fill="none" strokeWidth="3" />
          <path d={`M2 ${h / 2} L${w * 0.06} ${h / 2}`} {...s} fill="none" strokeWidth="3" />
          <path d={`M${w - 2} ${h / 2} L${w * 0.94} ${h / 2}`} {...s} fill="none" strokeWidth="3" />
        </V>
      );
    case "coat":
      return (
        <V>
          <path d={`M${w * 0.3} 4 L${w * 0.15} ${h * 0.2} L${w * 0.1} ${h - 4} L${w - w * 0.1} ${h - 4} L${w - w * 0.15} ${h * 0.2} L${w - w * 0.3} 4 L${w / 2} ${h * 0.25} Z`} {...s} fill={fill} />
          <line x1={w / 2} y1={h * 0.25} x2={w / 2} y2={h - 4} {...s} fill="none" />
          {[0.4, 0.55, 0.7, 0.85].map((y, i) => <circle key={i} cx={w / 2} cy={h * y} r="2" fill={color} />)}
        </V>
      );
    case "gloves":
      return (
        <V>
          <path d={`M${w * 0.1} ${h - 4} L${w * 0.1} ${h * 0.35} Q${w * 0.1} ${h * 0.15} ${w * 0.25} ${h * 0.15} L${w * 0.25} ${h * 0.05} L${w * 0.4} ${h * 0.05} L${w * 0.4} ${h * 0.2} L${w * 0.55} ${h * 0.2} L${w * 0.55} 4 L${w * 0.7} 4 L${w * 0.7} ${h * 0.25} L${w * 0.85} ${h * 0.25} L${w * 0.9} ${h * 0.4} L${w * 0.9} ${h - 4} Z`} {...s} fill={fill} />
        </V>
      );
    case "fume-hood":
      return (
        <V>
          <rect x="4" y="4" width={w - 8} height={h - 8} rx="4" {...s} fill={fill} />
          <rect x="10" y={h * 0.2} width={w - 20} height={h * 0.5} {...s} fill={color} fillOpacity="0.1" />
          <rect x={w / 2 - 20} y="8" width="40" height="6" {...s} fill={color} />
          <rect x="10" y={h - 20} width={w - 20} height="8" {...s} fill={color} fillOpacity="0.4" />
        </V>
      );
    case "extinguisher":
      return (
        <V>
          <rect x={w / 2 - 3} y="2" width="6" height={h * 0.15} {...s} fill={color} />
          <rect x={w * 0.15} y={h * 0.18} width={w * 0.7} height={h * 0.8} rx={w * 0.3} {...s} fill={fill} />
          <rect x={w * 0.2} y={h * 0.35} width={w * 0.6} height={h * 0.15} {...s} fill="#fff" fillOpacity="0.3" />
        </V>
      );
    case "eyewash":
      return (
        <V>
          <rect x={w / 2 - 3} y={h * 0.6} width="6" height={h * 0.4} {...s} fill={color} />
          <ellipse cx={w / 2} cy={h * 0.6} rx={w * 0.4} ry="6" {...s} fill={fill} />
          <circle cx={w * 0.38} cy={h * 0.3} r="4" {...s} fill={fill} />
          <circle cx={w * 0.62} cy={h * 0.3} r="4" {...s} fill={fill} />
          <path d={`M${w * 0.38} ${h * 0.34} Q${w * 0.38} ${h * 0.5} ${w * 0.45} ${h * 0.58}`} {...s} fill="none" />
          <path d={`M${w * 0.62} ${h * 0.34} Q${w * 0.62} ${h * 0.5} ${w * 0.55} ${h * 0.58}`} {...s} fill="none" />
        </V>
      );
  }
}

// referenced constants used inside older switch cases
const DARK_ACCENT = "#232323";
const RED_ACCENT = "#E86A5C";
const METAL_ACCENT = "#8892A6";
