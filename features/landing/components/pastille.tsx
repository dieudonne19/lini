import type { CSSProperties } from "react"
import { Lock } from "lucide-react"
import { cn } from "@/lib/utils"

type PastilleProps = {
  /** Couleur du membre (liseré à gauche, fond teinté à 16 %). */
  color?: string
  title: string
  time?: string
  /** member : activité d'un membre · event : événement de la famille · busy : activité privée vue par les autres. */
  variant?: "member" | "event" | "busy"
  className?: string
  style?: CSSProperties
}

/** La pastille d'activité de Lini, telle qu'elle apparaît dans l'agenda. */
export function Pastille({
  color,
  title,
  time,
  variant = "member",
  className,
  style,
}: PastilleProps) {
  if (variant === "busy") {
    return (
      <span
        className={cn(
          "flex items-center gap-1.5 rounded-lg border-l-4 border-l-[#848796] bg-[#eceef3] px-2 py-1.5 text-xs leading-snug font-medium text-foreground",
          className
        )}
        style={style}
      >
        <Lock className="size-3 shrink-0" aria-hidden="true" />
        Occupé
      </span>
    )
  }

  if (variant === "event") {
    return (
      <span
        className={cn(
          "block rounded-lg border-l-4 border-l-foreground bg-foreground px-2 py-1.5 text-xs leading-snug font-medium text-background",
          className
        )}
        style={style}
      >
        {title}
        {time && (
          <small className="block text-xs font-normal text-background/80">
            {time}
          </small>
        )}
      </span>
    )
  }

  return (
    <span
      className={cn(
        "block rounded-lg border-l-4 border-l-(color:--m) bg-[color-mix(in_oklab,var(--m)_16%,white)] px-2 py-1.5 text-xs leading-snug font-medium text-foreground",
        className
      )}
      style={{ "--m": color, ...style } as CSSProperties}
    >
      {title}
      {time && (
        <small className="block text-xs font-normal text-muted-foreground">
          {time}
        </small>
      )}
    </span>
  )
}

type MemberAvatarProps = {
  letter: string
  color: string
  className?: string
}

/** Pastille ronde avec l'initiale du membre. */
export function MemberAvatar({ letter, color, className }: MemberAvatarProps) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "grid size-9 shrink-0 place-items-center rounded-full font-heading text-base font-bold text-foreground",
        className
      )}
      style={{ backgroundColor: color }}
    >
      {letter}
    </span>
  )
}
