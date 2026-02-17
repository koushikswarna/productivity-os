"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, FolderKanban, MessageSquare, FileText, BarChart3, TrendingUp, Settings, Sparkles } from "lucide-react"
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupLabel, SidebarGroupContent,
  SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarFooter, SidebarHeader, SidebarSeparator
} from "@/components/ui/sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useOrg } from "@/lib/hooks/use-org"

const navItems = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "Projects", href: "/projects", icon: FolderKanban },
  { title: "Chat", href: "/chat", icon: MessageSquare },
  { title: "Documents", href: "/documents", icon: FileText },
  { title: "Reports", href: "/reports", icon: BarChart3 },
  { title: "Analytics", href: "/analytics", icon: TrendingUp },
]

export function AppSidebar() {
  const pathname = usePathname()
  const { organization, profile } = useOrg()

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Sparkles className="h-4 w-4" />
          </div>
          <span className="text-lg font-bold">ProductivityOS</span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild isActive={pathname.startsWith(item.href)}>
                    <Link href={item.href}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarSeparator />
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname.startsWith("/settings")}>
                  <Link href="/settings">
                    <Settings className="h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={profile?.avatar_url || ""} />
            <AvatarFallback>{profile?.full_name?.charAt(0) || "U"}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="text-sm font-medium">{profile?.full_name || "User"}</span>
            <span className="text-xs text-muted-foreground">{organization?.name || "No org"}</span>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
