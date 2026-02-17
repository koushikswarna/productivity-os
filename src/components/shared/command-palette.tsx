"use client"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { LayoutDashboard, FolderKanban, MessageSquare, FileText, BarChart3, TrendingUp, Settings, CreditCard, Users } from "lucide-react"
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from "@/components/ui/command"
import { useUIStore } from "@/lib/stores/ui-store"

const pages = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Projects", href: "/projects", icon: FolderKanban },
  { name: "Chat", href: "/chat", icon: MessageSquare },
  { name: "Documents", href: "/documents", icon: FileText },
  { name: "Reports", href: "/reports", icon: BarChart3 },
  { name: "Analytics", href: "/analytics", icon: TrendingUp },
  { name: "Settings", href: "/settings", icon: Settings },
  { name: "Members", href: "/settings/members", icon: Users },
  { name: "Billing", href: "/settings/billing", icon: CreditCard },
]

export function CommandPalette() {
  const router = useRouter()
  const { commandOpen, setCommandOpen } = useUIStore()

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setCommandOpen(!commandOpen)
      }
    }
    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [commandOpen, setCommandOpen])

  const navigate = (href: string) => {
    setCommandOpen(false)
    router.push(href)
  }

  return (
    <CommandDialog open={commandOpen} onOpenChange={setCommandOpen}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Pages">
          {pages.map((page) => (
            <CommandItem key={page.href} onSelect={() => navigate(page.href)}>
              <page.icon className="mr-2 h-4 w-4" />
              {page.name}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}
