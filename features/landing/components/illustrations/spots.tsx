import { INK, MEMBER as M, SKIN, TINT, GROUND } from "../../lib/palette"
import { Peg } from "./peg"
import { Pieces } from "./pieces"

type SpotProps = { className?: string }

/** Pastille ronde verte avec une coche. */
function CheckBadge({ cx, cy }: { cx: number; cy: number }) {
  return (
    <>
      <circle
        cx={cx}
        cy={cy}
        r={22}
        fill={M.green}
        stroke={INK}
        strokeWidth={5}
      />
      <path
        d={`M${cx - 10} ${cy}l8 8 14-16`}
        fill="none"
        stroke="#fff"
        strokeWidth={6}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </>
  )
}

/** Rien n'est oublié : un calendrier avec trois activités et une coche. */
export function CalendarSpot({ className }: SpotProps) {
  return (
    <svg viewBox="0 0 200 170" className={className} aria-hidden="true">
      <Pieces
        items={[
          { k: "c", x: 20, y: 40, color: M.orange },
          { k: "r", x: 184, y: 36, rot: 30, color: M.violet },
          { k: "t", x: 16, y: 120, rot: 20, color: M.blue },
        ]}
      />
      <rect
        x={30}
        y={34}
        width={140}
        height={110}
        rx={14}
        fill="#fff"
        stroke={INK}
        strokeWidth={6}
      />
      <path
        d="M30 66V48a14 14 0 0 1 14-14H156a14 14 0 0 1 14 14V66Z"
        fill={M.blue}
        stroke={INK}
        strokeWidth={6}
        strokeLinejoin="round"
      />
      <path
        d="M64 22V42M136 22V42"
        stroke={INK}
        strokeWidth={7}
        strokeLinecap="round"
      />
      <rect x={46} y={80} width={44} height={14} rx={3} fill={TINT.orange} />
      <rect x={46} y={80} width={4} height={14} fill={M.orange} />
      <rect x={102} y={80} width={50} height={14} rx={3} fill={TINT.green} />
      <rect x={102} y={80} width={4} height={14} fill={M.green} />
      <rect x={46} y={104} width={62} height={14} rx={3} fill={TINT.blue} />
      <rect x={46} y={104} width={4} height={14} fill={M.blue} />
      <CheckBadge cx={160} cy={130} />
    </svg>
  )
}

const FLAG_X = [43.6, 94, 144.4, 194.8, 245.2, 295.6, 346, 396.4]
const FLAG_Y = [31.8, 45.6, 54.8, 59.4, 59.4, 54.8, 45.6, 31.8]
const FLAG_COLORS = [
  M.blue,
  M.orange,
  M.green,
  M.violet,
  M.rose,
  M.teal,
  M.blue,
  M.orange,
]

/** Des événements communs : une guirlande de fanions. */
export function BuntingSpot({ className }: SpotProps) {
  return (
    <svg viewBox="0 0 440 110" className={className} aria-hidden="true">
      <path
        d="M10 20Q220 100 430 20"
        fill="none"
        stroke={INK}
        strokeWidth={3}
        strokeLinecap="round"
      />
      {FLAG_X.map((x, i) => {
        const y = FLAG_Y[i]
        return (
          <path
            key={x}
            d={`M${x - 13} ${y - 3}H${x + 13}L${x} ${y + 27}Z`}
            fill={FLAG_COLORS[i]}
            stroke={INK}
            strokeWidth={2.5}
            strokeLinejoin="round"
          />
        )
      })}
    </svg>
  )
}

/** Les parents gardent la main : un parent, un enfant, une coche. */
export function ParentsSpot({ className }: SpotProps) {
  return (
    <svg viewBox="0 0 200 170" className={className} aria-hidden="true">
      <Pieces
        items={[
          { k: "c", x: 24, y: 50, color: M.orange },
          { k: "r", x: 30, y: 110, rot: 25, color: M.violet },
          { k: "t", x: 120, y: 24, rot: -20, color: M.blue },
        ]}
      />
      <ellipse cx={100} cy={152} rx={76} ry={9} fill={GROUND} />
      <Peg x={78} y={150} color={M.blue} skin={SKIN.deep} />
      <Peg x={128} y={150} scale={0.75} color={M.green} skin={SKIN.warm} />
      <CheckBadge cx={164} cy={50} />
    </svg>
  )
}

/** Le privé reste privé : un cadenas violet. */
export function LockSpot({ className }: SpotProps) {
  return (
    <svg viewBox="0 0 200 170" className={className} aria-hidden="true">
      <Pieces
        items={[
          { k: "c", x: 32, y: 40, color: M.orange },
          { k: "r", x: 172, y: 52, rot: -25, color: M.rose },
          { k: "t", x: 40, y: 110, rot: 30, color: M.green },
        ]}
      />
      <path
        d="M76 70V52a24 24 0 0 1 48 0V70"
        fill="none"
        stroke={INK}
        strokeWidth={6}
        strokeLinecap="round"
      />
      <rect
        x={62}
        y={68}
        width={76}
        height={62}
        rx={12}
        fill={M.violet}
        stroke={INK}
        strokeWidth={6}
      />
      <circle cx={100} cy={96} r={7} fill={INK} />
      <rect x={97} y={100} width={6} height={14} rx={2} fill={INK} />
    </svg>
  )
}
