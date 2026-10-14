import { GROUND, MEMBER as M, SKIN } from "../../lib/palette"
import { Arm, Peg } from "./peg"
import { Pieces, type Piece } from "./pieces"

const DECOR: Piece[] = [
  { k: "r", x: 50, y: 60, rot: 20, color: M.blue },
  { k: "c", x: 96, y: 120, color: M.orange },
  { k: "t", x: 430, y: 80, rot: 30, color: M.green },
  { k: "s", x: 396, y: 140, rot: -15, color: M.violet },
  { k: "r", x: 420, y: 200, rot: -35, color: M.rose },
  { k: "c", x: 40, y: 200, color: M.teal },
  { k: "star", x: 120, y: 70, scale: 1.1, color: M.orange },
  { k: "star", x: 360, y: 60, scale: 0.8, color: M.blue },
  { k: "heart", x: 240, y: 196, scale: 1.5, color: M.rose },
  { k: "heart", x: 190, y: 160, scale: 0.8, color: M.red },
  { k: "heart", x: 292, y: 166, scale: 0.9, color: M.violet },
]

export function HugIllustration({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 480 420"
      className={className}
      role="img"
      aria-label="Quatre membres de la famille serrés les uns contre les autres, deux parents et deux enfants, avec des cœurs au-dessus d'eux."
    >
      <ellipse cx={240} cy={364} rx={210} ry={16} fill={GROUND} />
      <Pieces items={DECOR} />

      <Peg x={100} y={364} scale={0.8} color={M.green} skin={SKIN.warm} />
      <Peg x={188} y={364} scale={1.3} color={M.blue} skin={SKIN.deep} />
      <Peg x={296} y={364} scale={1.3} color={M.orange} skin={SKIN.light} />
      <Peg x={386} y={364} scale={0.85} color={M.violet} skin={SKIN.brown} />

      <Arm d="M214 330Q242 312 270 332" color={M.blue} width={9} />
      <Arm d="M164 330Q138 316 112 336" color={M.blue} width={9} />
      <Arm d="M322 330Q348 316 372 338" color={M.orange} width={9} />
    </svg>
  )
}
