import type { Metadata } from "next";

import { AiRouterChat } from "@/components/AiRouterChat";

export const metadata: Metadata = {
  title: "AI-помощник",
  description: "Подбор специалиста центра РАДЕНИЕ с помощью AI",
};

export default function AiAssistantPage() {
  return (
    <div className="bg-background px-4 py-16 md:px-6">
      <div className="mx-auto max-w-4xl space-y-8">
        <div className="space-y-3 text-center">
          <h1 className="text-4xl font-semibold text-foreground">AI-помощник</h1>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            Ответьте на несколько вопросов — мы подберём специалиста под ваш
            запрос и сохраним диалог для дальнейшей работы.
          </p>
        </div>
        <AiRouterChat />
      </div>
    </div>
  );
}
