import { existsSync, readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { parse } from "dotenv"
import { defineConfig } from "vitest/config"

// Tests run on the Neon test branch: DATABASE_URL and DIRECT_URL come from .env.test.
const envFile = ".env.test"
const env = existsSync(envFile) ? parse(readFileSync(envFile)) : {}

export default defineConfig({
  resolve: {
    alias: { "@": fileURLToPath(new URL(".", import.meta.url)) },
  },
  test: {
    environment: "node",
    include: ["lib/**/*.test.ts"],
    passWithNoTests: true,
    // Each database test makes several round trips to Neon (cold starts included).
    testTimeout: 30_000,
    hookTimeout: 30_000,
    env: { SESSION_SECRET: "test-secret-test-secret-test-secret-0", ...env },
    // Database tests share one branch: run files one at a time.
    fileParallelism: false,
  },
})
