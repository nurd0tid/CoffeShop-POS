"use client";

import * as React from "react";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Card, ConfigProvider, Input, Pagination, Select, Space, Table, Tooltip, Typography, Button, Dropdown, Switch } from "antd";
import type { TableColumnsType, MenuProps } from "antd";
import { FiSearch, FiChevronDown, FiEdit3, FiTrash2, FiMail } from "react-icons/fi";

type Props = {
  companyId: string;
  canCreate: boolean;
  canUpdate: boolean;
  canDelete: boolean;
};

type Row = {
  key: string;
  warehouse: string;
  store: string;
  product: string;
  category: string;
  sku: string;
  qty: number;
  qtyAlert: number;
};

// ===== dummy 20 rows =====
const DUMMY: Row[] = [
  { key: "1", warehouse: "Lavish Warehouse", store: "Crinol", product: "Lenovo 3rd Generation", category: "Laptop", sku: "PT001", qty: 15, qtyAlert: 10 },
  { key: "2", warehouse: "Lobar Handy", store: "Selosy", product: "Nike Jordan", category: "Shoe", sku: "PT002", qty: 17, qtyAlert: 8 },
  { key: "3", warehouse: "Quaint Warehouse", store: "Loggero", product: "Apple Series 5 Watch", category: "Electronics", sku: "PT003", qty: 14, qtyAlert: 12 },
  { key: "4", warehouse: "Traditional Warehouse", store: "Vesloo", product: "Amazon Echo Dot", category: "Speaker", sku: "PT004", qty: 20, qtyAlert: 15 },
  { key: "5", warehouse: "Cool Warehouse", store: "Crompy", product: "Lobar Handy", category: "Furnitures", sku: "PT005", qty: 18, qtyAlert: 13 },
  { key: "6", warehouse: "East Depot", store: "Vimart", product: "Bold V3.2", category: "Electronics", sku: "PT006", qty: 9, qtyAlert: 10 },
  { key: "7", warehouse: "North Hub", store: "Orvila", product: "Red Premium Handy", category: "Bags", sku: "PT007", qty: 7, qtyAlert: 9 },
  { key: "8", warehouse: "Metro Storage", store: "Zeena", product: "Iphone 14 Pro", category: "Phone", sku: "PT008", qty: 22, qtyAlert: 16 },
  { key: "9", warehouse: "River Warehouse", store: "Dekra", product: "Black Slim 200", category: "Chairs", sku: "PT009", qty: 12, qtyAlert: 11 },
  { key: "10", warehouse: "Harbor Storage", store: "Mobora", product: "Woodcraft Sandal", category: "Bags", sku: "PT010", qty: 11, qtyAlert: 10 },
  { key: "11", warehouse: "Lavish Warehouse", store: "Crinol", product: "HP EliteBook X360", category: "Laptop", sku: "PT011", qty: 8, qtyAlert: 10 },
  { key: "12", warehouse: "Lobar Handy", store: "Selosy", product: "Sony WH-1000XM5", category: "Speaker", sku: "PT012", qty: 19, qtyAlert: 15 },
  { key: "13", warehouse: "Quaint Warehouse", store: "Loggero", product: "Samsung Galaxy S23", category: "Phone", sku: "PT013", qty: 16, qtyAlert: 14 },
  { key: "14", warehouse: "Traditional Warehouse", store: "Vesloo", product: "Dell Inspiron 15", category: "Laptop", sku: "PT014", qty: 6, qtyAlert: 9 },
  { key: "15", warehouse: "Cool Warehouse", store: "Crompy", product: "Beats Studio 3", category: "Speaker", sku: "PT015", qty: 21, qtyAlert: 17 },
  { key: "16", warehouse: "East Depot", store: "Vimart", product: "Adidas Ultraboost", category: "Shoe", sku: "PT016", qty: 13, qtyAlert: 12 },
  { key: "17", warehouse: "North Hub", store: "Orvila", product: "Oppo Reno 10", category: "Phone", sku: "PT017", qty: 5, qtyAlert: 9 },
  { key: "18", warehouse: "Metro Storage", store: "Zeena", product: "Gucci Handbag", category: "Bags", sku: "PT018", qty: 10, qtyAlert: 12 },
  { key: "19", warehouse: "River Warehouse", store: "Dekra", product: "Logitech MX Master 3S", category: "Electronics", sku: "PT019", qty: 9, qtyAlert: 11 },
  { key: "20", warehouse: "Harbor Storage", store: "Mobora", product: "Canon EOS R10", category: "Electronics", sku: "PT020", qty: 18, qtyAlert: 14 },
];

