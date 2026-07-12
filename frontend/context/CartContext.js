import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { api } from '../lib/api';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { token } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const refreshCart = useCallback(async () => {
    if (!token) {
      setItems([]);
      return;
    }
    setLoading(true);
    try {
      const data = await api.get('/cart', token);
      setItems(data.items);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  async function addToCart(productId, quantity = 1) {
    if (!token) throw new Error('Please log in to add items to your cart.');
    await api.post('/cart', { product_id: productId, quantity }, token);
    await refreshCart();
  }

  async function updateQuantity(cartItemId, quantity) {
    await api.put(`/cart/${cartItemId}`, { quantity }, token);
    await refreshCart();
  }

  async function removeItem(cartItemId) {
    await api.del(`/cart/${cartItemId}`, token);
    await refreshCart();
  }

  const total = items.reduce((sum, i) => sum + Number(i.price) * i.quantity, 0);
  const count = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider
      value={{ items, loading, total, count, addToCart, updateQuantity, removeItem, refreshCart }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside CartProvider');
  return ctx;
}
