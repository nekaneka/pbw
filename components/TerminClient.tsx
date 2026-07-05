"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { BOOKING_REASONS, type PublicSlot } from "@/lib/types";
import { formatDate, formatRange } from "@/lib/format";

type Feedback = { ok: boolean; message: string } | null;

/**
 * Customer booking area on /termin.
 * Shows only open, future slots (the API never returns booked ones).
 */
export default function TerminClient() {
  const [slots, setSlots] = useState<PublicSlot[] | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [selectedId, setSelectedId] = useState<string>("");
  const [sending, setSending] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);

  const load = useCallback(async () => {
    setLoadError(false);
    try {
      const res = await fetch("/api/appointments", { cache: "no-store" });
      if (!res.ok) throw new Error();
      const data = (await res.json()) as PublicSlot[];
      setSlots(data);
      setSelectedId((prev) => (data.some((s) => s.id === prev) ? prev : ""));
    } catch {
      setSlots([]);
      setLoadError(true);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

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
        // Slot may have been taken in the meantime – refresh the list.
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
          Wählen Sie einen der verfügbaren Termine aus und übermitteln Sie uns Ihre
          Kontaktdaten. Sie erhalten anschließend eine Bestätigung.
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
          <form onSubmit={onSubmit} noValidate>
            <fieldset style={{ border: 0, padding: 0, margin: 0 }}>
              <legend className="form-hint" style={{ marginBottom: "0.75rem" }}>
                Verfügbare Termine ({slots.length}) – bitte einen auswählen:
              </legend>
              <ul className="slot-list">
                {slots.map((slot) => (
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
                      <span className="slot-option__date">{formatDate(slot.start_time)}</span>
                      <span className="slot-option__meta">
                        {formatRange(slot.start_time, slot.end_time)} · {slot.appointment_type}
                      </span>
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
