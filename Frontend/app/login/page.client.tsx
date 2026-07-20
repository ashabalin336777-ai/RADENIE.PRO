"use client";

import { signIn } from "next-auth/react";
import { useState, useTransition } from "react";
import { useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/admin";
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex min-h-[70vh] items-center justify-center bg-background px-4 py-16">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Вход для специалистов</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            className="space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              const formData = new FormData(event.currentTarget);
              const email = String(formData.get("email") ?? "");
              const password = String(formData.get("password") ?? "");

              startTransition(async () => {
                setError(null);
                const result = await signIn("credentials", {
                  email,
                  password,
                  redirect: false,
                  callbackUrl,
                });

                if (result?.error) {
                  setError("Неверный email или пароль");
                  return;
                }

                window.location.href = callbackUrl;
              });
            }}
          >
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input
                name="email"
                type="email"
                placeholder="elena@radenie.pro"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Пароль</label>
              <Input name="password" type="password" required />
            </div>
            {error && <p className="text-sm text-accent">{error}</p>}
            <Button type="submit" className="w-full" disabled={isPending}>
              Войти
            </Button>
            <p className="text-xs text-muted-foreground">
              Тестовый доступ после seed: elena@radenie.pro / Radene2024!
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
