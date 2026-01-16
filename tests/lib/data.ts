import type { Anime, Episode, Season, Genre } from "./types"

export const genres: Genre[] = [
  { id: "1", name: "Action", slug: "action" },
  { id: "2", name: "Aventure", slug: "aventure" },
  { id: "3", name: "Comédie", slug: "comedie" },
  { id: "4", name: "Drame", slug: "drame" },
  { id: "5", name: "Fantasy", slug: "fantasy" },
  { id: "6", name: "Horreur", slug: "horreur" },
  { id: "7", name: "Mystère", slug: "mystere" },
  { id: "8", name: "Psychologique", slug: "psychologique" },
  { id: "9", name: "Romance", slug: "romance" },
  { id: "10", name: "Sci-Fi", slug: "sci-fi" },
  { id: "11", name: "Shonen", slug: "shonen" },
  { id: "12", name: "Seinen", slug: "seinen" },
  { id: "13", name: "Slice of Life", slug: "slice-of-life" },
  { id: "14", name: "Sports", slug: "sports" },
  { id: "15", name: "Surnaturel", slug: "surnaturel" },
]

export const animes: Anime[] = [
  {
    id: "1",
    title: "Jujutsu Kaisen",
    titleJapanese: "呪術廻戦",
    slug: "jujutsu-kaisen",
    synopsis:
      "Yuji Itadori, un lycéen doté d'une force physique exceptionnelle, se retrouve plongé dans le monde des malédictions après avoir avalé un doigt de Sukuna, le roi des fléaux. Il rejoint alors l'école d'exorcisme de Tokyo pour combattre les forces du mal.",
    coverImage: "/jujutsu-kaisen-anime-dark-action-poster.jpg",
    bannerImage: "/jujutsu-kaisen-epic-battle-scene-dark-anime.jpg",
    rating: 8.9,
    year: 2020,
    status: "En cours",
    type: "TV",
    episodeCount: 47,
    genres: ["Action", "Fantasy", "Shonen", "Surnaturel"],
    studio: "MAPPA",
  },
  {
    id: "2",
    title: "Attack on Titan",
    titleJapanese: "進撃の巨人",
    slug: "attack-on-titan",
    synopsis:
      "Dans un monde où l'humanité vit retranchée derrière d'immenses murs pour se protéger des Titans, des géants dévoreurs d'hommes, le jeune Eren Jaeger jure de tous les exterminer après la destruction de sa ville natale.",
    coverImage: "/attack-on-titan-eren-dramatic-anime-poster.jpg",
    bannerImage: "/attack-on-titan-colossal-titan-wall-scene.jpg",
    rating: 9.1,
    year: 2013,
    status: "Terminé",
    type: "TV",
    episodeCount: 94,
    genres: ["Action", "Drame", "Fantasy", "Mystère"],
    studio: "WIT Studio / MAPPA",
  },
  {
    id: "3",
    title: "Demon Slayer",
    titleJapanese: "鬼滅の刃",
    slug: "demon-slayer",
    synopsis:
      "Tanjiro Kamado devient un chasseur de démons après le massacre de sa famille par ces derniers. Sa sœur Nezuko, transformée en démon mais ayant conservé son humanité, l'accompagne dans sa quête pour trouver un remède.",
    coverImage: "/demon-slayer-tanjiro-katana-anime-poster.jpg",
    bannerImage: "/demon-slayer-breath-of-water-beautiful-animation.jpg",
    rating: 8.7,
    year: 2019,
    status: "En cours",
    type: "TV",
    episodeCount: 55,
    genres: ["Action", "Fantasy", "Shonen", "Surnaturel"],
    studio: "ufotable",
  },
  {
    id: "4",
    title: "Spy x Family",
    titleJapanese: "スパイファミリー",
    slug: "spy-x-family",
    synopsis:
      "Un espion d'élite doit créer une fausse famille pour accomplir sa mission. Sans le savoir, il adopte une télépathe et épouse une tueuse à gages, formant ainsi une famille pas comme les autres.",
    coverImage: "/spy-x-family-anya-loid-yor-anime-poster.jpg",
    bannerImage: "/spy-x-family-family-portrait-elegant-anime.jpg",
    rating: 8.6,
    year: 2022,
    status: "En cours",
    type: "TV",
    episodeCount: 37,
    genres: ["Action", "Comédie", "Slice of Life"],
    studio: "WIT Studio / CloverWorks",
  },
  {
    id: "5",
    title: "Chainsaw Man",
    titleJapanese: "チェンソーマン",
    slug: "chainsaw-man",
    synopsis:
      "Denji, un jeune homme endetté, fusionne avec son démon tronçonneuse Pochita pour devenir Chainsaw Man. Il rejoint une organisation gouvernementale chassant les démons pour une vie meilleure.",
    coverImage: "/chainsaw-man-denji-dark-anime-poster.jpg",
    bannerImage: "/chainsaw-man-action-scene-dark-gritty-anime.jpg",
    rating: 8.5,
    year: 2022,
    status: "En cours",
    type: "TV",
    episodeCount: 12,
    genres: ["Action", "Horreur", "Seinen", "Surnaturel"],
    studio: "MAPPA",
  },
  {
    id: "6",
    title: "One Piece",
    titleJapanese: "ワンピース",
    slug: "one-piece",
    synopsis:
      "Monkey D. Luffy et son équipage de pirates parcourent Grand Line à la recherche du légendaire trésor One Piece pour devenir le Roi des Pirates.",
    coverImage: "/one-piece-luffy-straw-hat-anime-poster.jpg",
    bannerImage: "/one-piece-straw-hat-crew-adventure-anime.jpg",
    rating: 8.9,
    year: 1999,
    status: "En cours",
    type: "TV",
    episodeCount: 1100,
    genres: ["Action", "Aventure", "Comédie", "Shonen"],
    studio: "Toei Animation",
  },
  {
    id: "7",
    title: "Vinland Saga",
    titleJapanese: "ヴィンランド・サガ",
    slug: "vinland-saga",
    synopsis:
      "Thorfinn, fils d'un grand guerrier viking, jure de venger la mort de son père en défiant Askeladd, le chef mercenaire responsable de sa mort.",
    coverImage: "/vinland-saga-thorfinn-viking-anime-poster.jpg",
    bannerImage: "/vinland-saga-viking-battle-epic-anime.jpg",
    rating: 8.8,
    year: 2019,
    status: "En cours",
    type: "TV",
    episodeCount: 48,
    genres: ["Action", "Aventure", "Drame", "Seinen"],
    studio: "WIT Studio / MAPPA",
  },
  {
    id: "8",
    title: "My Hero Academia",
    titleJapanese: "僕のヒーローアカデミア",
    slug: "my-hero-academia",
    synopsis:
      "Dans un monde où 80% de la population possède des super-pouvoirs, Izuku Midoriya, né sans pouvoir, rêve de devenir un héros. Sa rencontre avec All Might va changer son destin.",
    coverImage: "/my-hero-academia-deku-heroes-anime-poster.jpg",
    bannerImage: "/placeholder.svg?height=600&width=1920",
    rating: 8.4,
    year: 2016,
    status: "En cours",
    type: "TV",
    episodeCount: 138,
    genres: ["Action", "Comédie", "Shonen", "Surnaturel"],
    studio: "Bones",
  },
  {
    id: "9",
    title: "Solo Leveling",
    titleJapanese: "俺だけレベルアップな件",
    slug: "solo-leveling",
    synopsis:
      "Sung Jinwoo, le chasseur le plus faible de l'humanité, obtient un mystérieux pouvoir lui permettant de progresser sans limites dans un monde où des portails vers des donjons sont apparus.",
    coverImage: "/placeholder.svg?height=400&width=280",
    bannerImage: "/placeholder.svg?height=600&width=1920",
    rating: 8.7,
    year: 2024,
    status: "En cours",
    type: "TV",
    episodeCount: 12,
    genres: ["Action", "Fantasy", "Seinen"],
    studio: "A-1 Pictures",
  },
  {
    id: "10",
    title: "Frieren",
    titleJapanese: "葬送のフリーレン",
    slug: "frieren",
    synopsis:
      "Frieren, une elfe magicienne ayant vaincu le Roi Démon avec ses compagnons, entreprend un voyage pour mieux comprendre les humains après la mort de son ami Himmel.",
    coverImage: "/placeholder.svg?height=400&width=280",
    bannerImage: "/placeholder.svg?height=600&width=1920",
    rating: 9.0,
    year: 2023,
    status: "En cours",
    type: "TV",
    episodeCount: 28,
    genres: ["Aventure", "Drame", "Fantasy", "Slice of Life"],
    studio: "Madhouse",
  },
  {
    id: "11",
    title: "Blue Lock",
    titleJapanese: "ブルーロック",
    slug: "blue-lock",
    synopsis:
      "Après l'échec du Japon en Coupe du Monde, un programme radical réunit 300 attaquants lycéens dans un camp de survie pour créer le meilleur buteur du monde.",
    coverImage: "/placeholder.svg?height=400&width=280",
    bannerImage: "/placeholder.svg?height=600&width=1920",
    rating: 8.3,
    year: 2022,
    status: "En cours",
    type: "TV",
    episodeCount: 24,
    genres: ["Sports", "Drame", "Shonen"],
    studio: "8bit",
  },
  {
    id: "12",
    title: "Bocchi the Rock!",
    titleJapanese: "ぼっち・ざ・ろっく！",
    slug: "bocchi-the-rock",
    synopsis:
      "Hitori Gotoh, surnommée Bocchi, est une guitariste talentueuse mais extrêmement introvertie qui rejoint un groupe de rock amateur pour réaliser son rêve.",
    coverImage: "/placeholder.svg?height=400&width=280",
    bannerImage: "/placeholder.svg?height=600&width=1920",
    rating: 8.8,
    year: 2022,
    status: "Terminé",
    type: "TV",
    episodeCount: 12,
    genres: ["Comédie", "Slice of Life"],
    studio: "CloverWorks",
  },
]

