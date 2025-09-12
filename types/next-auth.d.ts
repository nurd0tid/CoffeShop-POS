import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user?: {
      name?: string | null;
      email?: string | null;
      image?: string | null;
      userId?: string; // UUID dari users.json
    } | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    userId?: string;
  }
}
