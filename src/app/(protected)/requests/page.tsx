"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";

type RequestRow = {
  id: string;
  title: string;
  status: string;
  urgency: number;
  district_id: string | null;
  created_at: string;
};

type DistrictRow = {
  id: string;
  name: string;
};

const statusLabels: Record<string, string> = {
  open: "Открыта",
  in_progress: "В работе",
  closed: "Закрыта",
  cancelled: "Отменена",
};

export default function RequestsPage() {
  const [rows, setRows] = useState<RequestRow[]>([]);
  const [districts, setDistricts] = useState<DistrictRow[]>([]);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [urgencyFilter, setUrgencyFilter] = useState("all");
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const [reqRes, distRes] = await Promise.all([
        supabase
          .from("requests")
          .select("id,title,status,urgency,district_id,created_at")
          .order("created_at", { ascending: false })
          .limit(200),
        supabase.from("districts").select("id,name"),
      ]);
      setRows((reqRes.data as RequestRow[]) ?? []);
      setDistricts((distRes.data as DistrictRow[]) ?? []);
    }
    load();
  }, []);

  const districtMap = useMemo(() => {
    return districts.reduce<Record<string, string>>((acc, row) => {
      acc[row.id] = row.name;
      return acc;
    }, {});
  }, [districts]);

  const filtered = useMemo(() => {
    return rows.filter((row) => {
      const matchQuery =
        query.trim().length === 0 ||
        row.title.toLowerCase().includes(query.toLowerCase());
      const matchStatus =
        statusFilter === "all" || row.status === statusFilter;
      const matchUrgency =
        urgencyFilter === "all" ||
        String(row.urgency) === urgencyFilter;
      return matchQuery && matchStatus && matchUrgency;
    });
  }, [rows, query, statusFilter, urgencyFilter]);

  async function updateStatus(id: string, status: string) {
    setSavingId(id);
    const { data, error } = await supabase
      .from("requests")
      .update({ status })
      .eq("id", id)
      .select("id,title,status,urgency,district_id,created_at")
      .single();
    if (!error && data) {
      setRows((prev) => prev.map((r) => (r.id === id ? data : r)));
    }
    setSavingId(null);
  }

  return (
    <section className="card">
      <h2>Заявки</h2>
      <div className="grid" style={{ gridTemplateColumns: "2fr 1fr 1fr" }}>
        <label>
          Поиск по названию
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Введите текст"
            style={{ width: "100%", marginTop: 6 }}
          />
        </label>
        <label>
          Статус
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ width: "100%", marginTop: 6 }}
          >
            <option value="all">Все</option>
            <option value="open">Открыта</option>
            <option value="in_progress">В работе</option>
            <option value="closed">Закрыта</option>
            <option value="cancelled">Отменена</option>
          </select>
        </label>
        <label>
          Срочность
          <select
            value={urgencyFilter}
            onChange={(e) => setUrgencyFilter(e.target.value)}
            style={{ width: "100%", marginTop: 6 }}
          >
            <option value="all">Все</option>
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4</option>
            <option value="5">5</option>
          </select>
        </label>
      </div>
      <table className="table">
        <thead>
          <tr>
            <th>Название</th>
            <th>Статус</th>
            <th>Срочность</th>
            <th>Район</th>
            <th>Создано</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((row) => (
            <tr key={row.id}>
              <td>{row.title}</td>
              <td>
                <select
                  value={row.status}
                  onChange={(e) => updateStatus(row.id, e.target.value)}
                  disabled={savingId === row.id}
                >
                  <option value="open">Открыта</option>
                  <option value="in_progress">В работе</option>
                  <option value="closed">Закрыта</option>
                  <option value="cancelled">Отменена</option>
                </select>
                <div className="muted" style={{ fontSize: 12 }}>
                  {statusLabels[row.status]}
                </div>
              </td>
              <td>{row.urgency}</td>
              <td>{row.district_id ? districtMap[row.district_id] : "—"}</td>
              <td>{new Date(row.created_at).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
