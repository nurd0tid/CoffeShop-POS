"use client";

import * as React from "react";
import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Card, ConfigProvider, Input, Pagination, Select, Space, Table, Tooltip, Typography, Button, Tag, Dropdown } from "antd";
import type { TableColumnsType, MenuProps } from "antd";
import { BiPlusCircle } from "react-icons/bi";
import { FiEdit3, FiTrash2, FiSearch, FiEye, FiChevronDown } from "react-icons/fi";
import { UserOutlined } from "@ant-design/icons";
import { AiOutlineUpload } from "react-icons/ai";

type Props = {
  companyId: string;
  canCreate: boolean;
  canUpdate: boolean;
  canDelete: boolean;
};

type ProductRow = {
  key: string;
  sku: string;
  product: string;
  category: string;
  brand: string;
  price: number;
  unit: "Pc" | "Kg";
  qty: number;
  createdBy: string;
};

// ==== FIX hydration: deterministic formatter ====
const USD = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
const fmtMoney = (v: number) => USD.format(v);

const DUMMY: ProductRow[] = [
  { key: "1", sku: "PT001", product: "Lenovo 3rd Generation", category: "Laptop", brand: "Lenovo", price: 12500, unit: "Pc", qty: 100, createdBy: "Arroon" },
  { key: "2", sku: "PT002", product: "Bold V3.2", category: "Electronics", brand: "Bolt", price: 1600, unit: "Pc", qty: 140, createdBy: "Kenneth" },
  { key: "3", sku: "PT003", product: "Nike Jordan", category: "Shoe", brand: "Nike", price: 6000, unit: "Pc", qty: 780, createdBy: "Gooch" },
  { key: "4", sku: "PT004", product: "Apple Series 5 Watch", category: "Electronics", brand: "Apple", price: 25000, unit: "Pc", qty: 450, createdBy: "Nathan" },
  { key: "5", sku: "PT005", product: "Amazon Echo Dot", category: "Speaker", brand: "Amazon", price: 1600, unit: "Pc", qty: 477, createdBy: "Alice" },
  { key: "6", sku: "PT006", product: "Lobar Handy", category: "Furnitures", brand: "Woodmart", price: 4521, unit: "Kg", qty: 145, createdBy: "Robb" },
  { key: "7", sku: "PT007", product: "Red Premium Handy", category: "Bags", brand: "Versace", price: 2024, unit: "Kg", qty: 747, createdBy: "Steven" },
  { key: "8", sku: "PT008", product: "Iphone 14 Pro", category: "Phone", brand: "Iphone", price: 1698, unit: "Pc", qty: 897, createdBy: "Gravely" },
  { key: "9", sku: "PT009", product: "Black Slim 200", category: "Chairs", brand: "Bently", price: 6794, unit: "Pc", qty: 741, createdBy: "Kevin" },
  { key: "10", sku: "PT010", product: "Woodcraft Sandal", category: "Bags", brand: "Woodcraft", price: 4547, unit: "Kg", qty: 148, createdBy: "Grillo" },

  { key: "11", sku: "PT011", product: "HP EliteBook X360", category: "Laptop", brand: "HP", price: 9800, unit: "Pc", qty: 320, createdBy: "Martha" },
  { key: "12", sku: "PT012", product: "Sony WH-1000XM5", category: "Speaker", brand: "Sony", price: 890, unit: "Pc", qty: 215, createdBy: "Leo" },
  { key: "13", sku: "PT013", product: "Samsung Galaxy S23", category: "Phone", brand: "Samsung", price: 1200, unit: "Pc", qty: 670, createdBy: "Maria" },
  { key: "14", sku: "PT014", product: "Dell Inspiron 15", category: "Laptop", brand: "Dell", price: 7500, unit: "Pc", qty: 280, createdBy: "John" },
  { key: "15", sku: "PT015", product: "Beats Studio 3", category: "Speaker", brand: "Beats", price: 400, unit: "Pc", qty: 560, createdBy: "Daisy" },
  { key: "16", sku: "PT016", product: "Adidas Ultraboost", category: "Shoe", brand: "Adidas", price: 300, unit: "Pc", qty: 1200, createdBy: "Mark" },
  { key: "17", sku: "PT017", product: "Oppo Reno 10", category: "Phone", brand: "Oppo", price: 890, unit: "Pc", qty: 320, createdBy: "Daniel" },
  { key: "18", sku: "PT018", product: "Gucci Handbag", category: "Bags", brand: "Gucci", price: 5400, unit: "Pc", qty: 80, createdBy: "Sophia" },
  {
    key: "19",
    sku: "PT019",
    product: "Logitech MX Master 3S",
    category: "Electronics",
    brand: "Logitech",
    price: 120,
    unit: "Pc",
    qty: 600,
    createdBy: "Brian",
  },
  { key: "20", sku: "PT020", product: "Canon EOS R10", category: "Electronics", brand: "Canon", price: 1500, unit: "Pc", qty: 75, createdBy: "Hannah" },
];

