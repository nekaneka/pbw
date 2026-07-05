/**
 * Appointment store with two interchangeable backends:
 *
 * 1. SupabaseStore – active when NEXT_PUBLIC_SUPABASE_URL and
 *    SUPABASE_SERVICE_ROLE_KEY are set. Talks to Supabase Postgres via the
 *    PostgREST API (no extra npm dependency needed). See supabase/schema.sql.
 *
 * 2. FileStore – local development fallback. Persists to
 *    ./.data/appointments.json so the whole booking flow works without any
 *    external service. NOT suitable for production (serverless filesystems
 *    are ephemeral).
 *
 * All booking-critical validation (slot still open? slots overlapping?
 * cancellation token valid?) happens here on the server – the client is
 * never trusted.
 */
import { promises as fs } from "fs";
import path from "path";
import { randomBytes, randomUUID } from "crypto";
import type { Appointment, BookingInput, CreateSlotInput } from "./types";

export type StoreResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string; status: number };

export interface AppointmentStore {
  /** Only future slots with status = open, sorted ascending. */
  listOpen(): Promise<Appointment[]>;
  /** All slots including booked/cancelled – admin only. */
  listAll(): Promise<Appointment[]>;
  /** Create a slot; rejects overlaps with existing non-cancelled slots. */
  create(input: CreateSlotInput): Promise<StoreResult<Appointment>>;
  /** Book a slot; rejects if it is no longer open. Generates the cancel token. */
  book(id: string, input: BookingInput): Promise<StoreResult<Appointment>>;
  /** Customer cancellation via the secret e-mail token. */
  cancelByToken(token: string): Promise<StoreResult<Appointment>>;
  /** Admin cancellation of a booked future appointment. Keeps customer data. */
  cancelByAdmin(id: string): Promise<StoreResult<Appointment>>;
  /** Hard delete – refused for booked appointments (cancel instead). */
  delete(id: string): Promise<StoreResult<null>>;
}

/** Cryptographically random, unpredictable cancellation token (64 hex chars). */
function createCancelToken(): string {
  return randomBytes(32).toString("hex");
}

function overlaps(aStart: string, aEnd: string, bStart: string, bEnd: string): boolean {
  return new Date(aStart) < new Date(bEnd) && new Date(aEnd) > new Date(bStart);
}

// Deliberately generic – must not reveal whether a token exists.
const ERR_TOKEN_INVALID =
  "Der Stornierungslink ist ungültig oder abgelaufen. Bitte kontaktieren Sie uns direkt.";
const ERR_ALREADY_CANCELLED = "Dieser Termin wurde bereits storniert.";
const ERR_IN_PAST =
  "Dieser Termin liegt in der Vergangenheit und kann nicht mehr storniert werden.";
const ERR_DELETE_BOOKED =
  "Gebuchte Termine können nicht gelöscht werden. Bitte stattdessen stornieren – die Kundendaten bleiben erhalten.";
const ERR_NOT_FOUND = "Termin nicht gefunden.";
const ERR_NOT_CANCELLABLE = "Nur gebuchte, zukünftige Termine können storniert werden.";

/* ------------------------------------------------------------------ */
/* File store (local development)                                      */
/* ------------------------------------------------------------------ */

const DATA_DIR = path.join(process.cwd(), ".data");
const DATA_FILE = path.join(DATA_DIR, "appointments.json");

// Serialises read-modify-write cycles within this process.
let fileLock: Promise<unknown> = Promise.resolve();
function withFileLock<T>(fn: () => Promise<T>): Promise<T> {
  const run = fileLock.then(fn, fn);
  fileLock = run.catch(() => undefined);
  return run;
}

class FileStore implements AppointmentStore {
  private async readAll(): Promise<Appointment[]> {
    try {
      const raw = await fs.readFile(DATA_FILE, "utf-8");
      return JSON.parse(raw) as Appointment[];
    } catch {
      return [];
    }
  }

