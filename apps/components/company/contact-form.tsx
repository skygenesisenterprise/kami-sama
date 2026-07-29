'use client'

import * as React from 'react'
import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Send } from 'lucide-react'

const SUBJECTS = [
  'general',
  'business',
  'partnership',
  'press',
  'support',
  'other',
] as const

type Subject = (typeof SUBJECTS)[number]

interface ContactFormData {
  name: string
  email: string
  organization: string
  subject: Subject
  message: string
}

export function ContactForm() {
  const t = useTranslations('Public.company.contact')
  const [formData, setFormData] = React.useState<ContactFormData>({
    name: '',
    email: '',
    organization: '',
    subject: 'general',
    message: '',
  })
  const [submitted, setSubmitted] = React.useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
  }

  const update = (field: keyof ContactFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  if (submitted) {
    return (
      <div className="rounded-xl border border-border bg-card p-8 text-center">
        <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-stamp/10 text-stamp">
          <Send className="size-6" />
        </div>
        <h3 className="font-display text-lg font-bold text-foreground">
          {t('successTitle')}
        </h3>
        <p className="mt-2 text-sm text-muted-foreground">
          {t('successMessage')}
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">{t('formName')}</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => update('name', e.target.value)}
            required
            className="bg-white/5"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">{t('formEmail')}</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => update('email', e.target.value)}
            required
            className="bg-white/5"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="organization">{t('formOrganization')}</Label>
        <Input
          id="organization"
          value={formData.organization}
          onChange={(e) => update('organization', e.target.value)}
          className="bg-white/5"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="subject">{t('formSubject')}</Label>
        <select
          id="subject"
          value={formData.subject}
          onChange={(e) => update('subject', e.target.value as Subject)}
          className="flex h-10 w-full rounded-md border border-input bg-white/5 px-3 py-2 text-sm text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {SUBJECTS.map((s) => (
            <option key={s} value={s}>
              {t(`subject_${s}`)}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="message">{t('formMessage')}</Label>
        <Textarea
          id="message"
          value={formData.message}
          onChange={(e) => update('message', e.target.value)}
          required
          rows={6}
          className="bg-white/5 resize-none"
        />
      </div>

      <Button type="submit" className="w-full bg-stamp text-white hover:bg-stamp-dim">
        <Send className="mr-2 size-4" />
        {t('formSubmit')}
      </Button>
    </form>
  )
}
