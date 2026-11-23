export interface ApiRepositoryConfiguration {
  apiBaseUrl: string
}

/**
 * Production composition boundary for real API-backed repositories.
 *
 * The existing repository contracts are synchronous, so HTTP adapters must be
 * introduced alongside the planned async data-flow migration. Until then, API
 * mode fails at startup rather than exposing mock data in production.
 */
export function configureApiRepositories({
  apiBaseUrl,
}: ApiRepositoryConfiguration): never {
  throw new Error(
    `[application-composition] API repository mode is configured for ${apiBaseUrl}, but real API repositories have not been implemented yet. Mock repositories will not be used as a fallback.`,
  )
}
