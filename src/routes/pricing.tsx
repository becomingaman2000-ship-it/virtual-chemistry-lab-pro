import { createFileRoute } from "@tanstack/react-router";
import { PageTransition } from "@/components/PageTransition";
import { Check, Sparkles } from "lucide-react";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "ChemVM — Pricing" },
      { name: "description", content: "Free tier, Student at $7/mo, flexible Dynamic plan, and All-Access to the Project X Library." },
      { property: "og:title", content: "ChemVM — Pricing" },
      { property: "og:description", content: "Choose the plan that matches your syllabus and pace." },
    ],
  }),
  component: PricingPage,
});

const TIERS = [
  {
    name: "Free", price: "$0", cadence: "forever",
    tagline: "Try the lab with the essentials.",
    features: ["Sandbox lab access", "3 sample experiments", "Basic apparatus & chemicals", "Community support"],
    cta: "Get started",
  },
  {
    name: "Student", price: "$7", cadence: "/ month",
    tagline: "Everything a full-time student needs.",
    features: ["All 112 syllabus experiments", "PDF report export", "All syllabi (ZIMSEC, Cambridge, WAEC…)", "Periodic table & atom builder Pro", "Priority email support"],
    cta: "Start Student",
  },
  {
    name: "Dynamic", price: "Flexible", cadence: "pay for what you use",
    tagline: "À-la-carte tool access — the recommended plan for hybrid learners.",
    features: ["Everything in Student", "Per-tool purchases (add periodic Pro, structure gallery, etc.)", "Monthly credit bundles", "Cancel anytime"],
    cta: "Configure Dynamic",
    highlight: true,
  },
  {
    name: "Project X Library", price: "$29", cadence: "/ month",
    tagline: "All-access to every current and future ChemVM tool.",
    features: ["Everything in Dynamic", "Full Project X content library", "Molecular structure gallery Pro", "Early access to new labs", "Priority live support"],
    cta: "Go All-Access",
  },
];

function PricingPage() {
  return (
    <PageTransition>
      <section className="mx-auto max-w-7xl px-4 py-16">
        <div className="text-center">
          <h1 className="text-4xl font-semibold text-gradient" style={{ fontFamily: "var(--font-display)" }}>Simple, honest pricing</h1>
          <p className="mt-3 text-muted-foreground">Free to explore. Upgrade when you're ready for the full syllabus and PDF reports.</p>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {TIERS.map((t) => (
            <div key={t.name}
              className={`glass relative flex flex-col rounded-3xl p-6 ${t.highlight ? "ring-2 ring-turquoise" : ""}`}>
              {t.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-navy px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-peach dark:bg-turquoise dark:text-charcoal">
                  <Sparkles size={10} className="mr-1 inline"/> Recommended
                </div>
              )}
              <div className="text-sm text-muted-foreground">{t.name}</div>
              <div className="mt-1 flex items-end gap-1">
                <div className="text-3xl font-semibold" style={{ fontFamily: "var(--font-display)" }}>{t.price}</div>
                <div className="pb-1 text-xs text-muted-foreground">{t.cadence}</div>
              </div>
              <p className="mt-2 text-sm">{t.tagline}</p>
              <ul className="mt-4 flex-1 space-y-2 text-sm">
                {t.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <Check size={14} className="mt-1 shrink-0 text-turquoise"/>{f}
                  </li>
                ))}
              </ul>
              <button className="mt-6 rounded-full bg-navy px-4 py-2.5 text-sm font-medium text-peach dark:bg-turquoise dark:text-charcoal">
                {t.cta}
              </button>
            </div>
          ))}
        </div>
      </section>
    </PageTransition>
  );
}
