"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Loader2, Send, Sparkles } from "lucide-react";

import {
  runAiRouter,
  type ChatMessage,
  type AiRouterResult,
} from "@/app/actions/ai-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const INITIAL_MESSAGE: ChatMessage = {
  role: "assistant",
  content:
    "Здравствуйте! Я помогу подобрать специалиста центра РАДЕНИЕ. Расскажите, с чем вы хотели бы поработать?",
};

export function AiRouterChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState("");
  const [result, setResult] = useState<AiRouterResult | null>(null);
  const [isPending, startTransition] = useTransition();

  function sendMessage() {
    const trimmed = input.trim();
    if (!trimmed || isPending || result?.done) return;

    const nextMessages: ChatMessage[] = [
      ...messages,
      { role: "user", content: trimmed },
    ];

    setMessages(nextMessages);
    setInput("");

    const conversationForServer = nextMessages.filter(
      (message) => message !== INITIAL_MESSAGE
    );

    startTransition(async () => {
      const response = await runAiRouter(conversationForServer);

      setMessages((current) => [
        ...current,
        { role: "assistant", content: response.reply },
      ]);
      setResult(response);
    });
  }

  return (
    <Card className="mx-auto max-w-3xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-brand" />
          AI-помощник по подбору специалиста
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="max-h-[420px] space-y-4 overflow-y-auto rounded-2xl bg-background p-4">
          {messages.map((message, index) => (
            <div
              key={`${message.role}-${index}`}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  message.role === "user"
                    ? "bg-brand text-brand-foreground"
                    : "bg-white text-foreground shadow-soft ring-1 ring-border"
                }`}
              >
                {message.content}
              </div>
            </div>
          ))}
          {isPending && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Думаю...
            </div>
          )}
        </div>

        {result?.done && result.recommendation && (
          <div className="space-y-3 rounded-2xl border border-brand/20 bg-brand/5 p-4">
            <p className="font-medium text-foreground">
              Рекомендуем: {result.recommendation.name}
            </p>
            <p className="text-sm text-muted-foreground">
              {result.recommendation.reason}
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              {result.recommendation.slug && (
                <Button variant="accent" asChild>
                  <Link href={`/specialists/${result.recommendation.slug}`}>
                    Перейти к профилю
                  </Link>
                </Button>
              )}
              <Button variant="outline" asChild>
                <Link href={`/specialists/${result.recommendation.slug}#booking`}>
                  Записаться
                </Link>
              </Button>
            </div>
          </div>
        )}

        {!result?.done && (
          <div className="flex gap-3">
            <textarea
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  sendMessage();
                }
              }}
              placeholder="Опишите ваш запрос..."
              rows={3}
              className="flex-1 resize-none rounded-2xl border border-border bg-white px-4 py-3 text-sm outline-none ring-brand/30 focus:ring-2"
              disabled={isPending}
            />
            <Button
              variant="default"
              size="icon"
              className="h-auto shrink-0 self-end"
              onClick={sendMessage}
              disabled={isPending || !input.trim()}
              aria-label="Отправить"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
