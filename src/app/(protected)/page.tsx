"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

type DistrictActivity = {
  district_name: string;
  open_count: number;
  in_progress_count: number;
  closed_count: number;
  ssi_index: number;
};

type RequestStatusRow = {
  status: string;
};

const statusLabels: Record<string, string> = {
  open: "Открыта",
  in_progress: "В работе",
  closed: "Закрыта",
  cancelled: "Отменена",
};

export default function DashboardPage() {
  const [counts, setCounts] = useState({
    requests: 0,
    users: 0,
    districts: 0,
  });
  const [activity, setActivity] = useState<DistrictActivity[]>([]);
  const [statusRows, setStatusRows] = useState<RequestStatusRow[]>([]);

  useEffect(() => {
    async function load() {
      const [reqRes, usersRes, distRes, activityRes, statusRes] =
        await Promise.all([
          supabase.from("requests").select("id"),
          supabase.from("profiles").select("id"),
          supabase.from("districts").select("id"),
          supabase
            .from("v_district_activity")
            .select(
              "district_name,open_count,in_progress_count,closed_count,ssi_index",
            )
            .limit(5),
          supabase.from("requests").select("status").limit(1000),
        ]);

      setCounts({
        requests: reqRes.data?.length ?? 0,
        users: usersRes.data?.length ?? 0,
        districts: distRes.data?.length ?? 0,
      });
      setActivity((activityRes.data as DistrictActivity[]) ?? []);
      setStatusRows((statusRes.data as RequestStatusRow[]) ?? []);
    }

    load();
  }, []);

  const statusChart = useMemo(() => {
    const countsByStatus = statusRows.reduce<Record<string, number>>(
      (acc, row) => {
        acc[row.status] = (acc[row.status] ?? 0) + 1;
        return acc;
      },
      {},
    );

    const labels = Object.keys(statusLabels);
    return {
      labels: labels.map((s) => statusLabels[s]),
      datasets: [
        {
          label: "Заявки",
          data: labels.map((s) => countsByStatus[s] ?? 0),
          backgroundColor: ["#3b82f6", "#f59e0b", "#22c55e", "#ef4444"],
        },
      ],
    };
  }, [statusRows]);

  return (
    <div className="grid" style={{ gap: 24 }}>
      <section className="grid grid-3">
        <div className="card">
          <div className="muted">Заявки</div>
          <h2>{counts.requests}</h2>
        </div>
        <div className="card">
          <div className="muted">Пользователи</div>
          <h2>{counts.users}</h2>
        </div>
        <div className="card">
          <div className="muted">Районы</div>
          <h2>{counts.districts}</h2>
        </div>
      </section>

      <section className="grid" style={{ gridTemplateColumns: "1fr 1fr" }}>
        <div className="card">
          <h3>Заявки по статусам</h3>
          <Bar data={statusChart} />
        </div>
        <div className="card">
          <h3>Топ районов по SSI</h3>
          <table className="table">
            <thead>
              <tr>
                <th>Район</th>
                <th>Открыто</th>
                <th>В работе</th>
                <th>Закрыто</th>
                <th>SSI</th>
              </tr>
            </thead>
            <tbody>
              {activity.map((row) => (
                <tr key={row.district_name}>
                  <td>{row.district_name}</td>
                  <td>{row.open_count}</td>
                  <td>{row.in_progress_count}</td>
                  <td>{row.closed_count}</td>
                  <td>{row.ssi_index?.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
