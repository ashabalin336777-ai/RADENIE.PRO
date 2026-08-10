/**
 * Нормализует ссылку на видео для показа на сайте.
 * YouTube / VK / Yandex Cloud Video → iframe.
 * Яндекс.Диск → только внешняя ссылка (iframe блокируется самим Диском).
 */

export type VideoIntroResolved =
  | { mode: "embed"; url: string }
  | { mode: "external"; url: string; reason: "yandex-disk" }
  | null;

const YOUTUBE_HOSTS = new Set([
  "youtube.com",
  "www.youtube.com",
  "m.youtube.com",
  "youtu.be",
  "www.youtu.be",
  "youtube-nocookie.com",
  "www.youtube-nocookie.com",
]);

const VK_HOSTS = new Set([
  "vk.com",
  "www.vk.com",
  "m.vk.com",
  "vk.ru",
  "www.vk.ru",
  "vkvideo.ru",
  "www.vkvideo.ru",
]);

function hostnameOf(url: URL) {
  return url.hostname.toLowerCase();
}

function isYandexDiskHost(host: string) {
  return (
    host === "yadi.sk" ||
    host === "www.yadi.sk" ||
    host === "disk.yandex.ru" ||
    host === "www.disk.yandex.ru" ||
    host === "disk.yandex.com" ||
    host === "www.disk.yandex.com"
  );
}

function isYandexPlayerHost(host: string) {
  return (
    host.includes("vh.yandex") ||
    host.includes("video.cloud.yandex") ||
    host === "runtime.video.cloud.yandex.net"
  );
}

/** Если вставили весь HTML iframe — достаём src */
function extractFromHtml(raw: string): string | null {
  const match = raw.match(/src\s*=\s*["']([^"']+)["']/i);
  return match?.[1]?.trim() || null;
}

function youtubeEmbed(url: URL): string | null {
  const host = hostnameOf(url);
  if (!YOUTUBE_HOSTS.has(host)) return null;

  let id: string | null = null;

  if (host === "youtu.be" || host === "www.youtu.be") {
    id = url.pathname.split("/").filter(Boolean)[0] ?? null;
  } else if (url.pathname.startsWith("/embed/")) {
    id = url.pathname.split("/")[2] ?? null;
  } else if (url.pathname.startsWith("/shorts/")) {
    id = url.pathname.split("/")[2] ?? null;
  } else if (url.pathname.startsWith("/live/")) {
    id = url.pathname.split("/")[2] ?? null;
  } else {
    id = url.searchParams.get("v");
  }

  if (!id) return null;
  id = id.replace(/[^a-zA-Z0-9_-]/g, "");
  if (!id) return null;

  return `https://www.youtube.com/embed/${id}`;
}

function parseVkVideoPath(pathname: string): { oid: string; id: string } | null {
  const match = pathname.match(/\/video(-?\d+)_(\d+)/i);
  if (!match) return null;
  return { oid: match[1], id: match[2] };
}

function vkEmbed(url: URL): string | null {
  const host = hostnameOf(url);
  if (!VK_HOSTS.has(host)) return null;

  if (url.pathname.includes("video_ext.php")) {
    const oid = url.searchParams.get("oid");
    const id = url.searchParams.get("id");
    if (!oid || !id) return url.toString();
    const embed = new URL("https://vk.com/video_ext.php");
    embed.searchParams.set("oid", oid);
    embed.searchParams.set("id", id);
    const hash = url.searchParams.get("hash");
    if (hash) embed.searchParams.set("hash", hash);
    return embed.toString();
  }

  const parsed = parseVkVideoPath(url.pathname);
  if (!parsed) return null;

  const embed = new URL("https://vk.com/video_ext.php");
  embed.searchParams.set("oid", parsed.oid);
  embed.searchParams.set("id", parsed.id);
  const hash = url.searchParams.get("hash");
  if (hash) embed.searchParams.set("hash", hash);
  return embed.toString();
}

function yandexCloudPlayerEmbed(url: URL): string | null {
  const host = hostnameOf(url);
  if (!isYandexPlayerHost(host) && !url.pathname.includes("/player/")) {
    return null;
  }
  if (isYandexDiskHost(host)) return null;
  if (isYandexPlayerHost(host) || url.pathname.includes("/player/")) {
    return url.toString();
  }
  return null;
}

/**
 * Разбор ссылки: embed / внешняя (Диск) / ошибка.
 */
export function resolveVideoIntro(
  raw: string | null | undefined
): VideoIntroResolved {
  let trimmed = String(raw ?? "").trim();
  if (!trimmed) return null;

  if (trimmed.includes("<iframe") || trimmed.includes("src=")) {
    const extracted = extractFromHtml(trimmed);
    if (extracted) trimmed = extracted;
  }

  let url: URL;
  try {
    url = new URL(trimmed);
  } catch {
    return null;
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    return null;
  }

  const host = hostnameOf(url);

  // Яндекс.Диск нельзя в iframe (X-Frame-Options / отказ соединения)
  if (isYandexDiskHost(host)) {
    const canonical =
      host === "yadi.sk" || host === "www.yadi.sk"
        ? `https://disk.yandex.ru${url.pathname}${url.search}`
        : url.toString();
    return { mode: "external", url: canonical, reason: "yandex-disk" };
  }

  const embed =
    youtubeEmbed(url) ?? vkEmbed(url) ?? yandexCloudPlayerEmbed(url);

  if (embed) return { mode: "embed", url: embed };

  // Неизвестный yandex.* без плеера — не пихаем в iframe
  if (host.includes("yandex") || host.endsWith("yadi.sk")) {
    return null;
  }

  // Прочий https — пробуем как embed (кастомный плеер)
  return { mode: "embed", url: trimmed };
}

/** URL для iframe или null (Диск / пусто / мусор → null для iframe) */
export function normalizeVideoEmbedUrl(
  raw: string | null | undefined
): string | null {
  const resolved = resolveVideoIntro(raw);
  if (!resolved || resolved.mode !== "embed") return null;
  return resolved.url;
}

/**
 * Что сохранить в БД. Диск сохраняем как публичную ссылку (откроется кнопкой).
 */
export function normalizeVideoIntroForStorage(
  raw: string | null | undefined
): { ok: true; url: string | null } | { ok: false; error: string } {
  const trimmed = String(raw ?? "").trim();
  if (!trimmed) return { ok: true, url: null };

  const resolved = resolveVideoIntro(trimmed);
  if (!resolved) {
    return {
      ok: false,
      error:
        "Некорректная ссылка. Нужен YouTube, VK, Yandex Cloud Video или публичная ссылка Яндекс.Диска",
    };
  }

  return { ok: true, url: resolved.url };
}

export const VIDEO_INTRO_HINT =
  "YouTube, VK или код плеера Yandex Cloud Video. Ссылка Яндекс.Диска откроется кнопкой (встроить в плеер Диск не даёт).";
