"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { DashboardShell } from '@/components/admin/dashboard-shell'
import { useAuth } from "@/context/AuthContext";
import { isProfileSelected } from "@/lib/profile-selection";

export default function PlatformLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  React.useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }

    if (!isProfileSelected()) {
      router.replace("/profile-change");
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-sm text-muted-foreground">
        Vérification de la session…
      </div>
    );
  }

  if (!isAuthenticated || !isProfileSelected()) {
    return null;
  }

  return <DashboardShell>{children}</DashboardShell>
}
