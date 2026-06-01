import { AdminNav } from '@/components/admin/AdminNav'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 lg:flex">
      <AdminNav />
      <div className="flex-1 overflow-x-hidden">
        {children}
      </div>
    </div>
  )
}
