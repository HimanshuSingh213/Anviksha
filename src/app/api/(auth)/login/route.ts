import { LoginSchema } from "@/validations/login.validation";
import axios, { AxiosError } from "axios";
import { NextRequest, NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { BASE_URL } from "../captcha/route";
import { ApiErrorResponse, ApiSuccessResponse } from "@/types/ApiResponse";

const hashPassword = (password: string, captcha: string): string => {
  return createHash("sha256").update(password + captcha).digest("base64");
};

const REQUEST_TIMEOUT = 10000;

export const POST = async (req: NextRequest) => {
  try {
    const body = await req.json();
    const validationResult = LoginSchema.safeParse(body);

    if (!validationResult.success) {
      const errPayload: ApiErrorResponse = {
        success: false,
        error: validationResult.error.issues[0]?.message || "Invalid input format",
        code: "VALIDATION_ERROR",
      };
      return NextResponse.json(errPayload, { status: 400 });
    }

    const sessionId = req.cookies.get("JSESSIONID")?.value;
    if (!sessionId) {
      const errPayload: ApiErrorResponse = {
        success: false,
        error: "Session expired. Please refresh the CAPTCHA.",
        expired: true,
        code: "SESSION_EXPIRED",
      };
      return NextResponse.json(errPayload, { status: 401 });
    }

    const hashedPass = hashPassword(
      validationResult.data.password,
      validationResult.data.captcha
    );

    const res = await axios.post(
      `${BASE_URL}/web/Login`,
      new URLSearchParams({
        username: validationResult.data.enrollment,
        passwd: hashedPass,
        captcha: validationResult.data.captcha,
      }).toString(),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Cookie: `JSESSIONID=${sessionId}`,
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          Referer: `${BASE_URL}/web/Login`,
          Origin: BASE_URL,
        },
        timeout: REQUEST_TIMEOUT,
        maxRedirects: 0,
        validateStatus: (status) => status === 302 || status === 200,
      }
    );

    const setCookie = res.headers["set-cookie"];
    let newSessionId: string | null = null;

    if (setCookie) {
      const cookieStr = Array.isArray(setCookie) ? setCookie[0] : String(setCookie);
      const match = cookieStr?.match(/JSESSIONID=([^;]+)/);
      if (match) newSessionId = match[1];
    }

    const location = res.headers["location"] || "";
    const success = res.status === 302 && location.includes("studenthome");

    if (!success) {
      const rawHtml = typeof res.data === "string" ? res.data : "";
      const lower = rawHtml.toLowerCase();

      let errorMessage = "Invalid credentials or CAPTCHA";
      let code: 'INVALID_CREDENTIALS' | 'SESSION_EXPIRED' = 'INVALID_CREDENTIALS';
      let expired = true;

      if (lower.includes("account locked") || lower.includes("account is locked")) {
        const errPayload: ApiErrorResponse = {
          success: false,
          error: "Account locked due to multiple failed attempts. Try again after some time.",
          code: "RATE_LIMITED",
          locked: true,
        };
        return NextResponse.json(errPayload, { status: 403 });
      } else if (lower.includes("invalid captcha") || lower.includes("wrong captcha")) {
        errorMessage = "Invalid CAPTCHA. Please try again.";
      } else if (lower.includes("disabled")) {
        errorMessage = "Account disabled on GGSIPU portal.";
      } else if (lower.includes("password") || lower.includes("username")) {
        errorMessage = "Invalid Enrollment Number or Password.";
      } else if (lower.includes("session") || lower.includes("expired") ||
        res.status === 302 && !location.includes("studenthome")) {
        errorMessage = "Session expired. Please refresh CAPTCHA.";
        code = "SESSION_EXPIRED";
      }

      const errPayload: ApiErrorResponse = {
        success: false,
        error: errorMessage,
        code,
        expired,
      };

      return NextResponse.json(errPayload, { status: 401 });
    }

    const payload: ApiSuccessResponse<{ message: string }> = {
      success: true,
      data: { message: "Authenticated successfully" },
    };

    const response = NextResponse.json(payload);

    const activeSessionId = newSessionId || sessionId;

    response.cookies.set("JSESSIONID", activeSessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 3600,
      path: "/api",
    });

    response.cookies.set("auth_session", "active", {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 3600,
      path: "/",
    });

    return response;
  } catch (err) {
    const axiosErr = err as AxiosError;

    if (axiosErr.code === "ECONNABORTED" || axiosErr.code === "ETIMEDOUT") {
      const errPayload: ApiErrorResponse = {
        success: false,
        error: "GGSIPU login timed out. Please retry.",
        code: "NETWORK_ERROR",
      };
      return NextResponse.json(errPayload, { status: 504 });
    }

    if (axiosErr.response?.status && axiosErr.response.status >= 500) {
      const errPayload: ApiErrorResponse = {
        success: false,
        error: "GGSIPU portal is down. Please try later.",
        code: "UPSTREAM_ERROR",
      };
      return NextResponse.json(errPayload, { status: 502 });
    }

    console.error("Login proxy error:", axiosErr.message);
    const errPayload: ApiErrorResponse = {
      success: false,
      error: "Internal server error",
      code: "UNKNOWN",
    };
    return NextResponse.json(errPayload, { status: 500 });
  }
};