import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('smart_hostel_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('smart_hostel_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      api.get('/auth/me')
        .then((res) => {
          const u = res.data?.user || res.data?.data?.user;
          if (u) {
            setUser(u);
            localStorage.setItem('smart_hostel_user', JSON.stringify(u));
          }
        })
        .catch(() => {
          logout();
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const tok = res.data?.token || res.data?.data?.token;
    const u = res.data?.user || res.data?.data?.user;
    if (tok && u) {
      setToken(tok);
      setUser(u);
      localStorage.setItem('smart_hostel_token', tok);
      localStorage.setItem('smart_hostel_user', JSON.stringify(u));
    }
    return res.data;
  };

  const register = async (studentData) => {
    const res = await api.post('/auth/register', studentData);
    const tok = res.data?.token || res.data?.data?.token;
    const u = res.data?.user || res.data?.data?.user;
    if (tok && u) {
      setToken(tok);
      setUser(u);
      localStorage.setItem('smart_hostel_token', tok);
      localStorage.setItem('smart_hostel_user', JSON.stringify(u));
    }
    return res.data;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('smart_hostel_token');
    localStorage.removeItem('smart_hostel_user');
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
