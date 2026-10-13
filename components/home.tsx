function Home({ name }: { name: string }) {
  return (
    <div className="flex flex-col gap-2">
      <h1 className="text-2xl font-semibold tracking-tight">Bonjour {name}</h1>
      <p className="text-muted-foreground">Ton agenda arrive bientôt.</p>
    </div>
  )
}

export { Home }
