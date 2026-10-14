import Link from "next/link"

function LinkRequired() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Ouvre ton lien personnel
        </h1>
        <p className="text-muted-foreground">
          Lini n&apos;a pas de mot de passe : chaque membre a son propre lien.
          Demande le tien à un parent.
        </p>
      </div>
      <p className="text-sm text-muted-foreground">
        Tu es parent et tu as perdu ton lien ?{" "}
        <Link
          href="/secours"
          className="font-medium text-foreground underline underline-offset-4 hover:no-underline"
        >
          Utilise ton code de secours
        </Link>
        .
      </p>
    </div>
  )
}

export { LinkRequired }
