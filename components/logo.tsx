import Image from "next/image"
import Link from "next/link"

// The Lini logo, linking to the home page. The SVG is served as it is: Next's image optimizer is not needed.
function Logo() {
  return (
    <Link href="/" className="inline-flex rounded-lg">
      <Image
        src="/lini-logo-A.svg"
        alt="Lini"
        width={88}
        height={50}
        priority
        unoptimized
      />
    </Link>
  )
}

export { Logo }
