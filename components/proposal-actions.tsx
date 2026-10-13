import { Button } from "@/components/ui/button"

type ProposalActionsProps = {
  eventId: string
  // A form action: the button that is pressed tells which one ("validate" or "refuse").
  action: (formData: FormData) => void
  pending: boolean
}

// Pure: the two decisions a parent takes on a proposal. Refusing removes the proposal.
function ProposalActions({ eventId, action, pending }: ProposalActionsProps) {
  return (
    <form action={action} className="flex flex-wrap gap-2">
      <input type="hidden" name="eventId" value={eventId} />
      <Button
        type="submit"
        name="intent"
        value="validate"
        className="h-11"
        disabled={pending}
      >
        Valider
      </Button>
      <Button
        type="submit"
        name="intent"
        value="refuse"
        variant="outline"
        className="h-11"
        disabled={pending}
      >
        Refuser
      </Button>
    </form>
  )
}

export { ProposalActions }
