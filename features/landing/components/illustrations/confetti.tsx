import { MEMBER as M } from "../../lib/palette"
import { Pieces, type Piece } from "./pieces"

const STRIP: Piece[] = [
  { k: "r", x: 20, y: 20, rot: 20, color: M.blue },
  { k: "c", x: 50, y: 56, color: M.orange },
  { k: "t", x: 84, y: 24, rot: 30, color: M.green },
  { k: "s", x: 130, y: 50, rot: -10, color: M.violet },
  { k: "r", x: 172, y: 18, rot: -30, color: M.rose },
  { k: "c", x: 206, y: 58, color: M.teal },
  { k: "t", x: 240, y: 26, rot: -20, color: M.orange },
  { k: "r", x: 280, y: 54, rot: 40, color: M.blue },
  { k: "s", x: 320, y: 22, rot: 12, color: M.green },
  { k: "c", x: 360, y: 52, color: M.rose },
  { k: "t", x: 396, y: 20, rot: 35, color: M.violet },
  { k: "r", x: 420, y: 58, rot: -25, color: M.orange },
]

/** Bande de confettis, purement décorative. */
export function ConfettiStrip({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 440 80" className={className} aria-hidden="true">
      <Pieces items={STRIP} animate />
    </svg>
  )
}

const BACKDROP: Piece[] = [
  { k: "r", x: 50, y: 70, rot: 20, color: M.blue },
  { k: "c", x: 110, y: 150, color: M.orange },
  { k: "t", x: 40, y: 330, rot: 35, color: M.green },
  { k: "s", x: 70, y: 540, rot: -10, color: M.violet },
  { k: "r", x: 470, y: 60, rot: -25, color: M.rose },
  { k: "c", x: 430, y: 140, color: M.teal },
  { k: "t", x: 480, y: 400, rot: -30, color: M.orange },
  { k: "s", x: 440, y: 560, rot: 15, color: M.green },
  { k: "heart", x: 70, y: 220, scale: 0.8, color: M.rose },
  { k: "star", x: 460, y: 240, scale: 1.1, color: M.orange },
]

/** Fond de confettis qui remplit son parent (le parent doit être en `relative`). */
export function ConfettiBackdrop() {
  return (
    <svg
      viewBox="0 0 520 600"
      preserveAspectRatio="xMidYMid slice"
      className="absolute inset-0 h-full w-full"
      aria-hidden="true"
    >
      <Pieces items={BACKDROP} />
    </svg>
  )
}
