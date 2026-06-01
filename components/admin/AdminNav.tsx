'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Package, Users, ShoppingBag, LogOut, LayoutDashboard } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const navItems = [
  { href: '/admin', label: '대시보드', icon: LayoutDashboard, exact: true },
  { href: '/admin/products', label: '상품 관리', icon: Package },
  { href: '/admin/wholesalers', label: '도매처 관리', icon: Users },
  { href: '/admin/orders', label: '주문 관리', icon: ShoppingBag },
]

export function AdminNav() {
  const pathname = usePathname()
  const router = useRouter()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/admin/login')
    router.refresh()
  }

  return (
    <nav className="w-56 bg-white border-r border-gray-200 flex flex-col min-h-screen">
      <div className="px-6 py-5 border-b border-gray-100">
        <h2 className="font-bold text-gray-900 text-sm">관리자 패널</h2>
        <p className="text-xs text-gray-400 mt-0.5">야외 무인 주문 플랫폼</p>
      </div>

      <div className="flex-1 px-3 py-4">
        {navItems.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href)
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
              <Icon className="w-4 h-4 flex-shrink-0" />
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
          <LogOut className="w-4 h-4 flex-shrink-0" />
          로그아웃
        </button>
      </div>
    </nav>
  )
}
