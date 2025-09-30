"use client";

import * as React from "react";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Card, ConfigProvider, Input, Pagination, Select, Space, Table, Tooltip, Typography, Tag } from "antd";
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
  variant: string;
  values: string;
  createdOn: Date;
  status: "Active" | "Inactive";
};

// SSR-safe formatter
const DMY = new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric" });
const fmtDate = (d: Date) => DMY.format(d);

// 20 dummy rows
const DUMMY: Row[] = [
  { key: "1", variant: "Size (T-shirts)", values: "S,M,L,XL", createdOn: new Date("2023-05-25"), status: "Active" },
  { key: "2", variant: "Size (Shoes)", values: "5,6,7,8,9", createdOn: new Date("2023-06-24"), status: "Active" },
  { key: "3", variant: "Color", values: "Red, Blue, Green", createdOn: new Date("2023-07-23"), status: "Active" },
  { key: "4", variant: "Memory", values: "64 GB, 128 GB, 512 GB", createdOn: new Date("2023-08-22"), status: "Active" },
  { key: "5", variant: "Storage", values: "250GB, 1TB", createdOn: new Date("2023-09-21"), status: "Active" },
  { key: "6", variant: "Material", values: "Cotton, Leather, Nylon", createdOn: new Date("2023-10-05"), status: "Active" },
  { key: "7", variant: "Length", values: "Short, Regular, Long", createdOn: new Date("2023-10-12"), status: "Active" },
  { key: "8", variant: "Width", values: "Narrow, Regular, Wide", createdOn: new Date("2023-10-19"), status: "Active" },
  { key: "9", variant: "Capacity", values: "500ml, 1L, 2L", createdOn: new Date("2023-11-03"), status: "Active" },
  { key: "10", variant: "Voltage", values: "110V, 220V", createdOn: new Date("2023-11-18"), status: "Active" },
  { key: "11", variant: "Wattage", values: "30W, 60W, 100W", createdOn: new Date("2023-12-02"), status: "Active" },
  { key: "12", variant: "Connectivity", values: "Wi-Fi, Ethernet, LTE", createdOn: new Date("2023-12-15"), status: "Active" },
  { key: "13", variant: "Resolution", values: "HD, FHD, 4K", createdOn: new Date("2024-01-07"), status: "Active" },
  { key: "14", variant: "Refresh Rate", values: "60Hz, 120Hz, 144Hz", createdOn: new Date("2024-01-20"), status: "Active" },
  { key: "15", variant: "Frame Size", values: "S, M, L", createdOn: new Date("2024-02-05"), status: "Active" },
  { key: "16", variant: "Wheel Size", values: '26", 27.5", 29"', createdOn: new Date("2024-02-18"), status: "Active" },
  { key: "17", variant: "Pattern", values: "Plain, Striped, Dotted", createdOn: new Date("2024-03-01"), status: "Active" },
  { key: "18", variant: "Finish", values: "Matte, Glossy", createdOn: new Date("2024-03-12"), status: "Active" },
  { key: "19", variant: "Bundle", values: "Single, 2-Pack, 4-Pack", createdOn: new Date("2024-03-20"), status: "Active" },
  { key: "20", variant: "Warranty", values: "6m, 1y, 2y", createdOn: new Date("2024-03-28"), status: "Active" },
];

export default function VariantAttributesTable({ companyId, canCreate, canUpdate, canDelete }: Props) {
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
      const hit = !term || r.variant.toLowerCase().includes(term) || r.values.toLowerCase().includes(term);
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
      title: "Variant",
      dataIndex: "variant",
      sorter: (a, b) => a.variant.localeCompare(b.variant),
      onCell: () => ({ style: { padding: "10px 20px" } }),
      onHeaderCell: () => ({ style: { padding: "10px 20px" } }),
      render: (t) => <Typography.Text style={{ fontSize: 14, color: "#212b36" }}>{t}</Typography.Text>,
    },
    {
      title: "Values",
      dataIndex: "values",
      onCell: () => ({ style: { padding: "10px 20px" } }),
      onHeaderCell: () => ({ style: { padding: "10px 20px" } }),
      render: (t) => <Typography.Text style={{ fontSize: 14, color: "#646b72" }}>{t}</Typography.Text>,
    },
    {
      title: "Created On",
      dataIndex: "createdOn",
      sorter: (a, b) => +a.createdOn - +b.createdOn,
      onCell: () => ({ style: { padding: "10px 20px" } }),
      onHeaderCell: () => ({ style: { padding: "10px 20px" } }),
      render: (d: Date) => (
        <Typography.Text suppressHydrationWarning style={{ fontSize: 14, color: "#646b72" }}>
          {fmtDate(d)}
        </Typography.Text>
      ),
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
                href={`/dashboard/variants/${encodeURIComponent(r.variant)}/edit?company=${encodeURIComponent(companyId)}`}
                className="border border-[#e6eaed] bg-white rounded-[5px] inline-flex items-center justify-center p-[.5rem] !text-[#212b36]"
              >
                <FiEdit3 size={16} />
              </Link>
            </Tooltip>
          )}
          {canDelete && (
            <Tooltip title="Delete">
              <form
                action={`/dashboard/variants/${encodeURIComponent(r.variant)}/delete?company=${encodeURIComponent(companyId)}`}
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
          <h4 className="font-bold mb-[5px] text-[1.125rem] text-[#212b36] leading-[1.2]">Variant Attributes</h4>
          <h6 className="text-sm text-[#646b72] leading-[1.2]">Manage your variant attributes</h6>
        </div>

        {canCreate && (
          <button
            className="bg-[#ff9f43] border border-[#ff9f43] text-white cursor-pointer flex items-center justify-center p-[.45rem_.9rem] text-[13px] rounded-[8px] gap-2"
            onClick={() => router.push(`/dashboard/variants/create?company=${encodeURIComponent(companyId)}`)}
          >
            <BiPlusCircle />
            Add Variant
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
