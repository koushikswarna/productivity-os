"use client"
import { Bell, Search, Sun, Moon, LogOut, User, CreditCard, Building } from "lucide-react"
import { useTheme } from "next-themes"
import { useRouter } from "next/navigation"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useOrg } from "@/lib/hooks/use-org"
import { useSupabase } from "@/lib/hooks/use-supabase"
import { useUIStore } from "@/lib/stores/ui-store"

export function AppHeader() {
  const { theme, setTheme } = useTheme()
  const { profile, organization, organizations, switchOrg } = useOrg()
  const supabase = useSupabase()
  const router = useRouter()
  const setCommandOpen = useUIStore((s) => s.setCommandOpen)

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/login")
  }

  return (
    <header className="flex h-14 items-center gap-4 border-b bg-background px-6">
      <SidebarTrigger />
      <Separator orientation="vertical" className="h-6" />
      <div className="flex-1" />
      <Button variant="outline" size="sm" className="gap-2 text-muted-foreground" onClick={() => setCommandOpen(true)}>
        <Search className="h-4 w-4" />
        <span className="hidden md:inline">Search...</span>
        <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-xs font-medium text-muted-foreground md:inline-flex">
          <span className="text-xs">&#8984;</span>K
        </kbd>
      </Button>
      <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
        <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
        <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      </Button>
      <Button variant="ghost" size="icon">
        <Bell className="h-4 w-4" />
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            <Avatar className="h-8 w-8">
              <AvatarImage src={profile?.avatar_url || ""} />
              <AvatarFallback>{profile?.full_name?.charAt(0) || "U"}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end">
          <DropdownMenuLabel>
            <div className="flex flex-col">
              <p className="text-sm font-medium">{profile?.full_name || "User"}</p>
              <p className="text-xs text-muted-foreground">{organization?.name}</p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {organizations.length > 1 && (
            <>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger><Building className="mr-2 h-4 w-4" />Switch Organization</DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  {organizations.map((org) => (
                    <DropdownMenuItem key={org.id} onClick={() => switchOrg(org.id)}>
                      {org.name} {org.id === organization?.id && "\u2713"}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuSubContent>
              </DropdownMenuSub>
              <DropdownMenuSeparator />
            </>
          )}
          <DropdownMenuItem onClick={() => router.push("/settings")}>
            <User className="mr-2 h-4 w-4" />Profile
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => router.push("/settings/billing")}>
            <CreditCard className="mr-2 h-4 w-4" />Billing
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleSignOut}>
            <LogOut className="mr-2 h-4 w-4" />Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}
