# Cahier des charges : Lini, agenda partagé de la maison

Date : 2026-10-12

Lini est une application web où chaque membre d'une maison voit ce que font les autres, et où l'on réserve des jours pour un événement familial qui prévient tout le monde.

Ligne de présentation : « Qui fait quoi, et quand êtes-vous tous libres ? »

## Contexte et objectifs

Dans une maison, chacun a son emploi du temps (cours, travail, sorties) et personne ne sait qui est disponible quand. Organiser un repas ou une réunion passe par de longs échanges de messages.

L'application doit permettre de :

- voir d'un coup d'œil ce que fait chaque membre, par jour et par semaine ;
- réserver un ou plusieurs jours pour un événement familial et prévenir tous les membres ;
- trouver les jours où tout le monde est libre ;
- garder privé ce qu'un membre ne veut pas montrer.

## Utilisateurs et rôles

Une famille compte des parents et des enfants. Les parents administrent la famille (il peut y en avoir plusieurs). Chaque personne a un lien personnel, sans mot de passe.

| Rôle | Peut faire |
| --- | --- |
| Parent | Créer la famille, ajouter ou retirer des membres, régénérer ou révoquer un lien, créer et supprimer des événements, valider ou refuser les propositions des enfants, et tout ce que fait un enfant |
| Enfant | Gérer ses propres activités, voir l'agenda de la famille, répondre aux événements, proposer un événement (il est publié après validation d'un parent) |

## Périmètre

Première version, sur le web uniquement.

Inclus :

- une famille, des parents et des enfants, la connexion par lien ;
- les activités personnelles, répétées ou non, publiques ou privées ;
- les vues semaine et mois ;
- les événements familiaux créés par les parents, et les propositions des enfants validées par un parent ;
- les réponses des membres, les conflits et les créneaux libres communs ;
- les notifications web.

Exclu pour l'instant :

- application mobile native ;
- synchronisation avec Google Calendar ;
- discussion intégrée ;
- plusieurs familles pour une même personne ;
- export de l'agenda ;
- fonctionnement hors connexion.

## Exigences fonctionnelles

| Réf. | Fonction | Priorité |
| --- | --- | --- |
| F1 | Créer une famille et en devenir parent | Indispensable |
| F2 | Ajouter un membre (parent ou enfant, numéro de téléphone facultatif) et générer son lien personnel | Indispensable |
| F3 | Se connecter en ouvrant son lien | Indispensable |
| F4 | Ajouter, modifier, supprimer ses activités (titre, jour, heures, journée entière) | Indispensable |
| F5 | Marquer une activité comme privée | Indispensable |
| F6 | Répéter une activité (chaque jour, chaque semaine) | Important |
| F7 | Voir la semaine de tous les membres | Indispensable |
| F8 | Voir le mois | Important |
| F9 | Créer un événement familial sur un ou plusieurs jours (parent) | Indispensable |
| F10 | Proposer un événement, et le retirer tant qu'il n'est pas validé (enfant) | Indispensable |
| F11 | Valider ou refuser une proposition (parent) | Indispensable |
| F12 | Répondre à un événement (je viens, je ne viens pas, peut-être) | Indispensable |
| F13 | Voir les conflits avant d'envoyer l'invitation | Important |
| F14 | Proposer les créneaux où tout le monde est libre | Important |
| F15 | Notifier les membres quand un événement est confirmé | Important |
| F16 | Envoyer un rappel la veille d'un événement | Important |
| F17 | Supprimer un événement (parents uniquement) | Indispensable |
| F18 | Prévenir par WhatsApp un membre qui a un numéro (bouton qui ouvre WhatsApp avec un message prérempli) | Important |
| F19 | Révoquer un lien ou retirer un membre (parent) | Indispensable |
| F20 | Fonctionner hors connexion | Plus tard |

## Règles de gestion

