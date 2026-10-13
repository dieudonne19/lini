// Text color that stays readable on a member's color: white or the Lini navy, whichever contrasts more.
const WHITE = "#FFFFFF"
const NAVY = "#1F2540"

// WCAG relative luminance of a "#RRGGBB" color.
function luminance(hex: string) {
  const value = parseInt(hex.slice(1), 16)
  const [r, g, b] = [value >> 16, (value >> 8) & 255, value & 255].map(
    (channel) => {
      const c = channel / 255
      return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
    }
  )
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

export function contrastRatio(a: string, b: string) {
  const [lighter, darker] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (lighter + 0.05) / (darker + 0.05)
}

export function readableTextColor(background: string) {
  return contrastRatio(background, WHITE) >= contrastRatio(background, NAVY)
    ? WHITE
    : NAVY
}