export default function LowStocksTable({ companyId, canCreate, canUpdate, canDelete }: Props) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // state
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [notify, setNotify] = useState(true);

  // filters
  const [fWarehouse, setFWarehouse] = useState<string | undefined>();
  const [fStore, setFStore] = useState<string | undefined>();
  const [fCategory, setFCategory] = useState<string | undefined>();
  const [fProductType, setFProductType] = useState<string | undefined>();

  const warehouses = useMemo(() => Array.from(new Set(DUMMY.map((d) => d.warehouse))), []);
  const stores = useMemo(() => Array.from(new Set(DUMMY.map((d) => d.store))), []);
  const categories = useMemo(() => Array.from(new Set(DUMMY.map((d) => d.category))), []);
  const productMenu: MenuProps["items"] = [
    { key: "all", label: "All" },
    { key: "physical", label: "Physical" },
    { key: "digital", label: "Digital" },
  ];

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return DUMMY.filter((r) => {
      if (term && ![r.warehouse, r.store, r.product, r.category, r.sku].some((x) => x.toLowerCase().includes(term))) return false;
      if (fWarehouse && r.warehouse !== fWarehouse) return false;
      if (fStore && r.store !== fStore) return false;
      if (fCategory && r.category !== fCategory) return false;
      if (fProductType) {
        // placeholder: tidak memfilter data; hanya untuk UI kesesuaian screenshot
      }
      return true;
    });
  }, [q, fWarehouse, fStore, fCategory, fProductType]);

  useEffect(() => setPage(1), [q, pageSize, fWarehouse, fStore, fCategory, fProductType]);

  const paged = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize]);

  const columns: TableColumnsType<Row> = [
    {
      title: "Warehouse",
      dataIndex: "warehouse",
      sorter: (a, b) => a.warehouse.localeCompare(b.warehouse),
      onCell: () => ({ style: { padding: "10px 20px" } }),
      onHeaderCell: () => ({ style: { padding: "10px 20px" } }),
    },
    {
      title: "Store",
      dataIndex: "store",
      sorter: (a, b) => a.store.localeCompare(b.store),
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
      title: "Category",
      dataIndex: "category",
      sorter: (a, b) => a.category.localeCompare(b.category),
      onCell: () => ({ style: { padding: "10px 20px" } }),
      onHeaderCell: () => ({ style: { padding: "10px 20px" } }),
    },
    {
      title: "SkU",
      dataIndex: "sku",
      sorter: (a, b) => a.sku.localeCompare(b.sku),
      onCell: () => ({ style: { padding: "10px 20px" } }),
      onHeaderCell: () => ({ style: { padding: "10px 20px" } }),
    },
    {
      title: "Qty",
      dataIndex: "qty",
      sorter: (a, b) => a.qty - b.qty,
      onCell: () => ({ style: { padding: "10px 20px" } }),
      onHeaderCell: () => ({ style: { padding: "10px 20px" } }),
    },
    {
      title: "Qty Alert",
      dataIndex: "qtyAlert",
      sorter: (a, b) => a.qtyAlert - b.qtyAlert,
      onCell: () => ({ style: { padding: "10px 20px" } }),
      onHeaderCell: () => ({ style: { padding: "10px 20px" } }),
      render: (v: number) => <span style={{ letterSpacing: 1 }}>{String(v).padStart(2, "0")}</span>,
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

  // theme (konsisten)
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
      Switch: {},
    },
  } as const;

  const CONTROL_HEIGHT = 38;
  const CONTROL_WIDTH = 150;
  const controlStyle: React.CSSProperties = { height: CONTROL_HEIGHT, width: CONTROL_WIDTH };

  return (
    <ConfigProvider theme={theme}>
      {/* Header bar: title + tabs + right controls */}
      <div className="flex items-center justify-between mb-[16px]">
        <div className="flex items-center gap-3">
          <div>
            <h4 className="font-bold mb-[5px] text-[1.125rem] text-[#212b36] leading-[1.2]">Low Stocks</h4>
            <h6 className="text-sm text-[#646b72] leading-[1.2]">Manage your low stocks</h6>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button type="primary" className="!bg-[#ff9f43] !border-[#ff9f43]">
            Low Stocks
          </Button>
          <Button>Out of Stocks</Button>
        </div>
      </div>

      {/* Tools row (right: filters & buttons) */}
      <div className="flex items-center justify-between mb-3">
        <div />
        {/* spacer supaya filter benar2 di kanan, search ada di card title */}
        <div className="flex items-center gap-2">
          <Button
            icon={<FiMail />}
            className="!h-[34px]"
            onClick={() => {
              /* send email handler */
            }}
          >
            Send Email
          </Button>
          <div className="flex items-center gap-2 px-2">
            <Switch checked={notify} onChange={setNotify} />
            <span className="text-[#212b36]">Notify</span>
          </div>
        </div>
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
              style={{ width: 260, height: CONTROL_HEIGHT, color: "#212b36", lineHeight: "1.6", fontSize: 14 }}
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />

            {/* Filters kanan */}
            <div className="flex items-center gap-2">
              <Select
                allowClear
                placeholder="Warehouse"
                value={fWarehouse}
                onChange={setFWarehouse}
                options={warehouses.map((w) => ({ label: w, value: w }))}
                style={controlStyle}
              />
              <Select
                allowClear
                placeholder="Store"
                value={fStore}
                onChange={setFStore}
                options={stores.map((s) => ({ label: s, value: s }))}
                style={controlStyle}
              />
              <Select
                allowClear
                placeholder="Category"
                value={fCategory}
                onChange={setFCategory}
                options={categories.map((c) => ({ label: c, value: c }))}
                style={controlStyle}
              />
              <Dropdown
                menu={{
                  items: productMenu,
                  selectable: true,
                  selectedKeys: [fProductType ?? "all"],
                  onClick: (e) => setFProductType(e.key),
                }}
              >
                <Button className="!flex !items-center !justify-between" style={{ ...controlStyle, width: 160 }}>
                  <span className="truncate">Product</span>
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
