// Small helpers shared by the activity and event forms: reading a form and converting between what a person
// types (local date and times) and what the server stores (UTC instants).

export type FormDataLike = { get(name: string): FormDataEntryValue | null }

export const text = (data: FormDataLike, name: string) =>
  String(data.get(name) ?? "")

const pad = (n: number) => String(n).padStart(2, "0")

// "2026-10-14" and "18:00" in the device timezone.
export const localDate = (d: Date) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
export const localTime = (d: Date) =>
  `${pad(d.getHours())}:${pad(d.getMinutes())}`
// The UTC calendar date, for all-day items.
export const utcDate = (d: Date) => d.toISOString().slice(0, 10)

// An unparseable date is passed on as typed, so the server reports it instead of this code throwing.
export const toInstant = (date: Date, typed: string) =>
  Number.isNaN(date.getTime()) ? typed : date.toISOString()
