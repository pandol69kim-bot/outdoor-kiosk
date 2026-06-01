'use client'
import { use, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { WholesalerForm, type WholesalerFormValues } from '@/components/admin/WholesalerForm'
import type { Wholesaler } from '@/lib/types'

interface Props {
  params: Promise<{ id: string }>
}

export default function EditWholesalerPage({ params }: Props) {
  const { id } = use(params)
  const router = useRouter()
  const [wholesaler, setWholesaler] = useState<Wholesaler | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/wholesalers')
      .then(r => r.json())
      .then((data: Wholesaler[]) => {
        const found = data.find(w => w.id === id)
        if (!found) router.push('/admin/wholesalers')
        else setWholesaler(found)
      })
      .finally(() => setLoading(false))
  }, [id, router])

  async function handleSubmit(values: WholesalerFormValues) {
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch(`/api/wholesalers/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      router.push('/admin/wholesalers')
    } catch (err) {
      setError(err instanceof Error ? err.message : '저장 실패')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="p-6 max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/wholesalers" className="p-2 rounded-full hover:bg-gray-100">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">도매처 수정</h1>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        {error && (
          <div className="bg-red-50 text-red-700 rounded-xl px-4 py-3 text-sm mb-5">{error}</div>
        )}
        {wholesaler && (
          <WholesalerForm defaultValues={wholesaler} onSubmit={handleSubmit} loading={submitting} />
        )}
      </div>
    </div>
  )
}
