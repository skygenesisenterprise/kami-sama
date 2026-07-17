import Link from 'next/link'
import { Code2 } from 'lucide-react'
import { Logo } from '@/components/kami/logo'

const COLUMNS = [
  {
    heading: 'Explore',
    links: [
      { label: 'Home', href: '/' },
      { label: 'Browse', href: '/browse' },
      { label: 'Discover', href: '/discover' },
      { label: 'Community', href: '/community' },
    ],
  },
  {
    heading: 'Account',
    links: [
      { label: 'My Library', href: '/library' },
      { label: 'Watch History', href: '/library' },
      { label: 'Favorites', href: '/library' },
      { label: 'Settings', href: '/library' },
    ],
  },
  {
    heading: 'Project',
    links: [
      { label: 'About', href: '/' },
      { label: 'Open Source', href: '/' },
      { label: 'API', href: '/' },
      { label: 'Contribute', href: '/' },
    ],
  },
]

export function SiteFooter() {
  return (
    <footer className="mt-8 border-t border-border/60 bg-card/40">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 md:grid-cols-[1.5fr_repeat(3,1fr)] md:px-8">
        <div className="max-w-xs">
          <Logo />
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            A next-generation, community-driven and open-source anime and Japanese culture
            platform. Discover, track, and watch — together.
          </p>
          <Link
            href="/"
            className="mt-4 inline-flex items-center gap-2 rounded-lg border border-border/60 px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <Code2 className="size-4" />
            Star on GitHub
          </Link>
        </div>

        {COLUMNS.map((col) => (
          <div key={col.heading}>
            <h3 className="text-sm font-semibold">{col.heading}</h3>
            <ul className="mt-3 flex flex-col gap-2">
              {col.links.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-border/60">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-5 text-xs text-muted-foreground md:flex-row md:px-8">
          <p>© {new Date().getFullYear()} Kami-Sama. Built by the community.</p>
          <p>Data provided by api.kami-sama.fr · Not affiliated with any studio.</p>
        </div>
      </div>
    </footer>
  )
}
