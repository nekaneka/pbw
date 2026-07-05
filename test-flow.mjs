const base = "http://localhost:3000/api/appointments";
const day = new Date(Date.now() + 24 * 3600 * 1000).toISOString().slice(0, 10);

const json = (method, body) => ({
  method,
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(body),
});

// 1. Admin creates a slot (umlaut in type, empty location -> default)
let res = await fetch(base, json("POST", {
  start_time: `${day}T09:00:00`,
  end_time: `${day}T10:00:00`,
  appointment_type: "Erstgespräch",
  location: "",
}));
const slot = await res.json();
console.log(`1. Create: HTTP ${res.status} status=${slot.status} type=${slot.appointment_type} location=${slot.location}`);

// 2. Overlapping slot must be rejected
res = await fetch(base, json("POST", {
  start_time: `${day}T09:30:00`,
  end_time: `${day}T10:30:00`,
  appointment_type: "Online Beratung",
  location: "Wien",
}));
console.log(`2. Overlap: HTTP ${res.status} (${(await res.json()).error ?? "?"})`);

// 3. End before start rejected
res = await fetch(base, json("POST", {
  start_time: `${day}T14:00:00`,
  end_time: `${day}T13:00:00`,
  appointment_type: "Erstgespräch",
}));
console.log(`3. End<Start: HTTP ${res.status}`);

// 4. Public list: only open slots, no customer fields
res = await fetch(base);
const open = await res.json();
console.log(`4. Public open: ${open.length} slot(s); fields: ${Object.keys(open[0]).join(", ")}`);

// 5. Customer books
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
res = await fetch(`${base}?scope=all`);
const all = await res.json();
console.log(`8. Admin: status=${all[0].status} customer=${all[0].customer_name} reason=${all[0].customer_reason}`);

// 9. Delete
res = await fetch(`${base}/${slot.id}`, { method: "DELETE" });
const remaining = await (await fetch(`${base}?scope=all`)).json();
console.log(`9. Delete: HTTP ${res.status}; remaining=${remaining.length}`);
