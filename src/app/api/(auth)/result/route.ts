import axios, { AxiosError } from "axios";
import { NextRequest, NextResponse } from "next/server";
import { BASE_URL } from "../captcha/route";
import { ApiErrorResponse, ApiSuccessResponse } from "@/types/ApiResponse";
import { ResultData } from "@/types/result";

const REQUEST_TIMEOUT = 15000;

function extractHtmlText(html: string): string {
  return html
    .replace(/<script\b[^<]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style\b[^<]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 200);
}

export const GET = async (req: NextRequest) => {
  // Anti-abuse: block direct browser navigation and cross-origin requests
  const fetchSite = req.headers.get("sec-fetch-site");
  if (fetchSite === "none" || fetchSite === "cross-site") {
    return NextResponse.json({ error: "Direct API access forbidden" }, { status: 403 });
  }

  try {
    const sessionId = req.cookies.get("JSESSIONID")?.value;

    if (!sessionId) {
      const errPayload: ApiErrorResponse = {
        success: false,
        error: "Session expired. Please log in.",
        code: "SESSION_EXPIRED",
        expired: true,
      };
      const response = NextResponse.json(errPayload, { status: 401 });
      response.cookies.set("auth_session", "", { maxAge: 0, path: "/" });
      return response;
    }

    const { searchParams } = new URL(req.url);
    const rawEuno = searchParams.get("euno") || "100";
    const euno = /^[a-zA-Z0-9_-]{1,10}$/.test(rawEuno) ? rawEuno : "100";

    const res = await axios.get(`${BASE_URL}/web/StudentSearchProcess`, {
      params: { flag: 2, euno },
      headers: {
        Cookie: `JSESSIONID=${sessionId}`,
        Accept: "application/json,text/html",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        Referer: `${BASE_URL}/web/student/studenthome.jsp`,
      },
      timeout: REQUEST_TIMEOUT,
      validateStatus: () => true,
    });

    const raw = typeof res.data === "string" ? res.data : JSON.stringify(res.data);

    try {
      const data: ResultData = JSON.parse(raw);

      if (!data.stprofile || !Array.isArray(data.stresult)) {
        throw new Error("Invalid data structure");
      }

      const successPayload: ApiSuccessResponse<ResultData> = {
        success: true,
        data,
      };

      return NextResponse.json(successPayload);
    } catch {
      const lower = raw.toLowerCase();

      if (
        res.status === 401 ||
        lower.includes("login") ||
        lower.includes("no session") ||
        lower.includes("session expired") ||
        lower.includes("session timeout") ||
        lower.includes("please relogin")
      ) {
        const errPayload: ApiErrorResponse = {
          success: false,
          error: "Session expired. Please log in again.",
          code: "SESSION_EXPIRED",
          expired: true,
        };
        const response = NextResponse.json(errPayload, { status: 401 });
        response.cookies.set("JSESSIONID", "", { maxAge: 0, path: "/api" });
        response.cookies.set("auth_session", "", { maxAge: 0, path: "/" });
        return response;
      }

      if (lower.includes("account locked") || lower.includes("account is locked") || lower.includes("disabled")) {
        const errPayload: ApiErrorResponse = {
          success: false,
          error: "Account access restricted on GGSIPU.",
          code: "RATE_LIMITED",
          locked: true,
        };
        return NextResponse.json(errPayload, { status: 403 });
      }

      const cleanedError = extractHtmlText(raw);
      const userFriendlyMessage = cleanedError.length > 0 && cleanedError.length < 200
        ? cleanedError
        : "Unexpected response from GGSIPU. Please retry.";

      const errPayload: ApiErrorResponse = {
        success: false,
        error: userFriendlyMessage,
        code: "UPSTREAM_ERROR",
      };

      const response = NextResponse.json(errPayload, { status: 502 });
      response.cookies.set("JSESSIONID", "", { maxAge: 0, path: "/api" });
      response.cookies.set("auth_session", "", { maxAge: 0, path: "/" });
      return response;
    }
  } catch (err) {
    const axiosErr = err as AxiosError;

    if (axiosErr.code === "ECONNABORTED" || axiosErr.code === "ETIMEDOUT") {
      const errPayload: ApiErrorResponse = {
        success: false,
        error: "Results request timed out. GGSIPU may be slow.",
        code: "NETWORK_ERROR",
      };
      return NextResponse.json(errPayload, { status: 504 });
    }

    if (axiosErr.code === "ECONNREFUSED" || axiosErr.code === "ENOTFOUND") {
      const errPayload: ApiErrorResponse = {
        success: false,
        error: "Cannot connect to GGSIPU. Check your connection.",
        code: "NETWORK_ERROR",
      };
      return NextResponse.json(errPayload, { status: 503 });
    }

    console.error("Results route error:", axiosErr.message);
    const errPayload: ApiErrorResponse = {
      success: false,
      error: "Failed to fetch results",
      code: "UNKNOWN",
    };
    return NextResponse.json(errPayload, { status: 500 });
  }
};