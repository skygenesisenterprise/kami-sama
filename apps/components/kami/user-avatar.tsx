import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import type { UserSummary } from '@/types/anime'

export function UserAvatar({
  user,
  className,
}: {
  user: UserSummary
  className?: string
}) {
  const initials = user.displayName
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <Avatar className={cn('size-9', className)}>
      <AvatarImage src={user.avatar || '/kami-sama.png'} alt={user.displayName} />
      <AvatarFallback className="bg-secondary text-xs">{initials}</AvatarFallback>
    </Avatar>
  )
}
