import { orderStore } from "@/lib/utils/orders";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { tid } = await req.json();
    if (!tid || typeof tid !== "string") {
      return NextResponse.json({ ok: false, error: "tid required" }, { status: 400 });
    }
    // set ke pending setiap init
    orderStore.set(tid, "pending");
    return NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "bad request" }, { status: 400 });
  }
}
