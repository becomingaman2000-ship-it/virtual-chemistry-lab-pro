import { motion } from "framer-motion";
import type { ReactNode } from "react";

/**
 * Page-level enter/exit animation.
 *
 * Deliberately animates only `opacity` and `y`. A `filter` — even a fully
 * settled `blur(0px)` — turns this wrapper into the containing block for
 * every `position: fixed` descendant, which silently re-anchors overlays
 * to the wrapper instead of the viewport: `fixed inset-0` backdrops grew
 * to the full scroll height of the page and centred their dialog
 * thousands of pixels below the fold, and context menus opened at the
 * pointer landed hundreds of pixels away.
 *
 * Overriding the filter afterwards via the `style` prop does not help,
 * because framer-motion's animated value wins over `style`. The only
 * reliable fix is never to put a filter on the wrapper at all.
 *
 * `y` is safe: framer-motion writes `transform: none` once it settles
 * back to 0, so no containing block survives the transition.
 */
export function PageTransition({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.5, ease: [0.2, 0.8, 0.2, 1] as const }}
    >
      {children}
    </motion.div>
  );
}
