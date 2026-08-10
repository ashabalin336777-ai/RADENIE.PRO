/**
 * Нормализует ссылку на видео в URL для iframe (YouTube, VK, Яндекс).
 * Обычные «поделиться»-ссылки превращаются в embed; уже готовый embed оставляем.
 */

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

function isYandexHost(host: string) {
  return (
    host === "yandex.ru" ||
    host === "www.yandex.ru" ||
    host === "yandex.com" ||
    host.endsWith(".yandex.ru") ||
    host.endsWith(".yandex.net") ||
    host === "yadi.sk" ||
    host === "www.yadi.sk" ||
    host === "disk.yandex.ru" ||
    host === "www.disk.yandex.ru" ||
    host === "disk.yandex.com"
  );
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

/** video-123_456 или video123_456 → oid + id */
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
  if (!parsed) {
    // clip / другие форматы — оставляем как есть, если уже похоже на embed
    return null;
  }

  const embed = new URL("https://vk.com/video_ext.php");
  embed.searchParams.set("oid", parsed.oid);
  embed.searchParams.set("id", parsed.id);
  const hash = url.searchParams.get("hash");
  if (hash) embed.searchParams.set("hash", hash);
  return embed.toString();
}

function yandexEmbed(url: URL): string | null {
  const host = hostnameOf(url);
  if (!isYandexHost(host)) return null;

  // Уже плеер
  if (
    host.includes("vh.yandex") ||
    host.includes("video.cloud.yandex") ||
    url.pathname.includes("/player/")
  ) {
    return url.toString();
  }

  // Яндекс Диск — публичная ссылка /i/ обычно открывается в iframe
  if (
    (host.includes("disk.yandex") || host === "yadi.sk" || host === "www.yadi.sk") &&
    (url.pathname.startsWith("/i/") || url.pathname.startsWith("/d/"))
  ) {
    if (host === "yadi.sk" || host === "www.yadi.sk") {
      return `https://disk.yandex.ru${url.pathname}${url.search}`;
    }
    return url.toString();
  }

  // video.yandex.ru / yandex.ru/video — пробуем id из query
  const filmId =
    url.searchParams.get("filmId") ||
    url.searchParams.get("video_id") ||
    url.searchParams.get("id");
  if (filmId && /^\d+$/.test(filmId)) {
    return `https://frontend.vh.yandex.ru/player/${filmId}`;
  }

  const pathPlayer = url.pathname.match(/\/player\/([^/?#]+)/);
  if (pathPlayer?.[1]) {
    return `https://frontend.vh.yandex.ru/player/${pathPlayer[1]}`;
  }

  // Уже похоже на встраиваемую ссылку — оставляем
  return url.toString();
}

/**
 * Возвращает URL для iframe или null, если строка пустая / невалидная.
 * Неизвестные https-ссылки сохраняются как есть (кастомный embed).
 */
export function normalizeVideoEmbedUrl(raw: string | null | undefined): string | null {
  const trimmed = String(raw ?? "").trim();
  if (!trimmed) return null;

  let url: URL;
  try {
    url = new URL(trimmed);
  } catch {
    return null;
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    return null;
  }

  return (
    youtubeEmbed(url) ??
    vkEmbed(url) ??
    yandexEmbed(url) ??
    trimmed
  );
}
