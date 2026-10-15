// Pure: placeholder shown while the agenda loads or is computed in the browser.
function AgendaSkeleton() {
  return (
    <div role="status" aria-busy="true">
      <span className="sr-only">Chargement de ton agenda…</span>
      <div aria-hidden className="divide-y border-y">
        {[0, 1, 2].map((row) => (
          <div key={row} className="h-24 animate-pulse bg-muted/50" />
        ))}
      </div>
    </div>
  )
}

export { AgendaSkeleton }
