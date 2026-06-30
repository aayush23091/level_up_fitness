import { jwtDecode } from "jwt-decode";

interface TokenPayload {
  role?: string;
}

export function getDashboardPath(role?: string | null): string {
  if (role === "admin") {
    return "/admin-dashboard";
  }
  return "/app-dashboard";
}

export function getRoleFromToken(token: string): string | null {
  try {
    const payload = jwtDecode<TokenPayload>(token);
    return typeof payload.role === "string" ? payload.role : null;
  } catch {
    return null;
  }
}
