import { execSync } from "node:child_process"
import { config as dotenvConfig } from "dotenv"

// Load .env into process.env so scripts see the project's environment variables
dotenvConfig()

// Get action from command line arguments
const action = process.argv[2]
if (!action) {
  console.error("Usage: node scripts/container.ts <up|down|rebuild|db:...>")
  process.exit(1)
}

const containerClient = process.env.CONTAINER_CLIENT?.trim() || ""
const wslEnv = process.env.WSL?.trim() || ""

// Validate environment variables
if (!containerClient) {
  console.error('Environment variable CONTAINER_CLIENT must be set to "docker" or "podman".')
  process.exit(1)
}

if (wslEnv !== "true" && wslEnv !== "false") {
  console.error('Environment variable WSL must be set to "true" or "false".')
  process.exit(1)
}

if (containerClient !== "docker" && containerClient !== "podman") {
  console.error('CONTAINER_CLIENT must be either "docker" or "podman".')
  process.exit(1)
}

const useWsl = wslEnv === "true"
const composeCmd = `${containerClient} compose`

const wrap = (cmd: string) => (useWsl ? `wsl -e ${cmd}` : cmd)

const run = (cmd: string) => {
  console.log(`Running: ${cmd}`)
  try {
    execSync(cmd, { stdio: "inherit" })
  } catch (err: unknown) {
    console.error("Command failed:", err instanceof Error ? err.message : err)
    process.exit(2)
  }
}

const runDbAction = (act: string) => {
  // Run specific db actions
  if (act === "db:generate") {
    run(wrap(`${composeCmd} exec -T app npx prisma generate`))
  } else if (act === "db:seed") {
    run(wrap(`${composeCmd} exec -T app npx tsx prisma/seed.ts`))
  } else if (act === "db:studio") {
    run(wrap(`${composeCmd} exec app npx prisma studio --browser none --port 5555`))
  } else if (act === "db:reset") {
    run(wrap(`${composeCmd} exec -T app npx prisma migrate reset --force`))
  } else if (act === "db:migrate") {
    run(wrap(`${composeCmd} exec app npx prisma migrate dev`))
  } else if (act === "db:push") {
    run(wrap(`${composeCmd} exec -T app npx prisma db push`))
  }
  return
}

// Handle db actions (db:*) separately
if (action.startsWith("db:")) {
  runDbAction(action)
  process.exit(0)
}

// Handle container actions
if (action === "rebuild") {
  run(wrap(`${composeCmd} build --no-cache`))
  run(wrap(`${composeCmd} up --remove-orphans`))
} else if (action === "up") {
  run(wrap(`${composeCmd} up`))
} else {
  run(wrap(`${composeCmd} down --rmi all --remove-orphans`))
}
