/**
 * Cross-page episode hand-off for the watch page.
 *
 * The URL is kept clean (`/locale/watch/<slug>` — never `?ep=<id>`), so a
 * page that wants to open a SPECIFIC episode (episode grid, history, calendar,
 * continue-watching card…) stashes the target episode id here right before
 * navigating. The watch page reads & clears it on mount and auto-selects that
 * episode. Falls back to a no-op when sessionStorage is unavailable.
 */
const PENDING_EPISODE_KEY = 'kami-pending-episode'

/** Remember the episode the user wants to open on the watch page. */
export function setPendingEpisode(episodeId: string): void {
  try {
    window.sessionStorage.setItem(PENDING_EPISODE_KEY, episodeId)
  } catch {
    /* storage unavailable — the watch page falls back to its default episode */
  }
}

/** Read & clear the pending episode (called once by the watch page). */
export function takePendingEpisode(): string | null {
  try {
    const id = window.sessionStorage.getItem(PENDING_EPISODE_KEY)
    window.sessionStorage.removeItem(PENDING_EPISODE_KEY)
    return id
  } catch {
    return null
  }
}
