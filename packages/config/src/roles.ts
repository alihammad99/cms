export const ROLES = ['owner', 'admin', 'editor', 'fulfillment'] as const
export type Role = (typeof ROLES)[number]

export const ROLE_HIERARCHY: Record<Role, number> = {
  owner: 4,
  admin: 3,
  editor: 2,
  fulfillment: 1,
}

export function hasRole(userRole: Role, requiredRole: Role): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole]
}
