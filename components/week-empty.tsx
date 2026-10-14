import { CalendarOff, Plus } from "lucide-react"
import Link from "next/link"

import { buttonVariants } from "@/components/ui/button"

// Pure: nothing planned this week by anyone.
function WeekEmpty() {
  return (
    <div className="flex flex-col items-start gap-3 rounded-lg border border-dashed border-border p-4">
      <div className="flex flex-col gap-1">
        <CalendarOff
          aria-hidden
          className="mb-1 size-6 text-muted-foreground"
        />
        <p className="font-medium">Rien de prévu cette semaine</p>
        <p className="text-muted-foreground">
          Les activités de la famille apparaîtront ici, membre par membre.
        </p>
      </div>
      <Link
        href="/agenda/nouvelle"
        className={buttonVariants({ className: "h-11" })}
      >
        <Plus aria-hidden />
        Ajouter une activité
      </Link>
    </div>
  )
}

export { WeekEmpty }
