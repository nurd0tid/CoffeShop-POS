// components/pos/Sidebar.tsx
"use client";

import { MenuItem } from "@/types/menu";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useRef, useState } from "react";
import { BsCash } from "react-icons/bs";
import { CiCreditCard1, CiMoneyBill, CiPause1 } from "react-icons/ci";
import { FiEdit, FiMinusCircle, FiPlusCircle, FiUserPlus } from "react-icons/fi";
import { IoCloseOutline, IoTrashOutline } from "react-icons/io5";
import { RiQrScan2Line } from "react-icons/ri";
import { TbTrashXFilled } from "react-icons/tb";
import { Modal, QRCode, Result, Button } from "antd";
import { buildOrderPayload, buildPayUrlWithToken, genRef, QrOrderPayload } from "@/lib/utils/qr";
import { encryptPayload } from "@/lib/utils/secure-qr";

const Select = dynamic(() => import("react-select"), { ssr: false });

const options = [
  { value: "john", label: "John" },
  { value: "smith", label: "Smith" },
  { value: "ana", label: "Ana" },
  { value: "elza", label: "Elza" },
];

const optionsProduct = [
  { value: "coffe", label: "Coffe" },
  { value: "pie", label: "Pie" },
];

type SidebarProps = {
  selectedMenus: MenuItem[];
  onDeleteMenu: (id: string) => void;
  onClearMenus: () => void;
};

type QrContext = { kind: "item"; itemId: string } | { kind: "order" };
type OrderStatus = "idle" | "pending" | "paid" | "cancelled" | "failed";

