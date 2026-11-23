export type RepositoryMode = "mock" | "api"

function getRepositoryMode(): RepositoryMode {
  const mode = import.meta.env.VITE_REPOSITORY_MODE?.trim()

  if (mode === "mock" || mode === "api") return mode

  throw new Error(
    '[application-composition] Set VITE_REPOSITORY_MODE to "mock" for an explicit local demo or "api" for production. No repository fallback is enabled.',
  )
}

export async function configureApplication(): Promise<void> {
  const mode = getRepositoryMode()

  if (mode === "mock") {
    const { configureMockRepositories } = await import(
      "../../mocks/configureMockRepositories"
    )
    configureMockRepositories()
    return
  }

  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim()
  if (!apiBaseUrl) {
    throw new Error(
      '[application-composition] VITE_API_BASE_URL is required when VITE_REPOSITORY_MODE="api". Mock repositories will not be used as a fallback.',
    )
  }

  const { configureApiRepositories } = await import(
    "./configureApiRepositories"
  )
  configureApiRepositories({ apiBaseUrl })
}
