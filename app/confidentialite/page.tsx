import Link from "next/link"

import { CONTACT_LINKS } from "@/features/landing/data/content"

export const metadata = {
  title: "Confidentialité",
  description: "Ce que Lini garde sur ta famille et comment tout effacer.",
}

// What Lini stores, in plain words. Keep it in step with prisma/schema.prisma: a new kind of data means a new line here.
export default function Page() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-4 py-10">
      <div className="flex flex-col gap-3">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Confidentialité
        </h1>
        <p className="text-muted-foreground">
          Lini est un projet personnel. Voici, simplement, ce qu&apos;il garde
          sur ta famille.
        </p>
      </div>

      <Section title="Ce que Lini garde">
        <ul className="list-disc space-y-1 pl-5">
          <li>Le nom de la famille.</li>
          <li>
            Pour chaque membre : son prénom, sa couleur, son rôle (parent ou
            enfant) et, si un parent l&apos;a ajouté, son numéro de téléphone.
          </li>
          <li>
            Les activités et les événements : titres, dates, lieux, notes et
            réponses des membres.
          </li>
          <li>
            Pour te reconnaître sans mot de passe : une empreinte de ton lien
            personnel et une empreinte du code de secours. Les liens et le code
            eux-mêmes ne sont pas conservés.
          </li>
          <li>
            Si tu actives les notifications : l&apos;adresse d&apos;envoi de ton
            appareil, fournie par ton navigateur. Elle est supprimée quand tu
            désactives les notifications.
          </li>
          <li>
            Pour limiter les abus : une empreinte de l&apos;adresse de
            connexion, gardée au plus une heure. L&apos;adresse elle-même
            n&apos;est pas conservée.
          </li>
        </ul>
      </Section>

      <Section title="Qui peut le voir">
        <ul className="list-disc space-y-1 pl-5">
          <li>
            Seuls les membres de ta famille voient son agenda. Une famille ne
            voit jamais celle d&apos;une autre.
          </li>
          <li>
            Une activité marquée « Privée » apparaît comme « Occupé » pour les
            autres : son titre ne leur est pas envoyé.
          </li>
          <li>Seuls les parents voient les numéros de téléphone.</li>
        </ul>
      </Section>

      <Section title="Cookie">
        <p>
          Lini dépose un seul cookie, qui te garde connecté sur cet appareil. Il
          est nécessaire au fonctionnement : il n&apos;y a donc pas de bandeau à
          accepter. Lini n&apos;utilise ni mesure d&apos;audience, ni publicité,
          et ne revend rien.
        </p>
      </Section>

      <Section title="Notifications">
        <p>
          Les notifications passent par le service de ton navigateur (Google,
          Apple, Mozilla ou Microsoft). Lini lui envoie le titre de
          l&apos;événement et le prénom du membre concerné, rien d&apos;autre.
          Tu peux les désactiver à tout moment depuis la page Semaine, ou dans
          les réglages de ton navigateur.
        </p>
      </Section>

      <Section title="Où c'est hébergé">
        <p>
          Le site est hébergé chez Vercel et la base de données chez Neon. Je
          n&apos;ai pas la main sur les sauvegardes que ces services peuvent
          garder pendant un certain temps.
        </p>
      </Section>

      <Section title="Combien de temps">
        <p>
          Rien n&apos;est effacé automatiquement : les données restent tant que
          la famille existe. Un parent peut supprimer la famille à tout moment
          depuis la page{" "}
          <Link
            href="/famille"
            className="font-medium text-foreground underline underline-offset-4 hover:no-underline"
          >
            Famille
          </Link>
          . Tout est alors effacé d&apos;un coup : membres, activités,
          événements, réponses. Un parent peut aussi retirer un membre, et
          chacun peut supprimer ses propres activités.
        </p>
      </Section>

      <Section title="Une question, une demande">
        <p>
          Pour accéder à tes données, les corriger ou les faire effacer si tu ne
          peux pas le faire toi-même, écris-moi :
        </p>
        <ul className="flex flex-wrap gap-x-4 gap-y-1">
          {CONTACT_LINKS.map(({ label, href }) => (
            <li key={label}>
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-foreground underline underline-offset-4 hover:no-underline"
              >
                {label}
              </a>
            </li>
          ))}
        </ul>
      </Section>
    </main>
  )
}

function Section({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-xl font-semibold">{title}</h2>
      <div className="flex flex-col gap-3 text-muted-foreground [&_li]:marker:text-border">
        {children}
      </div>
    </section>
  )
}
