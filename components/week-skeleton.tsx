// Pure: placeholder while the week loads or is laid out in the browser.
function WeekSkeleton() {
  return (
    <div role="status" aria-busy="true" className="flex flex-col gap-6">
      <span className="sr-only">Chargement de la semaine…</span>
      <div aria-hidden className="h-9 w-64 animate-pulse rounded bg-muted" />
      <div aria-hidden className="flex flex-col gap-3">
        {[0, 1, 2, 3].map((row) => (
          <div key={row} className="h-16 animate-pulse rounded bg-muted" />
        ))}
      </div>
    </div>
  )
}

export { WeekSkeleton }
