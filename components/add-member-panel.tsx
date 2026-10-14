"use client"

import { useActionState, useState } from "react"
import { Plus } from "lucide-react"

import { addMember } from "@/app/famille/actions"
import { AddMemberForm } from "@/components/add-member-form"
import { PersonalLinkCard } from "@/components/personal-link-card"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useCopy } from "@/hooks/use-copy"
import { useOneTimeLink } from "@/hooks/use-one-time-link"
import { personalLink } from "@/lib/links"

// Container: a button that opens the form in a dialog, then the new member's one-time link in the same dialog.
// While the link is shown the dialog cannot be closed by accident (Escape, click outside): it never shows again.
// `variant="child"` is the dashed row at the end of the children of the family tree; the default is the main button.
export function AddMemberPanel({
  variant = "primary",
}: {
  variant?: "primary" | "child"
}) {
  const [open, setOpen] = useState(false)
  const [state, action, pending] = useActionState(addMember, null)
  const { copied, copy } = useCopy()
  const { visibleToken, dismiss } = useOneTimeLink(state?.token)
  const link = visibleToken
    ? personalLink(window.location.origin, visibleToken)
    : undefined

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next && visibleToken) return
        setOpen(next)
      }}
    >
      {variant === "child" ? (
        <DialogTrigger
          render={
            <button
              type="button"
              className="flex min-h-14 w-full cursor-pointer items-center gap-4 rounded-lg py-2 text-left font-medium outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
            />
          }
        >
          <span className="relative flex size-9 shrink-0 items-center justify-center rounded-full border-2 border-dashed border-muted-foreground bg-background">
            <Plus aria-hidden className="size-4" />
          </span>
          Ajouter un enfant
        </DialogTrigger>
      ) : (
        <DialogTrigger render={<Button size="lg" className="h-11" />}>
          <Plus aria-hidden />
          Ajouter un membre
        </DialogTrigger>
      )}
      <DialogContent showCloseButton={!visibleToken}>
        {link ? (
          <>
            <DialogHeader>
              <DialogTitle>Lien de {state?.memberName}</DialogTitle>
              <DialogDescription>
                Envoie-lui ce lien : il ne s&apos;affichera plus. Quiconque
                l&apos;a est {state?.memberName}.
              </DialogDescription>
            </DialogHeader>
            <PersonalLinkCard
              link={link}
              copied={copied}
              onCopy={() => copy(link)}
              continueLabel="Terminer"
              onContinue={() => {
                dismiss()
                setOpen(false)
              }}
            />
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Ajouter un membre</DialogTitle>
            </DialogHeader>
            <AddMemberForm
              action={action}
              pending={pending}
              state={state?.token ? null : state}
            />
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
