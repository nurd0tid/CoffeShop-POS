import React from "react";
import Content from "./components/Content";
import { auth } from "@/auth";
import { getDefaultCompanyId } from "@/lib/data";
import { getCompanyRoleRows } from "@/lib/roles-data";
import { hasPermInCompany } from "@/lib/perm/core";

export default async function RolePermissions() {
  const session = await auth();
  const userId = session?.user?.userId ?? "";
  if (!userId) return null; // middleware sudah handle redirect

  const companyId = getDefaultCompanyId(userId);
  if (!companyId) {
    return <div className="p-6 text-sm">Tidak ada company aktif untuk akun ini.</div>;
  }

  const rows = getCompanyRoleRows(companyId);

  const canCreate = hasPermInCompany(userId, companyId, "roles:create");
  const canUpdate = hasPermInCompany(userId, companyId, "roles:update");
  const canDelete = hasPermInCompany(userId, companyId, "roles:delete");

  return <Content companyId={companyId} rows={rows} canCreate={canCreate} canUpdate={canUpdate} canDelete={canDelete} />;
}