export default function Sidebar({ selectedMenus, onDeleteMenu, onClearMenus }: SidebarProps) {
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [qrOpen, setQrOpen] = useState(false);
  const [qrValue, setQrValue] = useState<string>("");
  const [qrTitle, setQrTitle] = useState<string>("Scan QR");
  const [qrContext, setQrContext] = useState<QrContext | null>(null);

  // success
  const [successOpen, setSuccessOpen] = useState(false);
  const [successTid, setSuccessTid] = useState<string | null>(null);
  const [successAmountLabel, setSuccessAmountLabel] = useState<string>("");

  // print preview
  const [printOpen, setPrintOpen] = useState(false);
  const [lastPayload, setLastPayload] = useState<QrOrderPayload | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  // status order
  const [orderStatus, setOrderStatus] = useState<OrderStatus>("idle");

  // polling timer
  const pollRef = useRef<number | null>(null);

  // qty default 1 + bersihin yang kehapus
  useEffect(() => {
    setQuantities((prev) => {
      const next = { ...prev };
      selectedMenus.forEach((m) => {
        if (!next[m.id]) next[m.id] = 1;
      });
      Object.keys(next).forEach((id) => {
        if (!selectedMenus.find((m) => m.id === id)) delete next[id];
      });
      return next;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMenus]);

  const handleQuantity = (id: string, delta: number) => {
    setQuantities((prev) => ({ ...prev, [id]: Math.max(1, (prev[id] || 1) + delta) }));
  };

  const getMenuSubtotal = (menu: MenuItem) => menu.price[0].value * (quantities[menu.id] || 1);
  const subtotal = selectedMenus.reduce((sum, m) => sum + getMenuSubtotal(m), 0);
  const tax = Math.round(subtotal * 0.11);
  const discount = 0;
  const total = subtotal + tax - discount;

  const formatRupiah = (v: number) => "Rp" + v.toLocaleString("id-ID", { minimumFractionDigits: 0 });
  const buildItemRef = (id: string) => genRef(selectedMenus.findIndex((m) => m.id === id));

  // polling helpers
  const stopPolling = () => {
    if (pollRef.current !== null) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  };

  const startPolling = (tid: string) => {
    stopPolling();
    const startAfter = 1200;
    const startAt = Date.now() + startAfter;

    pollRef.current = window.setInterval(async () => {
      try {
        if (Date.now() < startAt) return;
        const res = await fetch(`/api/orders/status?tid=${encodeURIComponent(tid)}`, { cache: "no-store" });
        const data = await res.json();
        if (!data || !data.status) return;

        if (data.status === "paid") {
          stopPolling();
          setQrOpen(false); // tutup QR
          setOrderStatus("paid");
          setSuccessTid(tid);
          setSuccessAmountLabel(total.toLocaleString("id-ID", { style: "currency", currency: "IDR" }));
          setSuccessOpen(true); // munculkan success
        } else if (data.status === "cancelled" || data.status === "failed") {
          stopPolling();
          setOrderStatus(data.status);
          setQrOpen(false);
        }
      } catch {
        // ignore error ringan
      }
    }, 2000);
  };

  useEffect(() => () => stopPolling(), []);

  // open QR
  async function openOrderQr() {
    if (selectedMenus.length === 0) return;

    setQrContext({ kind: "order" });

    const transactionId = "#655565";

    const items = selectedMenus.map((m) => ({
      id: m.id,
      ref: buildItemRef(m.id),
      name: m.name,
      qty: quantities[m.id] || 1,
      unitPrice: m.price[0].value,
      subtotal: (quantities[m.id] || 1) * m.price[0].value,
    }));

    const payload = buildOrderPayload({
      storeName: "My Store",
      transactionId,
      items,
      summary: { subtotal, tax, discount, total },
    });

    setLastPayload(payload);

    const token = await encryptPayload(payload);
    const origin = process.env.NEXT_PUBLIC_URL || (typeof window !== "undefined" ? window.location.origin : "");
    const url = buildPayUrlWithToken(token, origin);

    setQrTitle("Scan to Pay · Order");
    setQrValue(url);
    setQrOpen(true);

    try {
      await fetch("/api/orders/init", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tid: transactionId, amount: total }),
      });
      setOrderStatus("pending");
      startPolling(transactionId);
    } catch {
      setOrderStatus("pending");
      startPolling(transactionId);
    }
  }

  // print system dialog
  function handleSystemPrint() {
    if (!printRef.current) return;
    const html = printRef.current.innerHTML;
    const w = window.open("", "_blank", "width=420,height=640");
    if (!w) return;
    w.document.open();
    w.document.write(`
      <html>
        <head>
          <title>Receipt</title>
          <style>
            @page { size: 58mm auto; margin: 0; }
            body { margin: 0; font-family: system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif; }
            * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          </style>
        </head>
        <body>${html}</body>
      </html>
    `);
    w.document.close();
    w.focus();
    w.print();
  }

  return (
    <>
      <div className="col-span-12 lg:col-span-5 xl:col-span-4 sticky top-0">
        <aside className="p-6 overflow-y-auto bg-white border-l border-l-[#e6eaed] [@media(min-width:992px)]:h-[calc(100vh-65px)]">
          {/* Order Header */}
          <div className="rounded-[8px] p-[10px] mb-[20px] text-[#5b6670] bg-[#f9faFB] flex items-center justify-between w-full">
            <div>
              <h3 className="font-medium text-[#212b36] text-[1.125rem]">Order List</h3>
              <span>Transaction ID : #655565</span>
            </div>
            <div>
              <button
                className="text-rose-500 text-[1rem]"
                onClick={() => {
                  onClearMenus();
                  stopPolling();
                  setOrderStatus("idle");
                }}
              >
                <TbTrashXFilled />
              </button>
            </div>
          </div>

          {/* Custom Information */}
          <div className="border-b border-b-[#e6eaed] pb-[10px] mb-[20px]">
            <h4 className="mb-[1rem] font-medium text-[#212b36] leading-[1.2] text-lg">Custom Information</h4>
            <div className="mb-[10px] flex items-center">
              <div className="grow">
                <Select
                  options={options}
                  placeholder="Walk in Customer"
                  isSearchable={false}
                  styles={{
                    control: (base) => ({
                      ...base,
                      borderColor: "#dbe0e6",
                      boxShadow: "none",
                      outline: "none",
                      height: "40px",
                      display: "flex",
                      minHeight: "38px",
                      color: "#5b6670",
                      "&:hover": { borderColor: "#dbe0e6" },
                    }),
                  }}
                />
              </div>
              <Link
                href="#"
                className="min-w-[38px] min-h-[38px] ml-[10px] inline-flex items-center justify-center p-0 rounded-[8px] bg-[#0076f9] border border-[#0076f9] text-white shadow-[0_4px_20px_rgba(254,159,67,.15)]"
              >
                <FiUserPlus size={16} />
              </Link>
            </div>
            <div className="mb-[10px]">
              <Select
                options={optionsProduct}
                placeholder="Search Product"
                isSearchable
                styles={{
                  control: (base) => ({
                    ...base,
                    borderColor: "#dbe0e6",
                    boxShadow: "none",
                    outline: "none",
                    height: "40px",
                    display: "flex",
                    minHeight: "38px",
                    color: "#5b6670",
                    "&:hover": { borderColor: "#dbe0e6" },
                  }),
                }}
              />
            </div>
          </div>

          {/* Product Added */}
          <div className="mb-[20px]">
            <div className="mb-[20px] flex items-center justify-between">
              <h5 className="mb-0 items-center flex mt-0 font-medium text-[1rem] text-[#212b36]">
                Product Added
                <span className="w-[15px] h-[15px] flex items-cente justify-center bg-[#0076f9] rounded-full text-white text-[10px] font-semibold ml-[5px]">
                  {selectedMenus.length}
                </span>
              </h5>
              {selectedMenus.length > 0 && (
                <button
                  className="text-rose-500 flex items-center gap-2 cursor-pointer"
                  onClick={() => {
                    onClearMenus();
                    stopPolling();
                    setOrderStatus("idle");
                  }}
                >
                  <IoCloseOutline size={16} />
                  Clear All
                </button>
              )}
            </div>

            <div className="h-[311px] overflow-auto">
              {selectedMenus.length === 0 ? (
                <div className="block">
                  <Image src="/no-empty.png" width={150} height={150} alt="No Product" className="mx-auto block" />
                </div>
              ) : (
                selectedMenus.map((menu) => (
                  <div key={menu.id} className="border border-[#e6eaed] rounded-[8px] mb-[5px] p-[8px] flex flex-wrap gap-2 items-center justify-between">
                    <div className="flex items-center w-3/5">
                      <Link href="#" className="w-[83px] h-[83px] bg-[#fafbfe] rounded-[10px] flex items-center mr-[10px] shrink-0">
                        <Image src="/akal_sehat.png" width={70} height={70} alt="Product" className="align-middle h-auto max-w-full" />
                      </Link>
                      <div>
                        <span className="bg-[#0076f9] rounded-[3px] font-semibold text-white text-xs p-[2px_4px] min-w-[52px] inline-block mb-[5px]">
                          {`REF${(selectedMenus.findIndex((m) => m.id === menu.id) + 1).toString().padStart(4, "0")}`}
                        </span>
                        <h6 className="font-bold mb-[5px] text-[.875rem] text-[#212b36] cursor-pointer">{menu.name}</h6>
                        <p className="font-bold text-sm mb-0 text-[#0e9384]">{formatRupiah(menu.price[0].value)}</p>
                      </div>
                    </div>

                    <div className="bg-[#e6eaed] border-0 text-[#212b36] p-[1px_7px] rounded-[8px] flex items-center gap-2">
                      <span>
                        <FiMinusCircle size={16} onClick={() => handleQuantity(menu.id, -1)} className="cursor-pointer" />
                      </span>
                      <input
                        className="rounded-[8px] h-[28px] w-[71px] text-center text-sm focus:ring-0 focus:border-0 focus:outline-0"
                        value={quantities[menu.id] || 1}
                        readOnly
                      />
                      <span>
                        <FiPlusCircle size={16} onClick={() => handleQuantity(menu.id, 1)} className="cursor-pointer" />
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button className="p-[7px] rounded-[8px] border border-[#e6eaed] w-[30px] h-[30px] cursor-pointer inline-flex items-center justify-center hover:bg-[#0076f9] hover:text-white">
                        <FiEdit size={16} />
                      </button>
                      <button
                        className="p-[7px] rounded-[8px] border border-[#e6eaed] w-[30px] h-[30px] cursor-pointer inline-flex items-center justify-center hover:bg-rose-500 hover:text-white"
                        onClick={() => onDeleteMenu(menu.id)}
                      >
                        <IoTrashOutline size={16} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Price Summary */}
          <div className="mb-[20px]">
            <div className="mb-[20px] pb-[20px] border-b border-b-[#e6eaed]"></div>
            <div className="bg-[#f9fafb] p-[24px] rounded-[8px]">
              <table className="m-0 text-[#646b72] overflow-x-auto w-full">
                <tbody>
                  <tr>
                    <td className="p-[0_0_15px] text-[15px] font-medium">Sub Total</td>
                    <td className="!text-right p-[0_0_15px] text-[15px] font-medium">{formatRupiah(subtotal)}</td>
                  </tr>
                  <tr>
                    <td className="p-[0_0_15px] text-[15px] font-medium">Tax (GST 11%)</td>
                    <td className="!text-right p-[0_0_15px] text-[15px] font-medium">{formatRupiah(tax)}</td>
                  </tr>
                  <tr>
                    <td className="p-[0_0_15px] text-[15px] font-medium">Sub Total</td>
                    <td className="!text-right p-[0_0_15px] text-[15px] font-medium">{formatRupiah(subtotal + tax)}</td>
                  </tr>
                  <tr>
                    <td className="p-[0_0_15px] text-[15px] text-rose-500 font-medium">Discount (10%)</td>
                    <td className="!text-right p-[0_0_15px] text-rose-500 text-[15px] font-medium">{formatRupiah(discount)}</td>
                  </tr>
                  <tr>
                    <td className="p-[20px_0_0] text-[16px] text-[#092c4c] font-semibold">Total</td>
                    <td className="!text-right p-[20px_0_0] text-[16px] text-[#092c4c] font-semibold">{formatRupiah(total)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Payment Method */}
          <div className="mb-[20px]">
            <h4 className="mb-[10px] font-medium mt-0 text-[1.125rem] text-[#212b36]">Payment Method</h4>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <button className="transition-all w-full duration-[.5s] ease-in p-[10px_15px] text-[15px] text-[#092c4c] rounded-[10px] border border-[#e6eaed] cursor-pointer hover:bg-[#fff6ee] hover:border-[#0076f9] hover:text-[#0076f9] flex flex-col items-center justify-center gap-2">
                  <BsCash className="text-[#646b72] text-lg" />
                  Cash
                </button>
              </div>
              <div>
                <button className="transition-all duration-[.5s] w-full ease-in p-[10px_15px] text-[15px] text-[#092c4c] rounded-[10px] border border-[#e6eaed] cursor-pointer hover:bg-[#fff6ee] hover:border-[#0076f9] hover:text-[#0076f9] flex flex-col items-center justify-center gap-2">
                  <CiCreditCard1 className="text-[#646b72] text-lg" />
                  Debit Card
                </button>
              </div>
              <div>
                <button
                  onClick={openOrderQr}
                  disabled={selectedMenus.length === 0 || orderStatus === "pending"}
                  className="transition-all duration-[.5s] ease-in w-full p-[10px_15px] text-[15px] text-[#092c4c] rounded-[10px] border border-[#e6eaed] cursor-pointer hover:bg-[#fff6ee] hover:border-[#0076f9] hover:text-[#0076f9] flex flex-col items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <RiQrScan2Line className="text-[#646b72] text-lg" />
                  {orderStatus === "pending" ? "Waiting..." : "Scan"}
                </button>
              </div>
            </div>
          </div>

          {/* Grand Total Button */}
          <div className="mb-[20px]">
            <button
              className={`text-sm font-bold p-[13px_10px] rounded-[5px] !w-full transition-all duration-[.5s] border ${
                selectedMenus.length === 0
                  ? "bg-[#e6eaed] border-[#e6eaed] text-[#b8bcc9] cursor-not-allowed"
                  : "bg-[#092c4c] border-[#092c4c] text-white shadow-[0_4px_20px_rgba(9,44,76,.15)] hover:bg-[rgb(5.22,25.52,44.09)] hover:shadow-[0_3px_10px_rgba(9,44,76,.5)] cursor-pointer"
              }`}
              disabled={selectedMenus.length === 0}
            >
              Grand Total : {formatRupiah(total)}
            </button>
          </div>

          {/* Bottom buttons */}
          <div className="mb-[20px]">
            <div className="grid grid-cols-3 gap-3">
              <button className="cursor-pointer flex items-center justify-center gap-2 text-sm p-[9px] rounded-[4px] bg-[#693bef] shadow-[0_4px_20px_rgba(105,56,239,.15)] text-white font-bold hover:bg-[#5017ec]">
                <CiPause1 />
                Hold
              </button>
              <button className="cursor-pointer flex items-center justify-center gap-2 text-sm p-[9px] rounded-[4px] bg-[#FF0000] shadow-[0_4px_20px_rgba(255,0,0,.15)] text-white font-bold hover:bg-[#db0000]">
                <IoTrashOutline />
                Void
              </button>
              <button className="cursor-pointer flex items-center justify-center gap-2 text-sm p-[9px] rounded-[4px] bg-[#3EB780] shadow-[0_4px_20px_rgba(62,183,128,.15)] text-white font-bold hover:bg-[#137347]">
                <CiMoneyBill />
                Payment
              </button>
            </div>
          </div>
        </aside>
      </div>

      {/* QR Modal */}
      <Modal
        open={qrOpen}
        onCancel={() => {
          setQrOpen(false);
          stopPolling();
          if (orderStatus === "pending") setOrderStatus("idle");
        }}
        footer={null}
        centered
        title={qrTitle}
      >
        <div className="w-full flex flex-col items-center gap-4">
          <QRCode value={qrValue} size={240} icon="/logo.png" iconSize={48} bordered errorLevel="Q" />
        </div>
      </Modal>

      {/* Success Modal */}
      <Modal
        open={successOpen}
        onCancel={() => setSuccessOpen(false)}
        centered
        width={420}
        title={null}
        closable={false}
        maskClosable={false}
        footer={[
          <Button key="close" onClick={() => setSuccessOpen(false)}>
            Close
          </Button>,
          <Button
            key="print"
            type="primary"
            onClick={() => {
              setSuccessOpen(false);
              setPrintOpen(true);
            }}
          >
            Print Receipt
          </Button>,
        ]}
      >
        <Result
          status="success"
          title="Pembayaran Berhasil"
          subTitle={successTid ? `Transaksi ${successTid} — My Store${successAmountLabel ? " • Total " + successAmountLabel : ""}` : undefined}
          className="!p-0"
        />
      </Modal>

      {/* Print Preview Modal (58mm width) */}
      <Modal
        open={printOpen}
        onCancel={() => setPrintOpen(false)}
        centered
        width={360}
        title={null}
        closable={false}
        maskClosable={false}
        footer={[
          <Button key="close" onClick={() => setPrintOpen(false)}>
            Close
          </Button>,
          <Button key="print" type="primary" onClick={handleSystemPrint}>
            Print
          </Button>,
        ]}
      >
        <div ref={printRef} className="mx-auto" style={{ width: 280 }}>
          {lastPayload ? (
            <div className="px-[10px] py-[16px]">
              {/* Logo */}
              <Image src="/logo-wide.png" alt="Bagi Kopi Indonesia" width={80} height={40} className="mx-auto mb-[16px] object-contain" />

              <div className="text-center">
                <h6 className="m-[8px_0] font-bold text-[14px] text-[#212b36] leading-[1.2]">Bagi Kopi Indonesia</h6>
                <p className="text-[12px] leading-[1.2]">Phone Number: +1 5656665656</p>
                <p className="text-[12px] leading-[1.2]">
                  Email <Link href="mailto:info@bagikopiindonesia.com">info@bagikopiindonesia.com</Link>
                </p>
              </div>

              <div>
                <h6 className="text-center m-[8px_0] font-bold relative text-[14px] text-[#212b36] leading-[1.2]">Tax Invoice</h6>
                <div className="flex flex-row gap-2 text-center">
                  <div className="w-1/2">
                    <div className="mb-[6px] text-[12px]">
                      <span className="text-[#212b36]">Name: </span>
                      {lastPayload.store.name}
                    </div>
                    <div className="mb-[6px] text-[12px]">
                      <span className="text-[#212b36]">Invoice No: </span>
                      {lastPayload.meta.transaction_id}
                    </div>
                  </div>
                  <div className="w-1/2">
                    <div className="mb-[6px] text-[12px]">
                      <span className="text-[#212b36]">Customer Id: </span>#
                    </div>
                    <div className="mb-[6px] text-[12px]">
                      <span className="text-[#212b36]">Date: </span>
                      {new Date(lastPayload.issued_at).toLocaleString("id-ID")}
                    </div>
                  </div>
                </div>
              </div>

              <table className="border-collapse w-full mx-auto my-[12px]">
                <thead className="border-b border-dashed border-t">
                  <tr>
                    <th className="text-[#212b36] font-bold p-[6px_4px] text-left text-[12px]"># Item</th>
                    <th className="text-[#212b36] font-bold p-[6px_4px] text-left text-[12px]">Price</th>
                    <th className="text-[#212b36] font-bold p-[6px_4px] text-left text-[12px]">Qty</th>
                    <th className="text-[#212b36] font-bold p-[6px_4px] text-right text-[12px]">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {lastPayload.items.map((it, idx) => (
                    <tr key={idx}>
                      <td className="p-[6px_4px] border-dashed text-[12px]">{it.name}</td>
                      <td className="p-[6px_4px] border-dashed text-[12px]">{it.subtotal.toLocaleString("id-ID", { style: "currency", currency: "IDR" })}</td>
                      <td className="p-[6px_4px] border-dashed text-[12px]">{it.qty}</td>
                      <td className="p-[6px_4px] border-dashed text-right text-[12px]">
                        {(it.qty * it.unitPrice).toLocaleString("id-ID", { style: "currency", currency: "IDR" })}
                      </td>
                    </tr>
                  ))}
                  <tr>
                    <td colSpan={4}>
                      <table className="w-full">
                        <tbody className="border-b border-dashed border-t">
                          <tr>
                            <td className="font-bold p-[6px_4px] text-[12px]">Sub Total :</td>
                            <td className="text-right p-[6px_4px] text-[12px]">
                              {lastPayload.summary.subtotal.toLocaleString("id-ID", { style: "currency", currency: "IDR" })}
                            </td>
                          </tr>
                          <tr>
                            <td className="font-bold p-[6px_4px] text-[12px]">Discount :</td>
                            <td className="text-right p-[6px_4px] text-[12px]">
                              {lastPayload.summary.discount.toLocaleString("id-ID", { style: "currency", currency: "IDR" })}
                            </td>
                          </tr>
                          <tr>
                            <td className="font-bold p-[6px_4px] text-[12px]">Tax (11%) :</td>
                            <td className="text-right p-[6px_4px] text-[12px]">
                              {lastPayload.summary.tax.toLocaleString("id-ID", { style: "currency", currency: "IDR" })}
                            </td>
                          </tr>
                          <tr>
                            <td className="font-bold p-[6px_4px] text-[12px]">Total Bill :</td>
                            <td className="text-right p-[6px_4px] text-[12px]">
                              {lastPayload.summary.total.toLocaleString("id-ID", { style: "currency", currency: "IDR" })} {/* <-- FIXED */}
                            </td>
                          </tr>
                          <tr>
                            <td className="font-bold text-[14px] text-[#092c4c] p-[6px_4px]">Total Payable :</td>
                            <td className="font-bold text-[14px] text-[#092c4c] text-right p-[6px_4px]">
                              {lastPayload.summary.total.toLocaleString("id-ID", { style: "currency", currency: "IDR" })}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </td>
                  </tr>
                </tbody>
              </table>

              <div className="border-dashed border-t pt-[10px] text-center">
                <div className="border-dashed border-b">
                  <p className="mb-[12px] text-[12px]">**VAT against this challan is payable through central registration. Thank you for your business!</p>
                </div>
                <p className="text-[12px]">Thank You For Shopping With Us. Please Come Again</p>
              </div>
            </div>
          ) : (
            <div className="text-sm text-[#646b72]">No data.</div>
          )}
        </div>
      </Modal>
    </>
  );
}
