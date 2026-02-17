"use client"
import { useEffect, useState, useCallback } from "react"
import { useRouter, usePathname } from "next/navigation"
import { OrgContext } from "@/lib/hooks/use-org"
import { useSupabase } from "@/lib/hooks/use-supabase"
import type { Organization, OrganizationMember, Profile } from "@/lib/types"

export function OrgProvider({ children }: { children: React.ReactNode }) {
  const supabase = useSupabase()
  const router = useRouter()
  const pathname = usePathname()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [organization, setOrganization] = useState<Organization | null>(null)
  const [membership, setMembership] = useState<OrganizationMember | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const loadData = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setIsLoading(false)
      return
    }

    // Fetch profile
    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single()
    setProfile(profileData)

    // Fetch orgs
    const { data: memberships } = await supabase
      .from("organization_members")
      .select("*, organization:organizations(*)")
      .eq("user_id", user.id)

    if (!memberships || memberships.length === 0) {
      // No org — redirect to onboarding (but not if already there)
      setIsLoading(false)
      if (!pathname.startsWith("/onboarding")) {
        router.push("/onboarding")
      }
      return
    }

    const orgs = memberships.map((m: any) => m.organization).filter(Boolean)
    setOrganizations(orgs)

    // Use current org or first available
    const currentOrgId = profileData?.current_organization_id
    const currentMembership = memberships.find(
      (m: any) => m.organization_id === currentOrgId
    ) || memberships[0]

    if (currentMembership) {
      setOrganization(currentMembership.organization)
      setMembership(currentMembership)
    }

    setIsLoading(false)
  }, [supabase, router, pathname])

  useEffect(() => { loadData() }, [loadData])

  const switchOrg = useCallback(async (orgId: string) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase
      .from("profiles")
      .update({ current_organization_id: orgId })
      .eq("id", user.id)
    await loadData()
  }, [supabase, loadData])

  return (
    <OrgContext.Provider value={{ organization, membership, profile, organizations, switchOrg, isLoading }}>
      {children}
    </OrgContext.Provider>
  )
}
