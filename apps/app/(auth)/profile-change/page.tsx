'use client'

import { useState } from 'react'
import { Loader2, Plus, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useAuth } from '@/context/AuthContext'
import { toast } from '@/components/ui/use-toast'
import { useRouter } from 'next/navigation'
import { setProfileSelected } from '@/lib/profile-selection'

// Mock profiles - in real app, these would come from API
interface Profile {
  id: string
  displayName: string
  avatarUrl?: string
}

export default function ProfileChangePage() {
  const router = useRouter()
  const { user } = useAuth()
  const [isSwitching, setIsSwitching] = useState<string | null>(null)

  // Mock connected profiles
  const profiles: Profile[] = user
    ? [
        {
          id: user.id,
          displayName: user.displayName,
          avatarUrl: user.avatarUrl,
        },
      ]
    : []

  async function handleSwitchProfile(profileId: string) {
    setIsSwitching(profileId)
    try {
      // TODO: Implement actual profile switching API
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Mark profile as selected in localStorage
      setProfileSelected(true)

      toast({
        title: 'Profil changé',
        description: 'Vous êtes maintenant connecté avec le nouveau profil.',
        variant: 'default',
      })

      // Redirect to discover page
      router.push('/fr/discover')
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Une erreur est survenue'
      toast({
        title: 'Erreur',
        description: errorMessage,
        variant: 'destructive',
      })
    } finally {
      setIsSwitching(null)
    }
  }

  return (
    <main className="flex min-h-screen flex-col px-6 py-8 sm:px-10">
      <header className="flex items-center gap-2.5">
        <span className="text-lg font-semibold tracking-tight">Kami-Sama</span>
      </header>

      <div className="flex flex-1 items-center justify-center py-10">
        <div className="w-full max-w-sm">
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-semibold tracking-tight text-balance">
              Qui regarde ?
            </h1>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Sélectionnez un profil pour continuer.
            </p>
          </div>

          {/* Profile List - Horizontal */}
          <div className="flex flex-row items-start justify-center gap-4">
            {profiles.map((profile) => (
              <button
                key={profile.id}
                type="button"
                onClick={() => handleSwitchProfile(profile.id)}
                disabled={isSwitching !== null}
                className="flex flex-col items-center gap-3 rounded-xl border border-border/40 bg-card/50 p-5 transition-all hover:border-primary/50 hover:bg-card disabled:opacity-50 min-w-30"
              >
                <Avatar className="size-20">
                  <AvatarImage src={profile.avatarUrl || '/kami-sama.png'} alt={profile.displayName} />
                  <AvatarFallback className="bg-secondary text-xl">
                    {profile.displayName
                      .split(' ')
                      .map((p) => p[0])
                      .join('')
                      .slice(0, 2)
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <p className="text-sm font-medium truncate max-w-25">{profile.displayName}</p>

                {isSwitching === profile.id && (
                  <Loader2 className="size-4 animate-spin text-muted-foreground" />
                )}
              </button>
            ))}

            {/* Add Account Button */}
            <button
              type="button"
              onClick={() => router.push('/profile-change/add')}
              className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border/60 bg-transparent p-5 transition-all hover:border-primary/50 hover:bg-card/50 min-w-30"
            >
              <div className="flex size-20 items-center justify-center rounded-full bg-muted">
                <Plus className="size-8 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium text-muted-foreground">Ajouter</p>
            </button>
          </div>

          {/* Manage Profiles Button */}
          <div className="mt-8 flex justify-center">
            <Button
              variant="ghost"
              className="gap-2 text-muted-foreground hover:text-foreground"
              onClick={() => {
                toast({
                  title: 'Fonctionnalité à venir',
                  description: 'La gestion des profils sera bientôt disponible.',
                  variant: 'default',
                })
              }}
            >
              <Settings className="size-4" />
              Gérer les profils
            </Button>
          </div>
        </div>
      </div>

      <footer className="text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Kami-Sama. All rights reserved.
      </footer>
    </main>
  )
}
