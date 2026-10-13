import Image from "next/image"
import Link from "next/link"

// The Lini logo, linking to the home page. Two files, one shown per theme (dark text on light, white on dark).
// The SVGs are served as they are: Next's image optimizer is not needed for them.
function Logo() {
  return (
    <Link href="/" className="inline-flex rounded-md">
      <Image
        src="/lini-logo.svg"
        alt="Lini"
        width={104}
        height={36}
        priority
        unoptimized
        className="dark:hidden"
      />
      <Image
        src="/lini-logo-sombre.svg"
        alt="Lini"
        width={104}
        height={36}
        priority
        unoptimized
        className="hidden dark:block"
      />
    </Link>
  )
}

export { Logo }