  private async writeAll(list: Appointment[]): Promise<void> {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(DATA_FILE, JSON.stringify(list, null, 2), "utf-8");
  }

  async listOpen(): Promise<Appointment[]> {
    const now = new Date().toISOString();
    const all = await this.readAll();
    return all
      .filter((a) => a.status === "open" && a.start_time >= now)
      .sort((a, b) => a.start_time.localeCompare(b.start_time));
  }

  async listAll(): Promise<Appointment[]> {
    const all = await this.readAll();
    return all.sort((a, b) => a.start_time.localeCompare(b.start_time));
  }

  async create(input: CreateSlotInput): Promise<StoreResult<Appointment>> {
    return withFileLock(async () => {
      const all = await this.readAll();
      const conflict = all.find(
        (a) => a.status !== "cancelled" && overlaps(input.start_time, input.end_time, a.start_time, a.end_time)
      );
      if (conflict) {
        return {
          ok: false as const,
          error: "Der Zeitraum überschneidet sich mit einem bestehenden Termin.",
          status: 409,
        };
      }
      const appointment: Appointment = {
        id: randomUUID(),
        start_time: input.start_time,
        end_time: input.end_time,
        status: "open",
        appointment_type: input.appointment_type,
        location: input.location,
        customer_name: null,
        customer_email: null,
        customer_phone: null,
        customer_message: null,
        customer_reason: null,
        created_at: new Date().toISOString(),
        booked_at: null,
        cancel_token: null,
        cancelled_at: null,
      };
      all.push(appointment);
      await this.writeAll(all);
      return { ok: true as const, data: appointment };
    });
  }

  async book(id: string, input: BookingInput): Promise<StoreResult<Appointment>> {
    return withFileLock(async () => {
      const all = await this.readAll();
      const appointment = all.find((a) => a.id === id);
      if (!appointment) {
        return { ok: false as const, error: ERR_NOT_FOUND, status: 404 };
      }
      if (appointment.status !== "open") {
        return {
          ok: false as const,
          error: "Dieser Termin ist leider nicht mehr verfügbar.",
          status: 409,
        };
      }
      appointment.status = "booked";
      appointment.customer_name = input.customer_name;
      appointment.customer_email = input.customer_email;
      appointment.customer_phone = input.customer_phone;
      appointment.customer_reason = input.customer_reason;
      appointment.customer_message = input.customer_message;
      appointment.booked_at = new Date().toISOString();
      appointment.cancel_token = createCancelToken();
      await this.writeAll(all);
      return { ok: true as const, data: appointment };
    });
  }

  async cancelByToken(token: string): Promise<StoreResult<Appointment>> {
    return withFileLock(async () => {
      const all = await this.readAll();
      const appointment = all.find((a) => a.cancel_token === token);
      if (!appointment) {
        return { ok: false as const, error: ERR_TOKEN_INVALID, status: 404 };
      }
      if (appointment.status === "cancelled") {
        return { ok: false as const, error: ERR_ALREADY_CANCELLED, status: 409 };
      }
      if (appointment.status !== "booked") {
        return { ok: false as const, error: ERR_TOKEN_INVALID, status: 404 };
      }
      if (new Date(appointment.start_time) <= new Date()) {
        return { ok: false as const, error: ERR_IN_PAST, status: 409 };
      }
      // Customer data stays on the record so the admin keeps the history.
      appointment.status = "cancelled";
      appointment.cancelled_at = new Date().toISOString();
      await this.writeAll(all);
      return { ok: true as const, data: appointment };
    });
  }

  async cancelByAdmin(id: string): Promise<StoreResult<Appointment>> {
    return withFileLock(async () => {
      const all = await this.readAll();
      const appointment = all.find((a) => a.id === id);
      if (!appointment) {
        return { ok: false as const, error: ERR_NOT_FOUND, status: 404 };
      }
      if (appointment.status !== "booked" || new Date(appointment.start_time) <= new Date()) {
        return { ok: false as const, error: ERR_NOT_CANCELLABLE, status: 409 };
      }
      appointment.status = "cancelled";
      appointment.cancelled_at = new Date().toISOString();
      await this.writeAll(all);
      return { ok: true as const, data: appointment };
    });
  }

