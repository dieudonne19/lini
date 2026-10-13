import { useState } from "react"

// A one-time link stays visible until the user dismisses it. A new token shows again.
export function useOneTimeLink(token: string | undefined) {
  const [dismissedToken, setDismissedToken] = useState<string>()
  return {
    visibleToken: token && token !== dismissedToken ? token : undefined,
    dismiss: () => setDismissedToken(token),
  }
}
