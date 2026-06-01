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

  useEffect(() => {
    async function loadWholesalers() {
      await fetchWholesalers()
    }

    void loadWholesalers()
  }, [])

  async function handleDelete(id: string, name: string) {
    if (!confirm(`"${name}" 도매처를 삭제하시겠습니까?`)) return
    setDeletingId(id)
    await fetch(`/api/wholesalers/${id}`, { method: 'DELETE' })
    setDeletingId(null)
    fetchWholesalers()
  }

  return (
    <div className="max-w-5xl p-4 sm:p-6 lg:p-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">도매처 관리</h1>
          <p className="text-sm text-gray-500 mt-1">등록된 도매처 {wholesalers.length}개</p>
        </div>
        <Link href="/admin/wholesalers/new" className="w-full sm:w-auto">
          <Button size="md" className="w-full sm:w-auto">
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
            <div key={w.id} className="flex flex-col gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:flex-row sm:items-start sm:justify-between">
              <div className="flex-1">
                <div className="mb-1 flex flex-wrap items-center gap-2">
                  <h3 className="font-semibold text-gray-900">{w.name}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${w.notify_type === 'email' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
                    {w.notify_type === 'email' ? '이메일 자동' : '수동 전달'}
                  </span>
                </div>
                {w.contact && <p className="text-sm text-gray-600">담당: {w.contact}</p>}
                <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
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
              <div className="ml-0 flex items-center justify-end gap-2 sm:ml-4">
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
