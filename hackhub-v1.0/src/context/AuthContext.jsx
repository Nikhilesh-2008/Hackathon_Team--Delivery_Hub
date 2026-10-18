import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { api, setAuthToken } from '../services/api';

const AuthContext = createContext(null);
const roleLabels = {
  PARTICIPANT: 'Participant',
  MENTOR: 'Mentor',
  JUDGE: 'Judge',
  ORGANIZER: 'Organizer',
  ADMIN: 'Admin',
};

const normalizeUser = (payload) => {
  const account = payload?.user || payload || {};
  const normalizedRole = (account.role || 'PARTICIPANT').toUpperCase();
  return {
    ...account,
    ...(payload?.profile || {}),
    ...account,
    id: account.id || account._id,
    role: normalizedRole,
    profile: payload?.profile || account.profile || null,
    activeTeams: payload?.activeTeams || account.activeTeams || [],
    reputation: payload?.reputation ?? account.reputation ?? 0,
    specialization: payload?.profile?.specialization || account.specialization || '',
  };
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const restoreSession = async () => {
      const token = localStorage.getItem('hackhub_jwt_token');
      if (!token) {
        if (mounted) setIsLoading(false);
        return;
      }

      try {
        const response = await api.get('/auth/me');
        if (mounted) setUser(normalizeUser(response.data));
      } catch (error) {
        setAuthToken(null);
        if (mounted) setUser(null);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    restoreSession();
    return () => { mounted = false; };
  }, []);

  const login = async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    setAuthToken(response.data.token);
    try {
      const contextResponse = await api.get('/auth/me');
      const nextUser = normalizeUser(contextResponse.data);
      setUser(nextUser);
      return nextUser;
    } catch (error) {
      setAuthToken(null);
      setUser(null);
      throw error;
    }
  };

  const register = async (registration) => {
    // Only register account; do not set token or user state so user redirects to login page
    const response = await api.post('/auth/register', registration);
    return response.data;
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout', {});
    } catch (error) {
      console.warn('[AuthContext] Server logout failed; clearing local session anyway:', error.message);
    } finally {
      setAuthToken(null);
      setUser(null);
    }
  };

  const updateUser = async (updates) => {
    const response = await api.patch('/profiles/me', updates);
    const updatedProfile = response.data;
    setUser((current) => current ? normalizeUser({
      ...current,
      user: { ...current, ...(updatedProfile.userId || {}) },
      profile: updatedProfile,
    }) : current);
    return updatedProfile;
  };

  const value = useMemo(() => {
    const roleKey = (user?.role || '').toUpperCase();
    return {
      user,
      activeRole: roleLabels[roleKey] || user?.role || 'Participant',
      isLoading,
      login,
      register,
      logout,
      updateUser,
    };
  }, [user, isLoading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
