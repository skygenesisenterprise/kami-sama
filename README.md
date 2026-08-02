<div align="center">

# Kami-Sama

### The Open Anime & Media Platform

<p align="center"><strong>Full-stack platform for discovering, tracking, and streaming anime & manga -- with a community, recommendations, and a CLI.</strong></p>

[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square)](LICENSE) [![Go](https://img.shields.io/badge/Go-1.25-00ADD8.svg?style=flat-square&logo=go)](https://go.dev/) [![Next.js](https://img.shields.io/badge/Next.js-16-black.svg?style=flat-square&logo=next.js)](https://nextjs.org/) [![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6.svg?style=flat-square&logo=typescript)](https://www.typescriptlang.org/) [![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1.svg?style=flat-square&logo=postgresql)](https://www.postgresql.org/) [![Docker](https://img.shields.io/badge/Docker-Ready-2496ED.svg?style=flat-square&logo=docker)](https://www.docker.com/) [![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](CONTRIBUTING.md)

---

</div>

**Kami-Sama** is an open-source, full-stack media platform built for the anime & manga community. It provides a complete ecosystem for content discovery, catalog management, watchlist tracking, personalized recommendations, community forums, and media streaming -- all in one unified platform.

Kami-Sama is built on a modern monorepo architecture with a Go backend API, a Next.js 16 frontend (with React Native for mobile), PostgreSQL with Prisma ORM, Redis caching, MeiliSearch for full-text search, and RabbitMQ for async messaging. The platform ships with Docker-based deployment, Kubernetes manifests, a CLI tool, and a Discord bot.

Kami-Sama is developed and maintained by [Sky Genesis Enterprise](https://skygenesisenterprise.com).

---

## Table of Contents

- [What is Kami-Sama?](#what-is-kami-sama)
- [Key Features](#key-features)
- [Architecture](#architecture)
- [To Start Using Kami-Sama](#to-start-using-kami-sama)
- [To Start Developing Kami-Sama](#to-start-developing-kami-sama)
- [Project Structure](#project-structure)
- [Configuration](#configuration)
- [Docker & Deployment](#docker--deployment)
- [CLI Tool](#cli-tool)
- [Discord Bot](#discord-bot)
- [API Reference](#api-reference)
- [Contributing](#contributing)
- [Security](#security)
- [Support](#support)
- [Community](#community)
- [Governance](#governance)
- [Roadmap](#roadmap)
- [License](#license)

---

## What is Kami-Sama?

Kami-Sama (meaning "God" in Japanese) is a comprehensive media platform that combines:

- **A Netflix-style anime streaming interface** with hero banners, hover preview cards, watch progress tracking, and continue-watching rails.
- **A robust catalog system** backed by AniList integration for importing anime metadata, with support for collections, genres, studios, and characters.
- **A community layer** with forums, reviews, comments, reactions, moderation tools, and user reputation.
- **A recommendation engine** that computes personalized suggestions from your watch history.
- **Infrastructure tooling** including a Docker Compose dev stack, Kubernetes manifests, monitoring with Prometheus/Grafana/Loki, and Redis caching.
- **Developer tools** such as a CLI dashboard and a Discord bot for notifications and community interaction.

Whether you are a self-hosted enthusiast wanting your own anime platform, or a developer looking to extend it, Kami-Sama provides the full stack -- from database schema to pixel-perfect UI.

---

## Key Features

### Content & Catalog

- **Anime & Manga Catalog** -- Full CRUD for anime, episodes, seasons, genres, studios, and characters.
- **AniList Integration** -- Sync metadata, covers, and banners directly from AniList.
- **Collections** -- Editorial, genre-based, seasonal, and custom collections with rich discovery configuration.
- **Media Assets** -- Track media files with encoding jobs, CDN URLs, and quality metadata.
- **Search** -- Full-text search powered by MeiliSearch with real-time indexing.

### Streaming & Watchlist

- **Video Player** -- Integrated Vidstack player with subtitle/dub support.
- **Watch Progress** -- Per-episode progress tracking with "Continue Watching" rails.
- **Watchlist & Library** -- Personal libraries with custom lists and favorites.
- **Scheduling** -- Air date tracking, premiere calendars, and schedule entries.

### Community

- **Forum** -- Discussion posts, reviews, recommendations, and announcements with categories.
- **Comments & Reactions** -- Threaded comments with spoiler tags and reaction types (like, love, insightful, funny).
- **User Reputation** -- Community badges, reputation points, and role-based permissions.
- **Moderation** -- Content reports, moderation queue, and admin tools.
- **Real-time Presence** -- Online/offline/idle status via Redis-backed presence service.

### Authentication & Security

- **Multi-Factor Authentication** -- TOTP-based MFA with recovery codes.
- **OAuth2 / SSO** -- OAuth2 provider support with workspace-level SSO configuration (OIDC/SAML).
- **Session Management** -- Secure refresh token rotation with family-based revocation.
- **RBAC** -- Role-based access control with granular permissions.
- **Password Policies** -- Password history, strength validation, and secure hashing.

### Platform

- **Workspaces** -- Multi-tenant workspace support with member management.
- **Notifications** -- In-app and push notifications with per-type preferences.
- **Billing** -- Subscription management, transactions, and payment status tracking.
- **Analytics** -- Dashboard service with usage analytics.
- **Multi-language** -- Internationalization with next-intl (FR, EN, and more).
- **Mobile Ready** -- React Native via Expo/Capacitor for iOS & Android.

### Infrastructure

- **Docker Compose** -- One-command dev environment with all services.
- **Kubernetes** -- Production manifests for namespace, deployment, service, ingress, configmap, and secrets.
- **Monitoring** -- Prometheus metrics, Grafana dashboards, and Loki log aggregation.
- **Redis** -- Caching, rate limiting, session storage, and real-time presence.
- **RabbitMQ** -- Async message queuing for background jobs.

---

## Architecture

```
+-----------------------------------------------------------------+
|                        CLIENT LAYER                             |
|  +--------------+  +--------------+  +-----------------------+  |
|  |  Next.js 16  |  | React Native |  |     CLI (Node.js)    |  |
|  |  (Web App)   |  | (Mobile)     |  |  @kami-sama/cli       |  |
|  +------+-------+  +------+-------+  +-----------+-----------+  |
|         |                  |                      |              |
+---------+------------------+----------------------+--------------+
          |                  |                      |
+---------+------------------+----------------------+--------------+
|         v                  v                      v             |
|                     NGINX Reverse Proxy                        |
|                    (Load Balancing / SSL)                       |
+---------+------------------+----------------------+--------------+
          |                  |                      |
+---------+------------------+----------------------+--------------+
|                    API LAYER (Go / Gin)                         |
|  +---------------------------------------------------------+  |
|  |  Auth, Users, Workspaces, Anime, Episodes, Genres       |  |
|  |  Studios, Characters, Media, Community, Reviews         |  |
|  |  Collections, Recommendations, Scheduling, Search       |  |
|  |  Notifications, Analytics, Admin, MFA, OAuth2           |  |
|  +---------------------------------------------------------+  |
+------+-----------+--------------+--------------+---------------+
       |           |              |              |
+------+-------+ +---+--------+ +---+--------+ +---+------------+
| PostgreSQL   | |   Redis   | | MeiliSearch| |  RabbitMQ      |
| (Database)   | | (Cache)   | | (Search)   | | (Queue)        |
| + Prisma     | |           | |            | |                |
+--------------+ +-----------+ +------------+ +----------------+
```

### Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | Next.js 16, React 19, TypeScript 5.9, Tailwind CSS 4 | Web application with App Router, SSR, and static export |
| **Mobile** | React Native 0.81, Expo, Capacitor | iOS & Android apps |
| **Backend** | Go 1.25, Gin, GORM | REST API server |
| **Database** | PostgreSQL 16, Prisma ORM | Persistent storage with type-safe queries |
| **Cache** | Redis 8 | Session storage, rate limiting, presence, caching |
| **Search** | MeiliSearch | Full-text search with typo tolerance |
| **Queue** | RabbitMQ 3.13 | Async job processing |
| **Video** | Vidstack | In-browser video player with HLS support |
| **UI** | shadcn/ui, Radix UI, Framer Motion | Accessible, animated component library |
| **State** | Zustand | Lightweight client-side state management |
| **Bot** | Discord.js 14 | Discord integration for notifications |
| **CLI** | Commander.js, @inquirer/prompts, chalk | Terminal dashboard for platform management |
| **Infra** | Docker, Kubernetes, Traefik, Prometheus, Grafana, Loki | Container orchestration and observability |

---

## To Start Using Kami-Sama

### Prerequisites

- **Node.js** >= 18.0.0
- **pnpm** >= 9.0.0
- **Go** >= 1.25
- **Docker** & Docker Compose v2 (recommended)
- **PostgreSQL** 16+ (if running without Docker)
- **Redis** 8+ (optional for dev, required for production)

### Quick Start with Docker

The fastest way to get Kami-Sama running:

```bash
# Clone the repository
git clone https://github.com/skygenesisenterprise/kami-sama.git
cd kami-sama

# Start the full dev environment (PostgreSQL, Redis, RabbitMQ, MeiliSearch, API, Frontend)
make dev-up

# Or using docker-compose directly
docker compose -f docker-compose.dev.yml up -d
```

This will start:

| Service | URL | Description |
|---------|-----|-------------|
| **Frontend** | http://kami-sama.localhost | Next.js web application |
| **API** | http://api.kami-sama.localhost | Go backend API |
| **pgAdmin** | http://data.kami-sama.localhost | Database management UI |
| **RabbitMQ** | http://rabbitmq.kami-sama.localhost | Message queue management |
| **MeiliSearch** | http://search.kami-sama.localhost | Search engine dashboard |

### Manual Setup (without Docker)

```bash
# 1. Install dependencies
pnpm install

# 2. Set up the database
cd server/prisma
cp .env.example .env
# Edit .env with your DATABASE_URL
pnpm db:generate
pnpm db:migrate

# 3. Start the backend
cd ../../
make run-server

# 4. Start the frontend (in another terminal)
make run-app
```

### Environment Variables

Copy and configure the environment files:

```bash
# Backend environment
cp .env.example .env.local

# Key variables:
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/kami-sama
JWT_SECRET=your-secret-key
REDIS_URL=redis://localhost:6379
MEILI_MASTER_KEY=your-meili-key
```

See [Configuration](#configuration) for the full list.

---

## To Start Developing Kami-Sama

### Development Commands

```bash
# Start all services (frontend + backend) with hot-reload
pnpm dev

# Start only the frontend
pnpm dev:frontend

# Start only the backend (Go with Air for hot-reload)
pnpm dev:backend

# Start the CLI in dev mode
pnpm dev:cli
```

### Build Commands

```bash
# Build everything
pnpm build

# Build frontend only
pnpm build:frontend

# Build backend only (Go binary)
pnpm build:backend

# Build CLI
pnpm build:cli
```

### Code Quality

```bash
# Run linter across all packages
pnpm lint

# Fix lint issues
pnpm lint:fix

# Type-check all packages
pnpm typecheck

# Run all tests
pnpm test

# Format code with Prettier
npx prettier --write .
```

### Database Commands

```bash
# Generate Prisma client
pnpm db:generate

# Run migrations in development
pnpm db:migrate

# Open Prisma Studio (visual database browser)
pnpm db:studio

# Seed the database
pnpm db:seed

# Reset the database (destructive)
cd server/prisma && pnpm db:reset
```

### Git Hooks

This project uses [Husky](https://typicode.github.io/husky/) and [lint-staged](https://github.com/lint-staged/lint-staged) for pre-commit checks:

- **ESLint** auto-fixes staged `.ts`, `.tsx`, `.js`, `.jsx` files.
- **Prettier** formats all staged files.

---

## Project Structure

```
kami-sama/
+-- apps/                          # Frontend application
|   +-- app/                       # Next.js App Router pages
|   |   +-- (auth)/                #   Authentication routes (login, register, CLI auth)
|   |   +-- (public)/              #   Public routes (discover, catalog, anime detail)
|   |   +-- (platform)/            #   Authenticated routes (dashboard, settings, admin)
|   +-- components/                # React components (shadcn/ui based)
|   |   +-- ui/                    #   Base UI primitives
|   |   +-- dash/                  #   Dashboard components
|   |   +-- kami/                  #   Domain-specific components
|   +-- context/                   # React contexts (Auth, Platform, Theme)
|   +-- hooks/                     # Custom React hooks
|   +-- lib/                       # Utility libraries and API clients
|   +-- i18n/                      # Internationalization (next-intl)
|   +-- types/                     # TypeScript type definitions
|
+-- server/                        # Backend API (Go)
|   +-- main.go                    # Application entrypoint
|   +-- src/
|   |   +-- config/                # Configuration loading
|   |   +-- middleware/             # HTTP middleware (auth, CORS, logging, recovery)
|   |   +-- models/                # Data models
|   |   +-- routes/                # HTTP route handlers
|   |   +-- services/              # Business logic layer
|   |   +-- utils/                 # Utility functions
|   +-- prisma/                    # Database schema and migrations
|   |   +-- schema.prisma          #   Prisma schema definition
|   |   +-- migrations/            #   Database migration files
|   +-- internal/                  # Internal packages (Redis, etc.)
|
+-- packages/
|   +-- cli/                       # Kami-Sama CLI (@kami-sama/cli)
|   +-- bot/                       # Discord bot (@kami-sama/bot)
|   +-- node/                      # Node.js SDK (@kami-sama/node)
|
+-- infrastructure/                # Deployment & operations
|   +-- docker/                    # Docker configurations
|   +-- k8s/                       # Kubernetes manifests
|   +-- redis/                     # Redis configuration files
|   +-- monitoring/                # Prometheus + Grafana + Loki
|   +-- web/                       # NGINX reverse proxy configs
|   +-- traefik/                   # Traefik reverse proxy
|
+-- tools/                         # Build & dev tooling
+-- tests/                         # Integration tests
+-- docker/                        # Docker rootfs & build system
+-- docker-compose.dev.yml         # Development Docker Compose
+-- docker-compose.cloud.yml       # Cloud Docker Compose
+-- Dockerfile.cloud               # Multi-stage production Dockerfile
+-- Dockerfile.dev                 # Development Dockerfile
+-- Makefile                       # Project-wide make targets
+-- package.json                   # Root monorepo package
+-- pnpm-workspace.yaml            # pnpm workspace configuration
+-- go.mod / go.sum                # Go module dependencies
+-- middleware.ts                   # Next.js middleware
```

---

## Configuration

### Core Environment Variables

```bash
# -- Application -------------------------------------------
NODE_ENV=development          # development | production
APP_MODE=release              # debug | release
HTTP_ACCESS_LOGS=false        # Enable HTTP access logging

# -- Server ------------------------------------------------
API_PORT=8080                 # Backend API port
FRONTEND_PORT=3000            # Frontend port

# -- Database ----------------------------------------------
DATABASE_URL=postgresql://user:pass@localhost:5432/kami-sama
POSTGRESQL__HOST=localhost
POSTGRESQL__PORT=5432
POSTGRESQL__USER=postgres
POSTGRESQL__PASSWORD=postgres
POSTGRESQL__NAME=kami-sama

# -- Redis -------------------------------------------------
REDIS_ENABLED=true
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your-redis-password
REDIS_DB=0
REDIS_KEY_PREFIX=kami-sama:v1

# -- Auth --------------------------------------------------
JWT_SECRET=your-secure-random-secret
JWT_ISSUER=kami-sama
ACCESS_TOKEN_EXP=15           # Access token TTL in minutes
REFRESH_TOKEN_EXP=720         # Refresh token TTL in minutes

# -- Search ------------------------------------------------
MEILI_HOST=http://localhost:7700
MEILI_API_KEY=your-meili-master-key

# -- RabbitMQ ----------------------------------------------
RABBITMQ_URL=amqp://guest:guest@localhost:5672

# -- CORS --------------------------------------------------
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:8080

# -- AniList Integration -----------------------------------
ANILIST_API_URL=https://graphql.anilist.co
```

### Redis Data Architecture

| Key Pattern | Type | TTL | Purpose |
|-------------|------|-----|---------|
| `session:{id}` | Hash | 24h | User sessions |
| `cache:{endpoint}:{hash}` | String | 1h | API response cache |
| `rate-limit:{user}:{endpoint}` | String | 15min | Rate limiting |
| `presence:{userId}` | Hash | 75s | User online status |
| `email-queue:{priority}` | List | -- | Async email jobs |

---

## Docker & Deployment

### Docker Commands

```bash
# -- Development -------------------------------------------
make dev-up              # Start dev environment
make dev-down            # Stop dev environment
make dev-logs            # View dev logs
make dev-rebuild         # Rebuild and restart

# -- Cloud / Production ------------------------------------
make cloud-up            # Start cloud environment
make cloud-down          # Stop cloud environment
make cloud-logs          # View cloud logs
make cloud-rebuild       # Rebuild and restart

# -- Build Images ------------------------------------------
make build               # Build production image (full app)
make build-app           # Build frontend image
make build-server        # Build backend image
make build-dev           # Build development image
make build-cloud         # Build cloud image

# -- Cleanup -----------------------------------------------
make stop                # Stop all containers
make clean               # Remove build artifacts
make prune               # Clean up Docker system
```

### Multi-Stage Docker Build

The `Dockerfile.cloud` uses a multi-stage build:

1. **Go Builder** -- Compiles the Go backend binary with Alpine.
2. **Node Builder** -- Builds the Next.js frontend as a static export and generates the Prisma client.
3. **Production Image** -- Alpine-based image containing the Go binary, static frontend, and Prisma runtime.

### Kubernetes Deployment

Kubernetes manifests are in `infrastructure/k8s/`:

```bash
# Deploy to Kubernetes
kubectl apply -f infrastructure/k8s/namespace.yaml
kubectl apply -f infrastructure/k8s/configmap.yaml
kubectl apply -f infrastructure/k8s/secret.yaml
kubectl apply -f infrastructure/k8s/deployment.yaml
kubectl apply -f infrastructure/k8s/service.yaml
kubectl apply -f infrastructure/k8s/ingress.yaml

# Check status
kubectl get pods -n kami-sama
kubectl rollout status deployment/kami-sama -n kami-sama
```

### Monitoring Stack

```bash
# Start Prometheus + Grafana + Loki
docker compose -f infrastructure/monitoring/docker-compose.monitoring.yml up -d

# Access dashboards
# Grafana:     http://localhost:3000 (admin/admin)
# Prometheus:  http://localhost:9090
# Loki:        http://localhost:3100
```

---

## CLI Tool

The Kami-Sama CLI (`@kami-sama/cli`) provides a terminal dashboard for managing your platform.

```bash
# Install globally
npm install -g @kami-sama/cli

# Or use via pnpm
pnpm cli

# Authenticate
kami login

# View platform status
kami status

# Manage anime catalog
kami anime list
kami anime search "neon genesis"

# Manage collections
kami collections list
kami collections create --title "My List"
```

---

## Discord Bot

The Kami-Sama Discord bot (`@kami-sama/bot`) provides notifications and community interaction.

```bash
# Navigate to bot package
cd packages/bot

# Install dependencies
pnpm install

# Configure environment
cp .env.example .env
# Add your DISCORD_TOKEN and CLIENT_ID

# Deploy slash commands
pnpm deploy:commands

# Start the bot
pnpm start

# Or run in dev mode with auto-reload
pnpm dev
```

---

## API Reference

The backend exposes a RESTful API at `/api/v1/`. Key endpoints:

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/auth/register` | Register a new account |
| `POST` | `/api/v1/auth/login` | Login with email/password |
| `POST` | `/api/v1/auth/refresh` | Refresh access token |
| `POST` | `/api/v1/auth/logout` | Revoke session |
| `POST` | `/api/v1/auth/mfa/setup` | Enable MFA (TOTP) |
| `POST` | `/api/v1/auth/mfa/verify` | Verify MFA code |

### Content

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/v1/anime` | List anime (paginated) |
| `GET` | `/api/v1/anime/:slug` | Get anime detail |
| `GET` | `/api/v1/episodes` | List episodes |
| `GET` | `/api/v1/genres` | List genres |
| `GET` | `/api/v1/studios` | List studios |
| `GET` | `/api/v1/characters` | List characters |

### Discover & Collections

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/v1/collections` | List collections |
| `GET` | `/api/v1/collections/discover` | Get discover page sections |
| `GET` | `/api/v1/recommendations` | Get personalized recommendations |

### Community

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/v1/forum/posts` | List forum posts |
| `POST` | `/api/v1/forum/posts` | Create a post |
| `GET` | `/api/v1/reviews` | List reviews |
| `POST` | `/api/v1/reviews` | Submit a review |

### Integrations

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/v1/integrations/anilist/search?q=...` | Search AniList |
| `GET` | `/api/v1/integrations/anilist/media/:id` | Get AniList media detail |

### Admin

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/v1/admin/users` | List all users |
| `GET` | `/api/v1/admin/analytics` | Platform analytics |
| `GET` | `/api/v1/admin/dashboard` | Admin dashboard data |

Full API documentation is available in [`apps/requests.md`](apps/requests.md).

---

## Contributing

We welcome contributions from the community! Here's how to get started:

### 1. Fork & Clone

```bash
git clone https://github.com/your-username/kami-sama.git
cd kami-sama
pnpm install
```

### 2. Create a Branch

```bash
git checkout -b feature/my-amazing-feature
```

### 3. Make Changes

- Follow the [code style guidelines](#code-style).
- Write tests for new features.
- Update documentation as needed.

### 4. Commit & Push

```bash
git add .
git commit -m "feat: add my amazing feature"
git push origin feature/my-amazing-feature
```

### 5. Open a Pull Request

Describe your changes, link any related issues, and submit for review.

### Code Style

| Area | Convention |
|------|-----------|
| **TypeScript** | Strict mode, `@/*` path aliases, PascalCase components |
| **React** | `import * as React from "react"`, App Router, hooks start with `use` |
| **Go** | Standard Go formatting, `gofmt`, idiomatic error handling |
| **Files** | kebab-case for files, PascalCase for components |
| **Commits** | [Conventional Commits](https://www.conventionalcommits.org/) (`feat:`, `fix:`, `chore:`) |

---

## Security

Security is a top priority. If you discover a vulnerability, please report it responsibly:

- **Email**: [security@skygenesisenterprise.com](mailto:security@skygenesisenterprise.com)
- **Response**: Within 48 hours for critical issues
- **Disclosure**: 90-day coordinated disclosure window

See [SECURITY.md](SECURITY.md) for our full security policy.

### Security Features

- MFA / TOTP authentication with recovery codes
- Secure refresh token rotation with family-based revocation
- Password history tracking and strength validation
- CORS and CSRF protection
- Rate limiting on authentication endpoints
- SQL injection prevention via GORM/Prisma parameterized queries
- XSS protection headers (`X-Content-Type-Options`, `X-Frame-Options`)
- Container security with non-root users and minimal base images

---

## Support

If you need help:

1. **Documentation** -- Check this README and the [Infrastructure docs](infrastructure/README.md).
2. **Issues** -- Search or open an issue on [GitHub Issues](https://github.com/skygenesisenterprise/kami-sama/issues).
3. **Discussions** -- Ask questions in [GitHub Discussions](https://github.com/skygenesisenterprise/kami-sama/discussions).

---

## Community

- **GitHub**: [skygenesisenterprise/kami-sama](https://github.com/skygenesisenterprise/kami-sama)
- **Website**: [kami-sama.fr](https://kami-sama.tv)
- **Developer**: [Sky Genesis Enterprise](https://skygenesisenterprise.com)

### Community Meetings

Check the [GitHub Discussions](https://github.com/skygenesisenterprise/kami-sama/discussions) for meeting schedules and community calls.

---

## Governance

Kami-Sama is governed by a framework of principles, values, policies, and processes to help the community work toward shared goals. See [Governance.md](Governance.md) for details on:

- Roles & Responsibilities
- Decision Making Process (RFC)
- Code of Conduct
- Release Management
- Security Governance
- Community Guidelines

---

## Roadmap

### Current Focus (v0.1 -> v1.0)

- [ ] Complete anime catalog CRUD with AniList sync
- [ ] Video streaming pipeline with encoding jobs
- [ ] Community forum with moderation tools
- [ ] Personalized recommendation engine
- [ ] Mobile app (React Native / Capacitor)
- [ ] CLI tool for platform management
- [ ] Discord bot for notifications

### Planned

- [ ] Watch parties and real-time co-watching
- [ ] User-generated lists and social sharing
- [ ] Advanced analytics and viewing stats
- [ ] Plugin system for custom integrations
- [ ] Multi-language subtitle support
- [ ] Offline mode for mobile apps

See [GitHub Projects](https://github.com/skygenesisenterprise/kami-sama/projects) for the full roadmap and sprint planning.

---

## License

Kami-Sama is licensed under the [MIT License](LICENSE).

```
MIT License

Copyright (c) 2026 Sky Genesis Enterprise

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

<div align="center">

**Built by [Sky Genesis Enterprise](https://skygenesisenterprise.com)**

[Star this repo](https://github.com/skygenesisenterprise/kami-sama) | [Report a bug](https://github.com/skygenesisenterprise/kami-sama/issues/new) | [Request a feature](https://github.com/skygenesisenterprise/kami-sama/issues/new)

</div>
