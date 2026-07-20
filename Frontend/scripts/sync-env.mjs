import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const frontendDir = path.join(__dirname, "..");
const rootEnvPath = path.join(frontendDir, "..", ".env");
const localEnvPath = path.join(frontendDir, ".env.local");

if (!fs.existsSync(rootEnvPath)) {
  console.error("Не найден ../.env — скопируйте .env.example в .env в корне проекта");
  process.exit(1);
}

let content = fs.readFileSync(rootEnvPath, "utf8");

// Переопределения для локальной разработки (next dev на :3000)
const overrides = {
  NEXTAUTH_URL: "http://localhost:3000",
  NODE_ENV: "development",
};

for (const [key, value] of Object.entries(overrides)) {
  const regex = new RegExp(`^${key}=.*$`, "m");
  if (regex.test(content)) {
    content = content.replace(regex, `${key}=${value}`);
  } else {
    content += `\n${key}=${value}\n`;
  }
}

// Убедимся, что NEXTAUTH_SECRET задан (fallback на SESSION_SECRET)
const secretMatch = content.match(/^SESSION_SECRET=(.+)$/m);
const nextAuthMatch = content.match(/^NEXTAUTH_SECRET=(.+)$/m);
if (secretMatch && (!nextAuthMatch || !nextAuthMatch[1].trim())) {
  content = content.replace(/^NEXTAUTH_SECRET=.*$/m, `NEXTAUTH_SECRET=${secretMatch[1]}`);
}

fs.writeFileSync(localEnvPath, content, "utf8");
console.log("✓ Frontend/.env.local синхронизирован из ../.env");
console.log("  NEXTAUTH_URL=http://localhost:3000 (локальная разработка)");
