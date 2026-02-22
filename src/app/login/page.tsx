import { Suspense } from "react";
import LoginClient from "./LoginClient";

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="container" style={{ maxWidth: 460 }}>
          <div className="card">Загрузка...</div>
        </div>
      }
    >
      <LoginClient />
    </Suspense>
  );
}
