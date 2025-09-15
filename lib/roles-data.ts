// lib/roles-data.ts
import { RoleRow } from "@/app/dashboard/roles-permissions/components/Content";
import rolePermJson from "@/data/role-perm.json"; // [{ role_code, permissions: [...] }]
import userRolesJson from "@/data/user-roles.json"; // [{ company_id, user_id, role_codes: [...] }]

type RolePerm = { role_code: string; permissions: string[] };
type UserRole = { company_id: string; user_id: string; role_codes: string[] };

const rolePerm = rolePermJson as RolePerm[];
const userRoles = userRolesJson as UserRole[];

const norm = (s: string) => s.trim().toLowerCase();

export function getCompanyRoleRows(companyId: string): RoleRow[] {
  // kumpulkan semua role code yang muncul di company
  const roleSet = new Set<string>();
  for (const ur of userRoles) {
    if (ur.company_id !== companyId) continue;
    for (const code of ur.role_codes ?? []) roleSet.add(code);
  }

  // index: role_code -> permissions
  const permByRole = new Map<string, string[]>();
  for (const rp of rolePerm) permByRole.set(norm(rp.role_code), (rp.permissions ?? []).map(norm));

  // hitung member per role
  const memberCountByRole = new Map<string, number>();
  for (const code of roleSet) memberCountByRole.set(code, 0);
  for (const ur of userRoles) {
    if (ur.company_id !== companyId) continue;
    for (const code of ur.role_codes ?? []) {
      memberCountByRole.set(code, (memberCountByRole.get(code) ?? 0) + 1);
    }
  }

  // bentuk rows
  const rows: RoleRow[] = [];
  for (const code of Array.from(roleSet).sort()) {
    const perms = permByRole.get(norm(code)) ?? [];
    rows.push({
      code,
      permissions: perms,
      memberCount: memberCountByRole.get(code) ?? 0,
    });
  }

  return rows;
}
