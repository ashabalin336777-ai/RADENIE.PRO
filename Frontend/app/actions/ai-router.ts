"use server";

import {
  createAiClient,
  formatAiError,
  resolveAiConfig,
} from "@/lib/ai-client";
import { prisma } from "@/lib/prisma";
import { getSpecialists } from "@/lib/queries/specialists";

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export type AiRouterResult = {
  done: boolean;
  reply: string;
  recommendation?: {
    specialistId: string;
    slug: string;
    name: string;
    reason: string;
    message: string;
  };
  sessionId?: string;
};

async function getDemoClientId(): Promise<string | null> {
  try {
    const client = await prisma.user.findUnique({
      where: { email: "client@example.com" },
      select: { id: true },
    });
    return client?.id ?? null;
  } catch {
    return null;
  }
}

function buildSystemPrompt(
  specialists: Awaited<ReturnType<typeof getSpecialists>>
) {
  const catalog = specialists
    .map(
      (item) =>
        `- id: ${item.id}, slug: ${item.slug}, name: ${item.name}, specializations: ${item.specializations.join(", ")}`
    )
    .join("\n");

  return `Ты — AI-помощник центра психологических услуг «РАДЕНИЕ».
Задай клиенту 2-3 уточняющих вопроса о его запросе, затем порекомендуй одного специалиста из списка.

Список специалистов:
${catalog}

Правила:
1. Будь тёплым, бережным и профессиональным.
2. Не ставь диагнозов и не давай медицинских советов.
3. После достаточного понимания запроса верни ТОЛЬКО JSON без markdown:
{"specialistId":"...","reason":"...","message":"..."}
4. specialistId — id из списка выше.
5. reason — почему этот специалист подходит (1-2 предложения).
6. message — сообщение клиенту с рекомендацией (2-3 предложения).
7. До финальной рекомендации отвечай обычным текстом с вопросами.`;
}

function tryParseRecommendation(content: string) {
  const trimmed = content.trim();
  const jsonMatch = trimmed.match(/\{[\s\S]*\}/);
  if (!jsonMatch) return null;

  try {
    const parsed = JSON.parse(jsonMatch[0]) as {
      specialistId?: string;
      reason?: string;
      message?: string;
    };

    if (parsed.specialistId && parsed.reason && parsed.message) {
      return parsed as {
        specialistId: string;
        reason: string;
        message: string;
      };
    }
  } catch {
    return null;
  }

  return null;
}

export async function runAiRouter(
  messages: ChatMessage[]
): Promise<AiRouterResult> {
  const specialists = await getSpecialists();
  const aiConfig = resolveAiConfig();

  if (!aiConfig) {
    return {
      done: false,
      reply:
        "AI-помощник недоступен: укажите VSELLM_API_KEY или OPENAI_API_KEY в файле .env",
    };
  }

  if (specialists.length === 0) {
    return {
      done: false,
      reply: "Список специалистов пуст. Попробуйте позже.",
    };
  }

  const openai = createAiClient(aiConfig);

  try {
    const completion = await openai.chat.completions.create({
      model: aiConfig.model,
      temperature: 0.4,
      messages: [
        { role: "system", content: buildSystemPrompt(specialists) },
        ...messages.map((message) => ({
          role: message.role,
          content: message.content,
        })),
      ],
    });

    const content = completion.choices[0]?.message?.content?.trim() ?? "";
    const recommendation = tryParseRecommendation(content);

    if (recommendation) {
      const specialist = specialists.find(
        (item) =>
          item.id === recommendation.specialistId ||
          item.slug === recommendation.specialistId
      );

      const transcript = JSON.stringify([
        ...messages,
        { role: "assistant", content },
      ]);

      let sessionId: string | undefined;
      const clientId = await getDemoClientId();

      if (clientId && specialist) {
        try {
          const session = await prisma.aiChatSession.create({
            data: {
              clientId,
              specialistId: specialist.id,
              transcript,
            },
          });
          sessionId = session.id;
        } catch {
          // optional when DB offline
        }
      }

      return {
        done: true,
        reply: recommendation.message,
        recommendation: {
          specialistId: specialist?.id ?? recommendation.specialistId,
          slug: specialist?.slug ?? "",
          name: specialist?.name ?? "Специалист",
          reason: recommendation.reason,
          message: recommendation.message,
        },
        sessionId,
      };
    }

    return {
      done: false,
      reply: content || "Расскажите подробнее, с чем вы хотели бы поработать?",
    };
  } catch (error) {
    console.error("AI router error:", error);
    return {
      done: false,
      reply: formatAiError(error, aiConfig),
    };
  }
}
