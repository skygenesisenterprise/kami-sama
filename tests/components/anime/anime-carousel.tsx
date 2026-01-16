"use client"

import { useRef } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import type { Anime } from "@/lib/types"
import { AnimeCard } from "./anime-card"
import { Button } from "@/components/ui/button"

interface AnimeCarouselProps {
  title: string
  animes: Anime[]
  variant?: "default" | "compact"
}

export function AnimeCarousel({ title, animes, variant = "default" }: AnimeCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = direction === "left" ? -400 : 400
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" })
    }
  }

  return (
    <section className="relative">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">{title}</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={() => scroll("left")} className="h-9 w-9">
            <ChevronLeft className="h-5 w-5" />
            <span className="sr-only">Précédent</span>
          </Button>
          <Button variant="outline" size="icon" onClick={() => scroll("right")} className="h-9 w-9">
            <ChevronRight className="h-5 w-5" />
            <span className="sr-only">Suivant</span>
          </Button>
        </div>
      </div>

      <div ref={scrollRef} className="flex gap-4 overflow-x-auto hide-scrollbar pb-4 -mx-4 px-4">
        {animes.map((anime) => (
          <div key={anime.id} className="shrink-0 w-44 sm:w-48 md:w-52">
            <AnimeCard anime={anime} variant={variant} />
          </div>
        ))}
      </div>
    </section>
  )
}
