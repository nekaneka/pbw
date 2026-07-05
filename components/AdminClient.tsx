"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { APPOINTMENT_TYPES, DEFAULT_LOCATION, type Appointment } from "@/lib/types";
import { formatDate, formatRange } from "@/lib/format";

type Feedback = { ok: boolean; message: string } | null;
type View = "loading" | "login" | "dashboard";

const STATUS_LABEL: Record<string, string> = {
  open: "Offen",
  booked: "Gebucht",
  cancelled: "Storniert",
};

/**
 * Admin dashboard on /admin – password protected.
 * The session is an HttpOnly cookie set by /api/admin/login; all admin
 * API routes verify it server-side, the UI only reacts to 401s.
 */
export default function AdminClient() {
  const [view, setView] = useState<View>("loading");
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/appointments?scope=all", { cache: "no-store" });
      if (res.status === 401) {
        setView("login");
        return;
      }
      if (!res.ok) throw new Error();
      setAppointments((await res.json()) as Appointment[]);
      setView("dashboard");
    } catch {
      setFeedback({ ok: false, message: "Termine konnten nicht geladen werden." });
      setView("dashboard");
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  /* ---------------- Login ---------------- */

  async function onLogin(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    setBusy(true);
    setLoginError(null);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: data.get("password") }),
      });
      const json = await res.json();
      if (!res.ok) {
        setLoginError(json.error ?? "Anmeldung fehlgeschlagen.");
      } else {
        setView("loading");
        void load();
      }
    } catch {
      setLoginError("Anmeldung fehlgeschlagen. Bitte versuchen Sie es erneut.");
    } finally {
      setBusy(false);
    }
  }

  async function onLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    setAppointments([]);
    setFeedback(null);
    setView("login");
  }

  /* ---------------- Slot management ---------------- */

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

    setBusy(true);
    setFeedback(null);
    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          start_time: new Date(`${date}T${start}`).toISOString(),
          end_time: new Date(`${date}T${end}`).toISOString(),
          appointment_type: data.get("type"),
          location: data.get("location"),
        }),
      });
      const json = await res.json();
      if (res.status === 401) {
        setView("login");
      } else if (!res.ok) {
        setFeedback({ ok: false, message: json.error ?? "Termin konnte nicht angelegt werden." });
      } else {
        setFeedback({ ok: true, message: "Verfügbarkeit wurde angelegt." });
        form.reset();
        void load();
      }
    } catch {
      setFeedback({ ok: false, message: "Termin konnte nicht angelegt werden." });
    } finally {
      setBusy(false);
    }
  }

  async function onDelete(a: Appointment) {
    const when = `${formatDate(a.start_time)}, ${formatRange(a.start_time, a.end_time)}`;
    if (!window.confirm(`Termin am ${when} wirklich löschen?`)) return;
    try {
      const res = await fetch(`/api/appointments/${a.id}`, { method: "DELETE" });
      const json = await res.json();
      if (res.status === 401) {
        setView("login");
      } else if (!res.ok) {
        setFeedback({ ok: false, message: json.error ?? "Löschen fehlgeschlagen." });
      } else {
        setFeedback({ ok: true, message: "Termin wurde gelöscht." });
        void load();
      }
    } catch {
      setFeedback({ ok: false, message: "Löschen fehlgeschlagen." });
    }
  }

  async function onCancel(a: Appointment) {
    if (!window.confirm("Termin wirklich stornieren? Kundendaten bleiben im Adminbereich erhalten.")) {
      return;
    }
    try {
      const res = await fetch(`/api/appointments/${a.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "cancelled" }),
      });
      const json = await res.json();
      if (res.status === 401) {
        setView("login");
      } else if (!res.ok) {
        setFeedback({ ok: false, message: json.error ?? "Stornierung fehlgeschlagen." });
      } else {
        setFeedback({ ok: true, message: "Termin wurde storniert. Der Kunde sieht ihn nicht mehr." });
        void load();
      }
    } catch {
      setFeedback({ ok: false, message: "Stornierung fehlgeschlagen." });
    }
  }

  /* ---------------- Views ---------------- */

  if (view === "loading") {
    return (
      <section className="section">
        <div className="container">
          <p role="status">Wird geladen …</p>
        </div>
      </section>
    );
  }

  if (view === "login") {
    return (
      <section className="section" aria-labelledby="login-heading">
        <div className="container">
          <span className="eyebrow">Adminbereich</span>
          <h1 id="login-heading">Anmeldung</h1>
          <p className="section-intro">
            Dieser Bereich ist nur für den Anbieter bestimmt.
          </p>
          <form className="panel form-grid login-panel" onSubmit={onLogin} noValidate>
            <div className="form-field">
              <label htmlFor="admin-password">Passwort</label>
              <input
                id="admin-password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
              />
            </div>
            <div>
              <button type="submit" className="btn btn--primary" disabled={busy}>
                {busy ? "Wird geprüft …" : "Anmelden"}
              </button>
            </div>
            <div aria-live="polite">
              {loginError && (
                <p className="alert alert--error" role="alert">
                  {loginError}
                </p>
              )}
            </div>
          </form>
        </div>
      </section>
    );
  }

  const openCount = appointments.filter((a) => a.status === "open").length;
  const bookedCount = appointments.filter((a) => a.status === "booked").length;

  return (
    <section aria-labelledby="admin-heading" className="section">
      <div className="container">
        <div className="admin-toolbar">
          <div>
            <span className="eyebrow">Adminbereich</span>
            <h1 id="admin-heading">Verfügbarkeiten verwalten</h1>
          </div>
          <button type="button" className="btn btn--secondary" onClick={onLogout}>
            Abmelden
          </button>
        </div>
        <p className="section-intro">
          {openCount} offene und {bookedCount} gebuchte Termine.
        </p>

        <h2>Neue Verfügbarkeit anlegen</h2>
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
            <button type="submit" className="btn btn--primary" disabled={busy}>
              {busy ? "Wird angelegt …" : "Verfügbarkeit anlegen"}
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

        <h2 style={{ marginTop: "2rem" }}>Alle Termine</h2>
        {appointments.length === 0 ? (
          <p>Noch keine Termine angelegt.</p>
        ) : (
          <div className="table-wrap">
            <table className="admin-table">
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
                      {a.customer_name ? (
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
                      {a.status === "booked" ? (
                        new Date(a.start_time) > new Date() ? (
                          <button
                            type="button"
                            className="btn btn--danger"
                            onClick={() => onCancel(a)}
                          >
                            Stornieren
                          </button>
                        ) : (
                          "–"
                        )
                      ) : (
                        <button
                          type="button"
                          className="btn btn--danger"
                          onClick={() => onDelete(a)}
                        >
                          Löschen
                        </button>
                      )}
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
