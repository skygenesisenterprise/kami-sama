'use client'

import * as React from 'react'
import { useTranslations } from 'next-intl'
import type { CatalogFilter } from '@/types/catalog'
import { CATALOG_GENRES } from '@/lib/mock-catalog'

interface CatalogHeaderProps {
  filter: CatalogFilter
  total: number
}

const GENRE_DESCRIPTIONS: Record<string, string> = {
  action: 'Découvrez les œuvres orientées combat,冒险 et affrontements.',
  aventure: 'Explorez les histoires remplies de découvertes et de voyage.',
  romance: 'Plongez dans les histoires d\'amour et de passions.',
  fantasy: 'Envolez-vous dans des mondes magiques et extraordinaires.',
  'science-fiction': 'Découvrez les futurs possibles et les univers technologiques.',
  horreur: 'Affrontez vos peurs avec ces œuvres terrifiantes.',
  comedie: 'Les meilleures œuvres pour vous faire rire.',
  drame: 'Des histoires profondes et émouvantes.',
  mystere: 'Résolvez les énigmes et les mystères.',
  thriller: 'Des récits haletants qui vous tiendront en haleine.',
  sport: 'Suivez les exploits des plus grands athlètes.',
  'slice-of-life': 'La beauté du quotidien dans ces histoires.',
  musique: 'L\'univers de la musique et des performances.',
  mecha: 'Les machines géantes et les pilotes intrépides.',
  isekai: 'Transportez-vous dans d\'autres mondes.',
  psychologique: 'Explorez les profondeurs de l\'esprit humain.',
  historique: 'Revivez les grands moments de l\'histoire.',
  militaire: 'Les conflits et les stratégies militaires.',
  nature: 'La nature et ses merveilles.',
  policier: 'Enquêtes et mysteries à résoudre.',
}

export function CatalogHeader({ filter, total }: CatalogHeaderProps) {
  const t = useTranslations('Catalog')

  const genreInfo = filter.genre
    ? CATALOG_GENRES.find((g) => g.id === filter.genre)
    : null

  const title = genreInfo ? genreInfo.label : t('heroTitle')
  const description = filter.genre
    ? GENRE_DESCRIPTIONS[filter.genre] || t('heroDescription')
    : t('heroDescription')

  return (
    <section className="px-4 md:px-12">
      <h1
        className="font-display font-black leading-[0.9] tracking-[-0.03em] text-foreground"
        style={{ fontSize: 'clamp(2rem, 4vw + 1rem, 4rem)' }}
      >
        {title}
      </h1>
      <p
        className="mt-3 max-w-2xl text-muted-foreground"
        style={{ fontSize: 'clamp(0.875rem, 1vw + 0.4rem, 1.125rem)' }}
      >
        {description}
      </p>
      <div className="mt-4 flex items-center gap-3">
        <span className="text-sm font-medium text-primary">
          {t('resultsCount', { total })}
        </span>
      </div>
    </section>
  )
}
