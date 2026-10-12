import "dotenv/config"
import { defineConfig, env } from "prisma/config"

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
