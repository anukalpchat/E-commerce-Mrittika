'use client'

import { createContext, useContext, useEffect, useReducer, ReactNode } from 'react'
import type { Product } from './products'

export interface CartItem {
  product: Product
  quantity: number
}

interface CartState {
  items: CartItem[]
}

type CartAction =
  | { type: 'ADD'; product: Product; quantity?: number }
  | { type: 'REMOVE'; slug: string }
  | { type: 'UPDATE_QTY'; slug: string; quantity: number }
  | { type: 'CLEAR' }
  | { type: 'HYDRATE'; items: CartItem[] }

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD': {
      const qty = action.quantity ?? 1
      const existing = state.items.find(i => i.product.slug === action.product.slug)
      if (existing) {
        return {
          items: state.items.map(i =>
            i.product.slug === action.product.slug
              ? { ...i, quantity: i.quantity + qty }
              : i
          ),
        }
      }
      return { items: [...state.items, { product: action.product, quantity: qty }] }
    }
    case 'REMOVE':
      return { items: state.items.filter(i => i.product.slug !== action.slug) }
    case 'UPDATE_QTY':
      if (action.quantity <= 0) {
        return { items: state.items.filter(i => i.product.slug !== action.slug) }
      }
      return {
        items: state.items.map(i =>
          i.product.slug === action.slug ? { ...i, quantity: action.quantity } : i
        ),
      }
    case 'CLEAR':
      return { items: [] }
    case 'HYDRATE':
      return { items: action.items }
    default:
      return state
  }
}

interface CartContextValue {
  items: CartItem[]
  itemCount: number
  subtotal: number
  addItem: (product: Product, quantity?: number) => void
  removeItem: (slug: string) => void
  updateQty: (slug: string, quantity: number) => void
  clearCart: () => void
}

const CartContext = createContext<CartContextValue | null>(null)

const STORAGE_KEY = 'mrittika_cart'

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [] })

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) dispatch({ type: 'HYDRATE', items: JSON.parse(stored) })
    } catch {}
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.items))
    } catch {}
  }, [state.items])

  const itemCount = state.items.reduce((sum, i) => sum + i.quantity, 0)
  const subtotal = state.items.reduce((sum, i) => sum + i.product.price * i.quantity, 0)

  return (
    <CartContext.Provider value={{
      items: state.items,
      itemCount,
      subtotal,
      addItem: (product, quantity) => dispatch({ type: 'ADD', product, quantity }),
      removeItem: (slug) => dispatch({ type: 'REMOVE', slug }),
      updateQty: (slug, quantity) => dispatch({ type: 'UPDATE_QTY', slug, quantity }),
      clearCart: () => dispatch({ type: 'CLEAR' }),
    }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used inside CartProvider')
  return ctx
}
