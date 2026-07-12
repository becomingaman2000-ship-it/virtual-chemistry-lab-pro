import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowLeft, Sparkles } from "lucide-react";
import { PageTransition } from "./PageTransition";

export function ComingSoon({ label, piece, note }: { label: string; piece: string; note: string }) {
  return (
    <PageTransition>
      <section className="px-4 py-24">
        <div className="glass mx-auto max-w-3xl rounded-3xl p-10 text-center md:p-16">
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="mx-auto mb-6 grid h-16 w-16 place-items-center rounded-2xl bg-aurora animate-aurora text-white"
          >
            <Sparkles size={26} />
          </motion.div>
          <div className="text-xs font-mono uppercase tracking-widest text-turquoise">{piece} · Shipping next</div>
          <h1 className="mt-3 text-4xl font-semibold md:text-5xl" style={{ fontFamily: "var(--font-display)" }}>
            <span className="text-gradient">{label}</span>
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-muted-foreground">{note}</p>
          <Link to="/" className="mt-8 inline-flex items-center gap-2 rounded-full bg-navy px-5 py-2.5 text-sm font-medium text-peach dark:bg-turquoise dark:text-charcoal">
            <ArrowLeft size={16} /> Back home
          </Link>
        </div>
      </section>
    </PageTransition>
  );
}
