/**
 * Textes de la landing page. Tutoiement partout, casse de phrase.
 * Les espaces insécables ( ) tiennent « : », « ? » et les guillemets collés au mot.
 */

export const SITE_TITLE =
  "Lini : l'agenda familial sans oublis ni doubles réservations"

export const SITE_DESCRIPTION =
  "Lini réunit les journées de toute la famille dans un seul agenda : moins d'oublis, pas de double réservation, et des activités privées qui restent privées."

export const CTA_LABEL = "Créer l'agenda de ma famille"

/** L'entrée de l'application : créer la famille, ou ouvrir son lien personnel. */
export const CTA_HREF = "/commencer"

export const CTA_MICRO =
  "Sans mot de passe · Un lien personnel pour chaque membre"

export const HERO = {
  tag: "Agenda partagé de la maison",
  title: "Chez toi, tout le monde sait qui fait quoi.",
  lead: "Lini réunit les journées de toute la famille dans un seul agenda. Moins d'oublis, pas de double réservation, et chacun garde ses activités privées pour soi.",
}

export const PROBLEM = {
  title: "Chacun a son planning. Personne ne voit celui des autres.",
  points: [
    {
      title: "Chacun note de son côté",
      text: "Pour savoir qui est libre samedi, il faut poser la question à toute la maison.",
    },
    {
      title: "Les messages se perdent",
      text: "L'invitation au pique-nique disparaît sous les autres messages de la journée.",
    },
    {
      title: "Les surprises arrivent la veille",
      text: "On découvre qu'un parent travaille ou qu'un enfant a une sortie quand il est déjà trop tard.",
    },
  ],
  pivot:
    "Lini sert à ça : un seul endroit où chaque membre de la maison voit les journées des autres.",
}

export const GAINS_TITLE = "Ce que ta famille y gagne"

export const GAIN_TEXTS = {
  slots: {
    title: "Plus d'oublis, plus de doubles réservations",
    text: "Chacun ajoute ses activités, et tout le monde voit qui est pris et qui est libre. Tu choisis un jour sans poser la question à personne.",
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
