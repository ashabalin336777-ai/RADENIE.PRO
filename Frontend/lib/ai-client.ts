import OpenAI from "openai";

export type AiClientConfig = {
  apiKey: string;
  baseURL: string;
  model: string;
  provider: "vsellm" | "openai";
};

export function resolveAiConfig(): AiClientConfig | null {
  const vsellmKey = process.env.VSELLM_API_KEY?.trim();
  const openaiKey = process.env.OPENAI_API_KEY?.trim();
  const vsellmBase =
    process.env.VSELLM_BASE_URL?.trim() || "https://api.vsellm.ru/v1";

  if (vsellmKey) {
    return {
      apiKey: vsellmKey,
      baseURL: vsellmBase,
      model: process.env.VSELLM_MODEL?.trim() || "openai/gpt-4o-mini",
      provider: "vsellm",
    };
  }

  if (!openaiKey) {
    return null;
  }

  // Ключи OpenAI (sk-proj-...) не работают на VseLLM — только на api.openai.com
  if (openaiKey.startsWith("sk-proj-") || openaiKey.startsWith("sk-org-")) {
    return {
      apiKey: openaiKey,
      baseURL: "https://api.openai.com/v1",
      model: "gpt-4o-mini",
      provider: "openai",
    };
  }

  // Ключи VseLLM (sk-...) — через агрегатор
  return {
    apiKey: openaiKey,
    baseURL: vsellmBase,
    model: process.env.VSELLM_MODEL?.trim() || "openai/gpt-4o-mini",
    provider: "vsellm",
  };
}

export function createAiClient(config: AiClientConfig): OpenAI {
  return new OpenAI({
    apiKey: config.apiKey,
    baseURL: config.baseURL,
  });
}

export function formatAiError(error: unknown, config: AiClientConfig | null): string {
  const err = error as { status?: number; message?: string; error?: { message?: string } };
  const detail = err.error?.message || err.message || "Unknown error";

  if (err.status === 401) {
    if (config?.provider === "vsellm") {
      return "Неверный ключ VseLLM. Получите API-ключ на vsellm.ru и укажите его в VSELLM_API_KEY в .env";
    }
    return "Неверный OPENAI_API_KEY. Проверьте ключ в .env";
  }

  if (err.status === 404) {
    return "Модель не найдена. Проверьте VSELLM_MODEL в .env (например openai/gpt-4o-mini)";
  }

  if (err.status === 429) {
    return "Превышен лимит запросов к AI. Попробуйте позже.";
  }

  return `Ошибка AI (${config?.provider ?? "unknown"}): ${detail}`;
}
