import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";
import { getAccessToken, setTokens, setStoredUser, getStoredUser, clearTokens } from "../lib/authStorage";
import { setUnauthorizedHandler, type AuthUser } from "../lib/api";

type AuthContextValue = {
  isLoading: boolean;
  isAuthenticated: boolean;
  user: AuthUser | null;
  login: (accessToken: string, refreshToken: string, user: AuthUser) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<AuthUser | null>(null);

  const logout = useCallback(async () => {
    await clearTokens();
    setUser(null);
  }, []);

  const login = useCallback(async (accessToken: string, refreshToken: string, loggedInUser: AuthUser) => {
    await setTokens(accessToken, refreshToken);
    await setStoredUser(loggedInUser);
    setUser(loggedInUser);
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(() => setUser(null));
    (async () => {
      const token = await getAccessToken();
      if (token) {
        const storedUser = await getStoredUser<AuthUser>();
        if (storedUser) setUser(storedUser);
      }
      setIsLoading(false);
    })();
    return () => setUnauthorizedHandler(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AuthContext.Provider value={{ isLoading, isAuthenticated: !!user, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
