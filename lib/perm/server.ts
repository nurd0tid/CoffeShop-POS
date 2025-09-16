// lib/perm/server.ts
import { auth } from "@/auth";
import { hasPerm, hasPermInCompany } from "./core";

export type CapsMap = Record<string, boolean>;

/** hitung caps untuk user yang lagi login (server-side) */
export async function getServerCaps(params: { module: string; actions: string[]; companyId?: string }): Promise<CapsMap> {
  const session = await auth();
  const userId = session?.user?.userId ?? "";
  const { module, actions, companyId } = params;

  const out: CapsMap = {};
  if (!userId) {
    for (const a of actions) out[a] = false;
    return out;
  }

  for (const a of actions) {
    const perm = `${module}:${a}`;
    out[a] = companyId ? hasPermInCompany(userId, companyId, perm) : hasPerm(userId, perm);
  }
  return out;
}

/** util sederhana kalau butuh cek 1 perm di server */
export async function canServer(perm: string, companyId?: string): Promise<boolean> {
  const session = await auth();
  const userId = session?.user?.userId ?? "";
  if (!userId) return false;
  return companyId ? hasPermInCompany(userId, companyId, perm) : hasPerm(userId, perm);
}
