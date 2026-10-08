import React, { createContext, useContext, useState, useEffect } from 'react';
import { mockAuthService } from '../services/mockAuthService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [activeRole, setActiveRole] = useState('Participant');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const u = await mockAuthService.getCurrentUser();
      const r = mockAuthService.getActiveRole();
      setUser(u);
      setActiveRole(r);
      setIsLoading(false);
    };
    init();
  }, []);

  const login = async (email, password) => {
    const u = await mockAuthService.login(email, password);
    setUser(u);
    if (u?.role) setActiveRole(u.role);
    return u;
  };

  const register = async (userData) => {
    const u = await mockAuthService.register(userData);
    setUser(u);
    if (u?.role) setActiveRole(u.role);
    return u;
  };

  const logout = async () => {
    await mockAuthService.logout();
    setUser(null);
    setActiveRole('Participant');
  };

  const switchRole = (role) => {
    mockAuthService.switchRole(role);
    setActiveRole(role);
  };

  const updateUser = async (data) => {
    const updated = await mockAuthService.updateCurrentUser(data);
    setUser(updated);
    return updated;
  };

  return (
    <AuthContext.Provider value={{
      user,
      activeRole,
      login,
      register,
      logout,
      switchRole,
      updateUser,
      isLoading,
      demoRoles: mockAuthService.getDemoRoles()
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
