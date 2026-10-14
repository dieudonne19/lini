import { CalendarSkeleton } from "@/components/calendar-skeleton"

// Shown at once while the events are read: same column as the page, so nothing jumps when they arrive.
// The page lives in the (liste) group so this loading state does not cover the new / detail / edit pages.
export default function Loading() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 py-10 *:max-w-2xl">
      <CalendarSkeleton label="Chargement des événements…" />
    </main>
  )
}
