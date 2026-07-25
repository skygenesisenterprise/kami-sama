import type { StatusTone } from '@/components/dash/status-badge'

export type PublicationState =
  | 'Draft'
  | 'Review'
  | 'Approved'
  | 'Scheduled'
  | 'Published'
  | 'Archived'

export const statusToneMap: Record<PublicationState, StatusTone> = {
  Draft: 'neutral',
  Review: 'warning',
  Approved: 'info',
  Scheduled: 'warning',
  Published: 'success',
  Archived: 'destructive',
}

export interface CatalogItem {
  id: string
  title: string
  subtitle: string
  status: PublicationState
  year: number
  studio: string
  genres: string[]
  rating: number
  updated: string
  updatedBy: string
  episodes: number
  sources: string[]
}

export interface CollectionConfig {
  title: string
  description: string
  singular: string
}
