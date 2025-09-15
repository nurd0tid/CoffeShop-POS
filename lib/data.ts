// lib/data.ts
import companiesJson from "@/data/companies.json";
import membershipsJson from "@/data/memberships.json";
import userRolesJson from "@/data/user-roles.json";
import usersJson from "@/data/users.json";

type Company = { id: string; slug: string; owner_user_id?: string; is_active?: boolean };
type Membership = { company_id: string; user_id: string; is_owner: boolean; is_active: boolean; joined_at?: string };
type UserRole = { company_id: string; user_id: string; role_codes: string[] };
type User = { id: string; name: string; email: string; is_active?: boolean; created_at?: string };

export type Row = {
  id: string;
  name: string;
  email: string;
  roles: string[];
  is_owner: boolean;
  is_active: boolean;
  joinedAt: string;
};

const companies = companiesJson as Company[];
const memberships = membershipsJson as Membership[];
const userRoles = userRolesJson as UserRole[];
const users: User[] = usersJson.map((u: any) => ({
  id: u.id,
  name: u.full_name ?? "-",
  email: u.email,
  is_active: u.is_active ?? true,
  created_at: u.created_at ?? "",
}));

/** Company aktif pertama untuk user (owner dulu, kalau ngga ada pakai membership aktif) */
export function getDefaultCompanyId(userId: string): string | null {
  if (!userId) return null;

  const owned = companies.find((c) => c.owner_user_id === userId && (c.is_active ?? true));
  if (owned) return owned.id;

  const mem = memberships.find((m) => m.user_id === userId && m.is_active);
  return mem?.company_id ?? null;
}

/** Join memberships + users (+ roles) untuk 1 company jadi baris tabel */
export function getUsersOfCompany(companyId: string): Row[] {
  const mems = memberships.filter((m) => m.company_id === companyId);

  return mems.map<Row>((m) => {
    const u = users.find((x) => x.id === m.user_id);
    const ur = userRoles.find((x) => x.company_id === companyId && x.user_id === m.user_id);

    return {
      id: m.user_id,
      name: u?.name ?? "-",
      email: u?.email ?? "-",
      roles: ur?.role_codes ?? [],
      is_owner: m.is_owner,
      is_active: (u?.is_active ?? true) && m.is_active,
      joinedAt: m.joined_at ?? u?.created_at ?? "",
    };
  });
}
