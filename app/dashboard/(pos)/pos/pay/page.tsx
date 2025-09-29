// app/pay/page.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Alert, Button, Card, Divider, Flex, List, Result, Space, Statistic, Typography, Radio } from "antd";
import { PaymentStatus, QrOrderPayload, toRupiah } from "@/lib/utils/qr";
import { decryptPayload } from "@/lib/utils/secure-qr";


const { Title, Text } = Typography;

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

  if (error) {
    return (
      <div className="max-w-[680px] mx-auto p-4">
        <Result status="error" title="QR Tidak Valid" subTitle={error} />
      </div>
    );
  }
  if (!payload) {
    return (
      <div className="max-w-[680px] mx-auto p-4">
        <Result status="info" title="Memuat..." />
      </div>
    );
  }
  const p = payload;

  if (status !== "pending") {
    const preset = status === "success" ? "success" : status === "cancelled" ? "info" : "error";
    const title = status === "success" ? "Pembayaran Dikonfirmasi" : status === "cancelled" ? "Pembayaran Dibatalkan" : "Pembayaran Gagal";
    return (
      <div className="max-w-[720px] mx-auto p-4">
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
    <div className="max-w-[780px] mx-auto p-4">
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        <Card>
          <Flex justify="space-between" align="center" wrap>
            <div>
              <Title level={4} style={{ marginBottom: 0 }}>
                {p.store.name}
              </Title>
              <Text type="secondary">Transaction ID: {p.meta.transaction_id}</Text>
              <br />
              <Text type="secondary">Issued: {new Date(p.issued_at).toLocaleString("id-ID")}</Text>
            </div>
            <Space>
              <Statistic title="Subtotal" value={toRupiah(p.summary.subtotal)} />
              <Statistic title="Tax" value={toRupiah(p.summary.tax)} />
              <Statistic title="Discount" value={toRupiah(p.summary.discount)} />
              <Statistic title="Total" value={toRupiah(p.summary.total)} />
            </Space>
          </Flex>
        </Card>

        <Card title="Items">
          <List
            itemLayout="horizontal"
            dataSource={p.items}
            renderItem={(it) => (
              <List.Item>
                <List.Item.Meta
                  title={
                    <Flex justify="space-between" align="center" gap={8} wrap>
                      <Text strong>{it.name}</Text>
                      <Text>{it.ref}</Text>
                    </Flex>
                  }
                  description={
                    <Flex justify="space-between" align="center" gap={8} wrap>
                      <Text type="secondary">
                        {it.qty} × {toRupiah(it.unitPrice)}
                      </Text>
                      <Text strong>{toRupiah(it.subtotal)}</Text>
                    </Flex>
                  }
                />
              </List.Item>
            )}
          />
          <Divider />
          <Flex justify="space-between" align="center" wrap gap={12}>
            <div>
              <Text type="secondary">Status:</Text>
              <div>
                <Radio.Group value={status} onChange={(e) => setStatus(e.target.value)} optionType="button" buttonStyle="solid">
                  <Radio.Button value="pending">Pending</Radio.Button>
                  <Radio.Button value="success">Success</Radio.Button>
                  <Radio.Button value="cancelled">Cancelled</Radio.Button>
                  <Radio.Button value="failed">Failed</Radio.Button>
                </Radio.Group>
              </div>
            </div>
            <Space>
              <Button onClick={() => setStatus("cancelled")}>Batalkan</Button>
              <Button type="primary" onClick={() => setStatus("success")}>
                Konfirmasi Pembayaran
              </Button>
            </Space>
          </Flex>
        </Card>
      </Space>
    </div>
  );
}
