'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Truck, LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const navItems = [
  { href: '/wholesaler/orders', label: '배송 주문', icon: Truck },
]

export function WholesalerNav() {
  const pathname = usePathname()
  const router = useRouter()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/wholesaler/login')
    router.refresh()
  }

  return (
    <nav className="w-56 bg-white border-r border-gray-200 flex flex-col min-h-screen">
      <div className="px-6 py-5 border-b border-gray-100">
        <h2 className="font-bold text-gray-900 text-sm">도매처 포털</h2>
        <p className="text-xs text-gray-400 mt-0.5">배송 상태 업데이트</p>
      </div>

      <div className="flex-1 px-3 py-4">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1 text-sm font-medium transition-colors
                ${active
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }
              `}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </Link>
          )
        })}
      </div>

      <div className="px-3 py-4 border-t border-gray-100">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl w-full text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-700 transition-colors"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          로그아웃
        </button>
      </div>
    </nav>
  )
}
