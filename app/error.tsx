"use client"

import { Button } from "@/components/ui/button"

// Error boundary for every page without its own: the message says what to do.
export default function Error({ reset }: { reset: () => void }) {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center gap-6 px-4 py-12">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Impossible de charger la page
        </h1>
        <p className="text-muted-foreground">
          Vérifie ta connexion, puis réessaie.
        </p>
      </div>
      <Button size="lg" className="h-11" onClick={reset}>
        Réessayer
      </Button>
    </main>
  )
}
