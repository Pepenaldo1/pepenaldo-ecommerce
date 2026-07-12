import { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('pepenaldo_token');
    const storedUser = localStorage.getItem('pepenaldo_user');
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  function persist(userData, tokenData) {
    setUser(userData);
    setToken(tokenData);
    localStorage.setItem('pepenaldo_token', tokenData);
    localStorage.setItem('pepenaldo_user', JSON.stringify(userData));
  }

  async function login(email, password) {
    const data = await api.post('/auth/login', { email, password });
    persist(data.user, data.token);
    return data.user;
  }

  async function register(name, email, password, phone) {
    const data = await api.post('/auth/register', { name, email, password, phone });
    persist(data.user, data.token);
    return data.user;
  }

  function logout() {
    setUser(null);
    setToken(null);
    localStorage.removeItem('pepenaldo_token');
    localStorage.removeItem('pepenaldo_user');
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, updateSession: persist }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
