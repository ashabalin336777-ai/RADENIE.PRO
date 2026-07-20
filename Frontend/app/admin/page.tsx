import { redirect } from "next/navigation";

import { AdminDashboard } from "@/components/admin/admin-dashboard";
import { getAdminContext } from "@/lib/queries/admin";
import { getSession } from "@/lib/session";

export default async function AdminPage() {
  const session = await getSession();

  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/admin");
  }

  if (session.user.role !== "ADMIN" && session.user.role !== "SPECIALIST") {
    redirect("/");
  }

  const data = await getAdminContext(
    session.user.id,
    session.user.role as "ADMIN" | "SPECIALIST"
  );

  if (!data) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="text-2xl font-semibold">Профиль не найден</h1>
        <p className="mt-2 text-muted-foreground">
          У вашего аккаунта нет профиля специалиста.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-background px-4 py-12 md:px-6">
      <div className="mx-auto max-w-5xl">
        <AdminDashboard data={data} />
      </div>
    </div>
  );
}
