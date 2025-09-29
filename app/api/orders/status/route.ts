import { orderStore } from "@/lib/utils/orders";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const tid = searchParams.get("tid") || "";
  if (!tid) {
    return NextResponse.json({ status: "unknown" }, { headers: { "Cache-Control": "no-store" } });
  }
  const status = orderStore.get(tid);
  return NextResponse.json({ status }, { headers: { "Cache-Control": "no-store" } });
}
