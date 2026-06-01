'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import type { Product } from '@/lib/types'

type ProductTab = 'visible' | 'hidden'
type WholesalerFilter = 'all' | 'none' | string

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [bulkUpdating, setBulkUpdating] = useState(false)
  const [activeTab, setActiveTab] = useState<ProductTab>('visible')
  const [wholesalerFilter, setWholesalerFilter] = useState<WholesalerFilter>('all')

  async function fetchProducts() {
    const res = await fetch('/api/products?include_hidden=true')
    const data = await res.json()
    if (Array.isArray(data)) setProducts(data)
    setLoading(false)
  }

  useEffect(() => {
    async function loadProducts() {
      const res = await fetch('/api/products?include_hidden=true')
      const data = await res.json()
      if (Array.isArray(data)) setProducts(data)
      setLoading(false)
    }

    void loadProducts()
  }, [])

  async function handleDelete(id: string, name: string) {
    if (!confirm(`"${name}" 상품을 숨김 처리하시겠습니까?`)) return
    setDeletingId(id)
    await fetch(`/api/products/${id}`, { method: 'DELETE' })
    setDeletingId(null)
    fetchProducts()
  }

  async function handleBulkVisibility(isActive: boolean) {
    const actionLabel = isActive ? '전체 노출' : '전체 숨김'
    if (!confirm(`모든 상품을 ${actionLabel} 처리하시겠습니까?`)) return

    setBulkUpdating(true)
    try {
      await fetch('/api/products/bulk-visibility', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: isActive }),
      })
      await fetchProducts()
      setActiveTab(isActive ? 'visible' : 'hidden')
    } finally {
      setBulkUpdating(false)
    }
  }

  const visibleProducts = products.filter((product) => product.is_active)
  const hiddenProducts = products.filter((product) => !product.is_active)
  const tabProducts = activeTab === 'visible' ? visibleProducts : hiddenProducts
  const wholesalerOptions = products.reduce<Array<{ id: string, name: string }>>((accumulator, product) => {
    const wholesaler = product.wholesaler as { id?: string, name?: string } | undefined
    if (!wholesaler?.id || !wholesaler.name) return accumulator
    if (accumulator.some((item) => item.id === wholesaler.id)) return accumulator
    return [...accumulator, { id: wholesaler.id, name: wholesaler.name }]
  }, []).sort((left, right) => left.name.localeCompare(right.name, 'ko'))
  const filteredProducts = tabProducts.filter((product) => {
    if (wholesalerFilter === 'all') return true
    if (wholesalerFilter === 'none') return !product.wholesaler_id
    return product.wholesaler_id === wholesalerFilter
  })

  return (
    <div className="max-w-5xl p-4 sm:p-6 lg:p-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">상품 관리</h1>
          <p className="text-sm text-gray-500 mt-1">
            노출 {visibleProducts.length}개 / 숨김 {hiddenProducts.length}개
          </p>
        </div>
        <Link href="/admin/products/new" className="w-full sm:w-auto">
          <Button size="md" className="w-full sm:w-auto">
            <Plus className="w-4 h-4" />
            상품 등록
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full" />
        </div>
      ) : products.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <p className="text-gray-400 mb-4">등록된 상품이 없습니다.</p>
          <Link href="/admin/products/new">
            <Button variant="secondary">첫 상품 등록하기</Button>
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="border-b border-gray-100 px-6 py-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="inline-flex w-full rounded-xl bg-gray-100 p-1 sm:w-auto">
                  <button
                    type="button"
                    onClick={() => setActiveTab('visible')}
                    className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors sm:flex-none ${
                      activeTab === 'visible'
                        ? 'bg-white text-indigo-600 shadow-sm'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    노출 상품 {visibleProducts.length}
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('hidden')}
                    className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors sm:flex-none ${
                      activeTab === 'hidden'
                        ? 'bg-white text-indigo-600 shadow-sm'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    숨김 상품 {hiddenProducts.length}
                  </button>
                </div>

                <select
                  value={wholesalerFilter}
                  onChange={(event) => setWholesalerFilter(event.target.value)}
                  className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  aria-label="거래처별 상품 필터"
                >
                  <option value="all">전체 거래처</option>
                  <option value="none">거래처 미연결</option>
                  {wholesalerOptions.map((option) => (
                    <option key={option.id} value={option.id}>{option.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="w-full sm:w-auto"
                  loading={bulkUpdating}
                  onClick={() => handleBulkVisibility(true)}
                >
                  전체 노출
                </Button>
                <Button
                  type="button"
                  size="sm"
                  className="w-full sm:w-auto"
                  loading={bulkUpdating}
                  onClick={() => handleBulkVisibility(false)}
                >
                  전체 숨김
                </Button>
              </div>
            </div>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="px-6 py-16 text-center text-sm text-gray-400">
              {activeTab === 'visible' ? '조건에 맞는 노출 상품이 없습니다.' : '조건에 맞는 숨김 상품이 없습니다.'}
            </div>
          ) : (
            <>
              <div className="divide-y divide-gray-50 lg:hidden">
                {filteredProducts.map(product => (
                  <div key={product.id} className="space-y-4 px-4 py-4">
                    <div className="flex items-start gap-3">
                      <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-gray-100">
                        {product.image_url ? (
                          <Image
                            src={product.image_url}
                            alt={product.name}
                            width={48}
                            height={48}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-gray-300">
                            <span className="text-lg">📦</span>
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-semibold text-gray-900">{product.name}</p>
                          <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${product.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                            {product.is_active ? '노출' : '숨김'}
                          </span>
                        </div>
                        {product.description && (
                          <p className="mt-1 text-xs text-gray-400">{product.description}</p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-xs text-gray-400">판매가</p>
                        <p className="mt-1 font-semibold text-gray-900">{product.price.toLocaleString()}원</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">도매처</p>
                        <p className="mt-1 text-gray-700">{(product.wholesaler as { name: string } | undefined)?.name || '-'}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/admin/products/${product.id}/edit`}>
                        <button className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-indigo-50 hover:text-indigo-600">
                          <Pencil className="h-4 w-4" />
                        </button>
                      </Link>
                      <button
                        onClick={() => handleDelete(product.id, product.name)}
                        disabled={deletingId === product.id || !product.is_active || bulkUpdating}
                        className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="hidden overflow-x-auto lg:block">
                <table className="w-full min-w-[720px]">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">상품</th>
                      <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">판매가</th>
                      <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide">도매처</th>
                      <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide">상태</th>
                      <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">관리</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filteredProducts.map(product => (
                      <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 shrink-0 overflow-hidden rounded-xl bg-gray-100">
                              {product.image_url ? (
                                <Image
                                  src={product.image_url}
                                  alt={product.name}
                                  width={40}
                                  height={40}
                                  className="object-cover w-full h-full"
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center text-gray-300">
                                  <span className="text-lg">📦</span>
                                </div>
                              )}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">{product.name}</p>
                              {product.description && (
                                <p className="mt-0.5 line-clamp-1 text-xs text-gray-400">{product.description}</p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="text-sm font-semibold text-gray-900">{product.price.toLocaleString()}원</span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="text-xs text-gray-500">
                            {(product.wholesaler as { name: string } | undefined)?.name || '-'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${product.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                            {product.is_active ? '노출' : '숨김'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link href={`/admin/products/${product.id}/edit`}>
                              <button className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-indigo-50 hover:text-indigo-600">
                                <Pencil className="w-4 h-4" />
                              </button>
                            </Link>
                            <button
                              onClick={() => handleDelete(product.id, product.name)}
                              disabled={deletingId === product.id || !product.is_active || bulkUpdating}
                              className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}

