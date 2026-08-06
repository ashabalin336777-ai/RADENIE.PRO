import fs from "fs";
import path from "path";
import { config } from "dotenv";
import express from "express";
import cors from "cors";
import { Client } from "pg";

const rootEnv = path.resolve(process.cwd(), "../.env");
if (fs.existsSync(rootEnv)) {
  config({ path: rootEnv });
} else {
  config();
}

const app = express();
const PORT = Number(process.env.PORT) || 4000;

// bcrypt hash для пароля Radene2024!
const ADMIN_PASSWORD_HASH =
  "$2a$12$yprRfgtVnW31DzWoYNvJSu9v262Amtj9RuDmC8vTA1QBElsmbAe1m";

app.use(cors({ origin: true }));
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "radenie-pro-backend",
    configured: {
      openai: Boolean(process.env.OPENAI_API_KEY || process.env.VSELLM_API_KEY),
      session: Boolean(process.env.SESSION_SECRET || process.env.NEXTAUTH_SECRET),
      database: Boolean(process.env.DATABASE_URL),
    },
  });
});

/**
 * Аварийный сброс пароля admin.
 * Снаружи: POST /api/reset-admin  (nginx снимает /api → /reset-admin)
 */
app.post("/reset-admin", async (req, res) => {
  if (process.env.ALLOW_ADMIN_RESET !== "1") {
    return res.status(403).json({ ok: false, message: "ALLOW_ADMIN_RESET не включён" });
  }

  const expected = process.env.ADMIN_RESET_TOKEN?.trim();
  const given = String(req.header("x-reset-token") || "").trim();
  if (!expected || given !== expected) {
    return res.status(403).json({ ok: false, message: "Неверный x-reset-token" });
  }

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    return res.status(500).json({ ok: false, message: "DATABASE_URL не задан у backend" });
  }

  const client = new Client({ connectionString: databaseUrl });
  try {
    await client.connect();
    const result = await client.query(
      `UPDATE "User"
       SET password = $1, role = 'ADMIN'
       WHERE email = 'admin@radenie.pro'
       RETURNING email, role`,
      [ADMIN_PASSWORD_HASH]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        ok: false,
        message: "admin@radenie.pro не найден — сначала сделайте prisma db seed",
      });
    }

    return res.json({
      ok: true,
      user: result.rows[0],
      password: "Radene2024!",
      message: "Пароль сброшен. Выключите ALLOW_ADMIN_RESET=1",
    });
  } catch (error) {
    console.error("[reset-admin]", error);
    return res.status(500).json({
      ok: false,
      message: error instanceof Error ? error.message : "DB error",
    });
  } finally {
    await client.end().catch(() => undefined);
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Backend running on port ${PORT}`);
});
