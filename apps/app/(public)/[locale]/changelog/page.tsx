'use client'

import * as React from 'react'
import { use } from 'react'
import { useTranslations } from 'next-intl'
import { Calendar, Tag, ArrowRight, Sparkles, Rocket, Bug, Shield, Star } from 'lucide-react'

interface ChangelogEntry {
  id: string
  version: string
  date: string
  type: 'feature' | 'fix' | 'improvement' | 'security' | 'breaking'
  title: string
  description: string
  details: string[]
}

const MOCK_CHANGELOG: ChangelogEntry[] = [
  {
    id: '1',
    version: '2.4.0',
    date: '2025-07-15',
    type: 'feature',
    title: 'Système de collections thématiques',
    description: 'Découvrez nos nouvelles collections thématiques regroupant les meilleurs titres par catégorie.',
    details: [
      'Nouvelle page Collections avec navigation horizontale style Netflix',
      'Collections : Jurassic Park, Mecha Legends, Dark Fantasy, Slice of Life',
      'Hero Banner intégré avec mise en avant des titres phares',
      'Cartes au survol avec informations détaillées',
    ],
  },
  {
    id: '2',
    version: '2.3.0',
    date: '2025-07-10',
    type: 'feature',
    title: 'Page Support et Centre d\'aide',
    description: 'Un nouveau support intégré pour vous accompagner dans votre utilisation de Kami-Sama.',
    details: [
      'FAQ interactive avec réponses aux questions fréquentes',
      'Contact direct par e-mail et lien vers le centre d\'aide',
      'Intégration de la communauté Discord',
      'Accès rapide depuis le menu du compte',
    ],
  },
  {
    id: '3',
    version: '2.2.0',
    date: '2025-07-05',
    type: 'improvement',
    title: 'Refonte du calendrier de diffusion',
    description: 'Le calendrier a été repensé pour une meilleure expérience de navigation.',
    details: [
      'Design inspiré de Franime avec colonnes par jour',
      'Plusieurs animés par jour avec horaires de diffusion',
      'Badge d\'épisode avec indicateur visuel',
      'Suppression du défilement horizontal',
    ],
  },
  {
    id: '4',
    version: '2.1.0',
    date: '2025-06-28',
    type: 'feature',
    title: 'Page Live avec carrousel héro',
    description: 'Découvrez le contenu en direct avec un carrousel dynamique et des sections thématiques.',
    details: [
      'Carrousel héro inspiré de Netflix avec défilement automatique',
      'Sections : Direct, Replays, Événements à venir, Radio',
      'Design Auvisco avec badges et indicateurs visuels',
      'Navigation sans flèches pour un design plus épuré',
    ],
  },
  {
    id: '5',
    version: '2.0.0',
    date: '2025-06-20',
    type: 'breaking',
    title: 'Mise à jour majeure du système d\'authentification',
    description: 'Refonte complète du système d\'authentification avec support MFA et changement de profil.',
    details: [
      'Nouveau flux de connexion avec validation MFA',
      'Page de confirmation pour les changements de profil et PIN',
      'Redirection automatique après changement de profil',
      'Synchronisation du profil dans le SiteHeader',
    ],
  },
  {
    id: '6',
    version: '1.5.0',
    date: '2025-06-15',
    type: 'feature',
    title: 'Pages institutionnelles et légales',
    description: 'Nouvelles pages pour les informations sur l\'entreprise et les aspects juridiques.',
    details: [
      'Pages entreprise : À propos, Contact, Partenaires, Presse',
      'Pages légales : Confidentialité, RGPD, Cookies, Sécurité, CGU',
      'Navigation sticky avec détection d\'intersection',
      'Design cohérent avec le reste de l\'application',
    ],
  },
  {
    id: '7',
    version: '1.4.0',
    date: '2025-06-10',
    type: 'fix',
    title: 'Corrections et améliorations de performance',
    description: 'Résolution de plusieurs bugs et optimisations pour une meilleure expérience.',
    details: [
      'Correction du titre de la page Watch maintenant dynamique',
      'Fix des clés dupliquées dans le pied de page',
      'Optimisation du chargement des images',
      'Amélioration de la réactivité sur mobile',
    ],
  },
  {
    id: '8',
    version: '1.3.0',
    date: '2025-06-01',
    type: 'security',
    title: 'Renforcement de la sécurité',
    description: 'Améliorations de sécurité pour protéger vos données et votre compte.',
    details: [
      'Mise à jour des dépendances de sécurité',
      'Protection contre les attaques XSS',
      'Validation renforcée des entrées utilisateur',
      'Journalisation des tentatives de connexion suspectes',
    ],
  },
]

