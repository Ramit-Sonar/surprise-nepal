import type { User } from "../types"

export let seedCustomer: User

export function configureSeedCustomer(user: User) {
  seedCustomer = user
}
