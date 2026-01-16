"use client"

import { useState } from "react"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { AnimeCard } from "@/components/anime/anime-card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { animes } from "@/lib/data"
import { PlayCircle, Clock, CheckCircle, Bookmark } from "lucide-react"
import Link from "next/link"

export default function WatchlistPage() {
  const [activeTab, setActiveTab] = useState("all")

  // Mock data segmented by status
  const watching = animes.slice(0, 3)
  const planToWatch = animes.slice(3, 8)
  const completed = animes.slice(8, 12)
  const all = [...watching, ...planToWatch, ...completed]

  const getAnimesByTab = () => {
    switch (activeTab) {
      case "watching":
        return watching
      case "plan":
        return planToWatch
      case "completed":
        return completed
      default:
        return all
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-24 pb-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Ma liste</h1>
            <p className="text-muted-foreground">Gérez vos animes à regarder</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            <div className="bg-card p-4 rounded-xl text-center">
              <Bookmark className="h-6 w-6 mx-auto mb-2 text-primary" />
              <p className="text-2xl font-bold">{all.length}</p>
              <p className="text-xs text-muted-foreground">Total</p>
            </div>
            <div className="bg-card p-4 rounded-xl text-center">
              <PlayCircle className="h-6 w-6 mx-auto mb-2 text-green-500" />
              <p className="text-2xl font-bold">{watching.length}</p>
              <p className="text-xs text-muted-foreground">En cours</p>
            </div>
            <div className="bg-card p-4 rounded-xl text-center">
              <Clock className="h-6 w-6 mx-auto mb-2 text-yellow-500" />
              <p className="text-2xl font-bold">{planToWatch.length}</p>
              <p className="text-xs text-muted-foreground">À voir</p>
            </div>
            <div className="bg-card p-4 rounded-xl text-center">
              <CheckCircle className="h-6 w-6 mx-auto mb-2 text-blue-500" />
              <p className="text-2xl font-bold">{completed.length}</p>
              <p className="text-xs text-muted-foreground">Terminés</p>
            </div>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-card mb-6">
              <TabsTrigger value="all">Tous ({all.length})</TabsTrigger>
              <TabsTrigger value="watching">En cours ({watching.length})</TabsTrigger>
              <TabsTrigger value="plan">À voir ({planToWatch.length})</TabsTrigger>
              <TabsTrigger value="completed">Terminés ({completed.length})</TabsTrigger>
            </TabsList>

            {["all", "watching", "plan", "completed"].map((tab) => (
              <TabsContent key={tab} value={tab}>
                {getAnimesByTab().length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                    {getAnimesByTab().map((anime) => (
                      <AnimeCard key={anime.id} anime={anime} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <Bookmark className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
                    <h3 className="text-lg font-medium mb-2">Aucun anime dans cette catégorie</h3>
                    <p className="text-muted-foreground mb-6">Parcourez le catalogue pour ajouter des animes</p>
                    <Link href="/catalogue">
                      <Button>Parcourir le catalogue</Button>
                    </Link>
                  </div>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  )
}
