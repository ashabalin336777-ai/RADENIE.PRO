"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  Bot,
  Calendar,
  FileText,
  LogOut,
  Users,
  User,
} from "lucide-react";

import {
  deleteArticleAction,
  saveArticleAction,
  setSpecialistPasswordAction,
  updateAppointmentStatusAction,
  updateProfileAction,
  updateSpecialistAdminAction,
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
  const router = useRouter();
  const isAdmin = data.user.role === "ADMIN";
  const defaultTab = isAdmin ? "specialists" : "profile";
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [selectedUserId, setSelectedUserId] = useState<string | null>(
    data.specialists[0]?.userId ?? null
  );

  const profile = data.profile;
  const socialLinks = (profile?.socialLinks ?? {}) as Record<string, string>;

  const selected = useMemo(
    () => data.specialists.find((s) => s.userId === selectedUserId) ?? null,
    [data.specialists, selectedUserId]
  );
  const selectedSocial = (selected?.socialLinks ?? {}) as Record<string, string>;

  const tabItems = isAdmin
    ? [
        { id: "specialists", label: "Специалисты" },
        { id: "calendar", label: "Календарь" },
        { id: "ai", label: "AI-Диалоги" },
        { id: "articles", label: "Статьи" },
      ]
    : [
        { id: "profile", label: "Профиль" },
        { id: "calendar", label: "Календарь" },
        { id: "ai", label: "AI-Диалоги" },
        { id: "articles", label: "Статьи" },
      ];

  function showSuccess(text = "Сохранено") {
    setMessage(text);
    setTimeout(() => setMessage(null), 3000);
  }

  function refresh() {
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold">
            {isAdmin ? "Админ-панель" : "Личный кабинет"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {data.user.name} ·{" "}
            {isAdmin
              ? "Администратор · полные права"
              : "Специалист · ваши данные и записи"}
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

      <Tabs tabs={tabItems} activeTab={activeTab} onChange={setActiveTab} />

      {activeTab === "specialists" && isAdmin && (
        <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Users className="h-4 w-4" />
                Список
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {data.specialists.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Специалистов пока нет. Запустите seed.
                </p>
              ) : (
                data.specialists.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelectedUserId(item.userId)}
                    className={`w-full rounded-xl px-3 py-2 text-left text-sm transition-colors ${
                      selectedUserId === item.userId
                        ? "bg-brand text-brand-foreground"
                        : "hover:bg-muted"
                    }`}
                  >
                    <span className="font-medium">{item.user.name}</span>
                    <span className="mt-0.5 block text-xs opacity-80">
                      {item.user.email}
                    </span>
                  </button>
                ))
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>
                {selected
                  ? `Редактирование: ${selected.user.name}`
                  : "Выберите специалиста"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!selected ? (
                <p className="text-sm text-muted-foreground">
                  Выберите специалиста слева.
                </p>
              ) : (
                <form
                  key={selected.userId}
                  encType="multipart/form-data"
                  action={(formData) => {
                    startTransition(async () => {
                      const result = await updateSpecialistAdminAction(formData);
                      if (result.success) {
                        showSuccess("Данные специалиста сохранены");
                        refresh();
                      } else {
                        setMessage(result.error ?? "Ошибка сохранения");
                      }
                    });
                  }}
                  className="space-y-4"
                >
                  <input type="hidden" name="userId" value={selected.userId} />
                  <div className="flex items-center gap-4">
                    <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-brand/10 text-brand">
                      {selected.user.avatarUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={selected.user.avatarUrl}
                          alt={selected.user.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="text-xl font-semibold">
                          {selected.user.name
                            .split(" ")
                            .map((p) => p[0])
                            .join("")
                            .slice(0, 2)
                            .toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1 space-y-2">
                      <label className="text-sm font-medium">Фото с диска</label>
                      <Input
                        name="avatar"
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                      />
                      <p className="text-xs text-muted-foreground">
                        JPG / PNG / WEBP, до 3 МБ. Если файл не выбран — текущее
                        фото сохранится.
                      </p>
                    </div>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Имя</label>
                      <Input name="name" defaultValue={selected.user.name} required />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Телефон</label>
                      <Input
                        name="phone"
                        defaultValue={selected.user.phone ?? ""}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Email</label>
                    <Input
                      name="email"
                      type="email"
                      defaultValue={selected.user.email}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Специализации (через запятую)
                    </label>
                    <Input
                      name="specializations"
                      defaultValue={selected.specializations.join(", ")}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Рейтинг (0–5)</label>
                    <Input
                      name="rating"
                      type="number"
                      step="0.1"
                      min="0"
                      max="5"
                      defaultValue={selected.rating}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">О себе</label>
                    <Textarea name="bio" defaultValue={selected.bio} required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Образование</label>
                    <Textarea
                      name="education"
                      defaultValue={selected.education}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Видео-визитка (URL embed)
                    </label>
                    <Input
                      name="videoIntroUrl"
                      defaultValue={selected.videoIntroUrl ?? ""}
                      placeholder="https://www.youtube.com/embed/..."
                    />
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Telegram</label>
                      <Input
                        name="telegram"
                        defaultValue={selectedSocial.telegram ?? ""}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Instagram</label>
                      <Input
                        name="instagram"
                        defaultValue={selectedSocial.instagram ?? ""}
                      />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Публичная страница: /specialists/{selected.slug}
                  </p>
                  <Button type="submit" disabled={isPending}>
                    {isPending ? "Сохранение…" : "Сохранить данные"}
                  </Button>
                </form>
              )}

              {selected && (
                <form
                  className="mt-8 space-y-4 border-t border-border pt-6"
                  action={(formData) => {
                    startTransition(async () => {
                      const result = await setSpecialistPasswordAction(formData);
                      if (result.success) {
                        showSuccess(
                          `Пароль для ${result.name} (${result.email}) установлен. Сообщите его специалисту лично.`
                        );
                      } else {
                        setMessage(result.error ?? "Ошибка");
                      }
                    });
                  }}
                >
                  <h3 className="text-base font-semibold">
                    Личный пароль для входа в кабинет
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Специалист входит на /login со своим email и этим паролем.
                    Пароль в открытом виде потом не показывается — сохраните его
                    при выдаче.
                  </p>
                  <input type="hidden" name="userId" value={selected.userId} />
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Новый пароль</label>
                      <Input
                        name="password"
                        type="password"
                        autoComplete="new-password"
                        minLength={8}
                        required
                        placeholder="минимум 8 символов"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Повтор пароля</label>
                      <Input
                        name="passwordConfirm"
                        type="password"
                        autoComplete="new-password"
                        minLength={8}
                        required
                      />
                    </div>
                  </div>
                  <p className="rounded-xl bg-muted px-3 py-2 text-xs text-muted-foreground">
                    Логин специалиста: <strong>{selected.user.email}</strong>
                  </p>
                  <Button type="submit" variant="outline" disabled={isPending}>
                    Выдать / сменить пароль
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === "profile" && !isAdmin && (
        profile ? (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Мой профиль
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form
                  encType="multipart/form-data"
                  action={(formData) => {
                    startTransition(async () => {
                      const result = await updateProfileAction(formData);
                      if (result.success) {
                        showSuccess("Профиль обновлён");
                        refresh();
                      } else {
                        setMessage(result.error ?? "Ошибка");
                      }
                    });
                  }}
                  className="space-y-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-brand/10 text-brand">
                      {data.user.avatarUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={data.user.avatarUrl}
                          alt={data.user.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="text-xl font-semibold">
                          {data.user.name
                            .split(" ")
                            .map((p) => p[0])
                            .join("")
                            .slice(0, 2)
                            .toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1 space-y-2">
                      <label className="text-sm font-medium">Фото с диска</label>
                      <Input
                        name="avatar"
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                      />
                    </div>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Имя</label>
                      <Input name="name" defaultValue={data.user.name} required />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Телефон</label>
                      <Input
                        name="phone"
                        defaultValue={data.user.phone ?? ""}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Email для входа</label>
                    <Input value={data.user.email} disabled readOnly />
                    <p className="text-xs text-muted-foreground">
                      Смену email делает администратор.
                    </p>
                  </div>
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
                    <label className="text-sm font-medium">
                      Видео-визитка (URL embed)
                    </label>
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
                  <div className="space-y-3 rounded-2xl border border-border p-4">
                    <p className="text-sm font-medium">Сменить свой пароль</p>
                    <p className="text-xs text-muted-foreground">
                      Оставьте пустым, если менять пароль не нужно.
                    </p>
                    <div className="grid gap-4 md:grid-cols-2">
                      <Input
                        name="newPassword"
                        type="password"
                        autoComplete="new-password"
                        placeholder="Новый пароль"
                        minLength={8}
                      />
                      <Input
                        name="newPasswordConfirm"
                        type="password"
                        autoComplete="new-password"
                        placeholder="Повтор пароля"
                        minLength={8}
                      />
                    </div>
                  </div>
                  <Button type="submit" disabled={isPending}>
                    Сохранить профиль
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        ) : (
          <Card>
            <CardContent className="p-6 text-sm text-muted-foreground">
              Профиль специалиста не найден. Обратитесь к администратору.
            </CardContent>
          </Card>
        )
      )}

      {activeTab === "calendar" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Календарь приёмов
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.appointments.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Записей пока нет.
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
                      {isAdmin && (
                        <p className="text-sm text-muted-foreground">
                          Специалист: {appointment.specialist.name}
                        </p>
                      )}
                      <p className="text-sm text-muted-foreground">
                        {new Date(appointment.startTime).toLocaleString("ru-RU")} —{" "}
                        {new Date(appointment.endTime).toLocaleTimeString(
                          "ru-RU",
                          { hour: "2-digit", minute: "2-digit" }
                        )}
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
                            refresh();
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
                            refresh();
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
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-4 w-4" />
              AI-диалоги клиентов
            </CardTitle>
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
                    className="space-y-3 rounded-2xl border border-border p-4"
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
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Новая статья
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form
                action={(formData) => {
                  startTransition(async () => {
                    const result = await saveArticleAction(formData);
                    if (result.success) {
                      showSuccess("Статья сохранена");
                      refresh();
                    } else setMessage(result.error ?? "Ошибка");
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
              <CardTitle>Статьи</CardTitle>
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
                          {article.published ? "Опубликовано" : "Черновик"} ·
                          /blog/{article.slug}
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
                            refresh();
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
