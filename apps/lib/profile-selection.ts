const PROFILE_SELECTED_KEY = 'kami_sama_profile_selected';
const SELECTED_PROFILE_NAME_KEY = 'kami_sama_selected_profile_name';
const SELECTED_PROFILE_AVATAR_KEY = 'kami_sama_selected_profile_avatar';
const SELECTED_PROFILE_ID_KEY = 'kami_sama_selected_profile_id';

export interface SelectedProfileInfo {
  id: string;
  displayName: string;
  avatarUrl?: string;
}

export function isProfileSelected(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return localStorage.getItem(PROFILE_SELECTED_KEY) === 'true';
  } catch {
    return false;
  }
}

export function setProfileSelected(selected: boolean): void {
  if (typeof window === 'undefined') return;
  try {
    if (selected) {
      localStorage.setItem(PROFILE_SELECTED_KEY, 'true');
    } else {
      localStorage.removeItem(PROFILE_SELECTED_KEY);
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
  } catch {
    // Ignore storage errors
  }
}

export function getSelectedProfile(): SelectedProfileInfo | null {
  if (typeof window === 'undefined') return null;
  try {
    const id = localStorage.getItem(SELECTED_PROFILE_ID_KEY);
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
  } catch {
    // Ignore storage errors
  }
}
