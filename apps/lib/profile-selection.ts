const PROFILE_SELECTED_KEY = 'kami_sama_profile_selected';

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

export function clearProfileSelection(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(PROFILE_SELECTED_KEY);
  } catch {
    // Ignore storage errors
  }
}
