import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { API_SERVER_URL, CRM_AUTH_COOKIE } from "@/lib/session";

const BODY_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);
const HOP_BY_HOP_HEADERS = new Set([
  "connection",
  "content-encoding",
  "content-length",
  "host",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailer",
  "transfer-encoding",
  "upgrade",
]);

export async function buildApiUrl(pathname: string, search = "") {
  return `${API_SERVER_URL}${pathname}${search}`;
}

export async function getAuthToken() {
  return (await cookies()).get(CRM_AUTH_COOKIE)?.value ?? null;
}

export async function proxyRequest(
  request: NextRequest,
  pathname: string,
  options?: { includeAuth?: boolean },
) {
  const includeAuth = options?.includeAuth ?? true;
  const url = await buildApiUrl(pathname, request.nextUrl.search);
  const headers = new Headers(request.headers);

  for (const header of HOP_BY_HOP_HEADERS) {
    headers.delete(header);
  }

  headers.delete("cookie");

  if (includeAuth) {
    const token = await getAuthToken();
    if (token) {
      headers.set("authorization", `Bearer ${token}`);
    }
  }

  const init: RequestInit = {
    method: request.method,
    headers,
    redirect: "manual",
  };

  if (BODY_METHODS.has(request.method)) {
    const body = await request.text();
    if (body) {
      init.body = body;
    }
  }

  try {
    const upstream = await fetch(url, init);
    const responseHeaders = new Headers();
    upstream.headers.forEach((value, key) => {
      if (!HOP_BY_HOP_HEADERS.has(key.toLowerCase())) {
        responseHeaders.set(key, value);
      }
    });

    return new NextResponse(upstream.body, {
      status: upstream.status,
      headers: responseHeaders,
    });
  } catch {
    return NextResponse.json(
      {
        error:
          "The API server is unavailable. Start the full stack with `pnpm dev` from the workspace root.",
      },
      { status: 503 },
    );
  }
}
