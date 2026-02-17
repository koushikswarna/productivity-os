'use client'
import { createContext, useContext } from 'react'
import type { Organization, OrganizationMember, Profile } from '@/lib/types'

interface OrgContextType {
  organization: Organization | null
  membership: OrganizationMember | null
  profile: Profile | null
  organizations: Organization[]
  switchOrg: (orgId: string) => Promise<void>
  isLoading: boolean
}

export const OrgContext = createContext<OrgContextType>({
  organization: null,
  membership: null,
  profile: null,
  organizations: [],
  switchOrg: async () => {},
  isLoading: true,
})

export function useOrg() {
  const context = useContext(OrgContext)
  if (!context) throw new Error('useOrg must be used within OrgProvider')
  return context
}
