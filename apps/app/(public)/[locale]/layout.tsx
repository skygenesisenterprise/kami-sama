import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { SiteHeader } from '@/components/layout/site-header'
import { Footer } from '@/components/layout/site-footer'

export default async function PublicLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode
  params: Promise<{ locale: string }>
}>) {
  const { locale } = await params
  const messages = await getMessages()

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <div className="relative flex min-h-screen flex-col">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
    </NextIntlClientProvider>
  )
}
