import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

type PersonalLinkCardProps = {
  // Both are left out when the card sits inside a dialog that already says them.
  title?: string
  // h1 when the card is the page's main heading, h2 inside a page that already has one.
  headingLevel?: "h1" | "h2"
  // Explains who the link is for and that it is shown once.
  children?: React.ReactNode
  link: string
  copied: boolean
  onCopy: () => void
  continueLabel: string
  onContinue: () => void
}

// Pure presentation of a one-time personal link.
function PersonalLinkCard({
  title,
  headingLevel: Heading = "h2",
  children,
  link,
  copied,
  onCopy,
  continueLabel,
  onContinue,
}: PersonalLinkCardProps) {
  return (
    <div className="flex flex-col gap-6">
      {(title || children) && (
        <div className="flex flex-col gap-2">
          {title && (
            <Heading className="text-3xl font-semibold tracking-tight sm:text-4xl">
              {title}
            </Heading>
          )}
          {children && <p className="text-muted-foreground">{children}</p>}
        </div>
      )}
      <Input
        readOnly
        value={link}
        aria-label="Lien personnel"
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
        <Button
          variant="outline"
          size="lg"
          className="h-11"
          onClick={onContinue}
        >
          {continueLabel}
        </Button>
      </div>
    </div>
  )
}

export { PersonalLinkCard }
