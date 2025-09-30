"use client";

import * as React from "react";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Card, ConfigProvider, Input, Pagination, Select, Space, Table, Tooltip, Typography, Button, Tag } from "antd";
import type { TableColumnsType } from "antd";
import { FiSearch, FiEdit3, FiTrash2 } from "react-icons/fi";
import { BiPlusCircle } from "react-icons/bi";

type Props = {
  companyId: string;
  canCreate: boolean;
  canUpdate: boolean;
  canDelete: boolean;
};

type Row = {
  key: string;
  name: string;
  description: string;
  duration: string; // e.g. "3 Months", "1 Year"
  status: "Active" | "Inactive";
};

// 20 dummy warranties
const DUMMY: Row[] = [
  {
    key: "1",
    name: "Express Warranty",
    description: "Repairs or a replacement for a faulty product within a specified time period after it was purchased.",
    duration: "3 Months",
    status: "Active",
  },
  {
    key: "2",
    name: "Special warranty",
    description: "Seller of the property (grantor) warrants only against anything that occurred during their physical ownership.",
    duration: "6 Months",
    status: "Active",
  },
  {
    key: "3",
    name: "Implied Warranty",
    description: "Assurances that a product is fit for the purpose that it is intended and that it is merchantable.",
    duration: "1 Year",
    status: "Active",
  },

  { key: "4", name: "Limited Warranty", description: "Covers specific defects or parts for a limited time.", duration: "6 Months", status: "Active" },
  { key: "5", name: "Lifetime Warranty", description: "Valid for the usable lifetime of the product.", duration: "Lifetime", status: "Active" },
  { key: "6", name: "Return-to-Base", description: "Customer returns item to service center for repair.", duration: "12 Months", status: "Active" },
  { key: "7", name: "On-site Warranty", description: "Technician visits customer site for service.", duration: "12 Months", status: "Active" },
  { key: "8", name: "Carry-in Warranty", description: "Customer brings product to authorized workshop.", duration: "9 Months", status: "Active" },
  { key: "9", name: "Accidental Damage", description: "Covers accidental drops and spills subject to terms.", duration: "1 Year", status: "Active" },
  { key: "10", name: "Battery Coverage", description: "Coverage specifically for battery defects.", duration: "6 Months", status: "Active" },
  { key: "11", name: "Screen Protection", description: "Covers cracked screen replacement once.", duration: "6 Months", status: "Active" },
  { key: "12", name: "Extended Service Plan", description: "Extends base warranty with extra service options.", duration: "2 Years", status: "Active" },
  { key: "13", name: "International Warranty", description: "Service available across multiple regions.", duration: "1 Year", status: "Active" },
  { key: "14", name: "Pickup & Return", description: "Product is picked up, repaired, and returned.", duration: "1 Year", status: "Active" },
  { key: "15", name: "Parts Only", description: "Covers cost of parts; labor excluded.", duration: "1 Year", status: "Active" },
  { key: "16", name: "Labor Only", description: "Covers labor charges; parts excluded.", duration: "1 Year", status: "Active" },
  { key: "17", name: "Refurb Replacement", description: "Defective unit replaced with refurbished unit.", duration: "9 Months", status: "Active" },
  { key: "18", name: "Swap Program", description: "Instant swap with equivalent model on failure.", duration: "12 Months", status: "Active" },
  { key: "19", name: "Peripherals Cover", description: "Includes chargers, cables, and accessories.", duration: "6 Months", status: "Active" },
  { key: "20", name: "Commercial Use Warranty", description: "Warranty valid under commercial usage.", duration: "1 Year", status: "Active" },
];

