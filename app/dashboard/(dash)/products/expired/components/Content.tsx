"use client";

import * as React from "react";
import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Card, ConfigProvider, Input, Pagination, Select, Space, Table, Tooltip, Typography, Button, Tag, Dropdown } from "antd";
import type { TableColumnsType, MenuProps } from "antd";
import { FiEdit3, FiTrash2, FiSearch, FiChevronDown, FiRefreshCw, FiGrid, FiSettings } from "react-icons/fi";

type Props = {
  companyId: string;
  canCreate: boolean;
  canUpdate: boolean;
  canDelete: boolean;
};

type Row = {
  key: string;
  sku: string;
  product: string;
  mfg: Date;
  exp: Date;
};

// ====== deterministic date formatter (SSR-safe) ======
const DMY = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});
const fmtDate = (d: Date) => DMY.format(d);

// ====== DUMMY 20 rows ======
const DUMMY: Row[] = [
  { key: "1", sku: "PT001", product: "Lenovo 3rd Generation", mfg: new Date("2022-11-19"), exp: new Date("2023-01-02") },
  { key: "2", sku: "PT002", product: "Nike Jordan", mfg: new Date("2022-11-24"), exp: new Date("2023-01-23") },
  { key: "3", sku: "PT003", product: "Apple Series 5 Watch", mfg: new Date("2022-12-11"), exp: new Date("2023-02-18") },
  { key: "4", sku: "PT004", product: "Amazon Echo Dot", mfg: new Date("2022-12-27"), exp: new Date("2023-02-24") },
  { key: "5", sku: "PT005", product: "Lobar Handy", mfg: new Date("2023-01-08"), exp: new Date("2023-03-16") },
  { key: "6", sku: "PT006", product: "Red Premium Handy", mfg: new Date("2023-01-17"), exp: new Date("2023-03-29") },
  { key: "7", sku: "PT007", product: "Red Premium Handy", mfg: new Date("2023-02-22"), exp: new Date("2023-04-04") },
  { key: "8", sku: "PT008", product: "Black Slim 200", mfg: new Date("2023-03-18"), exp: new Date("2023-05-13") },
  { key: "9", sku: "PT009", product: "Woodcraft Sandal", mfg: new Date("2023-03-29"), exp: new Date("2023-05-27") },
  { key: "10", sku: "PT010", product: "Bold V3.2", mfg: new Date("2022-12-02"), exp: new Date("2023-01-10") },

  { key: "11", sku: "PT011", product: "HP EliteBook X360", mfg: new Date("2022-10-30"), exp: new Date("2022-12-15") },
  { key: "12", sku: "PT012", product: "Sony WH-1000XM5", mfg: new Date("2022-11-05"), exp: new Date("2023-01-08") },
  { key: "13", sku: "PT013", product: "Samsung Galaxy S23", mfg: new Date("2022-12-20"), exp: new Date("2023-02-28") },
  { key: "14", sku: "PT014", product: "Dell Inspiron 15", mfg: new Date("2022-09-12"), exp: new Date("2022-11-30") },
  { key: "15", sku: "PT015", product: "Beats Studio 3", mfg: new Date("2022-10-18"), exp: new Date("2022-12-25") },
  { key: "16", sku: "PT016", product: "Adidas Ultraboost", mfg: new Date("2022-11-01"), exp: new Date("2023-01-12") },
  { key: "17", sku: "PT017", product: "Oppo Reno 10", mfg: new Date("2022-12-05"), exp: new Date("2023-02-10") },
  { key: "18", sku: "PT018", product: "Gucci Handbag", mfg: new Date("2022-10-07"), exp: new Date("2022-12-20") },
  { key: "19", sku: "PT019", product: "Logitech MX Master 3S", mfg: new Date("2022-11-14"), exp: new Date("2023-01-22") },
  { key: "20", sku: "PT020", product: "Canon EOS R10", mfg: new Date("2022-12-18"), exp: new Date("2023-03-01") },
];