export const getAnimeEpisodes = (animeId: string): Season[] => {
  const episodesPerSeason = 12
  const anime = animes.find((a) => a.id === animeId)
  if (!anime || !anime.episodeCount) return []

  const totalSeasons = Math.ceil(anime.episodeCount / episodesPerSeason)
  const seasons: Season[] = []

  for (let s = 1; s <= Math.min(totalSeasons, 4); s++) {
    const seasonEpisodes: Episode[] = []
    const startEp = (s - 1) * episodesPerSeason + 1
    const endEp = Math.min(s * episodesPerSeason, anime.episodeCount)

    for (let e = startEp; e <= endEp; e++) {
      seasonEpisodes.push({
        id: `${animeId}-s${s}-e${e}`,
        animeId,
        number: e,
        title: `Épisode ${e}`,
        thumbnail: `/placeholder.svg?height=180&width=320&query=${anime.slug} episode ${e} scene`,
        duration: "24:00",
        airDate: `2024-01-${String(e).padStart(2, "0")}`,
        synopsis: `Synopsis de l'épisode ${e} de ${anime.title}.`,
      })
    }

    seasons.push({
      number: s,
      title: s === 1 ? "Saison 1" : `Saison ${s}`,
      episodes: seasonEpisodes,
    })
  }

  return seasons
}

export const featuredAnime = animes[0]
export const trendingAnimes = animes.slice(0, 6)
export const newReleases = [...animes].sort((a, b) => b.year - a.year).slice(0, 6)
export const popularAnimes = [...animes].sort((a, b) => b.rating - a.rating).slice(0, 6)
