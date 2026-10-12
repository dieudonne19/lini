# Plan de réalisation : Lini, étape 1 (Base)

Source : `CDC-agenda-famille.md`, étape 1 : « projet, Prisma, Neon, modèles, jeu de données de test ».
Les étapes 2 à 8 seront planifiées une fois celle-ci validée.

## Vue d'ensemble

Le projet Next.js 16.4 / React 19 / shadcn / Tailwind 4 existe déjà (page d'accueil par défaut).
Il manque : la base de données, les modèles, la validation, un runner de tests et des données de test.
À la fin de l'étape, on peut lancer `pnpm db:seed` et lire une famille complète depuis Neon, avec des tests qui passent.

## État actuel (vérifié)

- `package.json` : next 16.4.0, pnpm, scripts `dev build lint typecheck format`. Pas de Prisma, Zod ni runner de tests.
- `lib/` ne contient que `utils.ts` (`cn`). Alias `@/*` configuré, `strict` activé.
- `.gitignore` ignore `.env*` : prévoir un `.env.example` (à forcer avec `git add -f` ou règle `!.env.example`).
- Docs Next.js locales : `node_modules/next/dist/docs/` (à lire pour les variables d'environnement avant la tâche 1).

## Décisions d'architecture

- **`lib/` sans Next ni React** (CDC). `lib/db.ts` (client Prisma) et `lib/token.ts` (jeton) n'importent rien de Next.
- **Une seule source de vérité des types** : les types viennent de Prisma et de Zod, pas réécrits à la main.
- **Suppression d'un membre** (CDC : activités, propositions et réponses supprimées) :
  `Activity`, `Rsvp`, `PushSubscription` en `onDelete: Cascade`.
  `FamilyEvent.createdById` et `validatedById` en `onDelete: SetNull` : un événement **confirmé** survit au départ de son créateur.
  Les **propositions** du membre sont supprimées explicitement par l'action « retirer un membre » (étape 2), pas par le schéma.
- **Journée entière** : `startsAt` / `endsAt` restent des `DateTime`. Quand `allDay = true`, on stocke minuit UTC du jour et on l'affiche toujours en UTC (jamais converti au fuseau de l'appareil). Raccourci : un seul type de colonne ; à revoir si une date seule devient nécessaire côté SQL (`@db.Date`).
- **Jeton** : 32 octets aléatoires (`crypto.randomBytes`), seul le hash SHA-256 est stocké (`tokenHash` unique). Le jeton est un secret de haute entropie : un hash rapide suffit, pas besoin de bcrypt.
- **Deux URL Neon** : `DATABASE_URL` (poolée, application) et `DIRECT_URL` (migrations), comme le CDC.
- **Tests** : Vitest (compatible `@/*`, pas de config lourde). Les tests de base de données tournent sur une **branche Neon de test**, jamais sur la base de dev.

## Graphe de dépendances

```
T1 outils (deps, env, vitest)
  └── T2 schéma + migration (Neon)
        └── T3 client Prisma + test de lecture
              └── T4 jeton + seed (jeu de test)
```

Tranche verticale ici = « de la dépendance au premier jeu de données lisible ». Il n'y a pas d'écran à cette étape.

## Tâches

Voir `tasks/todo.md` (critères d'acceptation et vérifications par tâche).

| # | Tâche | Taille |
| --- | --- | --- |
| 1 | Outils : Prisma, Zod, Vitest, variables d'environnement | S |
| 2 | Schéma Prisma (6 modèles) et première migration | M |
| 3 | Client Prisma et test de lecture sur Neon | S |
| 4 | Jeton (génération, hash) et jeu de données de test | M |

## Risques

| Risque | Impact | Réponse |
| --- | --- | --- |
| La version de Prisma installée change la configuration (adaptateur de pilote, `prisma.config.ts`, dossier de sortie du client) | Moyen | Lire la doc de la version installée avant la tâche 1, pas de mémoire |
| Pas de projet Neon prêt | Bloquant pour T2 | Créer le projet et la branche de test avant T2 (voir questions) |
| Le seed s'exécute sur la mauvaise base | Élevé (données perdues) | Le seed refuse de tourner si `DATABASE_URL` ne contient pas le nom de la base de dev, et vide les tables avant d'insérer |
| `.env` committé par erreur | Élevé | `.gitignore` couvre `.env*` ; seul `.env.example` (sans valeurs) est suivi |
| Fuite du titre d'une activité privée | Élevé | Hors périmètre ici ; la fonction de lecture unique est créée à l'étape 4 |

## Questions ouvertes

1. Le projet Neon existe-t-il déjà ? Il faut `DATABASE_URL` (poolée) et `DIRECT_URL` (directe) pour la base de dev, plus une branche de test.
2. Valides-tu le stockage des journées entières (minuit UTC, affichage en UTC) ?
3. Gestionnaire de paquets : pnpm (déjà en place), je garde.
