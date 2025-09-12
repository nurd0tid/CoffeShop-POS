// lib/perm-ui.ts
import * as React from "react";

export type CapsMap = Record<string, boolean>;

export function useCaps(params: { module: string; actions: string[]; companyId?: string }) {
  const { module, actions, companyId } = params;

  const [loading, setLoading] = React.useState<boolean>(true);
  const [caps, setCaps] = React.useState<CapsMap>({});

  React.useEffect(() => {
    let alive = true;

    async function run() {
      try {
        setLoading(true);
        const q = new URLSearchParams();
        q.set("module", module);
        for (const a of actions) q.append("action", a);
        if (companyId) q.set("company_id", companyId);

        const res = await fetch(`/api/perm/caps?${q.toString()}`, { credentials: "include" });
        if (!alive) return;

        if (!res.ok) {
          setCaps({});
          setLoading(false);
          return;
        }

        const json: { success: boolean; caps?: CapsMap } = await res.json();
        setCaps(json.success && json.caps ? json.caps : {});
      } catch {
        setCaps({});
      } finally {
        if (alive) setLoading(false);
      }
    }

    run();
    return () => {
      alive = false;
    };
  }, [module, JSON.stringify(actions), companyId]);

  return { loading, caps };
}
