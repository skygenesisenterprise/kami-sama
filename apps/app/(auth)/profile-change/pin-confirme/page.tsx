'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft, Loader2, Lock, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from '@/components/ui/use-toast'
import { setProfileSelected, saveSelectedProfile } from '@/lib/profile-selection'
import { profileApi } from '@/lib/api/profiles'
import { routing } from '@/i18n/routing'
import { getDomainUrl } from '@/lib/domains'

export default function PinConfirmePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const profileId = searchParams.get('profileId')
  const profileName = searchParams.get('name') || 'Profil'

  const [pin, setPin] = useState(['', '', '', ''])
  const [isVerifying, setIsVerifying] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([null, null, null, null])

  // Focus first input on mount
  useEffect(() => {
    inputRefs.current[0]?.focus()
  }, [])

  const handlePinChange = useCallback((index: number, value: string) => {
    // Only allow digits
    if (value && !/^\d$/.test(value)) return

    setPin((prev) => {
      const next = [...prev]
      next[index] = value
      return next
    })
    setError(null)

    // Auto-advance to next field
    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus()
    }
  }, [])

  const handleKeyDown = useCallback((index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
    if (e.key === 'Enter') {
      handleSubmit()
    }
  }, [pin])

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 4)
    if (pasted.length === 4) {
      setPin(pasted.split(''))
      inputRefs.current[3]?.focus()
    }
  }, [])

  async function handleSubmit() {
    const pinCode = pin.join('')
    if (pinCode.length !== 4) {
      setError('Veuillez entrer un code PIN à 4 chiffres.')
      return
    }

    if (!profileId) {
      toast({
        title: 'Erreur',
        description: 'Profil non trouvé.',
        variant: 'destructive',
      })
      router.push('/profile-change')
      return
    }

    setIsVerifying(true)
    setError(null)

    try {
      const result = await profileApi.verifyPin(profileId, pinCode)

      if (result.valid) {
        saveSelectedProfile({
          id: profileId,
          displayName: profileName,
          avatarUrl: result.profile.avatarUrl,
        })
        setProfileSelected(true)
        toast({
          title: 'Bienvenue',
          description: `Connecté à ${profileName}.`,
          variant: 'default',
        })

        const locale = (() => {
          if (typeof window === 'undefined') return routing.defaultLocale
          const browserLang = navigator.language.split('-')[0]
          return routing.locales.includes(browserLang as any) ? browserLang : routing.defaultLocale
        })()
        window.location.href = getDomainUrl('main', `/${locale}/discover`)
      } else {
        setError('Code PIN incorrect. Veuillez réessayer.')
        setPin(['', '', '', ''])
        inputRefs.current[0]?.focus()
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Code PIN incorrect.'
      setError(errorMessage)
      setPin(['', '', '', ''])
      inputRefs.current[0]?.focus()
    } finally {
      setIsVerifying(false)
    }
  }

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
            onClick={() => router.push('/profile-change')}
            className="mb-6 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="size-4" />
            Retour
          </button>

          {/* Header */}
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-muted">
              <Lock className="size-7 text-muted-foreground" />
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-balance">
              Code PIN requis
            </h1>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Entrez le code PIN pour accéder au profil <strong>{profileName}</strong>.
            </p>
          </div>

          {/* PIN Input */}
          <div className="mb-6 flex justify-center gap-3">
            {pin.map((digit, index) => (
              <Input
                key={index}
                ref={(el) => { inputRefs.current[index] = el }}
                type="password"
                inputMode="numeric"
                maxLength={1}
                autoComplete="one-time-code"
                value={digit}
                onChange={(e) => handlePinChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={index === 0 ? handlePaste : undefined}
                className="h-14 w-14 text-center text-xl font-bold"
                disabled={isVerifying}
                aria-label={`Chiffre ${index + 1} du code PIN`}
              />
            ))}
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              <AlertCircle className="size-4 shrink-0" />
              <p>{error}</p>
            </div>
          )}

          {/* Submit button */}
          <Button
            size="lg"
            className="h-11 w-full text-sm"
            disabled={isVerifying || pin.join('').length !== 4}
            onClick={handleSubmit}
          >
            {isVerifying && <Loader2 className="mr-2 size-4 animate-spin" />}
            {isVerifying ? 'Vérification...' : 'Déverrouiller'}
          </Button>
        </div>
      </div>

      <footer className="text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Kami-Sama. All rights reserved.
      </footer>
    </main>
  )
}
