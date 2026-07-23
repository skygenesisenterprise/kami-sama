'use client'

import { useState } from 'react'
import { Cast, Unplug } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { useCast } from '@/hooks/use-cast'
import { cn } from '@/lib/utils'

export function CastDeviceSelector({ className }: { className?: string }) {
  const { isCasting, connect, disconnect } = useCast()
  const [open, setOpen] = useState(false)

  function handleClick() {
    if (isCasting) {
      setOpen((v) => !v)
    } else {
      connect()
    }
  }

  return (
    <Popover open={isCasting && open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn('size-9', isCasting && 'text-primary', className)}
          aria-label={isCasting ? 'Gérer le cast' : 'Caster sur un appareil'}
          onClick={handleClick}
        >
          <Cast className={cn('size-5', isCasting && 'fill-current')} />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        className="w-48 border-white/10 bg-black p-1 text-white shadow-xl"
      >
        <button
          type="button"
          onClick={() => { disconnect(); setOpen(false) }}
          className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-red-400 transition-colors hover:bg-white/10"
        >
          <Unplug className="size-4" />
          Déconnecter
        </button>
      </PopoverContent>
    </Popover>
  )
}
