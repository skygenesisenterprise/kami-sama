'use client'

import * as React from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { HeroSection } from '@/components/company/hero-section'
import { CompanySection } from '@/components/company/company-section'
import { PartnerCard } from '@/components/company/partner-card'
import { Film, Cpu, Users, Building2, ArrowRight } from 'lucide-react'

export default function PartnersPage() {
  const t = useTranslations('Public.company.partners')

  const partnerTypes = [
    { key: 'content', icon: <Film className="size-5" /> },
    { key: 'technology', icon: <Cpu className="size-5" /> },
    { key: 'community', icon: <Users className="size-5" /> },
    { key: 'strategic', icon: <Building2 className="size-5" /> },
  ]

  return (
    <main className="min-h-screen bg-background">
      <HeroSection
        title={t('heroTitle')}
        subtitle={t('heroSubtitle')}
        description={t('heroDescription')}
      />

      <CompanySection
        title={t('typesTitle')}
        description={t('typesDescription')}
      >
        <div className="grid gap-6 md:grid-cols-2">
          {partnerTypes.map((pt) => (
            <PartnerCard
              key={pt.key}
              title={t(`type_${pt.key}_title`)}
              description={t(`type_${pt.key}_description`)}
              icon={pt.icon}
            />
          ))}
        </div>
      </CompanySection>

      {/* ── Target audiences ──────────────────────────────────── */}
      <section className="px-4 py-16 md:px-8 md:py-24">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-8 font-display text-xl font-bold text-foreground">
            {t('whoTitle')}
          </h2>
          <div className="flex flex-wrap gap-3">
            {['studios', 'producers', 'rights', 'tech', 'communities', 'events'].map((who) => (
              <span
                key={who}
                className="rounded-full border border-border bg-card px-4 py-2 text-sm text-muted-foreground"
              >
                {t(`who_${who}`)}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────── */}
      <section className="px-4 py-16 md:px-8 md:py-24">
        <div className="mx-auto max-w-4xl rounded-2xl border border-border bg-card p-8 text-center md:p-12">
          <h2 className="font-display text-2xl font-bold text-foreground md:text-3xl">
            {t('ctaTitle')}
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            {t('ctaDescription')}
          </p>
          <Link
            href="/contact?subject=partnership"
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-stamp px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-stamp-dim"
          >
            {t('ctaButton')}
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>
    </main>
  )
}
