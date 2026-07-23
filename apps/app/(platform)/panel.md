# Panel — Plan de construction du dashboard admin

---

## 1. Etat actuel du dashboard

| Zone | Fichiers | Contenu reel |
|------|:--------:|:------------:|
| Overview (`/dash`) | 1 | `<Overview />` — KPI, charts, top anime, uploads recentes (tout mock) |
| Content/Anime | 1 | `<AnimeManager />` — CRUD anime complet, client-side only (tout mock) |
| Tout le reste | 55 | `page.tsx` vide (0 octet) |

**57 pages routees, 2 avec un composant, 55 vides.**

La sidebar (`nav-config.ts`) et le shell (`dashboard-shell.tsx`) sont fonctionnels
avec 51 items de navigation. Le squelette est pret, il manque le contenu.

---

## 2. Analyse du repo Django de reference

### 2.1 Modeles de donnees

| Modele | Champs | Usage |
|--------|--------|-------|
| **Geners** | `title` | Genres d'anime (M2M avec Movie) |
| **MovieCategory** | TextChoices: Comedy, Drama, Action, Romance, Adventure | Categories principales |
| **MovieStatus** | TextChoices: Top Rated (TR), Trending Now (TN), Most Popular (MP) | Statuts de mise en avant |
| **Movie** | title, description, image, release_date, rating, views_count, status, category, genres (M2M), new_slug (AutoSlug), video | Modele central — un anime = un "movie" |
| **Banners** | title, cover, category | Banners de la page d'accueil |
| **Side_items** | title, picture, rating | Elements lateraux (sidebar du site) |

### 2.2 Fonctionnalites de l'interface admin Django

L'admin Django est le **Django Admin classique** — pas de customisation.
C'est un CRUD brut genere automatiquement par `admin.site.register(Movie)`.

**Capacites de l'admin Django :**
- Liste de tous les films avec recherche et filtres
- Detail d'un film avec edition des champs
- Upload d'images (`ImageField`) et de videos (`FileField`)
- Gestion des genres (M2M inline)
- CRUD complet sur les 4 modeles
- Pas de dashboard, pas de charts, pas de KPIs
- Pas d'authentification rolee (juste superuser / staff)

### 2.3 Pages publiques du site Django

| Page | Description | Donnees affichees |
|------|-------------|-------------------|
| `home` | Page d'accueil | Banners, Most Popular, Trending Now, Top Rated, Side Items |
| `movie_detail` | Fiche anime | Film par slug + side items |
| `anime_watching` | Lecteur video | Film par slug, lecteur integre |
| `categories` | Filtre par genre | Films filtres par genre |
| `blog` | Blog (page vide) | — |
| `login` / `signup` | Authentification | Formulaires basiques |

### 2.4 Ce que le Django fait que kami-sama n'a pas encore

| Fonctionnalite Django | Kami-sama equivalent | Etat |
|----------------------|---------------------|------|
| Gestion des genres | `/dash/content/genres` | Backend pret, frontend vide |
| Upload video/image | `/dash/media/videos`, `/dash/media/thumbnails` | Backend partiel (24/37 endpoints) |
| Statuts (Trending/Popular/Top Rated) | `AnimeStatus` enum + `/dash/content/anime` | Modele pret, frontend partiel |
| Banners/promotions | Aucun | A creer |
| Lecteur video | Page publique `/[locale]/watch/[slug]` | Existe en front, pas lie au backend |
| Blog | Aucun | A creer si besoin |
| Auth basique | Auth complete avec roles | Implemente (superadmin/admin/user/workspace:owner) |
| Categories (M2M) | `/dash/content/categories` | Backend pret, frontend vide |
| Side items | Aucun | Concept equivalent : widgets/dashboard cards |

---

## 3. Gap analysis — Kami-sama vs Django

### 3.1 Ce que kami-sama fait DEJA mieux que le Django

- **Dashboard analytics** — Overview avec KPIs, Recharts, bar/pie charts
- **CRUD anime avance** — AnimeManager avec tri, filtres, pagination, bulk delete, dialog create/edit
- **Auth rolee** — 4 roles definis, permissions basees
- **Sidebar navigation** — 51 items, animations, mobile support
- **Dark/light mode** — Theme toggle
- **Architecture** — Service/Repository pattern, GORM, PostgreSQL
- **Anilist integration** — Client GraphQL, import automatique

### 3.2 Ce qu'il faut construire (par priorite)

