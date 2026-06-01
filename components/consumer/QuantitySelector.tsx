'use client'
import { Minus, Plus } from 'lucide-react'

interface QuantitySelectorProps {
  value: number
  min?: number
  max?: number
  onChange: (value: number) => void
  compact?: boolean
}

export function QuantitySelector({ value, min = 1, max = 99, onChange, compact = false }: QuantitySelectorProps) {
  return (
    <div className={`flex items-center ${compact ? 'gap-2 sm:gap-3' : 'gap-4'}`}>
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        className={`${compact ? 'h-10 w-10 sm:h-11 sm:w-11' : 'w-12 h-12'} rounded-full bg-gray-100 flex items-center justify-center text-gray-700 hover:bg-gray-200 active:bg-gray-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors`}
        aria-label="수량 감소"
      >
        <Minus className={compact ? 'h-4 w-4 sm:h-5 sm:w-5' : 'w-5 h-5'} />
      </button>

      <span className={`${compact ? 'w-8 text-xl sm:w-10 sm:text-2xl' : 'w-10 text-2xl'} text-center font-bold tabular-nums text-gray-900`}>
        {value}
      </span>

      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        className={`${compact ? 'h-10 w-10 sm:h-11 sm:w-11' : 'w-12 h-12'} rounded-full bg-indigo-600 flex items-center justify-center text-white hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors`}
        aria-label="수량 증가"
      >
        <Plus className={compact ? 'h-4 w-4 sm:h-5 sm:w-5' : 'w-5 h-5'} />
      </button>
    </div>
  )
}
