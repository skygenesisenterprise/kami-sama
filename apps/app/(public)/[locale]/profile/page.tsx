'use client'

import { useLocale, useTranslations } from 'next-intl'
import {
  Bell,
  Camera,
  Crown,
  Eye,
  Globe,
  Key,
  LogOut,
  Mail,
  Palette,
  Shield,
  Trash2,
  User,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { UserAvatar } from '@/components/kami/user-avatar'
import { useAuth } from '@/context/AuthContext'
import { getSelectedProfile } from '@/lib/profile-selection'

export default function ProfilePage() {
  const t = useTranslations('Public.profile')
  const { user } = useAuth()
  const selectedProfile = getSelectedProfile()
  const locale = useLocale()

  const displayName = selectedProfile?.displayName || user?.displayName || 'User'
  const avatarUrl = selectedProfile?.avatarUrl || user?.avatarUrl || ''
  const email = user?.email || 'user@example.com'

  return (
    <div className="min-h-screen bg-background">
      {/* ── Profile Header ────────────────────────────────────────── */}
      <div className="relative overflow-hidden border-b border-border/40">
        {/* Banner */}
        <div className="absolute inset-0 bg-linear-to-br from-primary/20 via-primary/5 to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(244,117,33,0.15),transparent_50%)]" />

        <div className="relative mx-auto max-w-5xl px-4 py-10 md:px-8">
          <div className="flex flex-col items-center gap-6 sm:flex-row">
            {/* Avatar */}
            <div className="relative group">
              <div className="size-24 overflow-hidden rounded-2xl border-2 border-border/60 bg-card ring-4 ring-background sm:size-28">
                <UserAvatar user={{ id: user?.id ?? '', username: displayName, displayName, avatar: avatarUrl }} className="size-full rounded-none" />
              </div>
              <button
                type="button"
                className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/50 opacity-0 transition-opacity group-hover:opacity-100"
                aria-label={t('changeAvatar')}
              >
                <Camera className="size-6 text-white" />
              </button>
            </div>

            {/* Info */}
            <div className="flex-1 text-center sm:text-left">
              <div className="flex flex-col items-center gap-2 sm:flex-row">
                <h1 className="font-display text-2xl font-bold">{displayName}</h1>
                <Badge variant="secondary" className="text-xs">
                  <Crown className="mr-1 size-3 text-gold" />
                  {t('premium')}
                </Badge>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">@{user?.id?.slice(0, 8) || 'user'}</p>
              <div className="mt-3 flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground sm:justify-start">
                <span className="flex items-center gap-1">
                  <Globe className="size-3.5" />
                  {t('joined', { date: 'janv. 2024' })}
                </span>
                <span>{t('watched', { count: '42' })}</span>
                <span>{t('reviews', { count: '128' })}</span>
                <span>{t('follows', { count: '1.2k' })}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Settings Tabs ─────────────────────────────────────────── */}
      <div className="mx-auto max-w-5xl px-4 py-8 md:px-8">
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="mb-8 flex w-full justify-start gap-1 bg-transparent p-0">
            <TabsTrigger
              value="profile"
              className="gap-2 rounded-lg px-4 py-2 text-sm font-medium data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
            >
              <User className="size-4" />
              <span className="hidden sm:inline">{t('tabProfile')}</span>
            </TabsTrigger>
            <TabsTrigger
              value="account"
              className="gap-2 rounded-lg px-4 py-2 text-sm font-medium data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
            >
              <Key className="size-4" />
              <span className="hidden sm:inline">{t('tabAccount')}</span>
            </TabsTrigger>
            <TabsTrigger
              value="notifications"
              className="gap-2 rounded-lg px-4 py-2 text-sm font-medium data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
            >
              <Bell className="size-4" />
              <span className="hidden sm:inline">{t('tabNotifications')}</span>
            </TabsTrigger>
          </TabsList>

          {/* ── Profile Tab ──────────────────────────────────────────── */}
          <TabsContent value="profile">
            <div className="space-y-8">
              {/* Personal Info */}
              <Section
                title={t('personalInfo.title')}
                description={t('personalInfo.description')}
              >
                <div className="grid gap-6 sm:grid-cols-2">
                  <Field label={t('personalInfo.displayName')}>
                    <Input defaultValue={displayName} />
                  </Field>
                  <Field label={t('personalInfo.username')}>
                    <Input defaultValue={user?.id?.slice(0, 8) || ''} />
                  </Field>
                  <Field label={t('personalInfo.email')} className="sm:col-span-2">
                    <Input type="email" defaultValue={email} />
                  </Field>
                  <Field label={t('personalInfo.bio')} className="sm:col-span-2">
                    <Textarea
                      defaultValue=""
                      placeholder="Anime enthusiast..."
                      rows={3}
                    />
                  </Field>
                </div>
                <div className="mt-6 flex justify-end">
                  <Button>{t('personalInfo.save')}</Button>
                </div>
              </Section>

              {/* Preferences */}
              <Section
                title={t('preferences.title')}
                description={t('preferences.description')}
              >
                <div className="space-y-4">
                  <Row
                    icon={<Palette className="size-4" />}
                    label={t('preferences.theme')}
                    description={t('preferences.themeDescription')}
                  >
                    <select className="rounded-md border border-border bg-transparent px-3 py-1.5 text-sm">
                      <option>{t('preferences.themeDark')}</option>
                      <option>{t('preferences.themeLight')}</option>
                      <option>{t('preferences.themeSystem')}</option>
                    </select>
                  </Row>
                  <Row
                    icon={<Globe className="size-4" />}
                    label={t('preferences.language')}
                    description={t('preferences.languageDescription')}
                  >
                    <select className="rounded-md border border-border bg-transparent px-3 py-1.5 text-sm">
                      <option>Français</option>
                      <option>English</option>
                      <option>日本語</option>
                    </select>
                  </Row>
                  <Row
                    icon={<Eye className="size-4" />}
                    label={t('preferences.matureContent')}
                    description={t('preferences.matureContentDescription')}
                  >
                    <Switch defaultChecked />
                  </Row>
                </div>
              </Section>
            </div>
          </TabsContent>

          {/* ── Account Tab ──────────────────────────────────────────── */}
          <TabsContent value="account">
            <div className="space-y-8">
              {/* Security */}
              <Section
                title={t('security.title')}
                description={t('security.description')}
              >
                <div className="space-y-6">
                  <Field label={t('security.currentPassword')}>
                    <div className="relative">
                      <Input type="password" placeholder={t('security.currentPasswordPlaceholder')} />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        <Eye className="size-4" />
                      </button>
                    </div>
                  </Field>
                  <div className="grid gap-6 sm:grid-cols-2">
                    <Field label={t('security.newPassword')}>
                      <Input type="password" placeholder={t('security.newPasswordPlaceholder')} />
                    </Field>
                    <Field label={t('security.confirmPassword')}>
                      <Input type="password" placeholder={t('security.confirmPasswordPlaceholder')} />
                    </Field>
                  </div>
                  <div className="flex justify-end">
                    <Button variant="outline">{t('security.updatePassword')}</Button>
                  </div>
                </div>
              </Section>

              {/* Sessions */}
              <Section
                title={t('sessions.title')}
                description={t('sessions.description')}
              >
                <div className="space-y-3">
                  <SessionRow
                    device="Chrome on macOS"
                    location="Paris, France"
                    ip="192.168.1.xxx"
                    active
                    activeLabel={t('sessions.active')}
                    revokeLabel={t('sessions.revoke')}
                  />
                  <SessionRow
                    device="Safari on iPhone"
                    location="Paris, France"
                    ip="192.168.1.xxx"
                    activeLabel={t('sessions.active')}
                    revokeLabel={t('sessions.revoke')}
                  />
                </div>
              </Section>

              {/* Danger Zone */}
              <Section
                title={t('dangerZone.title')}
                description={t('dangerZone.description')}
                danger
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-medium">{t('dangerZone.signOutAll')}</p>
                    <p className="text-xs text-muted-foreground">
                      {t('dangerZone.signOutAllDescription')}
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    <LogOut className="mr-2 size-4" />
                    {t('dangerZone.signOutAllButton')}
                  </Button>
                </div>
                <Separator className="my-4" />
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-medium">{t('dangerZone.deleteAccount')}</p>
                    <p className="text-xs text-muted-foreground">
                      {t('dangerZone.deleteAccountDescription')}
                    </p>
                  </div>
                  <Button variant="destructive" size="sm">
                    <Trash2 className="mr-2 size-4" />
                    {t('dangerZone.deleteAccountButton')}
                  </Button>
                </div>
              </Section>
            </div>
          </TabsContent>

          {/* ── Notifications Tab ────────────────────────────────────── */}
          <TabsContent value="notifications">
            <div className="space-y-8">
              <Section
                title={t('emailNotifications.title')}
                description={t('emailNotifications.description')}
              >
                <div className="space-y-4">
                  <Row
                    icon={<Bell className="size-4" />}
                    label={t('emailNotifications.newEpisodes')}
                    description={t('emailNotifications.newEpisodesDescription')}
                  >
                    <Switch defaultChecked />
                  </Row>
                  <Row
                    icon={<Mail className="size-4" />}
                    label={t('emailNotifications.weeklyDigest')}
                    description={t('emailNotifications.weeklyDigestDescription')}
                  >
                    <Switch defaultChecked />
                  </Row>
                  <Row
                    icon={<Shield className="size-4" />}
                    label={t('emailNotifications.securityAlerts')}
                    description={t('emailNotifications.securityAlertsDescription')}
                  >
                    <Switch defaultChecked />
                  </Row>
                  <Row
                    icon={<Crown className="size-4" />}
                    label={t('emailNotifications.promotions')}
                    description={t('emailNotifications.promotionsDescription')}
                  >
                    <Switch />
                  </Row>
                </div>
              </Section>

              <Section
                title={t('pushNotifications.title')}
                description={t('pushNotifications.description')}
              >
                <div className="space-y-4">
                  <Row
                    icon={<Bell className="size-4" />}
                    label={t('pushNotifications.episodeReleases')}
                    description={t('pushNotifications.episodeReleasesDescription')}
                  >
                    <Switch defaultChecked />
                  </Row>
                  <Row
                    icon={<Bell className="size-4" />}
                    label={t('pushNotifications.communityActivity')}
                    description={t('pushNotifications.communityActivityDescription')}
                  >
                    <Switch />
                  </Row>
                </div>
              </Section>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

/* ── Layout Helpers ──────────────────────────────────────────────────── */

function Section({
  title,
  description,
  children,
  danger,
}: {
  title: string
  description: string
  children: React.ReactNode
  danger?: boolean
}) {
  return (
    <div
      className={`rounded-xl border p-6 ${
        danger
          ? 'border-destructive/20 bg-destructive/5'
          : 'border-border/40 bg-card/50'
      }`}
    >
      <div className="mb-4">
        <h3 className={`text-sm font-semibold ${danger ? 'text-destructive' : ''}`}>
          {title}
        </h3>
        <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
      </div>
      {children}
    </div>
  )
}

function Field({
  label,
  children,
  className,
}: {
  label: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={className}>
      <Label className="mb-1.5 block text-xs font-medium text-muted-foreground">
        {label}
      </Label>
      {children}
    </div>
  )
}

function Row({
  icon,
  label,
  description,
  children,
}: {
  icon: React.ReactNode
  label: string
  description: string
  children: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border border-border/40 bg-card/30 px-4 py-3">
      <div className="flex items-center gap-3">
        <span className="text-muted-foreground">{icon}</span>
        <div>
          <p className="text-sm font-medium">{label}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
      {children}
    </div>
  )
}

function SessionRow({
  device,
  location,
  ip,
  active,
  activeLabel,
  revokeLabel,
}: {
  device: string
  location: string
  ip: string
  active?: boolean
  activeLabel: string
  revokeLabel: string
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border border-border/40 bg-card/30 px-4 py-3">
      <div>
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium">{device}</p>
          {active && (
            <Badge variant="secondary" className="bg-green-500/10 text-green-500 text-[10px]">
              {activeLabel}
            </Badge>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          {location} · {ip}
        </p>
      </div>
      {!active && (
        <Button variant="ghost" size="sm" className="text-xs text-muted-foreground">
          {revokeLabel}
        </Button>
      )}
    </div>
  )
}
