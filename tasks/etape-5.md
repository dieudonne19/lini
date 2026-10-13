# Étape 5 : Événements familiaux

Source : `CDC-agenda-famille.md`, étape 5 (F9, F10, F11, F12, F17) et la règle « Date modifiée ».
Pré-requis : étapes 1 à 4 (modèle `FamilyEvent` et `Rsvp`, lecture de la famille `listFamilySchedule`, semaine et mois qui affichent déjà les événements confirmés).
**Aucun changement de schéma** : tout tient dans les tables existantes.

Hors périmètre, à d'autres étapes : aperçu des conflits avant l'envoi et créneaux libres (étape 6), notifications push, rappel de la veille et bouton WhatsApp (étape 7). À cette étape, aucun texte ne promet qu'un membre « sera prévenu ».

## Règles du CDC à respecter

- **Parent** : crée un événement, il est publié tout de suite (« confirmé »). Il peut aussi modifier et supprimer, valider ou refuser une proposition.
- **Enfant** : son événement est une **proposition** (« proposé »). Seuls les parents et son auteur la voient. Il peut la retirer tant qu'elle n'est pas validée, jamais après. Il ne peut ni publier ni supprimer un événement confirmé.
- **Validation** : un parent valide (l'événement devient confirmé, avec qui l'a validé et quand) ou refuse.
- **Réponses** : chaque membre est « en attente » par défaut ; tous voient qui a répondu et quoi (je viens, je ne viens pas, peut-être).
- **Date modifiée** : si les dates d'un événement changent, les réponses repassent à « en attente ».
- **Événements passés** : restent dans l'historique ; seuls les parents les suppriment, quand ils veulent.
- Un membre ne voit aucun événement d'une autre famille.

## Décisions

- **Une seule fonction de lecture des événements** (`lib/events.ts`), qui applique la visibilité : un événement confirmé est visible de toute la famille ; une proposition seulement des parents et de son auteur ; sinon « introuvable » (404), jamais « interdit », pour ne pas révéler qu'elle existe. Tests sur la valeur renvoyée et sur la page reçue.
- **Le rôle décide du statut à la création** : parent donne `confirmed`, enfant donne `proposed`. Le serveur décide, le formulaire n'envoie jamais le statut.
- **Pas de ligne de réponse tant que personne n'a répondu** : l'absence de ligne `Rsvp` veut dire « en attente ». Un membre arrivé après la création est donc en attente sans rien écrire, et le départ d'un membre supprime ses réponses (déjà en cascade). Répondre = `upsert` sur `(événement, membre)`.
- **On ne répond que pour soi, et seulement à un événement confirmé et non terminé.**
- **Refuser une proposition la supprime** (le CDC ne prévoit que les statuts proposé et confirmé). Le message à l'enfant arrive à l'étape 7. Validation et refus ne réussissent que si l'événement est encore une proposition (`updateMany` sur le statut), pour qu'un double clic ou deux parents ne l'appliquent pas deux fois.
- **Dates** (même principe que les activités) : le navigateur convertit en UTC. Journées entières : premier jour et dernier jour (inclus) en minuit UTC, de 1 à 31 jours. Avec heures : début et fin en instants, fin après début, 31 jours au maximum. L'événement peut donc durer plusieurs jours dans les deux cas.
- **Modifier un événement** : réservé aux parents, sur un événement confirmé. Les réponses repassent à « en attente » seulement si les dates changent (pas pour un simple changement de titre ou de lieu).
- **Écrans** : `/evenements` (À valider pour les parents, Mes propositions pour un enfant, À venir, Passés), `/evenements/nouveau` (« Nouvel événement » pour un parent, « Proposer un événement » pour un enfant), `/evenements/[id]` (détail, réponse, participants, actions) et `/evenements/[id]/modifier`. Une barre de navigation « Événements » s'ajoute, et les événements des vues semaine et mois deviennent des liens vers le détail.
- **Textes** : tutoiement, casse de phrase, mots constants (« événement », « proposition », « membre »). Les boutons disent l'action : « Valider », « Refuser », « Retirer ma proposition », « Je viens », « Je ne viens pas », « Peut-être ».

## Tâches

### T1 : Saisie des événements (lib, sans UI)
- `eventSchema` (Zod) et conversion du formulaire en instants UTC, côté navigateur (même méthode que les activités).
- Tests : durées limites, journée entière sur plusieurs jours identique dans plusieurs fuseaux, fin avant début refusée, aller-retour « saisir, enregistrer, rouvrir ».
- Taille : M.

