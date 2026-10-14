import { CalendarSkeleton } from "@/components/calendar-skeleton"

// Shown at once while the members are read: same column as the page, so nothing jumps when they arrive.
export default function Loading() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-10 px-4 py-10 *:max-w-md">
      <CalendarSkeleton label="Chargement de la famille…" />
    </main>
  )
}