| Priorite | Section | Pages | Effort estime |
|:--------:|---------|:-----:|:-------------:|
| P0 | Wires existants | 2 | Faible — remplacer les mocks par de vrais appels API |
| P1 | Content (genres, categories, tags) | 3 | Moyen — backend pret |
| P2 | Scheduling (simulcasts) | 1 | Moyen — backend pret |
| P3 | Community (users, roles) | 2 | Eleve — admin endpoints manquants |
| P4 | Analytics | 6 | Eleve — aucun endpoint |
| P5 | Media | 8 | Moyen — backend partiellement pret |
| P6 | Settings | 12 | Eleve — 45 endpoints manquants |
| P7 | System | 6 | Moyen — 21 endpoints manquants |
| P8 | Support | 5 | Moyen — 19 endpoints manquants |

---

## 4. Plan d'implementation par section

### Phase 0 — Wires les composants existants (2 pages)

**Objectif :** Les composants `<Overview />` et `<AnimeManager />` existent mais utilisent
des donnees mock. Les brancher aux vraies APIs.

#### Overview (`apps/components/admin/overview.tsx`)

**Donnees mock a remplacer (`overview-data.ts`) :**

| Champ mock | Endpoint backend | Service |
|-----------|-----------------|---------|
| `stats` (4 KPIs) | `GET /dash/overview/stats` | `DashOverviewService.GetStats()` |
| `weeklyViews` (7 jours) | `GET /dash/overview/weekly-views` | `DashOverviewService.GetWeeklyViews()` |
| `plans` (pie chart) | `GET /dash/overview/subscription-distribution` | `DashOverviewService.GetSubscriptionDistribution()` |
| `topAnimes` (leaderboard) | `GET /dash/overview/top-anime` | `DashOverviewService.GetTopAnime()` |
| `recentUploads` (table) | `GET /dash/overview/recent-uploads` | `DashOverviewService.GetRecentUploads()` |

**Fichiers a modifier :**
- `apps/components/admin/overview.tsx` — ajouter `useEffect` + fetch, etat local
- `apps/components/admin/overview-data.ts` — garder comme fallback, ajouter types exportes
- `server/src/services/dash-overview.go` — nouveau service
- `server/src/routes/dash-overview.go` — nouveaux handlers
- `server/src/routes/routes.go` — enregistrer les routes

#### AnimeManager (`apps/components/admin/anime-manager.tsx`)

**Donnees mock a remplacer (`anime-manager-data.ts`) :**

| Operation | Endpoint backend | Methode |
|----------|-----------------|---------|
| List anime | `GET /dash/content/anime` | Existe deja (`ListAnimes`) |
| Creer anime | `POST /dash/content/anime` | Existe deja (`CreateAnime`) |
| Modifier anime | `PUT /dash/content/anime/:id` | Existe deja (`UpdateAnime`) |
| Supprimer anime | `DELETE /dash/content/anime/:id` | Existe deja (`DeleteAnime`) |
| Bulk delete | `POST /dash/content/anime/bulk-delete` | A creer |
| Genres (filtre) | `GET /dash/content/genres` | Existe deja |

**Fichiers a modifier :**
- `apps/components/admin/anime-manager.tsx` — remplacer les appels clients par `fetch()` vers le backend
- `apps/components/admin/anime-manager-data.ts` — adapter le mapping reponse API → `AnimeManagerItem`
- `server/src/routes/anime.go` — ajouter `BulkDeleteAnime` handler

---

### Phase 1 — Content (3 pages)

Le backend pour les genres, categories et tags est deja en place.
Il faut construire les pages frontend.

#### Genres (`/dash/content/genres`)

**Backend :** Routes existantes dans `routes.go` — `GET/POST/PUT/DELETE /dash/content/genres`

**Frontend a construire :**
- `apps/components/admin/genres-manager.tsx`
- Modele : `AnimeManager` comme reference (table + CRUD dialog)
- Colonnes : Nom, Nombre d'animes associes, Date de creation, Actions
- Dialog create/edit : champ texte "Titre du genre"
- Delete confirmation

#### Categories (`/dash/content/categories`)

**Backend :** Routes existantes — `GET/POST/PUT/DELETE /dash/content/categories`

**Frontend a construire :**
- `apps/components/admin/categories-manager.tsx`
- Colonnes : Nom, Description, Slug, Nombre d'animes, Actions
- Dialog create/edit : titre + description

#### Tags (`/dash/content/tags`)

**Backend :** Tag model existe mais pas de repo/service/routes

**Backend a creer :**
- `server/src/repositories/tag.go`
- `server/src/services/tag.go`
- `server/src/routes/tag.go` — CRUD standard
- Enregistrer dans `routes.go`

**Frontend a construire :**
- `apps/components/admin/tags-manager.tsx`
- Colonnes : Nom, Slug, Nombre d'utilisations, Actions

---

### Phase 2 — Scheduling / Simulcasts (1 page)

