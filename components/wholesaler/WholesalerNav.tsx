'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Truck, LogOut, Menu, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const navItems = [
  { href: '/wholesaler/orders', label: '배송 주문', icon: Truck },
]

export function WholesalerNav() {
  const pathname = usePathname()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    setIsOpen(false)
    router.push('/wholesaler/login')
    router.refresh()
  }

  function handleNavigate() {
    setIsOpen(false)
  }

  return (
    <>
      <div className="sticky top-0 z-30 flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3 lg:hidden">
        <div>
          <h2 className="text-sm font-bold text-gray-900">도매처 포털</h2>
          <p className="mt-0.5 text-xs text-gray-400">배송 상태 업데이트</p>
        </div>
        <button
          type="button"
          onClick={() => setIsOpen((open) => !open)}
          className="rounded-xl border border-gray-200 p-2 text-gray-600 transition-colors hover:bg-gray-50"
          aria-label={isOpen ? '도매처 메뉴 닫기' : '도매처 메뉴 열기'}
          aria-expanded={isOpen}
        >
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {isOpen && (
        <button
          type="button"
          className="fixed inset-0 z-30 bg-black/30 lg:hidden"
          aria-label="도매처 메뉴 닫기"
          onClick={() => setIsOpen(false)}
        />
      )}

      <nav
        className={`fixed inset-y-0 left-0 z-40 flex min-h-screen w-72 max-w-[85vw] flex-col border-r border-gray-200 bg-white transition-transform lg:sticky lg:top-0 lg:z-20 lg:w-56 lg:max-w-none lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="border-b border-gray-100 px-6 py-5">
          <h2 className="text-sm font-bold text-gray-900">도매처 포털</h2>
          <p className="mt-0.5 text-xs text-gray-400">배송 상태 업데이트</p>
        </div>

        <div className="flex-1 px-3 py-4">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname.startsWith(href)
            return (
              <Link
                key={href}
                href={href}
                onClick={handleNavigate}
                className={`
                  mb-1 flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-colors
                  ${active
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }
                `}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {label}
              </Link>
            )
          })}
        </div>

        <div className="border-t border-gray-100 px-3 py-4">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-gray-600 transition-colors hover:bg-red-50 hover:text-red-700"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            로그아웃
          </button>
        </div>
      </nav>
    </>
  )
}
