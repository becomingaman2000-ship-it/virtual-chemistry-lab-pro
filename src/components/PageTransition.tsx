import { motion } from "framer-motion";
import { useState, type ReactNode } from "react";

/**
 * Page-level enter/exit animation.
 *
 * The blur is dropped from the style entirely once the entrance finishes.
 * A `filter` (even `blur(0px)`) makes the element a containing block for
 * `position: fixed` descendants, which silently re-anchors every fixed
 * overlay inside the page — context menus opened at the pointer landed
 * hundreds of pixels away, and `fixed inset-0` modal backdrops sized
 * themselves to this wrapper instead of the viewport.
 */
export function PageTransition({ children }: { children: ReactNode }) {
  const [settled, setSettled] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, filter: "blur(6px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      exit={{ opacity: 0, y: -8, filter: "blur(4px)" }}
      transition={{ duration: 0.5, ease: [0.2, 0.8, 0.2, 1] as const }}
      onAnimationComplete={() => setSettled(true)}
      style={settled ? { filter: "none" } : undefined}
    >
      {children}
    </motion.div>
  );
}
