import React, { createContext, useState, useContext, useEffect } from 'react';
import authService from '../services/api/auth';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = () => {
    const currentUser = authService.getCurrentUser();
    const isAuth = authService.isAuthenticated();
    
    setUser(currentUser);
    setIsAuthenticated(isAuth);
    setLoading(false);
  };

  const login = async (phoneOrEmail, password) => {
    const result = await authService.login(phoneOrEmail, password);
    
    if (result.success) {
      setUser(result.user);
      setIsAuthenticated(true);
    }
    
    return result;
  };

  const register = async (userData) => {
    const result = await authService.register(userData);
    
    if (result.success) {
      setUser(result.user);
      setIsAuthenticated(true);
    }
    
    return result;
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setIsAuthenticated(false);
  };

  const updateUser = (updates) => {
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

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};