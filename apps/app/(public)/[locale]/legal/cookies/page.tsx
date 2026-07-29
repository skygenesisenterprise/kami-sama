'use client'

import * as React from 'react'
import { useTranslations } from 'next-intl'
import { LegalHero } from '@/components/legal/legal-hero'
import { LegalSection } from '@/components/legal/legal-section'
import { LegalCard } from '@/components/legal/legal-card'
import { LegalNavigation } from '@/components/legal/legal-navigation'
import { ContactBlock } from '@/components/legal/contact-block'
import { Cookie, Settings, BarChart3, Megaphone } from 'lucide-react'

const NAV_ITEMS = [
  { id: 'introduction', label: 'Introduction' },
  { id: 'categories', label: 'Cookie Categories' },
  { id: 'management', label: 'Cookie Management' },
  { id: 'contact', label: 'Contact' },
]

export default function CookiesPage() {
  const t = useTranslations('Public.legal.cookies')

  return (
    <main className="min-h-screen bg-background">
      <LegalHero
        title={t('heroTitle')}
        description={t('heroDescription')}
        lastUpdated={t('lastUpdated')}
      />

      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="flex gap-8">
          <aside className="hidden w-56 shrink-0 lg:block">
            <LegalNavigation items={NAV_ITEMS} />
          </aside>

          <div className="min-w-0 flex-1">
            {/* Introduction */}
            <LegalSection id="introduction" title={t('introTitle')}>
              <p>{t('introText1')}</p>
              <p>{t('introText2')}</p>
            </LegalSection>

            {/* Cookie Categories */}
            <LegalSection id="categories" title={t('categoriesTitle')} description={t('categoriesDescription')}>
              <div className="grid gap-4 md:grid-cols-2">
                <LegalCard
                  title={t('essential_title')}
                  description={t('essential_description')}
                  icon={<Cookie className="size-4" />}
                />
                <LegalCard
                  title={t('preference_title')}
                  description={t('preference_description')}
                  icon={<Settings className="size-4" />}
                />
                <LegalCard
                  title={t('analytics_title')}
                  description={t('analytics_description')}
                  icon={<BarChart3 className="size-4" />}
                />
                <LegalCard
                  title={t('marketing_title')}
                  description={t('marketing_description')}
                  icon={<Megaphone className="size-4" />}
                />
              </div>
            </LegalSection>

            {/* Cookie Management */}
            <LegalSection id="management" title={t('managementTitle')} description={t('managementDescription')}>
              <div className="rounded-xl border border-border bg-card p-6 text-center">
                <Cookie className="mx-auto mb-3 size-8 text-stamp" />
                <p className="text-sm text-muted-foreground">{t('managementText')}</p>
                <button className="mt-4 rounded-lg bg-stamp px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-stamp-dim">
                  {t('managementButton')}
                </button>
              </div>
            </LegalSection>

            {/* Contact */}
            <section className="px-4 py-12 md:px-8 md:py-16">
              <div className="mx-auto max-w-4xl">
                <ContactBlock
                  title={t('contactTitle')}
                  email="privacy@kami-sama.tv"
                  description={t('contactDescription')}
                />
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  )
}