- **Activité privée** : les autres membres, parents compris, voient « Occupé » avec les heures, jamais le titre. Le masquage est fait par le serveur, dans une seule fonction de lecture.
- **Répétition** : les occurrences sont calculées à l'affichage. Modifier une activité répétée modifie toute la série (pas d'exception sur une seule occurrence dans la première version).
- **Conflit** : un membre est en conflit si une de ses activités, privée comprise, chevauche l'événement. L'application nomme le membre, jamais le titre de l'activité.
- **Créneaux libres** : un créneau est proposé seulement si aucun membre n'a d'activité, privée comprise, sur les 14 prochains jours.
- **Événement proposé** : un événement créé par un enfant a le statut « proposé ». Seuls les parents et son auteur le voient, et les parents sont prévenus. Il n'est ni publié ni notifié aux autres membres. Son auteur peut le retirer tant qu'il n'est pas validé.
- **Validation** : un parent valide ou refuse la proposition. À la validation, l'événement devient « confirmé » et tous les membres sont notifiés. En cas de refus, l'enfant est prévenu.
- **Suppression** : seuls les parents suppriment un événement.
- **Événements passés** : ils restent dans l'historique. Seuls les parents peuvent les supprimer, quand ils le veulent, sans rappel.
- **WhatsApp** : le numéro est facultatif, au format international. Seuls les parents le voient. Le bouton « Prévenir par WhatsApp » ouvre une conversation avec un message prérempli (lien `wa.me`) : l'envoi est fait à la main par la personne qui clique, il n'y a pas d'envoi automatique.
- **Dernier parent** : on ne peut pas retirer ni passer en enfant le dernier parent. Un bandeau « Ajoute un deuxième parent » s'affiche tant qu'il n'y en a qu'un. Risque connu : un parent seul qui perd son lien n'a aucun moyen de le récupérer.
- **Réponses** : chaque membre est « en attente » par défaut. Tous les membres voient qui a répondu et quoi.
- **Date modifiée** : si les dates d'un événement changent, les réponses repassent à « en attente » et les membres sont prévenus.
- **Membre retiré** : ses activités, ses propositions et ses réponses sont supprimées, son lien ne fonctionne plus.
- **Fuseau horaire** : les dates sont stockées en UTC et affichées selon le fuseau de l'appareil de chaque membre. Une activité « journée entière » est stockée comme une date, sans heure, pour ne pas changer de jour d'un fuseau à l'autre.

## Exigences non fonctionnelles

