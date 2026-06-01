'use client'
import { Minus, Plus } from 'lucide-react'

interface QuantitySelectorProps {
  value: number
  min?: number
  max?: number
  onChange: (value: number) => void
}

export function QuantitySelector({ value, min = 1, max = 99, onChange }: QuantitySelectorProps) {
  return (
    <div className="flex items-center gap-4">
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-700 hover:bg-gray-200 active:bg-gray-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        aria-label="수량 감소"
      >
        <Minus className="w-5 h-5" />
      </button>

      <span className="text-2xl font-bold text-gray-900 w-10 text-center tabular-nums">
        {value}
      </span>

      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        className="w-12 h-12 rounded-full bg-indigo-600 flex items-center justify-center text-white hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        aria-label="수량 증가"
      >
        <Plus className="w-5 h-5" />
      </button>
    </div>
  )
}
