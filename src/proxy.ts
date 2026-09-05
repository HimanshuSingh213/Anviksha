import { NextRequest, NextResponse } from "next/server";
import { ApiErrorResponse } from "@/types/ApiResponse";

export default function proxy(req: NextRequest) {
    const { pathname } = req.nextUrl;
    
    const authSession = req.cookies.get("auth_session")?.value;
    const isAuthenticated = Boolean(authSession);

    const isProtectedApi = pathname.startsWith("/api/result");
    const isProtectedPage = pathname.startsWith("/dashboard");
    const isAuthPage = pathname.startsWith("/login");

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
        const hadCookie = req.cookies.has("auth_session");
        const loginUrl = new URL(hadCookie ? "/login?expired=true" : "/login", req.url);
        const response = NextResponse.redirect(loginUrl);
        response.cookies.set("auth_session", "", { maxAge: 0, path: "/" });
        return response;
    }

    // Already signed in — don't show the login form again
    if (isAuthPage && isAuthenticated) {
        return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        "/api/result/:path*",
        "/dashboard/:path*",
        "/login",
    ],
};