- **Liens personnels** : jeton aléatoire d'au moins 32 octets, seul son hash est stocké, cookie signé et httpOnly, révocation par un parent. Quiconque a le lien est ce membre : l'interface le dit clairement.
- **Contrôle d'accès** : chaque lecture et chaque écriture vérifie que le membre appartient à la famille concernée, et que son rôle (parent ou enfant) permet l'action.
- **Validation** : toute entrée est validée avec Zod côté serveur.
- **Accessibilité** : WCAG 2.1 AA, navigation au clavier, texte secondaire à 4,5:1 de contraste au minimum, la couleur d'un membre n'est jamais le seul signal (son prénom ou son initiale l'accompagne).
- **Responsive** : vérifié à 375 px et à 1440 px, sans défilement horizontal de la page.
- **États** : chargement, vide et erreur conçus sur chaque écran.
- **Langue** : français, tutoiement, casse de phrase, vocabulaire constant (« activité », « événement », « membre », « parent », « enfant »).

## Modèle de données

| Table | Champs principaux |
| --- | --- |
| Family | id, name, createdAt |
| Member | id, familyId, name, color, role (parent ou child), phone (facultatif, format E.164), tokenHash (unique), createdAt |
| Activity | id, memberId, title, startsAt, endsAt, allDay, isPrivate, repeat (none, daily, weekly), repeatUntil |
| FamilyEvent | id, familyId, createdById, status (proposed ou confirmed), validatedById, validatedAt, title, description, startsAt, endsAt, allDay, place |
| Rsvp | eventId, memberId, status (yes, no, maybe, pending), unique sur (eventId, memberId) |
| PushSubscription | memberId, endpoint, clés de chiffrement |

## Architecture technique

Un seul projet Next.js au départ, avec la logique métier rangée à part pour pouvoir la déplacer plus tard.

- **Application** : Next.js (App Router, Server Actions), TypeScript, shadcn/ui.
- **Données** : Prisma et Neon (Postgres), avec l'URL poolée pour l'application et l'URL directe pour les migrations.
- **Validation** : Zod.
- **Dossier `lib/`** : règles de visibilité, conflits, créneaux libres, répétitions et schémas Zod. Il ne dépend ni de Next.js ni de React.
- **Tâches planifiées** : un cron quotidien pour les rappels de la veille (hébergement prévu : Vercel, quota de l'offre gratuite à vérifier à l'étape 7).
- **Next.js** : la version a des changements incompatibles, lire `node_modules/next/dist/docs/` à l'étape 1 avant d'écrire du code.
- **Évolution vers AdonisJS** : seulement si un de ces besoins apparaît : tâches de fond fiables, temps réel, API pour une application mobile. Dans ce cas, `lib/` est déplacé vers le serveur AdonisJS au lieu d'être réécrit.

## Écrans et parcours

| Écran | Contenu | Accès |
| --- | --- | --- |
| Premier lancement | Créer la famille et le premier parent : le cookie est posé et le lien personnel s'affiche une seule fois, avec un bouton « Copier ». État vide avec une action claire | Créateur (parent) |
| Semaine | Une ligne par membre, sept jours en colonnes, couleur par membre, activités privées affichées « Occupé » | Tous |
| Mois | Vue d'ensemble, pastilles par jour, événements familiaux en relief | Tous |
| Mon agenda | Ajouter, modifier, supprimer ses activités (formulaire court) | Chaque membre |
| Nouvel événement | Titre, dates, lieu, aperçu des conflits avant l'envoi. Un enfant l'envoie comme proposition | Parents (création), enfants (proposition) |
| À valider | Propositions des enfants, boutons « Valider » et « Refuser » | Parents |
| Événement | Détail, qui vient, qui ne vient pas, bouton de réponse, bouton « Supprimer » pour les parents | Tous |
| Famille | Membres, rôles, numéros de téléphone, liens, révocation | Parents |

Parcours principal : un membre ouvre son lien, arrive sur la semaine, ajoute une activité, puis crée un événement en voyant les conflits avant d'envoyer.

## Notifications

- **Mécanisme** : Web Push (service worker et clés VAPID), envoyé quand un événement est confirmé, quand ses dates changent, et la veille.
- **Aux parents** : à chaque proposition d'un enfant.
- **iPhone** : à ma connaissance, les notifications web y demandent d'installer l'application sur l'écran d'accueil. À vérifier avant de promettre quoi que ce soit.
- **Repli** : pour un membre sans notification web, le bouton « Prévenir par WhatsApp » (F18), s'il a un numéro. Sans numéro, il voit l'état de l'événement en ouvrant l'application.
- **Échec d'envoi** : l'événement est quand même enregistré. L'interface affiche « Enregistré, mais certains membres n'ont pas été prévenus » avec un bouton « Réessayer ».

## Plan de réalisation

1. **Base** : projet, Prisma, Neon, modèles, jeu de données de test.
2. **Famille et connexion par lien** : création, génération, cookie, révocation, rôles parent et enfant.
3. **Mon agenda** : création, modification et suppression des activités, répétition, privé.
4. **Vues semaine puis mois**, avec la règle de confidentialité testée.
5. **Événements familiaux** : création par les parents, proposition par les enfants, validation, retrait, réponses, suppression par les parents.
6. **Conflits et créneaux libres.**
7. **Notifications** : envoi, rappel de la veille, bouton WhatsApp.
8. **Finitions** : états vide, chargement et erreur, mobile à 375 px, clavier, contrastes.

## Critères d'acceptation et tests

- [ ] Une activité privée ne renvoie jamais son titre à un autre membre, parent compris (test sur la réponse du serveur, pas sur l'écran).
- [ ] Un lien révoqué ne donne plus accès.
- [ ] Un membre ne voit aucune donnée d'une autre famille.
- [ ] Un enfant ne peut ni publier ni supprimer un événement.
- [ ] Une proposition d'enfant n'est visible que des parents et de son auteur, jusqu'à sa validation.
- [ ] Un enfant peut retirer sa proposition tant qu'elle n'est pas validée, pas après.
- [ ] Une proposition validée notifie tous les membres.
- [ ] Un événement placé sur un jour où un membre est occupé affiche le conflit.
- [ ] Les créneaux libres excluent toute activité, privée comprise.
- [ ] Une activité hebdomadaire apparaît chaque semaine jusqu'à sa date de fin.
- [ ] Les heures s'affichent selon le fuseau de l'appareil, et une journée entière reste le même jour dans tous les fuseaux.
- [ ] Si l'envoi d'une notification échoue, l'événement est enregistré et un bouton « Réessayer » apparaît.
- [ ] Le numéro de téléphone d'un membre n'est jamais renvoyé à un enfant (test sur la réponse du serveur).
- [ ] Le dernier parent ne peut être ni retiré ni passé en enfant.
- [ ] Le bouton WhatsApp ouvre un lien `wa.me` valide avec le message prérempli, et n'apparaît que si le membre a un numéro.
- [ ] Chaque écran a ses états vide, chargement et erreur.
- [ ] Les écrans restent utilisables à 375 px et à 1440 px, au clavier.

## Risques et questions ouvertes

| Risque | Réponse prévue |
| --- | --- |
| Un lien est partagé par erreur | Régénération et révocation par un parent |
| Une activité privée fuit par les données envoyées au navigateur | Masquage côté serveur et test sur la réponse |
| Les notifications ne marchent pas sur iPhone | Vérifier tôt, repli par email ou WhatsApp |
| Erreurs de fuseau ou de répétition | Stockage en UTC, affichage selon le fuseau de l'appareil, tests sur les semaines de changement de mois et sur les journées entières |
| Les parents oublient de valider une proposition | Notification à chaque proposition |
| Un parent seul perd son lien | Bandeau pour ajouter un deuxième parent, risque accepté en v1 |
| Le numéro de téléphone est une donnée personnelle | Facultatif, visible des parents seulement, supprimé avec le membre |

Pas de question ouverte pour l'instant.
