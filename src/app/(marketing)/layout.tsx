import Link from "next/link"
import { Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground"><Sparkles className="h-4 w-4" /></div>
            <span className="text-xl font-bold">ProductivityOS</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/#features" className="text-sm text-muted-foreground hover:text-foreground">Features</Link>
            <Link href="/pricing" className="text-sm text-muted-foreground hover:text-foreground">Pricing</Link>
          </nav>
          <div className="flex items-center gap-2">
            <Button variant="ghost" asChild><Link href="/login">Sign In</Link></Button>
            <Button asChild><Link href="/signup">Get Started</Link></Button>
          </div>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} ProductivityOS. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
