import { MEMBER as M, SKIN } from "../../lib/palette"
import { Peg } from "./peg"

/** Quatre membres côte à côte, comme sur une photo de groupe, debout sur le titre. */
export function FamilyPhoto({ className }: { className?: string }) {
  return (
    <svg
      viewBox="62 0 196 148"
      className={className}
      role="img"
      aria-label="Quatre membres de la famille posent côte à côte, debout sur le titre."
    >
      <Peg x={82} y={146} scale={0.85} color={M.green} skin={SKIN.warm} />
      <Peg x={130} y={146} scale={1.2} color={M.blue} skin={SKIN.deep} />
      <Peg x={190} y={146} scale={1.2} color={M.orange} skin={SKIN.light} />
      <Peg x={238} y={146} scale={0.85} color={M.violet} skin={SKIN.brown} />
    </svg>
  )
}
