import { Suspense } from "react";

import LoginPage from "./page.client";

export default function Page() {
  return (
    <Suspense fallback={<div className="p-16 text-center">Загрузка...</div>}>
      <LoginPage />
    </Suspense>
  );
}
