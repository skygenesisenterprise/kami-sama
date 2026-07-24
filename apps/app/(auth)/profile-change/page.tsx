'use client'

import { useState, useEffect } from 'react'
import { Loader2, Plus, Settings, Lock, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useAuth } from '@/context/AuthContext'
import { toast } from '@/components/ui/use-toast'
import { useRouter } from 'next/navigation'
import { setProfileSelected, clearProfileSelection, saveSelectedProfile } from '@/lib/profile-selection'
import { profileApi, type ProfileData } from '@/lib/api/profiles'
import { routing } from '@/i18n/routing'

export default function ProfileChangePage() {
  const router = useRouter()
  const { user } = useAuth()
  const [profiles, setProfiles] = useState<ProfileData[]>([])
  const [loading, setLoading] = useState(true)
  const [isSwitching, setIsSwitching] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const locale = (() => {
    if (typeof window === 'undefined') return routing.defaultLocale;
    const browserLang = navigator.language.split('-')[0];
    return routing.locales.includes(browserLang as any) ? browserLang : routing.defaultLocale;
  })()

  // Clear profile selection on mount so user must re-select
  useEffect(() => {
    clearProfileSelection()
  }, [])

  // Load profiles from API
  useEffect(() => {
    async function loadProfiles() {
      if (!user) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)
        const data = await profileApi.list()
        setProfiles(data)
      } catch (err) {
        console.error('Failed to load profiles:', err)
        setError('Impossible de charger les profils.')
        // Fallback to mock user profile
        if (user) {
          setProfiles([{
            id: user.id,
            userId: user.id,
            displayName: user.displayName,
            avatarUrl: user.avatarUrl || undefined,
            pinEnabled: false,
            isDefault: true,
            sortOrder: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }])
        }
      } finally {
        setLoading(false)
      }
    }

    loadProfiles()
  }, [user])

  // Create default profile if none exists and we have a user
  useEffect(() => {
    if (!loading && profiles.length === 0 && user) {
      profileApi.create({
        displayName: user.displayName,
        isDefault: true,
      }).then((newProfile) => {
        setProfiles([newProfile])
      }).catch(() => {
        // Silently fail - user can still use mock
      })
    }
  }, [loading, profiles.length, user])

  async function handleSwitchProfile(profile: ProfileData) {
    setIsSwitching(profile.id)
    try {
      // Check if profile has PIN enabled
      if (profile.pinEnabled) {
        router.push(`/profile-change/pin-confirme?profileId=${profile.id}&name=${encodeURIComponent(profile.displayName)}`)
        return
      }

      // Select profile via API
      await profileApi.select(profile.id)

      // Mark profile as selected in localStorage and persist info
      saveSelectedProfile({
        id: profile.id,
        displayName: profile.displayName,
        avatarUrl: profile.avatarUrl,
      })
      setProfileSelected(true)

      toast({
        title: 'Profil changé',
        description: `Connecté en tant que ${profile.displayName}.`,
        variant: 'default',
      })

      // Redirect to discover page with correct locale
      const validLocale = routing.locales.includes(locale as any) ? locale : routing.defaultLocale;
      router.push(`/${validLocale}/discover`)
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
        <div className="flex flex-col items-center">
          {/* Header */}
          <div className="mb-8 text-center max-w-sm">
            <h1 className="text-2xl font-semibold tracking-tight text-balance">
              Qui regarde ?
            </h1>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Sélectionnez un profil pour continuer.
            </p>
          </div>

          {/* Error state */}
          {error && !loading && (
            <div className="mb-6 flex items-center gap-2 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive max-w-sm">
              <AlertCircle className="size-4 shrink-0" />
              <p>{error}</p>
            </div>
          )}

          {/* Loading state */}
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="size-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              {/* Profile List */}
              <div className="flex flex-row items-start justify-center gap-4 flex-wrap">
                {profiles.map((profile) => (
                  <button
                    key={profile.id}
                    type="button"
                    onClick={() => handleSwitchProfile(profile)}
                    disabled={isSwitching !== null}
                    className="group relative flex flex-col items-center gap-3 rounded-xl border border-border/40 bg-card/50 p-5 transition-all hover:border-primary/50 hover:bg-card disabled:opacity-50 min-w-30"
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

                    {/* PIN lock indicator */}
                    {profile.pinEnabled && (
                      <div className="absolute right-2 top-2 rounded-full bg-amber-500/20 p-1">
                        <Lock className="size-3 text-amber-500" />
                      </div>
                    )}

                    {isSwitching === profile.id && (
                      <Loader2 className="size-4 animate-spin text-muted-foreground" />
                    )}
                  </button>
                ))}

                {/* Add Profile Button */}
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
            </>
          )}
        </div>
      </div>

      <footer className="text-center text-xs text-muted-foreground">
        &copy; {new Date().getFullYear()} Kami-Sama. All rights reserved.
      </footer>
    </main>
  )
}
