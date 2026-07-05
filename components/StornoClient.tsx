"use client";

import Link from "next/link";
import { useState } from "react";
import type { CancellationResult } from "@/lib/types";
import { formatDate, formatRange } from "@/lib/format";

type State =
  | { step: "confirm" }
  | { step: "busy" }
  | { step: "done"; appointment: CancellationResult }
  | { step: "error"; message: string };

/**
 * Customer cancellation via the secret token from the confirmation e-mail.
 * Shows no personal data – only the (already customer-known) slot details
 * after a successful cancellation.
 */
export default function StornoClient({ token }: { token: string }) {
  const [state, setState] = useState<State>({ step: "confirm" });

  async function cancel() {
    setState({ step: "busy" });
    try {
      const res = await fetch("/api/appointments/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const json = await res.json();
      if (!res.ok) {
        setState({
          step: "error",
          message: json.error ?? "Stornierung fehlgeschlagen. Bitte versuchen Sie es erneut.",
        });
      } else {
        setState({ step: "done", appointment: json.appointment as CancellationResult });
      }
    } catch {
      setState({
        step: "error",
        message: "Stornierung fehlgeschlagen. Bitte versuchen Sie es erneut.",
      });
    }
  }

  return (
    <section className="section" aria-labelledby="storno-heading">
      <div className="container" style={{ maxWidth: "44rem" }}>
        <span className="eyebrow">Terminstornierung</span>
        <h1 id="storno-heading">Termin stornieren</h1>

        {!token ? (
          <>
            <p className="alert alert--error" role="alert">
              Es wurde kein gültiger Stornierungslink aufgerufen. Bitte verwenden Sie den
              Link aus Ihrer Bestätigungs-E-Mail.
            </p>
            <p>
              Sie finden den Link nicht mehr? Kontaktieren Sie uns einfach über das{" "}
              <Link href="/#kontakt">Kontaktformular</Link> oder telefonisch – wir
              stornieren den Termin gerne für Sie.
            </p>
          </>
        ) : state.step === "done" ? (
          <div aria-live="polite">
            <p className="alert alert--success" role="status">
              Ihr Termin wurde storniert.
            </p>
            <div className="panel">
              <p style={{ margin: 0 }}>
                <strong>{formatDate(state.appointment.start_time)}</strong>
                <br />
                {formatRange(state.appointment.start_time, state.appointment.end_time)} ·{" "}
                {state.appointment.appointment_type}
                <br />
                {state.appointment.location}
              </p>
            </div>
            <p style={{ marginTop: "1.5rem" }}>
              Wenn Sie einen neuen Termin wünschen, können Sie jederzeit{" "}
              <Link href="/termin">einen freien Termin buchen</Link>.
            </p>
          </div>
        ) : state.step === "error" ? (
          <div aria-live="polite">
            <p className="alert alert--error" role="alert">
              {state.message}
            </p>
            <p>
              Bei Fragen erreichen Sie uns über das{" "}
              <Link href="/#kontakt">Kontaktformular</Link> – wir helfen gerne weiter.
            </p>
          </div>
        ) : (
          <>
            <p className="section-intro">
              Möchten Sie Ihren gebuchten Beratungstermin wirklich stornieren? Diese
              Aktion kann nicht rückgängig gemacht werden – Sie können danach aber
              jederzeit einen neuen Termin buchen.
            </p>
            <div className="hero__actions">
              <button
                type="button"
                className="btn btn--primary"
                onClick={cancel}
                disabled={state.step === "busy"}
              >
                {state.step === "busy" ? "Wird storniert …" : "Termin stornieren"}
              </button>
              <Link href="/" className="btn btn--secondary">
                Abbrechen
              </Link>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
