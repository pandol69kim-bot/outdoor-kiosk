import type { CartItem, Product } from './types'

const CART_STORAGE_KEY = 'outdoor-kiosk-cart'
export const CART_UPDATED_EVENT = 'outdoor-kiosk-cart-updated'

function isBrowser() {
  return typeof window !== 'undefined'
}

function normalizeCartItems(items: unknown): CartItem[] {
  if (!Array.isArray(items)) return []

  return items.flatMap((item) => {
    if (!item || typeof item !== 'object') return []

    const candidate = item as Partial<CartItem>
    if (
      typeof candidate.product_id !== 'string' ||
      typeof candidate.name !== 'string' ||
      typeof candidate.price !== 'number' ||
      typeof candidate.quantity !== 'number'
    ) {
      return []
    }

    if (candidate.price <= 0 || candidate.quantity <= 0) return []

    return [{
      product_id: candidate.product_id,
      name: candidate.name,
      price: candidate.price,
      image_url: typeof candidate.image_url === 'string' ? candidate.image_url : null,
      quantity: Math.floor(candidate.quantity),
    }]
  })
}

function notifyCartUpdated() {
  if (!isBrowser()) return
  window.dispatchEvent(new Event(CART_UPDATED_EVENT))
}

export function getCartItems(): CartItem[] {
  if (!isBrowser()) return []

  try {
    const rawValue = window.localStorage.getItem(CART_STORAGE_KEY)
    if (!rawValue) return []
    return normalizeCartItems(JSON.parse(rawValue))
  } catch {
    return []
  }
}

export function setCartItems(items: CartItem[]) {
  if (!isBrowser()) return []

  const normalizedItems = normalizeCartItems(items)
  window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(normalizedItems))
  notifyCartUpdated()
  return normalizedItems
}

export function addProductToCart(product: Product, quantity: number) {
  const cartItems = getCartItems()
  const existingItem = cartItems.find((item) => item.product_id === product.id)

  if (existingItem) {
    return setCartItems(
      cartItems.map((item) =>
        item.product_id === product.id
          ? { ...item, quantity: Math.min(99, item.quantity + quantity) }
          : item
      )
    )
  }

  return setCartItems([
    ...cartItems,
    {
      product_id: product.id,
      name: product.name,
      price: product.price,
      image_url: product.image_url,
      quantity: Math.min(99, quantity),
    },
  ])
}

export function updateCartItemQuantity(productId: string, quantity: number) {
  if (quantity <= 0) {
    return removeCartItem(productId)
  }

  return setCartItems(
    getCartItems().map((item) =>
      item.product_id === productId
        ? { ...item, quantity: Math.min(99, quantity) }
        : item
    )
  )
}

export function removeCartItem(productId: string) {
  return setCartItems(getCartItems().filter((item) => item.product_id !== productId))
}

export function clearCart() {
  return setCartItems([])
}
