"use client";

import { useState, type FormEvent } from "react";

export default function ContactForm() {
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    setSending(true);
    setResult(null);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.get("name"),
          email: data.get("email"),
          phone: data.get("phone"),
          message: data.get("message"),
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setResult({ ok: false, message: json.error ?? "Senden fehlgeschlagen." });
      } else {
        setResult({
          ok: true,
          message: "Vielen Dank! Ihre Nachricht wurde übermittelt. Wir melden uns zeitnah bei Ihnen.",
        });
        form.reset();
      }
    } catch {
      setResult({ ok: false, message: "Senden fehlgeschlagen. Bitte versuchen Sie es später erneut." });
    } finally {
      setSending(false);
    }
  }

  return (
    <form className="panel form-grid form-grid--2col" onSubmit={onSubmit} noValidate>
      <div className="form-field">
        <label htmlFor="contact-name">Name *</label>
        <input id="contact-name" name="name" type="text" autoComplete="name" required />
      </div>
      <div className="form-field">
        <label htmlFor="contact-email">E-Mail *</label>
        <input id="contact-email" name="email" type="email" autoComplete="email" required />
      </div>
      <div className="form-field form-field--full">
        <label htmlFor="contact-phone">Telefon</label>
        <input id="contact-phone" name="phone" type="tel" autoComplete="tel" />
      </div>
      <div className="form-field form-field--full">
        <label htmlFor="contact-message">Nachricht *</label>
        <textarea id="contact-message" name="message" rows={5} required />
      </div>
      <div className="form-field--full">
        <button type="submit" className="btn btn--primary" disabled={sending}>
          {sending ? "Wird gesendet …" : "Nachricht senden"}
        </button>
      </div>
      <div aria-live="polite" className="form-field--full">
        {result && (
          <p className={`alert ${result.ok ? "alert--success" : "alert--error"}`} role="status">
            {result.message}
          </p>
        )}
      </div>
    </form>
  );
}
