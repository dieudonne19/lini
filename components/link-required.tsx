function LinkRequired() {
  return (
    <div className="flex flex-col gap-2">
      <h1 className="text-2xl font-semibold tracking-tight">Ouvre ton lien personnel</h1>
      <p className="text-muted-foreground">
        Lini n&apos;a pas de mot de passe : chaque membre a son propre lien. Demande le tien à un parent.
      </p>
    </div>
  )
}

export { LinkRequired }
