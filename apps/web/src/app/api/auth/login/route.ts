import { NextResponse, type NextRequest } from "next/server";
import { API_SERVER_URL, CRM_AUTH_COOKIE } from "@/lib/session";

export async function POST(request: NextRequest) {
  const body = await request.text();

  try {
    const upstream = await fetch(`${API_SERVER_URL}/api/auth/login`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body,
    });

    const payload = await upstream.json();

    if (!upstream.ok) {
      return NextResponse.json(payload, { status: upstream.status });
    }

    const response = NextResponse.json(payload, { status: upstream.status });
    response.cookies.set(CRM_AUTH_COOKIE, payload.token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
    return response;
  } catch {
    return NextResponse.json(
      { error: "Unable to reach API server." },
      { status: 503 },
    );
  }
}
