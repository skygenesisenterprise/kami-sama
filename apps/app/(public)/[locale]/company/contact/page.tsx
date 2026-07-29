'use client'

import * as React from 'react'
import { useTranslations } from 'next-intl'
import { HeroSection } from '@/components/company/hero-section'
import { CompanySection } from '@/components/company/company-section'
import { ContactForm } from '@/components/company/contact-form'
import { Mail } from 'lucide-react'

export default function ContactPage() {
  const t = useTranslations('Public.company.contact')

  const contacts = [
    { key: 'general', email: 'contact@kami-sama.tv' },
    { key: 'partnership', email: 'partners@kami-sama.tv' },
    { key: 'press', email: 'press@kami-sama.tv' },
  ]

  return (
    <main className="min-h-screen bg-background">
      <HeroSection
        title={t('heroTitle')}
        description={t('heroDescription')}
      />

      <CompanySection
        title={t('formTitle')}
        description={t('formDescription')}
      >
        <div className="mx-auto max-w-2xl">
          <ContactForm />
        </div>
      </CompanySection>

      {/* ── Direct contacts ───────────────────────────────────── */}
      <section className="px-4 py-16 md:px-8 md:py-24">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-8 font-display text-xl font-bold text-foreground">
            {t('directContactsTitle')}
          </h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {contacts.map((c) => (
              <a
                key={c.key}
                href={`mailto:${c.email}`}
                className="group flex items-center gap-4 rounded-xl border border-border bg-card p-5 transition-all hover:border-stamp/30"
              >
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-stamp/10 text-stamp transition-colors group-hover:bg-stamp/20">
                  <Mail className="size-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {t(`contact_${c.key}`)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {c.email}
                  </p>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
