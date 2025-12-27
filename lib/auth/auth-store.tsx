"use client";

import React from "react";

type User = { id: string; name: string; email: string } | null;

const AuthCtx = React.createContext<{
  user: User;
  loading: boolean;
  refresh: () => Promise<void>;
}>({ user: null, loading: true, refresh: async () => {} });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User>(null);
  const [loading, setLoading] = React.useState(true);

  const refresh = React.useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/auth/me", { credentials: "include" });
    const data = await res.json();
    setUser(data.user ?? null);
    setLoading(false);
  }, []);

  React.useEffect(() => {
    refresh();
  }, [refresh]);

  return <AuthCtx.Provider value={{ user, loading, refresh }}>{children}</AuthCtx.Provider>;
}

export function useAuth() {
  return React.useContext(AuthCtx);
}
