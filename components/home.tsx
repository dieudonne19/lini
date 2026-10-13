import { Button } from "@/components/ui/button"

type HomeProps = {
  name: string
  logoutAction: () => void
}

function Home({ name, logoutAction }: HomeProps) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">Bonjour {name}</h1>
        <p className="text-muted-foreground">Ton agenda arrive bientôt.</p>
      </div>
      <form action={logoutAction} className="flex flex-col gap-2">
        <Button type="submit" variant="outline" size="lg" className="h-11">
          Se déconnecter
        </Button>
        <p className="text-sm text-muted-foreground">Tu auras besoin de ton lien personnel pour revenir.</p>
      </form>
    </div>
  )
}

export { Home }
