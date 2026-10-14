// Build for Vercel, local and CI: generate the Prisma client, migrate the production database, then `next build`.
import { spawnSync } from "node:child_process"

function run(command, args, env = {}) {
  const { status } = spawnSync(command, args, {
    stdio: "inherit",
    shell: true,
    env: { ...process.env, ...env },
  })
  if (status !== 0) process.exit(status ?? 1)
}

const isProduction = process.env.VERCEL_ENV === "production"
if (isProduction && !process.env.DIRECT_URL) {
  console.error(
    "DIRECT_URL is not set: add the direct URL of the production Neon branch to the Production variables in Vercel."
  )
  process.exit(1)
}

// The client goes to lib/generated/prisma, which git ignores: it must exist before `next build`.
// prisma.config.ts reads DIRECT_URL even for `generate`, which never connects: a placeholder is enough.
run("prisma", ["generate"], {
  DIRECT_URL:
    process.env.DIRECT_URL ?? "postgresql://user:pass@localhost:5432/build",
})

// Only a production deploy touches a database, and DIRECT_URL then points to the production Neon branch.
// Previews, local builds and CI never migrate anything.
if (isProduction) run("prisma", ["migrate", "deploy"])
else
  console.log(
    `Migrations skipped (VERCEL_ENV=${process.env.VERCEL_ENV ?? "not set"}).`
  )

run("next", ["build"])
