import * as React from 'react'
import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { ContactBlock } from '@/components/legal/contact-block'
import { LegalHero } from '@/components/legal/legal-hero'
import { LegalSection } from '@/components/legal/legal-section'
import { PgpKeyDisplay, type PgpKeyMetadata } from '@/components/pgp/pgp-key-display'

const KEY_FILENAME = 'kami-sama.asc'

const KEY_CANDIDATE_PATHS = [
  path.join(process.cwd(), 'app', 'public', 'pgp', KEY_FILENAME),
  path.join(process.cwd(), 'public', 'pgp', KEY_FILENAME),
]

const KEY_METADATA: PgpKeyMetadata = {
  keyId: '69E7E58A0736A1FD',
  fingerprint: 'CDE24B616B422CC4DB7138A969E7E58A0736A1FD',
  algorithm: 'Ed25519',
  createdDate: '31 Juillet 2026',
  uid: 'Kami-Sama Studios (Official security contact) <security@kami-sama.tv>',
  sha256: '',
}

function readPublicKeyFile(): string {
  for (const candidate of KEY_CANDIDATE_PATHS) {
    try {
      return readFileSync(candidate, 'utf8')
    } catch {
      // Try the next candidate path.
    }
  }
  throw new Error(`PGP public key file not found: ${KEY_FILENAME}`)
}

export const metadata: Metadata = {
  title: 'Kami-Sama — Clé PGP publique',
  description:
    'Vérifiez, copiez et téléchargez la clé PGP publique officielle de Kami-Sama Studios.',
}

export default async function PgpPage() {
  const t = await getTranslations('Public.pgp')
  const rawKey = readPublicKeyFile()
  const armoredKey = rawKey.trim()
  const sha256 = createHash('sha256').update(rawKey).digest('hex')

  return (
    <main className="min-h-screen bg-background">
      <LegalHero
        title={t('heroTitle')}
        description={t('heroDescription')}
        lastUpdated={t('lastUpdated')}
      />

      <div className="mx-auto max-w-7xl px-4 pb-16 md:px-8">
        <div className="flex gap-8">
          <div className="min-w-0 flex-1">
            {/* ── Public key ──────────────────────────────────────── */}
            <LegalSection id="key" title={t('keyTitle')} description={t('keyDescription')}>
              <PgpKeyDisplay armoredKey={armoredKey} metadata={{ ...KEY_METADATA, sha256 }} />
            </LegalSection>

            {/* ── Verification steps ──────────────────────────────── */}
            <LegalSection id="verify" title={t('verifyTitle')} description={t('verifyDescription')}>
              <div className="grid gap-3 sm:grid-cols-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="rounded-lg border border-border bg-card p-4">
                    <h4 className="text-sm font-bold text-foreground">{t(`verifyStep${i}_title`)}</h4>
                    <p className="mt-1 text-xs text-muted-foreground">{t(`verifyStep${i}_text`)}</p>
                  </div>
                ))}
              </div>

              <div className="rounded-xl border border-border bg-card p-5">
                <h4 className="text-sm font-bold text-foreground">{t('verifyCommandTitle')}</h4>
                <pre className="mt-3 overflow-x-auto rounded-lg bg-background/60 p-4 font-mono text-xs leading-relaxed text-muted-foreground">
                  {t('verifyCommands')}
                </pre>
              </div>

              <p className="text-xs text-muted-foreground">{t('verifyNote')}</p>
            </LegalSection>

            {/* ── Contact ─────────────────────────────────────────── */}
            <section className="px-4 py-12 md:px-8 md:py-16">
              <div className="mx-auto max-w-4xl">
                <ContactBlock
                  title={t('contactTitle')}
                  email="security@kami-sama.tv"
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
