# Tâches : étape 1 (Base)

## Task 1 : Outils (Prisma, Zod, Vitest, variables d'environnement)

**Description :** Installer les dépendances et préparer la configuration, sans modèle ni code métier.

**Acceptance criteria :**
- [x] Doc de la version installée de Prisma lue (config, adaptateur Neon, sortie du client) avant de coder
- [x] `prisma`, `@prisma/client`, `zod`, `vitest` installés ; versions notées dans `package.json`
- [x] Scripts ajoutés : `test`, `db:migrate`, `db:seed`, `db:studio`
- [x] `.env.example` liste `DATABASE_URL`, `DIRECT_URL`, `.env.test` sans valeur, et est suivi par git (`.env` reste ignoré)

**Verification :**
- [x] `pnpm typecheck` et `pnpm lint` passent
- [x] `pnpm test` tourne (même sans test : « no tests » accepté) 
- [x] `git status` ne montre aucun `.env`

**Dependencies :** aucune
**Files likely touched :** `package.json`, `pnpm-lock.yaml`, `.env.example`, `.gitignore`, `vitest.config.ts`, `prisma.config.ts` (si la version l'exige)
**Scope :** S

## Task 2 : Schéma Prisma et première migration

**Description :** Traduire le modèle de données du CDC en schéma Prisma et l'appliquer sur Neon.

**Acceptance criteria :**
- [x] 6 modèles : `Family`, `Member`, `Activity`, `FamilyEvent`, `Rsvp`, `PushSubscription`
- [x] Enums : `Role` (parent, child), `Repeat` (none, daily, weekly), `EventStatus` (proposed, confirmed), `RsvpStatus` (yes, no, maybe, pending)
- [x] `Member.phone` facultatif ; `Member.tokenHash` unique ; `Rsvp` unique sur `(eventId, memberId)`
- [x] Pas de `pastReminderSentAt` (retiré du CDC)
- [x] Suppressions : cascade pour `Activity`, `Rsvp`, `PushSubscription` ; `SetNull` pour `createdById` et `validatedById`
- [x] Index : `Member(familyId)`, `Activity(memberId, startsAt)`, `FamilyEvent(familyId, startsAt)`
- [x] Migration générée et appliquée avec `DIRECT_URL`

**Verification :**
- [x] `pnpm prisma validate` passe
- [x] Migration appliquée sur la base de dev et sur la branche de test
- [x] `pnpm typecheck` passe avec les types générés
- [x] Relecture du fichier SQL de migration : aucune suppression inattendue

**Dependencies :** Task 1, projet Neon prêt
**Files likely touched :** `prisma/schema.prisma`, `prisma/migrations/*`
**Scope :** M

## Task 3 : Client Prisma et test de lecture

**Description :** Un client Prisma unique (URL poolée), réutilisé en développement, et un test qui prouve la connexion et les contraintes.

**Acceptance criteria :**
- [ ] `lib/db.ts` exporte un seul client, sans import de Next ni de React
- [ ] Le client survit au rechargement à chaud en développement (pas de connexions multipliées)
- [ ] Test sur la branche de test : créer une famille et un membre, relire, puis nettoyer
- [ ] Test : un second `tokenHash` identique est refusé ; un second `Rsvp` identique est refusé
- [ ] Test : supprimer un membre supprime ses activités et ses réponses, mais garde un événement confirmé qu'il avait créé

**Verification :**
- [ ] `pnpm test` passe sur `.env.test`
- [ ] `pnpm typecheck` passe

**Dependencies :** Task 2
**Files likely touched :** `lib/db.ts`, `lib/db.test.ts`, `vitest.config.ts`
**Scope :** S

## Task 4 : Jeton et jeu de données de test

**Description :** Fonction de génération et de hash du jeton (réutilisée à l'étape 2), et un seed réaliste pour développer les écrans suivants.

**Acceptance criteria :**
- [ ] `lib/token.ts` : génère 32 octets aléatoires (encodés pour une URL) et calcule le hash ; sans import de Next
- [ ] Tests : deux jetons différents ; le hash est stable ; le jeton fait au moins 32 octets
- [ ] Seed : 1 famille, 2 parents, 2 enfants (dont un avec numéro de téléphone)
- [ ] Seed : activités variées (journée entière, privée, quotidienne, hebdomadaire avec fin, une qui chevauche un événement)
- [ ] Seed : 1 événement confirmé avec réponses variées, 1 proposition d'enfant, un événement sur 2 jours
- [ ] Le seed affiche les liens personnels une seule fois dans le terminal ; seuls les hash sont en base
- [ ] Le seed vide les tables avant d'insérer et refuse de tourner contre la base de test ou de production

**Verification :**
- [ ] `pnpm test` passe
- [ ] `pnpm db:seed` deux fois de suite donne le même état (idempotent)
- [ ] `pnpm db:studio` : aucun jeton en clair, aucun `.env` committé

**Dependencies :** Task 3
**Files likely touched :** `lib/token.ts`, `lib/token.test.ts`, `prisma/seed.ts`, `package.json`
**Scope :** M

## Checkpoint : fin de l'étape 1

- [ ] `pnpm typecheck`, `pnpm lint`, `pnpm test` passent
- [ ] `pnpm build` passe
- [ ] La base de dev contient le jeu de test, lisible dans Prisma Studio
- [ ] Aucun secret dans git (`git log -p` et `git status` relus)
- [ ] Relecture par l'humain avant l'étape 2 (famille et connexion par lien)
