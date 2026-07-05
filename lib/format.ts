/** Client-safe date/time formatting for Vienna local time. */

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

export function formatDate(iso: string): string {
  return dateFmt.format(new Date(iso));
}

export function formatRange(startIso: string, endIso: string): string {
  return `${timeFmt.format(new Date(startIso))}–${timeFmt.format(new Date(endIso))} Uhr`;
}
