import type { LucideIcon } from 'lucide-react'
import { Users, Eye, CreditCard, Clapperboard } from 'lucide-react'

export type Stat = {
  label: string
  value: string
  delta: string
  trend: 'up' | 'down'
  hint: string
  icon: LucideIcon
}

export const stats: Stat[] = [
  {
    label: 'Abonnés actifs',
    value: '284 920',
    delta: '+4,8 %',
    trend: 'up',
    hint: 'vs mois dernier',
    icon: Users,
  },
  {
    label: "Vues aujourd'hui",
    value: '1,92 M',
    delta: '+12,3 %',
    trend: 'up',
    hint: 'vs hier',
    icon: Eye,
  },
  {
    label: 'Revenus mensuels',
    value: '2,41 M€',
    delta: '+6,1 %',
    trend: 'up',
    hint: 'MRR estimé',
    icon: CreditCard,
  },
  {
    label: 'Animés au catalogue',
    value: '1 348',
    delta: '-2 titres',
    trend: 'down',
    hint: 'droits expirés',
    icon: Clapperboard,
  },
]

export type DayViews = { day: string; value: number; fill: string }

export const weeklyViews: DayViews[] = [
  { day: 'Lun', value: 1.42, fill: 'var(--color-chart-3)' },
  { day: 'Mar', value: 1.58, fill: 'var(--color-chart-4)' },
  { day: 'Mer', value: 1.34, fill: 'var(--color-chart-5)' },
  { day: 'Jeu', value: 1.71, fill: 'var(--color-chart-2)' },
  { day: 'Ven', value: 2.05, fill: 'var(--color-chart-1)' },
  { day: 'Sam', value: 2.38, fill: 'var(--color-stamp)' },
  { day: 'Dim', value: 1.92, fill: 'var(--color-chart-3)' },
]

export type Plan = { name: string; share: number; members: string; color: string }

export const plans: Plan[] = [
  { name: 'Mega Fan', share: 46, members: '131 k', color: 'bg-chart-1' },
  { name: 'Fan', share: 33, members: '94 k', color: 'bg-chart-2' },
  { name: 'Essai gratuit', share: 14, members: '40 k', color: 'bg-chart-3' },
  { name: 'Premium annuel', share: 7, members: '20 k', color: 'bg-chart-4' },
]

export type TopAnime = {
  rank: number
  title: string
  genre: string
  views: string
  rating: number
}

export const topAnimes: TopAnime[] = [
  { rank: 1, title: 'Solo Leveling', genre: 'Action · Fantasy', views: '4,2 M', rating: 4.9 },
  { rank: 2, title: 'Frieren', genre: 'Aventure · Drame', views: '3,8 M', rating: 4.9 },
  { rank: 3, title: 'Jujutsu Kaisen', genre: 'Action · Surnaturel', views: '3,1 M', rating: 4.8 },
  { rank: 4, title: 'Blue Lock', genre: 'Sport · Seinen', views: '2,7 M', rating: 4.6 },
  { rank: 5, title: 'Dandadan', genre: 'Comédie · Action', views: '2,4 M', rating: 4.7 },
]

export type Upload = {
  title: string
  episode: string
  status: 'Publié' | 'En traitement' | 'En attente' | 'Signalé'
  lang: string
  time: string
}

export const recentUploads: Upload[] = [
  { title: 'Solo Leveling', episode: 'S2 · E09', status: 'Publié', lang: 'VOSTFR', time: 'il y a 12 min' },
  { title: 'One Piece', episode: 'E1122', status: 'En traitement', lang: 'VF', time: 'il y a 34 min' },
  { title: 'Kaiju No. 8', episode: 'S2 · E03', status: 'En attente', lang: 'VOSTFR', time: 'il y a 1 h' },
  { title: 'Dandadan', episode: 'E10', status: 'Signalé', lang: 'VOSTFR', time: 'il y a 2 h' },
  { title: 'Spy x Family', episode: 'S3 · E01', status: 'Publié', lang: 'VF', time: 'il y a 3 h' },
]
