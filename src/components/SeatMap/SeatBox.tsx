'use client'

import { cn, SeatStatus } from '@/lib/utils'
import { JetBrains_Mono } from 'next/font/google'

const mono = JetBrains_Mono({ subsets: ['latin'] })

export interface ShiftRow {
  code: string           // 'M' | 'A' | 'E' | 'N'
  studentName: string | null
  status: 'active' | 'expiring' | 'expired' | 'vacant'
}

interface SeatBoxProps {
  seatNumber: string
  overallStatus: SeatStatus
  shifts: ShiftRow[]
  hasLocker?: boolean
  onClick: () => void
  animationDelay?: number
}

const boxStyles: Record<SeatStatus, string> = {
  free: 'bg-white border-gray-200 text-gray-600 hover:border-brand-300 hover:bg-brand-50/30',
  occupied: 'bg-brand-100 border-brand-400 text-brand-900',
  expiring: 'bg-amber-50 border-amber-400 text-amber-900',
  expired: 'bg-red-50 border-red-400 text-red-900',
}

const shiftDotStyles: Record<ShiftRow['status'], string> = {
  active: 'bg-brand-500',
  expiring: 'bg-amber-500',
  expired: 'bg-red-500',
  vacant: 'bg-gray-200',
}

const shiftNameStyles: Record<ShiftRow['status'], string> = {
  active: 'text-brand-700 font-semibold',
  expiring: 'text-amber-700 font-semibold',
  expired: 'text-red-700 font-bold',
  vacant: 'text-gray-300 italic',
}

export default function SeatBox({
  seatNumber,
  overallStatus,
  shifts,
  hasLocker,
  onClick,
  animationDelay = 0,
}: SeatBoxProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        // Fixed size — taller to fit shift rows
        'relative w-full min-h-[88px] md:min-h-[104px]',
        'rounded-xl border-2 flex flex-col p-2 gap-1',
        'transition-all duration-150 ease-out',
        'hover:scale-105 hover:shadow-lg hover:z-10',
        'active:scale-95',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500',
        boxStyles[overallStatus],
        overallStatus === 'expiring' && 'expiring-pulse',
      )}
      style={{
        animation: `seatFadeIn 0.35s ease-out ${animationDelay}ms both`,
      }}
      aria-label={`Seat ${seatNumber} — ${overallStatus}`}
    >
      {/* Top row: seat number + locker dot */}
      <div className="flex items-center justify-between w-full">
        <span className={cn('text-[13px] font-black leading-none tracking-tight', mono.className)}>
          {seatNumber}
        </span>
        {hasLocker && overallStatus !== 'free' && (
          <span className="w-1.5 h-1.5 rounded-full bg-brand-500 shadow-sm" title="Has locker" />
        )}
      </div>

      {/* Shift rows */}
      <div className="flex flex-col gap-[2px] w-full mt-auto">
        {shifts.map(s => (
          <div key={s.code} className="flex items-center gap-1 w-full">
            {/* Shift code */}
            <span className={cn('text-[9px] font-black w-3 leading-none', mono.className,
              s.status === 'vacant' ? 'text-gray-300' : 'text-gray-500'
            )}>
              {s.code}
            </span>
            {/* Status dot */}
            <span className={cn('w-1 h-1 rounded-full flex-shrink-0', shiftDotStyles[s.status])} />
            {/* Student name */}
            <span className={cn(
              'text-[9px] leading-none truncate flex-1',
              shiftNameStyles[s.status],
            )}>
              {s.status === 'vacant' ? 'vacant' : (s.studentName?.split(' ')[0] || '—')}
            </span>
          </div>
        ))}
      </div>

      {/* Expiring pulse ring */}
      {overallStatus === 'expiring' && (
        <span className="absolute inset-0 rounded-xl border-2 border-amber-400 animate-ping opacity-20 pointer-events-none" />
      )}
    </button>
  )
}