export default function ExpiredProductsTable({ companyId, canCreate, canUpdate, canDelete }: Props) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // dropdown Product (tipe)
  const [fProductType, setFProductType] = useState<string | undefined>();
  const [sortBy, setSortBy] = useState<string>("last7");

  // search & paging
  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    let list = DUMMY.filter((r) => !term || r.product.toLowerCase().includes(term) || r.sku.toLowerCase().includes(term));
    // sort (dummy logic)
    if (sortBy === "mfgAsc") list = list.slice().sort((a, b) => +a.mfg - +b.mfg);
    if (sortBy === "mfgDesc") list = list.slice().sort((a, b) => +b.mfg - +a.mfg);
    if (sortBy === "expAsc") list = list.slice().sort((a, b) => +a.exp - +b.exp);
    if (sortBy === "expDesc") list = list.slice().sort((a, b) => +b.exp - +a.exp);
    return list;
  }, [q, sortBy]);

  useEffect(() => setPage(1), [q, pageSize, fProductType, sortBy]);

  const paged = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize]);

  // table columns
  const columns: TableColumnsType<Row> = [
    {
      title: "SKU",
      dataIndex: "sku",
      sorter: (a, b) => a.sku.localeCompare(b.sku),
      onCell: () => ({ style: { padding: "10px 20px" } }),
      onHeaderCell: () => ({ style: { padding: "10px 20px" } }),
    },
    {
      title: "Product",
      dataIndex: "product",
      sorter: (a, b) => a.product.localeCompare(b.product),
      onCell: () => ({ style: { padding: "10px 20px" } }),
      onHeaderCell: () => ({ style: { padding: "10px 20px" } }),
      render: (t: string) => (
        <div className="flex items-center gap-2">
          <span className="inline-block w-[22px] h-[22px] rounded bg-[#eef3fb]" />
          <Typography.Text style={{ fontSize: 14, color: "#212b36" }}>{t}</Typography.Text>
        </div>
      ),
    },
    {
      title: "Manufactured Date",
      dataIndex: "mfg",
      sorter: (a, b) => +a.mfg - +b.mfg,
      onCell: () => ({ style: { padding: "10px 20px" } }),
      onHeaderCell: () => ({ style: { padding: "10px 20px" } }),
      render: (d: Date) => (
        <Typography.Text suppressHydrationWarning style={{ fontSize: 14, color: "#646b72" }}>
          {fmtDate(d)}
        </Typography.Text>
      ),
    },
    {
      title: "Expired Date",
      dataIndex: "exp",
      sorter: (a, b) => +a.exp - +b.exp,
      onCell: () => ({ style: { padding: "10px 20px" } }),
      onHeaderCell: () => ({ style: { padding: "10px 20px" } }),
      render: (d: Date) => (
        <Typography.Text suppressHydrationWarning style={{ fontSize: 14, color: "#646b72" }}>
          {fmtDate(d)}
        </Typography.Text>
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
                href={`/dashboard/products/${encodeURIComponent(r.sku)}/edit?company=${encodeURIComponent(companyId)}`}
                className="border border-[#e6eaed] bg-white rounded-[5px] inline-flex items-center justify-center p-[.5rem] !text-[#212b36]"
              >
                <FiEdit3 size={16} />
              </Link>
            </Tooltip>
          )}
          {canDelete && (
            <Tooltip title="Delete">
              <form
                action={`/dashboard/products/${encodeURIComponent(r.sku)}/delete?company=${encodeURIComponent(companyId)}`}
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

  // theme sama seperti sebelumnya
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
    },
  } as const;

  // controls
  const CONTROL_HEIGHT = 38;
  const CONTROL_WIDTH = 160;
  const controlStyle: React.CSSProperties = { height: CONTROL_HEIGHT, width: CONTROL_WIDTH };

  const productMenu: MenuProps["items"] = [
    { key: "all", label: "All" },
    { key: "physical", label: "Physical" },
    { key: "digital", label: "Digital" },
  ];
  const sortMenu: MenuProps["items"] = [
    { key: "last7", label: "Last 7 Days" },
    { key: "mfgAsc", label: "Mfg: Old → New" },
    { key: "mfgDesc", label: "Mfg: New → Old" },
    { key: "expAsc", label: "Exp: Old → New" },
    { key: "expDesc", label: "Exp: New → Old" },
  ];

  return (
    <ConfigProvider theme={theme}>
      {/* Header halaman */}
      <div className="flex items-center justify-between mb-[30px]">
        <div className="mr-auto">
          <h4 className="font-bold mb-[5px] text-[1.125rem] text-[#212b36] leading-[1.2]">Expired Products</h4>
          <h6 className="text-sm text-[#646b72] leading-[1.2]">Manage your expired products</h6>
        </div>

        {/* kanan: chip kecil + 3 tombol icon sesuai gambar */}
        <div className="flex items-center gap-2">
          <button className="border border-[#e6eaed] rounded-[8px] p-2 text-[#212b36] bg-white">
            <FiRefreshCw size={16} />
          </button>
          <button className="border border-[#e6eaed] rounded-[8px] p-2 text-[#212b36] bg-white">
            <FiGrid size={16} />
          </button>
          <button className="border border-[#e6eaed] rounded-[8px] p-2 text-[#212b36] bg-white">
            <FiSettings size={16} />
          </button>
        </div>
      </div>

      {/* Card + tools */}
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

            {/* Filter kanan: Product + Sort By */}
            <div className="flex items-center gap-2">
              <Dropdown
                menu={{
                  items: productMenu,
                  selectable: true,
                  onClick: (e) => setFProductType(e.key),
                  selectedKeys: [fProductType ?? "all"],
                }}
              >
                <Button className="!flex !items-center !justify-between" style={controlStyle}>
                  <span className="truncate">Product</span>
                  <FiChevronDown />
                </Button>
              </Dropdown>

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
