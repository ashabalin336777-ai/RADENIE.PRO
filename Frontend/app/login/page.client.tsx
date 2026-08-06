"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const LOGIN_TIMEOUT_MS = 15_000;

export default function LoginPage() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/admin";
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  return (
    <div className="flex min-h-[70vh] items-center justify-center bg-background px-4 py-16">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Вход для специалистов</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            className="space-y-4"
            onSubmit={async (event) => {
              event.preventDefault();
              const formData = new FormData(event.currentTarget);
              const email = String(formData.get("email") ?? "").trim();
              const password = String(formData.get("password") ?? "");

              setIsPending(true);
              setError(null);

              const controller = new AbortController();
              const timer = setTimeout(
                () => controller.abort(),
                LOGIN_TIMEOUT_MS
              );

              try {
                const res = await fetch("/api/auth/password-login", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ email, password }),
                  signal: controller.signal,
                });

                const data = (await res.json()) as {
                  ok?: boolean;
                  message?: string;
                  code?: string;
                };

                if (!res.ok || !data.ok) {
                  setError(
                    data.message ||
                      `Ошибка входа${data.code ? ` (${data.code})` : ""}`
                  );
                  return;
                }

                window.location.assign(callbackUrl);
              } catch (err) {
                if (err instanceof DOMException && err.name === "AbortError") {
                  setError(
                    "Таймаут входа. Проверьте NEXTAUTH_URL=http://radenie.pro и логи frontend."
                  );
                } else {
                  setError(
                    err instanceof Error ? err.message : "Не удалось войти"
                  );
                }
              } finally {
                clearTimeout(timer);
                setIsPending(false);
              }
            }}
          >
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input
                name="email"
                type="email"
                placeholder="admin@radenie.pro"
                autoComplete="username"
                defaultValue="admin@radenie.pro"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Пароль</label>
              <Input
                name="password"
                type="password"
                autoComplete="current-password"
                required
              />
            </div>
            {error && <p className="text-sm text-accent">{error}</p>}
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? "Вход…" : "Войти"}
            </Button>
            <p className="text-xs text-muted-foreground">
              После seed: admin@radenie.pro / Radene2024!
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
