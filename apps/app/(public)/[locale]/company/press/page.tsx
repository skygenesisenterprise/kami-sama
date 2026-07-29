'use client'

import * as React from 'react'
import { useTranslations } from 'next-intl'
import { HeroSection } from '@/components/company/hero-section'
import { CompanySection } from '@/components/company/company-section'
import { PressCard } from '@/components/company/press-card'
import { AssetCard } from '@/components/company/asset-card'
import { Newspaper, FileText, Download, Info, Mail } from 'lucide-react'

export default function PressPage() {
  const t = useTranslations('Public.company.press')

  const latestNews = [
    {
      title: t('news_1_title'),
      date: t('news_1_date'),
      excerpt: t('news_1_excerpt'),
      category: t('news_1_category'),
    },
    {
      title: t('news_2_title'),
      date: t('news_2_date'),
      excerpt: t('news_2_excerpt'),
      category: t('news_2_category'),
    },
    {
      title: t('news_3_title'),
      date: t('news_3_date'),
      excerpt: t('news_3_excerpt'),
      category: t('news_3_category'),
    },
  ]

  const pressReleases = [
    {
      title: t('pr_1_title'),
      date: t('pr_1_date'),
      excerpt: t('pr_1_excerpt'),
      category: t('pr_1_category'),
    },
    {
      title: t('pr_2_title'),
      date: t('pr_2_date'),
      excerpt: t('pr_2_excerpt'),
      category: t('pr_2_category'),
    },
  ]

  const assets = [
    { key: 'logo', format: 'SVG / PNG' },
    { key: 'brand', format: 'PDF' },
    { key: 'overview', format: 'PDF' },
    { key: 'screenshots', format: 'ZIP' },
    { key: 'presskit', format: 'ZIP' },
  ]

  return (
    <main className="min-h-screen bg-background">
      <HeroSection
        title={t('heroTitle')}
        description={t('heroDescription')}
      />

      {/* ── Latest News ───────────────────────────────────────── */}
      <CompanySection
        id="news"
        title={t('newsTitle')}
        description={t('newsDescription')}
        icon={<Newspaper className="size-5" />}
      >
        <div className="grid gap-4 md:grid-cols-3">
          {latestNews.map((news, i) => (
            <PressCard key={i} {...news} />
          ))}
        </div>
      </CompanySection>

      {/* ── Press Releases ────────────────────────────────────── */}
      <CompanySection
        id="releases"
        title={t('releasesTitle')}
        description={t('releasesDescription')}
        icon={<FileText className="size-5" />}
      >
        <div className="space-y-4">
          {pressReleases.map((pr, i) => (
            <PressCard key={i} {...pr} />
          ))}
        </div>
      </CompanySection>

      {/* ── Media Kit ─────────────────────────────────────────── */}
      <CompanySection
        id="media-kit"
        title={t('mediaKitTitle')}
        description={t('mediaKitDescription')}
        icon={<Download className="size-5" />}
      >
        <div className="space-y-3">
          {assets.map((asset) => (
            <AssetCard
              key={asset.key}
              title={t(`asset_${asset.key}_title`)}
              description={t(`asset_${asset.key}_description`)}
              format={asset.format}
            />
          ))}
        </div>
      </CompanySection>

      {/* ── Company Info ──────────────────────────────────────── */}
      <section className="px-4 py-16 md:px-8 md:py-24">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-8 flex items-center gap-2 font-display text-xl font-bold text-foreground">
            <Info className="size-5 text-stamp" />
            {t('infoTitle')}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: t('info_name'), value: 'Kami-Sama Studios' },
              { label: t('info_parent'), value: 'Sky Genesis Enterprise Group' },
              { label: t('info_sector'), value: t('info_sector_value') },
              { label: t('info_press'), value: 'press@kami-sama.tv' },
            ].map((item, i) => (
              <div key={i} className="rounded-xl border border-border bg-card p-5">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">
                  {item.label}
                </p>
                <p className="mt-1 font-display text-sm font-bold text-foreground">
                  {item.value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
