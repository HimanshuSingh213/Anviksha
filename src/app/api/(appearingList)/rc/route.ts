import { ApiErrorResponse, ApiSuccessResponse } from "@/types/ApiResponse";
import axios, { AxiosError } from "axios";
import { NextRequest, NextResponse } from "next/server";
import { BASE_URL } from "../../(auth)/captcha/route";
import { StdRC } from "@/types/appearingList";

const REQUEST_TIMEOUT = 10000;

// GGSIPU sends these messages when nothing is registered for the student yet.
const NO_RECORD_PATTERN = /no record found|result not found|record not found/i;
const isNoRecordMessage = (message: unknown) => NO_RECORD_PATTERN.test(String(message ?? ""));

export const GET = async (req: NextRequest) => {
  // Anti-abuse: block direct browser navigation and cross-origin requests
  const fetchSite = req.headers.get("sec-fetch-site");
  if (fetchSite === "none" || fetchSite === "cross-site") {
    return NextResponse.json({ error: "Direct API access forbidden" }, { status: 403 });
  }

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

  try {
    const res = await axios.get(`${BASE_URL}/web/student/search/RC`, {
      params: { flag: "RC" },
      headers: {
        Cookie: `JSESSIONID=${sessionId}`,
        Accept: "application/json,text/html",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        Referer: `${BASE_URL}/web/student/studenthome`,
      },
      timeout: REQUEST_TIMEOUT,
      validateStatus: () => true,
    });

    const isHtml = typeof res.data === "string" && (res.data.includes("<html") || res.data.includes("<!DOCTYPE"));
    const lower = typeof res.data === "string" ? res.data.toLowerCase() : "";

    // A 401 or a login/session HTML page means the ExamWeb session is gone.
    // Any other HTML is a portal error page — an upstream problem, not a
    // session problem — so the student must not be sent back to login.
    const sessionExpired =
      res.status === 401 ||
      lower.includes("login") ||
      lower.includes("no session") ||
      lower.includes("session expired") ||
      lower.includes("session timeout") ||
      lower.includes("please relogin");

    if (sessionExpired) {
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

    if (isHtml) {
      const errPayload: ApiErrorResponse = {
        success: false,
        error: "GGSIPU portal returned an error page.",
        code: "UPSTREAM_ERROR",
      };
      return NextResponse.json(errPayload, { status: 502 });
    }

    let parsed: any = typeof res.data === "string" ? JSON.parse(res.data) : res.data;

    // Handle GGSIPU envelope { status: "OK", message: "..." } if present
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      if (parsed.status === "ERROR") {
        if (isNoRecordMessage(parsed.message)) {
          const empty: ApiSuccessResponse<StdRC[]> = { success: true, data: [] };
          return NextResponse.json(empty);
        }
        throw new Error(parsed.message || "Failed to fetch appearing list");
      }
      if (parsed.status === "OK" && parsed.message) {
        parsed = typeof parsed.message === "string" ? JSON.parse(parsed.message) : parsed.message;
      }
    }

    const data: StdRC[] = Array.isArray(parsed) ? parsed : [];

    const successPayload: ApiSuccessResponse<StdRC[]> = {
      success: true,
      data,
    };

    return NextResponse.json(successPayload);
  } catch (err) {
    const axiosErr = err as AxiosError;

    if (axiosErr.code === "ECONNABORTED" || axiosErr.code === "ETIMEDOUT") {
      const errPayload: ApiErrorResponse = {
        success: false,
        error: "Appearing list request timed out.",
        code: "NETWORK_ERROR",
      };
      return NextResponse.json(errPayload, { status: 504 });
    }

    if (axiosErr.code === "ECONNREFUSED" || axiosErr.code === "ENOTFOUND") {
      const errPayload: ApiErrorResponse = {
        success: false,
        error: "Cannot connect to GGSIPU portal.",
        code: "NETWORK_ERROR",
      };
      return NextResponse.json(errPayload, { status: 503 });
    }

    const errPayload: ApiErrorResponse = {
      success: false,
      error: (err as Error)?.message || "Failed to fetch appearing list",
      code: "UPSTREAM_ERROR",
    };
    return NextResponse.json(errPayload, { status: 502 });
  }
};