export default function WarrantiesTable({ companyId, canCreate, canUpdate, canDelete }: Props) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // search / filter / paging
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | undefined>();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return DUMMY.filter((r) => {
      const hit = !term || r.name.toLowerCase().includes(term) || r.description.toLowerCase().includes(term) || r.duration.toLowerCase().includes(term);
      if (!hit) return false;
      if (statusFilter && r.status !== statusFilter) return false;
      return true;
    });
  }, [q, statusFilter]);

  useEffect(() => setPage(1), [q, pageSize, statusFilter]);

  const paged = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize]);

  // columns
  const columns: TableColumnsType<Row> = [
    {
      title: "Name",
      dataIndex: "name",
      sorter: (a, b) => a.name.localeCompare(b.name),
      onCell: () => ({ style: { padding: "10px 20px" } }),
      onHeaderCell: () => ({ style: { padding: "10px 20px" } }),
      render: (t) => <Typography.Text style={{ fontSize: 14, color: "#212b36" }}>{t}</Typography.Text>,
    },
    {
      title: "Description",
      dataIndex: "description",
      onCell: () => ({ style: { padding: "10px 20px" } }),
      onHeaderCell: () => ({ style: { padding: "10px 20px" } }),
      render: (t) => <Typography.Text style={{ fontSize: 14, color: "#646b72" }}>{t}</Typography.Text>,
    },
    {
      title: "Duration",
      dataIndex: "duration",
      sorter: (a, b) => a.duration.localeCompare(b.duration),
      onCell: () => ({ style: { padding: "10px 20px" } }),
      onHeaderCell: () => ({ style: { padding: "10px 20px" } }),
      render: (t) => <Typography.Text style={{ fontSize: 14, color: "#646b72" }}>{t}</Typography.Text>,
    },
    {
      title: "Status",
      dataIndex: "status",
      width: 120,
      onCell: () => ({ style: { padding: "10px 20px" } }),
      onHeaderCell: () => ({ style: { padding: "10px 20px" } }),
      render: (s: Row["status"]) => (
        <Tag color={s === "Active" ? "success" : "default"} className="!px-3 !py-[2px] !rounded">
          {s}
        </Tag>
      ),
    },
    {
      title: "",
      key: "action",
      width: 120,
      onCell: () => ({ style: { padding: "10px 20px" } }),
      onHeaderCell: () => ({ style: { padding: "10px 20px" } }),
      render: (_, r) => (
        <Space>
          {canUpdate && (
            <Tooltip title="Edit">
              <Link
                href={`/dashboard/warranties/${encodeURIComponent(r.name)}/edit?company=${encodeURIComponent(companyId)}`}
                className="border border-[#e6eaed] bg-white rounded-[5px] inline-flex items-center justify-center p-[.5rem] !text-[#212b36]"
              >
                <FiEdit3 size={16} />
              </Link>
            </Tooltip>
          )}
          {canDelete && (
            <Tooltip title="Delete">
              <form
                action={`/dashboard/warranties/${encodeURIComponent(r.name)}/delete?company=${encodeURIComponent(companyId)}`}
                method="post"
                className="inline"
              >
                <button
                  type="submit"
                  className="border border-[#e6eaed] bg-white rounded-[5px] inline-flex items-center justify-center p-[.5rem] !text-[#212b36]"
                >
                  <FiTrash2 size={16} />
                </button>
              </form>
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  // theme konsisten
  const theme = {
    token: {
      colorBorder: "#e6e9ef",
      borderRadiusLG: 8,
      colorText: "#212b36",
      colorBgContainer: "#ffffff",
      padding: 12,
    },
    components: {
      Table: {
        headerBg: "#f7f9fc",
        headerColor: "#212b36",
        headerSplitColor: "#e6e9ef",
        rowHoverBg: "#f7f9fc",
        headerSortHoverBg: "#eef3fb",
        headerSortActiveBg: "#e8effc",
      },
      Card: { headerHeight: 60, headerPadding: 16, padding: 16, lineWidth: 1, colorBorderSecondary: "#e6e9ef" },
      Input: { colorBorder: "#e6e9ef" },
      Select: { colorBorder: "#e6e9ef" },
      Button: {},
      Tag: {},
    },
  } as const;

  const CONTROL_HEIGHT = 38;
  const CONTROL_WIDTH = 160;
  const controlStyle: React.CSSProperties = { height: CONTROL_HEIGHT, width: CONTROL_WIDTH };

  return (
    <ConfigProvider theme={theme}>
      {/* Header */}
      <div className="flex items-center justify-between mb-[16px]">
        <div>
          <h4 className="font-bold mb-[5px] text-[1.125rem] text-[#212b36] leading-[1.2]">Warranties</h4>
          <h6 className="text-sm text-[#646b72] leading-[1.2]">Manage your warranties</h6>
        </div>

        {canCreate && (
          <button
            className="bg-[#ff9f43] border border-[#ff9f43] text-white cursor-pointer flex items-center justify-center p-[.45rem_.9rem] text-[13px] rounded-[8px] gap-2"
            onClick={() => router.push(`/dashboard/warranties/create?company=${encodeURIComponent(companyId)}`)}
          >
            <BiPlusCircle />
            Add Warranty
          </button>
        )}
      </div>

      <Card
        style={{ borderRadius: 8, overflow: "hidden", marginBottom: 16 }}
        styles={{
          header: { padding: "1rem 1.25rem", borderColor: "#e6eaed" },
          body: { paddingInline: 0, paddingTop: 0, paddingBottom: 16 },
        }}
        title={
          <div className="flex items-center justify-between gap-3">
            {/* Search kiri */}
            <Input
              allowClear
              prefix={<FiSearch size={14} className="text-[#a6aaaf]" />}
              placeholder="Search"
              style={{ width: 240, height: CONTROL_HEIGHT, color: "#212b36", lineHeight: "1.6", fontSize: 14 }}
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />

            {/* Filter kanan */}
            <div className="flex items-center gap-2">
              <Select
                placeholder="Status"
                value={statusFilter}
                onChange={setStatusFilter as any}
                style={controlStyle}
                allowClear
                options={[
                  { label: "Active", value: "Active" },
                  { label: "Inactive", value: "Inactive" },
                ]}
              />
            </div>
          </div>
        }
      >
        <Table<Row>
          size="middle"
          rowKey="key"
          columns={columns}
          dataSource={paged}
          pagination={false}
          bordered={false}
          loading={{ spinning: !mounted }}
          style={{ minHeight: 240 }}
          rowSelection={{ columnWidth: 43, selectedRowKeys: [], onChange: () => {} }}
          components={{
            header: {
              cell: (props: React.HTMLAttributes<HTMLTableCellElement>) => (
                <th
                  {...props}
                  style={{
                    ...(props.style || {}),
                    ...((props.className || "").includes("ant-table-selection-column") ? { padding: "10px 20px" } : {}),
                  }}
                />
              ),
            },
            body: {
              cell: (props: React.HTMLAttributes<HTMLTableCellElement>) => (
                <td
                  {...props}
                  style={{
                    ...(props.style || {}),
                    ...((props.className || "").includes("ant-table-selection-column") ? { padding: "10px 20px" } : {}),
                  }}
                />
              ),
            },
          }}
        />

        {/* Footer */}
        <div className="flex items-center justify-between mt-4 mx-4">
          <Space>
            <span>Row Per Page</span>
            <Select value={pageSize} onChange={setPageSize} options={[10, 20, 30, 50].map((v) => ({ value: v, label: v }))} style={{ width: 88 }} />
            <span>Entries</span>
          </Space>

          <Pagination current={page} pageSize={pageSize} total={filtered.length} showSizeChanger={false} onChange={setPage} showLessItems />
        </div>
      </Card>
    </ConfigProvider>
  );
}
