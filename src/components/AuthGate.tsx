"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "../contexts/AuthContext";

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const { userId, profile, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !userId) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    }
  }, [loading, userId, pathname, router]);

  if (loading) {
    return (
      <div className="container">
        <div className="card">Загрузка...</div>
      </div>
    );
  }

  if (!userId) {
    return null;
  }

  if (profile && profile.role !== "admin") {
    return (
      <div className="container">
        <div className="card">
          <h2>Доступ запрещен</h2>
          <p className="muted">Нужна роль администратора.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
