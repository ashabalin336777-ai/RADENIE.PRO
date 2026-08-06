/**
 * Сброс пароля admin@radenie.pro на Radene2024!
 *
 * Локально:
 *   node Frontend/scripts/reset-admin-password.mjs
 *
 * На VPS (из корня проекта, postgres уже запущен):
 *   docker compose exec frontend node -e "..."  — или:
 *   docker run --rm --network <radenie_net> \
 *     -v "$PWD/Frontend:/app" -w /app \
 *     -e DATABASE_URL="postgresql://radenie:radenie_secret@postgres:5432/radenie_pro" \
 *     node:20-alpine sh -c "apk add --no-cache openssl && npm ci && node scripts/reset-admin-password.mjs"
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const EMAIL = process.env.ADMIN_EMAIL || "admin@radenie.pro";
const PASSWORD = process.env.ADMIN_PASSWORD || "Radene2024!";

const prisma = new PrismaClient();

const password = await bcrypt.hash(PASSWORD, 12);
const user = await prisma.user.update({
  where: { email: EMAIL },
  data: { password, role: "ADMIN" },
});

console.log("OK: password reset for", user.email, user.role);
await prisma.$disconnect();
