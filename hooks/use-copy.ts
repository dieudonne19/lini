import { useState } from "react"

// Copies text to the clipboard and tracks whether the last copy worked.
export function useCopy() {
  const [copied, setCopied] = useState(false)

  async function copy(text: string) {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
    } catch {
      // Clipboard blocked: the text stays selectable in its field.
      setCopied(false)
    }
  }

  return { copied, copy }
}
