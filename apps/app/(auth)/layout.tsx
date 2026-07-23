"use client";

import * as React from "react";
import { useRouter, usePathname } from "next/navigation";

import { useAuth } from "@/context/AuthContext";
import { DEFAULT_PLATFORM_ROUTE } from "@/lib/routes";
import { isProfileSelected } from "@/lib/profile-selection";

// Routes that authenticated users CAN access within (auth)
const AUTHENTICATED_ALLOWED_ROUTES = ["/profile-change", "/mfa-validate", "/mfa-setup", "/callback"];

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isLoading } = useAuth();

  const isAllowedAuthenticatedRoute = AUTHENTICATED_ALLOWED_ROUTES.some((route) =>
    pathname === route || pathname.startsWith(`${route}/`)
  );

  React.useEffect(() => {
    if (!isLoading && isAuthenticated && !isAllowedAuthenticatedRoute) {
      // If user has a session but hasn't selected a profile yet, go to profile-change
      if (!isProfileSelected()) {
        router.replace("/profile-change");
      } else {
        router.replace(DEFAULT_PLATFORM_ROUTE);
      }
    }
  }, [isAuthenticated, isLoading, router, isAllowedAuthenticatedRoute]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-sm text-muted-foreground">
        Vérification de la session…
      </div>
    );
  }

  if (isAuthenticated && !isAllowedAuthenticatedRoute) {
    return null;
  }

  return <>{children}</>;
}
