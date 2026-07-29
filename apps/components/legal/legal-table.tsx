'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

interface Column {
  header: string
  key: string
}

interface LegalTableProps {
  columns: Column[]
  rows: Record<string, string>[]
  className?: string
}

export function LegalTable({ columns, rows, className }: LegalTableProps) {
  return (
    <div className={cn('overflow-x-auto rounded-xl border border-border', className)}>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-card">
            {columns.map((col) => (
              <th
                key={col.key}
                className="px-4 py-3 text-left font-display text-xs font-bold uppercase tracking-wider text-muted-foreground"
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-border last:border-0">
              {columns.map((col) => (
                <td key={col.key} className="px-4 py-3 text-muted-foreground">
                  {row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
