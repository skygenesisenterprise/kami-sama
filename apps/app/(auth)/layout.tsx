"use client";

import * as React from "react";
import { useRouter, usePathname } from "next/navigation";

import { useAuth } from "@/context/AuthContext";
import { DEFAULT_PLATFORM_ROUTE, LOGIN_ROUTE } from "@/lib/routes";
import { isProfileSelected } from "@/lib/profile-selection";

// Routes accessible to authenticated users within (auth)
const AUTHENTICATED_ALLOWED_ROUTES = ["/profile-change", "/mfa-validate", "/mfa-setup", "/callback"];
// Routes accessible to unauthenticated users within (auth)
const PUBLIC_AUTH_ROUTES = ["/login", "/register", "/callback"];

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

  const isPublicAuthRoute = PUBLIC_AUTH_ROUTES.some((route) =>
    pathname === route || pathname.startsWith(`${route}/`)
  );

  React.useEffect(() => {
    if (isLoading) return;

    // Unauthenticated users: only allow public auth routes (login, register)
    if (!isAuthenticated && !isPublicAuthRoute) {
      router.replace(LOGIN_ROUTE);
      return;
    }

    // Authenticated users on non-allowed routes: redirect based on profile selection
    if (isAuthenticated && !isAllowedAuthenticatedRoute) {
      if (!isProfileSelected()) {
        router.replace("/profile-change");
      } else {
        router.replace(DEFAULT_PLATFORM_ROUTE);
      }
    }
  }, [isAuthenticated, isLoading, router, isAllowedAuthenticatedRoute, isPublicAuthRoute]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-sm text-muted-foreground">
        Vérification de la session…
      </div>
    );
  }

  // Block unauthenticated users from non-public routes
  if (!isAuthenticated && !isPublicAuthRoute) {
    return null;
  }

  // Block authenticated users from non-allowed routes
  if (isAuthenticated && !isAllowedAuthenticatedRoute) {
    return null;
  }

  return <>{children}</>;
}
