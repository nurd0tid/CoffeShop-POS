import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import usersRaw from "@/data/users.json";

type IdentityUser = {
  id: string;
  email: string;
  password: string;
  full_name: string;
};

const users = usersRaw as IdentityUser[];

export const { auth, signIn, signOut, handlers } = NextAuth({
  session: { strategy: "jwt" },

  providers: [
    Credentials({
      name: "Credentials",
      credentials: { email: {}, password: {} },
      async authorize(creds) {
        const email = String(creds?.email ?? "")
          .trim()
          .toLowerCase();
        const password = String(creds?.password ?? "");
        if (!email || !password) return null;

        const u = users.find((x) => x.email.toLowerCase() === email && x.password === password);
        if (!u) return null;

        // minimal { id, name, email }
        return { id: u.id, name: u.full_name, email: u.email };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user && "id" in user) token.userId = (user as { id: string }).id;
      return token;
    },
    async session({ session, token }) {
      if (session.user) (session.user as { userId?: string }).userId = token.userId as string;
      return session;
    },
  },

  pages: {
    signIn: "/auth/signin",
  },
});
