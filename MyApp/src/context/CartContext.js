import React, { createContext, useContext, useReducer, useState, useEffect } from 'react';
import { products as initialProducts } from '../data/products';
import { API_URL } from '../utils/api';
import { useAuth } from './AuthContext';

const CartContext = createContext();

function cartReducer(state, action) {
  switch (action.type) {
    case 'SET_CART':
      return action.items;
    case 'ADD_ITEM': {
      const existing = state.find(i => i.id === action.item.id);
      if (existing) {
        return state.map(i =>
          i.id === action.item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...state, { ...action.item, quantity: 1 }];
    }
    case 'REMOVE_ITEM':
      return state.filter(i => i.id !== action.id);
    case 'UPDATE_QTY':
      return state.map(i =>
        i.id === action.id ? { ...i, quantity: action.qty } : i
      ).filter(i => i.quantity > 0);
    case 'CLEAR_CART':
      return [];
    default:
      return state;
  }
}

export function CartProvider({ children }) {
  const [cart, dispatch] = useReducer(cartReducer, []);
  const [productsList, setProductsList] = useState(initialProducts);
  const [ordersList, setOrdersList] = useState([]);
  const [wishlist, setWishlist] = useState([]); // array of product objects
  const { user, token, adminToken } = useAuth();

  // Fetch initial products and orders from the backend API
  const fetchProducts = async () => {
    try {
      const prodRes = await fetch(`${API_URL}/api/products`);
      if (prodRes.ok) {
        const prodData = await prodRes.json();
        setProductsList(prodData);
      }
    } catch (err) {
      console.warn('Could not fetch products from server, using default data:', err);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Sync user cart and wishlist from database on login/logout
  useEffect(() => {
    const loadUserData = async () => {
      if (user && token) {
        try {
          // 1. Fetch server cart
          const cartRes = await fetch(`${API_URL}/api/sync/cart/${user.id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (cartRes.ok) {
            const serverCart = await cartRes.json();
            // If guest had items before login, merge them
            if (cart.length > 0) {
              const merged = [...serverCart];
              for (const guestItem of cart) {
                const idx = merged.findIndex(i => i.id === guestItem.id);
                if (idx > -1) {
                  merged[idx].quantity += guestItem.quantity;
                } else {
                  merged.push(guestItem);
                }
              }
              dispatch({ type: 'SET_CART', items: merged });
            } else {
              dispatch({ type: 'SET_CART', items: serverCart });
            }
          }

          // 2. Fetch server wishlist
          const wishRes = await fetch(`${API_URL}/api/sync/wishlist/${user.id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (wishRes.ok) {
            const serverWishlist = await wishRes.json();
            setWishlist(serverWishlist);
          }

          // 3. Fetch server orders
          const ordersRes = await fetch(`${API_URL}/api/orders/user/${user.id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (ordersRes.ok) {
            const serverOrders = await ordersRes.json();
            setOrdersList(serverOrders);
          }
        } catch (err) {
          console.warn('Failed loading user cart/wishlist/orders from server:', err);
        }
      } else if (!user) {
        dispatch({ type: 'CLEAR_CART' });
        setWishlist([]);
        setOrdersList([]);
      }
    };

    loadUserData();
  }, [user?.id, token]);

  // Sync cart changes to server
  useEffect(() => {
    const syncCartWithServer = async () => {
      if (user && token) {
        try {
          await fetch(`${API_URL}/api/sync/cart`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              userId: user.id,
              items: cart.map(item => ({
                productId: item.id,
                quantity: item.quantity
              }))
            })
          });
        } catch (err) {
          console.warn('Failed to sync cart with server:', err);
        }
      }
    };
    
    // Simple debounce/execution on cart state change
    const delayDebounceFn = setTimeout(() => {
      syncCartWithServer();
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [cart, user?.id, token]);

  // Cart actions
  const addToCart    = (item) => dispatch({ type: 'ADD_ITEM', item });
  const removeFromCart = (id) => dispatch({ type: 'REMOVE_ITEM', id });
  const updateQty    = (id, qty) => dispatch({ type: 'UPDATE_QTY', id, qty });
  const clearCart    = () => dispatch({ type: 'CLEAR_CART' });

  const cartCount = cart.reduce((sum, i) => sum + i.quantity, 0);
  const cartTotal = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);

  // Products actions
  const addProduct = async (product) => {
    try {
      const res = await fetch(`${API_URL}/api/products`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify(product),
      });
      if (res.ok) {
        fetchProducts(); // reload
        return true;
      }
    } catch (err) {
      console.error('Error adding product:', err);
    }
    return false;
  };

  const updateProduct = async (id, updatedProduct) => {
    try {
      const res = await fetch(`${API_URL}/api/products/${id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify(updatedProduct),
      });
      if (res.ok) {
        fetchProducts(); // reload
        return true;
      }
    } catch (err) {
      console.error('Error updating product:', err);
    }
    return false;
  };

  const deleteProduct = async (id) => {
    try {
      const res = await fetch(`${API_URL}/api/products/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      });
      if (res.ok) {
        fetchProducts(); // reload
        return true;
      }
    } catch (err) {
      console.error('Error deleting product:', err);
    }
    return false;
  };

  // Orders actions
  const addOrder = async (order, userId) => {
    try {
      const res = await fetch(`${API_URL}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: order.id,
          customerName: order.customer,
          customerEmail: order.customerEmail || 'customer@example.com',
          customerPhone: order.customerPhone || '',
          total: order.total,
          items: cart.map(i => ({ id: i.id, price: i.price, quantity: i.quantity })),
          address: order.address,
          method: order.method,
          userId: userId || null,
        }),
      });
      if (res.ok) {
        const createdOrder = await res.json();
        const formatted = {
          ...createdOrder,
          customer: createdOrder.customerName,
          items: cart.map(i => i.name)
        };
        setOrdersList(prev => [formatted, ...prev]);
        return createdOrder;
      }
    } catch (err) {
      console.error('Error placing order:', err);
    }
    return null;
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const res = await fetch(`${API_URL}/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setOrdersList(prev =>
          prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o)
        );
        return true;
      }
    } catch (err) {
      console.error('Error updating order status:', err);
    }
    return false;
  };

  // Wishlist actions
  const toggleWishlist = async (product) => {
    const exists = wishlist.some(item => item.id === product.id);
    if (exists) {
      setWishlist(prev => prev.filter(item => item.id !== product.id));
    } else {
      setWishlist(prev => [...prev, product]);
    }

    if (user && token) {
      try {
        await fetch(`${API_URL}/api/sync/wishlist`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            userId: user.id,
            productId: product.id
          })
        });
      } catch (err) {
        console.warn('Failed to sync wishlist with server:', err);
      }
    }
  };

  const isWishlisted = (productId) => {
    return wishlist.some(item => item.id === productId);
  };

  return (
    <CartContext.Provider value={{
      cart,
      addToCart,
      removeFromCart,
      updateQty,
      clearCart,
      cartCount,
      cartTotal,
      productsList,
      addProduct,
      updateProduct,
      deleteProduct,
      ordersList,
      addOrder,
      updateOrderStatus,
      wishlist,
      toggleWishlist,
      isWishlisted
    }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);