"use client";

import { useState } from "react";
import LoadingScreen from "./LoadingScreen";

interface ClientLayoutProps {
  children: React.ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  const [loadingDone, setLoadingDone] = useState(false);

  return (
    <>
      {!loadingDone && (
        <LoadingScreen onComplete={() => setLoadingDone(true)} />
      )}
      {children}
    </>
  );
}
