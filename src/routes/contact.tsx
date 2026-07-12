import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/ComingSoon";
export const Route = createFileRoute("/contact")({
  head: () => ({ meta: [{ title: "Contact — ChemVM" }] }),
  component: () => <ComingSoon label="Contact" piece="More" note="Contact form coming soon. Meanwhile, reach out via Project X channels." />,
});
