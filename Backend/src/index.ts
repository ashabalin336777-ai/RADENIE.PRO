import fs from "fs";
import path from "path";
import { config } from "dotenv";
import express from "express";
import cors from "cors";

const rootEnv = path.resolve(process.cwd(), "../.env");
if (fs.existsSync(rootEnv)) {
  config({ path: rootEnv });
} else {
  config();
}

const app = express();
const PORT = Number(process.env.PORT) || 4000;

const requiredEnv = ["OPENAI_API_KEY", "SESSION_SECRET"] as const;
const missingEnv = requiredEnv.filter((key) => !process.env[key]);

if (missingEnv.length > 0) {
  console.warn(`Missing env vars: ${missingEnv.join(", ")}`);
}

app.use(cors({ origin: true }));
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "radenie-pro-backend",
    configured: {
      openai: Boolean(process.env.OPENAI_API_KEY),
      session: Boolean(process.env.SESSION_SECRET),
    },
  });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Backend running on port ${PORT}`);
});
