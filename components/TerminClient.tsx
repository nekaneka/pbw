"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import {
  APPOINTMENT_TYPES,
  BOOKING_REASONS,
  DEFAULT_LOCATION,
  type Appointment,
  type PublicSlot,
} from "@/lib/types";

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

const dateFmt = new Intl.DateTimeFormat("de-AT", {
  weekday: "long",
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  timeZone: "Europe/Vienna",
});
const timeFmt = new Intl.DateTimeFormat("de-AT", {
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Europe/Vienna",
});

function formatDate(iso: string): string {
  return dateFmt.format(new Date(iso));
}
function formatRange(startIso: string, endIso: string): string {
  return `${timeFmt.format(new Date(startIso))}–${timeFmt.format(new Date(endIso))} Uhr`;
}

type Feedback = { ok: boolean; message: string } | null;

/* ------------------------------------------------------------------ */
/* Customer booking area                                               */
/* ------------------------------------------------------------------ */

function BookingArea({ reloadKey, onChanged }: { reloadKey: number; onChanged: () => void }) {
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
  }, [load, reloadKey]);

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
          onChanged();
        }
      } else {
        setFeedback({
          ok: true,
          message:
            "Vielen Dank! Ihr Termin wurde verbindlich gebucht. Sie erhalten in Kürze eine Bestätigung per E-Mail.",
        });
        form.reset();
        setSelectedId("");
        onChanged();
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

/* ------------------------------------------------------------------ */
/* Admin area                                                          */
/* ------------------------------------------------------------------ */

const STATUS_LABEL: Record<string, string> = {
  open: "Offen",
  booked: "Gebucht",
  cancelled: "Storniert",
};

function AdminArea({ reloadKey, onChanged }: { reloadKey: number; onChanged: () => void }) {
  const [appointments, setAppointments] = useState<Appointment[] | null>(null);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/appointments?scope=all", { cache: "no-store" });
      if (!res.ok) throw new Error();
      setAppointments((await res.json()) as Appointment[]);
    } catch {
      setAppointments([]);
      setFeedback({ ok: false, message: "Termine konnten nicht geladen werden." });
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load, reloadKey]);

  async function onCreate(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const date = String(data.get("date") ?? "");
    const start = String(data.get("start") ?? "");
    const end = String(data.get("end") ?? "");

    if (!date || !start || !end) {
      setFeedback({ ok: false, message: "Bitte Datum, Beginn und Ende angeben." });
      return;
    }

    setSaving(true);
    setFeedback(null);
    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          // Local Vienna wall-clock time, converted to ISO by the Date ctor.
          start_time: new Date(`${date}T${start}`).toISOString(),
          end_time: new Date(`${date}T${end}`).toISOString(),
          appointment_type: data.get("type"),
          location: data.get("location"),
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setFeedback({ ok: false, message: json.error ?? "Termin konnte nicht angelegt werden." });
      } else {
        setFeedback({ ok: true, message: "Verfügbarkeit wurde angelegt." });
        form.reset();
        onChanged();
      }
    } catch {
      setFeedback({ ok: false, message: "Termin konnte nicht angelegt werden." });
    } finally {
      setSaving(false);
    }
  }

  async function onDelete(a: Appointment) {
    const when = `${formatDate(a.start_time)}, ${formatRange(a.start_time, a.end_time)}`;
    if (!window.confirm(`Termin am ${when} wirklich löschen?`)) return;
    try {
      const res = await fetch(`/api/appointments/${a.id}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok) {
        setFeedback({ ok: false, message: json.error ?? "Löschen fehlgeschlagen." });
      } else {
        setFeedback({ ok: true, message: "Termin wurde gelöscht." });
        onChanged();
      }
    } catch {
      setFeedback({ ok: false, message: "Löschen fehlgeschlagen." });
    }
  }

  return (
    <section aria-labelledby="admin-heading" className="section section--grey">
      <div className="container">
        <span className="eyebrow">Adminbereich</span>
        <h2 id="admin-heading">Verfügbarkeiten verwalten</h2>
        <p className="admin-note" role="note">
          Hinweis: Dieser Bereich ist nur für den Anbieter bestimmt und wird vor dem
          Go-live mit einem Login (Supabase Auth) geschützt.
        </p>

        <h3>Neue Verfügbarkeit anlegen</h3>
        <form className="panel form-grid form-grid--2col" onSubmit={onCreate} noValidate>
          <div className="form-field">
            <label htmlFor="admin-date">Datum *</label>
            <input id="admin-date" name="date" type="date" required />
          </div>
          <div className="form-field">
            <label htmlFor="admin-type">Terminart *</label>
            <select id="admin-type" name="type" required defaultValue={APPOINTMENT_TYPES[0]}>
              {APPOINTMENT_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <div className="form-field">
            <label htmlFor="admin-start">Beginn *</label>
            <input id="admin-start" name="start" type="time" required />
          </div>
          <div className="form-field">
            <label htmlFor="admin-end">Ende *</label>
            <input id="admin-end" name="end" type="time" required />
          </div>
          <div className="form-field form-field--full">
            <label htmlFor="admin-location">Ort</label>
            <input
              id="admin-location"
              name="location"
              type="text"
              defaultValue={DEFAULT_LOCATION}
            />
          </div>
          <div className="form-field--full">
            <button type="submit" className="btn btn--primary" disabled={saving}>
              {saving ? "Wird angelegt …" : "Verfügbarkeit anlegen"}
            </button>
          </div>
        </form>

        <div aria-live="polite">
          {feedback && (
            <p className={`alert ${feedback.ok ? "alert--success" : "alert--error"}`} role="status">
              {feedback.message}
            </p>
          )}
        </div>

        <h3 style={{ marginTop: "2rem" }}>Alle Termine</h3>
        {appointments === null ? (
          <p role="status">Termine werden geladen …</p>
        ) : appointments.length === 0 ? (
          <p>Noch keine Termine angelegt.</p>
        ) : (
          <div className="table-wrap">
            <table className="admin-table">
              <caption className="sr-only" style={{ position: "absolute", left: "-9999px" }}>
                Alle Termine mit Status und Kundendaten
              </caption>
              <thead>
                <tr>
                  <th scope="col">Termin</th>
                  <th scope="col">Art / Ort</th>
                  <th scope="col">Status</th>
                  <th scope="col">Kunde</th>
                  <th scope="col">Aktion</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((a) => (
                  <tr key={a.id}>
                    <td>
                      <strong>{formatDate(a.start_time)}</strong>
                      <br />
                      {formatRange(a.start_time, a.end_time)}
                    </td>
                    <td>
                      {a.appointment_type}
                      <br />
                      {a.location}
                    </td>
                    <td>
                      <span className={`status-badge status-badge--${a.status}`}>
                        {STATUS_LABEL[a.status] ?? a.status}
                      </span>
                    </td>
                    <td className="customer-cell">
                      {a.status === "booked" ? (
                        <>
                          <strong>{a.customer_name}</strong>
                          {a.customer_email}
                          <br />
                          {a.customer_phone}
                          <br />
                          {a.customer_reason}
                          {a.customer_message ? (
                            <>
                              <br />
                              <em>„{a.customer_message}“</em>
                            </>
                          ) : null}
                        </>
                      ) : (
                        "–"
                      )}
                    </td>
                    <td>
                      <button
                        type="button"
                        className="btn btn--danger"
                        onClick={() => onDelete(a)}
                      >
                        Löschen
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Page wrapper – keeps both areas in sync                             */
/* ------------------------------------------------------------------ */

export default function TerminClient() {
  const [reloadKey, setReloadKey] = useState(0);
  const refresh = useCallback(() => setReloadKey((k) => k + 1), []);

  return (
    <>
      <BookingArea reloadKey={reloadKey} onChanged={refresh} />
      <AdminArea reloadKey={reloadKey} onChanged={refresh} />
    </>
  );
}
