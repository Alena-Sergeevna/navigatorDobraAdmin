"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";

type CategoryRow = {
  id: string;
  name: string;
  description: string | null;
};

export default function CategoriesPage() {
  const [rows, setRows] = useState<CategoryRow[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [query, setQuery] = useState("");
  const [saving, setSaving] = useState(false);

  async function load() {
    const { data } = await supabase
      .from("categories")
      .select("id,name,description")
      .order("name", { ascending: true });
    setRows((data as CategoryRow[]) ?? []);
  }

  useEffect(() => {
    load();
  }, []);

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    const { error } = await supabase.from("categories").insert({
      name: name.trim(),
      description: description.trim() || null,
    });
    setSaving(false);
    if (!error) {
      setName("");
      setDescription("");
      load();
    }
  }

  async function onDelete(id: string) {
    const confirmDelete = window.confirm("Удалить категорию?");
    if (!confirmDelete) return;
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (!error) {
      setRows((prev) => prev.filter((row) => row.id !== id));
    }
  }

  return (
    <section className="card">
      <h2>Категории</h2>
      <form onSubmit={onCreate} className="grid" style={{ gap: 12 }}>
        <label>
          Название
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Например: Продукты"
            style={{ width: "100%", marginTop: 6 }}
          />
        </label>
        <label>
          Описание
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Короткое описание"
            style={{ width: "100%", marginTop: 6 }}
          />
        </label>
        <button type="submit" disabled={saving}>
          {saving ? "Сохранение..." : "Добавить категорию"}
        </button>
      </form>

      <hr style={{ margin: "20px 0", borderColor: "#e2e8f0" }} />

      <label>
        Поиск
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Название"
          style={{ width: "100%", marginTop: 6 }}
        />
      </label>

      <table className="table">
        <thead>
          <tr>
            <th>Название</th>
            <th>Описание</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {rows
            .filter((row) => {
              const q = query.trim().toLowerCase();
              if (!q) return true;
              return row.name.toLowerCase().includes(q);
            })
            .map((row) => (
              <tr key={row.id}>
                <td>{row.name}</td>
                <td>{row.description ?? "—"}</td>
                <td>
                  <button onClick={() => onDelete(row.id)}>Удалить</button>
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </section>
  );
}
