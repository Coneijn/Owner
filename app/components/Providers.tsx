'use client';

import { SessionProvider } from "next-auth/react";
import ImpersonationBanner from "@/app/components/ui/impersonation-banner";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ImpersonationBanner />
      {children}
    </SessionProvider>
  );
}