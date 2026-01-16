"use client"

import Image from "next/image"
import Link from "next/link"
import { Play, Star, Plus, Check } from "lucide-react"
import { useState } from "react"
import type { Anime } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface AnimeCardProps {
  anime: Anime
  variant?: "default" | "compact" | "wide"
}

export function AnimeCard({ anime, variant = "default" }: AnimeCardProps) {
  const [isInWatchlist, setIsInWatchlist] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  if (variant === "wide") {
    return (
      <Link href={`/anime/${anime.slug}`} className="group block">
        <div className="relative aspect-video overflow-hidden rounded-xl bg-secondary">
          <Image
            src={anime.bannerImage || anime.coverImage}
            alt={anime.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-1 text-xs font-medium bg-primary text-primary-foreground rounded">
                {anime.type}
              </span>
              <span className="flex items-center gap-1 text-sm">
                <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                {anime.rating}
              </span>
            </div>
            <h3 className="text-xl font-bold text-balance">{anime.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{anime.synopsis}</p>
          </div>
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <Button size="lg" className="gap-2">
              <Play className="h-5 w-5" fill="currentColor" />
              Regarder
            </Button>
          </div>
        </div>
      </Link>
    )
  }

  return (
    <div className="group relative" onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
      <Link href={`/anime/${anime.slug}`} className="block">
        <div
          className={cn(
            "relative overflow-hidden rounded-xl bg-secondary transition-transform duration-300",
            variant === "compact" ? "aspect-[3/4]" : "aspect-[2/3]",
            isHovered && "scale-105 z-10",
          )}
        >
          <Image src={anime.coverImage || "/placeholder.svg"} alt={anime.title} fill className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

          {/* Quick info overlay on hover */}
          <div
            className={cn(
              "absolute inset-0 flex flex-col justify-end p-4 opacity-0 transition-opacity",
              isHovered && "opacity-100",
            )}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-0.5 text-xs font-medium bg-primary text-primary-foreground rounded">
                {anime.type}
              </span>
              {anime.status === "En cours" && (
                <span className="px-2 py-0.5 text-xs font-medium bg-green-600 text-white rounded">En cours</span>
              )}
            </div>
            <div className="flex gap-2">
              <Button size="sm" className="flex-1 gap-1">
                <Play className="h-4 w-4" fill="currentColor" />
                Regarder
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={(e) => {
                  e.preventDefault()
                  setIsInWatchlist(!isInWatchlist)
                }}
              >
                {isInWatchlist ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>
      </Link>

      <div className="mt-3">
        <Link href={`/anime/${anime.slug}`}>
          <h3 className="font-medium text-sm line-clamp-1 group-hover:text-primary transition-colors">{anime.title}</h3>
        </Link>
        <div className="flex items-center gap-2 mt-1">
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
            {anime.rating}
          </span>
          <span className="text-xs text-muted-foreground">{anime.year}</span>
          {anime.episodeCount && <span className="text-xs text-muted-foreground">{anime.episodeCount} épisodes</span>}
        </div>
      </div>
    </div>
  )
}
