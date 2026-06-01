import { WholesalerNav } from '@/components/wholesaler/WholesalerNav'

export default function WholesalerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 lg:flex">
      <WholesalerNav />
      <div className="flex-1 overflow-x-hidden">{children}</div>
    </div>
  )
}
