'use client'

import { useEffect, useId, useState } from 'react'
import { ArrowLeft, Camera, Loader2, User } from 'lucide-react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { toast } from '@/components/ui/use-toast'
import { useRouter } from 'next/navigation'


const createProfileSchema = z.object({
  displayName: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
})

type CreateProfileFormData = z.infer<typeof createProfileSchema>

export default function AddProfilePage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)

  // Cleanup object URL on unmount
  useEffect(() => {
    return () => {
      if (avatarUrl) URL.revokeObjectURL(avatarUrl)
    }
  }, [avatarUrl])

  const nameId = useId()

  const form = useForm<CreateProfileFormData>({
    resolver: zodResolver(createProfileSchema),
    defaultValues: {
      displayName: '',
    },
  })

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSubmitting(true)

    try {
      const formData = form.getValues()

      // TODO: Implement actual profile creation API
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast({
        title: 'Profil créé',
        description: 'Votre nouveau profil a été créé avec succès.',
        variant: 'default',
      })

      // Redirect to profile selection page
      router.push('/profile-change')
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Une erreur est survenue'
      toast({
        title: 'Erreur',
        description: errorMessage,
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const initials = form.watch('displayName')
    ?.split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'U'

  return (
    <main className="flex min-h-screen flex-col px-6 py-8 sm:px-10">
      <header className="flex items-center gap-2.5">
        <span className="text-lg font-semibold tracking-tight">Kami-Sama</span>
      </header>

      <div className="flex flex-1 items-center justify-center py-10">
        <div className="w-full max-w-sm">
          {/* Back button */}
          <button
            type="button"
            onClick={() => router.back()}
            className="mb-6 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="size-4" />
            Retour
          </button>

          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-semibold tracking-tight text-balance">
              Nouveau profil
            </h1>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Créez un profil pour commencer.
            </p>
          </div>

          {/* Avatar */}
          <div className="mb-8 flex flex-col items-center">
            <div className="relative group">
              <Avatar className="size-24 border-2 border-border/60">
                <AvatarImage src={avatarUrl || '/kami-sama.png'} alt="Avatar" />
                <AvatarFallback className="bg-secondary text-2xl">{initials}</AvatarFallback>
              </Avatar>
              <label
                htmlFor="avatar-upload"
                className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 transition-opacity group-hover:opacity-100 cursor-pointer"
                aria-label="Changer l'avatar"
              >
                <Camera className="size-6 text-white" />
              </label>
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) {
                    const url = URL.createObjectURL(file)
                    setAvatarUrl(url)
                  }
                }}
              />
            </div>
            <p className="mt-3 text-xs text-muted-foreground">Cliquez pour changer l'avatar</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor={nameId} className="mb-1.5 block text-xs font-medium text-muted-foreground">
                Nom du profil
              </Label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  <User className="size-4" />
                </span>
                <Input
                  id={nameId}
                  type="text"
                  autoComplete="name"
                  placeholder="Mon profil"
                  className="h-11 pl-9"
                  {...form.register('displayName')}
                />
              </div>
              {form.formState.errors.displayName && (
                <p className="mt-1 text-xs text-destructive">
                  {form.formState.errors.displayName.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              size="lg"
              disabled={isSubmitting}
              className="h-11 w-full text-sm"
            >
              {isSubmitting && <Loader2 className="mr-2 size-4 animate-spin" />}
              Créer le profil
            </Button>
          </form>
        </div>
      </div>

      <footer className="text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Kami-Sama. All rights reserved.
      </footer>
    </main>
  )
}
