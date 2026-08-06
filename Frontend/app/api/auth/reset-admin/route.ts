import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Аварийный сброс пароля admin (только если ALLOW_ADMIN_RESET=1).
 *
 * curl -X POST http://127.0.0.1/api/auth/reset-admin \
 *   -H 'Content-Type: application/json' \
 *   -H "x-reset-token: $ADMIN_RESET_TOKEN" \
 *   -d '{"password":"Radene2024!"}'
 */
export async function POST(request: Request) {
  if (process.env.ALLOW_ADMIN_RESET !== "1") {
    return NextResponse.json(
      { ok: false, message: "ALLOW_ADMIN_RESET не включён" },
      { status: 403 }
    );
  }

  const expected = process.env.ADMIN_RESET_TOKEN?.trim();
  const given = request.headers.get("x-reset-token")?.trim();
  if (!expected || !given || given !== expected) {
    return NextResponse.json(
      { ok: false, message: "Неверный x-reset-token" },
      { status: 403 }
    );
  }

  let password = "Radene2024!";
  try {
    const body = (await request.json()) as { password?: string };
    if (body.password?.trim()) password = body.password.trim();
  } catch {
    // default password
  }

  try {
    const hash = await bcrypt.hash(password, 12);
    const user = await prisma.user.update({
      where: { email: "admin@radenie.pro" },
      data: { password: hash, role: "ADMIN" },
    });

    return NextResponse.json({
      ok: true,
      email: user.email,
      role: user.role,
      message: "Пароль admin обновлён. Выключите ALLOW_ADMIN_RESET=1",
    });
  } catch (error) {
    console.error("[reset-admin]", error);
    return NextResponse.json(
      {
        ok: false,
        message:
          error instanceof Error
            ? error.message
            : "Не удалось обновить пароль (нет пользователя или БД)",
      },
      { status: 500 }
    );
  }
}
