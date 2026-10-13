// Shown while the family has a single parent: if that parent loses their link, nobody can issue a new one.
function SecondParentBanner() {
  return (
    <div
      role="note"
      className="rounded-xl border border-border bg-muted p-3 text-sm"
    >
      <p className="font-medium">Ajoute un deuxième parent</p>
      <p className="text-muted-foreground">
        Si tu perds ton lien, personne ne pourra t&apos;en donner un nouveau.
      </p>
    </div>
  )
}

export { SecondParentBanner }
