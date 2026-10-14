"use client"

import { Check, Copy } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useCopy } from "@/hooks/use-copy"

// A recovery code shown once, with its copy button and what it is for. It keeps its own "copied" state so it can
// sit next to a personal link that has its own copy button.
function RecoveryCode({ code }: { code: string }) {
  const { copied, copy } = useCopy()
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <p className="text-sm font-semibold">Code de secours</p>
        <p className="text-sm text-muted-foreground">
          Garde-le hors de Lini (papier, gestionnaire de mots de passe). Si tu
          perds ton lien, il te permet de retrouver ton accès. Il fonctionne une
          seule fois : un nouveau code s&apos;affiche ensuite.
        </p>
      </div>
      <div className="flex flex-col gap-2 sm:flex-row">
        <Input
          readOnly
          value={code}
          aria-label="Code de secours"
          onFocus={(e) => e.currentTarget.select()}
          className="min-w-0 flex-1 font-mono text-base tracking-wider"
        />
        <Button
          type="button"
          variant="outline"
          size="lg"
          className="h-11 shrink-0 bg-card"
          onClick={() => copy(code)}
        >
          {copied ? <Check aria-hidden /> : <Copy aria-hidden />}
          {copied ? "Code copié" : "Copier le code"}
        </Button>
      </div>
      <p role="status" className="sr-only">
        {copied ? "Code copié." : ""}
      </p>
    </div>
  )
}

export { RecoveryCode }
