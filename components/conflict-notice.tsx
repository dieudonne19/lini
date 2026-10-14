import { MemberAvatar } from "@/components/member-avatar"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import type { ScheduleMember } from "@/lib/schedule"

type ConflictNoticeProps = {
  status: "idle" | "loading" | "error" | "ready"
  conflicts: ScheduleMember[]
  onRetry?: () => void
}

// Pure: who is busy during the event being typed. Only members are named, never what they are doing.
// It is information, not a block: the person can go on. The region is announced politely as it changes.
function ConflictNotice({ status, conflicts, onRetry }: ConflictNoticeProps) {
  return (
    <div aria-live="polite">
      {status === "loading" && (
        <p className="text-sm text-muted-foreground">
          Vérification des agendas…
        </p>
      )}
      {status === "error" && (
        <Alert variant="destructive" role="alert">
          <AlertTitle>Impossible de vérifier les agendas</AlertTitle>
          <AlertDescription className="flex flex-col items-start gap-2">
            Tu peux continuer quand même.
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
      {status === "ready" && conflicts.length === 0 && (
        <Alert role="status">
          <AlertTitle>
            Personne n&apos;a d&apos;activité à ce moment-là
          </AlertTitle>
        </Alert>
      )}
      {status === "ready" && conflicts.length > 0 && (
        <Alert role="status">
          <AlertTitle>Occupés à ce moment-là</AlertTitle>
          <AlertDescription className="flex flex-col gap-3">
            <ul className="flex flex-wrap gap-x-4 gap-y-2">
              {conflicts.map((member) => (
                <li key={member.id} className="flex items-center gap-2">
                  <MemberAvatar name={member.name} color={member.color} />
                  <span className="font-medium text-foreground">
                    {member.name}
                  </span>
                </li>
              ))}
            </ul>
            <span>Tu peux continuer quand même.</span>
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}

export { ConflictNotice }
