# Étape 3 : Mon agenda

Source : `CDC-agenda-famille.md`, étape 3 (F4, F5, F6).
Pré-requis : étape 2 en place (session, `lib/members.ts`, composants purs `TextField`, `ColorPicker`, `PersonalLinkCard`).
Le modèle `Activity` existe déjà : **aucun changement de schéma prévu** (voir risque 1).

## Décisions

- **Un membre gère uniquement ses propres activités**, même s'il est parent. Chaque écriture filtre sur `{ id, memberId }` : l'activité d'un autre membre est « introuvable ».
- **Pas de lecture des activités des autres à cette étape.** La fonction de lecture unique qui masque le titre des activités privées est créée à l'étape 4. Ici, une seule lecture : `listOwnActivities(memberId)`.
- **Heures** : le navigateur convertit la date et l'heure locales en instant UTC (`new Date("2026-10-14T18:00").toISOString()`) et envoie ce texte. Le serveur le valide (Zod) et le stocke tel quel. Aucune bibliothèque de fuseaux.
- **Journée entière** (convention du seed) : `startsAt = endsAt = minuit UTC du jour`, `allDay = true`. Elle couvre ce jour entier. Affichée toujours en UTC, jamais convertie.
- **Répétition** : les occurrences sont calculées à l'affichage dans `lib/recurrence.ts` (fonction pure). Elle avance avec l'arithmétique de `Date` **locale à l'appareil**, qui garde l'heure locale d'un changement d'heure à l'autre (un cours à 18 h reste à 18 h). Pas de dépendance. Raccourci : côté serveur (étape 6, conflits) le fuseau est UTC, l'écart d'une heure autour d'un changement d'heure est accepté à ce stade.
- **Modifier une activité répétée** modifie toute la série (CDC). Pas d'exception sur une occurrence.
- **Validation** (`lib/schemas.ts`) : titre 1 à 80 caractères ; fin après début ; `repeatUntil` pas avant le premier jour et au plus 2 ans après (borne l'expansion) ; `repeat` à `none` ignore `repeatUntil`.
- **Écran** `/agenda` : les 14 prochains jours groupés par jour, avec une activité par ligne (heures, titre, pastille « Privée », « Chaque semaine jusqu'au… »). Les semaines et le mois restent à l'étape 4.
- **Suppression** : confirmation en deux temps, comme le retrait d'un membre.

## Tâches

### T1 : Schéma de saisie et répétitions (lib, sans UI)
- `activitySchema` (Zod) et type `ActivityInput`.
- `lib/recurrence.ts` : `expandActivity(activity, from, to)` renvoie les occurrences `{ startsAt, endsAt, allDay }` dans la fenêtre.
- Tests : quotidien ; hebdomadaire jusqu'à la date de fin (incluse) ; passage de mois et d'année ; changement d'heure Europe/Paris (mars et octobre, avec `TZ`) ; journée entière identique dans plusieurs fuseaux ; activité qui commence avant la fenêtre ; `repeatUntil` absent.
- Taille : M. Vérif : `pnpm test`, `pnpm typecheck`.

### T2 : Domaine des activités (lib)
- `lib/activities.ts` : `createActivity`, `updateActivity`, `deleteActivity` (toutes avec `memberId` du demandeur) et `listOwnActivities`.
- Tests (base de test) : création puis relecture ; modifier ou supprimer l'activité d'un autre membre est refusé et ne change rien ; suppression du membre supprime ses activités ; `repeatUntil` ignoré si `repeat = none`.
- Taille : M.

### T3 : Écran « Mon agenda » en lecture
- Page `/agenda` (tout membre connecté), accueil avec lien « Mon agenda ».
- Composants purs : liste par jour, ligne d'activité, état vide avec action « Ajouter une activité », squelette de chargement (`loading.tsx`), erreur (`error.tsx`).
- Taille : M. Vérif : 375 px et 1440 px, clavier, contraste du texte secondaire.

### T4 : Ajouter, modifier, supprimer
- Formulaire pur (titre, jour, heure de début et de fin, « Journée entière », « Privée », répétition, fin de répétition) et conteneur avec un hook `useActivityForm` pour la conversion locale vers UTC.
- Actions serveur : validation Zod, contrôle que le demandeur est le propriétaire.
- Taille : L (à couper en « ajouter » puis « modifier et supprimer » si besoin).

### Checkpoint : fin de l'étape 3
- [ ] `pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm build` passent
- [ ] Critères CDC couverts : activité hebdomadaire visible chaque semaine jusqu'à sa fin ; journée entière sur le même jour dans tous les fuseaux
- [ ] Parcours manuel : ajouter une activité répétée, la modifier (toute la série change), la supprimer
- [ ] Revue humaine avant l'étape 4

## Avant de coder l'interface (T3, T4)
Charger : `frontend-design`, `ui-design-fundamentals`, `frontend-ui-engineering`, `architecture-frontend`, `ux-writing-interface`, `design-propre-et-ordonne`.

## Risques

| Risque | Réponse |
| --- | --- |
| Un changement de schéma serait bloqué : `prisma migrate` utilise le port 5432, bloqué sur ta connexion | Aucun changement de schéma dans cette étape. Si l'étape 4 en demande un, trouver d'abord comment migrer (autre réseau ou migration via l'adaptateur) |
| Erreurs de fuseau ou de changement d'heure | Conversion faite par le navigateur, tests de `recurrence.ts` avec `TZ=Europe/Paris` sur les deux changements d'heure |
| Le test `TZ` ne s'applique pas si Node a déjà lu le fuseau | Lancer ces tests dans un fichier dédié avec `TZ` fixé dans la config Vitest, et vérifier qu'ils échouent bien avec une mauvaise implémentation |
| Une répétition sans fin génère trop d'occurrences | L'expansion est toujours bornée par la fenêtre demandée (14 jours ici) |

## Questions ouvertes (réponses : 1 oui, durée maximale 24 h ; 2 oui ; 3 oui, fuseau de l'appareil)

1. Les activités sur plusieurs jours (un voyage de 3 jours) sont-elles utiles en v1 ? Le CDC ne parle que d'« un jour » : je propose **un seul jour par activité**.
2. Une activité qui passe minuit (22 h à 1 h) : acceptée telle quelle (fin après début, sur deux jours calendaires) ?
3. Le fuseau pour les répétitions : l'approche « fuseau de l'appareil, sans dépendance » te convient-elle, sachant que l'écart d'une heure côté serveur à l'étape 6 est accepté ?
