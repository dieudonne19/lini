function LinkInvalid() {
  return (
    <div className="flex flex-col gap-2">
      <h1 className="text-2xl font-semibold tracking-tight">Ce lien ne fonctionne plus</h1>
      <p className="text-muted-foreground">
        Il a été remplacé ou le membre a été retiré. Demande un nouveau lien à un parent.
      </p>
    </div>
  )
}

export { LinkInvalid }
