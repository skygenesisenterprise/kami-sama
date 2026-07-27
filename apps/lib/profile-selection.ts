import { setSharedCookie, getSharedCookie, deleteSharedCookie } from '@/lib/shared-cookie';

const PROFILE_SELECTED_KEY = 'kami_sama_profile_selected';
const SELECTED_PROFILE_NAME_KEY = 'kami_sama_selected_profile_name';
const SELECTED_PROFILE_AVATAR_KEY = 'kami_sama_selected_profile_avatar';
const SELECTED_PROFILE_ID_KEY = 'kami_sama_selected_profile_id';

// Cookie names for cross-subdomain sharing
const PROFILE_SELECTED_COOKIE = 'kami_sama_profile_selected';
const PROFILE_ID_COOKIE = 'kami_sama_selected_profile_id';

export interface SelectedProfileInfo {
  id: string;
  displayName: string;
  avatarUrl?: string;
}

// ── In-memory cache so `isProfileSelected()` doesn't hit storage on every
//    navigation.  The cache is positive-only (we cache "yes, selected") and
//    expires after CACHE_TTL_MS.  A negative result is NOT cached so that a
//    fresh selection is picked up immediately.
let _cache: boolean | null = null;
let _cacheExpiry = 0;
const CACHE_TTL_MS = 30_000; // 30 seconds

export function isProfileSelected(): boolean {
  if (typeof window === 'undefined') return false;

  // Serve from cache if still valid
  if (_cache !== null && Date.now() < _cacheExpiry) return _cache;

  let result = false;
  try {
    // Check localStorage first (same-origin fast path)
    if (localStorage.getItem(PROFILE_SELECTED_KEY) === 'true') {
      result = true;
    }
    // Fallback to cookie (cross-subdomain path)
    else if (getSharedCookie(PROFILE_SELECTED_COOKIE) === 'true') {
      // Back-fill localStorage so subsequent checks are fast
      try { localStorage.setItem(PROFILE_SELECTED_KEY, 'true'); } catch { /* quota */ }
      result = true;
    }
  } catch {
    // ignore
  }

  // Only cache positive results — negative results stay un-cached so a
  // concurrent setProfileSelected() call is visible immediately.
  if (result) {
    _cache = true;
    _cacheExpiry = Date.now() + CACHE_TTL_MS;
  } else {
    _cache = null;
  }

  return result;
}

export function setProfileSelected(selected: boolean): void {
  if (typeof window === 'undefined') return;
  try {
    if (selected) {
      localStorage.setItem(PROFILE_SELECTED_KEY, 'true');
      // 30-day cookie for cross-subdomain sharing
      setSharedCookie(PROFILE_SELECTED_COOKIE, 'true', 30 * 24 * 60 * 60);
      _cache = true;
      _cacheExpiry = Date.now() + CACHE_TTL_MS;
    } else {
      localStorage.removeItem(PROFILE_SELECTED_KEY);
      deleteSharedCookie(PROFILE_SELECTED_COOKIE);
      _cache = null;
    }
  } catch {
    // Ignore storage errors
  }
}

export function saveSelectedProfile(profile: SelectedProfileInfo): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(SELECTED_PROFILE_ID_KEY, profile.id);
    localStorage.setItem(SELECTED_PROFILE_NAME_KEY, profile.displayName);
    if (profile.avatarUrl) {
      localStorage.setItem(SELECTED_PROFILE_AVATAR_KEY, profile.avatarUrl);
    } else {
      localStorage.removeItem(SELECTED_PROFILE_AVATAR_KEY);
    }
    // Also persist profile id in cookie for cross-subdomain access
    setSharedCookie(PROFILE_ID_COOKIE, profile.id, 30 * 24 * 60 * 60);
  } catch {
    // Ignore storage errors
  }
}

export function getSelectedProfile(): SelectedProfileInfo | null {
  if (typeof window === 'undefined') return null;
  try {
    const id = localStorage.getItem(SELECTED_PROFILE_ID_KEY) ?? getSharedCookie(PROFILE_ID_COOKIE);
    const name = localStorage.getItem(SELECTED_PROFILE_NAME_KEY);
    if (!id || !name) return null;
    return {
      id,
      displayName: name,
      avatarUrl: localStorage.getItem(SELECTED_PROFILE_AVATAR_KEY) || undefined,
    };
  } catch {
    return null;
  }
}

export function clearProfileSelection(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(PROFILE_SELECTED_KEY);
    localStorage.removeItem(SELECTED_PROFILE_ID_KEY);
    localStorage.removeItem(SELECTED_PROFILE_NAME_KEY);
    localStorage.removeItem(SELECTED_PROFILE_AVATAR_KEY);
    deleteSharedCookie(PROFILE_SELECTED_COOKIE);
    deleteSharedCookie(PROFILE_ID_COOKIE);
    _cache = null;
  } catch {
    // Ignore storage errors
  }
}