#### Simulcasts (`/dash/scheduling/simulcasts`)

**Backend :** Routes existantes — `GET/POST/PUT/DELETE /dash/scheduling/simulcasts`

**Frontend a construire :**
- `apps/components/admin/simulcasts-manager.tsx`
- Vue calendrier/liste des sorties planifiees
- Colonnes : Anime, Date de sortie, Heure, Jour de la semaine, Statut (Upcoming/Aired/Cancelled), Actions
- Dialog create/edit : select anime, date/time picker, jour de la semaine, statut
- Filtre par statut et par mois

---

### Phase 3 — Community (2 pages prioritaires)

#### Users (`/dash/community/users`)

**Backend a creer :**
- `server/src/services/admin-user.go` — `ListUsers`, `GetUser`, `UpdateUserRole`, `BanUser`, `DeleteUser`
- `server/src/routes/admin-user.go` — handlers admin
- Enregistrer dans `routes.go` sous `/dash/community/users`

**Frontend a construire :**
- `apps/components/admin/users-manager.tsx`
- Colonnes : Avatar, Nom, Email, Role, Date d'inscription, Derniere activite, Statut (actif/banni), Actions
- Actions : Changer le role (dropdown), Bannir/Debannir, Supprimer
- Filtre par role et par statut

#### Roles (`/dash/community/roles`)

**Backend :** Les roles sont hardcodes (`superadmin`, `admin`, `user`, `workspace:owner`)
dans `server/src/auth/jwt.go`. Pas de modele DB.

**Backend a creer :**
- `server/src/models/role.go` — `Role` model (name, permissions JSON, is_system)
- `server/src/repositories/role.go`
- `server/src/services/role.go`
- `server/src/routes/role.go`
- Migration de la table `roles`
- Seeder avec les 4 roles existants

**Frontend a construire :**
- `apps/components/admin/roles-manager.tsx`
- Colonnes : Nom, Permissions (badges), Utilisateurs associes, System (oui/non), Actions
- Dialog create/edit : nom + matrice de permissions (toggle par section)
- Les roles system ne peuvent pas etre supprimes

---

### Phase 4 — Analytics (6 pages)

Aucun endpoint backend n'existe. Tout est a creer.

**Backend a creer :**
- `server/src/models/analytics.go` — event logging model (page_view, watch_event, etc.)
- `server/src/services/analytics.go` — agregations (vues par jour/semaine/mois, temps de visionnage, devices, geographie)
- `server/src/routes/analytics.go` — endpoints d'agregation
- Middleware de tracking (optionnel)

**Endpoints requis :**

| Page | Endpoint | Description |
|------|----------|-------------|
| Overview | `GET /dash/analytics/overview` | KPIs globaux (vues, utilisateurs actifs, temps moyen) |
| Watch Time | `GET /dash/analytics/watch-time` | Temps de visionnage par anime, par jour |
| Devices | `GET /dash/analytics/devices` | Repartition desktop/mobile/tablette |
| Geography | `GET /dash/analytics/geography` | Top pays, top villes |
| Popular | `GET /dash/analytics/popular` | Anime les plus vus, les plus duree |
| Active Users | `GET /dash/analytics/active-users` | DAU/WAU/MAU, courbe d'activite |

**Frontend a construire (6 composants) :**
- `apps/components/admin/analytics-overview.tsx`
- `apps/components/admin/analytics-watch-time.tsx`
- `apps/components/admin/analytics-devices.tsx`
- `apps/components/admin/analytics-geography.tsx`
- `apps/components/admin/analytics-popular.tsx`
- `apps/components/admin/analytics-active-users.tsx`

**Pattern commun :** Utiliser Recharts (deja dans le projet pour Overview).
LineChart, BarChart, PieChart, AreaChart selon les donnees.

---

### Phase 5 — Media (8 pages)

Backend partiellement pret (24/37 endpoints). Les endpoints manquants sont
principalement pour le transcodage et les sous-titres.

**Pages avec backend pret :**
- Videos : `GET/POST/DELETE /dash/media/videos`
- Thumbnails : `GET/POST/DELETE /dash/media/thumbnails`
- Uploads : `GET/POST /dash/media/uploads`

**Pages a creer (backend + frontend) :**
- Posters (`/dash/media/posters`)
- Trailers (`/dash/media/trailers`)
- Audio (`/dash/media/audio`)
- Subtitles (`/dash/media/subtitles`)
- Encoding (`/dash/media/encoding`)

**Frontend pattern :**
- Grille de medias avec preview
- Upload drag-and-drop (composant existant dans le projet)
- Progress bar pour les uploads
- Metadata editor (titre, langue, resolution)

---

### Phase 6 — Settings (12 pages)

