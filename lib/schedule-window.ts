// Which period of the schedule the browser already holds, so it only asks for more when it has to.

const DAY_MS = 24 * 60 * 60 * 1000

export type DateRange = { from: Date; to: Date }

// True when `loaded` includes the whole `needed` period.
export function covers(loaded: DateRange | null, needed: DateRange) {
  return loaded !== null && loaded.from <= needed.from && loaded.to >= needed.to
}

// The period to ask for: the one needed, with margin on each side so that small changes of date do not
// ask again.
export function padRange({ from, to }: DateRange, days: number): DateRange {
  return {
    from: new Date(from.getTime() - days * DAY_MS),
    to: new Date(to.getTime() + days * DAY_MS),
  }
}
