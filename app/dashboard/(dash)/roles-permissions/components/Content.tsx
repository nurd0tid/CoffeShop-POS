"use client";

import * as React from "react";
import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Card, ConfigProvider, Input, Pagination, Select, Space, Table, Tooltip, Typography } from "antd";
import type { TableColumnsType } from "antd";
import { BiPlusCircle } from "react-icons/bi";
import { GoShieldLock } from "react-icons/go";
import { FiEdit3, FiTrash2, FiSearch } from "react-icons/fi";

export type RoleRow = {
  code: string;
  permissions: string[];
  memberCount: number;
  created_at?: string | Date; // opsional: kalau ada, akan ditampilkan
};

type Props = {
  companyId: string;
  rows: RoleRow[];
  canCreate: boolean;
  canUpdate: boolean;
  canDelete: boolean;
};

type TRow = {
  key: string;
  roleName: string;
  createdOn?: Date;
  raw: RoleRow;
};

const formatDate = (d?: Date) => (d ? d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "-");

// ubah "shop_owner" -> "Shop Owner"
const toStartCase = (s: string) => s.replace(/[_-]+/g, " ").replace(/\w\S*/g, (w) => w[0].toUpperCase() + w.slice(1).toLowerCase());

export default function RolesTable({ companyId, rows, canCreate, canUpdate, canDelete }: Props) {
  const router = useRouter();

  // map data -> table rows
  const data: TRow[] = useMemo(
    () =>
      rows.map((r) => ({
        key: r.code,
        roleName: toStartCase(r.code),
        createdOn: r.created_at ? new Date(r.created_at) : undefined,
        raw: r,
      })),
    [rows]
  );

  // loading spinner (tanpa skeleton)
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // search + pagination
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return data.filter((r) => !term || r.roleName.toLowerCase().includes(term) || r.raw.permissions.join(",").toLowerCase().includes(term));
  }, [data, q]);

  useEffect(() => setPage(1), [q, pageSize]);

  const paged = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize]);

  // kolom table
  const columns: TableColumnsType<TRow> = [
    {
      title: "Role Name",
      dataIndex: "roleName",
      onCell: () => ({ style: { padding: "10px 20px" } }),
      onHeaderCell: () => ({ style: { padding: "10px 20px" } }),
      sorter: (a, b) => a.roleName.localeCompare(b.roleName),
      render: (t) => <Typography.Text style={{ fontSize: 14, color: "#646b72" }}>{t}</Typography.Text>,
    },
    {
      title: "Created On",
      dataIndex: "createdOn",
      onCell: () => ({ style: { padding: "10px 20px" } }),
      onHeaderCell: () => ({ style: { padding: "10px 20px" } }),
      sorter: (a, b) => (a.createdOn?.getTime() ?? 0) - (b.createdOn?.getTime() ?? 0),
      responsive: ["sm"],
      render: (d?: Date) => <Typography.Text style={{ fontSize: 14, color: "#646b72" }}>{formatDate(d)}</Typography.Text>,
    },
    {
      title: "Actions",
      key: "actions",
      width: 160,
      onCell: () => ({ style: { padding: "10px 20px" } }),
      onHeaderCell: () => ({ style: { padding: "10px 20px" } }),
      render: (_, r) => (
        <Space>
          <Tooltip title="Permissions">
            <Link
              href={`/dashboard/role-permissions/${encodeURIComponent(r.raw.code)}?company=${encodeURIComponent(companyId)}`}
              className="border border-[#e6eaed] bg-white rounded-[5px] inline-flex items-center justify-center p-[.5rem] !text-[#212b36]"
            >
              <GoShieldLock size={16} />
            </Link>
          </Tooltip>

          {canUpdate && (
            <Tooltip title="Edit">
              <Link
                href={`/dashboard/role-permissions/${encodeURIComponent(r.raw.code)}/edit?company=${encodeURIComponent(companyId)}`}
                className="border border-[#e6eaed] bg-white rounded-[5px] inline-flex items-center justify-center p-[.5rem] !text-[#212b36]"
              >
                <FiEdit3 size={16} />
              </Link>
            </Tooltip>
          )}

          {canDelete && r.raw.code !== "owner" && (
            <Tooltip title="Delete">
              <form
                action={`/dashboard/role-permissions/${encodeURIComponent(r.raw.code)}/delete?company=${encodeURIComponent(companyId)}`}
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

  // theme (sama seperti table sebelumnya)
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
    },
  } as const;

  return (
    <ConfigProvider theme={theme}>
      {/* header halaman */}
      <div className="flex items-center justify-between mb-[30px]">
        <div className="mr-auto">
          <h4 className="font-bold mb-[5px] text-[1.125rem] text-[#212b36] leading-[1.2]">Roles & Permission</h4>
          <h6 className="text-sm text-[#646b72] leading-[1.2]">Manage your roles</h6>
        </div>

        {canCreate && (
          <button
            className="bg-[#0076f9] border border-[#0076f9] flex items-center justify-center p-[5px_8px] text-white font-medium text-[13px] rounded-[8px] gap-2"
            onClick={() => router.push(`/dashboard/role-permissions/create?company=${encodeURIComponent(companyId)}`)}
          >
            <BiPlusCircle />
            Add Role
          </button>
        )}
      </div>

      {/* card + tools */}
      <Card
        style={{ borderRadius: 8, overflow: "hidden", marginBottom: 16 }}
        styles={{
          header: { padding: "1rem 1.25rem", borderColor: "#e6eaed" },
          body: { paddingInline: 0, paddingTop: 0, paddingBottom: 16 },
        }}
        title={
          <Input
            allowClear
            prefix={<FiSearch size={14} className="text-[#a6aaaf]" />}
            placeholder="Search"
            style={{ width: 208, height: 38, color: "#212b36", lineHeight: "1.6", fontSize: 14 }}
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        }
        // tidak ada select status di kanan
      >
        <Table<TRow>
          size="middle"
          rowKey="key"
          columns={columns}
          dataSource={paged}
          pagination={false}
          bordered={false}
          loading={{ spinning: !mounted }}
          style={{ minHeight: 240 }}
          rowSelection={{ columnWidth: 43, selectedRowKeys: [], onChange: () => {} }} // tampilkan kolom checkbox (kalau tak perlu: hapus saja)
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

        {/* footer: row per page + pagination */}
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
