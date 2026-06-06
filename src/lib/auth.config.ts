import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { Role } from "@/generated/prisma/browser";

export const authConfig: NextAuthConfig = {
  trustHost: true,
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: () => null,
    }),
  ],
  callbacks: {
    authorized({ auth, request }) {
      const { pathname } = request.nextUrl;
      const publicRoutes = ["/login", "/forgot-password"];
      const isPublic = publicRoutes.some((route) => pathname.startsWith(route));
      const isLoggedIn = !!auth?.user;

      if (!isLoggedIn && !isPublic) return false;
      if (isLoggedIn && isPublic) {
        return Response.redirect(new URL("/", request.nextUrl));
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id!;
        token.role = user.role;
        token.divisionId = user.divisionId;
        token.departmentId = user.departmentId;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as Role;
        session.user.divisionId = token.divisionId as string | null;
        session.user.departmentId = token.departmentId as string | null;
      }
      return session;
    },
  },
};
