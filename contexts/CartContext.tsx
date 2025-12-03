"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

interface CartItem {
  id: string
  name: string
  reference: string
  url: string
  quantity: number
  type: 'regular' | 'loyalty'
  pointsCost?: number
  imageUrl?: string | null
  description?: string | null
}

interface CartContextType {
  items: CartItem[]
  regularItems: CartItem[]
  loyaltyItems: CartItem[]
  add: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void
  remove: (id: string) => void
  clear: () => void
  clearLoyalty: () => void
  increase: (id: string) => void
  decrease: (id: string) => void
  isInCart: (id: string) => boolean
  getTotalPoints: () => number
  getItemCount: () => number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

const CART_STORAGE_KEY = 'opticien-cart'

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [isHydrated, setIsHydrated] = useState(false)

  // Computed values
  const regularItems = items.filter(item => item.type === 'regular')
  const loyaltyItems = items.filter(item => item.type === 'loyalty')

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed)) {
          setItems(parsed)
        }
      }
    } catch (error) {
      console.error('Failed to load cart from localStorage:', error)
    }
    setIsHydrated(true)
  }, [])

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (isHydrated) {
      try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items))
      } catch (error) {
        console.error('Failed to save cart to localStorage:', error)
      }
    }
  }, [items, isHydrated])

  const add = (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === item.id)
      if (existing) {
        const increment = item.quantity && item.quantity > 0 ? item.quantity : 1
        return prev.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + increment } : i
        )
      }
      const initialQuantity = item.quantity && item.quantity > 0 ? item.quantity : 1
      return [...prev, { ...item, quantity: initialQuantity }]
    })
  }

  const remove = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id))
  }

  const increase = (id: string) => {
    setItems((prev) =>
      prev.map((i) => {
        if (i.id === id) {
          return { ...i, quantity: i.quantity + 1 }
        }
        return i
      })
    )
  }

  const decrease = (id: string) => {
    setItems((prev) =>
      prev.flatMap((i) => {
        if (i.id !== id) return i
        const nextQuantity = i.quantity - 1
        return nextQuantity > 0 ? { ...i, quantity: nextQuantity } : []
      })
    )
  }

  const clear = () => {
    setItems([])
  }

  const clearLoyalty = () => {
    setItems((prev) => prev.filter((i) => i.type !== 'loyalty'))
  }

  const isInCart = (id: string) => {
    return items.some((i) => i.id === id)
  }

  const getTotalPoints = () => {
    return loyaltyItems.reduce((total, item) => {
      return total + (item.pointsCost || 0) * item.quantity
    }, 0)
  }

  const getItemCount = () => {
    return items.reduce((total, item) => total + item.quantity, 0)
  }

  return (
    <CartContext.Provider value={{ 
      items, 
      regularItems,
      loyaltyItems,
      add, 
      remove, 
      clear, 
      clearLoyalty,
      increase, 
      decrease, 
      isInCart,
      getTotalPoints,
      getItemCount
    }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