Le plus gros morceau : 52 endpoints, 3 implementes.

**Approche recommandee :** Un seul composant `SettingsForm` reutilisable
qui prend en props la categorie de settings et les champs a afficher.

**Backend a creer :**
- `server/src/models/setting.go` — `Setting` model (category, key, value JSON)
- `server/src/repositories/setting.go`
- `server/src/services/setting.go`
- `server/src/routes/setting.go` — `GET /dash/settings/:category`, `PUT /dash/settings/:category`

**Categories :**
- General (site name, description, logo, favicon)
- Security (2FA, session timeout, password policy)
- Branding (theme colors, fonts, custom CSS)
- Email (SMTP, templates)
- SEO (meta tags, sitemap, robots.txt)
- Storage (S3 config, local storage, limits)
- CDN (CloudFlare, custom CDN)
- Domains (custom domains, SSL)
- APIs (rate limiting, API keys)
- OAuth (Google, GitHub, Discord providers)
- Integrations (Anilist, MAL, etc.)
- Maintenance (mode maintenance, message, whitelist IPs)

---

### Phase 7 — System (6 pages)

**Backend a creer :**
- `server/src/services/system.go` — health checks, log aggregation, queue status, cache stats
- `server/src/routes/system.go`

**Endpoints :**
- Health : `GET /dash/system/health` — uptime, DB connection, Redis connection, disk space
- Logs : `GET /dash/system/logs` — application logs avec filtres (level, date, source)
- Queue : `GET /dash/system/queue` — file d'attente des jobs (email, transcodage, etc.)
- Cache : `GET /dash/system/cache` — Redis stats, keys count, memory usage
- Search : `GET /dash/system/search` — Elasticsearch/Meilisearch status
- Background : `GET /dash/system/background` — jobs en cours, historique

**Frontend :** Tableaux avec status indicators (vert/rouge/jaune), line charts pour les metriques temps reel.

---

### Phase 8 — Support (5 pages)

**Backend a creer :**
- `server/src/models/ticket.go` — `Ticket` model (subject, message, status, priority, user_id)
- `server/src/models/faq.go` — `FAQ` model (question, answer, category, order)
- `server/src/models/abuse.go` — `AbuseReport` model (type, content_id, reason, status)
- Repos, services, routes pour chaque

**Pages :**
- Tickets (`/dash/support/tickets`) — liste de tickets support avec filtres (ouvert/en cours/ferme), reponse
- Contact (`/dash/support/contact`) — messages de contact
- FAQ (`/dash/support/faq`) — CRUD FAQ avec drag-and-drop pour l'ordre
- Abuse Reports (`/dash/support/abuse`) — signalements de contenu avec actions (rejeter, avertir, bannir)
- Logs (`/dash/support/logs`) — logs d'audit (actions admin)

---

## 5. Ordre d'implementation recommande

```
Semaine 1-2 : Phase 0 (wires) + Phase 1 (genres, categories, tags)
  → 5 pages operationnelles, impact visible immediatement

Semaine 3   : Phase 2 (simulcasts)
  → 1 page, backend pret

Semaine 4-5 : Phase 3 (users, roles)
  → 2 pages critiques pour l'admin

Semaine 6-8 : Phase 5 (media)
  → 8 pages, backend partiellement pret

Semaine 9-11: Phase 4 (analytics)
  → 6 pages, tout a creer

Semaine 12-14: Phase 7 (system)
  → 6 pages

Semaine 15-17: Phase 8 (support)
  → 5 pages

Semaine 18-22: Phase 6 (settings)
  → 12 pages, le plus gros volume
```

---

## 6. Pattern technique par defaut

Tous les nouveaux composants admin doivent suivre le pattern etabli
par `<Overview />` et `<AnimeManager />` :

```
apps/components/admin/
  {section}-manager.tsx        ← composant principal ('use client')
  {section}-manager-data.ts    ← types + donnees mock (fallback)
  {section}-schema.ts          ← zod schemas pour les formulaires (optionnel)
```

**Composition du composant :**
1. Header avec KPI cards (stats résumées)
2. Toolbar (recherche, filtres, bouton ajouter)
3. DataTable (tri, pagination, selection)
4. Dialog create/edit (react-hook-form + zod)
5. AlertDialog delete confirmation

**Appels API :**
- Utiliser `fetch()` depuis le composant client
- ou `lib/api/client.ts` (`apiRequest`) si disponible
- Gestion d'erreur avec toast (sonner)
- Loading states avec Skeleton

**Notes :**
- Le dossier `dash/system/backroung/` contient une faute de frappe → a renommer en `background/`
- La route `Providers` dans `nav-config.ts` n'a pas de `page.tsx` correspondant → a creer
