/**
 * Textes de la landing page. Tutoiement partout, casse de phrase.
 * Les espaces insécables ( ) tiennent « : », « ? » et les guillemets collés au mot.
 */

export const SITE_TITLE = "Lini : trouve le moment de te retrouver en famille"

export const SITE_DESCRIPTION =
  "Chacun a son emploi du temps. Lini réunit ceux de toute la famille et te montre quand tout le monde est libre pour se retrouver."

export const CTA_LABEL = "Créer l'agenda de ma famille"

/** L'entrée de l'application : créer la famille, ou ouvrir son lien personnel. */
export const CTA_HREF = "/commencer"

export const CTA_MICRO =
  "Sans mot de passe · Un lien personnel pour chaque membre"

export const HERO = {
  title: "Trouve enfin le moment où toute la famille est libre.",
  lead: "Travail, école, activités : chacun a son emploi du temps, et se voir finit par devenir impossible. Lini réunit les journées de toute la famille et te montre quand tout le monde est libre.",
}

export const PROBLEM = {
  title:
    "On voudrait passer du temps ensemble. Mais chacun a son emploi du temps.",
  points: [
    {
      title: "Chacun court de son côté",
      text: "Chacun a sa semaine bien remplie, et personne ne voit celle des autres.",
    },
    {
      title: "Se voir demande une enquête",
      text: "Pour savoir qui est libre samedi, il faut demander à toute la maison, un message après l'autre.",
    },
    {
      title: "Les occasions passent",
      text: "À force de chercher le bon moment, le repas ou la sortie en famille n'arrive jamais.",
    },
  ],
  pivot:
    "Lini sert à ça : voir les journées de chacun et trouver le moment où toute la famille peut se retrouver.",
}

export const GAINS_TITLE = "Ce que ta famille y gagne"

export const GAIN_TEXTS = {
  slots: {
    title: "Trouve le moment où tout le monde est libre",
    text: "Chacun ajoute ses activités, et Lini te montre les créneaux où personne n'est pris. Tu choisis sans poser la question à personne.",
  },
  events: {
    title: "Des événements communs sans relancer personne",
    text: "Pique-nique, réunion, anniversaire : tu choisis la date, Lini te montre qui est déjà pris, puis prévient tout le monde.",
  },
  parents: {
    title: "Pour les parents : toute la semaine en un coup d'œil",
    text: "Tu vois les journées de chaque membre dans une même vue. Les enfants proposent une activité, et tu l'acceptes ou la refuses.",
  },
  privacy: {
    title: "Garde une activité pour toi",
    text: "Marque-la « Privée » : les autres voient seulement « Occupé », sans le titre ni le détail. Ta famille sait si tu es libre, pas ce que tu fais.",
  },
}

export const STEPS_TITLE = "Prêt en trois étapes, sans compte à créer"

export const STEPS = [
  {
    title: "Crée la famille",
    text: "Donne un nom à ta famille et ajoute ses membres : parents et enfants.",
  },
  {
    title: "Envoie un lien à chacun",
    text: "Chaque membre ouvre son lien personnel. Pas de mot de passe, pas d'adresse e-mail.",
  },
  {
    title: "Chacun remplit son agenda",
    text: "Les parents voient l'ensemble et valident ce que proposent les enfants.",
  },
]

export const STEPS_NOTE =
  "Les enfants n'ont rien à retenir : un lien suffit. Il est personnel, et si quelqu'un le perd, un parent le désactive et en crée un nouveau."

export const FAQ_TITLE = "Les questions avant de commencer"

export const FAQ = [
  {
    q: "Faut-il créer un compte ?",
    a: "Non. Chaque membre reçoit un lien personnel et l'ouvre : c'est tout. Pas de mot de passe, pas d'adresse e-mail.",
  },
  {
    q: "Mes enfants peuvent-ils s'en servir ?",
    a: "Oui. Ils ajoutent leurs activités et peuvent proposer un événement. Un parent doit le valider pour qu'il devienne un événement de la famille.",
  },
  {
    q: "Les autres voient-ils tout ce que j'écris ?",
    a: "Non. Une activité privée s'affiche « Occupé », sans titre ni détail. Même les parents ne voient pas les activités privées des autres.",
  },
  {
    q: "Que faire si quelqu'un perd son lien ?",
    a: "Un parent le désactive et en crée un nouveau. L'ancien lien ne fonctionne plus.",
  },
  {
    q: "Comment suis-je prévenu d'un événement ?",
    // TODO(utilisateur) : confirmer le fonctionnement des notifications (notamment sur iPhone), puis retirer la mention entre crochets.
    a: "Tu reçois une notification quand un événement est créé, puis la veille. [Fonctionnement sur iPhone à confirmer avant la mise en ligne]",
  },
  {
    q: "Ça marche sur téléphone ?",
    a: "Oui. Lini s'ouvre dans le navigateur de ton téléphone, sans rien installer.",
  },
]

export const FINAL = {
  title: "Arrête de demander « qui est libre samedi ? »",
}

export const FOOTER_TEXT = "Lini, l'agenda partagé de la maison · 2026"

/** Où joindre la personne qui a fait Lini, dans le pied de page. Le nom doit être l'une des clés de ICONS (footer.tsx). */
export const CONTACT_LINKS = [
  { label: "GitHub", href: "https://github.com/dieudonne19" },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/dieudonn%C3%A9-andrianjato-7b34472a1/",
  },
  // Madagascar (+261) : le 0 du numéro local (033 79 691 58) disparaît dans le format international de wa.me.
  { label: "WhatsApp", href: "https://wa.me/261337969158" },
] as const
