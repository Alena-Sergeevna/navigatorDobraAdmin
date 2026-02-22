"use client";

import Link from "next/link";
import { useAuth } from "../contexts/AuthContext";

const links = [
  { href: "/", label: "Дашборд" },
  { href: "/requests", label: "Заявки" },
  { href: "/categories", label: "Категории" },
  { href: "/districts", label: "Районы" },
  { href: "/users", label: "Пользователи" },
];

export default function Nav() {
  const { email, signOut } = useAuth();

  return (
    <header className="nav">
      <nav className="nav-inner">
        <div className="brand">
          <strong>Navigator Dobra</strong>
          <span className="badge">Admin</span>
        </div>
        <div className="nav-links">
          {links.map((link) => (
            <Link key={link.href} href={link.href}>
              {link.label}
            </Link>
          ))}
        </div>
        <div className="nav-user">
          <span className="muted">{email ?? "—"}</span>
          <button onClick={() => signOut()}>Выйти</button>
        </div>
      </nav>
    </header>
  );
}
