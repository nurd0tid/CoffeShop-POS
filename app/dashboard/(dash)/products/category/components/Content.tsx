"use client";

import * as React from "react";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Card, ConfigProvider, Input, Pagination, Select, Space, Table, Tooltip, Typography, Button, Tag, Dropdown } from "antd";
import type { TableColumnsType, MenuProps } from "antd";
import { FiSearch, FiChevronDown, FiEdit3, FiTrash2 } from "react-icons/fi";
import { BiPlusCircle } from "react-icons/bi";

/** -------- Props -------- */
type Props = {
  companyId: string;
  canCreate: boolean;
  canUpdate: boolean;
  canDelete: boolean;
};

/** -------- Data types -------- */
type Row = {
  key: string;
  name: string;
  slug: string;
  createdOn: Date;
  status: "Active" | "Inactive";
};

/** -------- Formatters (SSR-safe) -------- */
const DMY = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});
const fmtDate = (d: Date) => DMY.format(d);

/** -------- Dummy 20 rows -------- */
const DUMMY: Row[] = [
  { key: "1", name: "Laptop", slug: "laptop", createdOn: new Date("2023-05-25"), status: "Active" },
  { key: "2", name: "Electronics", slug: "electronics", createdOn: new Date("2023-06-24"), status: "Active" },
  { key: "3", name: "Shoe", slug: "shoe", createdOn: new Date("2023-07-23"), status: "Active" },
  { key: "4", name: "Speaker", slug: "speaker", createdOn: new Date("2023-08-22"), status: "Active" },
  { key: "5", name: "Furniture", slug: "furniture", createdOn: new Date("2023-09-21"), status: "Active" },
  { key: "6", name: "Bags", slug: "bags", createdOn: new Date("2023-09-20"), status: "Active" },
  { key: "7", name: "Phone", slug: "phone", createdOn: new Date("2023-09-20"), status: "Active" },
  { key: "8", name: "Chairs", slug: "chairs", createdOn: new Date("2023-09-20"), status: "Active" },
  // tambahan supaya jadi 20
  { key: "9", name: "Camera", slug: "camera", createdOn: new Date("2023-10-05"), status: "Active" },
  { key: "10", name: "Tablet", slug: "tablet", createdOn: new Date("2023-10-12"), status: "Active" },
  { key: "11", name: "Accessories", slug: "accessories", createdOn: new Date("2023-10-19"), status: "Active" },
  { key: "12", name: "Gaming", slug: "gaming", createdOn: new Date("2023-11-03"), status: "Active" },
  { key: "13", name: "Smart Home", slug: "smart-home", createdOn: new Date("2023-11-18"), status: "Active" },
  { key: "14", name: "Appliances", slug: "appliances", createdOn: new Date("2023-12-02"), status: "Active" },
  { key: "15", name: "Beauty", slug: "beauty", createdOn: new Date("2023-12-15"), status: "Active" },
  { key: "16", name: "Toys", slug: "toys", createdOn: new Date("2024-01-07"), status: "Active" },
  { key: "17", name: "Books", slug: "books", createdOn: new Date("2024-01-20"), status: "Active" },
  { key: "18", name: "Groceries", slug: "groceries", createdOn: new Date("2024-02-05"), status: "Active" },
  { key: "19", name: "Outdoor", slug: "outdoor", createdOn: new Date("2024-02-18"), status: "Active" },
  { key: "20", name: "Automotive", slug: "automotive", createdOn: new Date("2024-03-01"), status: "Active" },
];

