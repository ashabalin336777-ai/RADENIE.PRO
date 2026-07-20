"use client";

import { useState, useTransition } from "react";
import { signOut } from "next-auth/react";
import {
  Bot,
  Calendar,
  FileText,
  LogOut,
  User,
} from "lucide-react";

import {
  deleteArticleAction,
  saveArticleAction,
  updateAppointmentStatusAction,
  updateProfileAction,
} from "@/app/actions/admin";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import type { AdminContext } from "@/lib/queries/admin";

type AdminDashboardProps = {
  data: AdminContext;
};

const TAB_ITEMS = [
  { id: "profile", label: "Профиль", icon: User },
  { id: "calendar", label: "Календарь", icon: Calendar },
  { id: "ai", label: "AI-Диалоги", icon: Bot },
  { id: "articles", label: "Статьи", icon: FileText },
];

function parseTranscript(raw: string) {
  try {
    const parsed = JSON.parse(raw) as { role: string; content: string }[];
    if (Array.isArray(parsed)) return parsed;
  } catch {
    return [{ role: "system", content: raw }];
  }
  return [{ role: "system", content: raw }];
}

export function AdminDashboard({ data }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState("profile");
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const profile = data.profile;
  const socialLinks = (profile?.socialLinks ?? {}) as Record<string, string>;

  function showSuccess(text = "Сохранено") {
    setMessage(text);
    setTimeout(() => setMessage(null), 3000);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Админ-панель</h1>
          <p className="text-sm text-muted-foreground">
            {data.user.name} · {data.user.role === "ADMIN" ? "Администратор" : "Специалист"}
          </p>
        </div>
        <Button variant="outline" onClick={() => signOut({ callbackUrl: "/" })}>
          <LogOut className="mr-2 h-4 w-4" />
          Выйти
        </Button>
      </div>

      {message && (
        <div className="rounded-2xl bg-brand/10 px-4 py-3 text-sm text-brand">
          {message}
        </div>
      )}

      <Tabs
        tabs={TAB_ITEMS.map(({ id, label }) => ({ id, label }))}
        activeTab={activeTab}
        onChange={setActiveTab}
      />

      {activeTab === "profile" && (
        profile ? (
        <Card>
          <CardHeader>
            <CardTitle>Редактирование профиля</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              action={(formData) => {
                startTransition(async () => {
                  await updateProfileAction(formData);
                  showSuccess("Профиль обновлён");
                });
              }}
              className="space-y-4"
            >
              <div className="space-y-2">
                <label className="text-sm font-medium">О себе</label>
                <Textarea name="bio" defaultValue={profile.bio} required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Образование</label>
                <Textarea
                  name="education"
                  defaultValue={profile.education}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Видео-визитка (URL embed)</label>
                <Input
                  name="videoIntroUrl"
                  defaultValue={profile.videoIntroUrl ?? ""}
                  placeholder="https://www.youtube.com/embed/..."
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Telegram</label>
                  <Input
                    name="telegram"
                    defaultValue={socialLinks.telegram ?? ""}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Instagram</label>
                  <Input
                    name="instagram"
                    defaultValue={socialLinks.instagram ?? ""}
                  />
                </div>
              </div>
              <Button type="submit" disabled={isPending}>
                Сохранить профиль
              </Button>
            </form>
          </CardContent>
        </Card>
        ) : (
          <Card>
            <CardContent className="p-6 text-sm text-muted-foreground">
              У аккаунта администратора нет профиля специалиста. Доступны
              вкладки календаря, AI-диалогов и статей по всему центру.
            </CardContent>
          </Card>
        )
      )}

      {activeTab === "calendar" && (
        <Card>
          <CardHeader>
            <CardTitle>Календарь приёмов</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.appointments.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Записей пока нет. Клиенты смогут записываться после запуска
                публичного календаря.
              </p>
            ) : (
              data.appointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="rounded-2xl border border-border p-4"
                >
                  <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="font-medium">{appointment.client.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(appointment.startTime).toLocaleString("ru-RU")} —{" "}
                        {new Date(appointment.endTime).toLocaleTimeString("ru-RU", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Статус: {appointment.status}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={isPending}
                        onClick={() =>
                          startTransition(async () => {
                            await updateAppointmentStatusAction(
                              appointment.id,
                              "CONFIRMED"
                            );
                            showSuccess("Запись подтверждена");
                          })
                        }
                      >
                        Подтвердить
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        disabled={isPending}
                        onClick={() =>
                          startTransition(async () => {
                            await updateAppointmentStatusAction(
                              appointment.id,
                              "CANCELED"
                            );
                            showSuccess("Запись отменена");
                          })
                        }
                      >
                        Отменить
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === "ai" && (
        <Card>
          <CardHeader>
            <CardTitle>AI-диалоги клиентов</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.aiSessions.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Диалоги AI-помощника пока не сохранены.
              </p>
            ) : (
              data.aiSessions.map((session) => {
                const messages = parseTranscript(session.transcript);
                return (
                  <div
                    key={session.id}
                    className="rounded-2xl border border-border p-4 space-y-3"
                  >
                    <div className="flex flex-col gap-1 text-sm">
                      <p className="font-medium">{session.client.name}</p>
                      <p className="text-muted-foreground">
                        {new Date(session.createdAt).toLocaleString("ru-RU")}
                      </p>
                    </div>
                    <div className="space-y-2 rounded-2xl bg-background p-3">
                      {messages.map((item, index) => (
                        <p key={index} className="text-sm leading-relaxed">
                          <span className="font-medium capitalize text-brand">
                            {item.role}:{" "}
                          </span>
                          {item.content}
                        </p>
                      ))}
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === "articles" && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Новая статья</CardTitle>
            </CardHeader>
            <CardContent>
              <form
                action={(formData) => {
                  startTransition(async () => {
                    const result = await saveArticleAction(formData);
                    if (result.success) showSuccess("Статья сохранена");
                    else setMessage(result.error ?? "Ошибка");
                  });
                }}
                className="space-y-4"
              >
                <Input name="title" placeholder="Заголовок" required />
                <Textarea name="content" placeholder="Текст статьи" required />
                <Input
                  name="videoPodcastUrl"
                  placeholder="URL видео-подкаста (необязательно)"
                />
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" name="published" className="rounded" />
                  Опубликовать сразу
                </label>
                <Button type="submit" disabled={isPending}>
                  Создать статью
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Мои статьи</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {data.articles.length === 0 ? (
                <p className="text-sm text-muted-foreground">Статей пока нет.</p>
              ) : (
                data.articles.map((article) => (
                  <div
                    key={article.id}
                    className="rounded-2xl border border-border p-4"
                  >
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div>
                        <p className="font-medium">{article.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {article.published ? "Опубликовано" : "Черновик"} · /blog/
                          {article.slug}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        disabled={isPending}
                        onClick={() =>
                          startTransition(async () => {
                            await deleteArticleAction(article.id);
                            showSuccess("Статья удалена");
                          })
                        }
                      >
                        Удалить
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
