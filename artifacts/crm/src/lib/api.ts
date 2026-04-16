const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

export const API_BASE = `${BASE}/api`;

export function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem("crm_auth_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}
