'use client'

import * as React from 'react'
import { useTranslations } from 'next-intl'
import { LegalHero } from '@/components/legal/legal-hero'
import { LegalSection } from '@/components/legal/legal-section'
import { LegalCard } from '@/components/legal/legal-card'
import { LegalNavigation } from '@/components/legal/legal-navigation'
import { ContactBlock } from '@/components/legal/contact-block'
import { Shield, Lock, Server, Key, Eye, AlertTriangle } from 'lucide-react'

const NAV_ITEMS = [
  { id: 'platform', label: 'Platform Security' },
  { id: 'account', label: 'Account Security' },
  { id: 'disclosure', label: 'Responsible Disclosure' },
]

export default function SecurityPage() {
  const t = useTranslations('Public.legal.security')

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
            {/* Platform Security */}
            <LegalSection id="platform" title={t('platformTitle')} description={t('platformDescription')}>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {[
                  { icon: <Lock className="size-4" />, key: 'https' },
                  { icon: <Key className="size-4" />, key: 'encryption' },
                  { icon: <Server className="size-4" />, key: 'isolation' },
                  { icon: <Eye className="size-4" />, key: 'monitoring' },
                  { icon: <Shield className="size-4" />, key: 'backups' },
                  { icon: <Lock className="size-4" />, key: 'access' },
                ].map((item) => (
                  <LegalCard
                    key={item.key}
                    title={t(`platform_${item.key}_title`)}
                    description={t(`platform_${item.key}_description`)}
                    icon={item.icon}
                  />
                ))}
              </div>
            </LegalSection>

            {/* Account Security */}
            <LegalSection id="account" title={t('accountTitle')} description={t('accountDescription')}>
              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  { icon: <Shield className="size-4" />, key: 'auth' },
                  { icon: <Key className="size-4" />, key: 'oauth' },
                  { icon: <Eye className="size-4" />, key: 'sessions' },
                  { icon: <AlertTriangle className="size-4" />, key: 'abuse' },
                ].map((item) => (
                  <LegalCard
                    key={item.key}
                    title={t(`account_${item.key}_title`)}
                    description={t(`account_${item.key}_description`)}
                    icon={item.icon}
                  />
                ))}
              </div>
            </LegalSection>

            {/* Responsible Disclosure */}
            <LegalSection id="disclosure" title={t('disclosureTitle')} description={t('disclosureDescription')}>
              <div className="space-y-4">
                <div className="rounded-xl border border-border bg-card p-6">
                  <h3 className="font-display text-sm font-bold text-foreground">{t('disclosurePolicy_title')}</h3>
                  <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-muted-foreground">
                    <li>{t('disclosurePolicy_point1')}</li>
                    <li>{t('disclosurePolicy_point2')}</li>
                    <li>{t('disclosurePolicy_point3')}</li>
                  </ul>
                </div>
                <ContactBlock
                  title={t('disclosureContact_title')}
                  email="security@kami-sama.tv"
                  description={t('disclosureContact_description')}
                />
              </div>
            </LegalSection>
          </div>
        </div>
      </div>
    </main>
  )
}
