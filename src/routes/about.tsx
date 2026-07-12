import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/ComingSoon";
export const Route = createFileRoute("/about")({
  head: () => ({ meta: [{ title: "About Project X" }] }),
  component: () => <ComingSoon label="About Project X" piece="More" note="A dedicated page for the team behind ChemVM lands soon." />,
});
