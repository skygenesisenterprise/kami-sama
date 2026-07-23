# Requests — Intégration Anilist dans la page Discover

## Table des matières

1. [Vue d'ensemble](#1-vue-densemble)
2. [Backend — Routes API Anilist](#2-backend--routes-api-anilist)
3. [Frontend — Client API et types](#3-frontend--client-api-et-types)
4. [Mapping Anilist → types frontend](#4-mapping-anilist--types-frontend)
5. [Requêtes par section de la page Discover](#5-requêtes-par-section-de-la-page-discover)
6. [Remplacement des mock-data](#6-remplacement-des-mock-data)
7. [Exemples de réponses JSON](#7-exemples-de-réponses-json)
8. [Stratégie de cache et rate-limit](#8-stratégie-de-cache-et-rate-limit)

---

## 1. Vue d'ensemble

La page Discover (`apps/app/(public)/[locale]/discover/page.tsx`) utilise actuellement des **mock-data synchrones** (`lib/mock-data.ts`). L'objectif est de remplacer ces appels par des **requêtes HTTP asynchrones** vers le backend Go qui interroge l'API Anilist (`https://graphql.anilist.co`).

### Architecture cible

```
┌─────────────────┐     GET /api/v1/integrations/anilist/...     ┌──────────────┐
│  Discover Page   │ ────────────────────────────────────────────▶│  Go Backend  │
│  (Next.js SSR)   │◀────────────────────────────────────────────│  (Gin/GORM)  │
└─────────────────┘            JSON responses                    └──────┬───────┘
                                                                       │
                                                              GraphQL POST
                                                                       │
                                                              ┌────────▼────────┐
                                                              │  Anilist API     │
                                                              │ graphql.anilist  │
                                                              └─────────────────┘
```

---

## 2. Backend — Routes API Anilist

Base URL : `/api/v1`

| Méthode | Route | Auth | Description |
|---------|-------|------|-------------|
| `GET` | `/integrations/anilist/search?q=...&type=ANIME&page=1&perPage=10` | Oui | Recherche Anilist par titre |
| `GET` | `/integrations/anilist/:anilistId` | Oui | Détail complet d'un média Anilist |
| `POST` | `/integrations/anilist/:anilistId/import` | Oui | Importer un média dans la BDD locale |

### 2.1 Search — Recherche

**Request :**
```
GET /api/v1/integrations/anilist/search?q=naruto&type=ANIME&page=1&perPage=10
Authorization: Bearer <token>
```

**Response `200 OK` :**
```json
{
  "data": {
    "items": [
      {
        "id": 1735,
        "title": {
          "romaji": "Naruto",
          "english": "Naruto",
          "native": "ナルト"
        },
        "type": "ANIME",
        "format": "TV",
        "status": "FINISHED",
        "season": "SPRING",
        "seasonYear": 2002,
        "episodes": 220,
        "description": "Naruto Uzumaki, a young ninja...",
        "coverImage": {
          "large": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx3-TAIjKYLDG1ma.jpg",
          "medium": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx3-TAIjKYLDG1ma.jpg"
        },
        "bannerImage": "https://s4.anilist.co/file/anilistcdn/media/anime/banner/3.jpg",
        "genres": ["Action", "Adventure", "Comedy"],
        "averageScore": 78,
        "meanScore": 72,
        "popularity": 300000,
        "source": "MANGA",
        "siteUrl": "https://anilist.co/anime/3"
      }
    ],
    "total": 12,
    "page": 1,
    "hasNext": true
  },
  "meta": { "requestId": "..." }
}
```

### 2.2 GetMedia — Détail complet

**Request :**
```
GET /api/v1/integrations/anilist/1735
Authorization: Bearer <token>
```

**Response `200 OK` :**
```json
{
  "data": {
    "id": 1735,
    "idMal": 1735,
    "title": {
      "romaji": "Naruto",
      "english": "Naruto",
      "native": "ナルト"
    },
    "type": "ANIME",
    "format": "TV",
    "status": "FINISHED",
    "source": "MANGA",
    "season": "SPRING",
    "seasonYear": 2002,
    "episodes": 220,
    "duration": 23,
    "description": "Naruto Uzumaki, a young ninja...",
    "startDate": { "year": 2002, "month": 10, "day": 3 },
    "endDate": { "year": 2007, "month": 2, "day": 8 },
    "coverImage": {
      "large": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx3-TAIjKYLDG1ma.jpg",
      "medium": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx3-TAIjKYLDG1ma.jpg"
    },
    "bannerImage": "https://s4.anilist.co/file/anilistcdn/media/anime/banner/3.jpg",
    "genres": ["Action", "Adventure", "Comedy"],
    "averageScore": 78,
    "meanScore": 72,
    "popularity": 300000,
    "trailer": {
      "id": 5bQb9VZg,
      "site": "youtube",
      "thumbnail": "https://i.ytimg.com/vi/5bQb9VZg/hqdefault.jpg"
    },
    "studios": {
      "edges": [
        {
          "isMain": true,
          "node": { "id": 56, "name": "Pierrot" }
        }
      ]
    },
    "characters": {
      "edges": [
        {
          "role": "MAIN",
          "node": {
            "id": 1,
            "name": { "full": "Naruto Uzumaki" },
            "image": { "medium": "https://s4.anilist.co/file/anilistcdn/character/images/large/bx1-Qd6Qm1aTrm6W.jpg" },
            "gender": "Male"
          }
        }
      ]
    },
    "relations": {
      "edges": [
        {
          "relationType": "SEQUEL",
          "node": { "id": 1735, "title": { "romaji": "Naruto Shippuuden" }, "type": "ANIME" }
        }
      ]
    },
    "siteUrl": "https://anilist.co/anime/1735"
  },
  "meta": { "requestId": "..." }
}
```

### 2.3 ImportMedia — Import en BDD

**Request :**
```
POST /api/v1/integrations/anilist/1735/import
Authorization: Bearer <token>
```

**Response `200 OK` :**
```json
{
  "data": {
    "anime": {
      "id": "uuid-v4-local",
      "slug": "naruto",
      "title": "Naruto",
      "japaneseTitle": "ナルト",
      "synopsis": "Naruto Uzumaki, a young ninja...",
      "coverImageUrl": "https://s4.anilist.co/.../large/bx3-TAIjKYLDG1ma.jpg",
      "bannerImageUrl": "https://s4.anilist.co/.../banner/3.jpg",
      "trailerUrl": "https://www.youtube.com/watch?v=5bQb9VZg",
      "status": "completed",
      "rating": 72,
      "totalEpisodes": 220,
      "releaseYear": 2002,
      "season": "spring",
      "source": "manga",
      "metadata": {
        "anilist_id": 1735,
        "mal_id": 1735,
        "site_url": "https://anilist.co/anime/1735",
        "format": "TV",
        "popularity": 300000,
        "mean_score": 72
      },
      "genres": [...],
      "studios": [...],
      "characters": [...]
    },
    "message": "Media imported successfully from Anilist"
  },
  "meta": { "requestId": "..." }
}
```

---

## 3. Frontend — Client API et types

### 3.1 Créer le client Anilist (`lib/api/anilist.ts`)

Le client réutilise l'existante fonction `apiRequest` de `lib/api/client.ts` :

```typescript
import { apiRequest } from '@/lib/api/client'
import type { AnilistSearchResponse, AnilistMediaDetail } from '@/types/anilist'

export const anilistApi = {
  search(query: string, type = 'ANIME', page = 1, perPage = 10) {
    const params = new URLSearchParams({ q: query, type, page: String(page), perPage: String(perPage) })
    return apiRequest<AnilistSearchResponse>(`/integrations/anilist/search?${params}`)
  },

  getMedia(anilistId: number) {
    return apiRequest<AnilistMediaDetail>(`/integrations/anilist/${anilistId}`)
  },

  importMedia(anilistId: number) {
    return apiRequest<{ anime: Anime; message: string }>(`/integrations/anilist/${anilistId}/import`, { method: 'POST' })
  },
}
```

### 3.2 Types Anilist (`types/anilist.ts`)

```typescript
export interface AnilistSearchItem {
  id: number
  title: { romaji: string; english: string; native: string }
  type: string
  format: string
  status: string
  season: string
  seasonYear: number | null
  episodes: number | null
  description: string
  coverImage: { large: string; medium: string }
  bannerImage: string
  genres: string[]
  averageScore: number | null
  meanScore: number | null
  popularity: number | null
  source: string
  siteUrl: string
}

export interface AnilistSearchResponse {
  items: AnilistSearchItem[]
  total: number
  page: number
  hasNext: boolean
}

export interface AnilistMediaDetail extends AnilistSearchItem {
  idMal: number | null
  duration: number | null
  startDate: { year: number | null; month: number | null; day: number | null }
  endDate: { year: number | null; month: number | null; day: number | null }
  trailer: { id: string; site: string; thumbnail: string } | null
  studios: { edges: { isMain: boolean; node: { id: number; name: string } }[] }
  characters: { edges: { role: string; node: { id: number; name: { full: string }; image: { medium: string }; gender: string | null } }[] }
  relations: { edges: { relationType: string; node: { id: number; title: { romaji: string }; type: string } }[] }
}
```

---

## 4. Mapping Anilist → types frontend

La fonction `mapAnilistToAnime` convertit les données Anilist en format compatible avec l'interface `Anime` existante :

```typescript
import type { Anime, Genre, Studio } from '@/types/anime'

function mapAnilistToAnime(item: AnilistSearchItem): Anime {
  return {
    id: `anilist-${item.id}`,
    slug: slugify(item.title.english || item.title.romaji),
    title: item.title.english || item.title.romaji,
    japaneseTitle: item.title.native,
    synopsis: cleanHtml(item.description || ''),
    cover: item.coverImage.large,
    banner: item.bannerImage || item.coverImage.large,
    genres: item.genres.map(g => ({ id: slugify(g), name: g })),
    studio: item.studios?.edges[0]
      ? { id: String(item.studios.edges[0].node.id), name: item.studios.edges[0].node.name }
      : { id: 'unknown', name: 'Unknown' },
    year: item.seasonYear || 0,
    status: mapStatus(item.status),
    rating: (item.meanScore || 0) / 10,
    ratingCount: item.popularity || 0,
    ageRating: '',
    seasons: [],  // Peuplé via GetMedia si nécessaire
    totalEpisodes: item.episodes || 0,
  }
}

function mapStatus(status: string): AnimeStatus {
  switch (status) {
    case 'FINISHED': return 'completed'
    case 'RELEASING': return 'airing'
    case 'NOT_YET_RELEASED': return 'upcoming'
    case 'HIATUS': return 'hiatus'
    default: return 'upcoming'
  }
}
```

---

## 5. Requêtes par section de la page Discover

La page Discover contient 15+ sections. Voici comment chaque section serait alimentée :

### 5.1 HeroBanner (carrousel featured)

**Section actuelle :** `featured` = 6 anime hardcodés par slug

**Requête :**
```typescript
// Popularité DESC → les plus populaires pour le hero
const data = await anilistApi.search('', 'ANIME', 1, 6)
const featured = data.items.map(mapAnilistToAnime)
```

**Utilisation dans la page :**
```tsx
<HeroBanner items={featured} />
```

### 5.2 Section "Exclusivités" / Populaires

**Section actuelle :** `allAnime.slice(0, 8)`

**Requête :**
```typescript
const data = await anilistApi.search('', 'ANIME', 1, 8)  // Triés par popularité
const exclusives = data.items.map(mapAnilistToAnime)
```

### 5.3 Section "Reprendre" (Continue Watching)

**Section actuelle :** `getContinueWatching()` — données utilisateur

**Requête :** Cette section dépend de l'**historique utilisateur** côté backend, pas d'Anilist. Elle resterait alimentée par une route existante (`/api/v1/watch/continue`) ou serait construite à partir des données de la BDD locale après import.

> ⚠️ Cette section **ne peut pas** être alimentée directement par Anilist (pas de données de progression utilisateur).

### 5.4 Sections par genre (Thriller, Action, Sci-Fi, etc.)

**Section actuelle :** `allAnime.slice(N, M)` avec href `/catalog?genre=...`

**Requête pour chaque genre :**
```typescript
// Exemple : section Thriller
const thrillerData = await anilistApi.search('thriller', 'ANIME', 1, 8)
const thrillers = thrillerData.items.map(mapAnilistToAnime)

// Exemple : section Action
const actionData = await anilistApi.search('action', 'ANIME', 1, 8)
const actions = actionData.items.map(mapAnilistToAnime)
```

**Mapping genre → query :**

| Section | Query Anilist |
|---------|--------------|
| Thrillers | `search('thriller')` |
| Action & Aventure | `search('action adventure')` |
| Films | `search('movie')` ou filtre `format: MOVIE` |
| Space Opera | `search('space')` |
| Espionnage | `search('espionage')` |
| Blockbusters | `search('shonen')` ou popularité DESC |
| Multivers | `search('isekai')` |
| Guerre & Politique | `search('war military')` |

### 5.5 Section "Pick du jour" / "Revoir"

**Requête :** Popularité ou score DESC avec page variable (rotating)
```typescript
const dailyData = await anilistApi.search('', 'ANIME', new Date().getDay() + 1, 8)
const dailyPicks = dailyData.items.map(mapAnilistToAnime)
```

### 5.6 Section "Top 10"

**Requête :**
```typescript
const topData = await anilistApi.search('', 'ANIME', 1, 10)
const top10 = topData.items.map(mapAnilistToAnime)
```

### 5.7 Section "Nouvelles de la semaine"

**Requête :** Filtrer par `status: RELEASING`
```typescript
// Le backend pourrait exposer un paramètre status, ou on filtre côté client
const newData = await anilistApi.search('', 'ANIME', 1, 8)
const newThisWeek = newData.items
  .filter(i => i.status === 'RELEASING')
  .map(mapAnilistToAnime)
```

---

## 6. Remplacement des mock-data

### Avant (actuel — mock synchrones)

```typescript
import { getAnime, getAllAnime, getContinueWatching } from '@/lib/mock-data'

const featured = ['neon-samurai', 'crimson-vow', ...].map((id) => getAnime(id)!)
const allAnime = getAllAnime()
const continueWatching = getContinueWatching().slice(0, 5)
```

### Après (async avec Anilist)

```typescript
import { anilistApi } from '@/lib/api/anilist'
import { mapAnilistToAnime } from '@/lib/anilist-mapper'

// Dans un composant client ou un Server Component :
const [featuredData, popularData, thrillerData] = await Promise.all([
  anilistApi.search('', 'ANIME', 1, 6),
  anilistApi.search('', 'ANIME', 1, 8),
  anilistApi.search('thriller', 'ANIME', 1, 8),
])

const featured = featuredData.items.map(mapAnilistToAnime)
const popular = popularData.items.map(mapAnilistToAnime)
const thrillers = thrillerData.items.map(mapAnilistToAnime)
```

### Pattern recommandé : `React.use()` + Server Component

La page est un composant client (`'use client'`). Pour le SSR, créer un **Server Component wrapper** ou utiliser `React.use()` avec des Promises passées en props :

```typescript
// apps/app/(public)/[locale]/discover/page.tsx
// Charger les données en amont et les passer en props
```

---

## 7. Exemples de réponses JSON

### 7.1 Recherche vide (pas de results)

```json
{
  "data": {
    "items": [],
    "total": 0,
    "page": 1,
    "hasNext": false
  },
  "meta": { "requestId": "abc-123" }
}
```

### 7.2 Erreur — Anilist désactivé

```json
{
  "error": {
    "code": "ANILIST_DISABLED",
    "message": "Anilist integration is not enabled."
  },
  "meta": { "requestId": "abc-123" }
}
```

### 7.3 Erreur — Rate limit

```json
{
  "error": {
    "code": "TOO_MANY_REQUESTS",
    "message": "Too many requests. Please try again later."
  },
  "meta": { "requestId": "abc-123" }
}
```

### 7.4 Erreur — Validation

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "The request payload is invalid."
  },
  "meta": { "requestId": "abc-123" }
}
```

---

## 8. Stratégie de cache et rate-limit

### Côté backend

| Aspect | Valeur |
|--------|--------|
| Rate limit Anilist | 90 req/min (dégradé à 30 en ce moment) |
| Header `X-RateLimit-Remaining` | Parse et log warning si < 10 |
| Cache TTL configurable | `ANILIST_CACHE_TTL` (défaut: 5min) |
| Retry-after | Parse header `Retry-After` sur 429 |

### Côté frontend

| Stratégie | Implémentation |
|-----------|---------------|
| **SWR / React Query** | `useQuery` avec `staleTime: 5min` pour éviter les requêtes répétées |
| **Débounce recherche** | `useDebouncedValue(query, 300ms)` avant d'appeler `anilistApi.search()` |
| **Lazy loading sections** | Ne charger que les sections visibles (`IntersectionObserver`) |
| **Fallback** | En cas d'erreur Anilist, afficher un skeleton ou les données mock |

### Exemple avec SWR

```typescript
import useSWR from 'swr'
import { anilistApi } from '@/lib/api/anilist'

function useAnilistSearch(query: string) {
  return useSWR(
    query ? `/anilist/search/${query}` : null,
    () => anilistApi.search(query),
    { revalidateOnFocus: false, dedupingInterval: 300_000 } // 5min cache
  )
}
```

---

## Checklist d'implémentation

- [ ] **Backend :** `config.go` — AnilistConfig ajouté
- [ ] **Backend :** `anilist_client.go` — Client GraphQL créé
- [ ] **Backend :** `anilist.go` — Service (Search, GetMedia, ImportMedia)
- [ ] **Backend :** `anilist.go` — Mapping vers modèles locaux (Genre, Studio, Character)
- [ ] **Backend :** `anilist.go` — Upsert par `anilist_id` dans metadata JSON
- [ ] **Backend :** `routes/anilist.go` — Handlers REST
- [ ] **Backend :** `routes/routes.go` — Routes enregistrées
- [ ] **Backend :** `main.go` — Service wiré
- [ ] **Frontend :** `types/anilist.ts` — Types Anilist
- [ ] **Frontend :** `lib/api/anilist.ts` — Client API
- [ ] **Frontend :** `lib/anilist-mapper.ts` — Fonction `mapAnilistToAnime`
- [ ] **Frontend :** `discover/page.tsx` — Remplacer les appels mock par anilistApi
- [ ] **Frontend :** Ajouter SWR/React Query pour le cache
- [ ] **Frontend :** Gestion des erreurs et fallback
