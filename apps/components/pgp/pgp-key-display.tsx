'use client'

import * as React from 'react'
import { useTranslations } from 'next-intl'
import { Check, Copy, Download, Eye, EyeOff, Fingerprint, KeyRound, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface PgpKeyMetadata {
  keyId: string
  fingerprint: string
  algorithm: string
  createdDate: string
  uid: string
  sha256: string
}

interface PgpKeyDisplayProps {
  armoredKey: string
  metadata: PgpKeyMetadata
}

function formatFingerprint(fingerprint: string): string {
  return fingerprint.replace(/(.{4})/g, '$1 ').trim()
}

export function PgpKeyDisplay({ armoredKey, metadata }: PgpKeyDisplayProps) {
  const t = useTranslations('Public.pgp')
  const [expanded, setExpanded] = React.useState(false)
  const [copied, setCopied] = React.useState<'key' | 'fingerprint' | 'sha' | null>(null)

  const lines = React.useMemo(() => armoredKey.split('\n'), [armoredKey])
  const visibleLines = expanded
    ? lines
    : [...lines.slice(0, 4), '…', lines[lines.length - 1]]

  async function handleCopy(value: string, target: 'key' | 'fingerprint' | 'sha') {
    try {
      await navigator.clipboard.writeText(value)
    } catch {
      const textarea = document.createElement('textarea')
      textarea.value = value
      textarea.setAttribute('readonly', '')
      textarea.style.position = 'fixed'
      textarea.style.opacity = '0'
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
    }
    setCopied(target)
    window.setTimeout(() => setCopied(null), 2000)
  }

  return (
    <div className="space-y-6">
      {/* ── Armored key block ─────────────────────────────────────── */}
      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-stamp/10 text-stamp">
              <KeyRound className="size-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">{metadata.uid}</p>
              <p className="text-xs text-muted-foreground">
                {metadata.algorithm} · {metadata.keyId} · {metadata.createdDate}
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm" asChild>
            <a href="/pgp/kami-sama.asc" download>
              <Download className="size-4" />
              {t('downloadKey')}
            </a>
          </Button>
        </div>

        <pre className="overflow-x-auto bg-background/60 px-5 py-4 font-mono text-xs leading-relaxed text-muted-foreground">
          {visibleLines.join('\n')}
        </pre>

        <div className="flex items-center justify-between gap-3 border-t border-border px-5 py-3">
          <button
            type="button"
            onClick={() => setExpanded((value) => !value)}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            {expanded ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            {expanded ? t('hideFullKey') : t('showFullKey')}
          </button>
          <Button variant="outline" size="sm" onClick={() => handleCopy(armoredKey, 'key')}>
            {copied === 'key' ? <Check className="size-4" /> : <Copy className="size-4" />}
            {copied === 'key' ? t('copied') : t('copyKey')}
          </Button>
        </div>
      </div>

      {/* ── Fingerprint ───────────────────────────────────────────── */}
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-stamp/10 text-stamp">
              <Fingerprint className="size-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">{t('fingerprintTitle')}</h3>
              <p className="mt-1 max-w-xl text-xs text-muted-foreground">{t('fingerprintDescription')}</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={() => handleCopy(metadata.fingerprint, 'fingerprint')}>
            {copied === 'fingerprint' ? <Check className="size-4" /> : <Copy className="size-4" />}
            {copied === 'fingerprint' ? t('copied') : t('copyFingerprint')}
          </Button>
        </div>
        <p className={cn(
          'mt-4 break-all font-mono text-sm font-semibold tracking-wide text-foreground',
          copied === 'fingerprint' && 'text-emerald-500',
        )}>
          {formatFingerprint(metadata.fingerprint)}
        </p>
      </div>

      {/* ── SHA-256 of the key file ───────────────────────────────── */}
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-stamp/10 text-stamp">
              <ShieldCheck className="size-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">{t('shaTitle')}</h3>
              <p className="mt-1 max-w-xl text-xs text-muted-foreground">{t('shaDescription')}</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={() => handleCopy(metadata.sha256, 'sha')}>
            {copied === 'sha' ? <Check className="size-4" /> : <Copy className="size-4" />}
            {copied === 'sha' ? t('copied') : t('copySha')}
          </Button>
        </div>
        <p className={cn(
          'mt-4 break-all font-mono text-xs text-muted-foreground',
          copied === 'sha' && 'text-emerald-500',
        )}>
          {metadata.sha256}
        </p>
      </div>
    </div>
  )
}
