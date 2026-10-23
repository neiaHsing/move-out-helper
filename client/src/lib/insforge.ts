import { createClient } from "@insforge/sdk";

const baseUrl = import.meta.env.VITE_INSFORGE_URL;
const anonKey = import.meta.env.VITE_INSFORGE_ANON_KEY;

if (!baseUrl || !anonKey) {
  throw new Error("缺少 InsForge 配置，请设置 VITE_INSFORGE_URL 和 VITE_INSFORGE_ANON_KEY");
}

// GitHub Pages and InsForge are on different sites. Browser refresh cookies are
// therefore blocked by some mobile browsers, so use InsForge's mobile token
// flow and persist only the rotating refresh token for this user's session.
export const insforge = createClient({ baseUrl, anonKey, isServerMode: true });

const REFRESH_TOKEN_STORAGE_KEY = "boxtrack.insforge.refresh-token";

export function getStoredRefreshToken(): string | null {
  return window.localStorage.getItem(REFRESH_TOKEN_STORAGE_KEY);
}

export function saveRefreshToken(token: string): void {
  window.localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, token);
}

export function clearStoredRefreshToken(): void {
  window.localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
}

export async function refreshStoredSession() {
  const refreshToken = getStoredRefreshToken();
  if (!refreshToken) return { data: null, error: null };

  const result = await insforge.auth.refreshSession({ refreshToken });
  if (!result.error && result.data?.refreshToken) {
    // InsForge rotates refresh tokens; persist the replacement immediately.
    saveRefreshToken(result.data.refreshToken);
  }
  return result;
}
