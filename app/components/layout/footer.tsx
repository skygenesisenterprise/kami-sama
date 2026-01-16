import Link from "next/link"

const footerLinks = {
  navigation: [
    { name: "Accueil", href: "/" },
    { name: "Catalogue", href: "/catalogue" },
    { name: "Nouveautés", href: "/catalogue?sort=new" },
    { name: "Populaires", href: "/catalogue?sort=popular" },
  ],
  genres: [
    { name: "Action", href: "/catalogue?genre=action" },
    { name: "Romance", href: "/catalogue?genre=romance" },
    { name: "Comédie", href: "/catalogue?genre=comedie" },
    { name: "Fantasy", href: "/catalogue?genre=fantasy" },
  ],
  legal: [
    { name: "Conditions d'utilisation", href: "/terms" },
    { name: "Politique de confidentialité", href: "/privacy" },
    { name: "Contact", href: "/contact" },
  ],
}

export function Footer() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                <span className="text-lg font-bold text-primary-foreground">神</span>
              </div>
              <span className="text-xl font-bold tracking-tight">Kami-Sama</span>
            </Link>
            <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
              Votre plateforme de streaming d&apos;animation japonaise. Des milliers d&apos;animes disponibles en
              VOSTFR.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="text-sm font-semibold mb-4">Navigation</h3>
            <ul className="space-y-3">
              {footerLinks.navigation.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Genres */}
          <div>
            <h3 className="text-sm font-semibold mb-4">Genres</h3>
            <ul className="space-y-3">
              {footerLinks.genres.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-sm font-semibold mb-4">Légal</h3>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border">
          <p className="text-center text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Kami-Sama. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  )
}
