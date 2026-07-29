'use client'

import * as React from 'react'
import { useTranslations } from 'next-intl'
import { LegalHero } from '@/components/legal/legal-hero'
import { LegalSection } from '@/components/legal/legal-section'
import { LegalCard } from '@/components/legal/legal-card'
import { LegalTable } from '@/components/legal/legal-table'
import { LegalNavigation } from '@/components/legal/legal-navigation'
import { ContactBlock } from '@/components/legal/contact-block'
import { Shield, Eye, Minimize2, Lock, UserCheck, Pencil, Trash2, Download, Ban } from 'lucide-react'

const NAV_ITEMS = [
  { id: 'controller', label: 'Data Controller' },
  { id: 'principles', label: 'Privacy Principles' },
  { id: 'rights', label: 'User Rights' },
  { id: 'processing', label: 'Data Processing' },
  { id: 'contact', label: 'Contact' },
]

const DATA_COLUMNS = [
  { header: 'Data', key: 'data' },
  { header: 'Usage', key: 'usage' },
]

export default function GdprPage() {
  const t = useTranslations('Public.legal.gdpr')

  const dataRows = [
    { data: t('row1_data'), usage: t('row1_usage') },
    { data: t('row2_data'), usage: t('row2_usage') },
    { data: t('row3_data'), usage: t('row3_usage') },
    { data: t('row4_data'), usage: t('row4_usage') },
    { data: t('row5_data'), usage: t('row5_usage') },
  ]

  return (
    <main className="min-h-screen bg-background">
      <LegalHero
        title={t('heroTitle')}
        description={t('heroDescription')}
      />

      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="flex gap-8">
          <aside className="hidden w-56 shrink-0 lg:block">
            <LegalNavigation items={NAV_ITEMS} />
          </aside>

          <div className="min-w-0 flex-1">
            {/* Data Controller */}
            <LegalSection id="controller" title={t('controllerTitle')}>
              <div className="rounded-xl border border-border bg-card p-6">
                <h3 className="font-display text-lg font-bold text-foreground">Kami-Sama Studios</h3>
                <p className="mt-1 text-sm text-muted-foreground">{t('controllerSubtitle')}</p>
                <p className="mt-2 text-sm text-muted-foreground">{t('controllerDescription')}</p>
              </div>
            </LegalSection>

            {/* Privacy Principles */}
            <LegalSection id="principles" title={t('principlesTitle')} description={t('principlesDescription')}>
              <div className="grid gap-4 sm:grid-cols-2">
                <LegalCard
                  title={t('principle1_title')}
                  description={t('principle1_description')}
                  icon={<Eye className="size-4" />}
                />
                <LegalCard
                  title={t('principle2_title')}
                  description={t('principle2_description')}
                  icon={<Minimize2 className="size-4" />}
                />
                <LegalCard
                  title={t('principle3_title')}
                  description={t('principle3_description')}
                  icon={<UserCheck className="size-4" />}
                />
                <LegalCard
                  title={t('principle4_title')}
                  description={t('principle4_description')}
                  icon={<Lock className="size-4" />}
                />
              </div>
            </LegalSection>

            {/* User Rights */}
            <LegalSection id="rights" title={t('rightsTitle')} description={t('rightsDescription')}>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {[
                  { icon: <Eye className="size-4" />, key: 'access' },
                  { icon: <Pencil className="size-4" />, key: 'correction' },
                  { icon: <Trash2 className="size-4" />, key: 'deletion' },
                  { icon: <Download className="size-4" />, key: 'portability' },
                  { icon: <Ban className="size-4" />, key: 'object' },
                ].map((right) => (
                  <div key={right.key} className="flex items-start gap-3 rounded-lg border border-border bg-card p-4">
                    <div className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md bg-stamp/10 text-stamp">
                      {right.icon}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-foreground">{t(`right_${right.key}_title`)}</h4>
                      <p className="mt-0.5 text-xs text-muted-foreground">{t(`right_${right.key}_description`)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </LegalSection>

            {/* Data Processing */}
            <LegalSection id="processing" title={t('processingTitle')} description={t('processingDescription')}>
              <LegalTable
                columns={DATA_COLUMNS}
                rows={dataRows}
              />
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
