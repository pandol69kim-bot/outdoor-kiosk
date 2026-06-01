'use client'

import { useEffect, useState } from 'react'
import {
  addProductToCart,
  CART_UPDATED_EVENT,
  clearCart as clearStoredCart,
  getCartItems,
  removeCartItem as removeStoredCartItem,
  updateCartItemQuantity as updateStoredCartItemQuantity,
} from '@/lib/cart'
import type { CartItem, Product } from '@/lib/types'

export function useCart() {
  const [items, setItems] = useState<CartItem[]>([])
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    function syncCart() {
      setItems(getCartItems())
      setIsReady(true)
    }

    syncCart()
    window.addEventListener('storage', syncCart)
    window.addEventListener(CART_UPDATED_EVENT, syncCart)

    return () => {
      window.removeEventListener('storage', syncCart)
      window.removeEventListener(CART_UPDATED_EVENT, syncCart)
    }
  }, [])

  return {
    items,
    isReady,
    totalQuantity: items.reduce((total, item) => total + item.quantity, 0),
    totalAmount: items.reduce((total, item) => total + item.price * item.quantity, 0),
    addItem(product: Product, quantity: number) {
      setItems(addProductToCart(product, quantity))
    },
    updateQuantity(productId: string, quantity: number) {
      setItems(updateStoredCartItemQuantity(productId, quantity))
    },
    removeItem(productId: string) {
      setItems(removeStoredCartItem(productId))
    },
    clearCart() {
      setItems(clearStoredCart())
    },
  }
}
