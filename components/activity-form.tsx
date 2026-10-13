"use client"

import Link from "next/link"
import { useState } from "react"

import { Button, buttonVariants } from "@/components/ui/button"
import { CheckboxField } from "@/components/ui/checkbox-field"
import { SelectField } from "@/components/ui/select-field"
import { TextField } from "@/components/ui/text-field"
import type { ActivityField } from "@/hooks/use-activity-form"
import type { FormState } from "@/lib/form-state"

const REPEAT_OPTIONS = [
  { value: "none", label: "Une seule fois" },
  { value: "daily", label: "Chaque jour" },
  { value: "weekly", label: "Chaque semaine" },
] as const

type ActivityFormProps = {
  action: (formData: FormData) => void
  pending: boolean
  state: FormState<ActivityField>
  submitLabel: string
  cancelHref: string
}

// Presentation of the activity form. Its only state is which optional fields are shown
// (times when the activity is not all-day, end of repetition when it repeats).
function ActivityForm({
  action,
  pending,
  state,
  submitLabel,
  cancelHref,
}: ActivityFormProps) {
  const { errors, values, message } = state ?? {}
  const [allDay, setAllDay] = useState(values?.allDay === "true")
  const [repeat, setRepeat] = useState(values?.repeat || "none")

  return (
    <form action={action} className="flex flex-col gap-6" noValidate>
      {message && (
        <p
          role="alert"
          className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive"
        >
          {message}
        </p>
      )}
      <TextField
        id="title"
        name="title"
        label="Titre"
        required
        maxLength={80}
        autoComplete="off"
        defaultValue={values?.title}
        errors={errors?.title}
      />
      <TextField
        id="date"
        name="date"
        type="date"
        label="Jour"
        required
        defaultValue={values?.date}
        errors={errors?.date}
      />
      <CheckboxField
        id="allDay"
        name="allDay"
        label="Journée entière"
        checked={allDay}
        onChange={(e) => setAllDay(e.target.checked)}
      />
      {!allDay && (
        <div className="grid grid-cols-2 gap-4">
          <TextField
            id="startTime"
            name="startTime"
            type="time"
            label="Début"
            required
            defaultValue={values?.startTime}
            errors={errors?.startTime}
          />
          <TextField
            id="endTime"
            name="endTime"
            type="time"
            label="Fin"
            required
            defaultValue={values?.endTime}
            errors={errors?.endTime}
          />
        </div>
      )}
      <CheckboxField
        id="isPrivate"
        name="isPrivate"
        label="Privée"
        defaultChecked={values?.isPrivate === "true"}
        hint="Les autres membres voient « Occupé » et les heures, jamais le titre."
      />
      <SelectField
        id="repeat"
        name="repeat"
        label="Répétition"
        options={REPEAT_OPTIONS}
        value={repeat}
        onChange={(e) => setRepeat(e.target.value)}
        errors={errors?.repeat}
      />
      {repeat !== "none" && (
        <TextField
          id="repeatUntil"
          name="repeatUntil"
          type="date"
          label="Jusqu'au (facultatif)"
          hint="Sans date, l'activité se répète sans fin."
          defaultValue={values?.repeatUntil}
          errors={errors?.repeatUntil}
        />
      )}
      <div className="flex flex-col gap-3">
        <Button type="submit" size="lg" className="h-11" disabled={pending}>
          {pending ? "Enregistrement…" : submitLabel}
        </Button>
        <Link
          href={cancelHref}
          className={buttonVariants({
            variant: "outline",
            size: "lg",
            className: "h-11",
          })}
        >
          Annuler
        </Link>
      </div>
    </form>
  )
}

export { ActivityForm }
