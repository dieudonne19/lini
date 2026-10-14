// Pure: placeholder shown while the agenda loads or is computed in the browser.
function AgendaSkeleton() {
  return (
    <div role="status" aria-busy="true" className="flex flex-col gap-8">
      <span className="sr-only">Chargement de ton agenda…</span>
      {[0, 1].map((day) => (
        <div key={day} aria-hidden className="flex flex-col gap-3">
          <div className="h-5 w-48 animate-pulse rounded bg-muted" />
          <div className="h-[76px] animate-pulse rounded-lg bg-muted" />
          <div className="h-[76px] animate-pulse rounded-lg bg-muted" />
        </div>
      ))}
    </div>
  )
}

export { AgendaSkeleton }