export default function ProductListTable({ companyId, canCreate, canUpdate, canDelete }: Props) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const categories = useMemo(() => Array.from(new Set(DUMMY.map((d) => d.category))), []);
  const brands = useMemo(() => Array.from(new Set(DUMMY.map((d) => d.brand))), []);
  const creators = useMemo(() => Array.from(new Set(DUMMY.map((d) => d.createdBy))), []);

  const [fCategory, setFCategory] = useState<string | undefined>();
  const [fBrand, setFBrand] = useState<string | undefined>();
  const [fCreator, setFCreator] = useState<string | undefined>();
  const [fProductType, setFProductType] = useState<string | undefined>();
  const [sortBy, setSortBy] = useState<string>("last7");

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    let list = DUMMY.filter((p) => {
      const hit =
        !term ||
        p.product.toLowerCase().includes(term) ||
        p.sku.toLowerCase().includes(term) ||
        p.category.toLowerCase().includes(term) ||
        p.brand.toLowerCase().includes(term) ||
        p.createdBy.toLowerCase().includes(term);
      if (!hit) return false;
      if (fCategory && p.category !== fCategory) return false;
      if (fBrand && p.brand !== fBrand) return false;
      if (fCreator && p.createdBy !== fCreator) return false;
      if (fProductType) {
        // placeholder filter product type (kosmetik)
      }
      return true;
    });

    if (sortBy === "qtyAsc") list = list.slice().sort((a, b) => a.qty - b.qty);
    if (sortBy === "qtyDesc") list = list.slice().sort((a, b) => b.qty - a.qty);
    if (sortBy === "priceAsc") list = list.slice().sort((a, b) => a.price - b.price);
    if (sortBy === "priceDesc") list = list.slice().sort((a, b) => b.price - a.price);

    return list;
  }, [q, fCategory, fBrand, fCreator, fProductType, sortBy]);

  useEffect(() => setPage(1), [q, pageSize, fCategory, fBrand, fCreator, fProductType, sortBy]);

  const paged = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize]);

  const columns: TableColumnsType<ProductRow> = [
    {
      title: "SKU",
      dataIndex: "sku",
      onCell: () => ({ style: { padding: "10px 20px" } }),
      onHeaderCell: () => ({ style: { padding: "10px 20px" } }),
      sorter: (a, b) => a.sku.localeCompare(b.sku),
    },
    {
      title: "Product",
      dataIndex: "product",
      onCell: () => ({ style: { padding: "10px 20px" } }),
      onHeaderCell: () => ({ style: { padding: "10px 20px" } }),
      sorter: (a, b) => a.product.localeCompare(b.product),
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
      onCell: () => ({ style: { padding: "10px 20px" } }),
      onHeaderCell: () => ({ style: { padding: "10px 20px" } }),
      sorter: (a, b) => a.category.localeCompare(b.category),
      render: (t) => <Typography.Text style={{ fontSize: 14, color: "#646b72" }}>{t}</Typography.Text>,
    },
    {
      title: "Brand",
      dataIndex: "brand",
      onCell: () => ({ style: { padding: "10px 20px" } }),
      onHeaderCell: () => ({ style: { padding: "10px 20px" } }),
      sorter: (a, b) => a.brand.localeCompare(b.brand),
      render: (t) => <Typography.Text style={{ fontSize: 14, color: "#646b72" }}>{t}</Typography.Text>,
    },
    {
      title: "Price",
      dataIndex: "price",
      onCell: () => ({ style: { padding: "10px 20px" } }),
      onHeaderCell: () => ({ style: { padding: "10px 20px" } }),
      sorter: (a, b) => a.price - b.price,
      render: (v) => (
        <Typography.Text suppressHydrationWarning style={{ fontSize: 14, color: "#646b72" }}>
          {fmtMoney(v)}
        </Typography.Text>
      ),
    },
    {
      title: "Unit",
      dataIndex: "unit",
      onCell: () => ({ style: { padding: "10px 20px" } }),
      onHeaderCell: () => ({ style: { padding: "10px 20px" } }),
      sorter: (a, b) => a.unit.localeCompare(b.unit),
    },
    {
      title: "Qty",
      dataIndex: "qty",
      onCell: () => ({ style: { padding: "10px 20px" } }),
      onHeaderCell: () => ({ style: { padding: "10px 20px" } }),
      sorter: (a, b) => a.qty - b.qty,
    },
    {
      title: "Created By",
      dataIndex: "createdBy",
      onCell: () => ({ style: { padding: "10px 20px" } }),
      onHeaderCell: () => ({ style: { padding: "10px 20px" } }),
      sorter: (a, b) => a.createdBy.localeCompare(b.createdBy),
      render: (t) => (
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#eef3fb]">
            <UserOutlined style={{ fontSize: 12 }} />
          </span>
          <span>{t}</span>
        </div>
      ),
    },
    {
      title: "Action",
      key: "action",
      width: 180,
      onCell: () => ({ style: { padding: "10px 20px" } }),
      onHeaderCell: () => ({ style: { padding: "10px 20px" } }),
      render: (_, r) => (
        <Space>
          <Tooltip title="View">
            <Link
              href={`/dashboard/products/${encodeURIComponent(r.sku)}?company=${encodeURIComponent(companyId)}`}
              className="border border-[#e6eaed] bg-white rounded-[5px] inline-flex items-center justify-center p-[.5rem] !text-[#212b36]"
            >
              <FiEye size={16} />
            </Link>
          </Tooltip>

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
    { key: "priceAsc", label: "Price: Low → High" },
    { key: "priceDesc", label: "Price: High → Low" },
    { key: "qtyAsc", label: "Qty: Low → High" },
    { key: "qtyDesc", label: "Qty: High → Low" },
  ];

  return (
    <ConfigProvider theme={theme}>
      {/* Header */}
      <div className="flex items-center justify-between mb-[30px]">
        <div className="mr-auto">
          <h4 className="font-bold mb-[5px] text-[1.125rem] text-[#212b36] leading-[1.2]">Product List</h4>
          <h6 className="text-sm text-[#646b72] leading-[1.2]">Manage your products</h6>
        </div>

        <div className="flex items-center gap-2">
          {canCreate && (
            <button
              className="bg-[#0076f9] border border-[#0076f9] shadow-[0_2px_10px_rgba(0,118,255,.2)] hover:bg-[#0056b3] hover:shadow-[0_4px_20px_rgba(0,118,255,.2)] cursor-pointer flex items-center justify-center p-[.4rem_.85rem] text-white font-medium text-[13px] rounded-[8px] gap-2"
              onClick={() => router.push(`/dashboard/products/create?company=${encodeURIComponent(companyId)}`)}
            >
              <BiPlusCircle />
              Add New Product
            </button>
          )}

          <button
            className="bg-[#092C4C] border border-[#092C4C] text-white shadow-[0_2px_10px_rgba(9,44,76,.2)] hover:bg-[#0a192f] hover:shadow-[0_4px_20px_rgba(9,44,76,.2)] cursor-pointer flex items-center justify-center  font-medium text-[13px] rounded-[8px] gap-2 p-[.4rem_.85rem]"
            onClick={() => router.push(`/dashboard/products/import?company=${encodeURIComponent(companyId)}`)}
          >
            <AiOutlineUpload />
            Import Product
          </button>
        </div>
      </div>

      {/* Card + Tools */}
      <Card
        style={{ borderRadius: 8, overflow: "hidden", marginBottom: 16 }}
        styles={{
          header: { padding: "1rem 1.25rem", borderColor: "#e6eaed" },
          body: { paddingInline: 0, paddingTop: 0, paddingBottom: 16 },
        }}
        title={
          <div className="flex items-center justify-between gap-3">
            {/* Left: Search */}
            <Input
              allowClear
              prefix={<FiSearch size={14} className="text-[#a6aaaf]" />}
              placeholder="Search"
              style={{ width: 240, height: CONTROL_HEIGHT, color: "#212b36", lineHeight: "1.6", fontSize: 14 }}
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />

            {/* Right: Filters */}
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

              <Select
                allowClear
                placeholder="Created By"
                value={fCreator}
                onChange={setFCreator}
                options={creators.map((c) => ({ label: c, value: c }))}
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
              <Select
                allowClear
                placeholder="Brand"
                value={fBrand}
                onChange={setFBrand}
                options={brands.map((b) => ({ label: b, value: b }))}
                style={controlStyle}
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
        <Table<ProductRow>
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
