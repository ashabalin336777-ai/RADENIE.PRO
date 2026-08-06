import OpenAI from "openai";

export type AiClientConfig = {
  apiKey: string;
  baseURL: string;
  model: string;
  provider: "vsellm" | "openai";
};

function isOpenAiDirectKey(key: string): boolean {
  return key.startsWith("sk-proj-") || key.startsWith("sk-org-");
}

export function resolveAiConfig(): AiClientConfig | null {
  const vsellmKey = process.env.VSELLM_API_KEY?.trim();
  const openaiKey = process.env.OPENAI_API_KEY?.trim();
  const vsellmBase =
    process.env.VSELLM_BASE_URL?.trim() || "https://api.vsellm.ru/v1";
  const vsellmModel =
    process.env.VSELLM_MODEL?.trim() || "openai/gpt-4o-mini";

  // Прямой ключ OpenAI (sk-proj- / sk-org-) — только api.openai.com
  // даже если его по ошибке положили в VSELLM_API_KEY
  const directOpenAiKey =
    (openaiKey && isOpenAiDirectKey(openaiKey) && openaiKey) ||
    (vsellmKey && isOpenAiDirectKey(vsellmKey) && vsellmKey) ||
    null;

  if (directOpenAiKey) {
    return {
      apiKey: directOpenAiKey,
      baseURL: "https://api.openai.com/v1",
      model: "gpt-4o-mini",
      provider: "openai",
    };
  }

  // Ключ агрегатора VseLLM
  if (vsellmKey) {
    return {
      apiKey: vsellmKey,
      baseURL: vsellmBase,
      model: vsellmModel,
      provider: "vsellm",
    };
  }

  // OPENAI_API_KEY без sk-proj — считаем ключом VseLLM
  if (openaiKey) {
    return {
      apiKey: openaiKey,
      baseURL: vsellmBase,
      model: vsellmModel,
      provider: "vsellm",
    };
  }

  return null;
}

export function createAiClient(config: AiClientConfig): OpenAI {
  return new OpenAI({
    apiKey: config.apiKey,
    baseURL: config.baseURL,
  });
}

export function formatAiError(
  error: unknown,
  config: AiClientConfig | null
): string {
  const err = error as {
    status?: number;
    message?: string;
    error?: { message?: string };
  };
  const detail = err.error?.message || err.message || "Unknown error";

  if (err.status === 401) {
    if (config?.provider === "vsellm") {
      return (
        "Неверный ключ VseLLM (401). Нужен ключ с vsellm.ru в VSELLM_API_KEY. " +
        "Ключ OpenAI (sk-proj-...) сюда не подходит — укажите его в OPENAI_API_KEY и очистите VSELLM_API_KEY."
      );
    }
    return "Неверный OPENAI_API_KEY (401). Проверьте ключ на platform.openai.com";
  }

  if (err.status === 404) {
    return "Модель не найдена. Для VseLLM укажите VSELLM_MODEL=openai/gpt-4o-mini";
  }

  if (err.status === 429) {
    return "Превышен лимит запросов к AI. Попробуйте позже.";
  }

  return `Ошибка AI (${config?.provider ?? "unknown"}): ${detail}`;
}
