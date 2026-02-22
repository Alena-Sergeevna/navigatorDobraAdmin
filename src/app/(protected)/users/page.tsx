"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";

type UserRow = {
  id: string;
  full_name: string | null;
  role: string;
  trust_score: number;
  created_at: string;
};

export default function UsersPage() {
  const [rows, setRows] = useState<UserRow[]>([]);
  const [query, setQuery] = useState("");

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("profiles")
        .select("id,full_name,role,trust_score,created_at")
        .order("created_at", { ascending: false })
        .limit(50);
      setRows((data as UserRow[]) ?? []);
    }
    load();
  }, []);

  return (
    <section className="card">
      <h2>Пользователи</h2>
      <label>
        Поиск
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Имя"
          style={{ width: "100%", marginTop: 6 }}
        />
      </label>
      <table className="table">
        <thead>
          <tr>
            <th>Имя</th>
            <th>Роль</th>
            <th>Доверие</th>
            <th>Создан</th>
          </tr>
        </thead>
        <tbody>
          {rows
            .filter((row) => {
              const q = query.trim().toLowerCase();
              if (!q) return true;
              return (row.full_name ?? "").toLowerCase().includes(q);
            })
            .map((row) => (
              <tr key={row.id}>
                <td>{row.full_name ?? "—"}</td>
                <td>{row.role}</td>
                <td>{row.trust_score}</td>
                <td>{new Date(row.created_at).toLocaleString()}</td>
              </tr>
            ))}
        </tbody>
      </table>
    </section>
  );
}
