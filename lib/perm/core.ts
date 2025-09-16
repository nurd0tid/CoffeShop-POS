// lib/perm/core.ts
import companiesJson from "@/data/companies.json";
import membershipsJson from "@/data/memberships.json";
import rolePermJson from "@/data/role-perm.json";
import userRolesJson from "@/data/user-roles.json";

type Company = { id: string; slug: string; owner_user_id?: string; is_active?: boolean };
type Membership = { company_id: string; user_id: string; is_owner: boolean; is_active: boolean };
type RolePerm = { role_code: string; permissions: string[] };
type UserRole = { company_id: string; user_id: string; role_codes: string[] };

const companies = companiesJson as Company[];
const memberships = membershipsJson as Membership[];
const rolePerm = rolePermJson as RolePerm[];
const userRoles = userRolesJson as UserRole[];

const norm = (s: string) => s.trim().toLowerCase();

/* index bantuan */
const membershipsByUser = new Map<string, Membership[]>();
for (const m of memberships) {
  const arr = membershipsByUser.get(m.user_id) ?? [];
  arr.push(m);
  membershipsByUser.set(m.user_id, arr);
}
const permByRole = new Map<string, string[]>();
for (const rp of rolePerm) permByRole.set(norm(rp.role_code), (rp.permissions ?? []).map(norm));

/** Guard global berbasis membership aktif (union, tanpa konteks company) */
export function hasPerm(userId: string, perm: string): boolean {
  if (!userId || !perm) return false;

  const p = norm(perm);
  const mod = p.split(":")[0];

  // owner di salah satu company → full access
  if (companies.some((c) => c.owner_user_id === userId)) return true;

  // semua membership aktif user
  const mems = (membershipsByUser.get(userId) ?? []).filter((m) => m.is_active);
  if (mems.length === 0) return false;
  if (mems.some((m) => m.is_owner)) return true;

  // kumpulkan role codes dari semua company aktifnya
  const codes = new Set<string>();
  for (const m of mems) {
    const ur = userRoles.find((x) => x.company_id === m.company_id && x.user_id === userId);
    for (const code of ur?.role_codes ?? []) codes.add(norm(code));
  }
  if (codes.size === 0) return false;

  const perms = new Set<string>();
  for (const code of codes) {
    for (const it of permByRole.get(code) ?? []) perms.add(it);
  }
  return perms.has(p) || perms.has(`${mod}:*`);
}

export function hasView(userId: string, moduleCode: string): boolean {
  return hasPerm(userId, `${moduleCode}:view`);
}

/** Guard spesifik per company (lebih presisi untuk tombol & API) */
export function hasPermInCompany(userId: string, companyId: string, perm: string): boolean {
  if (!userId || !companyId || !perm) return false;

  const p = norm(perm);
  const mod = p.split(":")[0];

  const company = companies.find((c) => c.id === companyId);
  if (!company) return false;

  // owner di company tsb
  if (company.owner_user_id === userId) return true;

  const mem = memberships.find((m) => m.company_id === companyId && m.user_id === userId && m.is_active);
  if (!mem) return false;
  if (mem.is_owner) return true;

  const ur = userRoles.find((x) => x.company_id === companyId && x.user_id === userId);
  const codes = ur?.role_codes ?? [];
  if (codes.length === 0) return false;

  const perms = new Set<string>();
  for (const code of codes) {
    for (const it of permByRole.get(norm(code)) ?? []) perms.add(it);
  }
  return perms.has(p) || perms.has(`${mod}:*`);
}

/* Wrapper kompatibel (path diabaikan karena guard-nya global) */
export function hasPermByPath(userId: string, _path: string, perm: string): boolean {
  return hasPerm(userId, perm);
}
export function hasViewByPath(userId: string, _path: string, moduleCode: string): boolean {
  return hasView(userId, moduleCode);
}

export type { Company, Membership, RolePerm, UserRole };
