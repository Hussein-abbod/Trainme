import React, { createContext, useContext, useState, useCallback } from 'react';
import { apiCache } from '../api/client.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('tm_user') || 'null'); }
    catch { return null; }
  });

  const login = useCallback((tokenResponse) => {
    localStorage.setItem('tm_token', tokenResponse.access_token);
    const u = { id: tokenResponse.user_id, name: tokenResponse.name, role: tokenResponse.role };
    localStorage.setItem('tm_user', JSON.stringify(u));
    setUser(u);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('tm_token');
    localStorage.removeItem('tm_user');
    apiCache.clear(); // wipe all cached API responses on logout
    setUser(null);
  }, []);

  const isLoggedIn = !!localStorage.getItem('tm_token');
  const role       = user?.role || null;
  const token      = localStorage.getItem('tm_token');

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoggedIn, role, token }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
