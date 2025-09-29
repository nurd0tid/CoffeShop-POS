// components/qr/qr-utils.ts
export type QrItem = {
  id: string;
  ref: string;
  name: string;
  qty: number;
  unitPrice: number;
  subtotal: number;
};

export type QrOrderSummary = {
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
};

export type QrOrderPayload = {
  type: "pos_order";
  version: number;
  issued_at: string;
  currency: "IDR";
  store: { name: string };
  items: QrItem[];
  summary: QrOrderSummary;
  meta: { transaction_id: string };
  signature_hint?: string; // optional hint
};

// ✅ Tambahan: status pembayaran (untuk /pay)
export type PaymentStatus = "pending" | "success" | "cancelled" | "failed";

// ✅ Optional helper untuk baca status awal dari query (?status=...)
export function getInitialStatusFromSearchParams(sp: URLSearchParams | { get(k: string): string | null }): PaymentStatus {
  const s = (sp.get("status") || "").toLowerCase();
  return s === "success" || s === "failed" || s === "cancelled" || s === "pending" ? (s as PaymentStatus) : "pending";
}

export const toRupiah = (n: number) => "Rp" + n.toLocaleString("id-ID", { minimumFractionDigits: 0 });

export const genRef = (index: number) => `REF${(index + 1).toString().padStart(4, "0")}`;

export function buildOrderPayload(params: { storeName: string; transactionId: string; items: QrItem[]; summary: QrOrderSummary }): QrOrderPayload {
  return {
    type: "pos_order",
    version: 1,
    issued_at: new Date().toISOString(),
    currency: "IDR",
    store: { name: params.storeName },
    items: params.items,
    summary: params.summary,
    meta: { transaction_id: params.transactionId },
    signature_hint: "nonce-or-hint",
  };
}

export function buildPayUrlWithToken(token: string, origin?: string) {
  const base = origin || process.env.NEXT_PUBLIC_POS_BASE_URL || (typeof window !== "undefined" ? window.location.origin : "");
  return `${base}/dashboard/pos/pay?t=${token}`;
}
