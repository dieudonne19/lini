import { CalendarOff } from "lucide-react"

// Pure: nothing planned in the displayed period.
function AgendaEmpty() {
  return (
    <div className="flex flex-col gap-1">
      <CalendarOff aria-hidden className="mb-1 size-6 text-muted-foreground" />
      <p className="font-medium">Rien de prévu dans les 14 prochains jours</p>
      <p className="text-muted-foreground">
        Les activités que tu ajouteras apparaîtront ici.
      </p>
    </div>
  )
}

export { AgendaEmpty }
