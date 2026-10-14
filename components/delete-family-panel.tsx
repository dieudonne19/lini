"use client"

import { useActionState } from "react"

import { deleteFamilyAction } from "@/app/famille/actions"
import { ConfirmDelete } from "@/components/confirm-delete"

// Container: deleting the whole family, in two steps. On success the parent is signed out and sent to the home page.
export function DeleteFamilyPanel() {
  const [state, action, pending] = useActionState(deleteFamilyAction, null)

  return (
    <ConfirmDelete
      label="Supprimer la famille"
      confirmLabel="Supprimer la famille et toutes ses données"
      pendingLabel="Suppression…"
      action={action}
      pending={pending}
      message={state?.message}
    >
      Cette action est définitive. Les membres, les activités, les événements et
      les réponses sont supprimés, et le lien de chaque membre cesse de
      fonctionner.
    </ConfirmDelete>
  )
}
