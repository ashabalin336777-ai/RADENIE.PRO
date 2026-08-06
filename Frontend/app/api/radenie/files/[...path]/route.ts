import { readFile, stat } from "fs/promises";
import { NextResponse } from "next/server";

import { resolveUploadPath } from "@/lib/uploads";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CONTENT_TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
};

type Params = { params: { path: string[] } };

export async function GET(_request: Request, { params }: Params) {
  const fullPath = resolveUploadPath(params.path ?? []);
  if (!fullPath) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    await stat(fullPath);
    const data = await readFile(fullPath);
    const ext = fullPath.slice(fullPath.lastIndexOf(".")).toLowerCase();
    const contentType = CONTENT_TYPES[ext] || "application/octet-stream";

    return new NextResponse(data, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
