'use client'

import * as React from 'react'
import { use } from 'react'
import { useTranslations } from 'next-intl'
import { HelpCircle, MessageSquare, Mail, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function SupportPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = use(params)
  const t = useTranslations('Support')

  React.useEffect(() => {
    document.title = 'Kami-Sama: Support'
  }, [])

  return (
    <div className="min-h-screen bg-[#141414] text-white select-none">
      {/* Hero */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-b from-red-600/20 via-[#141414] to-[#141414]" />
        <div className="relative mx-auto max-w-4xl px-4 pt-20 pb-12 text-center md:px-8">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm">
            <HelpCircle className="size-10 text-red-500" />
          </div>
          <h1 className="font-display text-4xl font-bold tracking-tight md:text-5xl">
            {t('title')}
          </h1>
          <p className="mt-4 text-lg text-white/60">
            {t('subtitle')}
          </p>
        </div>
      </div>

      {/* Content */}
      <main className="mx-auto max-w-4xl px-4 pb-20 md:px-8">
        {/* FAQ Section */}
        <section className="mb-12">
          <h2 className="mb-6 text-2xl font-bold">{t('faqTitle')}</h2>
          <div className="space-y-4">
            {[
              { q: t('faq1Q'), a: t('faq1A') },
              { q: t('faq2Q'), a: t('faq2A') },
              { q: t('faq3Q'), a: t('faq3A') },
              { q: t('faq4Q'), a: t('faq4A') },
              { q: t('faq5Q'), a: t('faq5A') },
            ].map((item, i) => (
              <details
                key={i}
                className="group rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm"
              >
                <summary className="flex cursor-pointer items-center justify-between p-5 text-lg font-medium transition-colors hover:text-red-400">
                  {item.q}
                  <span className="ml-4 size-5 shrink-0 text-white/40 transition-transform group-open:rotate-180">
                    ▼
                  </span>
                </summary>
                <div className="border-t border-white/10 px-5 pb-5 pt-4 text-white/60">
                  {item.a}
                </div>
              </details>
            ))}
          </div>
        </section>

        {/* Contact Section */}
        <section className="mb-12">
          <h2 className="mb-6 text-2xl font-bold">{t('contactTitle')}</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <a
              href="mailto:support@kami-sama.com"
              className="group flex items-center gap-4 rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition-all hover:border-red-500/50 hover:bg-red-500/10"
            >
              <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-red-500/20 text-red-400 transition-colors group-hover:bg-red-500/30">
                <Mail className="size-6" />
              </div>
              <div>
                <p className="font-medium">{t('emailTitle')}</p>
                <p className="text-sm text-white/50">support@kami-sama.tv</p>
              </div>
            </a>
            <a
              href="https://support.skygenesisenterprise.com"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-4 rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition-all hover:border-red-500/50 hover:bg-red-500/10"
            >
              <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-red-500/20 text-red-400 transition-colors group-hover:bg-red-500/30">
                <ExternalLink className="size-6" />
              </div>
              <div>
                <p className="font-medium">{t('helpCenterTitle')}</p>
                <p className="text-sm text-white/50">{t('helpCenterDesc')}</p>
              </div>
            </a>
          </div>
        </section>

        {/* Community Section */}
        <section>
          <h2 className="mb-6 text-2xl font-bold">{t('communityTitle')}</h2>
          <div className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
            <div className="flex items-center gap-4">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-blue-500/20 text-blue-400">
                <MessageSquare className="size-6" />
              </div>
              <div className="flex-1">
                <p className="font-medium">{t('communityDesc')}</p>
                <p className="text-sm text-white/50">{t('communitySubdesc')}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="shrink-0 border-white/20 bg-white/5 text-white hover:bg-white/10"
                asChild
              >
                <a
                  href="https://discord.gg/skygenesisenterprise"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Discord
                </a>
              </Button>
            </div>
          </div>
        </section>

        {/* Footer Note */}
        <p className="mt-12 text-center text-sm text-white/30">
          {t('footerNote')}
        </p>
      </main>
    </div>
  )
}