  async delete(id: string): Promise<StoreResult<null>> {
    return withFileLock(async () => {
      const all = await this.readAll();
      const appointment = all.find((a) => a.id === id);
      if (!appointment) {
        return { ok: false as const, error: ERR_NOT_FOUND, status: 404 };
      }
      if (appointment.status === "booked") {
        return { ok: false as const, error: ERR_DELETE_BOOKED, status: 409 };
      }
      await this.writeAll(all.filter((a) => a.id !== id));
      return { ok: true as const, data: null };
    });
  }
}

/* ------------------------------------------------------------------ */
/* Supabase store (production)                                         */
/* ------------------------------------------------------------------ */

class SupabaseStore implements AppointmentStore {
  constructor(
    private url: string,
    private serviceKey: string
  ) {}

  private async request(pathAndQuery: string, init?: RequestInit): Promise<Response> {
    return fetch(`${this.url}/rest/v1/${pathAndQuery}`, {
      ...init,
      headers: {
        apikey: this.serviceKey,
        Authorization: `Bearer ${this.serviceKey}`,
        "Content-Type": "application/json",
        ...(init?.headers ?? {}),
      },
      cache: "no-store",
    });
  }

  async listOpen(): Promise<Appointment[]> {
    const now = new Date().toISOString();
    const res = await this.request(
      `appointments?status=eq.open&start_time=gte.${encodeURIComponent(now)}&order=start_time.asc`
    );
    if (!res.ok) throw new Error(`Supabase listOpen failed: ${res.status}`);
    return (await res.json()) as Appointment[];
  }

  async listAll(): Promise<Appointment[]> {
    const res = await this.request(`appointments?order=start_time.asc`);
    if (!res.ok) throw new Error(`Supabase listAll failed: ${res.status}`);
    return (await res.json()) as Appointment[];
  }

  async create(input: CreateSlotInput): Promise<StoreResult<Appointment>> {
    // Overlap check: any non-cancelled slot with start < new end AND end > new start.
    const overlapRes = await this.request(
      `appointments?status=neq.cancelled&start_time=lt.${encodeURIComponent(input.end_time)}&end_time=gt.${encodeURIComponent(input.start_time)}&select=id&limit=1`
    );
    if (!overlapRes.ok) throw new Error(`Supabase overlap check failed: ${overlapRes.status}`);
    const conflicts = (await overlapRes.json()) as unknown[];
    if (conflicts.length > 0) {
      return {
        ok: false,
        error: "Der Zeitraum überschneidet sich mit einem bestehenden Termin.",
        status: 409,
      };
    }

    const res = await this.request(`appointments`, {
      method: "POST",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify({
        start_time: input.start_time,
        end_time: input.end_time,
        status: "open",
        appointment_type: input.appointment_type,
        location: input.location,
      }),
    });
    if (!res.ok) throw new Error(`Supabase create failed: ${res.status}`);
    const rows = (await res.json()) as Appointment[];
    return { ok: true, data: rows[0] };
  }

  async book(id: string, input: BookingInput): Promise<StoreResult<Appointment>> {
    // Atomic conditional update: only rows that are still open are updated.
    // If someone booked the slot a moment earlier, zero rows come back.
    const res = await this.request(
      `appointments?id=eq.${encodeURIComponent(id)}&status=eq.open`,
      {
        method: "PATCH",
        headers: { Prefer: "return=representation" },
        body: JSON.stringify({
          status: "booked",
          customer_name: input.customer_name,
          customer_email: input.customer_email,
          customer_phone: input.customer_phone,
          customer_reason: input.customer_reason,
          customer_message: input.customer_message,
          booked_at: new Date().toISOString(),
          cancel_token: createCancelToken(),
        }),
      }
    );
    if (!res.ok) throw new Error(`Supabase book failed: ${res.status}`);
    const rows = (await res.json()) as Appointment[];
    if (rows.length === 0) {
      return {
        ok: false,
        error: "Dieser Termin ist leider nicht mehr verfügbar.",
        status: 409,
      };
    }
    return { ok: true, data: rows[0] };
  }

