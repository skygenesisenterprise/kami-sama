'use client'

import * as React from 'react'
import { useTranslations } from 'next-intl'
import { HeroSection } from '@/components/company/hero-section'
import { CompanySection } from '@/components/company/company-section'
import { Eye, Link2, Lightbulb, Users, Heart, Shield, Zap, Globe } from 'lucide-react'

export default function AboutPage() {
  const t = useTranslations('Public.company.about')

  const pillars = [
    { key: 'discover', icon: <Eye className="size-5" /> },
    { key: 'connect', icon: <Link2 className="size-5" /> },
    { key: 'innovate', icon: <Lightbulb className="size-5" /> },
  ]

  const values = [
    { key: 'creators', icon: <Heart className="size-5" /> },
    { key: 'accessibility', icon: <Globe className="size-5" /> },
    { key: 'innovation', icon: <Zap className="size-5" /> },
    { key: 'community', icon: <Users className="size-5" /> },
  ]

  return (
    <main className="min-h-screen bg-background">
      {/* ── Hero ──────────────────────────────────────────────── */}
      <HeroSection
        title={t('heroTitle')}
        subtitle={t('heroSubtitle')}
        description={t('heroDescription')}
      />

      {/* ── Vision ────────────────────────────────────────────── */}
      <CompanySection
        id="vision"
        title={t('visionTitle')}
        description={t('visionDescription')}
        icon={<Eye className="size-5" />}
      >
        <div className="grid gap-6 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-xl border border-border bg-card p-6">
              <p className="text-sm leading-relaxed text-muted-foreground">
                {t(`visionPoint${i}`)}
              </p>
            </div>
          ))}
        </div>
      </CompanySection>

      {/* ── Mission ───────────────────────────────────────────── */}
      <CompanySection
        id="mission"
        title={t('missionTitle')}
        description={t('missionDescription')}
        icon={<Shield className="size-5" />}
      >
        <div className="grid gap-6 md:grid-cols-3">
          {pillars.map((pillar) => (
            <div key={pillar.key} className="group rounded-xl border border-border bg-card p-6 transition-all hover:border-stamp/30">
              <div className="mb-4 flex size-10 items-center justify-center rounded-lg bg-stamp/10 text-stamp transition-colors group-hover:bg-stamp/20">
                {pillar.icon}
              </div>
              <h3 className="font-display text-lg font-bold text-foreground">
                {t(`pillar_${pillar.key}_title`)}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {t(`pillar_${pillar.key}_description`)}
              </p>
            </div>
          ))}
        </div>
      </CompanySection>

      {/* ── Values ────────────────────────────────────────────── */}
      <CompanySection
        id="values"
        title={t('valuesTitle')}
        icon={<Heart className="size-5" />}
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {values.map((value) => (
            <div key={value.key} className="flex items-start gap-3 rounded-xl border border-border bg-card p-5">
              <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-stamp/10 text-stamp">
                {value.icon}
              </div>
              <div>
                <h4 className="font-display text-sm font-bold text-foreground">
                  {t(`value_${value.key}_title`)}
                </h4>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  {t(`value_${value.key}_description`)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CompanySection>

      {/* ── SGE relation ──────────────────────────────────────── */}
      <section className="px-4 py-16 md:px-8 md:py-24">
        <div className="mx-auto max-w-4xl rounded-2xl border border-border bg-card p-8 text-center md:p-12">
          <p className="text-sm uppercase tracking-wider text-muted-foreground">
            {t('sgePartOf')}
          </p>
          <h2 className="mt-3 font-display text-2xl font-bold text-foreground md:text-3xl">
            Sky Genesis Enterprise Group
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            {t('sgeDescription')}
          </p>
          <a
            href="https://skygenesisenterprise.com"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-stamp px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-stamp-dim"
          >
            {t('sgeVisit')}
          </a>
        </div>
      </section>
    </main>
  )
}
