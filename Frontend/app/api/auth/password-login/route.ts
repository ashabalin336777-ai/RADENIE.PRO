import { encode } from "next-auth/jwt";
import { NextResponse } from "next/server";

import { verifyCredentials } from "@/lib/verify-credentials";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function cookieName(secure: boolean) {
  return secure
    ? "__Secure-next-auth.session-token"
    : "next-auth.session-token";
}

export async function POST(request: Request) {
  let body: { email?: string; password?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, message: "Некорректный JSON" },
      { status: 400 }
    );
  }

  const result = await verifyCredentials(
    String(body.email ?? ""),
    String(body.password ?? "")
  );

  if (!result.ok) {
    return NextResponse.json(
      { ok: false, code: result.code, message: result.message },
      { status: 401 }
    );
  }

  const secret =
    process.env.NEXTAUTH_SECRET?.trim() ||
    process.env.SESSION_SECRET?.trim();

  if (!secret) {
    return NextResponse.json(
      {
        ok: false,
        code: "CONFIG",
        message: "Не задан NEXTAUTH_SECRET в .env",
      },
      { status: 500 }
    );
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
  const response = NextResponse.json({
    ok: true,
    user: {
      email: result.user.email,
      name: result.user.name,
      role: result.user.role,
    },
  });

  response.cookies.set(cookieName(secure), token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure,
    maxAge,
  });

  return response;
}
