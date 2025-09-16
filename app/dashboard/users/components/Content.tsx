"use client";

import * as React from "react";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useCaps } from "@/lib/perm/client";

import { Avatar, Button, Card, ConfigProvider, Input, Pagination, Select, Space, Table, Tooltip, Typography, Tag } from "antd";
import type { TableColumnsType } from "antd";
import { BiPlusCircle } from "react-icons/bi";
import { FiEye, FiEdit3, FiTrash2, FiSearch } from "react-icons/fi";
import { GoDotFill } from "react-icons/go";

type Row = {
  id: string;
  name: string;
  email: string;
  is_owner: boolean;
  is_active: boolean;
  roles: string[];
  phone?: string;
  avatar_url?: string;
  created_at?: string | Date;
};

type Status = "active" | "inactive";
type UserRow = {
  key: string;
  avatar?: string;
  name: string;
  phone: string;
  email: string;
  role: string;
  createdOn?: Date;
  status: Status;
};

function StatusBadge({ value }: { value: Status }) {
  const ok = value === "active";
  return (
    <Tag
      color={ok ? "#3EB780" : "#FF0000 "}
      style={{
        borderRadius: ".25rem",
        padding: ".25rem",
        lineHeight: 1,
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
      }}
    >
      <GoDotFill size={8} className="text-white" />
      <span className="text-white text-[.625rem]">{ok ? "Active" : "Inactive"}</span>
    </Tag>
  );
}

