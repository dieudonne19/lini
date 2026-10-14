import type { CSSProperties } from "react"
import { INK } from "../../lib/palette"

type PegProps = {
  x: number
  y: number
  scale?: number
  /** Couleur du vêtement. */
  color: string
  /** Couleur de la peau. */
  skin: string
}

/** Un personnage. Il pose ses pieds au point (x, y). */
export function Peg({ x, y, scale = 1, color, skin }: PegProps) {
  const style = { "--c": color, "--s": skin } as CSSProperties
  return (
    <use
      href="#lini-peg"
      transform={`translate(${x} ${y}) scale(${scale})`}
      style={style}
    />
  )
}

type ArmProps = {
  /** Tracé du bras (courbe SVG). */
  d: string
  color: string
  width?: number
}

/** Un bras : un trait de couleur entouré du trait marine. */
export function Arm({ d, color, width = 8 }: ArmProps) {
  return (
    <>
      <path
        d={d}
        fill="none"
        stroke={INK}
        strokeWidth={width + 7}
        strokeLinecap="round"
      />
      <path
        d={d}
        fill="none"
        stroke={color}
        strokeWidth={width}
        strokeLinecap="round"
      />
    </>
  )
}
