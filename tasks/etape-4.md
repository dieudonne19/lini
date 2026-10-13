# Étape 4 : Vues semaine et mois

Source : `CDC-agenda-famille.md`, étape 4 (F7, F8) et la règle de confidentialité.
Pré-requis : étapes 1 à 3 (activités, répétitions `expandActivity`, composants purs, logo et palette).
Aucun changement de schéma prévu (voir risque 1).

## Règles du CDC à respecter

- **Semaine** : une ligne par membre, sept jours en colonnes, couleur par membre, activités privées affichées « Occupé ».
- **Mois** : vue d'ensemble, pastilles par jour, événements familiaux en relief.
- **Activité privée** : les autres membres, parents compris, voient « Occupé » avec les heures, jamais le titre. Le masquage est fait par le serveur, dans **une seule fonction de lecture**, testé sur la réponse du serveur.
- Un membre ne voit aucune donnée d'une autre famille.
- Les heures s'affichent selon le fuseau de l'appareil ; une journée entière reste le même jour partout.

## Décisions

- **Une seule fonction de lecture** : `listFamilySchedule(viewer, fenêtre)` (dans `lib/schedule.ts`) renvoie les membres de la famille du demandeur, leurs activités et les événements confirmés. Aucune autre fonction ne lit les activités d'autrui.
- **Le titre n'existe pas dans une activité masquée** : le type est une union `{ kind: "full", title, ... } | { kind: "busy", ... }`. La variante `busy` n'a pas de clé `title`, donc impossible de la fuiter par oubli. Le propriétaire voit toujours ses propres titres.
- **Le serveur n'envoie que la période affichée** (réponse à la question 4) : `listFamilySchedule(viewer, { from, to })` ne lit que les séries qui peuvent toucher la fenêtre (index `Activity(memberId, startsAt)`), élargie d'un jour de chaque côté pour les fuseaux. Le calcul du navigateur est donc borné par la fenêtre, pas par l'historique de la famille.
- **Répétitions calculées dans le navigateur** (décision de l'étape 3) : le navigateur développe les séries reçues avec `expandActivity` dans le fuseau de l'appareil, uniquement sur la fenêtre affichée.
- **La période est dans l'adresse** : `/?du=2026-10-12` (lundi local de la semaine) et `/?mois=2026-10`. Précédent, suivant et aujourd'hui sont des liens, avec un squelette pendant le chargement. Sans paramètre, le serveur prend la semaine de la date UTC du jour avec une semaine de marge de chaque côté, et le navigateur affiche sa propre semaine courante dans cette marge (le décalage horaire maximal, 14 h, tient dans une semaine). Les paramètres sont validés avec Zod : un paramètre invalide revient à la valeur par défaut.
- **Semaine comme page d'accueil** (CDC : « arrive sur la semaine ») : `/` affiche la semaine pour un membre connecté. Les liens « Mon agenda », « Gérer la famille » (parents) et « Se déconnecter » passent dans une barre de navigation en haut, sous le logo.
- **Semaine sur grand écran** : grille membres en lignes, sept jours en colonnes (lundi premier jour). **Sur téléphone** : sept colonnes ne tiennent pas dans 375 px, donc une liste jour par jour avec le membre indiqué sur chaque ligne.
- **Mois** : grille de 7 colonnes, un chiffre par jour, une pastille par membre occupé (avec l'initiale, la couleur n'est jamais le seul signal), les événements familiaux en relief. Un jour touché ouvre la semaine qui le contient.
- **Événements familiaux** : seuls les événements **confirmés** sont affichés à cette étape (ligne « Famille » en haut de la semaine et en relief dans le mois). Les propositions arrivent à l'étape 5 avec « À valider ».
- **Pages larges** : `/` passe à une largeur de contenu plus grande (la grille de la semaine en a besoin), les autres pages gardent leur colonne étroite.

## Tâches

### T1 : Lecture unique et masquage (lib, sans UI) : le cœur de l'étape
- `lib/schedule.ts` : `listFamilySchedule(viewer, { from, to })` et le type `ScheduleActivity` (full ou busy).
- Fenêtre : une série commencée il y a un an et encore active est renvoyée ; une série terminée avant la fenêtre ne l'est pas ; une activité unique hors fenêtre ne l'est pas ; une journée entière en bordure de fenêtre l'est.
- Tests (base de test), sur la **valeur renvoyée** et sur son JSON : l'activité privée d'un autre membre n'a pas de clé `title` et son texte n'apparaît nulle part dans `JSON.stringify` ; même résultat pour un parent qui regarde un enfant ; le propriétaire voit ses propres titres ; une activité privée reste « Occupé » avec ses heures et sa répétition ; aucune activité ni membre d'une autre famille ; le téléphone n'est jamais renvoyé ; les événements proposés ne sont pas renvoyés.
- Taille : M. Vérif : `pnpm test`, `pnpm typecheck`.

### T2 : Calculs de calendrier (lib, sans UI)
- `lib/week.ts` : jours d'une semaine (lundi), occurrences par membre et par jour, avancer ou reculer d'une semaine.
- `lib/month.ts` : grille du mois (semaines complètes), membres occupés par jour, événements par jour, avancer ou reculer d'un mois.
- Garde-fou de performance : développer 500 activités répétées sur la fenêtre d'un mois doit rester sous 100 ms.
- Adresses : lecture et validation (Zod) de `du` et `mois`, valeur par défaut si invalide.
- Tests (avec `TZ`) : semaine du changement d'heure (29 mars 2026 à Paris) avec bien 7 jours ; mois de février ; passage d'une année à l'autre ; journée entière sur le même jour à Auckland et Los Angeles ; activité répétée visible chaque semaine ; mois à 6 lignes.
- Taille : M.

### T3 : Écran semaine
- Conteneur client (fuseau de l'appareil, `useIsClient`) et composants purs : grille (grand écran), liste par jour (téléphone), cellule, ligne « Famille », navigation précédente, suivante, aujourd'hui, libellé de la période.
- `/` affiche la semaine ; états chargement, vide (famille sans activité) et erreur.
- Taille : L (à couper en grille puis liste mobile si besoin).

### T4 : Écran mois et bascule
- Grille du mois, pastilles avec initiales, événements en relief, navigation ; onglets « Semaine | Mois » ; un jour touché ouvre sa semaine.
- Taille : M.

### T5 : Barre de navigation
- Composant pur avec « Mon agenda », « Gérer la famille » (parents), « Se déconnecter » ; remplace les boutons de l'ancien écran d'accueil.
- Taille : S.

### Checkpoint : fin de l'étape 4
- [ ] `pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm build` passent
- [ ] Critère CDC « une activité privée ne renvoie jamais son titre à un autre membre » vérifié sur la **réponse du serveur** : test de `listFamilySchedule` et recherche du titre secret dans le HTML et la charge de la page reçue par un autre membre (parent compris)
- [ ] Critère CDC « un membre ne voit aucune donnée d'une autre famille »
- [ ] Parcours : ouvrir son lien, arriver sur la semaine, passer au mois, ouvrir un jour
- [ ] Contrôle à 375 px et 1440 px, au clavier, contrastes
- [ ] Revue humaine avant l'étape 5

## Avant de coder l'interface (T3 à T5)
Charger : `frontend-design`, `ui-design-fundamentals`, `frontend-ui-engineering`, `architecture-frontend`, `ux-writing-interface`, `design-propre-et-ordonne`. Charte : le logo et la palette alignés (marine, bleu, orange, vert, violet).

## Risques

| Risque | Réponse |
| --- | --- |
| Un changement de schéma serait bloqué (`prisma migrate` utilise le port 5432, bloqué sur ta connexion) | Aucun changement de schéma dans cette étape |
| Fuite du titre d'une activité privée par une autre voie que la fonction de lecture | Une seule fonction lit les activités d'autrui ; la variante `busy` n'a pas de clé `title` ; recherche du titre secret dans la page reçue |
| Grille de 7 colonnes illisible à 375 px | Liste par jour sur téléphone ; contrôle à 375 px avec une `iframe` de 375 px de large sur la même origine (la fenêtre du navigateur ne se redimensionne pas) |
| Erreurs de semaine ou de mois autour des changements d'heure | Tests avec `TZ=Europe/Paris` sur la semaine du 29 mars 2026 |
| Calcul trop long dans le navigateur avec beaucoup d'activités | Fenêtre de dates côté serveur, calcul limité à la période affichée, test de performance (500 activités sous 100 ms) |
| Chaque changement de semaine demande une requête | Liens préchargés par Next, squelette de chargement, la fenêtre reçue inclut une semaine de marge |
| La base de dev refuse la connexion (mot de passe) : pas de données pour tester à la main | Rétablir les identifiants dans `.env.development`, puis `pnpm db:seed` (le seed contient des activités privées, publiques, répétées et un événement) |

## Questions ouvertes (réponses : 1 oui, 2 oui, 3 oui, 4 non : fenêtre de dates côté serveur, voir Décisions)

1. La **semaine devient la page d'accueil** et les boutons passent dans une barre de navigation en haut : d'accord ?
2. Sur téléphone, la semaine est une **liste jour par jour** (une grille de 7 colonnes ne tient pas) : d'accord ?
3. À cette étape, seuls les événements **confirmés** apparaissent (les propositions viennent à l'étape 5) : d'accord ?
4. ~~Le serveur envoie toutes les activités de la famille d'un coup~~ : refusé, remplacé par une fenêtre de dates côté serveur.
