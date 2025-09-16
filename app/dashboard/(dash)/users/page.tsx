import React from "react";
import Content from "./components/Content";
import { auth } from "@/auth";
import { getDefaultCompanyId, getUsersOfCompany, Row } from "@/lib/data";

const Users = async () => {
  const session = await auth();
  const userId = session?.user?.userId ?? "";
  if (!userId) return null; // middleware sudah handle redirect

  const companyId = getDefaultCompanyId(userId);
  if (!companyId) {
    return <div className="p-6 text-sm">Tidak ada company aktif untuk akun ini.</div>;
  }

  const rows: Row[] = getUsersOfCompany(companyId);
  return <Content companyId={companyId} rows={rows} />;
};

export default Users;
