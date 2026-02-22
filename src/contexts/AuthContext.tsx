"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabaseClient";

type Profile = {
  id: string;
  full_name: string | null;
  role: string;
};

type AuthState = {
  userId: string | null;
  email: string | null;
  profile: Profile | null;
  loading: boolean;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [userId, setUserId] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function load() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!isMounted) return;
      const user = session?.user ?? null;
      setUserId(user?.id ?? null);
      setEmail(user?.email ?? null);

      if (user?.id) {
        const { data } = await supabase
          .from("profiles")
          .select("id,full_name,role")
          .eq("id", user.id)
          .maybeSingle();
        if (isMounted) {
          setProfile((data as Profile | null) ?? null);
        }
      } else {
        setProfile(null);
      }

      if (isMounted) setLoading(false);
    }

    load();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      setLoading(true);
      load();
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const value = useMemo(
    () => ({
      userId,
      email,
      profile,
      loading,
      signOut: async () => {
        await supabase.auth.signOut();
      },
    }),
    [userId, email, profile, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
