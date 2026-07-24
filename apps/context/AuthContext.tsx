"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { authApi, refreshAccessToken } from "@/lib/api/auth";
import type { RegisterPayload } from "@/lib/api/auth";
import { DEFAULT_PLATFORM_ROUTE, LOGIN_ROUTE } from "@/lib/routes";
import type { User } from "@/lib/api/types";
import type { PersistedSession } from "@/lib/api/session-persistence";
import {
  initSessionPersistence,
  saveSession,
  loadSession,
  clearSession,
  updateSessionTokens,
  updateSessionUser,
  getSessionPreferences,
  saveSessionPreferences,
  subscribeToSessionChanges,
  startAutoRefresh,
  migrateLegacySession,
} from "@/lib/api/session-persistence";

type AuthStatus = "loading" | "authenticated" | "unauthenticated";

interface AuthContextValue {
  user: User | null;
  accessToken: string | null;
  hasActiveSession: boolean;
  status: AuthStatus;
  isAuthenticated: boolean;
  isLoading: boolean;
  sessionPreferences: {
    rememberMe: boolean;
    autoRefresh: boolean;
    syncAcrossTabs: boolean;
  };
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  register: (payload: RegisterPayload, rememberMe?: boolean) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<string | null>;
  loadCurrentUser: () => Promise<User | null>;
  setSessionPreference: (pref: string, value: boolean) => void;
  clearSession: () => void;
}

