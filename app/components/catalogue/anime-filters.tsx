"use client"

import { Search, SlidersHorizontal, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { genres } from "@/lib/data"
import { cn } from "@/lib/utils"

interface AnimeFiltersProps {
  searchQuery: string
  setSearchQuery: (query: string) => void
  selectedGenres: string[]
  setSelectedGenres: (genres: string[]) => void
  selectedStatus: string
  setSelectedStatus: (status: string) => void
  selectedType: string
  setSelectedType: (type: string) => void
  selectedYear: string
  setSelectedYear: (year: string) => void
  sortBy: string
  setSortBy: (sort: string) => void
}

const statuses = ["Tous", "En cours", "Terminé", "À venir"]
const types = ["Tous", "TV", "Film", "OVA", "ONA", "Spécial"]
const years = ["Toutes", "2024", "2023", "2022", "2021", "2020", "2019", "2010-2018", "2000-2009", "Avant 2000"]
const sortOptions = [
  { value: "popular", label: "Popularité" },
  { value: "rating", label: "Note" },
  { value: "new", label: "Plus récent" },
  { value: "old", label: "Plus ancien" },
  { value: "title", label: "Titre A-Z" },
]

export function AnimeFilters({
  searchQuery,
  setSearchQuery,
  selectedGenres,
  setSelectedGenres,
  selectedStatus,
  setSelectedStatus,
  selectedType,
  setSelectedType,
  selectedYear,
  setSelectedYear,
  sortBy,
  setSortBy,
}: AnimeFiltersProps) {
  const toggleGenre = (genre: string) => {
    if (selectedGenres.includes(genre)) {
      setSelectedGenres(selectedGenres.filter((g) => g !== genre))
    } else {
      setSelectedGenres([...selectedGenres, genre])
    }
  }

  const clearFilters = () => {
    setSearchQuery("")
    setSelectedGenres([])
    setSelectedStatus("Tous")
    setSelectedType("Tous")
    setSelectedYear("Toutes")
    setSortBy("popular")
  }

  const hasActiveFilters =
    searchQuery ||
    selectedGenres.length > 0 ||
    selectedStatus !== "Tous" ||
    selectedType !== "Tous" ||
    selectedYear !== "Toutes"

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Genres */}
      <div>
        <h3 className="text-sm font-medium mb-3">Genres</h3>
        <div className="flex flex-wrap gap-2">
          {genres.map((genre) => (
            <Badge
              key={genre.id}
              variant={selectedGenres.includes(genre.name) ? "default" : "outline"}
              className={cn(
                "cursor-pointer transition-colors",
                selectedGenres.includes(genre.name)
                  ? "bg-primary text-primary-foreground hover:bg-primary/90"
                  : "hover:bg-secondary",
              )}
              onClick={() => toggleGenre(genre.name)}
            >
              {genre.name}
            </Badge>
          ))}
        </div>
      </div>

      {/* Status */}
      <div>
        <h3 className="text-sm font-medium mb-3">Statut</h3>
        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {statuses.map((status) => (
              <SelectItem key={status} value={status}>
                {status}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Type */}
      <div>
        <h3 className="text-sm font-medium mb-3">Type</h3>
        <Select value={selectedType} onValueChange={setSelectedType}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {types.map((type) => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Year */}
      <div>
        <h3 className="text-sm font-medium mb-3">Année</h3>
        <Select value={selectedYear} onValueChange={setSelectedYear}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {years.map((year) => (
              <SelectItem key={year} value={year}>
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )

  return (
    <div className="space-y-4">
      {/* Search and main controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher un anime..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-secondary border-0"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2">
              <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
            </button>
          )}
        </div>

        <div className="flex gap-2">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-40 bg-secondary border-0">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Mobile filter sheet */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="secondary" size="icon" className="lg:hidden">
                <SlidersHorizontal className="h-4 w-4" />
                <span className="sr-only">Filtres</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80">
              <SheetHeader>
                <SheetTitle>Filtres</SheetTitle>
              </SheetHeader>
              <div className="mt-6">
                <FilterContent />
                {hasActiveFilters && (
                  <Button variant="outline" className="w-full mt-6 bg-transparent" onClick={clearFilters}>
                    Effacer les filtres
                  </Button>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Active filters display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted-foreground">Filtres actifs:</span>
          {selectedGenres.map((genre) => (
            <Badge key={genre} variant="secondary" className="gap-1">
              {genre}
              <X className="h-3 w-3 cursor-pointer" onClick={() => toggleGenre(genre)} />
            </Badge>
          ))}
          {selectedStatus !== "Tous" && (
            <Badge variant="secondary" className="gap-1">
              {selectedStatus}
              <X className="h-3 w-3 cursor-pointer" onClick={() => setSelectedStatus("Tous")} />
            </Badge>
          )}
          {selectedType !== "Tous" && (
            <Badge variant="secondary" className="gap-1">
              {selectedType}
              <X className="h-3 w-3 cursor-pointer" onClick={() => setSelectedType("Tous")} />
            </Badge>
          )}
          {selectedYear !== "Toutes" && (
            <Badge variant="secondary" className="gap-1">
              {selectedYear}
              <X className="h-3 w-3 cursor-pointer" onClick={() => setSelectedYear("Toutes")} />
            </Badge>
          )}
          <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground">
            Tout effacer
          </Button>
        </div>
      )}

      {/* Desktop filters sidebar content */}
      <div className="hidden lg:block">
        <FilterContent />
      </div>
    </div>
  )
}
