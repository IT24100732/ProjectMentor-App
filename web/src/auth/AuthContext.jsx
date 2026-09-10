import { createContext, useContext, useState } from 'react';
import { login as loginRequest } from '../api/projectMentorApi';

const storageKey = 'projectmentor.auth';
const AuthContext = createContext(null);

function readStoredAuth() {
  try {
    const stored = localStorage.getItem(storageKey);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(readStoredAuth);

  function saveSession(nextSession) {
    const next = { token: nextSession.token, user: {
      userId: nextSession.userId,
      email: nextSession.email,
      fullName: nextSession.fullName,
      role: nextSession.role,
    } };
    localStorage.setItem(storageKey, JSON.stringify(next));
    setSession(next);
    return nextSession;
  }

  async function login(credentials) {
    return saveSession(await loginRequest(credentials));
  }

  function loginWithSession(nextSession) {
    return saveSession(nextSession);
  }

  function logout() {
    localStorage.removeItem(storageKey);
    setSession(null);
  }

  const value = {
    token: session?.token ?? '',
    user: session?.user ?? null,
    isAuthenticated: Boolean(session?.token),
    login,
    loginWithSession,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider.');
  return context;
}
