import { motion } from "framer-motion";

/** Animated hero beaker — SVG with liquid, bubbles, and swirling aurora glow. */
export function BeakerAnimation({ className }: { className?: string }) {
  const bubbles = Array.from({ length: 7 });
  return (
    <div className={`relative ${className ?? ""}`}>
      {/* aurora glow behind */}
      <motion.div
        className="absolute inset-0 -z-10 rounded-full bg-aurora animate-aurora blur-3xl opacity-70"
        animate={{ scale: [1, 1.08, 1] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />

      <svg viewBox="0 0 220 260" className="h-full w-full drop-shadow-2xl">
        <defs>
          <linearGradient id="liquid" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2F7A6E" />
            <stop offset="50%" stopColor="#3B82F6" />
            <stop offset="100%" stopColor="#7C3AED" />
          </linearGradient>
          <linearGradient id="glass" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="white" stopOpacity="0.5" />
            <stop offset="100%" stopColor="white" stopOpacity="0.05" />
          </linearGradient>
          <clipPath id="beakerClip">
            <path d="M55 70 L55 220 Q55 240 75 240 L145 240 Q165 240 165 220 L165 70 Z" />
          </clipPath>
        </defs>

        {/* neck */}
        <rect x="80" y="30" width="60" height="45" rx="3" fill="url(#glass)" stroke="rgba(27,42,74,0.35)" strokeWidth="1.5" />

        {/* body outline */}
        <path
          d="M55 70 L55 220 Q55 240 75 240 L145 240 Q165 240 165 220 L165 70 Z"
          fill="url(#glass)"
          stroke="rgba(27,42,74,0.55)"
          strokeWidth="2"
        />

        {/* liquid */}
        <g clipPath="url(#beakerClip)">
          <motion.rect
            x="55"
            y="130"
            width="110"
            height="110"
            fill="url(#liquid)"
            animate={{ y: [130, 128, 132, 130] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          />
          {/* liquid surface wave */}
          <motion.path
            d="M55 130 Q80 122 110 130 T165 130 L165 145 L55 145 Z"
            fill="rgba(255,255,255,0.25)"
            animate={{ d: [
              "M55 130 Q80 122 110 130 T165 130 L165 145 L55 145 Z",
              "M55 130 Q80 138 110 130 T165 130 L165 145 L55 145 Z",
              "M55 130 Q80 122 110 130 T165 130 L165 145 L55 145 Z",
            ] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* bubbles */}
          {bubbles.map((_, i) => (
            <motion.circle
              key={i}
              cx={70 + (i * 13) % 90}
              cy={225}
              r={2 + (i % 3)}
              fill="rgba(255,255,255,0.75)"
              initial={{ y: 0, opacity: 0 }}
              animate={{ y: [-0, -95], opacity: [0, 0.9, 0] }}
              transition={{
                duration: 2.2 + (i % 4) * 0.4,
                repeat: Infinity,
                delay: i * 0.35,
                ease: "easeOut",
              }}
            />
          ))}
        </g>

        {/* highlight */}
        <path d="M62 80 L62 215" stroke="white" strokeOpacity="0.35" strokeWidth="4" strokeLinecap="round" />
        {/* graduation marks */}
        {[100, 130, 160, 190].map((y) => (
          <line key={y} x1="150" y1={y} x2="160" y2={y} stroke="rgba(27,42,74,0.5)" strokeWidth="1.2" />
        ))}
      </svg>
    </div>
  );
}
