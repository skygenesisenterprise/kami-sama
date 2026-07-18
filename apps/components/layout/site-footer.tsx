import Link from 'next/link'
import { Globe, MessageSquare, Rss, ArrowRight } from 'lucide-react'
import { Logo } from '@/components/kami/logo'
import { Button } from '@/components/ui/button'

const NAV_COLUMNS = [
  {
    heading: 'Browse',
    links: [
      { label: 'Home', href: '/' },
      { label: 'Catalog', href: '/catalog' },
      { label: 'Simulcasts', href: '/catalog?filter=simulcast' },
      { label: 'New Releases', href: '/catalog?sort=new' },
      { label: 'Movies', href: '/catalog?type=movie' },
    ],
  },
  {
    heading: 'Community',
    links: [
      { label: 'Forums', href: '/community' },
      { label: 'Reviews', href: '/community/reviews' },
      { label: 'Watch Lists', href: '/community/lists' },
      { label: 'Events', href: '/community/events' },
    ],
  },
  {
    heading: 'Account',
    links: [
      { label: 'My Library', href: '/library' },
      { label: 'Watch History', href: '/library/history' },
      { label: 'Favorites', href: '/library/favorites' },
      { label: 'Settings', href: '/settings' },
    ],
  },
  {
    heading: 'About',
    links: [
      { label: 'About Kami-Sama', href: '/about' },
      { label: 'API Docs', href: '/docs/api' },
      { label: 'Open Source', href: 'https://github.com/kami-sama' },
      { label: 'Contribute', href: '/contribute' },
      { label: 'Changelog', href: '/changelog' },
    ],
  },
]

const SOCIALS = [
  { label: 'GitHub', href: 'https://github.com/kami-sama', icon: Globe },
  { label: 'Discord', href: 'https://discord.gg/kami-sama', icon: MessageSquare },
  { label: 'RSS', href: '/rss', icon: Rss },
]

export function SiteFooter() {
  return (
    <footer className="border-t border-border/40 bg-void">
      {/* ── Main Footer ──────────────────────────────────────────────── */}
      <div className="mx-auto max-w-7xl px-4 py-12 md:px-8">
        <div className="grid gap-10 md:grid-cols-[1.4fr_repeat(4,1fr)]">
          {/* Brand column */}
          <div className="max-w-xs">
            <Logo />
            <p className="mt-4 text-sm leading-relaxed text-ink-soft">
              A next-generation, community-driven and open-source anime and Japanese
              culture platform. Discover, track, and watch — together.
            </p>

            {/* Newsletter */}
            <div className="mt-6">
              <p className="mb-2 text-xs font-medium uppercase tracking-wider text-ink-faint">
                Stay updated
              </p>
              <form className="flex gap-2" action="#" method="post">
                <input
                  type="email"
                  placeholder="your@email.com"
                  className="flex-1 rounded-md border border-line-strong bg-void-raised px-3 py-2 text-sm text-ink placeholder:text-ink-wash transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/40"
                />
                <Button size="icon" className="shrink-0 size-9 rounded-md" aria-label="Subscribe">
                  <ArrowRight className="size-4" />
                </Button>
              </form>
            </div>

            {/* Socials */}
            <div className="mt-6 flex gap-2">
              {SOCIALS.map((social) => {
                const Icon = social.icon
                return (
                  <Link
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className="flex size-9 items-center justify-center rounded-md border border-line-strong bg-void-raised text-ink-faint transition-all hover:border-primary/40 hover:bg-primary/10 hover:text-primary"
                  >
                    <Icon className="size-4" />
                  </Link>
                )
              })}
            </div>
          </div>

          {/* Navigation columns */}
          {NAV_COLUMNS.map((col) => (
            <div key={col.heading}>
              <h3 className="font-mono text-xs font-medium uppercase tracking-wider text-ink-faint">
                {col.heading}
              </h3>
              <ul className="mt-4 flex flex-col gap-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-ink-soft transition-colors hover:text-ink"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* ── Bottom Bar ───────────────────────────────────────────────── */}
      <div className="border-t border-border/40">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-5 text-xs text-ink-faint md:flex-row md:px-8">
          <p>&copy; {new Date().getFullYear()} Kami-Sama. Built by the community.</p>
          <div className="flex gap-4">
            <Link href="/legal/privacy" className="transition-colors hover:text-ink-soft">
              Privacy Policy
            </Link>
            <Link href="/legal/terms" className="transition-colors hover:text-ink-soft">
              Terms of Service
            </Link>
            <Link href="/legal/cookies" className="transition-colors hover:text-ink-soft">
              Cookie Policy
            </Link>
          </div>
          <p>Data provided by api.kami-sama.fr</p>
        </div>
      </div>
    </footer>
  )
}
