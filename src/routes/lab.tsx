import { createFileRoute } from "@tanstack/react-router";
import { PageTransition } from "@/components/PageTransition";
import { LabBench } from "@/components/LabBench";

export const Route = createFileRoute("/lab")({
  head: () => ({
    meta: [
      { title: "ChemVM — Virtual Lab Bench" },
      { name: "description", content: "Interactive chemistry lab with matter.js physics, tutorial, instruction manual, practice, and criterion-referenced testing." },
      { property: "og:title", content: "ChemVM — Virtual Lab Bench" },
      { property: "og:description", content: "Drag, drop, pour, heat, mix — then get objectively marked against the syllabus rubric." },
    ],
  }),
  component: LabPage,
});

function LabPage() {
  return (
    <PageTransition>
      <LabBench />
    </PageTransition>
  );
}
