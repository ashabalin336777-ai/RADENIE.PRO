import bcrypt from "bcryptjs";

import { prisma } from "@/lib/prisma";

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  role: "ADMIN" | "SPECIALIST" | "CLIENT";
};

export type VerifyResult =
  | { ok: true; user: AuthUser }
  | {
      ok: false;
      code:
        | "MISSING_CREDENTIALS"
        | "USER_NOT_FOUND"
        | "BAD_PASSWORD"
        | "ROLE_FORBIDDEN"
        | "DB_ERROR";
      message: string;
    };

export async function verifyCredentials(
  emailRaw: string,
  password: string
): Promise<VerifyResult> {
  const email = emailRaw.trim().toLowerCase();
  if (!email || !password) {
    return {
      ok: false,
      code: "MISSING_CREDENTIALS",
      message: "Укажите email и пароль",
    };
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return {
        ok: false,
        code: "USER_NOT_FOUND",
        message: "Пользователь не найден. Запустите seed на VPS.",
      };
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return {
        ok: false,
        code: "BAD_PASSWORD",
        message:
          "Неверный пароль. Сбросьте хеш через scripts/vps-fix-auth.sh или SQL из docs.",
      };
    }

    if (user.role !== "SPECIALIST" && user.role !== "ADMIN") {
      return {
        ok: false,
        code: "ROLE_FORBIDDEN",
        message: "Этот аккаунт не имеет доступа в админку",
      };
    }

    return {
      ok: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  } catch (error) {
    console.error("[auth] verifyCredentials failed:", error);
    return {
      ok: false,
      code: "DB_ERROR",
      message:
        "Ошибка БД при входе (Prisma/PostgreSQL). Смотрите логи: docker compose logs frontend",
    };
  }
}
