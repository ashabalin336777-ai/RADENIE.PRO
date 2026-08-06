"use server";

import { revalidatePath } from "next/cache";
import { AppointmentStatus } from "@prisma/client";

import { requireAdminSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function getSpecialistUserId(sessionUserId: string, role: string) {
  if (role === "ADMIN") return sessionUserId;

  const profile = await prisma.specialistProfile.findUnique({
    where: { userId: sessionUserId },
  });

  if (!profile) throw new Error("FORBIDDEN");
  return sessionUserId;
}

export async function updateProfileAction(formData: FormData) {
  const session = await requireAdminSession();

  // Свой профиль — только у SPECIALIST
  if (session.user.role !== "SPECIALIST") {
    return { success: false, error: "Используйте редактирование специалиста" };
  }

  const userId = session.user.id;
  const bio = String(formData.get("bio") ?? "");
  const education = String(formData.get("education") ?? "");
  const videoIntroUrl = String(formData.get("videoIntroUrl") ?? "") || null;
  const telegram = String(formData.get("telegram") ?? "") || undefined;
  const instagram = String(formData.get("instagram") ?? "") || undefined;

  const socialLinks: Record<string, string> = {};
  if (telegram) socialLinks.telegram = telegram;
  if (instagram) socialLinks.instagram = instagram;

  await prisma.specialistProfile.update({
    where: { userId },
    data: {
      bio,
      education,
      videoIntroUrl,
      socialLinks,
    },
  });

  revalidatePath("/admin");
  revalidatePath("/specialists");
  return { success: true };
}

/** Админ правит любого специалиста по userId профиля */
export async function updateSpecialistAdminAction(formData: FormData) {
  const session = await requireAdminSession();
  if (session.user.role !== "ADMIN") {
    return { success: false, error: "Только администратор" };
  }

  const userId = String(formData.get("userId") ?? "").trim();
  if (!userId) {
    return { success: false, error: "Не указан специалист" };
  }

  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const phone = String(formData.get("phone") ?? "").trim() || null;
  const bio = String(formData.get("bio") ?? "").trim();
  const education = String(formData.get("education") ?? "").trim();
  const specializationsRaw = String(formData.get("specializations") ?? "");
  const specializations = specializationsRaw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const videoIntroUrl = String(formData.get("videoIntroUrl") ?? "").trim() || null;
  const rating = Number(formData.get("rating") ?? 0);
  const telegram = String(formData.get("telegram") ?? "").trim();
  const instagram = String(formData.get("instagram") ?? "").trim();
  const avatarFile = formData.get("avatar");

  if (!name || !email || !bio || !education) {
    return { success: false, error: "Заполните имя, email, «о себе» и образование" };
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { success: false, error: "Некорректный email" };
  }

  const socialLinks: Record<string, string> = {};
  if (telegram) socialLinks.telegram = telegram;
  if (instagram) socialLinks.instagram = instagram;

  const profile = await prisma.specialistProfile.findUnique({
    where: { userId },
    include: { user: { select: { email: true, avatarUrl: true } } },
  });
  if (!profile) {
    return { success: false, error: "Профиль специалиста не найден" };
  }

  if (email !== profile.user.email) {
    const taken = await prisma.user.findUnique({ where: { email } });
    if (taken && taken.id !== userId) {
      return { success: false, error: "Этот email уже занят другим пользователем" };
    }
  }

  let avatarUrl = profile.user.avatarUrl;
  if (avatarFile instanceof File && avatarFile.size > 0) {
    const { saveAvatarUpload } = await import("@/lib/uploads");
    const uploaded = await saveAvatarUpload(avatarFile, userId);
    if (!uploaded.ok) {
      return { success: false, error: uploaded.error };
    }
    avatarUrl = uploaded.url;
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: { name, email, phone, avatarUrl },
    }),
    prisma.specialistProfile.update({
      where: { userId },
      data: {
        bio,
        education,
        specializations:
          specializations.length > 0 ? specializations : profile.specializations,
        videoIntroUrl,
        socialLinks,
        rating: Number.isFinite(rating) ? Math.min(5, Math.max(0, rating)) : profile.rating,
      },
    }),
  ]);

  revalidatePath("/admin");
  revalidatePath("/specialists");
  revalidatePath(`/specialists/${profile.slug}`);
  revalidatePath("/");
  return { success: true };
}

export async function updateAppointmentStatusAction(
  appointmentId: string,
  status: AppointmentStatus
) {
  const session = await requireAdminSession();

  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },
  });

  if (!appointment) throw new Error("NOT_FOUND");

  if (
    session.user.role === "SPECIALIST" &&
    appointment.specialistId !== session.user.id
  ) {
    throw new Error("FORBIDDEN");
  }

  await prisma.appointment.update({
    where: { id: appointmentId },
    data: { status },
  });

  revalidatePath("/admin");
  return { success: true };
}

export async function saveArticleAction(formData: FormData) {
  const session = await requireAdminSession();
  const authorId = await getSpecialistUserId(session.user.id, session.user.role);

  const id = String(formData.get("id") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const content = String(formData.get("content") ?? "").trim();
  const published = formData.get("published") === "on";
  const videoPodcastUrl =
    String(formData.get("videoPodcastUrl") ?? "").trim() || null;

  if (!title || !content) {
    return { success: false, error: "Заполните заголовок и текст" };
  }

  const slugBase = slugify(title) || "article";
  const slug = id
    ? undefined
    : `${slugBase}-${Date.now().toString(36)}`;

  if (id) {
    const existing = await prisma.article.findUnique({ where: { id } });
    if (!existing) return { success: false, error: "Статья не найдена" };
    if (
      session.user.role === "SPECIALIST" &&
      existing.authorId !== session.user.id
    ) {
      return { success: false, error: "Нет доступа" };
    }

    await prisma.article.update({
      where: { id },
      data: { title, content, published, videoPodcastUrl },
    });
  } else {
    await prisma.article.create({
      data: {
        title,
        content,
        published,
        videoPodcastUrl,
        slug: slug!,
        authorId,
      },
    });
  }

  revalidatePath("/admin");
  return { success: true };
}

export async function deleteArticleAction(articleId: string) {
  const session = await requireAdminSession();

  const article = await prisma.article.findUnique({
    where: { id: articleId },
  });

  if (!article) return { success: false, error: "Статья не найдена" };

  if (
    session.user.role === "SPECIALIST" &&
    article.authorId !== session.user.id
  ) {
    return { success: false, error: "Нет доступа" };
  }

  await prisma.article.delete({ where: { id: articleId } });
  revalidatePath("/admin");
  return { success: true };
}
