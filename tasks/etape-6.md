# Étape 6 : Conflits et créneaux libres

Source : `CDC-agenda-famille.md`, étape 6 (F13, F14) et les règles « Conflit » et « Créneaux libres ».
Pré-requis : étapes 1 à 5 (lecture masquée `listFamilySchedule`, `expandActivity`, formulaire d'événement, détail d'une proposition).
**Aucun changement de schéma.**

## Règles du CDC à respecter

- **Conflit** : un membre est en conflit si une de ses activités, **privée comprise**, chevauche l'événement. L'application **nomme le membre, jamais le titre** de l'activité.
- **Créneaux libres** : un créneau est proposé seulement si aucun membre n'a d'activité, privée comprise, sur les 14 prochains jours.
- Écran « Nouvel événement » : aperçu des conflits **avant l'envoi**. Parcours principal : « crée un événement en voyant les conflits avant d'envoyer ».
- Critères d'acceptation : un événement placé sur un jour où un membre est occupé affiche le conflit ; les créneaux libres excluent toute activité, privée comprise.

## Décisions

- **La confidentialité est garantie par le type, pas par la discipline.** Les conflits et les créneaux se calculent à partir de `listFamilySchedule`, qui rend déjà les activités privées d'autrui sans titre (variante `busy`). Les heures et la répétition suffisent : le titre n'entre jamais dans le calcul, et le résultat ne contient que des membres et des heures.
- **Le calcul se fait dans le navigateur, dans le fuseau de l'appareil**, comme les vues semaine et mois : même `expandActivity`, mêmes journées entières ancrées en UTC. Cela remplace l'écart d'une heure côté serveur que nous avions accepté, car la prévisualisation est un aperçu et non une règle imposée.
- **Un conflit est une information, pas un blocage** : on peut envoyer quand même.
- **Conflit** :
  - événement avec heures contre activité avec heures : les intervalles se chevauchent strictement (finir à l'heure où l'autre commence n'est pas un conflit) ;
  - une activité « journée entière » occupe tout le jour : elle est en conflit avec tout événement de ce jour ;
  - un événement « journée entière » est en conflit avec toute activité qui touche un de ses jours (une activité qui passe minuit compte sur les deux jours) ;
  - toutes les occurrences comptent, répétitions comprises, tous les membres comptent, l'auteur compris.
- **Créneau libre** : sur les 14 jours à partir d'aujourd'hui, le temps où **aucun** membre n'a d'activité, entre 8 h et 22 h, en plages d'au moins 2 h. Le jour même commence à la prochaine demi-heure. Un jour entièrement libre est présenté comme « toute la journée ». Raccourci : 8 h à 22 h et 2 h fixes, à rendre réglables si le besoin apparaît.
- **Le navigateur demande à la volée les activités de la période** de l'événement saisi : une action serveur en lecture (`loadScheduleAction`) qui vérifie la session, valide les dates (Zod, fenêtre bornée à 70 jours) et rend la lecture masquée. Les réponses périmées (la personne a changé la date entre-temps) sont ignorées.
- **Le formulaire d'événement devient « contrôlé »** (dates et heures dans l'état du conteneur) : c'est nécessaire pour calculer l'aperçu en direct et pour remplir les champs quand on choisit un créneau.
- **Les conflits apparaissent aussi sur la proposition d'un enfant, pour un parent** (c'est là que l'invitation part, à la validation).
- **shadcn/ui d'abord** pour les nouveaux composants : `alert` pour l'aperçu des conflits et `collapsible` pour le panneau des créneaux, installés avec `npx shadcn@latest add` et adaptés à la charte.

## Tâches

### T1 : Conflits et créneaux libres (lib, sans UI) : le cœur de l'étape
- `lib/conflicts.ts` : `findConflicts(schedule, event)` renvoie les membres en conflit, dans l'ordre d'arrivée dans la famille.
- `lib/free-slots.ts` : `findFreeSlots(schedule, now, options)` renvoie les plages libres des 14 prochains jours.
- Tests (avec `TZ`) : activité privée comptée sans que son titre soit lu ; activité chevauchante, voisine (bord) et sans rapport ; journée entière contre événement avec heures et inversement ; activité passant minuit ; répétition (quotidienne, hebdomadaire, avec fin) ; changement d'heure ; journée entière identique à Auckland et Los Angeles ; créneaux : un membre occupé ou une activité privée retire bien la plage, plages de moins de 2 h écartées, jour libre en entier, aujourd'hui à partir de la prochaine demi-heure ; le résultat ne contient jamais de titre.
- Taille : L.

