"use client";

import { useEffect, useState, useTransition } from "react";
import { CalendarDays, CheckCircle2 } from "lucide-react";

import {
  createBookingAction,
  getAvailableSlots,
} from "@/app/actions/booking";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type BookingFormProps = {
  specialistSlug: string;
  specialistName: string;
};

function defaultDate(): string {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  return date.toISOString().slice(0, 10);
}

export function BookingForm({ specialistSlug, specialistName }: BookingFormProps) {
  const [date, setDate] = useState(defaultDate);
  const [time, setTime] = useState("");
  const [slots, setSlots] = useState<string[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [loadingSlots, setLoadingSlots] = useState(false);

  useEffect(() => {
    if (!date) return;
    setLoadingSlots(true);
    setTime("");
    getAvailableSlots(specialistSlug, date).then((result) => {
      setSlots(result.slots);
      if (result.error) setError(result.error);
      setLoadingSlots(false);
    });
  }, [date, specialistSlug]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Запись на консультацию</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Выберите удобное время для сессии с {specialistName}
        </p>
      </div>

      {message ? (
        <div className="flex items-start gap-3 rounded-2xl bg-brand/10 p-4 text-sm text-brand">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
          <p>{message}</p>
        </div>
      ) : (
        <form
          className="space-y-5"
          action={(formData) => {
            startTransition(async () => {
              setError(null);
              formData.set("specialistSlug", specialistSlug);
              formData.set("date", date);
              formData.set("time", time);
              const result = await createBookingAction(formData);
              if (result.success) {
                setMessage(result.message ?? "Запись создана!");
              } else {
                setError(result.error ?? "Ошибка записи");
              }
            });
          }}
        >
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="booking-date">
              Дата
            </label>
            <Input
              id="booking-date"
              type="date"
              value={date}
              min={defaultDate()}
              onChange={(event) => setDate(event.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Время</label>
            {loadingSlots ? (
              <p className="text-sm text-muted-foreground">Загрузка слотов...</p>
            ) : slots.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                На эту дату свободных слотов нет. Выберите другую дату.
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {slots.map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => setTime(slot)}
                    className={`rounded-2xl px-4 py-2 text-sm transition-colors ${
                      time === slot
                        ? "bg-brand text-brand-foreground shadow-soft"
                        : "bg-white ring-1 ring-border hover:bg-brand/5"
                    }`}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="booking-name">
                Ваше имя *
              </label>
              <Input id="booking-name" name="name" required placeholder="Иван" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="booking-phone">
                Телефон
              </label>
              <Input
                id="booking-phone"
                name="phone"
                type="tel"
                placeholder="+7 (900) 000-00-00"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="booking-email">
              Email *
            </label>
            <Input
              id="booking-email"
              name="email"
              type="email"
              required
              placeholder="you@example.com"
            />
          </div>

          {error && (
            <p className="text-sm text-accent">{error}</p>
          )}

          <Button
            type="submit"
            variant="accent"
            size="lg"
            disabled={isPending || !time || slots.length === 0}
            className="w-full sm:w-auto"
          >
            <CalendarDays className="mr-2 h-4 w-4" />
            {isPending ? "Отправка..." : "Записаться"}
          </Button>
        </form>
      )}
    </div>
  );
}
