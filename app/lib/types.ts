export interface Anime {
  id: string
  title: string
  titleJapanese?: string
  slug: string
  synopsis: string
  coverImage: string
  bannerImage?: string
  rating: number
  year: number
  status: "En cours" | "Terminé" | "À venir"
  type: "TV" | "Film" | "OVA" | "ONA" | "Spécial"
  episodeCount: number | null
  genres: string[]
  studio: string
  trailer?: string
}

export interface Episode {
  id: string
  animeId: string
  number: number
  title: string
  thumbnail: string
  duration: string
  airDate: string
  synopsis?: string
}

export interface Season {
  number: number
  title: string
  episodes: Episode[]
}

export interface User {
  id: string
  username: string
  email: string
  avatar: string
  watchlist: string[]
  favorites: string[]
  history: WatchHistory[]
}

export interface WatchHistory {
  animeId: string
  episodeId: string
  progress: number
  watchedAt: string
}

export interface Genre {
  id: string
  name: string
  slug: string
}
