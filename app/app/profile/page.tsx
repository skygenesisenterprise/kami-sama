"use client"

import type React from "react"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Settings, History, Bookmark, Heart, LogOut, Edit2, Camera } from "lucide-react"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { AnimeCard } from "@/components/anime/anime-card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { animes } from "@/lib/data"

// Mock user data
const mockUser = {
  id: "1",
  username: "OtakuMaster42",
  email: "otaku@exemple.com",
  avatar: "/anime-avatar-user-profile.jpg",
  joinDate: "Janvier 2024",
  stats: {
    watched: 156,
    watching: 12,
    planToWatch: 45,
    favorites: 23,
  },
}

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState("watchlist")

  // Mock data - dans une vraie app, cela viendrait de la DB
  const watchlist = animes.slice(0, 6)
  const favorites = animes.slice(2, 6)
  const history = animes.slice(0, 4)

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-24 pb-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Profile Header */}
          <div className="bg-card rounded-xl p-6 sm:p-8 mb-8">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
              {/* Avatar */}
              <div className="relative group">
                <div className="relative h-28 w-28 sm:h-32 sm:w-32 rounded-full overflow-hidden ring-4 ring-primary/20">
                  <Image
                    src={mockUser.avatar || "/placeholder.svg"}
                    alt={mockUser.username}
                    fill
                    className="object-cover"
                  />
                </div>
                <button className="absolute inset-0 flex items-center justify-center bg-background/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="h-6 w-6" />
                </button>
              </div>

              {/* User Info */}
              <div className="flex-1 text-center sm:text-left">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-2">
                  <h1 className="text-2xl font-bold">{mockUser.username}</h1>
                  <Button variant="outline" size="sm" className="gap-2 bg-transparent mx-auto sm:mx-0">
                    <Edit2 className="h-4 w-4" />
                    Modifier le profil
                  </Button>
                </div>
                <p className="text-muted-foreground mb-4">Membre depuis {mockUser.joinDate}</p>

                {/* Stats */}
                <div className="flex flex-wrap justify-center sm:justify-start gap-6">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-primary">{mockUser.stats.watched}</p>
                    <p className="text-xs text-muted-foreground">Vus</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold">{mockUser.stats.watching}</p>
                    <p className="text-xs text-muted-foreground">En cours</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold">{mockUser.stats.planToWatch}</p>
                    <p className="text-xs text-muted-foreground">À voir</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold">{mockUser.stats.favorites}</p>
                    <p className="text-xs text-muted-foreground">Favoris</p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex sm:flex-col gap-2">
                <Link href="/settings">
                  <Button variant="ghost" size="icon">
                    <Settings className="h-5 w-5" />
                    <span className="sr-only">Paramètres</span>
                  </Button>
                </Link>
                <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                  <LogOut className="h-5 w-5" />
                  <span className="sr-only">Déconnexion</span>
                </Button>
              </div>
            </div>
          </div>

          {/* Content Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="bg-card mb-6">
              <TabsTrigger value="watchlist" className="gap-2">
                <Bookmark className="h-4 w-4" />
                Ma liste
              </TabsTrigger>
              <TabsTrigger value="favorites" className="gap-2">
                <Heart className="h-4 w-4" />
                Favoris
              </TabsTrigger>
              <TabsTrigger value="history" className="gap-2">
                <History className="h-4 w-4" />
                Historique
              </TabsTrigger>
            </TabsList>

            <TabsContent value="watchlist">
              {watchlist.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {watchlist.map((anime) => (
                    <AnimeCard key={anime.id} anime={anime} variant="compact" />
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={Bookmark}
                  title="Votre liste est vide"
                  description="Ajoutez des animes à votre liste pour les retrouver facilement"
                  action={
                    <Link href="/catalogue">
                      <Button>Parcourir le catalogue</Button>
                    </Link>
                  }
                />
              )}
            </TabsContent>

            <TabsContent value="favorites">
              {favorites.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {favorites.map((anime) => (
                    <AnimeCard key={anime.id} anime={anime} variant="compact" />
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={Heart}
                  title="Pas encore de favoris"
                  description="Marquez vos animes préférés pour les retrouver ici"
                  action={
                    <Link href="/catalogue">
                      <Button>Découvrir des animes</Button>
                    </Link>
                  }
                />
              )}
            </TabsContent>

            <TabsContent value="history">
              {history.length > 0 ? (
                <div className="space-y-4">
                  {history.map((anime, index) => (
                    <Link
                      key={anime.id}
                      href={`/anime/${anime.slug}/watch`}
                      className="flex gap-4 p-4 bg-card rounded-xl hover:bg-secondary transition-colors"
                    >
                      <div className="relative w-32 aspect-video rounded-lg overflow-hidden shrink-0">
                        <Image
                          src={anime.coverImage || "/placeholder.svg"}
                          alt={anime.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium line-clamp-1">{anime.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          Épisode {Math.floor(Math.random() * 12) + 1} - Il y a {index + 1} jour
                          {index > 0 ? "s" : ""}
                        </p>
                        {/* Progress bar */}
                        <div className="mt-3 h-1 bg-secondary rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full"
                            style={{ width: `${Math.floor(Math.random() * 80) + 20}%` }}
                          />
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={History}
                  title="Aucun historique"
                  description="Commencez à regarder des animes pour voir votre historique ici"
                  action={
                    <Link href="/catalogue">
                      <Button>Commencer à regarder</Button>
                    </Link>
                  }
                />
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  )
}

function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
  action: React.ReactNode
}) {
  return (
    <div className="text-center py-16">
      <Icon className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
      <h3 className="text-lg font-medium mb-2">{title}</h3>
      <p className="text-muted-foreground mb-6 max-w-md mx-auto">{description}</p>
      {action}
    </div>
  )
}
