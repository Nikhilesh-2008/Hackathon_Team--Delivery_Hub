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
  const account = payload?.user || (payload?.email ? payload : {}) || {};
  const profile = payload?.profile || (payload?.userId ? payload : {}) || account.profile || {};
  const normalizedRole = (account.role || profile?.userId?.role || 'PARTICIPANT').toUpperCase();

  return {
    ...account,
    ...profile,
    ...(profile?.userId && typeof profile.userId === 'object' ? profile.userId : {}),
    id: account.id || account._id || profile?.userId?._id || profile?.userId || payload?.id || payload?._id,
    name: account.name || profile?.userId?.name || profile?.name || '',
    email: account.email || profile?.userId?.email || '',
    college: account.college || profile?.userId?.college || profile?.college || '',
    year: account.graduationYear || profile?.userId?.graduationYear || profile?.year || '',
    graduationYear: account.graduationYear || profile?.userId?.graduationYear || profile?.year || '',
    bio: profile?.bio || account.bio || '',
    role: normalizedRole,
    specialization: profile?.specialization || account.specialization || 'Generalist',
    skills: Array.isArray(profile?.skills) ? profile.skills : (Array.isArray(account.skills) ? account.skills : []),
    interests: Array.isArray(profile?.interests) ? profile.interests : (Array.isArray(account.interests) ? account.interests : []),
    availability: profile?.availability || account.availability || '8-10 hrs/week',
    codingProfiles: profile?.codingProfiles || account.codingProfiles || {},
    projects: profile?.projects || account.projects || [],
    certificates: profile?.certificates || account.certificates || [],
    profile,
    activeTeams: payload?.activeTeams || account.activeTeams || [],
    reputation: payload?.reputation ?? account.reputation ?? profile?.reputationScore ?? 0,
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
