"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { BOOKING_REASONS, type PublicSlot } from "@/lib/types";
import { formatDate, formatRange } from "@/lib/format";

type Feedback = { ok: boolean; message: string } | null;

/* ---------- calendar helpers (all dates in Vienna wall-clock time) ---------- */

const dayKeyFmt = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Europe/Vienna",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});
const monthTitleFmt = new Intl.DateTimeFormat("de-AT", {
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});
const dayTitleFmt = new Intl.DateTimeFormat("de-AT", {
  weekday: "long",
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  timeZone: "UTC",
});

const WEEKDAYS = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];

/** "2026-07-09" for a slot's start time, in Vienna local time. */
function dayKeyOf(iso: string): string {
  return dayKeyFmt.format(new Date(iso));
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

interface MonthCursor {
  year: number;
  month: number; // 0-based
}

function monthIndex(c: MonthCursor): number {
  return c.year * 12 + c.month;
}

function cursorOfKey(key: string): MonthCursor {
  return { year: Number(key.slice(0, 4)), month: Number(key.slice(5, 7)) - 1 };
}

function monthTitle(c: MonthCursor): string {
  return monthTitleFmt.format(new Date(Date.UTC(c.year, c.month, 1)));
}

function dayTitle(key: string): string {
  const c = cursorOfKey(key);
  return dayTitleFmt.format(new Date(Date.UTC(c.year, c.month, Number(key.slice(8, 10)))));
}

/* --------------------------------------------------------------------- */

/**
 * Customer booking page: month calendar (days with free slots are
 * selectable), the chosen day's slots as radio cards, then the booking
 * form. The API only ever returns open, future slots.
 */
export default function TerminClient() {
  const [slots, setSlots] = useState<PublicSlot[] | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [cursor, setCursor] = useState<MonthCursor>(() => cursorOfKey(dayKeyFmt.format(new Date())));
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string>("");
  const [sending, setSending] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const jumpedToFirstSlot = useRef(false);

  const load = useCallback(async () => {
    setLoadError(false);
    try {
      const res = await fetch("/api/appointments", { cache: "no-store" });
      if (!res.ok) throw new Error();
      const data = (await res.json()) as PublicSlot[];
      setSlots(data);
      setSelectedId((prev) => (data.some((s) => s.id === prev) ? prev : ""));
      // On first load, open the calendar at the month of the earliest slot.
      if (!jumpedToFirstSlot.current && data.length > 0) {
        jumpedToFirstSlot.current = true;
        setCursor(cursorOfKey(dayKeyOf(data[0].start_time)));
      }
    } catch {
      setSlots([]);
      setLoadError(true);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  /** Open slots grouped by Vienna calendar day; API returns them sorted. */
  const slotsByDay = useMemo(() => {
    const map = new Map<string, PublicSlot[]>();
    for (const slot of slots ?? []) {
      const key = dayKeyOf(slot.start_time);
      const list = map.get(key);
      if (list) list.push(slot);
      else map.set(key, [slot]);
    }
    return map;
  }, [slots]);

  // If the selected day lost its last slot (e.g. after booking), clear it.
  useEffect(() => {
    if (selectedDay && slots !== null && !slotsByDay.has(selectedDay)) {
      setSelectedDay(null);
      setSelectedId("");
    }
  }, [selectedDay, slots, slotsByDay]);

  const todayCursor = cursorOfKey(dayKeyFmt.format(new Date()));
  const prevDisabled = monthIndex(cursor) <= monthIndex(todayCursor);

  const monthPrefix = `${cursor.year}-${pad(cursor.month + 1)}`;
  const monthHasSlots = [...slotsByDay.keys()].some((k) => k.startsWith(monthPrefix));
  const nextSlotKeyAfterMonth = [...slotsByDay.keys()].find(
    (k) => monthIndex(cursorOfKey(k)) > monthIndex(cursor)
  );

  const daySlots = selectedDay ? (slotsByDay.get(selectedDay) ?? []) : [];

  function selectDay(key: string) {
    setSelectedDay(key);
    setSelectedId("");
    setFeedback(null);
  }

  function moveMonth(delta: number) {
    setCursor((c) => {
      const idx = monthIndex(c) + delta;
      return { year: Math.floor(idx / 12), month: ((idx % 12) + 12) % 12 };
    });
  }

  /* ---------- calendar grid cells for the cursor month ---------- */
  const firstWeekday = (new Date(Date.UTC(cursor.year, cursor.month, 1)).getUTCDay() + 6) % 7;
  const daysInMonth = new Date(Date.UTC(cursor.year, cursor.month + 1, 0)).getUTCDate();

  /* ---------- booking submit ---------- */
  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!selectedId) {
      setFeedback({ ok: false, message: "Bitte wählen Sie zuerst einen freien Termin aus." });
      return;
    }
    const form = e.currentTarget;
    const data = new FormData(form);
    setSending(true);
    setFeedback(null);
    try {
      const res = await fetch(`/api/appointments/${selectedId}/book`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_name: data.get("name"),
          customer_email: data.get("email"),
          customer_phone: data.get("phone"),
          customer_reason: data.get("reason"),
          customer_message: data.get("message"),
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setFeedback({ ok: false, message: json.error ?? "Buchung fehlgeschlagen." });
        if (res.status === 409 || res.status === 404) {
          setSelectedId("");
          void load();
        }
      } else {
        setFeedback({
          ok: true,
          message:
            "Vielen Dank! Ihr Termin wurde verbindlich gebucht. Sie erhalten in Kürze eine Bestätigung per E-Mail.",
        });
        form.reset();
        setSelectedId("");
        void load();
      }
    } catch {
      setFeedback({ ok: false, message: "Buchung fehlgeschlagen. Bitte versuchen Sie es erneut." });
    } finally {
      setSending(false);
    }
  }

  return (
    <section aria-labelledby="booking-heading" className="section">
      <div className="container">
        <span className="eyebrow">Terminbuchung</span>
        <h1 id="booking-heading">Freien Termin auswählen &amp; buchen</h1>
        <p className="section-intro">
          Wählen Sie im Kalender einen Tag mit freien Terminen, dann die passende Uhrzeit,
          und übermitteln Sie uns Ihre Kontaktdaten. Sie erhalten anschließend eine
          Bestätigung per E-Mail.
        </p>

        {slots === null ? (
          <p role="status">Termine werden geladen …</p>
        ) : loadError ? (
          <p className="alert alert--error" role="alert">
            Termine konnten nicht geladen werden. Bitte laden Sie die Seite neu.
          </p>
        ) : slots.length === 0 ? (
          <p className="alert alert--error" role="status">
            Derzeit sind leider keine freien Termine verfügbar. Bitte kontaktieren Sie uns
            über das Kontaktformular – wir finden gemeinsam einen Termin.
          </p>
        ) : (
          <>
            {/* ---------------- calendar ---------------- */}
            <div className="cal" role="group" aria-label="Kalender zur Terminauswahl">
              <div className="cal__head">
                <button
                  type="button"
                  className="cal__nav"
                  onClick={() => moveMonth(-1)}
                  disabled={prevDisabled}
                  aria-label="Voriger Monat"
                >
                  ‹
                </button>
                <p className="cal__month" aria-live="polite">
                  {monthTitle(cursor)}
                </p>
                <button
                  type="button"
                  className="cal__nav"
                  onClick={() => moveMonth(1)}
                  aria-label="Nächster Monat"
                >
                  ›
                </button>
              </div>

              <div className="cal__weekdays" aria-hidden="true">
                {WEEKDAYS.map((w) => (
                  <span key={w}>{w}</span>
                ))}
              </div>

              <div className="cal__grid">
                {Array.from({ length: firstWeekday }, (_, i) => (
                  <span key={`pad-${i}`} aria-hidden="true" />
                ))}
                {Array.from({ length: daysInMonth }, (_, i) => {
                  const day = i + 1;
                  const key = `${monthPrefix}-${pad(day)}`;
                  const count = slotsByDay.get(key)?.length ?? 0;
                  if (count === 0) {
                    return (
                      <span key={key} className="cal__day" aria-hidden="true">
                        {day}
                      </span>
                    );
                  }
                  return (
                    <button
                      key={key}
                      type="button"
                      className="cal__day cal__day--available"
                      aria-pressed={selectedDay === key}
                      aria-label={`${dayTitle(key)} – ${count} ${count === 1 ? "freier Termin" : "freie Termine"}`}
                      onClick={() => selectDay(key)}
                    >
                      {day}
                      <span className="cal__dot" aria-hidden="true" />
                    </button>
                  );
                })}
              </div>

              {!monthHasSlots && (
                <p className="cal__empty">
                  In diesem Monat sind keine freien Termine verfügbar.
                  {nextSlotKeyAfterMonth && (
                    <>
                      {" "}
                      <button
                        type="button"
                        className="cal__jump"
                        onClick={() => {
                          setCursor(cursorOfKey(nextSlotKeyAfterMonth));
                          selectDay(nextSlotKeyAfterMonth);
                        }}
                      >
                        Zum nächsten freien Termin ({dayTitle(nextSlotKeyAfterMonth)})
                      </button>
                    </>
                  )}
                </p>
              )}
            </div>

            {/* ---------------- slots of the selected day ---------------- */}
            <div aria-live="polite">
              {selectedDay === null ? (
                <p className="form-hint" style={{ marginTop: "1.5rem" }}>
                  Tage mit freien Terminen sind im Kalender markiert – bitte wählen Sie
                  einen Tag aus.
                </p>
              ) : (
                <form onSubmit={onSubmit} noValidate>
                  <h2 style={{ marginTop: "2rem" }}>
                    {daySlots.length > 0 ? formatDate(daySlots[0].start_time) : dayTitle(selectedDay)}
                  </h2>
                  <fieldset style={{ border: 0, padding: 0, margin: 0 }}>
                    <legend className="form-hint" style={{ marginBottom: "0.75rem" }}>
                      {daySlots.length} {daySlots.length === 1 ? "freier Termin" : "freie Termine"} an
                      diesem Tag – bitte einen auswählen:
                    </legend>
                    <ul className="slot-list">
                      {daySlots.map((slot) => (
                        <li key={slot.id} className="slot-option">
                          <input
                            type="radio"
                            name="slot"
                            id={`slot-${slot.id}`}
                            value={slot.id}
                            checked={selectedId === slot.id}
                            onChange={() => setSelectedId(slot.id)}
                          />
                          <label htmlFor={`slot-${slot.id}`}>
                            <span className="slot-option__date">
                              {formatRange(slot.start_time, slot.end_time)}
                            </span>
                            <span className="slot-option__meta">{slot.appointment_type}</span>
                            <span className="slot-option__meta">{slot.location}</span>
                          </label>
                        </li>
                      ))}
                    </ul>
                  </fieldset>

                  <div className="panel form-grid form-grid--2col">
                    <div className="form-field">
                      <label htmlFor="booking-name">Name *</label>
                      <input id="booking-name" name="name" type="text" autoComplete="name" required />
                    </div>
                    <div className="form-field">
                      <label htmlFor="booking-email">E-Mail *</label>
                      <input id="booking-email" name="email" type="email" autoComplete="email" required />
                    </div>
                    <div className="form-field">
                      <label htmlFor="booking-phone">Telefon *</label>
                      <input id="booking-phone" name="phone" type="tel" autoComplete="tel" required />
                    </div>
                    <div className="form-field">
                      <label htmlFor="booking-reason">Anliegen *</label>
                      <select id="booking-reason" name="reason" required defaultValue="">
                        <option value="" disabled>
                          Bitte auswählen …
                        </option>
                        {BOOKING_REASONS.map((r) => (
                          <option key={r} value={r}>
                            {r}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="form-field form-field--full">
                      <label htmlFor="booking-message">Nachricht (optional)</label>
                      <textarea id="booking-message" name="message" rows={4} />
                    </div>
                    <div className="form-field--full">
                      <button type="submit" className="btn btn--primary" disabled={sending}>
                        {sending ? "Wird gebucht …" : "Termin verbindlich buchen"}
                      </button>
                    </div>
                  </div>
                </form>
              )}
            </div>
          </>
        )}

        <div aria-live="polite">
          {feedback && (
            <p className={`alert ${feedback.ok ? "alert--success" : "alert--error"}`} role="status">
              {feedback.message}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
