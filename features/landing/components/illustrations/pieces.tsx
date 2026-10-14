import { Fragment } from "react"

type PieceKind = "r" | "c" | "t" | "s" | "heart" | "star"

export type Piece = {
  k: PieceKind
  x: number
  y: number
  color: string
  rot?: number
  scale?: number
}

const SHAPE_ID = {
  r: "lini-cf-r",
  c: "lini-cf-c",
  heart: "lini-heart",
  star: "lini-star",
} as const

/**
 * Dessine une liste de confettis, cœurs et étoiles à partir de données.
 * `animate` : les confettis flottent un peu et les cœurs s'élèvent (styles dans landing.css), chacun avec son retard.
 */
export function Pieces({
  items,
  animate,
}: {
  items: Piece[]
  animate?: boolean
}) {
  return (
    <>
      {items.map((p, i) => {
        const transform =
          `translate(${p.x} ${p.y})` +
          (p.rot ? ` rotate(${p.rot})` : "") +
          (p.scale ? ` scale(${p.scale})` : "")

        const shape =
          p.k === "s" ? (
            <use href="#lini-cf-s" transform={transform} stroke={p.color} />
          ) : p.k === "t" ? (
            <use
              href="#lini-cf-t"
              transform={transform}
              fill={p.color}
              stroke={p.color}
            />
          ) : (
            <use
              href={`#${SHAPE_ID[p.k]}`}
              transform={transform}
              fill={p.color}
            />
          )

        if (!animate) return <Fragment key={i}>{shape}</Fragment>
        return (
          <g
            key={i}
            className={p.k === "heart" ? "lini-rise" : "lini-float"}
            style={{ animationDelay: `${(i * 97) % 550}ms` }}
          >
            {shape}
          </g>
        )
      })}
    </>
  )
}
