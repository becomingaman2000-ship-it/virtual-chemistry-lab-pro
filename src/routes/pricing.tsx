import { createFileRoute, Link } from "@tanstack/react-router";
import { PageTransition } from "@/components/PageTransition";
export const Route = createFileRoute("/pricing")({
  head: () => ({ meta: [{ title: "ChemVM — Pricing" }] }),
  component: () => (
    <PageTransition>
      <section className="px-4 py-24 text-center">
        <div className="glass mx-auto max-w-2xl rounded-3xl p-12">
          <h1 className="text-4xl font-semibold text-gradient" style={{ fontFamily: "var(--font-display)" }}>Pricing</h1>
          <p className="mt-3 text-muted-foreground">See the full pricing table on the home page.</p>
          <Link to="/" hash="pricing" className="mt-6 inline-flex rounded-full bg-navy px-5 py-2.5 text-sm text-peach dark:bg-turquoise dark:text-charcoal">Home</Link>
        </div>
      </section>
    </PageTransition>
  ),
});
