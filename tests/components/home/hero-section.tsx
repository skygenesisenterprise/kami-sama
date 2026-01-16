"use client"

import Image from "next/image"
import Link from "next/link"
import { Play, Plus, Info, Star } from "lucide-react"
import { useState, useEffect } from "react"
import type { Anime } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface HeroSectionProps {
  animes: Anime[]
}

export function HeroSection({ animes }: HeroSectionProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const currentAnime = animes[currentIndex]

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % animes.length)
    }, 8000)
    return () => clearInterval(timer)
  }, [animes.length])

  return (
    <section className="relative h-[85vh] min-h-[600px] overflow-hidden">
      {/* Background Images */}
      {animes.map((anime, index) => (
        <div
          key={anime.id}
          className={cn(
            "absolute inset-0 transition-opacity duration-1000",
            index === currentIndex ? "opacity-100" : "opacity-0",
          )}
        >
          <Image
            src={anime.bannerImage || anime.coverImage}
            alt={anime.title}
            fill
            className="object-cover"
            priority={index === 0}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/50" />
        </div>
      ))}

      {/* Content */}
      <div className="relative h-full mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex items-center">
        <div className="max-w-2xl">
          {/* Tags */}
          <div className="flex items-center gap-3 mb-4">
            <span className="px-3 py-1 text-sm font-semibold bg-primary text-primary-foreground rounded-full">
              {currentAnime.type}
            </span>
            <span className="flex items-center gap-1 text-sm">
              <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
              {currentAnime.rating}
            </span>
            <span className="text-sm text-muted-foreground">{currentAnime.year}</span>
            {currentAnime.status === "En cours" && (
              <span className="px-3 py-1 text-sm font-medium bg-green-600/20 text-green-500 rounded-full border border-green-600/30">
                En cours
              </span>
            )}
          </div>

          {/* Title */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-2 text-balance">{currentAnime.title}</h1>
          {currentAnime.titleJapanese && (
            <p className="text-lg text-muted-foreground mb-6">{currentAnime.titleJapanese}</p>
          )}

          {/* Synopsis */}
          <p className="text-lg text-muted-foreground mb-8 line-clamp-3 text-pretty leading-relaxed">
            {currentAnime.synopsis}
          </p>

          {/* Genres */}
          <div className="flex flex-wrap gap-2 mb-8">
            {currentAnime.genres.slice(0, 4).map((genre) => (
              <span key={genre} className="px-3 py-1 text-sm bg-secondary rounded-full text-muted-foreground">
                {genre}
              </span>
            ))}
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-4">
            <Link href={`/anime/${currentAnime.slug}/watch`}>
              <Button size="lg" className="gap-2 text-base">
                <Play className="h-5 w-5" fill="currentColor" />
                Regarder maintenant
              </Button>
            </Link>
            <Button size="lg" variant="secondary" className="gap-2 text-base">
              <Plus className="h-5 w-5" />
              Ma liste
            </Button>
            <Link href={`/anime/${currentAnime.slug}`}>
              <Button size="lg" variant="ghost" className="gap-2 text-base">
                <Info className="h-5 w-5" />
                Plus d&apos;infos
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Slide Indicators */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
        {animes.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={cn(
              "h-1.5 rounded-full transition-all duration-300",
              index === currentIndex ? "w-8 bg-primary" : "w-1.5 bg-muted-foreground/50 hover:bg-muted-foreground",
            )}
          >
            <span className="sr-only">Slide {index + 1}</span>
          </button>
        ))}
      </div>
    </section>
  )
}
