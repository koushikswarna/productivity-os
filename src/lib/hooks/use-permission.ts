'use client'
import { useOrg } from './use-org'
import { hasPermission, type Role } from '@/lib/utils/permissions'

export function usePermission() {
  const { membership, organization } = useOrg()

  const userRole = (membership?.role as Role) || 'guest'
  const plan = organization?.plan || 'free'

  return {
    role: userRole,
    plan,
    can: (requiredRole: Role) => hasPermission(userRole, requiredRole),
    canManageMembers: hasPermission(userRole, 'admin'),
    canDeleteProject: hasPermission(userRole, 'admin'),
    canEditSettings: hasPermission(userRole, 'admin'),
    canManageBilling: hasPermission(userRole, 'owner'),
    canAccessAI: plan !== 'free',
  }
}
