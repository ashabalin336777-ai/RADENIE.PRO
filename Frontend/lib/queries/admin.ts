import { prisma } from "@/lib/prisma";

export async function getAdminContext(userId: string, role: "ADMIN" | "SPECIALIST") {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      specialistProfile: true,
    },
  });

  if (!user) return null;

  if (role === "SPECIALIST" && !user.specialistProfile) {
    return null;
  }

  const profileId = user.specialistProfile?.id;
  const specialistUserId = user.id;

  const [appointments, aiSessions, articles, specialists] = await Promise.all([
    prisma.appointment.findMany({
      where:
        role === "ADMIN"
          ? {}
          : { specialistId: specialistUserId },
      include: {
        client: { select: { name: true, email: true, phone: true } },
        specialist: { select: { name: true } },
      },
      orderBy: { startTime: "asc" },
    }),
    prisma.aiChatSession.findMany({
      where:
        role === "ADMIN"
          ? {}
          : profileId
            ? { specialistId: profileId }
            : { id: "__none__" },
      include: {
        client: { select: { name: true, email: true } },
        specialist: {
          select: {
            slug: true,
            user: { select: { name: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.article.findMany({
      where: role === "ADMIN" ? {} : { authorId: specialistUserId },
      orderBy: { updatedAt: "desc" },
    }),
    role === "ADMIN"
      ? prisma.specialistProfile.findMany({
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                avatarUrl: true,
              },
            },
          },
          orderBy: { user: { name: "asc" } },
        })
      : Promise.resolve([]),
  ]);

  return {
    user,
    profile: user.specialistProfile,
    appointments,
    aiSessions,
    articles,
    specialists,
  };
}

export type AdminContext = NonNullable<Awaited<ReturnType<typeof getAdminContext>>>;