export default function CategoryTable({ companyId, canCreate, canUpdate, canDelete }: Props) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // search & filters
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | undefined>(); // "Active"/"Inactive"
  const [sortBy, setSortBy] = useState<string>("last7");

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    let list = DUMMY.filter((r) => {
      const hit = !term || r.name.toLowerCase().includes(term) || r.slug.toLowerCase().includes(term);
      if (!hit) return false;
      if (statusFilter && r.status !== statusFilter) return false;
      return true;
    });

    if (sortBy === "nameAsc") list = list.slice().sort((a, b) => a.name.localeCompare(b.name));
    if (sortBy === "nameDesc") list = list.slice().sort((a, b) => b.name.localeCompare(a.name));
    if (sortBy === "dateAsc") list = list.slice().sort((a, b) => +a.createdOn - +b.createdOn);
    if (sortBy === "dateDesc") list = list.slice().sort((a, b) => +b.createdOn - +a.createdOn);

    return list;
  }, [q, statusFilter, sortBy]);

  useEffect(() => setPage(1), [q, pageSize, statusFilter, sortBy]);

  const paged = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize]);

  /** -------- Columns -------- */
  const columns: TableColumnsType<Row> = [
    {
      title: "Category",
      dataIndex: "name",
      sorter: (a, b) => a.name.localeCompare(b.name),
      onCell: () => ({ style: { padding: "10px 20px" } }),
      onHeaderCell: () => ({ style: { padding: "10px 20px" } }),
      render: (t) => <Typography.Text style={{ fontSize: 14, color: "#212b36" }}>{t}</Typography.Text>,
    },
    {
      title: "Category Slug",
      dataIndex: "slug",
      sorter: (a, b) => a.slug.localeCompare(b.slug),
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
      onCell: () => ({ style: { padding: "10px 20px" } }),
      onHeaderCell: () => ({ style: { padding: "10px 20px" } }),
      render: (s: Row["status"]) => (
        <Tag color={s === "Active" ? "success" : "default"} className="!px-3 !py-[2px] !rounded">
          {s}
        </Tag>
      ),
      filters: [
        { text: "Active", value: "Active" },
        { text: "Inactive", value: "Inactive" },
      ],
      onFilter: (value, record) => record.status === value,
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
                href={`/dashboard/categories/${encodeURIComponent(r.slug)}/edit?company=${encodeURIComponent(companyId)}`}
                className="border border-[#e6eaed] bg-white rounded-[5px] inline-flex items-center justify-center p-[.5rem] !text-[#212b36]"
              >
                <FiEdit3 size={16} />
              </Link>
            </Tooltip>
          )}
          {canDelete && (
            <Tooltip title="Delete">
              <form
                action={`/dashboard/categories/${encodeURIComponent(r.slug)}/delete?company=${encodeURIComponent(companyId)}`}
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

  /** -------- Theme (konsisten) -------- */
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

  // controls size
  const CONTROL_HEIGHT = 38;
  const CONTROL_WIDTH = 160;
  const controlStyle: React.CSSProperties = { height: CONTROL_HEIGHT, width: CONTROL_WIDTH };

  const statusOptions = [
    { label: "All", value: undefined },
    { label: "Active", value: "Active" },
    { label: "Inactive", value: "Inactive" },
  ];

  const sortMenu: MenuProps["items"] = [
    { key: "last7", label: "Last 7 Days" },
    { key: "nameAsc", label: "Name: A → Z" },
    { key: "nameDesc", label: "Name: Z → A" },
    { key: "dateAsc", label: "Date: Old → New" },
    { key: "dateDesc", label: "Date: New → Old" },
  ];

  return (
    <ConfigProvider theme={theme}>
      {/* Header line (title + Add button) */}
      <div className="flex items-center justify-between mb-[16px]">
        <div>
          <h4 className="font-bold mb-[5px] text-[1.125rem] text-[#212b36] leading-[1.2]">Category</h4>
          <h6 className="text-sm text-[#646b72] leading-[1.2]">Manage your categories</h6>
        </div>

        {canCreate && (
          <button
            className="bg-[#ff9f43] border border-[#ff9f43] text-white cursor-pointer flex items-center justify-center p-[.45rem_.9rem] text-[13px] rounded-[8px] gap-2"
            onClick={() => router.push(`/dashboard/categories/create?company=${encodeURIComponent(companyId)}`)}
          >
            <BiPlusCircle />
            Add Category
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
            {/* Search (left) */}
            <Input
              allowClear
              prefix={<FiSearch size={14} className="text-[#a6aaaf]" />}
              placeholder="Search"
              style={{ width: 240, height: CONTROL_HEIGHT, color: "#212b36", lineHeight: "1.6", fontSize: 14 }}
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />

            {/* Filters (right) */}
            <div className="flex items-center gap-2">
              <Select
                placeholder="Status"
                value={statusFilter}
                onChange={setStatusFilter as any}
                style={controlStyle}
                options={statusOptions as any}
                allowClear
              />

              <Dropdown
                menu={{
                  items: sortMenu,
                  selectable: true,
                  selectedKeys: [sortBy],
                  onClick: (e) => setSortBy(e.key),
                }}
              >
                <Button className="!flex !items-center !justify-between" style={{ ...controlStyle, width: 200 }}>
                  <span className="truncate">{sortBy === "last7" ? "Sort By : Last 7 Days" : "Sort By"}</span>
                  <FiChevronDown />
                </Button>
              </Dropdown>
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

        {/* footer */}
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
