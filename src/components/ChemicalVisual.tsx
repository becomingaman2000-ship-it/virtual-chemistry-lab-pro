import { motion } from "framer-motion";
import { useMemo } from "react";
import type { Chemical } from "@/data/chemicals";

/**
 * Visualises any chemical/substance based on its phase.
 * - liquid / aqueous: sloshing meniscus with bubbles inside a beaker frame
 * - solid: crystal/lump shapes
 * - gas / vapour: rising diffusion clouds
 * - flame: flickering triangular flame with hot core
 * All colors are pulled from the chemical's own palette (data-driven).
 */
export function ChemicalVisual({
  chem,
  size = 220,
}: {
  chem: Chemical;
  size?: number;
}) {
  const gradId = useMemo(() => `grad-${chem.id}-${Math.random().toString(36).slice(2, 6)}`, [chem.id]);
  const clipId = `clip-${gradId}`;
  const glowId = `glow-${gradId}`;

  return (
    <svg viewBox="0 0 240 240" className="h-full w-full" style={{ width: size, height: size }}>
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={chem.accent ?? chem.color} stopOpacity={chem.opacity ?? 0.9} />
          <stop offset="100%" stopColor={chem.color} stopOpacity={chem.opacity ?? 0.95} />
        </linearGradient>
        <radialGradient id={glowId} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={chem.accent ?? chem.color} stopOpacity="0.9" />
          <stop offset="100%" stopColor={chem.color} stopOpacity="0" />
        </radialGradient>
        <clipPath id={clipId}>
          <path d="M60 70 L60 200 Q60 215 75 215 L165 215 Q180 215 180 200 L180 70 Z" />
        </clipPath>
      </defs>

      {chem.glow && (
        <motion.circle
          cx="120"
          cy="120"
          r="90"
          fill={`url(#${glowId})`}
          animate={{ opacity: [0.6, 1, 0.6], scale: [0.95, 1.05, 0.95] }}
          transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
        />
      )}

      {chem.phase === "liquid" || chem.phase === "aqueous" ? (
        <LiquidView chem={chem} gradId={gradId} clipId={clipId} />
      ) : chem.phase === "solid" ? (
        <SolidView chem={chem} gradId={gradId} />
      ) : chem.phase === "gas" || chem.phase === "vapour" ? (
        <GasView chem={chem} gradId={gradId} />
      ) : chem.phase === "flame" ? (
        <FlameView chem={chem} gradId={gradId} />
      ) : null}
    </svg>
  );
}

