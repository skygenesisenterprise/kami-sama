'use client'

import { cn } from '@/lib/utils'
import {
  stats,
  weeklyViews,
  plans,
  topAnimes,
  recentUploads,
  type Upload,
} from './overview-data'
import { TrendingUp, TrendingDown, Star, Play, Ellipsis } from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts'

const CHART_COLORS = [
  'var(--color-chart-1)',
  'var(--color-chart-2)',
  'var(--color-chart-3)',
  'var(--color-chart-4)',
  'var(--color-chart-5)',
]

const statusStyles: Record<Upload['status'], string> = {
  Publié: 'bg-chart-2/15 text-chart-2',
  'En traitement': 'bg-primary/15 text-primary',
  'En attente': 'bg-muted text-muted-foreground',
  Signalé: 'bg-destructive/15 text-destructive',
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 shadow-md">
      <p className="text-xs font-medium text-foreground">{label}</p>
      <p className="text-xs text-muted-foreground">{payload[0].value} M vues</p>
    </div>
  )
}

export function Overview() {
  return (
    <div className="space-y-6">
      {/* Bannière */}
      <section className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between md:p-6">
          <div className="space-y-1">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/15 px-2.5 py-1 text-xs font-medium text-primary">
              <span className="size-1.5 rounded-full bg-primary" />
              Simulcast en direct
            </span>
            <h2 className="text-pretty text-xl font-semibold tracking-tight">
              14 épisodes diffusés cette saison
            </h2>
            <p className="text-sm text-muted-foreground">
              Prochaine sortie : Solo Leveling S2 · E10 dans 2 h 14 min
            </p>
          </div>
          <button className="inline-flex h-10 w-fit items-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:opacity-90">
            <Play className="size-4 fill-current" />
            Gérer la programmation
          </button>
        </div>
      </section>

      {/* Cartes KPI */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          const TrendIcon = stat.trend === 'up' ? TrendingUp : TrendingDown
          return (
            <div key={stat.label} className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-center justify-between">
                <span className="flex size-10 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                  <Icon className="size-5" />
                </span>
                <span
                  className={cn(
                    'inline-flex items-center gap-1 text-xs font-medium',
                    stat.trend === 'up' ? 'text-chart-2' : 'text-destructive',
                  )}
                >
                  <TrendIcon className="size-3.5" />
                  {stat.delta}
                </span>
              </div>
              <p className="mt-4 text-2xl font-semibold tracking-tight">{stat.value}</p>
              <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
              <p className="mt-0.5 text-xs text-muted-foreground/70">{stat.hint}</p>
            </div>
          )
        })}
      </section>

      {/* Graphe + Abonnements */}
      <section className="grid gap-4 lg:grid-cols-3">
        {/* Bar Chart Recharts */}
        <div className="rounded-xl border border-border bg-card p-5 lg:col-span-2">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold">Visionnages de la semaine</h3>
              <p className="text-xs text-muted-foreground">En millions de vues · 7 derniers jours</p>
            </div>
            <span className="text-xs text-muted-foreground">Total : 12,4 M</span>
          </div>
          <div className="relative h-64 w-full">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <BarChart data={weeklyViews} barCategoryGap="25%">
                <defs>
                  {weeklyViews.map((entry, i) => (
                    <linearGradient key={i} id={`barGrad-${i}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={entry.fill} stopOpacity={1} />
                      <stop offset="100%" stopColor={entry.fill} stopOpacity={0.5} />
                    </linearGradient>
                  ))}
                </defs>
                <XAxis
                  dataKey="day"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                  tickFormatter={(v: number) => `${v}`}
                  width={35}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted) / 0.3)' }} />
                <Bar
                  dataKey="value"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={48}
                >
                  {weeklyViews.map((_, i) => (
                    <Cell key={i} fill={`url(#barGrad-${i})`} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart Recharts */}
        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="text-sm font-semibold">Répartition des abonnements</h3>
          <p className="text-xs text-muted-foreground">Membres par formule</p>
          <div className="relative mt-4 h-52 w-full">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <PieChart>
                <defs>
                  {plans.map((_, i) => (
                    <linearGradient key={i} id={`pieGrad-${i}`} x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor={CHART_COLORS[i]} stopOpacity={1} />
                      <stop offset="100%" stopColor={CHART_COLORS[i]} stopOpacity={0.7} />
                    </linearGradient>
                  ))}
                </defs>
                <Pie
                  data={plans}
                  dataKey="share"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={3}
                  strokeWidth={0}
                >
                  {plans.map((_, i) => (
                    <Cell key={i} fill={`url(#pieGrad-${i})`} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, name) => [`${value}%`, name]}
                  contentStyle={{ borderRadius: 8, border: '1px solid hsl(var(--border))', background: 'hsl(var(--card))', fontSize: 12 }}
                />
                <Legend
                  verticalAlign="bottom"
                  iconType="circle"
                  iconSize={8}
                  formatter={(value: string) => <span className="text-xs text-muted-foreground">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <ul className="mt-3 space-y-2">
            {plans.map((p, i) => (
              <li key={p.name} className="flex items-center gap-3 text-sm">
                <span className="size-2.5 rounded-full" style={{ background: CHART_COLORS[i] }} />
                <span className="flex-1 text-foreground">{p.name}</span>
                <span className="text-muted-foreground">{p.members}</span>
                <span className="w-10 text-right font-medium">{p.share}%</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Top animés + Ajouts récents */}
      <section className="grid gap-4 lg:grid-cols-5">
        <div className="rounded-xl border border-border bg-card p-5 lg:col-span-2">
          <h3 className="mb-4 text-sm font-semibold">Top animés du moment</h3>
          <ul className="space-y-1">
            {topAnimes.map((a) => (
              <li
                key={a.rank}
                className="flex items-center gap-3 rounded-lg px-2 py-2.5 transition-colors hover:bg-accent/50"
              >
                <span className="w-5 text-center text-sm font-semibold text-muted-foreground">
                  {a.rank}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{a.title}</p>
                  <p className="truncate text-xs text-muted-foreground">{a.genre}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">{a.views}</p>
                  <p className="inline-flex items-center gap-0.5 text-xs text-muted-foreground">
                    <Star className="size-3 fill-primary text-primary" />
                    {a.rating}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-xl border border-border bg-card lg:col-span-3">
          <div className="flex items-center justify-between p-5 pb-3">
            <div>
              <h3 className="text-sm font-semibold">Ajouts récents</h3>
              <p className="text-xs text-muted-foreground">File d&apos;encodage & modération</p>
            </div>
            <button className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-accent-foreground" aria-label="Plus d'options">
              <Ellipsis className="size-4" />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-y border-border text-left text-xs text-muted-foreground">
                  <th className="px-5 py-2.5 font-medium">Titre</th>
                  <th className="px-3 py-2.5 font-medium">Épisode</th>
                  <th className="px-3 py-2.5 font-medium">Langue</th>
                  <th className="px-3 py-2.5 font-medium">Statut</th>
                  <th className="px-5 py-2.5 text-right font-medium">Ajouté</th>
                </tr>
              </thead>
              <tbody>
                {recentUploads.map((u, i) => (
                  <tr key={i} className="border-b border-border last:border-0 hover:bg-accent/40">
                    <td className="px-5 py-3 font-medium">{u.title}</td>
                    <td className="px-3 py-3 text-muted-foreground">{u.episode}</td>
                    <td className="px-3 py-3">
                      <span className="rounded border border-border px-1.5 py-0.5 text-xs text-muted-foreground">
                        {u.lang}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <span
                        className={cn(
                          'inline-flex rounded-full px-2 py-0.5 text-xs font-medium',
                          statusStyles[u.status],
                        )}
                      >
                        {u.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right text-xs text-muted-foreground">{u.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  )
}
