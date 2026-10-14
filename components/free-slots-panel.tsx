import { ChevronDown } from "lucide-react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button, buttonVariants } from "@/components/ui/button"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { groupSlotsByDay, type FreeSlot } from "@/lib/free-slots"
import {
  formatDayHeading,
  formatFullDay,
  formatTimeRange,
} from "@/lib/format-date"

type FreeSlotsPanelProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  status: "idle" | "loading" | "error" | "ready"
  slots: FreeSlot[]
  today: Date
  // The slot last chosen, announced so that a screen reader knows the fields were filled.
  picked: FreeSlot | null
  onPick: (slot: FreeSlot) => void
  onRetry?: () => void
}

const range = (slot: FreeSlot) =>
  formatTimeRange({ startsAt: slot.start, endsAt: slot.end, allDay: false })

// Pure: a folded panel that lists, day by day, when nobody in the family has an activity. Choosing a slot
// fills the dates and times of the form. Nothing is listed until the schedule is loaded.
function FreeSlotsPanel({
  open,
  onOpenChange,
  status,
  slots,
  today,
  picked,
  onPick,
  onRetry,
}: FreeSlotsPanelProps) {
  return (
    <Collapsible
      open={open}
      onOpenChange={onOpenChange}
      className="flex flex-col gap-3"
    >
      <CollapsibleTrigger
        className={`group ${buttonVariants({ variant: "outline", className: "h-11 w-full justify-between border-input" })}`}
      >
        Trouver un créneau où tout le monde est libre
        <ChevronDown
          aria-hidden
          className="transition-transform group-data-[panel-open]:rotate-180"
        />
      </CollapsibleTrigger>
      <CollapsibleContent className="flex flex-col gap-4">
        {status === "loading" && (
          <p role="status" className="text-sm text-muted-foreground">
            Recherche d&apos;un créneau…
          </p>
        )}
        {status === "error" && (
          <Alert variant="destructive">
            <AlertTitle>Impossible de chercher un créneau</AlertTitle>
            <AlertDescription className="flex flex-col items-start gap-2">
              Tu peux quand même choisir les dates toi-même.
              {onRetry && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-9"
                  onClick={onRetry}
                >
                  Réessayer
                </Button>
              )}
            </AlertDescription>
          </Alert>
        )}
        {status === "ready" && slots.length === 0 && (
          <p className="text-sm text-muted-foreground">
            Personne n&apos;est libre en même temps dans les 14 prochains jours.
          </p>
        )}
        {status === "ready" &&
          groupSlotsByDay(slots).map(({ day, slots: daySlots }) => (
            <section key={day.getTime()}>
              <h3 className="mb-2 text-sm font-semibold">
                {formatDayHeading(day, today)}
              </h3>
              <ul className="flex flex-wrap gap-2">
                {daySlots.map((slot) => (
                  <li key={slot.start.getTime()}>
                    <Button
                      type="button"
                      variant="outline"
                      className="h-11"
                      aria-label={`${formatFullDay(slot.start)}, ${range(slot)}${slot.wholeDay ? ", toute la journée" : ""}`}
                      onClick={() => onPick(slot)}
                    >
                      {range(slot)}
                      {slot.wholeDay && " · toute la journée"}
                    </Button>
                  </li>
                ))}
              </ul>
            </section>
          ))}
      </CollapsibleContent>
      {picked && (
        <p role="status" className="text-sm font-medium">
          Créneau choisi : {formatFullDay(picked.start)}, {range(picked)}.
        </p>
      )}
    </Collapsible>
  )
}

export { FreeSlotsPanel }
