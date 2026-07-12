import { useEffect, useState, useCallback } from "react";
import { SYLLABI, type Syllabus } from "@/data/syllabi";

const KEY = "chemvm.syllabus.id";

/** Client-only hook — reads/writes the selected syllabus id from localStorage.
 *  Reads happen in useEffect to avoid SSR hydration mismatches. */
export function useSyllabus() {
  const [id, setIdState] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      setIdState(localStorage.getItem(KEY));
    } catch {
      /* storage disabled */
    }
    setHydrated(true);
  }, []);

  const setId = useCallback((next: string | null) => {
    setIdState(next);
    try {
      if (next) localStorage.setItem(KEY, next);
      else localStorage.removeItem(KEY);
    } catch {
      /* ignore */
    }
  }, []);

  const syllabus: Syllabus | null =
    (id && SYLLABI.find((s) => s.id === id)) || null;

  return { syllabus, setSyllabus: setId, hydrated };
}
