'use client'

import * as React from 'react'
import { useTranslations } from 'next-intl'
import { LegalHero } from '@/components/legal/legal-hero'
import { LegalSection } from '@/components/legal/legal-section'
import { LegalNavigation } from '@/components/legal/legal-navigation'
import { ContactBlock } from '@/components/legal/contact-block'

const NAV_ITEMS = [
  { id: 'acceptance', label: 'Acceptance' },
  { id: 'accounts', label: 'User Accounts' },
  { id: 'usage', label: 'Platform Usage' },
  { id: 'content', label: 'Content Rights' },
  { id: 'ugc', label: 'User Generated Content' },
  { id: 'availability', label: 'Service Availability' },
  { id: 'suspension', label: 'Account Suspension' },
  { id: 'liability', label: 'Liability' },
]

export default function TermsPage() {
  const t = useTranslations('Public.legal.terms')

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
            {/* Acceptance */}
            <LegalSection id="acceptance" title={t('acceptanceTitle')}>
              <p>{t('acceptanceText1')}</p>
              <p>{t('acceptanceText2')}</p>
            </LegalSection>

            {/* User Accounts */}
            <LegalSection id="accounts" title={t('accountsTitle')}>
              <ul className="list-disc space-y-2 pl-5">
                <li>{t('accountsPoint1')}</li>
                <li>{t('accountsPoint2')}</li>
                <li>{t('accountsPoint3')}</li>
              </ul>
            </LegalSection>

            {/* Platform Usage */}
            <LegalSection id="usage" title={t('usageTitle')}>
              <p>{t('usageDescription')}</p>
              <ul className="mt-2 list-disc space-y-2 pl-5">
                <li>{t('usageProhibited1')}</li>
                <li>{t('usageProhibited2')}</li>
                <li>{t('usageProhibited3')}</li>
                <li>{t('usageProhibited4')}</li>
                <li>{t('usageProhibited5')}</li>
              </ul>
            </LegalSection>

            {/* Content Rights */}
            <LegalSection id="content" title={t('contentTitle')}>
              <p>{t('contentText1')}</p>
              <p>{t('contentText2')}</p>
              <p>{t('contentText3')}</p>
            </LegalSection>

            {/* User Generated Content */}
            <LegalSection id="ugc" title={t('ugcTitle')}>
              <p>{t('ugcDescription')}</p>
              <ul className="mt-2 list-disc space-y-2 pl-5">
                <li>{t('ugcPoint1')}</li>
                <li>{t('ugcPoint2')}</li>
                <li>{t('ugcPoint3')}</li>
              </ul>
            </LegalSection>

            {/* Service Availability */}
            <LegalSection id="availability" title={t('availabilityTitle')}>
              <p>{t('availabilityText1')}</p>
              <p>{t('availabilityText2')}</p>
            </LegalSection>

            {/* Account Suspension */}
            <LegalSection id="suspension" title={t('suspensionTitle')}>
              <p>{t('suspensionDescription')}</p>
              <ul className="mt-2 list-disc space-y-2 pl-5">
                <li>{t('suspensionReason1')}</li>
                <li>{t('suspensionReason2')}</li>
                <li>{t('suspensionReason3')}</li>
              </ul>
            </LegalSection>

            {/* Liability */}
            <LegalSection id="liability" title={t('liabilityTitle')}>
              <p>{t('liabilityText1')}</p>
              <p>{t('liabilityText2')}</p>
            </LegalSection>

            {/* Contact */}
            <section className="px-4 py-12 md:px-8 md:py-16">
              <div className="mx-auto max-w-4xl">
                <ContactBlock
                  title={t('contactTitle')}
                  email="legal@kami-sama.tv"
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
