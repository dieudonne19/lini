"use client"

import { useActionState, useState } from "react"

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
export function AddMemberPanel() {
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
      <DialogTrigger render={<Button size="lg" className="h-11" />}>
        Ajouter un membre
      </DialogTrigger>
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
