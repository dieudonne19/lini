// Colored circle with the member's initial. Decorative: the name always sits next to it.
function MemberAvatar({ name, color }: { name: string; color: string }) {
  return (
    <span
      aria-hidden
      style={{ backgroundColor: color }}
      className="flex size-10 shrink-0 items-center justify-center rounded-full text-xl font-bold text-white"
    >
      {name.charAt(0).toUpperCase()}
    </span>
  )
}

export { MemberAvatar }
