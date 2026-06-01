'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Plus, Pencil, Trash2, Mail, Phone } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import type { Wholesaler } from '@/lib/types'

export default function AdminWholesalersPage() {
  const [wholesalers, setWholesalers] = useState<Wholesaler[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  async function fetchWholesalers() {
    const res = await fetch('/api/wholesalers')
    const data = await res.json()
    if (Array.isArray(data)) setWholesalers(data)
    setLoading(false)
  }

  useEffect(() => { fetchWholesalers() }, [])

  async function handleDelete(id: string, name: string) {
    if (!confirm(`"${name}" 도매처를 삭제하시겠습니까?`)) return
    setDeletingId(id)
    await fetch(`/api/wholesalers/${id}`, { method: 'DELETE' })
    setDeletingId(null)
    fetchWholesalers()
  }

  return (
    <div className="p-6 max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">도매처 관리</h1>
          <p className="text-sm text-gray-500 mt-1">등록된 도매처 {wholesalers.length}개</p>
        </div>
        <Link href="/admin/wholesalers/new">
          <Button size="md">
            <Plus className="w-4 h-4" />
            도매처 등록
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full" />
        </div>
      ) : wholesalers.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <p className="text-gray-400 mb-4">등록된 도매처가 없습니다.</p>
          <Link href="/admin/wholesalers/new">
            <Button variant="secondary">첫 도매처 등록하기</Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {wholesalers.map(w => (
            <div key={w.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-gray-900">{w.name}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${w.notify_type === 'email' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
                    {w.notify_type === 'email' ? '이메일 자동' : '수동 전달'}
                  </span>
                </div>
                {w.contact && <p className="text-sm text-gray-600">담당: {w.contact}</p>}
                <div className="flex items-center gap-4 mt-2">
                  {w.phone && (
                    <span className="flex items-center gap-1 text-xs text-gray-500">
                      <Phone className="w-3 h-3" />{w.phone}
                    </span>
                  )}
                  {w.email && (
                    <span className="flex items-center gap-1 text-xs text-gray-500">
                      <Mail className="w-3 h-3" />{w.email}
                    </span>
                  )}
                </div>
                {w.memo && <p className="text-xs text-gray-400 mt-2 italic">{w.memo}</p>}
              </div>
              <div className="flex items-center gap-2 ml-4">
                <Link href={`/admin/wholesalers/${w.id}/edit`}>
                  <button className="p-2 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors">
                    <Pencil className="w-4 h-4" />
                  </button>
                </Link>
                <button
                  onClick={() => handleDelete(w.id, w.name)}
                  disabled={deletingId === w.id}
                  className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
