import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

import { verifyCredentials } from "@/lib/verify-credentials";

const nextAuthUrl = process.env.NEXTAUTH_URL?.trim() || "";
const isHttps = nextAuthUrl.startsWith("https://");
const isLocalhostUrl = /localhost|127\.0\.0\.1/.test(nextAuthUrl);

if (process.env.NODE_ENV === "production" && isLocalhostUrl) {
  console.error(
    "[auth] NEXTAUTH_URL указывает на localhost в production:",
    nextAuthUrl,
    "— вход в админку будет ломаться. Укажите публичный URL, например http://radenie.pro"
  );
}

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  pages: { signIn: "/login" },
  useSecureCookies: isHttps,
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const result = await verifyCredentials(
          String(credentials?.email ?? ""),
          String(credentials?.password ?? "")
        );
        if (!result.ok) {
          console.error("[auth]", result.code, result.message);
          return null;
        }
        return result.user;
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as "ADMIN" | "SPECIALIST" | "CLIENT";
      }
      return session;
    },
  },
  secret:
    process.env.NEXTAUTH_SECRET?.trim() ||
    process.env.SESSION_SECRET?.trim() ||
    (process.env.NODE_ENV === "development"
      ? "dev-only-secret-change-in-production"
      : undefined),
};
