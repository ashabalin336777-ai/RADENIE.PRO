"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const LOGIN_TIMEOUT_MS = 15_000;

async function signInWithTimeout(
  email: string,
  password: string,
  callbackUrl: string
) {
  const resultPromise = signIn("credentials", {
    email,
    password,
    redirect: false,
    callbackUrl,
  });

  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => {
      reject(
        new Error(
          "Таймаут входа. Проверьте NEXTAUTH_URL в .env (для VPS: http://radenie.pro) и перезапустите frontend."
        )
      );
    }, LOGIN_TIMEOUT_MS);
  });

  return Promise.race([resultPromise, timeoutPromise]);
}

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

              try {
                const result = await signInWithTimeout(
                  email,
                  password,
                  callbackUrl
                );

                if (result?.error) {
                  const code = result.error;
                  setError(
                    code === "CredentialsSignin"
                      ? "Неверный email или пароль"
                      : `Ошибка входа: ${code}. На VPS в .env должно быть NEXTAUTH_URL=http://radenie.pro`
                  );
                  return;
                }

                window.location.assign(callbackUrl);
              } catch (err) {
                setError(
                  err instanceof Error ? err.message : "Не удалось войти"
                );
              } finally {
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
              После seed: admin@radenie.pro или elena@radenie.pro / Radene2024!
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
