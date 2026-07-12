import { createFileRoute } from "@tanstack/react-router";
import { PageTransition } from "@/components/PageTransition";
import { SyllabusSelector } from "@/components/SyllabusSelector";

export const Route = createFileRoute("/syllabus")({
  head: () => ({
    meta: [
      { title: "ChemVM — Syllabus Selector & Weighted Marking" },
      { name: "description", content: "Pick ZIMSEC or Cambridge, O-Level or A-Level. ChemVM re-weights every rubric and formats every practical report to that syllabus." },
      { property: "og:title", content: "ChemVM — Syllabus Selector" },
      { property: "og:description", content: "Board-aware marking: ZIMSEC 4023/9189 and Cambridge 5070/9701 grade bands, weightings and report formats." },
    ],
  }),
  component: SyllabusPage,
});

function SyllabusPage() {
  return (
    <PageTransition>
      <SyllabusSelector />
    </PageTransition>
  );
}
