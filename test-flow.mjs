// Smoke test for the booking + cancellation flow against the local
// FileStore. Usage (server must be running):
//   node test-flow.mjs <ADMIN_PASSWORD>
// or set the ADMIN_PASSWORD environment variable.

import { readFile } from "fs/promises";

const origin = "http://localhost:3000";
const base = `${origin}/api/appointments`;
const day = new Date(Date.now() + 24 * 3600 * 1000).toISOString().slice(0, 10);

const password = process.env.ADMIN_PASSWORD ?? process.argv[2];
if (!password) {
  console.error("Usage: node test-flow.mjs <ADMIN_PASSWORD>");
  process.exit(1);
}

let failures = 0;
function check(label, condition, detail = "") {
  const status = condition ? "PASS" : "FAIL";
  if (!condition) failures++;
  console.log(`${status}  ${label}${detail ? ` (${detail})` : ""}`);
}

const json = (method, body, extraHeaders = {}) => ({
  method,
  headers: { "Content-Type": "application/json", ...extraHeaders },
  body: JSON.stringify(body),
});

const bookingBody = (name) => ({
  customer_name: name,
  customer_email: "maria@example.com",
  customer_phone: "+43 660 1234567",
  customer_reason: "Pflegegeld-Einstufung",
  customer_message: "Bitte um Rückruf.",
});

async function createSlot(auth, startHour, endHour) {
  const res = await fetch(base, json("POST", {
    start_time: `${day}T${startHour}:00`,
    end_time: `${day}T${endHour}:00`,
    appointment_type: "Erstgespräch",
    location: "",
  }, auth));
  return { res, slot: await res.json() };
}

/* ---------- auth ---------- */

let res = await fetch(`${base}?scope=all`);
check("admin list without login is rejected", res.status === 401, `HTTP ${res.status}`);

res = await fetch(base, json("POST", {
  start_time: `${day}T09:00:00`, end_time: `${day}T10:00:00`,
  appointment_type: "Erstgespräch", location: "",
}));
check("slot creation without login is rejected", res.status === 401, `HTTP ${res.status}`);

res = await fetch(`${origin}/api/admin/login`, json("POST", { password: "falsch-falsch" }));
check("wrong password is rejected", res.status === 401, `HTTP ${res.status}`);

res = await fetch(`${origin}/api/admin/login`, json("POST", { password }));
check("login succeeds", res.ok, `HTTP ${res.status}`);
if (!res.ok) process.exit(1);
const auth = { Cookie: res.headers.get("set-cookie").split(";")[0] };

/* ---------- slot creation ---------- */

const { res: createRes, slot } = await createSlot(auth, "09:00", "10:00");
check("slot creation works", createRes.status === 201 && slot.status === "open",
  `HTTP ${createRes.status}, location=${slot.location}`);

const { res: overlapRes } = await createSlot(auth, "09:30", "10:30");
check("overlapping slot is rejected", overlapRes.status === 409, `HTTP ${overlapRes.status}`);

/* ---------- public list before booking ---------- */

res = await fetch(base);
let open = await res.json();
const fields = Object.keys(open[0] ?? {});
check("public list contains the open slot", open.length === 1, `count=${open.length}`);
check("public list has no customer fields and no cancel_token",
  !fields.some((f) => f.startsWith("customer_") || f === "cancel_token"),
  `fields: ${fields.join(", ")}`);

/* ---------- booking ---------- */

res = await fetch(`${base}/${slot.id}/book`, json("POST", bookingBody("Maria Muster")));
const bookingJson = await res.json();
check("booking works", res.ok && bookingJson.ok === true, `HTTP ${res.status}`);
check("booking response contains no cancel_token",
  !JSON.stringify(bookingJson).includes("cancel_token"));

// The token is internal – read it from the local file store.
const stored = JSON.parse(await readFile(".data/appointments.json", "utf-8"));
const storedSlot = stored.find((a) => a.id === slot.id);
const token = storedSlot?.cancel_token;
check("booking creates a cancellation token internally",
  typeof token === "string" && /^[0-9a-f]{64}$/.test(token));

// The logged confirmation e-mail must contain the cancellation link.
const mailLog = await readFile(".data/emails.log", "utf-8").catch(() => "");
check("logged confirmation e-mail includes the cancellation URL",
  mailLog.includes(`/termin/stornieren?token=${token}`));

res = await fetch(base);
open = await res.json();
check("booked slot disappears from public list", open.length === 0, `count=${open.length}`);

res = await fetch(`${base}/${slot.id}/book`, json("POST", bookingBody("Zweiter Versuch")));
check("double booking is rejected", res.status === 409, `HTTP ${res.status}`);

/* ---------- booked appointments cannot be hard-deleted ---------- */

res = await fetch(`${base}/${slot.id}`, { method: "DELETE", headers: auth });
check("booked appointment cannot be hard-deleted", res.status === 409, `HTTP ${res.status}`);

/* ---------- customer cancellation by token ---------- */

res = await fetch(`${base}/cancel`, json("POST", { token: "0".repeat(64) }));
check("invalid token is rejected", res.status === 404, `HTTP ${res.status}`);

res = await fetch(`${base}/cancel`, json("POST", { token }));
const cancelJson = await res.json();
check("valid token cancels the appointment",
  res.ok && cancelJson.appointment?.status === "cancelled", `HTTP ${res.status}`);
check("cancellation response contains no customer data",
  !JSON.stringify(cancelJson).includes("customer_"));

res = await fetch(`${base}/cancel`, json("POST", { token }));
check("same token cannot cancel twice", res.status === 409, `HTTP ${res.status}`);

res = await fetch(base);
open = await res.json();
check("cancelled appointment is not in public list", open.length === 0, `count=${open.length}`);

res = await fetch(`${base}?scope=all`, { headers: auth });
let all = await res.json();
const cancelled = all.find((a) => a.id === slot.id);
check("cancelled appointment remains in admin list with customer data",
  cancelled?.status === "cancelled" && cancelled?.customer_name === "Maria Muster");

/* ---------- admin cancellation ---------- */

const { slot: slot2 } = await createSlot(auth, "11:00", "12:00");
await fetch(`${base}/${slot2.id}/book`, json("POST", bookingBody("Hans Beispiel")));

res = await fetch(`${base}/${slot2.id}`, json("PATCH", { status: "cancelled" }, auth));
const adminCancel = await res.json();
check("admin can cancel a booked future appointment",
  res.ok && adminCancel.appointment?.status === "cancelled", `HTTP ${res.status}`);

res = await fetch(`${base}/${slot2.id}`, json("PATCH", { status: "cancelled" }));
check("admin cancellation requires login", res.status === 401, `HTTP ${res.status}`);

/* ---------- open slots can still be deleted ---------- */

const { slot: slot3 } = await createSlot(auth, "13:00", "14:00");
res = await fetch(`${base}/${slot3.id}`, { method: "DELETE", headers: auth });
check("open slot can be deleted", res.ok, `HTTP ${res.status}`);

res = await fetch(`${base}?scope=all`, { headers: auth });
all = await res.json();
check("admin history keeps both cancelled appointments",
  all.filter((a) => a.status === "cancelled").length === 2, `total=${all.length}`);

/* ---------- summary ---------- */

console.log(failures === 0 ? "\nAll checks passed." : `\n${failures} check(s) FAILED.`);
process.exit(failures === 0 ? 0 : 1);
