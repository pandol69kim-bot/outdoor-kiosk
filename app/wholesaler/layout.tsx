import { WholesalerNav } from '@/components/wholesaler/WholesalerNav'

export default function WholesalerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <WholesalerNav />
      <div className="flex-1 overflow-auto">{children}</div>
    </div>
  )
}
