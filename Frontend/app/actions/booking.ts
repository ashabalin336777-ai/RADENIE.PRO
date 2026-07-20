"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";

const SLOT_HOURS = [10, 11, 12, 14, 15, 16, 17];
const SESSION_MS = 60 * 60 * 1000;

export async function getAvailableSlots(
  specialistSlug: string,
  dateIso: string
): Promise<{ slots: string[]; error?: string }> {
  try {
    const profile = await prisma.specialistProfile.findUnique({
      where: { slug: specialistSlug },
      select: { userId: true },
    });

    if (!profile) {
      return { slots: [], error: "Специалист не найден" };
    }

    const dayStart = new Date(dateIso);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(dayStart);
    dayEnd.setDate(dayEnd.getDate() + 1);

    const booked = await prisma.appointment.findMany({
      where: {
        specialistId: profile.userId,
        startTime: { gte: dayStart, lt: dayEnd },
        status: { not: "CANCELED" },
      },
      select: { startTime: true },
    });

    const bookedHours = new Set(
      booked.map((item) => item.startTime.getHours())
    );

    const slots = SLOT_HOURS.filter((hour) => !bookedHours.has(hour)).map(
      (hour) => `${String(hour).padStart(2, "0")}:00`
    );

    return { slots };
  } catch {
    return {
      slots: SLOT_HOURS.map((h) => `${String(h).padStart(2, "0")}:00`),
    };
  }
}

export async function createBookingAction(formData: FormData) {
  const specialistSlug = String(formData.get("specialistSlug") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const phone = String(formData.get("phone") ?? "").trim();
  const date = String(formData.get("date") ?? "");
  const time = String(formData.get("time") ?? "");

  if (!specialistSlug || !name || !email || !date || !time) {
    return { success: false, error: "Заполните все обязательные поля" };
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { success: false, error: "Укажите корректный email" };
  }

  try {
    const profile = await prisma.specialistProfile.findUnique({
      where: { slug: specialistSlug },
      include: { user: { select: { id: true, name: true } } },
    });

    if (!profile) {
      return { success: false, error: "Специалист не найден" };
    }

    const [hours, minutes] = time.split(":").map(Number);
    const startTime = new Date(date);
    startTime.setHours(hours, minutes, 0, 0);

    if (startTime.getTime() <= Date.now()) {
      return { success: false, error: "Выберите дату и время в будущем" };
    }

    const endTime = new Date(startTime.getTime() + SESSION_MS);

    const conflict = await prisma.appointment.findFirst({
      where: {
        specialistId: profile.userId,
        startTime,
        status: { not: "CANCELED" },
      },
    });

    if (conflict) {
      return { success: false, error: "Это время уже занято. Выберите другой слот" };
    }

    const passwordHash = await bcrypt.hash(
      `guest-${Date.now()}-${Math.random()}`,
      10
    );

    const client = await prisma.user.upsert({
      where: { email },
      update: { name, phone: phone || undefined },
      create: {
        name,
        email,
        phone: phone || undefined,
        password: passwordHash,
        role: "CLIENT",
      },
    });

    await prisma.appointment.create({
      data: {
        clientId: client.id,
        specialistId: profile.userId,
        startTime,
        endTime,
        status: "PENDING",
      },
    });

    revalidatePath(`/specialists/${specialistSlug}`);
    revalidatePath("/admin");

    return {
      success: true,
      message: `Заявка отправлена! ${profile.user.name} свяжется с вами для подтверждения записи на ${startTime.toLocaleString("ru-RU")}.`,
    };
  } catch (error) {
    console.error("Booking error:", error);
    return {
      success: false,
      error: "Не удалось создать запись. Проверьте подключение к базе данных.",
    };
  }
}
