export const CRM_AUTH_COOKIE = "crm_auth_token";
export const API_SERVER_URL =
  process.env.API_SERVER_URL?.replace(/\/+$/, "") ?? "http://127.0.0.1:4000";

export function stripLocale(pathname: string) {
  const stripped = pathname.replace(/^\/(en|ar)(?=\/|$)/, "");
  return stripped === "" ? "/" : stripped;
}
