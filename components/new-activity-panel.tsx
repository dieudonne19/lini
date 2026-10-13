"use client"

import { ActivityForm } from "@/components/activity-form"
import { useActivityForm } from "@/hooks/use-activity-form"

// Container: wires the activity form to the creation action.
export function NewActivityPanel() {
  const { state, action, pending } = useActivityForm()
  return (
    <ActivityForm
      action={action}
      pending={pending}
      state={state}
      submitLabel="Ajouter l'activité"
      cancelHref="/agenda"
    />
  )
}
