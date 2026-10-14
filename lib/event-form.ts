import {
  localDate,
  localTime,
  text,
  toInstant,
  utcDate,
  type FormDataLike,
} from "@/lib/form-dates"
import { eventSchema } from "@/lib/schemas"

// What a person types in the event form: local dates and times. `endDate` may stay empty (same day as the start).
export type EventFields = {
  title: string
  place: string
  description: string
  startDate: string // "2026-10-17"
  endDate: string // "2026-10-18", or "" for the same day
  startTime: string // "19:00"
  endTime: string
  allDay: boolean
}

export function readEventFields(data: FormDataLike): EventFields {
  return {
    title: text(data, "title"),
    place: text(data, "place"),
    description: text(data, "description"),
    startDate: text(data, "startDate"),
    endDate: text(data, "endDate"),
    startTime: text(data, "startTime"),
    endTime: text(data, "endTime"),
    allDay: data.get("allDay") === "on",
  }
}

// The stored event as the form fields a person would have typed: the inverse of toEventPayload.
// Runs in the browser: times are shown in the device timezone. The end date is always filled.
export function eventToFields(event: {
  title: string
  place: string | null
  description: string | null
  startsAt: Date
  endsAt: Date
  allDay: boolean
}): EventFields {
  const { title, place, description, startsAt, endsAt, allDay } = event
  const dateOf = allDay ? utcDate : localDate
  return {
    title,
    place: place ?? "",
    description: description ?? "",
    startDate: dateOf(startsAt),
    endDate: dateOf(endsAt),
    startTime: allDay ? "" : localTime(startsAt),
    endTime: allDay ? "" : localTime(endsAt),
    allDay,
  }
}

// Fields as the string values a form is refilled with (the checkbox becomes "true" / "false").
export function toEventFormValues(fields: EventFields) {
  return { ...fields, allDay: String(fields.allDay) }
}

// Friendly messages for fields left empty, shown before anything is sent. The server validates again.
export function missingEventFieldErrors({
  title,
  startDate,
  startTime,
  endTime,
  allDay,
}: EventFields) {
  const errors: Partial<
    Record<"title" | "startDate" | "startTime" | "endTime", string[]>
  > = {}
  if (!title.trim()) errors.title = ["Écris un titre"]
  if (!startDate) errors.startDate = ["Choisis un jour"]
  if (!allDay && !startTime) errors.startTime = ["Choisis une heure de début"]
  if (!allDay && !endTime) errors.endTime = ["Choisis une heure de fin"]
  return errors
}

// Converts the typed local dates and times into the UTC instants the server stores, as form data.
// Runs in the browser: "local" is the device timezone.
export function toEventPayload(fields: EventFields) {
  const { title, place, description, startDate, startTime, endTime, allDay } =
    fields
  const endDate = fields.endDate || startDate
  let startsAt: string
  let endsAt: string

  if (allDay) {
    // An all-day event is a range of UTC dates, never converted.
    startsAt = `${startDate}T00:00:00.000Z`
    endsAt = `${endDate}T00:00:00.000Z`
  } else {
    const start = new Date(`${startDate}T${startTime}`)
    const end = new Date(`${endDate}T${endTime}`)
    // Without an end date, an end earlier than the start means the next day (22:00 to 01:00).
    if (!fields.endDate && end < start) end.setDate(end.getDate() + 1)
    startsAt = toInstant(start, `${startDate}T${startTime}`)
    endsAt = toInstant(end, `${endDate}T${endTime}`)
  }

  const payload = new FormData()
  payload.set("title", title)
  payload.set("description", description)
  payload.set("place", place)
  payload.set("startsAt", startsAt)
  payload.set("endsAt", endsAt)
  payload.set("allDay", String(allDay))
  return payload
}

// Server side: validates what toEventPayload sent.
export function parseEventPayload(data: FormDataLike) {
  return eventSchema.safeParse({
    title: text(data, "title"),
    description: text(data, "description"),
    place: text(data, "place"),
    startsAt: text(data, "startsAt"),
    endsAt: text(data, "endsAt"),
    allDay: text(data, "allDay") === "true",
  })
}

// The dates and times part of the form: what the conflict preview and the free slots read and fill.
export type WhenFields = Pick<
  EventFields,
  "startDate" | "endDate" | "startTime" | "endTime" | "allDay"
>

// The event's instants as the server would store them, or null while the dates are incomplete or not valid
// (the same rules as the server: end after start, 31 days at most...).
export function eventTimesFromFields(when: WhenFields) {
  const parsed = parseEventPayload(
    toEventPayload({ title: "x", place: "", description: "", ...when })
  )
  if (!parsed.success) return null
  const { startsAt, endsAt, allDay } = parsed.data
  return { startsAt, endsAt, allDay }
}