### T2 : Domaine des événements (lib, sans UI) : le cœur de l'étape
- `lib/events.ts` : créer (statut selon le rôle), lire un événement (visibilité), lister (à venir, passés, propositions selon le rôle), modifier (réponses remises à zéro si les dates changent), supprimer, valider, refuser, retirer sa proposition, répondre.
- Tests (base de test), un par critère du CDC : un enfant ne publie ni ne supprime ; une proposition n'est visible que des parents et de son auteur ; l'enfant retire sa proposition avant validation et pas après ; validation (statut, validateur, date) et refus ; double validation sans effet ; réponse « en attente » par défaut, mise à jour de sa propre réponse seulement ; dates modifiées donnent des réponses remises à zéro, titre modifié non ; aucun événement ni réponse d'une autre famille ; un membre retiré perd ses réponses et ses propositions.
- Taille : L.

### T3 : Créer ou proposer un événement
- Formulaire (titre, lieu, description, jours, heures, « Journée entière ») : composants purs réutilisés des activités (`TextField`, `CheckboxField`) et conteneur avec hook.
- Action serveur : session, rôle, validation Zod, domaine, puis redirection vers le détail.
- Taille : M.

### T4 : Liste et détail
- `/evenements` avec ses sections ; détail avec les réponses (boutons, participants groupés par réponse, « en attente » en dernier) ; actions selon le rôle (valider, refuser, modifier, supprimer avec confirmation, retirer sa proposition).
- États vide, chargement et erreur sur chaque écran.
- Taille : L (à couper en liste, puis détail et réponses, puis actions si besoin).

### T5 : Modifier, navigation et liens
- `/evenements/[id]/modifier` ; entrée « Événements » dans la navigation ; événements de la semaine et du mois cliquables.
- Taille : M.

### Checkpoint : fin de l'étape 5
- [ ] `pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm build` passent
- [ ] Critères CDC : enfant ni publier ni supprimer ; proposition visible des parents et de son auteur seulement (vérifié aussi sur la **page reçue**, par recherche du titre d'une proposition) ; retrait avant validation seulement
- [ ] Parcours : un enfant propose, un parent valide, tous répondent, un parent modifie les dates (réponses remises à zéro), puis supprime
- [ ] 375 px et 1440 px, clavier, contrastes
- [ ] Revue humaine avant l'étape 6

## Avant de coder l'interface (T3 à T5)
Charger : `frontend-design`, `ui-design-fundamentals`, `frontend-ui-engineering`, `architecture-frontend`, `ux-writing-interface`, `design-propre-et-ordonne`. Charte : logo et palette alignés.

## Risques

| Risque | Réponse |
| --- | --- |
| Fuite d'une proposition à un membre qui ne doit pas la voir | Une seule fonction de lecture ; « introuvable » plutôt qu'« interdit » ; test sur la valeur et sur la page reçue |
| Un enfant contourne le formulaire pour publier ou supprimer | Le statut n'est jamais lu depuis le formulaire ; chaque action vérifie le rôle côté serveur, testé sur les fonctions et pas sur les boutons |
| Deux parents valident ou refusent la même proposition en même temps | `updateMany` conditionné par le statut `proposed` ; le second obtient « déjà traitée » |
| Dates d'un événement sur plusieurs jours, fuseaux | Même méthode que les activités, tests dans plusieurs fuseaux |
| Réponses perdues par erreur lors d'une modification | Remise à zéro seulement si les dates changent, testé dans les deux sens |
| Mauvaise attente de l'utilisateur sur les notifications | Aucun texte ne promet d'être « prévenu » avant l'étape 7 |

## Questions ouvertes

1. **Refuser une proposition la supprime** (statuts du CDC), et l'enfant la voit simplement disparaître jusqu'à l'étape 7 qui le prévient. Préfères-tu un statut « refusée » pour qu'il voie « Refusée » dès maintenant ? Cela demande de modifier le schéma, donc une migration, via ton script par le port 443.
2. **Modifier un événement** est réservé aux parents ; un enfant ne peut que retirer sa proposition (pas la corriger). D'accord ?
3. **On ne peut plus répondre à un événement terminé** (les réponses restent visibles). D'accord ?
