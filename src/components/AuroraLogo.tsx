import { motion } from "framer-motion";

type Props = { size?: number; className?: string; label?: string };

/**
 * Aurora signal-bars logo — 5 rising bars, each filled with an animated
 * aurora gradient (blue → red → purple → navy).
 */
export function AuroraLogo({ size = 32, className, label = "ChemVM" }: Props) {
  const bars = [0.35, 0.5, 0.68, 0.85, 1];
  return (
    <div className={`flex items-center gap-2.5 ${className ?? ""}`}>
      <div
        className="relative flex items-end gap-[3px]"
        style={{ height: size, width: size * 1.15 }}
        aria-hidden
      >
        {bars.map((h, i) => (
          <div
            key={i}
            className="relative overflow-hidden rounded-[2px]"
            style={{ width: size * 0.14, height: size * h }}
          >
            <motion.div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(180deg, #2F7A6E 0%, #3B82F6 25%, #7C3AED 55%, #EF4444 78%, #1B2A4A 100%)",
                backgroundSize: "100% 300%",
              }}
              animate={{ backgroundPosition: ["0% 0%", "0% 100%", "0% 0%"] }}
              transition={{ duration: 3.6 + i * 0.25, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
              className="absolute inset-0 mix-blend-overlay"
              style={{
                background:
                  "linear-gradient(180deg, transparent 0%, rgba(255,255,255,0.55) 50%, transparent 100%)",
              }}
              animate={{ y: ["120%", "-120%"] }}
              transition={{ duration: 2.4 + i * 0.3, repeat: Infinity, ease: "linear" }}
            />
          </div>
        ))}
      </div>
      {label && (
        <span
          className="text-lg font-semibold tracking-tight"
          style={{ fontFamily: "var(--font-display)" }}
        >
          <span className="text-gradient">{label}</span>
        </span>
      )}
    </div>
  );
}
