import { createFileRoute } from "@tanstack/react-router";
import { PageTransition } from "@/components/PageTransition";
import { ChemicalsLibrary } from "@/components/ChemicalsLibrary";

export const Route = createFileRoute("/chemicals")({
  head: () => ({
    meta: [
      { title: "ChemVM — Chemicals Library" },
      {
        name: "description",
        content:
          "Interactive library of acids, bases, salts, metals, gases, vapours and flame colours with true-to-life visuals and physical properties.",
      },
      { property: "og:title", content: "ChemVM — Chemicals Library" },
      {
        property: "og:description",
        content: "80+ reagents with real colors, live liquid motion, animated flames and vapours.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ChemicalsPage,
});

function ChemicalsPage() {
  return (
    <PageTransition>
      <ChemicalsLibrary />
    </PageTransition>
  );
}
