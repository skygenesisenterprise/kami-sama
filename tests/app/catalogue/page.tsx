"use client"

import { useState, useMemo } from "react"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { AnimeCard } from "@/components/anime/anime-card"
import { AnimeFilters } from "@/components/catalogue/anime-filters"
import { animes } from "@/lib/data"

export default function CataloguePage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedGenres, setSelectedGenres] = useState<string[]>([])
  const [selectedStatus, setSelectedStatus] = useState("Tous")
  const [selectedType, setSelectedType] = useState("Tous")
  const [selectedYear, setSelectedYear] = useState("Toutes")
  const [sortBy, setSortBy] = useState("popular")

  const filteredAnimes = useMemo(() => {
    let result = [...animes]

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (anime) =>
          anime.title.toLowerCase().includes(query) ||
          anime.titleJapanese?.toLowerCase().includes(query) ||
          anime.synopsis.toLowerCase().includes(query),
      )
    }

    // Genre filter
    if (selectedGenres.length > 0) {
      result = result.filter((anime) => selectedGenres.every((genre) => anime.genres.includes(genre)))
    }

    // Status filter
    if (selectedStatus !== "Tous") {
      result = result.filter((anime) => anime.status === selectedStatus)
    }

    // Type filter
    if (selectedType !== "Tous") {
      result = result.filter((anime) => anime.type === selectedType)
    }

    // Year filter
    if (selectedYear !== "Toutes") {
      if (selectedYear === "2010-2018") {
        result = result.filter((anime) => anime.year >= 2010 && anime.year <= 2018)
      } else if (selectedYear === "2000-2009") {
        result = result.filter((anime) => anime.year >= 2000 && anime.year <= 2009)
      } else if (selectedYear === "Avant 2000") {
        result = result.filter((anime) => anime.year < 2000)
      } else {
        result = result.filter((anime) => anime.year === Number.parseInt(selectedYear))
      }
    }

    // Sorting
    switch (sortBy) {
      case "rating":
        result.sort((a, b) => b.rating - a.rating)
        break
      case "new":
        result.sort((a, b) => b.year - a.year)
        break
      case "old":
        result.sort((a, b) => a.year - b.year)
        break
      case "title":
        result.sort((a, b) => a.title.localeCompare(b.title))
        break
      default:
        result.sort((a, b) => b.rating - a.rating)
    }

    return result
  }, [searchQuery, selectedGenres, selectedStatus, selectedType, selectedYear, sortBy])

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-24 pb-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Catalogue</h1>
            <p className="text-muted-foreground">Découvrez notre collection de {animes.length} animes</p>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar filters - desktop */}
            <aside className="hidden lg:block w-64 shrink-0">
              <div className="sticky top-24 space-y-6 p-4 bg-card rounded-xl">
                <AnimeFilters
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  selectedGenres={selectedGenres}
                  setSelectedGenres={setSelectedGenres}
                  selectedStatus={selectedStatus}
                  setSelectedStatus={setSelectedStatus}
                  selectedType={selectedType}
                  setSelectedType={setSelectedType}
                  selectedYear={selectedYear}
                  setSelectedYear={setSelectedYear}
                  sortBy={sortBy}
                  setSortBy={setSortBy}
                />
              </div>
            </aside>

            {/* Main content */}
            <div className="flex-1">
              {/* Mobile filters */}
              <div className="lg:hidden mb-6">
                <AnimeFilters
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  selectedGenres={selectedGenres}
                  setSelectedGenres={setSelectedGenres}
                  selectedStatus={selectedStatus}
                  setSelectedStatus={setSelectedStatus}
                  selectedType={selectedType}
                  setSelectedType={setSelectedType}
                  selectedYear={selectedYear}
                  setSelectedYear={setSelectedYear}
                  sortBy={sortBy}
                  setSortBy={setSortBy}
                />
              </div>

              {/* Results count */}
              <div className="mb-6">
                <p className="text-sm text-muted-foreground">
                  {filteredAnimes.length} anime{filteredAnimes.length !== 1 ? "s" : ""} trouvé
                  {filteredAnimes.length !== 1 ? "s" : ""}
                </p>
              </div>

              {/* Anime grid */}
              {filteredAnimes.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
                  {filteredAnimes.map((anime) => (
                    <AnimeCard key={anime.id} anime={anime} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <p className="text-lg text-muted-foreground mb-4">Aucun anime ne correspond à vos critères</p>
                  <button
                    onClick={() => {
                      setSearchQuery("")
                      setSelectedGenres([])
                      setSelectedStatus("Tous")
                      setSelectedType("Tous")
                      setSelectedYear("Toutes")
                    }}
                    className="text-primary hover:underline"
                  >
                    Réinitialiser les filtres
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
