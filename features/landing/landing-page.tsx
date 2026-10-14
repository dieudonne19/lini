import "./landing.css"
import { FinalCta } from "./components/final-cta"
import { Faq } from "./components/faq"
import { Footer } from "./components/footer"
import { Gains } from "./components/gains"
import { Header } from "./components/header"
import { Hero } from "./components/hero"
import { SvgDefs } from "./components/illustrations/svg-defs"
import { Problem } from "./components/problem"
import { SmoothScroll } from "./components/smooth-scroll"
import { Steps } from "./components/steps"

/**
 * Landing page de Lini.
 * Ordre des blocs (chacun répond à une question du visiteur) :
 * hero → problème → ce que la famille y gagne → étapes → questions → appel à l'action.
 * Aucun logo client, témoignage ni chiffre : il n'existe pas encore de preuve réelle à montrer.
 */
export function LandingPage() {
  return (
    <div className="overflow-x-clip bg-background text-foreground">
      <SmoothScroll />
      <SvgDefs />
      <a
        href="#contenu"
        className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-4 focus:z-50 focus:rounded-lg focus:bg-card focus:px-4 focus:py-3"
      >
        Aller au contenu
      </a>
      <Header />
      <main id="contenu">
        <Hero />
        <Problem />
        <Gains />
        <Steps />
        <Faq />
        <FinalCta />
      </main>
      <Footer />
    </div>
  )
}