  async cancelByToken(token: string): Promise<StoreResult<Appointment>> {
    // Atomic conditional update: only a booked, future appointment with this
    // exact token is cancelled.
    const now = new Date().toISOString();
    const res = await this.request(
      `appointments?cancel_token=eq.${encodeURIComponent(token)}&status=eq.booked&start_time=gt.${encodeURIComponent(now)}`,
      {
        method: "PATCH",
        headers: { Prefer: "return=representation" },
        body: JSON.stringify({ status: "cancelled", cancelled_at: now }),
      }
    );
    if (!res.ok) throw new Error(`Supabase cancelByToken failed: ${res.status}`);
    const rows = (await res.json()) as Appointment[];
    if (rows.length > 0) {
      return { ok: true, data: rows[0] };
    }

    // Nothing updated – find out why, without leaking customer data.
    const lookupRes = await this.request(
      `appointments?cancel_token=eq.${encodeURIComponent(token)}&select=status,start_time&limit=1`
    );
    if (!lookupRes.ok) throw new Error(`Supabase cancel lookup failed: ${lookupRes.status}`);
    const found = (await lookupRes.json()) as Array<{ status: string; start_time: string }>;
    if (found.length === 0) {
      return { ok: false, error: ERR_TOKEN_INVALID, status: 404 };
    }
    if (found[0].status === "cancelled") {
      return { ok: false, error: ERR_ALREADY_CANCELLED, status: 409 };
    }
    if (new Date(found[0].start_time) <= new Date()) {
      return { ok: false, error: ERR_IN_PAST, status: 409 };
    }
    return { ok: false, error: ERR_TOKEN_INVALID, status: 404 };
  }

  async cancelByAdmin(id: string): Promise<StoreResult<Appointment>> {
    const now = new Date().toISOString();
    const res = await this.request(
      `appointments?id=eq.${encodeURIComponent(id)}&status=eq.booked&start_time=gt.${encodeURIComponent(now)}`,
      {
        method: "PATCH",
        headers: { Prefer: "return=representation" },
        body: JSON.stringify({ status: "cancelled", cancelled_at: now }),
      }
    );
    if (!res.ok) throw new Error(`Supabase cancelByAdmin failed: ${res.status}`);
    const rows = (await res.json()) as Appointment[];
    if (rows.length === 0) {
      return { ok: false, error: ERR_NOT_CANCELLABLE, status: 409 };
    }
    return { ok: true, data: rows[0] };
  }

  async delete(id: string): Promise<StoreResult<null>> {
    // Booked appointments must be cancelled, never hard-deleted.
    const res = await this.request(
      `appointments?id=eq.${encodeURIComponent(id)}&status=neq.booked`,
      {
        method: "DELETE",
        headers: { Prefer: "return=representation" },
      }
    );
    if (!res.ok) throw new Error(`Supabase delete failed: ${res.status}`);
    const rows = (await res.json()) as unknown[];
    if (rows.length === 0) {
      const lookup = await this.request(
        `appointments?id=eq.${encodeURIComponent(id)}&select=status&limit=1`
      );
      if (!lookup.ok) throw new Error(`Supabase delete lookup failed: ${lookup.status}`);
      const found = (await lookup.json()) as Array<{ status: string }>;
      if (found.length > 0 && found[0].status === "booked") {
        return { ok: false, error: ERR_DELETE_BOOKED, status: 409 };
      }
      return { ok: false, error: ERR_NOT_FOUND, status: 404 };
    }
    return { ok: true, data: null };
  }
}

/* ------------------------------------------------------------------ */

let store: AppointmentStore | null = null;

export function getStore(): AppointmentStore {
  if (!store) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    store = url && key ? new SupabaseStore(url, key) : new FileStore();
  }
  return store;
}
