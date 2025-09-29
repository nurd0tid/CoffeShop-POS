"use client";

import React from "react";
import { Modal, QRCode, Button, Space, message } from "antd";

type Props = {
  open: boolean;
  title?: string;
  value: string; // biasanya URL /pay?data=...
  onClose: () => void;
  size?: number; // default 240
  icon?: string; // default "/logo.png"
  iconSize?: number; // default 48
  showRaw?: boolean; // tampilkan payload mentah
};

export default function QrModal({ open, title = "Scan to Pay", value, onClose, size = 240, icon = "/logo.png", iconSize = 48, showRaw = false }: Props) {
  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      message.success("QR payload copied");
    } catch {
      message.error("Copy failed");
    }
  };

  return (
    <Modal open={open} onCancel={onClose} footer={null} centered title={title}>
      <div className="w-full flex flex-col items-center gap-4">
        <QRCode value={value} size={size} icon={icon} iconSize={iconSize} bordered errorLevel="M" />
        <Space>
          <Button onClick={onCopy}>Copy</Button>
          <Button onClick={onClose} type="primary">
            Close
          </Button>
        </Space>
        {showRaw ? <code className="text-xs w-full max-h-40 overflow-auto block bg-[#f7f7f7] p-2 rounded">{value}</code> : null}
      </div>
    </Modal>
  );
}
