"use client";

import Nav from "../../components/Nav";
import AuthGate from "../../components/AuthGate";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGate>
      <Nav />
      <main className="container">{children}</main>
    </AuthGate>
  );
}
