import Link from "next/link"

import { Button, buttonVariants } from "@/components/ui/button"

type HomeProps = {
  name: string
  canManageFamily: boolean
  logoutAction: () => void
}

function Home({ name, canManageFamily, logoutAction }: HomeProps) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">
          Bonjour {name}
        </h1>
        <p className="text-muted-foreground">Ton agenda arrive bientôt.</p>
      </div>
      {canManageFamily && (
        <Link
          href="/famille"
          className={buttonVariants({ size: "lg", className: "h-11" })}
        >
          Gérer la famille
        </Link>
      )}
      <form action={logoutAction} className="flex flex-col gap-2">
        <Button type="submit" variant="outline" size="lg" className="h-11">
          Se déconnecter
        </Button>
        <p className="text-sm text-muted-foreground">
          Tu auras besoin de ton lien personnel pour revenir.
        </p>
      </form>
    </div>
  )
}

export { Home }