### T2 : Données à la volée
- `loadScheduleAction(from, to)` et hook `useScheduleWindow(range)` : retarde l'appel, garde ce qui est déjà chargé, ignore les réponses périmées, expose chargement et erreur.
- Tests : validation de la fenêtre (vide, inversée, trop longue, dates invalides) ; la réponse ne contient aucun titre d'activité privée d'un autre membre.
- Taille : M.

### T3 : Aperçu des conflits dans le formulaire
- `EventForm` contrôlé, hook `useEventDraft` (champs, plage de dates calculée), composant pur `ConflictNotice` (en cours, erreur, personne n'est occupé, « Occupés à ce moment-là : Anna, Basile »), annoncé aux lecteurs d'écran.
- Utilisé à la création, à la proposition et à la modification.
- Taille : L.

### T4 : Créneaux libres
- Panneau repliable « Trouver un créneau où tout le monde est libre » : plages par jour ; un choix remplit les champs du formulaire.
- États chargement, aucun créneau (« Personne n'est libre en même temps dans les 14 prochains jours ») et erreur.
- Taille : M.

### T5 : Conflits sur une proposition (parent)
- Le détail d'une proposition affiche les conflits à un parent, juste avant « Valider » ; la page serveur lit la période de l'événement.
- Taille : S.

### Checkpoint : fin de l'étape 6
- [ ] `pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm build` passent
- [ ] Critères CDC : un événement sur un jour où un membre est occupé affiche le conflit ; les créneaux excluent toute activité, privée comprise
- [ ] Confidentialité : le titre d'une activité privée n'apparaît ni dans la réponse de l'action, ni dans la page reçue, ni à l'écran
- [ ] Parcours : créer un événement en voyant le conflit, choisir un créneau libre, envoyer
- [ ] 375 px et 1440 px, clavier, contrastes
- [ ] Revue humaine avant l'étape 7

## Avant de coder l'interface (T3 à T5)
Charger : `frontend-design`, `ui-design-fundamentals`, `frontend-ui-engineering`, `architecture-frontend`, `ux-writing-interface`, `design-propre-et-ordonne`.

## Risques

| Risque | Réponse |
| --- | --- |
| Le titre d'une activité privée fuit par l'aperçu ou par l'action de lecture | Le calcul ne reçoit que la lecture masquée ; la variante `busy` n'a pas de clé `title` ; tests sur la valeur et sur la réponse de l'action |
| Erreurs de fuseau, de changement d'heure, de journée entière | Calcul dans le fuseau de l'appareil, tests avec `TZ` dont les deux changements d'heure et Auckland, Los Angeles |
| Réponse périmée affichée après un changement de date | Le hook ignore toute réponse qui ne correspond plus à la période demandée ; test du hook |
| Aperçu lent ou en erreur : la personne croit qu'il n'y a pas de conflit | Un état « en cours » et un état « erreur » explicites ; jamais « aucun conflit » tant que la lecture n'a pas abouti |
| Calcul coûteux avec beaucoup d'activités | Période bornée (31 jours au plus pour un événement, 14 jours pour les créneaux), garde-fou de performance dans les tests |
| Le formulaire contrôlé casse la saisie existante | Tests de conversion déjà en place ; parcours de création, de proposition et de modification re-vérifié dans le navigateur |

## Questions ouvertes

1. **Un « créneau libre » est une plage d'heures** (entre 8 h et 22 h, au moins 2 h, sur 14 jours), avec « toute la journée » quand le jour est entièrement libre. Ou préfères-tu seulement des **journées** entièrement libres (plus simple, et c'est l'objectif de départ du CDC : « trouver les jours où tout le monde est libre ») ?
2. **Seules les activités comptent** pour les conflits et les créneaux (comme le CDC), pas les autres événements familiaux. D'accord ?
3. **Un conflit n'empêche pas d'envoyer**. D'accord ?
4. **Un parent voit aussi les conflits d'une proposition d'enfant** avant de la valider. D'accord ?
