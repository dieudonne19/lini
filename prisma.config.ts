import { config } from "dotenv"
import { defineConfig, env } from "prisma/config"

// One env file per Neon branch: .env.development (default) or .env.test (NODE_ENV=test).
// Production has no local file: its values live in Vercel.
config({ path: `.env.${process.env.NODE_ENV ?? "development"}`, quiet: true })

// The CLI (migrations, studio) uses the direct URL; the app uses the pooled one.
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: env("DIRECT_URL"),
  },
})
