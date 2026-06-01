export type OrderStatus = 'received' | 'forwarded' | 'shipping' | 'delivered'
export type NotifyType = 'email' | 'manual'

export interface Wholesaler {
  id: string
  name: string
  contact: string | null
  phone: string | null
  email: string | null
  notify_type: NotifyType
  memo: string | null
  created_at: string
}

export interface Product {
  id: string
  name: string
  description: string | null
  price: number
  wholesale_price: number | null
  image_url: string | null
  wholesaler_id: string | null
  wholesaler?: Wholesaler
  is_active: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

export interface CartItem {
  product_id: string
  name: string
  price: number
  image_url: string | null
  quantity: number
}

export interface Order {
  id: string
  order_number: string
  product_id: string | null
  product_name: string
  product_price: number
  quantity: number
  total_price: number
  customer_name: string
  customer_phone: string
  delivery_address: string
  delivery_memo: string | null
  status: OrderStatus
  wholesaler_id: string | null
  wholesaler_name: string | null
  notified_at: string | null
  created_at: string
  updated_at: string
}

export interface CreateOrderInput {
  product_id: string
  quantity: number
  customer_name: string
  customer_phone: string
  delivery_address: string
  delivery_memo?: string
}

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  received: '주문 접수',
  forwarded: '도매처 전달 완료',
  shipping: '배송중',
  delivered: '배송 완료',
}

export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  received: 'bg-yellow-100 text-yellow-800',
  forwarded: 'bg-blue-100 text-blue-800',
  shipping: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
}
