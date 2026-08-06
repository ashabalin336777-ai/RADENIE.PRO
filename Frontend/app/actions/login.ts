"use server";

import { cookies } from "next/headers";
import { encode } from "next-auth/jwt";

import { verifyCredentials } from "@/lib/verify-credentials";

function sessionCookieName(secure: boolean) {
  return secure
    ? "__Secure-next-auth.session-token"
    : "next-auth.session-token";
}

export type LoginActionResult =
  | { ok: true }
  | { ok: false; code: string; message: string };

export async function loginWithPassword(
  email: string,
  password: string
): Promise<LoginActionResult> {
  const nextAuthUrl = process.env.NEXTAUTH_URL?.trim() || "";
  if (
    process.env.NODE_ENV === "production" &&
    /localhost|127\.0\.0\.1/.test(nextAuthUrl)
  ) {
    return {
      ok: false,
      code: "CONFIG",
      message:
        "NEXTAUTH_URL указывает на localhost. На VPS задайте NEXTAUTH_URL=http://radenie.pro и пересоздайте frontend",
    };
  }

  const result = await verifyCredentials(email, password);
  if (!result.ok) {
    return { ok: false, code: result.code, message: result.message };
  }

  const secret =
    process.env.NEXTAUTH_SECRET?.trim() ||
    process.env.SESSION_SECRET?.trim();

  if (!secret) {
    return {
      ok: false,
      code: "CONFIG",
      message: "Не задан NEXTAUTH_SECRET в .env",
    };
  }

  const maxAge = 30 * 24 * 60 * 60;
  const token = await encode({
    token: {
      sub: result.user.id,
      id: result.user.id,
      email: result.user.email,
      name: result.user.name,
      role: result.user.role,
    },
    secret,
    maxAge,
  });

  const secure = (process.env.NEXTAUTH_URL || "").startsWith("https://");
  cookies().set(sessionCookieName(secure), token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure,
    maxAge,
  });

  return { ok: true };
}
