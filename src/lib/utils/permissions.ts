export type Role = 'owner' | 'admin' | 'member' | 'guest'

const ROLE_HIERARCHY: Record<Role, number> = {
  owner: 4,
  admin: 3,
  member: 2,
  guest: 1,
}

export function hasPermission(userRole: Role, requiredRole: Role): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole]
}

export function canManageMembers(role: Role): boolean {
  return hasPermission(role, 'admin')
}

export function canDeleteProject(role: Role): boolean {
  return hasPermission(role, 'admin')
}

export function canEditSettings(role: Role): boolean {
  return hasPermission(role, 'admin')
}

export function canManageBilling(role: Role): boolean {
  return hasPermission(role, 'owner')
}

export function canAccessAI(plan: string): boolean {
  return plan !== 'free'
}
