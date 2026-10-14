import { Check, Copy, KeyRound, LinkIcon, X } from "lucide-react"

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
  // A cross in the corner, for a card that sits in a page next to other content.
  onDismiss?: () => void
  // A last step, for a card that ends a flow ("Ouvrir la semaine", "Terminer").
  continueLabel?: string
  onContinue?: () => void
}

// Pure presentation of a one-time personal link: a tinted card with a key badge, the link and its copy button.
// Compact on purpose, so that it is never taken for the title of the page it appears in.
function PersonalLinkCard({
  title,
  headingLevel: Heading = "h2",
  children,
  link,
  copied,
  onCopy,
  onDismiss,
  continueLabel,
  onContinue,
}: PersonalLinkCardProps) {
  return (
    <div className="relative flex flex-col gap-4 rounded-lg bg-primary/10 p-4 ring-1 ring-primary/20 sm:p-5">
      {onDismiss && (
        <Button
          type="button"
          variant="ghost"
          size="icon-lg"
          aria-label="Fermer"
          onClick={onDismiss}
          className="absolute top-2 right-2 text-muted-foreground"
        >
          <X aria-hidden />
        </Button>
      )}
      {(title || children) && (
        <div className={`flex gap-3 ${onDismiss ? "pr-10" : ""}`}>
          <span
            aria-hidden
            className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary"
          >
            <LinkIcon className="size-5" />
          </span>
          <div className="flex min-w-0 flex-col gap-1">
            {title && (
              <Heading className="font-heading text-lg leading-snug font-semibold sm:text-xl">
                {title}
              </Heading>
            )}
            {children && (
              <p className="text-sm text-muted-foreground">{children}</p>
            )}
          </div>
        </div>
      )}
      <div className="flex flex-col gap-2 sm:flex-row">
        <Input
          readOnly
          value={link}
          aria-label="Lien personnel"
          onFocus={(e) => e.currentTarget.select()}
          className="min-w-0 flex-1 font-mono text-sm"
        />
        <Button size="lg" className="h-11 shrink-0" onClick={onCopy}>
          {copied ? <Check aria-hidden /> : <Copy aria-hidden />}
          {copied ? "Lien copié" : "Copier le lien"}
        </Button>
      </div>
      <p role="status" className="sr-only">
        {copied ? "Lien copié." : ""}
      </p>
      {continueLabel && onContinue && (
        <Button
          variant="outline"
          size="lg"
          className="h-11"
          onClick={onContinue}
        >
          {continueLabel}
        </Button>
      )}
    </div>
  )
}

export { PersonalLinkCard }
