import React, { createContext, useContext, useState } from 'react';
import { API_URL } from '../utils/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [adminToken, setAdminToken] = useState(null);

  const login = async (email, password) => {
    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok) {
        setToken(data.token);
        
        // Fetch user order history upon successful login
        const ordersRes = await fetch(`${API_URL}/api/orders/user/${data.id}`, {
          headers: { 'Authorization': `Bearer ${data.token}` }
        });
        const ordersData = ordersRes.ok ? await ordersRes.json() : [];
        
        // Fetch saved addresses
        const addrRes = await fetch(`${API_URL}/api/auth/addresses/user/${data.id}`, {
          headers: { 'Authorization': `Bearer ${data.token}` }
        });
        const addrData = addrRes.ok ? await addrRes.json() : [];

        const userData = {
          id: data.id,
          name: data.name,
          email: data.email,
          phone: data.phone,
          orders: ordersData,
          addresses: addrData
        };
        setUser(userData);
        return { success: true, user: userData, token: data.token };
      } else {
        return { success: false, error: data.error || 'Invalid credentials' };
      }
    } catch (err) {
      console.error('Login error:', err);
      return { success: false, error: 'Cannot connect to the authentication server.' };
    }
  };

  const register = async (name, email, phone, password) => {
    try {
      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, password }),
      });
      const data = await res.json();
      if (res.ok) {
        setToken(data.token);
        const userData = {
          id: data.id,
          name: data.name,
          email: data.email,
          phone: data.phone,
          orders: [],
          addresses: []
        };
        setUser(userData);
        return { success: true, user: userData, token: data.token };
      } else {
        return { success: false, error: data.error || 'Registration failed.' };
      }
    } catch (err) {
      console.error('Registration error:', err);
      return { success: false, error: 'Cannot connect to the authentication server.' };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
  };

  const adminLogin = async (username, password) => {
    try {
      const res = await fetch(`${API_URL}/api/auth/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setAdminToken(data.token);
        return { success: true, token: data.token };
      } else {
        return { success: false, error: data.error || 'Invalid credentials' };
      }
    } catch (err) {
      console.error('Admin login error:', err);
      return { success: false, error: 'Cannot connect to the authentication server.' };
    }
  };

  const adminLogout = () => {
    setAdminToken(null);
  };
  
  const isLoggedIn = !!user;

  const updateProfile = async (profileData) => {
    if (!user) return { success: false, error: 'Not authenticated' };
    try {
      const res = await fetch(`${API_URL}/api/auth/profile/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(profileData),
      });
      const data = await res.json();
      if (res.ok) {
        setUser(prev => ({
          ...prev,
          name: data.name,
          email: data.email,
          phone: data.phone,
          addresses: data.addresses || prev.addresses
        }));
        return { success: true };
      } else {
        return { success: false, error: data.error || 'Failed to update profile.' };
      }
    } catch (err) {
      console.error('Update profile error:', err);
      return { success: false, error: 'Server connection failed.' };
    }
  };

  const loadAddresses = async () => {
    if (!user) return;
    try {
      const res = await fetch(`${API_URL}/api/auth/addresses/user/${user.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const addrData = await res.json();
        setUser(prev => ({ ...prev, addresses: addrData }));
      }
    } catch (err) {
      console.error('Load addresses error:', err);
    }
  };

  const addAddress = async (addressData) => {
    if (!user) return { success: false, error: 'Not logged in' };
    try {
      const res = await fetch(`${API_URL}/api/auth/addresses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ ...addressData, userId: user.id }),
      });
      const data = await res.json();
      if (res.ok) {
        await loadAddresses();
        return { success: true, address: data };
      } else {
        return { success: false, error: data.error || 'Failed to add address.' };
      }
    } catch (err) {
      console.error('Add address error:', err);
      return { success: false, error: 'Server connection error.' };
    }
  };

  const deleteAddress = async (addressId) => {
    if (!user) return { success: false, error: 'Not logged in' };
    try {
      const res = await fetch(`${API_URL}/api/auth/addresses/${addressId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        await loadAddresses();
        return { success: true };
      } else {
        return { success: false, error: 'Failed to delete address.' };
      }
    } catch (err) {
      console.error('Delete address error:', err);
      return { success: false, error: 'Server connection error.' };
    }
  };

  const addOrderToUser = (order) => {
    setUser(prev => {
      if (!prev) return null;
      return {
        ...prev,
        orders: [order, ...(prev.orders || [])]
      };
    });
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      login,
      logout,
      register,
      isLoggedIn,
      updateProfile,
      loadAddresses,
      addAddress,
      deleteAddress,
      addOrderToUser,
      adminToken,
      adminLogin,
      adminLogout,
      isAdminLoggedIn: !!adminToken
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
