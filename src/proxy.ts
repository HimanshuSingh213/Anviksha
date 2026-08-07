import { NextRequest, NextResponse } from "next/server";
import { ApiErrorResponse } from "@/types/ApiResponse";

export function proxy(req: NextRequest) {
    const { pathname } = req.nextUrl;
    
    const authSession = req.cookies.get("auth_session")?.value;
    const isAuthenticated = Boolean(authSession);

    const isProtectedApi = pathname.startsWith("/api/result");
    const isProtectedPage = pathname.startsWith("/dashboard");

    // Intercept protected API routes
    if (isProtectedApi && !isAuthenticated) {
        const errorResponse: ApiErrorResponse = {
            success: false,
            error: "Session expired. Please sign in again.",
            code: "SESSION_EXPIRED",
            expired: true,
        };
        const response = NextResponse.json(errorResponse, { status: 401 });
        response.cookies.set("auth_session", "", { maxAge: 0, path: "/" });
        return response;
    }

    // Intercept protected pages
    if (isProtectedPage && !isAuthenticated) {
        const loginUrl = new URL("/login?expired=true", req.url);
        const response = NextResponse.redirect(loginUrl);
        response.cookies.set("auth_session", "", { maxAge: 0, path: "/" });
        return response;
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        "/api/result/:path*",
        "/dashboard/:path*",
    ],
};