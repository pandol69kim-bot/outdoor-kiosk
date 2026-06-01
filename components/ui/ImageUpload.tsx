'use client'
import { useState, useRef } from 'react'
import Image from 'next/image'
import { Upload, X } from 'lucide-react'

interface ImageUploadProps {
  value?: string | null
  onChange: (url: string | null) => void
}

export function ImageUpload({ value, onChange }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleFile(file: File) {
    setError(null)
    setUploading(true)
    try {
      const form = new FormData()
      form.append('file', file)
      const res = await fetch('/api/upload', { method: 'POST', body: form })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      onChange(json.url)
    } catch (err) {
      setError(err instanceof Error ? err.message : '업로드 실패')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-gray-700">상품 이미지</label>

      {value ? (
        <div className="relative w-full h-48 rounded-xl overflow-hidden border border-gray-200 group">
          <Image src={value} alt="상품 이미지" fill className="object-cover" />
          <button
            type="button"
            onClick={() => onChange(null)}
            className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="w-full h-48 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center gap-2 text-gray-500 hover:border-indigo-400 hover:text-indigo-600 transition-colors disabled:opacity-50"
        >
          <Upload className="w-8 h-8" />
          <span className="text-sm font-medium">
            {uploading ? '업로드 중...' : '클릭하여 이미지 선택'}
          </span>
          <span className="text-xs text-gray-400">PNG, JPG, WEBP 지원</span>
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) handleFile(file)
          e.target.value = ''
        }}
      />

      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  )
}
