import { NextRequest, NextResponse } from "next/server";

export function proxy(req: NextRequest) {
    const sessionId = req.cookies.get("JSESSIONID")?.value;
    const { pathname } = req.nextUrl;

    // Protected API Proxy Routes
    const isProtectedApi = pathname.startsWith("/api/result");

    if (isProtectedApi && !sessionId) {
        return NextResponse.json(
            {
                error: "Session expired. Please sign in again.",
                expired: true,
            },
            { status: 401 }
        );
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        "/api/result/:path*",
    ],
};