"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

interface CartItem {
  id: string
  name: string
  reference: string
  url: string
  quantity: number
}

interface CartContextType {
  items: CartItem[]
  add: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void
  remove: (id: string) => void
  clear: () => void
  increase: (id: string) => void
  decrease: (id: string) => void
  isInCart: (id: string) => boolean
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])

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
      prev.map((i) => (i.id === id ? { ...i, quantity: i.quantity + 1 } : i))
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

  const isInCart = (id: string) => {
    return items.some((i) => i.id === id)
  }

  return (
    <CartContext.Provider value={{ items, add, remove, clear, increase, decrease, isInCart }}>
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
