import React, { createContext, useState, useContext, useEffect } from 'react';
import authService from '../services/api/auth';

console.log('🔐 AuthContext cargado');

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  console.log('🔐 AuthProvider renderizado');
  
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    console.log('🔐 AuthProvider useEffect iniciado');
    checkAuth();
  }, []);

  const checkAuth = () => {
    console.log('🔐 checkAuth ejecutado');
    try {
      const currentUser = authService.getCurrentUser();
      const isAuth = authService.isAuthenticated();
      
      console.log('🔐 Auth check result:', { currentUser, isAuth });
      
      setUser(currentUser);
      setIsAuthenticated(isAuth);
      setLoading(false);
      
      console.log('🔐 Auth state actualizado');
    } catch (error) {
      console.error('🔐 Error en checkAuth:', error);
      setUser(null);
      setIsAuthenticated(false);
      setLoading(false);
    }
  };

  const login = async (phoneOrEmail, password) => {
    console.log('🔐 Login iniciado para:', phoneOrEmail);
    const result = await authService.login(phoneOrEmail, password);
    
    console.log('🔐 Login result:', result);
    
    if (result.success) {
      setUser(result.user);
      setIsAuthenticated(true);
      console.log('🔐 Login exitoso, estado actualizado');
    }
    
    return result;
  };

  const register = async (userData) => {
    console.log('🔐 Register iniciado para:', userData.email);
    const result = await authService.register(userData);
    
    console.log('🔐 Register result:', result);
    
    if (result.success) {
      setUser(result.user);
      setIsAuthenticated(true);
      console.log('🔐 Register exitoso, estado actualizado');
    }
    
    return result;
  };

  const logout = () => {
    console.log('🔐 Logout ejecutado');
    authService.logout();
    setUser(null);
    setIsAuthenticated(false);
  };

  const updateUser = (updates) => {
    console.log('🔐 UpdateUser ejecutado:', updates);
    const updatedUser = authService.updateUserData(updates);
    setUser(updatedUser);
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    isPremium: user?.isPremium || false,
    isAdmin: user?.isAdmin || false,
    freeViewsLeft: user?.freeViewsLeft || 0,
    login,
    register,
    logout,
    updateUser,
    checkAuth
  };

  console.log('🔐 AuthProvider value:', value);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};