// app/pay/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button, Card, Divider, Result, Space, Typography } from "antd";
import { PaymentStatus, QrOrderPayload } from "@/lib/utils/qr";
import { decryptPayload } from "@/lib/utils/secure-qr";
import Link from "next/link";

const { Text } = Typography;

export default function PayPage() {
  const sp = useSearchParams();
  const [status, setStatus] = useState<PaymentStatus>("pending");
  const [payload, setPayload] = useState<QrOrderPayload | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Optional: izinkan override status via query (?status=...)
  useEffect(() => {
    const s = (sp.get("status") || "").toLowerCase();
    if (s === "success" || s === "failed" || s === "cancelled" || s === "pending") {
      setStatus(s as PaymentStatus);
    }
  }, [sp]);

  useEffect(() => {
    const t = sp.get("t"); // token terenkripsi
    const legacyData = sp.get("data"); // fallback lama (jaga kompatibilitas)
    (async () => {
      try {
        if (t) {
          const obj = await decryptPayload<QrOrderPayload>(t);
          if (obj?.type !== "pos_order") throw new Error("Tipe payload tidak didukung.");
          setPayload(obj);
          setError(null);
        } else if (legacyData) {
          // legacy path (tidak disarankan)
          const obj = JSON.parse(decodeURIComponent(legacyData)) as QrOrderPayload;
          setPayload(obj);
          setError(null);
        } else {
          throw new Error("Token tidak ditemukan.");
        }
      } catch (e: any) {
        setPayload(null);
        setError(e?.message || "Gagal memproses token.");
      }
    })();
  }, [sp]);

  // === Handler konfirmasi pembayaran: kirim sinyal ke server ===
  async function handleConfirmPayment() {
    if (!payload) return;
    try {
      const tid = payload.meta.transaction_id; // contoh: "#655565"
      const res = await fetch("/api/orders/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tid, status: "paid" }), // status optional; default "paid"
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Confirm failed");
      // sukses → tampilkan Result success
      setStatus("success");
    } catch (err) {
      console.error(err);
      setStatus("failed");
    }
  }

  if (error) {
    return (
      <div className="mx-auto max-w-[650px] py-[70px]  min-h-[100vh] px-[10px]">
        <Result status="error" title="QR Tidak Valid" subTitle={error} />
      </div>
    );
  }
  if (!payload) {
    return (
      <div className="mx-auto max-w-[650px] py-[70px]  min-h-[100vh] px-[10px]">
        <Result status="info" title="Memuat..." />
      </div>
    );
  }
  const p = payload;

  if (status !== "pending") {
    const preset = status === "success" ? "success" : status === "cancelled" ? "info" : "error";
    const title = status === "success" ? "Pembayaran Dikonfirmasi" : status === "cancelled" ? "Pembayaran Dibatalkan" : "Pembayaran Gagal";
    return (
      <div className="mx-auto max-w-[650px] py-[70px]  min-h-[100vh] px-[10px]">
        <Result
          status={preset as any}
          title={title}
          subTitle={`Transaksi ${p.meta.transaction_id} — ${p.store.name}`}
          extra={[
            <Space key="actions">
              <Button onClick={() => setStatus("pending")}>Kembali ke Ringkasan</Button>
              <Button type="primary" href="/dashboard/pos">
                Ke Beranda
              </Button>
            </Space>,
          ]}
        />
        <Divider />
        <Card>
          <Text type="secondary">Issued: {new Date(p.issued_at).toLocaleString("id-ID")}</Text>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[650px] py-[70px]  min-h-[100vh] px-[10px]">
      <div className="text-center">
        <h6 className="m-[10px_0] font-bold text-[16px] text-[#212b36] leading-[1.2]">Bagi Kopi Indonesia</h6>
        <p>Phone Number: +1 5656665656</p>
        <p>
          Email <Link href="mailto:info@bagikopiindonesia.com">info@bagikopiindonesia.com</Link>
        </p>
      </div>
      <div>
        <h6 className="text-center before:absolute before:top-[50%] before:left-0 before:translate-y-[-50%] before:content-[''] before:border-dashed before:border-t-[#212b36] before:w-[35%] after:absolute after:top-[50%] after:left-0 after:translate-y-[-50%] after:content-[''] after:border-dashed after:border-t-[#212b36] after:w-[35%] m-[10px_0] font-bold relative text-[16px] text-[#212b36] leading-[1.2]">
          Tax Invoice
        </h6>
        <div className="flex flex-row gap-4 text-center">
          <div className="sm:w-1/2 w-full">
            <div className="mb-[10px]">
              <span className="text-[#212b36]">Name: </span>
              {p.store.name}
            </div>
            <div className="mb-[10px]">
              <span className="text-[#212b36]">Invoice No: </span>
              {p.meta.transaction_id}
            </div>
          </div>
          <div className="sm:w-1/2 w-full">
            <div className="mb-[10px]">
              <span className="text-[#212b36]">Customer Id: </span>#
            </div>
            <div className="mb-[10px]">
              <span className="text-[#212b36]">Date: </span>
              {new Date(p.issued_at).toLocaleString("id-ID")}
            </div>
          </div>
        </div>
      </div>
      <table className="border-collapse w-full mx-auto my-[25px]">
        <thead className="border-b border-dashed border-t">
          <tr>
            <th className="text-[#212b36] font-bold w-auto min-w-auto p-[10px_5px] text-left"># Item</th>
            <th className="text-[#212b36] font-bold w-auto min-w-auto p-[10px_5px] text-left">Price</th>
            <th className="text-[#212b36] font-bold w-auto min-w-auto p-[10px_5px] text-left">Qty</th>
            <th className="text-[#212b36] font-bold w-auto min-w-auto p-[10px_5px] text-right">Total</th>
          </tr>
        </thead>
        <tbody>
          {p.items.map((it, idx) => (
            <tr key={idx}>
              <td className="p-[10px_5px] border-dashed"> {it.name} </td>
              <td className="p-[10px_5px] border-dashed"> {it.subtotal.toLocaleString("id-ID", { style: "currency", currency: "IDR" })} </td>
              <td className="p-[10px_5px] border-dashed"> {it.qty} </td>
              <td className="p-[10px_5px] border-dashed text-right">
                {(it.qty * it.unitPrice).toLocaleString("id-ID", { style: "currency", currency: "IDR" })}
              </td>
            </tr>
          ))}
          <tr>
            <td colSpan={4}>
              <table className="w-full">
                <tbody className="border-b border-dashed border-t ">
                  <tr>
                    <td className="font-bold p-[10px_5px]">Sub Total :</td>
                    <td className="text-right p-[10px_5px]">{p.summary.subtotal.toLocaleString("id-ID", { style: "currency", currency: "IDR" })}</td>
                  </tr>
                  <tr>
                    <td className="font-bold p-[10px_5px]">Discount :</td>
                    <td className="text-right p-[10px_5px]">{p.summary.discount.toLocaleString("id-ID", { style: "currency", currency: "IDR" })}</td>
                  </tr>
                  <tr>
                    <td className="font-bold p-[10px_5px]">Tax (11%) :</td>
                    <td className="text-right p-[10px_5px]">{p.summary.tax.toLocaleString("id-ID", { style: "currency", currency: "IDR" })}</td>
                  </tr>
                  <tr>
                    <td className="font-bold p-[10px_5px]">Total Bill :</td>
                    <td className="text-right p-[10px_5px]">{p.summary.total.toLocaleString("id-ID", { style: "currency", currency: "IDR" })}</td>
                  </tr>
                  <tr>
                    <td className="font-bold text-[18px] text-[#092c4c] p-[10px_5px]">Total Payable :</td>
                    <td className="font-bold text-[18px] text-[#092c4c] text-right p-[10px_5px]">
                      {p.summary.total.toLocaleString("id-ID", { style: "currency", currency: "IDR" })}
                    </td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>
        </tbody>
      </table>
      <div className="border-dashed border-t p-[20px_0_0] text-center">
        <div className="border-dashed border-b ">
          <p className="mb-[20px]">**VAT against this challan is payable through central registration. Thank you for your business!</p>
        </div>
        <p>Thank You For Shopping With Us. Please Come Again</p>
        <div className="flex flex-row items-center gap-4 justify-center my-[20px]">
          <button className="bg-gray-300 text-black  p-[7px_12px] text-[13px] rounded-[5px] w-full hover:bg-gray-400" onClick={() => history.back()}>
            Close
          </button>
          <button className="bg-blue-500 text-white  p-[7px_12px] text-[13px] rounded-[5px] w-full hover:bg-blue-600" onClick={handleConfirmPayment}>
            Payment
          </button>
        </div>
      </div>
    </div>
  );
}
