import Link from "next/link";

export type RoleRow = {
  code: string;
  permissions: string[];
  memberCount: number;
};

type Props = {
  companyId: string;
  rows: RoleRow[];
  canCreate: boolean;
  canUpdate: boolean;
  canDelete: boolean;
};

export default function Content({ companyId, rows, canCreate, canUpdate, canDelete }: Props) {
  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Role & Permissions</h1>

        {canCreate && (
          <Link
            href={`/dashboard/role-permissions/create?company=${encodeURIComponent(companyId)}`}
            className="rounded bg-black text-white text-sm px-3 py-1.5"
          >
            + Add Role
          </Link>
        )}
      </div>

      <div className="overflow-x-auto rounded border">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-gray-50">
              <th className="border px-3 py-2 text-left">#</th>
              <th className="border px-3 py-2 text-left">Role</th>
              <th className="border px-3 py-2 text-left">Permissions</th>
              <th className="border px-3 py-2 text-left">Members</th>
              <th className="border px-3 py-2 text-left w-[200px]">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td className="border px-3 py-2 text-center" colSpan={5}>
                  Belum ada role di company ini.
                </td>
              </tr>
            )}

            {rows.map((r, i) => (
              <tr key={r.code}>
                <td className="border px-3 py-2">{i + 1}</td>
                <td className="border px-3 py-2">{r.code}</td>
                <td className="border px-3 py-2">{r.permissions.join(", ") || "-"}</td>
                <td className="border px-3 py-2">{r.memberCount}</td>
                <td className="border px-3 py-2">
                  <div className="flex gap-2">
                    {canUpdate && (
                      <Link
                        href={`/dashboard/role-permissions/${encodeURIComponent(r.code)}/edit?company=${encodeURIComponent(companyId)}`}
                        className="px-2 py-1 rounded border text-xs"
                      >
                        Edit
                      </Link>
                    )}
                    {canDelete && r.code !== "owner" && (
                      <form action={`/dashboard/role-permissions/${encodeURIComponent(r.code)}/delete?company=${encodeURIComponent(companyId)}`} method="post">
                        <button type="submit" className="px-2 py-1 rounded border text-xs text-rose-600">
                          Delete
                        </button>
                      </form>
                    )}
                    {!canUpdate && !canDelete && <span className="text-gray-400 text-xs">No actions</span>}
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
