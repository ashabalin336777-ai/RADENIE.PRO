import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function withConnectTimeout(url: string | undefined): string | undefined {
  if (!url) return url;
  if (url.includes("connect_timeout=")) return url;
  return url.includes("?")
    ? `${url}&connect_timeout=5`
    : `${url}?connect_timeout=5`;
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: withConnectTimeout(process.env.DATABASE_URL),
      },
    },
    log:
      process.env.NODE_ENV === "development"
        ? ["error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
