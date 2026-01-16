"use client"

import Image from "next/image"
import Link from "next/link"
import { Play, Clock } from "lucide-react"
import { useState } from "react"
import type { Season } from "@/lib/types"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface EpisodeListProps {
  seasons: Season[]
  animeSlug: string
}

export function EpisodeList({ seasons, animeSlug }: EpisodeListProps) {
  const [selectedSeason, setSelectedSeason] = useState(seasons[0]?.number.toString() || "1")
  const currentSeason = seasons.find((s) => s.number.toString() === selectedSeason) || seasons[0]

  if (!seasons.length) {
    return <div className="text-center py-8 text-muted-foreground">Aucun épisode disponible pour le moment.</div>
  }

  return (
    <div className="space-y-6">
      {/* Season selector */}
      {seasons.length > 1 && (
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium">Saison</span>
          <Select value={selectedSeason} onValueChange={setSelectedSeason}>
            <SelectTrigger className="w-40 bg-secondary border-0">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {seasons.map((season) => (
                <SelectItem key={season.number} value={season.number.toString()}>
                  {season.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Episode grid */}
      <div className="grid gap-4">
        {currentSeason?.episodes.map((episode) => (
          <Link
            key={episode.id}
            href={`/anime/${animeSlug}/watch?ep=${episode.number}`}
            className="group flex gap-4 p-3 rounded-xl bg-card hover:bg-secondary transition-colors"
          >
            {/* Thumbnail */}
            <div className="relative w-40 sm:w-48 aspect-video rounded-lg overflow-hidden shrink-0 bg-muted">
              <Image src={episode.thumbnail || "/placeholder.svg"} alt={episode.title} fill className="object-cover" />
              <div className="absolute inset-0 flex items-center justify-center bg-background/50 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center">
                  <Play className="h-5 w-5 text-primary-foreground" fill="currentColor" />
                </div>
              </div>
              {/* Duration badge */}
              <div className="absolute bottom-2 right-2 px-2 py-0.5 text-xs font-medium bg-background/80 backdrop-blur-sm rounded">
                {episode.duration}
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0 py-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-medium text-primary">EP {episode.number}</span>
              </div>
              <h3 className="font-medium line-clamp-1 group-hover:text-primary transition-colors">{episode.title}</h3>
              {episode.synopsis && (
                <p className="mt-1 text-sm text-muted-foreground line-clamp-2 hidden sm:block">{episode.synopsis}</p>
              )}
              <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {episode.duration}
                </span>
                <span>{episode.airDate}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
