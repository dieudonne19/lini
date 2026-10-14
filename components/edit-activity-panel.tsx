"use client"

import { useActionState } from "react"

import {
  deleteActivityAction,
  updateActivityAction,
} from "@/app/agenda/actions"
import { ActivityForm } from "@/components/activity-form"
import { ConfirmDelete } from "@/components/confirm-delete"
import { useActivityForm } from "@/hooks/use-activity-form"
import { useIsClient } from "@/hooks/use-is-client"
import { activityToFields, toFormValues } from "@/lib/activity-form"
import type { AgendaActivity } from "@/lib/agenda"

// Container: the activity form filled with the stored activity, and its deletion.
// The fields are shown in the device timezone, so the form waits for the browser.
export function EditActivityPanel({ activity }: { activity: AgendaActivity }) {
  const isClient = useIsClient()
  const { state, action, pending } = useActivityForm((payload) =>
    updateActivityAction(activity.id, payload)
  )
  const [deleteState, deleteAction, deleting] = useActionState(
    () => deleteActivityAction(activity.id),
    null
  )

  if (!isClient)
    return (
      <div aria-hidden className="h-96 animate-pulse rounded-lg bg-muted" />
    )
  return (
    <div className="flex flex-col gap-8">
      <ActivityForm
        action={action}
        pending={pending}
        state={state}
        initialValues={toFormValues(activityToFields(activity))}
        submitLabel="Enregistrer"
        cancelHref="/agenda"
      />
      <ConfirmDelete
        label="Supprimer l'activité"
        confirmLabel="Supprimer l'activité"
        pendingLabel="Suppression…"
        action={deleteAction}
        pending={deleting}
        message={deleteState?.message}
      >
        Supprimer « {activity.title} »{" "}
        {activity.repeat !== "none" ? "supprime toutes ses répétitions. " : ""}
        Cette action est définitive.
      </ConfirmDelete>
    </div>
  )
}
