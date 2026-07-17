import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import type { Genre } from '@/types/anime'

export function GenreTag({ genre, asLink = true }: { genre: Genre; asLink?: boolean }) {
  const badge = (
    <Badge
      variant="secondary"
      className="bg-secondary/70 font-normal text-secondary-foreground/90 backdrop-blur hover:bg-secondary"
    >
      {genre.name}
    </Badge>
  )
  if (!asLink) return badge
  return (
    <Link href={`/browse?genre=${genre.id}`} className="inline-flex">
      {badge}
    </Link>
  )
}
