"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";

import { loginWithPassword } from "@/app/actions/login";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/admin";
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  return (
    <div className="flex min-h-[70vh] items-center justify-center bg-background px-4 py-16">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Вход в кабинет</CardTitle>
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
                const result = await loginWithPassword(email, password);
                if (!result.ok) {
                  setError(`${result.message} [${result.code}]`);
                  return;
                }
                window.location.assign(callbackUrl);
              } catch (err) {
                setError(
                  err instanceof Error
                    ? err.message
                    : "Не удалось войти (server action)"
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
                placeholder="email@radenie.pro"
                autoComplete="username"
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
              Администратор: admin@radenie.pro · Специалисты входят со своими
              личными паролями, которые выдаёт администратор.
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
