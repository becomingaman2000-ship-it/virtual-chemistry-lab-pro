import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

export const getRouter = () => {
  const queryClient = new QueryClient();

  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
    defaultPendingComponent: () => (
      <div className="flex min-h-[50vh] items-center justify-center px-4">
        <p className="text-sm text-muted-foreground">Loading ChemVM…</p>
      </div>
    ),
  });

  return router;
};
