// Smoke test for the booking flow. Usage (server must be running):
//   node test-flow.mjs <ADMIN_PASSWORD>
// or set the ADMIN_PASSWORD environment variable.

const base = "http://localhost:3000/api/appointments";
const day = new Date(Date.now() + 24 * 3600 * 1000).toISOString().slice(0, 10);

const password = process.env.ADMIN_PASSWORD ?? process.argv[2];
if (!password) {
  console.error("Usage: node test-flow.mjs <ADMIN_PASSWORD>");
  process.exit(1);
}

const json = (method, body, extraHeaders = {}) => ({
  method,
  headers: { "Content-Type": "application/json", ...extraHeaders },
  body: JSON.stringify(body),
});

// 0. Admin endpoints must be locked without a session
let res = await fetch(`${base}?scope=all`);
console.log(`0a. scope=all without login: HTTP ${res.status} (expect 401)`);
res = await fetch(base, json("POST", {
  start_time: `${day}T09:00:00`, end_time: `${day}T10:00:00`,
  appointment_type: "Erstgespräch", location: "",
}));
console.log(`0b. create without login: HTTP ${res.status} (expect 401)`);

// Login
res = await fetch("http://localhost:3000/api/admin/login", json("POST", { password }));
if (!res.ok) {
  console.error(`Login failed: HTTP ${res.status}`, await res.json());
  process.exit(1);
}
const cookie = res.headers.get("set-cookie").split(";")[0];
const auth = { Cookie: cookie };
console.log("0c. Login ok, session cookie received");

// Wrong password rejected
res = await fetch("http://localhost:3000/api/admin/login", json("POST", { password: "falsch-falsch" }));
console.log(`0d. wrong password: HTTP ${res.status} (expect 401)`);

// 1. Admin creates a slot (umlaut in type, empty location -> default)
res = await fetch(base, json("POST", {
  start_time: `${day}T09:00:00`,
  end_time: `${day}T10:00:00`,
  appointment_type: "Erstgespräch",
  location: "",
}, auth));
const slot = await res.json();
console.log(`1. Create: HTTP ${res.status} status=${slot.status} type=${slot.appointment_type} location=${slot.location}`);

// 2. Overlapping slot must be rejected
res = await fetch(base, json("POST", {
  start_time: `${day}T09:30:00`,
  end_time: `${day}T10:30:00`,
  appointment_type: "Online Beratung",
  location: "Wien",
}, auth));
console.log(`2. Overlap: HTTP ${res.status} (${(await res.json()).error ?? "?"})`);

// 3. End before start rejected
res = await fetch(base, json("POST", {
  start_time: `${day}T14:00:00`,
  end_time: `${day}T13:00:00`,
  appointment_type: "Erstgespräch",
}, auth));
console.log(`3. End<Start: HTTP ${res.status}`);

// 4. Public list: only open slots, no customer fields
res = await fetch(base);
const open = await res.json();
console.log(`4. Public open: ${open.length} slot(s); fields: ${Object.keys(open[0]).join(", ")}`);

// 5. Customer books (no auth needed)
res = await fetch(`${base}/${slot.id}/book`, json("POST", {
  customer_name: "Maria Muster",
  customer_email: "maria@example.com",
  customer_phone: "+43 660 1234567",
  customer_reason: "Pflegegeld-Einstufung",
  customer_message: "Bitte um Rückruf.",
}));
console.log(`5. Booking: HTTP ${res.status} ok=${(await res.json()).ok}`);

// 6. Gone from public list
res = await fetch(base);
console.log(`6. Public open after booking: ${(await res.json()).length}`);

// 7. Double booking rejected
res = await fetch(`${base}/${slot.id}/book`, json("POST", {
  customer_name: "X",
  customer_email: "x@x.at",
  customer_phone: "1",
  customer_reason: "Sonstiges Anliegen",
  customer_message: "",
}));
console.log(`7. Double booking: HTTP ${res.status} (${(await res.json()).error ?? "?"})`);

// 8. Admin sees booked slot incl. customer data
res = await fetch(`${base}?scope=all`, { headers: auth });
const all = await res.json();
console.log(`8. Admin: status=${all[0].status} customer=${all[0].customer_name} reason=${all[0].customer_reason}`);

// 9. Delete without login rejected, then with login
res = await fetch(`${base}/${slot.id}`, { method: "DELETE" });
console.log(`9a. Delete without login: HTTP ${res.status} (expect 401)`);
res = await fetch(`${base}/${slot.id}`, { method: "DELETE", headers: auth });
const remaining = await (await fetch(`${base}?scope=all`, { headers: auth })).json();
console.log(`9b. Delete with login: HTTP ${res.status}; remaining=${remaining.length}`);
