import React, { createContext, useContext, useState, useEffect } from 'react';
import { mockAuthService } from '../services/mockAuthService';
import { authApi } from '../services/authApi';

const AuthContext = createContext(null);
const TOKEN_KEY = 'hackhub_jwt_token';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [activeRole, setActiveRole] = useState('Participant');
  const [isLoading, setIsLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        if (localStorage.getItem(TOKEN_KEY)) {
          const res = await authApi.getMe();
          if (!res.success || !res.data) throw new Error('Unable to restore your session');
          setUser(res.data);
          setActiveRole(res.data.role || 'Participant');
          setIsDemo(false);
        } else {
          setUser(null);
          setActiveRole('Participant');
          setIsDemo(false);
        }
      } catch {
        await authApi.logout();
        setUser(null);
        setActiveRole('Participant');
        setIsDemo(false);
      } finally {
        setIsLoading(false);
      }
    };
    init();
  }, []);

  const login = async (email, password) => {
    const res = await authApi.login(email, password);
    const u = res.data;
    setUser(u);
    if (u?.role) setActiveRole(u.role);
    setIsDemo(false);
    return u;
  };

  const register = async (userData) => {
    const res = await authApi.register(userData);
    const u = res.data;
    setUser(u);
    if (u?.role) setActiveRole(u.role);
    setIsDemo(false);
    return u;
  };

  const logout = async () => {
    await authApi.logout();
    setUser(null);
    setActiveRole('Participant');
    setIsDemo(false);
  };

  const switchRole = (role) => {
    if (!isDemo) return;
    mockAuthService.switchRole(role);
    setActiveRole(role);
  };

  const enterDemoMode = async (role) => {
    await authApi.logout();
    const demoUser = await mockAuthService.getCurrentUser();
    mockAuthService.switchRole(role);
    setUser(demoUser);
    setActiveRole(role);
    setIsDemo(true);
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
      enterDemoMode,
      updateUser,
      isLoading,
      isDemo,
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
