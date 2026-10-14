import { cn } from "@/lib/utils"
import { GROUND, INK, MEMBER as M, SKIN } from "../../lib/palette"
import { Arm, Peg } from "./peg"
import { Pieces, type Piece } from "./pieces"

const CONFETTI: Piece[] = [
  { k: "r", x: 60, y: 40, rot: 20, color: M.blue },
  { k: "c", x: 112, y: 96, color: M.orange },
  { k: "t", x: 40, y: 150, rot: 40, color: M.green },
  { k: "s", x: 200, y: 40, rot: 10, color: M.violet },
  { k: "r", x: 252, y: 14, rot: -20, color: M.rose },
  { k: "c", x: 300, y: 52, color: M.teal },
  { k: "t", x: 172, y: 130, rot: -25, color: M.orange },
  { k: "r", x: 740, y: 60, rot: -15, color: M.orange },
  { k: "c", x: 690, y: 118, color: M.blue },
  { k: "t", x: 764, y: 182, rot: -40, color: M.violet },
  { k: "s", x: 604, y: 40, rot: 15, color: M.green },
  { k: "r", x: 548, y: 14, rot: -35, color: M.teal },
  { k: "c", x: 500, y: 56, color: M.rose },
  { k: "t", x: 640, y: 120, rot: 30, color: M.blue },
  { k: "r", x: 610, y: 236, rot: 35, color: M.rose },
  { k: "c", x: 752, y: 236, color: M.green },
  { k: "s", x: 770, y: 290, rot: -30, color: M.orange },
  { k: "t", x: 586, y: 282, rot: -20, color: M.violet },
  { k: "r", x: 28, y: 250, rot: -30, color: M.violet },
  { k: "c", x: 40, y: 330, color: M.blue },
]

const HEARTS: Piece[] = [
  { k: "heart", x: 128, y: 238, scale: 0.9, color: M.rose },
  { k: "heart", x: 180, y: 214, scale: 0.6, color: M.red },
]

/** Une fenêtre de la maison : une pastille de membre avec un sourire. */
function HouseFace({
  cx,
  cy,
  fill,
  delay,
}: {
  cx: number
  cy: number
  fill: string
  /** Quand la fenêtre apparaît, en millisecondes. */
  delay: number
}) {
  const blink = { animationDelay: `${delay + 900}ms` }
  return (
    <g className="lini-window" style={{ animationDelay: `${delay}ms` }}>
      <circle cx={cx} cy={cy} r={32} fill={fill} />
      <circle
        className="lini-blink"
        style={blink}
        cx={cx - 10}
        cy={cy - 5}
        r={4}
        fill={INK}
      />
      <circle
        className="lini-blink"
        style={blink}
        cx={cx + 10}
        cy={cy - 5}
        r={4}
        fill={INK}
      />
      <path
        d={`M${cx - 11} ${cy + 8}Q${cx} ${cy + 19} ${cx + 11} ${cy + 8}`}
        fill="none"
        stroke={INK}
        strokeWidth={3.5}
        strokeLinecap="round"
      />
    </g>
  )
}

export function HeroIllustration({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 800 420"
      className={cn(className, "lini-hero lini-enter")}
      role="img"
      aria-label="La maison Lini, dont les quatre pastilles de couleur sont les fenêtres. À gauche, un parent serre son enfant dans ses bras. À droite, deux membres de la famille lèvent les bras pour faire la fête, sous une pluie de confettis."
    >
      <ellipse cx={400} cy={372} rx={350} ry={20} fill={GROUND} />
      <Pieces items={CONFETTI} animate />

      {/* La maison : la forme du logo. */}
      <path
        d="M400 40L566 181V368H234V181Z"
        fill="#fff"
        stroke={INK}
        strokeWidth={10}
        strokeLinejoin="round"
      />
      <HouseFace cx={333} cy={224} fill={M.blue} delay={300} />
      <HouseFace cx={467} cy={224} fill={M.orange} delay={450} />
      <HouseFace cx={333} cy={306} fill={M.green} delay={600} />
      {/* La pastille violette reste un anneau, comme dans le logo. */}
      <circle
        className="lini-window"
        style={{ animationDelay: "750ms" }}
        cx={467}
        cy={306}
        r={24}
        fill="none"
        stroke={M.violet}
        strokeWidth={16}
      />

      <Pieces items={HEARTS} animate />

      {/* Le câlin, à gauche. */}
      <g className="lini-sway" style={{ transformOrigin: "140px 372px" }}>
        <Peg x={110} y={372} scale={1.2} color={M.blue} skin={SKIN.deep} />
        <Peg x={170} y={372} scale={0.85} color={M.green} skin={SKIN.warm} />
        <Arm d="M134 338Q160 324 188 346" color={M.blue} />
      </g>

      {/* La fête, à droite. */}
      <g className="lini-hop">
        <Peg x={640} y={372} scale={1.15} color={M.orange} skin={SKIN.light} />
        <g className="lini-wave" style={{ transformOrigin: "617px 333px" }}>
          <Arm d="M617 333Q604 326 606 292" color={M.orange} />
        </g>
      </g>
      <g className="lini-hop" style={{ animationDelay: "450ms" }}>
        <Peg x={705} y={372} scale={0.9} color={M.violet} skin={SKIN.deep} />
        <g className="lini-wave" style={{ transformOrigin: "685px 345px" }}>
          <Arm d="M685 345Q664 338 668 306" color={M.violet} width={7} />
        </g>
        <g
          className="lini-wave"
          style={{ transformOrigin: "725px 345px", animationDelay: "200ms" }}
        >
          <Arm d="M725 345Q746 338 742 306" color={M.violet} width={7} />
        </g>
      </g>
    </svg>
  )
}
