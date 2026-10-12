# Brief : agenda partagé de la maison (web)

## But
Dans une maison, chacun voit ce que font les autres membres chaque jour, et
un membre peut réserver un ou plusieurs jours pour un événement familial
(réunion, pique-nique). Tous les membres sont notifiés et répondent.

## Décisions prises
- Web d'abord (application installable plus tard).
- Connexion par **lien personnel** (sans mot de passe ni email).
- Une activité peut être **privée** : les autres voient « Occupé », sans détail.

## Stack proposée
Next.js (App Router, Server Actions), Prisma, Neon (Postgres), Zod, shadcn/ui,
TypeScript. Même base technique que le back-office du portfolio.

## Modèles (Prisma, version de départ)
- `Family` : id, name, createdAt.
- `Member` : id, familyId, name, color, role (`admin` | `member`),
  tokenHash (unique), createdAt.
- `Activity` : id, memberId, title, startsAt, endsAt, allDay, isPrivate,
  repeat (`none` | `daily` | `weekly`), repeatUntil?.
- `FamilyEvent` : id, familyId, createdById, title, description?, startsAt,
  endsAt, allDay, place?.
- `Rsvp` : eventId, memberId, status (`yes` | `no` | `maybe` | `pending`),
  unique (eventId, memberId).
- `PushSubscription` : memberId, endpoint, keys (pour les notifications web).

## Connexion par lien
- Le créateur de la famille devient `admin`. Il ajoute un membre : l'application
  génère un lien `/m/<jeton>`.
- Le jeton est long et aléatoire (au moins 32 octets). Seul son **hash** est
  stocké en base. Le lien affiché une seule fois peut être régénéré.
- Ouvrir le lien pose un cookie signé et httpOnly. L'admin peut révoquer un lien.
- Risque connu : quiconque a le lien est ce membre. À dire clairement à
  l'utilisateur dans l'interface.

## Règle de confidentialité (critique)
Une activité privée ne doit **jamais** quitter le serveur avec son titre pour un
autre membre. Le masquage se fait côté serveur, dans une seule fonction de
lecture, jamais dans l'interface. À tester explicitement.

## Écrans
1. **Semaine** (écran principal) : une ligne par membre, sept jours en colonnes,
   couleur par membre, activités privées affichées « Occupé ».
2. **Mois** : vue d'ensemble, pastilles par jour, événements familiaux en relief.
3. **Mon agenda** : ajouter, modifier, supprimer ses activités (formulaire court).
4. **Nouvel événement familial** : titre, dates, lieu, et un aperçu des conflits
   avant l'envoi.
5. **Événement** : détail, qui vient, qui ne vient pas, bouton de réponse.
6. **Famille** (admin) : membres, liens, révocation.
7. **Premier lancement** : créer la famille, ajouter le premier membre, état vide
   avec une action claire.

## Fonctions clés
- **Conflits** : à la création d'un événement, lister les membres déjà occupés
  sur ces jours (sans révéler le détail des activités privées).
- **Créneaux libres** : proposer les jours et heures où aucun membre n'a
  d'activité, sur les 14 prochains jours.
- **Répétition** : générer les occurrences à l'affichage plutôt que de les
  stocker une par une. `shortcut:` pas d'exceptions sur une occurrence au début.

## Notifications
- Web Push (service worker + clés VAPID), envoyé à la création d'un événement
  et la veille.
- **À vérifier avant de promettre quoi que ce soit** : sur iPhone, les
  notifications web demandent l'installation de l'application sur l'écran
  d'accueil. Prévoir une solution de repli (email ou message WhatsApp).
- Ne pas bloquer l'enregistrement de l'événement si l'envoi échoue : afficher
  « Enregistré, mais certains membres n'ont pas été prévenus » avec un bouton
  « Réessayer ».

## Étapes
1. Base : projet, Prisma, Neon, modèles, jeu de données de test.
2. Famille et connexion par lien (création, génération, cookie, révocation).
3. Mon agenda : CRUD des activités, répétition, privé.
4. Vue semaine, puis vue mois, avec la règle de confidentialité testée.
5. Événements familiaux et réponses.
6. Conflits et créneaux libres.
7. Notifications.
8. Finitions : états vide, chargement, erreur, mobile à 375 px, clavier.

## Règles de travail
- Ponytail actif. Aucun raccourci sur la validation (Zod à chaque action), la
  sécurité des liens, la confidentialité des activités privées, l'accessibilité.
- Fuseau horaire : stocker en UTC, afficher dans le fuseau de la famille.
  `shortcut:` un seul fuseau par famille.
- Aucune donnée inventée dans les textes de l'interface.

## Hors périmètre (pour l'instant)
Application mobile native, synchronisation avec Google Calendar, discussion
intégrée, plusieurs familles par personne, export.

## À confirmer
- Qui peut créer un événement : tout le monde ou seulement l'admin ?
- Qui peut supprimer un événement ?
- Faut-il un rappel aussi pour les activités personnelles ?
- Fuseau horaire de la famille.