export default function UsersTableCard(props: { companyId: string; rows?: Row[] }) {
  const { companyId, rows = [] } = props;
  const router = useRouter();

  const { caps } = useCaps({
    module: "employees",
    actions: ["create", "update", "delete"],
    companyId,
  });
  const canCreate = caps["employees:create"] === true;
  const canUpdate = caps["employees:update"] === true;
  const canDelete = caps["employees:delete"] === true;

  const mapped: UserRow[] = useMemo(
    () =>
      rows.map((r) => ({
        key: r.id,
        avatar: r.avatar_url,
        name: r.name,
        phone: r.phone ?? "-",
        email: r.email,
        role: r.roles?.[0] ?? "-",
        createdOn: r.created_at ? new Date(r.created_at) : undefined,
        status: r.is_active ? "active" : "inactive",
      })),
    [rows]
  );

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"all" | Status>("all");
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return mapped.filter((r) => {
      const matchQ =
        !q || r.name.toLowerCase().includes(q) || r.email.toLowerCase().includes(q) || r.phone.toLowerCase().includes(q) || r.role.toLowerCase().includes(q);
      const matchS = status === "all" ? true : r.status === status;
      return matchQ && matchS;
    });
  }, [mapped, query, status]);

  useEffect(() => setPage(1), [query, status, pageSize]);

  const paged = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize]);

  const columns: TableColumnsType<UserRow> = [
    {
      title: "User Name",
      dataIndex: "name",
      onCell: () => ({ style: { padding: "10px 20px" } }),
      onHeaderCell: () => ({ style: { padding: "10px 20px" } }),
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (_, r) => (
        <Space>
          <Avatar src={r.avatar} shape="square" />
          <Typography.Text
            style={{
              fontSize: 14,
              color: "#212b36",
              fontWeight: 500,
            }}
          >
            {r.name}
          </Typography.Text>
        </Space>
      ),
    },
    {
      title: "Phone",
      dataIndex: "phone",
      onCell: () => ({ style: { padding: "10px 20px" } }),
      onHeaderCell: () => ({ style: { padding: "10px 20px" } }),
      sorter: (a, b) => a.phone.localeCompare(b.phone),
      render: (t) => (
        <Typography.Text
          style={{
            fontSize: 14,
            color: "#646b72",
            lineHeight: 1.462,
            whiteSpace: "nowrap",
          }}
        >
          {t}
        </Typography.Text>
      ),
    },
    {
      title: "Email",
      dataIndex: "email",
      onCell: () => ({ style: { padding: "10px 20px" } }),
      onHeaderCell: () => ({ style: { padding: "10px 20px" } }),
      sorter: (a, b) => a.email.localeCompare(b.email),
      responsive: ["md"],
      render: (t) => (
        <Typography.Text
          style={{
            fontSize: 14,
            color: "#646b72",
            lineHeight: 1.462,
            whiteSpace: "nowrap",
          }}
        >
          {t}
        </Typography.Text>
      ),
    },
    {
      title: "Role",
      dataIndex: "role",
      onCell: () => ({ style: { padding: "10px 20px" } }),
      onHeaderCell: () => ({ style: { padding: "10px 20px" } }),
      sorter: (a, b) => a.role.localeCompare(b.role),
      responsive: ["lg"],
      render: (t) => (
        <Typography.Text
          style={{
            fontSize: 14,
            color: "#646b72",
            lineHeight: 1.462,
            whiteSpace: "nowrap",
          }}
        >
          {t}
        </Typography.Text>
      ),
    },
    {
      title: "Created On",
      dataIndex: "createdOn",
      onCell: () => ({ style: { padding: "10px 20px" } }),
      onHeaderCell: () => ({ style: { padding: "10px 20px" } }),
      sorter: (a, b) => (a.createdOn?.getTime() ?? 0) - (b.createdOn?.getTime() ?? 0),
      render: (t) => (
        <Typography.Text
          style={{
            fontSize: 14,
            color: "#646b72",
            lineHeight: 1.462,
            whiteSpace: "nowrap",
          }}
        >
          {t}
        </Typography.Text>
      ),
      responsive: ["lg"],
    },
    {
      title: "Status",
      dataIndex: "status",
      filters: [
        { text: "Active", value: "active" },
        { text: "Inactive", value: "inactive" },
      ],
      onCell: () => ({ style: { padding: "10px 20px" } }),
      onHeaderCell: () => ({ style: { padding: "10px 20px" } }),
      onFilter: (v, r) => r.status === v,
      render: (s: Status) => <StatusBadge value={s} />,
    },
    {
      title: "Actions",
      key: "actions",
      onCell: () => ({ style: { padding: "10px 20px" } }),
      onHeaderCell: () => ({ style: { padding: "10px 20px" } }),
      width: 160,
      render: () => (
        <Space>
          <Tooltip title="View">
            <Button
              size="middle"
              className="border border-[#e6eaed] bg-white rounded-[5px] flex items-center text-[#212b36] text-sm font-medium p-[.5rem]"
              icon={<FiEye size={16} />}
            />
          </Tooltip>
          {canUpdate && (
            <Tooltip title="Edit">
              <Button
                size="middle"
                className="border border-[#e6eaed] bg-white rounded-[5px] flex items-center text-[#212b36] text-sm font-medium p-[.5rem]"
                icon={<FiEdit3 size={16} />}
              />
            </Tooltip>
          )}
          {canDelete && (
            <Tooltip title="Delete">
              <Button
                size="middle"
                className="border border-[#e6eaed] bg-white rounded-[5px] flex items-center text-[#212b36] text-sm font-medium p-[.5rem]"
                icon={<FiTrash2 size={16} />}
              />
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
        headerBg: "#f7f9fc", // << warna background thead
        headerColor: "#212b36", // warna teks header
        headerSplitColor: "#e6e9ef", // garis pemisah kolom header
        rowHoverBg: "#f7f9fc",
        headerSortHoverBg: "#eef3fb", // saat hover ikon sort
        headerSortActiveBg: "#e8effc", // saat kolom sedang di-sort
      },
      Card: { headerHeight: 60, headerPadding: 16, padding: 16, lineWidth: 1, colorBorderSecondary: "#e6e9ef" },
      Button: { colorBorder: "#e6e9ef", defaultBorderColor: "#e6e9ef" },
      Select: { colorBorder: "#e6e9ef" },
      Input: { colorBorder: "#e6e9ef" },
    },
  } as const;

  return (
    <ConfigProvider theme={theme}>
      <div className="flex items-center justify-between mb-[30px]">
        <div className="mr-auto">
          <h4 className="font-bold mb-[5px] text-[1.125rem] text-[#212b36] leading-[1.2]">User List</h4>
          <h6 className="text-sm text-[#646b72] leading-[1.2]">Manage Your Users</h6>
        </div>

        {canCreate && (
          <button
            className="bg-[#0076f9] border border-[#0076f9] flex items-center justify-center p-[5px_8px] text-white font-medium text-[13px] rounded-[8px] gap-2"
            onClick={() => router.push(`/dashboard/${companyId}/users/new`)}
          >
            <BiPlusCircle />
            Add New User
          </button>
        )}
      </div>

      <Card
        style={{ borderRadius: 8, overflow: "hidden", marginBottom: 16 }}
        styles={{
          header: { padding: "1rem 1.25rem", borderColor: "#e6eaed" },
          body: {
            paddingInline: 0, // mepet kiri/kanan
            paddingTop: mounted ? 0 : 16, // saat loading ada ruang atas
            paddingBottom: 16, // selalu ada ruang bawah -> nggak mepet
          },
        }}
        title={
          <Input
            allowClear
            prefix={<FiSearch size={14} className="text-[#a6aaaf]" />}
            placeholder="Search"
            style={{ width: 208, height: 38, color: "#212b36", lineHeight: "1.6", fontSize: "14" }}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        }
        extra={
          <Select
            value={status}
            onChange={(v) => setStatus(v)}
            style={{ width: 120, height: 38 }}
            options={[
              { value: "all", label: "Status" },
              { value: "active", label: "Active" },
              { value: "inactive", label: "Inactive" },
            ]}
          />
        }
      >
        <Table<UserRow>
          size="middle"
          rowKey="key"
          columns={columns}
          dataSource={paged}
          pagination={false}
          bordered={false}
          loading={{ spinning: !mounted }}
          style={{ minHeight: 280 }}
          rowSelection={canDelete ? { selectedRowKeys, onChange: setSelectedRowKeys } : undefined}
          components={{
            header: {
              cell: (props: React.HTMLAttributes<HTMLTableCellElement>) => (
                <th
                  {...props}
                  style={{ ...(props.style || {}), ...((props.className || "").includes("ant-table-selection-column") ? { padding: "10px 20px" } : {}) }}
                />
              ),
            },
            body: {
              cell: (props: React.HTMLAttributes<HTMLTableCellElement>) => (
                <td
                  {...props}
                  style={{ ...(props.style || {}), ...((props.className || "").includes("ant-table-selection-column") ? { padding: "10px 20px" } : {}) }}
                />
              ),
            },
          }}
        />

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
