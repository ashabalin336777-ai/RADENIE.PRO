import { prisma } from "@/lib/prisma";
import { specialistsPreview } from "@/lib/data/specialists-preview";

export type SpecialistListItem = {
  id: string;
  slug: string;
  name: string;
  specializations: string[];
  rating: number;
  phone: string | null;
  avatarUrl: string | null;
};

export type SpecialistDetail = SpecialistListItem & {
  bio: string;
  education: string;
  videoIntroUrl: string | null;
  socialLinks: Record<string, string> | null;
  email: string;
  articles: {
    id: string;
    title: string;
    slug: string;
    published: boolean;
  }[];
};

function previewToList(): SpecialistListItem[] {
  return specialistsPreview.map((item) => ({
    id: item.id,
    slug: item.slug,
    name: item.name,
    specializations: [item.specialization],
    rating: item.rating,
    phone: null,
    avatarUrl: null,
  }));
}

export async function getSpecializations(): Promise<string[]> {
  try {
    const rows = await prisma.specialization.findMany({
      orderBy: { name: "asc" },
      select: { name: true },
    });
    if (rows.length > 0) {
      return rows.map((row) => row.name);
    }
  } catch {
    // DB unavailable — fallback below
  }

  return specialistsPreview.map((item) => item.specialization);
}

export async function getSpecialists(
  specialization?: string
): Promise<SpecialistListItem[]> {
  try {
    const profiles = await prisma.specialistProfile.findMany({
      include: {
        user: {
          select: {
            name: true,
            phone: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: { rating: "desc" },
    });

    if (profiles.length > 0) {
      const mapped = profiles.map((profile) => ({
        id: profile.id,
        slug: profile.slug,
        name: profile.user.name,
        specializations: profile.specializations,
        rating: profile.rating,
        phone: profile.user.phone,
        avatarUrl: profile.user.avatarUrl,
      }));

      if (!specialization) return mapped;

      return mapped.filter((item) =>
        item.specializations.some((spec) => spec === specialization)
      );
    }
  } catch {
    // DB unavailable — fallback below
  }

  const fallback = previewToList();
  if (!specialization) return fallback;

  return fallback.filter((item) =>
    item.specializations.some((spec) => spec === specialization)
  );
}

export async function getSpecialistBySlug(
  slug: string
): Promise<SpecialistDetail | null> {
  try {
    const profile = await prisma.specialistProfile.findUnique({
      where: { slug },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            phone: true,
            avatarUrl: true,
            articles: {
              where: { published: true },
              select: {
                id: true,
                title: true,
                slug: true,
                published: true,
              },
              orderBy: { createdAt: "desc" },
              take: 5,
            },
          },
        },
      },
    });

    if (profile) {
      return {
        id: profile.id,
        slug: profile.slug,
        name: profile.user.name,
        email: profile.user.email,
        phone: profile.user.phone,
        avatarUrl: profile.user.avatarUrl,
        specializations: profile.specializations,
        rating: profile.rating,
        bio: profile.bio,
        education: profile.education,
        videoIntroUrl: profile.videoIntroUrl,
        socialLinks: profile.socialLinks as Record<string, string> | null,
        articles: profile.user.articles,
      };
    }
  } catch {
    // DB unavailable — fallback below
  }

  const preview = specialistsPreview.find((item) => item.slug === slug);
  if (!preview) return null;

  return {
    id: preview.id,
    slug: preview.slug,
    name: preview.name,
    email: `${preview.slug.replace("-", ".")}@radenie.pro`,
    phone: null,
    avatarUrl: null,
    specializations: [preview.specialization],
    rating: preview.rating,
    bio: "Специалист центра РАДЕНИЕ. Подробное описание будет доступно после подключения базы данных.",
    education: preview.experience,
    videoIntroUrl: null,
    socialLinks: null,
    articles: [],
  };
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}
