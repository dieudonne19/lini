"use client"

import { Button } from "@/components/ui/button"

export default function Error({ reset }: { reset: () => void }) {
  return (
    <main className="mx-auto flex flex-1 w-full max-w-md flex-col justify-center gap-6 px-4 py-12">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">
          Impossible de charger ton agenda
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
