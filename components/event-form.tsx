"use client"

import Link from "next/link"

import { Button, buttonVariants } from "@/components/ui/button"
import { CheckboxField } from "@/components/ui/checkbox-field"
import { TextareaField } from "@/components/ui/textarea-field"
import { TextField } from "@/components/ui/text-field"
import type { EventField } from "@/hooks/use-event-form"
import type { WhenFields } from "@/lib/event-form"
import type { FormState } from "@/lib/form-state"

type EventFormProps = {
  action: (formData: FormData) => void
  pending: boolean
  state: FormState<EventField>
  // What the texts start with (editing); once submitted, what was typed takes over.
  initialValues?: Record<EventField, string>
  // The dates and times are held by the caller, which reads them (conflicts) and fills them (free slots).
  when: WhenFields
  onWhenChange: (patch: Partial<WhenFields>) => void
  // Shown right under the dates and times, e.g. who is busy then.
  whenExtras?: React.ReactNode
  // Said above the fields, e.g. that a parent must validate a proposal first.
  intro?: string
  submitLabel: string
  cancelHref: string
}

// Presentation of the event form. The times are shown only when the event is not all-day.
function EventForm({
  action,
  pending,
  state,
  initialValues,
  when,
  onWhenChange,
  whenExtras,
  intro,
  submitLabel,
  cancelHref,
}: EventFormProps) {
  const { errors, message } = state ?? {}
  const values = state?.values ?? initialValues

  return (
    <form action={action} className="flex flex-col gap-6" noValidate>
      {intro && <p className="text-muted-foreground">{intro}</p>}
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
        id="place"
        name="place"
        label="Lieu (facultatif)"
        maxLength={80}
        autoComplete="off"
        defaultValue={values?.place}
        errors={errors?.place}
      />
      <TextareaField
        id="description"
        name="description"
        label="Description (facultatif)"
        maxLength={500}
        defaultValue={values?.description}
        errors={errors?.description}
      />
      <div className="grid grid-cols-2 gap-4">
        <TextField
          id="startDate"
          name="startDate"
          type="date"
          label="Du"
          required
          value={when.startDate}
          onChange={(event) => onWhenChange({ startDate: event.target.value })}
          errors={errors?.startDate}
        />
        <TextField
          id="endDate"
          name="endDate"
          type="date"
          label="Au (facultatif)"
          value={when.endDate}
          onChange={(event) => onWhenChange({ endDate: event.target.value })}
          errors={errors?.endDate}
        />
      </div>
      <p className="-mt-3 text-sm text-muted-foreground">
        Laisse « Au » vide pour un événement sur un seul jour.
      </p>
      <CheckboxField
        id="allDay"
        name="allDay"
        label="Journée entière"
        checked={when.allDay}
        onChange={(event) => onWhenChange({ allDay: event.target.checked })}
      />
      {!when.allDay && (
        <div className="grid grid-cols-2 gap-4">
          <TextField
            id="startTime"
            name="startTime"
            type="time"
            label="Début"
            required
            value={when.startTime}
            onChange={(event) =>
              onWhenChange({ startTime: event.target.value })
            }
            errors={errors?.startTime}
          />
          <TextField
            id="endTime"
            name="endTime"
            type="time"
            label="Fin"
            required
            value={when.endTime}
            onChange={(event) => onWhenChange({ endTime: event.target.value })}
            errors={errors?.endTime}
          />
        </div>
      )}
      {whenExtras}
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

export { EventForm }
