export type AppointmentStatus = "open" | "booked" | "cancelled";

export interface Appointment {
  id: string;
  start_time: string; // ISO 8601
  end_time: string; // ISO 8601
  status: AppointmentStatus;
  appointment_type: string;
  location: string;
  customer_name: string | null;
  customer_email: string | null;
  customer_phone: string | null;
  customer_message: string | null;
  customer_reason: string | null;
  created_at: string;
  booked_at: string | null;
  /** Secret cancellation token – only ever sent to the customer by e-mail. */
  cancel_token: string | null;
  cancelled_at: string | null;
}

/** Safe subset returned by the public cancellation endpoint. */
export interface CancellationResult {
  id: string;
  start_time: string;
  end_time: string;
  appointment_type: string;
  location: string;
  status: AppointmentStatus;
}

export function toCancellationResult(a: Appointment): CancellationResult {
  return {
    id: a.id,
    start_time: a.start_time,
    end_time: a.end_time,
    appointment_type: a.appointment_type,
    location: a.location,
    status: a.status,
  };
}

/** Public shape returned to customers – no customer data, only open slots. */
export interface PublicSlot {
  id: string;
  start_time: string;
  end_time: string;
  appointment_type: string;
  location: string;
}

export interface CreateSlotInput {
  start_time: string;
  end_time: string;
  appointment_type: string;
  location: string;
}

export interface BookingInput {
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  customer_reason: string;
  customer_message: string;
}

export const APPOINTMENT_TYPES = [
  "Erstgespräch",
  "Vor-Ort Beratung",
  "Online Beratung",
  "Begleitung Begutachtungstermin",
] as const;

export const BOOKING_REASONS = [
  "Pflegegeld-Einstufung",
  "Erhöhungsantrag Pflegegeld",
  "Case & Care Management",
  "Wohnraum- & Barrierefreiheitsberatung",
  "Angehörigen-Coaching",
  "Sonstiges Anliegen",
] as const;

export const DEFAULT_LOCATION = "Wien / nach Vereinbarung";

export function toPublicSlot(a: Appointment): PublicSlot {
  return {
    id: a.id,
    start_time: a.start_time,
    end_time: a.end_time,
    appointment_type: a.appointment_type,
    location: a.location,
  };
}
