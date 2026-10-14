# Variables d'environnement Vercel

Checklist à jour à chaque étape. Aucune valeur ici : les vraies valeurs vivent dans Vercel (Settings → Environment Variables), jamais dans git.
Portée : **Production** uniquement, sauf mention contraire. Ne mets pas la base de production dans Preview.

## À mettre maintenant (étapes 1 et 2)

| Variable | Valeur | Remarque |
| --- | --- | --- |
| `DATABASE_URL` | URL Neon **poolée** (hôte avec `-pooler`) de la base de production | Utilisée par l'application |
| `DIRECT_URL` | URL Neon **directe** (hôte sans `-pooler`) de la base de production | Migrations : `prisma migrate deploy` |
| `SESSION_SECRET` | 32 caractères aléatoires minimum : `openssl rand -base64 32` | Signe le cookie de session. Si tu le changes, tout le monde est déconnecté. |

- [ ] `DATABASE_URL` ajoutée
- [ ] `DIRECT_URL` ajoutée
- [ ] `SESSION_SECRET` ajoutée (un secret différent de celui de dev)

## À prévoir plus tard (ne pas oublier)

| Variable | Étape | Remarque |
| --- | --- | --- |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | 7 (notifications) | Clé publique Web Push |
| `VAPID_PRIVATE_KEY` | 7 | Clé privée Web Push, secrète |
| `VAPID_SUBJECT` | 7 | `mailto:` de contact, requis par Web Push |
| `CRON_SECRET` | 7 (rappel de la veille) | Protège l'appel du cron quotidien |

## Côté GitHub (CI)

- Secret `TEST_DATABASE_URL` : URL poolée de la **branche de test** Neon (utilisée par `.github/workflows/ci.yml`).

## Rappels

- Le script `pnpm build` (`scripts/build.mjs`) génère le client Prisma, puis **applique les migrations (`prisma migrate deploy`) uniquement sur un déploiement Production** (`VERCEL_ENV=production`), avant `next build`. Un build Preview, local ou CI ne migre rien. Si une migration échoue, le déploiement s'arrête et l'ancienne version reste en ligne.
- Un déploiement Production sans `DIRECT_URL` échoue tout de suite avec un message clair. Une migration qui supprime des données s'exécute au déploiement : relis son SQL (`prisma/migrations/*/migration.sql`) avant de pousser sur la branche de production.
- Preview : `DATABASE_URL` et `DIRECT_URL` doivent pointer vers la branche **dev** de Neon, jamais vers la production.
- Ne jamais lancer `pnpm db:seed` contre la production (le seed vide les tables).
