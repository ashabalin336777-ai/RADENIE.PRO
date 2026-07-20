import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";

export function getSession() {
  return getServerSession(authOptions);
}

export async function requireAdminSession() {
  const session = await getSession();

  if (!session?.user?.id) {
    throw new Error("UNAUTHORIZED");
  }

  if (session.user.role !== "ADMIN" && session.user.role !== "SPECIALIST") {
    throw new Error("FORBIDDEN");
  }

  return session;
}
