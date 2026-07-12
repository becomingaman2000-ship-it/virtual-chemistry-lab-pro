import { createFileRoute } from "@tanstack/react-router";
import { PageTransition } from "@/components/PageTransition";
import { ApparatusBench } from "@/components/ApparatusBench";

export const Route = createFileRoute("/apparatus")({
  head: () => ({
    meta: [
      { title: "ChemVM — Apparatus Library" },
      { name: "description", content: "Drag-and-drop lab apparatus with live matter.js physics — beakers, flasks, burettes, condensers, Bunsen burners and more." },
      { property: "og:title", content: "ChemVM — Apparatus Library" },
      { property: "og:description", content: "Physics-accurate virtual lab apparatus bench." },
    ],
  }),
  component: ApparatusPage,
});

function ApparatusPage() {
  return (
    <PageTransition>
      <section className="px-4 pt-10 md:pt-14">
        <div className="mx-auto max-w-7xl text-center">
          <div className="text-xs font-mono uppercase tracking-widest text-turquoise">Piece 2</div>
          <h1 className="mt-2 text-4xl font-semibold md:text-5xl" style={{ fontFamily: "var(--font-display)" }}>
            <span className="text-gradient">Apparatus</span> Library
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
            Drag equipment from the tray onto the bench. Every piece has real mass, friction and bounce — powered by matter.js.
            Double-click any item to inspect its physical properties.
          </p>
        </div>
      </section>
      <ApparatusBench />
    </PageTransition>
  );
}
