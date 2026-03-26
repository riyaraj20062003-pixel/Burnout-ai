import type { TokenPayload, UserRole } from "@shared/api";

const TOKEN_KEY = "token";
const ROLE_KEY = "userRole";

export function setAuthSession(token: string, role: UserRole): void {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(ROLE_KEY, role);
}

export function clearAuthSession(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(ROLE_KEY);
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredRole(): UserRole | null {
  const stored = localStorage.getItem(ROLE_KEY);
  if (stored === "student" || stored === "parent" || stored === "mentor") {
    return stored;
  }

  const token = getToken();
  if (!token) {
    return null;
  }

  const payload = parseJwtPayload(token);
  if (payload?.role === "student" || payload?.role === "parent" || payload?.role === "mentor") {
    return payload.role;
  }

  return null;
}

function parseJwtPayload(token: string): TokenPayload | null {
  const parts = token.split(".");
  if (parts.length < 2) {
    return null;
  }

  try {
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
    const json = atob(padded);
    return JSON.parse(json) as TokenPayload;
  } catch {
    return null;
  }
}