const AuthContext = React.createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = React.useState<User | null>(null);
  const [accessToken, setAccessToken] = React.useState<string | null>(null);
  const [status, setStatus] = React.useState<AuthStatus>("loading");
  const [sessionPreferences, setSessionPreferences] = React.useState({
    rememberMe: true,
    autoRefresh: true,
    syncAcrossTabs: true,
  });

  // Initialize session persistence on mount
  React.useEffect(() => {
    initSessionPersistence();
    migrateLegacySession();
    
    // Load preferences
    const prefs = getSessionPreferences();
    setSessionPreferences({
      rememberMe: prefs.rememberMe,
      autoRefresh: prefs.autoRefresh,
      syncAcrossTabs: prefs.syncAcrossTabs,
    });
  }, []);

  // Subscribe to session changes from other tabs
  React.useEffect(() => {
    const unsubscribe = subscribeToSessionChanges((session: PersistedSession | null) => {
      if (session) {
        setAccessToken(session.accessToken);
        setUser(session.user);
        setStatus("authenticated");
      } else {
        setAccessToken(null);
        setUser(null);
        setStatus("unauthenticated");
      }
    });
    
    return unsubscribe;
  }, []);

  // Setup auto-refresh
  React.useEffect(() => {
    if (!sessionPreferences.autoRefresh) return;
    
    const unsubscribe = startAutoRefresh(async () => {
      try {
        const newToken = await refreshAccessToken();
        if (newToken) {
          const session = loadSession();
          if (session) {
            updateSessionTokens(
              newToken,
              session.refreshToken,
              3600
            );
            setAccessToken(newToken);
            return true;
          }
        }
        return false;
      } catch {
        return false;
      }
    }, 60 * 1000); // Check every minute
    
    return unsubscribe;
  }, [sessionPreferences.autoRefresh]);

  const loadCurrentUser = React.useCallback(async () => {
    try {
      const nextUser = await authApi.getCurrentUser();
      setUser(nextUser);
      updateSessionUser(nextUser);
      return nextUser;
    } catch {
      setUser(null);
      return null;
    }
  }, []);

  const refresh = React.useCallback(async () => {
    try {
      const newToken = await refreshAccessToken();
      if (newToken) {
        const session = loadSession();
        if (session) {
          updateSessionTokens(
            newToken,
            session.refreshToken,
            3600
          );
          setAccessToken(newToken);
          setUser(session.user);
          updateSessionUser(session.user);
          setStatus("authenticated");
          return newToken;
        }
      }
    } catch {
      // Refresh failed
    }
    
    const session = loadSession();
    if (session) {
      setAccessToken(session.accessToken);
      setUser(session.user);
      setStatus("authenticated");
      return session.accessToken;
    }
    
    setAccessToken(null);
    setUser(null);
    setStatus("unauthenticated");
    return null;
  }, []);

  // Initial bootstrap
  React.useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      try {
        await authApi.bootstrap();
      } catch {
        // Bootstrap failed (network error, invalid session, etc.)
      }
      if (cancelled) {
        return;
      }
      
      const session = loadSession();
      if (session) {
        setAccessToken(session.accessToken);
        setUser(session.user);
        setStatus("authenticated");
      } else {
        const nextToken = authApi.getStoredToken();
        setAccessToken(nextToken);
        setUser(authApi.getStoredUser());
        setStatus(nextToken ? "authenticated" : "unauthenticated");
      }
    }

    void bootstrap();

    return () => {
      cancelled = true;
    };
  }, []);

  const setSessionPreference = React.useCallback((pref: string, value: boolean) => {
    const currentPrefs = getSessionPreferences();
    const updatedPrefs = { ...currentPrefs, [pref]: value };
    saveSessionPreferences(updatedPrefs);
    setSessionPreferences({
      rememberMe: updatedPrefs.rememberMe,
      autoRefresh: updatedPrefs.autoRefresh,
      syncAcrossTabs: updatedPrefs.syncAcrossTabs,
    });
  }, []);

  const handleClearSession = React.useCallback(() => {
    clearSession();
    setAccessToken(null);
    setUser(null);
    setStatus("unauthenticated");
    
    // Clear cookies
    if (typeof document !== "undefined") {
      document.cookie = "kami_sama_access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      document.cookie = "kami_sama_refresh=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    }
  }, []);

  function getRedirectTarget(): string {
    if (typeof window === "undefined") return "/profile-change";
    const params = new URLSearchParams(window.location.search);
    return params.get("redirect") || "/profile-change";
  }

  const login = React.useCallback(
    async (email: string, password: string, rememberMe: boolean = true) => {
      // Save preference
      saveSessionPreferences({ rememberMe });
      setSessionPreferences(prev => ({ ...prev, rememberMe }));
      
      const response = await authApi.login({ email, password });
      
      // Save session with persistence
      saveSession(
        response.accessToken,
        response.refreshToken ?? "",
        response.user,
        response.sessionId ?? `session-${Date.now()}`,
        response.expiresIn ?? 3600
      );
      
      // Set cookies for server-side authentication
      if (typeof document !== "undefined") {
        const expires = new Date();
        expires.setTime(expires.getTime() + (response.expiresIn ?? 3600) * 1000);
        
        // Set access token cookie
        document.cookie = `kami_sama_access_token=${response.accessToken}; path=/; ${rememberMe ? `expires=${expires.toUTCString()}` : ''}; ${process.env.NODE_ENV === 'production' ? 'Secure; SameSite=Strict' : ''}`;
        
        // Set refresh token cookie
        if (response.refreshToken) {
          const refreshExpires = new Date();
          refreshExpires.setTime(refreshExpires.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days
          document.cookie = `kami_sama_refresh=${response.refreshToken}; path=/; expires=${refreshExpires.toUTCString()}; ${process.env.NODE_ENV === 'production' ? 'Secure; SameSite=Strict; HttpOnly' : ''}`;
        }
      }
      
      setAccessToken(response.accessToken);
      setUser(response.user);
      setStatus("authenticated");
      
      const target = getRedirectTarget();
      if (typeof window !== "undefined") {
        window.location.assign(target);
        return;
      }
      router.replace(target);
    },
    [router]
  );

  const register = React.useCallback(
    async (payload: RegisterPayload, rememberMe: boolean = true) => {
      // Save preference
      saveSessionPreferences({ rememberMe });
      setSessionPreferences(prev => ({ ...prev, rememberMe }));
      
      const response = await authApi.register(payload);
      
      // Save session with persistence
      saveSession(
        response.accessToken,
        response.refreshToken ?? "",
        response.user,
        response.sessionId ?? `session-${Date.now()}`,
        response.expiresIn ?? 3600
      );
      
      // Set cookies for server-side authentication
      if (typeof document !== "undefined") {
        const expires = new Date();
        expires.setTime(expires.getTime() + (response.expiresIn ?? 3600) * 1000);
        
        // Set access token cookie
        document.cookie = `kami_sama_access_token=${response.accessToken}; path=/; ${rememberMe ? `expires=${expires.toUTCString()}` : ''}; ${process.env.NODE_ENV === 'production' ? 'Secure; SameSite=Strict' : ''}`;
        
        // Set refresh token cookie
        if (response.refreshToken) {
          const refreshExpires = new Date();
          refreshExpires.setTime(refreshExpires.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days
          document.cookie = `kami_sama_refresh=${response.refreshToken}; path=/; expires=${refreshExpires.toUTCString()}; ${process.env.NODE_ENV === 'production' ? 'Secure; SameSite=Strict; HttpOnly' : ''}`;
        }
      }
      
      setAccessToken(response.accessToken);
      setUser(response.user);
      setStatus("authenticated");
      
      const target = getRedirectTarget();
      if (typeof window !== "undefined") {
        window.location.assign(target);
        return;
      }
      router.replace(target);
    },
    [router]
  );

  const logout = React.useCallback(async () => {
    await authApi.logout();
    handleClearSession();
    
    // Clear cookies
    if (typeof document !== "undefined") {
      document.cookie = "kami_sama_access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      document.cookie = "kami_sama_refresh=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    }
    
    router.push(LOGIN_ROUTE);
    router.refresh();
  }, [router, handleClearSession]);

  const value = React.useMemo<AuthContextValue>(
    () => ({
      user,
      accessToken,
      hasActiveSession: Boolean(accessToken),
      status,
      isAuthenticated: status === "authenticated",
      isLoading: status === "loading",
      sessionPreferences,
      login,
      register,
      logout,
      refresh,
      loadCurrentUser,
      setSessionPreference,
      clearSession: handleClearSession,
    }),
    [
      accessToken,
      loadCurrentUser,
      login,
      logout,
      refresh,
      register,
      status,
      user,
      sessionPreferences,
      setSessionPreference,
      handleClearSession,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