/* ---------------- LIQUID (with real motion) ---------------- */
function LiquidView({
  chem,
  gradId,
  clipId,
}: {
  chem: Chemical;
  gradId: string;
  clipId: string;
}) {
  const bubbles = Array.from({ length: 8 });
  return (
    <>
      {/* beaker glass */}
      <path
        d="M60 70 L60 200 Q60 215 75 215 L165 215 Q180 215 180 200 L180 70 Z"
        fill="rgba(255,255,255,0.12)"
        stroke="rgba(27,42,74,0.5)"
        strokeWidth="2"
      />
      <rect x="72" y="55" width="96" height="18" rx="3" fill="rgba(255,255,255,0.1)" stroke="rgba(27,42,74,0.4)" strokeWidth="1.5" />

      {/* liquid body + moving surface, clipped to beaker */}
      <g clipPath={`url(#${clipId})`}>
        <rect x="60" y="130" width="120" height="90" fill={`url(#${gradId})`} />
        {/* wave 1 */}
        <motion.path
          fill={chem.accent ?? chem.color}
          fillOpacity={0.55}
          animate={{
            d: [
              "M55 132 Q90 118 120 132 T190 132 L190 150 L55 150 Z",
              "M55 132 Q90 146 120 132 T190 132 L190 150 L55 150 Z",
              "M55 132 Q90 118 120 132 T190 132 L190 150 L55 150 Z",
            ],
          }}
          transition={{ duration: 3.6, repeat: Infinity, ease: "easeInOut" }}
        />
        {/* wave 2 (lighter, offset) */}
        <motion.path
          fill="white"
          fillOpacity={0.22}
          animate={{
            d: [
              "M55 136 Q95 128 120 136 T190 136 L190 148 L55 148 Z",
              "M55 136 Q95 144 120 136 T190 136 L190 148 L55 148 Z",
              "M55 136 Q95 128 120 136 T190 136 L190 148 L55 148 Z",
            ],
          }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
        />

        {bubbles.map((_, i) => (
          <motion.circle
            key={i}
            cx={75 + (i * 14) % 90}
            r={1.6 + (i % 3)}
            fill="rgba(255,255,255,0.85)"
            initial={{ cy: 210, opacity: 0 }}
            animate={{ cy: [210, 138], opacity: [0, 0.9, 0] }}
            transition={{
              duration: 2 + (i % 4) * 0.35,
              repeat: Infinity,
              delay: i * 0.28,
              ease: "easeOut",
            }}
          />
        ))}

        {/* mercury-style highlight for pure metals/liquids that are opaque */}
        {chem.opacity && chem.opacity > 0.9 && (
          <ellipse cx="105" cy="140" rx="30" ry="4" fill="white" fillOpacity="0.35" />
        )}
      </g>

      {/* graduation ticks */}
      {[100, 130, 160, 190].map((y) => (
        <line key={y} x1="165" y1={y} x2="175" y2={y} stroke="rgba(27,42,74,0.5)" strokeWidth="1.2" />
      ))}
    </>
  );
}

/* ---------------- SOLID ---------------- */
function SolidView({ chem, gradId }: { chem: Chemical; gradId: string }) {
  return (
    <g>
      {/* powder pile / lump crystals */}
      <ellipse cx="120" cy="200" rx="70" ry="10" fill="rgba(0,0,0,0.15)" />
      <motion.g
        animate={{ y: [0, -2, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      >
        <polygon points="70,190 100,120 130,180" fill={`url(#${gradId})`} stroke="rgba(0,0,0,0.25)" strokeWidth="1.5" />
        <polygon points="110,195 145,110 175,190" fill={`url(#${gradId})`} stroke="rgba(0,0,0,0.3)" strokeWidth="1.5" />
        <polygon points="95,195 118,155 145,195" fill={chem.accent ?? chem.color} opacity="0.85" stroke="rgba(0,0,0,0.2)" strokeWidth="1.2" />
        {/* crystal highlight */}
        <line x1="102" y1="180" x2="112" y2="140" stroke="white" strokeOpacity="0.55" strokeWidth="2" strokeLinecap="round" />
        <line x1="150" y1="180" x2="160" y2="130" stroke="white" strokeOpacity="0.5" strokeWidth="2" strokeLinecap="round" />
      </motion.g>
    </g>
  );
}

/* ---------------- GAS / VAPOUR (rising diffusion) ---------------- */
function GasView({ chem, gradId }: { chem: Chemical; gradId: string }) {
  const puffs = Array.from({ length: 9 });
  return (
    <g>
      {/* container floor hint */}
      <ellipse cx="120" cy="215" rx="80" ry="6" fill="rgba(0,0,0,0.12)" />
      {puffs.map((_, i) => {
        const cx = 60 + (i * 20) % 140;
        const r = 16 + (i % 4) * 6;
        const delay = i * 0.4;
        return (
          <motion.circle
            key={i}
            cx={cx}
            fill={`url(#${gradId})`}
            initial={{ cy: 210, r: r * 0.4, opacity: 0 }}
            animate={{
              cy: [210, 60],
              r: [r * 0.4, r * 1.2],
              opacity: [0, chem.opacity ?? 0.5, 0],
            }}
            transition={{
              duration: 4.5 + (i % 3) * 0.6,
              repeat: Infinity,
              delay,
              ease: "easeOut",
            }}
          />
        );
      })}
      {/* drifting horizontal wisp */}
      <motion.ellipse
        cx="120"
        cy="120"
        rx="60"
        ry="14"
        fill={chem.accent ?? chem.color}
        opacity={0.25}
        animate={{ cx: [90, 150, 90], opacity: [0.15, 0.35, 0.15] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />
    </g>
  );
}

/* ---------------- FLAME (flickering) ---------------- */
function FlameView({ chem, gradId }: { chem: Chemical; gradId: string }) {
  return (
    <g>
      {/* wick / base */}
      <rect x="110" y="200" width="20" height="14" rx="3" fill="#2A2A2E" />
      <line x1="120" y1="195" x2="120" y2="212" stroke="#111" strokeWidth="2" />

      {/* outer flame */}
      <motion.path
        d="M120 60 C90 130 90 170 120 205 C150 170 150 130 120 60 Z"
        fill={`url(#${gradId})`}
        opacity={0.9}
        animate={{
          d: [
            "M120 60 C90 130 90 170 120 205 C150 170 150 130 120 60 Z",
            "M120 55 C86 130 92 172 120 205 C154 170 148 128 120 55 Z",
            "M120 65 C92 128 88 170 120 205 C150 168 152 132 120 65 Z",
            "M120 60 C90 130 90 170 120 205 C150 170 150 130 120 60 Z",
          ],
          opacity: [0.85, 1, 0.85],
        }}
        transition={{ duration: 0.9, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* hot core */}
      <motion.path
        d="M120 110 C108 150 108 180 120 200 C132 180 132 150 120 110 Z"
        fill={chem.accent ?? "#FFFFFF"}
        opacity={0.9}
        animate={{
          d: [
            "M120 110 C108 150 108 180 120 200 C132 180 132 150 120 110 Z",
            "M120 115 C106 152 110 182 120 200 C134 178 130 148 120 115 Z",
            "M120 108 C110 148 106 180 120 200 C134 182 130 150 120 108 Z",
            "M120 110 C108 150 108 180 120 200 C132 180 132 150 120 110 Z",
          ],
          opacity: [0.8, 1, 0.8],
        }}
        transition={{ duration: 0.7, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* white-hot centre */}
      <motion.ellipse
        cx="120"
        cy="180"
        rx="6"
        ry="14"
        fill="white"
        opacity="0.9"
        animate={{ ry: [10, 16, 10], opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 0.5, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* sparks */}
      {[0, 1, 2, 3].map((i) => (
        <motion.circle
          key={i}
          cx={110 + i * 6}
          r={1.5}
          fill={chem.accent ?? "#FFF"}
          initial={{ cy: 190, opacity: 0 }}
          animate={{ cy: [190, 40], opacity: [0, 1, 0] }}
          transition={{ duration: 1.8 + i * 0.2, repeat: Infinity, delay: i * 0.3, ease: "easeOut" }}
        />
      ))}
    </g>
  );
}
