import { redirect } from "next/navigation";

import { AdminDashboard } from "@/components/admin/admin-dashboard";
import { getAdminContext } from "@/lib/queries/admin";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const session = await getSession();

  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/admin");
  }

  if (session.user.role !== "ADMIN" && session.user.role !== "SPECIALIST") {
    redirect("/");
  }

  try {
    const data = await getAdminContext(
      session.user.id,
      session.user.role as "ADMIN" | "SPECIALIST"
    );

    if (!data) {
      return (
        <div className="mx-auto max-w-3xl px-4 py-16 text-center">
          <h1 className="text-2xl font-semibold">Профиль не найден</h1>
          <p className="mt-2 text-muted-foreground">
            У вашего аккаунта нет доступа к админке. Для специалиста нужен
            профиль в БД.
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
  } catch (error) {
    console.error("[admin] page failed:", error);
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="text-2xl font-semibold">Админка временно недоступна</h1>
        <p className="mt-2 text-muted-foreground">
          Не удалось загрузить данные из PostgreSQL. Проверьте контейнер
          postgres и логи frontend.
        </p>
      </div>
    );
  }
}
