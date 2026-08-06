import { randomBytes } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";

const MAX_BYTES = 3 * 1024 * 1024; // 3 MB
const ALLOWED = new Map([
  ["image/jpeg", "jpg"],
  ["image/jpg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
]);

export function getUploadsRoot() {
  return (
    process.env.UPLOAD_DIR?.trim() ||
    path.join(process.cwd(), "uploads")
  );
}

export async function saveAvatarUpload(
  file: File,
  userId: string
): Promise<{ ok: true; url: string } | { ok: false; error: string }> {
  if (!file || file.size <= 0) {
    return { ok: false, error: "Файл не выбран" };
  }
  if (file.size > MAX_BYTES) {
    return { ok: false, error: "Фото больше 3 МБ" };
  }

  const ext = ALLOWED.get(file.type);
  if (!ext) {
    return { ok: false, error: "Допустимы только JPG, PNG или WEBP" };
  }

  const dir = path.join(getUploadsRoot(), "avatars");
  await mkdir(dir, { recursive: true });

  const filename = `${userId}-${Date.now()}-${randomBytes(4).toString("hex")}.${ext}`;
  const fullPath = path.join(dir, filename);
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(fullPath, buffer);

  return { ok: true, url: `/api/radenie/files/avatars/${filename}` };
}

export function resolveUploadPath(parts: string[]) {
  if (parts.length === 0 || parts.some((p) => p.includes("..") || p.includes("/") || p.includes("\\"))) {
    return null;
  }
  const root = getUploadsRoot();
  const full = path.join(root, ...parts);
  if (!full.startsWith(root)) return null;
  return full;
}
