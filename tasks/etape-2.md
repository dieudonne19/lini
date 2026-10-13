# Étape 2 : Famille et connexion par lien

Source : `CDC-agenda-famille.md`, étape 2 (F1, F2, F3, F19, rôles parent et enfant).
Pré-requis : étape 1 en place (schéma, `lib/db.ts`, `lib/token.ts`, seed).

## Décisions

- **Session** : cookie `lini_session` httpOnly, `secure` en production, `sameSite=lax`, durée 1 an. Il contient le jeton brut ; chaque requête le hache et cherche `Member.tokenHash`. Révoquer = changer le hash : le cookie cesse de marcher immédiatement, sans table de sessions.
- **« Signé »** (CDC) : le jeton fait 256 bits et est vérifié en base, une signature HMAC n'ajoute rien et demande un secret de plus. Raccourci proposé, à confirmer (question 1).
- **Connexion** : `GET /m/[token]` (route handler) pose le cookie puis redirige vers `/`. Jeton inconnu : page « Ce lien ne fonctionne plus ».
- **Lecture du membre courant** : `lib/auth.ts` expose `getCurrentMember()` et `requireParent()`. Pas d'import de `next/headers` dans `lib/` : le cookie est lu dans `app/`, `lib/` reçoit le jeton.
- **Validation** : schémas Zod dans `lib/schemas.ts` (nom, couleur parmi une palette fixe, rôle, téléphone E.164 facultatif).
- **Téléphone** : seule la fonction de lecture des membres le renvoie, et seulement si le demandeur est parent.
- **Lien affiché une seule fois** : retourné par l'action (état du formulaire), jamais stocké en clair.
- **Révoquer un lien** = en régénérer un : l'ancien meurt, le nouveau s'affiche. Raccourci : pas d'état « sans lien ».
- **Retirer un membre** : supprime aussi ses propositions (`FamilyEvent` `proposed` dont il est `createdById`), les autres cascades viennent du schéma.
- **Dernier parent** : règle vérifiée côté serveur dans une seule fonction, utilisée pour « retirer » et « passer en enfant ».

## Tâches

### T1 : Session et contrôle d'accès (lib, sans UI)
- `lib/auth.ts` : `memberFromToken(token)`, règle `canRemoveOrDemote(memberId)` (dernier parent).
- `lib/schemas.ts` : Zod pour famille et membre.
- Tests (base de test) : jeton valide → membre ; jeton inconnu → null ; après régénération, l'ancien jeton échoue ; dernier parent refusé ; autre famille jamais renvoyée.
- Taille : M. Vérif : `pnpm test`, `pnpm typecheck`.

### T2 : Premier lancement (F1)
- Page `/` : sans cookie valide, formulaire « nom de la famille + ton prénom + couleur » ; une action crée `Family` + premier `Member` parent, pose le cookie, affiche le lien personnel une fois avec « Copier ».
- Avec cookie valide : `/` affiche l'accueil connecté (placeholder jusqu'à l'étape 4).
- Taille : M. Vérif : création bout en bout dans le navigateur, 375 px et 1440 px, clavier, états erreur et chargement.

### T3 : Connexion par lien (F3)
- `app/m/[token]/route.ts` et page « lien invalide ». Bouton « Se déconnecter » (supprime le cookie seulement).
- Taille : S. Vérif : lien seed ouvert → connecté ; lien modifié d'un caractère → page invalide ; pas de cookie posé dans ce cas.

### T4 : Page Famille et ajout de membre (F2)
- `/famille` (parents seulement) : liste (nom, rôle, couleur + initiale, téléphone), formulaire d'ajout, lien affiché une fois.
- Enfant sur `/famille` : redirigé. Test : le téléphone n'est pas dans les données envoyées à un enfant.
- Taille : M.

### T5 : Régénérer, retirer, changer le rôle (F19)
- Actions parent : régénérer le lien, retirer un membre (propositions supprimées), passer parent ↔ enfant. Dernier parent protégé. Bandeau « Ajoute un deuxième parent » tant qu'il n'y en a qu'un.
- Tests : lien régénéré, ancien refusé ; membre retiré, son lien refusé ; dernier parent ni retiré ni rétrogradé ; un enfant ne peut appeler aucune de ces actions (test sur l'action, pas sur le bouton).
- Taille : M.

### Checkpoint : fin de l'étape 2
- [ ] `pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm build` passent
- [ ] Critères CDC couverts : lien révoqué sans accès, aucune donnée d'une autre famille, téléphone jamais renvoyé à un enfant, dernier parent protégé
- [ ] Parcours manuel : créer famille → ajouter un enfant → ouvrir son lien dans une autre fenêtre → révoquer → l'ancien lien échoue
- [ ] Revue humaine avant l'étape 3

## Avant de coder l'interface (T2, T4, T5)
Charger : `frontend-design`, `ui-design-fundamentals`, `frontend-ui-engineering`, `ux-writing-interface`, et `design-propre-et-ordonne`. Charte client : aucune pour l'instant.

## Questions
1. Cookie : jeton brut vérifié en base (proposé) ou cookie signé HMAC avec `SESSION_SECRET` comme écrit dans le CDC ?
2. Premier lancement : tout visiteur sans cookie peut-il créer une famille (proposé, la v1 est privée par son URL), ou la création est-elle bloquée dès qu'une famille existe ?
3. Révoquer sans régénérer (membre sans lien actif) : inutile en v1, je garde « révoquer = régénérer ». OK ?
