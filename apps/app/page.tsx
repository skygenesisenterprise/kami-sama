'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { routing } from '@/i18n/routing'
import { getDomainUrl } from '@/lib/domains'

export default function RootPage() {
  const router = useRouter()
  const { isAuthenticated, isLoading } = useAuth()

  useEffect(() => {
    if (isLoading) return

    if (isAuthenticated) {
      window.location.href = getDomainUrl('sso', '/profile-change')
    } else {
      router.replace(`/${routing.defaultLocale}/discover`)
    }
  }, [isLoading, isAuthenticated, router])

  return (
    <div className="flex min-h-screen items-center justify-center bg-background text-sm text-muted-foreground">
      Chargement…
    </div>
  )
}
