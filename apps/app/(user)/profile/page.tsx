'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Bell,
  Camera,
  CreditCard,
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
import { USERS } from '@/lib/mock-data'

export default function ProfilePage() {
  const user = USERS.me

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
                <UserAvatar user={user} className="size-full rounded-none" />
              </div>
              <button
                type="button"
                className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/50 opacity-0 transition-opacity group-hover:opacity-100"
                aria-label="Change avatar"
              >
                <Camera className="size-6 text-white" />
              </button>
            </div>

            {/* Info */}
            <div className="flex-1 text-center sm:text-left">
              <div className="flex flex-col items-center gap-2 sm:flex-row">
                <h1 className="font-display text-2xl font-bold">{user.displayName}</h1>
                <Badge variant="secondary" className="text-xs">
                  <Crown className="mr-1 size-3 text-gold" />
                  Premium
                </Badge>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">@{user.username}</p>
              <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
                Anime enthusiast. Currently binging everything from dark fantasy to slice-of-life.
              </p>
              <div className="mt-3 flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground sm:justify-start">
                <span className="flex items-center gap-1">
                  <Globe className="size-3.5" />
                  Joined Jan 2024
                </span>
                <span>42 Watched</span>
                <span>128 Reviews</span>
                <span>1.2k Follows</span>
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
              <span className="hidden sm:inline">Profile</span>
            </TabsTrigger>
            <TabsTrigger
              value="account"
              className="gap-2 rounded-lg px-4 py-2 text-sm font-medium data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
            >
              <Key className="size-4" />
              <span className="hidden sm:inline">Account</span>
            </TabsTrigger>
            <TabsTrigger
              value="notifications"
              className="gap-2 rounded-lg px-4 py-2 text-sm font-medium data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
            >
              <Bell className="size-4" />
              <span className="hidden sm:inline">Notifications</span>
            </TabsTrigger>
            <TabsTrigger
              value="subscription"
              className="gap-2 rounded-lg px-4 py-2 text-sm font-medium data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
            >
              <CreditCard className="size-4" />
              <span className="hidden sm:inline">Subscription</span>
            </TabsTrigger>
          </TabsList>

          {/* ── Profile Tab ──────────────────────────────────────────── */}
          <TabsContent value="profile">
            <div className="space-y-8">
              {/* Personal Info */}
              <Section
                title="Personal Information"
                description="Update your public profile details."
              >
                <div className="grid gap-6 sm:grid-cols-2">
                  <Field label="Display Name">
                    <Input defaultValue={user.displayName} />
                  </Field>
                  <Field label="Username">
                    <Input defaultValue={user.username} />
                  </Field>
                  <Field label="Email" className="sm:col-span-2">
                    <Input type="email" defaultValue="you@example.com" />
                  </Field>
                  <Field label="Bio" className="sm:col-span-2">
                    <Textarea
                      defaultValue="Anime enthusiast. Currently binging everything from dark fantasy to slice-of-life."
                      rows={3}
                    />
                  </Field>
                </div>
                <div className="mt-6 flex justify-end">
                  <Button>Save Changes</Button>
                </div>
              </Section>

              {/* Preferences */}
              <Section
                title="Preferences"
                description="Customize your viewing experience."
              >
                <div className="space-y-4">
                  <Row
                    icon={<Palette className="size-4" />}
                    label="Theme"
                    description="Choose your preferred color scheme"
                  >
                    <select className="rounded-md border border-border bg-transparent px-3 py-1.5 text-sm">
                      <option>Dark</option>
                      <option>Light</option>
                      <option>System</option>
                    </select>
                  </Row>
                  <Row
                    icon={<Globe className="size-4" />}
                    label="Language"
                    description="Set your preferred language"
                  >
                    <select className="rounded-md border border-border bg-transparent px-3 py-1.5 text-sm">
                      <option>English</option>
                      <option>Francais</option>
                      <option>Japanese</option>
                    </select>
                  </Row>
                  <Row
                    icon={<Eye className="size-4" />}
                    label="Mature Content"
                    description="Show content rated R and above"
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
                title="Security"
                description="Manage your password and security settings."
              >
                <div className="space-y-6">
                  <Field label="Current Password">
                    <div className="relative">
                      <Input type="password" placeholder="Enter current password" />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        <Eye className="size-4" />
                      </button>
                    </div>
                  </Field>
                  <div className="grid gap-6 sm:grid-cols-2">
                    <Field label="New Password">
                      <Input type="password" placeholder="Enter new password" />
                    </Field>
                    <Field label="Confirm Password">
                      <Input type="password" placeholder="Confirm new password" />
                    </Field>
                  </div>
                  <div className="flex justify-end">
                    <Button variant="outline">Update Password</Button>
                  </div>
                </div>
              </Section>

              {/* Sessions */}
              <Section
                title="Active Sessions"
                description="Manage your active login sessions."
              >
                <div className="space-y-3">
                  <SessionRow
                    device="Chrome on macOS"
                    location="Paris, France"
                    ip="192.168.1.xxx"
                    active
                  />
                  <SessionRow
                    device="Safari on iPhone"
                    location="Paris, France"
                    ip="192.168.1.xxx"
                  />
                </div>
              </Section>

              {/* Danger Zone */}
              <Section
                title="Danger Zone"
                description="Irreversible account actions."
                danger
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-medium">Sign out of all devices</p>
                    <p className="text-xs text-muted-foreground">
                      This will sign you out from all other active sessions.
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    <LogOut className="mr-2 size-4" />
                    Sign Out All
                  </Button>
                </div>
                <Separator className="my-4" />
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-medium">Delete Account</p>
                    <p className="text-xs text-muted-foreground">
                      Permanently delete your account and all associated data.
                    </p>
                  </div>
                  <Button variant="destructive" size="sm">
                    <Trash2 className="mr-2 size-4" />
                    Delete Account
                  </Button>
                </div>
              </Section>
            </div>
          </TabsContent>

          {/* ── Notifications Tab ────────────────────────────────────── */}
          <TabsContent value="notifications">
            <div className="space-y-8">
              <Section
                title="Email Notifications"
                description="Choose what emails you receive."
              >
                <div className="space-y-4">
                  <Row
                    icon={<Bell className="size-4" />}
                    label="New Episodes"
                    description="Get notified when shows in your library release new episodes"
                  >
                    <Switch defaultChecked />
                  </Row>
                  <Row
                    icon={<Mail className="size-4" />}
                    label="Weekly Digest"
                    description="A weekly summary of trending anime and recommendations"
                  >
                    <Switch defaultChecked />
                  </Row>
                  <Row
                    icon={<Shield className="size-4" />}
                    label="Security Alerts"
                    description="Important security updates about your account"
                  >
                    <Switch defaultChecked />
                  </Row>
                  <Row
                    icon={<Crown className="size-4" />}
                    label="Promotions"
                    description="Special offers and premium features"
                  >
                    <Switch />
                  </Row>
                </div>
              </Section>

              <Section
                title="Push Notifications"
                description="Control in-app notifications."
              >
                <div className="space-y-4">
                  <Row
                    icon={<Bell className="size-4" />}
                    label="Episode Releases"
                    description="Browser push when new episodes drop"
                  >
                    <Switch defaultChecked />
                  </Row>
                  <Row
                    icon={<Bell className="size-4" />}
                    label="Community Activity"
                    description="Replies, mentions, and follows"
                  >
                    <Switch />
                  </Row>
                </div>
              </Section>
            </div>
          </TabsContent>

          {/* ── Subscription Tab ─────────────────────────────────────── */}
          <TabsContent value="subscription">
            <div className="space-y-8">
              {/* Current Plan */}
              <Section
                title="Current Plan"
                description="Manage your subscription and billing."
              >
                <div className="rounded-xl border border-primary/20 bg-primary/5 p-6">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10">
                        <Crown className="size-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold">Premium Plan</h3>
                        <p className="text-sm text-muted-foreground">
                          Ad-free, all access, offline downloads
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">
                        €8.99<span className="text-sm font-normal text-muted-foreground">/mo</span>
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Renews on Aug 15, 2026
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <Button variant="outline" size="sm">
                      Change Plan
                    </Button>
                    <Button variant="ghost" size="sm" className="text-muted-foreground">
                      Cancel Subscription
                    </Button>
                  </div>
                </div>
              </Section>

              {/* Billing History */}
              <Section
                title="Billing History"
                description="Your recent transactions."
              >
                <div className="space-y-2">
                  <BillingRow date="Jul 15, 2026" amount="€8.99" status="Paid" />
                  <BillingRow date="Jun 15, 2026" amount="€8.99" status="Paid" />
                  <BillingRow date="May 15, 2026" amount="€8.99" status="Paid" />
                </div>
              </Section>

              {/* Payment Method */}
              <Section
                title="Payment Method"
                description="Update your payment details."
              >
                <div className="flex items-center gap-4 rounded-lg border border-border/40 bg-card/50 p-4">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-secondary">
                    <CreditCard className="size-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Visa ending in 4242</p>
                    <p className="text-xs text-muted-foreground">Expires 12/2027</p>
                  </div>
                  <Button variant="ghost" size="sm">
                    Update
                  </Button>
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
}: {
  device: string
  location: string
  ip: string
  active?: boolean
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border border-border/40 bg-card/30 px-4 py-3">
      <div>
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium">{device}</p>
          {active && (
            <Badge variant="secondary" className="bg-green-500/10 text-green-500 text-[10px]">
              Active
            </Badge>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          {location} · {ip}
        </p>
      </div>
      {!active && (
        <Button variant="ghost" size="sm" className="text-xs text-muted-foreground">
          Revoke
        </Button>
      )}
    </div>
  )
}

function BillingRow({
  date,
  amount,
  status,
}: {
  date: string
  amount: string
  status: string
}) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-border/40 bg-card/30 px-4 py-3">
      <div>
        <p className="text-sm font-medium">{date}</p>
        <p className="text-xs text-muted-foreground">Premium Plan</p>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium">{amount}</span>
        <Badge variant="secondary" className="bg-green-500/10 text-green-500 text-[10px]">
          {status}
        </Badge>
      </div>
    </div>
  )
}
