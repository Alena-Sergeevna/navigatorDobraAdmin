"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";

type DistrictRow = {
  id: string;
  name: string;
  code: string | null;
};

export default function DistrictsPage() {
  const [rows, setRows] = useState<DistrictRow[]>([]);
  const [query, setQuery] = useState("");
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("districts")
        .select("id,name,code")
        .order("name", { ascending: true })
        .limit(200);
      setRows((data as DistrictRow[]) ?? []);
    }
    load();
  }, []);

  async function updateDistrict(
    id: string,
    patch: Partial<Pick<DistrictRow, "name" | "code">>,
  ) {
    setSavingId(id);
    const { data, error } = await supabase
      .from("districts")
      .update(patch)
      .eq("id", id)
      .select("id,name,code")
      .single();
    if (!error && data) {
      setRows((prev) => prev.map((r) => (r.id === id ? data : r)));
    }
    setSavingId(null);
  }

  async function onUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadStatus(null);
    try {
      const text = await file.text();
      const json = JSON.parse(text);
      const { data, error } = await supabase.rpc("import_districts_geojson", {
        p_geojson: json,
      });
      if (error) {
        setUploadStatus(`Ошибка: ${error.message}`);
      } else {
        setUploadStatus(`Загружено объектов: ${data}`);
        const { data: refreshed } = await supabase
          .from("districts")
          .select("id,name,code")
          .order("name", { ascending: true })
          .limit(200);
        setRows((refreshed as DistrictRow[]) ?? []);
      }
    } catch (err) {
      setUploadStatus(`Ошибка: ${String(err)}`);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  async function onDelete(id: string) {
    const confirmDelete = window.confirm("Удалить район?");
    if (!confirmDelete) return;
    const { error } = await supabase.from("districts").delete().eq("id", id);
    if (!error) {
      setRows((prev) => prev.filter((row) => row.id !== id));
    }
  }

  return (
    <section className="card">
      <h2>Районы</h2>
      <div className="grid" style={{ gap: 12 }}>
        <label>
          Импорт GeoJSON
          <input
            type="file"
            accept=".json,.geojson,application/json,application/geo+json"
            onChange={onUpload}
            disabled={uploading}
            style={{ width: "100%", marginTop: 6 }}
          />
        </label>
        {uploadStatus && <div className="muted">{uploadStatus}</div>}
      </div>
      <label>
        Поиск
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Название или код"
          style={{ width: "100%", marginTop: 6 }}
        />
      </label>
      <table className="table">
        <thead>
          <tr>
            <th>Название</th>
            <th>Код</th>
            <th>ID</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {rows
            .filter((row) => {
              const q = query.trim().toLowerCase();
              if (!q) return true;
              return (
                row.name.toLowerCase().includes(q) ||
                (row.code ?? "").toLowerCase().includes(q)
              );
            })
            .map((row) => (
              <tr key={row.id}>
                <td>
                  <input
                    value={row.name}
                    onChange={(e) =>
                      setRows((prev) =>
                        prev.map((r) =>
                          r.id === row.id ? { ...r, name: e.target.value } : r,
                        ),
                      )
                    }
                    onBlur={() => updateDistrict(row.id, { name: row.name })}
                    disabled={savingId === row.id}
                    style={{ width: "100%" }}
                  />
                </td>
                <td>
                  <input
                    value={row.code ?? ""}
                    onChange={(e) =>
                      setRows((prev) =>
                        prev.map((r) =>
                          r.id === row.id
                            ? { ...r, code: e.target.value }
                            : r,
                        ),
                      )
                    }
                    onBlur={() => updateDistrict(row.id, { code: row.code })}
                    disabled={savingId === row.id}
                    style={{ width: "100%" }}
                  />
                </td>
                <td className="muted">{row.id}</td>
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
