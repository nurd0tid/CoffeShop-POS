"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import { useCaps } from "@/lib/perm-ui";

type Row = {
  id: string;
  name: string;
  email: string;
  is_owner: boolean;
  is_active: boolean;
  roles: string[];
};

export default function Content(props: { companyId: string; rows: Row[] }) {
  const { companyId, rows } = props;
  const router = useRouter();

  // minta caps utk create/update/delete
  const { loading, caps } = useCaps({
    module: "employees",
    actions: ["create", "update", "delete"],
    companyId,
  });

  const canCreate = caps["employees:create"] === true;
  const canUpdate = caps["employees:update"] === true;
  const canDelete = caps["employees:delete"] === true;

  return (
    <div className="rounded border">
      {/* Header actions */}
      <div className="flex items-center justify-between p-3 border-b">
        <h2 className="text-base font-medium m-0">Users</h2>
        {!loading && canCreate && (
          <button type="button" onClick={() => router.push("/dashboard/users/create")} className="text-sm rounded bg-black text-white px-3 py-1.5">
            Add User
          </button>
        )}
        {loading && <span className="text-xs text-gray-400">Checking...</span>}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr>
              <th className="border px-3 py-2 text-left">#</th>
              <th className="border px-3 py-2 text-left">Name</th>
              <th className="border px-3 py-2 text-left">Email</th>
              <th className="border px-3 py-2 text-left">Role(s)</th>
              <th className="border px-3 py-2 text-left">Status</th>
              <th className="border px-3 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td className="border px-3 py-2" colSpan={6}>
                  No users.
                </td>
              </tr>
            )}
            {rows.map((r, i) => (
              <tr key={r.id}>
                <td className="border px-3 py-2">{i + 1}</td>
                <td className="border px-3 py-2">{r.name}</td>
                <td className="border px-3 py-2">{r.email}</td>
                <td className="border px-3 py-2">{r.is_owner ? ["owner", ...r.roles].join(", ") : r.roles.join(", ") || "-"}</td>
                <td className="border px-3 py-2">{r.is_active ? "Active" : "Inactive"}</td>
                <td className="border px-3 py-2">
                  <div className="flex gap-2">
                    {!loading && canUpdate && (
                      <button type="button" onClick={() => alert(`Edit ${r.name}`)} className="px-3 py-1 rounded border hover:bg-gray-50">
                        Edit
                      </button>
                    )}
                    {!loading && canDelete && !r.is_owner && (
                      <button
                        type="button"
                        onClick={() => confirm(`Delete ${r.name}?`) && alert("deleted (dummy)")}
                        className="px-3 py-1 rounded border hover:bg-gray-50"
                      >
                        Delete
                      </button>
                    )}
                    {!loading && !canUpdate && !canDelete && <span className="text-xs text-gray-500">No actions</span>}
                    {loading && <span className="text-xs text-gray-400">Checking...</span>}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
