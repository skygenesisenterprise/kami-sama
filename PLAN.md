# Homepage Redesign Plan — Crunchyroll Discover Page Architecture

## Context

The current homepage has 12 sections with inconsistent naming, mixed card types, a grid-based recommendations section, and section dividers between every block. The goal is to restructure the entire page to match the layout philosophy, content hierarchy, and browsing flow of Crunchyroll's Discover page — keeping the existing CSS architecture, design tokens, and component library intact.

Crunchyroll's homepage structure (from research):
1. Large featured hero banner with auto-rotating slides
2. Continue Watching (horizontal scroll, progress bars)
3. Trending Now (ranked carousel)
4. Popular This Season (carousel)
5. Recently Added (carousel)
6. New Episodes (carousel)
7. Recommended For You (carousel, not grid)
8. Genres / Categories section

Key differences from current implementation:
- Remove all `SectionDivider` components (Crunchyroll uses spacing, not visual dividers)
- Rename sections to match Crunchyroll's conventions
- Convert "Pour vous" from grid → carousel
- Add dedicated Genres section at bottom
- Remove sections that don't map to Crunchyroll (Community picks, Editorial picks, Most Liked, Simulcasts-as-today, Search bar)
- Simplify card usage — use `AnimeCard` consistently across carousels
- Keep `ContinueWatchingCard` for the Continue Watching row (it has progress bars)

---

## Files to Modify

### 1. `apps/app/(public)/page.tsx` — Complete rewrite
- Restructure to match Crunchyroll section order
- Remove SectionDivider imports and usages
- Remove unused component imports (CommunityCard, SeasonalPickCard, SimulcastCard, SearchBar, SectionDivider)
- Map data sources to new section names
- Add Genres section at bottom

### 2. `apps/components/kami/hero-banner.tsx` — Refine
- Reduce height from `80vh` to `70vh` (Crunchyroll's hero is slightly shorter)
- Simplify gradient overlays (2 layers instead of 3)
- Add bottom gradient fade for text readability
- Keep auto-advance, indicators, and CTA buttons

### 3. `apps/components/kami/carousel-section.tsx` — No changes needed
- Already supports the horizontal scroll pattern with arrows
- Reuse as-is

### 4. `apps/components/kami/anime-card.tsx` — No changes needed
- Already the standard poster card (2:3 ratio, hover play, title, genres)
- Use as the default card for all carousels

### 5. `apps/components/kami/continue-watching-card.tsx` — No changes needed
- Already has progress bar and 16:9 thumbnail
- Use as-is for Continue Watching section

### 6. `apps/components/kami/section-divider.tsx` — Not imported (effectively removed)

---

## New Section Order (page.tsx)

```
1. HeroBanner          — Featured anime carousel (existing component, refined)
2. Continue Watching   — ContinueWatchingCard in CarouselSection
3. Trending Now        — AnimeCard with rank overlay in CarouselSection
4. Popular This Season — AnimeCard in CarouselSection
5. Recently Added      — AnimeCard with episode badge in CarouselSection
6. New Episodes        — AnimeCard with "NEW" badge in CarouselSection
7. Recommended For You — AnimeCard in CarouselSection (was grid, now carousel)
8. Browse by Genre     — New inline genres grid section
```

---

## Section Details

### Section 1: Hero Banner
- **Component**: `HeroBanner` (existing, refined)
- **Data**: `['neon-samurai', 'crimson-vow', 'moonlit-path']` → `getAnime()`
- **Changes**: Reduce height, simplify overlays, keep auto-advance

### Section 2: Continue Watching
- **Component**: `CarouselSection` + `ContinueWatchingCard`
- **Data**: `getContinueWatching()`
- **Item width**: `w-64` (wide for 16:9 thumbnails)
- **Section title**: "Continue Watching"
- **Section subtitle**: "Pick up where you left off"
- **href**: `/library`

### Section 3: Trending Now
- **Component**: `CarouselSection` + inline ranked card
- **Data**: `getTrending()`
- **Item width**: `w-30 sm:w-35 md:w-40`
- **Section title**: "Trending Now"
- **Section subtitle**: "Most popular this week"
- **href**: `/browse?sort=trending`
- **Card**: Same inline pattern as current (large rank number + poster + rank badge)

### Section 4: Popular This Season
- **Component**: `CarouselSection` + `AnimeCard`
- **Data**: `getSeasonalPicks()` → extract `.anime`
- **Item width**: `w-37.5 sm:w-42.5 lg:w-46.25`
- **Section title**: "Popular This Season"
- **Section subtitle**: "Summer 2025 highlights"
- **href**: `/browse?filter=seasonal`

### Section 5: Recently Added
- **Component**: `CarouselSection` + `AnimeCard` with badge
- **Data**: `getRecentlyAdded()`
- **Item width**: `w-37.5 sm:w-42.5 lg:w-46.25`
- **Section title**: "Recently Added"
- **Section subtitle**: "Fresh anime on the platform"
- **href**: `/browse?sort=recent`
- **Badge**: Episode number badge (existing pattern)

### Section 6: New Episodes
- **Component**: `CarouselSection` + `AnimeCard` with badge
- **Data**: `getLatestAdditions()`
- **Item width**: `w-37.5 sm:w-42.5 lg:w-46.25`
- **Section title**: "New Episodes"
- **Section subtitle**: "Latest episode releases"
- **href**: `/browse?sort=new`
- **Badge**: "NEW" badge (green/primary colored)

### Section 7: Recommended For You
- **Component**: `CarouselSection` + `AnimeCard`
- **Data**: `getRecommendations()` → extract `.anime`
- **Item width**: `w-37.5 sm:w-42.5 lg:w-46.25`
- **Section title**: "Recommended For You"
- **Section subtitle**: "Based on your watch history"
- **href**: `/browse?sort=recommended`

### Section 8: Browse by Genre
- **Component**: Inline grid section (not a carousel)
- **Data**: `GENRES`
- **Layout**: Responsive grid of genre pill/link buttons
- **Section title**: "Browse by Genre"
- **Section subtitle**: "Explore anime by category"
- **Links**: Each genre links to `/browse?genre={id}`
- **Style**: Rounded pill buttons with border, hover state

---

## Components Removed from Homepage

| Component | Reason |
|-----------|--------|
| `SectionDivider` | Crunchyroll uses spacing, not visual dividers |
| `SimulcastCard` | Merged into "Popular This Season" using `AnimeCard` |
| `SeasonalPickCard` | Merged into "Popular This Season" using `AnimeCard` |
| `CommunityCard` | No equivalent on Crunchyroll Discover |
| `RecommendationCard` | Replaced by `AnimeCard` in carousel (was grid-only) |
| `SearchBar` | Not part of Crunchyroll's homepage flow |

These components remain in the codebase for potential use elsewhere — they are just not imported on the homepage.

---

## Verification

1. Run `pnpm lint` to check for unused imports and lint errors
2. Run `pnpm build` to ensure no type errors or build failures
3. Visual check: page should have 8 sections stacked vertically with horizontal carousels
4. Verify all carousels scroll horizontally with arrow buttons on desktop
5. Verify hero banner auto-advances and has slide indicators
6. Verify Continue Watching cards show progress bars
7. Verify Trending Now cards show rank numbers
8. Verify genre links navigate to `/browse?genre={id}`
