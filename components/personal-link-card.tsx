import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

type PersonalLinkCardProps = {
  link: string
  copied: boolean
  onCopy: () => void
  onContinue: () => void
}

// Pure presentation of the one-time personal link.
function PersonalLinkCard({ link, copied, onCopy, onContinue }: PersonalLinkCardProps) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">Ta famille est créée</h1>
        <p className="text-muted-foreground">
          Voici ton lien personnel. Il te connecte sans mot de passe et ne s&apos;affichera plus : copie-le
          maintenant. Quiconque a ce lien est toi, ne le partage pas.
        </p>
      </div>
      <Input
        readOnly
        value={link}
        aria-label="Ton lien personnel"
        onFocus={(e) => e.currentTarget.select()}
        className="font-mono text-sm"
      />
      <div className="flex flex-col gap-3">
        <Button size="lg" className="h-11" onClick={onCopy}>
          Copier le lien
        </Button>
        <p role="status" className="min-h-5 text-sm text-muted-foreground">
          {copied ? "Lien copié." : ""}
        </p>
        <Button variant="outline" size="lg" className="h-11" onClick={onContinue}>
          Ouvrir l&apos;agenda
        </Button>
      </div>
    </div>
  )
}

export { PersonalLinkCard }