const TYPE_CONFIG = {
  feature: { icon: Sparkles, color: 'text-blue-400', bg: 'bg-blue-500/20', label: 'Nouvelle fonctionnalité' },
  fix: { icon: Bug, color: 'text-green-400', bg: 'bg-green-500/20', label: 'Correction' },
  improvement: { icon: Rocket, color: 'text-purple-400', bg: 'bg-purple-500/20', label: 'Amélioration' },
  security: { icon: Shield, color: 'text-yellow-400', bg: 'bg-yellow-500/20', label: 'Sécurité' },
  breaking: { icon: Star, color: 'text-red-400', bg: 'bg-red-500/20', label: 'Changement majeur' },
}

function formatDate(dateStr: string, locale: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export default function ChangelogPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = use(params)
  const t = useTranslations('Changelog')
  const [filter, setFilter] = React.useState<string>('all')

  React.useEffect(() => {
    document.title = 'Kami-Sama: Changelog'
  }, [])

  const filteredEntries = React.useMemo(() => {
    if (filter === 'all') return MOCK_CHANGELOG
    return MOCK_CHANGELOG.filter((e) => e.type === filter)
  }, [filter])

  return (
    <div className="min-h-screen bg-[#141414] text-white select-none">
      {/* Hero */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-b from-red-600/20 via-[#141414] to-[#141414]" />
        <div className="relative mx-auto max-w-4xl px-4 pt-20 pb-12 text-center md:px-8">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm">
            <Rocket className="size-10 text-red-500" />
          </div>
          <h1 className="font-display text-4xl font-bold tracking-tight md:text-5xl">
            {t('title')}
          </h1>
          <p className="mt-4 text-lg text-white/60">
            {t('subtitle')}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="mx-auto max-w-4xl px-4 md:px-8">
        <div className="flex flex-wrap gap-2 mb-8">
          {[
            { key: 'all', label: t('filterAll') },
            { key: 'feature', label: t('filterFeatures') },
            { key: 'improvement', label: t('filterImprovements') },
            { key: 'fix', label: t('filterFixes') },
            { key: 'security', label: t('filterSecurity') },
            { key: 'breaking', label: t('filterBreaking') },
          ].map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => setFilter(f.key)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                filter === f.key
                  ? 'bg-red-500 text-white'
                  : 'bg-white/10 text-white/60 hover:bg-white/20 hover:text-white'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Entries */}
      <main className="mx-auto max-w-4xl px-4 pb-20 md:px-8">
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-4.75 top-0 bottom-0 w-px bg-white/10" />

          <div className="space-y-8">
            {filteredEntries.map((entry) => {
              const config = TYPE_CONFIG[entry.type]
              const Icon = config.icon
              return (
                <article key={entry.id} className="relative flex gap-6">
                  {/* Timeline dot */}
                  <div className="relative z-10 flex size-10 shrink-0 items-center justify-center rounded-full bg-[#141414] ring-2 ring-white/10">
                    <Icon className={`size-5 ${config.color}`} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition-colors hover:border-white/20">
                    <div className="flex flex-wrap items-center gap-3 mb-3">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${config.bg} ${config.color}`}>
                        <Icon className="size-3" />
                        {config.label}
                      </span>
                      <span className="text-sm text-white/40">v{entry.version}</span>
                      <span className="flex items-center gap-1.5 text-sm text-white/40">
                        <Calendar className="size-3.5" />
                        {formatDate(entry.date, locale)}
                      </span>
                    </div>

                    <h2 className="text-xl font-bold mb-2">{entry.title}</h2>
                    <p className="text-white/60 mb-4">{entry.description}</p>

                    <ul className="space-y-2">
                      {entry.details.map((detail, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-white/50">
                          <ArrowRight className="size-4 mt-0.5 shrink-0 text-red-500/60" />
                          {detail}
                        </li>
                      ))}
                    </ul>
                  </div>
                </article>
              )
            })}
          </div>
        </div>

        {filteredEntries.length === 0 && (
          <div className="py-20 text-center text-white/40">
            <Tag className="mx-auto mb-4 size-10" />
            <p>{t('noEntries')}</p>
          </div>
        )}
      </main>
    </div>
  )
}
