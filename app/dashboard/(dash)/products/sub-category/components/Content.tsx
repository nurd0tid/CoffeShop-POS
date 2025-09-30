"use client";

import * as React from "react";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Card, ConfigProvider, Input, Pagination, Select, Space, Table, Tooltip, Typography, Button, Tag } from "antd";
// antd types
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
  image: string; // url/icon name (dummy)
  subCategory: string;
  category: string;
  code: string;
  description: string;
  status: "Active" | "Inactive";
};

// ---------- dummy 20 rows ----------
const DUMMY: Row[] = [
  { key: "1", image: "🖥️", subCategory: "Computers", category: "Computers", code: "CT001", description: "Computers description", status: "Active" },
  { key: "2", image: "🍊", subCategory: "Fruits", category: "Fruits", code: "CT002", description: "Fruits description", status: "Active" },
  { key: "3", image: "🍍", subCategory: "Fruits", category: "Fruits", code: "CT003", description: "Fruits description", status: "Active" },
  { key: "4", image: "🌶️", subCategory: "Fruits", category: "Fruits", code: "CT004", description: "Fruits description", status: "Active" },
  { key: "5", image: "🧰", subCategory: "Accessories", category: "Accessories", code: "CT005", description: "Accessories description", status: "Active" },
  { key: "6", image: "👟", subCategory: "Shoes", category: "Shoes", code: "CT006", description: "Shoes description", status: "Active" },
  { key: "7", image: "🍓", subCategory: "Fruits", category: "Fruits", code: "CT007", description: "Fruits description", status: "Active" },
  { key: "8", image: "🍎", subCategory: "Fruits", category: "Fruits", code: "CT008", description: "Fruits description", status: "Active" },
  { key: "9", image: "💻", subCategory: "Computers", category: "Computers", code: "CT009", description: "Computers description", status: "Active" },
  { key: "10", image: "🩺", subCategory: "Health Care", category: "Health Care", code: "CT010", description: "Health Care description", status: "Active" },

  { key: "11", image: "🎮", subCategory: "Gaming", category: "Gaming", code: "CT011", description: "Gaming description", status: "Active" },
  { key: "12", image: "📷", subCategory: "Cameras", category: "Cameras", code: "CT012", description: "Cameras description", status: "Active" },
  { key: "13", image: "📱", subCategory: "Smartphone", category: "Phone", code: "CT013", description: "Phone description", status: "Active" },
  { key: "14", image: "⌚", subCategory: "Wearables", category: "Electronics", code: "CT014", description: "Wearables description", status: "Active" },
  { key: "15", image: "👜", subCategory: "Handbags", category: "Bags", code: "CT015", description: "Handbags description", status: "Active" },
  { key: "16", image: "🪑", subCategory: "Office Chairs", category: "Furniture", code: "CT016", description: "Office chairs description", status: "Active" },
  { key: "17", image: "🧸", subCategory: "Toys", category: "Toys", code: "CT017", description: "Toys description", status: "Active" },
  { key: "18", image: "🔌", subCategory: "Cables", category: "Accessories", code: "CT018", description: "Cables description", status: "Active" },
  { key: "19", image: "🧴", subCategory: "Beauty", category: "Beauty", code: "CT019", description: "Beauty description", status: "Active" },
  { key: "20", image: "🥑", subCategory: "Organic", category: "Groceries", code: "CT020", description: "Organic description", status: "Active" },
];

export default function SubCategoryTable({ companyId, canCreate, canUpdate, canDelete }: Props) {
  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // search + paging
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // filters
  const categories = useMemo(() => Array.from(new Set(DUMMY.map((d) => d.category))), []);
  const [fCategory, setFCategory] = useState<string | undefined>();
  const [fStatus, setFStatus] = useState<string | undefined>();

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return DUMMY.filter((r) => {
      if (term && ![r.subCategory, r.category, r.code, r.description].some((t) => t.toLowerCase().includes(term))) return false;
      if (fCategory && r.category !== fCategory) return false;
      if (fStatus && r.status !== fStatus) return false;
      return true;
    });
  }, [q, fCategory, fStatus]);

  useEffect(() => setPage(1), [q, pageSize, fCategory, fStatus]);

  const paged = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize]);

  // columns
  const columns: TableColumnsType<Row> = [
    {
      title: "Image",
      dataIndex: "image",
      width: 90,
      onCell: () => ({ style: { padding: "10px 20px" } }),
      onHeaderCell: () => ({ style: { padding: "10px 20px" } }),
      render: (emoji: string) => <div className="inline-flex items-center justify-center w-[30px] h-[30px] rounded bg-[#f4f6fa] text-lg">{emoji}</div>,
    },
    {
      title: "Sub Category",
      dataIndex: "subCategory",
      sorter: (a, b) => a.subCategory.localeCompare(b.subCategory),
      onCell: () => ({ style: { padding: "10px 20px" } }),
      onHeaderCell: () => ({ style: { padding: "10px 20px" } }),
      render: (t) => <Typography.Text style={{ fontSize: 14, color: "#212b36" }}>{t}</Typography.Text>,
    },
    {
      title: "Category",
      dataIndex: "category",
      sorter: (a, b) => a.category.localeCompare(b.category),
      onCell: () => ({ style: { padding: "10px 20px" } }),
      onHeaderCell: () => ({ style: { padding: "10px 20px" } }),
      render: (t) => <Typography.Text style={{ fontSize: 14, color: "#646b72" }}>{t}</Typography.Text>,
    },
    {
      title: "Category Code",
      dataIndex: "code",
      sorter: (a, b) => a.code.localeCompare(b.code),
      onCell: () => ({ style: { padding: "10px 20px" } }),
      onHeaderCell: () => ({ style: { padding: "10px 20px" } }),
      render: (t) => <Typography.Text style={{ fontSize: 14, color: "#646b72" }}>{t}</Typography.Text>,
    },
    {
      title: "Description",
      dataIndex: "description",
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
                href={`/dashboard/sub-categories/${encodeURIComponent(r.code)}/edit?company=${encodeURIComponent(companyId)}`}
                className="border border-[#e6eaed] bg-white rounded-[5px] inline-flex items-center justify-center p-[.5rem] !text-[#212b36]"
              >
                <FiEdit3 size={16} />
              </Link>
            </Tooltip>
          )}
          {canDelete && (
            <Tooltip title="Delete">
              <form
                action={`/dashboard/sub-categories/${encodeURIComponent(r.code)}/delete?company=${encodeURIComponent(companyId)}`}
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

  // theme (samakan dengan komponen lainmu)
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
          <h4 className="font-bold mb-[5px] text-[1.125rem] text-[#212b36] leading-[1.2]">Sub Category</h4>
          <h6 className="text-sm text-[#646b72] leading-[1.2]">Manage your sub categories</h6>
        </div>

        {canCreate && (
          <button
            className="bg-[#ff9f43] border border-[#ff9f43] text-white cursor-pointer flex items-center justify-center p-[.45rem_.9rem] text-[13px] rounded-[8px] gap-2"
            onClick={() => router.push(`/dashboard/sub-categories/create?company=${encodeURIComponent(companyId)}`)}
          >
            <BiPlusCircle />
            Add Sub Category
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
                allowClear
                placeholder="Category"
                value={fCategory}
                onChange={setFCategory}
                options={categories.map((c) => ({ label: c, value: c }))}
                style={controlStyle}
              />
              <Select
                allowClear
                placeholder="Status"
                value={fStatus}
                onChange={setFStatus}
                options={[
                  { label: "Active", value: "Active" },
                  { label: "Inactive", value: "Inactive" },
                ]}
                style={controlStyle}
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
