'use client'

import * as React from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { LegalHero } from '@/components/legal/legal-hero'
import { LegalSection } from '@/components/legal/legal-section'
import { LegalCard } from '@/components/legal/legal-card'
import { LegalNavigation } from '@/components/legal/legal-navigation'
import { ContactBlock } from '@/components/legal/contact-block'
import { Shield, Eye, Database, Settings, Clock, UserCheck, Mail } from 'lucide-react'

const NAV_ITEMS = [
  { id: 'introduction', label: 'Introduction' },
  { id: 'information-collected', label: 'Information Collected' },
  { id: 'data-usage', label: 'Data Usage' },
  { id: 'gdpr-basis', label: 'GDPR Legal Basis' },
  { id: 'data-retention', label: 'Data Retention' },
  { id: 'user-rights', label: 'User Rights' },
  { id: 'contact', label: 'Contact' },
]

export default function PrivacyPage() {
  const t = useTranslations('Public.legal.privacy')

  return (
    <main className="min-h-screen bg-background">
      <LegalHero
        title={t('heroTitle')}
        description={t('heroDescription')}
        lastUpdated={t('lastUpdated')}
      />

      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="flex gap-8">
          {/* ── Sidebar navigation (desktop) ──────────────────────── */}
          <aside className="hidden w-56 shrink-0 lg:block">
            <LegalNavigation items={NAV_ITEMS} />
          </aside>

          {/* ── Main content ──────────────────────────────────────── */}
          <div className="min-w-0 flex-1">
            {/* Introduction */}
            <LegalSection id="introduction" title={t('introTitle')}>
              <p>{t('introText1')}</p>
              <p>{t('introText2')}</p>
              <p className="text-xs text-muted-foreground">
                {t('introSge')}
              </p>
            </LegalSection>

            {/* Information Collected */}
            <LegalSection id="information-collected" title={t('collectedTitle')} description={t('collectedDescription')}>
              <div className="grid gap-4 md:grid-cols-3">
                <LegalCard
                  title={t('accountTitle')}
                  description={t('accountDescription')}
                  icon={<UserCheck className="size-4" />}
                />
                <LegalCard
                  title={t('usageTitle')}
                  description={t('usageDescription')}
                  icon={<Eye className="size-4" />}
                />
                <LegalCard
                  title={t('technicalTitle')}
                  description={t('technicalDescription')}
                  icon={<Database className="size-4" />}
                />
              </div>
            </LegalSection>

            {/* Data Usage */}
            <LegalSection id="data-usage" title={t('usageTitle2')} description={t('usageDescription2')}>
              <ul className="list-disc space-y-2 pl-5">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <li key={i}>{t(`usagePurpose${i}`)}</li>
                ))}
              </ul>
            </LegalSection>

            {/* GDPR Legal Basis */}
            <LegalSection id="gdpr-basis" title={t('gdprTitle')} description={t('gdprDescription')}>
              <div className="grid gap-3 sm:grid-cols-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="rounded-lg border border-border bg-card p-4">
                    <h4 className="text-sm font-bold text-foreground">{t(`basis${i}_title`)}</h4>
                    <p className="mt-1 text-xs text-muted-foreground">{t(`basis${i}_description`)}</p>
                  </div>
                ))}
              </div>
            </LegalSection>

            {/* Data Retention */}
            <LegalSection id="data-retention" title={t('retentionTitle')} description={t('retentionDescription')}>
              <ul className="list-disc space-y-2 pl-5">
                <li>{t('retentionPoint1')}</li>
                <li>{t('retentionPoint2')}</li>
                <li>{t('retentionPoint3')}</li>
              </ul>
            </LegalSection>

            {/* User Rights */}
            <LegalSection id="user-rights" title={t('rightsTitle')} description={t('rightsDescription')}>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="rounded-lg border border-border bg-card p-4">
                    <h4 className="text-sm font-bold text-foreground">{t(`right${i}_title`)}</h4>
                    <p className="mt-1 text-xs text-muted-foreground">{t(`right${i}_description`)}</p>
                  </div>
                ))}
              </div>
              <p className="mt-4">
                <Link href="/legal/gdpr" className="text-sm font-medium text-stamp hover:underline">
                  {t('gdprLink')}
                </Link>
              </p>
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
