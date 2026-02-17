import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

interface UserAvatarProps {
  name: string
  avatarUrl?: string | null
  size?: "sm" | "md" | "lg"
  showTooltip?: boolean
  className?: string
}

const sizeClasses = { sm: "h-6 w-6 text-xs", md: "h-8 w-8 text-sm", lg: "h-10 w-10 text-base" }

export function UserAvatar({ name, avatarUrl, size = "md", showTooltip = false, className }: UserAvatarProps) {
  const avatar = (
    <Avatar className={cn(sizeClasses[size], className)}>
      <AvatarImage src={avatarUrl || undefined} alt={name} />
      <AvatarFallback>{name?.charAt(0)?.toUpperCase() || "?"}</AvatarFallback>
    </Avatar>
  )
  if (!showTooltip) return avatar
  return (
    <Tooltip>
      <TooltipTrigger asChild>{avatar}</TooltipTrigger>
      <TooltipContent>{name}</TooltipContent>
    </Tooltip>
  )
}
