// app/api/perm/caps/route.ts
import { NextResponse, NextRequest } from "next/server";
import { auth } from "@/auth";
import { hasPerm, hasPermInCompany } from "@/lib/perm/core";

export async function GET(req: NextRequest) {
  const session = await auth();
  const userId = session?.user?.userId ?? "";

  if (!userId) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const moduleCode = (url.searchParams.get("module") ?? "").trim();
  const companyId = (url.searchParams.get("company_id") ?? "").trim();

  // actions: bisa ?action=update&action=delete
  const actions = url.searchParams
    .getAll("action")
    .map((a) => a.trim())
    .filter(Boolean);

  if (!moduleCode || actions.length === 0) {
    return NextResponse.json({ success: false, message: "Invalid query" }, { status: 400 });
  }

  const caps: Record<string, boolean> = {};
  for (const act of actions) {
    const perm = `${moduleCode}:${act}`;
    const ok = companyId ? hasPermInCompany(userId, companyId, perm) : hasPerm(userId, perm); // fallback union-aktif kalau company_id gak dikirim
    caps[perm] = ok;
  }

  return NextResponse.json({ success: true, caps }, { status: 200 });
}
