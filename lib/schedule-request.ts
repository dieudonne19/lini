import { z } from "zod"

import { listFamilySchedule, type Schedule } from "@/lib/schedule"

// A read of the family's schedule asked for by the browser (the conflict preview and the free slots need the
// period the person is looking at). The dates arrive as text and are validated here; the window limit is
// the one of listFamilySchedule. Another member's private activity comes back without its title, like on
// every other screen.

export type ScheduleResult =
  { ok: true; schedule: Schedule } | { ok: false; message: string }

const INVALID_PERIOD = "Impossible de lire cette période."

const periodSchema = z.object({
  from: z.iso.datetime(),
  to: z.iso.datetime(),
})

export async function loadSchedule(
  viewer: Parameters<typeof listFamilySchedule>[0],
  from: string,
  to: string
): Promise<ScheduleResult> {
  const parsed = periodSchema.safeParse({ from, to })
  if (!parsed.success) return { ok: false, message: INVALID_PERIOD }

  try {
    const schedule = await listFamilySchedule(viewer, {
      from: new Date(parsed.data.from),
      to: new Date(parsed.data.to),
    })
    return { ok: true, schedule }
  } catch (error) {
    // An empty, reversed or too long window: the person asked for something the schedule does not offer.
    if (error instanceof RangeError)
      return { ok: false, message: INVALID_PERIOD }
    throw error
  }
}
