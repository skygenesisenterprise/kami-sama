import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { routing } from "./i18n/routing";
import { DEFAULT_PLATFORM_ROUTE } from "./lib/routes";

// Désactiver la protection du middleware en développement
// TODO: En production, réactiver la vérification complète
const IS_DEVELOPMENT = process.env.NODE_ENV === 'development';

type Locale = (typeof routing.locales)[number];

const countryToLocale: Record<string, Locale> = {
  FR: "fr",
  EN: "en",
};

function getCountryFromRequest(request: NextRequest): string | null {
  const cloudflareCountry = request.headers.get("cf-ipcountry");
  const vercelCountry = request.headers.get("x-vercel-ip-country");
  const fastlyCountry = request.headers.get("x-fastly-geo-country");
  return cloudflareCountry || vercelCountry || fastlyCountry || null;
}

function getLocaleFromCountry(country: string | null): Locale {
  if (country && country in countryToLocale) {
    return countryToLocale[country];
  }
  return routing.defaultLocale;
}

function isValidLocale(locale: string): locale is Locale {
  return routing.locales.includes(locale as Locale);
}

const AUTH_PATHS = ["/login", "/register"];
const PROTECTED_PATHS = ["/dash", "/profile"];
const ADMIN_PATHS = ["/dash"]; // Routes qui nécessitent des rôles admin
const NO_LOCALE_PATHS = [ "/dash", "/profile", "/login", "/register", "/profile-change", "/mfa-validate", "/mfa-setup", "/mfa-verify", "/mfa-recovery", "/mfa-recovery-setup", "/mfa-recovery-verify"];
const DEFAULT_REDIRECT = DEFAULT_PLATFORM_ROUTE || "/profile";
const REFRESH_COOKIE_NAME = "kami_sama_refresh";
const ACCESS_TOKEN_COOKIE_NAME = "kami_sama_access_token";

function isAuthCookiePresent(request: NextRequest): boolean {
  // Vérifier le cookie de refresh OU le cookie d'access token
  const refreshCookie = request.cookies.get(REFRESH_COOKIE_NAME);
  const accessCookie = request.cookies.get(ACCESS_TOKEN_COOKIE_NAME);
  return Boolean(
    (refreshCookie?.value && refreshCookie.value.length > 0) ||
    (accessCookie?.value && accessCookie.value.length > 0)
  );
}

function isAccessTokenPresent(request: NextRequest): boolean {
  return getAccessToken(request) !== null;
}

// Vérifier si la route nécessite des rôles admin
function isAdminPath(pathname: string): boolean {
  return ADMIN_PATHS.some((p) => pathname.startsWith(p));
}

// Extraire le token JWT UNIQUEMENT depuis les cookies
// Le middleware Next.js ne peut pas accéder à localStorage ou aux headers Authorization
// pour les requêtes de navigation normales. Seuls les cookies sont disponibles.
function getAccessToken(request: NextRequest): string | null {
  return request.cookies.get(ACCESS_TOKEN_COOKIE_NAME)?.value || null;
}

// Extraire les rôles depuis le token JWT (simplifié)
function getRolesFromToken(request: NextRequest): string[] {
  try {
    const token = getAccessToken(request);
    if (!token) return [];
    
    // Décoder le JWT (sans vérification pour le middleware)
    // Note: En production, il faudrait vérifier la signature
    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    return payload.roles || [];
  } catch {
    return [];
  }
}

// Extraire l'email depuis le token JWT
function getEmailFromToken(request: NextRequest): string {
  try {
    const token = getAccessToken(request);
    if (!token) return '';
    
    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    return payload.sub || payload.email || '';
  } catch {
    return '';
  }
}

// Vérifier si l'utilisateur a accès à la route admin
function hasAdminAccess(request: NextRequest): boolean {
  const roles = getRolesFromToken(request);
  return roles.includes('admin') || roles.includes('superadmin') || roles.includes('owner');
}

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const segments = pathname.split("/").filter(Boolean);
  const firstSegment = segments[0];

  if (pathname === "/" || pathname === "") {
    return NextResponse.redirect(new URL("/profile-change", request.url));
  }

  const isAuthPath = AUTH_PATHS.some((p) => pathname === p || pathname === `/${firstSegment}${p}`);
  if (isAuthPath) {
    const cleanPath = AUTH_PATHS.find((p) => pathname.endsWith(p));
    if (pathname !== cleanPath) {
      return NextResponse.redirect(new URL(cleanPath!, request.url));
    }
    return NextResponse.next();
  }

  // En développement, désactiver la protection du middleware
  // pour permettre le développement sans configuration complexe des cookies
  if (IS_DEVELOPMENT) {
    return NextResponse.next();
  }

  const isProtectedPath = PROTECTED_PATHS.some((p) => pathname.startsWith(p));
  if (isProtectedPath) {
    // Vérifier l'authentification de base (cookie de refresh OU access token)
    if (!isAuthCookiePresent(request)) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
    
    // Vérifier les routes admin
    if (isAdminPath(pathname)) {
      // En production, vérifier les rôles
      if (isAccessTokenPresent(request) && hasAdminAccess(request)) {
        return NextResponse.next();
      }
      
      // Sinon, rediriger vers le profile
      return NextResponse.redirect(new URL(DEFAULT_REDIRECT, request.url));
    }
  }

  if (firstSegment && isValidLocale(firstSegment)) {
    const localePath = `/${firstSegment}`;
    const isNoLocalePath = NO_LOCALE_PATHS.some(
      (p) => pathname.startsWith(localePath + p) || pathname === localePath + p
    );
    if (isNoLocalePath) {
      const cleanPath = pathname.replace(localePath, "");
      return NextResponse.redirect(new URL(cleanPath || "/", request.url));
    }
    return NextResponse.next();
  }

  if (firstSegment && !isValidLocale(firstSegment)) {
    const isNoLocalePath = NO_LOCALE_PATHS.some(
      (p) => pathname === p || pathname.startsWith(p + "/")
    );
    if (isNoLocalePath) {
      return NextResponse.next();
    }
    const country = getCountryFromRequest(request);
    const locale = getLocaleFromCountry(country);
    return NextResponse.redirect(new URL(`/${locale}${pathname}`, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|health).*)"],
};
